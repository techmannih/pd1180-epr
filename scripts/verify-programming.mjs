import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import JSZip from 'jszip'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

// This compares files supplied by a programmer. It neither operates hardware nor
// proves that the dump was obtained from the identified board.
export function compareReadback(image, dump, expectedHash, capacity, baseAddress) {
  if (!Number.isInteger(capacity) || capacity <= 0 || !Number.isInteger(baseAddress) || baseAddress < 0)
    throw new Error('Invalid memory range')
  if (!image.length || image.length > capacity || image.every(b => b === 0xff) || image.every(b => b === 0))
    throw new Error('Empty, erased or oversized programming image')
  if (!/^[a-f0-9]{64}$/.test(expectedHash) || sha256(image) !== expectedHash)
    throw new Error('Programming image does not match its recorded SHA-256')
  if (dump.length !== capacity)
    throw new Error(`Readback must contain the complete ${capacity}-byte memory starting at 0x${baseAddress.toString(16)}`)
  const mismatch = image.findIndex((byte, offset) => byte !== dump[offset])
  if (mismatch !== -1)
    throw new Error(`Readback mismatch at 0x${(baseAddress + mismatch).toString(16)}: expected ${image[mismatch]}, read ${dump[mismatch]}`)
  return {
    image_sha256: expectedHash,
    readback_sha256: sha256(dump),
    compared_address: `0x${baseAddress.toString(16)}`,
    compared_bytes: image.length,
    readback_bytes: dump.length,
    bytes_outside_image_compared: false,
    image_bytes_match: true,
  }
}

export async function loadProgrammingImage(kind, read = path => readFile(path)) {
  if (kind === 'stm32') {
    const archivePath = 'release/pd1180-commissioning-firmware.zip'
    const archive = await JSZip.loadAsync(await read(archivePath), { checkCRC32: true })
    const manifest = JSON.parse(await archive.file('manifest.json').async('string'))
    if (manifest.target !== 'STM32G0B1CBT6' || manifest.flash_address !== '0x08000000' ||
        manifest.max_flash_bytes !== 131072 || manifest.image_type !== 'commissioning-diagnostics-only' ||
        manifest.motor_operation_enabled !== false)
      throw new Error('Unexpected STM32 commissioning manifest')
    if (!manifest.inputs || !Object.keys(manifest.inputs).length)
      throw new Error('Firmware manifest has no source identities')
    for (const [path, hash] of Object.entries(manifest.inputs)) {
      if (sha256(await read(path)) !== hash) throw new Error(`Stale STM32 archive: ${path}`)
    }
    const image = await archive.file('firmware.bin').async('nodebuffer')
    if (image.length !== manifest.image_bytes) throw new Error('Firmware length differs from manifest')
    return { image, hash: manifest.artifacts['firmware.bin'], capacity: 131072, base: 0x08000000,
      source: archivePath, target: manifest.target, configuration_sha256: null }
  }
  if (kind !== 'pd') throw new Error('Select --kind stm32 or --kind pd')
  const configBytes = await read('docs/pd-configuration.json')
  const config = JSON.parse(configBytes)
  const image = config.eeprom?.image
  if (config.controller !== 'TPS26750SRSMR' || config.eeprom?.part !== 'M24512-RMN6TP' ||
      config.eeprom?.bytes !== 65536 || config.eeprom?.address_7_bit !== '0x50')
    throw new Error('Unexpected PD controller/EEPROM configuration')
  if (!image || image.format !== 'ti-full-flash' || !image.path || image.start_address !== 0)
    throw new Error('No reviewed TI full-flash image is registered in docs/pd-configuration.json')
  const bytes = await read(image.path)
  if (bytes.length !== image.bytes) throw new Error('PD image length differs from its configuration record')
  return { image: bytes, hash: image.sha256, capacity: 65536, base: 0,
    source: image.path, target: config.eeprom.part, configuration_sha256: sha256(configBytes) }
}

async function main() {
  const { values } = parseArgs({ options: Object.fromEntries(
    ['kind', 'readback', 'serial', 'operator', 'programmer', 'output'].map(name => [name, { type: 'string' }])) })
  for (const key of ['kind', 'readback', 'serial', 'operator', 'programmer', 'output']) {
    if (!values[key]?.trim()) throw new Error(`Missing --${key}`)
  }
  const approved = await loadProgrammingImage(values.kind)
  const dump = await readFile(values.readback)
  const comparison = compareReadback(approved.image, dump, approved.hash, approved.capacity, approved.base)
  const report = {
    checked_at: new Date().toISOString(),
    board_serial: values.serial, operator: values.operator, programmer: values.programmer,
    target: approved.target, image_source: approved.source, readback_source: values.readback,
    configuration_sha256: approved.configuration_sha256,
    ...comparison,
    evidence_scope: 'File comparison of operator-supplied readback; programmer log and board identity must be retained separately',
    cold_boot_verified: false, motor_operation_verified: false, shipment_authorized: false,
  }
  // Never replace an earlier serial's evidence or an input file accidentally.
  await writeFile(values.output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
  console.log(`Image bytes match for ${values.serial} / ${approved.target}. Saved ${values.output}. Cold boot and motor qualification are separate.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
