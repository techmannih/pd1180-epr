import {readFile} from 'node:fs/promises'
const status = JSON.parse(await readFile(new URL('../docs/release-status.json', import.meta.url)))
const open = Object.entries(status.prototype_order_gates).filter(([,passed])=>passed!==true).map(([name])=>name)
if (!status.fabrication_orderable || open.length) {
  console.error('Prototype manufacturing export blocked. Open gates:\n'+open.map(x=>' - '+x).join('\n'))
  process.exitCode=1
} else {
  const validation = Object.entries(status.system_validation_gates).filter(([,passed])=>passed!==true).map(([name])=>name)
  console.log(`Prototype manufacturing gates passed. System validation gates still open: ${validation.length}.`)
}
