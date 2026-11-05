import { spawn } from 'node:child_process'
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import JSZip from 'jszip'
import { parseArgs } from 'node:util'
import { loadCommissioningRecord } from './commissioning-profile.mjs'
const sha = (data) => createHash('sha256').update(data).digest('hex')
const {values}=parseArgs({options:{check:{type:'boolean'},profile:{type:'string'},record:{type:'string'},out:{type:'string'}}})
const check = values.check || false
const profile = values.profile || 'diagnostics'
if (!['diagnostics','power-test','bench-test'].includes(profile)) throw new Error('Unknown firmware profile')
const testProfile = profile !== 'diagnostics'
if (testProfile && (!values.record || !values.out || check)) throw new Error('Test build requires --record and a new --out directory; --check is for diagnostics')
if (!testProfile && (values.record || values.out)) throw new Error('Record/out apply only to explicit test profiles')
if (testProfile && resolve(values.out).startsWith(resolve('release')+'/')) throw new Error('Keep board-specific test outputs outside the shared release directory')
const commissioning = testProfile ? await loadCommissioningRecord(values.record,profile) : null
const testOutput = testProfile ? resolve(values.out) : null
if (testProfile) await mkdir(testOutput, {recursive:false}) // Never overwrite an earlier test build.
const profileNumber = profile === 'bench-test' ? 2 : profile === 'power-test' ? 1 : 0
const buildDirectory = testProfile ? resolve('.cache/commissioning-build',profile) : resolve('firmware/.pio/build')

const paths = ['firmware/platformio.ini', 'firmware/README.md', 'docs/commissioning.md', 'engineering/commissioning-record.template.json', 'docs/firmware-pinmap.json', 'scripts/build-firmware.mjs', 'scripts/commissioning-profile.mjs', 'scripts/verify-programming.mjs']
for (const dir of ['firmware/src', 'firmware/include', 'firmware/target', 'firmware/boards']) {
  for (const f of (await readdir(dir)).sort()) paths.push(`${dir}/${f}`)
}
const inputs = Object.fromEntries(await Promise.all(paths.map(async p => [p, sha(await readFile(p))])))
const archivePath = testProfile ? resolve(testOutput,`pd1180-${profile}.zip`) : 'release/pd1180-commissioning-firmware.zip'
if (!check) {
  await new Promise((ok, fail) => {
    const env={...process.env, PLATFORMIO_CORE_DIR:process.env.PLATFORMIO_CORE_DIR || resolve('.cache/platformio')}
    // Never let ambient compiler flags silently turn the normal release into a test image.
    delete env.PLATFORMIO_BUILD_FLAGS
    env.PLATFORMIO_BUILD_DIR=buildDirectory
    if(testProfile) env.PLATFORMIO_BUILD_FLAGS=`-DPD1180_TEST_PROFILE=${profileNumber} -DPD1180_TEST_RECORD_SHA=\\\"${commissioning.record_sha256}\\\"`
    const p = spawn(process.env.PIO || 'pio', ['run', '-d', 'firmware', '-e', 'pd1180'], {
      stdio: 'inherit', env
    })
    p.on('error',fail); p.on('close',code => code === 0 ? ok() : fail(new Error(`RP2040 target build failed: ${code}`)))
  })
  const bin = await readFile(resolve(buildDirectory,'pd1180/firmware.bin'))
  const elf = await readFile(resolve(buildDirectory,'pd1180/firmware.elf'))
  const uf2 = await readFile(resolve(buildDirectory,'pd1180/firmware.uf2'))
  if (elf.readUInt32BE(0)!==0x7f454c46 || elf[4]!==1 || elf[5]!==1 || elf.readUInt16LE(18)!==40)
    throw new Error('Expected little-endian 32-bit ARM ELF, not a host executable')
  // RP2040 boot2 occupies the first 256 bytes, then the vector table.
  const sp=bin.readUInt32LE(256), reset=bin.readUInt32LE(260)
  if (bin.length>4194304 || sp<=0x20000000 || sp>0x20042000 || !(reset&1) || reset<0x10000100 || reset>=0x10400000)
    throw new Error('RP2040 XIP vector table / memory bounds failed')
  if(uf2.length%512) throw new Error('Truncated UF2')
  const seen=new Set()
  for(let off=0;off<uf2.length;off+=512) {
    const block=uf2.subarray(off,off+512), address=block.readUInt32LE(12), size=block.readUInt32LE(16)
    if(block.readUInt32LE(0)!==0x0a324655 || block.readUInt32LE(4)!==0x9e5d5157 || block.readUInt32LE(508)!==0x0ab16f30 ||
       !(block.readUInt32LE(8)&0x2000) || block.readUInt32LE(28)!==0xe48bff56 || size!==256 || address<0x10000000 || address+size>0x10400000 || seen.has(address))
      throw new Error('Invalid RP2040 UF2 family, address or block')
    seen.add(address)
    const offset=address-0x10000000
    if(offset<bin.length && !block.subarray(32,32+Math.min(size,bin.length-offset)).equals(bin.subarray(offset,offset+size))) throw new Error('UF2 differs from binary')
  }
  for(let offset=0;offset<bin.length;offset+=256) if(!seen.has(0x10000000+offset)) throw new Error('UF2 omits binary bytes')
  const manifest={built_at:new Date().toISOString(), target:'RP2040 + W25Q32JV (4 MiB)',
    image_type: testProfile ? `commissioning-${profile}` : 'commissioning-diagnostics-only', motor_operation_enabled:profile==='bench-test',
    commissioning, limits: {rms_request_ma:800, rpm:10, run_ms:10000, stationary_power_ms:30000},
    flash_address:'0x10000000', vector_table_address:'0x10000100', initial_sp:`0x${sp.toString(16)}`, reset_vector:`0x${reset.toString(16)}`,
    max_flash_bytes:4194304, image_bytes:bin.length, inputs,
    artifacts:{'firmware.bin':sha(bin),'firmware.elf':sha(elf),'firmware.uf2':sha(uf2)},
    unverified:['Powered board operation and top-cooled DDV thermal assembly','USB enumeration, current and measured GPIO/timing on hardware','TI physical programming/readback and cold boot','Motor operation, braking, thermal/EMC and mounting validation']}
  const zip=new JSZip()
  zip.file('firmware.bin',bin);zip.file('firmware.elf',elf);zip.file('firmware.uf2',uf2)
  zip.file('manifest.json',JSON.stringify(manifest,null,2)+'\n')
  zip.file('README.md',await readFile('firmware/README.md'))
  zip.file('commissioning.md',await readFile('docs/commissioning.md'))
  zip.file('commissioning-record.template.json',await readFile('engineering/commissioning-record.template.json'))
  await mkdir('release',{recursive:true})
  await writeFile(archivePath,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}))
  if (!testProfile) await writeFile('docs/checks/firmware-target.json',JSON.stringify(manifest,null,2)+'\n')
  if (!testProfile) {
  const orderPath = 'release/order-settings.json'
  const order = JSON.parse(await readFile(orderPath, 'utf8'))
  order.programming.U16_mcu.commissioning_image = {
    archive: 'pd1180-commissioning-firmware.zip', member: 'firmware.bin',
    sha256: manifest.artifacts['firmware.bin'], image_bytes: manifest.image_bytes,
    motion_enabled: false,
  }
  await writeFile(orderPath, JSON.stringify(order,null,2)+'\n')
  }
}
const zip=await JSZip.loadAsync(await readFile(archivePath),{checkCRC32:true})
const manifest=JSON.parse(await zip.file('manifest.json').async('string'))
if(Object.keys(inputs).sort().join('\n')!==Object.keys(manifest.inputs).sort().join('\n')) throw new Error('Firmware source file set changed; rebuild required')
for(const [p, hash] of Object.entries(inputs)) {
  if(manifest.inputs[p]!==hash) throw new Error(`Target firmware is stale: ${p}; run bun run build:firmware`)
}
for(const [p, hash] of Object.entries(manifest.artifacts)) {
  if(sha(await zip.file(p).async('nodebuffer'))!==hash) throw new Error(`Corrupt firmware artifact: ${p}`)
}
if(manifest.motor_operation_enabled!==(profile==='bench-test')) throw new Error('This commissioning image must not enable motion')
if (!testProfile) {
const requestedImage = JSON.parse(await readFile('release/order-settings.json','utf8')).programming.U16_mcu.commissioning_image
if(requestedImage?.sha256 !== manifest.artifacts['firmware.bin'] ||
   requestedImage.image_bytes !== manifest.image_bytes || requestedImage.motion_enabled !== false)
  throw new Error('Commissioning image in order settings differs from the verified ARM archive')
}
console.log(`Verified ${profile} ARM commissioning image: ${manifest.image_bytes}/${manifest.max_flash_bytes} bytes; motion=${manifest.motor_operation_enabled}; source hashes match.`)
