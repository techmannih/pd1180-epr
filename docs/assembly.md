# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Assembly

Use `bun run check:release` to review every manufacturing and bring-up gate before ordering or energizing a board.

### Stack and placement

- 85.9 × 85.9 mm, 1.6 mm, four-layer board with four 4.2 mm mounting holes. Final copper weight and stack-up are selected during current/thermal and USB impedance review.
- Every populated part is on the top side. The AS5047P and its local components are top-side parts centered on the intended motor shaft. Magnet dimensions, air gap, alignment and stray-field effects are validated during mechanical bring-up.
- The power MOSFET drain pads contain connected via-in-pad holes. Order filled-and-capped via-in-pad processing if this footprint is retained.
- Check the imported land patterns, solder-mask/paste openings and manufacturer package drawings. JLC/EasyEDA data are a starting point, not a substitute for footprint review.
- Bulk capacitors and JST headers are through-hole; clarify hand/wave/selective assembly with the assembler. Check capacitor polarity and the 25 mm capacitor height.

### Connector pinout

| Connector | Pins in order |
|---|---|
| J1 | USB-C, EPR power and USB 2.0 data; shell to ground |
| J2, motor | A1, A2, B1, B2 |
| J3, external brake | VMOTOR, switched resistor return |
| J4, SWD | 3.3 V reference, SWDIO, GND, SWCLK, NRST, status GPIO |
| J5, encoder monitor | 3.3 V, A, B, index, GND; do not drive these outputs |
| J6, serial | RS232 TX, RS232 RX, GND, CAN H, CAN L, GND, RS485 A, RS485 B |
| J7, inputs | IN0, IN1, STOP L, STOP R, HOME, GND |
| J8, step/dir | 24 V STEP input, 24 V DIR input, GND, 3.3 V reference |
| J9, outputs/enable | **48 V VMOTOR**, hardware enable, OUT0, OUT1 |

Pin numbering follows the imported physical footprints. Mating housings, contacts, wire gauge and strain relief are separate procurement items.

## Programming and external items

Program U3 with the approved TI TPS26750 patch/configuration image and U16 with board-specific firmware before motor bring-up. Keep POWER_PERMIT and MCU_RUN low in blank/reset/fault states. SWD is a 3.3 V interface.

The EPR charger, EPR cable, motor, shaft magnet, external braking resistor/heatsink and bus terminators are not assembled PCB components. Their final part numbers and load-dependent ratings are release gates. All populated PCB parts have timestamped JLCSearch evidence; external-brake stock is still unverified.

## Imported-part corrections

The STM32 registry component is retained with a complete datasheet pin-label override, power/ground attributes and a courtyard. CSD19534 drain thermal vias now have explicit net connections. BAV21 polarity is explicit, bulk capacitor pads carry polarity aliases, imported transistor symbols have reference text, and vertical headers specify top-side cable insertion. These edits are local to `imports/`.

## Logic backup supply

U22, L2 and U24 provide motor-side logic backup; U5, L1 and U23 provide USB-side startup. Fit both LM66100 parts. Their CE pins sense common V3V3; tying CE to ground would remove the intended reverse-current blocking. The 3.3 V header pins are logic references; an external accessory current budget has not been allocated.
