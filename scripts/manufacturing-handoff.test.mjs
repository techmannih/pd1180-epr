import { expect, test } from 'bun:test'
import { manufacturingHandoffErrors, readManufacturingHandoff } from './manufacturing-handoff.mjs'
const current = await readManufacturingHandoff()

test('current handoff matches source and native inventory', () => {
  expect(manufacturingHandoffErrors(current)).toEqual([])
})
test('reject obsolete release instructions even when their integrity hashes could match', () => {
  for (const corrupt of [
    input => { input.order.assembly.fitted_component_count = 235 },
    input => { input.documents['assembly.md'] += '\nOrder all 62 filled/capped vias.' },
    input => { input.order.pcb.via_in_pad_count = 62 },
    input => { input.order.pcb.minimum_trace_width_mm = 0.09 },
    input => { input.order.programming.U16_mcu.readback_bytes = 524288 },
    input => { input.order.assembly.external_motor_harness = 'VHR-4N / SVH-41T-P1.1 cable' },
    input => { input.documents['manufacturing-acceptance.md'] = input.documents['manufacturing-acceptance.md'].replace('**27 locations**', '**62 locations**') },
    input => { input.documents['external-system.md'] += '\nAll 252 fitted components use JST SVH-41T contacts.' },
    input => { input.documents['sourcing-resolution.md'] = input.documents['sourcing-resolution.md'].replaceAll('C136970', 'C1369700') },
  ]) {
    const input = structuredClone(current)
    corrupt(input)
    expect(manufacturingHandoffErrors(input).length).toBeGreaterThan(0)
  }
})
