# Product correction — 12 October 2026

This is an implemented source/PCB/mechanical change relative to `772be0d`, not a product-readiness certificate. Ordering remains on hold. The previous claim that CAN/RS485/RS232 were specified by the reviewer was unsupported and is withdrawn.

## Actual changes

- Removed 32 components dedicated to CAN, RS485, RS232, DIN0/1 and OUT0/1, their 31 nets, and the J7 VMOTOR export. The exact set is in `engineering/interface-cleanup.json`. Shared power, braking, temperature/voltage inhibits and STEP/DIR/ENABLE/limit input circuits remain.
- Removed their native copper and disconnected 24 U16/J7 pads. Every surviving native component value, placement, layer and pad geometry was compared with the original PCB. C41's shared ground connection was restored with a 0.60/0.30 mm via after deleting obsolete stubs; a local B.Cu pour tip was trimmed. Fresh native DRC/ERC/parity passed with zero violations and no new waivers.
- Replaced three opaque assembly groups with 66 individually named parts: motor, plate, posts, spacers, screws, washers, nuts, J2 mate, wires, splices and custom cable support. Threads and molded latches remain simplified. The models load from immutable Git asset URLs, with local and published bytes checked against the part manifest.
- Corrected TE 320559 splice length from 28 to **32.13 mm**. Its modeled **5 mm OD is still an unverified clearance envelope**, explicitly named `OD_UNVERIFIED`; fit is not approved.
- Routed all four J2 conductors back to the motor's cable. Removed unconnected J3/J7 and generic USB tails from the visual model. Those missing external systems remain explicit blockers, not completed connections.
- Defined Alpha Wire 3057 16 AWG pigtails, minimum bend radius **23.876 mm** using maximum insulation OD. Calculated cut lengths: **170/170/170/165 mm** for cavities 1–4, including 12 mm termination/adjustment allowance. First-article cut/crimp approval is required.
- Added a custom split jacket clamp and support with two M3 plate fixings and two M3 clamp screws. STL files are supplied; strength, cable pull, heat/creep and print orientation have not been qualified.
- Replaced hypothetical 70.5 mm posts with catalogued **NBK SHBS-M5-80** geometry. PCB bottom now sits **19.5 mm** above the nominal motor rear. Added plate DXF, SVG and hole table. Shared front machine mounting still needs approval.

## Retained connection inventory

| Source | Destination | Connector / cable | Purpose and closure |
|---|---|---|---|
| Motor black lead | J2 pin 1 / MOTOR_A1 | TE320559 → Alpha3057 16 AWG → SVH-41T-P1.1 → VHR-4N → B4P-VH | Winding A. 170 mm pigtail; connected model. |
| Motor green lead | J2 pin 2 / MOTOR_A2 | Same | Winding A. 170 mm pigtail. |
| Motor red lead | J2 pin 3 / MOTOR_B1 | Same | Winding B. 170 mm pigtail. |
| Motor blue lead | J2 pin 4 / MOTOR_B2 | Same | Winding B. 165 mm pigtail. Verify winding continuity; CAD tip order is not a pinout. |
| J3 pin 1 / VMOTOR | First terminal of candidate Vishay LPS0300H10R0GB | VHR-2N / SVH-41T-P1.1; proposed Alpha3057 16 AWG; proposed TE152883 M4 ring terminal | Regenerative braking. Resistor location, cable length, clamp and cooling are **unresolved**. |
| Other resistor terminal | J3 pin 2 / BRAKE_RETURN → Q16 | Same | Switched return, **not permanent GND**. Same unresolved installation. |
| External command equipment, **not selected** | J7 pins 6 STEP / 7 DIR / 18 ENABLE / 8 GND | Existing B20B-PHDSS footprint retained temporarily; final cable/mate not released | Existing nominal 24 V command path, not 3.3 V GPIO. No invented remote controller. |
| Home/left/right limit products, **not selected** | J7 pins 1/2/3 | Final cable length, type and remote connectors unresolved | Preserve these inputs until machine requirements are decided. |
| EPR supply, **not qualified** | J1 USB-C POWER | Exact 48 V/5 A EPR source and cable still required | Motor power. No generic USB cable qualifies this connection. |
| Host, **not selected** | J10 USB-C DATA | Exact USB data cable pending | Commissioning/diagnostics. Firmware does **not** implement USB motion commands. |
| Programming fixtures | SWD and isolated EEPROM service pads | Probe fixture and programmer acceptance pending | Manufacturing only; no permanent free-flying wires in the product model. |

J7 pins **4/5/9/10/11/12/13/14/15/16/17/19/20 are NC**. Its 20-pin physical footprint is an interim state, not a justified final 20-wire harness. Select the actual command/limit system, then reduce the connector and regenerate the affected PCB. No bus peripherals or extra controller have been added to justify the old connector.

## Actual command path

`J7 STEP_24V → Q22 → STEP_IN → U8 → REFL_STEP → U7 TMC5160 STEP`; DIR follows Q23/U9 to U7 DIR. J7 ENABLE uses Q15/Q14 and DRV_EN_N. U10/U11/U33 retain power, voltage, temperature and MCU-run inhibits. U16 configures the TMC5160 over SPI; external bridge MOSFETs drive J2. The STM32 commissioning firmware remains motion-locked. Neither selecting USB architecture nor choosing an external pulse source has been approved; USB diagnostics are not motor control.

## J3 brake decision

The brake remains because regenerated energy cannot be assumed to return into the USB source. Deleting J3 or drawing two loose wires does not solve this requirement. See [brake integration](brake-integration.md) for the selected candidate's physical interfaces and calculations. An actual heatsink, its machine attachment, final harness route/length and load duty are missing; the brake assembly is not complete.

## Mechanical parts and fabrication

| Item | Geometry / source | Procurement or qualification status |
|---|---|---|
| Motor | [STEPPERONLINE 34HS31-6004S1 STEP](https://files.omc-stepperonline.com/34HS31-6004S1.STEP); archived hash in assembly.json | User ordered. Single front shaft; rear encoder attachment unavailable. |
| J2 mate | [JST VHR-4N + 4× SVH-41T-P1.1](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) | Catalog pairing/dimensions verified; supplier lot, crimp tooling and completed loom acceptance pending. |
| Motor splices | [TE320559](https://www.te.com/en/product-320559.html), 22–16 AWG / 0.3–1.42 mm² | Length/wire range verified; outside diameter not verified. Drawing/STEP delivery was inaccessible locally. |
| Pigtail wire | [Alpha3057](https://www.alphawire.com/disteAPI/SpecPDF/DownloadProductSpecPdf?productPartNumber=3057), stranded 16 AWG, 300 V, maximum OD2.3876 mm | Select exact four color/put-up SKUs; stock not reserved. |
| 4 support posts | [NBK SHBS-M5-80](https://www.accu.co.uk/threaded-standoffs/1026608-NBK-SHBS-M5-80), 80 mm, 8 mm AF, 10 mm female depth each end | Exact model selected; inventory and shared-flange fit not accepted. |
| 4 PCB spacers | [Essentra311430640050 drawing](https://essentracomponents.bynder.com/m/349a8daccce450c7/original/2569513-pdf.pdf), 6 length / 8 OD / 4.3 ID | Exact model selected; inventory pending. |
| 4 PCB screws | [Accu SSB-M4-20-A2](https://www.accu.co.uk/socket-button-screws/8134-SSB-M4-20-A2), 7.6×2.2 head | M4×20; catalog geometry, stock pending. |
| 8 M4 washers | [Accu HRDW-M4-A2](https://accu-components.com/de/metrische-flachwaschmaschinen/404898-HRDW-M4-A2), DIN433, 8 OD / 4.3 ID / 0.5 thick | **Do not substitute 9 mm ISO7089 M4 washers.** |
| Other fasteners | M5×10 top and M5×16 front ISO4762; M5 washers; M4 nuts; M3×12 support / M3×20 clamp screws and M3 nuts | Standard nominal geometry only; exact material/finish/supplier SKUs and torque acceptance pending. |
| PD1180-AP-B plate | Custom 6061-T6, 85.9×85.9×3 mm; DXF/SVG/hole table in `engineering/mechanical/fabrication` | [JLCCNC](https://jlccnc.com/) is an RFQ candidate offering 6061 machining; no quote/DFM/order accepted. |
| PD1180-CS-B / CC-B support/cap | Custom PA12 prototype; STL supplied | [JLC3DP](https://jlc3dp.com/) RFQ candidate; process, orientation, tolerances, heat/creep and pull test pending. |

M5 nominal thread engagement: 6 mm at the plate and 5 mm at the 10 mm motor flange, against 10 mm post thread depth. PCB screw stack: 0.5 washer + 1.6 PCB + 6 spacer + 3 plate + 0.5 washer + 3.2 nut = 14.8 mm under head; M4×20 leaves 5.2 mm protrusion and approximately 1.6 mm nominal clearance to the rear case. These are nominal calculations, not tolerance or strength qualification.

## Reference decisions

- The provided NEMA17/NEMA23 projects were reviewed at the versions recorded in `engineering/reference-comparison.json`. Adopted ideas include separately identifiable power/data ports, diagnostics and an optional centered bottom encoder. Their PH/XH motor connectors do not qualify a 6 A motor harness; J2 uses VH under its stated wire/current conditions.
- [ADI TMCM-1180 hardware manual](https://www.analog.com/media/en/technical-documentation/user-guides/TMCM-1180_hardware_manual_hw1.10_rev1.05.pdf): useful motor-attached layout and defined connector/pinout method. Its matched motor mechanics, encoder coupling and ratings do not transfer to the ordered motor.
- [JVL MIS340–343](https://www.jvl.dk/756/mis340-mis343-servostep): choose interfaces for an actual system and integrate the mechanical installation. Available protocol variants are not a requirement to add all buses. Its [double-shaft brake kit](https://www.jvl.dk/1106/brake-for-nema34-motor-and-mis340-to-mis343-with-double-shaft) does not establish rear-shaft compatibility here; a holding brake is not our regeneration resistor.

## Evidence and remaining gates

Before/after renders use the same camera: [before](../previews/product-eco/before.png), [after](../previews/product-eco/after.png). Source: `motor-assembly.circuit.tsx`. The render is a connected J2/mounting prototype, not a complete powered installation.

Native DRC/ERC/parity, source checks, firmware tests, cable/fixture collision screens and the complete verification runner are recorded separately in machine-readable reports. Nominal collision checks do not prove real assembly fit. Live stock remains failing. Remaining gates include the command product/J7 reduction, brake load/cooling/install, exact outstanding supplier SKUs, TE splice OD, fixture qualification, machine mounting approval, TI image and hardware tests. The optional bottom encoder remains DNP, with no invented magnet attachment.

### Placement advisory retained

The CLI placement check still exits nonzero for C41, suggesting a 180-degree rotation from nearest-pad straight-line geometry. This heuristic does not inspect the completed copper path. The native check measures U14 pin 5 → C41 at 2.292 mm (5 mm limit), and the repaired ground path passes native connectivity/DRC. C41 was not rotated merely to clear the heuristic. The advisory remains visible in the verification report; no warning type or exit status is suppressed.

### Final local verification

The stable full run has 33 of 36 checks passing, with 65 regression tests passing. Source JSON has zero recorded errors/warnings; all 24 schematic sheets pass style analysis. Native DRC/ERC/parity, Kelvin copper, USB references, all 45 native bypass targets and analytical power-copper checks pass. All 66 published mechanical asset hashes match local files. Remaining nonzero checks are C41 placement advisory, exact-stock assembly evidence and the standards check that includes that sourcing gate. `bun run review` stops at fresh stock: 7/83 available, 25 insufficient, 51 without an exact match. Alternative refresh also stops because primary stock/package evidence failed. This is not a passing full review or an orderable product. See `verification.json`, `stock-report.json` and `board-standards-check.json`.

The CLI still prints an intermediate C11/C12 chip-overlap warning during TSX conversion. The final compiled PCB envelopes have 1.285 mm separation along X, final schematic symbol bounds have 0.1 mm separation, and final source/style/native checks pass. This console message is retained in build logs; zero recorded final circuit warnings must not be read as a warning-free CLI log.
