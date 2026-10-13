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
  if(!(allowHeldLabels || baseline.user_accepted_cosmetic_findings === true) || report.violations.some(v=>!['text_height','silk_over_copper','silk_overlap'].includes(v.type)) || silkSignature(report.violations)!==baseline.signature)
    throw new Error('DRC findings differ from the explicitly retained native-reference baseline')
  // Only these exact user-accepted cosmetic findings are nonblocking.
  // Raw KiCad reports stay unchanged; procurement/physical gates remain separate.
}
