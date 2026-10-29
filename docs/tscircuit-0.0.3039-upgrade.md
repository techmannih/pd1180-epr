# tscircuit 0.0.3039 upgrade audit

Checked on 2026-10-29 against board main `1b8b63f590b4ba051c11b4b73c94e7f6859cdc3d`.

**The dependency update is not ready to merge:** installation and CLI startup work, but the fresh source build reports three component-boundary errors. The routed-viewer refresh correctly stops before replacing the released board. No source placement, routing, native manufacturing files or release artifacts were changed for this upgrade.

## Dependency scope

Only the direct `tscircuit` pin changes, from `0.0.2883` to `0.0.3039`, together with the lockfile. This installs CLI `0.1.2421`, which bundles KiCad exporter `0.0.259` after [CLI PR #5626](https://github.com/tscircuit/cli/pull/5626).

The existing `@tscircuit/core: 0.0.2112` compatibility override is retained. The separate `circuit-json-to-kicad: 0.0.230` dependency used by board-specific native scripts also remains unchanged; the `tsci export` command uses the CLI's bundled converter.

The first incremental install retained incompatible root copies of `circuit-json` and `@tscircuit/circuit-json-util`. The resulting CLI startup errors named `drawing_page_title_block` and `isRouteViaCoveredByPhysicalVia`. Refreshing their transitive lock entries to `0.0.539` and `0.0.128` respectively resolved startup without adding direct dependencies. A separate clean directory containing only the updated manifest and lockfile passes `bun install --frozen-lockfile` and reports `tsci --version` as `0.0.3039`.

## Build comparison

The old toolchain's fresh board and assembly preview build passes with no Circuit JSON error/warning records. The updated build emits these three `pcb_component_outside_board_error` records:

| Reference | Reported extension beyond board |
| --- | --- |
| J1 | 0.49 mm |
| J10 | 0.49 mm |
| R3 | approximately 0.01 mm |

These are newly reported checks on existing placement, not components moved by this update. USB shell overhang and the corner-adjacent R3 bounds need physical/footprint review before deciding whether a narrowly justified allowance or a geometry correction is appropriate. No error was suppressed or automatically waived.

All **3,023 schematic records remain exactly equal** to the fresh old-version build. Apart from the error records and CLI cache hash, the only Circuit JSON change is D17 gaining `pin1_location: "topside_left"`. Source coordinates, pads and routed native copper were not edited.

Validation with Bun 1.3.14:

- Typecheck and locked-toolchain check pass.
- Source schematic audit: **173/173 assertions pass**; schematic style analysis reports zero issues.
- Existing routing fingerprint passes.
- Script tests: **140 pass, 2 fail** across 142 tests / 3,116 assertions. The failures are the source-error guard and the source-to-release consistency guard; the released viewer was deliberately not regenerated after the build failed.
- `bun run build` fails at the source preview and prevents publishing the routed preview.

Generated diagnostic outputs from this experiment are retained separately from the previously reviewed release artifacts.

## KiCad export

On the unchanged complete routed `release/circuit.json`, the old CLI's KiCad ZIP export fails with `Max iterations reached`. The updated CLI successfully exports both a PCB and a complete ZIP, including downloaded 3D models.

The ZIP's `.kicad_pro` preserves these authored rules:

| Rule | Exported value |
| --- | --- |
| Global copper-to-edge clearance | 0.20 mm |
| Minimum track width | 0.15 mm |
| Copper-to-hole clearance | 0.20 mm |
| Minimum through-hole diameter | 0.30 mm |

The complete project must be extracted and opened via `.kicad_pro`. The global 0.20 mm edge rule is separate from the GND pour's 0.50 mm inset.

The USB locating-hole correction in [board PR #19](https://github.com/techmannih/pd1180-epr/pull/19) is not in this base commit. Updating the exporter does not incorporate that physical footprint correction.

Native KiCad **10.0.5**, with zones refilled, all track errors enabled and schematic parity checked, reports:

| Finding | Count |
| --- | ---: |
| Copper-edge clearance errors | 0 |
| Copper-to-hole clearance errors (J1/J10) | 8 |
| Other PCB DRC errors | 0 |
| PCB DRC warnings | 634 |
| Unconnected items | 0 |
| Schematic-parity findings | 604 |

The parity findings comprise 199 footprint/symbol mismatches, 199 field mismatches, 199 net conflicts, four extra footprints and three duplicate-footprint findings. They remain a separate export-consistency issue; passing copper-edge checks does not clear them. The warnings include library-reference, text/silkscreen and one dangling-track finding.

Reproduce the export check independently of the failing source build:

```sh
bun install --frozen-lockfile
bunx tsci export release/circuit.json -f kicad_zip -o /absolute/output/updated-kicad.zip
# Extract the complete ZIP into a fresh directory, then run there:
kicad-cli pcb drc --refill-zones --all-track-errors --schematic-parity \
  --format json -o drc.json circuit.kicad_pcb
```

The audit's export ZIP SHA-256 is `b42445e5e14930c5b303a2f690f853856ea1898b068942cd12de795fd7dd46a8`. It is an investigation output, not a replacement manufacturing release.
