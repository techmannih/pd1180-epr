import {readFile,writeFile} from 'node:fs/promises'
const source=await readFile('index.circuit.tsx','utf8')
const u7=source.match(/<TMC5160A_TA_T\s+name="U7"[\s\S]*?\/>/)?.[0]
if(!u7) throw new Error('U7 not found; cannot validate selected operating mode')
const errors=[]
for(const [pin,net] of [[23,'ENC_B'],[24,'ENC_A'],[25,'ENC_I']]) {
  if(u7.includes(`pin${pin}: "net.${net}"`)) errors.push(`U7 pin${pin} remains connected to ${net}; incompatible with reviewed external STEP/DIR pin function`)
}
const report={checked_at:new Date().toISOString(),selected_mode:'external-step-dir-usb-diagnostics',
  source:'ADI TMC5160A rev1.18 page13 and section17.6',errors,
  proposal:'docs/step-dir-hardware-review.md', schematic_changed:false}
await writeFile('docs/checks/operating-mode.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(errors.length) process.exitCode=1
