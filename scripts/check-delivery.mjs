import { createHash } from 'node:crypto'
import { access, readFile, stat, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { createCloudViewerCircuit } from './generate-cloud-viewer.mjs'

const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const hashes = JSON.parse(await readFile('release/sha256.json', 'utf8'))
const manifest = JSON.parse(await readFile('release/delivery-manifest.json', 'utf8'))
const errors = []
const checked = []

const rootManifest = await readFile('delivery-manifest.json', 'utf8').catch(() => '')
const releaseManifest = await readFile('release/delivery-manifest.json', 'utf8')
if (rootManifest !== releaseManifest) errors.push('Root delivery-manifest.json does not match release/delivery-manifest.json')

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
