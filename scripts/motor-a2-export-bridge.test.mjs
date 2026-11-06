import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { field, parseNative, uuid } from './native-eco-policy.mjs'
import { checkMotorA2Bridge } from './motor-a2-export-bridge.mjs'

const board = parseNative(readFileSync('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'utf8'))
const policy = JSON.parse(readFileSync('engineering/motor-a2-export-bridge.json', 'utf8'))
const bridgeId = uuid(policy.revision.added[0])
const isBridge = item => Array.isArray(item) && uuid(item) === bridgeId

test('real NEMA34 board retains the export-safe bridge and every unrelated native record', () => {
  expect(() => checkMotorA2Bridge(board, policy)).not.toThrow()
  expect(() => checkMotorA2Bridge(board.filter(item => !isBridge(item)), policy)).toThrow('Missing')
  expect(() => checkMotorA2Bridge([...board, board.find(isBridge)], policy)).toThrow('duplicate')
  for (const [property, value] of [['width', '0.15'], ['layer', '"F.Cu"'], ['net', '"GND"']]) {
    const changed = structuredClone(board)
    field(changed.find(isBridge), property)[1] = value
    expect(() => checkMotorA2Bridge(changed, policy)).toThrow('addition changed')
  }
  const changed = structuredClone(board)
  const other = changed.find(item => Array.isArray(item) && item[0] === 'segment' && !isBridge(item) && field(item, 'width')[1] !== '0.15')
  field(other, 'width')[1] = '0.15'
  expect(() => checkMotorA2Bridge(changed, policy)).toThrow('Unrelated native geometry')
})

test('only the reviewed R65 supplier code may differ from the bridged baseline', () => {
  const supplierOf = (rows, reference) => rows.find(item => Array.isArray(item) && item[0] === 'footprint' &&
    item.some(p => Array.isArray(p) && p[1] === '"Reference"' && p[2] === JSON.stringify(reference)))
    .find(p => Array.isArray(p) && p[1] === '"Supplier Part Number"')
  const wrongCode = structuredClone(board)
  supplierOf(wrongCode, 'R65')[2] = '"C723637"'
  expect(() => checkMotorA2Bridge(wrongCode, policy)).toThrow('Unexpected R65 supplier code')
  const otherPart = structuredClone(board)
  supplierOf(otherPart, 'R64')[2] = '"C1"'
  expect(() => checkMotorA2Bridge(otherPart, policy)).toThrow('Unrelated native geometry')
})
