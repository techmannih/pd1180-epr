import { test, expect } from 'bun:test'
import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { rearHoleAxes, mountingAlignment } from './motor-mounting-geometry.mjs'
const spec=JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const archive=await JSZip.loadAsync(await readFile(spec.motor.step_archive))
const axes=rearHoleAxes(await archive.file(spec.motor.step).async('string'))
const contract=JSON.parse(await readFile('hardware-contract.json'))
const holes=contract.mechanical.mounting_holes.map(h=>({name:h.name,x:h.centered_x_mm,y:h.centered_y_mm,diameter:h.diameter_mm}))
test('PCB holes match the actual ordered-motor rear BREP axes',()=>{
  expect(mountingAlignment(axes,holes).every(h=>h.axis_offset_mm<0.000001)).toBe(true)
})
test('old TMCM pattern cannot pass ordered-motor alignment',()=>{
  const old=[[38.4,-24.5],[24.5,38.4],[-38.4,24.5],[-24.5,-38.4]].map(([x,y],i)=>({...holes[i],x,y}))
  expect(()=>mountingAlignment(axes,old)).toThrow('unique ordered-motor axis')
  expect(()=>mountingAlignment(axes,holes.map(h=>({...h,y:-h.y})))).toThrow()
})
test('four records cannot reuse one axis or conceal an incorrect drill',()=>{
  expect(()=>mountingAlignment(axes,[holes[0],holes[0],holes[2],holes[3]])).toThrow()
  expect(()=>mountingAlignment(axes,holes.map(h=>({...h,diameter:3.2})))).toThrow()
  expect(()=>mountingAlignment(axes,holes.map(h=>({...h,diameter:NaN})))).toThrow('finite')
  expect(()=>rearHoleAxes('ISO-10303-21;END-ISO-10303-21;')).toThrow('found 0')
})
