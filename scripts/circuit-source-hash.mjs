import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export function circuitSourceHash(circuit) {
  const source = circuit.map((element) => {
    if (element.type !== 'source_project_metadata') return element
    // This CLI cache key includes generated reports and release artifacts.
    // Retain all circuit data and other metadata in the verification hash.
    const { source_filesystem_md5_hash, ...metadata } = element
    return metadata
  })
  return createHash('sha256').update(JSON.stringify(source)).digest('hex')
}

if (import.meta.main) {
  console.log(circuitSourceHash(JSON.parse(await readFile(process.argv[2], 'utf8'))))
}
