import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

// The main ECO board is preserved byte-for-byte except these three value fields.
// This checks copper, holes, pads, nets, footprint placement and readable labels,
// including D20 and the startup feedback route, without waiving native DRC/ERC.
const baseline = 'c955f3f13b799e879e358d342fcf4a4509f92616a88bfc0bfa981981235fbcd6'
const path = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const original = await readFile(path, 'utf8')
let reconstructed = original
const changes = [
  { reference: 'R25', before: '4.22kΩ', after: '4.99kΩ' },
  { reference: 'R61', before: '16kΩ', after: '16.2kΩ' },
  { reference: 'R66', before: '1.21kΩ', after: '1.2kΩ' },
]
for (const change of changes) {
  const needle = `(property "Value" "${change.after}"`
  if (reconstructed.split(needle).length !== 2) throw new Error(`Ambiguous/missing ${change.reference} value`)
  const at = reconstructed.indexOf(needle)
  const footprint = reconstructed.slice(reconstructed.lastIndexOf('\n\t(footprint ', at), at)
  if (!footprint.includes(`(property "Reference" "${change.reference}"`))
    throw new Error(`Changed value belongs to a different footprint: ${change.reference}`)
  reconstructed = reconstructed.replace(needle, `(property "Value" "${change.before}"`)
}
const sha = data => createHash('sha256').update(data).digest('hex')
if (sha(reconstructed) !== baseline) throw new Error('Native PCB differs from main beyond the three reviewed value fields')
const report = {
  base_commit: '4836266cb3d771da798b0559fe3ae5de7c5905b6',
  baseline_board_sha256: baseline, current_board_sha256: sha(original),
  changes, all_other_native_bytes_unchanged: true,
  checker_sha256: sha(await readFile(new URL(import.meta.url))),
  hardware_qualified: false,
}
await writeFile('engineering/protection-refinement-geometry.json', JSON.stringify(report, null, 2)+'\n')
console.log('Main PCB preserved exactly except R25/R61/R66 values; native DRC/ERC remain separate checks.')
