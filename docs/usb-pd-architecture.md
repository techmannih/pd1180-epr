# USB-C PD, USB data and current-sense architecture

This note records the compiled net paths that distinguish USB Power Delivery negotiation, USB 2.0 data and motor/input-current sensing. `scripts/design.test.mjs` checks these paths against `dist/index/circuit.json`; a text description alone is not accepted as evidence.

## USB-C connector model

J1 is the exact JLCPCB/LCSC `C3020560` USB4105-GF-A footprint wrapped by tscircuit's standard `<connector standard="usb_c">` model. Its four VBUS contacts share `USB_VBUS`; the two CC contacts and the two orientation copies of each USB 2.0 data signal remain distinct.

## Power Delivery path

```text
J1 CC1/CC2
  -> U1 TPD4S480 CC short-to-VBUS protection
  -> CC1_PD / CC2_PD
  -> U2 TPS26750 pins 24/25
  -> configured sink-only 48 V / 5 A EPR negotiation
```

The TPS26750 is a dedicated, stand-alone PD controller. TI specifies EPR sink support at 28 V, 36 V and 48 V and shows the PD exchange occurring on the connected CC pin. U2's optional `USB_P`/`USB_N` pins are not used for this board's USB data path; pins 22 and 23 are grounded as TI requires for unused GPIO4/GPIO5. The TPS26750 `POWER_PATH_EN` output is translated and combined with the MCU permit before the TPS26631 eFuse can energize the motor bus.

The board still requires a reviewed TI-generated full-flash configuration image in U3. A blank image leaves the design in SafeMode and does not negotiate 48 V.

## USB 2.0 data path

```text
J1 D+/D-
  -> U1 TPD4S480 protected USB channels
  -> R71/R72 22 ohm series resistors
  -> U16 STM32G0B1 USB_DP / USB_DM
```

The STM32 handles USB device data. These nets never connect to TPS26750 CC1/CC2. USB Type-C exposes D+/D− and CC1/CC2 as separate signal groups, so USB data and USB-PD can coexist on the same receptacle without using D+/D− for PD negotiation.

## Current and voltage feedback

- U6 TPS26631 pin 13 produces `IIN_MON`; R26 converts it to a voltage and U16 pin 12 reads it with an ADC.
- The independent VMOTOR divider R31/R32/R33 produces `VMON_ADC`; U16 pin 11 reads motor-bus voltage with a separate ADC channel.
- RS1 and RS2 are independent 33 mOhm, 3 W low-side phase shunts. They connect to TMC5160A `SRAH` and `SRBH` inputs on pins 8 and 9 for motor phase-current regulation.
- Firmware must calibrate input-current telemetry and configure the TMC5160A current scaler/chopper for the actual motor. The netlist proves the hardware paths exist; powered validation proves their accuracy and stability.

## Primary references

- [Texas Instruments TPS26750 product page](https://www.ti.com/product/TPS26750)
- [Texas Instruments TPS26750 datasheet](https://www.ti.com/lit/ds/symlink/tps26750.pdf)
- [USB-IF USB Type-C cable and connector specification](https://www.usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-20)

The PD controller, EEPROM image, cable, source, protection network and powered measurements must all be reviewed before claiming EPR operation on assembled hardware.
