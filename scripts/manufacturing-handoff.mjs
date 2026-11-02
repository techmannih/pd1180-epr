import { readFile } from 'node:fs/promises'

// Integrity hashes cannot detect internally consistent but obsolete assembly instructions.
export function manufacturingHandoffErrors({ manifest, order, standards, vias, documents }) {
  const errors = []
  const require = (condition, message) => { if (!condition) errors.push(message) }
  require(order.assembly.fitted_component_count === manifest.parts.length, 'Fitted count differs from current source manifest')
  require(order.pcb.via_in_pad_count === vias.count && vias.count === vias.vias.length, 'Via-in-pad count differs from native inventory')
  require(order.pcb.minimum_trace_width_mm === standards.fabrication.minimum_trace_width_mm, 'Order track-width rule differs from source standard')
  require(order.pcb.minimum_copper_spacing_mm === standards.fabrication.minimum_trace_space_mm, 'Order spacing rule differs from source standard')
  require(order.programming.U16_mcu.part === 'RP2040 + W25Q32JV 4 MiB' && order.programming.U16_mcu.readback_bytes === 4194304 && order.programming.U16_mcu.raw_binary_flash_address === '0x10000000', 'Wrong MCU/flash programming instructions')
  const motorTerminal = manifest.parts.find(part => part.name === 'J2')
  require(order.assembly.external_motor_harness.includes(motorTerminal.mpn) && !/VHR-|SVH-|JST/i.test(order.assembly.external_motor_harness), 'Motor harness instructions do not match selected WAGO terminal')
  for (const [name, layer] of Object.entries(standards.assembly.optional_unpopulated_parts)) {
    require(manifest.optional_parts.some(part => part.name === name && part.layer === layer && part.do_not_place), `${name}: optional assembly side differs`)
  }
  const manufacturing = documents['manufacturing-acceptance.md']
  require(manufacturing.includes(`**${manifest.parts.length} components**`) && manufacturing.includes(`**${vias.count} locations**`), 'Manufacturing prose contains stale fitted/via counts')
  require(manufacturing.includes(`**${standards.fabrication.minimum_trace_width_mm.toFixed(2)} mm**`) && manufacturing.includes(`**${standards.fabrication.minimum_trace_space_mm.toFixed(2)} mm**`), 'Manufacturing prose is missing current track/spacing rules')
  for (const name of ['manufacturing-acceptance.md', 'u16-footprint.md', 'external-system.md', 'assembly.md']) {
    require(!/STM32G0B1CEU6|UFQFPN48|VHR-4N|SVH-41T|170\/170\/170\/165|All 252 fitted|all three false qualification locks/.test(documents[name]), `${name}: superseded assembly instruction`)
  }
  require(!/contains 21 via-drill|63 filled\/capped|all 62 filled\/capped|external-MOSFET stepper stage|10 mm nominal motor-to-PCB/.test(documents['assembly.md']), 'assembly.md: superseded via/current/mounting instruction')
  const sourcing = documents['sourcing-resolution.md']
  for (const ref of ['R66', 'R60', 'BZ1', 'J1', 'J10', 'U7']) {
    const part = manifest.parts.find(part => part.name === ref)
    require(Boolean(part) && new RegExp(`\\b${part.lcsc}\\b`).test(sourcing) && (!part.mpn || sourcing.includes(part.mpn)), `${ref}: user stock-check identity differs from current source`)
  }
  return errors
}

export async function readManufacturingHandoff(directory = 'docs') {
  const json = async path => JSON.parse(await readFile(path, 'utf8'))
  const names = ['manufacturing-acceptance.md', 'u16-footprint.md', 'external-system.md', 'sourcing-resolution.md', 'assembly.md']
  return {
    manifest: await json('docs/design-manifest.json'),
    order: await json('release/order-settings.json'),
    standards: await json('board-standards.json'),
    vias: await json('engineering/rp2040-via-in-pad.json'),
    documents: Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(`${directory}/${name}`, 'utf8')]))),
  }
}
if (import.meta.main) {
  const errors = manufacturingHandoffErrors(await readManufacturingHandoff())
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('Manufacturing handoff matches current fitted parts, rules, via inventory, flash and terminal identities; physical holds remain.')
}
