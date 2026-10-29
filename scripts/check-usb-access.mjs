import { readFile, writeFile } from 'node:fs/promises'
import { parseNative, field, digest } from './native-eco-policy.mjs'
import { kicadPadPosition } from './power-copper-geometry.mjs'
import { checkCopperToBoardEdgeClearance } from '@tscircuit/checks'

// Intentional shell/courtyard overhang must never exempt the electrical lands.
export function usbCopperEdgeErrors(circuit, minimumClearance = 0.2) {
  const ids = new Set(circuit.filter(row => row.type === 'source_component' && ['J1', 'J10'].includes(row.name)).map(row => row.source_component_id))
  const placements = circuit.filter(row => row.type === 'pcb_component' && ids.has(row.source_component_id))
  const pcbIds = new Set(placements.map(row => row.pcb_component_id))
  const checked = circuit.filter(row => row.type === 'pcb_board' || ids.has(row.source_component_id) || pcbIds.has(row.pcb_component_id)).map(row => {
    if (row.type === 'pcb_component') return { ...row, is_allowed_to_be_off_board: false }
    if (row.type === 'pcb_board') return { ...row, min_board_edge_clearance: minimumClearance }
    return row
  })
  return checkCopperToBoardEdgeClearance(checked)
}

// GCT USB4105 rev B4: front shell-stake centre to mating face = 2.60 mm.
// Check the physical land datum, independently of the generic preview model.
export function usbAccess(circuit, board, assembly) {
  const errors = usbCopperEdgeErrors(circuit).map(error => error.message), ports = []
  const pcb = circuit.find(x => x.type === 'pcb_board')
  const edge = Math.min(...pcb.outline.map(p => p.x))
  for (const [reference, y] of [['J1', 15], ['J10', 1]]) {
    const component = circuit.find(x => x.type === 'source_component' && x.name === reference)
    const placement = circuit.find(x => x.type === 'pcb_component' && x.source_component_id === component?.source_component_id)
    const footprint = board.find(x => x[0] === 'footprint' && x.some(v => v[0] === 'property' && v[1] === '"Reference"' && v[2] === JSON.stringify(reference)))
    if (!placement || !footprint) { errors.push(`${reference}: missing USB footprint`); continue }
    // The imported footprint bounding-box centre is 0.4249991 mm outward
    // from the TSX pcbX origin (-38 mm).
    if (Math.abs(placement.center.x + 38.4249991) > 0.001 || Math.abs(placement.center.y - y) > 0.001 || placement.rotation !== 270)
      errors.push(`${reference}: USB must face outward at the reviewed edge position`)
    const at = field(footprint, 'at').slice(1).map(Number)
    const stakes = ['3', '4'].map(number => {
      const p = footprint.find(x => x[0] === 'pad' && x[1] === JSON.stringify(number))
      const local = field(p, 'at').slice(1, 3).map(Number)
      return kicadPadPosition(...at.slice(0, 2), ...local, at[2] || 0)
    })
    const face = (stakes[0].x + stakes[1].x) / 2 - 100 - 2.6
    const centreY = 100 - (stakes[0].y + stakes[1].y) / 2
    const overhang = edge - face
    if (Math.abs(centreY - y) > 0.001 || overhang < 0.25 || overhang > 0.35)
      errors.push(`${reference}: native mating face is recessed or differs from source placement`)
    ports.push({ reference, pcb_edge_x_mm: edge, mating_face_x_mm: face,
      nominal_face_overhang_mm: overhang,
      minimum_plug_shoulder_to_pcb_edge_mm: overhang + 1.85 })
  }
  // Drawing envelope only: 6.5 mm high plug around a centre 1.73 mm above PCB.
  // The 19.5 mm preview motor gap is explicitly not an approved mounting stack.
  const plugBottom = pcb.thickness / 2 + 1.73 - 6.5 / 2
  const motorRear = -pcb.thickness / 2 - assembly.mount.pcb_bottom_to_motor_rear_mm
  const gap = plugBottom - motorRear
  if (!Number.isFinite(gap) || gap <= 0) errors.push('Nominal plug envelope intersects the motor rear')
  return { ports, nominal_plug_bottom_to_motor_rear_mm: gap,
    source: 'https://gct.co/files/drawings/usb4105.pdf', drawing_revision: 'B4',
    limitations: 'Nominal land/drawing envelope check. Generic 3D model offset is preserved. Actual cable, placement/PCB tolerances, enclosure and mounting remain physically unqualified.',
    physical_fit_qualified: false, errors }
}
if (import.meta.main) {
  const boardBytes = await readFile('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb')
  const sourceBytes = await readFile('dist/index/circuit.json')
  const report = usbAccess(JSON.parse(sourceBytes), parseNative(boardBytes.toString()), JSON.parse(await readFile('engineering/mechanical/assembly.json')))
  await writeFile('docs/usb-access-check.json', JSON.stringify({ ...report, board_sha256: digest(boardBytes), source_sha256: digest(sourceBytes) }, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
  if (report.errors.length) process.exitCode = 1
}
