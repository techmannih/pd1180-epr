import { readFile, writeFile } from 'node:fs/promises'
import { parseNative, field, digest } from './native-eco-policy.mjs'
import { powerFeedErrors } from './power-feed.mjs'

// Historical ECO replay describes the old STM32/TMC board. The new route has
// independent native DRC, source/pin, copper and complete geometry evidence.
export function verifyRp2040Protection(board, reviewedRoute) {
  if (reviewedRoute.architecture_baseline?.architecture !== 'RP2040_DRV8462DDV')
    throw new Error('Missing reviewed RP2040 route baseline')
  const footprints = new Map(board.filter(x => x[0] === 'footprint').map(x => [
    x.find(p => p[0] === 'property' && p[1] === '"Reference"')?.[2], x,
  ]))
  for (const reference of ['U1','U2','U3','U6','U12','U13','U14','U15','U34','U37','Q4','Q16'])
    if (!footprints.has(JSON.stringify(reference))) throw new Error(`Missing retained protection ${reference}`)
  for (const [reference, pin, grounded] of [['U1','14',true],['U1','15',true],['U1','1',false],['U1','2',false],['J1','10',false],['J1','16',false]]) {
    const pad = footprints.get(JSON.stringify(reference))?.find(p => p[0] === 'pad' && p[1] === JSON.stringify(pin))
    const net = pad && field(pad, 'net')?.[1]
    if (grounded ? net !== '"GND"' : !net?.startsWith('"unconnected-('))
      throw new Error(`Unused-SBU protection mismatch at ${reference}.${pin}`)
  }
  if (/PD_SBU[12]_CONN/.test(JSON.stringify(board))) throw new Error('Obsolete SBU signal restored')
  const errors = powerFeedErrors(board, reviewedRoute)
  if (errors.length) throw new Error(errors.join('\n'))
  return true
}

if (import.meta.main) {
  const bytes = await readFile('dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb')
  const routeBytes = await readFile('routing/power-feed.json')
  verifyRp2040Protection(parseNative(bytes.toString()), JSON.parse(routeBytes))
  await writeFile('engineering/protection-refinement-geometry.json', JSON.stringify({
    architecture:'RP2040_DRV8462DDV', current_board_sha256:digest(bytes),
    unused_sbu_ground_and_nc_connections_verified:true,
    independent_protection_components_retained:true,
    exact_reviewed_native_geometry_verified:true,
    geometry_policy_sha256:digest(routeBytes), checker_sha256:digest(await readFile(new URL(import.meta.url))),
    historical_eco_replay:'Separately regression-tested against main 1c22abf, not applied to the redesigned PCB.',
    hardware_qualified:false,
  }, null, 2)+'\n')
  console.log('RP2040 native SBU protection and retained safety devices verified; complete native geometry matches the independently checked route baseline.')
}
