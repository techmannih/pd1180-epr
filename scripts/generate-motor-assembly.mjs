import { encodeGlb, indexedMesh } from './assembly-glb.mjs'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import occtImport from 'occt-import-js'
import modeling from '@jscad/modeling'
import JSZip from 'jszip'

const check = process.argv.includes('--check')
const spec = JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const layout = JSON.parse(await readFile('engineering/mechanical/harness-layout.json'))
const contract = JSON.parse(await readFile('hardware-contract.json'))
const archive = await JSZip.loadAsync(await readFile(spec.motor.step_archive), { checkCRC32: true })
const step = await archive.file(spec.motor.step).async('nodebuffer')
const sha = b => createHash('sha256').update(b).digest('hex')
if (sha(step) !== spec.motor.sha256) throw new Error('Motor STEP differs from reviewed geometry')
const occt = await occtImport()
const imported = occt.ReadStepFile(step, { linearUnit:'millimeter', linearDeflectionType:'absolute_value', linearDeflection:.08, angularDeflection:.2 })
if (!imported.success || imported.meshes.length !== spec.motor.mesh_count) throw new Error('Unexpected motor STEP mesh count')
const {primitives:{cylinder,cuboid},transforms:{rotateX},booleans:{subtract,union},geometries:{geom3}} = modeling
const out = async (path,bytes) => {
  if (check) { if (!(await readFile(path)).equals(Buffer.from(bytes))) throw new Error(`Stale generated assembly: ${path}`) }
  else await writeFile(path,bytes)
}
await mkdir('engineering/mechanical/fabrication',{recursive:true})
await mkdir('engineering/mechanical/parts',{recursive:true})
const parts = [], fixture = []
function mesh(name,solid,color) {
  const positions=[],indices=[]
  for(const poly of geom3.toPolygons(solid)) {
    const first=positions.length/3
    for(const p of poly.vertices) positions.push(...p)
    for(let i=1;i<poly.vertices.length-1;i++)indices.push(first,first+i+1,first+i)
  }
  return indexedMesh({name,positions,indices,color})
}
function add(name,description,solid,color=[.62,.65,.68,1],bom=name) {
  const m=mesh(name,solid,color);fixture.push(m)
  parts.push({name,description,bom,glb:encodeGlb([m])})
  return m
}
const cylinderAt=(r,h,z,x=0,y=0,segments=48)=>cylinder({radius:r,height:h,center:[x,y,z+h/2],segments})
const hole=(r,h,z,x,y)=>cylinderAt(r,h,z,x,y)
const ring=(ro,ri,h,z,x,y)=>subtract(cylinderAt(ro,h,z,x,y),hole(ri,h+2,z-1,x,y))
const hex=(af,h,z,x,y)=>cylinderAt(af/Math.sqrt(3),h,z,x,y,6)
const rear=-contract.fabrication.finished_thickness_mm/2-spec.mount.pcb_bottom_to_motor_rear_mm
const mt=spec.mount, plateBottom=rear+mt.motor_rear_to_adapter_bottom_mm, plateTop=plateBottom+mt.adapter_thickness_mm
const boardTop=contract.fabrication.finished_thickness_mm/2
const pcbHoles=contract.mechanical.mounting_holes.map(h=>[h.centered_x_mm,h.centered_y_mm])
const motorHoles=spec.motor.front_hole_xy_mm
const supportHoles=mt.cable_support.mount_holes_xy_mm
const holes=[{x:0,y:0,d:mt.adapter_center_aperture_diameter_mm},...motorHoles.map(([x,y])=>({x,y,d:spec.motor.front_hole_diameter_mm})),...pcbHoles.map(([x,y])=>({x,y,d:mt.adapter_pcb_hole_diameter_mm})),...supportHoles.map(([x,y])=>({x,y,d:3.4}))]
const plate=subtract(cuboid({size:[mt.adapter_width_mm,mt.adapter_width_mm,3],center:[0,0,plateBottom+1.5]}),...holes.map(p=>hole(p.d/2,5,plateBottom-1,p.x,p.y)))
add('adapter_plate_PD1180_AP_B','CUSTOM PD1180-AP-B, 6061-T6 aluminium 85.9 x 85.9 x 3 mm; drawing supplied',plate)
// Threads are represented by nominal smooth cylinders, never a claim of thread mesh accuracy.
function bolt(name,d,length,headD,headH,z,x,y,up=false,socket=0) {
  const headBottom=up?z-headH:z
  let head=cylinderAt(headD/2,headH,headBottom,x,y)
  if(socket)head=subtract(head,hex(socket,headH*.6,up?headBottom-.01:headBottom+headH*.4,x,y))
  const solid=union(head,cylinderAt(d/2,length,up?z:z-length,x,y))
  add(name,`${d===4?'ISO 7380-1 button': 'ISO 4762 socket'} M${d} x ${length}; nominal shaft/head envelope, threads simplified`,solid)
}
function washer(name,od,id,t,z,x,y){add(name,`${id<5?"DIN 433 Accu HRDW-M4-A2":"ISO 7089 M5"}; ${od} OD x ${id} ID x ${t} mm`,ring(od/2,id/2,t,z,x,y))}
for(const [i,[x,y]] of motorHoles.entries()) {
  const bottom=plateBottom-mt.long_post_length_mm
  const post=subtract(hex(8,80,bottom,x,y),hole(2.5,10,bottom,x,y),hole(2.5,10,plateBottom-10,x,y))
  add(`motor_support_post_M5_80_${i+1}`,'NBK SHBS-M5-80, 8 mm AF, female/female 10 mm thread depth each end',post)
  washer(`post_top_washer_M5_${i+1}`,10,5.3,1,plateTop,x,y)
  bolt(`post_top_screw_M5x10_${i+1}`,5,10,8.5,5,plateTop+1,x,y,false,4)
  const flangeFront=rear-spec.motor.rear_face_step_z_mm
  washer(`post_front_washer_M5_${i+1}`,10,5.3,1,flangeFront-1,x,y)
  bolt(`post_front_screw_M5x16_${i+1}`,5,16,8.5,5,flangeFront-1,x,y,true,4)
}
for(const [i,[x,y]] of pcbHoles.entries()) {
  add(`pcb_spacer_311430640050_H${i+1}`,'Essentra 311430640050; nickel plated brass, 6 mm length, 8 mm OD, 4.3 mm ID',ring(4,2.15,6,plateTop,x,y),[.71,.59,.30,1])
  washer(`pcb_top_washer_M4_H${i+1}`,8,4.3,.5,boardTop,x,y)
  bolt(`pcb_screw_M4x20_H${i+1}`,4,20,7.6,2.2,boardTop+.5,x,y,false,2.5)
  washer(`pcb_lower_washer_M4_H${i+1}`,8,4.3,.5,plateBottom-.5,x,y)
  add(`pcb_hex_nut_M4_H${i+1}`,'ISO 4032 M4, AF 7 mm, nominal 3.2 mm height',subtract(hex(7,3.2,plateBottom-3.7,x,y),hole(2,5,plateBottom-5,x,y)))
}
// Custom, fabricatable prototype support. Its split clamp grips the cable jacket,
// not individual conductors or splice barrels. Creep/pull force are not validated.
const zClamp=-56,yClamp=layout.motor_cable.jacket_end_y_mm
const flanges=supportHoles.map(([x,y])=>subtract(cuboid({size:[12,12,3],center:[x,y,plateBottom-1.5]}),hole(1.7,5,plateBottom-4,x,y)))
const arms=supportHoles.map(([x,y])=>cuboid({size:[6,Math.abs(y-yClamp)+10,3],center:[x,(y+yClamp)/2,plateBottom-1.5]}))
const crossBar=cuboid({size:[48,8,3],center:[0,yClamp+9,plateBottom-1.5]})
const stem=union(...[-18,18].map(x=>cuboid({size:[6,5,plateBottom-zClamp],center:[x,yClamp+8,(plateBottom+zClamp)/2]})),cuboid({size:[42,5,2],center:[0,yClamp+8,zClamp+1]}))
const clampSolid=subtract(cuboid({size:[26,16,9],center:[0,yClamp,zClamp+4.5]}),hole(3.75,11,zClamp-1,0,yClamp))
// Split at Y; two M3 cross bolts pass through both halves.
const crossDrill=x=>modeling.transforms.translate([x,yClamp,zClamp+4.5],rotateX(Math.PI/2,cylinder({radius:1.7,height:22,segments:32})))
const drilled=subtract(clampSolid,crossDrill(-9),crossDrill(9))
const front=subtract(drilled,cuboid({size:[40,20,20],center:[0,yClamp+10,zClamp+4.5]}))
const back=subtract(drilled,cuboid({size:[40,20,20],center:[0,yClamp-10,zClamp+4.5]}))
const support=union(...flanges,...arms,crossBar,stem,back)
const supportMesh=add('cable_support_PD1180_CS_B','CUSTOM PA12 prototype cable support; clamp qualification pending',support,[.20,.23,.27,1])
const capMesh=add('cable_clamp_cap_PD1180_CC_B','CUSTOM PA12 prototype split clamp cap; bore 7.5 mm from vendor CAD',front,[.20,.23,.27,1])
for(const [i,[x,y]] of supportHoles.entries()) {
  bolt(`cable_support_screw_M3x12_${i+1}`,3,12,5.5,3,plateTop,x,y,false,2.5)
  add(`cable_support_nut_M3_${i+1}`,'ISO 4032 M3, AF 5.5, 2.4 mm height',subtract(hex(5.5,2.4,plateBottom-5.4,x,y),hole(1.5,4,plateBottom-6,x,y)))
}
for(const [i,x] of [-9,9].entries()) {
  const solid=union(cylinderAt(1.5,20,0),subtract(cylinderAt(2.75,3,20),hex(2.5,2,21,0,0)))
  add(`cable_clamp_screw_M3x20_${i+1}`,'ISO 4762 M3 x 20; procurement pending',modeling.transforms.translate([x,yClamp+12,zClamp+4.5],rotateX(Math.PI/2,solid)))
  const nut=subtract(hex(5.5,2.4,0,0,0),hole(1.5,4,-1,0,0))
  add(`cable_clamp_nut_M3_${i+1}`,'ISO 4032 M3',modeling.transforms.translate([x,yClamp+10.4,zClamp+4.5],rotateX(Math.PI/2,nut)))
}
// Clip only the illustrative cable tail. Y=-70 is outside motor/terminal housing.
const clipY=layout.motor_cable.cad_clip_plane_y_mm
function clip(poly) {
  const out=[]
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],inside=a[1]>=clipY,next=b[1]>=clipY
    if(inside)out.push(a)
    if(inside!==next){const t=(clipY-a[1])/(b[1]-a[1]);out.push(a.map((v,k)=>v+t*(b[k]-v)))}
  }
  return out
}
const original=[],trimmed=[]
for(const m of imported.meshes){
 const p=m.attributes.position.array,ix=m.index.array;const positions=[],indices=[],tp=[],ti=[]
 for(let i=0;i<p.length;i+=3)positions.push(p[i],p[i+1],p[i+2]-spec.motor.rear_face_step_z_mm)
 indices.push(...ix)
 for(let i=0;i<ix.length;i+=3){const poly=clip(Array.from(ix.slice(i,i+3),k=>positions.slice(k*3,k*3+3)));const first=tp.length/3;for(const v of poly)tp.push(...v);for(let k=1;k<poly.length-1;k++)ti.push(first,first+k,first+k+1)}
 original.push({name:m.name,positions,indices,color:[.34,.38,.43,1]});trimmed.push(indexedMesh({name:'stepperonline_34HS31_6004S1',positions:tp,indices:ti,color:[.34,.38,.43,1]}))
}
const originalBytes=encodeGlb(original,`${spec.motor.name} mechanical assembly; dimensions in millimeters`)
if(sha(originalBytes)!==spec.published_models.motor.sha256)throw new Error('Original motor geometry hash changed')
await out(spec.motor.assembly_glb,encodeGlb(trimmed))
parts.unshift({name:'stepperonline_34HS31_6004S1',description:'Manufacturer STEP motor; cable tail after Y=-70 rerouted in harness, no motor or terminal housing geometry modified',bom:'34HS31-6004S1',glb:encodeGlb(trimmed),z:rear})
await out('engineering/mechanical/adapter-proposal.glb',encodeGlb(fixture))
// Production drawing in mm and nominal STL for the two custom printed parts.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="180mm" height="140mm" viewBox="-65 -70 180 140"><rect x="-42.95" y="-42.95" width="85.9" height="85.9" fill="none" stroke="black" stroke-width=".2"/>${holes.map(h=>`<circle cx="${h.x}" cy="${-h.y}" r="${h.d/2}" fill="none" stroke="black" stroke-width=".2"/>`).join('')}<g font-size="3" font-family="sans-serif"><text x="-43" y="-52">PD1180-AP-B | 6061-T6 | 85.9 x 85.9 x 3 mm</text><text x="-43" y="52">XY hole table: adapter-hole-table.csv. Origin: plate centre.</text><text x="-43" y="58">Dimensions in mm. Deburr. General tolerance +/-0.10 mm.</text><text x="-43" y="64">Prototype fabrication design; shared motor mounting approval pending.</text></g></svg>`
await out('engineering/mechanical/fabrication/adapter-plate.svg',svg)
await out('engineering/mechanical/fabrication/adapter-hole-table.csv','hole,x_mm,y_mm,diameter_mm\n'+holes.map((h,i)=>`${i+1},${h.x},${h.y},${h.d}`).join('\n')+'\n')
let dxf='0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n'
const h=42.95;for(const [a,b]of[[[-h,-h],[h,-h]],[[h,-h],[h,h]],[[h,h],[-h,h]],[[-h,h],[-h,-h]]])dxf+=`0\nLINE\n8\nCUT\n10\n${a[0]}\n20\n${a[1]}\n11\n${b[0]}\n21\n${b[1]}\n`
for(const h of holes)dxf+=`0\nCIRCLE\n8\nCUT\n10\n${h.x}\n20\n${h.y}\n40\n${h.d/2}\n`
await out('engineering/mechanical/fabrication/adapter-plate.dxf',dxf+'0\nENDSEC\n0\nEOF\n')
for(const m of [supportMesh,capMesh]){
 let stl=`solid ${m.name}\n`;for(let i=0;i<m.indices.length;i+=3){stl+='facet normal 0 0 0\nouter loop\n';for(const ix of m.indices.slice(i,i+3))stl+=`vertex ${m.positions.slice(ix*3,ix*3+3).join(' ')}\n`;stl+='endloop\nendfacet\n'}stl+=`endsolid ${m.name}\n`;await out(`engineering/mechanical/fabrication/${m.name}.stl`,stl)
}
execFileSync('bun',['scripts/generate-harness-assembly.mjs',...(check?['--check']:[])],{stdio:'inherit'})
const harnessParts=JSON.parse(await readFile('engineering/mechanical/harness-parts.json'))
for(const p of harnessParts)parts.push({...p,glb:Buffer.from(p.base64,'base64')})
for(const p of parts)await out(`engineering/mechanical/parts/${p.name}.glb`,p.glb)
const manifest=parts.map(({name,description,bom,glb,z})=>({name,description,bom,sha256:sha(glb),z:z||0}))
await out('engineering/mechanical/assembly-parts.json',JSON.stringify(manifest,null,2)+'\n')
await out('imports/MotorAssemblyCad.ts','// Generated, immutable Git asset URLs; hashes in engineering/mechanical/assembly-parts.json.\nexport const MECHANICAL_PARTS = '+JSON.stringify(parts.map(({name,description,glb,z})=>({name,description,url:spec.runtime_assets_base_url?`${spec.runtime_assets_base_url}/${name}.glb`:'data:model/gltf-binary;base64,'+glb.toString('base64'),z:z||0})))+' as const\n')
console.log(JSON.stringify({parts:parts.length,motor_rear_z:rear,fixture_bytes:encodeGlb(fixture).length,hardware_qualified:false}))
