import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {convertCircuitJsonToSchematicSvg,convertCircuitJsonToPcbSvg} from 'circuit-to-svg'
import {Resvg} from '@resvg/resvg-js'

const circuit=JSON.parse(await readFile('dist/index/circuit.json'))
const normalizeSvg=(svg)=>`${svg.replace(/[ \\t]+$/gm,'').trimEnd()}\n`
await mkdir('dist/schematics',{recursive:true})
for(const sheet of circuit.filter(x=>x.type==='schematic_sheet')){
 const svg=normalizeSvg(convertCircuitJsonToSchematicSvg(circuit,{schematicSheetId:sheet.schematic_sheet_id,width:2400,height:1800,includeVersion:true}))
 await writeFile(`dist/schematics/${sheet.name}.svg`,svg)
 await writeFile(`dist/schematics/${sheet.name}.png`,new Resvg(svg).render().asPng())
}
const svg=normalizeSvg(convertCircuitJsonToPcbSvg(circuit,{width:1800,height:1800,layer:'top'}))
await writeFile('dist/index/pcb-top.svg',svg)
const bottom=normalizeSvg(convertCircuitJsonToPcbSvg(circuit,{width:1800,height:1800,layer:'bottom'}))
await writeFile('dist/index/pcb-bottom.svg',bottom)
await writeFile('dist/index/pcb-bottom.png',new Resvg(bottom).render().asPng())
await writeFile('dist/index/pcb.png',new Resvg(svg).render().asPng())
console.log(`Exported PCB PNG and ${circuit.filter(x=>x.type==='schematic_sheet').length} schematic sheets as SVG/PNG.`)
