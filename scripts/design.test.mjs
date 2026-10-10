import { test, expect } from 'bun:test'
import {readFileSync} from 'node:fs'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCloudViewerCircuit } from './generate-cloud-viewer.mjs'
import { circuitSourceHash } from './circuit-source-hash.mjs'

test('native evidence ignores only the CLI filesystem cache key', () => {
  const circuit = [{ type: 'pcb_trace', route: [{ x: 1, y: 2, width: 0.15 }] },
    { type: 'source_project_metadata', source_filesystem_md5_hash: 'first', project: 'motor' }]
  const hash = circuitSourceHash(circuit)
  circuit[1].source_filesystem_md5_hash = 'rebuilt reports'
  expect(circuitSourceHash(circuit)).toBe(hash)
  circuit[0].route[0].width = 0.2
  expect(circuitSourceHash(circuit)).not.toBe(hash)
  circuit[0].route[0].width = 0.15
  circuit[1].project = 'different board'
  expect(circuitSourceHash(circuit)).not.toBe(hash)
})

const data=JSON.parse(readFileSync(new URL('../dist/index/circuit.json',import.meta.url)))
const manifest=JSON.parse(readFileSync(new URL('../docs/design-manifest.json',import.meta.url)))
const components=data.filter(e=>e.type==='source_component')
const ports=data.filter(e=>e.type==='source_port')
const nets=data.filter(e=>e.type==='source_net')
const pcbComponents=data.filter(e=>e.type==='pcb_component')
const comp=name=>components.find(e=>e.name===name)
const port=(name,pin)=>ports.find(e=>e.source_component_id===comp(name)?.source_component_id && e.pin_number===pin)
const key=(name,pin)=>port(name,pin)?.subcircuit_connectivity_map_key
const netKey=name=>nets.find(e=>e.name===name)?.subcircuit_connectivity_map_key
const on=(name,pin,net)=>expect(key(name,pin)).toBe(netKey(net))

test('hosted release ignores only the CLI cache key while preserving every source model record', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pd1180-viewer-cache-'))
  try {
    const changedCache = structuredClone(data)
    changedCache.find(row => row.type === 'source_project_metadata').source_filesystem_md5_hash = 'different-local-build-cache'
    const alternateSource = join(directory, 'source.json')
    await writeFile(alternateSource, JSON.stringify(changedCache))
    const original = (await createCloudViewerCircuit()).circuit
    const rebuilt = (await createCloudViewerCircuit({ sourceCircuitPath: alternateSource })).circuit
    expect(rebuilt).toEqual(original)
    const copper = new Set(['pcb_trace', 'pcb_via', 'pcb_copper_pour'])
    const expectedModel = data.filter(row => !copper.has(row.type)).map(row => {
      const expected = structuredClone(row)
      if (expected.type === 'source_project_metadata') delete expected.source_filesystem_md5_hash
      return expected
    })
    expect(original.filter(row => !copper.has(row.type))).toEqual(expectedModel)
    expect(original.some(row => row.type === 'pcb_trace')).toBe(true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}, 120000)

test('all physical parts are present and have their intended JLC code',()=>{
  const supplierBacked=components.filter(component=>component.supplier_part_numbers?.jlcpcb?.length)
  expect(supplierBacked.length).toBe(manifest.parts.length)
  for(const p of manifest.parts) expect(comp(p.name)?.supplier_part_numbers?.jlcpcb).toContain(p.lcsc)
  expect(components.filter(component=>!component.supplier_part_numbers?.jlcpcb?.length).every(component=>component.name.startsWith('TP_'))).toBe(true)
})
test('C22 bulk capacitor body and CAD model stay inside the stepped board outline',()=>{
  const source=comp('C22')
  const pcb=pcbComponents.find(item=>item.source_component_id===source.source_component_id)
  const cad=data.find(item=>item.type==='cad_component'&&item.pcb_component_id===pcb.pcb_component_id)
  const board=data.find(item=>item.type==='pcb_board')
  expect(pcb.center).toEqual({x:20,y:28})
  expect(cad.position.x).toBe(20);expect(cad.position.y).toBe(28)
  expect(cad.model_step_url).toContain('C407954.step')
  const distance=(point,start,end)=>{
    const dx=end.x-start.x,dy=end.y-start.y
    if(dx===0&&dy===0)return Math.hypot(point.x-start.x,point.y-start.y)
    const t=Math.max(0,Math.min(1,((point.x-start.x)*dx+(point.y-start.y)*dy)/(dx*dx+dy*dy)))
    return Math.hypot(point.x-(start.x+t*dx),point.y-(start.y+t*dy))
  }
  const edges=board.outline.map((point,index)=>[point,board.outline[(index+1)%board.outline.length]])
  const minimumCenterToEdge=Math.min(...edges.map(([start,end])=>distance(pcb.center,start,end)))
  // Imported courtyard radius is 6.505 mm, leaving more than 1.4 mm to the exact STEP outline.
  expect(minimumCenterToEdge).toBeGreaterThan(7.9)
})
test('source connectivity does not short power, ground, or the switched motor rail',()=>{
  const names=['USB_DATA_VBUS','GND','PD_VBUS','VMOTOR','V3V3','V3V3_PD','V3V3_MOTOR','LOGIC_OR_PRIORITY','VBUS_LV','PD_1V5','TMC_12V']
  const keys=names.map(netKey)
  expect(keys.every(Boolean)).toBe(true)
  expect(new Set(keys).size).toBe(names.length)
})
test('48-V connector goes through the EPR protector; PD controller never sees raw 48 V',()=>{
  for(const pin of [7,8,17,18])on('J1',pin,'PD_VBUS')
  on('U1',20,'PD_VBUS');on('U1',19,'VBUS_LV')
  on('U2',26,'VBUS_LV');on('U2',27,'VBUS_LV')
  on('U2',2,'PD_3V3');on('U2',3,'GND') // SafeMode, address 0x20.
  on('Q1',2,'VBUS_LV');on('Q1',3,'PD_VBUS')
})
test('TPS26750 POWER_PATH_EN uses the TI EVM dual-NMOS buffer',()=>{
  on('U2',20,'PD_PATH_HV');on('R9',1,'PD_PATH_HV');on('R9',2,'PD_LEVEL_BASE')
  on('Q2',1,'PD_LEVEL_BASE');on('Q2',2,'GND');on('Q2',3,'PD_PATH_N')
  on('R11',1,'PD_3V3');on('R11',2,'PD_PATH_N')
  on('R12',1,'PD_PATH_N');on('R12',2,'PD_INV_BASE')
  on('Q3',1,'PD_INV_BASE');on('Q3',2,'GND');on('Q3',3,'PD_PATH_OK')
  on('R13',1,'PD_3V3');on('R13',2,'PD_PATH_OK')
  expect(comp('R10')).toBeUndefined()
  for(const name of ['Q2','Q3']){
    expect(comp(name).manufacturer_part_number).toBe('CSD17484F4')
    expect(comp(name).supplier_part_numbers.jlcpcb).toContain('C2862245')
    expect(port(name,1).port_hints).toContain('gate')
    expect(port(name,2).port_hints).toContain('source')
    expect(port(name,3).port_hints).toContain('drain')
  }
  for(const name of ['R9','R12']){
    expect(comp(name).resistance).toBe(0)
    expect(comp(name).supplier_part_numbers.jlcpcb).toContain('C21189')
  }
  for(const name of ['R11','R13']){
    expect(comp(name).resistance).toBe(100000)
    expect(comp(name).supplier_part_numbers.jlcpcb).toContain('C25803')
  }
})
test('separate Type-C receptacles carry EPR power and protected USB 2.0 data',()=>{
  on('J1',15,'CC1_CONN');on('J1',9,'CC2_CONN')
  on('U1',4,'CC1_CONN');on('U1',7,'CC1_CONN');on('U1',12,'CC1_PD');on('U2',24,'CC1_PD')
  on('U1',5,'CC2_CONN');on('U1',6,'CC2_CONN');on('U1',11,'CC2_PD');on('U2',25,'CC2_PD')
  on('C2',1,'PD_3V3');on('C2',2,'GND')
  expect(comp('C2').capacitance).toBe(1e-6)
  expect(comp('C2').supplier_part_numbers.jlcpcb).toContain('C15849')
  expect(manifest.parts.find(p=>p.name==='C2').value).toBe('1uF')
  for(const pin of [11,13])on('J10',pin,'USB_DP_CONN')
  for(const pin of [12,14])on('J10',pin,'USB_DM_CONN')
  expect(comp('J10').standard).toBe('usb_c')
  for(const [ref,net] of [['R105','DATA_CC1'],['R106','DATA_CC2']]) { on(ref,1,net);on(ref,2,'GND');expect(comp(ref).resistance).toBe(5100) }
  on('R107',1,'USB_DATA_VBUS');on('R107',2,'USB_VBUS_SENSE')
  on('R108',1,'USB_VBUS_SENSE');on('R108',2,'GND')
  on('C72',1,'USB_VBUS_SENSE');on('C72',2,'GND');on('U16',19,'USB_VBUS_SENSE')
  expect(manifest.parts.find(p=>p.name==='R107').value).toBe('1M')
  expect(manifest.parts.find(p=>p.name==='R108').value).toBe('47k')
  expect(60*47000/(1000000+47000)).toBeLessThan(3.0)
  expect(5*47000/(1000000+47000)).toBeGreaterThan(0.2)
  on('D15',1,'USB_DP_CONN');on('R71',1,'USB_DP_CONN');on('R71',2,'USB_DP');on('U16',34,'USB_DP')
  on('D15',3,'USB_DM_CONN');on('R72',1,'USB_DM_CONN');on('R72',2,'USB_DM');on('U16',33,'USB_DM')
  // TPS26750 USB_P/USB_N are unused because STM32 owns USB data; TI requires unused GPIO4/GPIO5 to GND.
  on('U2',22,'GND');on('U2',23,'GND')
  const independentSignals=['CC1_PD','CC2_PD','USB_DP','USB_DM'].map(netKey)
  expect(independentSignals.every(Boolean)).toBe(true)
  expect(new Set(independentSignals).size).toBe(independentSignals.length)
})
test('logic boots upstream of the gated motor power path',()=>{
  on('U5',2,'PD_VBUS');on('U5',5,'BUCK_FB');on('L1',2,'V3V3_PD')
  on('Q4',1,'PD_VBUS');on('Q4',5,'EFUSE_IN');on('U6',17,'VMOTOR')
  on('U4',1,'PD_PATH_OK');on('U4',2,'POWER_PERMIT');on('U6',12,'EFUSE_EN')
  expect(manifest.parts.find(p=>p.name==='R14').value).toBe('10k')
})
test('hardware driver shutdown needs MCU, power-good, voltage-good and external enable',()=>{
  on('U7',28,'DRV_EN_N');on('R37',1,'V3V3');on('R37',2,'DRV_EN_N')
  on('U10',1,'MCU_RUN');on('U10',2,'MOTOR_PG');on('U11',2,'VMOTOR_OK')
  on('Q14',3,'DRV_EN_N');on('Q14',2,'ENABLE_CHAIN');on('Q15',3,'ENABLE_CHAIN');on('Q15',2,'GND')
  on('R57',1,'HW_ENABLE_24V')
})
test('both bridges have four external FETs and independent low-side shunts',()=>{
  for(const [hi,lo,phase] of [[6,7,'A1'],[8,9,'A2'],[10,11,'B1'],[12,13,'B2']]){
    for(const pin of [5,6,7,8,9])on('Q'+hi,pin,'VMOTOR')
    for(const pin of [1,2,3])on('Q'+hi,pin,'MOTOR_'+phase)
    for(const pin of [5,6,7,8,9])on('Q'+lo,pin,'MOTOR_'+phase)
    for(const pin of [1,2,3])on('Q'+lo,pin,'SENSE_'+phase[0])
  }
  on('R109',1,'SENSE_A');on('R109',2,'GND');on('R110',1,'SENSE_B');on('R110',2,'GND')
  on('U7',8,'SENSE_A');on('U7',9,'SENSE_B')
})
test('ADS1115 receives independent input-current and motor-bus voltage telemetry',()=>{
  on('U6',13,'IIN_MON');on('R26',1,'IIN_MON');on('U30',5,'IIN_MON')
  on('R31',1,'VMOTOR');on('R31',2,'VMON_MID');on('R32',1,'VMON_MID');on('R32',2,'VMON_ADC');on('U30',4,'VMON_ADC')
  expect(netKey('IIN_MON')).not.toBe(netKey('VMON_ADC'))
})
test('brake dissipates downstream energy without feeding the USB supply',()=>{
  on('J3',1,'VMOTOR');on('J3',2,'BRAKE_RETURN');on('Q16',5,'BRAKE_RETURN');on('Q16',1,'GND')
  on('U13',3,'BRAKE_SENSE');on('U13',4,'VREF_2V495');on('U15',6,'BRAKE_ON')
})
test('MCU pin mapping retains EPR-safe USB attach sense, data, FDCAN and SWD without sharing their pins',()=>{
  for(const [pin,net]of [[19,'USB_VBUS_SENSE'],[33,'USB_DM'],[34,'USB_DP'],[35,'SWDIO'],[36,'SWCLK'],[38,'CAN_RX'],[39,'CAN_TX']])on('U16',pin,net)
  expect(ports.filter(p=>p.source_component_id===comp('U16').source_component_id).length).toBe(48)
})
test('analytical limits have margin below the 5-A USB input contract',()=>{
  const limit=18000/4020
  expect(limit).toBeCloseTo(4.4776,3)
  expect(limit*1.07/0.99+0.1).toBeLessThan(5)
  const brakeOn=2.495*(1+200000/10000+200000/1e6)
  const brakeOff=brakeOn-3.3*200000/1e6
  expect(brakeOn).toBeGreaterThan(50.4)
  expect(brakeOn).toBeLessThan(54)
  expect(brakeOff).toBeLessThan(brakeOn)
  expect(5.5**2*.033).toBeLessThan(3) // dissipation per phase shunt
})

test('LM66100 status interlock keeps the dual 3.3-V ORing output continuous',()=>{
  on('U23',1,'V3V3_PD');on('U24',1,'V3V3_MOTOR')
  on('U23',3,'V3V3_MOTOR');on('U23',5,'LOGIC_OR_PRIORITY')
  on('R111',1,'V3V3_PD');on('R111',2,'LOGIC_OR_PRIORITY')
  on('U24',3,'LOGIC_OR_PRIORITY');on('U24',5,'GND')
  for(const name of ['U23','U24']){on(name,6,'V3V3');on(name,2,'GND')}
  on('U13',5,'V3V3');on('U14',5,'V3V3');on('R59',1,'V3V3')
})

test('USB DATA has independent CC, attach sense and ESD while VMOTOR retains brake backup',()=>{
  for(const pin of [7,8,17,18])on('J10',pin,'USB_DATA_VBUS')
  for(const pin of [11,12,13,14])expect(key('J1',pin)).toBeFalsy()
  on('J10',15,'DATA_CC1');on('J10',9,'DATA_CC2')
  on('D15',2,'GND');on('D15',4,'DATA_CC1');on('D15',5,'USB_DATA_VBUS');on('D15',6,'DATA_CC2')
  on('C73',1,'USB_DATA_VBUS');on('C73',2,'GND')
  for(const ref of ['C62','C63']) { on(ref,1,'VMOTOR');on(ref,2,'GND') }
  on('U22',2,'VMOTOR');on('U22',3,'VMOTOR')
  expect(new Set(['PD_VBUS','USB_DATA_VBUS','VMOTOR','DATA_CC1','DATA_CC2','CC1_PD','CC2_PD'].map(netKey)).size).toBe(7)
})
test('one 20-pin harness retains all industrial interfaces',()=>{
  expect(comp('J6')).toBeUndefined();expect(comp('J9')).toBeUndefined()
  expect(comp('J7').manufacturer_part_number).toBe('B20B-PHDSS(LF)(SN)')
  const expected=['HOME_24V','STOPL_24V','STOPR_24V','DIN0_24V','DIN1_24V','STEP_24V','DIR_24V','GND','RS232_TX_CONN','RS232_RX_CONN','GND','CAN_H','CAN_L','GND','RS485_A','RS485_B','VMOTOR','HW_ENABLE_24V','OUT0','OUT1']
  expected.forEach((net,index)=>on('J7',index+1,net))
  for(const ref of ['U19','U20','U21','Q17','Q18','Q24','Q25'])expect(comp(ref)).toBeDefined()
})
test('STEP/DIR multifunction pins cannot contend with encoder outputs',()=>{
  on('U7',23,'GND');on('U7',24,'GND');expect(key('U7',25)).toBeFalsy()
  on('U18',6,'ENC_B');on('U18',7,'ENC_A');on('U18',14,'ENC_I')
})


test('DATA powers only logic through a current limiter, regulator and reverse-blocking OR',()=>{
  on('U28',1,'USB_DATA_VBUS');on('U28',3,'USB_DATA_VBUS');on('U28',6,'USB_LOGIC_5V')
  on('U25',1,'USB_LOGIC_5V');on('U25',5,'V3V3_USB')
  on('U26',1,'V3V3');on('U26',3,'V3V3_USB');on('U26',5,'USB_OR_SELECT')
  on('U27',1,'V3V3_USB');on('U27',3,'USB_OR_SELECT');on('U27',5,'GND')
  on('R112',1,'V3V3');on('R112',2,'USB_OR_SELECT')
  for(const ref of ['U26','U27'])on(ref,6,'V3V3_MCU')
  expect(new Set(['PD_VBUS','USB_DATA_VBUS','USB_LOGIC_5V','V3V3_USB','V3V3','V3V3_MCU','VMOTOR'].map(netKey)).size).toBe(7)
})
test('both winding shunts are in series and feed bidirectional phase diagnostics',()=>{
  for(const [phase,shunt,amp,filter,adc,connectorPin] of [['A','R115','U31','R117',11,1],['B','R116','U32','R118',12,3]]){
    on(shunt,1,`MOTOR_${phase}1`);on(shunt,2,`MOTOR_${phase}1_OUT`)
    on('J2',connectorPin,`MOTOR_${phase}1_OUT`)
    on(amp,8,`MOTOR_${phase}1`);on(amp,1,`MOTOR_${phase}1_OUT`)
    on(amp,3,'GND');on(amp,7,'V3V3');on(amp,6,'V3V3')
    on(amp,5,`PHASE_${phase}_RAW`);on(filter,1,`PHASE_${phase}_RAW`);on(filter,2,`PHASE_${phase}_ADC`)
    on('U16',adc,`PHASE_${phase}_ADC`)
    expect(netKey(`MOTOR_${phase}1`)).not.toBe(netKey(`MOTOR_${phase}1_OUT`))
  }
  const phasePeak=5.5*Math.SQRT2
  expect(5.5**2*0.005).toBeLessThan(0.2)
  expect(1.65+phasePeak*0.005*20).toBeLessThan(3.1)
  expect(1.65-phasePeak*0.005*20).toBeGreaterThan(0.2)
})
test('TMP102 hardware alert inhibits the run chain independently of MCU_RUN',()=>{
  on('U29',3,'TEMP_OK');on('U29',4,'GND')
  on('R114',1,'V3V3');on('R114',2,'TEMP_OK')
  on('U11',4,'RUN_WINDOW_OK');on('U33',1,'RUN_WINDOW_OK');on('U33',2,'TEMP_OK')
  on('U33',4,'RUN_SAFE');on('R55',1,'RUN_SAFE')
  expect(netKey('RUN_WINDOW_OK')).not.toBe(netKey('RUN_SAFE'))
  on('U30',1,'V3V3') // 0x49, distinct from TMP102 ADD0=GND at 0x48.
  for(const [ref,sda,scl] of [['U29',6,1],['U30',9,10]]){on(ref,sda,'PD_SDA');on(ref,scl,'PD_SCL')}
})

test('USB-only power is confined to the MCU and its reset/decoupling network',()=>{
  const mcuRail=netKey('V3V3_MCU')
  const attached=new Set(ports.filter(p=>p.subcircuit_connectivity_map_key===mcuRail).map(p=>components.find(c=>c.source_component_id===p.source_component_id).name))
  expect([...attached].sort()).toEqual(['U16','U26','U27','C44','C45','C46','C47','R70','TP_SWD_3V3'].sort())
  for(const [ref,pin] of [['U19',3],['U20',8],['U21',16],['U31',6],['U32',6],['U18',11],['U17',8]])on(ref,pin,'V3V3')
  on('U16',20,'BOARD_POWER_SENSE');on('R119',1,'V3V3');on('R119',2,'BOARD_POWER_SENSE')
  on('R120',1,'BOARD_POWER_SENSE');on('R120',2,'GND')
  expect(key('U2',10)).toBeFalsy()
})
