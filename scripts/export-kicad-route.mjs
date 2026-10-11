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
for (const footprint of nativeBoard.footprints) {
  if (!footprint.attr?.dnp) continue
  footprint.attr.excludeFromBom = true
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
