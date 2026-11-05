# NEMA34 fabrication, assembly and commissioning package

Revision **0.5.0-RP2040-DRAFT**. This handoff contains matched PCB/assembly files, RP2040 diagnostic firmware, TI configuration, verification evidence and the post-assembly test procedure.

## Package contents and order preparation

- Use the Gerber/drill archives with `jlc-bom.csv`, `jlc-cpl.csv` and `order-settings.json`. Specify four layers, 1.6 mm, 1 oz on every layer, ENIG, top-side assembly and all 66 epoxy-filled/copper-capped via-in-pad locations in `rp2040-via-in-pad.json`.
- Include through-hole WAGO J2/J3 terminals and tall capacitors in the assembly scope. All 243 fitted placements are top-side. Optional U18 is bottom DNP; C52/C53 are top DNP and all three are excluded from paste and the fitted BOM/CPL.
- Allocate the exact fitted-part quantities from the timestamped sourcing reports. Record the supplier's stack-up/USB impedance, USB-hole geometry and critical-marking disposition in `manufacturing-acceptance-record.json`.
- Prepare the external EPR source/cable, motor harness, driver cooler/TIM/support and J3 resistor/cooler/guard using `assembly.md`, `external-system.md` and `thermal-qualification.md`. The selected first-article brake resistor is 10 ohm / 300 W at its specified case temperature; installed duty is established by measurements.
- The ordered motor is STEPPERONLINE 34HS31-6004S1 (Amazon B091C83HWF). Four PCB axes align to its archived STEP. Measure rear thread/usable engagement and physical clearance before selecting screws/spacers; the modeled separation is not a fastening specification.

## Connections and software

J1 POWER negotiates 48 V / 5 A EPR through TPS26750. J10 DATA powers RP2040 and its boot flash, with U39/U40 isolating board-powered signals. Connect both for motor testing. J2 WAGO 2601-3104 connects the two windings; J3 WAGO 236-402 connects VMOTOR through the resistor to switched BRAKE_RETURN. The motor-bus-derived supplies retain independent brake control after PD loss. See `usb-pd-architecture.md` for every IC's purpose.

`pd1180-ti-configuration.zip` supplies the register-reviewed TI full-flash image. `pd1180-commissioning-firmware.zip` supplies RP2040 ELF/BIN/UF2 diagnostics. Follow `commissioning.md` for full EEPROM/QSPI readback, cold boot and the serial-bound prerequisite record. Every profile starts disarmed; the default image keeps motor power/motion inhibited.

The explicit `power-test` profile provides a 30-second stationary VMOTOR test with ENABLE/STEP low. The explicit `bench-test` profile requests <=0.8 A RMS (~0.773 A nominal), 10 rpm unloaded, a 10-second run and one-second stop ramp. Local START and live interlocks remain required. These software profiles let the assembly/test team collect the subsequent current, braking and thermal results without editing safety flags.

`assembly.md` includes a provider brief and a staged programming/test work order. Agree which post-assembly stages the provider or receiving team performs; no service has been booked by this repository work.

## Verification evidence

The paired native reports record 483 raw DRC findings: eight J1/J10 hole-clearance errors plus 475 cosmetic warnings, with no other native errors. They report 0 unconnected items, 0 schematic-parity issues and 0 schematic ERC violations. Retain `kicad-drc.json` and `kicad-erc.json` for the manufacturer review.

`verification.json` records the checked software/CAD inputs. `schematic-style-check.json` covers all 9 sheets. `circuit.json` preserves the source schematic and replays the verified native copper. `power-validation.md` describes the behavioral screens and post-assembly measurements: the current 2000 uF bank reaches 54.321 V in the nominal-delay 6 A winding model, while the 100 us delay case reaches 54.745 V and misses the allocated 0.5 V reserve below 55 V. Use the bounded test profile and measured results to define a later load/current envelope.

Use the PCB images and the 100%-scale mounting template for inspection. The zipped board/assembly GLBs show the nominal geometry; cooler/guard concepts are distinguished from fitted installation drawings in the thermal guide. Legacy r0.3 archive basenames are retained for pipeline compatibility; their contents use this revision. `delivery-manifest.json` identifies file sizes/hashes and `sha256.json` covers the release directory. Acceptance states remain in `release-status.json`; physical results are recorded after assembly.
