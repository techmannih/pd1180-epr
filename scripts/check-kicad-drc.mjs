import { readFile } from 'node:fs/promises'

const path = process.argv[2] || 'dist/manufacturing/kicad-drc.json'
const report = JSON.parse(await readFile(path, 'utf8'))
const violations = report.violations || []
const unconnected = report.unconnected_items || []
const summary = {
  report: path,
  violations: violations.length,
  unconnected_items: unconnected.length,
}
console.log(JSON.stringify(summary, null, 2))
if (violations.length || unconnected.length) process.exitCode = 1
