import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import JSZip from 'jszip'
import { writeCloudViewerCircuit } from './generate-cloud-viewer.mjs'
import { renderLocalMechanical } from './render-local-mechanical.mjs'

const release = 'release'
execFileSync('bun', ['scripts/export-assembly.mjs', '--check', 'dist/manufacturing'], { stdio: 'inherit' })
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
const kicadDrc = JSON.parse(await readFile('dist/manufacturing/kicad-drc.json', 'utf8'))
for (const field of ['violations', 'unconnected_items', 'schematic_parity']) {
  if (!Array.isArray(kicadDrc[field])) throw new Error(`KiCad DRC report is missing its ${field} array`)
}
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
  ['ID', 'Item', 'Qty', 'Part or candidate', 'Specification', 'Source', 'Destination', 'Purpose', 'Need', 'Status', 'Manufacturer URL'],
  ...external.items.map(item => [item.id, item.item, item.quantity, item.part_or_candidate, item.specification, item.source, item.destination, item.purpose, item.need, item.status, item.manufacturer_url]),
]))
await copyFile('docs/stock-report.json', join(sourcing, 'stock-snapshot.json'))

const copies = [
  ['docs/brake-assembly.md', 'brake-assembly.md'],
  ['engineering/mechanical/brake-evidence.json', 'brake-evidence.json'],
  ['engineering/encoder-top-eco.json', 'encoder-top-eco.json'],
  ['docs/usb-access.md', 'usb-access.md'],
  ['docs/usb-access-check.json', 'usb-access-check.json'],
  ['engineering/usb-edge-eco.json', 'usb-edge-eco.json'],
  ['docs/u16-footprint.md', 'u16-footprint.md'],
  ['docs/u35-footprint.md', 'u35-footprint.md'],
  ['firmware/pd/ti-configuration.zip', 'pd1180-ti-configuration.zip'],
  ['docs/pd-configuration.json', 'pd-configuration.json'],
  ['docs/pd-configuration-review.md', 'pd-configuration-review.md'],
  ['docs/pd-image-check.json', 'pd-image-check.json'],
  ['docs/readiness.md', 'readiness.md'],
  ['docs/completion-handoff.md', 'completion-handoff.md'],
  ['engineering/mechanical/splice-evidence.json', 'splice-evidence.json'],
  ['engineering/mechanical/TE-320559-drawing.zip', 'TE-320559-drawing.zip'],
  ['engineering/filled-copper-review.json', 'filled-copper-review.json'],
  ['docs/sourcing-resolution.md', 'sourcing-resolution.md'],
  ['docs/manufacturing-acceptance.md', 'manufacturing-acceptance.md'],
  ['sourcing/replacement-catalog-evidence.json', 'replacement-catalog-evidence.json'],
  ['sourcing/procurement-open-items.csv', 'procurement-open-items.csv'],
  ['docs/placement-review.md', 'placement-review.md'],
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
  ['docs/assembly.md', 'assembly.md'],
  ['docs/external-system.md', 'external-system.md'],
  ['docs/external-parts.json', 'external-parts.json'],
  ['docs/brake-integration.md', 'brake-integration.md'],
  ['sourcing/external-items.csv', 'external-items.csv'],
  ['docs/motor-assembly.md', 'motor-assembly.md'],
  ['engineering/motor-harness.json', 'motor-harness.json'],
  ['engineering/reference-comparison.json', 'reference-comparison.json'],
  ['docs/reference-review.md', 'reference-review.md'],
  ['docs/indicators.md', 'indicators.md'],
  ['docs/pd-programming.md', 'pd-programming.md'],
  ['docs/connector-harnesses.md', 'connector-harnesses.md'],
  ['docs/complete-assembly.md', 'complete-assembly.md'],
  ['engineering/mechanical/harness-layout.json', 'harness-layout.json'],
  ['docs/release-status.json', 'release-status.json'],
  ['hardware-contract.json', 'hardware-contract.json'],
  ['dist/pd1180-epr-r0.3-manufacturing.zip', 'pd1180-epr-r0.3-manufacturing.zip'],
]
for (const [from, to] of copies) await copyFile(from, join(release, to))
await writeFile(join(release, 'motor-harness.md'), (await readFile('docs/motor-harness.md', 'utf8'))
  .replace('../engineering/motor-harness.json', 'motor-harness.json')
  .replace('../hardware-contract.json', 'hardware-contract.json'))
await writeCloudViewerCircuit()
execFileSync('bun', ['scripts/check-cloud-package.mjs'], { stdio: 'inherit' })
// Build from this exact routed circuit, never from a previous preview's GLB.
// The CLI may report conversion errors without failing the build, so remove
// its old output and require a complete GLB before packaging it.
const routedGlb = 'dist/release/3d.glb'
await rm(routedGlb, { force: true })
await renderLocalMechanical('release/circuit.json', routedGlb, 'offline-routed')
const glb = await readFile(routedGlb)
if (glb.length < 12 || glb.toString('ascii', 0, 4) !== 'glTF' ||
    glb.readUInt32LE(4) !== 2 || glb.readUInt32LE(8) !== glb.length)
  throw new Error('Routed 3D export is missing or invalid')
const motorAssemblyGlb = 'dist/motor-assembly/3d.glb'
await rm(motorAssemblyGlb, { force: true })
await renderLocalMechanical('dist/motor-assembly/circuit.json', motorAssemblyGlb, 'offline-assembly')
execFileSync('bun', ['scripts/check-motor-assembly.mjs', routedGlb, motorAssemblyGlb], { stdio: 'inherit' })
execFileSync('bun', ['scripts/check-harness-assembly.mjs', routedGlb], { stdio: 'inherit' })
execFileSync('bun', ['scripts/check-cable-support.mjs'], { stdio: 'inherit' })
execFileSync('bun', ['scripts/check-mechanical-assets.mjs'], { stdio: 'inherit' })
await copyFile('docs/harness-assembly-check.json', join(release, 'harness-assembly-check.json'))
await copyFile('docs/motor-assembly-check.json', join(release, 'motor-assembly-check.json'))
const activeSheetFiles=new Set((await readdir('dist/schematics')).filter(file=>file.endsWith('.svg')))
for(const file of await readdir(join(release,'schematics'))) if(file.endsWith('.svg')&&!activeSheetFiles.has(file)) await rm(join(release,'schematics',file))
for (const file of await readdir('dist/schematics')) {
  if (file.endsWith('.svg')) await copyFile(join('dist/schematics', file), join(release, 'schematics', file))
}

async function zipDirectory(directory, destination) {
  const zip = new JSZip()
  async function add(path, prefix = '') {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.name.endsWith('.kicad_prl') || entry.name.endsWith('.lck')) continue
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
  zipFile(motorAssemblyGlb, '34hs31-6004s1-assembly-proposal.glb', join(release, '34hs31-6004s1-assembly-proposal.zip')),
])

await writeFile(join(release, 'README.md'), `# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## ${releaseStatus.revision} review handoff — powered validation pending

${releaseStatus.fabrication_orderable ? 'Prototype CAD gates passed; system validation remains open.' : '**ORDER HOLD.** These are engineering review files. Powered USB, current/thermal and system qualification remain open; do not submit a fabrication order from this package.'}

The ECO separates PD POWER and USB DATA, removes unsupported CAN/RS485/RS232 and general I/O circuits and the remaining J7 external command path, adds local START/STOP using the TMC5160 internal SPI ramp, while retaining external MOSFET bridges. USB DATA alone powers setup/diagnostics through a current-limited, reverse-blocked supply; the motor-bus backup supply is retained for brake control after PD loss. Status: ${releaseStatus.status}. See \`engineering/reviewer-eco.json\` and \`docs/step-dir-hardware-review.md\`.

The ordered motor is STEPPERONLINE 34HS31-6004S1 (Amazon B091C83HWF). Its exact manufacturer STEP replaces the QSH reference. Existing four PCB holes are unchanged. Unsupported posts, adapter and fasteners have been removed; rear attachment and encoder mounting remain unresolved. See \`motor-assembly.md\` for the alignment preview and unresolved mechanical gates.

RGB, independent board-power indication, a reset-safe buzzer and eight new power/programming pads are included. See \`indicators.md\` and \`pd-programming.md\` for states, supply allocation and isolated EEPROM programming. The fixture and TI image still require qualification.

The power ECO uses TPS26630 1× latch-off limiting at nominal 3.607 A, sets motor inhibit to nominal 53.21 V, and includes a 100 V brake-cable recirculation diode and ADS1115 startup and runtime brake-voltage monitoring. The conservative input screen is 4.252 A including the 250 mA upstream allocation; the nominal 48 V motor-input budget is approximately 173 W. The conservative motor-current ceiling is 3.8 A RMS; the supplied profile remains locked at approximately 0.827 A / 10 rpm unloaded until all hardware qualification flags can be justified, and requests above 240 permille are rejected before SPI access. The runtime continuity check accounts for muxed ADC sample skew with a bounded observation gap; it does not qualify the heatsink or contain energy after every brake fault. See \`power-validation.md\` and the repository's \`engineering/protection-refinement.json\`.

The included \`pd1180-commissioning-firmware.zip\` contains a real STM32 image with USB diagnostics. Motor power and motion remain locked. It does not prove motor operation.

J3 now includes the mating plug, paired cable, rings and provisional resistor/cooling installation; see \`brake-assembly.md\`. J2 is JST VH and requires the separate VHR-4N cable assembly specified in \`motor-harness.md\`. J7 and its external input conditioning are removed; SW2 provides local START/STOP and SW1 remains RESET. U18 alone is on the bottom; C52/C53 are on top; all three are DNP, excluded from fitted BOM/CPL and paste. All ${stock.parts.reduce((total, part) => total + part.quantity_per_board, 0)} fitted parts remain top-side. The ordered single-shaft motor has no qualified rear magnet interface.

The requested delivery is a fully assembled, programmed and functionally tested PCBA. \`order-settings.json\` requests programming and functional testing, with provider acceptance still pending. U3's register-reviewed TI full-flash candidate is included in pd1180-ti-configuration.zip, with programming/readback pending. A qualified motor-enabled U16 image is still missing; the commissioning ZIP is not a substitute. Follow the repository README for wiring and diagnostic startup, and the included \`assembly.md\` for the provider request, first-article programming sequence and per-board acceptance requirements. Programming verification and the approved powered motor tests must pass before shipment. Blank or motion-locked boards do not satisfy ready-to-run delivery. No order or test service has been booked.

This is a held review package, not an orderable handoff. After the DRC, sourcing and other order gates are resolved, use newly regenerated Gerbers together with \`jlc-bom.csv\` plus \`jlc-cpl.csv\` for top-side assembly. Apply every value in \`order-settings.json\`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for every via-in-pad listed in the order settings (including 40 MOSFET drain-pad and four U34 thermal vias), and top-side assembly.

Legacy archive/KiCad basenames retain the r0.3 suffix for pipeline compatibility; their contents and hardware contract correspond to ${releaseStatus.revision}, identified by this delivery manifest.

The native reports contain ${kicadDrc.violations.length} raw PCB DRC findings (the exact user-accepted cosmetic baseline), ${kicadDrc.unconnected_items.length} unconnected items, ${kicadDrc.schematic_parity.length} schematic-parity issues and ${kicadErcViolations.length} schematic ERC violations. See \`kicad-drc.json\` and \`kicad-erc.json\`. Live JLCSearch plus exact-ID official catalog evidence covers all ${stock.parts.length} unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all ${standards.project_geometry.schematic_sheet_count} sheets; see \`schematic-style-check.json\`. \`circuit.json\` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

External equipment and candidates are listed in [external-system.md](external-system.md) and [external-parts.json](external-parts.json); the current profile requires a qualified brake assembly.

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
    kicad_drc_violations: kicadDrc.violations.length,
    kicad_unconnected_items: kicadDrc.unconnected_items.length,
    kicad_schematic_parity_issues: kicadDrc.schematic_parity.length,
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
