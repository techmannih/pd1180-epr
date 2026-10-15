import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import JSZip from 'jszip'
import {readGlb} from './assembly-glb.mjs'
import {meshDrillRadius} from './motor-mounting-geometry.mjs'
const geometry=JSON.parse(readFileSync('engineering/mechanical/harness-geometry.json'))
const cfg=JSON.parse(readFileSync('engineering/mechanical/harness-layout.json')).brake
const zip=await JSZip.loadAsync(readFileSync('engineering/mechanical/harness-proposal.zip'),{checkCRC32:true})
const model=await readGlb(await zip.file('harness-proposal.glb').async('nodebuffer'))
test('J3 has two complete correctly mapped conductors, preserving J2',()=>{
 expect(geometry.connectors.map(c=>c.reference)).toEqual(['J2','J3'])
 const wires=geometry.wires.filter(w=>w.reference==='J3')
 expect(wires.map(w=>w.net)).toEqual(['VMOTOR','BRAKE_RETURN'])
 expect(wires.map(w=>w.cut_length_mm)).toEqual([150,115])
 const mate=geometry.connectors.find(c=>c.reference==='J3')
 for(const [i,w] of wires.entries()){
  expect(w.source).toBe(`J3:${i+1} / SVH-41T-P1.1`)
  expect(w.points[0].slice(0,2)).toEqual([mate.ports[i].x,mate.ports[i].y])
  const [sx,sy]=cfg.resistor_terminals_step_xy_mm[i]
  const expected=[sy,cfg.resistor_center_y_mm-sx-16.45,cfg.resistor_base_z_mm+.2+25.9+2]
  for(let k=0;k<3;k++)expect(w.points.at(-1)[k]).toBeCloseTo(expected[k],7)
  expect(w.minimum_bend_radius_mm).toBe(23.876)
 }
 expect(geometry.wires.filter(w=>w.reference==='J2'&&w.kind==='pigtail')).toHaveLength(4)
})
test('ring holes remain open, aligned to M4 seats; resistor is real multipart CAD',()=>{
 expect(model.meshes.filter(m=>m.name.startsWith('J3_LPS300_manufacturer_part_'))).toHaveLength(5)
 for(const [i,[sx,sy]] of cfg.resistor_terminals_step_xy_mm.entries()){
  const ring=model.meshes.find(m=>m.name===`J3 TE152883 ring ${i+1} nominal envelope`)
  const triangles=ring.triangles.map(t=>t.map(([x,y,z])=>[-x,z,y]))
  const radius=meshDrillRadius(triangles,{x:sy,y:cfg.resistor_center_y_mm-sx})
  expect(radius).toBeGreaterThan(2.13)
  expect(radius).toBeLessThanOrEqual(2.151)
 }
 expect(cfg.thermal_qualified).toBe(false)
 expect(geometry.bodies.filter(b=>b.kind==='heatsink').every(b=>b.thermal_qualified===false)).toBe(true)
})
