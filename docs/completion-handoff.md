# Prototype completion and acceptance record

This handoff builds on merged PR #3 (`0cacbb2`). It is an engineering review package, not an order approval or proof that the motor runs. No physical test results are available. The three firmware qualification flags remain false.

## Implemented in this pass

- Brake feedback continues to be checked during RUN. At a 44–50.4 V bus, the return must follow the bus within ±10%; invalid or stale feedback latches a fault. Samples older than 100 ms fail. Above 50.4 V, the expected low return during Q16 switching is allowed for at most 100 ms from the last healthy conversion. Repeated polling cannot extend that interval. The separate motor-bus interlock remains active. The control state machine removes RUN/power permission on a failed check and requires deliberate rearm.
- Host regressions cover running cable-open, reconnection, stale/duplicate conversions, the bounded observation gap, no preflight qualification and timer wrap. The ARM target is rebuilt from the updated source. The archived image still cannot enable motion.
- The exact 404 native-reference text findings are accepted according to the user's instruction. Every raw KiCad finding remains in the package. Changed finding identities, shorts, unconnected items, parity errors and ERC failures are rejected. Names, text sizes, PCB placement, four holes and copper are unchanged.
- Review can complete with explicitly recorded stock shortages; strict procurement/release commands still fail. Unknown stock, package mismatch and failed engineering checks are not accepted. Exact inventory is refreshed and remains unreserved.
- The six motor copper paths are re-screened at 0.075/0.05 mm against the current native PCB. Results remain DC analytical estimates, excluding device/contact losses and thermal qualification.
- The TE 320559 manufacturer drawing is archived with its source and SHA-256. It confirms 32.13 mm maximum length and a 2.03–3.18 mm wire-insulation diameter range. It does **not** dimension the exterior diameter; the CAD's 5 mm envelope remains provisional. No dimension was guessed to close this hold.

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

## Exact assembly shortages

The live JLC snapshot in `stock-report.json` controls; warehouse stock is not the same as orderable stock. For the configured five-board lot:

| Reference | Exact MPN / package | JLC code | Required quantity | Next action |
|---|---|---|---:|---|
| U16 | STM32G0B1CBT6 / LQFP-48 7×7 | C2847904 | 5 | Obtain exact-part allocation or an assembler-approved consignment quote. |
| U17 | W25Q32JVSSIQ / SOIC-8 208 mil | C179173 | 5 | Same; reported warehouse pieces are not orderable inventory. |
| U35 | TCA9538PWR / TSSOP-16 | C2652286 | 5 | Same; a reset-less expander is not an approved substitution. |
| R64 | RT0603BRD07430KL / 0603 | C861400 | 5 | Same; retain 0.1% resistance and temperature coefficient used in OVP analysis. |
| J1/J10 | USB4105-GF-A | C3020560 | 10 | Same; any other USB-C receptacle needs pin/land-pattern, voltage/current and mechanical review. |

No substitute has been installed, inventory reserved, or order placed. `sourcing/bom-with-stock.csv` and `sourcing/external-items.csv` are the procurement handoff. An unavailable optional alternative does not become an approved part through a passing engineering review.

## Physical work and evidence needed

| Stage | Required evidence before advancing |
|---|---|
| Before ordering | Resolve the five stock shortages; obtain fabricator acceptance of the actual stackup/USB impedance and filled/capped via-in-pad process. Measure the actual motor rear holes/thread/depth and define secure attachment using the retained four PCB holes. Do not reuse motor tie bolts or add guessed hardware. |
| Harness first article | Verify delivered lead insulation against the current TE application drawing, finished splice envelope, crimp/pull/insulation tests, winding mapping, connector insertion/tool clearance, cable bend/retention and final cut lengths. The archived TE drawing is older Rev V2; request current Rev V6/STEP before production fit approval. |
| Stationary electrical | Serial-number the PCB. Record BOM/revision, firmware/PD-image hashes and readback; inspect before power. With the bridge inhibited, measure source negotiation, all rails, USB power states/backfeed, eFuse response, brake/cutoff thresholds and fault/restart paths. |
| First motion | Only after stationary checks and a qualified brake installation: securely mounted **unloaded** motor, 20–25°C, nominal 10 rpm, 10 rpm/s, IRUN=6 / GS=139 (about 0.827 A RMS). Capture phase current, gates, VMOTOR and brake waveforms. These are proposed qualification limits, not tested ratings. |
| Brake fault | First inject feedback/open faults with the motor inhibited. A controlled running-open test needs the restricted energy envelope and independent test-rig overvoltage containment. Measure ADC/filter/scheduler detection delay, inhibit timing and peak VMOTOR. Require the 55 V operating limit with the project's transient margin; if it fails, keep motion disabled and revise protection. Do not simply unplug the brake during a high-energy run. |
| Thermal and application | Measure winding, shunt, MOSFET, connector, capacitor, board and resistor temperatures, capacitor ripple and Q16/D20 overshoot. Define load inertia, maximum RPM, deceleration, repeated-stop duty and ambient before raising current/speed. Complete EMI/EMC and fault validation for that envelope. |

Runtime voltage monitoring does not absorb energy, detect the resistor's resistance/cooling capacity, or provide independent hardware redundancy. The full-current open-brake simulation still exceeds the driver's operating limit. General full-current/load operation remains held until energy containment and thermal performance are demonstrated. Physical tests must record date, operator, equipment, serial numbers, measured values/waveforms and a pass/fail disposition; empty templates are not pass results.

## Reproduce the handoff

`bun run review` refreshes stock evidence, runs the source/native/firmware checks and regenerates previews/release artifacts. It may pass with the recorded procurement hold. `bun run check:stock`, `bun run check:assembly` and `bun run check:release` remain strict; they do not authorize ordering while shortages or other holds remain. `docs/verification.json`, the raw DRC/ERC reports and `delivery-manifest.json` identify the actual reviewed artifacts.

The current PCB/3D geometry is retained from merged PR #3. Firmware and review-policy changes do not produce a physical before/after shape change. The regenerated `release/pcb-3d.png` and assembly archive show that retained geometry; they are not photographs or proof of completed mounting/brake installation.
