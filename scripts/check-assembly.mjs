import {readFile,writeFile} from 'node:fs/promises'
const manifest=JSON.parse(await readFile('docs/design-manifest.json'))
const json=JSON.parse(await readFile('dist/index/circuit.json'))
const stock=JSON.parse(await readFile('docs/stock-report.json'))
const standards=JSON.parse(await readFile('board-standards.json'))
const components=json.filter(x=>x.type==='source_component')
const errors=[]
const fittedNames=new Set(manifest.parts.map(part=>part.name))
const serviceTestpoints=components.filter(component=>component.name.startsWith('TP_'))
for(const part of manifest.parts){
 if(typeof part.footprint!=='string'||!part.footprint.trim())errors.push(`${part.name}: missing expected JLC package in manifest`)
 const source=components.find(x=>x.name===part.name)
 if(!source?.supplier_part_numbers?.jlcpcb?.includes(part.lcsc))errors.push(`${part.name}: supplier code differs from manifest`)
 const entry=stock.parts.find(x=>x.lcsc===part.lcsc)
 if(entry?.status!=='available')errors.push(`${part.name}: no exact stocked part evidence`)
 if(entry?.package_match!==true)errors.push(`${part.name}: supplier package was not proven against ${part.footprint??'an expected package'}`)
 if(entry?.footprint?.trim().toLowerCase()!==part.footprint?.trim().toLowerCase())errors.push(`${part.name}: stock evidence package expectation is stale`)
 if(!json.some(x=>x.type==='pcb_component'&&x.source_component_id===source?.source_component_id))errors.push(`${part.name}: no PCB component`)
}
for(const component of components){
 if(!fittedNames.has(component.name)&&!component.name.startsWith('TP_'))errors.push(`${component.name}: neither a supplier-backed fitted part nor an approved service pad`)
}
for(const pad of serviceTestpoints){
 if(fittedNames.has(pad.name))errors.push(`${pad.name}: bare service pad must not appear in the fitted BOM/CPL`)
 if(pad.supplier_part_numbers?.jlcpcb?.length)errors.push(`${pad.name}: bare service pad unexpectedly carries a JLC assembly code`)
}
if(serviceTestpoints.length!==11)errors.push(`Expected 11 bare service pads, found ${serviceTestpoints.length}`)
const sourceIds=new Set(components.map(component=>component.source_component_id))
const positions=json.filter(x=>x.type==='pcb_component'&&sourceIds.has(x.source_component_id))
const encoder=positions.find(x=>x.source_component_id===components.find(x=>x.name==='U18')?.source_component_id)
if(encoder?.layer!=='top'||encoder.center.x!==0||encoder.center.y!==0)errors.push('Encoder must be on the top at the intended shaft origin')
for(const position of positions)if(!standards.assembly.populated_layers.includes(position.layer))errors.push(`${components.find(x=>x.source_component_id===position.source_component_id)?.name??position.pcb_component_id}: layer ${position.layer} is not permitted`)
const layers=Object.fromEntries(standards.assembly.populated_layers.map(layer=>[layer,positions.filter(position=>position.layer===layer).length]))
const report={checked_at:new Date().toISOString(),parts:manifest.parts.length,service_testpoints:serviceTestpoints.length,unique_supplier_parts:new Set(manifest.parts.map(p=>p.lcsc)).size,layers,errors}
await writeFile('docs/assembly-check.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(errors.length)process.exitCode=1
