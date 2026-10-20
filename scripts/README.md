# Script catalog

Every executable script is listed here so a reviewer can understand the release pipeline without reverse-engineering the repository. `bun run check:script-catalog` fails when a script is added without documentation.

| Script | Purpose |
|---|---|
| `add-board-planes.py` | Adds board-outline-conformal GND and V3V3 planes to the routed four-layer PCB. |
| `build-firmware.mjs` | Builds and packages the pinned STM32 ARM commissioning image; --check proves source/artifact hashes match and motion remains locked. |
| `check-operating-mode.mjs` | Verifies internal SPI-ramp mode, grounded unused U7 inputs, the local button and removal of external command interfaces. |
| `check-alternatives.mjs` | Rechecks reviewed LCSC alternative parts, their pinned live package names and intended package compatibility, then writes availability evidence. |
| `check-assembly.mjs` | Enforces exact supplier identities, stock evidence, encoder position and permitted top/bottom placement. |
| `check-board-standards.mjs` | Applies `board-standards.json` to geometry, vias, markings, sheets, DRC and assembly outputs, including paste-free bare probe pads. |
| `check-cloud-package.mjs` | Guards the source entrypoint, visibility of every TSX/import and both explicit CI build targets; `--built` verifies the selected hosted output exists and matches the complete routed JSON; enforces a compact upload, rejects oversized loose GitHub-import files and prevents runtime `@tsci/*` dependencies that are not locally pinned under `imports/`. |
| `check-cloud-viewer.mjs` | Regenerates the hosted viewer artifact in memory and proves it preserves the exact mechanical parts manifest, source schematic/3D model, verified KiCad copper counts and a named source net for every route, via and pour. |
| `cloud-viewer-net-names.test.mjs` | Regresses KiCad 10 named branch routes without pad endpoints, via/pour net remapping, unchanged schematic/route geometry and rejection of missing, unknown or conflicting net identities. |
| `check-feature-parity.mjs` | Reports component/net presence separately from open reference-board functions in `engineering/reference-comparison.json`; never treats a presence pass as complete parity. Verifies the product feature contract against compiled components, nets and evidence, enforces tscircuit's standard USB-C connector model, and checks permitted assembly layers. |
| `check-decoupling.mjs` | Measures placed/routed bypass connections against local distance and length limits. |
| `check-delivery.mjs` | Verifies required release files, current-source BOM/CPL, root/release manifest identity, recursive SHA-256 hashes, archive readability and source/release consistency. |
| `check-firmware.mjs` | Builds and runs safety-state/TMC tests plus target power/suspend and indicator reset, alarm, brownout and I2C-failure regressions. |
| `check-import-previews.mjs` | Executes every imported TSX as a standalone viewer entrypoint and requires both PCB and schematic component output without component-creation failures. |
| `check-kicad-drc.mjs` | Fails on any final KiCad PCB DRC violation, unconnected item, schematic-parity issue or nested schematic ERC violation. |
| `check-local-copper.mjs` | Checks manually constrained local copper and critical short routing. |
| `critical_copper.py` | Reads Kelvin/analog-return paths from compiled source. `keepouts` reserves their top-layer pours, `dsn --dsn INPUT` protects them from new router branches and replaces completed branch destinations/copper with obstacles in the disposable DSN. Optional `--fixed-board SEED` fixes source copper while allowing the remaining incomplete route to move. `check` proves final native copper remains intact and joins other same-net copper only at the designated receiving terminal. Inputs: critical-path policy, source circuit JSON and native PCB; output: PCB, DSN or hash-bound report. |
| `check-critical-copper.mjs` | Requires passing native Kelvin evidence for every policy path and exact hashes of the final PCB, compiled source, policy and native checker; rejects stale or incomplete reports. |
| `check-native-decoupling.py` | Measures each required IC-to-capacitor connection using final native tracks and pads on the common IC/capacitor outer layer; writes hash-bound evidence and rejects missing paths or IC bypass paths longer than 5 mm. Separately checks the top-layer BZ1/C96 bulk branch against its 7 mm body-clearance budget. Arguments: board path and output JSON. `check:decoupling --native` validates this evidence during routed review. |
| `circuit-source-hash.mjs` | Hashes every circuit element and metadata field except the CLI filesystem cache key, canonicalizing derived trace lengths to 1e-12 mm across platforms, so regenerated reports cannot invalidate unchanged native circuit evidence. Shared by the native checker and its evidence verifier. |
| `test-critical-copper.py` | Native KiCad regressions: accept a load connection at the shunt terminal; reject missing sense copper, a same-net spur, a connection at the far edge of the IC land, or a plane via before that terminal; check that DSN reservations leave other destinations intact. |
| `check-netlist.mjs` | Validates source connectivity and required nets. |
| `power-audit.mjs` | Reads compiled connectivity, fitted values and firmware to screen operating limits, supply isolation, forbidden IMON bypass capacitors, protection tolerances and power losses; writes hash-bound calculations while retaining hardware qualification holds. |
| `simulate-power-eco.py` (`--check` validates committed source/model/audit-parameter/deck hashes without ngspice) | Runs current-source behavioral ngspice winding/regen and 1x versus 2x input-limit screens at two timesteps; emits decks and results in engineering/power-eco-simulation. Requires ngspice shared library; optional --csv-dir preserves raw waveforms outside the release. Includes explicit unsafe load/fault cases and never qualifies hardware. |
| `power-audit.test.mjs` | Rejects merged/missing supply nets, non-numeric inductance and IMON bypass capacitors including renamed references/net aliases; regresses operating-limit and tolerance calculations. |
| `check-power-routing.mjs` | Audits final KiCad power corridors, clearances, layers, via counts and analytical current screen. |
| `release-gates.test.mjs` | Proves held designs remain reviewable but not orderable, and both modes reject failed or stale evidence. |
| `check-release.mjs` | Checks engineering evidence and unchanged inputs; default mode enforces the order hold. `--review` permits a verified review package with explicit hold reasons while never permitting failed CAD checks. |
| `check-schematic-style.mjs` | Runs the same placement/style analyzer used by the tscircuit schematic viewer, records per-sheet evidence and fails unless the issue count is zero. |
| `check-routing-fingerprint.mjs` | Guards saved routing against unreviewed topology, footprint, placement, source copper, routing-policy or seed-generator changes. |
| `check-script-catalog.mjs` | Ensures this catalog mentions every `.mjs` and `.py` script. |
| `check-stock.mjs` | Queries numeric JLCSearch identities and independently checks official JLC available-order quantities for the fitted BOM; index errors are recorded and cannot skip the official lookup. Missing official evidence or package expectations fail closed. |
| `check-source-schematic.mjs` | Audits all retained default A4 schematic sheets, functional annotations, source-net fanout, the separate USB-C PD POWER and DATA paths, capacitor and test-point connectivity, and the exact intentional no-connect set. |
| `check-toolchain.mjs` | Verifies the pinned Bun runtime, exact dependency versions and installed tscircuit toolchain. |
| `clean-silkscreen.py` | Preserves native component references and their size. Optional `--clip-passive-outlines` trims R/C outline fragments away from solder lands and adjacent markings; native DRC remains mandatory. |
| `design.test.mjs` | Regression tests electrical topology, fixed parts and safety behavior. |
| `export-assembly.mjs` | Generates JLC-compatible BOM/CPL using stable source values/packages and exact LCSC identities independently of transient stock responses; `--check <directory>` rejects stale manufacturing or release assembly data. |
| `export-routing-interchange.py` | Exports a routing-only copy with unique, world-aligned footprint images while asserting every pad coordinate, layer, angle and net is unchanged; no blanket bottom rotation is needed. |
| `export-kicad-route.mjs` | Exports the current Circuit JSON to a fresh KiCad PCB/project and hierarchical schematics for external routing; excludes DNP footprints and bare probe contacts from the paste stencil, and preserves U16 exposed-pad paste reduction from the source aperture. |
| `export-manufacturing.mjs` | Refreshes BOM/CPL, then uses KiCad CLI to export Gerbers, drills, positions, PCB DRC, schematic ERC, top/bottom renders and the manufacturing ZIP. Explicit `--review-silkscreen` retains the exact known label findings for a held review package; normal exports remain strict. |
| `export-previews.mjs` | Renders top PCB and all functional schematic sheets. |
| `export-release.mjs` | Rejects stale manufacturing BOM/CPL, includes sourcing and manufacturing acceptance/readiness documents, checks the hosted package size, regenerates routed-board and motor assembly GLBs, checks geometry/axis alignment, then builds synchronized release manifests, sourcing tables and hashes. |
| `export-silkscreen-evidence.py` | Records every visible final KiCad top/bottom silkscreen label and its physical text size. |
| `generate-firmware-pins.mjs` | Generates the STM32 pin header from the hardware pin contract or checks it for drift. |
| `generate-cloud-viewer.mjs` | Verifies that the motor assembly preserves every source board record, then combines its board/motor CAD with routed KiCad traces, vias and pours for deterministic hosted PCB viewing. Removes floating-point recentering noise at KiCad's nanometre coordinate precision and omits the CLI's filesystem cache key, which includes generated release/report files; source and copper provenance remain enforced by SHA-256 inputs, routing fingerprint and delivery hashes. |
| `generate-motor-assembly.mjs` | Converts the hash-locked motor STEP and connected J2 harness into individual GLBs. Existing PCB holes are retained; unsupported mounting hardware is not generated. |
| `check-motor-assembly.mjs` | Checks complete J2 CAD-body containment and adjacent-component clearance; verifies unchanged hole alignment/drills, CAD height axis and exported assembly orientation; rejects removed mounting hardware returning to the active model. Accepts board GLB and optional assembly GLB paths. Writes docs/motor-assembly-check.json; does not certify physical/magnetic fit. |
| `generate-mounting-template.mjs` | Generates the 100%-scale SVG/PNG mounting template from the hardware contract and hash-locked STEP perimeter evidence, then detects stale copies. |
| `generate-routing-report.py` | Generates route counts and completion state from the final KiCad board, DRC JSON and manufacturing report. |
| `import-routing-copper.py` | Imports SES copper from the normalized routing copy, rejects placement changes, and preserves the original board footprints; `--restore-critical-branches` restores source Kelvin branches reserved as DSN obstacles and rejects premature joins before saving. Native DRC remains mandatory. |
| `import-routed-kicad.mjs` | Imports externally routed KiCad copper into reviewable Circuit JSON artifacts. |
| `import-specctra-route.py` | Imports a Freerouting Specctra SES result into its matching KiCad PCB, reverses the temporary bottom-placement routing compensation, and records connectivity counts. |
| `make-power-only-dsn.py` | Produces a power-focused Specctra routing input for controlled routing work. |
| `normalize-kicad-parity.mjs` | Reconciles a routed KiCad board with a fresh source export, fails closed on reference, footprint, net and pin drift, synchronizes DNP/BOM flags, and normally publishes output only after all-severity PCB DRC, schematic parity and native schematic ERC pass. Explicit `--review-silkscreen` permits only the exact retained native-reference label findings in review-only output; it does not pass DRC or release gates. |
| `normalize-generated-svgs.mjs` | Removes generator-only trailing whitespace so previews remain deterministic in review. |
| `prepare-plane-escapes.py` | Adds short 0.20 mm ground/board-supply escapes to 0.60/0.30 mm vias before internal-plane routing. Preserves Kelvin isolation and leaves inaccessible pads in the router netlist; native DRC and filled-plane connectivity remain mandatory. |
| `test-plane-escapes.py` | Native connectivity regression: existing capacitor-return vias and plated connector pads must not receive redundant plane fanouts; isolated SMD lands still need an escape. |
| `prepare-routing-seed.py` | Adds the exact 40 drain-pad thermal vias, capacitor ground returns, and the pad-relative driver/supply escapes and common MOSFET pin links from `routing/pin-escapes.json` to a fresh export. Rejects altered pin identities and Kelvin shortcuts; native DRC and plane connectivity remain mandatory. |
| `routing-rules.test.mjs` | Regresses DSN token-aware wrapping, including long quoted NC names and spaces; splitting a quoted name can make a router omit all existing wiring. |
| `prepare-routing-rules.py` | Applies 0.15 mm signal / 0.50 mm power escape rules and power via selection to the world-aligned routing export, without changing placement. Final power paths require corridor reinforcement and native DRC. |
| `power-copper-geometry.mjs` | Measures routed length inside same-net/same-layer nominal corridor outlines without depending on trace segmentation; identifies ties within actual MOSFET drain-pad locations. Does not certify clipped-fill ampacity. |
| `power-copper-geometry.test.mjs` | Regressions for split traces, overlapping or unrelated pours and false thermal-tie classification. |
| `prepare-r03-dsn.py` | Applies r0.3 routing classes and compensates the KiCad/Specctra bottom-footprint rotation convention before autorouting. |
| `reinforce-power-copper.py` | Adds clearance-aware power corridors and parallel transfer vias to the final KiCad route. |
| `refresh-routed-preview.mjs` | Builds the latest source, checks local route continuity and the saved PCB fingerprint/DRC, refreshes the routed viewer without changing schematic records, and updates only its delivery hashes. Does not approve a new manufacturing release. |
| `remove-isolated-zones.py` | Removes generated copper islands that do not connect to the intended net. |
| `sync-generated-docs.mjs` | Synchronizes generated manifest and pin/placement documentation. |
| `verify.mjs` | Fails on any generated source error or warning, hashes source imports and schematic-page definitions, runs independent checks, preserves logs and writes root Markdown plus machine-readable verification summaries. |
| `via-net-identity.test.mjs` | Verifies the exact final KiCad drain-pad thermal-via count, dimensions, layers and net identity for every CSD19534Q5A, and enforces the user-required 0.30 mm minimum via drill in the native board, compiled source and KiCad rules. |

The Python routing helpers are board-specific. Do not reuse their geometry on another board. The check patterns, failure behavior and documentation structure are reusable.

### Filtered cloud publication

- `cloud-package.mjs`: selects required source files from an immutable Git tree, enforces upload limits and hashes, and creates a single transactional gzip archive; retains every editable import and the complete routed/assembly viewer.
- `cloud-package.test.mjs`: rejects excluded/missing inputs, unwanted documentation/secrets, incomplete remote inventories and uncommitted source leakage.
- `prepare-cloud-package.mjs`: materializes the immutable input and archive under ignored `build/cloud-package/<commit>`.
- `check-cloud-build.mjs`: checks every staged source hash and compares the complete built routed JSON with the committed viewer, alongside library and site outputs.
- `publish-cloud-package.mjs`: publishes that archive to the existing NEMA34 package, checks remote source hashes and hosted outputs, and permits explicit latest promotion only for current remote main. Requires `TSCIRCUIT_TOKEN`; never logs the credential.

See [cloud publishing](../docs/cloud-publishing.md) for the supported commands and the distinction from the unfiltered automatic GitHub importer.

### Filled-copper investigation

- `export-filled-power-copper.py`: accepts `<board> <output.json>`. native KiCad/wx export of actual filled polygons, pads, tracks and plated transitions for critical power nets. Preserve the board SHA-256 in the output. Use KiCad's Python runtime after filling and passing DRC.
- `screen-filled-power-copper.py`: accepts `<copper.json> <NET> <grid_mm> <REF:pins> <REF:pins>`. offline DC sheet-conductance estimate, printed as JSON. Requires NumPy 2.0.2, SciPy 1.13.1 and Shapely 2.0.7 in an isolated environment. Run at two mesh sizes; native DRC remains authoritative for connectivity. The 35 µm copper, 20 µm barrel plating and evenly spaced four-layer model are assumptions. This is an exploratory resistance comparison, not a thermal/current-rating or order gate.

- `test-filled-power-copper.py`: analytic rectangular-sheet convergence and single-barrel identity checks for the optional offline screen. Run with the same isolated scientific Python environment.

- `check-usb-reference.py`: native filled-copper check of all four USB bottom-layer trunks, excluding only 0.45 mm signal-via antipads; requires local ground stitching within 2 mm. Arguments: board path and output report. Writes hash-bound geometric evidence, not USB electrical-compliance certification.
- `check-usb-reference.mjs`: rejects missing, failed or stale native USB reference-plane evidence during portable CI/review.

- `motor-mounting-geometry.mjs`: extracts rear cylindrical axes from the pinned motor STEP, checks PCB-hole alignment, parses metric Excellon drills and measures physical substrate apertures. Used by the assembly check.
- `motor-mounting-geometry.test.mjs`: rejects mirrored axes, missing/duplicate/incorrect manufacturing drills, and capped or displaced 3D holes; checks the contract against the manufacturer STEP. Run with `bun test scripts/motor-mounting-geometry.test.mjs`.

- `assembly-policy.mjs`: shared fitted/DNP placement policy; requires bare service pads to be top-side and unpopulated, permits only U18 as an unpopulated bottom footprint, with C52/C53 required on top, and requires shaft-axis centering.
- `assembly-policy.test.mjs`: rejects populated bottom encoders, off-axis sensors, unapproved DNP parts and optional parts leaking into the fitted BOM.

- `assembly-glb.mjs`: shared indexed mesh encoder and strict GLB reader; accessor bounds use the encoded float32 vertices so runtime rounding cannot change metadata for identical meshes.
- `assembly-glb.test.mjs`: checks bounds against encoded vertices, distinguishes floating-point noise from actual geometry changes, and compares cable paths/GLB hashes across Bun and Node.
- `verify-programming.mjs`: compares complete operator-supplied U3/U16 memory dumps against the registered TI full-flash image or current STM32 commissioning archive. Requires device serial, operator and programmer identity; saves a new JSON file without overwriting evidence. Rejects absent/unregistered TI images, stale STM32 sources, incomplete dumps and byte mismatches. Does not operate a programmer, validate the provenance of a dump or authorize shipment.
- `verify-programming.test.mjs`: covers corrupted end bytes, displaced/truncated dumps, image hash/size, erased images, missing/low-region TI exports and stale STM32 source identities.
- `harness-geometry.mjs`: swept wire meshes, Bezier cable paths and exact segment-to-box clearance including insulation radius, and 1e-9 mm canonical JSON metadata across CPU/libm platforms.
- `harness-geometry.test.mjs`: regressions for crossings between sampled points, insulation clearance and finite endpoint-preserving wire meshes.
- `generate-harness-assembly.mjs`: creates the J2 motor mate, factory jacket, verified-length splices and pigtails, plus the J3 brake assembly from catalogue dimensions and compiled cavity positions; `--check` rejects stale generated geometry. No electrical PCB records are added.
- `check-harness-assembly.mjs`: regenerates and verifies harness geometry, screens mated bodies/cable segments against component, motor-body, remaining component and motor-body envelopes, checks cavity alignment, and writes hash-bound `docs/harness-assembly-check.json`. Runs during release export; no physical/crimp/strain-relief qualification is implied.

- `apply-interface-cleanup.py`: removes the explicit 32-component/31-net interface set from a staging native PCB, leaving surviving placement and shared circuits intact. Fresh native DRC/ERC required.
- `prune-interface-stubs.py`: iteratively removes only DRC-identified dangling GND/V3V3/VMOTOR stubs on a staging PCB; `--allow-net NAME` permits an explicitly reviewed additional net (SD_MODE branches after U8/U9 removal in this ECO). Never waives findings.
- `check-interface-eco.py`: compares original/modified native component placement, values, pad geometry and approved NC changes; writes an auditable JSON report.
- `check-cable-support.mjs`: checks that the withdrawn adapter-mounted clamp/support is absent and that physical retention remains explicitly unverified.
- `finish-interface-copper.py`: restores C41 ground with a 0.60/0.30 mm via and trims the identified B.Cu sliver after interface-stub deletion; staging only, fresh native checks mandatory.

| `check-mechanical-assets.mjs` | Verifies all runtime model URLs use one immutable Git revision and local bytes match the part manifest; `--remote` also fetches and hash-checks every published asset. |

- `check-onboard-eco.py`: compares baseline, final and fresh-export native PCBs for the onboard START/STOP ECO. Checks the exact 34 removals/two additions, all retained pad geometry/net changes and four independently identified mounting holes. Fresh DRC/ERC/parity remains mandatory.

- `check-power-eco.py` — arguments: `BEFORE AFTER FRESH_EXPORT REPORT`: proves the power ECO changes only U6/R25/R66 values, U30 AIN2, two probe locations and the five declared additions; compares new geometry with source and preserves the four holes. Requires KiCad Python.

- `check-brake-sense.py` — arguments: `BOARD REPORT`: destructive negative test on a temporary copy only. Removes thin BRAKE_RETURN copper and requires native DRC to disconnect only R134.1; binds a low-current-branch exception to exact board/checker hashes for the power-corridor audit. Requires KiCad Python and CLI.

PR #2 extends `simulate-power-eco.py` with brake-recovery, restricted rotor/winding and input-step cases plus winding energy balance. `check-delivery.mjs` verifies source external-equipment guidance and actual native DRC counts against delivered copies; `check-stock.mjs` distinguishes unknown inventory from insufficient known inventory.

- `check-protection-refinement.mjs`: checks the narrow unused-SBU ECO against the native-reference baseline, preserving every unrelated PCB object. Records geometry evidence; cannot waive DRC/ERC, sourcing or hardware checks.

- `jlc-stock.mjs`: records the mandatory numeric JLCSearch result separately from authoritative official JLCPCB inventory; verifies the exact code and uses the lesser of warehouse stock and available order quantity. Unknown quantities fail closed; retains only relevant evidence fields.
- `jlc-stock.test.mjs`: rejects fuzzy/missing identities, null/negative/string quantities and reserved stock being counted as available order quantity; records absent/fuzzy/exact index results, reproduces index outages and rejects cached availability when official evidence is absent.

- `native-eco-policy.mjs`, `native-eco-policy.test.mjs`: parse and protect the unchanged native board around the six-pad SBU correction and the exact reviewed U17/J1/J10 sourcing names; reject unrelated copper, hole, net, pad or text geometry changes. The U16/U35/C95 footprinter substitution restores the exact prior footprint for baseline comparison only after checking the complete replacement hash; any later pad, net, text or placement drift is rejected.
- `check-placement.mjs`, `placement-review.mjs`, `placement-review.test.mjs`: retain raw placement advice and enforce only the three documented, native-route-reviewed cases. Unit tests use the committed CLI fixture `fixtures/placement-reviewed.txt` (recorded on 2026-10-13 from PR #3 at `3a48c34`), resolved relative to the test module; they require neither generated logs nor a particular working directory. CI runs this regression before the stock-dependent review. The live placement check still generates and validates current output, independently of the fixture.

- `pd-image-policy.mjs`, `check-pd-image.mjs`, `pd-image-policy.test.mjs`: validate genuine TI full-flash export identity, sink/GPIO policy and both configuration regions; reject import resets or corrupted output.
- `check-pcb-references.mjs`: checks every electrical component reference in compiled source, native PCB and the default routed PCB/3D viewer. Rejects hidden, absent, detached or stale names, and screens rotated reference envelopes against the full board outline. Native edge anchors may move per the user's edge-clearance exception; native DRC still checks stroke clearance. Runs within `check:cloud-viewer`.
- `sync-pcb-references.py`: copies compiled native footprint references into the KiCad Reference fields, removes obsolete detached captions, and rejects any change outside those label fields. Arguments: board path and optional `--source` Circuit JSON.

- `silkscreen-review.mjs`, `silkscreen-review.test.mjs`: permit an explicit `--review-silkscreen` normalization/manufacturing export only when the exact retained native-reference finding identities match the reviewed baseline (401 after the encoder-capacitor move removed four findings without adding any). Preserve every raw finding and fail fabrication/review gates; reject electrical/parity faults or changed findings.

- `check-inventory.mjs`: validates timestamped exact stock/package evidence. Default is a strict procurement gate; `--review` permits recorded insufficient quantities only, never unknown/mismatched parts. `check-stock.mjs`, `check-alternatives.mjs` and `check-assembly.mjs` support the same explicit review mode.

- `check-copper-evidence.mjs`: checks six motor paths and the 18-path before/after motor/supply/shunt/brake comparison against the PCB and solver hashes; requires finer meshes where needed and guards resistance regressions. Does not qualify temperature or current rating.
- `copper-evidence.test.mjs`: rejects stale/mixed board hashes, missing paths/meshes, unconverged results and resistance regressions.

- `splice-model.mjs`, `splice-model.test.mjs`: import the official TE 320559 STEP from the archived manufacturer evidence, verify STEP/drawing hashes, axial origin and nominal dimensions, and translate its unscaled mesh into each J2 splice position. Regresses wrong dimensions, source corruption, mirrored placement and the four generated CAD parts. Nominal CAD does not qualify finished crimps.

Harness intermediate part data is deterministically stored in `engineering/mechanical/harness-parts.zip` to keep duplicate base64 geometry out of the raw GitHub import payload. `generate-motor-assembly.mjs` reads it with ZIP CRC checking; exported GLBs keep their original mesh resolution.

- `check-usb-access.mjs`: measures both USB mating faces from native shell-stake lands and the GCT drawing; checks source placement, PCB edge and nominal motor/plug envelope without claiming physical fit.
- `usb-access.test.mjs`: rejects old recessed native USB placement, incorrect source orientation and an intersecting nominal motor/plug envelope; keeps physical-fit qualification false.

- `brake-assembly.mjs`, `brake-assembly.test.mjs`: hash-check the official Vishay STEP, generate the J3 mate/contact/cable/ring installation with explicitly provisional cooling/guard, and verify complete pin mapping, conductor endpoints and open M4 ring holes. No physical or thermal qualification is implied.
- `encoder-bypass-policy.mjs`, `encoder-bypass-policy.test.mjs`: permit only the U18.11/C52.1 bottom-to-top path through its exact single 0.60/0.30 mm via; count the 1.6 mm barrel in the 5 mm budget and reject missing/extra/undersize/displaced vias. Native copper is independently measured by `check-native-decoupling.py`.

The combined harness GLB is retained inside `harness-proposal.zip` to keep the raw GitHub import below its unchanged 24 MiB limit. Historical label screenshots are preserved byte-for-byte in `previews/native-labels-history.zip`.

- `render-local-mechanical.mjs`: renders disposable copies of the exact source/routed JSON using hash-verified local mechanical GLBs in place of their registered immutable Git URLs. Rejects missing, duplicate or changed models; preserves published JSON and enables pre-publication validation. Release export still compares every final mesh vertex to the registered CAD. Remote URL/hash verification remains a separate post-push check.

- `refine-copper-geometry.py`: reproduces the 2026-10-20 copper-only ECO from hash-locked main 8139bca. Repairs U16 pad entry, Q5/U12 redundant corner contacts and the source-matched Kelvin-B bend; regenerates its pour keepout, consolidates/chamfers power zones and enables 0.09 mm connection/groove constraints. Requires fresh native DRC, Kelvin isolation and filled-copper screens before export.
- `copper-geometry-policy.mjs`, `copper-geometry-policy.test.mjs`, `check-copper-geometry.mjs`: fail review when connection-width checking is disabled/suppressed, power zones lack the required clearance/fill/chamfer settings, legacy per-segment corridors return, or native copper findings remain. Existing exact cosmetic disposition stays separate.
