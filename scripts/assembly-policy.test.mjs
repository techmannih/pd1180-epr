import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { assemblyPolicyErrors } from './assembly-policy.mjs'

const circuit = JSON.parse(readFileSync('dist/index/circuit.json'))
const standards = JSON.parse(readFileSync('board-standards.json'))
const fitted = new Set(JSON.parse(readFileSync('docs/design-manifest.json')).parts.map(p => p.name))
const check = data => assemblyPolicyErrors(data, standards, fitted)
function changed(name, edit) {
  const data = structuredClone(circuit)
  const id = data.find(r => r.type === 'source_component' && r.name === name).source_component_id
  edit(data.find(r => r.type === 'pcb_component' && r.source_component_id === id))
  return data
}

test('only the centered encoder and local bypass footprints are bottom-side DNP', () => {
  expect(check(circuit)).toEqual([])
  expect(check(changed('U18', row => row.do_not_place = false)).length).toBeGreaterThan(0)
  expect(check(changed('C52', row => row.layer = 'top')).length).toBeGreaterThan(0)
  expect(check(changed('U18', row => row.center.x = 0.1)).length).toBeGreaterThan(0)
  expect(check(changed('U7', row => { row.do_not_place = true; row.layer = 'bottom' })).length).toBeGreaterThan(0)
})

test('optional encoder cannot leak into fitted BOM/CPL', () => {
  for (const name of ['U18', 'C52', 'C53']) {
    expect(fitted.has(name)).toBe(false)
    expect(assemblyPolicyErrors(circuit, standards, new Set([...fitted, name])).length).toBeGreaterThan(0)
  }
})

test('motor harness uses the rated VH family and preserves manufacturer winding pairs', () => {
  const harness = JSON.parse(readFileSync('engineering/motor-harness.json'))
  const motor = JSON.parse(readFileSync('docs/motor-data.json'))
  const sources = circuit.filter(row => row.type === 'source_component')
  const j2 = sources.find(row => row.name === 'J2')
  expect(j2.manufacturer_part_number).toBe(harness.motor_connector.header)
  expect(harness.motor_connector.mate).toBe('VHR-4N')
  expect(harness.motor_connector.contacts).toBe('SVH-41T-P1.1')
  expect(harness.motor_connector.termination_wire_awg).toBe(16)
  expect(harness.motor_connector.wire_colours).toEqual(['A+', 'A-', 'B+', 'B-'].map(phase => motor.wiring[phase]))
  for (const [pin, netName] of Object.entries(harness.motor_connector.pin_to_net)) {
    const port = circuit.find(row => row.type === 'source_port' && row.source_component_id === j2.source_component_id && row.pin_number === Number(pin))
    const net = circuit.find(row => row.type === 'source_net' && row.name === netName)
    expect(port.subcircuit_connectivity_map_key).toBe(net.subcircuit_connectivity_map_key)
  }
  expect(sources.filter(row => /^J\d+$/.test(row.name)).map(row => row.name).sort()).toEqual(Object.keys(harness.required_connectors).sort())
})
