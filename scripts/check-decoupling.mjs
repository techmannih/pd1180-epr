import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const parts=data.filter(x=>x.type==='source_component')
const srcPorts=data.filter(x=>x.type==='source_port')
const pcbPorts=data.filter(x=>x.type==='pcb_port')
const pcbComponents=data.filter(x=>x.type==='pcb_component')
const pairs=JSON.parse(await readFile('docs/decoupling-targets.json'))
const p=(name,pin)=>{const c=parts.find(x=>x.name===name);const sp=srcPorts.find(x=>x.source_component_id===c?.source_component_id&&x.pin_number===pin);return {component:pcbComponents.find(x=>x.source_component_id===c?.source_component_id),sp,pcb:pcbPorts.find(x=>x.source_port_id===sp?.source_port_id)}}
const sourceTraces=data.filter(x=>x.type==='source_trace')
const pcbTraces=data.filter(x=>x.type==='pcb_trace')
const results=pairs.map(([ic,pin,cap,override])=>{const limit=override?.placement_limit_mm??3;if(override&&(!override.reason||!(limit>0)))throw new Error(`Invalid placement override for ${cap}`);const a=p(ic,pin),b=p(cap,1);const distance=a.pcb&&b.pcb?Math.hypot(a.pcb.x-b.pcb.x,a.pcb.y-b.pcb.y):Infinity;const st=sourceTraces.find(x=>x.name===`BYPASS_${cap}`);const tr=pcbTraces.find(x=>x.source_trace_id===st?.source_trace_id);const length=tr?.trace_length;return {ic,pin,capacitor:cap,same_top_layer:a.component?.layer==='top'&&b.component?.layer==='top',manual_trace_length_mm:length,routed_length_pass:Number.isFinite(length)&&length<=5,connected:a.sp?.subcircuit_connectivity_map_key===b.sp?.subcircuit_connectivity_map_key,straight_line_mm:distance,placement_limit_mm:limit,placement_override_reason:override?.reason,routed_length_budget_mm:5,placement_pass:distance<=limit}})
await writeFile('docs/decoupling-check.json',JSON.stringify({note:'Checks IC-to-cap placement and the explicit local power trace only. Ground return loop and all other copper still require routing review.',results},null,2))
const failed=results.filter(r=>!r.same_top_layer||!r.connected||!r.placement_pass||!r.routed_length_pass)
console.log(JSON.stringify({checked:results.length,failed},null,2))
if(failed.length)process.exitCode=1
if (process.argv.includes('--native')) {
  const native = JSON.parse(await readFile('docs/native-decoupling-check.json'))
  for (const [field, file] of Object.entries({
    board_sha256: 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb',
    targets_sha256: 'docs/decoupling-targets.json',
    checker_sha256: 'scripts/check-native-decoupling.py',
  })) {
    const hash = createHash('sha256').update(await readFile(file)).digest('hex')
    if (native[field] !== hash) throw new Error(`Stale native bypass evidence: ${file}`)
  }
  const expected = pairs.map(([ic, pin, cap]) => `${ic}.${pin}:${cap}`).sort()
  const actual = native.results?.map(r => `${r.ic}.${r.pin}:${r.capacitor}`).sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected) || !Array.isArray(native.errors) || native.errors.length ||
      native.results.some(r => !r.passed || !Number.isFinite(r.top_route_length_mm) || r.top_route_length_mm > 5)) {
    throw new Error('Native IC-to-capacitor paths are missing, too long, or incompletely checked')
  }
  console.log(`Verified ${native.results.length} native top-layer bypass paths.`)
}
