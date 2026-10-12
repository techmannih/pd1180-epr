import { encodeGlb, indexedMesh } from './assembly-glb.mjs'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import occtImport from 'occt-import-js'
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
const out = async (path,bytes) => {
  if (check) { if (!(await readFile(path)).equals(Buffer.from(bytes))) throw new Error(`Stale generated assembly: ${path}`) }
  else await writeFile(path,bytes)
}
await mkdir('engineering/mechanical/parts',{recursive:true})
const parts=[]
const rear=-contract.fabrication.finished_thickness_mm/2-spec.mount.pcb_bottom_to_motor_rear_mm
// Alignment preview only: no unverified replacement motor fasteners.
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
execFileSync('bun',['scripts/generate-harness-assembly.mjs',...(check?['--check']:[])],{stdio:'inherit'})
const harnessParts=JSON.parse(await readFile('engineering/mechanical/harness-parts.json'))
for(const p of harnessParts)parts.push({...p,glb:Buffer.from(p.base64,'base64')})
for(const p of parts)await out(`engineering/mechanical/parts/${p.name}.glb`,p.glb)
const manifest=parts.map(({name,description,bom,glb,z})=>({name,description,bom,sha256:sha(glb),z:z||0}))
await out('engineering/mechanical/assembly-parts.json',JSON.stringify(manifest,null,2)+'\n')
await out('imports/MotorAssemblyCad.ts','// Generated, immutable Git asset URLs; hashes in engineering/mechanical/assembly-parts.json.\nexport const MECHANICAL_PARTS = '+JSON.stringify(parts.map(({name,description,glb,z})=>({name,description,url:spec.runtime_assets_base_url?`${spec.runtime_assets_base_url}/${name}.glb`:'data:model/gltf-binary;base64,'+glb.toString('base64'),z:z||0})))+' as const\n')
console.log(JSON.stringify({parts:parts.length,motor_rear_z:rear,mounting_hardware_modeled:false,hardware_qualified:false}))
