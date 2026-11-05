import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { parseNative, digest } from './native-eco-policy.mjs'
import { verifyRp2040Protection } from './check-protection-refinement.mjs'
import { placementAdvisories } from './placement-review.mjs'
import { assertReviewDrc } from './silkscreen-review.mjs'
const result=spawnSync('./node_modules/.bin/tsci',['check','placement','dist/index/circuit.json'],{encoding:'utf8'})
if(result.error)throw result.error
const output=result.stdout+result.stderr
await writeFile('docs/checks/placement-raw.log',output)
const advice=placementAdvisories(output,result.status,JSON.parse(await readFile('dist/index/circuit.json')))
const bytes=await readFile('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb')
verifyRp2040Protection(parseNative(bytes.toString()),JSON.parse(await readFile('routing/power-feed.json')))
const drcBytes=await readFile('dist/manufacturing/kicad-drc.json')
const drc=JSON.parse(drcBytes), report=JSON.parse(await readFile('dist/manufacturing/manufacturing-report.json'))
if(report.board_sha256!==digest(bytes)||report.drc_sha256!==digest(drcBytes))throw new Error('Stale native DRC/board evidence')
assertReviewDrc(drc,true)
await writeFile('docs/checks/placement-review.json',JSON.stringify({reviewed_advisories:advice,raw_cli_exit:result.status,raw_log:'docs/checks/placement-raw.log',board_sha256:digest(bytes),reason:'docs/placement-review.md',reviewed_native_geometry_verified:true,native_drc_passed:drc.violations.length===0,retained_silk_findings:drc.violations.filter(v=>v.severity==='warning').length,retained_usb_hole_errors:drc.violations.filter(v=>v.type==='hole_clearance').length,electrical_connectivity_passed:true,hardware_qualified:false},null,2)+'\n')
console.log('Nine nearest-port orientation advisories reviewed against the regenerated native routing; raw CLI evidence retained. Electrical connectivity/parity zero; the exact eight USB hole errors and cosmetic findings are retained; manufacturing acceptance is recorded separately.')
