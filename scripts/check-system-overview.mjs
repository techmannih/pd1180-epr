import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { isSystemRecord, renderSystemOverview } from './system-overview.mjs'

const source = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))
const viewer = JSON.parse(await readFile('release/circuit.json', 'utf8'))
const expected = await renderSystemOverview(source)
assert.deepEqual(source.filter(isSystemRecord), expected, 'Source diagram is stale; run build:preview')
assert.deepEqual(viewer.filter(isSystemRecord), expected, 'Hosted diagram is stale; run build:pcb')
const refs = new Map(source.filter(row => row.type === 'source_component').map(row => [row.source_component_id, row.name]))
const pcbRefs = new Map(source.filter(row => row.type === 'pcb_component').map(row => [row.pcb_component_id, refs.get(row.source_component_id)]))
const linked = new Set(expected.flatMap(row => (row.pcb_component_ids || []).map(id => pcbRefs.get(id))))
const missing = [...refs.values()].filter(name => /^U\d+$/.test(name) && !linked.has(name))
assert.deepEqual(missing, [], 'Every IC must be explained in at least one system block')
const pages = expected.filter(row => row.type === 'system_block_page')
const report = {
  source_sha256: createHash('sha256').update(await readFile('system-overview.tsx')).digest('hex'),
  pages: pages.map(page => ({ name: page.name, title: page.display_name })),
  linked_component_count: linked.size,
  all_ics_linked: true,
  source_and_hosted_system_records_match: true,
  errors: [],
}
await writeFile('docs/checks/system-overview.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(`System overview: ${pages.length} pages, ${linked.size} linked references; source/hosted metadata match`)
