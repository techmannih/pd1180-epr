import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import JSZip from 'jszip'
import occtImport from 'occt-import-js'

export function requireSpliceHash(bytes, expected, label) {
  if (createHash('sha256').update(bytes).digest('hex') !== expected)
    throw new Error(`${label} differs from reviewed manufacturer evidence`)
}
export async function loadSpliceModel() {
  const evidence = JSON.parse(await readFile(new URL('../engineering/mechanical/splice-evidence.json', import.meta.url)))
  const archive = await JSZip.loadAsync(await readFile(new URL(`../${evidence.archive}`, import.meta.url)), { checkCRC32: true })
  const step = await archive.file(evidence.cad.file).async('nodebuffer')
  requireSpliceHash(step, evidence.cad.sha256, 'Splice STEP')
  requireSpliceHash(await archive.file(evidence.pdf_file).async('nodebuffer'), evidence.pdf_sha256, 'Splice drawing')
  const occt = await occtImport()
  const result = occt.ReadStepFile(step, evidence.cad.tessellation)
  if (!result.success || result.meshes.length !== evidence.cad.mesh_count)
    throw new Error('Unexpected splice STEP geometry')
  const mesh = result.meshes[0]
  const positions = Array.from(mesh.attributes.position.array), indices = Array.from(mesh.index.array)
  const z = positions.filter((_, i) => i % 3 === 2)
  let radius = 0
  for (let i = 0; i < positions.length; i += 3)
    radius = Math.max(radius, Math.hypot(positions[i], positions[i + 1]))
  const length = Math.max(...z) - Math.min(...z)
  if (Math.abs(Math.max(...z)) > 1e-6 || Math.abs(Math.min(...z) + evidence.cad.nominal_length_mm) > 1e-6 ||
      Math.abs(radius - evidence.cad.nominal_radial_envelope_mm) > 1e-6)
    throw new Error('Splice STEP origin, axis or dimensions changed')
  return { positions, indices, radius, length, step_sha256: evidence.cad.sha256 }
}
export function positionSplice(model, origin, name) {
  if (origin.length !== 3 || !origin.every(Number.isFinite)) throw new Error('Invalid splice origin')
  return { name, positions: model.positions.map((v, i) => v + origin[i % 3]), indices: model.indices,
    color: [.72, .18, .12, 1] }
}
