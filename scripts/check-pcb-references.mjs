import {readFile,writeFile,access} from 'node:fs/promises'
import {parseKicadPcb} from 'kicadts'
import {glyphAdvanceRatio, textMetrics} from '@tscircuit/alphabet'

const source=JSON.parse(await readFile('dist/index/circuit.json','utf8'))
const board=parseKicadPcb(await readFile(process.argv[2] || 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb','utf8'))
const pattern=/^(?:U|R|C|D|Q|L|Y|J|SW|BZ)\d+$/
const names=new Map(source.filter(r=>r.type==='source_component').map(r=>[r.source_component_id,r.name]))
const components=new Map(source.filter(r=>r.type==='pcb_component').map(r=>[r.pcb_component_id,r]))
const labels=source.filter(r=>['pcb_silkscreen_text','pcb_fabrication_note_text'].includes(r.type))
const errors=[];const evidence=[];const withoutText=[]
const outline=source.find(r=>r.type==='pcb_board')?.outline
if(!outline?.length)throw new Error('Board outline required for reference containment')
const insideBoard=({x,y})=>{
  let inside=false
  for(let i=0,j=outline.length-1;i<outline.length;j=i++) {
    const a=outline[i],b=outline[j]
    if((a.y>y)!==(b.y>y) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside
  }
  return inside
}
// Screen the full rotated text envelope, not only its anchor. Native DRC can
// miss text wholly outside Edge.Cuts; native DRC still checks stroke clearance.
function referenceInsideBoard(label) {
  if(label.anchor_alignment!=='center')throw new Error(`Unsupported reference anchor: ${label.text}`)
  const w=Array.from(label.text).reduce((sum,c)=>sum+(glyphAdvanceRatio[c]??textMetrics.spaceWidthRatio),0)*label.font_size/2+0.025
  const h=label.font_size/2+0.025
  const a=(label.ccw_rotation||0)*Math.PI/180
  const corner=(x,y)=>({x:label.anchor_position.x+x*Math.cos(a)-y*Math.sin(a),y:label.anchor_position.y+x*Math.sin(a)+y*Math.cos(a)})
  const points=[corner(-w,-h),corner(w,-h),corner(w,h),corner(-w,h)]
  for(let i=0;i<4;i++) {
    const p=points[i],q=points[(i+1)%4],steps=Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/0.05)
    for(let s=0;s<=steps;s++)if(!insideBoard({x:p.x+(q.x-p.x)*s/steps,y:p.y+(q.y-p.y)*s/steps}))return false
  }
  return true
}
for(const path of ['pcb-reference-labels.tsx','pcb-reference-layout.json']) {
  try {await access(path);errors.push(`Custom label override must not exist: ${path}`)} catch(error) {if(error.code!=='ENOENT')throw error}
}
for(const path of ['index.circuit.tsx','board-diagnostics.tsx','board-markings.tsx']) {
  const text=await readFile(path,'utf8')
  if(/withPcbReferences|silkscreenText(?:Visibility|Position)|silkscreenFontSize/.test(text))errors.push(`${path}: custom reference override`)
}
for(const c of components.values()) {
  const name=names.get(c.source_component_id)
  if(!pattern.test(name))continue
  const own=labels.filter(r=>r.pcb_component_id===c.pcb_component_id)
  const f=board.footprints.find(f=>f.properties.some(p=>p.key==='Reference'&&p.value===name))
  if(!f) {errors.push(`${name}: native footprint absent`);continue}
  const field=f.properties.find(p=>p.key==='Reference')
  if(f.fpTexts.some(t=>t.text.includes('${REFERENCE}')))errors.push(`${name}: custom replacement caption remains`)
  if(own.length===0) {
    withoutText.push(name)
    errors.push(`${name}: footprint reference text is missing`)
    continue
  }
  if(own.length!==1 || own[0].text!==name || own[0].type!=='pcb_silkscreen_text') {
    errors.push(`${name}: reference must use unmodified footprint silkscreen text`);continue
  }
  const label=own[0]
  if(!referenceInsideBoard(label))errors.push(`${name}: reference text extends outside board outline`)
  if(field.hidden)errors.push(`${name}: default reference hidden in native PCB`)
  if(!String(field.layer).includes(label.layer==='top'?'F.SilkS':'B.SilkS'))errors.push(`${name}: native/source layer differs`)
  const p=field.position;const angle=(f.position.angle||0)*Math.PI/180
  const x=f.position.x+p.x*Math.cos(angle)+p.y*Math.sin(angle)-100
  const y=100-(f.position.y-p.x*Math.sin(angle)+p.y*Math.cos(angle))
  if(Math.hypot(x-label.anchor_position.x,y-label.anchor_position.y)>0.01)errors.push(`${name}: native/source reference positions differ`)
  const rotation=((p.angle||0)%360+360)%360
  const sourceRotation=((label.ccw_rotation||0)%360+360)%360
  if(Math.abs(rotation-sourceRotation)>0.01)errors.push(`${name}: native/source text rotation differs`)
  if(Math.abs(field.effects.font.size.height-label.font_size)>0.001 || Math.abs(field.effects.font.size.width-label.font_size)>0.001)errors.push(`${name}: native/source font size differs`)
  evidence.push({name,text:label.text,layer:label.layer,x:label.anchor_position.x,y:label.anchor_position.y,rotation:sourceRotation,font_size:label.font_size})
}
for(const label of labels) {
  if(pattern.test(label.text) && !components.get(label.pcb_component_id)?.source_component_id)errors.push(`Detached reference: ${label.text}`)
  if(pattern.test(label.text) && ![...names.values()].includes(label.text))errors.push(`Stale reference: ${label.text}`)
}
for(const text of board.graphicalTexts||board._grTexts||[])if(pattern.test(text.text))errors.push(`Detached native reference: ${text.text}`)
// Validate the actual default PCB/3D viewer, not only the source preview.
const viewer=JSON.parse(await readFile('release/circuit.json','utf8'))
const viewerLabels=viewer.filter(r=>r.type==='pcb_silkscreen_text')
for(const c of components.values()) {
  const name=names.get(c.source_component_id)
  if(!pattern.test(name))continue
  const expected=labels.filter(r=>r.pcb_component_id===c.pcb_component_id)
  const actual=viewerLabels.filter(r=>r.pcb_component_id===c.pcb_component_id)
  if(JSON.stringify(expected)!==JSON.stringify(actual))errors.push(`${name}: default viewer reference differs from its source footprint`)
}
for(const label of viewerLabels) {
  if(pattern.test(label.text) && !components.get(label.pcb_component_id)?.source_component_id)errors.push(`Detached viewer reference: ${label.text}`)
}
const report={generated_at:new Date().toISOString(),policy:'Every component uses its native reference. Board-edge anchors may be moved using import {NAME} or component pcbSx, as authorized; no hidden names, detached captions or fabrication-layer injection.',default_references:evidence.length,viewer_checked:true,board_outline_checked:true,footprints_without_reference_text:withoutText.sort(),labels:evidence,errors}
await writeFile('docs/pcb-reference-check.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({...report,labels:undefined},null,2))
if(errors.length)process.exitCode=1
