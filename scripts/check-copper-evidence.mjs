import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
export function copperEvidenceErrors(report, boardHash) {
  const errors=[]
  if(report.board_sha256!==boardHash) errors.push('Filled-copper screen is for a different PCB')
  const paths=[['MOTOR_A1','Q7:9','R115:1'],['MOTOR_B1','Q11:9','R116:1'],
    ['MOTOR_A1_OUT','R115:2','J2:1'],['MOTOR_A2','Q9:9','J2:2'],
    ['MOTOR_B1_OUT','R116:2','J2:3'],['MOTOR_B2','Q13:9','J2:4']]
  const rows=[...(report.after||[]),...(report.b1_drain_to_shunt||[]),...(report.motor_output_paths||[])]
  if(rows.length!==12) errors.push('Expected six current paths at two mesh sizes')
  for(const [net,from,to] of paths) for(const grid of [.075,.05]) {
    const matches=rows.filter(r=>r.net===net&&r.from===from&&r.to===to&&r.grid_mm===grid)
    if(matches.length!==1 || matches[0].board_sha256!==boardHash ||
      !Number.isFinite(matches[0].resistance_mohm_20c) || matches[0].resistance_mohm_20c<=0)
      errors.push(`Missing/stale/invalid copper result: ${net} ${from} → ${to} @ ${grid} mm`)
  }
  return errors
}
if(import.meta.main) {
  const report=JSON.parse(await readFile('engineering/filled-copper-review.json'))
  const errors=copperEvidenceErrors(report,sha(await readFile(report.board)))
  for(const path of ['scripts/export-filled-power-copper.py','scripts/screen-filled-power-copper.py','scripts/test-filled-power-copper.py'])
    if(report.model_source_sha256?.[path]!==sha(await readFile(path))) errors.push(`Stale copper model evidence: ${path}`)
  if(errors.length) {console.error(errors.join('\n'));process.exitCode=1}
  else console.log('Six motor paths / twelve mesh results match the current PCB and model sources. DC analytical evidence only; thermal/current rating unqualified.')
}
