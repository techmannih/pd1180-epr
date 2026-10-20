import { test, expect } from 'bun:test'
import { parseNative } from './native-eco-policy.mjs'
import { copperGeometryErrors } from './copper-geometry-policy.mjs'
const board = parseNative('(kicad_pcb (zone (net "VMOTOR") (name "power:VMOTOR:F.Cu:0") (priority 100) (connect_pads (clearance 0.16)) (min_thickness 0.2) (fill yes (smoothing chamfer) (radius 0.3))))')
const project = {board:{design_settings:{rules:{min_connection:.09,min_groove_width:.09}}}}
const drc = {included_severities:['error','warning'],violations:[],unconnected_items:[],schematic_parity:[]}
const standards = {fabrication:{minimum_connection_width_mm:.09,minimum_groove_width_mm:.09},routing:{critical_power_nets:['VMOTOR'],power_zone_corner_chamfer_mm:.3,power_zone_minimum_fill_width_mm:.2,power_zone_clearance_mm:.16}}
const check = (b=board,p=project,d=drc) => copperGeometryErrors(b,p,d,standards)
test('accepts enabled rules and a consolidated zone',()=>expect(check()).toEqual([]))
test('connectivity alone cannot pass with neck check disabled',()=>{
 const p=structuredClone(project);p.board.design_settings.rules.min_connection=0;expect(check(board,p).join()).toContain('min_connection')
})
test('cannot suppress connection or groove warnings',()=>{
 for(const key of ['connection_width','copper_sliver']) expect(check(board,project,{...drc,ignored_checks:[{key}]}).join()).toContain('ignored')
})
test('rejects a real neck finding or incomplete warning coverage',()=>{
 expect(check(board,project,{...drc,violations:[{type:'connection_width'}]}).length).toBeGreaterThan(0)
 expect(check(board,project,{...drc,included_severities:['error']}).length).toBeGreaterThan(0)
 expect(check(board,project,{...drc,included_severities:['warning']}).length).toBeGreaterThan(0)
})
test('missing fill dimensions fail closed',()=>{
 for(const key of ['min_thickness','connect_pads']) {
  const b=structuredClone(board);b[1]=b[1].filter(x=>x[0]!==key)
  expect(check(b).length).toBeGreaterThan(0)
 }
 const b=structuredClone(board);b[1].find(x=>x[0]==='fill').splice(3,1)
 expect(check(b).length).toBeGreaterThan(0)
})
test('rejects legacy unsmoothed zones and inadequate clearance',()=>{
 const b=structuredClone(board);b[1]=b[1].filter(x=>!Array.isArray(x)||!['name','fill'].includes(x[0]));expect(check(b).length).toBeGreaterThan(0)
 const c=structuredClone(board);c[1].find(x=>x[0]==='connect_pads')[1][1]='0.09';expect(check(c).join()).toContain('clearance')
})
