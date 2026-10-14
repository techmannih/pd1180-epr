import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { usbAccess } from './check-usb-access.mjs'
import { parseNative, field } from './native-eco-policy.mjs'
const source = JSON.parse(readFileSync('dist/index/circuit.json'))
const board = parseNative(readFileSync('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'utf8'))
const assembly = JSON.parse(readFileSync('engineering/mechanical/assembly.json'))
test('both native USB mating faces clear the PCB edge', () => {
  const result = usbAccess(source, board, assembly)
  expect(result.errors).toEqual([])
  expect(result.ports).toHaveLength(2)
  expect(result.physical_fit_qualified).toBe(false)
})
test.each(['J1', 'J10'])('%s rejects old recessed native placement even when source is correct', reference => {
  const b = structuredClone(board)
  const f = b.find(x => x[0] === 'footprint' && x.some(p => p[0] === 'property' && p[1] === '"Reference"' && p[2] === JSON.stringify(reference)))
  field(f, 'at')[1] = String(Number(field(f, 'at')[1]) + 2)
  expect(usbAccess(source, b, assembly).errors.length).toBeGreaterThan(0)
})
test('rejects wrong source USB orientation', () => {
  const c = structuredClone(source), id = c.find(x => x.type === 'source_component' && x.name === 'J10').source_component_id
  c.find(x => x.type === 'pcb_component' && x.source_component_id === id).rotation = 90
  expect(usbAccess(c, board, assembly).errors.length).toBeGreaterThan(0)
})
test('rejects a motor preview that intersects the nominal plug envelope', () => {
  const a = structuredClone(assembly)
  a.mount.pcb_bottom_to_motor_rear_mm = -1
  expect(usbAccess(source, board, a).errors.length).toBeGreaterThan(0)
})
