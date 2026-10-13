import{test,expect}from'bun:test';import{readFileSync}from'node:fs';import{placementAdvisories}from'./placement-review.mjs';
const log=readFileSync('docs/checks/placement-raw.log','utf8');
test('unknown orientation advice or geometric errors require renewed review',()=>{
 expect(placementAdvisories(log,1)).toEqual(['C23','C41','R56']);
 expect(()=>placementAdvisories(log.replaceAll('C41','C42'),1)).toThrow();
 expect(()=>placementAdvisories(log.replace('Errors: 0','Errors: 1'),1)).toThrow();
 expect(()=>placementAdvisories(log.replace('3 suboptimal','4 suboptimal'),1)).toThrow();
})
