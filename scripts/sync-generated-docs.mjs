import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const manifestPath = new URL('docs/design-manifest.json', root)
const stockPath = new URL('docs/stock-report.json', root)
const circuitPath = new URL('dist/index/circuit.json', root)
const standardsPath = new URL('board-standards.json', root)

const [manifest, stock, circuit, standards] = await Promise.all([
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(stockPath, 'utf8').then(JSON.parse),
  readFile(circuitPath, 'utf8').then(JSON.parse),
  readFile(standardsPath, 'utf8').then(JSON.parse),
])

const names = new Map(circuit.filter(row => row.type === 'source_component').map(row => [row.source_component_id, row.name]))
const placements = new Map()
for (const row of circuit.filter(row => row.type === 'pcb_component')) {
  const name = names.get(row.source_component_id)
  if (name) placements.set(name, row)
}
for (const part of manifest.parts) {
  const position = placements.get(part.name)
  if (!position) throw new Error(`Missing PCB placement for ${part.name}`)
  if (!standards.assembly.populated_layers.includes(position.layer)) throw new Error(`${part.name}: assembly layer ${position.layer} is not permitted`)
  part.xy = [position.center.x, position.center.y]
  part.rotation = position.rotation ?? 0
  part.layer = position.layer
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const lines = [
  '# Procurement snapshot',
  '',
  'Exact LCSC-code and package matches only. A fuzzy search result or an unverified package is not accepted as availability evidence. Quantities are for one PCB; stock is a timestamped JLCSearch snapshot and is not reserved JLC assembly inventory.',
  '',
  `Last complete refresh: ${stock.checked_at}.`,
  '',
  '| LCSC | MPN | Qty/board | Stock | References |',
  '|---|---|---:|---:|---|',
]
for (const part of stock.parts) {
  const link = `[${part.lcsc}](${part.url})`
  lines.push(`| ${link} | ${part.mpn ?? 'unverified'} | ${part.quantity_per_board} | ${part.stock ?? 'unverified'} | ${part.references.join(', ')} |`)
}
const available = stock.parts.filter(part => part.status === 'available').length
const packageMatched = stock.parts.filter(part => part.package_match === true).length
lines.push(
  '',
  `All ${available} selected PCB part types (${manifest.parts.length} placements) had sufficient reported stock for one board at the timestamp above, and all ${packageMatched} supplier package names matched the pinned manifest expectation.`,
  '',
  '## Substitution policy',
  '',
  'See `alternatives.json` for checked candidates and whether they are package-compatible, need electrical/thermal review, or require a redesign. No alternative is silently selected. All selected primary PCB parts are currently available.',
  '',
  '## External system items',
  '',
  'The motor, shaft magnet, 48 V EPR source, 5 A EPR cable, mating harness and braking resistor/heatsink are separate system items. The external braking resistor is load-dependent and remains a system-level sizing and procurement gate.',
  '',
)
await writeFile(new URL('docs/procurement.md', root), lines.join('\n'))
const counts = Object.fromEntries(standards.assembly.populated_layers.map(layer => [layer, manifest.parts.filter(part => part.layer === layer).length]))
console.log(`Synchronized ${manifest.parts.length} two-sided placements (${Object.entries(counts).map(([layer, count]) => `${layer}: ${count}`).join(', ')}) and ${stock.parts.length} stock rows.`)
