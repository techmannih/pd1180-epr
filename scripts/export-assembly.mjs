import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {assemblyPolicyErrors} from './assembly-policy.mjs'
const manifest=JSON.parse(await readFile('docs/design-manifest.json'))
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const stock=JSON.parse(await readFile('docs/stock-report.json'))
const source=data.filter(x=>x.type==='source_component')
const row=cells=>cells.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')
const grouped=new Map()
for(const p of manifest.parts){const g=grouped.get(p.lcsc)||[];g.push(p);grouped.set(p.lcsc,g)}
const fittedNames=new Set(manifest.parts.map(p=>p.name))
const standards=JSON.parse(await readFile('board-standards.json'))
const policyErrors=assemblyPolicyErrors(data,standards,fittedNames)
if(policyErrors.length)throw new Error(policyErrors.join('\n'))
const bom=[row(['Comment','Designator','Footprint','LCSC Part #','Quantity'])]
for(const [code,parts]of grouped){const s=stock.parts.find(p=>p.lcsc===code);bom.push(row([s?.mpn,parts.map(p=>p.name).join(','),s?.package,code,parts.length]))}
const cpl=[row(['Designator','Mid X','Mid Y','Layer','Rotation'])]
for(const p of data.filter(x=>x.type==='pcb_component')){
 const c=source.find(s=>s.source_component_id===p.source_component_id)
 if(c&&fittedNames.has(c.name)){
  if(!['top','bottom'].includes(p.layer))throw new Error(`${c.name}: unsupported assembly layer ${p.layer}`)
  cpl.push(row([c.name,p.center.x+'mm',p.center.y+'mm',p.layer==='top'?'Top':'Bottom',p.rotation??0]))
 }
}
const csvFiles={'assembly-bom.csv':bom.join('\n')+'\n','assembly-cpl.csv':cpl.join('\n')+'\n'}
if(process.argv[2]==='--check'){
 const directory=process.argv[3]
 if(!directory)throw new Error('Usage: export-assembly.mjs --check <directory>')
 for(const [name,expected]of Object.entries(csvFiles)){
  const file=directory==='release'?(name==='assembly-bom.csv'?'jlc-bom.csv':'jlc-cpl.csv'):name
  if(await readFile(`${directory}/${file}`,'utf8')!==expected)throw new Error(`${directory}/${file}: stale assembly data; regenerate from current source`)
 }
 console.log(`Assembly BOM and ${cpl.length-1} placements match current source: ${directory}`)
}else{
await mkdir('dist/assembly-review',{recursive:true})
for(const [name,content]of Object.entries(csvFiles))await writeFile(`dist/assembly-review/${name}`,content)
await writeFile('dist/assembly-review/READ-ME.txt','Engineering top-side assembly package. Origin is the board center. Through-hole parts are included and may require separate assembly. Confirm top-side rotations, polarity, encoder orientation and connector insertion direction with the assembler; see docs/assembly.md.\n')
console.log(`Exported ${grouped.size} BOM lines and ${cpl.length-1} placements for review.`)
}
