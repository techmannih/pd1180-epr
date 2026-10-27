import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { assertDownloadDrc, nativeDownloadUrl } from './check-kicad-download.mjs'
const baseline = JSON.parse(readFileSync(new URL('../release/kicad-drc.json', import.meta.url)))
test('retains the exact cosmetic baseline but rejects copper, connectivity and parity findings', () => {
  expect(() => assertDownloadDrc(baseline)).not.toThrow()
  for (const [field, finding] of [
    ['violations', {type:'copper_edge_clearance', severity:'error', items:[]}],
    ['violations', {type:'track_dangling', severity:'warning', items:[]}],
    ['unconnected_items', {type:'unconnected_items'}],
    ['schematic_parity', {type:'net_conflict'}],
  ]) {
    const report = structuredClone(baseline); report[field].push(finding)
    expect(() => assertDownloadDrc(report)).toThrow()
  }
  const incomplete = structuredClone(baseline); delete incomplete.schematic_parity
  expect(() => assertDownloadDrc(incomplete)).toThrow()
})
test('never downloads from a moving branch or arbitrary URL', () => {
  expect(nativeDownloadUrl('952de54ca0b5dbe042d9ccc9a1a9ecf3e8f67779')).toContain('/952de54ca0b5dbe042d9ccc9a1a9ecf3e8f67779/release/')
  for (const ref of ['main', 'HEAD', 'https://example.com', '../main', '952de54']) expect(() => nativeDownloadUrl(ref)).toThrow()
})
