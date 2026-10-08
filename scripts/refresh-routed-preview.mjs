import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { checkTracesAreContiguous } from '@tscircuit/checks'
import { writeCloudViewerCircuit } from './generate-cloud-viewer.mjs'

// Reuse the native-DRC-checked PCB only while its guarded topology, footprint,
// placement and board hash match. This command does not approve a new release.
function run(command) {
  const result = spawnSync('bun', ['run', command], { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} failed; routed preview not published`)
}
const sha = (data) => createHash('sha256').update(data).digest('hex')
const sourceBefore = sha(await readFile('index.circuit.tsx'))
run('build:preview')
run('check:routing-fingerprint')
run('check:kicad-drc')
const source = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))
const sourceErrors = source.filter((row) => row.type.endsWith('_error'))
const pathErrors = checkTracesAreContiguous(source)
if (sourceErrors.length || pathErrors.length) {
  throw new Error(`Source PCB path errors: ${JSON.stringify([...sourceErrors, ...pathErrors])}`)
}
if (sha(await readFile('index.circuit.tsx')) !== sourceBefore) {
  throw new Error('Source changed during build; rerun build:pcb')
}

const { circuit } = await writeCloudViewerCircuit()
const schematic = (rows) => rows.filter((row) => row.type.startsWith('schematic_'))
if (JSON.stringify(schematic(source)) !== JSON.stringify(schematic(circuit))) {
  throw new Error('Routed preview changed the schematic')
}
run('check:cloud-viewer')

// Refresh only this viewer artifact's manifest/hash entries. Manufacturing,
// verification and schematic-review evidence keep their original hashes.
const manifest = JSON.parse(await readFile('release/delivery-manifest.json', 'utf8'))
const artifact = manifest.artifacts.find((entry) => entry.path === 'circuit.json')
if (!artifact) throw new Error('Viewer artifact is missing from the delivery manifest')
const viewer = await readFile('release/circuit.json')
artifact.bytes = viewer.length
artifact.sha256 = sha(viewer)
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`
await writeFile('release/delivery-manifest.json', manifestText)
await writeFile('delivery-manifest.json', manifestText)
const hashes = JSON.parse(await readFile('release/sha256.json', 'utf8'))
hashes['circuit.json'] = sha(viewer)
hashes['delivery-manifest.json'] = sha(manifestText)
await writeFile('release/sha256.json', `${JSON.stringify(hashes, null, 2)}\n`)
run('check:delivery')
console.log('Routed PCB preview refreshed; source schematic preserved exactly.')
