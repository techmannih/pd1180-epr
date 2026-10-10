# Power validation and prototype order review

**Status: power ECO CAD verified; order hold remains. No PCB has been assembled or powered.** The user authorized changes to the driver-supply and brake/OVP sections and removal of C19 from IMON on 2026-10-10. Unrelated schematic placement and symbols remain frozen. The regenerated native board has zero DRC violations, unconnected items, schematic-parity issues and ERC violations. Use only the matching regenerated manufacturing package; this CAD result does not close the system-validation gates.

## Independent pre-order audit — 2026-10-10

The audited native PCB SHA-256 is `c9007161c6b74a6dc9713a2e786b1761b4a3b42090f70075ccfa8724ed1677fb`, after the authorized C19 correction on base commit `b38aa63c568504deec009184d52fd277ab1c7e7c`. A fresh KiCad invocation, independent of the cached check reports, found zero DRC violations, unconnected items, schematic-parity issues and ERC violations. Raw reports: [PCB](checks/pre-order-native-drc.json), [schematic](checks/pre-order-native-erc.json). The complete automated review is recorded in [verification.json](verification.json); its passing results do not cover every manufacturer design instruction.

| Review area | Finding |
|---|---|
| Assembly and geometry | 294 fitted parts plus 11 service pads on top; minimum via drill 0.30 mm; 69 filled/capped via-in-pad locations |
| Local routing | All 46 specified bypass paths, nine Kelvin/analog branches, USB reference and power-routing checks passed |
| Filled-copper calculation | Re-exported the current native copper and solved MOTOR_A1 Q7:9 → R115:1 at 0.075/0.05 mm mesh: 3.2831/3.2946 mΩ, 0.349% difference; fine-mesh loss 0.0997 W at 5.5 A, excluding contacts/devices and thermal feedback. [Evidence](../engineering/filled-copper-review.json) |
| Driver initialization | Fixed reliance on OTP short-detection and dead-time defaults. Explicit register writes, disabled-chopper sequencing and write-corruption regressions pass. The regression failed on the previous configuration. See [firmware details](../firmware/README.md#tmc5160-external-stepdir-service) |
| TPS26631 current monitor | **Corrected:** removed C19 from source and native PCB; R26 and the ADC connection remain. The compiled-connectivity regression rejects an IMON-to-ground capacitor even after reference/net renaming. TI §8.3.9 prohibits this bypass because it delays current information; this is separate from the internal current limit. |
| Programming and operation | The TPS26750 full-flash image and qualified motor-operation firmware are absent. The supplied STM32 image supports commissioning diagnostics and deliberately keeps motion locked. The ordered motor is now identified as 34HS31-6004S1; approved current settings, load, stop profile and adapter/cable qualification remain open. |

The C19 correction removes only that component. Native footprint and route comparison verifies the remaining pads and existing tracks/vias are unchanged; matching schematic, BOM/CPL and manufacturing files are regenerated. See the `c19_correction` entry in [native placement evidence](../engineering/top-side-placement.json). The source connection was checked against [TI TPS2663 §8.3.9](https://www.ti.com/lit/ds/symlink/tps2663.pdf); generic CAD connectivity checks alone did not detect this component-specific rule.

**Disposition: keep the order hold.** Passing connectivity and design calculations does not mean the delivered assembly can currently run a motor. Programming and agreed functional acceptance must be completed before shipment for a ready-to-run delivery; provider acceptance and actual test records are not yet available. See [assembly requirements](assembly.md) and [order settings](../release/order-settings.json).

## Correction and calculation record

The original connection put U7 VSA on a motor bus whose brake threshold exceeded VSA's 50 V recommended operating limit. U34 now generates a separate 12 V rail from VMOTOR; U7 VSA and 12VOUT, including C61, connect to that rail. VS remains on VMOTOR. The compiled connectivity check rejects a short between these rails, including a short introduced by an explicit bypass trace. The external-supply range is 10–13 V; absolute maximum ratings are not used as operating limits. See [TMC5160A §3.2 and §28](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf).

| Change | Design basis | Remaining qualification |
|---|---|---|
| U34 LMR36510ADDAR, L3 47 µH, R121 100 kΩ / R122 9.09 kΩ | Nominal 12.001 V; screened 11.57–12.57 V including resistor temperature and PFM allowances | Startup, ripple, bus collapse and driver/brake load steps |
| L3 SRP7050TA-470M | 37.6 µH at −20% versus approximately 23.1 µH minimum; 2.7 A saturation rating at 25 °C versus 2.4 A maximum high-side current limit | Hot saturation, loss and temperature rise |
| C86/C87 input; C88 VCC; C89 bootstrap; C90–C92 output | 2.2 µF + 220 nF / 100 V input; 1 µF VCC; 100 nF bootstrap; 3 × 22 µF / 25 V output | Effective capacitance under bias/temperature, switch-loop waveform and return paths |
| C32–C35 470 nF / 50 V X7R | MOSFET maximum gate charge is 22 nC; ADI recommends 470 nF above 20 nC. These capacitors see floating gate-drive differential voltage, not the full bus | Bootstrap droop, gate overshoot, dead time and minimum off-time |
| U12 REF3425, C93/C94; remove R59 | 2.5 V precision reference, with input/output bypassing; replaces shunt reference and bias resistor | Reference startup and operation during loss of either USB input |
| R60/R61 = 180 kΩ + 16 kΩ; R62 = 10 kΩ; R63 = 1 MΩ | Brake nominal on 51.99 V / off 51.34 V | Measured hysteresis, comparator offset/noise and switching overshoot |
| R64 = 430 kΩ; R65/R66 = 20 kΩ + 1 kΩ | Motor inhibit nominal 53.69 V; tolerance envelope must stay below 55 V with allocated transient margin | Dynamic shutdown response and regenerated energy after inhibit |
| R22 = 4.7 kΩ; R23 = 422 kΩ; R24 = 10 kΩ | eFuse input OVP nominal 52.40 V; screened 50.93–53.89 V, retaining margin above a 5% high 48 V source | Source tolerance, eFuse input leakage and PD transient coordination |

Reference data: [TI LMR36510 tables 8-1/8-4](https://www.ti.com/lit/ds/symlink/lmr36510.pdf), [Bourns SRP7050TA](https://www.bourns.com/docs/product-datasheets/srp7050ta.pdf), [REF34](https://www.ti.com/lit/ds/symlink/ref34.pdf), [TLV3201](https://www.ti.com/lit/ds/symlink/tlv3201.pdf), [TPS2663](https://www.ti.com/lit/ds/symlink/tps2663.pdf), and [CSD19534Q5A](https://www.ti.com/lit/ds/symlink/csd19534q5a.pdf).

`bun run check:power-audit` calculates the actual fitted-value envelopes and writes [the machine-readable report](../engineering/power-audit.json). The report hashes its source inputs. Its screening result does not assert that the hashed native PCB implements the new source: routing fingerprint, parity, DRC, local-copper and power-routing checks are separate mandatory gates. The 2 mV comparator noise/hysteresis and 0.5 V dynamic overshoot allowances are engineering allocations requiring measurement. Capacitor bias, switching losses, parasitics and thermal boundary conditions are not simulated.

C87 has a documented 3.3 mm pad-center placement limit: VIN is the second pin in U34's PowerPAD package, and the adjacent 0805 capacitor must clear the PGND land and package courtyard. Actual separation is approximately 3.166 mm, with a constrained top-layer path under 5 mm. All other bypass targets retain the 3 mm placement limit. This is not an exception to copper clearance, connectivity or the short ground-return requirement. L3 uses the manufacturer's recommended land pattern; its 3D object is a dimensioned body envelope, not a manufacturer STEP model.

The final native PCB has 294 fitted parts and 11 service pads on top, a minimum 0.30 mm finished via drill, 40 MOSFET drain thermal vias and four U34 exposed-pad thermal vias. The drill-over-solder-land audit counts **69 via-in-pad locations**, all requiring the selected filled/capped process. Exact coordinates and the board hash are in `engineering/top-side-placement.json`; order settings carry the same count. Native routing checks verify all 46 specified IC-to-capacitor top-layer paths within 5 mm, all nine Kelvin/analog-return branches, USB reference continuity and the power-corridor policy. The native bypass regression rejects the earlier copper with five missing or excessive paths.

## What the power numbers establish

At the 5.5 A RMS design target the sinusoidal phase peak is 7.78 A. The configured scaler nominally commands about 5.386 A RMS; that calculation is not a calibrated phase-current measurement. A 33 mΩ sense resistor has a conservative cycle-average bound of 1.00 W and a held-peak bound of 2.00 W. The eight bridge MOSFETs have approximately 1.83 W total conduction loss using maximum 25 °C on-resistance; doubling resistance gives 3.65 W. Neither number includes switching loss or predicts junction temperature.

The eFuse limit is about 4.48 A nominal at the input, not a phase-current limit. The screened upper limit leaves only about 0.14 A from a 5 A PD contract for upstream logic. TPS26631 also permits overload pulses. Source/cable negotiation, logic consumption and overload behavior must be tested together.

The 940 µF bank stores about 1.08 J at 48 V but accepts only about 0.237 J between 48 V and 53 V. A nominal 10 Ω brake dissipates about 270 W at turn-on; 55 V across a −2% resistor would dissipate 309 W. The selected [Vishay LPS300](https://www.vishay.com/docs/50052/lps300.pdf) is rated 300 W only with its case at or below 85 °C. It needs a designed heatsink and a verified pulse-energy/repetition budget. The ordered motor’s rotor inertia is not specified, so no rotor kinetic-energy result is available. Driven-load inertia and gravity must also be included.

## Evidence required before submitting a prototype order

- Fresh source build, electrical tests, schematic checks and native PCB/schematic parity; zero DRC violations and unconnected items.
- Top-only fitted BOM/CPL, local bypasses, preserved Kelvin paths, four-layer stack, at least 0.30 mm finished via drills, drain thermal vias and uninterrupted USB reference evidence.
- Fresh Gerber/drill ZIP and matching BOM/CPL, with SHA-256 provenance. Reject older ZIPs and manually substituted files.
- Exact stock/package checks for the actual order quantity, plus manufacturer confirmation of filled/capped via-in-pad processing and the chosen impedance stack-up.
- Review of the ordered 34HS31-6004S1 current waveform, supply/cable, maximum speed, stop time, rotor/load inertia, ambient temperature, enclosure and brake heatsink. These operating details remain unqualified.
- A documented PD programming path. `docs/pd-configuration.json` contains requirements only; the TI-generated full-flash image is still missing. Do not substitute that JSON for an EEPROM binary.

## Staged powered test record — all results pending

Use a current-limited bench setup, rated differential probes, a current probe/electronic load and temperature sensors. Attach the brake resistor and load only after their ratings and wiring are checked. Keep motor enable inactive until supply and fault tests pass. Save oscilloscope traces, instrument ranges/calibration, ambient temperature, firmware/configuration hashes and board serial number for each row.

| Stage | Exercise | Acceptance / stop criterion | Result |
|---|---|---|---|
| Unpowered | Assembly, resistance, polarity, QFN/drain joints, shorts, filled vias and harness pinout | No assembly defect; explain each unexpectedly low resistance before power | Not tested |
| 5 V logic | J1 and J10 independently and together; blank EEPROM, erased MCU, SWD and USB | Correct logic rails; VMOTOR and bridge stay disabled with invalid firmware/configuration | Not tested |
| PD and handover | Approved TI image; attach/detach, hard reset, EPR cable, source swaps, USB suspend/resume | 48 V / 5 A contract proven; USB/PD ratings respected; no backfeed or unintended motor enable | Not tested |
| eFuse | No-motor load sweep, startup/inrush, UVLO, OVP, overload and fault recovery | Measured thresholds inside the report's screen; valid source coordination; no SOA or temperature violation | Not tested |
| Driver supply | U34 output at U7 and U15, startup, brake pulses, supply removal and load steps | VSA/12VOUT remain 10–13 V while operating; no destructive overshoot or unwanted gates; capture ripple | Not tested |
| Reference and brake | Controlled bus ramp with rated brake load; both directions and temperature corners | Brake acts before inhibit; VS always below 55 V, including transient allowance; resistor case ≤85 °C | Not tested |
| Inhibit matrix | External enable open/grounded, MCU reset/watchdog, PGOOD loss, overvoltage and overtemperature | Bridge disables for every fault; no automatic restart without the intended permit sequence | Not tested |
| Low-current motor | Start below rated phase current; inspect all bridge VGS/VDS and current waveforms | Correct phase/polarity; no shoot-through; bootstrap/gate limits respected before increasing current | Not tested |
| Rated-current soak | Increase current in stages, then standstill and loaded motion at worst intended ambient | Measured RMS/peak current and all derated component/motor temperatures acceptable; document thermal equilibrium | Not tested |
| Regeneration | Defined load, speed, stop time and repeated stops, including USB loss | Bus remains within limits; brake pulse/average energy and temperatures pass; no uncontrolled movement | Not tested |
| Interfaces and compliance | USB during switching, STEP/DIR rate, industrial buses, cable faults, magnetic alignment, ESD/EMC | Meets the intended system requirements and applicable test limits; record failures | Not tested |

Full-power operation is established only after these measurements on assembled hardware. A passing design calculation or CAD report cannot close the powered, thermal or EMC gates.

## Qualification work sheet for the provider

Complete and approve this envelope **before** a motor-enabled test. Empty fields mean the qualification is not ready to execute; the design target is not an acceptance value.

| Required input | Agreed value |
|---|---|
| Provider, responsible engineer and first-article serial | Not supplied |
| Motor manufacturer/model, phase wiring and driver current | STEPPERONLINE 34HS31-6004S1; A+ black, A− green, B+ red, B− blue. Manufacturer rating 6 A/phase; approved RMS/hold setting pending |
| Driven load, inertia/gravity, maximum RPM and acceleration | Not supplied |
| Worst stop/deceleration profile and repeat interval | Not supplied |
| J1 source model and EPR cable model/rating | Not supplied |
| Brake resistor, heatsink, mounting and airflow | Not qualified |
| Ambient range, enclosure, duty cycle and thermal limits | Not agreed |
| Microsteps, current settings and STEP/DIR timing limits | Not qualified |
| TI configuration/full-flash hashes and motor-test firmware hash | Not available |
| Fixture revision, instrument list and calibration dates | Not supplied |

For every matrix row, retain: board/release identity; procedure revision; operator/date; actual motor/load/ambient; instrument setup; programmed settings; numeric expected limits and their source; readings with units; waveform/photo/log filenames; PASS/FAIL; and the engineer's disposition. A record labelled “not tested” is not acceptable shipment evidence.

First-article qualification covers operating corners and fault behavior. The provider must then approve a repeatable production acceptance procedure and duration. Every shipped board needs its own programming verification and both-direction motor/fault record; a single prototype video does not accept the batch. Neither that production procedure nor any powered result has been approved yet. See the [prepared provider request and programming sequence](assembly.md#request-to-send-to-the-assemblytest-provider).
