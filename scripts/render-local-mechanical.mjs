import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {dirname} from 'node:path'
import {MECHANICAL_PARTS} from '../imports/MotorAssemblyCad.ts'

// Resolve only hash-verified mechanical URLs to their exact local bytes in a
// disposable rendering copy. Published source/viewer JSON retains immutable
// Git URLs. This permits verifying a new asset commit before publishing it.
export async function renderLocalMechanical(input,output,name) {
 if(!/^offline-[a-z-]+$/.test(name))throw Error('Invalid rendering scratch name')
 const bytes=await readFile(input),circuit=JSON.parse(bytes)
 const manifest=JSON.parse(await readFile('engineering/mechanical/assembly-parts.json'))
 const sha=b=>createHash('sha256').update(b).digest('hex')
 const parts=new Map(MECHANICAL_PARTS.map(p=>[p.url,p])),seen=new Set()
 for(const row of circuit){
  const part=parts.get(row.model_glb_url)
  if(!part)continue
  if(seen.has(part.name))throw Error(`Duplicate mechanical model: ${part.name}`)
  const local=await readFile(`engineering/mechanical/parts/${part.name}.glb`)
  if(sha(local)!==manifest.find(p=>p.name===part.name)?.sha256)throw Error(`Mechanical hash mismatch: ${part.name}`)
  row.model_glb_url='data:model/gltf-binary;base64,'+local.toString('base64');seen.add(part.name)
 }
 if(seen.size!==MECHANICAL_PARTS.length)throw Error('Rendering input omits registered mechanical models')
 const dir=`build/${name}`,renderDir=`dist/build/${name}`,rendered=`${renderDir}/3d.glb`
 await mkdir(dir,{recursive:true});await rm(rendered,{force:true})
 await writeFile(`${dir}/circuit.json`,JSON.stringify(circuit))
 execFileSync('bunx',['tsci','build',`${dir}/circuit.json`,'--glbs','--routing-disabled','--disable-parts-engine'],{stdio:'inherit',timeout:600_000})
 const glb=await readFile(rendered)
 if(glb.toString('ascii',0,4)!=='glTF'||glb.readUInt32LE(8)!==glb.length)throw Error('Invalid locally resolved GLB')
 if(sha(await readFile(input))!==sha(bytes))throw Error('Source changed during rendering')
 await mkdir(dirname(output),{recursive:true})
 await copyFile(rendered,output)
 await rm(dir,{recursive:true,force:true});await rm(renderDir,{recursive:true,force:true})
 return {source_sha256:sha(bytes),mechanical_parts:seen.size,glb_sha256:sha(glb)}
}
