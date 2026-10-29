import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { digest, field, parseNative, uuid, restorePlacementRevisions } from './native-eco-policy.mjs'

const policyPath = 'routing/power-feed.json'
const nativeBoard = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const stripFill = x => x[0] === 'zone' ? x.filter(v => !Array.isArray(v) || v[0] !== 'filled_polygon') : x
export const canonicalCopper = board => digest(board.map(stripFill).map(JSON.stringify).sort())

export function powerFeedErrors(board, policy) {
  const errors = []
  const expected = new Map(policy.segments.map(s => [uuid(s), s]))
  const added = board.filter(x => Array.isArray(x) && expected.has(uuid(x)))
  if (added.length !== 7 || expected.size !== 7) errors.push('Missing or duplicated parallel VMOTOR feed segment')
  for (const segment of added) {
    if (digest(segment) !== digest(expected.get(uuid(segment)))) errors.push('VMOTOR feed geometry, width, layer or net changed')
    if (segment[0] !== 'segment' || Number(field(segment, 'width')?.[1]) !== 1.5 ||
        field(segment, 'layer')?.[1] !== '"B.Cu"' || field(segment, 'net')?.[1] !== '"VMOTOR"')
      errors.push('Feed must be 1.5 mm native B.Cu VMOTOR tracks')
  }
  // Remove the seven feed additions and restore any separately reviewed,
  // exact USB footprint revision before checking the entire original baseline.
  let original = board.filter(x => !Array.isArray(x) || !expected.has(uuid(x)))
  // A later USB-only ECO must not invalidate the independent motor-feed guard.
  // Restore ONLY exact hash-locked footprints, never arbitrary geometry.
  if (policy.subsequent_geometry_review) {
    try {
      const review = JSON.parse(readFileSync(policy.subsequent_geometry_review))
      const current = new Map(original.filter(Array.isArray).map(x => [uuid(x), x]))
      const changes = review.revision.modified
      if (!changes.every(c => digest(current.get(uuid(c.before))) === digest(c.before)))
        original = restorePlacementRevisions(original, [review.revision])
    } catch { errors.push('USB footprint revision differs from its exact reviewed geometry') }
  }
  if (canonicalCopper(original) !== policy.baseline_canonical_unfilled_sha256)
    errors.push('Unrelated native board geometry changed')
  return errors
}

export function applyPowerFeed(bytes, policy) {
  if (digest(bytes) !== policy.baseline_board_sha256) throw new Error('Wrong baseline PCB; refusing to add the power feed')
  const board = parseNative(bytes.toString())
  board.push(...policy.segments)
  const errors = powerFeedErrors(board, policy)
  if (errors.length) throw new Error(errors.join('\n'))
  const serialize = x => Array.isArray(x) ? '(' + x.map(serialize).join(' ') + ')' : x
  return bytes.toString().trimEnd().slice(0, -1) + '\n' + policy.segments.map(serialize).join('\n') + '\n)\n'
}

if (import.meta.main) {
  const policy = JSON.parse(await readFile(policyPath))
  if (process.argv[2] === '--apply') {
    const [input, directory] = process.argv.slice(3)
    if (!input || !directory) throw new Error('Usage: bun scripts/power-feed.mjs --apply BASELINE.kicad_pcb NEW_DIRECTORY')
    const bytes = await readFile(input)
    const project = await readFile(input.replace(/\.kicad_pcb$/, '.kicad_pro'))
    if (digest(project) !== policy.baseline_project_sha256) throw new Error('Wrong paired project settings')
    const output = applyPowerFeed(bytes, policy)
    await mkdir(directory, {recursive:false})
    const path = join(directory, basename(input))
    await writeFile(path, output, {flag:'wx'})
    await writeFile(path.replace(/\.kicad_pcb$/, '.kicad_pro'), project, {flag:'wx'})
    console.log('Added the seven reviewed feed segments. Refill and run native DRC before use:', path)
  } else {
    const errors = powerFeedErrors(parseNative(await readFile(nativeBoard, 'utf8')), policy)
    if (errors.length) throw new Error(errors.join('\n'))
    console.log('Parallel VMOTOR feed: seven 1.5 mm B.Cu tracks; original baseline preserved after restoring the exact reviewed USB footprint revision.')
  }
}
