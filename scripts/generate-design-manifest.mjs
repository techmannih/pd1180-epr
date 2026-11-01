import ts from 'typescript'
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'

// Regenerate identities and placements from the actual source/compiled board.
// Package expectations are independent of the live stock API response.
const text=readFileSync('index.circuit.tsx','utf8')
const circuit=JSON.parse(readFileSync('dist/index/circuit.json'))
const packages=JSON.parse(readFileSync('sourcing/package-contract.json'))
const syntax=ts.createSourceFile('index.circuit.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
const elements=new Map()
function literal(node){
 if(!node)return true
 if(ts.isStringLiteral(node)||ts.isNumericLiteral(node))return ts.isNumericLiteral(node)?Number(node.text):node.text
 if(ts.isJsxExpression(node))return literal(node.expression)
 if(ts.isPrefixUnaryExpression(node)&&node.operator===ts.SyntaxKind.MinusToken)return -literal(node.operand)
 if(node.kind===ts.SyntaxKind.TrueKeyword)return true
 if(node.kind===ts.SyntaxKind.FalseKeyword)return false
 if(ts.isArrayLiteralExpression(node))return node.elements.map(literal)
 if(ts.isObjectLiteralExpression(node))return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.text,literal(p.initializer)]))
 return undefined
}
function visit(node){
 if(ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node)){
  const attributes=Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(a=>[a.name.text,literal(a.initializer)]))
  if(attributes.name)elements.set(attributes.name,{tag:node.tagName.getText(node.getSourceFile()),...attributes})
 }
 ts.forEachChild(node,visit)
}
visit(syntax)
visit(ts.createSourceFile('board-diagnostics.tsx',readFileSync('board-diagnostics.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX))
const parts=[], optional_parts=[]
for(const source of circuit.filter(r=>r.type==='source_component')){
 if(source.name.startsWith('TP_'))continue
 const attributes=elements.get(source.name)
 if(!attributes)throw Error(`Missing source declaration: ${source.name}`)
 const position=circuit.find(r=>r.type==='pcb_component'&&r.source_component_id===source.source_component_id)
 const lcsc=source.supplier_part_numbers?.jlcpcb?.[0]
 if(!position||!lcsc||!packages[lcsc])throw Error(`Missing placement/supplier/package contract: ${source.name}`)
 const part={tag:attributes.tag,name:source.name,connections:Object.fromEntries(Object.entries(attributes.connections??{}).map(([p,n])=>[p,n.replace(/^net\./,'')])),
  sheet:attributes.schSheetName,section:attributes.schSectionName??null,owner:attributes.decouplingFor?.split(' > ')[0]?.slice(1)??null,
  xy:[position.center.x,position.center.y],sch:[attributes.schX,attributes.schY],rotation:position.rotation,schRotation:attributes.schRotation??0,
  layer:position.layer,noConnect:attributes.noConnect??[],lcsc,footprint:packages[lcsc],mpn:source.manufacturer_part_number??null,
  value:attributes.resistance??attributes.capacitance??attributes.inductance??null,size:[position.width,position.height],
  ...(attributes.maxVoltageRating?{voltage:attributes.maxVoltageRating}:{}),...(position.do_not_place?{do_not_place:true}:{})}
 ;(position.do_not_place?optional_parts:parts).push(part)
}
const board=circuit.find(r=>r.type==='pcb_board')
const result={board:{width_mm:board.width,height_mm:board.height,layers:board.num_layers,status:'rp2040-redesign-not-orderable',revision:'0.5.0-RP2040-DRAFT'},
 source_sha256:createHash('sha256').update(text).digest('hex'),parts,optional_parts}
writeFileSync('docs/design-manifest.json',JSON.stringify(result)+'\n')
console.log(`Generated ${parts.length} fitted and ${optional_parts.length} optional parts from source and compiled geometry.`)
