import { createHash } from 'node:crypto'
import JSZip from 'jszip'
import { circuitSourceHash } from './circuit-source-hash.mjs'

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
}
export function nativeKicadCircuitText(circuit) {
  return JSON.stringify(canonical(circuit.map(row => {
    if (row.type !== 'source_project_metadata') return row
    const { native_kicad_project, source_filesystem_md5_hash, ...rest } = row
    return rest
  })))
}

export async function attachNativeKicadArtifact(circuit, source, archive, reference, routedBoard) {
  if (circuitSourceHash(source) !== reference.source_circuit_sha256) throw new Error('Native KiCad artifact belongs to a different source revision; revalidate before publishing')
  const pcbMember = reference.project_file.replace(/\.kicad_pro$/, '.kicad_pcb')
  if (sha(routedBoard) !== reference.files[pcbMember]) throw new Error('Viewer PCB differs from the verified native archive')
  const zip = await JSZip.loadAsync(archive, {checkCRC32:true})
  const files = Object.values(zip.files).filter(file => !file.dir)
  if (JSON.stringify(files.map(file => file.name).sort()) !== JSON.stringify(Object.keys(reference.files).sort())) throw new Error('Native KiCad archive members changed')
  for (const file of files) {
    if (sha(await file.async('nodebuffer')) !== reference.files[file.name]) throw new Error(`Native KiCad artifact is stale: ${file.name}`)
  }
  const metadata = circuit.filter(row => row.type === 'source_project_metadata')
  if (metadata.length !== 1) throw new Error('Expected one project metadata record')
  if (!/^https:\/\/raw\.githubusercontent\.com\/techmannih\/pd1180-epr\/[a-f0-9]{40}\/release\/[^/]+\.zip$/.test(reference.url)) throw new Error('Native artifact URL must pin this repository at an immutable commit')
  metadata[0].native_kicad_project = {
    url: reference.url, sha256: reference.sha256, project_file: reference.project_file,
    circuit_json_sha256: sha(nativeKicadCircuitText(circuit)),
  }
  return circuit
}
