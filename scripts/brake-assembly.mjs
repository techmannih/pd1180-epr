import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import JSZip from 'jszip'
import occtImport from 'occt-import-js'
import modeling from '@jscad/modeling'
import {tube,distance} from './harness-geometry.mjs'
import {indexedMesh} from './assembly-glb.mjs'

// Manufacturer resistor mesh; catalogue mating envelopes. Cooling, guards,
// finished crimps and first-article fit are explicitly unqualified in layout.
export async function addBrakeAssembly({layout,circuit,top,meshes,bodies,wires,connectors}) {
 const {primitives:{cuboid,cylinder},booleans:{subtract,union},transforms:{rotateX,translate},geometries:{geom3}}=modeling
 const cfg=layout.brake,mate=layout.mates.find(m=>m.reference==='J3')
 const src=circuit.find(r=>r.type==='source_component'&&r.name==='J3')
 const pcb=circuit.find(r=>r.type==='pcb_component'&&r.source_component_id===src?.source_component_id)
 const ports=circuit.filter(r=>r.type==='pcb_port'&&r.pcb_component_id===pcb?.pcb_component_id).map(p=>({...p,pin:Number(circuit.find(s=>s.type==='source_port'&&s.source_port_id===p.source_port_id)?.pin_number)})).sort((a,b)=>a.pin-b.pin)
 if(pcb?.layer!=='top'||pcb.rotation!==0||ports.length!==2||ports.some((p,i)=>p.pin!==i+1))throw Error('J3 pin/placement contract changed')
 const nets=['VMOTOR','BRAKE_RETURN']
 for(const p of ports){const sp=circuit.find(s=>s.type==='source_port'&&s.source_port_id===p.source_port_id),n=circuit.find(s=>s.type==='source_net'&&s.name===nets[p.pin-1]);if(sp.subcircuit_connectivity_map_key!==n?.subcircuit_connectivity_map_key)throw Error('J3 brake polarity/net mismatch')}
 function solid(name,shape,color,meta={}){
  const positions=[],indices=[]
  for(const poly of geom3.toPolygons(shape)){const f=positions.length/3;for(const p of poly.vertices)positions.push(...p);for(let i=1;i<poly.vertices.length-1;i++)indices.push(f,f+i,f+i+1)}
  meshes.push(indexedMesh({name,positions,indices,color}))
  const bounds={min:[0,1,2].map(k=>Math.min(...positions.filter((_,i)=>i%3===k))),max:[0,1,2].map(k=>Math.max(...positions.filter((_,i)=>i%3===k)))}
  bodies.push({name,reference:'J3',bounds,...meta});return bounds
 }
 const metal=[.65,.67,.68,1],black=[.06,.06,.065,1],height=top+mate.mated_height_mm,bottom=height-mate.height_mm
 const bounds=solid('J3 VHR-2N catalogue housing envelope',subtract(cuboid({center:[pcb.center.x,pcb.center.y,(bottom+height)/2],size:[mate.width_mm,mate.depth_mm,mate.height_mm]}),...ports.map(p=>cuboid({center:[p.x,p.y,(bottom+height)/2],size:[3.1,3.1,mate.height_mm+2]}))),[.88,.87,.78,1],{kind:'mate'})
 connectors.push({reference:'J3',part:'VHR-2N',bounds,ports:ports.map(p=>({pin:p.pin,x:p.x,y:p.y,wire_exit_z:height})),mated_height_mm:mate.mated_height_mm})
 for(const p of ports){
  solid(`J3 SVH-41T-P1.1 contact ${p.pin} nominal envelope`,union(
   subtract(cuboid({center:[p.x,p.y,bottom+4.5],size:[2.8,2.8,5]}),cuboid({center:[p.x,p.y,bottom+4.5],size:[2.4,2.4,6]})),
   subtract(cylinder({center:[p.x,p.y,height-3.5],radius:1.45,height:6,segments:16}),cylinder({center:[p.x,p.y,height-3.5],radius:1.2,height:7,segments:16}))),metal,{kind:'contact',connection:`J3 pin ${p.pin}`})
 }
 const evidence=JSON.parse(await readFile('engineering/mechanical/brake-evidence.json'))
 const bytes=await readFile(evidence.archive),sha=b=>createHash('sha256').update(b).digest('hex')
 if(sha(bytes)!==evidence.archive_sha256)throw Error('Brake manufacturer archive changed')
 const archive=await JSZip.loadAsync(bytes,{checkCRC32:true}),step=await archive.file(evidence.cad.file).async('nodebuffer')
 if(sha(step)!==evidence.cad.sha256)throw Error('Brake resistor STEP changed')
 const occt=await occtImport(),cad=occt.ReadStepFile(step,evidence.cad.tessellation)
 if(!cad.success||cad.meshes.length!==5)throw Error('Unexpected LPS300 CAD structure')
 const transform=([x,y,z])=>[y,cfg.resistor_center_y_mm-x,cfg.resistor_base_z_mm+.2+z]
 const all=[]
 for(const [i,m] of cad.meshes.entries()){
  const positions=[];for(let k=0;k<m.attributes.position.array.length;k+=3)positions.push(...transform(m.attributes.position.array.slice(k,k+3)))
  all.push(...positions)
  meshes.push(indexedMesh({name:`J3_LPS300_manufacturer_part_${i+1}`,positions,indices:Array.from(m.index.array),color:[2,4].includes(i)?metal:i===3?[.82,.82,.78,1]:black}))
 }
 bodies.push({name:'J3 LPS300 manufacturer resistor envelope',reference:'J3',kind:'resistor',bounds:{min:[0,1,2].map(k=>Math.min(...all.filter((_,i)=>i%3===k))),max:[0,1,2].map(k=>Math.max(...all.filter((_,i)=>i%3===k)))},step_sha256:evidence.cad.sha256})
 const holes=cfg.resistor_mount_step_xy_mm.map(([x,y])=>transform([x,y,0]))
 const [sx,sy,sz]=cfg.heatsink_envelope_mm,cy=cfg.resistor_center_y_mm,base=cfg.resistor_base_z_mm
 solid('J3 provisional heatsink base NO THERMAL RATING',subtract(cuboid({center:[0,cy,base-5],size:[sx,sy,10]}),...holes.map(([x,y])=>cylinder({center:[x,y,base-5],radius:1.65,height:12,segments:24}))),[.4,.43,.46,1],{kind:'heatsink',thermal_qualified:false})
 for(let i=0;i<9;i++)solid(`J3 provisional heatsink fin ${i+1}`,cuboid({center:[-36+i*9,cy,base-10-(sz-10)/2],size:[2,sy,sz-10]}),[.4,.43,.46,1],{kind:'heatsink',thermal_qualified:false})
 for(const [i,[x,y]] of holes.entries()){
  // Supplied M4x25 mounting hardware; nominal outlines, not thread BREP.
  solid(`J3 resistor mount M4x25 screw ${i+1}`,union(cylinder({center:[x,y,base+15.3-12.5],radius:2,height:25,segments:16}),cylinder({center:[x,y,base+17.3],radius:3.5,height:4,segments:16})),metal,{kind:'mounting screw'})
  solid(`J3 resistor mount M4 lock washer ${i+1}`,subtract(cylinder({center:[x,y,base+14.9],radius:4,height:.8,segments:24}),cylinder({center:[x,y,base+14.9],radius:2.15,height:1,segments:24})),metal,{kind:'washer'})
 }
 for(const p of ports){
  const [tx,ty,tz]=transform([...cfg.resistor_terminals_step_xy_mm[p.pin-1],cfg.terminal_seat_step_z_mm])
  const connection=`J3 pin ${p.pin}`,back=ty-(cfg.ring_length_mm-cfg.ring_envelope_width_mm/2),axisZ=tz+cfg.ring_barrel_axis_above_seat_mm
  const ring=subtract(cylinder({center:[tx,ty,tz+cfg.ring_tongue_thickness_mm/2],radius:cfg.ring_envelope_width_mm/2,height:cfg.ring_tongue_thickness_mm,segments:32}),cylinder({center:[tx,ty,tz+.4],radius:cfg.ring_hole_mm/2,height:2,segments:32}))
  const tongue=cuboid({center:[tx,ty-5.5,tz+cfg.ring_tongue_thickness_mm/2],size:[4,5,cfg.ring_tongue_thickness_mm]})
  solid(`J3 TE152883 ring ${p.pin} nominal envelope`,union(ring,tongue),metal,{kind:'ring',connection})
  const barrel=translate([tx,back+5,axisZ],rotateX(Math.PI/2,subtract(cylinder({radius:2.5,height:10,segments:20}),cylinder({radius:1.335,height:12,segments:20}))))
  solid(`J3 TE152883 insulated barrel ${p.pin} nominal envelope`,barrel,[.95,.32,.05,1],{kind:'ring',connection})
  const washerZ=tz+cfg.ring_tongue_thickness_mm+.4
  solid(`J3 terminal M4 lock washer ${p.pin}`,subtract(cylinder({center:[tx,ty,washerZ],radius:4,height:.8,segments:24}),cylinder({center:[tx,ty,washerZ],radius:2.15,height:1,segments:24})),metal,{kind:'terminal hardware',connection})
  solid(`J3 terminal M4x6 screw ${p.pin}`,union(cylinder({center:[tx,ty,washerZ+.4-3],radius:2,height:6,segments:16}),cylinder({center:[tx,ty,washerZ+2.4],radius:3.5,height:4,segments:6})),metal,{kind:'terminal hardware',connection})
  const r=cfg.bend_radius_mm,points=[[p.x,p.y,height-.5],[p.x,p.y,axisZ-r]]
  for(let k=1;k<=64;k++){const a=Math.PI*k/128;points.push([p.x,p.y+r*(1-Math.cos(a)),axisZ-r+r*Math.sin(a)])}
  const y0=p.y+r
  for(let k=1;k<=96;k++){const t=k/96,s=t*t*(3-2*t);points.push([p.x+(tx-p.x)*s,y0+(back-y0)*t,axisZ])}
  const name=`J3 cavity ${p.pin} ${p.pin===1?'red':'black'} Alpha3057_16AWG`,length=points.slice(1).reduce((sum,p,i)=>sum+distance(p,points[i]),0)
  meshes.push(tube(name,points,cfg.wire_od_max_mm/2,p.pin===1?[.7,.06,.05,1]:black))
  wires.push({name,reference:'J3',connection,points,radius_mm:cfg.wire_od_max_mm/2,kind:'pigtail',net:nets[p.pin-1],source:`J3:${p.pin} / SVH-41T-P1.1`,destination:`LPS300 terminal ${p.pin} / TE152883`,minimum_bend_radius_mm:cfg.minimum_bend_radius_mm,nominal_path_length_mm:length,cut_length_mm:Math.ceil((length+16)/5)*5,termination_and_adjustment_allowance_mm:16,cut_length_status:'CAD nominal only; qualify first-article strips, crimp and installation length'})
 }
 // A guard envelope makes the exposed-ring boundary visible. Slots deliberately
 // clear both cable paths. Material, mounting and cooling airflow are unqualified.
 const guard=[.55,.68,.76,.18]
 for(const x of [-41,41])solid(`J3 provisional guard side ${x}`,cuboid({center:[x,cy,39],size:[2,84,38]}),guard,{kind:'guard'})
 solid('J3 provisional guard rear',cuboid({center:[0,cy+41,39],size:[80,2,38]}),guard,{kind:'guard'})
 solid('J3 provisional guard roof',cuboid({center:[0,cy,59],size:[84,84,2]}),guard,{kind:'guard'})
 for(const [x,w] of [[-33.5,13],[0,12],[33,14]])solid(`J3 provisional guard slotted front ${x}`,cuboid({center:[x,cy-41,39],size:[w,2,38]}),guard,{kind:'guard'})
 return {resistor_step_sha256:evidence.cad.sha256,thermal_qualified:false}
}
