import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { placementAdvisories } from './placement-review.mjs'

// A recorded CLI fixture keeps unit tests independent of ignored build logs and CWD.
// check:placement still evaluates fresh CLI output against the native board report.
const log = readFileSync(new URL('./fixtures/placement-reviewed.txt', import.meta.url), 'utf8')

test('unknown orientation advice or geometric errors require renewed review', () => {
  expect(placementAdvisories(log, 1)).toEqual(['C26', 'C41', 'C80', 'R139'])
  expect(() => placementAdvisories(log.replaceAll('C41', 'C42'), 1)).toThrow()
  expect(() => placementAdvisories(log.replace('Errors: 0', 'Errors: 1'), 1)).toThrow()
  expect(() => placementAdvisories(log.replace('Warnings: 0', 'Warnings: 1'), 1)).toThrow()
  expect(() => placementAdvisories(log.replace('4 suboptimal', '5 suboptimal'), 1)).toThrow()
  expect(() => placementAdvisories(log, 0)).toThrow()
})
