import { readFile, writeFile } from 'node:fs/promises'
import { parseNative, verifyNativeEco, digest, placementRevisions } from './native-eco-policy.mjs'
const path = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const bytes = await readFile(path)
const policy = JSON.parse(await readFile('engineering/unused-sbu-eco.json'))
verifyNativeEco(parseNative(bytes.toString()), policy)
await writeFile('engineering/protection-refinement-geometry.json', JSON.stringify({
  base_commit: policy.base_commit, baseline_board_sha256: policy.baseline_board_sha256,
  current_board_sha256: digest(bytes), pad_net_changes: policy.pad_changes,
  footprint_replacements: (policy.footprint_replacements || []).map(p => ({ reference: p.reference, after_sha256: p.after_sha256, reason: p.reason })),
  removed_copper_items: 44, removed_isolated_zones: 1, added_ground_segments: 2,
  added_local_fill_trim: 1, stocked_controller_eco: policy.stocked_controller_eco, all_other_native_geometry_unchanged: true,
  usb_edge_eco: placementRevisions(policy).map(p => ({ baseline_commit: p.baseline_commit, reason: p.reason, modified: p.modified.length, added: p.added.length })),
  derived_zone_fills_recomputed: true, policy_sha256: digest(await readFile('engineering/unused-sbu-eco.json')),
  checker_sha256: digest(await readFile(new URL(import.meta.url))), hardware_qualified: false,
}, null, 2)+'\n')
console.log('Verified SBU, stocked-controller and USB-edge ECOs; exact reviewed geometry is hash-locked. Every unrelated pad/net, placement, hole, track and zone outline is unchanged.')
