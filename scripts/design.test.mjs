import { test, expect } from 'bun:test'
import {readFileSync} from 'node:fs'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCloudViewerCircuit } from './generate-cloud-viewer.mjs'
import { circuitSourceHash } from './circuit-source-hash.mjs'
import { checkPcbComponentsOutOfBoard } from '@tscircuit/checks'

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

test('native evidence tolerates derived length rounding but detects copper changes', () => {
  const trace = { type: 'pcb_trace', trace_length: 1.9498573488665445,
    route: [{ x: 1, y: 2, width: 0.15 }, { x: 2, y: 3, width: 0.15 }] }
  const hash = circuitSourceHash([trace])
  trace.trace_length = 1.9498573488665447 // Actual Linux CI result for the same route.
  expect(circuitSourceHash([trace])).toBe(hash)
  trace.trace_length += 0.000001
  expect(circuitSourceHash([trace])).not.toBe(hash)
  trace.trace_length = 1.9498573488665445
  trace.route[0].x += 0.000001
  expect(circuitSourceHash([trace])).not.toBe(hash)
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

test('R3 pads and courtyard stay inside the curved board edge', () => {
  const pcb = pcbComponents.find(row => row.source_component_id === comp('R3').source_component_id)
  expect(pcb.is_allowed_to_be_off_board).not.toBe(true)
  const footprint = data.filter(row => row.type === 'pcb_board' ||
    row.source_component_id === comp('R3').source_component_id ||
    row.pcb_component_id === pcb.pcb_component_id)
  expect(footprint.filter(row => row.type === 'pcb_smtpad')).toHaveLength(2)
  expect(footprint.filter(row => row.type === 'pcb_courtyard_rect')).toHaveLength(1)
  expect(checkPcbComponentsOutOfBoard(footprint)).toEqual([])

  // Reproduce the previous R3 placement using the real pads and courtyard.
  const previous = structuredClone(footprint)
  const deltaX = -28.55 - pcb.center.x
  for (const row of previous) {
    if (!row.type.startsWith('pcb_') || row.type === 'pcb_board') continue
    if (row.center) row.center.x += deltaX
    if (typeof row.x === 'number') row.x += deltaX
  }
  const errors = checkPcbComponentsOutOfBoard(previous)
  expect(errors).toHaveLength(1)
  expect(errors[0].pcb_component_id).toBe(pcb.pcb_component_id)
  expect(errors[0].type).toBe('pcb_component_outside_board_error')
})

test('source model has no errors or warnings and uses physical component types', () => {
  expect(data.filter(row => row.type.endsWith('_error') || row.type.endsWith('_warning'))).toEqual([])
  for (const name of ['Q2', 'Q3', 'Q4', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q16', 'Q26']) {
    expect(comp(name).ftype).toBe('simple_mosfet')
  }
  expect(comp('J2').ftype).toBe('simple_connector')
  expect(comp('D16').ftype).toBe('simple_led')
  expect(ports.filter(row => row.source_component_id === comp('D16').source_component_id).map(row => row.pin_number).sort()).toEqual([1, 2, 3, 4])
})

// This integration test imports the complete routed KiCad board twice.
test('hosted release ignores only the CLI cache key while preserving every source model record', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pd1180-viewer-cache-'))
  try {
    const changedCache = structuredClone(data)
    changedCache.find(row => row.type === 'source_project_metadata').source_filesystem_md5_hash = 'different-local-build-cache'
    const alternateSource = join(directory, 'source.json')
    await writeFile(alternateSource, JSON.stringify(changedCache))
    const changedAssemblyCache = JSON.parse(readFileSync('dist/motor-assembly/circuit.json'))
    changedAssemblyCache.find(row => row.type === 'source_project_metadata').source_filesystem_md5_hash = 'different-assembly-build-cache'
    const alternateAssembly = join(directory, 'assembly.json')
    await writeFile(alternateAssembly, JSON.stringify(changedAssemblyCache))
    const original = (await createCloudViewerCircuit()).circuit
    const rebuilt = (await createCloudViewerCircuit({ sourceCircuitPath: alternateSource, assemblyCircuitPath: alternateAssembly })).circuit
    expect(rebuilt).toEqual(original)
    const copper = new Set(['pcb_trace', 'pcb_via', 'pcb_copper_pour'])
    const expectedModel = data.filter(row => !copper.has(row.type)).map(row => {
      const expected = structuredClone(row)
      if (expected.type === 'source_project_metadata') delete expected.source_filesystem_md5_hash
      return expected
    })
    const mechanicalIds = new Set(original.filter(row => row.type === 'source_component' && row.ftype === 'subassembly').map(row => row.source_component_id))
    expect(original.filter(row => row.type === 'source_component' && row.ftype === 'subassembly').map(row => row.name).sort())
      .toEqual(JSON.parse(readFileSync('engineering/mechanical/assembly-parts.json')).map(part=>part.name).sort())
    expect(original.filter(row => !copper.has(row.type) && !mechanicalIds.has(row.source_component_id))).toEqual(expectedModel)
    expect(original.some(row => row.type === 'pcb_trace')).toBe(true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}, 300000)

test('all physical parts are present and have their intended JLC code',()=>{
  const supplierBacked=components.filter(component=>component.supplier_part_numbers?.jlcpcb?.length)
  const declaredParts=[...manifest.parts,...manifest.optional_parts]
  expect(supplierBacked.map(part=>part.name).sort()).toEqual(declaredParts.map(part=>part.name).sort())
  for(const p of declaredParts) expect(comp(p.name)?.supplier_part_numbers?.jlcpcb).toContain(p.lcsc)
  expect(components.filter(component=>!component.supplier_part_numbers?.jlcpcb?.length).every(component=>component.name.startsWith('TP_'))).toBe(true)
})
test('C22 bulk capacitor body and CAD model stay inside the stepped board outline',()=>{
  const source=comp('C22')
  const pcb=pcbComponents.find(item=>item.source_component_id===source.source_component_id)
  const cad=data.find(item=>item.type==='cad_component'&&item.pcb_component_id===pcb.pcb_component_id)
  const board=data.find(item=>item.type==='pcb_board')
  expect(cad.position.x).toBeCloseTo(pcb.center.x,6)
  expect(cad.position.y).toBeCloseTo(pcb.center.y,6)
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
test('hardware driver shutdown retains MCU, power-good, voltage-good and thermal inhibit',()=>{
  on('U7',28,'DRV_EN_N');on('R37',1,'V3V3');on('R37',2,'DRV_EN_N')
  on('U10',1,'MCU_RUN');on('U10',2,'MOTOR_PG');on('U11',2,'VMOTOR_OK')
  on('Q14',3,'DRV_EN_N');on('Q14',2,'GND');on('U33',1,'RUN_WINDOW_OK');on('U33',2,'TEMP_OK');on('U33',4,'RUN_SAFE')
  expect(comp('Q15')).toBeUndefined()
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
  on('U13',3,'BRAKE_SENSE');on('U13',4,'VREF_2V5');on('U15',6,'BRAKE_ON')
})
test('MCU retains USB attach sense, data and SWD while removed interface pins are disconnected',()=>{
  for(const [pin,net]of [[19,'USB_VBUS_SENSE'],[33,'USB_DM'],[34,'USB_DP'],[35,'SWDIO'],[36,'SWCLK']])on('U16',pin,net)
  for(const pin of [2,3,13,14,22,29,32,38,39,40,41])expect(key('U16',pin)).toBeFalsy()
  on('U16',49,'GND')
  expect(ports.filter(p=>p.source_component_id===comp('U16').source_component_id).length).toBe(49)
})
test('analytical limits have margin below the 5-A USB input contract',()=>{
  const limit=18000/comp('R25').resistance
  expect(limit).toBeCloseTo(3.6072,3)
  expect((18090/comp('R25').resistance)*1.10/(1-.0035)+.25).toBeLessThan(5)
  const brakeTop=comp('R60').resistance+comp('R61').resistance
  const brakeOn=2.5*(1+brakeTop/comp('R62').resistance+brakeTop/comp('R63').resistance)
  const brakeOff=brakeOn-3.3*brakeTop/comp('R63').resistance
  expect(brakeOn).toBeGreaterThan(50.4)
  expect(brakeOn).toBeLessThan(54)
  expect(brakeOff).toBeLessThan(brakeOn)
  expect(3.8**2*.033).toBeLessThan(3) // dissipation per phase shunt
})

test('LM66100 status interlock keeps the dual 3.3-V ORing output continuous',()=>{
  on('U23',1,'V3V3_PD');on('U24',1,'V3V3_MOTOR')
  on('U23',3,'V3V3_MOTOR');on('U23',5,'LOGIC_OR_PRIORITY')
  on('R111',1,'V3V3_PD');on('R111',2,'LOGIC_OR_PRIORITY')
  on('U24',3,'LOGIC_OR_PRIORITY');on('U24',5,'GND')
  for(const name of ['U23','U24']){on(name,6,'V3V3');on(name,2,'GND')}
  on('U13',5,'V3V3');on('U14',5,'V3V3');on('U12',3,'V3V3');on('U12',4,'V3V3');on('C93',1,'V3V3')
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
test('onboard control replaces every unsupported external command connection',()=>{
  const eco=JSON.parse(readFileSync('engineering/onboard-control-eco.json'))
  for(const ref of eco.removed_components)expect(comp(ref)).toBeUndefined()
  for(const name of eco.removed_nets)expect(nets.some(n=>n.name===name)).toBe(false)
  on('SW2',1,'USER_BUTTON_N');on('SW2',2,'GND');on('U16',30,'USER_BUTTON_N')
  on('R133',1,'V3V3_MCU');on('R133',2,'USER_BUTTON_N')
  for(const p of [25,26,27,31])expect(key('U16',p)).toBeFalsy()
})
test('SPI ramp unused inputs are defined and separate from encoder outputs',()=>{
  for(const p of [17,18,23,24,25])on('U7',p,'GND')
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

test('USB-only power is confined to the MCU and its local controls/decoupling',()=>{
  const mcuRail=netKey('V3V3_MCU')
  const attached=new Set(ports.filter(p=>p.subcircuit_connectivity_map_key===mcuRail).map(p=>components.find(c=>c.source_component_id===p.source_component_id).name))
  expect([...attached].sort()).toEqual(['U16','U26','U27','C44','C45','C46','C47','R70','R133','TP_SWD_3V3'].sort())
  for(const [ref,pin] of [['U31',6],['U32',6],['U18',11],['U17',8]])on(ref,pin,'V3V3')
  on('U16',20,'BOARD_POWER_SENSE');on('R119',1,'V3V3');on('R119',2,'BOARD_POWER_SENSE')
  on('R120',1,'BOARD_POWER_SENSE');on('R120',2,'GND')
  expect(key('U2',10)).toBeFalsy()
})

test('indicator reset silences the alarm without relying on I2C or stealing industrial GPIO',()=>{
  on('U35',3,'U35_RESET_N'); on('U37',2,'STATUS_GPIO'); on('U37',4,'U35_RESET_N');
  on('U37',3,'GND'); on('U37',5,'PD_3V3'); on('C99',1,'PD_3V3'); on('C99',2,'GND');
  on('R137',1,'U35_RESET_N'); on('R137',2,'GND');
  expect(key('U35',3)).not.toBe(key('U16',1));
  expect(comp('U37').manufacturer_part_number).toBe('SN74LVC1G17DBVR');
  expect(manifest.parts.find(p=>p.name==='R137').value).toBe('47k'); on('R132',1,'STATUS_GPIO'); on('R132',2,'GND')
  on('U35',16,'PD_3V3'); on('C95',1,'PD_3V3'); on('C95',2,'GND')
  for(const pin of [1,2,8,9,10,11,12])on('U35',pin,'GND')
  on('U35',14,'PD_SCL');on('U35',15,'PD_SDA')
  // Reset buffer and I2C pullups share the expander supply, independent of MCU power.
  for(const [signalPin,pullup]of[[14,'R7'],[15,'R6']]){
    expect(key(pullup,2)).toBe(key('U35',signalPin))
    expect(key(pullup,1)).toBe(key('U35',16))
  }
  expect(key('U35',13)).toBeUndefined()
  on('U35',7,'BUZZER_EN');on('R126',1,'BUZZER_EN');on('R126',2,'BUZZER_GATE')
  on('R127',1,'BUZZER_GATE');on('R127',2,'GND');on('Q26',1,'BUZZER_GATE')
  on('Q26',2,'GND');on('Q26',3,'BUZZER_LOW')
  on('BZ1',1,'V3V3');on('BZ1',2,'BUZZER_LOW')
  on('D18',1,'V3V3');on('D18',2,'BUZZER_LOW') // Flyback cathode faces the positive rail.
  for(const [pin,res,drive,ledPin,ledNet]of[[4,'R123','RGB_R_DRV',1,'RGB_R_K'],[5,'R124','RGB_G_DRV',4,'RGB_G_K'],[6,'R125','RGB_B_DRV',2,'RGB_B_K']]){
    on('U35',pin,drive);on(res,2,drive);on(res,1,ledNet);on('D16',ledPin,ledNet)
  }
  on('D16',3,'V3V3');on('R128',1,'V3V3');on('R128',2,'POWER_LED_A')
  on('D17',2,'POWER_LED_A');on('D17',1,'GND')
  expect(manifest.parts.find(p=>p.name==='R127').value).toBe('100k')
  expect(comp('R126').resistance).toBe(1000)
  expect(3.6/(comp('R126').resistance*0.99)).toBeLessThan(0.010)
  expect(manifest.parts.find(p=>p.name==='R132').value).toBe('10k')
})
test('EEPROM programming isolates both controller wires and never merges the power rails',()=>{
  const separate=['EEP_SDA','EEP_SCL','EEP_PROG_SDA','EEP_PROG_SCL','EEP_LINK_EN']
  expect(separate.map(netKey).every(Boolean)).toBe(true)
  expect(new Set(separate.map(netKey)).size).toBe(separate.length)
  for(const [pin,net]of[[1,'EEP_SDA'],[2,'EEP_PROG_SDA'],[3,'EEP_LINK_EN'],[4,'GND'],[5,'EEP_SCL'],[6,'EEP_PROG_SCL'],[7,'EEP_LINK_EN'],[8,'PD_3V3']])on('U36',pin,net)
  on('U3',5,'EEP_PROG_SDA');on('U3',6,'EEP_PROG_SCL')
  on('R129',1,'PD_3V3');on('R129',2,'EEP_PROG_SDA')
  on('R130',1,'PD_3V3');on('R130',2,'EEP_PROG_SCL')
  on('R131',1,'PD_3V3');on('R131',2,'EEP_LINK_EN')
  for(const [ref,net]of[['TP_PD_VREF','PD_3V3'],['TP_PD_GND','GND'],['TP_EEP_SDA','EEP_PROG_SDA'],['TP_EEP_SCL','EEP_PROG_SCL'],['TP_PD_ISO','EEP_LINK_EN'],['TP_PD_VBUS','PD_VBUS'],['TP_VMOTOR','VMOTOR'],['TP_PWR_GND','GND']]){
    on(ref,1,net)
    expect(pcbComponents.find(p=>p.source_component_id===comp(ref).source_component_id)?.layer).toBe('top')
    expect(manifest.parts.some(p=>p.name===ref)).toBe(false)
  }
})


test('U16 matches ST UFQFPN48 GP lands with a grounded exposed pad', () => {
  const source = comp('U16')
  expect(source.manufacturer_part_number).toBe('STM32G0B1CEU6')
  expect(source.supplier_part_numbers.jlcpcb).toEqual(['C2829190'])
  const pcb = pcbComponents.find(p => p.source_component_id === source.source_component_id)
  const pads = data.filter(p => p.type === 'pcb_smtpad' && p.pcb_component_id === pcb.pcb_component_id)
  expect(pads.length).toBe(49)
  for (let n = 1; n <= 48; n++) {
    const sp = port('U16', n)
    const pp = data.find(p => p.type === 'pcb_port' && p.source_port_id === sp.source_port_id)
    const pad = pads.find(p => p.pcb_port_id === pp.pcb_port_id)
    const i = (n - 1) % 12
    const side = Math.floor((n - 1) / 12)
    const [x, y] = [[-2.75 + i * 0.5, -3.375], [3.375, -2.75 + i * 0.5],
      [2.75 - i * 0.5, 3.375], [-3.375, 2.75 - i * 0.5]][side]
    expect(pad.x - pcb.center.x).toBeCloseTo(x, 6)
    expect(pad.y - pcb.center.y).toBeCloseTo(y, 6)
    expect(pad.shape).toBe('rect')
    expect(Math.max(pad.width, pad.height)).toBeCloseTo(0.55, 6)
    expect(Math.min(pad.width, pad.height)).toBeCloseTo(0.30, 6)
  }
  on('U16',49,'GND')
  const ep = pads.find(p => p.port_hints?.includes('pin49')) || pads.find(p => p.width === 5.6)
  expect(ep.width).toBe(5.6); expect(ep.height).toBe(5.6)
  expect(ep.x).toBe(pcb.center.x); expect(ep.y).toBe(pcb.center.y)
  const paste = data.filter(p => p.type === 'pcb_solder_paste' && p.pcb_smtpad_id === ep.pcb_smtpad_id)
  expect(paste.length).toBe(1); expect(paste[0].width).toBe(4.6); expect(paste[0].height).toBe(4.6)
  const target=JSON.parse(readFileSync('firmware/boards/pd1180.json'))
  expect(target.build.mcu).toBe('stm32g0b1ceu6')
  expect(target.build.extra_flags).toContain('ARDUINO_GENERIC_G0B1CEUX')
  expect(target.upload.maximum_size).toBe(524288)
  expect(target.upload.maximum_ram_size).toBe(147456)
  const model = data.find(p => p.type === 'cad_component' && p.pcb_component_id === pcb.pcb_component_id)
  expect(model.model_obj_url).toContain('uuid=16912e571dfb42a9a47b4df7b841ed45&pn=C2829190')
  expect(model.rotation).toEqual({ x: 0, y: 0, z: 90 })
  expect(data.filter(p => p.type === 'pcb_silkscreen_text' && p.pcb_component_id === pcb.pcb_component_id).map(p => p.text)).toEqual(['U16'])
})

test('U35 keeps its TSSOP CAD, all 16 pin positions and C95 clearance', () => {
  const source = comp('U35')
  expect(source.manufacturer_part_number).toBe('PCA9538PWR')
  expect(source.supplier_part_numbers.jlcpcb).toEqual(['C201530'])
  const pcb = pcbComponents.find(p => p.source_component_id === source.source_component_id)
  const pads = data.filter(p => p.type === 'pcb_smtpad' && p.pcb_component_id === pcb.pcb_component_id)
  expect(pads.length).toBe(16)
  for (let n = 1; n <= 16; n++) {
    const sp = port('U35', n)
    const pp = data.find(p => p.type === 'pcb_port' && p.source_port_id === sp.source_port_id)
    const pad = pads.find(p => p.pcb_port_id === pp.pcb_port_id)
    expect(pad.x - pcb.center.x).toBeCloseTo(-2.275 + (n <= 8 ? n - 1 : 16 - n) * 0.65, 6)
    expect(pad.y - pcb.center.y).toBeCloseTo(n <= 8 ? -2.865 : 2.865, 6)
    expect(pad.shape).toBe('rotated_pill')
    expect(pad.ccw_rotation).toBe(90)
    expect(pad.width).toBeCloseTo(1.73, 6)
    expect(pad.height).toBeCloseTo(0.34, 6)
  }
  const model = data.find(p => p.type === 'cad_component' && p.pcb_component_id === pcb.pcb_component_id)
  expect(model.model_obj_url).toContain('C201530.obj?uuid=534f03d8fe164fbab551f91e5a792e30')
  expect(model.rotation).toEqual({ x: 0, y: 0, z: 90 })
  expect(data.filter(p => p.type === 'pcb_silkscreen_text' && p.pcb_component_id === pcb.pcb_component_id).map(p => p.text)).toEqual(['U35'])
  const bypass = pcbComponents.find(p => p.source_component_id === comp('C95').source_component_id)
  expect(bypass.center.x).toBeCloseTo(31.85, 6)
  expect(bypass.center.y).toBeCloseTo(-22.8, 6)
  const courtyard = data.find(p => p.type === 'pcb_courtyard_rect' && p.pcb_component_id === pcb.pcb_component_id)
  const bypassCourtyard = data.find(p => p.type === 'pcb_courtyard_rect' && p.pcb_component_id === bypass.pcb_component_id)
  expect(bypassCourtyard.ccw_rotation).toBe(270)
  expect(courtyard.center.x - courtyard.width / 2 - (bypassCourtyard.center.x + bypassCourtyard.height / 2)).toBeCloseTo(0.02, 6)
})
