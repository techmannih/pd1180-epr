# PCB design and release rules

This file is the first design instruction for any AI or reviewer working in this repository. Read `board-standards.json`, `hardware-contract.json`, `docs/reviewer-checklist.md` and `scripts/README.md` before changing the circuit, placement, routing or release files.

## Rule hierarchy

1. The user's current requirement has priority.
2. Electrical limits and pin mappings come from primary manufacturer data and `hardware-contract.json`.
3. Reusable board defaults come from `board-standards.json`.
4. Project-specific overrides must be recorded with their calculation, source and validation status.

Do not copy voltage, current, thermal, connector, stack-up or motor assumptions from another board. Reuse its review method only. Keep calculated targets, verified CAD facts and measured hardware results clearly separated.

## User-approved schematic freeze

The user approved and pushed the schematic in commit `8a21b01` and explicitly prohibited further schematic changes. Preserve all schematic placement, symbols, labels, values, pin mappings and logical connectivity unless the user explicitly reopens that scope. PCB routing work may change PCB-only properties and routing configuration, but must not change `sch*` properties, schematic graphics or imported symbols. Do not restore older schematic snapshots while refreshing PCB artifacts. Verify the schematic is unchanged against this user-approved source after PCB work.

The user reopened the architecture scope on 2026-10-09: separate PD POWER / USB DATA, consolidate connectors, retain all industrial interfaces, and retain the TMC5160 external bridges. Changes to affected connectivity and schematic sections are authorized. Preserve unrelated approved schematic layout. The r0.3 route is historical until the ECO passes fresh routing and native checks.

On 2026-10-10 the user explicitly reopened the affected driver-supply and brake/OVP sections after the power audit found U7 VSA connected above its 50 V operating limit. Correct those power sections and their PCB implementation; preserve unrelated schematic content. Existing manufacturing files are historical until this power ECO passes fresh checks.

On 2026-10-10 the user also approved removing C19 from TPS26631 IMON, with matching native PCB, BOM and manufacturing updates. Preserve R26 and the IMON ADC connection; unrelated schematic content remains frozen.

On 2026-10-11 the user approved adding all missing reference-board diagnostics: RGB and independent power indication, driven buzzer, PD EEPROM programming isolation/access, and PD/VMOTOR/GND probes. Changes to these circuits, the affected EEPROM nets, firmware and PCB placement/routing are authorized; preserve unrelated schematic content. Existing release files remain historical until this ECO passes fresh review.

On 2026-10-11 the user authorized correcting all 106 reported source warnings: use accurate component types and pin metadata, mark bare service pads as not assembled, and arrange the schematic on default A4 sheets with all elements inside the drawing area. Preserve electrical connectivity, component identities and PCB geometry during this schematic/metadata correction. Source warnings must fail verification rather than silently accompany a passing summary.

On 2026-10-12 the user explicitly reopened affected source/PCB/assembly sections for Seve’s product review: remove unsupported CAN/RS485/RS232, DIN0/1, OUT0/1 and the J7 VMOTOR export; preserve shared safety circuitry and external STEP/DIR/ENABLE/limits pending a real command source. Complete independent J2/mounting corrections. Do not interpret USB motion as implemented or approved. This supersedes the earlier instruction to retain all industrial interfaces. Ordering remains held for sourcing, unresolved external equipment and hardware qualification.

On 2026-10-12 the user then authorized replacing the remaining J7 external command path with onboard motor control and local START/STOP, while retaining RESET, J2 VH, both USB ports and protection. Only affected connectivity/layout may change. The user also explicitly rejected additional unsupported mounting hardware: retain the existing four PCB holes unchanged and remove the long posts, adapter, spacers, nuts/washers and attached support fixture without inventing replacement fasteners. An alignment preview is not a mechanically secured assembly.

On 2026-10-13 the user authorized power/thermal risk corrections, commit and push as techmannih, and using ADI PD-1180 plus other primary references to choose conservative initial conditions. Affected protection and firmware sections are reopened. The existing sourcing/order hold remains in force; this authorization is for a design revision, not procurement or powered qualification. Preserve unrelated circuitry, assembly and the four existing holes.

On 2026-10-13 the user authorized correcting PR #2 after review. Merge the latest main protections, adapt the current guard and audits, retain the proven readable markings, and refresh consistent engineering delivery files. R25/R61/R66 value refinements are within this scope. Missing stock remains an order blocker; it does not authorize inventing inventory or waiving qualification.

On 2026-10-13 the user explicitly requested closure of the remaining U1 unused-SBU wiring, stock/package and placement findings, PD programming preparation, J3 documentation, and system qualification blockers. Affected source, native copper, checks and documentation are reopened. Physical measurements and supplier inventory must still be evidenced; no procurement or invented qualification is authorized. Preserve unrelated circuitry and the four existing PCB holes.

On 2026-10-13 after PR #3 merged, the user requested programming/readback/cold-boot and external-system qualification checklists, sourcing fixes for U17/R64/U35/U16/J1/J10, and manufacturing/mechanical closure. Reviewed compatible substitutions and their affected metadata are authorized. The user explicitly deferred the 404 silkscreen/text findings: leave native labels unchanged and retain raw findings. Do not claim zero DRC or fabricator acceptance. Physical qualification and purchase/consignment remain evidence-dependent; no order or supplier message is authorized.

## Required project structure

On 2026-10-14 the user authorized replacing unavailable U16/U35 with verified JLC-stocked parts, including necessary footprint, reset-domain, local routing, firmware and programming changes, and a direct push to main without a PR after validation. Preserve unrelated schematic/copper and all four holes. This does not qualify physical hardware or reserve inventory.

Every board repository should contain:

- `AGENTS.md`: rules an AI must follow.
- `board-standards.json`: machine-readable fabrication, assembly, marking and release policy.
- `hardware-contract.json`: exact dimensions, interfaces, safety states and electrical targets.
- `index.circuit.tsx`: authoritative code-defined schematic and PCB intent.
- `routing/`: routing policy plus a guarded topology/placement fingerprint.
- `checks/`: pinned review engines and reusable machine-check assets that must stay out of the cloud source package.
- `sourcing/`: exact supplier codes, stock evidence and reviewed alternatives.
- `docs/`: design decisions, reviewer checklist, assembly, bring-up and open validation gates.
- `scripts/README.md`: purpose and inputs/outputs of every script.
- `release/`: versioned manufacturing and review handoff with hashes.
- `.github/workflows/`: the same non-hardware checks used locally.

Keep `board-markings.tsx`, `feature-parity.tsx` and `mounting-template.svg` as short reviewer entry points. The mounting template must be generated from `hardware-contract.json`; never hand-edit its geometry. The root `delivery-manifest.json` must remain byte-identical to the release copy, and `verification.md` is generated by the full verification runner.

The authoritative tscircuit source entrypoint must remain `index.circuit.tsx`. The preview and site selection must open `release/circuit.json` so the default PCB view displays the verified complete route. Run `bun run build:pcb` to refresh that viewer from the latest source; preserve every schematic record exactly. Keep every source TSX and every imported TS/JS/JSX component selectable through `includeBoardFiles`; this setting also filters the viewer's file dropdown. Use `buildCommand` to explicitly build/transpile `index.circuit.tsx`, then build `release/circuit.json` with the static site and preview images. The hosted package resolver requires `dist/release/circuit.json`; a source file at `release/circuit.json` alone is insufficient. Keep imports selectable without compiling each one as a separate CI board. Run `bun run check:cloud-package --built` after the cloud command to verify the routed output is present and identical. Keep `build.routingDisabled: true` for source previews and `build.workerTimeoutMs` at least 3,600,000 milliseconds (60 minutes); the hosting service has a separate overall job deadline.

Keep `tscircuit.config.ts` runtime previews on pinned local parts (`partsEngineDisabled: true`) and disable interactive autorouting. This matches build previews and prevents remote pin-metadata lookups from blocking file switching; live sourcing remains independently checked by `check:stock`. Verify file switching by rendering the selected component in both PCB and schematic views, not only by inspecting the dropdown.

The tscircuit package is pinned independently of the core compatibility override. The 2026-10-14 update uses tscircuit `0.0.2883` with `@tscircuit/core: 0.0.2112`. An isolated full-board test of core `0.0.2150` preserved sheet frames but changed schematic ports/traces/labels/text and reduced generated solder-paste records from 969 to 953. Retain the compatibility override until those output changes are reviewed against the frozen schematic and assembly data. Earlier core `0.0.2125` also removed automatic centres for explicitly sized sheets. Do not move the schematic or rewrite generated coordinates to conceal a dependency regression. Keep the compiled package `main` at `dist/index.js` and the source `mainEntrypoint` at `index.circuit.tsx`.

Keep `release/circuit.json` selectable as the final routed view. Include the mechanical models compiled from `motor-assembly.circuit.tsx` so the default 3D tab shows the ordered motor and retained J2 mating harness in an alignment preview. Require its non-mechanical records to match `index.circuit.tsx` exactly (excluding only CLI cache metadata), then replace preview copper with the exact final KiCad traces, vias and pours. Keep mechanical models out of the PCB/BOM manufacturing source. Generate it with `bun run generate:cloud-viewer`; `bun run check:cloud-viewer` must prove every imported KiCad port maps to the source model and that source/viewer element counts remain synchronized. Keep `.github/**`, `checks/**`, `dist/**`, `build/**`, `__snapshots__/**`, `docs/**`, `engineering/**`, `firmware/**`, `previews/**`, `routing/**`, `scripts/**`, `sourcing/**` and all other `release/` payloads in `tscircuit.config.json` `ignoredFiles`. Preserve the requested engineering and review structure in GitHub, cap the separately measured raw GitHub payload, and package large binary release assets as ZIP archives so the importer does not serialize them as loose files. Runtime source components remain pinned under `imports/`; do not leave `@tsci/*` packages in `dependencies`, because an unavailable or empty registry build makes the online editor fail before rendering. Run `bun run check:cloud-package` after changing upload rules or component dependencies; it also guards source/import visibility.

## Assembly and part sourcing

- The user requested top-only component assembly on 2026-10-09. All fitted components and service pads must be on top. On 2026-10-11 the user adopted the review request for a centered bottom-side optional encoder: U18, C52 and C53 are the only permitted bottom components, all explicitly doNotPlace and omitted from fitted BOM/CPL and paste. Preserve the four-layer copper stack and keep bypass capacitors beside their IC power pins. Encoder magnet gap/orientation need renewed physical validation.
- No fitted components or solder paste belong on the bottom. The CPL and order settings must identify top-side assembly.
- Bare service probe pads must have copper and solder-mask openings, with no solder-paste apertures in the manufacturing export.
- Every fitted part needs an exact JLCPCB/LCSC code, package match and timestamped stock result. A fuzzy search or similar package name is not an acceptable match.
- Before placement, routing, review or release work, query every fitted LCSC code against `https://jlcsearch.tscircuit.com/components/list.json?search=<numeric-id>` with the leading `C` removed (for example, query `492401` for `C492401`). Record its exact-match, missing-index or network-error result; it is a secondary index, not the ordering inventory authority. Independently require the official JLCPCB part-detail response to return the exact requested LCSC code, the expected package, a nonempty manufacturer part number, purchasable status and numeric available-order quantity. Use the lesser of official warehouse stock and available-order quantity; never fall back to indexed stock. An index outage/absence may coexist with verified official identity and stock, but unknown/mismatched official evidence always fails. Zero or insufficient official stock blocks procurement until a reviewed stocked alternative or accepted sourcing path exists; engineering-review handling of known shortages is defined below.
- Never rely on a previous stock snapshot for an order decision. Regenerate `docs/stock-report.json` and the per-part evidence immediately before release; the timestamp is evidence only and does not reserve inventory.
- Record at least one reviewed alternative for parts whose availability or lifecycle can block assembly. Alternatives must match electrical rating, pinout, package, polarity and thermal needs; never substitute automatically.
- Through-hole parts, tall parts, press-fit items, cables, motors, magnets, heatsinks and brake resistors must be listed as assembly or external-system boundaries.
- Never infer mounting coordinates from a screenshot or rounded bounding box. When a manufacturer STEP/drawing exists, record its hash, coordinate transform, exact outline and hole centers in a machine-readable mechanical reference, then check the compiled PCB against those values.

## Fabrication defaults

- Record board size, layer count, thickness, copper weight, finish, mask colour, impedance needs and assembly side in the order settings.
- Default routing via: 0.50 mm pad / 0.30 mm finished drill or larger. The user requires a minimum 0.30 mm finished via drill everywhere, including existing routes and export defaults; no smaller-drill exceptions.
- Default power/thermal via: 0.60 mm pad / 0.30 mm finished drill or larger.
- Maintain at least 0.10 mm annular ring. Prefer 0.15 mm for ordinary routing and power vias.
- Via-in-pad geometry needs an explicit review, exact count, fabricator capability and filled/capped treatment where solder wicking is possible. It must still meet the 0.30 mm minimum drill.
- Use through vias across all copper layers unless the fabrication package explicitly calls for reviewed blind or buried vias.
- Copper-to-edge, hole clearances, trace/space, solder-mask and silkscreen limits must be checked against the selected fabrication service, then encoded in the CAD rules.
- Route changes must pass the routing fingerprint, native checks, final KiCad DRC and power-copper checks. Never copy or edit a fingerprint to make stale routing pass.
- For new Specctra routing, use `export-routing-interchange.py` and `import-routing-copper.py`: preserve actual pad coordinates/layers in a world-aligned routing copy and import copper only. Do not apply the legacy blanket bottom-rotation adjustment to that copy.

## Schematic and electrical review

- Make every schematic readable, with clear labels and no overlapping symbols, wires or text.
- For custom imported symbols, put the short visible pin label first (`G`, `S`, `D`, `B`, `C`, `E`) and retain semantic aliases after it. Size the symbol body and stems so pin names, reference text and net labels cannot overlap.
- Add `<schematictext>` near each chip explaining its function and relevant ratings, such as voltage, current or power. Keep those notes concise and place them where they do not collide with the circuit.
- Model every USB-C receptacle with tscircuit's `<connector standard="usb_c">`; retain the exact reviewed supplier part, physical pad map and footprint when a JLCPCB import supplies the package.
- For a combined USB-C power/data receptacle, connect CC only to the reviewed PD controller path, connect both D+/D− orientation pins to the USB PHY through the reviewed protection/series network, and prove any MCU VBUS-sense divider is safe from default 5 V through the documented EPR/transient review limit.
- When power and data use separate USB-C receptacles, keep their VBUS nets physically and electrically separate. A data-only UFP port needs an independent Rd on each CC pin and a valid VBUS attach/detach sense path before firmware enables the USB peripheral.
- Split the schematic into functional A4 sheets with clear signal direction, rail names, connector pin numbers and short section notes where the circuit is dense.
- Run `bun run check:schematic-style` after every schematic placement or symbol change. It must reproduce the tscircuit viewer's **Run Style Analysis** result with zero issues across every sheet. Fix text/net-label collisions, cramped symbols, component orientation, bypass grouping, gate-network grouping and long visible rail paths in source coordinates; do not hide warnings, remove evidence or suppress an issue type.
- Check supplier pin numbering independently from logical aliases. USB-C, TVS diodes, MOSFETs, shunts, connectors and exposed pads require explicit polarity/pin-map review.
- Every IC rail needs a local bypass path and a bulk-capacitance rationale. Checks should use placed copper distance where practical.
- Calculate regulator limits, divider tolerances, current limits, shunt loss, connector current, transient headroom, regeneration/braking energy and temperature rise. State which numbers are estimates and which are measured.
- Safety-critical outputs must reset inactive. Power negotiation, power-good, voltage window, temperature and fault state must gate the motor stage before firmware can enable it.
- A successful compile, DRC or stock query does not prove hardware operation. Keep powered bring-up, thermal, EMC, mechanical fit and firmware-programming gates open until evidence exists.

## PCB review

The user reiterated on 2026-10-13 that every component must retain its native footprint reference, including SW1/SW2, even when labels overlap. Inline imports may use the native `{NAME}` template. Do not hide, manually relocate, resize or replace references with detached board-level captions. This supersedes the earlier readable-markings choice in PR #2. Report resulting silkscreen DRC findings without suppressing them; fabrication remains held.

The user subsequently authorized moving references that extend outside the board. Adjust the existing native reference anchor (import `{NAME}` or component `pcbSx`), preserving reference ownership, text and size. Keep unrelated references at their default anchors. Check the complete board outline as well as native edge-clearance DRC; a label wholly outside the outline can escape the native clipped-edge check. This narrow exception does not authorize hidden names or detached replacement captions.

- Place protection at the connector, bypass parts at the relevant pins, switching loops compactly and sense branches as true Kelvin connections.
- Keep high-current paths explicit. Record their layer use, minimum width, copper weight, via count and analytical current/temperature screen.
- Inspect ground continuity, return paths, plane necks, thermal-pad stitching, shunt bypasses, USB reference continuity, antenna/shaft/mounting keepouts and connector access.
- Mark connector function, polarity, pin 1, hazardous/high-voltage rails, product name and revision where space permits.
- Include `Made with tscircuit` branding on silkscreen. Branding must not overlap pads, holes, component courtyards or required safety markings.
- Keep the board visually reviewable: readable references for connectors and major parts, uncluttered passive references, and top/bottom plus 3D previews.
- Place user-operated switches and controls on the accessible top side unless the enclosure explicitly provides bottom access; verify the fitted actuator can be pressed after assembly.

## Mandatory validation and delivery

Run `bun run review` before a prototype handoff. The review must cover:

- typecheck and locked toolchain installation;
- firmware pin-contract consistency and host tests;
- source topology/netlist and schematic checks;
- the viewer-equivalent schematic style analysis with zero issues on every sheet;
- component and schematic placement;
- permitted top/bottom assembly placement and exact supplier identities;
- local bypass and critical-copper checks;
- routing fingerprint and final-route policy;
- shorts and final native KiCad checks with zero PCB DRC violations, zero unconnected items, zero schematic-parity issues and zero schematic ERC violations across every sheet;
- power-corridor/via analysis;
- live stock and alternative-part evidence;
- required release files, archive integrity and SHA-256 hashes.

Never suppress, filter or waive a failing check without documenting the physical reason and adding a focused regression check. A release script must fail closed if source changes during validation or if generated release data no longer matches the verified circuit.

## Reviewer handoff

- Lead with the exact board revision and intended prototype use.
- Provide one command (`bun run review`) and one checklist (`docs/reviewer-checklist.md`).
- Point reviewers to machine-readable evidence rather than asking them to repeat routine discovery.
- Separate prototype-order gates from post-assembly validation gates.
- Do not describe a board as production-ready until programmed hardware has passed staged electrical, thermal, mechanical and EMC validation.

When adding or removing a script, update `scripts/README.md`; the script-catalog check enforces this. When adding a release artifact, update `board-standards.json` and the delivery checker.

Engineering review and ordering are separate gates: `bun run review` validates the current source, CAD, firmware, stock and delivery artifacts while retaining any documented order hold. `bun run check:release` additionally requires `fabrication_orderable: true`; it must fail until the order hold is cleared with evidence. A passing review/CI run is not authorization to order or a claim of powered hardware qualification.

## Current review authorization — 2026-10-13

The user accepted native reference text size, overlaps and silk over copper, and requested one PR containing the remaining implementation and physical/procurement documentation. Retain the exact raw cosmetic baseline in `engineering/native-silk-hold.json`; do not suppress labels or waive electrical, connectivity, parity or ERC faults. Engineering review may record exact known stock shortages with `--review`; strict procurement/release still fails. Unknown identity/package/stock evidence remains a failure, and no substitute or order is authorized by this distinction. Physical measurements, purchases and motor qualification remain explicitly open in `docs/completion-handoff.md`.
