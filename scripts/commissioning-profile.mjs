import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { compareReadback, loadProgrammingImage } from './verify-programming.mjs'

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
export const profileChecks = {
  'power-test': ['cold_wiring_and_polarity', 'brake_resistor_installed', 'secure_fixture_and_guard',
    'data_usb_rails_reset_suspend', 'pd_app_cold_boot'],
  'bench-test': ['cold_wiring_and_polarity', 'brake_resistor_installed', 'secure_fixture_and_guard',
    'data_usb_rails_reset_suspend', 'pd_app_cold_boot', 'stationary_power_and_fault_checks',
    'driver_cooling_installed', 'unloaded_motor_secured'],
}

// Record validation checks evidence identity/content, not the truth of an operator's measurements.
export async function validateCommissioningRecord(record, profile, read, expectedBoardHash, loadImage = loadProgrammingImage) {
  if (!profileChecks[profile]) throw new Error('Select power-test or bench-test')
  if (record.schema !== 1 || record.profile !== profile || record.board_sha256 !== expectedBoardHash ||
      !record.board_serial?.trim() || !record.operator?.trim() || !record.approved_by?.trim() ||
      !Number.isFinite(Date.parse(record.recorded_at))) throw new Error('Invalid profile, board identity or operator record')
  const evidence = {}
  for (const name of profileChecks[profile]) {
    const entry = record.checks?.[name]
    if (entry?.passed !== true || !entry.path || !/^[a-f0-9]{64}$/.test(entry.sha256 || ''))
      throw new Error(`Missing measured/inspected prerequisite: ${name}`)
    if (sha(await read(entry.path)) !== entry.sha256) throw new Error(`Evidence hash mismatch: ${name}`)
    evidence[name] = entry.sha256
  }
  for (const kind of ['pd', 'rp2040']) {
    if (!record.readbacks?.[kind]) throw new Error(`Missing ${kind} full readback`)
    const image = await loadImage(kind)
    const dump = await read(record.readbacks[kind])
    evidence[`${kind}_readback`] = compareReadback(image.image, dump, image.hash, image.capacity, image.base)
  }
  return { profile, board_serial: record.board_serial, operator: record.operator, approved_by: record.approved_by,
    board_sha256: expectedBoardHash, evidence, scope: 'Operator-approved prerequisite record for bounded commissioning only; not motor qualification' }
}

export async function loadCommissioningRecord(path, profile) {
  const bytes = await readFile(path)
  const record = JSON.parse(bytes)
  const review = JSON.parse(await readFile('docs/release-status.json'))
  const result = await validateCommissioningRecord(record, profile,
    name => readFile(resolve(dirname(path), name)), review.native_review_summary.board_sha256)
  return { ...result, record_sha256: sha(bytes) }
}
