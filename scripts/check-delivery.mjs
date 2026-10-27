import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { access, readFile, stat, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { validatePdImage } from './pd-image-policy.mjs'
import { createCloudViewerCircuit } from './generate-cloud-viewer.mjs'

const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const hashes = JSON.parse(await readFile('release/sha256.json', 'utf8'))
const manifest = JSON.parse(await readFile('release/delivery-manifest.json', 'utf8'))
const errors = []
try {
  execFileSync('bun', ['scripts/export-assembly.mjs', '--check', 'release'], { stdio: 'pipe' })
} catch {
  errors.push('Release BOM or component placements do not match the current source')
}
const checked = []
for (const [source, delivered] of [
  ['docs/copper-geometry-review.md', 'release/copper-geometry-review.md'],
  ['docs/source-design-rules.md', 'release/source-design-rules.md'],
  ['docs/source-design-rules-check.json', 'release/source-design-rules-check.json'],
  ['engineering/copper-geometry-review.json', 'release/copper-geometry-review.json'],
  ['docs/copper-contact-review.png', 'release/copper-contact-review.png'],
]) if (!(await readFile(source)).equals(await readFile(delivered).catch(() => Buffer.alloc(0)))) errors.push(`${delivered}: stale copper review evidence`)

// Wiring/purchase guidance must travel with the package and match the current
// source documents, including the distinction between candidates and purchases.
for (const name of ['brake-assembly.md', 'usb-access.md', 'usb-access-check.json', 'external-system.md', 'external-parts.json', 'brake-integration.md', 'pd-configuration.json', 'pd-configuration-review.md', 'pd-image-check.json', 'readiness.md', 'placement-review.md', 'completion-handoff.md', 'sourcing-resolution.md', 'manufacturing-acceptance.md', 'u16-footprint.md', 'u35-footprint.md']) {
  const current = await readFile(`docs/${name}`, 'utf8')
  const delivered = await readFile(`release/${name}`, 'utf8').catch(() => '')
  if (current !== delivered) errors.push(`release/${name}: differs from current source guidance`)
}
if (await readFile('engineering/usb-edge-eco.json', 'utf8') !== await readFile('release/usb-edge-eco.json', 'utf8').catch(() => ''))
  errors.push('release/usb-edge-eco.json: stale USB placement evidence')
const externalItems = await readFile('sourcing/external-items.csv', 'utf8')
if (externalItems !== await readFile('release/external-items.csv', 'utf8').catch(() => ''))
  errors.push('release/external-items.csv: differs from the sourcing inventory')

for (const name of ['replacement-catalog-evidence.json', 'procurement-open-items.csv']) {
  if (await readFile(`sourcing/${name}`, 'utf8') !== await readFile(`release/${name}`, 'utf8').catch(() => '')) errors.push(`release/${name}: stale sourcing handoff`)
}

const rootManifest = await readFile('delivery-manifest.json', 'utf8').catch(() => '')
const releaseManifest = await readFile('release/delivery-manifest.json', 'utf8')
if (rootManifest !== releaseManifest) errors.push('Root delivery-manifest.json does not match release/delivery-manifest.json')

// Integrity is separate from engineering approval, but every reported count
// must faithfully retain the delivered native findings, including failures.
const nativeDrcText = await readFile('dist/manufacturing/kicad-drc.json', 'utf8')
const deliveredDrcText = await readFile('release/kicad-drc.json', 'utf8')
if (nativeDrcText !== deliveredDrcText) errors.push('Delivered DRC differs from the current native report')
const deliveredDrc = JSON.parse(deliveredDrcText)
for (const [field, count] of [
  ['violations', 'kicad_drc_violations'],
  ['unconnected_items', 'kicad_unconnected_items'],
  ['schematic_parity', 'kicad_schematic_parity_issues'],
]) {
  if (!Array.isArray(deliveredDrc[field]) || manifest.checks?.[count] !== deliveredDrc[field].length)
    errors.push(`Delivery manifest ${count} does not match the native findings`)
}

for (const path of standards.release.required_files) {
  try {
    await access(path)
    const info = await stat(path)
    if (!info.isFile() || info.size === 0) errors.push(`${path}: missing or empty`)
    checked.push({ path, bytes: info.size })
  } catch {
    errors.push(`${path}: missing`)
  }
}

for (const [relative, expected] of Object.entries(hashes)) {
  const path = `release/${relative}`
  try {
    const actual = createHash('sha256').update(await readFile(path)).digest('hex')
    if (actual !== expected) errors.push(`${path}: SHA-256 mismatch`)
  } catch {
    errors.push(`${path}: hash entry points to a missing file`)
  }
}

for (const path of standards.release.zip_files) {
  try {
    const zip = await JSZip.loadAsync(await readFile(path), { checkCRC32: true })
    const entries = Object.values(zip.files).filter((entry) => !entry.dir)
    if (!entries.length) errors.push(`${path}: archive is empty`)
    if (path.endsWith('-manufacturing.zip')) {
      for (const [name, releaseName] of [['assembly-bom.csv', 'jlc-bom.csv'], ['assembly-cpl.csv', 'jlc-cpl.csv']]) {
        const archived = zip.file(name)
        if (!archived || await archived.async('string') !== await readFile(`release/${releaseName}`, 'utf8'))
          errors.push(`${path}: ${name} differs from the current release assembly data`)
      }
    }
    if (path.endsWith('pd1180-ti-configuration.zip')) {
      const config = JSON.parse(await readFile('docs/pd-configuration.json'))
      validatePdImage(await zip.file('project.json').async('nodebuffer'), await zip.file('fullFlash.bin').async('nodebuffer'), config)
      if (!(await readFile(path)).equals(await readFile('firmware/pd/ti-configuration.zip'))) errors.push('Delivered TI archive differs from reviewed source')
    }
    if (path.endsWith('-commissioning-firmware.zip')) {
      for (const name of ['firmware.bin', 'firmware.elf', 'manifest.json', 'README.md']) {
        if (!zip.file(name)) errors.push(`${path}: ${name} missing`)
      }
      const m = JSON.parse(await zip.file('manifest.json').async('string'))
      if (m.motor_operation_enabled !== false) errors.push(`${path}: frozen-board motion must remain disabled`)
      for (const [name, hash] of Object.entries(m.artifacts)) {
        if (createHash('sha256').update(await zip.file(name).async('nodebuffer')).digest('hex') !== hash) errors.push(`${path}: ${name} hash mismatch`)
      }
    }
    if (path.endsWith('34hs31-6004s1-assembly-proposal.zip') && !zip.file('34hs31-6004s1-assembly-proposal.glb')) errors.push(`${path}: ordered motor assembly is missing`)
    if (path.endsWith('-glb.zip') && !zip.file('pd1180-epr.glb')) errors.push(`${path}: pd1180-epr.glb is missing`)
  } catch (error) {
    errors.push(`${path}: invalid ZIP (${error.message})`)
  }
}

if (manifest.product_name !== standards.product_name) errors.push('Delivery manifest product name differs from board standards')
if (manifest.revision !== standards.revision) errors.push('Delivery manifest revision differs from board standards')
const manifestPaths = new Set()
for (const artifact of manifest.artifacts || []) {
  const path = `release/${artifact.path}`
  manifestPaths.add(path)
  try {
    const data = await readFile(path)
    const actual = createHash('sha256').update(data).digest('hex')
    if (data.length !== artifact.bytes) errors.push(`${path}: delivery manifest byte count mismatch`)
    if (actual !== artifact.sha256) errors.push(`${path}: delivery manifest SHA-256 mismatch`)
  } catch {
    errors.push(`${path}: delivery manifest entry points to a missing file`)
  }
}
for (const path of standards.release.required_files) {
  if (path.endsWith('/delivery-manifest.json') || path.endsWith('/sha256.json')) continue
  if (!manifestPaths.has(path)) errors.push(`${path}: missing from delivery manifest`)
}
const expectedCloudCircuit = `${JSON.stringify((await createCloudViewerCircuit()).circuit)}\n`
const releaseCircuit = await readFile('release/circuit.json', 'utf8')
if (releaseCircuit !== expectedCloudCircuit) errors.push('release/circuit.json does not match the verified source model plus KiCad routing')

const report = {
  checked_at: new Date().toISOString(),
  required_files: standards.release.required_files.length,
  recursive_hashes: Object.keys(hashes).length,
  archives: standards.release.zip_files.length,
  cloud_viewer_circuit_match: releaseCircuit === expectedCloudCircuit,
  checked,
  errors,
}
await writeFile('docs/delivery-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ ...report, checked: `${checked.length} files` }, null, 2))
if (errors.length) process.exitCode = 1
