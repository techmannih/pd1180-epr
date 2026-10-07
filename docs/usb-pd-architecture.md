# USB-C PD, USB data and current-sense architecture

This note records the compiled paths that keep USB Power Delivery, USB 2.0 data and motor/input-current sensing independent. `scripts/design.test.mjs` checks these paths against `dist/index/circuit.json`; prose alone is not accepted as evidence.

## Two physical USB-C ports

J1 and J10 both use tscircuit's standard `<connector standard="usb_c">` model with the exact JLCPCB/LCSC `C3020560` USB4105-GF-A footprint.

- J1 is the power port. Its VBUS contacts share `USB_VBUS`, its CC pins reach the PD controller through U1, and its D+/D− pins are explicitly unused.
- J10 is the data port. Its D+/D− pins reach the STM32, each CC pin has its own 5.1 kΩ Rd, and its 5 V `USB_DATA_VBUS` rail is used only for attach sensing. `USB_DATA_VBUS` and the 48 V-capable `USB_VBUS` rail are distinct nets.

## Power Delivery path

```text
J1 CC1/CC2
  -> U1 TPD4S480 CC short-to-VBUS protection
  -> CC1_PD / CC2_PD
  -> U2 TPS26750 pins 24/25
  -> configured sink-only 48 V / 5 A EPR negotiation
```

The TPS26750 is the dedicated PD controller. TI specifies EPR sink support at 28 V, 36 V and 48 V and shows the PD exchange on CC. U2's optional `USB_P`/`USB_N` pins do not carry board USB data; pins 22 and 23 are grounded as TI requires for unused GPIO4/GPIO5. The TPS26750 `POWER_PATH_EN` output is translated and combined with the MCU permit before the TPS26631 eFuse can energize the motor bus.

The board still requires a reviewed TI-generated full-flash configuration image in U3. A blank image leaves the design in SafeMode and does not negotiate 48 V.

## USB 2.0 data and attach path

```text
J10 D+/D-
  -> U1 TPD4S480 SBU protection channels used in TI's documented DP/DM configuration
  -> R71/R72 22 ohm series resistors
  -> U16 STM32G0B1 USB_DP / USB_DM

J10 CC1 -> R105 5.1k -> GND
J10 CC2 -> R106 5.1k -> GND

J10 5 V VBUS -> R107 100k -> USB_DATA_VBUS_SENSE -> R108 100k || C72 100nF -> GND
                                                     -> U16 PB0 / ADC_IN8
```

At 5 V the equal divider presents approximately 2.5 V to PB0, inside the 3.3 V MCU domain. Firmware must use this signal for J10 attach/detach state and must not assert the USB device pull-up when J10 VBUS is absent. The J10 VBUS rail is never ORed into logic or motor power.

TI documents that the TPD4S480 SBU OVP FETs may protect USB 2.0 DP/DM instead of SBU. This is the configuration used here: connector DP/DM connect to `C_SBU1/C_SBU2`, while the protected system side connects to `SBU1/SBU2`.

## Motor current and voltage feedback

- U6 TPS26631 pin 13 produces `IIN_MON`; R26 converts it to a voltage and U16 pin 12 reads it with an ADC.
- The independent VMOTOR divider R31/R32/R33 produces `VMON_ADC`; U16 pin 11 reads motor-bus voltage with a separate ADC channel.
- R109 and R110 are independent 33 mΩ, 3 W low-side phase shunts connected to TMC5160A `SRAH` and `SRBH` inputs for phase-current regulation.
- The TMC5160A is intentionally an external-bridge controller. Q6–Q13 are its two full MOSFET bridges, not manual substitutes for an integrated output stage.
- Firmware must calibrate input-current telemetry and configure TMC5160A current scaling, gate drive and chopper behavior for the actual motor. The netlist proves the paths exist; powered validation proves accuracy and stability.

## Primary references

- [Texas Instruments TPS26750 product page](https://www.ti.com/product/TPS26750)
- [Texas Instruments TPS26750 datasheet](https://www.ti.com/lit/ds/symlink/tps26750.pdf)
- [Texas Instruments TPD4S480 datasheet](https://www.ti.com/lit/ds/symlink/tpd4s480.pdf)
- [STMicroelectronics STM32G0B1CB datasheet](https://www.st.com/resource/en/datasheet/stm32g0b1cb.pdf)
- [USB-IF USB Type-C cable and connector specification](https://www.usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-20)

The PD controller, EEPROM image, cable, source, protection network and powered measurements must all be reviewed before claiming EPR operation on assembled hardware.
