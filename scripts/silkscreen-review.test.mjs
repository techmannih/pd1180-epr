import{test,expect}from'bun:test';import{readFileSync}from'node:fs';import{assertReviewDrc}from'./silkscreen-review.mjs';
const original=JSON.parse(readFileSync('dist/manufacturing/kicad-drc.json'));
test('explicit user acceptance retains known labels but never accepts electrical faults or changed finding identities',()=>{
 expect(()=>assertReviewDrc(original,true)).not.toThrow();expect(()=>assertReviewDrc(original,false)).not.toThrow();
 for(const mutate of [d=>d.violations.push({type:'shorting_items',items:[]}),d=>d.unconnected_items.push({}),d=>d.schematic_parity.push({}),d=>d.violations[0].items[0].uuid='changed']){const d=structuredClone(original);mutate(d);expect(()=>assertReviewDrc(d,true)).toThrow()}
})

test('USB hole exception is exact and cannot hide new holes, changed gaps, or changed pads',()=>{
 const held=JSON.parse(readFileSync('engineering/usb-hole-hold.json')).findings;
 for(const mutate of [
   a=>a.push(structuredClone(a[0])),
   a=>a[0].description=a[0].description.replace(/actual [0-9.]+ mm/, 'actual 0.1200 mm'),
   a=>a[0].items[0].description=a[0].items[0].description.replace(/J(?:1|10)\b/, 'J99'),
 ]){const d=structuredClone(original);d.violations=d.violations.filter(v=>v.type!=='hole_clearance');const holes=structuredClone(held);mutate(holes);d.violations.push(...holes);expect(()=>assertReviewDrc(d,true)).toThrow()}
})
