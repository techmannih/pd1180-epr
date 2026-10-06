import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const circuitPath = 'dist/index/circuit.json'
const boardPath = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const fingerprintPath = 'routing/fingerprint.json'
const update = process.argv.includes('--update')
const circuit = JSON.parse(await readFile(circuitPath, 'utf8'))

const componentName = new Map(circuit.filter((row) => row.type === 'source_component').map((row) => [row.source_component_id, row.name]))
const netName = new Map(circuit.filter((row) => row.type === 'source_net').map((row) => [row.source_net_id, row.name]))
const portName = new Map(circuit.filter((row) => row.type === 'source_port').map((row) => [row.source_port_id, `${componentName.get(row.source_component_id)}.${row.pin_number}`]))
const round = (value) => typeof value === 'number' ? Number(value.toFixed(6)) : value
const point = (value) => value ? { x: round(value.x), y: round(value.y) } : null
const placedName = (row) => componentName.get(row.source_component_id) || row.source_component_id || row.pcb_component_id

const normalized = {
  board: circuit.filter((row) => row.type === 'pcb_board').map((row) => ({
    width: row.width,
    height: row.height,
    thickness: row.thickness,
    layers: row.num_layers,
    outline: row.outline?.map(point),
  })),
  components: circuit.filter((row) => row.type === 'source_component').map((row) => ({
    name: row.name,
    supplier: row.supplier_part_numbers?.jlcpcb || [],
    value: row.resistance ?? row.capacitance ?? row.inductance ?? row.value ?? null,
  })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
  ports: circuit.filter((row) => row.type === 'source_port').map((row) => ({
    port: portName.get(row.source_port_id),
    aliases: [...(row.port_hints || [])].sort(),
  })).sort((a, b) => a.port.localeCompare(b.port, undefined, { numeric: true })),
  nets: circuit.filter((row) => row.type === 'source_trace').map((row) => ({
    name: row.name || null,
    ports: (row.connected_source_port_ids || []).map((id) => portName.get(id)).sort(),
    nets: (row.connected_source_net_ids || []).map((id) => netName.get(id)).sort(),
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  placement: circuit.filter((row) => row.type === 'pcb_component').map((row) => ({
    name: placedName(row),
    center: point(row.center),
    rotation: round(row.rotation || 0),
    layer: row.layer,
    width: round(row.width),
    height: round(row.height),
  })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
  pads: circuit.filter((row) => row.type === 'pcb_port').map((row) => ({
    port: portName.get(row.source_port_id),
    x: round(row.x),
    y: round(row.y),
    layers: row.layers || (row.layer ? [row.layer] : []),
  })).sort((a, b) => (a.port || '').localeCompare(b.port || '', undefined, { numeric: true })),
  holes: circuit.filter((row) => row.type === 'pcb_hole').map((row) => ({ x: round(row.x), y: round(row.y), diameter: round(row.hole_diameter), shape: row.hole_shape })).sort((a, b) => a.x - b.x || a.y - b.y),
}

const canonical = JSON.stringify(normalized)
const inputSha256 = createHash('sha256').update(canonical).digest('hex')
const routedBoardSha256 = createHash('sha256').update(await readFile(boardPath)).digest('hex')
const result = {
  schema_version: 1,
  algorithm: 'sha256 of normalized topology, supplier identity, footprint geometry and placement; plus reviewed KiCad board hash',
  input_sha256: inputSha256,
  routed_board_sha256: routedBoardSha256,
  counts: Object.fromEntries(Object.entries(normalized).map(([name, rows]) => [name, rows.length])),
}

if (update) {
  await writeFile(fingerprintPath, `${JSON.stringify({ ...result, reviewed_at: new Date().toISOString() }, null, 2)}\n`)
  console.log(`Updated ${fingerprintPath}: ${inputSha256}`)
} else {
  const expected = JSON.parse(await readFile(fingerprintPath, 'utf8'))
  const errors = []
  if (expected.input_sha256 !== inputSha256) errors.push('Topology/footprint/placement fingerprint changed; review and regenerate routing before updating the fingerprint')
  if (expected.routed_board_sha256 !== routedBoardSha256) errors.push('Final KiCad board changed after routing review; rerun DRC/power checks and update the fingerprint intentionally')
  console.log(JSON.stringify({ ...result, expected_input_sha256: expected.input_sha256, expected_routed_board_sha256: expected.routed_board_sha256, errors }, null, 2))
  if (errors.length) process.exitCode = 1
}
