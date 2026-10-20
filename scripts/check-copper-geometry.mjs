import { readFile } from 'node:fs/promises'
import { parseNative } from './native-eco-policy.mjs'
import { copperGeometryErrors } from './copper-geometry-policy.mjs'
import { assertReviewDrc } from './silkscreen-review.mjs'
const base = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3'
const [board, project, drc, standards] = await Promise.all([
  readFile(`${base}.kicad_pcb`, 'utf8').then(parseNative),
  readFile(`${base}.kicad_pro`, 'utf8').then(JSON.parse),
  readFile('dist/manufacturing/kicad-drc.json', 'utf8').then(JSON.parse),
  readFile('board-standards.json', 'utf8').then(JSON.parse),
])
assertReviewDrc(drc)
const errors = copperGeometryErrors(board, project, drc, standards)
if (errors.length) throw new Error(errors.join('\n'))
console.log('Copper rules active at >=0.09 mm; consolidated/chamfered power zones; zero native copper-width/clearance/connectivity/parity findings. Existing cosmetic findings retained.')
