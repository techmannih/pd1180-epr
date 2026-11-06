# Current interfaces and reference-board compatibility

This table describes the RP2040 / DRV8262DDVR DATA-only revision. Reference NEMA14/17/23 boards informed the review; motor size alone does not determine power, pinout or firmware compatibility.

| Function | NEMA34 implementation |
|---|---|
| MCU | RP2040, 12 MHz crystal, W25Q32JV 4 MiB QSPI boot flash |
| MCU supply | J10 DATA USB; PD-powered signals cross U39/U40 isolation |
| Motor input | J1 dedicated USB-C PD 3.1 EPR, configured 48 V / 5 A request |
| Driver | DRV8262DDVR top-cooled DDV package, integrated H-bridges, PH/EN and MCP4822 current references |
| Motor connection | J2 WAGO 2601-3104: A1, A2, B1, B2 |
| Brake connection | J3 WAGO 236-402: VMOTOR and switched BRAKE_RETURN |
| Voltage telemetry | INA237 raw PD_VBUS; ADS1115 protected VMOTOR/brake feedback |
| Readiness | Derived PD_READY and physical eFuse MOTOR_PG are separate |
| Encoder option | AS5600 I²C telemetry; U18/C52/C53 DNP in the fitted assembly |
| Local controls | SW1 reset, SW2 START/STOP; BOOTSEL and SWD service access |
| Firmware | Board-specific diagnostic, stationary-power and bounded-motor profiles |

J7 and the earlier industrial transceiver/external command interfaces are retired. Use [connector-harnesses.md](connector-harnesses.md) for current wiring and [commissioning.md](commissioning.md) for executable test profiles.

The reference-board power-source comparison is recorded in [reviewer-power-reference.json](../engineering/reviewer-power-reference.json). Their RP2040 examples are useful architectural references; a different driver pinout or register model requires a board-specific firmware build. A generic RP2040/DRV8847 image or dashboard is not a substitute for the supplied DRV8262 firmware and readback procedure.
