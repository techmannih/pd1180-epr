import { readFile } from 'node:fs/promises'
import { digest, field, parseNative, restorePlacementRevisions, uuid } from './native-eco-policy.mjs'

const boardPath = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const policyPath = 'engineering/motor-a2-export-bridge.json'
const withoutFill = item => item[0] === 'zone'
  ? item.filter(value => !Array.isArray(value) || value[0] !== 'filled_polygon')
  : item
const canonical = board => digest(board.map(withoutFill).map(JSON.stringify).sort())
const property = (footprint, name) => footprint.find(item => Array.isArray(item) && item[0] === 'property' && item[1] === JSON.stringify(name))
// Project each reviewed supplier-code change back to its baseline. Only the
// named footprint's code may differ; any other edit fails the canonical hash.
function restoreSupplierCodes(board, substitutions = []) {
  const restored = structuredClone(board)
  for (const { reference, before, after } of substitutions) {
    const footprint = restored.find(item => Array.isArray(item) && item[0] === 'footprint' && property(item, 'Reference')?.[2] === JSON.stringify(reference))
    const supplier = footprint && property(footprint, 'Supplier Part Number')
    if (supplier?.[2] !== JSON.stringify(after)) throw new Error(`Unexpected ${reference} supplier code`)
    supplier[2] = JSON.stringify(before)
  }
  return restored
}

// Project each reviewed via-pad change back to its baseline. Only the named via
// and exact size may differ; any other edit fails the canonical hash.
function restoreViaResizes(board, resizes = []) {
  const restored = structuredClone(board)
  for (const { via_uuid, before, after } of resizes) {
    const via = restored.find(item => Array.isArray(item) && item[0] === 'via' && uuid(item) === via_uuid)
    const size = via && field(via, 'size')
    if (size?.[1] !== after) throw new Error(`Unexpected size for reviewed via ${via_uuid}`)
    size[1] = before
  }
  return restored
}

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
  const original = restoreViaResizes(restoreSupplierCodes(restorePlacementRevisions(board, [policy.revision, policy.c50_correction]), policy.supplier_substitutions), policy.via_resizes)
  if (canonical(original) !== policy.baseline_canonical_unfilled_sha256)
    throw new Error('Unrelated native geometry changed with MOTOR_A2 fix')
  return original
}

if (import.meta.main) {
  const policy = JSON.parse(await readFile(policyPath))
  const bytes = await readFile(boardPath)
  checkMotorA2Bridge(parseNative(bytes.toString()), policy)
  if (digest(bytes) !== policy.current_board_sha256) throw new Error('Stale MOTOR_A2 refill evidence')
  console.log('MOTOR_A2: exact 0.60 mm bridge present; all prior unfilled native records preserved.')
}
