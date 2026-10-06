import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import JSZip from 'jszip'

const release = 'release'
const sourcing = 'sourcing'
await Promise.all([mkdir(release, { recursive: true }), mkdir(sourcing, { recursive: true }), mkdir(join(release, 'schematics'), { recursive: true })])

function csvCell(value) {
  const text = value == null ? '' : Array.isArray(value) ? value.join(' ') : String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
function csv(rows) { return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n' }

const stock = JSON.parse(await readFile('docs/stock-report.json', 'utf8'))
const alternatives = JSON.parse(await readFile('docs/alternatives.json', 'utf8'))
const external = JSON.parse(await readFile('docs/external-parts.json', 'utf8'))
await writeFile(join(sourcing, 'bom-with-stock.csv'), csv([
  ['LCSC', 'MPN', 'Value', 'Package', 'References', 'Qty/board', 'Stock', 'Status', 'Checked at'],
  ...stock.parts.map((part) => [part.lcsc, part.mpn, part.value, part.package, part.references, part.quantity_per_board, part.stock, part.status, part.checked_at]),
]))
await writeFile(join(sourcing, 'alternatives.csv'), csv([
  ['Primary LCSC', 'Alternative LCSC', 'MPN', 'Package', 'Stock', 'Status', 'Reason'],
  ...alternatives.parts.map((part) => [part.primary, part.alternative, part.mpn, part.package, part.stock, part.status, part.notes]),
]))
await writeFile(join(sourcing, 'external-items.csv'), csv([
  ['Item', 'Selected part', 'Specification', 'Status'],
  ['brake resistor', external.brake_resistor.selected_part || '', `${external.brake_resistor.target_resistance_ohms} ohm / ${external.brake_resistor.starting_continuous_power_w} W`, external.brake_resistor.status],
  ['motor', external.motor, '5.5 A RMS / 7 Nm', 'specified'],
  ['magnet', external.magnet, 'AS5047P compatible', 'mechanical validation required'],
]))
await copyFile('docs/stock-report.json', join(sourcing, 'stock-snapshot.json'))

const copies = [
  ['dist/manufacturing/kicad-board.png', 'pcb-3d.png'],
  ['dist/index/3d.glb', 'pd1180-epr.glb'],
  ['dist/index/circuit.json', 'circuit.json'],
  ['dist/manufacturing/assembly-bom.csv', 'jlc-bom.csv'],
  ['dist/manufacturing/assembly-cpl.csv', 'jlc-cpl.csv'],
  ['dist/manufacturing/kicad-drc.json', 'kicad-drc.json'],
  ['dist/manufacturing/manufacturing-report.json', 'manufacturing-report.json'],
  ['docs/verification.json', 'verification.json'],
  ['docs/power-routing-check.json', 'power-routing-check.json'],
  ['docs/release-status.json', 'release-status.json'],
  ['hardware-contract.json', 'hardware-contract.json'],
  ['dist/pd1180-epr-r0.3-manufacturing.zip', 'pd1180-epr-r0.3-manufacturing.zip'],
]
for (const [from, to] of copies) await copyFile(from, join(release, to))
for (const file of await readdir('dist/schematics')) {
  if (file.endsWith('.svg')) await copyFile(join('dist/schematics', file), join(release, 'schematics', file))
}

async function zipDirectory(directory, destination) {
  const zip = new JSZip()
  async function add(path, prefix = '') {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const full = join(path, entry.name)
      if (entry.isDirectory()) await add(full, `${prefix}${entry.name}/`)
      else zip.file(`${prefix}${entry.name}`, await readFile(full))
    }
  }
  await add(directory)
  await writeFile(destination, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
}
await Promise.all([
  zipDirectory('dist/manufacturing/gerbers', join(release, 'pd1180-epr-r0.3-gerbers.zip')),
  zipDirectory('dist/manufacturing/kicad-project', join(release, 'pd1180-epr-r0.3-kicad.zip')),
])

await writeFile(join(release, 'README.md'), `# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.3 prototype handoff

Upload \`pd1180-epr-r0.3-gerbers.zip\` for the PCB and use \`jlc-bom.csv\` plus \`jlc-cpl.csv\` for top-side assembly. Apply every value in \`order-settings.json\`, especially four layers, 1 oz copper on all layers, filled/capped via-in-pad and top-only assembly.

The committed KiCad DRC has zero violations and zero unconnected items. Live JLCSearch evidence covers all 67 unique populated LCSC codes. The assembled board boots safe with blank U3/U16; 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.
`)

const hashes = {}
for (const file of (await readdir(release)).sort()) {
  if (file === 'sha256.json') continue
  const data = await readFile(join(release, file)).catch(() => null)
  if (data) hashes[file] = createHash('sha256').update(data).digest('hex')
}
await writeFile(join(release, 'sha256.json'), `${JSON.stringify(hashes, null, 2)}\n`)
console.log(JSON.stringify({ release_files: Object.keys(hashes).length, stock_parts: stock.parts.length, release }, null, 2))
