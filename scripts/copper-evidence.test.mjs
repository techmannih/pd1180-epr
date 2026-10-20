import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {copperEvidenceErrors,copperComparisonErrors} from './check-copper-evidence.mjs'
const r=JSON.parse(readFileSync('engineering/filled-copper-review.json'))
test('current copper screen rejects stale board, missing mesh and mixed-revision rows',()=>{
  expect(copperEvidenceErrors(r,r.board_sha256)).toEqual([])
  expect(copperEvidenceErrors(r,'changed')).not.toEqual([])
  for(const mutate of [d=>d.after.pop(),d=>d.after[0].board_sha256='old',d=>d.after[0].resistance_mohm_20c=null]) {
    const d=structuredClone(r);mutate(d);expect(copperEvidenceErrors(d,r.board_sha256)).not.toEqual([])
  }
})

test('power comparison rejects missing paths, stale data, unconverged meshes and resistance regressions',()=>{
  const report=JSON.parse(readFileSync('engineering/copper-geometry-review.json'))
  expect(copperComparisonErrors(report,report.board_sha256)).toEqual([])
  for(const mutate of [
    d=>d.dc_screen.after.pop(),
    d=>d.dc_screen.after[0].board_sha256='old',
    d=>d.dc_screen.after[0].resistance_mohm_20c*=2,
    d=>d.dc_screen.before[0].resistance_mohm_20c=NaN,
    d=>d.dc_screen.refined=[],
  ]) {
    const d=structuredClone(report);mutate(d)
    expect(copperComparisonErrors(d,report.board_sha256)).not.toEqual([])
  }
})
