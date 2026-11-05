# J3 brake assembly and encoder-only bottom

The source `motor-assembly.circuit.tsx` and default routed 3D assembly include the J3 spring-clamp terminations, two cables, resistor terminations, resistor and a **provisional cooling/guard installation**. J2's existing four-wire motor harness is retained. This is a connected nominal CAD assembly, not a qualified powered product or an instruction to buy the illustrative heatsink.

## External assembly inventory

| Quantity | Part | Installation |
|---:|---|---|
| On PCB | WAGO 236-402 | Two poles, 5 mm pitch; strip 5–6 mm and use the specified spring-clamp operating tool |
| 1 each | Alpha Wire 3057 RD005 / BK005 | Red nominal **165 mm**, black nominal **210 mm** cuts, including 16 mm termination/adjustment allowance per conductor |
| 2 | TE Connectivity 152883 | 18–16 AWG, M4 ring with 4.3 mm bore; partly insulated, requires guarded installation |
| 1 | Vishay LPS0300H10R0GB | **Provisional** 10 Ω ±2%, 300 W at specified case temperature with suitable cooling |
| 2 each | M4 mounting and terminal fastener sets | Resistor drawing lists M4×25 mounting screws and M4 connection hardware with lock washers; confirm the supplied kit and thread engagement before assembly |
| 1 installation | Thermal interface, heatsink/chassis, terminal guard and cable restraint | The model shows an 80×80×30 mm cooling envelope and a guard concept. The model remains conceptual; Bluesil Past 340 is selected as the resistor TIM and Fischer SK 100 100 SA is a separate sink candidate for drawing/thermal review. Neither the existing model nor the candidate is a verified cooling/retention assembly. See thermal-qualification.md. |

The two cable lengths belong to the illustrated resistor location, centered at PCB Y=180 mm with its thermal interface at Z=20 mm. They are not a universal harness length. The 23.876 mm minimum wire bend radius is screened numerically; cable routing, strips, finished crimps and retention need first-article approval. The visual guard is not evidence of touch protection, heat resistance or airflow performance. No additional motor mounting posts, adapter or PCB holes were introduced.

## Wiring and operation

**J3 pin 1 VMOTOR → red lead → resistor terminal 1 → resistor → terminal 2 → black lead → J3 pin 2 BRAKE_RETURN → Q16.**

The resistor itself has no polarity, but the harness cavity/net labels must remain correct. **BRAKE_RETURN is a switched node, not permanent ground.** Never connect it to chassis ground or short J3. Power must be off and the bus discharged before inserting or removing wires. The independent brake circuit turns on around 52 V to dissipate regenerated motor energy; do not assume the USB-C adapter absorbs that energy. Motion locks and brake preflight remain enabled.

At 53 V, a nominal 10 Ω resistor draws 5.3 A and dissipates 280.9 W **while the brake switch is on**. At 50 °C ambient with an 85 °C case target, continuous operation would require combined case-to-ambient thermal resistance at or below 0.1246 °C/W. The model's finned block does not establish that capability. At 55 V and the 9.8 Ω tolerance limit, dissipation reaches 308.7 W; continuous operation there is not qualified by a 300 W label. Pulse energy, repetition, external inertia and terminal temperatures remain hardware qualification inputs. See [brake integration](brake-integration.md) and [readiness](readiness.md).

## Geometry provenance and limits

- Resistor: official Vishay family STEP, unscaled, five meshes, archived with its disclaimer in `engineering/mechanical/Vishay-LPS300-manufacturer.zip`. Hash and transform are in `brake-evidence.json` / `harness-layout.json`. The importer reports one unresolved STEP reference while returning the five expected solids; the drawing and measured envelopes remain the dimensional cross-check. This is not an exact resistance marking or supplier fit approval.
- WAGO 236-402: supplier body CAD is included in the PCB model; wire-entry centre and cable approach are nominal. No separate plug/contact model is used.
- TE 152883: published 20.45 mm length, 4.3 mm hole and 0.79 mm tongue thickness are used. The width/barrel profiles are explicitly approximate. Official STEP/drawing downloads returned HTTP 403; the model is not described as exact TE CAD.
- Cooling, fastener outlines and guard: installation concepts, clearly labeled in the 3D part names. No thermal performance, screw retention, material, enclosure clearance or physical strain-relief approval is claimed.

The reproducible combined harness is stored in `engineering/mechanical/harness-proposal.zip`; per-part models are loaded by the actual assembly. Clearance checks cover the board, motor, other conductors, resistor body, cooling and guard walls; intentional own-contact/ring mating is distinguished from accidental crossings. Raw manufacturing files and schematic remain independent of these mechanical-only meshes.

## Bottom-side constraint

**U18 is the only bottom-side component footprint. C52 and C53 are on top.** U18 remains at the shaft axis (PCB origin). C52 keeps its original XY pad centers; C53 moves 1.7 mm toward PCB negative Y to clear existing top copper. All three remain optional DNP because the ordered motor's rear magnetic interface is unqualified. They are excluded from the fitted BOM/CPL and stencil.

The current AS5600 pinout and its top-side bypass paths are checked against the generated source and native board. The earlier AS5047P pin-11 routing is historical and does not apply. No encoder magnet, rear shaft access or powered operation is qualified.

Manufacturer references: [WAGO 236-402](https://www.wago.com/global/pcb-terminal-blocks-and-pluggable-connectors/pcb-terminal-block/p/236-402), [Vishay LPS300 drawing and thermal rules](https://www.vishay.com/docs/50052/lps300.pdf), [TE 152883](https://www.te.com/en/product-152883.html), [Alpha Wire 3057](https://www.alphawire.com/en/products/wire/hook-up-wire/premium/3057).
