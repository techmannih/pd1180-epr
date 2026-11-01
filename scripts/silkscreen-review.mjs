import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
export function silkSignature(violations) {
  const rows=violations.map(v=>[v.type,v.severity,(v.items||[]).map(i=>i.uuid).sort()]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}
export function findingSignature(violations) {
  return createHash('sha256').update(JSON.stringify(violations.map(v => JSON.stringify(v)).sort())).digest('hex')
}
export function assertRetainedUsbHoles(holes) {
  if(holes.length) {
    const held=JSON.parse(readFileSync(new URL('../engineering/usb-hole-hold.json',import.meta.url)))
    if(holes.length!==8 || findingSignature(holes)!==findingSignature(held.findings))
      throw new Error('Hole-clearance findings differ from the eight explicitly retained J1/J10 findings')
  }
}
export function assertReviewDrc(report, allowHeldLabels=false) {
  for(const f of ['violations','unconnected_items','schematic_parity'])if(!Array.isArray(report[f]))throw new Error(`Missing DRC ${f}`)
  if(report.unconnected_items.length || report.schematic_parity.length)throw new Error('Unconnected/parity issues block every export')
  if(!report.violations.length)return
  const holes=report.violations.filter(v=>v.type==='hole_clearance')
  assertRetainedUsbHoles(holes)
  const cosmetics=report.violations.filter(v=>v.type!=='hole_clearance')
  const baseline=JSON.parse(readFileSync(new URL('../engineering/native-silk-hold.json',import.meta.url)))
  if(!(allowHeldLabels || baseline.user_accepted_cosmetic_findings === true) || cosmetics.some(v=>!['text_height','silk_over_copper','silk_overlap'].includes(v.type)) || silkSignature(cosmetics)!==baseline.signature)
    throw new Error('DRC findings differ from the explicitly retained native-reference baseline')
  // Only the exact retained cosmetic and USB-hole findings are nonblocking for review.
  // The eight native errors remain visible and prohibit a zero-error/fabrication claim.
  // Raw KiCad reports stay unchanged; procurement/physical gates remain separate.
}
