import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseKicadPcb, parseKicadSch } from 'kicadts'
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadProConverter,
  CircuitJsonToKicadSchConverter,
} from 'circuit-json-to-kicad'

const outputDirectory = process.argv[2]
if (!outputDirectory) {
  throw new Error('Usage: bun scripts/export-kicad-route.mjs <output-directory>')
}

await mkdir(outputDirectory, { recursive: true })
const circuitJson = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))

const pcb = new CircuitJsonToKicadPcbConverter(circuitJson)
pcb.runUntilFinished()
const nativeBoard = parseKicadPcb(pcb.getOutputString())
const partNumbers = new Map(circuitJson.filter(row => row.type === 'source_component' && row.manufacturer_part_number).map(row => [row.name, row.manufacturer_part_number]))
function retainPartNumber(properties) {
  const reference = properties.find(property => property.key === 'Reference')?.value
  const value = properties.find(property => property.key === 'Value')
  // The converter falls back to the reference for non-chip imported parts.
  if (value?.value === reference && partNumbers.has(reference)) value.value = partNumbers.get(reference)
}
const servicePads = new Set(circuitJson.filter(row => row.type === 'source_component' && row.name.startsWith('TP_')).map(row => row.name))
for (const footprint of nativeBoard.footprints) {
  retainPartNumber(footprint.properties)
  const reference = footprint.properties.find(property => property.key === 'Reference')?.value
  // The converter currently discards source paste sizing. Carry the reviewed
  // QFN exposed-pad aperture into the stencil, deriving it from circuit JSON.
  if (reference === 'U16') {
    const component = circuitJson.find(row => row.type === 'source_component' && row.name === reference)
    const placed = circuitJson.find(row => row.type === 'pcb_component' && row.source_component_id === component.source_component_id)
    const copper = circuitJson.find(row => row.type === 'pcb_smtpad' && row.pcb_component_id === placed.pcb_component_id && row.port_hints?.includes('pin49'))
    const apertures = circuitJson.filter(row => row.type === 'pcb_solder_paste' && row.pcb_smtpad_id === copper?.pcb_smtpad_id)
    const aperture = apertures[0]
    const pad = footprint.fpPads.find(p => p.number === '49')
    if (!pad || apertures.length !== 1 || aperture.shape !== 'rect' || copper.shape !== 'rect' || aperture.x !== copper.x || aperture.y !== copper.y)
      throw new Error('U16 EP requires one centered rectangular source paste aperture')
    const margin = (aperture.width - copper.width) / 2
    if (Math.abs((aperture.height - copper.height) / 2 - margin) > 1e-9 || margin >= 0)
      throw new Error('U16 EP paste reduction must be symmetric and negative')
    pad.solderPasteMargin = margin
  }
  if (!footprint.attr?.dnp && !servicePads.has(reference)) continue
  if (footprint.attr?.dnp) footprint.attr.excludeFromBom = true
  // Bare probe contacts and unpopulated footprints need mask openings, but no stencil paste.
  for (const pad of footprint.fpPads) pad.layers.layers = pad.layers.layers.filter(layer => !['F.Paste', 'B.Paste'].includes(layer))
}
await writeFile(`${outputDirectory}/pd1180-epr-r0.3.kicad_pcb`, nativeBoard.getString())

const schematic = new CircuitJsonToKicadSchConverter(circuitJson)
schematic.runUntilFinished()
const schematicFiles = schematic.getOutputFiles({ schematicFilename: 'index.kicad_sch' })
const sourceNames = new Map(circuitJson.filter(row => row.type === 'source_component').map(row => [row.source_component_id, row.name]))
const unpopulated = new Set(circuitJson.filter(row => row.type === 'pcb_component' && row.do_not_place).map(row => sourceNames.get(row.source_component_id)))
for (const file of schematicFiles) {
  const sheet = parseKicadSch(file.content)
  for (const symbol of sheet.symbols) {
    retainPartNumber(symbol.properties)
    if (unpopulated.has(symbol.properties.find(property => property.key === 'Reference')?.value)) {
      symbol.dnp = true
      symbol.inBom = false
    }
  }
  await writeFile(`${outputDirectory}/${file.filename}`, sheet.getString())
}

const project = new CircuitJsonToKicadProConverter(circuitJson, {
  projectName: 'pd1180-epr-r0.3',
  schematicFilename: 'index.kicad_sch',
  pcbFilename: 'pd1180-epr-r0.3.kicad_pcb',
})
project.runUntilFinished()
const projectData = JSON.parse(project.getOutputString())
projectData.board ??= {}
projectData.board.design_settings ??= {}
projectData.board.design_settings.rules ??= {}
projectData.board.design_settings.defaults ??= {}
projectData.board.design_settings.defaults.zones ??= {}
Object.assign(projectData.board.design_settings.rules, {
  min_copper_edge_clearance: 0.2,
  min_hole_clearance: 0.13,
  min_through_hole_diameter: 0.3,
  min_track_width: 0.09,
  min_connection: 0.09,
  min_groove_width: 0.09,
  min_via_annular_width: 0.10,
  min_via_diameter: 0.5,
})
Object.assign(projectData.board.design_settings.defaults.zones, {
  min_clearance: 0.16,
  min_thickness: 0.15,
  thermal_relief_gap: 0.25,
  thermal_relief_spoke_width: 0.3,
})
const defaultNetclass = projectData.net_settings.classes.find(({ name }) => name === 'Default')
if (!defaultNetclass) throw new Error('KiCad Default netclass was not generated')
Object.assign(defaultNetclass, {
  clearance: 0.09,
  track_width: 0.15,
  via_diameter: 0.5,
  via_drill: 0.3,
})
await writeFile(
  `${outputDirectory}/pd1180-epr-r0.3.kicad_pro`,
  `${JSON.stringify(projectData, null, 2)}\n`,
)

console.log(JSON.stringify({
  output_directory: outputDirectory,
  pcb_bytes: pcb.getOutputString().length,
  schematic_files: schematicFiles.map((file) => file.filename),
}, null, 2))
