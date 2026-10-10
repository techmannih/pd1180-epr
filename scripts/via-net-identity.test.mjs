import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { kicadPadPosition } from './power-copper-geometry.mjs'

const board = readFileSync(new URL('../dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', import.meta.url), 'utf8')
const standards = JSON.parse(readFileSync(new URL('../board-standards.json', import.meta.url), 'utf8'))
const policy = standards.fabrication.thermal_via_in_pad

function forms(source, name) {
  const found = []
  const needle = `\n\t(${name}`
  let cursor = 0
  while (true) {
    const offset = source.indexOf(needle, cursor)
    if (offset < 0) break
    const start = offset + 2
    let depth = 0
    let quoted = false
    let escaped = false
    for (let index = start; index < source.length; index++) {
      const char = source[index]
      if (quoted) {
        if (escaped) escaped = false
        else if (char === '\\') escaped = true
        else if (char === '"') quoted = false
      } else if (char === '"') quoted = true
      else if (char === '(') depth++
      else if (char === ')' && --depth === 0) {
        found.push(source.slice(start, index + 1))
        cursor = index + 1
        break
      }
    }
  }
  return found
}

function footprintPad(footprint, padNumber) {
  const reference = footprint.match(/\(property "Reference" "([^"]+)"/)?.[1]
  const footprintAt = footprint.match(/\n\t\t\(at ([-0-9.]+) ([-0-9.]+)(?: ([-0-9.]+))?\)/)
  const padStart = footprint.indexOf(`(pad "${padNumber}"`)
  const padSource = padStart >= 0 ? footprint.slice(padStart) : ''
  const padAt = padSource.match(/\(at ([-0-9.]+) ([-0-9.]+)(?: ([-0-9.]+))?\)/)
  const net = padSource.match(/\(net "([^"]+)"\)/)?.[1]
  if (!reference || !footprintAt || !padAt || !net) return null
  const [fx, fy] = footprintAt.slice(1, 3).map(Number)
  const angle = Number(footprintAt[3] || 0)
  const [px, py] = padAt.slice(1, 3).map(Number)
  return {
    reference,
    net,
    ...kicadPadPosition(fx, fy, px, py, angle),
  }
}

const vias = forms(board, 'via').map((form) => ({
  x: Number(form.match(/\(at ([-0-9.]+) ([-0-9.]+)\)/)?.[1]),
  y: Number(form.match(/\(at ([-0-9.]+) ([-0-9.]+)\)/)?.[2]),
  size: Number(form.match(/\(size ([0-9.]+)\)/)?.[1]),
  drill: Number(form.match(/\(drill ([0-9.]+)\)/)?.[1]),
  layers: form.match(/\(layers "([^"]+)" "([^"]+)"\)/)?.slice(1),
  net: form.match(/\(net "([^"]+)"\)/)?.[1],
}))

test('the final KiCad board has four filled/capped drain thermal vias per power MOSFET', () => {
  const footprints = forms(board, 'footprint')
  const pads = footprints
    .filter((form) => form.startsWith(`(footprint "${policy.footprint}"`))
    .map((form) => footprintPad(form, policy.pad_number))
    .filter(Boolean)
  expect(pads.map((pad) => pad.reference).sort()).toEqual([...policy.references].sort())
  let total = 0
  for (const pad of pads) {
    const thermalVias = vias.filter((via) => Math.abs(via.x - pad.x) < 0.8 && Math.abs(via.y - pad.y) < 0.8)
    expect(thermalVias.length).toBe(policy.vias_per_pad)
    total += thermalVias.length
    for (const via of thermalVias) {
      expect(via.net).toBe(pad.net)
      expect(via.size).toBeCloseTo(policy.pad_mm, 3)
      expect(via.drill).toBeCloseTo(policy.drill_mm, 3)
      expect(via.layers).toEqual(['F.Cu', 'B.Cu'])
    }
  }
  expect(total).toBe(policy.total_count)
})


test('every routed via and CAD default respects the required 0.30 mm minimum drill', () => {
  const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)))
  const standards = read('../board-standards.json')
  const source = read('../dist/index/circuit.json').find(row => row.type === 'pcb_board')
  const project = read('../dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pro')
  expect(standards.fabrication.minimum_via_drill_mm).toBe(0.3)
  expect(source.min_via_hole_diameter).toBeGreaterThanOrEqual(0.3)
  expect(project.board.design_settings.rules.min_through_hole_diameter).toBeGreaterThanOrEqual(0.3)
  expect(vias.length).toBeGreaterThan(0)
  for (const via of vias) {
    expect(via.drill).toBeGreaterThanOrEqual(0.3)
    expect((via.size - via.drill) / 2).toBeGreaterThanOrEqual(0.1 - 1e-9)
  }
  for (const netclass of project.net_settings.classes) expect(netclass.via_drill).toBeGreaterThanOrEqual(0.3)
  for (const pair of standards.fabrication.via_pairs_mm) expect(pair.drill).toBeGreaterThanOrEqual(0.3)
})
