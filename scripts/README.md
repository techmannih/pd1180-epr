# Script catalog

Every executable script is listed here so a reviewer can understand the release pipeline without reverse-engineering the repository. `bun run check:script-catalog` fails when a script is added without documentation.

| Script | Purpose |
|---|---|
| `add-board-planes.py` | Adds board-outline-conformal GND and V3V3 planes to the routed four-layer PCB. |
| `build-firmware.mjs` | Builds and packages the pinned STM32 ARM commissioning image; --check proves source/artifact hashes match and motion remains locked. |
| `check-operating-mode.mjs` | Fails for encoder connections incompatible with the selected external STEP/DIR mode; records the exact hardware blocker. |
| `check-alternatives.mjs` | Rechecks reviewed LCSC alternative parts, their pinned live package names and intended package compatibility, then writes availability evidence. |
| `check-assembly.mjs` | Enforces exact supplier identities, stock evidence, encoder position and permitted top/bottom placement. |
| `check-board-standards.mjs` | Applies `board-standards.json` to geometry, vias, markings, sheets, DRC and assembly outputs. |
| `check-cloud-package.mjs` | Guards the source entrypoint, visibility of every TSX/import and both explicit CI build targets; `--built` verifies the selected hosted output exists and matches the complete routed JSON; enforces a compact upload, rejects oversized loose GitHub-import files and prevents runtime `@tsci/*` dependencies that are not locally pinned under `imports/`. |
| `check-cloud-viewer.mjs` | Regenerates the hosted viewer artifact in memory and proves it preserves the source schematic/3D model, verified KiCad copper counts and a named source net for every route, via and pour. |
| `cloud-viewer-net-names.test.mjs` | Regresses KiCad 10 named branch routes without pad endpoints, via/pour net remapping, unchanged schematic/route geometry and rejection of missing, unknown or conflicting net identities. |
| `check-feature-parity.mjs` | Verifies the product feature contract against compiled components, nets and evidence, enforces tscircuit's standard USB-C connector model, and checks permitted assembly layers. |
| `check-decoupling.mjs` | Measures placed/routed bypass connections against local distance and length limits. |
| `check-delivery.mjs` | Verifies required release files, root/release manifest identity, recursive SHA-256 hashes, archive readability and source/release consistency. |
| `check-firmware.mjs` | Builds and runs the host-side safety-state/TMC configuration tests. |
| `check-import-previews.mjs` | Executes every imported TSX as a standalone viewer entrypoint and requires both PCB and schematic component output without component-creation failures. |
| `check-kicad-drc.mjs` | Fails on any final KiCad PCB DRC violation, unconnected item, schematic-parity issue or nested schematic ERC violation. |
| `check-local-copper.mjs` | Checks manually constrained local copper and critical short routing. |
| `critical_copper.py` | Reads Kelvin/analog-return paths from compiled source. `keepouts` reserves their top-layer pours, `dsn --dsn INPUT` protects them from new router branches and replaces completed branch destinations/copper with obstacles in the disposable DSN. Optional `--fixed-board SEED` fixes source copper while allowing the remaining incomplete route to move. `check` proves final native copper remains intact and joins other same-net copper only at the designated receiving terminal. Inputs: critical-path policy, source circuit JSON and native PCB; output: PCB, DSN or hash-bound report. |
| `check-critical-copper.mjs` | Requires passing native Kelvin evidence for every policy path and exact hashes of the final PCB, compiled source, policy and native checker; rejects stale or incomplete reports. |
| `check-native-decoupling.py` | Measures each required IC-to-capacitor connection using final native top-layer tracks and pads; writes hash-bound evidence and rejects missing paths or paths longer than 5 mm. Arguments: board path and output JSON. `check:decoupling --native` validates this evidence during routed review. |
| `circuit-source-hash.mjs` | Hashes every circuit element and metadata field except the CLI filesystem cache key, canonicalizing derived trace lengths to 1e-12 mm across platforms, so regenerated reports cannot invalidate unchanged native circuit evidence. Shared by the native checker and its evidence verifier. |
| `test-critical-copper.py` | Native KiCad regressions: accept a load connection at the shunt terminal; reject missing sense copper, a same-net spur, a connection at the far edge of the IC land, or a plane via before that terminal; check that DSN reservations leave other destinations intact. |
| `check-netlist.mjs` | Validates source connectivity and required nets. |
| `power-audit.mjs` | Reads compiled connectivity, fitted values and firmware to screen operating limits, supply isolation, forbidden IMON bypass capacitors, protection tolerances and power losses; writes hash-bound calculations while retaining hardware qualification holds. |
| `power-audit.test.mjs` | Rejects merged/missing supply nets, non-numeric inductance and IMON bypass capacitors including renamed references/net aliases; regresses operating-limit and tolerance calculations. |
| `check-power-routing.mjs` | Audits final KiCad power corridors, clearances, layers, via counts and analytical current screen. |
| `release-gates.test.mjs` | Proves held designs remain reviewable but not orderable, and both modes reject failed or stale evidence. |
| `check-release.mjs` | Checks engineering evidence and unchanged inputs; default mode enforces the order hold. `--review` permits a verified review package with explicit hold reasons while never permitting failed CAD checks. |
| `check-schematic-style.mjs` | Runs the same placement/style analyzer used by the tscircuit schematic viewer, records per-sheet evidence and fails unless the issue count is zero. |
| `check-routing-fingerprint.mjs` | Guards saved routing against unreviewed topology, footprint, placement, source copper, routing-policy or seed-generator changes. |
| `check-script-catalog.mjs` | Ensures this catalog mentions every `.mjs` and `.py` script. |
| `check-stock.mjs` | Refreshes exact JLCSearch code, package and stock evidence for the fitted BOM; missing package expectations fail closed. |
| `check-source-schematic.mjs` | Audits all fixed-size schematic sheets, functional annotations, source-net fanout, the separate USB-C PD POWER and DATA paths, capacitor and test-point connectivity, and the exact intentional no-connect set. |
| `check-toolchain.mjs` | Verifies the pinned Bun runtime, exact dependency versions and installed tscircuit toolchain. |
| `clean-silkscreen.py` | Removes dense passive references and applies reviewed markings. Optional `--clip-passive-outlines` trims R/C outline fragments away from solder lands and adjacent markings while retaining references and polarity marks; native DRC remains mandatory. |
| `design.test.mjs` | Regression tests electrical topology, fixed parts and safety behavior. |
| `export-assembly.mjs` | Generates JLC-compatible BOM/CPL and the assembly review data. |
| `export-routing-interchange.py` | Exports a routing-only copy with unique, world-aligned footprint images while asserting every pad coordinate, layer, angle and net is unchanged; no blanket bottom rotation is needed. |
| `export-kicad-route.mjs` | Exports the current Circuit JSON to a fresh KiCad PCB/project and hierarchical schematics for external routing. |
| `export-manufacturing.mjs` | Uses KiCad CLI to export Gerbers, drills, positions, PCB DRC, schematic ERC, top/bottom renders and the manufacturing ZIP. |
| `export-previews.mjs` | Renders top PCB and all functional schematic sheets. |
| `export-release.mjs` | Regenerates the GLB from the final routed circuit, requires a fresh valid output, then builds the release, synchronized delivery manifests, sourcing tables and hashes. |
| `export-silkscreen-evidence.py` | Records every visible final KiCad top/bottom silkscreen label and its physical text size. |
| `generate-firmware-pins.mjs` | Generates the STM32 pin header from the hardware pin contract or checks it for drift. |
| `generate-cloud-viewer.mjs` | Combines the verified source schematic/3D model with routed KiCad traces, vias and pours for deterministic hosted PCB viewing. Omits only the CLI's filesystem cache key, which includes generated release/report files; source and copper provenance remain enforced by SHA-256 inputs, routing fingerprint and delivery hashes. |
| `generate-mounting-template.mjs` | Generates the 100%-scale SVG/PNG mounting template from the hardware contract and hash-locked STEP perimeter evidence, then detects stale copies. |
| `generate-routing-report.py` | Generates route counts and completion state from the final KiCad board, DRC JSON and manufacturing report. |
| `import-routing-copper.py` | Imports SES copper from the normalized routing copy, rejects placement changes, and preserves the original board footprints; `--restore-critical-branches` restores source Kelvin branches reserved as DSN obstacles and rejects premature joins before saving. Native DRC remains mandatory. |
| `import-routed-kicad.mjs` | Imports externally routed KiCad copper into reviewable Circuit JSON artifacts. |
| `import-specctra-route.py` | Imports a Freerouting Specctra SES result into its matching KiCad PCB, reverses the temporary bottom-placement routing compensation, and records connectivity counts. |
| `make-power-only-dsn.py` | Produces a power-focused Specctra routing input for controlled routing work. |
| `normalize-kicad-parity.mjs` | Reconciles a routed KiCad board with a fresh source export, fails closed on reference, footprint, net and pin drift, and publishes output only after all-severity PCB DRC, schematic parity and native schematic ERC pass. |
| `normalize-generated-svgs.mjs` | Removes generator-only trailing whitespace so previews remain deterministic in review. |
| `prepare-plane-escapes.py` | Adds short 0.20 mm ground/board-supply escapes to 0.60/0.30 mm vias before internal-plane routing. Preserves Kelvin isolation and leaves inaccessible pads in the router netlist; native DRC and filled-plane connectivity remain mandatory. |
| `test-plane-escapes.py` | Native connectivity regression: existing capacitor-return vias and plated connector pads must not receive redundant plane fanouts; isolated SMD lands still need an escape. |
| `prepare-routing-seed.py` | Adds the exact 40 drain-pad thermal vias, capacitor ground returns, and the pad-relative driver/supply escapes and common MOSFET pin links from `routing/pin-escapes.json` to a fresh export. Rejects altered pin identities and Kelvin shortcuts; native DRC and plane connectivity remain mandatory. |
| `prepare-routing-rules.py` | Applies 0.15 mm signal / 0.50 mm power escape rules and power via selection to the world-aligned routing export, without changing placement. Final power paths require corridor reinforcement and native DRC. |
| `power-copper-geometry.mjs` | Measures routed length inside same-net/same-layer nominal corridor outlines without depending on trace segmentation; identifies ties within actual MOSFET drain-pad locations. Does not certify clipped-fill ampacity. |
| `power-copper-geometry.test.mjs` | Regressions for split traces, overlapping or unrelated pours and false thermal-tie classification. |
| `prepare-r03-dsn.py` | Applies r0.3 routing classes and compensates the KiCad/Specctra bottom-footprint rotation convention before autorouting. |
| `reinforce-power-copper.py` | Adds clearance-aware power corridors and parallel transfer vias to the final KiCad route. |
| `refresh-routed-preview.mjs` | Builds the latest source, checks local route continuity and the saved PCB fingerprint/DRC, refreshes the routed viewer without changing schematic records, and updates only its delivery hashes. Does not approve a new manufacturing release. |
| `remove-isolated-zones.py` | Removes generated copper islands that do not connect to the intended net. |
| `sync-generated-docs.mjs` | Synchronizes generated manifest and pin/placement documentation. |
| `verify.mjs` | Runs independent checks, preserves logs and writes root Markdown plus machine-readable verification summaries. |
| `via-net-identity.test.mjs` | Verifies the exact final KiCad drain-pad thermal-via count, dimensions, layers and net identity for every CSD19534Q5A, and enforces the user-required 0.30 mm minimum via drill in the native board, compiled source and KiCad rules. |

The Python routing helpers are board-specific. Do not reuse their geometry on another board. The check patterns, failure behavior and documentation structure are reusable.

### Filled-copper investigation

- `export-filled-power-copper.py`: accepts `<board> <output.json>`. native KiCad/wx export of actual filled polygons, pads, tracks and plated transitions for critical power nets. Preserve the board SHA-256 in the output. Use KiCad's Python runtime after filling and passing DRC.
- `screen-filled-power-copper.py`: accepts `<copper.json> <NET> <grid_mm> <REF:pins> <REF:pins>`. offline DC sheet-conductance estimate, printed as JSON. Requires NumPy 2.0.2, SciPy 1.13.1 and Shapely 2.0.7 in an isolated environment. Run at two mesh sizes; native DRC remains authoritative for connectivity. The 35 µm copper, 20 µm barrel plating and evenly spaced four-layer model are assumptions. This is an exploratory resistance comparison, not a thermal/current-rating or order gate.

- `test-filled-power-copper.py`: analytic rectangular-sheet convergence and single-barrel identity checks for the optional offline screen. Run with the same isolated scientific Python environment.

- `check-usb-reference.py`: native filled-copper check of all four USB bottom-layer trunks, excluding only 0.45 mm signal-via antipads; requires local ground stitching within 2 mm. Arguments: board path and output report. Writes hash-bound geometric evidence, not USB electrical-compliance certification.
- `check-usb-reference.mjs`: rejects missing, failed or stale native USB reference-plane evidence during portable CI/review.
