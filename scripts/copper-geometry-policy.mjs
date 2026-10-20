import { field } from './native-eco-policy.mjs'

export function copperGeometryErrors(board, project, drc, standards) {
  const errors = []
  const rules = project.board?.design_settings?.rules || {}
  for (const [key, minimum] of [['min_connection', standards.fabrication.minimum_connection_width_mm], ['min_groove_width', standards.fabrication.minimum_groove_width_mm]]) {
    if (!Number.isFinite(minimum) || minimum < .09 || !Number.isFinite(rules[key]) || rules[key] < minimum)
      errors.push(`${key}: disabled or below the manufacturing minimum`)
  }
  for (const key of ['connection_width','copper_sliver'])
    if (project.board?.design_settings?.rule_severities?.[key] === 'ignore' || drc.ignored_checks?.some(c => c.key === key)) errors.push(`${key} checking is ignored`)
  if (!['error','warning'].every(s => drc.included_severities?.includes(s))) errors.push('DRC must include errors and warnings')
  const faults = drc.violations?.filter(v => !['text_height', 'silk_overlap', 'silk_over_copper'].includes(v.type))
  if (!Array.isArray(faults) || faults.length || drc.unconnected_items?.length || drc.schematic_parity?.length) errors.push('Native copper/connection/parity findings remain')
  const power = new Set(standards.routing.critical_power_nets.map(n => JSON.stringify(n)))
  const zones = board.filter(x => Array.isArray(x) && x[0] === 'zone' && power.has(field(x, 'net')?.[1]) && Number(field(x, 'priority')?.[1]) >= 100)
  if (!zones.length) errors.push('Missing consolidated power zones')
  for (const zone of zones) {
    const name = field(zone, 'name')?.[1]
    if (!name?.startsWith('"power:')) errors.push('Legacy segment-by-segment power zone remains')
    const fill = field(zone, 'fill')
    const radius = Number(field(fill || [], 'radius')?.[1])
    const thickness = Number(field(zone, 'min_thickness')?.[1])
    const clearance = Number(field(field(zone, 'connect_pads') || [], 'clearance')?.[1])
    if (field(fill || [], 'smoothing')?.[1] !== 'chamfer' || !Number.isFinite(radius) || radius < standards.routing.power_zone_corner_chamfer_mm) errors.push(`${name}: missing power-corner chamfer`)
    if (!Number.isFinite(thickness) || thickness < standards.routing.power_zone_minimum_fill_width_mm) errors.push(`${name}: insufficient zone fill minimum`)
    if (!Number.isFinite(clearance) || clearance < standards.routing.power_zone_clearance_mm) errors.push(`${name}: insufficient power clearance`)
  }
  return errors
}
