import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import modeling from '@jscad/modeling'
import { encodeGlb } from './assembly-glb.mjs'
import { bezier, tube } from './harness-geometry.mjs'

const layout = JSON.parse(await readFile('engineering/mechanical/harness-layout.json'))
const assembly = JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const contract = JSON.parse(await readFile('hardware-contract.json'))
const motorHarness = JSON.parse(await readFile('engineering/motor-harness.json'))
const circuit = JSON.parse(await readFile('dist/index/circuit.json'))
const top = contract.fabrication.finished_thickness_mm / 2
const rear = -top - assembly.mount.pcb_bottom_to_motor_rear_mm
const { primitives: { cuboid }, booleans: { subtract }, geometries: { geom3 } } = modeling
const meshes = [], bodies = [], wires = [], connectors = []
const colors = {black:[.04,.04,.045,1],green:[.06,.42,.12,1],red:[.7,.06,.05,1],blue:[.05,.28,.62,1]}
function part(name) {
  const source = circuit.find(r => r.type === 'source_component' && r.name === name)
  const pcb = circuit.find(r => r.type === 'pcb_component' && r.source_component_id === source?.source_component_id)
  if (!pcb || pcb.layer !== 'top') throw new Error(`Missing top-side connector: ${name}`)
  const ports = circuit.filter(r => r.type === 'pcb_port' && r.pcb_component_id === pcb.pcb_component_id).map(p => ({...p,pin:Number(circuit.find(s => s.type === 'source_port' && s.source_port_id === p.source_port_id)?.pin_number)})).sort((a,b) => a.pin-b.pin)
  return {pcb,ports}
}
function solid(name, shape, color) {
  const positions = [], indices = []
  for (const polygon of geom3.toPolygons(shape)) {
    const first = positions.length/3
    for (const p of polygon.vertices) positions.push(...p)
    for (let i=1;i<polygon.vertices.length-1;i++) indices.push(first,first+i,first+i+1)
  }
  meshes.push({name,positions,indices,color})
}
function body(name, center, size, color, openings = []) {
  const shape = cuboid({center,size})
  solid(name, openings.length ? subtract(shape,...openings) : shape, color)
  const bounds = {min:center.map((p,k) => p-size[k]/2),max:center.map((p,k) => p+size[k]/2)}
  bodies.push({name,bounds})
  return bounds
}
function wire(name, reference, points, radius, color, connection = name) {
  meshes.push(tube(name,points,radius,color))
  wires.push({name,reference,connection,points,radius_mm:radius})
}
for (const mate of layout.mates) {
  const {pcb,ports} = part(mate.reference)
  if (pcb.rotation !== 0) throw new Error(`Update harness transform for rotated ${mate.reference}`)
  const expectedCount = {J2:4,J3:2,J7:20}[mate.reference]
  if (ports.length !== expectedCount || ports.some((p,i) => p.pin !== i+1)) throw new Error(`Unexpected cavity numbering: ${mate.reference}`)
  const height = top+mate.mated_height_mm, bottom = height-mate.height_mm
  const openings = ports.map(p => cuboid({center:[p.x,p.y,(bottom+height)/2],size:[mate.reference === 'J7' ? 1.6 : 3.1,mate.reference === 'J7' ? 1.6 : 3.1,mate.height_mm+2]}))
  const bounds = body(`${mate.reference} ${mate.part} nominal housing`,[pcb.center.x,pcb.center.y,(bottom+height)/2],[mate.width_mm,mate.depth_mm,mate.height_mm],[.88,.87,.78,1],openings)
  connectors.push({reference:mate.reference,part:mate.part,bounds,ports:ports.map(p => ({pin:p.pin,x:p.x,y:p.y,wire_exit_z:height})),mated_height_mm:mate.mated_height_mm})
  for (const p of ports) {
    const start = [p.x,p.y,height-.5]
    if (mate.reference === 'J2') {
      const m = layout.motor_cable, i = p.pin-1, x = m.splice_x_mm[i], z = m.splice_z_mm
      const end = [x,m.splice_y_mm-m.splice_length_envelope_mm/2,z]
      const middle = [x,m.loop_y_mm,-35]
      const points = [...bezier([start,[p.x,p.y,60],[x,m.loop_y_mm,35],middle],40),...bezier([middle,[x,m.loop_y_mm,z],[x,end[1]-12,z],end],16).slice(1)]
      const colorName = motorHarness.motor_connector.wire_colours[i]
      const connection = `J2 pin ${p.pin}`
      wire(`J2 cavity ${p.pin} ${colorName} ${motorHarness.motor_connector.pin_to_net[p.pin]}`,mate.reference,points,mate.wire_od_mm/2,colors[colorName],connection)
      const spliceEnd = [x,m.splice_y_mm+m.splice_length_envelope_mm/2,z]
      wire(`Insulated splice ${p.pin} envelope`,mate.reference,[end,spliceEnd],m.splice_diameter_envelope_mm/2,[.72,.18,.12,1],connection)
      const tip = [m.cad_tip_x_mm[i],m.cad_tip_plane_y_mm,m.cad_tip_z_from_rear_mm[i]+rear]
      wire(`Motor factory lead ${p.pin} colour assignment illustrative`,mate.reference,bezier([spliceEnd,[x,spliceEnd[1]+9,z],[tip[0],tip[1]-9,tip[2]],tip],12),.85,colors[colorName],connection)
    } else {
      const sign = mate.wire_exit_direction_y
      const rowLift = mate.reference === 'J7' && p.pin%2 === 0 ? 4 : 0
      const end = [p.x,p.y+sign*37,top+mate.wire_free_height_mm+rowLift]
      const points = bezier([start,[p.x,p.y,height+22+rowLift],[p.x,end[1]-sign*12,end[2]],end],18)
      const color = mate.reference === 'J3' ? (p.pin === 1 ? colors.red : colors.black) : [.2,.3,.37,1]
      wire(`${mate.reference} cavity ${p.pin} external lead`,mate.reference,points,mate.wire_od_mm/2,color)
    }
  }
}
// USB tails are access gauges. The selected EPR/data cables still need their
// own manufacturer model, current rating and physical qualification.
const usb = layout.usb_envelopes
for (const reference of usb.references) {
  const {pcb} = part(reference)
  if (pcb.insertion_direction !== 'from_left') throw new Error(`Unexpected USB entry direction: ${reference}`)
  const x = usb.body_start_x_mm, y = pcb.cable_insertion_center.y, z = usb.plug_center_z_mm
  const bounds = body(`${reference} generic USB plug envelope`,[x-usb.body_length_mm/2,y,z],[usb.body_length_mm,usb.body_width_mm,usb.body_height_mm],reference === 'J1' ? [.18,.18,.2,1] : [.34,.36,.38,1])
  body(`${reference} USB shell envelope`,[(x+pcb.cable_insertion_center.x)/2,y,z],[pcb.cable_insertion_center.x-x,8.3,2.5],[.66,.68,.7,1])
  wire(`${reference} USB cable access tail`,reference,[[x-usb.body_length_mm,y,z],[x-usb.body_length_mm-22,y,z]],usb.cable_od_mm/2,[.06,.065,.07,1])
  connectors.push({reference,part:'Generic USB access gauge',bounds})
}
const glb = encodeGlb(meshes)
const hash = createHash('sha256').update(glb).digest('hex')
const outputs = {
  'engineering/mechanical/harness-proposal.glb':glb,
  'engineering/mechanical/harness-geometry.json':Buffer.from(JSON.stringify({layout_sha256:createHash('sha256').update(await readFile('engineering/mechanical/harness-layout.json')).digest('hex'),glb_sha256:hash,connectors,bodies,wires})+'\n'),
}
for (const [path,bytes] of Object.entries(outputs)) {
  if (process.argv.includes('--check')) {
    if (!(await readFile(path)).equals(bytes)) throw new Error(`Stale harness assembly: ${path}`)
  } else await writeFile(path,bytes)
}
console.log(JSON.stringify({bytes:glb.length,sha256:hash,connectors:connectors.length,wires:wires.length,scope:layout.status}))
