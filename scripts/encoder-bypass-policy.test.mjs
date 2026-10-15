import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {encoderBypass} from './encoder-bypass-policy.mjs'
const data=JSON.parse(readFileSync('dist/index/circuit.json'))
const source=data.find(r=>r.type==='source_trace'&&r.name==='BYPASS_C52')
const trace=data.find(r=>r.type==='pcb_trace'&&r.source_trace_id===source.source_trace_id)
const fixture={ic:'U18',pin:11,cap:'C52',start:'bottom',end:'top',thickness:1.6,trace,
 vias:data.filter(r=>r.type==='pcb_via'&&r.pcb_trace_id===trace.pcb_trace_id),
 transition:JSON.parse(readFileSync('docs/decoupling-targets.json')).find(t=>t[0]==='U18')[3].layer_transition}
test('encoder bypass counts board thickness and the only specified through via',()=>{
 const result=encoderBypass(fixture)
 expect(result.allowed).toBe(true)
 expect(result.length_mm).toBeCloseTo(3.87302242,6)
})
test('rejects missing, undersize, moved or extra encoder vias and a longer path',()=>{
 for(const change of [
  f=>{f.vias=[]},f=>{f.vias.push(structuredClone(f.vias[0]))},
  f=>{f.vias[0].hole_diameter=.2},f=>{f.vias[0].outer_diameter=.3},
  f=>{f.vias[0].x+=.2},f=>{f.vias[0].layers=['bottom','top']},
  f=>{f.trace.route[1].x=10},f=>{f.thickness=.8},f=>{f.ic='U16'},
  f=>{f.transition.maximum_vias=2},f=>{f.trace.route[2].to_layer='inner1'},
 ]){const f=structuredClone(fixture);change(f);expect(encoderBypass(f).allowed).toBe(false)}
})
