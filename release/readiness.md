# Redesign readiness — not orderable

RP2040 / DRV8462DDVR / TPS26750 / AS5600, revision 0.5.0-RP2040-DRAFT. Read [the current redesign evidence](../engineering/rp2040-redesign.json) and [reviewer checklist](reviewer-checklist.md). Earlier STM32/TMC5160 release evidence does not establish this revision's readiness.

1. Native routing is complete: 0 unconnected/parity/ERC findings, 8 retained J1/J10 hole errors and 451 cosmetic warnings. The exact USB-hole review exception is not fabrication acceptance. Fresh power-copper, bypass, Kelvin and USB-reference checks and matching artifacts are available; physical thermal/USB qualification remains open.
2. Resolve exact live sourcing and top-cooled DDV heatsink/TIM. A 6 A motor rating is not a qualified current setting.
3. Finalize secured rear mounting and connector/harness access. U18 remains optional DNP until the rear magnet attachment and airgap are qualified. WAGO spring-clamp J2/J3 and U38 INA237 raw PD_VBUS sensing are implemented in the reviewer ECO. Their powered and physical acceptance remains open.
4. Program U3's reviewed TI EEPROM image using its isolated fixture, read the full 64 KiB back, compare the programmed image and confirm a cold APP boot/48 V EPR contract. See [PD programming](pd-programming.md).
5. Program the new RP2040 firmware, read the complete 4 MiB external flash from 0x10000000, compare it using `verify-programming.mjs --kind rp2040`, and retain programmer/board-serial evidence. See [firmware instructions](../firmware/README.md). Do not use STM32 images or addresses.
6. With motion locks still false, measure reset/enable states, rails, USB-only and dual-supply behavior, USB attach/suspend/detach current and all protection/fault responses.
7. Qualify the actual 48 V / 5 A EPR adapter/cable, external J3 resistor/heatsink/guard, crimps, strain relief and load/stopping envelope. **10 Ω / 300 W remains provisional.**
8. Only after recorded qualifications, authorize the low-current unloaded motor test, then braking, repeated-fault and thermal tests. The supplied firmware cannot enable motion; its four qualification flags stay false.

None of these physical tests has been completed in this software task. A source build or successful image comparison is not permission to ship a running controller.

## Thermal and manufacturing handoff update

Use [thermal qualification](thermal-qualification.md) for the TI EVM heatsink reference, explicit cooling calculations, physical acceptance sequence and open 6 A bus-margin finding. [Manufacturing acceptance](manufacturing-acceptance.md) now follows the current RP2040/WAGO revision. Rear thread/usable engagement measurements are not available, so no screw/spacer set is approved. Full-current operation, cooling assembly and physical testing remain open; software checks do not close them.
