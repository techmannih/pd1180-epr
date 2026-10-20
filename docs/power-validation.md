# Power validation and prototype order review

**Status: 2026-10-13 power/thermal ECO; ordering and motion remain held. No PCB has been assembled or powered.** The current user authorization covers affected protection and firmware changes. The source, native checks, stock evidence and simulation results must match this revision; the tests below remain mandatory.

## Historical native CAD recheck — 2026-10-11

The native PCB SHA-256 at that historical revision was `7e46297f0bf288c2a8add54f65b2da0cff8255a7ed4c24951f7746c24f01f1d6`, after the diagnostics ECO and the source-warning cleanup. The latter changes assembly metadata and schematic layout only; [the exact native/source comparison](checks/warning-fix-parity.json) verifies unchanged PCB geometry, copper and pin connectivity. RGB, independent power indication, a driven buzzer and isolated EEPROM programming/probe access are now routed. The diagnostics and EEPROM connections are included in the 27 A4 schematic sheets. The warning cleanup preserves all electrical connectivity and the complete PCB route. Fresh native checks found zero DRC violations, unconnected items, schematic-parity issues and ERC violations. Raw reports: [PCB](checks/pre-order-native-drc.json), [schematic](checks/pre-order-native-erc.json). That historical result does not describe the current DRC: the current native baseline retains 401 silkscreen/text findings. The latest full review is recorded in [verification.json](verification.json), including failures.

| Review area | Finding |
|---|---|
| Assembly and geometry | 252 fitted parts plus 19 service pads on top; minimum via drill 0.30 mm; 55 filled/capped via-in-pad locations |
| Local routing | All 43 specified IC bypass paths and the separate buzzer bulk branch, nine Kelvin/analog branches, USB reference and power-routing checks passed |
| Earlier filled-copper calculation | At the earlier bridge revision, solved MOTOR_A1 Q7:9 → R115:1 at 0.075/0.05 mm mesh: 2.8995/2.8941 mΩ, 0.187% difference; fine-mesh loss 0.0875 W at 5.5 A, excluding contacts/devices and thermal feedback. B1 drain-to-shunt and all four motor-output paths were also screened at both mesh sizes; results and limitations are in the [evidence](../engineering/filled-copper-review.json). |
| Driver initialization | Fixed reliance on OTP short-detection and dead-time defaults. Explicit register writes, disabled-chopper sequencing and write-corruption regressions pass. The regression failed on the previous configuration. See [firmware details](../firmware/README.md#tmc5160-external-stepdir-service) |
| TPS2663 current monitor | **Corrected:** removed C19 from source and native PCB; R26 and the ADC connection remain. The compiled-connectivity regression rejects an IMON-to-ground capacitor even after reference/net renaming. TI §8.3.9 prohibits this bypass because it delays current information; this is separate from the internal current limit. |
| Programming and operation | The TPS26750 full-flash image is generated and register-reviewed; physical programming is pending. Qualified motor-operation firmware remains absent. The supplied STM32 image supports commissioning diagnostics and deliberately keeps motion locked. The ordered motor is now identified as 34HS31-6004S1; approved current settings, load, stop profile and adapter/cable qualification remain open. |

The earlier C19-only correction preserved all other pads and existing tracks/vias at that revision. Later authorized placement and diagnostics changes have their own fresh routing and manufacturing checks; that historical comparison does not describe the current route. See the `c19_correction` entry in [native placement evidence](../engineering/top-side-placement.json). The source connection was checked against [TI TPS2663 §8.3.9](https://www.ti.com/lit/ds/symlink/tps2663.pdf); generic CAD connectivity checks alone did not detect this component-specific rule.

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
| R60/R61 = 180 kΩ + 16.2 kΩ; R62 = 10 kΩ; R63 = 1 MΩ | Brake nominal on 52.04 V / off 51.39 V | Measured hysteresis, comparator offset/noise and switching overshoot |
| R64 = 430 kΩ; R65/R66 = 20 kΩ + 1.2 kΩ | Motor inhibit nominal 53.21 V; tolerance envelope must stay below 55 V with allocated transient margin | Dynamic shutdown response and regenerated energy after inhibit |
| R22 = 4.7 kΩ; R23 = 422 kΩ; R24 = 10 kΩ | eFuse input OVP nominal 52.40 V; screened 50.93–53.89 V, retaining margin above a 5% high 48 V source | Source tolerance, eFuse input leakage and PD transient coordination |

Reference data: [TI LMR36510 tables 8-1/8-4](https://www.ti.com/lit/ds/symlink/lmr36510.pdf), [Bourns SRP7050TA](https://www.bourns.com/docs/product-datasheets/srp7050ta.pdf), [REF34](https://www.ti.com/lit/ds/symlink/ref34.pdf), [TLV3201](https://www.ti.com/lit/ds/symlink/tlv3201.pdf), [TPS2663](https://www.ti.com/lit/ds/symlink/tps2663.pdf), and [CSD19534Q5A](https://www.ti.com/lit/ds/symlink/csd19534q5a.pdf).

`bun run check:power-audit` calculates the actual fitted-value envelopes and writes [the machine-readable report](../engineering/power-audit.json). The report hashes its source inputs. Its screening result does not assert that the hashed native PCB implements the new source: routing fingerprint, parity, DRC, local-copper and power-routing checks are separate mandatory gates. The 2 mV comparator noise/hysteresis and 0.5 V dynamic overshoot allowances are engineering allocations requiring measurement. Capacitor bias, switching losses, parasitics and thermal boundary conditions are not simulated.

C87 has a documented 3.3 mm pad-center placement limit: VIN is the second pin in U34's PowerPAD package, and the adjacent 0805 capacitor must clear the PGND land and package courtyard. Actual separation is approximately 3.166 mm, with a constrained top-layer path under 5 mm. All other bypass targets retain the 3 mm placement limit. This is not an exception to copper clearance, connectivity or the short ground-return requirement. L3 uses the manufacturer's recommended land pattern; its 3D object is a dimensioned body envelope, not a manufacturer STEP model.

At that historical diagnostics revision, the native PCB had 252 fitted parts and 19 service pads on top, a minimum 0.30 mm finished via drill, 40 MOSFET drain thermal vias and four U34 exposed-pad thermal vias. The drill-over-solder-land audit counts **55 via-in-pad locations**, all requiring the selected filled/capped process. Exact coordinates and the board hash are in the `power_eco_via_audit` entry of `engineering/top-side-placement.json`; order settings carry the same count. Native routing checks verify all 43 specified IC-to-capacitor same-side paths within 5 mm, all nine Kelvin/analog-return branches, USB reference continuity and the power-corridor policy. The native bypass regression rejects the earlier copper with five missing or excessive paths.

## Diagnostics load allocation

The diagnostics ECO adds the U35 GPIO expander, D16 RGB indicator, independent D17 board-power indicator and Q26-driven BZ1 buzzer, plus U36 for EEPROM programming isolation. Reserve 75 mA across the logic rails for the added diagnostics load (0.27 W at 3.6 V). The buzzer datasheet specifies up to 30 mA at its 3 V test point; the 60 mA buzzer allocation at the actual board rail is a design allowance, not a measured guarantee. Measure startup, alarm pulses and rail ripple on first assembled hardware. The upstream 5 A PD budget must include this load and regulator losses.

U35/C95 use PD_3V3 so that their supply follows the I²C pull-ups; the LED/buzzer loads remain on V3V3. R126 is 1 kΩ, limiting a 3.6 V gate-charging step below U35's 10 mA high-output limit; R127 is 100 kΩ so the gate defaults off while retaining drive headroom. Firmware holds U35 in reset during missing board power, USB-only power and USB suspend, and reads back its configuration/output latch during operation. C95/C97 are local IC bypasses; C96 is a separate 10 µF buzzer bulk branch. Component pin maps, state behavior and physical qualification steps are documented in [indicators](indicators.md) and [PD programming](pd-programming.md).

## What the power numbers establish

The conservative ceiling is now 3.8 A RMS, not a motor-qualified setting. GLOBALSCALER=139 and IRUN=31 command 3.781 A RMS nominal; the sine peak is 5.348 A. A ±5% driver / ±1% shunt sensitivity screen reaches 5.672 A peak, below the ordered motor's 6 A/phase label, but this is not a guaranteed motor/driver thermal limit. Initial IRUN=6 commands approximately 0.827 A RMS. The three qualification flags stay false.

At the 3.8 A design ceiling, each 33 mΩ regulation shunt dissipates at most 0.477 W cycle-average or 0.953 W at held peak in the simplified screen. Eight bridge MOSFETs total 0.872 W conduction at maximum 25°C on-resistance, or 1.744 W with doubled resistance; switching losses are additional. Two motor windings dissipate about 13.86 W using 0.48 Ω at 25°C. These are electrical loss estimates, not junction or case temperature predictions.

U6 is TPS26630RGER, with MODE open for 1× active current limiting followed by latch-off. R25 is now 4.99 kΩ / C7293210, 0.1%, 25 ppm/°C: 3.607 A formula nominal and 4.002 A conservative upper screen. Including a 250 mA upstream allocation gives 4.252 A. The ±10% device allocation/interpolation is not a manufacturer-guaranteed bound at this resistance. This reduces the nominal 48 V motor-input budget from 205 W to 173 W. Source/cable response, finite fast-trip overshoot, SOA and actual upstream draw remain bench qualifications.

The 940 µF bank stores about 1.08 J at 48 V but accepts only about 0.237 J between 48 V and 53 V. A nominal 10 Ω brake dissipates about 270 W at turn-on; 55 V across a −2% resistor would dissipate 309 W. The selected [Vishay LPS300](https://www.vishay.com/docs/50052/lps300.pdf) is rated 300 W only with its case at or below 85 °C. It needs a designed heatsink and a verified pulse-energy/repetition budget. The ordered motor's [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) specifies rotor inertia of 1400 g·cm² (0.00014 kg·m²), also recorded in `motor-data.json`. Rotor-only kinetic energy is ½J(2π·RPM/60)²; operating RPM, driven-load inertia, gravity and stop/repetition profile remain unspecified, so no application brake-energy qualification is claimed.

## Evidence required before submitting a prototype order

- Fresh source build, electrical tests, schematic checks and native PCB/schematic parity; zero DRC violations and unconnected items.
- Top-only fitted BOM/CPL, local bypasses, preserved Kelvin paths, four-layer stack, at least 0.30 mm finished via drills, drain thermal vias and uninterrupted USB reference evidence.
- Fresh Gerber/drill ZIP and matching BOM/CPL, with SHA-256 provenance. Reject older ZIPs and manually substituted files.
- Exact stock/package checks for the actual order quantity, plus manufacturer confirmation of filled/capped via-in-pad processing and the chosen impedance stack-up.
- Review of the ordered 34HS31-6004S1 current waveform, supply/cable, maximum speed, stop time, rotor/load inertia, ambient temperature, enclosure and brake heatsink. These operating details remain unqualified.
- A documented PD programming path. `docs/pd-configuration.json` now identifies the reviewed TI-generated full-flash candidate. Physical programming/readback and cold boot remain open. Do not substitute JSON for the EEPROM binary.

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
| Inhibit matrix | Brake preflight faults, MCU reset/watchdog, PGOOD loss, overvoltage and overtemperature | Bridge disables for every fault; no automatic restart without the intended permit sequence | Not tested |
| Low-current motor | Start below rated phase current; inspect all bridge VGS/VDS and current waveforms | Correct phase/polarity; no shoot-through; bootstrap/gate limits respected before increasing current | Not tested |
| Rated-current soak | Increase current in stages, then standstill and loaded motion at worst intended ambient | Measured RMS/peak current and all derated component/motor temperatures acceptable; document thermal equilibrium | Not tested |
| Regeneration | Defined load, speed, stop time and repeated stops, including USB loss | Bus remains within limits; brake pulse/average energy and temperatures pass; no uncontrolled movement | Not tested |
| Interfaces and compliance | USB during switching, local START/STOP, cable faults, optional magnetic alignment, ESD/EMC | Meets the intended system requirements and applicable test limits; record failures | Not tested |

Full-power operation is established only after these measurements on assembled hardware. A passing design calculation or CAD report cannot close the powered, thermal or EMC gates.

## Reference setup and new behavioral screens

The user's [ADI PD-1180 reference](https://www.analog.com/en/products/pd-1180.html) supports 24/48 V nominal operation and up to 5.5 A RMS with its own 7 Nm motor. That current/thermal rating does not transfer to this board and the ordered 4.8 Nm motor. The proposed source reference is the [Framework 240 W Power Adapter](https://frame.work/products/power-adapter-240w), whose official specification lists fixed outputs through 48 V and an included USB-C cable. A 240 W / 48 V point corresponds to 5 A; no purchased unit, negotiated PDO trace, cable identity or source shutdown curve has been qualified.

For first powered motion qualification, use the ordered motor with **no attached load, 10 rpm maximum, 10 rpm/s ramp, approximately 0.827 A RMS, and 20–25°C room ambient**, only after the staged stationary supply/gate/fault checks pass. The rotor-only energy at 10 rpm is 0.0000768 J. These are chosen test limits, not inferred application requirements. Keep the external 10 Ω brake installed. Full-load speed, inertia, vertical/gravity loads, repetition and heatsink selection remain separate approval gates; no application capability is promised.

Run `python3 scripts/simulate-power-eco.py` with libngspice available. [Fourteen reproducible decks and results](../engineering/power-eco-simulation/results.json) use updated current/threshold tolerances and both normal and half timesteps. They are behavioral models, not vendor transistor-level models or measured hardware. Healthy winding-release corner peaks at **53.998 V**, leaving 0.502 V after a separate 0.5 V transient allocation below the 55 V operating ceiling. The same full-current case with an open brake reaches **55.393 V** and fails the operating limit. The low-current commissioning winding-release case with open brake peaks at **53.904 V**; this does not authorize operation without the brake.

A rotor-only 1000 rpm example returns 0.768 J: the open-brake corner reaches **65.918 V**. A deliberately excessive 5 J / 20 ms stop reaches **61.561 V even with the brake working**. Both remain prohibited examples. The input model gives **4.252 A** for the new 1× corner versus **7.10 A** for the previous 2× reference. The model omits sub-microsecond cable/layout ringing, nonlinear motor dynamics, magnetic saturation and source-specific protection. Normal/fine timestep agreement and energy residual checks validate the numerical screen only.

D20 is a 100 V / 10 A SS10100 SMBF diode, anode at BRAKE_RETURN and cathode at VMOTOR. It provides a local path for brake cable inductance when Q16 opens. At an assumed 20 µH and 5.61 A, cable energy is 0.315 mJ; that assumption is not a cable measurement or repetitive diode thermal qualification. Scope Q16 VDS, D20 current and bus voltage over the actual cable length and repeated stops.

R134/R135 = 4.7 kΩ each, R136 = 510 Ω and C98 = 10 nF feed U30 AIN2. Firmware needs three distinct fresh readings with 44–50.4 V bus and reconstructed BRAKE_RETURN within ±10% of the bus before RUN. The divider deliberately draws enough current that D20's datasheet 2 mA hot reverse leakage cannot impersonate a connected resistor: the screened open return stays below 20.22 V. Each upper 1206 resistor dissipates about 0.145 W at 55 V; local temperature must meet its 250 mW derating curve. Startup qualification is followed by bounded voltage monitoring during RUN. The ADC multiplexes bus and brake-return conversions, normally up to 40 ms apart. A low return can therefore accompany an older 48 V bus sample during normal Q16 switching. Both channels must be valid and no older than 100 ms. The first mismatching observation starts a fixed 100 ms retry window regardless of the stored bus value, allowing a complete new ADC scan. Only a distinct fresh healthy pair within ±10% at 44–50.4 V clears the pending mismatch. Repeated polls, continued bad pairs, or just one updated channel cannot renew the deadline. Invalid/stale ADC or a bus outside 44–55 V faults immediately at the next check. The separate 44–51 V motor-bus interlock remains active. Checks run every 50 ms, followed by the 10 ms control tick. The 60 ms ADC scan, first detection, 100 ms retry and polling phase can accumulate to roughly 270 ms plus conversion/filter/I2C timing; this is not a guaranteed 100 ms disconnect-to-inhibit response. Measure the actual bound before enabling motion. A brake pulse that prevents a healthy pair for the whole retry window deliberately inhibits motion. It does not verify resistor value, Q16 switching, heatsink capacity or independent backup energy containment.

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
| TI configuration/full-flash hashes and motor-test firmware hash | TI candidate and locked commissioning image recorded; no qualified motor-enabled image |
| Fixture revision, instrument list and calibration dates | Not supplied |

For every matrix row, retain: board/release identity; procedure revision; operator/date; actual motor/load/ambient; instrument setup; programmed settings; numeric expected limits and their source; readings with units; waveform/photo/log filenames; PASS/FAIL; and the engineer's disposition. A record labelled “not tested” is not acceptable shipment evidence.

First-article qualification covers operating corners and fault behavior. The provider must then approve a repeatable production acceptance procedure and duration. Every shipped board needs its own programming verification and both-direction motor/fault record; a single prototype video does not accept the batch. Neither that production procedure nor any powered result has been approved yet. See the [prepared provider request and programming sequence](assembly.md#request-to-send-to-the-assemblytest-provider).

## PR #2 integration — 2026-10-13

The latest main ECO is retained: D20, startup brake-feedback path, GS=139, 3.8 A design ceiling and three false motion/configuration/brake locks. The low-level driver now rejects requests above 240 permille before SPI; the target uses the same constant. The 0.827 A / 10 rpm unloaded profile still requires a qualified external brake.

The refined comparator screen includes output swing, common-mode and supply rejection and correlated U12 reference error. R61 is 16.2 kΩ / C728583 and R66 is 1.2 kΩ / C136970. Brake release minimum is 50.732 V, only 31.8 mV above the allocated 50.7 V source/noise screen; minimum same-board brake-on/cutoff separation is 107.5 mV. These small analytical margins require measured validation. Static passing results do not close runtime brake failure.

Fourteen scenarios replace the earlier nine-case set. Added cases cover delayed brake recovery, simultaneous restricted rotor/winding energy and 10 A input load requests. Every winding case checks energy balance, and both voltage and overload-current timestep sensitivity are bounded. D20 switching/cable inductance remains outside these reduced bus models. Current numerical results are in `engineering/power-eco-simulation/results.json`; they do not authorize motor operation.

The 100 µs brake-recovery sensitivity at the full design-current corner reaches 54.910 V; adding the 0.5 V transient allowance exceeds 55 V. The restricted 1.5 A-per-phase / 15 rpm simultaneous return reaches 54.057 V. These contrasting results retain the operating hold and are not a guaranteed bound for an actual fault.
