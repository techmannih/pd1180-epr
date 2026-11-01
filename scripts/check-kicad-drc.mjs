import { assertReviewDrc } from './silkscreen-review.mjs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { assertNativePackagePinsMatch } from './generate-cloud-viewer.mjs'

// The default report is a release claim. Do not accept it for a replaced MCU
// or driver merely because the historical report itself has no copper faults.
if (!process.argv[2]) {
  assertNativePackagePinsMatch(
    JSON.parse(await readFile('dist/index/circuit.json', 'utf8')),
    await readFile('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'utf8'),
  )
}

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
let dispositionError = null
try { assertReviewDrc(drc) } catch (error) { dispositionError = error.message }
const summary = {
  accepted_cosmetic_findings: dispositionError ? 0 : violations.filter(v=>v.severity!=='error').length,
  retained_usb_hole_errors: violations.filter(v=>v.type==='hole_clearance').length,
  native_error_count: violations.filter(v=>v.severity==='error').length,
  blocking_error: dispositionError,
  drc_report: drcPath,
  erc_report: ercPath,
  violations: violations.length,
  unconnected_items: unconnected.length,
  schematic_parity_issues: schematicParity.length,
  schematic_erc_violations: ercViolations.length,
}
console.log(JSON.stringify(summary, null, 2))
if (dispositionError || ercViolations.length) process.exitCode = 1
