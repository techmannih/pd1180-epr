import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import runtimeConfig from '../tscircuit.config.ts'

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
  'release/critical-copper-check.json',
  'release/power-audit.json',
  'release/native-decoupling-check.json',
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
if (runtimeConfig.platformConfig?.partsEngineDisabled !== true) errors.push('Runtime previews must use pinned local parts so remote metadata does not block file switching')
if (runtimeConfig.platformConfig?.routingDisabled !== true) errors.push('Interactive previews must use the same routing-disabled policy as build previews')

for (const pattern of requiredIgnores) {
  if (!ignored.includes(pattern)) errors.push(`tscircuit.config.json must ignore ${pattern}`)
}
if (config.mainEntrypoint !== 'index.circuit.tsx') errors.push('mainEntrypoint must remain index.circuit.tsx')
for (const key of ['previewComponentPath', 'siteDefaultComponentPath']) {
  if (config[key] !== 'release/circuit.json') errors.push(`${key} must show the verified routed PCB`)
}
const buildCommands = (config.buildCommand || '').split('&&').map((command) => command.trim().split(/\s+/))
const buildTargets = buildCommands.filter(([cli, action]) => cli === 'tsci' && action === 'build').map((args) => args[2])
for (const target of new Set([config.mainEntrypoint, config.previewComponentPath, config.siteDefaultComponentPath])) {
  if (!buildTargets.includes(target)) errors.push(`Cloud buildCommand does not build selected component ${target}; the hosted viewer requires its dist/ output`)
}
if (buildTargets.some((target) => !['index.circuit.tsx', 'release/circuit.json'].includes(target))) errors.push('Cloud builds must explicitly target the source and routed JSON, without compiling every imported part')
if (!buildCommands.some((args) => args[2] === config.mainEntrypoint && args.includes('--transpile'))) errors.push('The library must transpile the editable TSX source')
if (!buildCommands.some((args) => args[2] === config.siteDefaultComponentPath && args.includes('--site'))) errors.push('The static site must be generated from the selected routed preview')
const previewBuildOutput = `dist/${config.previewComponentPath}`
let verifiedPreviewRecords = null
if (process.argv.includes('--built')) {
  try {
    const source = JSON.parse(await readFile(config.previewComponentPath, 'utf8'))
    const built = JSON.parse(await readFile(previewBuildOutput, 'utf8'))
    if (!Array.isArray(built) || !built.some((row) => row.type === 'pcb_trace') || !built.some((row) => row.type === 'schematic_component')) errors.push(`${previewBuildOutput} must contain the complete routed board and schematic`)
    if (JSON.stringify(source) !== JSON.stringify(built)) errors.push(`${previewBuildOutput} differs from the verified routed preview`)
    if (built.some((row) => row.type?.endsWith('_error') || row.error_type)) errors.push(`${previewBuildOutput} contains circuit errors`)
    verifiedPreviewRecords = built.length
    const site = await readFile('dist/index.html', 'utf8')
    if (!site.includes(config.siteDefaultComponentPath)) errors.push('Generated static site does not reference the selected routed preview')
  } catch (error) {
    errors.push(`Hosted preview build output is unavailable: ${error.message}`)
  }
}
if (config.build?.routingDisabled !== true) errors.push('Cloud source previews must disable autorouting; the verified manufacturing route remains in release/circuit.json')
if ((config.build?.workerTimeoutMs || 0) < 3_600_000) errors.push('Cloud worker timeout must be at least 60 minutes')

const registryDependencies = Object.keys(packageJson.dependencies || {}).filter((name) => name.startsWith('@tsci/'))
if (registryDependencies.length) {
  errors.push(`Cloud runtime dependencies must be self-contained under imports/: ${registryDependencies.join(', ')}`)
}

const ignoredMatchers = ignored.map((pattern) => new Bun.Glob(pattern))
const shouldIgnore = (path) => ignoredMatchers.some((matcher) => matcher.match(path))
if (shouldIgnore('tscircuit.config.ts')) errors.push('The viewer must receive tscircuit.config.ts for its runtime preview settings')
const boardMatchers = (config.includeBoardFiles || []).map((pattern) => new Bun.Glob(pattern))
const isSelectable = (path) => boardMatchers.some((matcher) => matcher.match(path))
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
const trackedFiles = gitFilesResult.stdout.toString().split('\0').filter(Boolean)
const sourceFiles = trackedFiles.filter((path) => path.endsWith('.tsx') || /^imports\/.*\.(ts|js|jsx)$/.test(path))
const requiredViewerFiles = [...sourceFiles, 'release/circuit.json']
const unavailableViewerFiles = requiredViewerFiles.filter((path) => shouldIgnore(path) || !isSelectable(path))
if (unavailableViewerFiles.length) errors.push(`Viewer must expose every TSX/import and the routed artifact: ${unavailableViewerFiles.join(', ')}`)
for (const projectPath of trackedFiles) {
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
  preview_component_path: config.previewComponentPath,
  site_default_component_path: config.siteDefaultComponentPath,
  cloud_build_command: config.buildCommand,
  cloud_build_targets: buildTargets,
  hosted_preview_output: previewBuildOutput,
  verified_preview_records: verifiedPreviewRecords,
  selectable_source_files: sourceFiles.length,
  selectable_import_files: sourceFiles.filter((path) => path.startsWith('imports/')).length,
  unavailable_viewer_files: unavailableViewerFiles,
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
