import { test, expect } from 'bun:test'
import { assertNativePackagePinsMatch } from './generate-cloud-viewer.mjs'

const source = [
  {type:'source_component', source_component_id:'u16', name:'U16'},
  ...[1,2,57].map(pin_number => ({type:'source_port', source_component_id:'u16', pin_number})),
]
const board = (reference, pins) => `(kicad_pcb (version 20240108) (generator pcbnew)
  (footprint "test" (layer "F.Cu") (property "Reference" "${reference}")
  ${pins.map(pin => `(pad "${pin}" smd rect (at 0 0) (size 1 1) (layers "F.Cu"))`).join('\n')}))`

test('a package replacement cannot inherit the previous native PCB evidence', () => {
  expect(() => assertNativePackagePinsMatch(source, board('U16',[1,2,57]))).not.toThrow()
  expect(() => assertNativePackagePinsMatch(source, board('U16',[1,2,49]))).toThrow('package pins differ')
  expect(() => assertNativePackagePinsMatch(source, board('Q11',[1,2,3]))).toThrow('removed component Q11')
  expect(() => assertNativePackagePinsMatch(source, '(kicad_pcb (version 20240108) (generator pcbnew))')).toThrow('missing U16')
})
