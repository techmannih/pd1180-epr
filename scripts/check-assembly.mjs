import {readFile,writeFile} from 'node:fs/promises'
const manifest=JSON.parse(await readFile('docs/design-manifest.json'))
const json=JSON.parse(await readFile('dist/index/circuit.json'))
const stock=JSON.parse(await readFile('docs/stock-report.json'))
const components=json.filter(x=>x.type==='source_component')
const errors=[]
for(const part of manifest.parts){
 const source=components.find(x=>x.name===part.name)
 if(!source?.supplier_part_numbers?.jlcpcb?.includes(part.lcsc))errors.push(`${part.name}: supplier code differs from manifest`)
 const entry=stock.parts.find(x=>x.lcsc===part.lcsc)
 if(entry?.status!=='available')errors.push(`${part.name}: no exact stocked part evidence`)
 if(!json.some(x=>x.type==='pcb_component'&&x.source_component_id===source?.source_component_id))errors.push(`${part.name}: no PCB component`)
}
const positions=json.filter(x=>x.type==='pcb_component')
const encoder=positions.find(x=>x.source_component_id===components.find(x=>x.name==='U18')?.source_component_id)
if(encoder?.layer!=='top'||encoder.center.x!==0||encoder.center.y!==0)errors.push('Encoder must be on the top at the intended shaft origin')
for(const position of positions)if(position.layer!=='top')errors.push(`${components.find(x=>x.source_component_id===position.source_component_id)?.name??position.pcb_component_id}: bottom-side assembly is not allowed`)
const report={checked_at:new Date().toISOString(),parts:manifest.parts.length,unique_supplier_parts:new Set(manifest.parts.map(p=>p.lcsc)).size,errors}
await writeFile('docs/assembly-check.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(errors.length)process.exitCode=1
