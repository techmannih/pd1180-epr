import { readFile } from 'node:fs/promises'
import { assertNativePackagePinsMatch } from './generate-cloud-viewer.mjs'

const sourcePath = process.argv[2] || 'dist/index/circuit.json'
const boardPath = process.argv[3] || 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
assertNativePackagePinsMatch(JSON.parse(await readFile(sourcePath, 'utf8')), await readFile(boardPath, 'utf8'))
console.log('Native component names and package pins match the compiled source. Routing/fingerprint/DRC are separate required checks.')
