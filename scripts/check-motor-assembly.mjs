import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Nominal CAD collision screen; manufacturing tolerances and magnetic performance
// remain separate qualification gates in engineering/mechanical/assembly.json.
const spec = JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const contract = JSON.parse(await readFile('hardware-contract.json'))
const errors = []
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
async function glb(path) {
  const bytes = await readFile(path)
  if (bytes.toString('ascii',0,4) !== 'glTF' || bytes.readUInt32LE(8) !== bytes.length) throw new Error(`Invalid GLB: ${path}`)
  const size = bytes.readUInt32LE(12), json = JSON.parse(bytes.toString('utf8',20,20+size))
  const bin = bytes.subarray(28+size)
  const accessor = id => {
    const a=json.accessors[id], v=json.bufferViews[a.bufferView], width={SCALAR:1,VEC3:3}[a.type]
    const read={5126:['readFloatLE',4],5125:['readUInt32LE',4],5123:['readUInt16LE',2],5121:['readUInt8',1]}[a.componentType]
    if (!width || !read || a.sparse) throw new Error('Unsupported mesh accessor')
    return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>bin[read[0]]((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||width*read[1])+k*read[1])))
  }
  const meshes=[]
  for(const node of json.nodes) {
    if(node.mesh===undefined) continue
    if(node.matrix || node.rotation || node.scale || node.children) throw new Error('Unexpected transformed CAD node; update the screen before accepting this model')
    const offset=node.translation||[0,0,0], triangles=[]
    for(const p of json.meshes[node.mesh].primitives) {
      const points=accessor(p.attributes.POSITION).map(v=>v.map((x,k)=>x+offset[k])), indices=accessor(p.indices).flat()
      for(let i=0;i<indices.length;i+=3) triangles.push(indices.slice(i,i+3).map(k=>points[k]))
    }
    meshes.push({name:node.name,triangles})
  }
  return {meshes,sha256:sha(bytes)}
}
function clip(points, axis, level, above) {
  const result=[]
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],ina=above?a[axis]>=level:a[axis]<=level,inb=above?b[axis]>=level:b[axis]<=level
    if(ina) result.push(a)
    if(ina!==inb) {const t=(level-a[axis])/(b[axis]-a[axis]);result.push(a.map((v,k)=>v+t*(b[k]-v)))}
  }
  return result
}
function polygonDistance(points,x,y) {
  let inside=false, best=Infinity
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1]
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)||0))
    best=Math.min(best,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside
  }
  return inside?0:best
}
function radialClearance(mesh,x,y,bottom,top,radius) {
  let best=Infinity
  for(const tri of mesh.triangles) {
    const polygon=clip(clip(tri,1,bottom,true),1,top,false)
    if(polygon.length>=3) best=Math.min(best,polygonDistance(polygon.map(p=>[p[0],p[2]]),x,y)-radius)
  }
  return best
}
const boardPath=process.argv[2]||'dist/release/3d.glb'
const board=await glb(boardPath),motor=await glb('engineering/mechanical/qsh8618-96.glb')
function meshBounds(meshes) {
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity]
  for(const mesh of meshes) for(const tri of mesh.triangles) for(const p of tri) for(let k=0;k<3;k++) {
    min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k])
  }
  return {min,max}
}
const fixture=await glb('engineering/mechanical/adapter-proposal.glb')
const motorCadBounds=meshBounds(motor.meshes),fixtureCadBounds=meshBounds(fixture.meshes)
if(Math.abs(motorCadBounds.max[2])>.001) errors.push('Motor CAD rear face is not Z=0; check the STEP-to-CAD axis mapping')
if(Math.abs(fixtureCadBounds.max[2]-(contract.fabrication.finished_thickness_mm/2+spec.mount.pcb_top_head_and_washer_height_mm))>.001) errors.push('Fixture CAD height axis does not match the PCB normal')
let assemblyAlignment=null
if(process.argv[3]) {
  const assembled=await glb(process.argv[3])
  const motorNode=assembled.meshes.find(m=>m.name==='QSH8618_96_motor')
  const fixtureNode=assembled.meshes.find(m=>m.name==='adapter_and_encoder_proposal')
  if(!motorNode||!fixtureNode) throw new Error('Assembly export is missing the motor or fixture')
  const motorBounds=meshBounds([motorNode]),fixtureBounds=meshBounds([fixtureNode])
  const rear=-contract.fabrication.finished_thickness_mm/2-spec.mount.pcb_bottom_to_motor_rear_mm
  const gap=-contract.fabrication.finished_thickness_mm/2-motorBounds.max[1]
  if(Math.abs(motorBounds.max[1]-rear)>.001 || Math.abs(fixtureBounds.max[1]-(contract.fabrication.finished_thickness_mm/2+spec.mount.pcb_top_head_and_washer_height_mm))>.001) errors.push('Exported assembly axes/offsets are wrong: motor and fixture must align with the PCB normal')
  assemblyAlignment={assembly_glb_sha256:assembled.sha256,motor_bounds_display_mm:motorBounds,fixture_bounds_display_mm:fixtureBounds,minimum_motor_to_pcb_bottom_mm:gap}
}
// Runtime motor asset is in tscircuit CAD axes (Z height); display meshes are Y-up.
for (const mesh of motor.meshes) mesh.triangles = mesh.triangles.map(tri => tri.map(([x,y,z]) => [x,z,y]))
if(sha(await readFile(spec.motor.step))!==spec.motor.sha256) errors.push('Motor STEP hash changed')
const top=contract.fabrication.finished_thickness_mm/2
const source=JSON.parse(await readFile('dist/index/circuit.json'))
const refs=new Set(source.filter(r=>r.type==='source_component').map(r=>r.name))
const parts=board.meshes.filter(m=>refs.has(m.name))
for(const ref of ['Q12','Q13','R97','C5','R2','SW1','U18']) if(!parts.some(m=>m.name===ref)) errors.push(`Missing component CAD: ${ref}`)
const fasteners=contract.mechanical.mounting_holes.map(h=>{
  const nearest=parts.map(m=>({reference:m.name,clearance_mm:radialClearance(m,-h.centered_x_mm,h.centered_y_mm,top,top+spec.mount.pcb_top_head_and_washer_height_mm,spec.mount.pcb_top_head_maximum_diameter_mm/2)})).filter(v=>Number.isFinite(v.clearance_mm)).sort((a,b)=>a.clearance_mm-b.clearance_mm).slice(0,5)
  if(!nearest.length || nearest[0].clearance_mm<spec.mount.minimum_component_to_head_mm) errors.push(`${h.name}: component clearance below ${spec.mount.minimum_component_to_head_mm} mm`)
  return {hole:h.name,nearest:nearest.map(v=>({...v,clearance_mm:Number(v.clearance_mm.toFixed(4))}))}
})
// Exclude only the intentional support-post contact at the flange back face.
const posts=spec.motor.front_hole_xy_mm.map(([x,y])=>({axis_mm:[x,y],minimum_motor_clearance_mm:Math.min(...motor.meshes.map(m=>radialClearance(m,x,y,spec.motor.front_flange_back_step_x_mm-spec.motor.rear_face_step_x_mm+.001,spec.mount.motor_rear_to_adapter_bottom_mm,spec.mount.long_post_outer_diameter_mm/2)))}))
for(const p of posts) if(p.minimum_motor_clearance_mm<.5) errors.push('Front-flange support post collides with motor or has less than 0.5 mm nominal clearance')
const calculatedPostLength=spec.motor.rear_face_step_x_mm-spec.motor.front_flange_back_step_x_mm+spec.mount.motor_rear_to_adapter_bottom_mm
const stack=spec.mount.motor_rear_to_adapter_bottom_mm+spec.mount.adapter_thickness_mm+spec.mount.adapter_to_pcb_bottom_mm
const dieGap=spec.encoder.magnet_top_to_pcb_bottom_mm+contract.fabrication.finished_thickness_mm+spec.encoder.nominal_package_height_mm-spec.encoder.estimated_package_top_to_die_mm
if(Math.abs(calculatedPostLength-spec.mount.long_post_length_mm)>1e-6 || Math.abs(stack-spec.mount.pcb_bottom_to_motor_rear_mm)>1e-6) errors.push('Mechanical axial stack is inconsistent')
if(Math.abs(dieGap-spec.encoder.nominal_magnet_to_die_mm)>1e-6) errors.push('Encoder die-gap calculation is inconsistent')
if(spec.encoder.holder_retainer_thickness_mm>=spec.encoder.magnet_top_to_pcb_bottom_mm) errors.push('Encoder retainer touches PCB')
const report={board_glb_sha256:board.sha256,motor_glb_sha256:motor.sha256,motor_step_sha256:spec.motor.sha256,spec_sha256:sha(await readFile('engineering/mechanical/assembly.json')),component_models_checked:parts.length,assembly_alignment:assemblyAlignment,motor_cad_bounds_mm:motorCadBounds,fixture_cad_bounds_mm:fixtureCadBounds,head_diameter_mm:spec.mount.pcb_top_head_maximum_diameter_mm,minimum_required_head_clearance_mm:spec.mount.minimum_component_to_head_mm,fasteners,posts,pcb_bottom_to_motor_rear_mm:stack,nominal_magnet_to_die_mm:dieGap,errors,scope:'Nominal component-mesh and motor-post collision screen. Adapter/holder drawings are proposals; no strength, tolerance, physical-fit or magnetic-field qualification.'}
await writeFile('docs/motor-assembly-check.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(errors.length) process.exitCode=1
