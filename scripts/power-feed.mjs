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
  const expected = new Map((policy.architecture_baseline?.segments || policy.segments).map(s => [uuid(s), s]))
  const added = board.filter(x => Array.isArray(x) && expected.has(uuid(x)))
  if (added.length !== expected.size || expected.size !== (policy.architecture_baseline?.segment_count || 7)) errors.push('Missing or duplicated parallel VMOTOR feed segment')
  for (const segment of added) {
    if (digest(segment) !== digest(expected.get(uuid(segment)))) errors.push('VMOTOR feed geometry, width, layer or net changed')
    if (segment[0] !== 'segment' || field(segment, 'net')?.[1] !== '"VMOTOR"' ||
        (policy.architecture_baseline ? Number(field(segment, 'width')?.[1]) < .5 :
          Number(field(segment, 'width')?.[1]) !== 1.5 || field(segment, 'layer')?.[1] !== '"B.Cu"'))
      errors.push('Feed differs from the architecture-specific width/layer policy')
  }
  // Restore exact, separately reviewed later ECOs before comparing the original
  // baseline. The redesigned board uses its own exact geometry baseline.
  let original = board.filter(x => !Array.isArray(x) || !expected.has(uuid(x)))
  for (const reviewPath of (policy.architecture_baseline ? [] : (policy.subsequent_geometry_reviews || [])).toReversed()) {
    try {
      const { revision } = JSON.parse(readFileSync(reviewPath))
      const current = new Map(original.filter(Array.isArray).map(x => [uuid(x), x]))
      if (!revision.modified.every(change => digest(current.get(uuid(change.before))) === digest(change.before)))
        original = restorePlacementRevisions(original, [revision])
    } catch { errors.push('Later placement differs from its exact reviewed geometry') }
  }
  if (policy.architecture_baseline && policy.architecture_baseline.architecture !== 'RP2040_DRV8462DDV')
    errors.push('Unknown power-feed architecture baseline')
  if (canonicalCopper(original) !== (policy.architecture_baseline?.canonical_unfilled_sha256 || policy.baseline_canonical_unfilled_sha256))
    errors.push('Unrelated native board geometry changed')
  return errors
}

export function applyPowerFeed(bytes, policy) {
  if (digest(bytes) !== policy.baseline_board_sha256) throw new Error('Wrong baseline PCB; refusing to add the power feed')
  if (policy.architecture_baseline) throw new Error('Historical feed replay does not apply to the RP2040 architecture')
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
    console.log('VMOTOR feed tracks and all other native geometry match the independently checked architecture baseline; filled-copper resistance and current qualification remain separate.')
  }
}
