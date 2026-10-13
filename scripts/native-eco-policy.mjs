import { createHash } from 'node:crypto'
export const digest = data => createHash('sha256').update(typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data)).digest('hex')
export function parseNative(text) {
  const tokens = text.match(/\(|\)|"(?:\\.|[^"\\])*"|[^\s()]+/g) || []
  let i = 0
  function item() { const t = tokens[i++]; if (t !== '(') return t; const a = []; while (i < tokens.length && tokens[i] !== ')') a.push(item()); if (tokens[i++] !== ')') throw new Error('Unbalanced KiCad file'); return a }
  const value = item(); if (i !== tokens.length || value[0] !== 'kicad_pcb') throw new Error('Invalid KiCad board'); return value
}
export const field = (x, key) => x.find(v => Array.isArray(v) && v[0] === key)
export const uuid = x => field(x, 'uuid')?.[1]
const ref = x => x.find(v => Array.isArray(v) && v[0] === 'property' && v[1] === '"Reference"')?.[2]?.slice(1,-1)
// Strip only derived zone fills. Native DRC and copper checks bind the actual
// refilled board separately. All zone outlines/settings remain protected.
export function protectedProjection(board, policy, baseline = false) {
  const changes = new Map(policy.pad_changes.map(p => [`${p.reference}.${p.pin}`, p]))
  const seen = new Set(), removed = new Set(policy.removed_uuids), additions = new Map(policy.added_objects.map(x => [uuid(x), x]))
  const projected = board.map(x => {
    if (!Array.isArray(x)) return x
    const id = uuid(x)
    if (removed.has(id)) { if (!baseline) throw new Error('Removed SBU copper/island restored'); return null }
    if (additions.has(id)) { if (baseline || digest(x) !== digest(additions.get(id))) throw new Error('Approved ground/trim geometry changed'); seen.add(id); return null }
    if (x[0] === 'zone') return x.filter(v => !Array.isArray(v) || v[0] !== 'filled_polygon')
    if (x[0] !== 'footprint') return x
    const reference = ref(x)
    return x.map(p => {
      if (!Array.isArray(p) || p[0] !== 'pad') return p
      const key = `${reference}.${p[1].slice(1,-1)}`, change = changes.get(key)
      if (!change) return p
      const net = field(p, 'net')?.[1] ?? null
      if (net !== (baseline ? change.before : change.after)) throw new Error(`Unexpected ${key} net`)
      seen.add(key)
      return p.filter(v => !Array.isArray(v) || v[0] !== 'net')
    })
  }).filter(x => x !== null)
  for (const key of changes.keys()) if (!seen.has(key)) throw new Error(`Missing affected pad ${key}`)
  if (!baseline) for (const key of additions.keys()) if (!seen.has(key)) throw new Error('Missing approved ground/trim object')
  // Saving KiCad can reorder top-level objects, so compare a canonical multiset.
  return projected.map(x => JSON.stringify(x)).sort()
}
export function verifyNativeEco(board, policy) {
  if (digest(protectedProjection(board, policy)) !== policy.protected_projection_sha256) throw new Error('Unrelated native geometry, net, footprint, hole or setting changed')
  return true
}
