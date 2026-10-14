// Public JLCPCB catalog API, observed in its part-detail client. No login,
// customer inventory or cart mutation is used. JLCSearch remains queried first.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run = promisify(execFile)
export function normalizeOfficialPart(response, code) {
  const p = response?.code === 200 ? response.data : null
  if (!p || p.componentCode !== code) return null
  // In Stock includes reserved material; Available Order Qty is the stricter
  // canPresaleNumber field. Unknown values are not zero and never pass.
  const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0
  const stock = finite(p.overseasStockCount) && finite(p.canPresaleNumber)
    ? Math.min(p.overseasStockCount, p.canPresaleNumber) : null
  return { lcsc: code, mfr: p.componentModelEn, package: p.componentSpecificationEn,
    description: p.describe ?? p.componentName ?? null, stock,
    warehouse_stock: finite(p.overseasStockCount) ? p.overseasStockCount : null,
    available_order_quantity: finite(p.canPresaleNumber) ? p.canPresaleNumber : null,
    can_purchase: p.isBuyComponent === '1' }
}
export async function officialPart(code) {
  if (!/^C\d+$/.test(code)) throw new Error('Invalid exact JLC code')
  const url = `https://jlcpcb.com/api/overseas-pcb-order/v1/smtComponentShopCart/getComponentDetail?componentCode=${code}`
  const {stdout} = await run('curl', ['--fail','--silent','--show-error','-L','--retry','2','--max-time','30',url], {maxBuffer: 8_000_000})
  const response = JSON.parse(stdout)
  const exact = normalizeOfficialPart(response, code)
  // Whitelist the evidence fields: signed image URLs, unrelated customer flags
  // and transient CDN tokens are neither needed nor committed.
  return {url, checked_at:new Date().toISOString(), response_code:response.code,
    returned_code:response.data?.componentCode ?? null, exact}
}

// Query and classify the required numeric-index evidence independently. The
// index is incomplete and its stock can include material not orderable; only
// an exact official identity may supply orderable inventory (AGENTS.md).
export async function catalogEvidence(code, options = {}) {
  if (!/^C\d+$/.test(code)) throw new Error('Invalid exact JLC code')
  const url = `https://jlcsearch.tscircuit.com/components/list.json?search=${code.slice(1)}`
  const readIndex = options.readIndex || (async url => {
    const {stdout} = await run('curl', ['--fail','--silent','--show-error','-L','--retry','2','--max-time','40',url], {maxBuffer:8_000_000})
    return JSON.parse(stdout)
  })
  let response = null, search_error = null, official = null, official_error = null
  try { response = await readIndex(url) } catch (error) { search_error = error.message }
  try { official = await (options.readOfficial || officialPart)(code) } catch (error) { official_error = error.message }
  const index_exact = Array.isArray(response?.components)
    ? response.components.find(part => String(part.lcsc) === code.slice(1) || part.lcsc === code) ?? null : null
  const index_status = search_error ? 'network-error' : index_exact ? 'exact-match' : 'no-exact-match'
  const exact = official?.exact?.lcsc === code ? official.exact : null
  return {url, checked_at:new Date().toISOString(), response, search_error, index_status, index_exact, official, official_error, exact}
}

// Official English catalog translates only the Chinese through-hole prefix.
// Preserve pitch, dimensions and every other package detail exactly.
export function normalizePackageLabel(value) {
  return typeof value === 'string' ? value.trim().toLowerCase().replace(/^插件,/, 'plugin,') : null
}
export function packagesMatch(expected, actual) {
  return typeof expected === 'string' && typeof actual === 'string' && normalizePackageLabel(expected) === normalizePackageLabel(actual)
}

// Review may record a known shortage, never invent stock or accept unknown
// identity/package evidence. The default remains the strict procurement gate.
export function inventoryEvidencePasses(part, review = false, alternative = false) {
  if (!part || typeof part.mpn !== 'string' || !part.mpn.trim() ||
      !Number.isFinite(part.stock) || part.stock < 0) return false
  if (alternative) {
    if (part.expected_package_match !== true ||
        (part.classification !== 'not-approved-redesign-required' && part.package_compatible !== true)) return false
  } else if (part.package_match !== true) return false
  return part.status === 'available' || (review && part.status === 'insufficient')
}
