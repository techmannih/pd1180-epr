import { readFile, writeFile, mkdir } from 'node:fs/promises'
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
await mkdir(new URL('../docs/stock-evidence/', import.meta.url), { recursive: true })
await Promise.all(Array.from({ length: 5 }, async () => {
  while (index < entries.length) {
    const entry = entries[index++]
    let url = `https://jlcsearch.tscircuit.com/components/list.json?search=${entry.lcsc}`
    try {
      const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '-L', '--retry', '2', '--max-time', '40', url], { maxBuffer: 8_000_000 })
      let response = JSON.parse(stdout)
      let exact = (response.components || []).find(p => `C${String(p.lcsc).replace(/^C/, '')}` === entry.lcsc)
      // The generic search index occasionally omits stocked catalog resistors.
      // An exact code match in the typed catalog is also valid evidence.
      if (!exact && entry.kind === 'resistor') {
        const ohms = Number.parseFloat(entry.value) * (entry.value.endsWith('k') ? 1000 : entry.value.endsWith('M') ? 1e6 : 1)
        url = `https://jlcsearch.tscircuit.com/resistors/list.json?resistance=${ohms}&package=${entry.footprint}`
        const fallback = await run('curl', ['--fail', '--silent', '-L', '--max-time', '40', url])
        response = JSON.parse(fallback.stdout)
        exact = (response.resistors || []).find(p => `C${String(p.lcsc).replace(/^C/, '')}` === entry.lcsc)
      }
      const checked_at = new Date().toISOString()
      await writeFile(new URL(`../docs/stock-evidence/${entry.lcsc}.json`, import.meta.url), JSON.stringify({ url, checked_at, response }, null, 2))
      results.push({ ...entry, checked_at, url, mpn: exact?.mfr ?? null, package: exact?.package ?? null,
        description: exact?.description ?? null, stock: exact?.stock ?? null,
        status: !exact ? 'unverified-no-exact-match' : exact.stock >= entry.quantity_per_board * quantity ? 'available' : 'insufficient',
        required: entry.quantity_per_board * quantity })
    } catch (error) { results.push({ ...entry, url, status: 'unverified-network-error', error: String(error.message) }) }
  }
}))
results.sort((a,b) => Number(a.lcsc.slice(1)) - Number(b.lcsc.slice(1)))
const report = { checked_at: new Date().toISOString(), board_quantity: quantity, stock_is_not_reserved: true, parts: results }
await writeFile(new URL('../docs/stock-report.json', import.meta.url), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ unique_parts: results.length, available: results.filter(p=>p.status==='available').length, problems: results.filter(p=>p.status!=='available') }, null, 2))
if (results.some(p=>p.status!=='available')) process.exitCode = 1
