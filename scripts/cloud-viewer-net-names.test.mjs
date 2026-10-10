import { expect, test } from 'bun:test'
import { KicadToCircuitJsonConverter } from 'kicad-to-circuit-json'
import { combineSourceAndRoutedCircuit, assertAssemblyPreservesBoard } from './generate-cloud-viewer.mjs'

// KiCad 10 uses names on copper instead of a board-level numeric net table.
// The routes intentionally have no pad endpoints: net identity must come from
// the board's net assignments, including the internal branch and plane via.
const board = `(kicad_pcb
  (version 20260206) (generator "pcbnew")
  (general (thickness 1.6))
  (layers (0 "F.Cu" signal) (2 "B.Cu" signal) (25 "Edge.Cuts" user))
  (gr_rect (start 90 90) (end 110 110)
    (stroke (width 0.1) (type default)) (fill none) (layer "Edge.Cuts"))
  (segment (start 96 99) (end 100 99) (width 0.3) (layer "F.Cu") (net "VMOTOR"))
  (segment (start 100 99) (end 104 99) (width 0.3) (layer "F.Cu") (net "VMOTOR"))
  (segment (start 100 99) (end 100 96) (width 0.3) (layer "F.Cu") (net "VMOTOR"))
  (segment (start 96 104) (end 104 104) (width 0.3) (layer "B.Cu") (net "GND"))
  (via (at 100 99) (size 0.6) (drill 0.3) (layers "F.Cu" "B.Cu") (net "VMOTOR"))
  (zone (net "GND") (layer "B.Cu") (hatch edge 0.5)
    (connect_pads (clearance 0.2)) (min_thickness 0.2)
    (fill yes (thermal_gap 0.3) (thermal_bridge_width 0.3))
    (polygon (pts (xy 95 102) (xy 105 102) (xy 105 106) (xy 95 106)))
    (filled_polygon (layer "B.Cu")
      (pts (xy 95 102) (xy 105 102) (xy 105 106) (xy 95 106)))))`

const source = [
  { type: 'source_net', source_net_id: 'source_power', name: 'VMOTOR' },
  { type: 'source_net', source_net_id: 'source_ground', name: 'GND' },
  { type: 'source_trace', source_trace_id: 'power_branch', connected_source_net_ids: ['source_power'], connected_source_port_ids: [] },
  { type: 'source_trace', source_trace_id: 'ground_branch', connected_source_net_ids: ['source_ground'], connected_source_port_ids: [] },
  { type: 'schematic_text', schematic_text_id: 'note', text: 'Preserve source schematic' },
]

function convert() {
  const converter = new KicadToCircuitJsonConverter()
  converter.addFile('named-nets.kicad_pcb', board)
  converter.runUntilFinished()
  return converter.getOutput()
}

test('KiCad name-based branch routes, vias and pours retain the actual source net', () => {
  const routed = convert()
  const { circuit, report } = combineSourceAndRoutedCircuit(source, routed)
  const traces = circuit.filter((row) => row.type === 'pcb_trace')
  expect(traces).toHaveLength(4)
  expect(traces.filter((row) => row.source_trace_id === 'power_branch')).toHaveLength(3)
  expect(traces.filter((row) => row.source_trace_id === 'ground_branch')).toHaveLength(1)
  expect(circuit.find((row) => row.type === 'pcb_via').source_net_id).toBe('source_power')
  const pour = circuit.find((row) => row.type === 'pcb_copper_pour')
  expect(pour.source_net_id).toBe('source_ground')
  expect(pour.net_name).toBe('GND')
  expect(report.named_copper_counts).toEqual({ pcb_trace: 4, pcb_via: 1, pcb_copper_pour: 1 })
  expect(report.routed_net_names).toEqual(['GND', 'VMOTOR'])
  expect(circuit.filter((row) => row.type.startsWith('schematic_'))).toEqual(source.filter((row) => row.type.startsWith('schematic_')))
  expect(traces.map((row) => row.route)).toEqual(routed.filter((row) => row.type === 'pcb_trace').map((row) => row.route))
})

test('export rejects missing or unknown net identity instead of publishing unnamed copper', () => {
  for (const type of ['pcb_trace', 'pcb_via', 'pcb_copper_pour']) {
    const routed = convert()
    const item = routed.find((row) => row.type === type)
    delete item.source_trace_id
    delete item.source_net_id
    delete item.net_name
    expect(() => combineSourceAndRoutedCircuit(source, routed)).toThrow('expected one named routed net')
  }
  const routed = convert()
  routed.find((row) => row.type === 'source_net' && row.name === 'VMOTOR').name = 'UNEXPECTED_NET'
  expect(() => combineSourceAndRoutedCircuit(source, routed)).toThrow('absent from the source circuit')
})

test('export rejects conflicting net references', () => {
  const routed = convert()
  const trace = routed.find((row) => row.type === 'pcb_trace')
  trace.net_name = 'DIFFERENT_NET'
  expect(() => combineSourceAndRoutedCircuit(source, routed)).toThrow('expected one named routed net')
})

test('hosted assembly requires both models and preserves every board record', () => {
  const extras = ['ordered_motor', 'adapter_proposal'].flatMap(name => [
    { type: 'source_component', ftype: 'subassembly', source_component_id: name, name },
    { type: 'cad_component', source_component_id: name, cad_component_id: `cad_${name}`, model_glb_url: `https://example.com/${name}.glb` },
  ])
  const assembly = [...source, ...extras]
  expect(assertAssemblyPreservesBoard(source, assembly)).toEqual(['ordered_motor', 'adapter_proposal'])
  expect(() => assertAssemblyPreservesBoard(source, source)).toThrow('must include')
  expect(() => assertAssemblyPreservesBoard(source, assembly.filter(row => row.cad_component_id !== 'cad_ordered_motor'))).toThrow('Missing mechanical CAD')
  const changed = structuredClone(assembly)
  changed.find(row => row.type === 'schematic_text').text = 'Moved schematic'
  expect(() => assertAssemblyPreservesBoard(source, changed)).toThrow('changed the verified board')
  expect(() => assertAssemblyPreservesBoard(source, [...assembly, { type: 'pcb_component', source_component_id: 'ordered_motor' }])).toThrow('changed the verified board')
  expect(() => assertAssemblyPreservesBoard(source, [...assembly, { type: 'source_project_metadata', project: 'different' }])).toThrow('changed the verified board')
})
