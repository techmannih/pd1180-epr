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
  expect(components.length).toBe(manifest.parts.length)
  for(const p of manifest.parts) expect(comp(p.name)?.supplier_part_numbers?.jlcpcb).toContain(p.lcsc)
})
test('source connectivity does not short power, ground, or the switched motor rail',()=>{
  const names=['GND','USB_VBUS','VMOTOR','V3V3','V3V3_USB','V3V3_MOTOR','VBUS_LV','PD_1V5','TMC_12V']
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
})
test('brake dissipates downstream energy without feeding the USB supply',()=>{
  on('J3',1,'VMOTOR');on('J3',2,'BRAKE_RETURN');on('Q16',5,'BRAKE_RETURN');on('Q16',1,'GND')
  on('U13',3,'BRAKE_SENSE');on('U13',4,'VREF_2V495');on('U15',6,'BRAKE_ON')
})
test('MCU pin mapping retains USB, FDCAN and SWD without sharing their pins',()=>{
  for(const [pin,net]of [[33,'USB_DM'],[34,'USB_DP'],[35,'SWDIO'],[36,'SWCLK'],[38,'CAN_RX'],[39,'CAN_TX']])on('U16',pin,net)
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
