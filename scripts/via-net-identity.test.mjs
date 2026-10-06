import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
const data=JSON.parse(readFileSync(new URL('../dist/index/circuit.json',import.meta.url)))
const manifest=JSON.parse(readFileSync(new URL('../docs/design-manifest.json',import.meta.url)))
test('each imported MOSFET thermal via retains drain identity, never an implicit ground assignment',()=>{
 const vias=data.filter(x=>x.type==='pcb_via')
 const parts=data.filter(x=>x.type==='source_component')
 const pcb=data.filter(x=>x.type==='pcb_component')
 const traces=data.filter(x=>x.type==='source_trace')
 const ports=data.filter(x=>x.type==='source_port')
 for(const p of manifest.parts.filter(x=>x.tag==='CSD19534Q5A')){
  const source=parts.find(x=>x.name===p.name)
  const component=pcb.find(x=>x.source_component_id===source.source_component_id)
  const drain=ports.find(x=>x.source_component_id===source.source_component_id&&x.pin_number===9)
  const thermalVias=vias.filter(v=>Math.abs(v.x-component.center.x)<1&&Math.abs(v.y-component.center.y)<2)
  expect(thermalVias.length).toBe(4)
  for(const via of thermalVias){
   const trace=traces.find(x=>x.source_trace_id===via.source_trace_id)
   // Manual via traces store resolved source-port IDs rather than their own map key.
   expect(trace?.connected_source_port_ids).toContain(drain.source_port_id)
   const connectedKeys=(trace?.connected_source_port_ids||[]).map(id=>ports.find(x=>x.source_port_id===id)?.subcircuit_connectivity_map_key)
   expect(new Set(connectedKeys)).toEqual(new Set([drain.subcircuit_connectivity_map_key]))
   expect(via.layers).toEqual(['top','inner1','inner2','bottom'])
  }
 }
})
