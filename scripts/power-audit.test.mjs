import { test, expect } from 'bun:test'
import { rmsCurrent, dividerRange, operatingErrors, supplyIsolationErrors, inductanceHenries } from './power-audit.mjs'

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
