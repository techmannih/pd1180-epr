import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {copperEvidenceErrors} from './check-copper-evidence.mjs'
const r=JSON.parse(readFileSync('engineering/filled-copper-review.json'))
test('current copper screen rejects stale board, missing mesh and mixed-revision rows',()=>{
  expect(copperEvidenceErrors(r,r.board_sha256)).toEqual([])
  expect(copperEvidenceErrors(r,'changed')).not.toEqual([])
  for(const mutate of [d=>d.after.pop(),d=>d.after[0].board_sha256='old',d=>d.after[0].resistance_mohm_20c=null]) {
    const d=structuredClone(r);mutate(d);expect(copperEvidenceErrors(d,r.board_sha256)).not.toEqual([])
  }
})
