import { readFile,writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { readGlb } from './assembly-glb.mjs'
import { boundsGap,cableBoxClearance,segmentDistance } from './harness-geometry.mjs'

execFileSync('bun',['scripts/generate-harness-assembly.mjs','--check'],{stdio:'inherit'})
const geometry=JSON.parse(await readFile('engineering/mechanical/harness-geometry.json'))
const layout=JSON.parse(await readFile('engineering/mechanical/harness-layout.json'))
const assembly=JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const contract=JSON.parse(await readFile('hardware-contract.json'))
const circuit=JSON.parse(await readFile('dist/index/circuit.json'))
const board=await readGlb(process.argv[2]||'dist/release/3d.glb')
const refs=new Set(circuit.filter(r=>r.type==='source_component').map(r=>r.name))
const errors=[]
const obstacles=board.meshes.filter(m=>refs.has(m.name)).map(mesh=>{
  const points=mesh.triangles.flat().map(([x,z,y])=>[-x,y,z])
  return {name:mesh.name,bounds:{min:[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),max:[0,1,2].map(k=>Math.max(...points.map(p=>p[k])))}}
})
const top=contract.fabrication.finished_thickness_mm/2
const rear=-top-assembly.mount.pcb_bottom_to_motor_rear_mm
for(const h of contract.mechanical.mounting_holes) {
  const r=assembly.mount.pcb_top_head_maximum_diameter_mm/2
  obstacles.push({name:`${h.name} screw head`,bounds:{min:[h.centered_x_mm-r,h.centered_y_mm-r,top],max:[h.centered_x_mm+r,h.centered_y_mm+r,top+assembly.mount.pcb_top_head_and_washer_height_mm]}})
}
obstacles.push({name:'Motor body conservative envelope (factory leads excluded)',bounds:{min:[-43,-43,rear-79.5],max:[43,43,rear]}})
const plateBottom=rear+assembly.mount.motor_rear_to_adapter_bottom_mm,half=assembly.mount.adapter_width_mm/2
obstacles.push({name:'Adapter plate conservative envelope',bounds:{min:[-half,-half,plateBottom],max:[half,half,plateBottom+assembly.mount.adapter_thickness_mm]}})
for(const [i,[x,y]] of assembly.motor.front_hole_xy_mm.entries()) {
  const r=assembly.mount.long_post_outer_diameter_mm/2
  obstacles.push({name:`Support post ${i+1}`,bounds:{min:[x-r,y-r,plateBottom-assembly.mount.long_post_length_mm],max:[x+r,y+r,plateBottom]}})
}
const required=layout.minimum_nominal_clearance_mm
const nearest=(items)=>items.sort((a,b)=>a.gap_mm-b.gap_mm).slice(0,3)
const mates=geometry.connectors.map(c=>{
  const gaps=nearest(obstacles.filter(o=>o.name!==c.reference).map(o=>({name:o.name,gap_mm:boundsGap(c.bounds,o.bounds)})))
  if(gaps[0]?.gap_mm<required)errors.push(`${c.reference} mate: ${gaps[0].name} clearance ${gaps[0].gap_mm.toFixed(3)} mm`)
  const otherMates=geometry.connectors.filter(o=>o.reference!==c.reference)
  for(const other of otherMates)if(boundsGap(c.bounds,other.bounds)<required)errors.push(`${c.reference} mate overlaps ${other.reference} mate`)
  return {reference:c.reference,part:c.part,nearest:gaps}
})
const bodies=geometry.bodies.map(body=>{
  const reference=body.name.split(' ')[0]
  const gaps=nearest(obstacles.filter(o=>o.name!==reference).map(o=>({name:o.name,gap_mm:boundsGap(body.bounds,o.bounds)})))
  if(gaps[0]?.gap_mm<required)errors.push(`${body.name}: ${gaps[0].name} clearance ${gaps[0].gap_mm.toFixed(3)} mm`)
  return {name:body.name,nearest:gaps}
})
const wires=geometry.wires.map(w=>{
  const blockers=[...obstacles.filter(o=>o.name!==w.reference),...geometry.connectors.filter(c=>c.reference!==w.reference).map(c=>({name:`${c.reference} mate`,bounds:c.bounds}))]
  const gaps=nearest(blockers.map(o=>({name:o.name,gap_mm:cableBoxClearance(w.points,w.radius_mm,o.bounds)})))
  if(gaps[0]?.gap_mm<required)errors.push(`${w.name}: ${gaps[0].name} clearance ${gaps[0].gap_mm.toFixed(3)} mm`)
  return {name:w.name,nearest:gaps}
})
let wireGap=Infinity,nearestWires=null
for(let i=0;i<geometry.wires.length;i++) for(let j=i+1;j<geometry.wires.length;j++) {
  const a=geometry.wires[i],b=geometry.wires[j]
  // Factory conductors intentionally emerge from their common jacket.
  if(a.kind==='jacket'||b.kind==='jacket')continue
  // A pigtail, its splice and its factory lead deliberately meet.
  if(a.connection===b.connection)continue
  let gap=Infinity
  for(let k=1;k<a.points.length;k++)for(let l=1;l<b.points.length;l++)
    gap=Math.min(gap,segmentDistance(a.points[k-1],a.points[k],b.points[l-1],b.points[l])-a.radius_mm-b.radius_mm)
  if(gap<wireGap){wireGap=gap;nearestWires=[a.name,b.name]}
  if(gap<required)errors.push(`${a.name} to ${b.name} clearance ${gap.toFixed(3)} mm is below ${required} mm`)
}
// Check the four wire starts against physical PCB cavity locations, independent
// of the viewer's label and the electrical schematic pin ordering.
for(const c of geometry.connectors.filter(c=>c.ports)) {
  const s=circuit.find(r=>r.type==='source_component'&&r.name===c.reference)
  const p=circuit.find(r=>r.type==='pcb_component'&&r.source_component_id===s.source_component_id)
  for(const cavity of c.ports) {
    const wire=geometry.wires.find(w=>w.name.startsWith(`${c.reference} cavity ${cavity.pin} `))
    if(!wire || Math.hypot(wire.points[0][0]-cavity.x,wire.points[0][1]-cavity.y)>.001)errors.push(`${c.reference} cavity ${cavity.pin} has no aligned lead`)
  }
  if(p.rotation!==0)errors.push(`${c.reference} mating orientation changed`)
}
const bendChecks=geometry.wires.filter(w=>w.kind==='pigtail').map(w=>{
  let radius=Infinity
  for(let i=1;i<w.points.length-1;i++){
    const a=w.points[i-1],b=w.points[i],c=w.points[i+1]
    const u=a.map((v,k)=>v-b[k]),v=c.map((n,k)=>n-b[k])
    const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
    const twiceArea=Math.hypot(...cross)
    if(twiceArea>1e-8)radius=Math.min(radius,Math.hypot(...u)*Math.hypot(...v)*Math.hypot(...a.map((n,k)=>n-c[k]))/(2*twiceArea))
  }
  if(radius<w.minimum_bend_radius_mm)errors.push(`${w.name} bend radius ${radius} below wire specification ${w.minimum_bend_radius_mm}`)
  return {name:w.name,minimum_sampled_radius_mm:radius,required_mm:w.minimum_bend_radius_mm,cut_length_mm:w.cut_length_mm}
})
const report={bend_checks:bendChecks,glb_sha256:geometry.glb_sha256,board_glb_sha256:board.sha256,layout_sha256:geometry.layout_sha256,connectors_checked:mates.length,wire_segments_checked:geometry.wires.reduce((sum,w)=>sum+w.points.length-1,0),minimum_required_nominal_clearance_mm:required,minimum_wire_separation_mm:wireGap,nearest_wires:nearestWires,mates,bodies,wires,errors,scope:'Conservative component/body/fastener/plate/post envelope check of mated bodies and insulated cable segments, plus separation between different conductors. Own mating header and same-conductor splice contact is intentional. Factory cable colour order, latches, tool access, bend limits, tolerances and physical strain relief remain separate checks.'}
await writeFile('docs/harness-assembly-check.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({connectors:mates.length,wires:wires.length,segments:report.wire_segments_checked,errors},null,2))
if(errors.length)process.exitCode=1
