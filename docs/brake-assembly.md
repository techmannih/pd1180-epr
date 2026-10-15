# J3 brake assembly and encoder-only bottom

The source `motor-assembly.circuit.tsx` and default routed 3D assembly include the J3 mating plug, contacts, two cables, resistor terminations, resistor and a **provisional cooling/guard installation**. J2's existing four-wire motor harness is retained. This is a connected nominal CAD assembly, not a qualified powered product or an instruction to buy the illustrative heatsink.

## External assembly inventory

| Quantity | Part | Installation |
|---:|---|---|
| 1 | JST VHR-2N | Mates with the existing J3 B2P-VH header, 3.96 mm pitch |
| 2 | JST SVH-41T-P1.1 | One crimp contact per housing cavity; use approved tooling for 16 AWG |
| 1 each | Alpha Wire 3057 RD005 / BK005 | Red nominal **150 mm**, black nominal **115 mm** cuts, including 16 mm termination/adjustment allowance per conductor |
| 2 | TE Connectivity 152883 | 18–16 AWG, M4 ring with 4.3 mm bore; partly insulated, requires guarded installation |
| 1 | Vishay LPS0300H10R0GB | **Provisional** 10 Ω ±2%, 300 W at specified case temperature with suitable cooling |
| 2 each | M4 mounting and terminal fastener sets | Resistor drawing lists M4×25 mounting screws and M4 connection hardware with lock washers; confirm the supplied kit and thread engagement before assembly |
| 1 installation | Thermal interface, heatsink/chassis, terminal guard and cable restraint | The model shows an 80×80×30 mm cooling envelope and a guard concept. They have no selected supplier identity or verified thermal/retention rating. Final hardware must meet the measured application duty. |

The two cable lengths belong to the illustrated resistor location, centered at PCB Y=145 mm with its thermal interface at Z=20 mm. They are not a universal harness length. The 23.876 mm minimum wire bend radius is screened numerically; cable routing, strips, finished crimps and retention need first-article approval. The visual guard is not evidence of touch protection, heat resistance or airflow performance. No additional motor mounting posts, adapter or PCB holes were introduced.

## Wiring and operation

**J3 pin 1 VMOTOR → red lead → resistor terminal 1 → resistor → terminal 2 → black lead → J3 pin 2 BRAKE_RETURN → Q16.**

The resistor itself has no polarity, but the harness cavity/net labels must remain correct. **BRAKE_RETURN is a switched node, not permanent ground.** Never connect it to chassis ground or short J3. Power must be off and the bus discharged before mating or removing the plug. The independent brake circuit turns on around 52 V to dissipate regenerated motor energy; do not assume the USB-C adapter absorbs that energy. Motion locks and brake preflight remain enabled.

At 53 V, a nominal 10 Ω resistor draws 5.3 A and dissipates 280.9 W **while the brake switch is on**. At 50 °C ambient with an 85 °C case target, continuous operation would require combined case-to-ambient thermal resistance at or below 0.1246 °C/W. The model's finned block does not establish that capability. At 55 V and the 9.8 Ω tolerance limit, dissipation reaches 308.7 W; continuous operation there is not qualified by a 300 W label. Pulse energy, repetition, external inertia and terminal temperatures remain hardware qualification inputs. See [brake integration](brake-integration.md) and [readiness](readiness.md).

## Geometry provenance and limits

- Resistor: official Vishay family STEP, unscaled, five meshes, archived with its disclaimer in `engineering/mechanical/Vishay-LPS300-manufacturer.zip`. Hash and transform are in `brake-evidence.json` / `harness-layout.json`. The importer reports one unresolved STEP reference while returning the five expected solids; the drawing and measured envelopes remain the dimensional cross-check. This is not an exact resistance marking or supplier fit approval.
- VHR-2N: catalogue housing envelope with two aligned cavities; SVH contacts are nominal internal envelopes, not tooling models.
- TE 152883: published 20.45 mm length, 4.3 mm hole and 0.79 mm tongue thickness are used. The width/barrel profiles are explicitly approximate. Official STEP/drawing downloads returned HTTP 403; the model is not described as exact TE CAD.
- Cooling, fastener outlines and guard: installation concepts, clearly labeled in the 3D part names. No thermal performance, screw retention, material, enclosure clearance or physical strain-relief approval is claimed.

The reproducible combined harness is stored in `engineering/mechanical/harness-proposal.zip`; per-part models are loaded by the actual assembly. Clearance checks cover the board, motor, other conductors, resistor body, cooling and guard walls; intentional own-contact/ring mating is distinguished from accidental crossings. Raw manufacturing files and schematic remain independent of these mechanical-only meshes.

## Bottom-side constraint

**U18 is the only bottom-side component footprint. C52 and C53 are on top.** U18 remains at the shaft axis (PCB origin). C52 keeps its original XY pad centers; C53 moves 1.7 mm toward PCB negative Y to clear existing top copper. All three remain optional DNP because the ordered motor's rear magnetic interface is unqualified. They are excluded from the fitted BOM/CPL and stencil.

C52 reaches U18 pin 11 through one 0.60 mm pad / 0.30 mm drill through via at PCB (-0.6, -3.9) mm. The measured path including 1.6 mm board thickness is approximately **3.873 mm**, below the unchanged 5 mm budget. This is the only permitted opposite-side bypass exception; all other bypass paths retain their component-side rule. Native DRC/ERC, ground connectivity and preservation of unrelated copper are checked separately. No firmware motion permission or encoder qualification was changed.

Manufacturer references: [JST VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf), [Vishay LPS300 drawing and thermal rules](https://www.vishay.com/docs/50052/lps300.pdf), [TE 152883](https://www.te.com/en/product-152883.html), [Alpha Wire 3057](https://www.alphawire.com/en/products/wire/hook-up-wire/premium/3057).
