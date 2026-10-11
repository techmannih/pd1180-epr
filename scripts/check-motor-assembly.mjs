import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import JSZip from 'jszip'
import { rearHoleAxes, mountingAlignment, readMetricDrills, verifyMountingDrills, meshDrillRadius } from './motor-mounting-geometry.mjs'

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
function signedPolygonClearance(points,x,y) {
  let inside=false, best=Infinity
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1]
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)||0))
    best=Math.min(best,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside
  }
  return inside?best:-best
}
function radialClearance(mesh,x,y,bottom,top,radius) {
  let best=Infinity
  for(const tri of mesh.triangles) {
    const polygon=clip(clip(tri,1,bottom,true),1,top,false)
    if(polygon.length>=3) best=Math.min(best,Math.max(0,-signedPolygonClearance(polygon.map(p=>[p[0],p[2]]),x,y))-radius)
  }
  return best
}
const boardPath=process.argv[2]||'dist/release/3d.glb'
const board=await glb(boardPath),motor=await glb(spec.motor.glb)
function meshBounds(meshes) {
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity]
  for(const mesh of meshes) for(const tri of mesh.triangles) for(const p of tri) for(let k=0;k<3;k++) {
    min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k])
  }
  return {min,max}
}
// Validate all three exported axes, including XY handedness. Bounds alone
// cannot detect a reflected four-fold motor/adapter hole pattern.
function maximumVertexOffset(expected, actual, tolerance=.001) {
  const buckets=new Map(), cell=p=>p.map(v=>Math.floor(v/tolerance))
  for(const p of expected) {
    const key=cell(p).join(',')
    if(!buckets.has(key)) buckets.set(key,[])
    buckets.get(key).push(p)
  }
  let maximum=0
  for(const p of actual) {
    const c=cell(p); let nearest=Infinity
    for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++)
      for(const q of buckets.get([c[0]+x,c[1]+y,c[2]+z].join(','))||[])
        nearest=Math.min(nearest,Math.hypot(...p.map((v,k)=>v-q[k])))
    maximum=Math.max(maximum,nearest)
    if(maximum>tolerance) return maximum
  }
  return maximum
}
const vertices=meshes=>meshes.flatMap(m=>m.triangles.flat())
const fixture=await glb('engineering/mechanical/adapter-proposal.glb')
const motorCadBounds=meshBounds(motor.meshes),fixtureCadBounds=meshBounds(fixture.meshes)
if(Math.abs(motorCadBounds.max[2])>.001) errors.push('Motor CAD rear face is not Z=0; check the STEP-to-CAD axis mapping')
if(Math.abs(fixtureCadBounds.max[2]-(contract.fabrication.finished_thickness_mm/2+spec.mount.pcb_top_head_and_washer_height_mm))>.001) errors.push('Fixture CAD height axis does not match the PCB normal')
let assemblyAlignment=null
if(process.argv[3]) {
  const assembled=await glb(process.argv[3])
  const motorNode=assembled.meshes.find(m=>m.name==='ordered_motor')
  const fixtureNode=assembled.meshes.find(m=>m.name==='adapter_proposal')
  if(!motorNode||!fixtureNode) throw new Error('Assembly export is missing the motor or fixture')
  const motorBounds=meshBounds([motorNode]),fixtureBounds=meshBounds([fixtureNode])
  const rear=-contract.fabrication.finished_thickness_mm/2-spec.mount.pcb_bottom_to_motor_rear_mm
  const gap=-contract.fabrication.finished_thickness_mm/2-motorBounds.max[1]
  if(Math.abs(motorBounds.max[1]-rear)>.001 || Math.abs(fixtureBounds.max[1]-(contract.fabrication.finished_thickness_mm/2+spec.mount.pcb_top_head_and_washer_height_mm))>.001) errors.push('Exported assembly axes/offsets are wrong: motor and fixture must align with the PCB normal')
  const offsets={}
  for(const [name,cad,rendered,height] of [['motor',motor.meshes,motorNode,rear],['fixture',fixture.meshes,fixtureNode,0]]) {
    const expected=vertices(cad).map(([x,y,z])=>[-x,z+height,y]), actual=vertices([rendered])
    offsets[name]=Math.max(maximumVertexOffset(expected,actual),maximumVertexOffset(actual,expected))
    if(offsets[name]>.001) errors.push(`Exported ${name} geometry is reflected, rotated or displaced from the specified CAD transform`)
  }
  assemblyAlignment={maximum_vertex_offset_mm:offsets,assembly_glb_sha256:assembled.sha256,motor_bounds_display_mm:motorBounds,fixture_bounds_display_mm:fixtureBounds,minimum_motor_to_pcb_bottom_mm:gap}
}
// Runtime motor asset is in tscircuit CAD axes (Z height); display meshes are Y-up.
for (const mesh of motor.meshes) mesh.triangles = mesh.triangles.map(tri => tri.map(([x,y,z]) => [x,z,y]))
const sourceArchive=await JSZip.loadAsync(await readFile(spec.motor.step_archive),{checkCRC32:true})
if(sha(await sourceArchive.file(spec.motor.step).async('nodebuffer'))!==spec.motor.sha256) errors.push('Motor STEP hash changed')
const top=contract.fabrication.finished_thickness_mm/2
const source=JSON.parse(await readFile('dist/index/circuit.json'))
const mountingHoles=contract.mechanical.mounting_holes.map(h=>({name:h.name,x:h.centered_x_mm,y:h.centered_y_mm,diameter:h.diameter_mm}))
const drillPath='dist/manufacturing/gerbers/pd1180-epr-r0.3-NPTH.drl'
const drillBytes=await readFile(drillPath)
const manufacturingDrills=verifyMountingDrills(readMetricDrills(drillBytes.toString()),mountingHoles)
const substrate=board.meshes.filter(m=>{
  const b=meshBounds([m])
  return Math.abs(b.min[1]+top)<.001 && Math.abs(b.max[1]-top)<.001 &&
    Math.abs(b.max[0]-b.min[0]-contract.mechanical.board_mm[0])<.001 &&
    Math.abs(b.max[2]-b.min[2]-contract.mechanical.board_mm[1])<.001
})
if(substrate.length!==1) throw new Error('Expected one physical PCB substrate mesh for drill verification')
const meshDrills=mountingHoles.map(h=>{
  const radius=meshDrillRadius(substrate[0].triangles,h)
  // A 16-sided 4.2 mm hole has a 2.060 mm inscribed radius. The 0.05 mm
  // allowance covers this tessellation sagitta, not a manufacturing tolerance.
  if(Math.abs(radius-h.diameter/2)>.05 || !Number.isFinite(radius)) errors.push(`${h.name}: 3D substrate has a capped, missing or incorrectly sized drill`)
  return {name:h.name,minimum_open_radius_mm:radius,nominal_diameter_mm:h.diameter}
})
const motorAxes=rearHoleAxes(await sourceArchive.file(spec.motor.step).async('string'))
const holeAlignment=mountingAlignment(motorAxes, contract.mechanical.mounting_holes.map(h => ({name:h.name,x:h.centered_x_mm,y:h.centered_y_mm,diameter:h.diameter_mm})))
mountingAlignment(motorAxes, source.filter(r => r.type==='pcb_hole' && !r.pcb_component_id).map((h,i) => ({name:`compiled H${i+1}`,x:h.x,y:h.y,diameter:h.hole_diameter})))
const refs=new Set(source.filter(r=>r.type==='source_component').map(r=>r.name))
const parts=board.meshes.filter(m=>refs.has(m.name))
for(const ref of ['Q12','Q13','R97','C5','R2','SW1','U18']) if(!parts.some(m=>m.name===ref)) errors.push(`Missing component CAD: ${ref}`)
// A top-entry header must fit as a complete body, not just its solder lands.
// Check the projected exported mesh envelope, including any CAD offsets.
function segmentDistance(a,b,c,d) {
  const cross=(u,v)=>u[0]*v[1]-u[1]*v[0],sub=(u,v)=>u.map((x,k)=>x-v[k])
  const ab=sub(b,a),cd=sub(d,c),ac=sub(c,a),den=cross(ab,cd)
  if(Math.abs(den)>1e-12) {
    const t=cross(ac,cd)/den,u=cross(ac,ab)/den
    if(t>=0&&t<=1&&u>=0&&u<=1) return 0
  }
  const pointDistance=(p,q,r)=>{
    const v=sub(r,q),w=sub(p,q),length=v[0]**2+v[1]**2
    const t=length?Math.max(0,Math.min(1,(w[0]*v[0]+w[1]*v[1])/length)):0
    return Math.hypot(w[0]-t*v[0],w[1]-t*v[1])
  }
  return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b))
}
const outline=source.find(r=>r.type==='pcb_board').outline.map(p=>[p.x,p.y])
const connectorClearances=spec.connector_body_clearances.map(requirement=>{
  const mesh=parts.find(m=>m.name===requirement.reference)
  if(!mesh) throw new Error(`Missing connector CAD: ${requirement.reference}`)
  const bounds=meshBounds([mesh])
  const corners=[[-bounds.max[0],bounds.min[2]],[-bounds.min[0],bounds.min[2]],[-bounds.min[0],bounds.max[2]],[-bounds.max[0],bounds.max[2]]]
  let edge=Math.min(...corners.map(([x,y])=>signedPolygonClearance(outline,x,y)))
  for(let i=0;i<corners.length;i++) for(let j=0;j<outline.length;j++)
    edge=Math.min(edge,segmentDistance(corners[i],corners[(i+1)%corners.length],outline[j],outline[(j+1)%outline.length]))
  const nearby=parts.filter(m=>m!==mesh).map(m=>{
    const other=meshBounds([m])
    const gaps=[0,2].map(k=>Math.max(0,other.min[k]-bounds.max[k],bounds.min[k]-other.max[k]))
    return {reference:m.name,projected_envelope_gap_mm:Math.hypot(...gaps)}
  }).sort((a,b)=>a.projected_envelope_gap_mm-b.projected_envelope_gap_mm).slice(0,5)
  if(edge<requirement.minimum_board_edge_mm) errors.push(`${requirement.reference}: CAD body is outside the board or below its required edge clearance`)
  if(nearby[0]?.projected_envelope_gap_mm<requirement.minimum_component_gap_mm) errors.push(`${requirement.reference}: CAD body has insufficient clearance to ${nearby[0].reference}`)
  return {reference:requirement.reference,body_bounds_pcb_mm:{min:[-bounds.max[0],bounds.min[2]],max:[-bounds.min[0],bounds.max[2]]},minimum_board_edge_mm:edge,minimum_required_board_edge_mm:requirement.minimum_board_edge_mm,minimum_required_component_gap_mm:requirement.minimum_component_gap_mm,nearest_components:nearby}
})
const fasteners=contract.mechanical.mounting_holes.map(h=>{
  const nearest=parts.map(m=>({reference:m.name,clearance_mm:radialClearance(m,-h.centered_x_mm,h.centered_y_mm,top,top+spec.mount.pcb_top_head_and_washer_height_mm,spec.mount.pcb_top_head_maximum_diameter_mm/2)})).filter(v=>Number.isFinite(v.clearance_mm)).sort((a,b)=>a.clearance_mm-b.clearance_mm).slice(0,5)
  if(!nearest.length || nearest[0].clearance_mm<spec.mount.minimum_component_to_head_mm) errors.push(`${h.name}: component clearance below ${spec.mount.minimum_component_to_head_mm} mm`)
  return {hole:h.name,nearest:nearest.map(v=>({...v,clearance_mm:Number(v.clearance_mm.toFixed(4))}))}
})
// Exclude only the intentional support-post contact at the flange back face.
const posts=spec.motor.front_hole_xy_mm.map(([x,y])=>({axis_mm:[x,y],minimum_motor_clearance_mm:Math.min(...motor.meshes.map(m=>radialClearance(m,x,y,spec.motor.front_flange_back_step_z_mm-spec.motor.rear_face_step_z_mm+.001,spec.mount.motor_rear_to_adapter_bottom_mm,spec.mount.long_post_outer_diameter_mm/2)))}))
for(const p of posts) if(p.minimum_motor_clearance_mm<.5) errors.push('Front-flange support post collides with motor or has less than 0.5 mm nominal clearance')
const calculatedPostLength=spec.motor.rear_face_step_z_mm-spec.motor.front_flange_back_step_z_mm+spec.mount.motor_rear_to_adapter_bottom_mm
const stack=spec.mount.motor_rear_to_adapter_bottom_mm+spec.mount.adapter_thickness_mm+spec.mount.adapter_to_pcb_bottom_mm
if(Math.abs(calculatedPostLength-spec.mount.long_post_length_mm)>1e-6 || Math.abs(stack-spec.mount.pcb_bottom_to_motor_rear_mm)>1e-6) errors.push('Mechanical axial stack is inconsistent')
const report={manufacturing_drills:{path:drillPath,sha256:sha(drillBytes),holes:manufacturingDrills},substrate_drills:meshDrills,connector_body_clearances:connectorClearances,hole_alignment:holeAlignment,board_glb_sha256:board.sha256,motor_glb_sha256:motor.sha256,motor_step_sha256:spec.motor.sha256,spec_sha256:sha(await readFile('engineering/mechanical/assembly.json')),component_models_checked:parts.length,assembly_alignment:assemblyAlignment,motor_cad_bounds_mm:motorCadBounds,fixture_cad_bounds_mm:fixtureCadBounds,head_diameter_mm:spec.mount.pcb_top_head_maximum_diameter_mm,minimum_required_head_clearance_mm:spec.mount.minimum_component_to_head_mm,fasteners,posts,pcb_bottom_to_motor_rear_mm:stack,encoder_hardware_modeled:false,encoder_fit_verified:false,encoder_status:spec.encoder.status,errors,scope:'Nominal component-mesh and motor-post collision screen. Adapter is a proposal; encoder attachment unresolved; no strength, tolerance, physical-fit or magnetic-field qualification.'}
await writeFile('docs/motor-assembly-check.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(errors.length) process.exitCode=1
