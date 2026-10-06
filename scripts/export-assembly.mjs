import {readFile,writeFile,mkdir} from 'node:fs/promises'
const manifest=JSON.parse(await readFile('docs/design-manifest.json'))
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const stock=JSON.parse(await readFile('docs/stock-report.json'))
const source=data.filter(x=>x.type==='source_component')
const row=cells=>cells.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')
await mkdir('dist/assembly-review',{recursive:true})
const grouped=new Map()
for(const p of manifest.parts){const g=grouped.get(p.lcsc)||[];g.push(p);grouped.set(p.lcsc,g)}
const bom=[row(['Comment','Designator','Footprint','LCSC Part #','Quantity'])]
for(const [code,parts]of grouped){const s=stock.parts.find(p=>p.lcsc===code);bom.push(row([s?.mpn,parts.map(p=>p.name).join(','),s?.package,code,parts.length]))}
await writeFile('dist/assembly-review/assembly-bom.csv',bom.join('\n')+'\n')
const cpl=[row(['Designator','Mid X','Mid Y','Layer','Rotation'])]
for(const p of data.filter(x=>x.type==='pcb_component')){
 const c=source.find(s=>s.source_component_id===p.source_component_id)
 if(c){
  if(p.layer!=='top')throw new Error(`${c.name}: every populated component must be top-side`)
  cpl.push(row([c.name,p.center.x+'mm',p.center.y+'mm','Top',p.rotation??0]))
 }
}
await writeFile('dist/assembly-review/assembly-cpl.csv',cpl.join('\n')+'\n')
await writeFile('dist/assembly-review/READ-ME.txt','Engineering assembly package. Origin is the board center and every populated component is on the top side. Through-hole parts are included and may require separate assembly. Confirm rotations, polarity and connector insertion direction with the assembler; see docs/assembly.md.\n')
console.log(`Exported ${grouped.size} BOM lines and ${cpl.length-1} placements for review.`)
