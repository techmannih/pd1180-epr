import {readFile} from 'node:fs/promises'
const status = JSON.parse(await readFile(new URL('../docs/release-status.json', import.meta.url)))
const open = Object.entries(status.release_gates).filter(([,passed])=>passed!==true).map(([name])=>name)
if (!status.fabrication_released || open.length) {
  console.error('Manufacturing export blocked. Open release gates:\n'+open.map(x=>' - '+x).join('\n'))
  process.exitCode=1
} else console.log('Manufacturing release gates passed.')
