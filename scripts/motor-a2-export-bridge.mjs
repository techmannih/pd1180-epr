import { readFile } from 'node:fs/promises'
import { digest, field, parseNative, restorePlacementRevisions, uuid } from './native-eco-policy.mjs'

const boardPath = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const policyPath = 'engineering/motor-a2-export-bridge.json'
const withoutFill = item => item[0] === 'zone'
  ? item.filter(value => !Array.isArray(value) || value[0] !== 'filled_polygon')
  : item
const canonical = board => digest(board.map(withoutFill).map(JSON.stringify).sort())

export function checkMotorA2Bridge(board, policy) {
  const expected = policy.revision.added
  if (expected.length !== 1 || policy.revision.modified.length || policy.revision.removed.length)
    throw new Error('MOTOR_A2 fix must add exactly one track')
  const segment = expected[0]
  if (segment[0] !== 'segment' || field(segment, 'net')?.[1] !== '"MOTOR_A2"' ||
      field(segment, 'layer')?.[1] !== '"In1.Cu"' || Number(field(segment, 'width')?.[1]) !== 0.6)
    throw new Error('MOTOR_A2 bridge must be 0.60 mm on In1.Cu')
  // Check exact geometry before projecting back to the prior native board.
  if (board.filter(item => Array.isArray(item) && uuid(item) === uuid(segment)).length !== 1)
    throw new Error('Missing or duplicate MOTOR_A2 bridge')
  const original = restorePlacementRevisions(board, [policy.revision])
  if (canonical(original) !== policy.baseline_canonical_unfilled_sha256)
    throw new Error('Unrelated native geometry changed with MOTOR_A2 fix')
  return original
}

if (import.meta.main) {
  const policy = JSON.parse(await readFile(policyPath))
  const bytes = await readFile(boardPath)
  checkMotorA2Bridge(parseNative(bytes.toString()), policy)
  if (digest(bytes) !== policy.after_board_sha256) throw new Error('Stale MOTOR_A2 refill evidence')
  console.log('MOTOR_A2: exact 0.60 mm bridge present; all prior unfilled native records preserved.')
}
