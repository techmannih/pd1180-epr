import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { basename, dirname, extname, join } from 'node:path'
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'

const run = promisify(execFile)
const boardPath = process.argv[2]
const projectPath = process.argv[3]
if (!boardPath || !projectPath) throw new Error('Usage: bun scripts/export-manufacturing.mjs <routed.kicad_pcb> <kicad-project-directory>')
const kicad = process.env.KICAD_CLI || 'kicad-cli'
const out = 'dist/manufacturing'
const gerbers = join(out, 'gerbers')
const project = join(out, 'kicad-project')
const boardBase = basename(boardPath, extname(boardPath))
await rm(out, { recursive: true, force: true })
await Promise.all([mkdir(gerbers, { recursive: true }), mkdir(project, { recursive: true })])

const finalBoard = join(project, `${boardBase}.kicad_pcb`)
await copyFile(boardPath, finalBoard)
const sourceProject = join(dirname(boardPath), `${basename(boardPath, extname(boardPath))}.kicad_pro`)
await copyFile(sourceProject, join(project, `${boardBase}.kicad_pro`))
for (const file of await readdir(projectPath)) {
  if (/\.kicad_(sch|pro)$/.test(file)) await copyFile(join(projectPath, file), join(project, file))
}
await run(kicad, ['pcb', 'export', 'gerbers', '--output', `${gerbers}/`, '--layers', 'F.Cu,In1.Cu,In2.Cu,B.Cu,F.Paste,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts', '--subtract-soldermask', '--check-zones', finalBoard])
await run(kicad, ['pcb', 'export', 'drill', '--output', `${gerbers}/`, '--excellon-units', 'mm', '--excellon-separate-th', '--generate-map', '--map-format', 'gerberx2', '--generate-report', '--report-path', join(out, 'drill-report.txt'), finalBoard])
await run(kicad, ['pcb', 'export', 'pos', '--output', join(out, 'kicad-front-positions.csv'), '--side', 'front', '--format', 'csv', '--units', 'mm', finalBoard])
await run(kicad, ['pcb', 'drc', '--all-track-errors', '--format', 'json', '--output', join(out, 'kicad-drc.json'), finalBoard])
await run(kicad, ['pcb', 'render', '--output', join(out, 'kicad-board.png'), '--width', '1800', '--height', '1800', '--side', 'top', '--background', 'opaque', '--quality', 'high', '--perspective', '--rotate', '325,0,35', finalBoard])
for (const file of await readdir(project)) {
  if (file.endsWith('.kicad_prl')) await rm(join(project, file), { force: true })
}
await Promise.all([
  copyFile('dist/assembly-review/assembly-bom.csv', join(out, 'assembly-bom.csv')),
  copyFile('dist/assembly-review/assembly-cpl.csv', join(out, 'assembly-cpl.csv')),
])

const drc = JSON.parse(await readFile(join(out, 'kicad-drc.json',), 'utf8'))
const counts = {}
for (const item of drc.violations || []) counts[item.type] = (counts[item.type] || 0) + 1
const report = {
  generated_at: new Date().toISOString(),
  source_board: basename(boardPath),
  gerber_files: (await readdir(gerbers)).sort(),
  unconnected_items: (drc.unconnected_items || []).length,
  violation_counts: counts,
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
