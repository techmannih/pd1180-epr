import {readFile,writeFile} from 'node:fs/promises'
const source=await readFile('index.circuit.tsx','utf8')
const u7=source.match(/<TMC5160A_TA_T\s+name="U7"[\s\S]*?\/>/)?.[0]
if(!u7) throw new Error('U7 not found; cannot validate selected operating mode')
const errors=[]
for(const pin of [23,24]) {
  if(!u7.includes(`pin${pin}: "net.GND"`)) errors.push(`U7 pin${pin} must be GND in external STEP/DIR mode`)
}
if(!u7.includes('noConnect={["pin25"]}') || /pin25:\s*"net\./.test(u7)) errors.push('U7 DCO pin25 must be disconnected from the encoder')
const report={checked_at:new Date().toISOString(),selected_mode:'external-step-dir-usb-diagnostics',
  source:'ADI TMC5160A rev1.18 page13 and section17.6',errors,
  proposal:'docs/step-dir-hardware-review.md', schematic_changed:true}
await writeFile('docs/checks/operating-mode.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
if(errors.length) process.exitCode=1
