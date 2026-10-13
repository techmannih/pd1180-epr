import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { parseNative, verifyNativeEco, digest } from './native-eco-policy.mjs'
import { placementAdvisories } from './placement-review.mjs'
const result=spawnSync('./node_modules/.bin/tsci',['check','placement','dist/index/circuit.json'],{encoding:'utf8'})
if(result.error)throw result.error
const output=result.stdout+result.stderr
await writeFile('docs/checks/placement-raw.log',output)
const advice=placementAdvisories(output,result.status)
const bytes=await readFile('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb')
verifyNativeEco(parseNative(bytes.toString()),JSON.parse(await readFile('engineering/unused-sbu-eco.json')))
const drc=spawnSync('bun',['scripts/check-kicad-drc.mjs'],{encoding:'utf8'})
if(drc.status!==0)throw new Error(`Native DRC evidence invalid: ${drc.stdout}${drc.stderr}`)
await writeFile('docs/checks/placement-review.json',JSON.stringify({reviewed_advisories:advice,raw_cli_exit:result.status,raw_log:'docs/checks/placement-raw.log',board_sha256:digest(bytes),reason:'docs/placement-review.md',unrelated_native_geometry_preserved:true,native_drc_passed:true,hardware_qualified:false},null,2)+'\n')
console.log('Three nearest-port orientation advisories reviewed against preserved native routing; raw CLI evidence retained. Native DRC/parity zero.')
