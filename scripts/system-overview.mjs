import { Circuit } from 'system-block-core'
import { convertCircuitJsonToSystemSvg } from 'system-block-svg'
import { createElement } from 'react'
import { isDeepStrictEqual } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { SystemOverview } from '../system-overview'

export const isSystemRecord = row => row.type.startsWith('system_block_')

// The recent core is used only for diagram layout. Seed identity/association
// context from the already compiled PCB; never re-render footprints or nets.
export async function renderSystemOverview(board) {
  const circuit = new Circuit()
  const root = board.find(row => row.type === 'source_group' && row.name === 'PD1180_EPR')
  if (!root?.is_subcircuit || root.subcircuit_id !== 'subcircuit_source_group_0') {
    throw new Error('Expected the single PD1180_EPR root subcircuit; review system association context')
  }
  for (const row of board.filter(row => ['source_component', 'pcb_component'].includes(row.type))) {
    circuit.db[row.type].insert(structuredClone(row))
  }
  circuit.add(createElement('group', { name: 'system-context', subcircuit: true }, createElement(SystemOverview)))
  await circuit.renderUntilSettled()
  const output = circuit.getCircuitJson()
  const errors = output.filter(row => row.type.endsWith('_error') || row.type.endsWith('_warning'))
  if (errors.length) throw new Error(`System layout failed: ${JSON.stringify(errors)}`)
  const records = output.filter(isSystemRecord)
  if (records.filter(row => row.type === 'system_block_page').length !== 4) throw new Error('Expected all four system pages')
  const ids = new Set(board.filter(row => row.type === 'pcb_component').map(row => row.pcb_component_id))
  for (const row of records) for (const id of row.pcb_component_ids || []) {
    if (!ids.has(id)) throw new Error(`Unknown physical component association: ${id}`)
  }
  // Match Circuit JSON serialization: omit optional undefined properties.
  return JSON.parse(JSON.stringify(records))
}

export function appendSystemOverview(board, records) {
  if (records.some(row => !isSystemRecord(row))) throw new Error('Only system block metadata may be appended')
  const original = board.filter(row => !isSystemRecord(row))
  const combined = [...original, ...records]
  if (!isDeepStrictEqual(combined.filter(row => !isSystemRecord(row)), original)) throw new Error('System diagram changed the board')
  return combined
}

export async function exportSystemSvgs(records, outputDirectory = 'docs/system-blocks') {
  await mkdir(outputDirectory, { recursive: true })
  for (const page of records.filter(row => row.type === 'system_block_page')) {
    const svg = convertCircuitJsonToSystemSvg(records, { systemBlockPageId: page.system_block_page_id, width: 1600 })
    await writeFile(`${outputDirectory}/${page.name}.svg`, svg)
  }
}

if (import.meta.main) {
  const sourcePath = 'dist/index/circuit.json'
  const assemblyPath = 'dist/motor-assembly/circuit.json'
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const assembly = JSON.parse(await readFile(assemblyPath, 'utf8'))
  const records = await renderSystemOverview(source)
  // Both entrypoints get identical metadata; all existing rows remain exact.
  await writeFile(sourcePath, `${JSON.stringify(appendSystemOverview(source, records), null, 2)}\n`)
  await writeFile(assemblyPath, `${JSON.stringify(appendSystemOverview(assembly, records), null, 2)}\n`)
  await exportSystemSvgs(records)
  console.log(`Added four system pages (${records.length} records); electrical/PCB/schematic rows preserved`)
}
