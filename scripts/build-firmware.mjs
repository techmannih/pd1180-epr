import { spawn } from 'node:child_process'
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import JSZip from 'jszip'
const sha = (data) => createHash('sha256').update(data).digest('hex')
const check = process.argv.includes('--check')
const paths = ['firmware/platformio.ini', 'firmware/README.md', 'docs/firmware-pinmap.json', 'scripts/build-firmware.mjs']
for (const dir of ['firmware/src', 'firmware/include', 'firmware/target', 'firmware/boards']) {
  for (const f of (await readdir(dir)).sort()) paths.push(`${dir}/${f}`)
}
const inputs = Object.fromEntries(await Promise.all(paths.map(async p => [p, sha(await readFile(p))])))
const archivePath = 'release/pd1180-commissioning-firmware.zip'
if (!check) {
  await new Promise((ok, fail) => {
    const p = spawn(process.env.PIO || 'pio', ['run', '-d', 'firmware'], {
      stdio: 'inherit', env: {...process.env, PLATFORMIO_CORE_DIR: process.env.PLATFORMIO_CORE_DIR || resolve('.cache/platformio')}
    })
    p.on('error',fail); p.on('close',code => code === 0 ? ok() : fail(new Error(`STM32 target build failed: ${code}`)))
  })
  const bin = await readFile('firmware/.pio/build/pd1180/firmware.bin')
  const elf = await readFile('firmware/.pio/build/pd1180/firmware.elf')
  if (elf.readUInt32BE(0)!==0x7f454c46 || elf[4]!==1 || elf[5]!==1 || elf.readUInt16LE(18)!==40)
    throw new Error('Expected little-endian 32-bit ARM ELF, not a host executable')
  const sp=bin.readUInt32LE(0), reset=bin.readUInt32LE(4)
  if (bin.length>131072 || sp<=0x20000000 || sp>0x20024000 || !(reset&1) || reset<0x08000000 || reset>=0x08020000)
    throw new Error('STM32G0B1CB vector table / memory bounds failed')
  const manifest={built_at:new Date().toISOString(), target:'STM32G0B1CBT6',
    image_type:'commissioning-diagnostics-only', motor_operation_enabled:false,
    flash_address:'0x08000000', initial_sp:`0x${sp.toString(16)}`, reset_vector:`0x${reset.toString(16)}`,
    max_flash_bytes:131072, image_bytes:bin.length, inputs,
    artifacts:{'firmware.bin':sha(bin),'firmware.elf':sha(elf)},
    unverified:['USB enumeration and measured GPIO levels on hardware','TI configuration image/programming','STEP/DIR hardware ECO','motor operation and thermal/EMC validation']}
  const zip=new JSZip()
  zip.file('firmware.bin',bin);zip.file('firmware.elf',elf)
  zip.file('manifest.json',JSON.stringify(manifest,null,2)+'\n')
  zip.file('README.md',await readFile('firmware/README.md'))
  await mkdir('release',{recursive:true})
  await writeFile(archivePath,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}))
  await writeFile('docs/checks/firmware-target.json',JSON.stringify(manifest,null,2)+'\n')
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
if(manifest.motor_operation_enabled!==false) throw new Error('This frozen-board commissioning image must not enable motion')
console.log(`Verified ARM commissioning image: ${manifest.image_bytes}/131072 bytes; motion locked; source hashes match.`)
