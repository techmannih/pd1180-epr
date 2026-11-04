import { test, expect } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { appendSystemOverview, isSystemRecord, renderSystemOverview } from './system-overview.mjs'

const board = JSON.parse(await readFile('dist/index/circuit.json', 'utf8')).filter(row => !isSystemRecord(row))

test('real-board system pages preserve every schematic, net, footprint and copper record', async () => {
  const before = structuredClone(board)
  const records = await renderSystemOverview(board)
  expect(records.filter(row => row.type === 'system_block_page').map(row => row.name)).toEqual([
    'system-overview', 'logic-power', 'protection', 'control-telemetry',
  ])
  expect(board).toEqual(before)
  expect(appendSystemOverview(board, records).filter(row => !isSystemRecord(row))).toEqual(before)
  expect(appendSystemOverview(appendSystemOverview(board, records), records)).toEqual(appendSystemOverview(board, records))
})

test('missing real motor driver cannot become an unlinked decorative block', async () => {
  const driver = board.find(row => row.type === 'source_component' && row.name === 'U7')
  const missing = board.filter(row => !(row.type === 'pcb_component' && row.source_component_id === driver.source_component_id))
  await expect(renderSystemOverview(missing)).rejects.toThrow('U7')
})

test('ambiguous PCB association is rejected', async () => {
  const driver = board.find(row => row.type === 'source_component' && row.name === 'U7')
  const pcb = board.find(row => row.type === 'pcb_component' && row.source_component_id === driver.source_component_id)
  await expect(renderSystemOverview([...board, { ...pcb, pcb_component_id: 'duplicate-driver' }])).rejects.toThrow('found 2')
})

test('diagram attachment cannot inject electrical records', () => {
  expect(() => appendSystemOverview(board, [{ type: 'pcb_trace', pcb_trace_id: 'unauthorized' }])).toThrow('Only system block metadata')
})
