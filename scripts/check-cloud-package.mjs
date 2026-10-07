import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const config = JSON.parse(await readFile('tscircuit.config.json', 'utf8'))
const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const ignored = config.ignoredFiles || []
const requiredIgnores = [
  '.github/**',
  'checks/**',
  'dist/**',
  'build/**',
  'release/*.zip',
  'release/*.png',
  'release/*.svg',
  'release/*.csv',
  'release/*.md',
  'release/schematics/**',
  'release/delivery-manifest.json',
  'release/feature-parity-check.json',
  'release/hardware-contract.json',
  'release/kicad-drc.json',
  'release/kicad-erc.json',
  'release/manufacturing-report.json',
  'release/order-settings.json',
  'release/power-routing-check.json',
  'release/release-status.json',
  'release/schematic-style-check.json',
  'release/sha256.json',
  'release/verification.json',
  '__snapshots__/**',
  'docs/**',
  'engineering/**',
  'firmware/**',
  'previews/**',
  'routing/**',
  'scripts/**',
  'sourcing/**',
]
const errors = []

for (const pattern of requiredIgnores) {
  if (!ignored.includes(pattern)) errors.push(`tscircuit.config.json must ignore ${pattern}`)
}
if (config.mainEntrypoint !== 'release/circuit.json') errors.push('Cloud mainEntrypoint must use release/circuit.json')
if (!config.includeBoardFiles?.includes('release/circuit.json')) errors.push('Cloud includeBoardFiles must include release/circuit.json')
if (config.build?.routingDisabled !== true) errors.push('Cloud release builds must disable autorouting; release/circuit.json already replays verified manufacturing routing')
if ((config.build?.workerTimeoutMs || 0) < 2_700_000) errors.push('Cloud worker timeout must be at least 45 minutes')

const registryDependencies = Object.keys(packageJson.dependencies || {}).filter((name) => name.startsWith('@tsci/'))
if (registryDependencies.length) {
  errors.push(`Cloud runtime dependencies must be self-contained under imports/: ${registryDependencies.join(', ')}`)
}

const ignoredMatchers = ignored.map((pattern) => new Bun.Glob(pattern))
const shouldIgnore = (path) => ignoredMatchers.some((matcher) => matcher.match(path))
const defaultIgnoredRoots = new Set(['.git', '.tscircuit', '.vscode', 'node_modules'])
const included = []
const githubImportFiles = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const projectPath = relative('.', path).replaceAll('\\', '/')
    const root = projectPath.split('/')[0]
    if (defaultIgnoredRoots.has(root) || shouldIgnore(projectPath)) continue
    if (entry.isDirectory()) await walk(path)
    else {
      const info = await stat(path)
      included.push({ path: projectPath, bytes: info.size })
    }
  }
}
await walk('.')

// A GitHub import receives committed files, not ignored local check logs or
// scratch outputs. Measure the Git index so the release gate matches that
// payload exactly, then apply the importer's fixed dist/ZIP filter.
const gitFilesResult = Bun.spawnSync(['git', 'ls-files', '-z'])
if (gitFilesResult.exitCode !== 0) throw new Error(gitFilesResult.stderr.toString())
for (const projectPath of gitFilesResult.stdout.toString().split('\0').filter(Boolean)) {
  const root = projectPath.split('/')[0]
  if (root === 'dist' || projectPath.endsWith('.zip')) continue
  const info = await stat(projectPath)
  githubImportFiles.push({ path: projectPath, bytes: info.size })
}

const totalBytes = included.reduce((sum, file) => sum + file.bytes, 0)
const largestFiles = included.toSorted((a, b) => b.bytes - a.bytes).slice(0, 10)
const maximumPackageBytes = 20 * 1024 * 1024
const maximumFileBytes = 8 * 1024 * 1024
const githubImportBytes = githubImportFiles.reduce((sum, file) => sum + file.bytes, 0)
const maximumGitHubImportBytes = 24 * 1024 * 1024
const maximumGitHubLooseFileBytes = 24 * 1024 * 1024
if (totalBytes > maximumPackageBytes) errors.push(`Cloud source package is ${(totalBytes / 1024 / 1024).toFixed(1)} MiB; maximum is 20 MiB`)
for (const file of included.filter((item) => item.bytes > maximumFileBytes)) errors.push(`${file.path} is ${(file.bytes / 1024 / 1024).toFixed(1)} MiB; move generated binaries under an ignored directory`)
if (githubImportBytes > maximumGitHubImportBytes) errors.push(`GitHub import payload is ${(githubImportBytes / 1024 / 1024).toFixed(1)} MiB; maximum is 24 MiB before RPC serialization`)
for (const file of githubImportFiles.filter((item) => item.bytes > maximumGitHubLooseFileBytes)) errors.push(`${file.path} is a ${(file.bytes / 1024 / 1024).toFixed(1)} MiB loose GitHub-import file; package it as a ZIP archive`)

const report = {
  checked_at: new Date().toISOString(),
  main_entrypoint: config.mainEntrypoint,
  registry_dependencies: registryDependencies,
  ignored_files: ignored,
  included_files: included.length,
  included_bytes: totalBytes,
  included_mebibytes: Number((totalBytes / 1024 / 1024).toFixed(2)),
  maximum_mebibytes: maximumPackageBytes / 1024 / 1024,
  largest_files: largestFiles,
  github_import_files: githubImportFiles.length,
  github_import_bytes: githubImportBytes,
  github_import_mebibytes: Number((githubImportBytes / 1024 / 1024).toFixed(2)),
  github_import_maximum_mebibytes: maximumGitHubImportBytes / 1024 / 1024,
  github_import_maximum_loose_file_mebibytes: maximumGitHubLooseFileBytes / 1024 / 1024,
  github_import_largest_loose_files: githubImportFiles.toSorted((a, b) => b.bytes - a.bytes).slice(0, 10),
  errors,
}
await writeFile('docs/cloud-package-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
