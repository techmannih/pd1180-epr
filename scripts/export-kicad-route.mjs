import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { parseKicadPcb, parseKicadSch } from 'kicadts'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { sourceDesignPolicy } from './source-design-policy.mjs'
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
const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const fabrication = standards.fabrication
const sourcePolicy = sourceDesignPolicy(await readFile('index.circuit.tsx', 'utf8'))
const sourceBoard = circuitJson.find(row => row.type === 'pcb_board')
if (!(fabrication.minimum_trace_width_mm >= 0.15) || sourcePolicy.minimum_trace_width_mm !== fabrication.minimum_trace_width_mm || sourceBoard?.min_trace_width !== fabrication.minimum_trace_width_mm)
  throw new Error('Source and native minimum trace width must agree at >=0.15 mm')

const pcb = new CircuitJsonToKicadPcbConverter(circuitJson)
pcb.runUntilFinished()
const nativeBoard = parseKicadPcb(pcb.getOutputString())
const groundZones = nativeBoard.zones.filter(zone => (zone.netName || zone.net) === sourcePolicy.ground_plane.net && !zone.keepout)
if (!groundZones.length) throw new Error('Source GND pour missing from fresh native export')
if (!(fabrication.ground_plane.clearance_mm >= .30) || !(fabrication.ground_plane.board_edge_margin_mm >= .50) || sourcePolicy.ground_plane.clearance_mm !== fabrication.ground_plane.clearance_mm || sourcePolicy.ground_plane.board_edge_margin_mm !== fabrication.ground_plane.board_edge_margin_mm)
  throw new Error('Source GND pour and manufacturing policy differ')
for (const zone of groundZones) {
  // Supply the clearance omitted by the pinned converter. After export,
  // reconstruct the exact edge inset using native KiCad outline geometry.
  zone.connectPads.clearance = sourcePolicy.ground_plane.clearance_mm
  zone.minThickness = fabrication.ground_plane.minimum_fill_width_mm
  zone.name = 'GND_PLANE'
}
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
  min_copper_edge_clearance: fabrication.minimum_copper_to_edge_mm,
  min_hole_clearance: 0.13,
  min_through_hole_diameter: 0.3,
  min_track_width: fabrication.minimum_trace_width_mm,
  min_connection: fabrication.minimum_connection_width_mm,
  min_groove_width: fabrication.minimum_groove_width_mm,
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
  clearance: fabrication.minimum_trace_space_mm,
  track_width: fabrication.minimum_trace_width_mm,
  via_diameter: 0.5,
  via_drill: 0.3,
})
await writeFile(
  `${outputDirectory}/pd1180-epr-r0.3.kicad_pro`,
  `${JSON.stringify(projectData, null, 2)}\n`,
)

// The source converter's inset can drift at polygon corners. Enforce the
// policy against native Edge.Cuts rather than trusting nominal JSON margins.
const macPython = '/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/Current/bin/python3'
const kicadPython = process.env.KICAD_PYTHON || (existsSync(macPython) ? macPython : 'python3')
const boardPath = `${outputDirectory}/pd1180-epr-r0.3.kicad_pcb`
const correctedPath = `${outputDirectory}/ground-policy-applied.kicad_pcb`
for (const args of [
  ['apply', boardPath, correctedPath],
  ['check', correctedPath, `${outputDirectory}/source-design-rules.json`],
]) {
  const result = spawnSync(kicadPython, ['scripts/source_design_rules.py', ...args], {stdio:'inherit'})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error('Native source-rule enforcement failed; KiCad Python with pcbnew/wx is required')
}
await rename(correctedPath, boardPath)

console.log(JSON.stringify({
  output_directory: outputDirectory,
  pcb_bytes: pcb.getOutputString().length,
  schematic_files: schematicFiles.map((file) => file.filename),
}, null, 2))
