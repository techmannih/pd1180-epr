import {readFile,writeFile} from 'node:fs/promises'
import {MECHANICAL_PARTS} from '../imports/MotorAssemblyCad.ts'
const spec=JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const geometry=JSON.parse(await readFile('engineering/mechanical/harness-geometry.json'))
const errors=[]
if(spec.mount.hardware_modeled!==false || spec.mount.mechanically_secured!==false) errors.push('Unverified retention cannot be marked installed')
for(const p of MECHANICAL_PARTS) if(/^cable_(support|clamp)_/.test(p.name)) errors.push(`Withdrawn retention part remains: ${p.name}`)
for(const w of geometry.wires) if((w.intentional_contacts||[]).some(n=>/^cable_(support|clamp)_/.test(n))) errors.push(`Wire still claims contact with absent support: ${w.name}`)
const report={mounting_hardware_modeled:false,retention_qualified:false,errors,
  scope:'Checks removal of the withdrawn adapter-mounted clamp only; factory motor cable exit remains. External harness strain relief requires physical verification.'}
await writeFile('docs/cable-support-check.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1
