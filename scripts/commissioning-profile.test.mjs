import {test,expect} from 'bun:test'
import {createHash} from 'node:crypto'
import {validateCommissioningRecord,profileChecks} from './commissioning-profile.mjs'
const sha=b=>createHash('sha256').update(b).digest('hex')
const image=Buffer.from([1,2,3,4]), dump=Buffer.concat([image,Buffer.alloc(12,255)])
const evidence=Buffer.from('Synthetic unit-test evidence, not a physical result')
const board='a'.repeat(64)
function record(profile) {return {schema:1,profile,board_sha256:board,board_serial:'UNIT-TEST',operator:'fixture',approved_by:'fixture',recorded_at:'2026-11-05T00:00:00Z',
  checks:Object.fromEntries(profileChecks[profile].map(name=>[name,{passed:true,path:'inspection',sha256:sha(evidence)}])),
  readbacks:{pd:'pd.bin',rp2040:'rp2040.bin'}}}
const read=async p=>p.endsWith('.bin')?dump:evidence
const load=async()=>({image,hash:sha(image),capacity:16,base:0})
test('separate stationary and bounded motion prerequisites, without requiring future motor tests',async()=>{
  for(const profile of Object.keys(profileChecks)) {
    const r=await validateCommissioningRecord(record(profile),profile,read,board,load)
    expect(r.profile).toBe(profile);expect(r.evidence.pd_readback.image_bytes_match).toBe(true)
  }
})
test('rejects missing inspection, stale PCB, wrong mode and modified evidence',async()=>{
  for(const profile of Object.keys(profileChecks)) {
    for(const name of profileChecks[profile]) {
      const r=record(profile);r.checks[name].passed=false
      await expect(validateCommissioningRecord(r,profile,read,board,load)).rejects.toThrow(name)
    }
    await expect(validateCommissioningRecord(record(profile),profile,read,'b'.repeat(64),load)).rejects.toThrow('board identity')
    await expect(validateCommissioningRecord(record(profile),profile,async()=>Buffer.from('changed'),board,load)).rejects.toThrow('hash mismatch')
  }
  await expect(validateCommissioningRecord(record('power-test'),'bench-test',read,board,load)).rejects.toThrow('profile')
})
test('actual readback bytes are rechecked; a passed JSON field does not qualify them',async()=>{
  for(const kind of ['pd','rp2040']) {
    for(const invalid of [Buffer.alloc(4),Buffer.alloc(16),Buffer.concat([Buffer.from([1,2,3,9]),Buffer.alloc(12,255)])])
      await expect(validateCommissioningRecord(record('bench-test'),'bench-test',async p=>p===`${kind}.bin`?invalid:read(p),board,load)).rejects.toThrow()
  }
})
