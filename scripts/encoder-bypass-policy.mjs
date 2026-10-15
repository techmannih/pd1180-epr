// The sole opposite-side bypass exception. Native copper is independently
// measured; this checks source connectivity, exact via and physical length.
export function encoderBypass({ ic, pin, cap, start, end, trace, vias, thickness, transition }) {
  const fail = { allowed: false, length_mm: null }
  if (ic !== 'U18' || pin !== 11 || cap !== 'C52' || start !== 'bottom' || end !== 'top' ||
      thickness !== 1.6 || JSON.stringify(transition) !== JSON.stringify({
        from: 'bottom', to: 'top', source_xy_mm: [-0.6, -3.9], native_xy_mm: [99.4, 103.9],
        pad_mm: 0.6, drill_mm: 0.3, barrel_mm: 1.6, maximum_vias: 1,
      }) || vias.length !== 1) return fail
  const via = vias[0], near = (a, b) => Number.isFinite(a) && Math.abs(a-b) < 1e-6
  if (!near(via.x, -0.6) || !near(via.y, -3.9) || !near(via.outer_diameter, 0.6) ||
      !near(via.hole_diameter, 0.3) || via.from_layer !== 'bottom' || via.to_layer !== 'top' ||
      [...via.layers].sort().join() !== ['bottom','inner1','inner2','top'].join()) return fail
  const route = trace?.route || [], changes = route.filter(p => p.route_type === 'via')
  if (changes.length !== 1 || changes[0].from_layer !== 'bottom' || changes[0].to_layer !== 'top' ||
      !near(changes[0].x, via.x) || !near(changes[0].y, via.y)) return fail
  let length = thickness
  for (let i = 1; i < route.length; i++) length += Math.hypot(route[i].x-route[i-1].x, route[i].y-route[i-1].y)
  return { allowed: Number.isFinite(length) && length <= 5, length_mm: length }
}
