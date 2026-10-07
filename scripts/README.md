# Script catalog

Every executable script is listed here so a reviewer can understand the release pipeline without reverse-engineering the repository. `bun run check:script-catalog` fails when a script is added without documentation.

| Script | Purpose |
|---|---|
| `add-board-planes.py` | Adds board-outline-conformal GND and V3V3 planes to the routed four-layer PCB. |
| `check-alternatives.mjs` | Rechecks reviewed LCSC alternative parts and writes availability evidence. |
| `check-assembly.mjs` | Enforces exact supplier identities, stock evidence, encoder position and permitted top/bottom placement. |
| `check-board-standards.mjs` | Applies `board-standards.json` to geometry, vias, markings, sheets, DRC and assembly outputs. |
| `check-cloud-package.mjs` | Keeps generated payloads out of tscircuit cloud builds, enforces a compact source upload, rejects oversized loose GitHub-import files and prevents runtime `@tsci/*` dependencies that are not locally pinned under `imports/`. |
| `check-cloud-viewer.mjs` | Regenerates the hosted viewer artifact in memory and proves it preserves the source schematic/3D model plus the exact verified KiCad copper counts. |
| `check-feature-parity.mjs` | Verifies the product feature contract against compiled components, nets and evidence, enforces tscircuit's standard USB-C connector model, and checks permitted assembly layers. |
| `check-decoupling.mjs` | Measures placed/routed bypass connections against local distance and length limits. |
| `check-delivery.mjs` | Verifies required release files, root/release manifest identity, recursive SHA-256 hashes, archive readability and source/release consistency. |
| `check-firmware.mjs` | Builds and runs the host-side safety-state/TMC configuration tests. |
| `check-kicad-drc.mjs` | Fails on any violation or unconnected item in the final KiCad DRC report. |
| `check-local-copper.mjs` | Checks manually constrained local copper and critical short routing. |
| `check-netlist.mjs` | Validates source connectivity and required nets. |
| `check-power-routing.mjs` | Audits final KiCad power corridors, clearances, layers, via counts and analytical current screen. |
| `check-release.mjs` | Enforces prototype-order gates while reporting remaining physical system gates separately. |
| `check-schematic-style.mjs` | Runs the same placement/style analyzer used by the tscircuit schematic viewer, records per-sheet evidence and fails unless the issue count is zero. |
| `check-routing-fingerprint.mjs` | Guards saved routing against unreviewed topology, footprint or placement changes. |
| `check-script-catalog.mjs` | Ensures this catalog mentions every `.mjs` and `.py` script. |
| `check-stock.mjs` | Refreshes exact JLCSearch stock evidence for the fitted BOM. |
| `check-toolchain.mjs` | Verifies the pinned Bun runtime, exact dependency versions and installed tscircuit toolchain. |
| `clean-silkscreen.py` | Removes dense passive references and applies the reviewed product/revision markings in KiCad. |
| `design.test.mjs` | Regression tests electrical topology, fixed parts and safety behavior. |
| `export-assembly.mjs` | Generates JLC-compatible BOM/CPL and the assembly review data. |
| `export-kicad-route.mjs` | Exports the current Circuit JSON to a fresh KiCad PCB/project and hierarchical schematics for external routing. |
| `export-manufacturing.mjs` | Uses KiCad CLI to export Gerbers, drills, positions, DRC, top/bottom renders and manufacturing ZIP. |
| `export-previews.mjs` | Renders top PCB and all functional schematic sheets. |
| `export-release.mjs` | Builds the versioned release, synchronized root/release delivery manifests, sourcing tables and recursive hashes. |
| `export-silkscreen-evidence.py` | Records every visible final KiCad top/bottom silkscreen label and its physical text size. |
| `generate-firmware-pins.mjs` | Generates the STM32 pin header from the hardware pin contract or checks it for drift. |
| `generate-cloud-viewer.mjs` | Combines the verified source schematic/3D model with routed KiCad traces, vias and pours for deterministic hosted PCB viewing. |
| `generate-mounting-template.mjs` | Generates the 100%-scale SVG/PNG mounting template from the hardware contract and hash-locked STEP perimeter evidence, then detects stale copies. |
| `generate-routing-report.py` | Generates route counts and completion state from the final KiCad board, DRC JSON and manufacturing report. |
| `import-routed-kicad.mjs` | Imports externally routed KiCad copper into reviewable Circuit JSON artifacts. |
| `import-specctra-route.py` | Imports a Freerouting Specctra SES result into its matching KiCad PCB, reverses the temporary bottom-placement routing compensation, and records connectivity counts. |
| `make-power-only-dsn.py` | Produces a power-focused Specctra routing input for controlled routing work. |
| `normalize-generated-svgs.mjs` | Removes generator-only trailing whitespace so previews remain deterministic in review. |
| `prepare-r03-dsn.py` | Applies r0.3 routing classes and compensates the KiCad/Specctra bottom-footprint rotation convention before autorouting. |
| `reinforce-power-copper.py` | Adds clearance-aware power corridors and parallel transfer vias to the final KiCad route. |
| `remove-isolated-zones.py` | Removes generated copper islands that do not connect to the intended net. |
| `sync-generated-docs.mjs` | Synchronizes generated manifest and pin/placement documentation. |
| `verify.mjs` | Runs independent checks, preserves logs and writes root Markdown plus machine-readable verification summaries. |
| `via-net-identity.test.mjs` | Regression-tests via net identity and prevents accidental layer-transition shorts. |

The Python routing helpers are board-specific. Do not reuse their geometry on another board. The check patterns, failure behavior and documentation structure are reusable.
