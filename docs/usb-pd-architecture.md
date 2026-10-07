# USB-C PD, USB data and current-sense architecture

This note records the compiled paths that combine USB Power Delivery and USB 2.0 data on one receptacle while keeping motor/input-current sensing independent. `scripts/design.test.mjs` checks these paths against `dist/index/circuit.json`; prose alone is not accepted as evidence.

## One physical USB-C port

J1 uses tscircuit's standard `<connector standard="usb_c">` model with the exact JLCPCB/LCSC `C3020560` USB4105-GF-A footprint. Its VBUS contacts share `USB_VBUS`, its CC pins reach the TPS26750 through U1, and its D+/D− contacts reach the STM32 through U1 and R71/R72. J1 SBU1/SBU2 are unused.

The connector can carry EPR power and USB 2.0 simultaneously when the upstream port provides both a 48 V / 5 A EPR source and a USB host. A power-only EPR charger supplies the motor without USB data; an ordinary host can provide USB data at its supported power level but cannot be assumed to supply 240 W.

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
J1 D+/D-
  -> U1 TPD4S480 SBU protection channels used in TI's documented DP/DM configuration
  -> R71/R72 22 ohm series resistors
  -> U16 STM32G0B1 USB_DP / USB_DM

J1 VBUS -> R107 1 Mohm -> USB_VBUS_SENSE -> R108 47 kohm || C72 100nF -> GND
                                             -> U16 PB0 / ADC_IN8
```

TPS26750 owns the Type-C Rd/CC sink behavior, so no second set of discrete CC pulldowns is fitted. The divider ratio is 47 / 1047. It presents approximately 0.224 V at 5 V, 2.154 V at 48 V and 2.693 V at the 60 V review limit. This keeps PB0 below 3.0 V across the reviewed range while retaining an ADC-detectable default-USB level. Firmware must use a validated threshold below the 5 V minimum and must not assert the USB device pull-up when VBUS is absent.

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
