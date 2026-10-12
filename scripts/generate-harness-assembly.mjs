import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import modeling from '@jscad/modeling'
import {encodeGlb} from './assembly-glb.mjs'
import {bezier,tube,distance} from './harness-geometry.mjs'
const layout=JSON.parse(await readFile('engineering/mechanical/harness-layout.json'))
const assembly=JSON.parse(await readFile('engineering/mechanical/assembly.json'))
const contract=JSON.parse(await readFile('hardware-contract.json'))
const motorHarness=JSON.parse(await readFile('engineering/motor-harness.json'))
const circuit=JSON.parse(await readFile('dist/index/circuit.json'))
const top=contract.fabrication.finished_thickness_mm/2,rear=-top-assembly.mount.pcb_bottom_to_motor_rear_mm
const {primitives:{cuboid},booleans:{subtract},geometries:{geom3}}=modeling
const meshes=[],bodies=[],wires=[],connectors=[]
const colors={black:[.04,.04,.045,1],green:[.06,.42,.12,1],red:[.7,.06,.05,1],blue:[.05,.28,.62,1]}
const mate=layout.mates.find(m=>m.reference==='J2')
const s=circuit.find(r=>r.type==='source_component'&&r.name==='J2')
const pcb=circuit.find(r=>r.type==='pcb_component'&&r.source_component_id===s.source_component_id)
const ports=circuit.filter(r=>r.type==='pcb_port'&&r.pcb_component_id===pcb.pcb_component_id).map(p=>({...p,pin:Number(circuit.find(s=>s.type==='source_port'&&s.source_port_id===p.source_port_id)?.pin_number)})).sort((a,b)=>a.pin-b.pin)
if(pcb.rotation!==0||ports.length!==4||ports.some((p,i)=>p.pin!==i+1))throw new Error('J2 mating orientation/pin count changed')
const height=top+mate.mated_height_mm,bottom=height-mate.height_mm
const shape=subtract(cuboid({center:[pcb.center.x,pcb.center.y,(bottom+height)/2],size:[mate.width_mm,mate.depth_mm,mate.height_mm]}),...ports.map(p=>cuboid({center:[p.x,p.y,(bottom+height)/2],size:[3.1,3.1,mate.height_mm+2]})))
const positions=[],indices=[]
for(const poly of geom3.toPolygons(shape)){const f=positions.length/3;for(const v of poly.vertices)positions.push(...v);for(let i=1;i<poly.vertices.length-1;i++)indices.push(f,f+i,f+i+1)}
meshes.push({name:'J2_VHR_4N_mating_housing',positions,indices,color:[.88,.87,.78,1]})
const bounds={min:[pcb.center.x-mate.width_mm/2,pcb.center.y-mate.depth_mm/2,bottom],max:[pcb.center.x+mate.width_mm/2,pcb.center.y+mate.depth_mm/2,height]}
bodies.push({name:'J2 VHR-4N catalogue housing envelope',bounds})
connectors.push({reference:'J2',part:'VHR-4N',bounds,ports:ports.map(p=>({pin:p.pin,x:p.x,y:p.y,wire_exit_z:height})),mated_height_mm:mate.mated_height_mm})
function wire(name,points,radius,color,connection,meta={}){
 meshes.push(tube(name,points,radius,color));wires.push({name,reference:'J2',connection,points,radius_mm:radius,...meta})
}
const mc=layout.motor_cable
const jacketStart=[0,mc.cad_clip_plane_y_mm,mc.jacket_section_center_z_from_rear_mm+rear]
const jacketEnd=[0,mc.jacket_end_y_mm,mc.jacket_end_z_mm]
const jacket=[...bezier([jacketStart,[0,-108,jacketStart[2]],[0,mc.jacket_end_y_mm,-75],[0,mc.jacket_end_y_mm,-62]],64),jacketEnd]
wire('motor_factory_cable_jacket_rerouted',jacket,mc.jacket_diameter_mm/2,[.18,.18,.19,1],'factory cable jacket',{kind:'jacket',intentional_contacts:['motor cable cut plane'],diameter_basis:'7.5 mm vendor STEP cable section, confirm physical cable'})
for(const p of ports){
 const i=p.pin-1,color=motorHarness.motor_connector.wire_colours[i],x=mc.splice_x_mm[i],y=mc.splice_y_mm,z=mc.splice_top_z_mm
 const start=[p.x,p.y,height-.5],r=(p.y-y)/2
 // Straight exit, semicircular service loop, straight splice entry. Minimum
 // curvature is checked numerically, including the gradual change in X.
 const points=[start,[p.x,p.y,mc.bend_top_z_mm]]
 for(let k=1;k<=64;k++){const a=Math.PI*k/64,t=(1-Math.cos(a))/2;points.push([p.x+(x-p.x)*t,p.y-r+r*Math.cos(a),mc.bend_top_z_mm+r*Math.sin(a)])}
 points.push([x,y,z])
 const connection=`J2 pin ${p.pin}`
 const length=points.slice(1).reduce((n,v,k)=>n+distance(v,points[k]),0)
 wire(`J2 cavity ${p.pin} ${color} Alpha3057_16AWG`,points,mate.wire_od_mm/2,colors[color],connection,{kind:'pigtail',net:motorHarness.motor_connector.pin_to_net[p.pin],source:`J2:${p.pin} / SVH-41T-P1.1`,destination:`TE320559_${p.pin}:pigtail`,nominal_path_length_mm:length,cut_length_mm:Math.ceil((length+12)/5)*5,termination_and_adjustment_allowance_mm:12,minimum_bend_radius_mm:mc.pigtail_minimum_bend_radius_mm,cut_length_status:'CAD nominal, first-article termination/fit approval required'})
 const end=[x,y,z-mc.splice_length_envelope_mm]
 wire(`TE320559_splice_${p.pin}_OD_UNVERIFIED`,[[x,y,z],end],mc.splice_diameter_envelope_mm/2,[.72,.18,.12,1],connection,{kind:'splice',length_verified_mm:32.13,outside_diameter_verified:false})
 const tip=[i<2?-1.25:1.25,jacketEnd[1]+(i%2?1.25:-1.25),jacketEnd[2]-.5]
 wire(`motor_${color}_lead_to_splice_${p.pin}`,bezier([tip,[tip[0],tip[1],-36],[x,y,-34],end],24),.85,colors[color],connection,{kind:'factory conductor',source:`34HS31-6004S1 ${color} lead`,destination:`TE320559_${p.pin}:motor`,cross_section_mm2:.75,note:'Factory winding colours define circuit; STEP does not establish physical conductor order. Strip jacket only to fanout length.'})
}
const glb=encodeGlb(meshes),sha=b=>createHash('sha256').update(b).digest('hex')
const outputs={
 'engineering/mechanical/harness-proposal.glb':glb,
 'engineering/mechanical/harness-geometry.json':JSON.stringify({layout_sha256:sha(await readFile('engineering/mechanical/harness-layout.json')),glb_sha256:sha(glb),connectors,bodies,wires})+'\n',
 'engineering/mechanical/harness-parts.json':JSON.stringify(meshes.map(m=>({name:m.name.replace(/[^a-zA-Z0-9_]/g,'_'),description:m.name,bom:m.name.startsWith('TE320559')?'320559':m.name.includes('Alpha3057')?'Alpha Wire 3057':m.name,base64:encodeGlb([m]).toString('base64')})))+'\n'
}
for(const [path,bytes]of Object.entries(outputs)){
 if(process.argv.includes('--check')){if(!(await readFile(path)).equals(Buffer.from(bytes)))throw new Error(`Stale harness: ${path}`)}else await writeFile(path,bytes)
}
console.log(JSON.stringify({bytes:glb.length,connectors:connectors.length,wires:wires.length,pigtail_cut_lengths_mm:wires.filter(w=>w.kind==='pigtail').map(w=>w.cut_length_mm),scope:layout.status}))
