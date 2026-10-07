import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

// JLCSearch fuzzy results must never stand in for an exact LCSC part match.
const run = promisify(execFile)
const manifest = JSON.parse(await readFile(new URL('../docs/design-manifest.json', import.meta.url)))
const quantity = Number(process.env.BOARD_QUANTITY || 1)
if (!Number.isInteger(quantity) || quantity < 1) throw new Error('BOARD_QUANTITY must be a positive integer')
const grouped = new Map()
for (const part of manifest.parts) {
  if (!/^C\d+$/.test(part.lcsc)) throw new Error(`Missing supplier code: ${part.name}`)
  const entry = grouped.get(part.lcsc) || { lcsc: part.lcsc, references: [], quantity_per_board: 0, value: part.value, footprint: part.footprint, kind: part.tag }
  entry.references.push(part.name)
  entry.quantity_per_board++
  grouped.set(part.lcsc, entry)
}
const entries = [...grouped.values()]
const results = []
let index = 0
const evidenceDirectory = new URL('../docs/stock-evidence/', import.meta.url)
await mkdir(evidenceDirectory, { recursive: true })
const activeEvidence = new Set(entries.map(entry => `${entry.lcsc}.json`))
for (const file of await readdir(evidenceDirectory)) {
  if (file.endsWith('.json') && !file.startsWith('alternatives-') && !activeEvidence.has(file)) {
    await rm(new URL(file, evidenceDirectory))
  }
}
await Promise.all(Array.from({ length: 5 }, async () => {
  while (index < entries.length) {
    const entry = entries[index++]
    // JLCSearch expects the numeric LCSC id. Supplying the leading "C" can
    // produce a fuzzy/no-result response, so strip it before every request.
    const numericLcsc = entry.lcsc.slice(1)
    const url = `https://jlcsearch.tscircuit.com/components/list.json?search=${numericLcsc}`
    try {
      const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '-L', '--retry', '2', '--max-time', '40', url], { maxBuffer: 8_000_000 })
      const response = JSON.parse(stdout)
      let exact = (response.components || []).find(p => `C${String(p.lcsc).replace(/^C/, '')}` === entry.lcsc)
      let fallback_url = null
      let fallback_response = null
      // The generic search index occasionally omits stocked catalog resistors.
      // An exact code match in the typed catalog is also valid evidence.
      if (!exact && entry.kind === 'resistor') {
        const ohms = Number.parseFloat(entry.value) * (entry.value.endsWith('k') ? 1000 : entry.value.endsWith('M') ? 1e6 : 1)
        fallback_url = `https://jlcsearch.tscircuit.com/resistors/list.json?resistance=${ohms}&package=${entry.footprint}`
        const fallback = await run('curl', ['--fail', '--silent', '-L', '--max-time', '40', fallback_url])
        fallback_response = JSON.parse(fallback.stdout)
        exact = (fallback_response.resistors || []).find(p => `C${String(p.lcsc).replace(/^C/, '')}` === entry.lcsc)
      }
      const checked_at = new Date().toISOString()
      await writeFile(new URL(`../docs/stock-evidence/${entry.lcsc}.json`, import.meta.url), JSON.stringify({ url, fallback_url, checked_at, response, fallback_response }, null, 2))
      const package_match = entry.footprint && exact?.package ? entry.footprint.toLowerCase() === exact.package.toLowerCase() : null
      results.push({ ...entry, checked_at, url, fallback_url, mpn: exact?.mfr ?? null, package: exact?.package ?? null, package_match,
        description: exact?.description ?? null, stock: exact?.stock ?? null,
        status: !exact ? 'unverified-no-exact-match' : package_match === false ? 'package-mismatch' : exact.stock >= entry.quantity_per_board * quantity ? 'available' : 'insufficient',
        required: entry.quantity_per_board * quantity })
    } catch (error) { results.push({ ...entry, url, status: 'unverified-network-error', error: String(error.message) }) }
  }
}))
results.sort((a,b) => Number(a.lcsc.slice(1)) - Number(b.lcsc.slice(1)))
const report = { checked_at: new Date().toISOString(), board_quantity: quantity, stock_is_not_reserved: true, parts: results }
await writeFile(new URL('../docs/stock-report.json', import.meta.url), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ unique_parts: results.length, available: results.filter(p=>p.status==='available').length, problems: results.filter(p=>p.status!=='available') }, null, 2))
if (results.some(p=>p.status!=='available')) process.exitCode = 1
