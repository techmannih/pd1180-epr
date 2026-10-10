import { expect, test } from 'bun:test'
import { corridorCoverage, isDrainThermalTie, kicadPadPosition } from './power-copper-geometry.mjs'

test('rotated drain-pad coordinates match native KiCad, including quarter turns', () => {
  // Native pcbnew.GetPosition() for the CSD19534Q5A drain pad, local (0, -0.649986).
  expect(kicadPadPosition(113, 91, 0, -0.649986, 90)).toEqual({ x: 112.350014, y: 91 })
  expect(kicadPadPosition(113, 97, 0, -0.649986, -90)).toEqual({ x: 113.649986, y: 97 })
  expect(kicadPadPosition(92, 67, 0, -0.649986, 0)).toEqual({ x: 92, y: 66.350014 })
})

const segment = (start, end) => ({ start: [start, 0], end: [end, 0], net: 'MOTOR', layer: 'F.Cu' })
const zone = (start, end, net = 'MOTOR', layer = 'F.Cu') => ({ net, layer, points: [[start, -1], [end, -1], [end, 1], [start, 1]] })

test('coverage is invariant under trace splitting and overlapping zone counts', () => {
  const zones = [zone(0, 4), zone(2, 8)]
  const whole = corridorCoverage([segment(0, 10)], zones)
  const split = corridorCoverage([segment(0, 3), segment(3, 7), segment(7, 10)], zones)
  expect(whole.ratio).toBeCloseTo(0.8)
  expect(split).toEqual(whole)
})

test('unrelated zones cannot count as power reinforcement', () => {
  expect(corridorCoverage([segment(0, 10)], [zone(20, 30), zone(0, 10, 'GND'), zone(0, 10, 'MOTOR', 'B.Cu')]).covered).toBe(0)
})

test('short via ties outside a drain pad are not thermal-pad ties', () => {
  const pads = [{ x: 10, y: 10, net: 'MOTOR' }]
  expect(isDrainThermalTie([9.5, 9.5], [10.5, 9.5], 'MOTOR', pads)).toBe(true)
  expect(isDrainThermalTie([19.5, 9.5], [20.5, 9.5], 'MOTOR', pads)).toBe(false)
  expect(isDrainThermalTie([9.5, 9.5], [10.5, 9.5], 'GND', pads)).toBe(false)
})
