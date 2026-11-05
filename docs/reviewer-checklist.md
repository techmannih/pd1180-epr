# NEMA34 implementation and handoff checklist

Current architecture: RP2040 / DRV8462DDVR / TPS26750, DATA-only MCU power. Use the matching [verification report](verification.json) and [native summary](verification.md), together with the nine schematic sheets and four [System diagrams](system-overview.md).

## Implemented and checked in the repository

- [x] RP2040 power/clock/boot-flash pin contracts, USB, BOOTSEL and SWD access.
- [x] DRV8462 DDV-specific 44-pin map, integrated H-bridges, timer STEP/DIR and SPI configuration/readback.
- [x] DATA-only MCU supply, U39/U40 board-signal isolation and U41 sensor suspend control.
- [x] WAGO J2/J3 terminals, raw PD_VBUS INA237 ADC and separate ADS1115 VMOTOR/brake readings.
- [x] Derived PD_READY plus physical MOTOR_PG; independent RUN_SAFE, brake supply and hardware protection paths.
- [x] Diagnostic, 30-second stationary-power and bounded-motor software profiles; reset/fault inhibition, readback freshness and deliberate restart tests.
- [x] Native route, bypass/Kelvin paths, USB ground reference and analytical power-copper checks; 0 unconnected/parity/ERC findings. Eight USB hole errors and 475 cosmetic warnings are recorded separately.
- [x] Source/native 0.15 mm tracks, 0.10 mm spacing, 0.30 mm GND clearance, 0.50 mm GND inset and 0.20 mm global edge rule.
- [x] Matched routed viewer, manufacturing files, BOM/CPL and release hashes, verified by the release pipeline.
- [x] Four mounting axes aligned to the ordered motor STEP; only optional DNP encoder U18 on the bottom.

## Fabrication and installation actions

- [ ] Obtain the exact fitted-part quantities using the latest [sourcing report](procurement.md); record allocation for insufficient rows.
- [ ] Record supplier acceptance of stack-up/USB impedance, 66 filled/capped via-in-pad locations, USB hole geometry and critical markings.
- [ ] Fit the selected driver cooler/TIM with end support, brake cooler/guard, harnesses and strain relief; inspect tool/bend clearance.
- [ ] Measure rear thread/depth and select secure motor/board fastening and insulation. The STEP axes do not specify screw engagement.

## Tests after assembly

- [ ] Program and fully read back the TI EEPROM and RP2040 flash; record cold boot and actual EPR contract.
- [ ] Measure USB startup/configured/suspend current, DATA/PD transitions, reset and sensor discharge/wake behaviour.
- [ ] Run the stationary supply/fault profile, then the bounded unloaded motor profile from [commissioning](commissioning.md).
- [ ] Record phase current, bus/brake waveforms, temperatures and stops to define the intended load/current/duty envelope.
- [ ] If fitting the optional encoder later, qualify its magnet mounting/airgap and telemetry separately.

Run `bun run review` for a software/CAD handoff. Checks continue to reject stale or failed evidence. The physical checklist is completed by the assembly/test team using serial-numbered measurements.
