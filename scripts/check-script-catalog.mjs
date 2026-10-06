import { readdir, readFile, writeFile } from 'node:fs/promises'

const catalog = await readFile('scripts/README.md', 'utf8')
const scripts = (await readdir('scripts')).filter((name) => /\.(?:mjs|py)$/.test(name)).sort()
const missing = scripts.filter((name) => !catalog.includes(`\`${name}\``))
const report = { checked_at: new Date().toISOString(), scripts: scripts.length, missing }
await writeFile('docs/script-catalog-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (missing.length) process.exitCode = 1
