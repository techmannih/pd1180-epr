# Design implementation and post-assembly validation

RP2040 / DRV8462DDVR / TPS26750 / AS5600, revision 0.5.0-RP2040-DRAFT. Read [the current redesign evidence](../engineering/rp2040-redesign.json) and [reviewer checklist](reviewer-checklist.md). Use [assembly](assembly.md) for order preparation and [commissioning](commissioning.md) for tests after assembly.

1. Native routing is complete: 0 unconnected/parity/ERC findings, 8 retained J1/J10 hole errors and 475 cosmetic warnings. The exact USB-hole review exception is not fabrication acceptance. Fresh power-copper, bypass, Kelvin and USB-reference checks and matching artifacts are available; physical thermal/USB qualification remains open.
2. Allocate the exact fitted-part quantities from the latest sourcing snapshot and install the selected top-cooled DDV cooler/TIM/support. Use the bounded commissioning current before selecting an application profile from measurements.
3. Finalize secured rear mounting and connector/harness access. U18 remains optional DNP until the rear magnet attachment and airgap are qualified. WAGO spring-clamp J2/J3 and U38 INA237 raw PD_VBUS sensing are implemented in the reviewer ECO. Their powered and physical acceptance remains open.
4. Program U3's reviewed TI EEPROM image using its isolated fixture, read the full 64 KiB back, compare the programmed image and confirm a cold APP boot/48 V EPR contract. See [PD programming](pd-programming.md).
5. Program the new RP2040 firmware, read the complete 4 MiB external flash from 0x10000000, compare it using `verify-programming.mjs --kind rp2040`, and retain programmer/board-serial evidence. See [firmware instructions](../firmware/README.md). Do not use STM32 images or addresses.
6. Use diagnostics for DATA rails/reset/USB checks, then the stationary `power-test` image for protected VMOTOR and fault checks with ENABLE/STEP low. RP2040 stays off on PD alone.
7. Qualify the actual 48 V / 5 A EPR adapter/cable, external J3 resistor/heatsink/guard, crimps, strain relief and load/stopping envelope. **10 Ω / 300 W is the selected first-article resistor; continuous-duty/load qualification follows measurements.**
8. Use the separate stationary-power and bounded-motor profiles in [commissioning](commissioning.md). Their recorded prerequisites precede the tests; motor/braking/thermal results are collected afterward. The default assembly image keeps its four qualification flags false.

The repository supplies the software and procedures for these stages. The assembly/test team records the physical results after the boards are made.

## Thermal and manufacturing handoff update

Use [thermal qualification](thermal-qualification.md) for the TI EVM heatsink reference, explicit cooling calculations, physical acceptance sequence and open 6 A bus-margin finding. [Manufacturing acceptance](manufacturing-acceptance.md) now follows the current RP2040/WAGO revision. Measure rear thread/usable engagement to select the screw/spacer set. Record installed cooling and load/current results during the post-assembly sequence.
