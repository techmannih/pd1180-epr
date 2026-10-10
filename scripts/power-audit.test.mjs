import { test, expect } from 'bun:test'
import { rmsCurrent, dividerRange, operatingErrors, supplyIsolationErrors, inductanceHenries, imonBypassErrors } from './power-audit.mjs'

test('absolute maximum must not replace the operational supply limit', () => {
  expect(operatingErrors({vsaOnMotorBus:true, brakeOn:{nominal:52.894}, motorCutoff:{max:56}})).toHaveLength(2)
  // Correcting VSA alone must not hide the remaining VS overvoltage risk.
  expect(operatingErrors({vsaOnMotorBus:false, brakeOn:{nominal:52.894}, motorCutoff:{max:56}})).toHaveLength(1)
})
test('resistor and threshold tolerance widen both sides of a divider trip', () => {
  const trip = dividerRange(360000,10000,{min:1.176,nominal:1.2,max:1.224},150e-9)
  expect(trip.nominal).toBeCloseTo(44.4)
  expect(trip.min).toBeLessThan(43)
  expect(trip.max).toBeGreaterThan(46)
})
test('zero GLOBALSCALER means full scale, and RMS is below sine peak', () => {
  expect(rmsCurrent(0,31,0.033)).toBeCloseTo(rmsCurrent(256,31,0.033))
  expect(rmsCurrent(198,31,0.033)).toBeGreaterThan(5.3)
  expect(rmsCurrent(198,31,0.033)).toBeLessThan(5.5)
})

test('explicit bypass links cannot alias independent supply rails', () => {
  expect(supplyIsolationErrors({ VMOTOR:'bus', TMC_12V:'bus', GND:'ground' })).toEqual([
    'TMC_12V is shorted to VMOTOR in compiled connectivity',
  ])
  expect(supplyIsolationErrors({ VMOTOR:'bus', TMC_12V:undefined })).toEqual([
    'Missing compiled supply net TMC_12V',
  ])
  expect(supplyIsolationErrors({ VMOTOR:'bus', TMC_12V:'driver', GND:'ground' })).toEqual([])
})

test('unit-bearing inductor values cannot silently produce null calculations', () => {
  expect(inductanceHenries('47uH')).toBeCloseTo(47e-6, 10)
  expect(inductanceHenries('0.047mH')).toBeCloseTo(47e-6, 10)
  expect(() => inductanceHenries('47unknown')).toThrow()
  expect(() => inductanceHenries(NaN)).toThrow()
})

const imonCircuit = (name = 'C19') => [
  { type:'source_component', source_component_id:'efuse', name:'U6' },
  { type:'source_port', source_component_id:'efuse', pin_number:13, subcircuit_connectivity_map_key:'imon' },
  { type:'source_port', source_component_id:'efuse', pin_number:8, subcircuit_connectivity_map_key:'ground' },
  { type:'source_component', source_component_id:'bypass', name, ftype:'simple_capacitor', capacitance:100e-9 },
  { type:'source_port', source_component_id:'bypass', pin_number:1, subcircuit_connectivity_map_key:'imon' },
  { type:'source_port', source_component_id:'bypass', pin_number:2, subcircuit_connectivity_map_key:'ground' },
]

test('rejects the removed C19 IMON bypass, including renamed parts and net aliases', () => {
  expect(imonBypassErrors(imonCircuit())).toEqual([
    'C19: TPS26631 IMON must not have a bypass capacitor (TI section 8.3.9)',
  ])
  const aliased = imonCircuit('C999')
  aliased.push({ type:'source_net', name:'FILTER_ALIAS', subcircuit_connectivity_map_key:'imon' })
  expect(imonBypassErrors(aliased)[0]).toContain('C999:')
  expect(imonBypassErrors(imonCircuit().filter(p => p.source_component_id !== 'bypass'))).toEqual([])
})

test('allows supply decoupling but fails closed when IMON connectivity is missing or shorted', () => {
  const supply = imonCircuit('C18')
  supply[4].subcircuit_connectivity_map_key = 'supply'
  expect(imonBypassErrors(supply)).toEqual([])
  delete supply[1].subcircuit_connectivity_map_key
  expect(imonBypassErrors(supply)).toHaveLength(1)
  supply[1].subcircuit_connectivity_map_key = 'ground'
  expect(imonBypassErrors(supply)).toHaveLength(1)
})
