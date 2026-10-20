import { mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { createCloudPackage, CLOUD_PACKAGE_NAME, sha256, verifyCloudInventory, hostedBuildState } from './cloud-package.mjs'

// Reuse the normal local CLI login. Capture its credential privately; never
// print it, put it in command arguments, or include it in the archive/report.
let token = process.env.TSCIRCUIT_TOKEN
if (!token) {
  try {
    const output = execFileSync(resolve('node_modules/.bin/tsci'), ['auth', 'print-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    token = output.match(/^Your Token:\s+(\S+)\s*$/)?.[1]
  } catch { /* Report only the sign-in requirement, not subprocess output. */ }
}
if (!token) throw new Error('Run tsci auth login first, then rerun publish:cloud')
const args = process.argv.slice(2)
if (args.some((arg) => arg.startsWith('--') && arg !== '--latest')) throw new Error('Usage: bun scripts/publish-cloud-package.mjs [commit] [--latest]')
const ref = args.find((arg) => !arg.startsWith('--')) || 'HEAD'
const promote = args.includes('--latest')
const { manifest, archive, files } = createCloudPackage({ ref })
const packageJson = JSON.parse(files.find((file) => file.file_path === 'package.json').content_text)
const version = `${packageJson.version.split('-')[0]}-cloud.${manifest.commit_sha.slice(0, 12)}`
const packageNameWithVersion = `${CLOUD_PACKAGE_NAME}@${version}`
const api = 'https://api.tscircuit.com'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(route, body, { allow404 = false } = {}) {
  const response = await fetch(`${api}/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  })
  if (allow404 && response.status === 404) return null
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}; request body and credentials omitted`)
  const result = await response.json()
  if (result.ok === false) throw new Error(`${route}: ${result.error?.error_code || 'request failed'}`)
  return result
}

async function requireCurrentMain() {
  const response = await fetch('https://api.github.com/repos/techmannih/pd1180-epr/commits/main', {
    headers: { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok || (await response.json()).sha !== manifest.commit_sha) throw new Error('--latest requires the current remote main commit')
}

if (promote) await requireCurrentMain()
// No change to the package's GitHub link, the board source, or the current
// latest release. Only --latest may promote, after full output verification.
const existing = await request('package_releases/get', { package_name_with_version: packageNameWithVersion }, { allow404: true })
let release = existing?.package_release
if (release && release.github_commit_sha !== manifest.commit_sha) throw new Error('Existing version has a different commit; refusing to overwrite it')
if (!release) {
  release = (await request('package_releases/create', {
    package_name_with_version: packageNameWithVersion,
    commit_sha: manifest.commit_sha,
    ready_to_build: false,
    is_latest: false,
  })).package_release
}
const id = release.package_release_id
const url = `https://tscircuit.com/${CLOUD_PACKAGE_NAME}/releases/${id}`
console.log(JSON.stringify({ release: url, commit: manifest.commit_sha, source_files: files.length, source_bytes: manifest.source_bytes, archive_bytes: archive.length }))

const inventory = await request('package_files/list', { package_release_id: id })
if (!inventory.package_files.length) {
  // One transactional archive upload exposes the whole source tree together.
  // Never fall back to individual file writes (which can trigger partial builds).
  const uploaded = await request('package_files/upload_archive', { package_release_id: id, archive_base64: archive.toString('base64') })
  verifyCloudInventory(manifest, uploaded.package_files)
} else {
  verifyCloudInventory(manifest, inventory.package_files)
  if (release.display_status === 'error' || release.display_status === 'failed') {
    throw new Error(`Previous hosted attempt failed. Inspect ${url} before explicitly rebuilding it`)
  }
}
const registered = await request('package_files/list', { package_release_id: id })
verifyCloudInventory(manifest, registered.package_files)
const fileText = async (file_path) => {
  const { package_file: file } = await request('package_files/get', { package_release_id: id, file_path })
  const text = file?.content_text ?? (file?.content_base64 ? Buffer.from(file.content_base64, 'base64').toString('utf8') : null)
  if (text === null) throw new Error(`Missing hosted contents: ${file_path}`)
  return text
}
// Verify source bytes, not only the number or names of uploaded files.
for (let offset = 0; offset < manifest.files.length; offset += 4) {
  await Promise.all(manifest.files.slice(offset, offset + 4).map(async (input) => {
    if (sha256(await fileText(input.path)) !== input.sha256) throw new Error(`Hosted source hash mismatch: ${input.path}`)
  }))
}
console.log(`Verified all ${manifest.source_files} source hashes; waiting for the hosted build`)
const deadline = Date.now() + 45 * 60_000
let success = false
while (Date.now() < deadline) {
  release = (await request('package_releases/get', { package_release_id: id })).package_release
  if (release.user_code_job_error) throw new Error(`Hosted build failed: ${release.user_code_job_error.message}; ${url}`)
  const build = release.latest_package_build_id
    ? (await request('package_builds/get', { package_build_id: release.latest_package_build_id })).package_build
    : null
  const state = hostedBuildState(build)
  console.log(`Hosted build: ${state}; ${url}`)
  if (state === 'complete') { success = true; break }
  await sleep(30_000)
}
if (!success) throw new Error(`Hosted completion was not confirmed within 45 minutes; ${url}`)
const expected = JSON.parse(files.find((file) => file.file_path === 'release/circuit.json').content_text)
const built = JSON.parse(await fileText('dist/release/circuit.json'))
if (JSON.stringify(expected) !== JSON.stringify(built)) throw new Error('Hosted routed board differs from the committed board')
for (const path of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts']) {
  if (!(await fileText(path)).trim()) throw new Error(`Empty hosted output: ${path}`)
}
const site = await fileText('dist/index.html')
if (!site.includes('release/circuit.json')) throw new Error('Hosted site does not select the verified routed board')
const imageUrl = new URL(`${api}/package_files/view`)
imageUrl.search = new URLSearchParams({ package_release_id: id, file_path: 'dist/release/3d.png' }).toString()
// Public image request: never forward the publishing token to a CDN redirect.
const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) })
if (!imageResponse.ok) throw new Error(`Hosted 3D preview is unavailable: HTTP ${imageResponse.status}`)
const png = Buffer.from(await imageResponse.arrayBuffer())
if (png.length < 24 || !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || !png.readUInt32BE(16) || !png.readUInt32BE(20)) throw new Error('Hosted 3D preview is not a valid PNG')
if (promote) {
  await requireCurrentMain()
  await request('package_releases/update', { package_release_id: id, is_latest: true })
}
await mkdir('build/cloud-package', { recursive: true })
const result = { url, package_release_id: id, commit: manifest.commit_sha, source_files: files.length, source_bytes: manifest.source_bytes, archive_bytes: archive.length, routed_records: built.length, routed_sha256: manifest.routed_sha256, preview_png_bytes: png.length, source_hashes_verified: true, hosted_outputs_verified: true, promoted: promote }
await writeFile(`build/cloud-package/${manifest.commit_sha}.hosted.json`, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
