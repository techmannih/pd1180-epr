import { test, expect } from 'bun:test'
import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { rearHoleAxes, mountingAlignment, readMetricDrills, verifyMountingDrills, meshDrillRadius } from './motor-mounting-geometry.mjs'
import { convertCircuitJsonTo3D } from 'circuit-json-to-gltf'
import { MECHANICAL_RENDER_OPTIONS } from './render-local-mechanical.mjs'
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

test('manufacturing drill export rejects missing, shifted, duplicated and wrong-size holes',()=>{
  const text='M48\nMETRIC\nT1C4.200\n%\nG90\nT1\n'+holes.map(h=>`X${(100+h.x).toFixed(3)}Y${(h.y-100).toFixed(3)}`).join('\n')+'\nM30\n'
  const drills=readMetricDrills(text)
  expect(verifyMountingDrills(drills,holes)).toHaveLength(4)
  expect(()=>verifyMountingDrills(drills.slice(1),holes)).toThrow('manufacturing drill')
  expect(()=>verifyMountingDrills(drills.map(d=>({...d,x:d.x+1})),holes)).toThrow('manufacturing drill')
  expect(()=>verifyMountingDrills([...drills,drills[0]],holes)).toThrow('duplicated')
  expect(()=>verifyMountingDrills(readMetricDrills(text.replace('C4.200','C3.200')),holes)).toThrow('manufacturing drill')
  expect(()=>readMetricDrills(text.replace('METRIC','INCH'))).toThrow('metric')
})

test('3D substrate has physical apertures; capped and mirrored holes are detected',async()=>{
  const board={type:'pcb_board',pcb_board_id:'board',center:{x:0,y:0},width:85.9,height:85.9,thickness:1.6,num_layers:4}
  const mesh=async(hs)=>{
    const scene=await convertCircuitJsonTo3D([board,...hs.map((h,i)=>({type:'pcb_hole',pcb_hole_id:`hole${i}`,hole_shape:'circle',hole_diameter:h.diameter,x:h.x,y:h.y}))],{renderBoardTextures:false})
    // The scene is before the GLTF builder's X reflection.
    return scene.boxes[0].mesh.triangles.map(t=>t.vertices.map(p=>[-p.x,p.y,p.z]))
  }
  const drilled=await mesh(holes),solid=await mesh([]),mirrored=await mesh(holes.map(h=>({...h,y:-h.y})))
  for(const hole of holes) {
    expect(Math.abs(meshDrillRadius(drilled,hole)-hole.diameter/2)).toBeLessThan(.05)
    expect(meshDrillRadius(solid,hole)).toBe(0)
    expect(meshDrillRadius(mirrored,hole)).toBe(0)
  }
})

test('dense native-board preview retains mounting drill size in high-quality mode',async()=>{
  const source=JSON.parse(await readFile('release/circuit.json'))
  // Keep actual pads/traces/vias: the renderer needs their relationships to
  // classify open drills. Omit only external component models and textures.
  const geometry=source.filter(row=>row.type!=='cad_component')
  expect(geometry.filter(row=>row.type==='pcb_via').length).toBeGreaterThan(50)
  const triangles=async options=>{
    const scene=await convertCircuitJsonTo3D(geometry,{...options,renderBoardTextures:false})
    return scene.boxes[0].mesh.triangles.map(t=>t.vertices.map(p=>[-p.x,p.y,p.z]))
  }
  const fast=await triangles({boardDrillQuality:'fast'})
  const accurate=await triangles(MECHANICAL_RENDER_OPTIONS)
  for(const hole of holes){
    expect(Math.abs(meshDrillRadius(fast,hole)-hole.diameter/2)).toBeGreaterThan(.05)
    expect(Math.abs(meshDrillRadius(accurate,hole)-hole.diameter/2)).toBeLessThan(.05)
  }
},300000)
