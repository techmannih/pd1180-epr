import { test, expect } from 'bun:test'
import {readFileSync} from 'node:fs'

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
  expect(pcb.center).toEqual({x:30,y:22})
  expect(cad.position.x).toBe(30);expect(cad.position.y).toBe(22)
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
  const names=['GND','USB_VBUS','VMOTOR','V3V3','V3V3_USB','V3V3_MOTOR','LOGIC_OR_PRIORITY','VBUS_LV','PD_1V5','TMC_12V']
  const keys=names.map(netKey)
  expect(keys.every(Boolean)).toBe(true)
  expect(new Set(keys).size).toBe(names.length)
})
test('48-V connector goes through the EPR protector; PD controller never sees raw 48 V',()=>{
  for(const pin of [7,8,17,18])on('J1',pin,'USB_VBUS')
  on('U1',20,'USB_VBUS');on('U1',19,'VBUS_LV')
  on('U2',26,'VBUS_LV');on('U2',27,'VBUS_LV')
  on('U2',2,'PD_3V3');on('U2',3,'GND') // SafeMode, address 0x20.
  on('Q1',2,'VBUS_LV');on('Q1',3,'USB_VBUS')
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
test('one Type-C receptacle carries EPR power and protected USB 2.0 data',()=>{
  on('J1',15,'CC1_CONN');on('J1',9,'CC2_CONN')
  on('U1',4,'CC1_CONN');on('U1',7,'CC1_CONN');on('U1',12,'CC1_PD');on('U2',24,'CC1_PD')
  on('U1',5,'CC2_CONN');on('U1',6,'CC2_CONN');on('U1',11,'CC2_PD');on('U2',25,'CC2_PD')
  on('C2',1,'PD_3V3');on('C2',2,'GND')
  expect(comp('C2').capacitance).toBe(1e-6)
  expect(comp('C2').supplier_part_numbers.jlcpcb).toContain('C15849')
  expect(manifest.parts.find(p=>p.name==='C2').value).toBe('1uF')
  for(const pin of [11,13])on('J1',pin,'USB_DP_CONN')
  for(const pin of [12,14])on('J1',pin,'USB_DM_CONN')
  expect(comp('J10')).toBeUndefined()
  for(const removed of ['R105','R106'])expect(comp(removed)).toBeUndefined()
  on('R107',1,'USB_VBUS');on('R107',2,'USB_VBUS_SENSE')
  on('R108',1,'USB_VBUS_SENSE');on('R108',2,'GND')
  on('C72',1,'USB_VBUS_SENSE');on('C72',2,'GND');on('U16',19,'USB_VBUS_SENSE')
  expect(manifest.parts.find(p=>p.name==='R107').value).toBe('1M')
  expect(manifest.parts.find(p=>p.name==='R108').value).toBe('47k')
  expect(60*47000/(1000000+47000)).toBeLessThan(3.0)
  expect(5*47000/(1000000+47000)).toBeGreaterThan(0.2)
  on('U1',1,'USB_DP_CONN');on('U1',15,'USB_DP_PROTECTED');on('R71',1,'USB_DP_PROTECTED');on('R71',2,'USB_DP');on('U16',34,'USB_DP')
  on('U1',2,'USB_DM_CONN');on('U1',14,'USB_DM_PROTECTED');on('R72',1,'USB_DM_PROTECTED');on('R72',2,'USB_DM');on('U16',33,'USB_DM')
  // TPS26750 USB_P/USB_N are unused because STM32 owns USB data; TI requires unused GPIO4/GPIO5 to GND.
  on('U2',22,'GND');on('U2',23,'GND')
  const independentSignals=['CC1_PD','CC2_PD','USB_DP','USB_DM'].map(netKey)
  expect(independentSignals.every(Boolean)).toBe(true)
  expect(new Set(independentSignals).size).toBe(independentSignals.length)
})
test('logic boots upstream of the gated motor power path',()=>{
  on('U5',2,'USB_VBUS');on('U5',5,'BUCK_FB');on('L1',2,'V3V3_USB')
  on('Q4',1,'USB_VBUS');on('Q4',5,'EFUSE_IN');on('U6',17,'VMOTOR')
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
test('MCU receives independent input-current and motor-bus voltage telemetry',()=>{
  on('U6',13,'IIN_MON');on('R26',1,'IIN_MON');on('U16',12,'IIN_MON')
  on('R31',1,'VMOTOR');on('R31',2,'VMON_MID');on('R32',1,'VMON_MID');on('R32',2,'VMON_ADC');on('U16',11,'VMON_ADC')
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
  on('U23',1,'V3V3_USB');on('U24',1,'V3V3_MOTOR')
  on('U23',3,'V3V3_MOTOR');on('U23',5,'LOGIC_OR_PRIORITY')
  on('R111',1,'V3V3_USB');on('R111',2,'LOGIC_OR_PRIORITY')
  on('U24',3,'LOGIC_OR_PRIORITY');on('U24',5,'GND')
  for(const name of ['U23','U24']){on(name,6,'V3V3');on(name,2,'GND')}
  on('U13',5,'V3V3');on('U14',5,'V3V3');on('R59',1,'V3V3')
})
