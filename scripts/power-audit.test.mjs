import { test, expect } from 'bun:test'
import { audit, inputCurrentScreen, busVoltageAfterReturn, rmsCurrent, rotorKineticEnergy, dividerRange, brakeReleaseRange, sharedReferenceGap, operatingErrors, supplyIsolationErrors, inductanceHenries, imonBypassErrors } from './power-audit.mjs'

test('input budget includes upstream consumption and resistor temperature tolerance', () => {
  const r = inputCurrentScreen(4990, .001 + 25e-6 * 100, .25)
  expect(r.formula_nominal_a).toBeCloseTo(3.6072, 4)
  expect(r.max_a).toBeGreaterThan(inputCurrentScreen(4990, .001, .25).max_a)
  expect(r.total_input_screen_a).toBeLessThan(4.26)
  expect(r.remaining_contract_margin_a).toBeGreaterThan(.74)
  expect(inputCurrentScreen(3000, .01, .25).remaining_contract_margin_a).toBeLessThan(0)
  expect(() => inputCurrentScreen(4990, NaN, .25)).toThrow()
  expect(() => inputCurrentScreen(4990, .001, NaN)).toThrow()
})

test('returned energy raises the bus by energy conservation, not a linear voltage increment', () => {
  // A 2 F capacitor rises from 9 J at 3 V to 25 J at 5 V.
  expect(busVoltageAfterReturn(3, 2, 16)).toBeCloseTo(5, 10)
  expect(busVoltageAfterReturn(48, 940e-6, 0)).toBe(48)
  expect(busVoltageAfterReturn(48, 940e-6, null)).toBeNull()
  for (const args of [[48,0,1],[48,940e-6,-1],[NaN,940e-6,1],[48,940e-6,undefined]])
    expect(() => busVoltageAfterReturn(...args)).toThrow()
})

test('a passing static cutoff screen does not establish brake-open safety', () => {
  const motorCutoff = { min:53.12377, max:54.26248 }
  expect(operatingErrors({vsaOnMotorBus:false,brakeOn:{max:52.54222},motorCutoff})).toEqual([])
  const returned = busVoltageAfterReturn(motorCutoff.max, 940e-6*0.8, 3.5e-3*5.5**2)
  expect(returned).toBeGreaterThan(56.79)
  expect(returned).toBeLessThan(56.81)
  expect(busVoltageAfterReturn(motorCutoff.max, 940e-6*0.8, 3.5e-3*1.2*5.5**2)).toBeGreaterThan(returned)
})

test('current board audit keeps full-current operation held after static checks pass', async () => {
  const r = await audit()
  expect(r.errors).toEqual([])
  expect(r.full_current_operation_authorized).toBe(false)
  expect(r.powered_tests_performed).toBe(false)
  expect(r.operating_risks.find(x => x.id === 'brake-unavailable')?.status).toBe('open')
  expect(r.calculations.supply.overload_after_pgood.pulse_multiplier).toBe(1)
  expect(r.calculations.supply.overload_after_pgood.hard_5a_ceiling).toBe(false)
  expect(r.calculations.supply.efuse_limit.total_input_screen_a).toBeLessThan(5)
  expect(r.calculations.ripple_and_brake_switch.brake_return_component_references).toEqual(['J3','Q16'])
  expect(r.calculations.ripple_and_brake_switch.measured_each_ripple_a).toBeNull()
  expect(r.calculations.commissioning_profile.motor_operation_authorized).toBe(false)
  expect(r.calculations.commissioning_profile.nominal_rms_a).toBeLessThan(.85)
  expect(r.calculations.commissioning_profile.nominal_speed_rpm).toBeLessThan(10.01)
  expect(r.calculations.commissioning_profile.brake_open_sensitivity.guaranteed_bound).toBe(false)
  expect(r.calculations.commissioning_profile.brake_open_sensitivity.residual_margin_below_55v_v).toBeGreaterThan(.25)
  expect(r.calculations.thresholds_v.brake_on_to_cutoff_shared_reference_minimum_gap).toBeGreaterThan(.1)
  expect(r.calculations.thresholds_v.brake_off_above_high_source_and_noise_allocation).toBeGreaterThan(0)
})

test('shared U12 error is correlated, but comparator and resistor errors remain independent', () => {
  const t=.0035, er=.003725, ec=.00840797902362465
  const ref={min:2.5-er,max:2.5+er}
  const bound=sharedReferenceGap(430000,21200,196200,10000,1e6,ref,ec,t)
  let smallest=Infinity
  for (let mask=0;mask<256;mask++) {
    const choice=(n,a,b)=>(mask&(1<<n))?b:a
    const v=choice(0,ref.min,ref.max), cutError=choice(1,-ec,ec), brakeError=choice(2,-ec,ec)
    const cutTop=choice(3,430000*(1-t),430000*(1+t)), cutBottom=choice(4,21200*(1-t),21200*(1+t))
    const brakeTop=choice(5,196200*(1-t),196200*(1+t)), bottom=choice(6,10000*(1-t),10000*(1+t)), feedback=choice(7,1e6*(1-t),1e6*(1+t))
    const gap=(v+cutError)*(1+cutTop/cutBottom)-(v+brakeError)*(1+brakeTop/bottom+brakeTop/feedback)-5e-9*(cutTop+brakeTop)
    smallest=Math.min(smallest,gap)
  }
  expect(bound).toBeLessThanOrEqual(smallest)
  expect(smallest-bound).toBeLessThan(.00002)
  expect(bound).toBeGreaterThan(.1)
  expect(sharedReferenceGap(430000,22000,196200,10000,1e6,ref,ec,t)).toBeLessThan(0)
  expect(operatingErrors({vsaOnMotorBus:false,brakeOn:{max:52.7},motorCutoff:{min:52.6,max:53.9},coordinationGap:-.01})).toHaveLength(1)
})

test('brake release includes high output swing and rejects the old high-source margin', () => {
  const e=.003725+.00840797902362465, ref={min:2.5-e,nominal:2.5,max:2.5+e}
  const old=brakeReleaseRange(196000,10000,1e6,ref,.0035)
  const revised=brakeReleaseRange(196200,10000,1e6,ref,.0035)
  expect(old.min).toBeLessThan(50.7)
  expect(revised.min).toBeGreaterThan(50.7)
  expect(revised.max).toBeGreaterThan(revised.nominal)
})

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
    'C19: TPS2663x IMON must not have a bypass capacitor (TI section 8.3.9)',
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

test('missing motor inertia stays unknown rather than becoming zero braking energy', () => {
  expect(rotorKineticEnergy(null, 1000)).toBeNull()
  expect(rotorKineticEnergy(0.00027, 1000)).toBeCloseTo(1.48044, 4)
  expect(() => rotorKineticEnergy(undefined, 1000)).toThrow()
  expect(() => rotorKineticEnergy(-1, 1000)).toThrow()
})
