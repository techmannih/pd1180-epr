import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { sha256 } from './cloud-package.mjs'

const directory = resolve(process.argv[2] || '.')
const read = (path) => readFile(resolve(directory, path))
const manifest = JSON.parse(await read('cloud-source.json'))
for (const input of manifest.files) {
  if (sha256(await read(input.path)) !== input.sha256) throw new Error(`Cloud build modified its source: ${input.path}`)
}
const source = JSON.parse(await read('release/circuit.json'))
const built = JSON.parse(await read('dist/release/circuit.json'))
if (JSON.stringify(source) !== JSON.stringify(built)) throw new Error('Built routed PCB differs from the committed source')
for (const type of ['pcb_trace', 'pcb_via', 'pcb_copper_pour', 'schematic_component', 'cad_component']) {
  if (!built.some((row) => row.type === type)) throw new Error(`Routed output is missing ${type}`)
}
if (built.some((row) => row.type?.endsWith('_error') || row.error_type)) throw new Error('Routed output contains circuit errors')
for (const path of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.html']) {
  if (!(await stat(resolve(directory, path))).size) throw new Error(`Empty output: ${path}`)
}
if (!(await read('dist/index.html')).toString().includes('release/circuit.json')) throw new Error('Site does not open the verified routed PCB')
const png = await read('dist/release/3d.png')
if (png.length < 24 || !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || !png.readUInt32BE(16) || !png.readUInt32BE(20)) throw new Error('Missing or invalid 3D preview PNG')
console.log(JSON.stringify({ commit: manifest.commit_sha, source_files_verified: manifest.files.length, routed_records_verified: built.length, output_matches_source: true }, null, 2))
