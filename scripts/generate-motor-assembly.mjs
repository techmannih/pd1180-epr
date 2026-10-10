import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import occtImport from 'occt-import-js'
import modeling from '@jscad/modeling'
import JSZip from 'jszip'

const spec = JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const contract = JSON.parse(await readFile('hardware-contract.json'))
const sourceArchive = await JSZip.loadAsync(await readFile(spec.motor.step_archive), { checkCRC32: true })
const step = await sourceArchive.file(spec.motor.step).async('nodebuffer')
if (createHash('sha256').update(step).digest('hex') !== spec.motor.sha256) throw new Error('Motor STEP differs from reviewed geometry')
const occt = await occtImport()
const imported = occt.ReadStepFile(step, { linearUnit: 'millimeter', linearDeflectionType: 'absolute_value', linearDeflection: 0.08, angularDeflection: 0.2 })
if (!imported.success || imported.meshes.length !== spec.motor.mesh_count) throw new Error('Unexpected ordered-motor STEP mesh count')
const { primitives: { cylinder, cuboid }, transforms: { translate }, booleans: { subtract }, geometries: { geom3 } } = modeling
const glb = (meshes) => {
  const j = { asset: { version: '2.0', generator: `${spec.motor.name} mechanical assembly; dimensions in millimeters` }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [] }
  const chunks = []; let length = 0
  const accessor = (values, type, componentType) => {
    const a = componentType === 5126 ? new Float32Array(values) : new Uint32Array(values)
    const bytes = Buffer.from(a.buffer); const view = j.bufferViews.length
    j.bufferViews.push({ buffer: 0, byteOffset: length, byteLength: bytes.length }); chunks.push(bytes); length += bytes.length
    const entry = { bufferView: view, componentType, count: values.length / (type === 'VEC3' ? 3 : 1), type }
    if (type === 'VEC3') {
      entry.min = [0,1,2].map(k => Math.min(...values.filter((_,i) => i%3 === k)))
      entry.max = [0,1,2].map(k => Math.max(...values.filter((_,i) => i%3 === k)))
    }
    j.accessors.push(entry); return j.accessors.length - 1
  }
  for (const mesh of meshes) {
    const material = j.materials.length
    j.materials.push({ name: mesh.name, pbrMetallicRoughness: { baseColorFactor: mesh.color || [.35,.39,.44,1], metallicFactor: .1, roughnessFactor: .7 }, doubleSided: true })
    j.meshes.push({ name: mesh.name, primitives: [{ attributes: { POSITION: accessor(mesh.positions,'VEC3',5126) }, indices: accessor(mesh.indices,'SCALAR',5125), material }] })
    j.scenes[0].nodes.push(j.nodes.length); j.nodes.push({ name: mesh.name, mesh: j.meshes.length - 1 })
  }
  j.buffers.push({ byteLength: length }); let json = Buffer.from(JSON.stringify(j)); json = Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)])
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2,4); header.writeUInt32LE(28+json.length+length,8); header.writeUInt32LE(json.length,12); header.writeUInt32LE(0x4e4f534a,16)
  const binaryHeader = Buffer.alloc(8); binaryHeader.writeUInt32LE(length); binaryHeader.writeUInt32LE(0x004e4942,4)
  return Buffer.concat([header,json,binaryHeader,...chunks])
}
// tscircuit CAD models use board X/Y with height Z; its GLB exporter converts to display axes.
// Ordered-motor STEP already uses shaft axis Z. Rear face becomes CAD Z=0.
const motor = glb(imported.meshes.map(m => {
  const p = m.attributes.position.array; const positions = []
  for (let i=0;i<p.length;i+=3) positions.push(p[i],p[i+1],p[i+2]-spec.motor.rear_face_step_z_mm)
  const indices = []; for(let i=0;i<m.index.array.length;i+=3) indices.push(m.index.array[i],m.index.array[i+1],m.index.array[i+2])
  return {name:m.name,positions,indices,color:[.34,.38,.43,1]}
}))
const shapes = []
const add = (name, solid, color) => {
  const positions = [], indices = []
  for (const polygon of geom3.toPolygons(solid)) {
    const first = positions.length / 3
    for (const [x,y,z] of polygon.vertices) positions.push(x,y,z)
    for (let i=1;i<polygon.vertices.length-1;i++) indices.push(first,first+i+1,first+i)
  }
  shapes.push({name,positions,indices,color})
}
const cyl = (radius,height,z,x=0,y=0) => cylinder({radius,height,center:[x,y,z+height/2],segments:96})
const rear = -contract.fabrication.finished_thickness_mm/2-spec.mount.pcb_bottom_to_motor_rear_mm
const plateBottom = rear + spec.mount.motor_rear_to_adapter_bottom_mm
const plateTop = plateBottom + spec.mount.adapter_thickness_mm
const mount = spec.mount
const boardTop = contract.fabrication.finished_thickness_mm / 2
const holes = contract.mechanical.mounting_holes.map(h=>[h.centered_x_mm,h.centered_y_mm])
const mholes = spec.motor.front_hole_xy_mm
let plate = translate([0,0,plateBottom+mount.adapter_thickness_mm/2],cuboid({size:[mount.adapter_width_mm,mount.adapter_width_mm,mount.adapter_thickness_mm]}))
plate = subtract(plate,cyl(mount.adapter_center_aperture_diameter_mm/2,mount.adapter_thickness_mm+2,plateBottom-1),...mholes.map(([x,y])=>cyl(spec.motor.front_hole_diameter_mm/2,mount.adapter_thickness_mm+2,plateBottom-1,x,y)),...holes.map(([x,y])=>cyl(mount.adapter_pcb_hole_diameter_mm/2,mount.adapter_thickness_mm+2,plateBottom-1,x,y)))
add('Adapter plate — proposal',plate,[.60,.65,.69,1])
for(const [x,y] of mholes) add('M5 front-flange support post — proposal',subtract(cyl(mount.long_post_outer_diameter_mm/2,mount.long_post_length_mm,plateBottom-mount.long_post_length_mm,x,y),cyl(mount.long_post_bore_diameter_mm/2,mount.long_post_length_mm+2,plateBottom-mount.long_post_length_mm-1,x,y)),[.55,.58,.62,1])
for(const [x,y] of holes) {
  add('M4 PCB standoff',subtract(cyl(mount.pcb_standoff_outer_diameter_mm/2,mount.adapter_to_pcb_bottom_mm,plateTop,x,y),cyl(2,mount.adapter_to_pcb_bottom_mm+2,plateTop-1,x,y)),[.71,.59,.30,1])
  add('Maximum M4 head and washer envelope',cyl(mount.pcb_top_head_maximum_diameter_mm/2,mount.pcb_top_head_and_washer_height_mm,boardTop,x,y),[.89,.39,.15,1])
}
// Rear rotating-shaft access is not identified in this single-shaft motor CAD.
// Do not render the previous QSH holder/magnet as if it were compatible.
const fixture=glb(shapes)
await writeFile(spec.motor.glb,motor)
await writeFile('engineering/mechanical/adapter-proposal.glb',fixture)
await writeFile('imports/MotorAssemblyCad.ts',`// Generated by scripts/generate-motor-assembly.mjs; engineering/mechanical/assembly.json records provenance and open gates.\nexport const MOTOR_GLB = "data:model/gltf-binary;base64,${motor.toString('base64')}"\nexport const MOTOR_FIXTURE_GLB = "data:model/gltf-binary;base64,${fixture.toString('base64')}"\nexport const MOTOR_REAR_Z = ${rear}\n`)
console.log(JSON.stringify({motor_bytes:motor.length,fixture_bytes:fixture.length,motor_rear_z:rear,encoder_hardware_modeled:false}))
