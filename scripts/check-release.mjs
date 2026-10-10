import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export function releaseErrors(status, verification, changed = [], reviewOnly = false) {
  const errors = []
  if (!verification.routed_board_verified || !verification.checks?.length ||
      verification.checks.some(check => check.exit_code !== 0 || check.status !== 'pass'))
    errors.push('Engineering verification has not passed')
  if (!Object.keys(verification.verified_inputs || {}).length)
    errors.push('Verified input hashes are missing')
  for (const path of [...changed, ...(verification.source_changed_during_validation || [])])
    errors.push(`Verified design input changed: ${path}`)
  const open = Object.entries(status.prototype_order_gates || {}).filter(([, passed]) => passed !== true)
  if (!Object.keys(status.prototype_order_gates || {}).length) errors.push('Prototype gates are missing')
  for (const [gate] of open) errors.push(`Open prototype gate: ${gate}`)
  if (status.fabrication_orderable !== true) {
    if (!status.order_hold_reasons?.length) errors.push('Order hold must state its reasons')
    if (!reviewOnly) errors.push(...(status.order_hold_reasons || ['Ordering is not authorized']).map(reason => `Order hold: ${reason}`))
  }
  return errors
}

if (import.meta.main) {
  const status = JSON.parse(await readFile('docs/release-status.json'))
  const verification = JSON.parse(await readFile('docs/verification.json'))
  const changed = []
  for (const [path, expected] of Object.entries(verification.verified_inputs || {})) {
    const actual = createHash('sha256').update(await readFile(path)).digest('hex')
    if (actual !== expected) changed.push(path)
  }
  const reviewOnly = process.argv.includes('--review')
  const errors = releaseErrors(status, verification, changed, reviewOnly)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else if (reviewOnly && !status.fabrication_orderable) {
    console.log(`Engineering review package verified. ORDER HOLD remains:\n${status.order_hold_reasons.map(reason => ` - ${reason}`).join('\n')}`)
  } else console.log('Prototype order gates passed; physical system qualification remains independently recorded.')
}
