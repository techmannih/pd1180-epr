# Seve review: requirements, external connections and assembly audit

Date: 2026-10-12 IST. Audited board: `56b7dee8d0150ae728028d68e12341bd9ad49f42`.
Scope: the review messages supplied in this conversation, current source, routed viewer, connector/motor specifications and existing assembly evidence. This is a requirements and evidence audit, not a new hardware qualification or manufacturing release. **No circuit, schematic, routing or mechanical model was changed.**

## Correction to the earlier review response

The statement that CAN/RS485/RS232 were Seve's “specified” interfaces was unsupported. Earlier user instructions retained industrial interfaces, but that is not evidence that Seve requested them. The screenshots now explicitly challenge their inclusion. Existing `hardware-contract.json`, generated feature checks and earlier documents describe the implemented design; they cannot independently establish the reviewer's original requirements.

The original project brief has been requested and was not available for this audit. Do not replace it with another board's feature list. Likewise, “no external use has been defined” does not mean a circuit is electrically unconnected: J7's pins are connected on the PCB, but their external destinations have not been specified.

The initial suggestion to remove just IN0/IN1 and OUT0/OUT1 was incomplete. CAN/RS485/RS232, the exported VMOTOR supply, external motion controller and home/limit wiring all need the same endpoint check. Do not choose a smaller connector's pin count before resolving those functions.

## Every review message and the evidence needed to close it

| Review message | Finding in the current board | Required action / closure evidence |
|---|---|---|
| Too many connectors; justify J2 and J7 | Five cable connectors remain. J7 combines twenty conductors, rather than proving they are needed. | A connection schedule must identify each board pin, real destination product, destination pin, cable and sourcing. Consolidation alone does not close this comment. |
| Separate USB-PD POWER and USB DATA | J1 and J10 are separate in source and the routed viewer. TPS26750/TPD4S480 hardware exists. | Keep this architecture. Select the actual 48 V / 5 A EPR source and power cable; select the DATA cable. Finish PD configuration and address the existing unused-SBU finding. Presence of a PD chip does not prove negotiation. |
| “Manual bridges”; understand the driver | U7 is TMC5160A with eight external CSD19534Q5A MOSFETs. The [ADI datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf) specifies an external-transistor power stage. | Distinguish architecture from qualification: this supports why MOSFETs are present, not proof that this stage is sized/tuned correctly or accepted by the reviewer. Review operating current, gate timing, losses and cooling. The user's previous decision retained this stage; do not silently substitute an IC or remove bridge devices. |
| Use Rishabh's NEMA17 and NEMA23 designs | Exact reference revisions and differences are recorded in `reference-comparison.json`. | Reuse their relevant functions and assembly method. Do not inherit their current ratings, connector choice, firmware assumptions or every available interface. |
| Add a small centered bottom encoder marked `doNotPlace` | U18 is bottom at (0,0). U18/C52/C53 have `pcb_component.do_not_place: true` and are absent from the fitted BOM/CPL. | This optional-footprint requirement is met. Keep it DNP. Do not claim that a working encoder/magnet assembly is complete. |
| Encoder must be centered; examine real motor installations | Sensor and motor-axis origins agree. The ordered motor is single-shaft; a rear rotating attachment has not been established. | Do not invent a rear shaft, drill the motor or add a cosmetic magnet. Operating feedback would require a separately validated mechanical solution. The current request for an optional DNP footprint does not require pretending that feedback works. |
| Holes look wrong; show the assembly | Existing records show four 4.2 mm drills aligned to the ordered motor's rear CAD axes, with a front-flange-supported adapter proposal. | Rear case-bolt axes are not approved accessory mounting threads. Finalize the actual support/fastener stack, shared front mounting, tolerances, tool access and electrical isolation. CAD alignment alone is insufficient. |
| No way to connect the motor | J2 has a defined VH housing/contact/splice proposal and the correct winding map, but no completed, sourced cable kit. | Complete both physical ends, choose actual wire/clamp/tooling, correct the splice model discrepancy below, and provide a dimensioned harness and procurement list. |
| More assembly work; discover other problems | J3/J7 have loose outgoing conductors. USB bodies are generic access gauges. Adapter and fasteners are proposals. | Model only justified connections to actual endpoints. Finish clamp, bend, latch/removal-tool and terminal access, not just collision-free wire curves. |
| Only specified interfaces / jumpers | No `JP*` or jumper-type source component is present; the disputed items are connector interfaces and assembly wires. | In context, the later message makes the concern clear: unjustified external connections. Do not add configuration jumpers, or short pins, in response. |
| When was CAN/RS485/RS232 requested? What does it connect to? | No named external peer or application protocol is defined. Commissioning firmware implements none of these motion protocols. | Recommend removing these three interface blocks from the revised scope unless the original brief supplies an actual requirement. Update the complete circuit/firmware/BOM/harness, not only the rendered wires. This removal is not yet applied. |
| Every dangling wire needs an exact product and sourcing | A housing/terminal part number exists for J7, but the equipment at its other end is undefined. J3 has a candidate resistor but no complete cooled/terminated assembly. | Require a sourceable end-to-end connection for each retained cable. A nominal 3D tail, stock photo or supplier family name cannot close this requirement. |
| Stop hypothetical replies; correct the board before another review | Earlier replies presented implementation choices as confirmed requirements. | Next review must show the actual design diff, exact interface list, sourced assembly items and checks against the revised board. Do not send another “all updated” claim from this audit. |

## Proposed disposition of each external connection

These are recommendations for the next design change, not changes already made. The schematic remains frozen while the scope is resolved.

| Connection | Real endpoint / procurement evidence now | Disposition |
|---|---|---|
| J1 POWER | Required endpoint class is a USB-PD source. No exact source/cable SKU in `external-items.csv`. | Keep POWER. Select a source with an explicit 48 V / 5 A PDO and a suitable 5 A EPR cable; total charger wattage alone is insufficient. Check the actual plug envelope and cable bend. |
| J10 DATA | Intended USB host for setup/diagnostics; generic plug gauge only. | Keep DATA. Specify a data-capable cable and host workflow. Current USB firmware is not a motor-control application or an EEPROM programmer. |
| J2 pins 1–4 | Ordered STEPPERONLINE 34HS31-6004S1. Black/green = A winding; red/blue = B winding. B4P-VH mates with VHR-4N and SVH-41T-P1.1 contacts. | Keep. Finish the sourced motor cable rather than changing to PH/XH to mimic a lower-current board. The [JST VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) gives the standard header's 10 A rating with AWG16; that does not qualify the complete harness or the motor current setting. |
| J3 pins 1–2 | Candidate Vishay LPS0300H10R0GB, 10 ohm / 300 W. VHR-2N and contacts specified. No final heatsink, terminal hardware, load duty or mounting. | Conditional architecture decision. Complete the brake assembly if this regeneration design is retained, or redesign/validate energy management. Do not simply remove J3 while leaving the current protection design dependent on an absent resistor. |
| J7 pins 9/10, 12/13, 15/16 | RS232, CAN, RS485; no named peer or required application protocol. | Recommend removing these buses and their dedicated support circuits from the revised scope. Prior retention is not a substitute for a requirement from the actual brief. |
| J7 pins 4/5 and 19/20 | DIN0/DIN1 and OUT0/OUT1; no sensor, actuator or load selected. OUT0/OUT1 load/current/duty limits are unqualified. | Recommend removing these generic I/O channels and dedicated circuitry. Do not source an arbitrary load merely to justify them. |
| J7 pin 17 | Protected VMOTOR, nominal 48 V. No external consumer defined. | Recommend removing this exported supply connection unless an actual load requires it. It is not a 24 V supply for the control inputs. |
| J7 pins 6/7/18 plus control ground | STEP/DIR/ENABLE matches the operating mode selected earlier by the user. External controller, electrical output type and separate 24 V supply are not selected. | Conditional keep. For this mode, first select a compatible real controller and harness. If the actual project brief calls for USB-only control, deleting J7 also requires a motor-control firmware and hardware-enable redesign. USB diagnostics alone cannot replace it. |
| J7 pins 1/2/3 | HOME/STOP L/STOP R; no axis, switch product, installation or polarity defined. | Do not automatically retain them as “required.” Keep only if the actual machine/brief requires them, with exact switches, wiring and stop behavior. Otherwise remove their dedicated interfaces as part of the approved scope change. |
| J7 pins 8/11/14 | Ground returns for the above functions. | Reassign only after the surviving interfaces are fixed. They are not three extra functions or evidence that a 16-pin connector is correct. |
| SW1; programming/test pads | Reset and production/engineering access. No extra cable headers. | Keep SW1 and necessary programming access. Finalize the programming fixture; do not add 2–3 generic buttons or permanent flying leads. Review optional encoder observation pads against the test plan. |

**Minimum connection set established by the visible review:** separate POWER, DATA and motor connection, plus the centered optional bottom encoder footprint. Braking and motion-input connections still depend on an actual system design. This is not an assertion that USB motor control is implemented or that Seve has supplied a complete replacement brief.

## Concrete assembly discrepancies

1. **Motor splice model is undersized.** `harness-layout.json` uses a 28 mm long envelope for TE 320559. The [exact TE product page](https://www.te.com/en/product-320559.html) lists 32.13 mm length. The model is 4.13 mm shorter than that catalogue value, so its “conservative” description is not supported. Use the linked manufacturer drawing/CAD and tolerances, correct the model, and repeat clearance/strain-relief review. Wire-size compatibility alone does not prove mechanical fit.
2. **Loose-ended J7/J3 wires do not complete the system.** Existing assembly documentation explicitly excludes the remote equipment and brake heatsink. The 674-segment clearance result does not check those missing objects.
3. **Fastener and support purchasing is incomplete.** The adapter, 70.5 mm posts, 6 mm PCB standoffs and head envelopes lack a final sourced/custom-fabricated assembly specification. The existing head study permits only an 8 mm envelope; screws and washers must be selected to fit it. Latest recorded H4 clearance is 0.5475 mm to D17, not the older documentation's 0.7743 mm to U19. These are nominal geometry results, not a tolerance allowance.
4. **Exact USB source/cables are absent.** Generic 12 x 6 mm overmold gauges are useful for an early space study but do not identify an EPR-capable product.
5. **Braking is a system dependency, not a universally necessary extra connector.** The [Vishay LPS300 datasheet](https://www.vishay.com/docs/50052/lps300.pdf) rates 300 W at an 85 C bottom-case temperature and specifies M4 connections. The current proposal does not select the heatsink or resistor-end cable terminals. Operating speed, driven inertia and stopping duty are unknown; resistor/heatsink sizing is therefore open.
6. **Working encoder feedback is not established.** The [ordered motor specification](https://www.omc-stepperonline.com/s-series-nema-34-stepper-motor-4-8nm-679-87oz-in-14mm-key-way-shaft-1m-cable-34hs31-6004s1) confirms a single shaft. Retain DNP as requested; do not make magnet installation a claimed completed feature.

## Electrical and release findings that still matter

- `firmware/target/main.cpp` keeps `motionWiringVerified` and `pdImageVerified` false. The present commissioning binary intentionally cannot run the motor. Changing booleans is not a substitute for qualifying the operating firmware.
- `docs/pd-configuration.json` contains requirements, not a TI full-flash image. U3 programming and cold-boot evidence are absent.
- `docs/pd-configuration-review.md` records the unused-SBU false-fault risk supported by a [TI engineering discussion](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1624778/tps26750-tps26750-event-92-is-not-activating-at-correct-time-in-epr-negotiation). The narrow hardware correction has not been applied; it must be resolved before calling the power input complete.
- The motor's manufacturer rating of 6 A/phase has not been translated into a qualified drive/hold setting. The inherited 5.5 A RMS target is not automatically that setting.
- Fresh exact-code stock check at **2026-10-11 23:45:06 UTC** (2026-10-12 05:15:06 IST), for five boards: **7 available, 25 reported insufficient, 57 without an exact match; 89 unique codes**. A missing search result is not proof of zero stock. J1/J10, J2, J3, J7, U7 and U16 did not obtain an exact match in this query. External harness/fixture items are not covered by this PCB-parts check. Full report: `reviewer-audit-stock.json`.
- The hosted v0.3.71 build success is a software-build fact. It does not resolve the above requirements, sourcing, mechanical or powered-operation issues.

## Ordered work for the next revision

1. Reconcile the original brief with the explicit review corrections and the previously selected operating mode. Record the permitted interfaces and exact external products before choosing a new header.
2. Prepare one scoped electrical change: remove unrequired interfaces, dedicated circuitry and unused exported rails; preserve the power/enable safety behavior and frozen unrelated schematic content. Starting impact areas are U19/TCAN332, U20/MAX3485, U21/MAX3232, DIN stages Q17/Q18 and output stages Q24/Q25. Trace their dedicated passives, protection and firmware pins before deleting anything. HOME/limits and STEP/DIR depend on step 1.
3. Finish the retained external BOM: actual USB source/cables, motor harness, wire part numbers, clamp, adapter/post/fastener specifications, and the complete brake kit if retained. Record manufacturer drawing, supplier SKU, quantity, availability and both-end pin mapping. A part number is not a completed purchase or stock reservation.
4. Correct the splice geometry and model only the retained, defined assemblies. Check insertion/removal, screwdriver access, wire bend, strain relief, motor/body/board clearances and tolerance stacks. Do not conceal unresolved ends with decorative wires.
5. Resolve PD hardware/image and implement the chosen motor-control path. Define the real current, load, stop and thermal limits, then arrange programming and first-article qualification with the selected provider.
6. After the source and assembly changes, rerun routing, native ERC/DRC, netlist parity, sourcing and mechanical checks; regenerate BOM/CPL, Gerbers/drills, harness drawings and the routed hosted assembly from the same revision. Only then request another review with the exact changes and remaining limitations.

## What was checked in this audit

- Source/contract and every J7 cavity were inspected; five cable connectors and one reset switch are present, with no source jumper components.
- Routed viewer confirms U18 at (0,0), bottom, with U18/C52/C53 DNP. Both fitted release BOM and CPL exclude all three.
- `index.circuit.tsx`, `board-diagnostics.tsx` and `schematic-pages.tsx` remain byte-identical to user-frozen commit `f2909b45edf453e486c1f6bb8531e71142161fa2`.
- Thirteen existing assembly-policy, motor-mounting-geometry and harness-geometry tests passed. They exercise CAD/policy calculations; they do not establish physical fit or motor operation.
- Existing assembly reports were inspected with their stated scope. Their older GLB hashes and nominal results are not represented as fresh approval of a revised model. No full manufacturing review or powered test was performed, and no release gate was waived.

Detailed local evidence and raw sourcing responses were saved under `/private/tmp/pd1180-review-20261012/`. The board and released artifacts are unchanged by this audit.
