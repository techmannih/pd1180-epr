import {test,expect} from 'bun:test'
import {readFile} from 'node:fs/promises'
import {loadSpliceModel,positionSplice,requireSpliceHash} from './splice-model.mjs'
import {readGlb} from './assembly-glb.mjs'
import JSZip from 'jszip'
const model=await loadSpliceModel()
test('official splice has actual bore/waist geometry and the larger nominal OD',()=>{
  expect(model.length).toBeCloseTo(32.131,6)
  expect(model.radius*2).toBeCloseTo(5.6134,6)
  expect(model.positions.length/3).toBeGreaterThan(1000)
  const p=positionSplice(model,[12,-92,6],'splice')
  const z=p.positions.filter((_,i)=>i%3===2)
  expect(Math.max(...z)).toBeCloseTo(6,6)
  expect(Math.min(...z)).toBeCloseTo(6-32.131,6)
  expect(p.indices).toEqual(model.indices)
  expect(()=>positionSplice(model,[NaN,0,0],'splice')).toThrow('Invalid splice origin')
})
test('manufacturer source corruption is rejected',()=>{
  expect(()=>requireSpliceHash(Buffer.from('modified'),model.step_sha256,'Splice STEP')).toThrow('differs')
})
test('four harness splice meshes and clearance envelopes use the same manufacturer geometry',async()=>{
  const zip=await JSZip.loadAsync(await readFile('engineering/mechanical/harness-proposal.zip'),{checkCRC32:true})
  const glb=await readGlb(await zip.file('harness-proposal.glb').async('nodebuffer'))
  const geometry=JSON.parse(await readFile('engineering/mechanical/harness-geometry.json'))
  const splices=geometry.wires.filter(w=>w.kind==='splice')
  expect(splices.length).toBe(4)
  for(const w of splices){
    expect(w.step_sha256).toBe(model.step_sha256)
    expect(w.radius_mm).toBeCloseTo(2.8067,6)
    expect(w.physical_crimp_envelope_verified).toBe(false)
    const expected=positionSplice(model,w.points[0],w.name)
    const actual=glb.meshes.find(m=>m.name===w.name)
    expect(actual.triangles.length*3).toBe(expected.indices.length)
    // Compare every encoded vertex, not only the bounding box of a cylinder.
    expect(actual.triangles.flat(2)).toEqual(expected.indices.flatMap(i=>expected.positions.slice(i*3,i*3+3).map(Math.fround)))
  }
})
