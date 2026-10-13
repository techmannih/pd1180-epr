import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { parseNative, verifyNativeEco, field } from './native-eco-policy.mjs'
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
