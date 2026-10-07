import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const drcPath = process.argv[2] || 'dist/manufacturing/kicad-drc.json'
const ercPath = process.argv[3] || join(dirname(drcPath), 'kicad-erc.json')
const [drc, erc] = await Promise.all([
  readFile(drcPath, 'utf8').then(JSON.parse),
  readFile(ercPath, 'utf8').then(JSON.parse),
])
const violations = drc.violations || []
const unconnected = drc.unconnected_items || []
const schematicParity = drc.schematic_parity || []
if (!Array.isArray(erc.sheets)) throw new Error('KiCad ERC report is missing its sheets array')
const ercViolations = erc.sheets.flatMap((sheet) => {
  if (!Array.isArray(sheet.violations)) throw new Error(`KiCad ERC sheet ${sheet.path || '<unknown>'} is missing its violations array`)
  return sheet.violations
})
const summary = {
  drc_report: drcPath,
  erc_report: ercPath,
  violations: violations.length,
  unconnected_items: unconnected.length,
  schematic_parity_issues: schematicParity.length,
  schematic_erc_violations: ercViolations.length,
}
console.log(JSON.stringify(summary, null, 2))
if (violations.length || unconnected.length || schematicParity.length || ercViolations.length) process.exitCode = 1
