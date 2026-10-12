import {readFile,writeFile} from 'node:fs/promises'
const circuit=JSON.parse(await readFile('dist/index/circuit.json'))
const components=new Map(circuit.filter(r=>r.type==='source_component').map(r=>[r.name,r]))
const ports=circuit.filter(r=>r.type==='source_port'), nets=circuit.filter(r=>r.type==='source_net')
const net=(ref,pin)=>{const p=ports.find(p=>p.source_component_id===components.get(ref)?.source_component_id&&p.pin_number===pin);return p?.subcircuit_connectivity_map_key?nets.find(n=>n.subcircuit_connectivity_map_key===p.subcircuit_connectivity_map_key)?.name:undefined}
const errors=[]
for(const pin of [17,18,23,24,25]) if(net('U7',pin)!=='GND') errors.push(`U7 pin${pin} must be grounded in the selected internal-ramp configuration`)
for(const [ref,pin,name] of [['U16',28,'SD_MODE'],['U7',21,'SD_MODE'],['SW2',1,'USER_BUTTON_N'],['SW2',2,'GND'],['R133',1,'V3V3_MCU'],['R133',2,'USER_BUTTON_N'],['U16',30,'USER_BUTTON_N'],['Q14',2,'GND']]) if(net(ref,pin)!==name) errors.push(`${ref}.${pin} must connect to ${name}`)
for(const ref of ['J7','Q15','U8','U9']) if(components.has(ref)) errors.push(`Removed external command component remains: ${ref}`)
const firmware=await readFile('firmware/target/main.cpp','utf8')
if(!firmware.includes('digitalWrite(pin(PD1180_PIN_SD_MODE),LOW)')||/digitalWrite\(pin\(PD1180_PIN_SD_MODE\),[^;]*HIGH/.test(firmware)) errors.push('Target must keep SD_MODE low')
const report={checked_at:new Date().toISOString(),selected_mode:'onboard-spi-velocity-ramp-local-start-stop',source:'ADI TMC5160A rev1.18 pin table and sections 6/14',hardware_qualified:false,errors}
await writeFile('docs/checks/operating-mode.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1
