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

// Official English catalog translates only the Chinese through-hole prefix.
// Preserve pitch, dimensions and every other package detail exactly.
export function normalizePackageLabel(value) {
  return typeof value === 'string' ? value.trim().toLowerCase().replace(/^插件,/, 'plugin,') : null
}
export function packagesMatch(expected, actual) {
  return typeof expected === 'string' && typeof actual === 'string' && normalizePackageLabel(expected) === normalizePackageLabel(actual)
}
