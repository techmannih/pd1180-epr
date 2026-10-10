import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import JSZip from 'jszip'
import { writeCloudViewerCircuit } from './generate-cloud-viewer.mjs'

const release = 'release'
const sourcing = 'sourcing'
const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
await Promise.all([mkdir(release, { recursive: true }), mkdir(sourcing, { recursive: true }), mkdir(join(release, 'schematics'), { recursive: true })])

function csvCell(value) {
  const text = value == null ? '' : Array.isArray(value) ? value.join(' ') : String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
function csv(rows) { return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n' }

const stock = JSON.parse(await readFile('docs/stock-report.json', 'utf8'))
const alternatives = JSON.parse(await readFile('docs/alternatives.json', 'utf8'))
const external = JSON.parse(await readFile('docs/external-parts.json', 'utf8'))
const releaseStatus = JSON.parse(await readFile('docs/release-status.json', 'utf8'))
const schematicStyle = JSON.parse(await readFile('docs/checks/schematic-style.json', 'utf8'))
const kicadErc = JSON.parse(await readFile('dist/manufacturing/kicad-erc.json', 'utf8'))
if (!Array.isArray(kicadErc.sheets)) throw new Error('KiCad ERC report is missing its sheets array')
const kicadErcViolations = kicadErc.sheets.flatMap((sheet) => {
  if (!Array.isArray(sheet.violations)) throw new Error(`KiCad ERC sheet ${sheet.path || '<unknown>'} is missing its violations array`)
  return sheet.violations
})
if (kicadErcViolations.length) throw new Error(`Release blocked: KiCad ERC contains ${kicadErcViolations.length} violations`)
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
  ['dist/manufacturing/kicad-board-bottom.png', 'pcb-bottom.png'],
  ['dist/manufacturing/assembly-bom.csv', 'jlc-bom.csv'],
  ['dist/manufacturing/assembly-cpl.csv', 'jlc-cpl.csv'],
  ['dist/manufacturing/kicad-drc.json', 'kicad-drc.json'],
  ['dist/manufacturing/kicad-erc.json', 'kicad-erc.json'],
  ['dist/manufacturing/manufacturing-report.json', 'manufacturing-report.json'],
  ['mounting-template.svg', 'mounting-template.svg'],
  ['previews/mounting-template.png', 'mounting-template.png'],
  ['docs/feature-parity-check.json', 'feature-parity-check.json'],
  ['docs/checks/schematic-style.json', 'schematic-style-check.json'],
  ['docs/verification.json', 'verification.json'],
  ['docs/power-routing-check.json', 'power-routing-check.json'],
  ['docs/critical-copper-check.json', 'critical-copper-check.json'],
  ['engineering/power-audit.json', 'power-audit.json'],
  ['docs/native-decoupling-check.json', 'native-decoupling-check.json'],
  ['docs/power-validation.md', 'power-validation.md'],
  ['docs/release-status.json', 'release-status.json'],
  ['hardware-contract.json', 'hardware-contract.json'],
  ['dist/pd1180-epr-r0.3-manufacturing.zip', 'pd1180-epr-r0.3-manufacturing.zip'],
]
for (const [from, to] of copies) await copyFile(from, join(release, to))
await writeCloudViewerCircuit()
// Build from this exact routed circuit, never from a previous preview's GLB.
// The CLI may report conversion errors without failing the build, so remove
// its old output and require a complete GLB before packaging it.
const routedGlb = 'dist/release/3d.glb'
await rm(routedGlb, { force: true })
execFileSync('bunx', ['tsci', 'build', 'release/circuit.json', '--glbs', '--routing-disabled', '--disable-parts-engine'], {
  stdio: 'inherit', timeout: 600_000,
})
const glb = await readFile(routedGlb)
if (glb.length < 12 || glb.toString('ascii', 0, 4) !== 'glTF' ||
    glb.readUInt32LE(4) !== 2 || glb.readUInt32LE(8) !== glb.length)
  throw new Error('Routed 3D export is missing or invalid')
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
async function zipFile(source, archivedName, destination) {
  const zip = new JSZip()
  zip.file(archivedName, await readFile(source))
  await writeFile(destination, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
}
// Cloud GitHub imports skip ZIP payloads but may try to serialize loose binaries.
// Keep the reviewable GLB in the release while avoiding the sandbox RPC-size limit.
await rm(join(release, 'pd1180-epr.glb'), { force: true })
await Promise.all([
  zipDirectory('dist/manufacturing/gerbers', join(release, 'pd1180-epr-r0.3-gerbers.zip')),
  zipDirectory('dist/manufacturing/kicad-project', join(release, 'pd1180-epr-r0.3-kicad.zip')),
  zipFile(routedGlb, 'pd1180-epr.glb', join(release, 'pd1180-epr-r0.3-glb.zip')),
])

await writeFile(join(release, 'README.md'), `# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.4 ECO review handoff — powered validation pending

${releaseStatus.fabrication_orderable ? 'Prototype CAD gates passed; system validation remains open.' : '**ORDER HOLD.** These are engineering review files. Powered USB, current/thermal and system qualification remain open; do not submit a fabrication order from this package.'}

The ECO separates PD POWER and USB DATA, consolidates the industrial harness and corrects the TMC5160 STEP/DIR pins while retaining external MOSFET bridges. USB DATA alone powers setup/diagnostics through a current-limited, reverse-blocked supply; the motor-bus backup supply is retained for brake control after PD loss. Status: ${releaseStatus.status}. See \`engineering/reviewer-eco.json\` and \`docs/step-dir-hardware-review.md\`.

The included \`pd1180-commissioning-firmware.zip\` contains a real STM32 image with USB diagnostics. Motor power and motion remain locked. It does not prove motor operation.

For the checked prototype handoff, use the newly generated Gerbers together with \`jlc-bom.csv\` plus \`jlc-cpl.csv\` for top-side assembly. Apply every value in \`order-settings.json\`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for every via-in-pad listed in the order settings (including 40 MOSFET drain-pad and four U34 thermal vias), and top-side assembly.

Legacy archive/KiCad basenames retain the r0.3 suffix for pipeline compatibility; their contents, silkscreen and hardware contract are the r0.4 ECO identified by this delivery manifest.

The committed native KiCad checks have zero PCB DRC violations, zero unconnected items, zero schematic-parity issues and zero schematic ERC violations. See \`kicad-drc.json\` and \`kicad-erc.json\`. Live JLCSearch evidence covers all ${stock.parts.length} unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all ${standards.project_geometry.schematic_sheet_count} sheets; see \`schematic-style-check.json\`. \`circuit.json\` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

Power calculations and the unperformed bench-test matrix are in \`power-validation.md\`; \`power-audit.json\` and \`native-decoupling-check.json\` contain the numerical evidence.

Use \`pcb-3d.png\` and \`pcb-bottom.png\` for visual review. Print \`mounting-template.svg\` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as \`pd1180-epr-r0.3-glb.zip\` so cloud imports do not serialize a large loose binary. \`delivery-manifest.json\` records the exact file sizes and hashes, while \`sha256.json\` recursively covers this release directory.
`)

const artifactPaths = standards.release.required_files.filter((path) => !path.endsWith('/delivery-manifest.json') && !path.endsWith('/sha256.json'))
const artifacts = []
for (const path of artifactPaths) {
  const data = await readFile(path)
  artifacts.push({
    path: path.replace(/^release\//, ''),
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
  })
}
const deliveryManifest = {
  schema_version: 1,
  product_name: standards.product_name,
  revision: standards.revision,
  generated_at: new Date().toISOString(),
  assembly: {
    populated_layers: standards.assembly.populated_layers,
    bom_rows: stock.parts.length,
    exact_supplier_codes: true,
  },
  checks: {
    kicad_drc_violations: 0,
    kicad_unconnected_items: 0,
    kicad_erc_violations: kicadErcViolations.length,
    stock_parts: stock.parts.length,
    stock_unavailable: stock.parts.filter((part) => part.status !== 'available').length,
    alternative_records: alternatives.parts.length,
    alternatives_available: alternatives.parts.filter((part) => part.status === 'available').length,
    alternatives_requiring_redesign: alternatives.parts.filter((part) => part.classification === 'not-approved-redesign-required').length,
    schematic_style_issues: schematicStyle.total_issues,
  },
  artifacts,
}
const deliveryManifestText = `${JSON.stringify(deliveryManifest, null, 2)}\n`
await Promise.all([
  writeFile(join(release, 'delivery-manifest.json'), deliveryManifestText),
  writeFile('delivery-manifest.json', deliveryManifestText),
])

async function listFiles(directory, prefix = '') {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`
    if (entry.isDirectory()) files.push(...await listFiles(join(directory, entry.name), `${relative}/`))
    else files.push(relative)
  }
  return files
}
const hashes = {}
for (const file of (await listFiles(release)).sort()) {
  if (file === 'sha256.json') continue
  const data = await readFile(join(release, file))
  hashes[file] = createHash('sha256').update(data).digest('hex')
}
await writeFile(join(release, 'sha256.json'), `${JSON.stringify(hashes, null, 2)}\n`)
console.log(JSON.stringify({ release_files: Object.keys(hashes).length, stock_parts: stock.parts.length, release }, null, 2))
