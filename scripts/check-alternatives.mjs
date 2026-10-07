import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const path = new URL('../docs/alternatives.json', import.meta.url)
const data = JSON.parse(await readFile(path))
const stock = JSON.parse(await readFile(new URL('../docs/stock-report.json', import.meta.url)))
const checked = []

// JLC uses different catalog labels for two reviewed, land-pattern-compatible
// package pairs. Keep this alias list narrow so other package changes fail.
const packageAliases = new Map([
  ['son-8(5x6)', 'vson-8(5x6)'],
  ['vsonp-8(5x6)', 'vson-8(5x6)'],
  ['so-narrow-16', 'soic-16-narrow'],
  ['soic-16', 'soic-16-narrow'],
])
const normalizePackage = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  return packageAliases.get(normalized) || normalized
}

for (const part of data.parts) {
  if (!part.alternative) {
    const { error: _error, ...stable } = part
    checked.push({ ...stable, status: 'no-drop-in-selected' })
    continue
  }
  if (!/^C\d+$/.test(part.alternative)) throw new Error(`Invalid alternative supplier code: ${part.alternative}`)
  if (typeof part.expected_package !== 'string' || !part.expected_package.trim()) throw new Error(`${part.alternative}: missing expected JLC package`)
  const primary = stock.parts.find(item => item.lcsc === part.primary)
  if (!primary || primary.status !== 'available' || primary.package_match !== true) throw new Error(`${part.primary}: primary package/stock evidence is not current`)
  const numericLcsc = part.alternative.replace(/^C/, '')
  const url = `https://jlcsearch.tscircuit.com/components/list.json?search=${numericLcsc}`
  try {
    const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '-L', '--retry', '2', '--max-time', '40', url], { maxBuffer: 8_000_000 })
    const response = JSON.parse(stdout)
    const exact = (response.components || []).find(item => `C${String(item.lcsc).replace(/^C/, '')}` === part.alternative)
    const expected_package_match = typeof exact?.package === 'string' && part.expected_package.trim().toLowerCase() === exact.package.trim().toLowerCase()
    const package_compatible = expected_package_match && normalizePackage(primary.package) === normalizePackage(exact?.package)
    const requires_package_compatibility = part.classification !== 'not-approved-redesign-required'
    const { error: _error, ...stable } = part
    checked.push({
      ...stable,
      mpn: exact?.mfr ?? part.mpn ?? null,
      package: exact?.package ?? part.package ?? null,
      expected_package_match,
      primary_package: primary.package,
      package_compatible,
      stock: exact?.stock ?? null,
      checked_at: new Date().toISOString(),
      evidence: url,
      status: !exact ? 'unverified-no-exact-match' : !expected_package_match ? 'package-mismatch' : requires_package_compatibility && !package_compatible ? 'package-incompatible' : exact.stock > 0 ? 'available' : 'out-of-stock',
    })
  } catch (error) {
    checked.push({ ...part, checked_at: new Date().toISOString(), evidence: url, status: 'unverified-network-error', error: error.message })
  }
}

const report = { ...data, checked_at: new Date().toISOString(), parts: checked }
await writeFile(path, JSON.stringify(report, null, 2) + '\n')
const problems = checked.filter(part => part.alternative && part.status !== 'available')
const alternatives = checked.filter(part => part.alternative)
console.log(JSON.stringify({ checked: alternatives.length, expected_package_matches: alternatives.filter(part => part.expected_package_match === true).length, package_compatible: alternatives.filter(part => part.package_compatible === true).length, redesign_candidates: alternatives.filter(part => part.classification === 'not-approved-redesign-required' && part.package_compatible === false).length, available: alternatives.filter(part => part.status === 'available').length, problems }, null, 2))
if (problems.length) process.exitCode = 1
