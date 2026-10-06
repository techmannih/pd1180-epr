import { readFile, writeFile } from 'node:fs/promises'

const boardPath = process.argv[2] || 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const source = await readFile(boardPath, 'utf8')
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

for (const name of powerNets) {
  const netSegments = segments.filter((form) => netName(form) === name)
  const netVias = vias.filter((form) => netName(form) === name)
  const netZones = zones.filter((form) => netName(form) === name)
  const corridors = netZones.filter((form) => Number(form.match(/\(priority (\d+)\)/)?.[1] || 0) >= 100)
  const layers = [...new Set(netSegments.map((form) => form.match(/\(layer "([^"]+)"\)/)?.[1]).filter(Boolean))]
  const corridorRatio = netSegments.length ? corridors.length / netSegments.length : 0
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
    segment_layers: layers,
    reinforced_corridors: corridors.length,
    corridor_coverage_ratio: Number(corridorRatio.toFixed(3)),
    vias: netVias.length,
  }
}

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
  nets,
  errors,
}
await writeFile('docs/power-routing-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
