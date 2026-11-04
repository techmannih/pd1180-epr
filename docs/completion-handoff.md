# Reviewer ECO and physical acceptance

The current controller uses **RP2040, DRV8462DDVR, TPS26750 and optional AS5600**. The reviewer ECO adds **U38 INA237 raw-PD sensing** and **WAGO spring-clamp J2/J3**. Earlier STM32/TMC5160 binaries, current-register settings and passing reports are historical. Use the matching current source, native board, BOM, firmware and release manifest together.

## Schematic and power review

The 2026-11-03 review consolidates the source into nine functional A4 sheets. [Power architecture](usb-pd-architecture.md) explains all 33 ICs, the independent brake supplies and the driver-current trade-off. [Pinned reference releases](../engineering/reviewer-power-reference.json) show NEMA23/NEMA14 support dual-source logic power; NEMA17 is DATA-only. This revision retains the former behaviour and DDVR. Electrical/PCB records are checked against main commit `34aca1a`; this is a schematic/documentation change, not a new hardware qualification.

## Reviewer requirements

| Requirement | Implementation | Remaining physical evidence |
|---|---|---|
| Read POWER_GOOD | Existing eFuse MOTOR_PG reaches RP2040 GP6 and the hardware enable chain. Firmware PD_READY additionally requires a fresh valid TPS sink/EPR 48 V / 5 A contract and fresh measured raw PD voltage in the 44–51 V engineering window. | Startup, cable loss, renegotiation and fault timing on actual hardware. PD_READY is derived status, not an added TPS GPIO. |
| PD voltage via ADC | U38 INA237, I2C 0x40, senses PD_VBUS before the eFuse; 85 V bus range. ADS1115 retains VMOTOR/brake sensing after protection. | Compare both rails against a calibrated meter over startup and fault cases. |
| Spring clamp, not JST | J2 WAGO 2601-3104, four poles; J3 WAGO 236-402, two poles. Each pole has two solder tails; no separate plugs/socket contacts. | Wire strip, insertion, pull/continuity, access, restraint and temperature acceptance. |
| Rear mounting | Four existing Ø4.2 mm holes aligned to the ordered 34HS31-6004S1 manufacturer STEP axes. | STEP does not specify accessory threads, usable engagement or approved case-bolt replacement. No screw/spacer stack is approved. |

`POWER` reports raw PD millivolts/validity/age, contract voltage/current, PD_READY, MOTOR_PG and protected VMOTOR separately. A stale ADC register cannot qualify readiness: firmware requires completion of a newly triggered bus conversion, configuration readback, identity and timing checks. Sensor/I2C loss removes the ready condition. Physical MOTOR_PG, voltage/temperature gates and brake supervision remain independent requirements.

## External connections

| Connection | Wiring |
|---|---|
| J2 entries 1/2/3/4 | Black/green/red/blue = A+/A−/B+/B−. Modeled factory cable → four TE320559 splices → four Alpha3057 16 AWG pigtails → WAGO clamp. Strip 8–9 mm. Nominal pigtail cuts 175 mm each, including allowance. |
| J3 entry 1 → resistor → entry 2 | VMOTOR → red lead → resistor → black lead → BRAKE_RETURN/Q16. Strip 5–6 mm at WAGO; TE152883 rings at the resistor. Nominal cuts 165/210 mm include allowance. BRAKE_RETURN is not ground. |
| J1 POWER | Actual single-port 48 V / 5 A EPR source and 5 A EPR cable; verify negotiated contract. |
| J10 DATA | USB data host/cable for diagnostics; it does not supply motor power. |
| Programming pads / BOOTSEL | RP2040 CMSIS-DAP/SWD or BOOTSEL programming and isolated TI EEPROM fixture. Use current programming/readback instructions. |

See [motor harness](motor-harness.md), [brake assembly](brake-assembly.md) and [external system](external-system.md). Nominal CAD cut lengths must be checked on the first article. No external inventory is reserved.

## Acceptance sequence

1. Refresh exact live stock for the intended lot. Resolve the eight retained USB hole-clearance errors with manufacturing approval or a reviewed geometry correction. Review the raw cosmetic findings, stackup, impedance and filled/capped via-in-pad requirements.
2. Finalize secure rear attachment and cable restraint. The 19.5 mm rear spacing is only the existing preview separation. Verify tooling/lever access and the completed harness, not just the uncrimped CAD.
3. Flash/read back TI EEPROM, verify a cold APP boot and actual 48 V EPR contract. Program/read back the full 4 MiB RP2040 external flash at 0x10000000; retain board serial, binary hashes and programmer records.
4. With motion inhibited, inspect and measure reset/enable states, all rails, USB source combinations/backfeed, PD_READY/MOTOR_PG, ADC accuracy/freshness and fault/restart behavior.
5. Qualify the actual brake resistor, cooling, guard and containment. **10 Ω / 300 W remains provisional**, dependent on case temperature and stopping duty. Runtime voltage sensing does not absorb energy or qualify cooling.
6. Only after recorded approval, perform the restrained low-current unloaded test, then braking and thermal/fault tests. The current DRV8462 bench target is 800 mA RMS and maximum 10 rpm; these are proposed test limits, not validated performance. All firmware qualification flags remain false.

Record measured waveforms, temperatures, timing, load inertia, maximum RPM, deceleration, repetition and ambient before expanding the operating envelope. U18 stays bottom DNP until a rotating rear magnet attachment, field and airgap are qualified; C52/C53 stay DNP on top. No powered, thermal, crimp or mechanically secured fit result is claimed by software checks.

Run `bun run review` for reproducible engineering checks and delivery generation. Read the exact current DRC/ERC/verification reports and hashes; an accepted engineering review with explicit holds is not an order approval or a ready-to-run controller.

## Thermal and manufacturing handoff update

Use [thermal qualification](thermal-qualification.md) for the TI EVM heatsink reference, explicit cooling calculations, physical acceptance sequence and open 6 A bus-margin finding. [Manufacturing acceptance](manufacturing-acceptance.md) now follows the current RP2040/WAGO revision. Rear thread/usable engagement measurements are not available, so no screw/spacer set is approved. Full-current operation, cooling assembly and physical testing remain open; software checks do not close them.
