import { test, expect } from 'bun:test'
import { createHash } from 'node:crypto'
import JSZip from 'jszip'
import { compareReadback, loadProgrammingImage } from './verify-programming.mjs'

const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const image = Buffer.from([0, 0x40, 2, 0x20, 0xc1, 0xb3, 0, 8])
const dump = Buffer.concat([image, Buffer.alloc(128 - image.length, 0xff)])

test('compares all programmed bytes and distinguishes the unexamined tail', () => {
  const result = compareReadback(image, dump, hash(image), 128, 0x08000000)
  expect(result.image_bytes_match).toBe(true)
  expect(result.compared_bytes).toBe(8)
  expect(result.bytes_outside_image_compared).toBe(false)
  expect(result.readback_sha256).toBe(hash(dump))
})

test('rejects first/last-byte corruption and reports the actual device address', () => {
  for (const index of [0, image.length - 1]) {
    const changed = Buffer.from(dump); changed[index] ^= 1
    expect(() => compareReadback(image, changed, hash(image), 128, 0x08000000))
      .toThrow(`0x${(0x08000000 + index).toString(16)}`)
  }
})

test('rejects truncated or oversized dumps, displaced images and wrong approved hashes', () => {
  for (const size of [0, image.length, 127, 129])
    expect(() => compareReadback(image, Buffer.alloc(size), hash(image), 128, 0)).toThrow('complete 128-byte')
  expect(() => compareReadback(image, Buffer.concat([Buffer.of(0xff), dump.subarray(0, 127)]), hash(image), 128, 0)).toThrow('mismatch')
  expect(() => compareReadback(image, dump, '0'.repeat(64), 128, 0)).toThrow('SHA-256')
})

test('erased, blank and oversized programming images never pass', () => {
  for (const invalid of [Buffer.alloc(0), Buffer.alloc(8), Buffer.alloc(8, 255), Buffer.alloc(129, 42)])
    expect(() => compareReadback(invalid, dump, hash(invalid), 128, 0)).toThrow('programming image')
})

test('missing TI image or a low-region export cannot be treated as EEPROM firmware', async () => {
  const config = { controller: 'TPS26750SRSMR', eeprom: { part: 'M24512-RMN6TP', bytes: 65536, address_7_bit: '0x50', image: null } }
  const read = async () => Buffer.from(JSON.stringify(config))
  await expect(loadProgrammingImage('pd', read)).rejects.toThrow('No reviewed TI full-flash')
  config.eeprom.image = { format: 'ti-low-region', path: 'low.bin', start_address: 0 }
  await expect(loadProgrammingImage('pd', read)).rejects.toThrow('No reviewed TI full-flash')
})

test('STM32 image is rejected when its recorded source has changed', async () => {
  const manifest = { target: 'STM32G0B1CEU6', flash_address: '0x08000000', max_flash_bytes: 524288,
    image_type: 'commissioning-diagnostics-only', motor_operation_enabled: false,
    image_bytes: image.length, artifacts: { 'firmware.bin': hash(image) }, inputs: { 'firmware/target/main.cpp': hash(Buffer.from('before')) } }
  const zip = new JSZip().file('manifest.json', JSON.stringify(manifest)).file('firmware.bin', image)
  const bytes = await zip.generateAsync({ type: 'nodebuffer' })
  await expect(loadProgrammingImage('stm32', async path => path.endsWith('.zip') ? bytes : Buffer.from('after')))
    .rejects.toThrow('Stale STM32 archive')
})

test('registered PD image identity is retained; wrong byte count is rejected', async () => {
  const config = { controller: 'TPS26750SRSMR', eeprom: { part: 'M24512-RMN6TP', bytes: 65536, address_7_bit: '0x50',
    image: { format: 'ti-full-flash', path: 'test-only.bin', start_address: 0, sha256: hash(image), bytes: image.length } } }
  const read = async path => path === 'test-only.bin' ? image : Buffer.from(JSON.stringify(config))
  const loaded = await loadProgrammingImage('pd', read)
  expect(loaded.capacity).toBe(65536)
  expect(loaded.base).toBe(0)
  expect(loaded.hash).toBe(hash(image))
  config.eeprom.image.bytes++
  await expect(loadProgrammingImage('pd', read)).rejects.toThrow('length differs')
})

test('registered TI ZIP loads its reviewed full-flash member', async () => {
  const image = await loadProgrammingImage('pd')
  expect(image.image.length).toBe(31552)
  expect(image.capacity).toBe(65536)
  expect(image.base).toBe(0)
})

// The stocked CE MCU has four times the old CB flash capacity. A matching
// image prefix in an old 128 KiB dump is not complete readback evidence.
test('STM32 CE full readback rejects the old 128 KiB memory dump', async () => {
  const full=Buffer.alloc(524288,0xff); image.copy(full)
  expect(compareReadback(image,full,hash(image),524288,0x08000000).readback_bytes).toBe(524288)
  expect(()=>compareReadback(image,full.subarray(0,131072),hash(image),524288,0x08000000)).toThrow('complete 524288-byte')
})
