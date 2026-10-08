# PCB routing diagnosis — 2026-10-08

Checked the user-approved source at `8a21b01edc17d7dc3e0f20044361854d1603cbeb`. No schematic, component, net, placement, import or routing source was changed during this investigation.

## Why the source viewer is not routing

1. `tscircuit.config.ts` sets `platformConfig.routingDisabled: true`; `tscircuit.config.json` also sets `build.routingDisabled: true`. `build:preview` explicitly passes `--routing-disabled`. The TSX preview therefore renders only the manually specified local copper, not the final board routing.
2. Enabling routing in an isolated in-memory copy reproduces a separate solver problem. The configured `beta_pipeline7` at effort `5x` stayed in `availableSegmentPointSolver` at 36.36% and was stopped after approximately 6.5 minutes. This was an interrupted diagnostic, not a completed failure result.
3. A comparison using `autorouterVersion="latest"`, effort `1x`, and the same source/placement completed after 554.462 seconds with `aJ ran out of iterations (capacity-autorouter@0.0.958)`. It left 817 `pcb_port_not_connected_error` entries. Increasing the build worker timeout alone does not address this demonstrated iteration-limit error.
4. The enabled-routing diagnostic also reported a local-path error on `BYPASS_C26`: `Via in trace [.U7 > .pin5 to .C26 > .pin1] is misaligned at position {x: 7.249938, y: -0.20000000000000018}`. This is an additional source-route diagnostic; it has not been established as the cause of the solver iteration exhaustion. It does not describe the independently routed KiCad board.

The modern solver input contains 179 connections and 1,310 obstacles on four copper layers. Native source autorouting remains unresolved; no successful fresh tscircuit route is claimed. The runtime configuration was not silently enabled, since that would make the interactive preview run the failing job.

## Existing final PCB route

The existing KiCad board is already routed. A fresh `build:preview` of the approved source followed by `check:routing-fingerprint` passed without updating the saved fingerprint. It matches all 902 ports, 262 placed components, pad geometry, topology and board outline.

- Normalized source fingerprint: `037ae9eaa7d16aa6468e0595aac0d9eca12bd79559e650615f05363e758078c0`
- Routed KiCad board SHA-256: `e2108f83dc67509bc63154ffeee8f314e2f40c017acf4a32cbc8a06b799f7b9d`
- Fresh native KiCad 10.0.5 DRC: **0 violations, 0 unconnected items, 0 schematic-parity issues**. Raw report: [pcb-routing-fresh-drc.json](checks/pcb-routing-fresh-drc.json).

The fresh native check used `pcb drc --all-track-errors --schematic-parity --severity-all --exit-code-violations --refill-zones --format json` against `dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb`. It did not save or change the board. This is new DRC evidence, not merely a re-read of the committed report.

Regenerating the viewer in an isolated diagnostic output maps all 902/902 ports and includes 1,264 PCB trace records, 523 vias and 790 copper-pour records. All source schematic entries are preserved. These record counts are converter output, not counts of physical nets. The diagnostic viewer and top/bottom images are saved outside the repository under `../pd1180-routing-audit/`; the versioned manufacturing release was not republished by this investigation.

Exact live supplier checks passed for all 67 populated part codes before this routing work. These checks and PCB DRC do not establish thermal, EMC or powered hardware performance.

## Next routing work

The existing verified copper can be used for PCB viewing while keeping the approved schematic. A requirement to regenerate copper through the tscircuit autorouter needs separate PCB-only work on the local via path and solver/placement input, followed by a successful complete route and native DRC. Do not alter schematic symbols or connectivity, suppress unconnected errors, or refresh the routing fingerprint merely to make a failing route pass.
