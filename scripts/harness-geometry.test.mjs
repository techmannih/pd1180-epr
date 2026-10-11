import { test, expect } from 'bun:test'
import { segmentBoxDistance, cableBoxClearance, segmentDistance, bezier, tube } from './harness-geometry.mjs'
const box = {min:[-1,-1,-1],max:[1,1,1]}
test('detects a cable crossing an obstacle between its sampled endpoints', () => {
  expect(segmentBoxDistance([-4,0,0],[4,0,0],box)).toBe(0)
  expect(cableBoxClearance([[-4,0,0],[4,0,0]],.5,box)).toBe(-.5)
})
test('accounts for wire insulation radius, endpoints and diagonal clearance', () => {
  expect(cableBoxClearance([[-4,2,0],[4,2,0]],.5,box)).toBeCloseTo(.5)
  expect(segmentBoxDistance([2,2,2],[3,3,3],box)).toBeCloseTo(Math.sqrt(3))
  expect(segmentBoxDistance([0,0,0],[0,0,0],box)).toBe(0)
})
test('wire geometry preserves both mating endpoints and finite vertices', () => {
  const path = bezier([[1,2,3],[1,2,9],[10,8,9],[10,8,3]])
  expect(path[0]).toEqual([1,2,3]); expect(path.at(-1)).toEqual([10,8,3])
  const mesh = tube('test',path,1,[0,0,0,1])
  expect(mesh.positions.every(Number.isFinite)).toBe(true)
  expect(Math.max(...mesh.indices)).toBeLessThan(mesh.positions.length/3)
})
test('wire separation catches crossings and overlapping parallel runs', () => {
  expect(segmentDistance([-2,0,0],[2,0,0],[0,-2,0],[0,2,0])).toBe(0)
  expect(segmentDistance([0,0,0],[4,0,0],[1,0,0],[5,0,0])).toBe(0)
  expect(segmentDistance([0,0,0],[4,0,0],[1,2,0],[5,2,0])).toBe(2)
})
