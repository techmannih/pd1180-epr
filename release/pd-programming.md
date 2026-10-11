# PD EEPROM fixture and power probes

U3 holds the TPS26750 application image. USB DATA and MCU SWD do not program a blank U3. U36 (SN74LVC2G66DCUR) separates the controller's EEPROM I2Cc bus from the EEPROM-side programming pads. R131 normally enables both switches. Grounding TP_PD_ISO opens both wires; R129/R130 provide 4.7 kΩ EEPROM-side pullups. Existing controller-side pullups remain.

The TI-generated full-flash binary is still absent. The requirements in `pd-configuration.json` are not a firmware image. TI tool license acceptance, image generation, fixture implementation and a successful readback/cold-boot record remain required before shipment.

## Fixture contacts

| Pad | Function | Fixture connection |
|---|---|---|
| TP_PD_GND | Logic ground | First make / last break ground |
| TP_PD_VREF | PD_3V3 | High-impedance target-voltage sense only |
| TP_PD_ISO | EEP_LINK_EN | Ground during programming; release for normal boot |
| TP_EEP_SDA | U3 pin 5 | 3.3 V open-drain SDA |
| TP_EEP_SCL | U3 pin 6 | 3.3 V open-drain SCL |
| TP_PD_VBUS | Raw PD input | Rated voltage probe; up to the documented EPR/transient envelope |
| TP_VMOTOR | Protected motor bus | Rated voltage probe; retain discharge/regen precautions |
| TP_PWR_GND | Power ground | Power measurement return |

Silkscreen **1 = TP_PD_VREF, 2 = TP_PD_GND, 3 = TP_EEP_SDA**; the remaining new contacts are marked SCL, ISO, PD V, VM and GND. These are fixture identifiers, not an assumed connector pin order.

All are bare top-side Ø1.4 mm copper pads, excluded from fitted BOM/CPL and the solder-paste stencil. This is a custom pogo fixture footprint, not a standard programming connector. Source coordinates below use the board centre as (0, 0), +X right and +Y up when viewed from the component side. The native KiCad coordinates use X = 100 + source X and Y = 100 − source Y, in millimetres; verify the exact release board before fabricating the fixture.

| Pad | Source X, Y (mm) | Native KiCad X, Y (mm) |
|---|---|---|
| TP_PD_VREF | −15.50, 25.25 | 84.50, 74.75 |
| TP_PD_GND | −20.00, 22.25 | 80.00, 77.75 |
| TP_EEP_SDA | −19.25, 20.25 | 80.75, 79.75 |
| TP_EEP_SCL | 0.75, 19.25 | 100.75, 80.75 |
| TP_PD_ISO | 7.00, 38.00 | 107.00, 62.00 |
| TP_PD_VBUS | 7.00, 41.00 | 107.00, 59.00 |
| TP_VMOTOR | 10.50, 38.00 | 110.50, 62.00 |
| TP_PWR_GND | 19.50, 40.75 | 119.50, 59.25 |

Keep probe barrels and cable strain relief clear of adjacent parts. The 48 V pads are not logic contacts and must not reach the programmer.

## Blank-board sequence

1. Disconnect the motor, brake load and other externally driven interfaces. Discharge VMOTOR and verify it before attaching the fixture. Keep MCU reset asserted through TP_NRST so no application activity starts.
2. With the board unpowered, connect grounds, pull TP_PD_ISO low and keep programmer SDA/SCL high impedance. Disable the programmer's VCC output. U36 is not specified as power-off isolation; do not drive an unpowered board.
3. Apply a current-limited **fixed 5 V source to J1**. Do not negotiate EPR during programming. Verify PD_3V3 at TP_PD_VREF is within the EEPROM/controller operating range and verify isolation stays asserted before enabling the programmer.
4. Use a 3.3 V open-drain programmer at 100 kHz. Do not add 5 V pullups. U3 address pins E0/E1/E2 are grounded and WC is grounded; its 7-bit address is 0x50. Respect the M24512 page-write size, write-cycle completion and ACK polling from its datasheet; do not wrap writes across page boundaries.
5. Write the approved **full** TI flash image, read back the programmed address range and compare it byte-for-byte. Record board serial number, binary SHA-256, programmer settings and readback SHA-256. Never substitute the requirements JSON or a register dump.
6. Return programmer SDA/SCL to high impedance, remove board power, verify discharge, then release TP_PD_ISO. Remove the fixture or leave only high-impedance probes attached. Release MCU reset.
7. Cold boot on fixed 5 V first. Verify the TPS26750 enters APP mode and boots the intended configuration. Only then run the staged EPR/power tests. Keep motor outputs locked until the approved PD image and hardware qualification records are in place.

The fixture must stop I2C immediately if target VREF falls, and must not release isolation while actively programming. Qualify ground-first sequencing, contact bounce, isolation at both wires, absent-target behavior, interrupted writes and recovery on a first article. This document specifies the intended procedure; it is not evidence that a fixture or assembled board has passed it.

## Electrical basis

TI's [SN74LVC2G66 datasheet](https://www.ti.com/lit/ds/symlink/sn74lvc2g66.pdf) specifies two normally open bilateral channels controlled independently. Pins 3 and 7 are joined so the fixture opens both together. The switch is powered from PD_3V3; its analog ports must remain inside the allowed supply range. There is no separate programmer power input to backfeed that rail.

With both sides joined, the paired 4.7 kΩ pullups give about 2.35 kΩ per line (approximately 1.4 mA at 3.3 V). With isolation asserted, each side retains its own 4.7 kΩ pullup. Bus rise time/capacitance, low-level voltage through the switch and cold boot must be measured on the first article. TI image generation follows the [TPS26750 application customization guide](https://www.ti.com/lit/ug/slvucp8/slvucp8.pdf).
