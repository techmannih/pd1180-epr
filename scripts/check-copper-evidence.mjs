import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
export const comparedPowerPaths = [
  ['MOTOR_A1','Q7:9','R115:1'], ['MOTOR_B1','Q11:9','R116:1'],
  ['MOTOR_A1_OUT','R115:2','J2:1'], ['MOTOR_A2','Q9:9','J2:2'],
  ['MOTOR_B1_OUT','R116:2','J2:3'], ['MOTOR_B2','Q13:9','J2:4'],
  ['PD_VBUS','J1:7,8,17,18','Q4:1,2,3'], ['EFUSE_IN','Q4:9','U6:1,2'],
  ...['Q6:9','Q8:9','Q10:9','Q12:9','J3:1'].map(to=>['VMOTOR','U6:17,18',to]),
  ['SENSE_A','Q7:1,2,3','R109:1'], ['SENSE_A','Q9:1,2,3','R109:1'],
  ['SENSE_B','Q11:1,2,3','R110:1'], ['SENSE_B','Q13:1,2,3','R110:1'],
  ['BRAKE_RETURN','J3:2','Q16:9'],
]
export const integratedPowerPaths = [
  ['MOTOR_A1','U7:17,18,19','R115:1'], ['MOTOR_B1','U7:4,5,6','R116:1'],
  ['MOTOR_A1_OUT','R115:2','J2:1'], ['MOTOR_A2','U7:14,15,16','J2:2'],
  ['MOTOR_B1_OUT','R116:2','J2:3'], ['MOTOR_B2','U7:7,8,9','J2:4'],
  ['PD_VBUS','J1:7,8,17,18','Q4:1,2,3'], ['EFUSE_IN','Q4:9','U6:1,2'],
  ['VMOTOR','U6:17,18','U7:2,11,12,21'], ['VMOTOR','U6:17,18','J3:1'],
  ['BRAKE_RETURN','J3:2','Q16:9'],
]
export function powerPaths(report) {
  if (report.architecture === 'RP2040_DRV8262DDV') return integratedPowerPaths
  if (report.architecture && report.architecture !== 'STM32_TMC5160') throw new Error('Unknown copper-screen architecture')
  return comparedPowerPaths
}
export function copperComparisonErrors(report, boardHash) {
  const errors=[]; const paths=powerPaths(report)
  if(report.board_sha256!==boardHash) errors.push('Copper comparison uses a different PCB')
  for(const label of ['before','after']) {
    const rows=report.dc_screen?.[label] || []
    const hash=label==='after'?boardHash:report.baseline_board_sha256
    if(!/^[a-f0-9]{64}$/.test(hash || '') || rows.length!==paths.length*2) errors.push(`${label}: expected ${paths.length} paths at two meshes and an exact PCB hash`)
    for(const [net,from,to] of paths) {
      const pair=[]
      for(const grid of [.075,.05]) {
        const matches=rows.filter(r=>r.net===net&&r.from===from&&r.to===to&&r.grid_mm===grid)
        if(matches.length!==1 || matches[0].board_sha256!==hash || !Number.isFinite(matches[0].resistance_mohm_20c) || matches[0].resistance_mohm_20c<=0)
          errors.push(`${label}: missing/stale/invalid ${net} ${from} → ${to} @ ${grid}`)
        else pair.push(matches[0])
      }
      if(pair.length===2 && Math.abs(pair[0].resistance_mohm_20c/pair[1].resistance_mohm_20c-1)>.03) {
        let previous=pair[1], converged=false
        for(const grid of [.025,.02]) {
          const matches=(report.dc_screen?.refined || []).filter(r=>r.revision===label&&r.net===net&&r.from===from&&r.to===to&&r.grid_mm===grid)
          if(matches.length!==1 || matches[0].board_sha256!==hash || !Number.isFinite(matches[0].resistance_mohm_20c) || matches[0].resistance_mohm_20c<=0) break
          const fine=matches[0]
          if(Math.abs(previous.resistance_mohm_20c/fine.resistance_mohm_20c-1)<=.03) {converged=true;break}
          previous=fine
        }
        if(!converged) errors.push(`${label}: ${net} ${to} mesh difference exceeds 3%; refine the numerical screen`)
      }
    }
  }
  // A comparative regression threshold, never a current-rating qualification.
  for(const r of report.dc_screen?.after || []) {
    const b=report.dc_screen?.before?.find(b=>['net','from','to','grid_mm'].every(k=>b[k]===r[k]))
    if(b && r.resistance_mohm_20c>b.resistance_mohm_20c*1.05) errors.push(`${r.net} ${r.to}: resistance increased more than 5%; review the physical path`)
  }
  return errors
}
export function copperEvidenceErrors(report, boardHash) {
  const errors=[]
  if(report.board_sha256!==boardHash) errors.push('Filled-copper screen is for a different PCB')
  const paths=powerPaths(report).slice(0,6)
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
  const geometry=JSON.parse(await readFile('engineering/copper-geometry-review.json'))
  errors.push(...copperComparisonErrors(geometry,sha(await readFile(report.board))))
  for(const path of ['scripts/export-filled-power-copper.py','scripts/screen-filled-power-copper.py','scripts/test-filled-power-copper.py'])
    if(report.model_source_sha256?.[path]!==sha(await readFile(path)) || geometry.model_source_sha256?.[path]!==sha(await readFile(path))) errors.push(`Stale copper model evidence: ${path}`)
  if(errors.length) {console.error(errors.join('\n'));process.exitCode=1}
  else console.log(`${powerPaths(geometry).length} motor/supply/brake paths compared at two meshes before/after; evidence matches the current PCB and model sources. DC analytical evidence only; thermal/current rating unqualified.`)
}
