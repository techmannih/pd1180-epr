import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
export function silkSignature(violations) {
  const rows=violations.map(v=>[v.type,v.severity,(v.items||[]).map(i=>i.uuid).sort()]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}
export function assertReviewDrc(report, allowHeldLabels=false) {
  for(const f of ['violations','unconnected_items','schematic_parity'])if(!Array.isArray(report[f]))throw new Error(`Missing DRC ${f}`)
  if(report.unconnected_items.length || report.schematic_parity.length)throw new Error('Unconnected/parity issues block every export')
  if(!report.violations.length)return
  const baseline=JSON.parse(readFileSync(new URL('../engineering/native-silk-hold.json',import.meta.url)))
  if(!allowHeldLabels || report.violations.some(v=>!['text_height','silk_over_copper','silk_overlap'].includes(v.type)) || silkSignature(report.violations)!==baseline.signature)
    throw new Error('DRC findings differ from the explicitly retained native-reference baseline')
  // This enables an explicitly labelled review export, never a passing DRC or
  // fabrication gate. All findings remain in the unmodified reports/artifacts.
}
