# USB-C PD, USB data and current-sense architecture

The r0.4 ECO separates PD POWER J1 from USB DATA J10, preserving the original motor-bus backup supply. `scripts/design.test.mjs` checks physical numbered-pin connections in `dist/index/circuit.json`.

## Two independent USB-C ports

J1 and J10 use tscircuit's standard USB-C connector with the exact C3020560 USB4105-GF-A footprint. J1 VBUS is PD_VBUS and J10 VBUS is USB_DATA_VBUS; they are never joined. J1 D+/D− pins are NC. Its SBU contacts use U1's protected SBU channels, whose system-side outputs are NC. J10 powers setup/diagnostics independently through U28 TPS2553 and U25 TLV755. It cannot energize VMOTOR.

U5 derives board logic from PD_VBUS before the eFuse; U22 retains VMOTOR-fed brake backup. U23/U24 OR these supplies into V3V3. U26/U27 combine board V3V3 and DATA-derived V3V3_USB into a separate V3V3_MCU rail. Only STM32, its reset pullup, bypass/bulk capacitors and SWD supply reference use this output. Industrial transceivers, flash, encoder and sensors cannot draw their supply from DATA. R119/R120 sense board V3V3 on PB1; the unused U2 IRQ is NC and PD state is polled. Chip selects are released open-drain into board-domain pullups; peripheral inputs and I²C are high impedance with board power absent.

R113 limits DATA overload current; it does not enforce USB power states. Firmware advertises a bus-powered 500 mA configuration, disarms on suspend, clears commands and stale telemetry, quiesces GPIO/I²C and enters STOP0. RTC wakes the main loop every nominal 50 ms for VBUS sampling and IWDG service. USB resume/reset wakes normally; full clocks return before servicing pending USB interrupts. See `firmware/README.md` for the implementation and mandatory current, wake-latency, detach, inrush, reverse-current and supply-handover bench checks. The 2.5 mA suspend limit is not yet a measured result.

## Power Delivery path

```text
J1 CC1/CC2
  -> U1 TPD4S480 CC short-to-VBUS protection
  -> CC1_PD / CC2_PD
  -> U2 TPS26750 pins 24/25
  -> configured sink-only 48 V / 5 A EPR negotiation
```

The TPS26750 is the dedicated PD controller. TI specifies EPR sink support at 28 V, 36 V and 48 V and shows the PD exchange on CC. U2's optional `USB_P`/`USB_N` pins do not carry board USB data; pins 22 and 23 are grounded as TI requires for unused GPIO4/GPIO5. `POWER_PATH_EN` drives the exact two-NMOS buffer from TI Figure 8-5: R9 (0 Ω) drives Q2, R11 pulls Q2's drain up to `PD_3V3`, R12 (0 Ω) drives Q3, and R13 pulls `PD_PATH_OK` up to `PD_3V3`. Q2/Q3 are the CSD17484F4 devices used by the TPS26750 EVM. `PD_PATH_OK` is then combined with the MCU permit before the TPS26631 eFuse can energize the motor bus.

The board still requires a reviewed TI-generated full-flash configuration image in U3. A blank image leaves the design in SafeMode and does not negotiate 48 V.

## USB 2.0 data and attach path

J10 DP1/DP2 share USB_DP_CONN; DM1/DM2 share USB_DM_CONN. D15 USBLC6-4SC6 protects both data lines and both CC lines, with pin2 GND and pin5 DATA VBUS. R71/R72 remain the 22 Ω series links to U16. C73 provides the 100 nF TVS VBUS bypass. J10 CC1 and CC2 each have their own 5.1 kΩ pulldown; they are not joined to the PD controller.

J10 VBUS feeds R107 1 MΩ / R108 47 kΩ with C72 100 nF, and U16 PB0 senses their junction. At 5 V, nominal ADC voltage is 0.224 V. Firmware scales the divider, enables USB above 4.0 V VBUS, and detaches below 3.0 V. Validate thresholds, ADC error and attach/detach timing on hardware. PD VBUS presence alone must never enable the USB pull-up.

## Motor current and voltage feedback

- U6 TPS26631 pin 13 produces `IIN_MON`; R26 converts it to a voltage and U30 ADS1115 channel 1 reads it.
- The independent VMOTOR divider R31/R32/R33 produces `VMON_ADC`; U30 channel 0 reads it at ±4.096 V full scale. U30 address is 0x49; conversion validity and freshness are checked before motor permission.
- R109 and R110 are independent 33 mΩ, 3 W low-side phase shunts connected to TMC5160A `SRAH` and `SRBH` inputs for phase-current regulation.
- R115/R116 are 5 mΩ, 1 W series shunts in the A1/B1 motor leads. U31/U32 INA240A1 (gain 20) feed STM32 PA0/PA1 through 1 kΩ/10 nF filters. Nominal output is 1.65 V + 0.1 V/A, giving 0.872–2.428 V at the ±7.78 A peak of a 5.5 A RMS sine wave. Each shunt dissipates 0.151 W at 5.5 A RMS. These are calculated targets; ADC reference/zero calibration, PWM settling, negative transients, overload and temperature must be measured. Current firmware reports instantaneous samples, not calibrated RMS current.
- The TMC5160A is intentionally an external-bridge controller. Q6–Q13 are its two full MOSFET bridges, not manual substitutes for an integrated output stage.
- Firmware must calibrate input-current telemetry and configure TMC5160A current scaling, gate drive and chopper behavior for the actual motor. The netlist proves the paths exist; powered validation proves accuracy and stability.

## Temperature and commissioning behavior

U29 TMP102 monitors board temperature near the bridge. Its active-low open-drain ALERT feeds U33, which combines TEMP_OK with the existing watchdog/voltage-window result before RUN_SAFE. Firmware configures a 70 °C threshold and 55 °C hysteresis, reads back the configuration, rejects stale/invalid samples and requests progressive current reduction above 60 °C. Board temperature is not a direct MOSFET junction measurement. The commissioning image keeps motor outputs disabled until the TI configuration and physical motion validation gates are satisfied; it does not claim that a current request has been applied to an energized driver.

The external TMC5160A bridges remain the approved architecture. DRV8462 in the DDV package is a redesign candidate, not an interchangeable replacement; the lower-current DDW/DDW-family reference stage must not be copied into this 5.5 A RMS target without a new power/thermal review.

## Primary references

- [Texas Instruments TPS26750 product page](https://www.ti.com/product/TPS26750)
- [Texas Instruments TPS26750 datasheet](https://www.ti.com/lit/ds/symlink/tps26750.pdf)
- [Texas Instruments TPS26750 EVM user guide](https://www.ti.com/lit/ug/slvucp8a/slvucp8a.pdf)
- [Texas Instruments CSD17484F4 datasheet](https://www.ti.com/lit/ds/symlink/csd17484f4.pdf)
- [Texas Instruments TPD4S480 datasheet](https://www.ti.com/lit/ds/symlink/tpd4s480.pdf)
- [ST USBLC6-4 datasheet](https://www.st.com/resource/en/datasheet/usblc6-4.pdf)
- [STMicroelectronics STM32G0B1CB datasheet](https://www.st.com/resource/en/datasheet/stm32g0b1cb.pdf)
- [USB-IF USB Type-C cable and connector specification](https://www.usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-20)

The PD controller, EEPROM image, cable, source, protection network and powered measurements must all be reviewed before claiming EPR operation on assembled hardware.
