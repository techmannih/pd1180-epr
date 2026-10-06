import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const config = JSON.parse(await readFile('tscircuit.config.json', 'utf8'))
const ignored = config.ignoredFiles || []
const requiredIgnores = ['checks/**', 'dist/**', 'build/**', 'release/**', '__snapshots__/**', 'firmware/build/**']
const errors = []

for (const pattern of requiredIgnores) {
  if (!ignored.includes(pattern)) errors.push(`tscircuit.config.json must ignore ${pattern}`)
}
if (config.mainEntrypoint !== 'index.circuit.tsx') errors.push('Cloud mainEntrypoint must remain index.circuit.tsx')
if (!config.includeBoardFiles?.includes('index.circuit.tsx')) errors.push('Cloud includeBoardFiles must include index.circuit.tsx')

const ignoredPrefixes = ignored.filter((pattern) => pattern.endsWith('/**')).map((pattern) => pattern.slice(0, -3))
const defaultIgnoredRoots = new Set(['.git', '.tscircuit', '.vscode', 'node_modules'])
const included = []
const githubImportFiles = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const projectPath = relative('.', path).replaceAll('\\', '/')
    const root = projectPath.split('/')[0]
    if (defaultIgnoredRoots.has(root) || ignoredPrefixes.some((prefix) => projectPath === prefix || projectPath.startsWith(`${prefix}/`))) continue
    if (entry.isDirectory()) await walk(path)
    else {
      if (ignored.includes('*.log') && entry.name.endsWith('.log')) continue
      const info = await stat(path)
      included.push({ path: projectPath, bytes: info.size })
    }
  }
}
await walk('.')

async function walkGitHubImport(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const projectPath = relative('.', path).replaceAll('\\', '/')
    const root = projectPath.split('/')[0]
    // GitHub package import has a fixed filter: generated dist data and ZIP
    // archives are not materialized into the cloud sandbox.
    if (defaultIgnoredRoots.has(root) || root === 'dist') continue
    if (entry.isDirectory()) await walkGitHubImport(path)
    else {
      if (entry.name.endsWith('.zip')) continue
      const info = await stat(path)
      githubImportFiles.push({ path: projectPath, bytes: info.size })
    }
  }
}
await walkGitHubImport('.')

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
