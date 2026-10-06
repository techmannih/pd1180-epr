import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Run every check, preserving each real exit status even when an earlier check fails.
const routed = process.argv.includes('--routed')
const checks = [
  ['typecheck', ['run', 'typecheck']],
  ['preview', ['run', 'build:preview']],
  ['topology-tests', ['test', 'scripts/design.test.mjs', 'scripts/via-net-identity.test.mjs']],
  ['netlist', ['run', 'check:netlist']],
  ['schematic', ['run', 'check:schematic']],
  ['placement', ['run', 'check:placement']],
  ['routing-difficulty', ['run', 'check:routing']],
  ['decoupling', ['run', 'check:decoupling']],
  ['assembly', ['run', 'check:assembly']],
  ['local-copper', ['run', 'check:local-copper']],
  ['shorts', ['run', 'check:shorts']],
  ...(routed ? [['kicad-drc', ['run', 'check:kicad-drc']]] : []),
]
await mkdir('docs/checks', {recursive: true})
const results=[]
for (const [name,args] of checks) {
  const log=`docs/checks/${name}.log`
  const started=Date.now()
  const exit_code=await new Promise((resolve,reject)=>{
    const stream=createWriteStream(log)
    const child=spawn('bun',args,{stdio:['ignore','pipe','pipe']})
    child.stdout.pipe(stream,{end:false});child.stderr.pipe(stream,{end:false})
    child.on('error',reject)
    child.on('close',code=>stream.end(()=>resolve(code ?? 1)))
  })
  results.push({name,exit_code,status:exit_code===0?'pass':'fail',seconds:(Date.now()-started)/1000,log})
  console.log(`${name}: ${exit_code===0?'PASS':'FAIL'} (${log})`)
}
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const counts={}
for(const row of data) if(row.type.endsWith('_error')||row.type.endsWith('_warning')) counts[row.type]=(counts[row.type]||0)+1
const report={
  checked_at:new Date().toISOString(),
  entry_sha256:createHash('sha256').update(await readFile('index.circuit.tsx')).digest('hex'),
  model:routed?'source checks plus externally routed KiCad PCB verification':'routing-disabled review preview',
  checks:results,
  circuit_messages:counts,
  routed_board_verified:routed && results.every(r=>r.exit_code===0),
  manufacturing_released:false,
  limitations:[
    'The KiCad DRC proves geometric connectivity under the committed project rules; it does not replace physical validation.',
    'Placement and schematic CLI checks include advisory heuristics; their nonzero exit codes are retained.',
    'Stock is a separate timestamped check in stock-report.json, not reserved assembly inventory.',
    'See routing-report.json for the final route record and release-status.json for hardware/firmware gates.'
  ]
}
await writeFile('docs/verification.json',JSON.stringify(report,null,2))
if(results.some(r=>r.exit_code!==0)||Object.keys(counts).some(k=>k.endsWith('_error')))process.exitCode=1
