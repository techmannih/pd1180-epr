import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { placementAdvisories } from './placement-review.mjs'

// A recorded CLI fixture keeps unit tests independent of ignored build logs and CWD.
// check:placement still evaluates fresh CLI output against the native board report.
const log = readFileSync(new URL('./fixtures/placement-reviewed.txt', import.meta.url), 'utf8')

const circuit=JSON.parse(readFileSync('dist/index/circuit.json','utf8'))
const check=(text,status)=>placementAdvisories(text,status,circuit)

test('unknown orientation advice or geometric errors require renewed review', () => {
  expect(check(log, 1)).toEqual(['C26','C83','R139','R140','R141','R35','R64','R65','R73'])
  expect(() => check(log.replaceAll('R65', 'R67'), 1)).toThrow()
  expect(() => check(log.replace('Errors: 0', 'Errors: 1'), 1)).toThrow()
  expect(() => check(log.replace('Warnings: 0', 'Warnings: 1'), 1)).toThrow()
  expect(() => check(log.replace('9 suboptimal', '10 suboptimal'), 1)).toThrow()
  expect(() => check(log, 0)).toThrow()
})

test('round courtyard review rejects a genuine polygon overlap', () => {
  const changed=structuredClone(circuit)
  const source=changed.find(r=>r.type==='source_component'&&r.name==='R68')
  const component=changed.find(r=>r.type==='pcb_component'&&r.source_component_id===source.source_component_id)
  for(const row of changed.filter(r=>r.pcb_component_id===component.pcb_component_id&&r.type.startsWith('pcb_courtyard_'))) {
    row.center={x:20,y:33}
  }
  expect(()=>placementAdvisories(log,1,changed)).toThrow('courtyard collision')
})
