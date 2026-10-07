import { readFile, writeFile } from 'node:fs/promises'

const boardPath = process.argv[2] || 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const source = await readFile(boardPath, 'utf8')
const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const powerNets = [
  'USB_VBUS', 'EFUSE_IN', 'VMOTOR',
  'MOTOR_A1', 'MOTOR_A2', 'MOTOR_B1', 'MOTOR_B2',
  'SENSE_A', 'SENSE_B', 'BRAKE_RETURN',
]

function forms(name) {
  const results = []
  const needle = `\n\t(${name}`
  let cursor = 0
  while (true) {
    const found = source.indexOf(needle, cursor)
    if (found < 0) break
    const start = found + 2
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
        results.push(source.slice(start, index + 1))
        cursor = index + 1
        break
      }
    }
  }
  return results
}

const netName = (form) => form.match(/\(net "([^"]+)"\)/)?.[1]
const segments = forms('segment')
const vias = forms('via')
const zones = forms('zone')
const errors = []
const nets = {}

const parsedVias = vias.map((form) => ({
  x: Number(form.match(/\(at ([-0-9.]+) ([-0-9.]+)\)/)?.[1]),
  y: Number(form.match(/\(at ([-0-9.]+) ([-0-9.]+)\)/)?.[2]),
  size: Number(form.match(/\(size ([0-9.]+)\)/)?.[1]),
  drill: Number(form.match(/\(drill ([0-9.]+)\)/)?.[1]),
  net: netName(form),
}))
function isThermalTie(form, name) {
  if (form.match(/\(layer "([^"]+)"\)/)?.[1] !== 'B.Cu') return false
  if (Math.abs(Number(form.match(/\(width ([0-9.]+)\)/)?.[1]) - 0.25) > 0.001) return false
  const start = form.match(/\(start ([-0-9.]+) ([-0-9.]+)\)/)?.slice(1).map(Number)
  const end = form.match(/\(end ([-0-9.]+) ([-0-9.]+)\)/)?.slice(1).map(Number)
  if (!start || !end || Math.abs(Math.hypot(end[0] - start[0], end[1] - start[1]) - 1) > 0.002) return false
  return [start, end].every(([x, y]) => parsedVias.some((via) => via.net === name && Math.hypot(via.x - x, via.y - y) < 0.002 && Math.abs(via.size - 0.6) < 0.001 && Math.abs(via.drill - 0.3) < 0.001))
}

let thermalTieTotal = 0

for (const name of powerNets) {
  const netSegments = segments.filter((form) => netName(form) === name)
  const thermalTieSegments = netSegments.filter((form) => isThermalTie(form, name))
  const corridorSegments = netSegments.filter((form) => !thermalTieSegments.includes(form))
  thermalTieTotal += thermalTieSegments.length
  const netVias = vias.filter((form) => netName(form) === name)
  const netZones = zones.filter((form) => netName(form) === name)
  const corridors = netZones.filter((form) => Number(form.match(/\(priority (\d+)\)/)?.[1] || 0) >= 100)
  const layers = [...new Set(netSegments.map((form) => form.match(/\(layer "([^"]+)"\)/)?.[1]).filter(Boolean))]
  const corridorRatio = corridorSegments.length ? corridors.length / corridorSegments.length : 0
  const badClearance = corridors.filter((form) => Number(form.match(/\(clearance ([0-9.]+)\)/)?.[1] || 0) < 0.16)
  const badWidth = corridors.filter((form) => {
    const points = [...form.matchAll(/\(xy ([0-9.-]+) ([0-9.-]+)\)/g)].map((match) => [Number(match[1]), Number(match[2])])
    if (!points.length) return true
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)
    return Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) < 2.39
  })
  if (corridorRatio < 0.75) errors.push(`${name}: only ${(corridorRatio * 100).toFixed(1)}% of routed segments have power corridors`)
  if (badClearance.length) errors.push(`${name}: ${badClearance.length} generated zones have less than 0.16 mm clearance`)
  if (badWidth.length) errors.push(`${name}: ${badWidth.length} generated zones are narrower than 2.4 mm`)
  if (layers.length > 1 && netVias.length < 4) errors.push(`${name}: multilayer route has only ${netVias.length} vias`)
  nets[name] = {
    routed_segments: netSegments.length,
    thermal_via_tie_segments: thermalTieSegments.length,
    corridor_eligible_segments: corridorSegments.length,
    segment_layers: layers,
    reinforced_corridors: corridors.length,
    corridor_coverage_ratio: Number(corridorRatio.toFixed(3)),
    vias: netVias.length,
  }
}
if (thermalTieTotal !== standards.fabrication.thermal_via_in_pad.total_count) errors.push(`Expected ${standards.fabrication.thermal_via_in_pad.total_count} thermal via-to-via tie segments, found ${thermalTieTotal}`)

// IPC-2221 external-layer estimate at 20 C rise for 2.4 mm x 35 um copper.
const areaMil2 = (2.4 / 0.0254) * (0.035 / 0.0254)
const estimatedCurrentA = 0.048 * (20 ** 0.44) * (areaMil2 ** 0.725)
if (estimatedCurrentA < 5.5) errors.push(`2.4 mm / 1 oz corridor estimate is only ${estimatedCurrentA.toFixed(2)} A`)

const report = {
  board: boardPath,
  fabrication_basis: {
    layers: 4,
    finished_thickness_mm: 1.6,
    copper_oz: 1,
    signal_minimum_mm: 0.09,
    power_corridor_nominal_width_mm: 2.4,
    power_corridor_clearance_mm: 0.16,
    parallel_via_size_mm: 0.6,
    parallel_via_drill_mm: 0.3,
  },
  ipc_2221_external_estimate: {
    temperature_rise_c: 20,
    current_a: Number(estimatedCurrentA.toFixed(2)),
    note: 'Analytical screening only; inner-layer sharing, clipped geometry, connectors, and thermal environment require prototype validation.',
  },
  thermal_via_tie_segments: thermalTieTotal,
  nets,
  errors,
}
await writeFile('docs/power-routing-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
