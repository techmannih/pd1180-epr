// Millimetres, PCB coordinates (Z is height). These are nominal assembly
// envelopes; wire bends and molded latch details need supplier/physical review.
export const distance = (a, b) => Math.hypot(...a.map((v, k) => v - b[k]))
const subtract = (a, b) => a.map((v, k) => v - b[k])
const unit = a => a.map(v => v / Math.hypot(...a))
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]

// Serialize nominal mm geometry at 1e-9 mm, far below CAD/measurement precision.
// libm sin/cos/hypot can differ by an ULP on macOS ARM and Linux x64. Keep
// strict byte comparisons after this canonicalization; dimensions, hashes,
// identities and any meaningful change must still invalidate saved evidence.
export function canonicalHarnessGeometry(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite harness geometry')
    return Math.round(value * 1e9) / 1e9;
  }
  if (Array.isArray(value)) return value.map(canonicalHarnessGeometry)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonicalHarnessGeometry(item)]))
  return value
}

export function bezier(control, steps = 32) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, s = 1 - t
    // Fixed cubic products avoid platform-dependent pow rounding in saved paths.
    return control[0].map((_, k) => s*s*s*control[0][k] + 3*s*s*t*control[1][k] + 3*s*t*t*control[2][k] + t*t*t*control[3][k])
  })
}

export function tube(name, points, radius, color, sides = 8) {
  if (points.length < 2 || !(radius > 0) || points.some(p => p.length !== 3 || p.some(v => !Number.isFinite(v)))) throw new Error(`Invalid wire path: ${name}`)
  const positions = [], indices = []
  for (let i = 0; i < points.length; i++) {
    const tangent = unit(subtract(points[Math.min(i + 1, points.length - 1)], points[Math.max(0, i - 1)]))
    const axis = Math.abs(tangent[0]) < .9 ? [1, 0, 0] : [0, 1, 0]
    const u = unit(cross(tangent, axis)), v = cross(tangent, u)
    for (let j = 0; j < sides; j++) {
      const angle = j * Math.PI * 2 / sides
      positions.push(...points[i].map((p, k) => p + radius * (Math.cos(angle)*u[k] + Math.sin(angle)*v[k])))
      if (i) {
        const a = (i-1)*sides+j, b = (i-1)*sides+(j+1)%sides, c = i*sides+j, d = i*sides+(j+1)%sides
        indices.push(a,b,c,b,d,c)
      }
    }
  }
  for (const [ring, reverse] of [[0, true], [(points.length-1)*sides, false]])
    for (let j = 1; j < sides-1; j++) indices.push(ring, ring+(reverse ? j+1 : j), ring+(reverse ? j : j+1))
  return { name, positions, indices, color }
}

export function boundsGap(a, b) {
  return Math.hypot(...[0,1,2].map(k => Math.max(0, a.min[k]-b.max[k], b.min[k]-a.max[k])))
}

// Exact segment-to-box distance via convex piecewise-quadratic minimization.
// Checking endpoints alone misses a cable crossing a component between samples.
export function segmentBoxDistance(a, b, box) {
  const delta = subtract(b, a), cuts = [0,1]
  for (let k = 0; k < 3; k++) if (delta[k]) for (const side of [box.min[k],box.max[k]]) {
    const t = (side-a[k])/delta[k]
    if (t > 0 && t < 1) cuts.push(t)
  }
  cuts.sort((x,y) => x-y)
  const value = t => Math.hypot(...a.map((x,k) => Math.max(0,box.min[k]-x-t*delta[k],x+t*delta[k]-box.max[k])))
  let best = Math.min(value(0),value(1))
  for (let i = 1; i < cuts.length; i++) {
    const lo = cuts[i-1], hi = cuts[i], middle = (lo+hi)/2
    let linear = 0, quadratic = 0
    for (let k=0;k<3;k++) {
      const p = a[k]+middle*delta[k]
      const side = p < box.min[k] ? box.min[k] : p > box.max[k] ? box.max[k] : null
      if (side !== null) { linear += delta[k]*(a[k]-side); quadratic += delta[k]**2 }
    }
    const t = quadratic ? Math.max(lo,Math.min(hi,-linear/quadratic)) : middle
    best = Math.min(best,value(t),value(lo),value(hi))
  }
  return best
}

export function cableBoxClearance(points, radius, box) {
  return Math.min(...points.slice(1).map((p,i) => segmentBoxDistance(points[i],p,box))) - radius
}

export function segmentDistance(a,b,c,d) {
  const u=subtract(b,a),v=subtract(d,c),w=subtract(a,c)
  const dot=(x,y)=>x.reduce((sum,n,k)=>sum+n*y[k],0)
  const A=dot(u,u),B=dot(u,v),C=dot(v,v),D=dot(u,w),E=dot(v,w)
  const clamp=t=>Math.max(0,Math.min(1,t))
  const candidates=[]
  const add=(s,t)=>candidates.push(distance(a.map((x,k)=>x+s*u[k]),c.map((x,k)=>x+t*v[k])))
  add(0,C?clamp(E/C):0);add(1,C?clamp((E+B)/C):0)
  add(A?clamp(-D/A):0,0);add(A?clamp((B-D)/A):0,1)
  const determinant=A*C-B*B
  if(determinant>1e-12) {
    const s=(B*E-C*D)/determinant,t=(A*E-B*D)/determinant
    if(s>=0&&s<=1&&t>=0&&t<=1)add(s,t)
  }
  return Math.min(...candidates)
}
