const cross = (a, b) => a[0] * b[1] - a[1] * b[0]
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]]

// KiCad file coordinates increase downward; positive footprint rotation is
// counterclockwise on screen, so the local-to-board transform negates it.
export function kicadPadPosition(x, y, px, py, degrees) {
  const angle = degrees * Math.PI / 180
  return { x: x + px * Math.cos(angle) + py * Math.sin(angle), y: y - px * Math.sin(angle) + py * Math.cos(angle) }
}

function inside(point, polygon) {
  let result = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i]
    if (Math.abs(cross(subtract(point, a), subtract(b, a))) < 1e-9 &&
        point.every((value, axis) => value >= Math.min(a[axis], b[axis]) - 1e-9 && value <= Math.max(a[axis], b[axis]) + 1e-9)) return true
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
        point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result
  }
  return result
}

// Length in the union of same-net, same-layer corridor outlines. Splitting a
// trace at a junction must not change its measured reinforcement coverage.
// This measures nominal zone intent, not the minimum width of clipped fills.
export function corridorCoverage(segments, zones) {
  let total = 0, covered = 0
  for (const segment of segments) {
    const { start, end, layer, net } = segment
    const delta = subtract(end, start), length = Math.hypot(...delta)
    const polygons = zones.filter(z => z.layer === layer && z.net === net).map(z => z.points)
    const cuts = [0, 1]
    for (const polygon of polygons) {
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], edge = subtract(polygon[(i + 1) % polygon.length], a)
        const determinant = cross(delta, edge)
        if (Math.abs(determinant) < 1e-12) continue
        const relative = subtract(a, start)
        const t = cross(relative, edge) / determinant, u = cross(relative, delta) / determinant
        if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t)
      }
    }
    cuts.sort((a, b) => a - b)
    total += length
    for (let i = 1; i < cuts.length; i++) {
      const midpoint = (cuts[i - 1] + cuts[i]) / 2
      const p = [start[0] + delta[0] * midpoint, start[1] + delta[1] * midpoint]
      if (polygons.some(polygon => inside(p, polygon))) covered += length * (cuts[i] - cuts[i - 1])
    }
  }
  return { total, covered, ratio: total ? covered / total : 1 }
}

export function isDrainThermalTie(start, end, net, drainPads) {
  return drainPads.some(pad => pad.net === net && [start, end].every(([x, y]) =>
    Math.abs(x - pad.x) < 0.8 && Math.abs(y - pad.y) < 0.8))
}
