# Post-assembly bring-up sequence

Use the matching RP2040 / DRV8462DDV release and the complete [commissioning procedure](commissioning.md). These steps describe work on the assembled board; automated software checks are recorded separately in [verification](verification.md).

1. **Inspect and secure.** Check fitted parts, polarity, unpowered rail resistance, J2 coil pairs, J3 brake wiring, cooling/guard and strain relief. Secure the board, unloaded motor and brake assembly. Select motor fasteners from actual rear thread/depth measurements.
2. **Program diagnostics.** Program U3's TI full-flash image and U16/U17's RP2040 diagnostic image using the documented isolated fixture and SWD/BOOTSEL paths. Verify full 65,536-byte EEPROM and 4,194,304-byte QSPI readbacks; retain dumps and hashes.
3. **Cold boot and measure.** J10 DATA powers the MCU. Record `PROFILE`, `POWER`, `STATUS` and `DRIVER`, DATA rails/reset/suspend behaviour, then J1's actual 48 V / 5 A EPR contract and raw PD ADC reading. Keep J2 disconnected for the stationary checks.
4. **Stationary power test.** Complete the diagnostic-stage prerequisite record and build `power-test`. After programming/readback and local START, measure protected VMOTOR, eFuse ramp, MOTOR_PG, driver rails and fault response with ENABLE/STEP low. The profile switches the bus off after 30 seconds.
5. **First motor run.** Power down, fit J2, driver cooler/TIM and brake cooler/guard, and record the stationary test and installation evidence. Build and verify `bench-test`. Local START requests <=800 mA RMS (about 773 mA nominal), 10 rpm and a 10-second unloaded run followed by a one-second stop ramp.
6. **Capture results.** Record phase current, bus peak, temperatures, stopping and fault behaviour with board/image identity. Use these measurements to select a later load/current/duty profile. The standard test image has no reverse or arbitrary-speed command.

Every boot is disarmed and faults require deliberate acknowledgement/restart. The independent protection/brake chain operates alongside firmware. For exact wiring and parts use [connector harnesses](connector-harnesses.md), [external system](external-system.md) and [thermal installation](thermal-qualification.md).
