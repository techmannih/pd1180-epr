import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { applyPowerFeed, powerFeedErrors } from './power-feed.mjs'
import { parseNative, field, uuid } from './native-eco-policy.mjs'

const policy = JSON.parse(readFileSync('routing/power-feed.json'))
const board = parseNative(readFileSync('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'utf8'))
const ids = new Set(policy.segments.map(uuid))

test('delivered real board retains its entire original copper and the added feed', () => {
  expect(powerFeedErrors(board, policy)).toEqual([])
})
test('removing the parallel feed or narrowing it fails the board check', () => {
  expect(powerFeedErrors(board.filter(x => !Array.isArray(x) || !ids.has(uuid(x))), policy).length).toBeGreaterThan(0)
  const copy = structuredClone(board)
  field(copy.find(x => Array.isArray(x) && ids.has(uuid(x))), 'width')[1] = '0.5'
  expect(powerFeedErrors(copy, policy).length).toBeGreaterThan(0)
})
test('feed replay refuses a different board and the guard detects unrelated edits', () => {
  expect(() => applyPowerFeed(Buffer.from('(kicad_pcb)'), policy)).toThrow('Wrong baseline')
  const copy = structuredClone(board)
  const original = copy.find(x => x[0] === 'segment' && !ids.has(uuid(x)))
  field(original, 'width')[1] = '0.09'
  expect(powerFeedErrors(copy, policy)).toContain('Unrelated native board geometry changed')
})

test('later USB ECO cannot conceal another locating-hole or pad edit', () => {
  const copy = structuredClone(board)
  const fp = copy.find(x => x[0] === 'footprint' && x.some(v => Array.isArray(v) && v[0] === 'property' && v[1] === '"Reference"' && v[2] === '"J1"'))
  const hole = fp.find(v => Array.isArray(v) && v[0] === 'pad' && v[2] === 'np_thru_hole')
  field(hole, 'drill')[1] = '0.5'
  expect(powerFeedErrors(copy, policy).length).toBeGreaterThan(0)
})
