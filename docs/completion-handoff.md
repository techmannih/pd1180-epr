# Prototype completion and acceptance record

This revision replaces the unavailable U16/U35 on main `5bb9d4b`: U16 becomes STM32G0B1CEU6 / UFQFPN48 with 512 KiB flash, while U35 becomes PCA9538PWR with a PD_3V3-powered reset buffer U37. The affected local PCB routing, BOM/CPL, firmware, readback contract and handoff are regenerated together. No physical test results exist; all three motion qualification flags remain false.

## Current revision and retained protections

- Brake feedback continues during RUN. The ADC multiplexes bus and brake-return conversions, normally up to 40 ms apart. A low return can therefore accompany an older 48 V bus sample during normal Q16 switching. Both channels must be valid and no older than 100 ms. The first mismatching observation starts a fixed 100 ms retry window regardless of the stored bus value, allowing a complete new ADC scan. Only a distinct fresh healthy pair within ±10% at 44–50.4 V clears the pending mismatch. Repeated polls, continued bad pairs, or just one updated channel cannot renew the deadline. Invalid/stale ADC or a bus outside 44–55 V faults immediately at the next check. The separate 44–51 V motor-bus interlock remains active. Checks run every 50 ms, followed by the 10 ms control tick. The 60 ms ADC scan, first detection, 100 ms retry and polling phase can accumulate to roughly 270 ms plus conversion/filter/I2C timing; this is not a guaranteed 100 ms disconnect-to-inhibit response. Measure the actual bound before enabling motion. A brake pulse that prevents a healthy pair for the whole retry window deliberately inhibits motion. The control state machine removes RUN/power permission on failure and requires deliberate rearm.
- Host regressions cover running cable-open, reconnection, stale/duplicate conversions, the bounded observation gap, no preflight qualification and timer wrap. The ARM target is rebuilt from the updated source. The archived image still cannot enable motion.
- The exact 409 native-reference text findings are accepted according to the user's instruction. Every raw KiCad finding remains in the package. Changed finding identities, shorts, unconnected items, parity errors and ERC failures are rejected. Native reference names are retained. U16 now uses the ST UFQFPN48 lands and grounded exposed pad; U35 retains its TSSOP lands and existing C95 placement. U37/C99/R137 implement independent-rail reset. Four holes and unrelated components/copper are unchanged.
- The selected U16/U35 shortages are resolved in the current 85-code stock snapshot. Unknown stock, package mismatch and failed engineering checks remain blocking; stock is unreserved. Strict release still requires the documented manufacturing and hardware acceptance.
- The six motor copper paths are re-screened at 0.075/0.05 mm against the current native PCB. Results remain DC analytical estimates, excluding device/contact losses and thermal qualification.
- All four TE320559 splice cylinders are replaced by the manufacturer C-320559 AE STEP, translated without scaling. Nominal length is 32.131 mm (drawing: 1.265 in / 32.13 mm maximum) and nominal maximum diameter is 5.6134 mm. The current V6 drawing and STEP are archived with SHA-256 evidence. Geometry regressions check all four exported bodies against the STEP; conservative harness-clearance checks pass. The uncrimped CAD does not qualify finished-crimp dimensions or physical retention.
- Stock checks query the numeric index first and always attempt the official exact-part lookup, even if the index fails. Only official available-order evidence can pass; a failed lookup or zero quantity cannot fall back to cached index stock. Regression tests exercise those failure paths.
- Exact coloured Alpha3057 wire SKUs, EPR/data cable candidates and programming-tool candidates are specified in [external-system.md](external-system.md). These are identified products, not purchased or physically qualified items.

## Connections and purchases

There are **two VH wire harness connections, J2 and J3**, plus **two USB receptacles, J1 POWER and J10 DATA**. Calling the whole PCB a two-connector board would be inaccurate.

| Connection | Exact purpose and termination | External item / remaining acceptance |
|---|---|---|
| J2 pins 1/2/3/4 | Motor A+/A−/B+/B−; black/green/red/blue, respectively | Ordered 34HS31-6004S1; VHR-4N, four SVH-41T-P1.1 contacts, Alpha3057 16 AWG pigtails and four TE320559 splices. CAD cuts 170/170/170/165 mm include 12 mm allowance. Verify phase continuity, factory insulation OD, crimp tooling/pull test and first-article length/retention. |
| J3.1 → resistor → J3.2 | VMOTOR → external resistor → BRAKE_RETURN/Q16. J3.2 is not permanent ground. | VHR-2N, two SVH-41T-P1.1 contacts, paired Alpha3057 conductors, candidate TE152883 M4 rings and Vishay LPS0300H10R0GB 10 Ω resistor. Final cable length, heatsink, guard and mounting depend on the installation. |
| J1 POWER | Negotiated 48 V / 5 A USB PD 3.1 EPR input | Framework 240 W adapter is a documented candidate, not a qualified/purchased source. Record exact supplied cable identity, EPR/5 A capability, PDO negotiation, droop and overload response. |
| J10 DATA | Optional setup, status and diagnostics; SW2 supplies the local motion request | Select an actual USB data cable/host and verify plug access, enumeration, startup/suspend current and reverse blocking. Laptop USB does not power this motor. |
| SWD / EEPROM pads | Temporary manufacturing/programming fixture | ST-LINK-compatible SWD fixture and separately isolated U3 programming fixture, verified readback, no competing power sources. See `pd-programming.md`. |

SW1 is RESET. SW2 requests START/STOP only after qualification; it is not an emergency-stop or gravity-load holding system. Optional U18/C52/C53 stay bottom DNP. No encoder, rear magnet, CAN/RS485/RS232 controller, J7 harness or bus terminators are needed for the selected open-loop profile.

The 300 W resistor is a **candidate cooling class**, not a universal motor requirement or a free-air rating. At 53 V/10 Ω its instantaneous dissipation is 280.9 W. The datasheet's 300 W rating requires case temperature ≤85°C; 50°C ambient at 280.9 W continuous requires combined interface/heatsink resistance ≤0.125°C/W. This installation is not sized without duty/load data. J3 cannot be removed on the assumption that a slow motor does not need protection. See [brake installation and calculations](brake-integration.md) and [external sourcing list](external-parts.json).

## Exact assembly allocation

The current [official stock snapshot](stock-report.json) controls. The five-board lot needs five each of U16 **C2829190 / STM32G0B1CEU6 / UFQFPN48**, U35 **C201530 / PCA9538PWR / TSSOP16** and new U37 **C7836 / SN74LVC1G17DBVR / SOT23-5**, plus assembler spares. The former two-part shortage is addressed by these replacements; inventory has not been reserved and may change. Use the updated Gerber/BOM/CPL/firmware set together. An old LQFP board cannot accept the new QFN MCU, and an old direct-reset board cannot accept PCA9538 without the reset ECO.

## Physical work and evidence needed

| Stage | Required evidence before advancing |
|---|---|
| Before ordering | Refresh and allocate the exact selected inventory; obtain fabricator acceptance of the actual stackup/USB impedance and filled/capped via-in-pad process. Measure the actual motor rear holes/thread/depth and define secure attachment using the retained four PCB holes. Do not reuse motor tie bolts or add guessed hardware. |
| Harness first article | Verify delivered lead insulation against the current TE application drawing, finished splice envelope, crimp/pull/insulation tests, winding mapping, connector insertion/tool clearance, cable bend/retention and final cut lengths. Current Rev V6 and AE STEP are archived; inspect the finished crimp rather than treating nominal uncrimped CAD as an acceptance gauge. |
| Stationary electrical | Serial-number the PCB. Record BOM/revision, firmware/PD-image hashes and readback; inspect before power. With the bridge inhibited, measure source negotiation, all rails, USB power states/backfeed, eFuse response, brake/cutoff thresholds and fault/restart paths. |
| First motion | Only after stationary checks and a qualified brake installation: securely mounted **unloaded** motor, 20–25°C, nominal 10 rpm, 10 rpm/s, IRUN=6 / GS=139 (about 0.827 A RMS). Capture phase current, gates, VMOTOR and brake waveforms. These are proposed qualification limits, not tested ratings. |
| Brake fault | First inject feedback/open faults with the motor inhibited. A controlled running-open test needs the restricted energy envelope and independent test-rig overvoltage containment. Measure ADC/filter/scheduler detection delay, inhibit timing and peak VMOTOR. Require the 55 V operating limit with the project's transient margin; if it fails, keep motion disabled and revise protection. Do not simply unplug the brake during a high-energy run. |
| Thermal and application | Measure winding, shunt, MOSFET, connector, capacitor, board and resistor temperatures, capacitor ripple and Q16/D20 overshoot. Define load inertia, maximum RPM, deceleration, repeated-stop duty and ambient before raising current/speed. Complete EMI/EMC and fault validation for that envelope. |

Runtime voltage monitoring does not absorb energy, detect the resistor's resistance/cooling capacity, or provide independent hardware redundancy. The full-current open-brake simulation still exceeds the driver's operating limit. General full-current/load operation remains held until energy containment and thermal performance are demonstrated. Physical tests must record date, operator, equipment, serial numbers, measured values/waveforms and a pass/fail disposition; empty templates are not pass results.

## Reproduce the handoff

`bun run review` refreshes stock evidence, runs the source/native/firmware checks and regenerates previews/release artifacts. It may pass with the recorded procurement hold. `bun run check:stock`, `bun run check:assembly` and `bun run check:release` remain strict; they do not authorize ordering while shortages or other holds remain. `docs/verification.json`, the raw DRC/ERC reports and `delivery-manifest.json` identify the actual reviewed artifacts.

The four existing mounting holes, power bridge/brake circuits, USB connector model offset, other components and unrelated copper remain protected. Only the selected MCU/expander, new reset network and affected local fanout change. Physical CAD, current-stock and programming checks remain distinct from powered acceptance.

Sourcing replacements from PR #4 are included: R64 C2984356, U17 C6000508 and J1/J10 C3025063. See [sourcing resolution](sourcing-resolution.md). U17 has limited stock; USB -060 shorter stakes still need assembly/retention acceptance. No inventory is reserved.

## USB edge-placement update

J1 and J10 move 2 mm outward, with local power/USB/shell-ground routing updated and the DATA marking relocated into the gap above J10. Native electrical DRC, unconnected, parity and ERC counts are zero; the accepted cosmetic set decreases from 409 to 405 without new findings. The source schematic, exact USB parts, all other component/pad geometry and four mounting holes are preserved. [USB access](usb-access.md) explains the drawing-based 0.2856 mm face overhang and remaining physical-fit limits. Use the regenerated manufacturing ZIP, BOM and CPL together.
