import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
const status = JSON.parse(await readFile(new URL('../docs/release-status.json', import.meta.url)))
const verification = JSON.parse(await readFile(new URL('../docs/verification.json', import.meta.url)))
const open = Object.entries(status.prototype_order_gates).filter(([,passed])=>passed!==true).map(([name])=>name)
const changed = []
for (const [path, expected] of Object.entries(verification.verified_inputs || {})) {
  const actual = createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')
  if (actual !== expected) changed.push(path)
}
if (!status.fabrication_orderable || open.length || changed.length) {
  console.error('Prototype manufacturing export blocked. Open gates:\n'+open.map(x=>' - '+x).join('\n'))
  if (!status.fabrication_orderable) console.error(`Order hold:\n${(status.order_hold_reasons || ['Release status does not authorize ordering']).map(reason=>' - '+reason).join('\n')}`)
  if (changed.length) console.error(`Verified design inputs changed after validation:\n${changed.map((path)=>` - ${path}`).join('\n')}`)
  process.exitCode=1
} else {
  const validation = Object.entries(status.system_validation_gates).filter(([,passed])=>passed!==true).map(([name])=>name)
  console.log(`Prototype manufacturing gates passed. System validation gates still open: ${validation.length}.`)
}
