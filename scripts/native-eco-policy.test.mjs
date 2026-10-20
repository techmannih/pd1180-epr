import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { parseNative, verifyNativeEco, field, placementRevisions } from './native-eco-policy.mjs'
const original = parseNative(readFileSync('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb','utf8'))
const policy = JSON.parse(readFileSync('engineering/unused-sbu-eco.json'))
test('approved unused-SBU correction preserves unrelated PCB', () => expect(verifyNativeEco(original,policy)).toBe(true))
test('rejects restored SBU signal, changed capacitor route and moved mounting hole', () => {
  for (const mutate of [
    b => { const u=b.find(x=>x[0]==='footprint'&&x.some(v=>v[0]==='property'&&v[1]==='"Reference"'&&v[2]==='"U1"'));field(u.find(x=>x[0]==='pad'&&x[1]==='"14"'),'net')[1]='"V3V3"' },
    b => { const s=b.find(x=>x[0]==='segment'&&field(x,'uuid')?.[1]==='"6120ed8c-11a6-4f9b-8689-a480747f79d1"');field(s,'width')[1]='0.1' },
    b => { const h=b.find(x=>x[0]==='footprint'&&x.some(v=>v[0]==='pad'&&v[2]==='np_thru_hole'));field(h,'at')[1]='101' },
  ]) {const b=structuredClone(original);mutate(b);expect(()=>verifyNativeEco(b,policy)).toThrow()}
})
test('supplier substitution permits only reviewed values, never pad or text geometry', () => {
  for (const mutate of [
    f => { f.find(p=>p[0]==='property' && p[1]==='"Value"')[2]='"USB4105-GF-A-120"' },
    f => { field(f.find(p=>p[0]==='pad'),'at')[1]='99' },
    f => { field(f,'at')[1]='99' },
    f => { field(f.find(p=>p[0]==='property' && p[1]==='"Reference"'),'at')[1]='99' },
  ]) {
    const b=structuredClone(original)
    const f=b.find(x=>x[0]==='footprint' && x.some(p=>p[0]==='property' && p[1]==='"Reference"' && p[2]==='"J1"'))
    mutate(f)
    expect(()=>verifyNativeEco(b,policy)).toThrow()
  }
})

test.each(['U16','U35','C95'])('%s footprint replacement rejects any further land, placement or net change', (reference) => {
  for (const mutate of [
    f => { field(f.find(p=>p[0]==='pad'),'size')[1]='0.9' },
    f => { field(f.find(p=>p[0]==='pad'),'at')[1]='99' },
    f => { field(f,'at')[1]='99' },
    f => { field(f.find(p=>p[0]==='pad' && field(p,'net')),'net')[1]='"VMOTOR"' },
  ]) {
    const b=structuredClone(original)
    const f=b.find(x=>x[0]==='footprint' && x.some(p=>p[0]==='property' && p[1]==='"Reference"' && p[2]===JSON.stringify(reference)))
    mutate(f)
    expect(()=>verifyNativeEco(b,policy)).toThrow()
  }
})

test('stocked MCU/reset ECO rejects missing buffer, changed paste and restored local stubs', () => {
  for (const mutate of [
    b => { const i=b.findIndex(x=>x[0]==='footprint'&&x.some(p=>p[0]==='property'&&p[1]==='"Reference"'&&p[2]==='"U37"')); if(i<0) throw Error('Missing U37 fixture'); b.splice(i,1) },
    b => { const f=b.find(x=>x[0]==='footprint'&&x.some(p=>p[0]==='property'&&p[1]==='"Reference"'&&p[2]==='"U16"')); const pad=f.find(p=>p[0]==='pad'&&p[1]==='"49"'); expect(field(pad,'solder_paste_margin')?.[1]).toBe('-0.5'); field(pad,'solder_paste_margin')[1]='0' },
    b => { expect(policy.local_copper_removals.length).toBeGreaterThan(0); b.push(structuredClone(policy.local_copper_removals[0])) },
    b => { const id=field(policy.local_copper_modifications[0].before,'uuid')[1]; const t=b.find(x=>Array.isArray(x)&&field(x,'uuid')?.[1]===id); field(t,t[0]==='via'?'at':'start')[1]='99' },
  ]) {const b=structuredClone(original);mutate(b);expect(()=>verifyNativeEco(b,policy)).toThrow()}
})

test('USB edge ECO rejects restored superseded pours or a missing retained local addition', () => {
  const revision = placementRevisions(policy).find(r => r.modified.some(x => x.before[0] === 'zone'))
  expect(revision.modified.some(x => x.before[0] === 'zone')).toBe(true)
  for (const mutate of [
    b => { const change = revision.modified.find(x => x.before[0] === 'zone'); const z = b.find(x => Array.isArray(x) && field(x, 'uuid')?.[1] === field(change.before, 'uuid')[1]); if(z) field(field(z, 'polygon'), 'pts')[1][1] = '99'; else b.push(structuredClone(change.before)) },
    b => { const retained=revision.added.find(a=>b.some(x=>Array.isArray(x)&&field(x,'uuid')?.[1]===field(a,'uuid')[1])); expect(retained).toBeDefined(); const id=field(retained,'uuid')[1]; b.splice(b.findIndex(x=>Array.isArray(x)&&field(x,'uuid')?.[1]===id),1) },
  ]) { const b = structuredClone(original); mutate(b); expect(() => verifyNativeEco(b, policy)).toThrow() }
})

test('copper consolidation rejects altered boundaries, restored old zones and missing contact repairs',()=>{
 const revision=placementRevisions(policy).at(-1)
 expect(revision.reason).toContain('copper-only')
 for(const mutate of [
  b=>{const z=b.find(x=>x[0]==='zone'&&field(x,'name')?.[1]?.startsWith('"power:'));field(field(z,'polygon'),'pts')[1][1]='99'},
  b=>b.push(structuredClone(revision.removed[0])),
  b=>{const id=field(revision.added.find(x=>x[0]==='segment'),'uuid')[1];const i=b.findIndex(x=>Array.isArray(x)&&field(x,'uuid')?.[1]===id);expect(i).toBeGreaterThanOrEqual(0);b.splice(i,1)},
 ]){const b=structuredClone(original);mutate(b);expect(()=>verifyNativeEco(b,policy)).toThrow()}
})

test('compressed placement restoration rejects corruption and ambiguous encodings', () => {
  expect(() => placementRevisions({ ...policy, local_placement_revisions: [] })).toThrow()
  expect(() => placementRevisions({ ...policy, local_placement_revisions_sha256: '0'.repeat(64) })).toThrow()
})

test('encoder top ECO rejects restored bottom stubs or changed local via geometry',()=>{
 const revision=placementRevisions(policy).find(r=>r.name==='encoder capacitors top 2026-10-16')
 expect(revision.removed).toHaveLength(2)
 for(const mutate of [
  b=>b.push(structuredClone(revision.removed[0])),
  b=>{const id=field(revision.added.find(x=>x[0]==='via'),'uuid')[1];field(b.find(x=>Array.isArray(x)&&field(x,'uuid')?.[1]===id),'drill')[1]='0.2'},
  b=>{const f=b.find(x=>x[0]==='footprint'&&x.some(p=>p[0]==='property'&&p[1]==='"Reference"'&&p[2]==='"C52"'));field(f,'layer')[1]='"B.Cu"'},
 ]){const b=structuredClone(original);mutate(b);expect(()=>verifyNativeEco(b,policy)).toThrow()}
})
