import { test, expect } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCloudPackage, decodeArchive, selectCloudPaths, sha256, verifyCloudInventory, hostedBuildState, createCloudApiClient } from './cloud-package.mjs'

const paths = ['index.circuit.tsx', 'motor-assembly.circuit.tsx', 'imports/Part.tsx', 'imports/Model.ts', 'release/circuit.json', 'package.json', 'bun.lock', 'tsconfig.json', 'tscircuit.config.json', 'tscircuit.config.ts']
const config = { ignoredFiles: ['docs/**', 'scripts/**', 'release/*.zip', 'release/*.md'] }

test('retries transient reads, but never repeats an uncertain mutation or authentication failure', async () => {
  let calls = 0
  const delays = []
  const read = createCloudApiClient({
    token: 'test-only',
    wait: async (ms) => { delays.push(ms) },
    fetcher: async () => {
      calls++
      if (calls === 1) throw new Error('ECONNRESET')
      if (calls === 2) return new Response('', { status: 503 })
      return Response.json({ ok: true })
    },
  })
  expect(await read('package_builds/get', {})).toEqual({ ok: true })
  expect(delays).toEqual([1000, 2000])
  for (const route of ['package_releases/create', 'package_files/upload_archive', 'package_releases/update']) {
    let writes = 0
    const mutation = createCloudApiClient({ token: 'test-only', fetcher: async () => { writes++; throw new Error('ECONNRESET') } })
    await expect(mutation(route, {})).rejects.toThrow('network request failed')
    expect(writes).toBe(1)
  }
  let forbidden = 0
  const auth = createCloudApiClient({ token: 'test-only', fetcher: async () => { forbidden++; return new Response('', { status: 403 }) } })
  await expect(auth('package_files/list', {})).rejects.toThrow('HTTP 403')
  expect(forbidden).toBe(1)
  let unavailable = 0
  const failed = createCloudApiClient({ token: 'test-only', wait: async () => {}, fetcher: async () => { unavailable++; throw new Error('offline') } })
  await expect(failed('package_releases/get', {})).rejects.toThrow('network request failed')
  expect(unavailable).toBe(4)
})

test('accepts only completed jobs with no errors, independently of stale display labels', () => {
  const complete = { build_in_progress: false, user_code_job_started_at: 'start', user_code_job_completed_at: 'end' }
  expect(hostedBuildState(null)).toBe('pending')
  expect(hostedBuildState({ display_status: 'ready' })).toBe('pending')
  expect(hostedBuildState({ ...complete, build_in_progress: true })).toBe('pending')
  expect(hostedBuildState({ ...complete, display_status: 'pending' })).toBe('complete')
  for (const key of ['user_code_job_error', 'transpilation_error', 'circuit_json_build_error', 'image_generation_error']) {
    expect(() => hostedBuildState({ ...complete, [key]: { message: 'failed' } })).toThrow()
  }
})

test('excludes engineering payload, build output and secrets before upload', () => {
  expect(selectCloudPaths([...paths, 'docs/test.md', 'scripts/check.mjs', 'engineering/motor.glb', 'dist/index.js', 'release/files.zip', 'release/readiness.md', '.env', 'imports/.env', '../secret'], config)).toEqual(paths.toSorted())
})

test('rejects missing or accidentally excluded source, imports and routed board', () => {
  expect(() => selectCloudPaths(paths.filter((path) => path !== 'release/circuit.json'), config)).toThrow('release/circuit.json')
  expect(() => selectCloudPaths(paths, { ignoredFiles: ['imports/**'] })).toThrow('imports/Part.tsx')
  expect(() => selectCloudPaths(paths, { ignoredFiles: ['index.circuit.tsx'] })).toThrow('index.circuit.tsx')
})

test('roundtrips exact committed bytes and excludes uncommitted edits', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'pd1180-cloud-'))
  const git = (...args) => execFileSync('git', args, { cwd, stdio: 'pipe' })
  try {
    git('init', '-q')
    for (const path of [...paths, 'docs/test.md']) {
      mkdirSync(join(cwd, path, '..'), { recursive: true })
      writeFileSync(join(cwd, path), path === 'tscircuit.config.json' ? JSON.stringify(config) : `committed ${path}\n`)
    }
    git('add', '.')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture')
    writeFileSync(join(cwd, 'index.circuit.tsx'), 'uncommitted change')
    writeFileSync(join(cwd, '.env'), 'not for upload')
    const { manifest, archive, files } = createCloudPackage({ cwd })
    expect(decodeArchive(archive)).toEqual(files)
    expect(files.find((file) => file.file_path === 'index.circuit.tsx').content_text).toBe('committed index.circuit.tsx\n')
    expect(manifest.routed_sha256).toBe(sha256('committed release/circuit.json\n'))
    expect(() => verifyCloudInventory(manifest, files)).not.toThrow()
    expect(() => verifyCloudInventory(manifest, files.slice(1))).toThrow()
    expect(() => verifyCloudInventory(manifest, [...files, { file_path: 'docs/test.md' }])).toThrow()
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
