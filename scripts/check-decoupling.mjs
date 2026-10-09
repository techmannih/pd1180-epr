import {readFile,writeFile} from 'node:fs/promises'
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const parts=data.filter(x=>x.type==='source_component')
const srcPorts=data.filter(x=>x.type==='source_port')
const pcbPorts=data.filter(x=>x.type==='pcb_port')
const pcbComponents=data.filter(x=>x.type==='pcb_component')
const pairs=JSON.parse(await readFile('docs/decoupling-targets.json'))
const p=(name,pin)=>{const c=parts.find(x=>x.name===name);const sp=srcPorts.find(x=>x.source_component_id===c?.source_component_id&&x.pin_number===pin);return {component:pcbComponents.find(x=>x.source_component_id===c?.source_component_id),sp,pcb:pcbPorts.find(x=>x.source_port_id===sp?.source_port_id)}}
const sourceTraces=data.filter(x=>x.type==='source_trace')
const pcbTraces=data.filter(x=>x.type==='pcb_trace')
const results=pairs.map(([ic,pin,cap])=>{const a=p(ic,pin),b=p(cap,1);const distance=a.pcb&&b.pcb?Math.hypot(a.pcb.x-b.pcb.x,a.pcb.y-b.pcb.y):Infinity;const st=sourceTraces.find(x=>x.name===`BYPASS_${cap}`);const tr=pcbTraces.find(x=>x.source_trace_id===st?.source_trace_id);const length=tr?.trace_length;return {ic,pin,capacitor:cap,same_top_layer:a.component?.layer==='top'&&b.component?.layer==='top',manual_trace_length_mm:length,routed_length_pass:Number.isFinite(length)&&length<=5,connected:a.sp?.subcircuit_connectivity_map_key===b.sp?.subcircuit_connectivity_map_key,straight_line_mm:distance,placement_limit_mm:3,routed_length_budget_mm:5,placement_pass:distance<=3}})
await writeFile('docs/decoupling-check.json',JSON.stringify({note:'Checks IC-to-cap placement and the explicit local power trace only. Ground return loop and all other copper still require routing review.',results},null,2))
const failed=results.filter(r=>!r.same_top_layer||!r.connected||!r.placement_pass||!r.routed_length_pass)
console.log(JSON.stringify({checked:results.length,failed},null,2))
if(failed.length)process.exitCode=1
