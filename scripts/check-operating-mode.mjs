import {readFile,writeFile} from 'node:fs/promises'
import {checkRp2040Contract} from './rp2040-contract.mjs'
const circuit=JSON.parse(await readFile('dist/index/circuit.json'))
const errors=checkRp2040Contract(circuit)
const firmware=await readFile('firmware/target/main.cpp','utf8')
for(const flag of ['motionWiringVerified','pdImageVerified','brakeHardwareVerified','rp2040UsbPowerVerified'])
  if(!firmware.includes(`static constexpr bool ${flag} = false;`)) errors.push(`${flag} must remain locked until measured qualification`)
const report={checked_at:new Date().toISOString(),selected_mode:'RP2040 STEP/DIR with DRV8462DDV SPI and hardware enable',sources:['https://www.ti.com/lit/ds/symlink/drv8462.pdf','https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf'],hardware_qualified:false,errors}
await writeFile('docs/checks/operating-mode.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1
