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
const viaInPad = JSON.parse(await readFile('engineering/rp2040-via-in-pad.json', 'utf8'))
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
  ['docs/usb-pd-architecture.md', 'usb-pd-architecture.md'],
  ['engineering/reviewer-power-reference.json', 'reviewer-power-reference.json'],
  ['engineering/schematic-review-baseline.json', 'schematic-review-baseline.json'],
  ['docs/rp2040-redesign.md', 'rp2040-redesign.md'],
  ['engineering/rp2040-redesign.json', 'rp2040-redesign.json'],
  ['engineering/rp2040-native-review.zip', 'rp2040-native-review.zip'],
  ['engineering/rp2040-copper-evidence.zip', 'rp2040-copper-evidence.zip'],
  ['engineering/rp2040-via-in-pad.json', 'rp2040-via-in-pad.json'],
  ['routing/power-feed.json', 'power-feed.json'],
  ['docs/copper-geometry-review.md', 'copper-geometry-review.md'],
  ['docs/source-design-rules.md', 'source-design-rules.md'],
  ['docs/source-design-rules-check.json', 'source-design-rules-check.json'],
  ['engineering/copper-geometry-review.json', 'copper-geometry-review.json'],
  ['docs/copper-contact-review.png', 'copper-contact-review.png'],
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
  ['docs/commissioning.md', 'commissioning.md'],
  ['engineering/commissioning-record.template.json', 'commissioning-record.template.json'],
  ['docs/completion-handoff.md', 'completion-handoff.md'],
  ['engineering/mechanical/splice-evidence.json', 'splice-evidence.json'],
  ['engineering/mechanical/TE-320559-drawing.zip', 'TE-320559-drawing.zip'],
  ['engineering/filled-copper-review.json', 'filled-copper-review.json'],
  ['docs/sourcing-resolution.md', 'sourcing-resolution.md'],
  ['docs/manufacturing-acceptance.md', 'manufacturing-acceptance.md'],
  ['engineering/manufacturing-acceptance-record.json', 'manufacturing-acceptance-record.json'],
  ['engineering/mechanical/cooling-selection.json', 'cooling-selection.json'],
  ['docs/thermal-qualification.md', 'thermal-qualification.md'],
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

await writeFile(join(release, 'README.md'), `# NEMA34 fabrication, assembly and commissioning package

Revision **${releaseStatus.revision}**. This handoff contains matched PCB/assembly files, RP2040 diagnostic firmware, TI configuration, verification evidence and the post-assembly test procedure.

## Package contents and order preparation

- Use the Gerber/drill archives with \`jlc-bom.csv\`, \`jlc-cpl.csv\` and \`order-settings.json\`. Specify four layers, 1.6 mm, 1 oz on every layer, ENIG, top-side assembly and all ${viaInPad.count} epoxy-filled/copper-capped via-in-pad locations in \`rp2040-via-in-pad.json\`.
- Include through-hole WAGO J2/J3 terminals and tall capacitors in the assembly scope. All ${stock.parts.reduce((total, part) => total + part.quantity_per_board, 0)} fitted placements are top-side. Optional U18 is bottom DNP; C52/C53 are top DNP and all three are excluded from paste and the fitted BOM/CPL.
- Allocate the exact fitted-part quantities from the timestamped sourcing reports. Record the supplier's stack-up/USB impedance, USB-hole geometry and critical-marking disposition in \`manufacturing-acceptance-record.json\`.
- Prepare the external EPR source/cable, motor harness, driver cooler/TIM/support and J3 resistor/cooler/guard using \`assembly.md\`, \`external-system.md\` and \`thermal-qualification.md\`. The selected first-article brake resistor is 10 ohm / 300 W at its specified case temperature; installed duty is established by measurements.
- The ordered motor is STEPPERONLINE 34HS31-6004S1 (Amazon B091C83HWF). Four PCB axes align to its archived STEP. Measure rear thread/usable engagement and physical clearance before selecting screws/spacers; the modeled separation is not a fastening specification.

## Connections and software

J1 POWER negotiates 48 V / 5 A EPR through TPS26750. J10 DATA powers RP2040 and its boot flash, with U39/U40 isolating board-powered signals. Connect both for motor testing. J2 WAGO 2601-3104 connects the two windings; J3 WAGO 236-402 connects VMOTOR through the resistor to switched BRAKE_RETURN. The motor-bus-derived supplies retain independent brake control after PD loss. See \`usb-pd-architecture.md\` for every IC's purpose.

\`pd1180-ti-configuration.zip\` supplies the register-reviewed TI full-flash image. \`pd1180-commissioning-firmware.zip\` supplies RP2040 ELF/BIN/UF2 diagnostics. Follow \`commissioning.md\` for full EEPROM/QSPI readback, cold boot and the serial-bound prerequisite record. Every profile starts disarmed; the default image keeps motor power/motion inhibited.

The explicit \`power-test\` profile provides a 30-second stationary VMOTOR test with ENABLE/STEP low. The explicit \`bench-test\` profile requests <=0.8 A RMS (~0.773 A nominal), 10 rpm unloaded, a 10-second run and one-second stop ramp. Local START and live interlocks remain required. These software profiles let the assembly/test team collect the subsequent current, braking and thermal results without editing safety flags.

\`assembly.md\` includes a provider brief and a staged programming/test work order. Agree which post-assembly stages the provider or receiving team performs; no service has been booked by this repository work.

## Verification evidence

The paired native reports record ${kicadDrc.violations.length} raw DRC findings: eight J1/J10 hole-clearance errors plus ${kicadDrc.violations.filter(v=>v.severity==="warning").length} cosmetic warnings, with no other native errors. They report ${kicadDrc.unconnected_items.length} unconnected items, ${kicadDrc.schematic_parity.length} schematic-parity issues and ${kicadErcViolations.length} schematic ERC violations. Retain \`kicad-drc.json\` and \`kicad-erc.json\` for the manufacturer review.

\`verification.json\` records the checked software/CAD inputs. \`schematic-style-check.json\` covers all ${standards.project_geometry.schematic_sheet_count} sheets. \`circuit.json\` preserves the source schematic and replays the verified native copper. \`power-validation.md\` describes the behavioral screens and post-assembly measurements: the current 2000 uF bank reaches 54.321 V in the nominal-delay 6 A winding model, while the 100 us delay case reaches 54.745 V and misses the allocated 0.5 V reserve below 55 V. Use the bounded test profile and measured results to define a later load/current envelope.

Use the PCB images and the 100%-scale mounting template for inspection. The zipped board/assembly GLBs show the nominal geometry; cooler/guard concepts are distinguished from fitted installation drawings in the thermal guide. Legacy r0.3 archive basenames are retained for pipeline compatibility; their contents use this revision. \`delivery-manifest.json\` identifies file sizes/hashes and \`sha256.json\` covers the release directory. Acceptance states remain in \`release-status.json\`; physical results are recorded after assembly.
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
