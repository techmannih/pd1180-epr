import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {MECHANICAL_PARTS} from '../imports/MotorAssemblyCad.ts'
const spec=JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const manifest=JSON.parse(await readFile('engineering/mechanical/assembly-parts.json'))
const remote=process.argv.includes('--remote'),errors=[],results=[]
const hash=b=>createHash('sha256').update(b).digest('hex')
if(!/^https:\/\/raw\.githubusercontent\.com\/techmannih\/pd1180-epr\/[a-f0-9]{40}\/engineering\/mechanical\/parts$/.test(spec.runtime_assets_base_url||'')) errors.push('Mechanical assets must use an immutable full Git commit URL')
if(manifest.length!==MECHANICAL_PARTS.length)errors.push('Asset manifest and runtime part counts differ')
let index=0
async function worker(){
 while(index<MECHANICAL_PARTS.length){
  const part=MECHANICAL_PARTS[index++],entry=manifest.find(p=>p.name===part.name)
  try{
   const local=await readFile(`engineering/mechanical/parts/${part.name}.glb`)
   if(hash(local)!==entry?.sha256)throw new Error('Local asset hash differs from manifest')
   if(part.url!==`${spec.runtime_assets_base_url}/${part.name}.glb`)throw new Error('Runtime asset URL differs from pinned path')
   if(remote){
    const response=await fetch(part.url,{signal:AbortSignal.timeout(30000)})
    if(!response.ok)throw new Error(`HTTP ${response.status}`)
    if(hash(Buffer.from(await response.arrayBuffer()))!==entry.sha256)throw new Error('Published asset differs from local asset')
   }
   results.push({name:part.name,sha256:entry.sha256,bytes:local.length})
  }catch(e){errors.push(`${part.name}: ${e.message}`)}
 }
}
await Promise.all(Array.from({length:4},worker))
const report={checked_at:new Date().toISOString(),remote_checked:remote,base_url:spec.runtime_assets_base_url,parts:results.sort((a,b)=>a.name.localeCompare(b.name)),errors}
await writeFile(`docs/mechanical-assets-${remote?'remote':'local'}-check.json`,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({remote_checked:remote,parts:results.length,errors}))
if(errors.length)process.exitCode=1
