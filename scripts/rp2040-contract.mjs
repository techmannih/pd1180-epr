// Electrical invariants for the RP2040 / DRV8462DDV revision. These are checked
// against compiled connectivity, not source text or the historical routed file.
export function checkRp2040Contract(circuit) {
  const errors=[]
  const components=new Map(circuit.filter(r=>r.type==='source_component').map(r=>[r.name,r]))
  const ports=circuit.filter(r=>r.type==='source_port'), nets=circuit.filter(r=>r.type==='source_net')
  const net=(ref,pin)=>{
    const p=ports.find(p=>p.source_component_id===components.get(ref)?.source_component_id&&p.pin_number===pin)
    return p?.subcircuit_connectivity_map_key ? nets.find(n=>n.subcircuit_connectivity_map_key===p.subcircuit_connectivity_map_key)?.name : undefined
  }
  const requireNet=(ref,pin,name)=>{if(net(ref,pin)!==name) errors.push(`${ref}.${pin}: expected ${name}, got ${net(ref,pin)}`)}
  const driver={1:'GND',2:'VMOTOR',3:'GND',4:'MOTOR_B1',5:'MOTOR_B1',6:'MOTOR_B1',7:'MOTOR_B2',8:'MOTOR_B2',9:'MOTOR_B2',10:'GND',11:'VMOTOR',12:'VMOTOR',13:'GND',14:'MOTOR_A2',15:'MOTOR_A2',16:'MOTOR_A2',17:'MOTOR_A1',18:'MOTOR_A1',19:'MOTOR_A1',20:'GND',21:'VMOTOR',22:'DRV_VCP',23:'DRV_CPH',24:'DRV_CPL',25:'DRV_SLEEP_N',26:'RUN_SAFE',27:'DRV_DIR',28:'DRV_STEP',29:'SPI_SCK',30:'SPI_MOSI',31:'SPI_MISO',33:'DRV_CS_N',34:'DRV_DVDD',39:'V3V3',40:'DRV_HOME_N',41:'DRV_FAULT_N',42:'V3V3',43:'DRV_DVDD',44:'GND'}
  for(const [pin,name] of Object.entries(driver)) requireNet('U7',Number(pin),name)
  for(const pin of [32,35,36,37,38]) if(net('U7',pin)) errors.push(`DDV reserved pin ${pin} connected`)
  for(const ref of ['Q6','Q7','Q8','Q9','Q10','Q11','Q12','Q13','Q14','R109','R110']) if(components.has(ref)) errors.push(`Obsolete bridge part ${ref} remains`)
  for(const [ref,mpn] of [['U7','DRV8462DDVR'],['U16','RP2040'],['U18','AS5600-ASOM'],['U2','TPS26750SRSMR']]) {
    if(components.get(ref)?.manufacturer_part_number!==mpn) errors.push(`${ref}: wrong exact device/package`)
  }
  const connections=[
    ['U10',1,'MCU_RUN'],['U10',2,'MOTOR_PG'],['U10',4,'RUN_PG'],['U11',1,'RUN_PG'],['U11',2,'VMOTOR_OK'],['U11',4,'RUN_WINDOW_OK'],
    ['U33',1,'RUN_WINDOW_OK'],['U33',2,'TEMP_OK'],['U33',4,'RUN_SAFE'],['R55',1,'RUN_SAFE'],['R55',2,'GND'],
    // The removed TMC supplied this shared brake rail; its regulator must remain.
    ['U34',2,'VMOTOR'],['U34',8,'DRIVER_BUCK_SW'],['L3',1,'DRIVER_BUCK_SW'],['L3',2,'BRAKE_12V'],['U15',1,'BRAKE_12V'],
    ['U15',6,'BRAKE_ON'],['J3',1,'VMOTOR'],['J3',2,'BRAKE_RETURN'],
    ['U17',1,'FLASH_CS_N'],['U17',2,'QSPI_SD1'],['U17',3,'QSPI_SD2'],['U17',4,'GND'],['U17',5,'QSPI_SD0'],['U17',6,'QSPI_SCK'],['U17',7,'QSPI_SD3'],['U17',8,'V3V3_MCU'],
    ['R73',1,'V3V3_MCU'],['C51',1,'V3V3_MCU'],['U16',19,'GND'],['U16',23,'V1V1_MCU'],['U16',45,'V1V1_MCU'],['U16',50,'V1V1_MCU'],['U16',57,'GND'],
    ['U18',1,'V3V3'],['U18',2,'V3V3'],['U18',4,'GND'],['U18',6,'ENC_SDA'],['U18',7,'ENC_SCL'],['U18',8,'GND'],
    ['C29',1,'DRV_VCP'],['C29',2,'VMOTOR'],['C30',1,'DRV_CPH'],['C30',2,'DRV_CPL'],
    ['SW2',1,'USER_BUTTON_N'],['SW2',2,'GND'],['R133',1,'V3V3_MCU'],['R133',2,'USER_BUTTON_N'],
    ['J2',1,'MOTOR_A1_OUT'],['J2',2,'MOTOR_A2'],['J2',3,'MOTOR_B1_OUT'],['J2',4,'MOTOR_B2'],
    ['R115',1,'MOTOR_A1'],['R115',2,'MOTOR_A1_OUT'],['R116',1,'MOTOR_B1'],['R116',2,'MOTOR_B1_OUT'],
  ]
  for(const [ref,pin,name] of connections) requireNet(ref,pin,name)
  for(const ref of ['C25','C26','C30']) {
    if(!components.get(ref)?.supplier_part_numbers?.jlcpcb?.includes('C28233')) errors.push(`${ref} requires the verified 100 V capacitor`)
  }
  const placed=circuit.filter(r=>r.type==='pcb_component')
  for(const p of placed) {
    const c=circuit.find(r=>r.type==='source_component'&&r.source_component_id===p.source_component_id)
    if(p.layer==='bottom' && (c?.name!=='U18'||!p.do_not_place)) errors.push(`Unapproved bottom placement: ${c?.name}`)
  }
  const encoder=placed.find(p=>p.source_component_id===components.get('U18')?.source_component_id)
  if(!encoder?.do_not_place||encoder?.layer!=='bottom'||encoder.center.x!==0||encoder.center.y!==0) errors.push('Encoder must remain centered, bottom and DNP')
  // pcbPathRelativeTo also selects the actual starting port in the pinned core.
  // An unrelated coordinate anchor can silently route a different pin/layer.
  const pcbPorts=new Map(circuit.filter(r=>r.type==='pcb_port').map(r=>[r.pcb_port_id,r]))
  for(const trace of circuit.filter(r=>r.type==='source_trace'&&r.name?.startsWith('BYPASS_'))) {
    const route=circuit.find(r=>r.type==='pcb_trace'&&r.source_trace_id===trace.source_trace_id)?.route
    if(!route?.length) {errors.push(`${trace.name}: missing local path`);continue}
    const first=route[0],last=route.at(-1)
    const actual=[pcbPorts.get(first.start_pcb_port_id)?.source_port_id,pcbPorts.get(last.end_pcb_port_id)?.source_port_id].sort()
    if(JSON.stringify(actual)!==JSON.stringify([...trace.connected_source_port_ids].sort())) errors.push(`${trace.name}: physical endpoints differ from declared pins`)
    for(const [point,id] of [[first,first.start_pcb_port_id],[last,last.end_pcb_port_id]]) {
      const pad=pcbPorts.get(id)
      if(!pad||!pad.layers.includes(point.layer)||Math.hypot(point.x-pad.x,point.y-pad.y)>1e-5) errors.push(`${trace.name}: physical endpoint position/layer mismatch`)
    }
  }
  return errors
}
