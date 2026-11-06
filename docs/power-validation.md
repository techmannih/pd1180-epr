# Current RP2040 / DRV8262 power validation

**Physical qualification has not been performed.** Use this procedure with `rp2040-redesign.md`, `thermal-qualification.md`, `pd-programming.md` and the exact paired native release. Historical STM32/TMC5160 instructions and current-register values are superseded; Git history retains those records.

The current native baseline has eight retained USB hole-clearance errors and 488 cosmetic warnings, zero unconnected/parity findings and zero ERC. Engineering review tolerates only the recorded baseline; fabrication remains held. Raw reports and matching source hashes control any later result.

## Operating scope and explicit limits

The delivered diagnostics image keeps **four qualification flags false**. The proposed initial test requests at most **0.8 A RMS** (approximately 0.800 A nominal after driver quantization), **10 rpm**, unloaded 34HS31-6004S1 rotor, no coupling or external back-drive. Neither the motor's 6 A/phase label nor the driver's current headline is an approved RMS/peak/hold setting. Current regulation tolerance, winding waveform and thermal behavior require measurements.

The current **sixteen-case** behavioral screen uses 2 × 1000 µF (1600 µF minimum) for VMOTOR. The 6 A RMS winding-corner result is **54.321 V**, and the hot-resistor/0.05 Ω ESR result is **54.399 V**; both pass the modeled 0.5 V reserve below 55 V. The **100 µs recovery case is 54.745 V** and still fails that reserve. The previous 2 × 470 µF result, 54.858 V, remains a comparison case. These are DC-bus/brake/eFuse models, not DRV8262 switching or an unknown load. Full current remains locked pending measured latency/overshoot and load qualification.

`engineering/power-audit.json` calculates thresholds from fitted values. Brake on/off are approximately 52.04/51.39 V nominal, independent motor inhibit approximately 53.21 V nominal; tolerances and shared reference behavior matter. ADC telemetry is not the hardware protection path. The 0.5 V transient allocation is a design allowance, not a measured bound.

U6 TPS26630 with 4.99 kΩ R25 has approximately 3.607 A formula-nominal input limit; the conservative device/resistor screen plus upstream allocation is about 4.252 A. This is input current, not phase current. Its motor-input budget is below the 240 W adapter rating. Source/cable transients, active-limit SOA and thermal behavior remain unqualified. U34's retained 12 V rail powers the brake driver; it is not a supply pin of the new DRV8262.

## Setup and no-motion tests

Record board serial/revision, Gerber/native/source and firmware hashes, instrument identity/calibration, connections, operator/date, ambient and raw data. A proposed fixture/test method must be reviewed before power is applied. Do not connect two sources to one rail or treat unpowered resistance checks as proof of powered behavior.

| Stage | Measure / record | Acceptance or next action |
|---|---|---|
| Unpowered inspection | Correct identities/polarity, solder joints, all 78 via-in-pad processes, WAGO insertion, winding pairs, resistor/guard/cooling, insulation and supported mounting | Resolve retained manufacturing holds and physical installation before motor tests |
| Programming | Isolated TI full-flash write and full 65,536-byte EEPROM readback; RP2040 external flash full 4,194,304-byte readback | Registered image/source hashes match; erased tail checked; device/fixture/operator recorded |
| Cold boot | Remove both input sources, verify rails discharge, restart from J1/J10 combinations | TI APP mode/config marker and RP2040 startup; no unintended motion or automatic rearm |
| Logic rails | PD_3V3, V3V3_PD, V3V3_MOTOR, V3V3, V3V3_MCU, V1V1_MCU and retained BRAKE_12V across startup/load/source loss | Compare to component supply limits and current source audit; inspect overshoot/ripple/sequence, not DC value alone |
| USB power combinations | DATA only, POWER only, both, either removed, suspend/resume/reset | PD-only must not start RP2040; DATA loss must deassert enables while independent brake power remains available. No backfeed or unexpected enable; actual USB current and hardware gates meet the reviewed power-domain contract |
| Raw PD ADC | U38 INA237 at I2C 0x40 vs calibrated meter at PD_VBUS | Fresh conversion/identity/configuration accepted; engineering 44–51 V readiness window checked; characterize gain/error over actual range |
| Protected-rail ADC | ADS1115 VMOTOR, input-current and BRAKE_FB paths vs meter/current instrument | Correct scaling, channel identity and freshness; raw PD and protected VMOTOR distinguished |
| Contract/readiness | TPS sink 48 V / 5 A EPR negotiation, config marker, POWER telemetry, eFuse MOTOR_PG at GP6 | PD_READY requires valid fresh contract/raw voltage; MOTOR_PG and independent hardware gates also required |
| Fault and restart | Current/voltage/temperature faults, stale ADC, I2C/SPI failures, watchdog and reset, source renegotiation/loss | Measure inhibition latency and waveforms; fault latch, no uncommanded restart; settle safe before deliberate fault injection |
| Brake preflight | Exact resistor measured unpowered; fresh VMOTOR/BRAKE_FB pairs with bridge inhibited | Continuity function works; it does not prove resistor rating, pulse energy, cooling or RUN fault containment |
| Indicators/controls | D16 RGB, D17 power, BZ1, SW1 reset and SW2 start/stop | Match `indicators.md`; no start from a held button, reset or fault acknowledgement alone |

A fixture must not inject simulated faults into live power nodes without an approved method. GPIO/status failure tests can precede powered current/voltage fault tests. Preserve hardware eFuse/brake/enable paths; do not bypass them for testing. The existing board temperature trip is 70 °C with 55 °C rearm; it is not a driver-junction thermometer.

## Restrained motor and thermal sequence

After no-motion results and mounting/cooling/brake acceptance are recorded, an engineer can approve a separately identified test build. The shipped image remains locked. Begin with phase-current measurements and restrained unloaded motion at the proposed low-current/speed profile. Capture both phase waveforms, driver fault/status, input power, VMOTOR/PD_VBUS, current regulation, PH/EN and DAC timing. Do not assume the requested RMS value is the measured one.

Measure commanded stopping and reset/source-loss behavior, including current remaining in windings after inhibition. For every test record actual inertia/load, speed, deceleration and repetitions. Require bus peaks plus measurement uncertainty and reserved allocation to fit the reviewed system limit, not just U7's 60 V DC operating range. A failed case requires circuit/envelope review; do not suppress the failure or clear a qualification flag to continue.

Measure driver top/sink, motor, PCB, shunts, capacitors, terminals and cables at worst intended ambient/duty. Apply the thermal selection calculations, contact/support requirements, resistor pulse/average checks and test stability criterion in `thermal-qualification.md`. The DDV sink/TIM and brake sink remain unqualified; the 80×80×30 mm brake CAD block is conceptual. Fan/guard/strain-relief choices and thermal fault containment are part of the assembly, not supplied by firmware.

Only a recorded bounded operating envelope can approve a motor-enabled image and per-board acceptance procedure. General machine control, an external emergency stop and encoder closed-loop control are not implemented by this bench profile. U18/C52/C53 remain optional DNP pending a compatible rear magnet installation.

## Evidence required for delivery

Each serial number needs assembly inspection, both programming/readback records, cold boot, actual negotiated EPR source/cable identity, meter/telemetry comparison, power/fault/USB results and qualified motor/brake/thermal results. Identify pass criteria, operator, instruments, image hashes and measured waveforms. Use the diagnostic, stationary-power and bounded-motor profiles in [commissioning](commissioning.md) to collect these post-assembly records. Software review and matching hashes establish reproducible artifacts; the operator records the measured hardware results.
