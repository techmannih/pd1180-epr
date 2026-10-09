import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const report = JSON.parse(await readFile('docs/critical-copper-check.json', 'utf8'))
const hashes = {
  board_sha256: 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb',
  source_sha256: 'dist/index/circuit.json',
  policy_sha256: 'routing/critical-paths.json',
  checker_sha256: 'scripts/critical_copper.py',
}
for (const [field, path] of Object.entries(hashes)) {
  const actual = createHash('sha256').update(await readFile(path)).digest('hex')
  if (report[field] !== actual) throw new Error(`Stale native Kelvin evidence: ${path}; rerun critical_copper.py check`)
}
const policy = JSON.parse(await readFile(hashes.policy_sha256, 'utf8'))
if (!Array.isArray(report.errors) || report.errors.length) throw new Error(`Native Kelvin check failed: ${JSON.stringify(report.errors)}`)
if (JSON.stringify(report.paths.map(p => p.name).sort()) !== JSON.stringify(policy.map(p => p.name).sort())) throw new Error('Native Kelvin evidence omits a required path')
for (const path of report.paths) {
  if (!path.path_preserved || !path.terminal_only_join || !path.segment_uuids?.length) throw new Error(`Unverified Kelvin path: ${path.name}`)
}
console.log(`Verified ${report.paths.length} native Kelvin/analog-return branches against the exact board, source, policy and checker hashes.`)
