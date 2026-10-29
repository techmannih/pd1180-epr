# tscircuit 0.0.3039 upgrade audit

Checked against board main `1b8b63f590b4ba051c11b4b73c94e7f6859cdc3d` on 2026-10-29.

## Dependency scope

The direct `tscircuit` pin changes from 0.0.2883 to 0.0.3039, bringing CLI
0.1.2421 and its bundled KiCad exporter 0.0.259 through
[CLI PR #5626](https://github.com/tscircuit/cli/pull/5626). The existing
`@tscircuit/core: 0.0.2112` compatibility override and separate board-script
`circuit-json-to-kicad: 0.0.230` dependency remain unchanged.

The initial incremental install retained stale root schema/util packages and
failed on missing `drawing_page_title_block` and
`isRouteViaCoveredByPhysicalVia` exports. Refreshing transitive lock entries to
`circuit-json: 0.0.539` and `@tscircuit/circuit-json-util: 0.0.128` fixed startup
without adding direct dependencies. A clean frozen install reports CLI version
0.0.3039.

The updated 3D renderer defaults to eight-sided holes on dense boards. That
produced a 1.940147 mm inscribed radius for a nominal 4.2 mm mounting hole,
failing the existing 0.05 mm tessellation allowance. Release rendering now
explicitly requests `boardDrillQuality: "high"` through the installed converter
API. A real-board regression reproduces the fast-mode failure and checks the
high-quality mesh. The manufacturing drills and acceptance tolerance do not
change; no extra dependency pin is introduced.

Raw stock evidence and the generated design manifest use compact JSON to keep
the complete GitHub import under its existing 24 MiB gate. All fields are
retained; the readable procurement and stock-summary reports remain available.

## Boundary corrections and native synchronization

The new checks initially reported J1/J10 outside the outline by 0.49 mm and
R3's courtyard by approximately 0.01 mm.

- R3 moves only 0.10 mm inward: source X -28.55 to -28.45 mm, Y 31 mm;
  native KiCad X 71.45 to 71.55 mm, Y 69 mm. Its unchanged courtyard now has
  0.075546 mm minimum gap to the source outline. Copper clearances are checked
  separately. No pad dimensions, nets, values or schematic placement change.
- J1/J10 keep their existing placement, footprints, holes and routing. Their
  shell/courtyard overhang is intentional for USB plug access; only these two
  instances use `allowOffBoard`. The independent USB copper-edge check removes
  that exemption and enforces 0.20 mm on their lands. A negative regression
  moves a pad to the edge and requires failure. See [USB access](usb-access.md).
- The R3 translation is recorded as an exact before/after native object in
  `engineering/r3-boundary-eco.json`. The historical geometry guards restore
  only that hash-locked change before comparing their original baselines;
  further changes to R3 or unrelated copper still fail.

All 3,023 schematic records remain identical to the old-version source build.
The dependency upgrade also adds D17's `pin1_location: "topside_left"` metadata.
The source and assembly previews both build without Circuit JSON errors or
warnings. Native R3 placement, assembly coordinates, routing evidence and the
routed viewer are regenerated together; the original native tracks and vias
are unchanged.

## Native verification

KiCad 10.0.5 refills zones and checks all track errors plus schematic parity.
The synchronized native project reports 0 electrical DRC errors, 0 unconnected
items, 0 parity findings and 0 schematic ERC violations. Its 401 previously
accepted text/silkscreen warnings remain visible with the same signature.

Fresh checks cover nine Kelvin branches, 44 bypass paths, USB return planes,
brake-sense branch isolation and the authored source rules: minimum trace
width 0.15 mm, GND clearance 0.30 mm, GND edge inset 0.50 mm. Thirty-eight fresh
DC solves cover the 18 defined power paths at the required meshes/refinements;
the existing 14-case ngspice suite was rerun with current source bindings.
These are CAD and numerical checks, not hardware qualification.

The complete `bun run review` passes: 48 verification stages, 142 Bun tests in
the invoked suites, regenerated routed/assembly GLBs, and delivery validation
of 99 files and eight archives. The final mounting-hole mesh has a minimum
open radius of 2.059648 mm for each nominal 4.2 mm hole, within the unchanged
0.05 mm tessellation allowance.

Reproduce with the pinned Bun 1.3.14 toolchain:

```sh
bun install --frozen-lockfile
bun run review
bun run build
```

## Separate generic CLI export

The initial upgrade audit exported the unchanged main `release/circuit.json`
with the new CLI. The old CLI failed with `Max iterations reached`; the new CLI
completed a full KiCad ZIP and preserved the authored global 0.20 mm
copper-edge rule. This is separate from the GND pour's 0.50 mm inset.

That generic ZIP had 0 copper-edge errors, 8 USB hole-clearance errors,
0 unconnected items, 604 parity findings and 634 warnings. Its project uses
0.20 mm hole clearance, while the retained native project uses 0.13 mm.
The physical hole correction is separate [PR #19](https://github.com/techmannih/pd1180-epr/pull/19);
this PR does not change either USB footprint or merge that correction.
Generic-export parity also remains a separate issue. Passing native checks
must not be described as clearing those generic-export findings.

The initial generic export ZIP SHA-256 was
`b42445e5e14930c5b303a2f690f853856ea1898b068942cd12de795fd7dd46a8`.
Open complete KiCad projects with their `.kicad_pro`, not an isolated PCB.

Programming/readback, external equipment, assembly and powered qualification
holds remain in [readiness.md](readiness.md). A passing engineering review does
not authorize fabrication or motor operation.
