import { readFile, writeFile } from 'node:fs/promises'
import { createCloudViewerCircuit } from './generate-cloud-viewer.mjs'

const { circuit, report } = await createCloudViewerCircuit()
const errors = []
if (!report.board_records_preserved || report.mechanical_source_ids.length !== 2) errors.push('Hosted viewer is missing its verified motor assembly')
const expected = `${JSON.stringify(circuit)}\n`
const committed = await readFile('release/circuit.json', 'utf8').catch(() => '')
if (committed !== expected) errors.push('release/circuit.json is stale; run bun run generate:cloud-viewer')

for (const type of ['schematic_sheet', 'schematic_component', 'schematic_trace', 'cad_component']) {
  if ((report.cloud_viewer_counts[type] || 0) !== (report.source_counts[type] || 0)) {
    errors.push(`${type}: cloud viewer no longer preserves the verified source model`)
  }
}
for (const type of ['pcb_trace', 'pcb_via', 'pcb_copper_pour']) {
  if ((report.cloud_viewer_counts[type] || 0) !== (report.routed_board_counts[type] || 0)) {
    errors.push(`${type}: cloud viewer does not exactly replay the verified KiCad copper count`)
  }
  if ((report.named_copper_counts[type] || 0) !== (report.cloud_viewer_counts[type] || 0)) {
    errors.push(`${type}: not every copper item resolves to a named source net`)
  }
}
if (report.mapped_pcb_ports !== report.imported_pcb_ports) {
  errors.push(`Only ${report.mapped_pcb_ports}/${report.imported_pcb_ports} routed KiCad ports map to source ports`)
}

const check = { checked_at: new Date().toISOString(), ...report, release_circuit_current: committed === expected, errors }
await writeFile('docs/cloud-viewer-check.json', `${JSON.stringify(check, null, 2)}\n`)
console.log(JSON.stringify(check, null, 2))
if (errors.length) process.exitCode = 1
