import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {checkRp2040Contract} from './rp2040-contract.mjs'
const source=JSON.parse(readFileSync('dist/index/circuit.json'))
test('compiled DDV pinout, powered boot flash, independent brake and enable chain match the selected architecture',()=>{
  expect(checkRp2040Contract(source)).toEqual([])
})
test('reject a bypass anchored to an unrelated encoder pin or to the wrong copper layer',()=>{
  for(const layerOnly of [false,true]) {
    const rows=structuredClone(source)
    const trace=rows.find(r=>r.type==='source_trace'&&r.name==='BYPASS_C25')
    const path=rows.find(r=>r.type==='pcb_trace'&&r.source_trace_id===trace.source_trace_id)
    if(layerOnly) path.route[0].layer='bottom'
    else path.route[0].start_pcb_port_id=rows.find(r=>r.type==='pcb_port'&&!trace.connected_source_port_ids.includes(r.source_port_id)).pcb_port_id
    expect(checkRp2040Contract(rows).some(e=>e.includes('BYPASS_C25'))).toBe(true)
  }
})
test('reject a disconnected brake supply, wrong DDW driver, wrong boot-flash rail or bypassed hardware enable',()=>{
  for(const mutate of [
    rows=>rows.splice(rows.findIndex(r=>r.type==='source_component'&&r.name==='U34'),1),
    rows=>{rows.find(r=>r.type==='source_component'&&r.name==='U7').manufacturer_part_number='DRV8462DDWR'},
    rows=>{const c=rows.find(r=>r.type==='source_component'&&r.name==='U17'); rows.find(r=>r.type==='source_port'&&r.source_component_id===c.source_component_id&&r.pin_number===8).subcircuit_connectivity_map_key='broken'},
    rows=>{const c=rows.find(r=>r.type==='source_component'&&r.name==='U7'); rows.find(r=>r.type==='source_port'&&r.source_component_id===c.source_component_id&&r.pin_number===26).subcircuit_connectivity_map_key='bypassed'},
  ]) {const rows=structuredClone(source);mutate(rows);expect(checkRp2040Contract(rows).length).toBeGreaterThan(0)}
})

test('raw PD measurement and both tails of every spring-clamp pole cannot silently change nets',()=>{
  for(const [ref,pin] of [['U38',8],['U38',6],['U38',4],['U38',5],['J2',5],['J2',6],['J2',7],['J2',8],['J3',3],['J3',4]]) {
    const rows=structuredClone(source)
    const id=rows.find(r=>r.type==='source_component'&&r.name===ref).source_component_id
    const port=rows.find(r=>r.type==='source_port'&&r.source_component_id===id&&r.pin_number===pin)
    port.subcircuit_connectivity_map_key='wrong-rail-or-tail'
    expect(checkRp2040Contract(rows).some(e=>e.startsWith(`${ref}.${pin}:`))).toBe(true)
  }
})
