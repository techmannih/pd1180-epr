import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { sourceDesignGeometryErrors, sourceDesignPolicyErrors } from './source-design-policy.mjs'
const boardPath = process.argv.slice(2).find(a => !a.startsWith('--')) || 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const project = JSON.parse(await readFile(boardPath.replace(/\.kicad_pcb$/, '.kicad_pro'), 'utf8'))
const compiled = JSON.parse(await readFile('dist/index/circuit.json', 'utf8')).find(r => r.type === 'pcb_board')
const errors = sourceDesignPolicyErrors(await readFile('index.circuit.tsx', 'utf8'), standards, compiled, project)
if (errors.length) throw new Error(errors.join('\n'))
const mac = '/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/Current/bin/python3'
const python = process.env.KICAD_PYTHON || (existsSync(mac) ? mac : 'python3')
if (process.argv.includes('--refresh')) {
  const test = spawnSync(python, ['scripts/test-source-design-rules.py'], {stdio:'inherit'})
  if (test.error) throw test.error
  if (test.status !== 0) throw new Error('Native design policy regression failed')
  const result = spawnSync(python, ['scripts/source_design_rules.py', 'check', boardPath, 'docs/source-design-rules-check.json'], {stdio:'inherit'})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error('Native geometry violates source design policy')
}
const report = JSON.parse(await readFile('docs/source-design-rules-check.json'))
const bindings = Object.fromEntries(await Promise.all(Object.entries({board_sha256:boardPath, standards_sha256:'board-standards.json', checker_sha256:'scripts/source_design_rules.py'}).map(async ([key,path]) => [key,createHash('sha256').update(await readFile(path)).digest('hex')])))
const geometryErrors = sourceDesignGeometryErrors(report, standards, bindings)
if (geometryErrors.length) throw new Error(geometryErrors.join('\n'))
console.log('Source/native rules and hash-bound actual copper: tracks >=0.15 mm, GND clearance >=0.30 mm, GND edge inset >=0.50 mm.')
