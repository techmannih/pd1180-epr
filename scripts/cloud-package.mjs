import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { gzipSync, gunzipSync } from 'node:zlib'

export const CLOUD_PACKAGE_NAME = 'techmannih/nema34-mounted-stepper-controller'
export const sha256 = (content) => createHash('sha256').update(content).digest('hex')
const requiredFiles = ['index.circuit.tsx', 'motor-assembly.circuit.tsx', 'release/circuit.json', 'package.json', 'bun.lock', 'tsconfig.json', 'tscircuit.config.json', 'tscircuit.config.ts']
const excludedRoots = new Set(['.git', '.github', 'node_modules', 'build', 'dist', 'checks', 'docs', 'engineering', 'firmware', 'previews', 'routing', 'scripts', 'sourcing'])

export function selectCloudPaths(paths, config) {
  const ignores = (config.ignoredFiles || []).map((pattern) => new Bun.Glob(pattern))
  const selected = paths.filter((path) => {
    if (path.startsWith('/') || path.split('/').some((part) => part === '..' || part.startsWith('.'))) return false
    if (excludedRoots.has(path.split('/')[0])) return false
    return !ignores.some((pattern) => pattern.match(path))
  }).sort()
  const required = [...requiredFiles, ...paths.filter((path) => path.endsWith('.tsx') || /^imports\/.*\.(ts|js|jsx)$/.test(path))]
  const missing = required.filter((path) => !selected.includes(path))
  if (missing.length) throw new Error(`Cloud package excludes required source files: ${missing.join(', ')}`)
  if (selected.length > 100) throw new Error(`Cloud package has ${selected.length} files; review the upload exclusions (maximum 100)`)
  return selected
}

export function decodeArchive(archive) {
  return JSON.parse(gunzipSync(archive).toString('utf8')).files
}

// Read an immutable Git tree, never the working directory. Local logs, .env,
// dependencies and half-written generated outputs cannot enter an upload.
export function createCloudPackage({ cwd = process.cwd(), ref = 'HEAD' } = {}) {
  const git = (...args) => execFileSync('git', args, { cwd, maxBuffer: 32 * 1024 * 1024 })
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`).toString().trim()
  const entries = git('ls-tree', '-rz', commit).toString().split('\0').filter(Boolean).map((entry) => {
    const [metadata, path] = entry.split('\t')
    const [mode, type, object] = metadata.split(' ')
    return { mode, type, object, path }
  })
  const byPath = new Map(entries.map((entry) => [entry.path, entry]))
  const read = (path) => {
    const entry = byPath.get(path)
    if (!entry || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) throw new Error(`Missing or non-regular cloud input: ${path}`)
    return git('cat-file', 'blob', entry.object)
  }
  const config = JSON.parse(read('tscircuit.config.json'))
  const paths = selectCloudPaths(entries.map(({ path }) => path), config)
  const files = paths.map((path) => {
    const content = read(path)
    const text = content.toString('utf8')
    if (!Buffer.from(text).equals(content) || text.includes('\0')) throw new Error(`Unexpected binary cloud input: ${path}; review the upload policy`)
    return { file_path: path, content_text: text }
  })
  const inputs = files.map(({ file_path, content_text }) => {
    const content = Buffer.from(content_text)
    return { path: file_path, bytes: content.length, sha256: sha256(content) }
  })
  const bytes = inputs.reduce((sum, file) => sum + file.bytes, 0)
  if (bytes > 10 * 1024 * 1024) throw new Error(`Cloud inputs exceed 10 MiB: ${bytes} bytes`)
  const manifest = {
    package_name: CLOUD_PACKAGE_NAME,
    commit_sha: commit,
    source_tree: git('rev-parse', `${commit}^{tree}`).toString().trim(),
    source_files: inputs.length,
    source_bytes: bytes,
    routed_sha256: inputs.find(({ path }) => path === 'release/circuit.json').sha256,
    files: inputs,
  }
  files.push({ file_path: 'cloud-source.json', content_text: `${JSON.stringify(manifest, null, 2)}\n` })
  const archive = gzipSync(JSON.stringify({ files }), { level: 9 })
  return { manifest, archive, files, config }
}

export function verifyCloudInventory(manifest, remoteFiles) {
  const expected = [...manifest.files.map(({ path }) => path), 'cloud-source.json'].sort()
  const actual = remoteFiles.map(({ file_path }) => file_path.replace(/^\.\//, '')).filter((path) => !path.startsWith('dist/')).sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Hosted source inventory differs from the filtered archive')
}

export function hostedBuildState(build) {
  if (!build) return 'pending'
  const errors = ['user_code_job_error', 'transpilation_error', 'circuit_json_build_error', 'image_generation_error'].filter((key) => build[key])
  if (errors.length) throw new Error(`Hosted build failed (${errors.join(', ')})`)
  return build.build_in_progress === false && build.user_code_job_started_at && build.user_code_job_completed_at ? 'complete' : 'pending'
}
