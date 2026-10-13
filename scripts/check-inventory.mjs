import { readFile } from 'node:fs/promises'
import { inventoryEvidencePasses } from './jlc-stock.mjs'
const stock = JSON.parse(await readFile('docs/stock-report.json'))
const alternatives = JSON.parse(await readFile('docs/alternatives.json'))
const review = process.argv.includes('--review')
if (!stock.parts?.length || !alternatives.parts?.length) throw new Error('Inventory evidence is missing')
const invalid = [
  ...stock.parts.filter(p => !inventoryEvidencePasses(p,review)).map(p => `${p.lcsc}: ${p.status}`),
  ...alternatives.parts.filter(p => p.alternative && !inventoryEvidencePasses(p,review,true)).map(p => `${p.alternative}: ${p.status}`),
]
console.log(JSON.stringify({mode:review?'engineering-review':'procurement', checked_at:stock.checked_at,
  stock_is_not_reserved:true, primary_shortages:stock.parts.filter(p=>p.status==='insufficient').map(p=>p.lcsc),
  unavailable_alternatives:alternatives.parts.filter(p=>p.alternative&&p.status!=='available').map(p=>p.alternative), errors:invalid},null,2))
if(invalid.length) process.exitCode=1
