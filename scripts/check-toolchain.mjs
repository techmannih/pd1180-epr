import { access, readFile, writeFile } from 'node:fs/promises'

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const errors = []
const expectedBun = packageJson.packageManager?.match(/^bun@(.+)$/)?.[1]
if (!expectedBun) errors.push('package.json must pin packageManager as bun@<exact-version>')
else if (Bun.version !== expectedBun) errors.push(`Bun ${Bun.version} does not match pinned ${expectedBun}`)

for (const [group, dependencies] of Object.entries({ dependencies: packageJson.dependencies || {}, devDependencies: packageJson.devDependencies || {} })) {
  for (const [name, version] of Object.entries(dependencies)) {
    if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) errors.push(`${group}.${name} is not pinned to an exact version: ${version}`)
  }
}

try { await access('bun.lock') } catch { errors.push('bun.lock is missing') }
let installedTscircuit = null
try {
  installedTscircuit = JSON.parse(await readFile('node_modules/tscircuit/package.json', 'utf8')).version
  if (installedTscircuit !== packageJson.devDependencies.tscircuit) errors.push(`Installed tscircuit ${installedTscircuit} does not match package.json ${packageJson.devDependencies.tscircuit}`)
} catch {
  errors.push('Installed tscircuit package metadata is unavailable; run bun install --frozen-lockfile')
}

const report = {
  checked_at: new Date().toISOString(),
  bun: { expected: expectedBun, actual: Bun.version },
  tscircuit: { expected: packageJson.devDependencies.tscircuit, actual: installedTscircuit },
  exact_dependency_versions: errors.filter((error) => error.includes('is not pinned')).length === 0,
  lockfile: 'bun.lock',
  errors,
}
await writeFile('docs/toolchain-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
