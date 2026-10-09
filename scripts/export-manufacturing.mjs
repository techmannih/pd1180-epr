import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'

const run = promisify(execFile)
const boardPathArg = process.argv[2]
const projectPathArg = process.argv[3]
if (!boardPathArg || !projectPathArg) throw new Error('Usage: bun scripts/export-manufacturing.mjs <routed.kicad_pcb> <kicad-project-directory>')
const kicad = process.env.KICAD_CLI || 'kicad-cli'
const out = 'dist/manufacturing'
const boardPath = resolve(boardPathArg)
const projectPath = resolve(projectPathArg)
const outputPath = resolve(out)
const isWithin = (candidate, directory) => {
  const pathFromDirectory = relative(directory, candidate)
  return pathFromDirectory === '' || (!pathFromDirectory.startsWith('..') && !isAbsolute(pathFromDirectory))
}
if (isWithin(boardPath, outputPath) || isWithin(projectPath, outputPath)) {
  throw new Error('Manufacturing inputs must be outside dist/manufacturing because that directory is recreated during export')
}
const gerbers = join(out, 'gerbers')
const project = join(out, 'kicad-project')
const boardBase = basename(boardPath, extname(boardPath))
const sourceProject = join(dirname(boardPath), `${boardBase}.kicad_pro`)
await Promise.all([access(boardPath), access(sourceProject), access(projectPath)])
await rm(out, { recursive: true, force: true })
await Promise.all([mkdir(gerbers, { recursive: true }), mkdir(project, { recursive: true }), mkdir('previews', { recursive: true })])

const finalBoard = join(project, `${boardBase}.kicad_pcb`)
const finalSchematic = join(project, `${boardBase}.kicad_sch`)
await copyFile(boardPath, finalBoard)
await copyFile(sourceProject, join(project, `${boardBase}.kicad_pro`))
for (const file of await readdir(projectPath)) {
  if (/\.kicad_(sch|pro)$/.test(file)) await copyFile(join(projectPath, file), join(project, file))
}
await access(finalSchematic)
await run(kicad, [
  'pcb', 'drc',
  '--all-track-errors',
  '--schematic-parity',
  '--severity-all',
  '--exit-code-violations',
  '--refill-zones',
  '--save-board',
  '--format', 'json',
  '--output', join(out, 'kicad-drc.json'),
  finalBoard,
])
await run(kicad, [
  'sch', 'erc',
  '--severity-all',
  '--exit-code-violations',
  '--format', 'json',
  '--output', join(out, 'kicad-erc.json'),
  finalSchematic,
])
await run(kicad, ['pcb', 'export', 'gerbers', '--output', `${gerbers}/`, '--layers', 'F.Cu,In1.Cu,In2.Cu,B.Cu,F.Paste,B.Paste,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts', '--subtract-soldermask', '--check-zones', finalBoard])
await run(kicad, ['pcb', 'export', 'drill', '--output', `${gerbers}/`, '--excellon-units', 'mm', '--excellon-separate-th', '--generate-map', '--map-format', 'gerberx2', '--generate-report', '--report-path', join(out, 'drill-report.txt'), finalBoard])
await run(kicad, ['pcb', 'export', 'pos', '--output', join(out, 'kicad-front-positions.csv'), '--side', 'front', '--format', 'csv', '--units', 'mm', finalBoard])
await run(kicad, ['pcb', 'export', 'pos', '--output', join(out, 'kicad-back-positions.csv'), '--side', 'back', '--format', 'csv', '--units', 'mm', finalBoard])
await run(kicad, ['pcb', 'render', '--output', join(out, 'kicad-board.png'), '--width', '1800', '--height', '1800', '--side', 'top', '--background', 'opaque', '--quality', 'high', '--perspective', '--zoom', '0.68', '--rotate', '325,0,35', finalBoard])
await run(kicad, ['pcb', 'render', '--output', join(out, 'kicad-board-bottom.png'), '--width', '1800', '--height', '1800', '--side', 'bottom', '--background', 'opaque', '--quality', 'high', '--perspective', '--zoom', '0.68', '--rotate', '325,0,35', finalBoard])
await Promise.all([
  copyFile(join(out, 'kicad-board.png'), 'previews/pd1180-epr-top.png'),
  copyFile(join(out, 'kicad-board-bottom.png'), 'previews/pd1180-epr-bottom.png'),
  copyFile(join(out, 'kicad-board.png'), 'previews/pd1180-epr-overview.png'),
])
for (const file of await readdir(project)) {
  if (file.endsWith('.kicad_prl')) await rm(join(project, file), { force: true })
}
await Promise.all([
  copyFile('dist/assembly-review/assembly-bom.csv', join(out, 'assembly-bom.csv')),
  copyFile('dist/assembly-review/assembly-cpl.csv', join(out, 'assembly-cpl.csv')),
])

const drc = JSON.parse(await readFile(join(out, 'kicad-drc.json',), 'utf8'))
const erc = JSON.parse(await readFile(join(out, 'kicad-erc.json'), 'utf8'))
if (!Array.isArray(erc.sheets)) throw new Error('KiCad ERC report is missing its sheets array')
const ercViolations = erc.sheets.flatMap((sheet) => {
  if (!Array.isArray(sheet.violations)) throw new Error(`KiCad ERC sheet ${sheet.path || '<unknown>'} is missing its violations array`)
  return sheet.violations
})
if (ercViolations.length) throw new Error(`KiCad ERC contains ${ercViolations.length} violations`)
const counts = {}
for (const item of drc.violations || []) counts[item.type] = (counts[item.type] || 0) + 1
const ercCounts = {}
for (const item of ercViolations) ercCounts[item.type] = (ercCounts[item.type] || 0) + 1
const report = {
  generated_at: new Date().toISOString(),
  source_board: basename(boardPath),
  gerber_files: (await readdir(gerbers)).sort(),
  unconnected_items: (drc.unconnected_items || []).length,
  schematic_parity_issues: (drc.schematic_parity || []).length,
  violation_counts: counts,
  schematic_erc_violations: ercViolations.length,
  schematic_erc_violation_counts: ercCounts,
}
await writeFile(join(out, 'manufacturing-report.json'), `${JSON.stringify(report, null, 2)}\n`)

const zip = new JSZip()
async function addDirectory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await addDirectory(path, `${prefix}${entry.name}/`)
    else zip.file(`${prefix}${entry.name}`, await readFile(path))
  }
}
await addDirectory(out)
await writeFile(`dist/${boardBase}-manufacturing.zip`, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
console.log(JSON.stringify(report, null, 2))
