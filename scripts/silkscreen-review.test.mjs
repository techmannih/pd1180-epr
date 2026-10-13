import{test,expect}from'bun:test';import{readFileSync}from'node:fs';import{assertReviewDrc}from'./silkscreen-review.mjs';
const original=JSON.parse(readFileSync('dist/manufacturing/kicad-drc.json'));
test('explicit user acceptance retains known labels but never accepts electrical faults or changed finding identities',()=>{
 expect(()=>assertReviewDrc(original,true)).not.toThrow();expect(()=>assertReviewDrc(original,false)).not.toThrow();
 for(const mutate of [d=>d.violations.push({type:'shorting_items',items:[]}),d=>d.unconnected_items.push({}),d=>d.schematic_parity.push({}),d=>d.violations[0].items[0].uuid='changed']){const d=structuredClone(original);mutate(d);expect(()=>assertReviewDrc(d,true)).toThrow()}
})
