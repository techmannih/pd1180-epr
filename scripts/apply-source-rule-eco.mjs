// Reproduce the reviewed copper-only correction from its exact native baseline.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import JSZip from 'jszip'
import { resolve, basename, join } from 'node:path'
import { parseNative, uuid, digest } from './native-eco-policy.mjs'
const [input, output] = process.argv.slice(2)
if (!input || !output) throw new Error('Usage: bun scripts/apply-source-rule-eco.mjs BASELINE.kicad_pcb NEW_OUTPUT_DIRECTORY; then refill/check with KiCad')
const eco = JSON.parse(await readFile('engineering/source-design-rule-eco.json'))
const bytes = await readFile(input), pro = await readFile(input.replace(/\.kicad_pcb$/, '.kicad_pro'))
if (digest(bytes) !== eco.baseline_board_sha256 || digest(pro) !== eco.baseline_project_sha256) throw new Error('Wrong baseline PCB/project; refusing to replay copper changes')
const archive = await readFile(eco.delta_archive)
if (digest(archive) !== eco.delta_archive_sha256) throw new Error('ECO archive checksum mismatch')
const zip = await JSZip.loadAsync(archive, {checkCRC32:true})
const payload = await zip.file(eco.delta_entry)?.async('nodebuffer')
if (!payload) throw new Error('ECO archive payload missing')
if (digest(payload) !== eco.delta_sha256) throw new Error('ECO payload checksum mismatch')
const delta = JSON.parse(payload), modified = new Map(delta.modified.map(r => [r.uuid, r])), removed = new Map(delta.removed.map(r => [r.uuid, r])), seen = new Set()
const strip = x => x[0] === 'zone' ? x.filter(v => !Array.isArray(v) || v[0] !== 'filled_polygon') : x
const board = parseNative(bytes.toString()).map(strip).map(x => {
  if (!Array.isArray(x)) return x
  const id = uuid(x), change = modified.get(id) || removed.get(id)
  if (!change) return x
  if (!['segment', 'arc', 'via', 'zone'].includes(x[0]) || digest(x) !== change.before_sha256) throw new Error('Unreviewed baseline object: ' + id)
  seen.add(id); return change.after || null
}).filter(x => x !== null)
if (seen.size !== modified.size + removed.size) throw new Error('Missing baseline copper')
board.push(...delta.added)
if (digest(board.map(JSON.stringify).sort()) !== eco.canonical_unfilled_sha256) throw new Error('Reproduced geometry differs from the reviewed ECO')
const serialize = x => Array.isArray(x) ? '(' + x.map(serialize).join(' ') + ')' : x
// Preserve the native filename so its paired project settings load in KiCad.
await mkdir(resolve(output), {recursive:false})
const path = join(resolve(output), basename(input))
await writeFile(path, serialize(board) + '\n', {flag:'wx'})
await writeFile(path.replace(/\.kicad_pcb$/, '.kicad_pro'), JSON.stringify(eco.project, null, 2) + '\n', {flag:'wx'})
console.log(`Reproduced exact reviewed unfilled copper: ${path}. Refill zones and run native DRC before use.`)
