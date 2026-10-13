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
| TPS26630 IMON | R26 converts current-monitor output for the ADC, with no external IMON bypass capacitor, per [TI §8.3.9](https://www.ti.com/lit/ds/symlink/tps2663.pdf). Connectivity regressions guard this rule. |
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
| R60/R61 = 180 kΩ + 16.2 kΩ; R62 = 10 kΩ; R63 = 1 MΩ | Brake nominal on 52.04 V / off 51.39 V | Measured hysteresis, comparator offset/noise and switching overshoot |
| R64 = 430 kΩ; R65/R66 = 20 kΩ + 1.2 kΩ | Motor inhibit nominal 53.21 V; tolerance envelope must stay below 55 V with allocated transient margin | Dynamic shutdown response and regenerated energy after inhibit |
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

U6 is TPS26630RGER (C1850276), with R25 = 4.99 kΩ RN73R1JTTD4991B25 (C7293210). The formula gives 3.607 A nominal motor-input limiting, about 173 W at 48 V; this is not a phase-current limit. The initial 0.1% plus 25 ppm/°C over a 100°C excursion is included. A conservative ±10% device allocation around the table-derived coefficient screens 4.002 A maximum, plus a 0.250 A upstream allocation = 4.252 A, leaving 0.748 A below the 5 A contract. This interpolation is not a manufacturer-guaranteed corner at 4.99 kΩ, and upstream consumption is not measured. TPS26630 removes the old TPS26631 25.5 ms nominal 2× allowance; finite response, its separate 2× fast-trip threshold, latch-off thermal behavior and exact source/cable coordination still require qualification. See [TI sections 6.5 and 8.3.7.1](https://www.ti.com/lit/ds/symlink/tps2663.pdf), [KOA RN73R](https://www.koaspeer.com/pdfs/RN73R.pdf) and [input-protection evidence](../engineering/input-protection/selection.json).

The 940 µF bank stores about 1.08 J at 48 V but accepts only about 0.237 J between 48 V and 53 V. A nominal 10 Ω brake dissipates about 270 W at turn-on; 55 V across a −2% resistor would dissipate 309 W. The candidate [Vishay LPS300](https://www.vishay.com/docs/50052/lps300.pdf) is rated 300 W only with its case at or below 85 °C. If this candidate is chosen, it needs a designed heatsink and a verified pulse-energy/repetition budget. The 300 W rating is not a confirmed requirement. See [J3 use and fit/omit decision](brake-integration.md). The ordered motor's [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) specifies rotor inertia of 1400 g·cm² (0.00014 kg·m²), also recorded in `motor-data.json`. Rotor-only kinetic energy is ½J(2π·RPM/60)²; operating RPM, driven-load inertia, gravity and stop/repetition profile remain unspecified, so no application brake-energy qualification is claimed.

The audit now explicitly keeps `full_current_operation_authorized: false` and lists five open operating risks independently of static-check success. With the brake unavailable, returning nominal winding energy after nominal inhibit gives a lossless 55.28 V screen; upper inhibit threshold and minimum initial capacitance give 56.38 V. Including +20% inductance raises that screen to 56.88 V. Mechanical regeneration, current tolerance, ESR/ESL and dynamic response are not included. These are not predicted waveforms, but they exceed the driver's 55 V operating limit. Lowering the cutoff alone or observing driver disable does not establish a safe energy path.

C22/C23 each have a manufacturer ripple rating of 1.995 A RMS at 100 kHz. Equal sharing and the actual chopping/braking spectrum remain unqualified. The compiled `BRAKE_RETURN` net connects only J3 and Q16; no explicit clamp/snubber is established. Measure both capacitors and Q16 with the final harness before accepting a capacitor or transient-protection design. The existing local TMP102 threshold also does not establish MOSFET, shunt, connector or winding temperatures.

The six motor-current copper paths in [filled-copper-review.json](../engineering/filled-copper-review.json) were recalculated at 0.075/0.05 mm meshes before the U6/R25 identity/value change. That report retains its original PCB hash; [native-change-check.json](../engineering/input-protection/native-change-check.json) proves exact PCB text equivalence except the listed identity/value substitutions, with pads, nets, placement, tracks, vias and pours unchanged. The subsequent [R61/R66 equivalence check](../engineering/brake-protection/native-change-check.json) extends that geometry chain to the current PCB. The solver was not rerun for these identity/value changes. The DC resistance model does not qualify current or temperature rise.

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
| Brake unavailable | Controlled brake-open, loss of brake drive and supply-loss cases; progress from bounded low stored energy only after the test fixture and limits are reviewed | Capture bus, phase current, inhibit and brake-drive behavior. Driver disable must not be treated as energy absorption; stop before any component's operating limit is crossed | Not tested |
| Ripple and brake turn-off | Intended brake cable, repetitive switching and each bulk capacitor under the agreed load/duty | Qualify Q16 VDS/ringing, clamp/snubber if required, each capacitor's RMS ripple and temperature against manufacturer limits | Not tested |
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

## Input protection implementation and brake coordination

U6/R25 are updated in TSX and native KiCad schematic/PCB, preserving their physical pads, routing and pin nets. `scripts/simulate-input-protection.py` reruns thirteen behavioral scenarios at two timesteps; see [results](../engineering/input-protection/simulation.json). The revised idealized input envelope peaks at 3.858 A nominal or 4.252 A in the upper screen, including the 250 mA upstream allocation, versus 8.985 A for the previous modeled pulse allowance. Real current-loop overshoot is not modeled. At a synthetic 10 A demand the bus falls below 44 V in about 0.53–0.56 ms; this is evidence that the requested power cannot be supplied, not successful motion. The current cap needs coordinated power-good/fault response and winding-energy qualification.

A candidate **upper cutoff corner** of 53.3 V (not a selected nominal threshold) gives 54.189 V with the modeled working brake, but 56.430 V with that brake open. That was the previous candidate study. R61 and R66 have now been changed as described below; the current upper cutoff screen is 53.826 V, not that candidate 53.3 V. The same 0.1371 J winding-only sensitivity with 752 µF requires an initial bus at or below 51.046 V to stay below the selected 54.5 V screening target without a brake. Continuing mechanical return is excluded. This leaves too little space above the 50.4 V high-source allowance for the present cutoff tolerance envelope, and shows why threshold-only changes cannot close the running open-brake fault.

Startup continuity feedback, running brake-fault energy containment, a qualified RPM/current/load envelope, resistor cooling and hardware testing remain open. The stock gate also remains failed on unrelated BOM entries. No manufacturing release or motion unlock accompanies this change.

U6 uses the same exposed-pad RGE package and existing copper. With TI's 53 mΩ maximum on-resistance at 125°C, fully enhanced conduction loss screens at 0.690 W at the nominal limit or 0.849 W at the upper current screen. During active limiting, a 4 V drop instead dissipates about 14.43 W at the nominal limit until regulation or shutdown intervenes. These are different operating conditions: no steady temperature or SOA qualification follows from the conduction figure. MODE remains open for latch-off; verify overload, cooling and controlled restart on the exact assembled PCB.

## First-prototype scope after the PD-1180 reference review

The [reference assessment](reference-review.md#pd-1180-and-the-first-prototype) supports proceeding with a bounded motor-only commissioning profile while the final application remains unknown. Firmware now rejects current requests above 180 permille in both initialization and runtime APIs, corresponding to IRUN=4 and nominal 0.842 A RMS. The existing VMAX=11930 and AMAX=130 limits correspond to approximately 10 rpm and 10 rpm/s at 12 MHz; nominal ramp stopping time is about 1 s. No motor-qualification flag is enabled.

The power audit calculates 0.0000768 J nominal rotor energy at this speed, compared with 0.768 J at 1000 rpm, using the ordered motor's published inertia. Nominal winding energy at the commissioning setting is 0.00248 J. These are calculated values, not measured returned energy.

A separate lossless sensitivity allocates 1.5 A instantaneously in each phase, 15 rpm, +20% inductance and −20% bulk capacitance. Returning all 0.00962 J raises a 50.4 V bus to 50.653 V. With the revised R66 and expanded comparator error screen, starting at the upper cutoff corner gives 54.063 V, or **54.563 V after the 0.5 V transient allocation**. The residual 0.437 V is a conditional calculation, not a guaranteed hardware margin. The assumed current/speed bounds themselves require measurement. Brake continuity, running-fault containment and coordinated threshold work remain open; neither this screen nor the PD-1180 manual authorizes removing J3 or operating at full current.


## Applied brake/cutoff resistor changes

R61 is now **16.2 kΩ RT0603BRD0716K2L / C728583** and R66 is **1.2 kΩ RT0603BRD071K2L / C136970**, both YAGEO RT0603, 0.1%, 25 ppm/°C. Their source, manifest and native PCB/schematic values match. No footprints, pads, labels, traces or vias moved; see [selection and native evidence](../engineering/brake-protection/README.md). Manufacturing/viewer release archives remain historical and are not approved for this change.

The audit now separately includes the TLV3201 56 dB CMRR and 65 dB PSRR bounds: a 1.2 V common-mode excursion and 0.9 V supply excursion add 2.408 mV to the existing 4 mV offset and 2 mV noise/hysteresis allocation. High-output headroom uses 350 mV at 2.7 V/4 mA. These are screening assumptions; reference loading, aging, parasitics and actual rail/waveform behavior still need qualification.

Calculated absolute brake-on is 51.379–52.644 V, release is 50.732–52.147 V and cutoff is 52.595–53.826 V. The absolute intervals overlap across different boards. On one board, U13 and U14 share the same U12 reference (checked in the compiled netlist), so the reference cannot be simultaneously high and low. Keeping comparator and divider errors independent gives a minimum brake-before-cutoff gap of **0.108 V**, verified against all 256 modeled corner combinations. The minimum release margin above a 50.4 V source plus 0.3 V allocation is only **0.032 V**. Neither gap establishes dynamic margin.

No brake-continuity circuit has been added. U30 AIN2 is still grounded, and the board cannot report a disconnected J3 resistor. A return-voltage monitor is a possible next design step, but requires new sourced components, routing, unpowered-input/backfeed analysis and tests that distinguish legitimate brake switching from an open circuit. The mandatory exact-stock gate is failing, so new placement/routing and release remain held under `AGENTS.md`. This limitation must not be represented as an implemented interlock or resolved brake fault.
