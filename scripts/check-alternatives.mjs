import { readFile, writeFile } from 'node:fs/promises'
import { catalogEvidence, packagesMatch, inventoryEvidencePasses } from './jlc-stock.mjs'

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
  if (!primary) throw new Error(`${part.primary}: not in current BOM`)
  const primary_available = primary.status === 'available' && primary.package_match === true
  const numericLcsc = part.alternative.replace(/^C/, '')
  const url = `https://jlcsearch.tscircuit.com/components/list.json?search=${numericLcsc}`
  try {
    const evidence = await catalogEvidence(part.alternative)
    const {exact, official} = evidence
    await writeFile(new URL(`../docs/stock-evidence/alternatives-${part.alternative}.json`, import.meta.url), JSON.stringify(evidence,null,2)+'\n')
    const expected_package_match = packagesMatch(part.expected_package, exact?.package)
    const package_compatible = expected_package_match && normalizePackage(primary.package) === normalizePackage(exact?.package)
    const requires_package_compatibility = part.classification !== 'not-approved-redesign-required'
    const { error: _error, ...stable } = part
    checked.push({
      ...stable,
      mpn: exact?.mfr ?? part.mpn ?? null,
      package: exact?.package ?? part.package ?? null,
      expected_package_match,
      primary_package: primary.package,
      primary_available,
      evidence_source: exact ? "jlcpcb-official" : null,
      search_error: evidence.search_error,
      official_error: evidence.official_error,
      official_url: official?.url ?? null,
      package_compatible,
      stock: exact?.stock ?? null,
      checked_at: new Date().toISOString(),
      evidence: url,
      status: evidence.official_error ? 'unverified-network-error' : !exact ? 'unverified-no-exact-match' : !expected_package_match ? 'package-mismatch' : requires_package_compatibility && !package_compatible ? 'package-incompatible' : exact.can_purchase === false ? 'not-purchasable' : !Number.isFinite(exact.stock) ? 'unverified-stock' : exact.stock >= primary.required ? 'available' : 'insufficient',
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
if (alternatives.some(p=>!inventoryEvidencePasses(p,process.argv.includes('--review'),true))) process.exitCode = 1
