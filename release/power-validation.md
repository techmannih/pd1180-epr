# Power validation and prototype order review

**Engineering review only; order hold remains. No assembled-board powered results are available.** CAD checks, analytical estimates and measured performance are separate. Current automated results, including failures, are in [verification.json](verification.json); native reports are [PCB DRC](../dist/manufacturing/kicad-drc.json) and [schematic ERC](../dist/manufacturing/kicad-erc.json).

## Current evidence and limits

| Review area | Evidence and limitation |
|---|---|
| Assembly | 247 fitted parts and 19 bare service pads on top; U18/C52/C53 bottom DNP. Source/package/stock checks remain separate. |
| Schematic | 23 A4 sheets; source/style checks recorded by verification. |
| Local copper | [Native bypass paths](native-decoupling-check.json), [Kelvin branches](critical-copper-check.json), [USB reference](../docs/usb-reference-check.json) and [power routing](power-routing-check.json) contain the measured CAD paths and input hashes. |
| Filled-copper study | [Mesh calculation](../engineering/filled-copper-review.json) records its own board snapshot, assumptions and losses. It is a design study, not a fresh current-board thermal test. |
| Driver configuration | Explicit register initialization, disabled-chopper sequencing and host regressions; [firmware details](../firmware/README.md). Gate/current waveforms remain unmeasured. |
| TPS26631 IMON | R26 converts current-monitor output for the ADC, with no external IMON bypass capacitor, per [TI §8.3.9](https://www.ti.com/lit/ds/symlink/tps2663.pdf). Connectivity regressions guard this rule. |
| Operation | TI full-flash image, qualified motor-enabled firmware, current/load/stop envelope, mechanical installation and provider acceptance are pending. |

Use the matching manufacturing package and its delivery hashes. Programming and agreed powered acceptance must precede any ready-to-run delivery; see [assembly requirements](assembly.md).

## Driver supply and protection calculations

U34 generates a separate 12 V rail from VMOTOR for U7 VSA/12VOUT, C61 and U15. U7 VS remains on VMOTOR. VSA's recommended operating limit is 50 V; the external-supply range is 10–13 V. A connectivity regression rejects a short between these rails. See [TMC5160A §3.2 and §28](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf).

| Circuit | Design basis | Remaining qualification |
|---|---|---|
| U34 LMR36510ADDAR, L3 47 µH, R121 100 kΩ / R122 9.09 kΩ | Nominal 12.001 V; screened 11.57–12.57 V including resistor temperature and PFM allowances | Startup, ripple, bus collapse and driver/brake load steps |
| L3 SRP7050TA-470M | 37.6 µH at −20% versus approximately 23.1 µH minimum; 2.7 A saturation rating at 25 °C versus 2.4 A maximum high-side current limit | Hot saturation, loss and temperature rise |
| C86/C87 input; C88 VCC; C89 bootstrap; C90–C92 output | 2.2 µF + 220 nF / 100 V input; 1 µF VCC; 100 nF bootstrap; 3 × 22 µF / 25 V output | Effective capacitance under bias/temperature, switch-loop waveform and return paths |
| C32–C35 470 nF / 50 V X7R | MOSFET maximum gate charge is 22 nC; ADI recommends 470 nF above 20 nC. These capacitors see floating gate-drive differential voltage, not the full bus | Bootstrap droop, gate overshoot, dead time and minimum off-time |
| U12 REF3425, C93/C94 | 2.5 V precision reference, with input/output bypassing | Reference startup and operation during loss of either USB input |
| R60/R61 = 180 kΩ + 16 kΩ; R62 = 10 kΩ; R63 = 1 MΩ | Brake nominal on 51.99 V / off 51.34 V | Measured hysteresis, comparator offset/noise and switching overshoot |
| R64 = 430 kΩ; R65/R66 = 20 kΩ + 1 kΩ | Motor inhibit nominal 53.69 V; tolerance envelope must stay below 55 V with allocated transient margin | Dynamic shutdown response and regenerated energy after inhibit |
| R22 = 4.7 kΩ; R23 = 422 kΩ; R24 = 10 kΩ | eFuse input OVP nominal 52.40 V; screened 50.93–53.89 V, retaining margin above a 5% high 48 V source | Source tolerance, eFuse input leakage and PD transient coordination |

Reference data: [TI LMR36510 tables 8-1/8-4](https://www.ti.com/lit/ds/symlink/lmr36510.pdf), [Bourns SRP7050TA](https://www.bourns.com/docs/product-datasheets/srp7050ta.pdf), [REF34](https://www.ti.com/lit/ds/symlink/ref34.pdf), [TLV3201](https://www.ti.com/lit/ds/symlink/tlv3201.pdf), [TPS2663](https://www.ti.com/lit/ds/symlink/tps2663.pdf), and [CSD19534Q5A](https://www.ti.com/lit/ds/symlink/csd19534q5a.pdf).

`bun run check:power-audit` calculates the actual fitted-value envelopes and writes [the machine-readable report](../engineering/power-audit.json). The report hashes its source inputs. Its screening result does not assert that the hashed native PCB implements the new source: routing fingerprint, parity, DRC, local-copper and power-routing checks are separate mandatory gates. The 2 mV comparator noise/hysteresis and 0.5 V dynamic overshoot allowances are engineering allocations requiring measurement. Capacitor bias, switching losses, parasitics and thermal boundary conditions are not simulated.

C87 has a documented 3.3 mm pad-center placement limit: VIN is the second pin in U34's PowerPAD package, and the adjacent 0805 capacitor must clear the PGND land and package courtyard. Actual separation is approximately 3.166 mm, with a constrained top-layer path under 5 mm. All other bypass targets retain the 3 mm placement limit. This is not an exception to copper clearance, connectivity or the short ground-return requirement. L3 uses the manufacturer's recommended land pattern; its 3D object is a dimensioned body envelope, not a manufacturer STEP model.

The manufacturing specification requires at least 0.30 mm finished via drills and filled/capped processing for all identified via-in-pad locations. Counts, coordinates and applicable input hashes must be checked in the current manufacturing/assembly reports and order settings. The native copper checks enforce local bypass routes and Kelvin branches; they do not establish temperature rise on hardware.

## Diagnostics load allocation

The diagnostics circuitry uses the U35 GPIO expander, D16 RGB indicator, independent D17 board-power indicator and Q26-driven BZ1 buzzer, plus U36 for EEPROM programming isolation. Reserve 75 mA across the logic rails for the diagnostics load (0.27 W at 3.6 V). The buzzer datasheet specifies up to 30 mA at its 3 V test point; the 60 mA buzzer allocation at the actual board rail is a design allowance, not a measured guarantee. Measure startup, alarm pulses and rail ripple on first assembled hardware. The upstream 5 A PD budget must include this load and regulator losses.

U35/C95 use PD_3V3 so that their supply follows the I²C pull-ups; the LED/buzzer loads remain on V3V3. R126 is 1 kΩ, limiting a 3.6 V gate-charging step below U35's 10 mA high-output limit; R127 is 100 kΩ so the gate defaults off while retaining drive headroom. Firmware holds U35 in reset during missing board power, USB-only power and USB suspend, and reads back its configuration/output latch during operation. C95/C97 are local IC bypasses; C96 is a separate 10 µF buzzer bulk branch. Component pin maps, state behavior and physical qualification steps are documented in [indicators](indicators.md) and [PD programming](pd-programming.md).

## What the power numbers establish

At the 5.5 A RMS design target the sinusoidal phase peak is 7.78 A. The full-current design-screen scaler nominally commands about 5.386 A RMS; this is not the locked commissioning profile (approximately 0.84 A RMS). That calculation is not a calibrated phase-current measurement. A 33 mΩ sense resistor has a conservative cycle-average bound of 1.00 W and a held-peak bound of 2.00 W. The eight bridge MOSFETs have approximately 1.83 W total conduction loss using maximum 25 °C on-resistance; doubling resistance gives 3.65 W. Neither number includes switching loss or predicts junction temperature.

The eFuse limit is about 4.48 A nominal at the input, not a phase-current limit. The screened upper limit leaves only about 0.14 A from a 5 A PD contract for upstream logic. TPS26631 also permits overload pulses. Source/cable negotiation, logic consumption and overload behavior must be tested together.

The 940 µF bank stores about 1.08 J at 48 V but accepts only about 0.237 J between 48 V and 53 V. A nominal 10 Ω brake dissipates about 270 W at turn-on; 55 V across a −2% resistor would dissipate 309 W. The candidate [Vishay LPS300](https://www.vishay.com/docs/50052/lps300.pdf) is rated 300 W only with its case at or below 85 °C. If this candidate is chosen, it needs a designed heatsink and a verified pulse-energy/repetition budget. The 300 W rating is not a confirmed requirement. See [J3 use and fit/omit decision](brake-integration.md). The ordered motor's [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) specifies rotor inertia of 1400 g·cm² (0.00014 kg·m²), also recorded in `motor-data.json`. Rotor-only kinetic energy is ½J(2π·RPM/60)²; operating RPM, driven-load inertia, gravity and stop/repetition profile remain unspecified, so no application brake-energy qualification is claimed.

## Evidence required before submitting a prototype order

- Fresh source build, electrical tests, schematic checks and native PCB/schematic parity; zero DRC violations and unconnected items.
- Top-only fitted BOM/CPL, local bypasses, preserved Kelvin paths, four-layer stack, at least 0.30 mm finished via drills, drain thermal vias and uninterrupted USB reference evidence.
- Fresh Gerber/drill ZIP and matching BOM/CPL, with SHA-256 provenance. Reject older ZIPs and manually substituted files.
- Exact stock/package checks for the actual order quantity, plus manufacturer confirmation of filled/capped via-in-pad processing and the chosen impedance stack-up.
- Review of the ordered 34HS31-6004S1 current waveform, supply/cable, maximum speed, stop time, rotor/load inertia, ambient temperature, enclosure and the conditional brake fit/omit decision (including heatsink if fitted). These operating details remain unqualified.
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
| Reference and brake | Controlled bus ramp with rated brake load; both directions and temperature corners | Brake acts before inhibit; VS always below 55 V, including transient allowance; selected resistor pulse/average and case-temperature limits met (≤85 °C at full rating for the LPS300 candidate) | Not tested |
| Inhibit matrix | Retained onboard enable/inhibit paths, MCU reset/watchdog, PGOOD loss, overvoltage and overtemperature; no external enable interface | Bridge disables for every fault; no automatic restart without the intended permit sequence | Not tested |
| Low-current motor | Start below rated phase current; inspect all bridge VGS/VDS and current waveforms | Correct phase/polarity; no shoot-through; bootstrap/gate limits respected before increasing current | Not tested |
| Rated-current soak | Increase current in stages, then standstill and loaded motion at worst intended ambient | Measured RMS/peak current and all derated component/motor temperatures acceptable; document thermal equilibrium | Not tested |
| Regeneration | Defined load, speed, stop time and repeated stops, including USB loss | Bus remains within limits; brake pulse/average energy and temperatures pass; no uncontrolled movement | Not tested |
| Interfaces and compliance | USB during switching, local SW2/SW1 and internal SPI-ramp behavior, cable faults, ESD/EMC; magnetic alignment only if the optional encoder is fitted | Meets the intended system requirements and applicable test limits; record failures | Not tested |

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
| Brake fit/omit decision; exact resistor, heatsink, mounting and airflow if fitted | Operating envelope and installation not qualified |
| Ambient range, enclosure, duty cycle and thermal limits | Not agreed |
| Microsteps, current settings and internal SPI-ramp speed/acceleration/deceleration limits | Not qualified |
| TI configuration/full-flash hashes and motor-test firmware hash | Not available |
| Fixture revision, instrument list and calibration dates | Not supplied |

For every matrix row, retain: board/release identity; procedure revision; operator/date; actual motor/load/ambient; instrument setup; programmed settings; numeric expected limits and their source; readings with units; waveform/photo/log filenames; PASS/FAIL; and the engineer's disposition. A record labelled “not tested” is not acceptable shipment evidence.

First-article qualification covers operating corners and fault behavior. The provider must then approve a repeatable production acceptance procedure and duration. Every shipped board needs its own programming verification and approved motor-profile/fault record; a single prototype video does not accept the batch. Neither that production procedure nor any powered result has been approved yet. See the [prepared provider request and programming sequence](assembly.md#request-to-send-to-the-assemblytest-provider).
