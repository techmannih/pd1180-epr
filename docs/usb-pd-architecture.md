# USB-C PD, USB data and current-sense architecture

The r0.4 ECO separates PD POWER J1 from USB DATA J10, preserving the original motor-bus backup supply. `scripts/design.test.mjs` checks physical numbered-pin connections in `dist/index/circuit.json`.

## Two independent USB-C ports

J1 and J10 use tscircuit's standard USB-C connector with the exact C3020560 USB4105-GF-A footprint. J1 VBUS is PD_VBUS and J10 VBUS is USB_DATA_VBUS; they are never joined. J1 D+/D− pins are NC. Its SBU contacts use U1's protected SBU channels, whose system-side outputs are NC. J10 is a self-powered USB device: connect J1 for logic startup, including at default 5 V before EPR negotiation. J10 VBUS feeds only ESD bypass and attach sensing.

U5 derives logic power from PD_VBUS before the motor eFuse. U22 retains VMOTOR-fed logic backup for brake control after PD loss. U23/U24 retain their reverse-blocked rail OR. Detach, reverse current and regeneration remain mandatory bench checks.

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

- U6 TPS26631 pin 13 produces `IIN_MON`; R26 converts it to a voltage and U16 pin 12 reads it with an ADC.
- The independent VMOTOR divider R31/R32/R33 produces `VMON_ADC`; U16 pin 11 reads motor-bus voltage with a separate ADC channel.
- R109 and R110 are independent 33 mΩ, 3 W low-side phase shunts connected to TMC5160A `SRAH` and `SRBH` inputs for phase-current regulation.
- The TMC5160A is intentionally an external-bridge controller. Q6–Q13 are its two full MOSFET bridges, not manual substitutes for an integrated output stage.
- Firmware must calibrate input-current telemetry and configure TMC5160A current scaling, gate drive and chopper behavior for the actual motor. The netlist proves the paths exist; powered validation proves accuracy and stability.

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
