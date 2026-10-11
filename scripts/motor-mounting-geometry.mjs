// The pinned motor STEP models the four rear cylindrical features as 2 mm-radius
// cylindrical faces. Resolve their axes from BREP entities, not mesh bounds.
export function rearHoleAxes(step) {
  const entities = new Map([...step.matchAll(/#(\d+)\s*=\s*([\s\S]*?);/g)].map(m => [m[1], m[2]]))
  const vector = id => {
    const match = entities.get(id)?.match(/(?:CARTESIAN_POINT|DIRECTION)\s*\([^,]*,\s*\(([^)]+)\)/)
    if (!match) throw new Error(`Missing STEP vector #${id}`)
    return match[1].split(',').map(Number)
  }
  const axes = []
  for (const entity of entities.values()) {
    const cylinder = entity.match(/^CYLINDRICAL_SURFACE\s*\([^,]*,\s*#(\d+),\s*([^ )]+)/)
    if (!cylinder || Math.abs(Number(cylinder[2]) - 2) > 1e-6) continue
    const placement = entities.get(cylinder[1])?.match(/^AXIS2_PLACEMENT_3D\s*\([^,]*,\s*#(\d+),\s*#(\d+)/)
    if (!placement) throw new Error('Rear cylinder has no explicit STEP axis')
    const point = vector(placement[1]), direction = vector(placement[2])
    if (Math.hypot(direction[0], direction[1]) > 1e-6 || Math.abs(Math.abs(direction[2]) - 1) > 1e-6) continue
    const xy = point.slice(0, 2)
    if (!axes.some(p => Math.hypot(p[0] - xy[0], p[1] - xy[1]) < 1e-5)) axes.push(xy)
  }
  if (axes.length !== 4) throw new Error(`Expected four rear bore axes in the pinned motor STEP, found ${axes.length}`)
  return axes.sort((a, b) => a[0] - b[0])
}

export function mountingAlignment(axes, holes, tolerance = 0.01) {
  if (axes.length !== 4 || holes.length !== 4) throw new Error('Mounting requires four motor axes and four PCB holes')
  if (!axes.every(p => p.length === 2 && p.every(Number.isFinite)) ||
      !holes.every(h => [h.x, h.y, h.diameter].every(Number.isFinite)))
    throw new Error('Mounting coordinates and drill diameters must be finite')
  const used = new Set()
  return holes.map(hole => {
    const distances = axes.map(([x, y]) => Math.hypot(x - hole.x, y - hole.y))
    const offset = Math.min(...distances), index = distances.indexOf(offset)
    if (used.has(index) || offset > tolerance || Math.abs(hole.diameter - 4.2) > 0.001)
      throw new Error(`${hole.name}: PCB hole does not match a unique ordered-motor axis and 4.2 mm drill (${offset.toFixed(6)} mm offset)`)
    used.add(index)
    return { name: hole.name, motor_xy_mm: axes[index], pcb_xy_mm: [hole.x, hole.y], axis_offset_mm: offset }
  })
}

// KiCad's committed drill export uses absolute, decimal millimetres. Reject
// other formats instead of interpreting implied-decimal coordinates.
export function readMetricDrills(text) {
  if (!/^METRIC\s*$/m.test(text) || !/^G90\s*$/m.test(text))
    throw new Error('Expected absolute decimal metric drill export')
  const tools = new Map(), drills = []
  let selected
  for (const line of text.split(/\r?\n/)) {
    const tool = line.match(/^T(\d+)C([\d.]+)$/)
    if (tool) tools.set(tool[1], Number(tool[2]))
    const selection = line.match(/^T(\d+)$/)
    if (selection) selected = tools.get(selection[1])
    if (!line.startsWith('X')) continue
    const point = line.match(/^X(-?\d+\.\d+)Y(-?\d+\.\d+)$/)
    if (!point || !Number.isFinite(selected)) throw new Error('Unsupported drill coordinate or missing tool')
    drills.push({ x: Number(point[1]), y: Number(point[2]), diameter: selected })
  }
  return drills
}

export function verifyMountingDrills(drills, holes) {
  return holes.map(hole => {
    // Same (100,100) mm native-board origin used by check-board-standards.
    // Excellon has positive Y upward, unlike KiCad's screen coordinates.
    const expected = { x: 100 + hole.x, y: hole.y - 100 }
    const matches = drills.filter(d => Math.hypot(d.x - expected.x, d.y - expected.y) < .001 && Math.abs(d.diameter - hole.diameter) < .001)
    if (matches.length !== 1) throw new Error(`${hole.name}: missing or duplicated ${hole.diameter} mm manufacturing drill`)
    return { name: hole.name, excellon_xy_mm: [matches[0].x, matches[0].y], diameter_mm: matches[0].diameter }
  })
}

// Inspect the physical substrate triangles, not the rendered hole colour.
// Display coordinates are [-PCB X, height, PCB Y]. A capped or displaced
// opening has a face over its axis and therefore zero radial clearance.
export function meshDrillRadius(triangles, hole) {
  const x = -hole.x, y = hole.y
  let nearest = Infinity
  for (const triangle of triangles) {
    const points = triangle.map(p => [p[0], p[2]])
    let inside = false
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length]
      const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy
      const t = length ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / length)) : 0
      nearest = Math.min(nearest, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy))
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
    }
    if (inside) return 0
  }
  return nearest
}
