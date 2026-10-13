import { readFile, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { validatePdImage } from './pd-image-policy.mjs'
const config=JSON.parse(await readFile('docs/pd-configuration.json'))
const zip=await JSZip.loadAsync(await readFile('firmware/pd/ti-configuration.zip'),{checkCRC32:true})
const project=await readFile(config.project.path)
if(!project.equals(await zip.file('project.json').async('nodebuffer')))throw new Error('Archived project differs')
if(!zip.file('TI-firmware-license.pdf')||!zip.file('NOTICE.txt'))throw new Error('Missing TI license/notice')
const report=validatePdImage(project,await zip.file('fullFlash.bin').async('nodebuffer'),config)
await writeFile('docs/pd-image-check.json',JSON.stringify({checked_at:new Date().toISOString(),...report,image:config.eeprom.image,project:config.project},null,2)+'\n')
console.log('TI full-flash image and both register regions match reviewed sink/GPIO settings. Hardware programming remains pending.')
