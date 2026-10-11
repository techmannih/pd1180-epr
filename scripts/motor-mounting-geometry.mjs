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
