import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
const sha = p => readFile(p).then(bytes => createHash('sha256').update(bytes).digest('hex'))
const report = JSON.parse(await readFile('docs/usb-reference-check.json'))
if (report.board_sha256 !== await sha('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb') ||
    report.checker_sha256 !== await sha('scripts/check-usb-reference.py'))
  throw new Error('USB reference-plane evidence is stale; rerun the native checker')
const expectedNets = ['USB_DM', 'USB_DM_CONN', 'USB_DP', 'USB_DP_CONN']
if (report.nets?.map(net => net.net).sort().join(',') !== expectedNets.join(','))
  throw new Error('USB reference-plane evidence is missing a required net')
if (!Array.isArray(report.errors) || report.errors.length || report.nets?.length !== 4 ||
    report.nets.some(net => !net.checked_samples || !Array.isArray(net.uncovered_samples) ||
      net.uncovered_samples.length || !(net.maximum_ground_stitch_distance_mm <= 2)))
  throw new Error('USB reference-plane validation failed or is incomplete')
console.log('USB: four bottom-layer trunks have filled In2 ground reference and local return stitching; electrical compliance remains unmeasured.')
