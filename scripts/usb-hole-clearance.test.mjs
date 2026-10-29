import { beforeAll, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { Circuit } from '@tscircuit/core'
import { USB4105_GF_A } from '../imports/USB4105_GF_A'

let holes, pads
beforeAll(async () => {
  const circuit = new Circuit({ platform: { routingDisabled: true, partsEngineDisabled: true } })
  circuit.schematicDisabled = true
  circuit.add(createElement('board', { width: 20, height: 20, schematicDisabled: true },
    createElement(USB4105_GF_A, { name: 'J1', cadModel: undefined })))
  await circuit.renderUntilSettled()
  const json = circuit.getCircuitJson()
  holes = json.filter(row => row.type === 'pcb_hole')
  pads = json.filter(row => row.type === 'pcb_smtpad')
  expect(holes).toHaveLength(2)
  expect(pads).toHaveLength(16)
})

test('actual USB4105 import keeps every copper pad at least 0.20 mm from locating holes', () => {
  for (const hole of holes) for (const pad of pads) {
    const dx = Math.max(Math.abs(hole.x - pad.x) - pad.width / 2, 0)
    const dy = Math.max(Math.abs(hole.y - pad.y) - pad.height / 2, 0)
    expect(Math.hypot(dx, dy) - hole.hole_diameter / 2).toBeGreaterThanOrEqual(0.20)
  }
})

test('clearance repair retains the connector locating-hole diameter and spacing', () => {
  expect(holes.map(h => h.hole_diameter)).toEqual([0.649986, 0.649986])
  expect(Math.abs(holes[0].x - holes[1].x)).toBeCloseTo(5.780024, 6)
  expect(holes[0].y).toBeCloseTo(holes[1].y, 6)
})

test('native generation never relaxes the copper-to-hole rule to fit the footprint', () => {
  const standards = JSON.parse(readFileSync('board-standards.json'))
  expect(standards.fabrication.minimum_copper_to_hole_mm).toBeGreaterThanOrEqual(0.20)
  for (const file of ['scripts/export-kicad-route.mjs', 'scripts/clean-silkscreen.py'])
    expect(readFileSync(file, 'utf8')).not.toMatch(/(?:min_hole_clearance:|m_HoleClearance\s*=\s*pcbnew.FromMM\()\s*0\.13/)
})
