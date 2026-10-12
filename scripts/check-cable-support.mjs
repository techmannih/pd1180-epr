import {readFile,writeFile} from 'node:fs/promises'
import {readGlb} from './assembly-glb.mjs'
import {segmentDistance} from './harness-geometry.mjs'
const fixture=await readGlb('engineering/mechanical/adapter-proposal.glb')
const geometry=JSON.parse(await readFile('engineering/mechanical/harness-geometry.json'))
const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,t)=>a.map(v=>v*t),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
function inside(p,a,b,c){const u=sub(b,a),v=sub(c,a),w=sub(p,a),uv=dot(u,v),uu=dot(u,u),vv=dot(v,v),wu=dot(w,u),wv=dot(w,v),den=uu*vv-uv*uv;if(den<1e-15)return false;const s=(vv*wu-uv*wv)/den,t=(uu*wv-uv*wu)/den;return s>=-1e-8&&t>=-1e-8&&s+t<=1+1e-8}
function pointTri(p,a,b,c){const n=cross(sub(b,a),sub(c,a)),nn=dot(n,n);if(nn>1e-15){const h=dot(sub(p,a),n)/nn,q=sub(p,mul(n,h));if(inside(q,a,b,c))return Math.abs(h)*Math.sqrt(nn)}return Math.min(segmentDistance(p,p,a,b),segmentDistance(p,p,b,c),segmentDistance(p,p,c,a))}
function distance(p,q,a,b,c){const n=cross(sub(b,a),sub(c,a)),d=dot(sub(q,p),n);if(Math.abs(d)>1e-12){const t=dot(sub(a,p),n)/d;if(t>=0&&t<=1&&inside(add(p,mul(sub(q,p),t)),a,b,c))return 0}return Math.min(pointTri(p,a,b,c),pointTri(q,a,b,c),segmentDistance(p,q,a,b),segmentDistance(p,q,b,c),segmentDistance(p,q,c,a))}
const errors=[],checks=[]
for(const w of geometry.wires){
 let min=Infinity,nearest=null
 for(const m of fixture.meshes.filter(m=>m.name.startsWith('cable_'))){
  for(const tri of m.triangles){
   // Only the jacket and its emerging factory conductors intentionally pass
   // through the split clamp's 7.5 mm bore. All arms/columns stay checked.
   const boreContact=['jacket','factory conductor'].includes(w.kind)&&m.name.match(/^cable_(support_PD|clamp_cap)/)&&tri.every(p=>p[2]>=-56.01&&p[2]<=-46.99&&Math.abs(p[0])<=13.01&&p[1]>=-100.01&&p[1]<=-83.99)
   if(boreContact)continue
   for(let i=1;i<w.points.length;i++){
    const gap=distance(w.points[i-1],w.points[i],...tri)-w.radius_mm
    if(gap<min){min=gap;nearest=m.name}
   }
  }
 }
 checks.push({wire:w.name,minimum_surface_gap_mm:min,nearest})
 if(min<.19)errors.push(`${w.name}: ${nearest} clearance ${min.toFixed(3)} mm`)
}
const report={fixture_sha256:fixture.sha256,checks,errors,scope:'Nominal swept cable radius to custom support/cap and M3 fastener mesh surfaces; only intended factory-cable passage through the clamp bore excluded. No pull/creep/thermal qualification.'}
await writeFile('docs/cable-support-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1
