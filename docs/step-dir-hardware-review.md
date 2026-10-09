# External STEP/DIR hardware blocker — 2026-10-09

Status: **r0.4 ECO source and routed-board correction verified; powered validation pending**.
The user reopened architecture scope on 2026-10-09. U7 pins23/24 now connect to GND and pin25 is NC; encoder SPI and ABI service pads remain. The original finding below describes the r0.3 baseline.

The user selected external STEP/DIR with USB setup/diagnostics. The original r0.3 U7 TMC5160A wiring sent AS5047P encoder B/A/I to U7 pins 23/24/25. The ADI TMC5160A Rev. 1.18 datasheet, page 13, specifies different functions when SD_MODE=1 and SPI_MODE=1:

| U7 pin | Original r0.3 net | STEP/DIR function | Consequence |
|---|---|---|---|
| 23 | ENC_B from U18 pin 6 | DCEN input | Encoder transitions can enable dcStep unexpectedly. ADI says ground or leave open for ordinary STEP/DIR. |
| 24 | ENC_A from U18 pin 7 | DCIN input | Encoder transitions enter the dcStep gating input. |
| 25 | ENC_I from U18 pin 14 | DCO output | Connected to the encoder's index output: output-to-output connection in this mode. |

Setting VDCMIN=0 does not prove safety: the datasheet explicitly describes the external DCEN input in STEP/DIR mode. No manufacturer-supported setting that makes all three existing connections safe has been validated. The commissioning firmware retains SD_MODE=0 and MCU_RUN=0 until the corrected hardware is verified on the bench.

## Correction implemented in ECO source

For the selected external STEP/DIR operating mode:

1. Disconnect U7 pins 23, 24 and 25 from ENC_B, ENC_A and ENC_I respectively.
2. Connect U7 pins 23 and 24 to GND; mark pin 25 unused/no-connect.
3. Preserve U18 and its SPI connections to U16, and preserve encoder test pads. USB diagnostics can read shaft angle through SPI.
4. Preserve the existing STEP/DIR multiplexers and signal paths. This proposal sacrifices direct TMC hardware ABI counting; it does not claim closed-loop position control.
5. Regenerate/reroute affected PCB nets and manufacturing files; require native DRC/ERC, exact endpoint-net matching and a new routing fingerprint derived from the changed circuit.

The user-authorized architecture ECO includes this connectivity correction. Unrelated schematic layout remains preserved. A dual-mode hardware design preserving direct ABI counting needs mode-controlled isolation instead, and is a larger ECO.

Primary sources:
- [ADI TMC5160A Rev. 1.18, pin functions page 13 and dcStep section 17.6](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf)
- [ams OSRAM AS5047P manufacturer documentation](https://ams-osram.com/products/sensors/position-sensors/ams-as5047p-high-speed-position-sensor)
- Current authoritative `index.circuit.tsx`: U7 and U18 physical numbered-pin connections.
