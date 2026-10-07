import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
await writeFile(`${outputDirectory}/pd1180-epr-r0.3.kicad_pcb`, pcb.getOutputString())

const schematic = new CircuitJsonToKicadSchConverter(circuitJson)
schematic.runUntilFinished()
const schematicFiles = schematic.getOutputFiles({ schematicFilename: 'index.kicad_sch' })
for (const file of schematicFiles) {
  await writeFile(`${outputDirectory}/${file.filename}`, file.content)
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
  min_through_hole_diameter: 0.2,
  min_track_width: 0.09,
  min_via_annular_width: 0.10,
  // The routed release keeps a reviewed set of 0.40/0.20 mm filled-and-capped
  // escape vias; newly generated routes use the 0.45/0.20 mm default below.
  min_via_diameter: 0.4,
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
  via_diameter: 0.45,
  via_drill: 0.2,
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
