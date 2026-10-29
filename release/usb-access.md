# USB edge placement

J1 (EPR power) and J10 (USB data) move 2.00 mm outward, from TSX `pcbX=-36` to `-38`. Both retain their Y positions (15 / 1 mm), outward 270° orientation, exact GCT USB4105-GF-A-060 identity, footprint, pin nets and the user-selected CAD Y offset 1.075092 mm. The PCB outline and all four mounting holes remain unchanged. C5's existing native reference anchor is pinned in the source so adjacent USB movement cannot flip its automatic label placement. The DATA marking moves into the open gap above J10 to clear the shell land and neighbouring buzzer.

Using the [GCT USB4105 drawing, revision B4](https://gct.co/files/drawings/usb4105.pdf), the front shell-stake centre is 2.60 mm behind the mating face. Both native mating faces are now at PCB X=-43.2356 mm; the PCB edge is X=-42.9500 mm. The nominal face therefore extends 0.2856 mm beyond the edge, replacing the previous 1.7144 mm recess. This calculation uses the native land geometry, independently of the generic 3D model.

The drawing's minimum 1.85 mm plug-shoulder setback gives 2.1356 mm nominal shoulder clearance outside the board edge. Its 6.5 mm maximum plug height and 1.73 mm mating-axis height give 19.58 mm vertical separation from the motor rear in the existing 19.5 mm preview mounting gap. This is a drawing/envelope screen, not an actual cable collision measurement. The final mounting stack, PCB/placement tolerances, enclosure opening, cable overmould and insertion/strain-relief clearance must be checked on the assembled product. No final mount or universal cable fit is asserted.

Local attached copper, power pours and shell-ground connections follow the new ports. Fixed component pad anchors are retained. Three local fill-only trims remove acute pour tips without exempting any trace, pad, drill or clearance rule. The exact native changes are recorded in `engineering/unused-sbu-eco.json`; restoring them must reproduce the original protected geometry hash. `engineering/usb-edge-eco.json` summarizes the scope. New regressions reject the old recessed position, source/native disagreement, wrong orientation and unauthorized geometry changes.

J2, J3 and their wiring are unchanged. External brake resistor/heatsink qualification, programming/readback/cold-boot checks, actual 48 V EPR source/cable tests, low-current commissioning, braking and thermal tests remain necessary. Firmware motion locks remain enabled; this change does not authorize ordering or powered motion.

The exact restoration objects use gzip/base64 inside the existing ECO policy to stay within the hosted GitHub import size limit. `placementRevisions()` verifies the decompressed SHA-256 before use; corruption, ambiguous encoding and changed board geometry all fail closed. The decoded JSON contains every original object and approved replacement hash; no evidence is dropped. Inspect it with `bun -e 'import {placementRevisions} from "./scripts/native-eco-policy.mjs"; console.log(JSON.stringify(placementRevisions(await Bun.file("engineering/unused-sbu-eco.json").json()), null, 2))'` from the repository root.

The actual filled USB input copper from all four J1 VBUS lands to Q4 source lands was screened at 0.075 and 0.050 mm grids. The result is 13.4712 mΩ at 20 °C, with 0.062% mesh difference (about 0.337 W copper loss at 5 A). This excludes contacts, devices, temperature feedback and AC effects; it is not a temperature-rise or USB current-rating qualification. Details and assumptions are in `engineering/usb-edge-eco.json`.
# Boundary-check model

J1/J10 retain their reviewed positions and footprint geometry. Their shells and
courtyards intentionally project beyond the board edge for plug access, so the
two source instances use `allowOffBoard`. This is not a copper-clearance waiver:
`usbCopperEdgeErrors` independently checks their electrical lands against the
0.20 mm board-edge rule with the exemption removed. Regression tests reject a
pad crossing the edge and any unrelated component receiving the exemption.
