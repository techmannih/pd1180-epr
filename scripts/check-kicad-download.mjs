// Verify the downloaded native project itself, without repairing or saving it.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { assertReviewDrc } from './silkscreen-review.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = 'pd1180-epr-r0.3'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
export function assertDownloadDrc(report) {
  assertReviewDrc(report, true)
  if (report.violations.some(v => v.severity !== 'warning')) throw new Error('Downloaded project has DRC errors/exclusions')
}
export function nativeDownloadUrl(revision) {
  if (!/^[a-f0-9]{40}$/.test(revision || '')) throw new Error('Use an immutable 40-character Git commit')
  return `https://raw.githubusercontent.com/techmannih/pd1180-epr/${revision}/release/${base}-kicad.zip`
}
async function run(cmd, output) {
  const child = Bun.spawn(cmd, { cwd: root, stdout: 'pipe', stderr: 'pipe' })
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
  await writeFile(output, stdout + stderr)
  return code
}
export async function checkDownload(args) {
  const option = name => args[args.indexOf(name) + 1]
  const download = args.includes('--download'), input = args.includes('--input')
  if (download === input || !args.includes('--output')) throw new Error('Use --download COMMIT or --input ZIP, with --output NEW_DIRECTORY')
  const output = resolve(option('--output'))
  await mkdir(output) // Never overwrite an earlier check or user project.
  let url = null, bytes
  if (download) {
    url = nativeDownloadUrl(option('--download'))
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`)
    bytes = Buffer.from(await response.arrayBuffer())
  } else bytes = await readFile(resolve(option('--input')))
  await writeFile(resolve(output, 'downloaded-kicad.zip'), bytes)
  const expected = await JSZip.loadAsync(await readFile(resolve(root, `release/${base}-kicad.zip`)), { checkCRC32: true })
  const archive = await JSZip.loadAsync(bytes, { checkCRC32: true })
  const project = resolve(output, 'project')
  await mkdir(project)
  const errors = [], hashes = {}
  const names = Object.values(archive.files).filter(f => !f.dir).map(f => f.name).sort()
  const expectedNames = Object.values(expected.files).filter(f => !f.dir).map(f => f.name).sort()
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) errors.push('Archive file list differs from the native release')
  for (const name of names) {
    const entry = archive.file(name)
    if (name !== entry.unsafeOriginalName || !/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error(`Unexpected archive path: ${name}`)
    const data = await entry.async('nodebuffer')
    hashes[name] = sha(data)
    if (!expected.file(name) || sha(await expected.file(name).async('nodebuffer')) !== hashes[name]) errors.push(`Native file mismatch: ${name}`)
    await writeFile(resolve(project, name), data)
  }
  const cli = process.env.KICAD_CLI || Bun.which('kicad-cli') || '/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli'
  const python = process.env.KICAD_PYTHON || '/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/Current/bin/python3'
  const pcb = resolve(project, `${base}.kicad_pcb`)
  const drcFile = resolve(output, 'drc.json'), ercFile = resolve(output, 'erc.json'), policyFile = resolve(output, 'source-rules.json')
  for (const name of [`${base}.kicad_pcb`, `${base}.kicad_pro`, `${base}.kicad_sch`]) {
    if (!hashes[name]) throw new Error(`Native project member missing: ${name}; the generic website export is a different artifact`)
  }
  const version = Bun.spawnSync([cli, '--version']).stdout.toString().trim()
  const commands = [
    [cli, 'pcb', 'drc', '--refill-zones', '--all-track-errors', '--schematic-parity', '--severity-all', '--format', 'json', '-o', drcFile, pcb],
    [cli, 'sch', 'erc', '--severity-all', '--format', 'json', '-o', ercFile, resolve(project, `${base}.kicad_sch`)],
    [python, 'scripts/source_design_rules.py', 'check', pcb, policyFile],
  ]
  for (const [i, cmd] of commands.entries()) if (await run(cmd, resolve(output, `check-${i}.log`))) errors.push(`Check ${i} did not complete successfully; see its log`)
  const drc = JSON.parse(await readFile(drcFile)), erc = JSON.parse(await readFile(ercFile)), policy = JSON.parse(await readFile(policyFile))
  try { assertDownloadDrc(drc) } catch (error) { errors.push(error.message) }
  const ercFindings = erc.sheets.flatMap(s => s.violations || [])
  if (ercFindings.length) errors.push(`${ercFindings.length} ERC findings`)
  errors.push(...policy.errors)
  for (const [name, hash] of Object.entries(hashes)) if (sha(await readFile(resolve(project, name))) !== hash) errors.push(`Input changed during checks: ${name}`)
  const settings = JSON.parse(await readFile(resolve(project, `${base}.kicad_pro`))).board.design_settings
  const report = {
    checked_at: new Date().toISOString(), download_url: url, archive_sha256: sha(bytes),
    kicad_version: version, file_sha256: hashes, commands,
    drc_errors: drc.violations.filter(v => v.severity === 'error').length,
    drc_warnings: drc.violations.filter(v => v.severity === 'warning').length,
    unconnected: drc.unconnected_items.length, schematic_parity: drc.schematic_parity.length,
    erc_findings: ercFindings.length, source_rules: policy,
    ignored_drc_tests: Object.entries(settings.rule_severities).filter(([, v]) => v === 'ignore').map(([k]) => k),
    explicit_drc_exclusions: settings.drc_exclusions, errors,
    status: errors.length ? 'fail' : 'native-project-verified-with-retained-cosmetic-warnings',
    generic_website_export_fixed: false, hardware_qualified: false,
  }
  await writeFile(resolve(output, 'result.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ ...report, file_sha256: undefined, commands: undefined, source_rules: undefined }, null, 2))
  if (errors.length) throw new Error('Downloaded project verification failed; see result.json')
  return report
}
if (import.meta.main) await checkDownload(process.argv.slice(2))
