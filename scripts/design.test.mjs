import { test, expect } from 'bun:test'
import {readFileSync} from 'node:fs'

const data=JSON.parse(readFileSync(new URL('../dist/index/circuit.json',import.meta.url)))
const manifest=JSON.parse(readFileSync(new URL('../docs/design-manifest.json',import.meta.url)))
const components=data.filter(e=>e.type==='source_component')
const ports=data.filter(e=>e.type==='source_port')
const nets=data.filter(e=>e.type==='source_net')
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
test('source connectivity does not short power, ground, or the switched motor rail',()=>{
  const names=['GND','USB_VBUS','USB_DATA_VBUS','VMOTOR','V3V3','V3V3_USB','V3V3_MOTOR','VBUS_LV','PD_1V5','TMC_12V']
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
test('USB-PD power and USB 2.0 data use separate Type-C receptacles and nets',()=>{
  on('J1',15,'CC1_CONN');on('J1',9,'CC2_CONN')
  on('U1',4,'CC1_CONN');on('U1',7,'CC1_CONN');on('U1',12,'CC1_PD');on('U2',24,'CC1_PD')
  on('U1',5,'CC2_CONN');on('U1',6,'CC2_CONN');on('U1',11,'CC2_PD');on('U2',25,'CC2_PD')
  for(const pin of [11,12,13,14])expect(key('J1',pin)).toBeUndefined()
  for(const pin of [11,13])on('J10',pin,'USB_DP_CONN')
  for(const pin of [12,14])on('J10',pin,'USB_DM_CONN')
  on('J10',15,'USB_DATA_CC1');on('R105',1,'USB_DATA_CC1');on('R105',2,'GND')
  on('J10',9,'USB_DATA_CC2');on('R106',1,'USB_DATA_CC2');on('R106',2,'GND')
  for(const pin of [7,8,17,18])on('J10',pin,'USB_DATA_VBUS')
  on('R107',1,'USB_DATA_VBUS');on('R107',2,'USB_DATA_VBUS_SENSE')
  on('R108',1,'USB_DATA_VBUS_SENSE');on('R108',2,'GND')
  on('C72',1,'USB_DATA_VBUS_SENSE');on('C72',2,'GND');on('U16',19,'USB_DATA_VBUS_SENSE')
  expect(netKey('USB_DATA_VBUS')).not.toBe(netKey('USB_VBUS'))
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
  on('RS1',1,'SENSE_A');on('RS1',2,'GND');on('RS2',1,'SENSE_B');on('RS2',2,'GND')
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
test('MCU pin mapping retains USB attach sense, data, FDCAN and SWD without sharing their pins',()=>{
  for(const [pin,net]of [[19,'USB_DATA_VBUS_SENSE'],[33,'USB_DM'],[34,'USB_DP'],[35,'SWDIO'],[36,'SWCLK'],[38,'CAN_RX'],[39,'CAN_TX']])on('U16',pin,net)
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

test('motor-side buck keeps the brake logic alive with USB absent and both inputs reverse-blocked',()=>{
  on('U22',2,'VMOTOR');on('L2',2,'V3V3_MOTOR')
  on('U23',1,'V3V3_USB');on('U24',1,'V3V3_MOTOR')
  for(const name of ['U23','U24']){on(name,3,'V3V3');on(name,6,'V3V3');on(name,2,'GND')}
  on('U13',5,'V3V3');on('U14',5,'V3V3');on('R59',1,'V3V3')
})
