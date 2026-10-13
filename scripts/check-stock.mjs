import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { catalogEvidence, packagesMatch, inventoryEvidencePasses } from './jlc-stock.mjs'

// JLCSearch fuzzy results must never stand in for an exact LCSC part match.
const manifest = JSON.parse(await readFile(new URL('../docs/design-manifest.json', import.meta.url)))
const order = JSON.parse(await readFile(new URL('../release/order-settings.json', import.meta.url)))
const quantity = Number(process.env.BOARD_QUANTITY || order.pcb.quantity)
if (!Number.isInteger(quantity) || quantity < 1) throw new Error('BOARD_QUANTITY must be a positive integer')
const grouped = new Map()
for (const part of manifest.parts) {
  if (!/^C\d+$/.test(part.lcsc)) throw new Error(`Missing supplier code: ${part.name}`)
  if (typeof part.footprint !== 'string' || !part.footprint.trim()) throw new Error(`${part.name}: missing expected JLC package in design manifest`)
  const entry = grouped.get(part.lcsc) || { lcsc: part.lcsc, references: [], quantity_per_board: 0, value: part.value, footprint: part.footprint, kind: part.tag }
  if (entry.footprint.trim().toLowerCase() !== part.footprint.trim().toLowerCase()) throw new Error(`${part.lcsc}: inconsistent expected JLC packages (${entry.footprint} / ${part.footprint})`)
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
      const evidence = await catalogEvidence(entry.lcsc)
      const {exact, official, checked_at} = evidence
      await writeFile(new URL(`../docs/stock-evidence/${entry.lcsc}.json`, import.meta.url), JSON.stringify(evidence, null, 2)+'\n')
      const package_match = packagesMatch(entry.footprint, exact?.package)
      results.push({ ...entry, checked_at, url, search_error: evidence.search_error, official_error: evidence.official_error, official_url: official?.url ?? null, evidence_source: exact ? "jlcpcb-official" : null, warehouse_stock: exact?.warehouse_stock ?? null, available_order_quantity: exact?.available_order_quantity ?? null, mpn: exact?.mfr ?? null, package: exact?.package ?? null, package_match,
        description: exact?.description ?? null, stock: exact?.stock ?? null,
        status: evidence.official_error ? 'unverified-network-error' : !exact ? 'unverified-no-exact-match' : !package_match ? 'package-mismatch' : exact.can_purchase === false ? 'not-purchasable' : !Number.isFinite(exact.stock) ? 'unverified-stock' : exact.stock >= entry.quantity_per_board * quantity ? 'available' : 'insufficient',
        required: entry.quantity_per_board * quantity })
    } catch (error) { results.push({ ...entry, url, status: 'unverified-network-error', error: String(error.message) }) }
  }
}))
results.sort((a,b) => Number(a.lcsc.slice(1)) - Number(b.lcsc.slice(1)))
const report = { checked_at: new Date().toISOString(), board_quantity: quantity, stock_is_not_reserved: true, parts: results }
await writeFile(new URL('../docs/stock-report.json', import.meta.url), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ unique_parts: results.length, package_matches: results.filter(p=>p.package_match===true).length, available: results.filter(p=>p.status==='available').length, problems: results.filter(p=>p.status!=='available') }, null, 2))
if (results.some(p=>!inventoryEvidencePasses(p,process.argv.includes('--review')))) process.exitCode = 1
