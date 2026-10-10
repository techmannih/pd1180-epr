import { test, expect } from 'bun:test'
import { releaseErrors } from './check-release.mjs'

const status = { fabrication_orderable: false, prototype_order_gates: { routed: true },
  order_hold_reasons: ['Powered qualification pending'] }
const verified = { routed_board_verified: true, verified_inputs: { 'board.tsx': 'hash' },
  source_changed_during_validation: [], checks: [{ status: 'pass', exit_code: 0 }] }

test('a verified held design can be reviewed but cannot pass the order gate', () => {
  expect(releaseErrors(status, verified, [], true)).toEqual([])
  expect(releaseErrors(status, verified)).toEqual(['Order hold: Powered qualification pending'])
})
test('review never permits stale evidence, failed engineering checks or missing gates', () => {
  expect(releaseErrors(status, verified, ['board.tsx'], true)).toContain('Verified design input changed: board.tsx')
  expect(releaseErrors(status, { ...verified, checks: [{ status: 'fail', exit_code: 1 }] }, [], true)).toContain('Engineering verification has not passed')
  expect(releaseErrors(status, { ...verified, verified_inputs: {} }, [], true)).toContain('Verified input hashes are missing')
  expect(releaseErrors({ ...status, prototype_order_gates: {} }, verified, [], true)).toContain('Prototype gates are missing')
  expect(releaseErrors({ ...status, order_hold_reasons: [] }, verified, [], true)).toContain('Order hold must state its reasons')
  expect(releaseErrors({ ...status, prototype_order_gates: { routed: false } }, verified, [], true)).toContain('Open prototype gate: routed')
})
