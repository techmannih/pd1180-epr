import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createCloudPackage, sha256 } from './cloud-package.mjs'

const ref = process.argv[2] || 'HEAD'
const { manifest, archive, files } = createCloudPackage({ ref })
const output = resolve('build/cloud-package', manifest.commit_sha)
await mkdir(output, { recursive: true })
for (const file of files) {
  const destination = resolve(output, file.file_path)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, file.content_text ?? Buffer.from(file.content_base64, 'base64'))
}
await writeFile(`${output}.json.gz`, archive)
await writeFile(`${output}.manifest.json`, `${JSON.stringify({ ...manifest, archive_bytes: archive.length, archive_sha256: sha256(archive) }, null, 2)}\n`)
console.log(JSON.stringify({ output, archive: `${output}.json.gz`, commit: manifest.commit_sha, files: files.length, source_bytes: manifest.source_bytes, archive_bytes: archive.length }, null, 2))
