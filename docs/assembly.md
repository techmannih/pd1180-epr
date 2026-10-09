# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Assembly

Use `bun run check:release` to review every manufacturing and bring-up gate before ordering or energizing a board.

### Stack and placement

- 85.9 × 85.9 mm, 1.6 mm, four-layer board with four 4.2 mm mounting holes. Final copper weight and stack-up are selected during current/thermal and USB impedance review.
- Assembly is top-side only. All fitted components, the AS5047P, its local bypass parts and service pads are on top. The encoder is centered on the intended motor shaft. Magnet dimensions, air gap, alignment and stray-field effects are validated during mechanical bring-up.
- The ten CSD19534Q5A drain pads contain four connected 0.60/0.30 mm through vias each (40 total). The final top-side route has 71 via drills overlapping top solder lands, including these 40 thermal vias; exact locations are recorded in `engineering/top-side-placement.json`. Order epoxy-filled and copper-capped processing for every via-in-pad; the regression checks verify the exact references, count, dimensions, layers and drain-net identity.
- Check the imported land patterns, solder-mask/paste openings and manufacturer package drawings. JLC/EasyEDA data are a starting point, not a substitute for footprint review.
- Bulk capacitors and JST headers are through-hole; clarify hand/wave/selective assembly with the assembler. Check capacitor polarity and the 25 mm capacitor height.

### Connector pinout

| Connector | Pins in order |
|---|---|
| J1 | Combined USB-C EPR power and USB 2.0 device data; 48 V / 5 A requested contract, D+/D− to STM32, shell to ground |
| J2, motor | A1, A2, B1, B2 |
| J3, external brake | VMOTOR, switched resistor return |
| J6, serial | RS232 TX, RS232 RX, GND, CAN H, CAN L, GND, RS485 A, RS485 B |
| J7, machine inputs | HOME, STOP L, STOP R, IN0, IN1, 24 V STEP, 24 V DIR, GND |
| J9, outputs/enable | **48 V VMOTOR**, hardware enable, OUT0, OUT1 |

Pin numbering follows the imported physical footprints. Mating housings, contacts, wire gauge and strain relief are separate procurement items.

## Programming and external items

Program U3 with the approved TI TPS26750 patch/configuration image and U16 with board-specific firmware before motor bring-up. Keep POWER_PERMIT and MCU_RUN low in blank/reset/fault states. SWD is a 3.3 V interface provided on labelled top service pads; use a pogo fixture with the adjacent 3.3 V and ground pads.

The EPR charger, EPR cable, motor, shaft magnet, external braking resistor/heatsink and bus terminators are not assembled PCB components. Their final part numbers and load-dependent ratings are release gates. All populated PCB parts have timestamped JLCSearch evidence; external-brake stock is still unverified.

The hosted tscircuit 3D assembly does not currently include a motor primitive because `assembly.motor` does not support a `nema34` standard. Do not substitute `nema23` or invent an unsupported enum. Until native NEMA 34 support exists, verify the motor fit with `mounting-template.svg`, the motor drawing, standoff dimensions and an external mechanical assembly review.

## Imported-part corrections

The STM32 registry component is retained with a complete datasheet pin-label override, power/ground attributes and a courtyard. CSD19534 drain thermal vias are implemented in the final KiCad route with explicit drain-net identities and bottom copper ties. Q2/Q3 use the exact CSD17484F4 PicoStar-3 land pattern and G/S/D pin map from the imported JLC part. BAV21 polarity is explicit, bulk capacitor pads carry polarity aliases, imported transistor symbols have reference text, and vertical headers specify top-side cable insertion.

## PD power-path enable buffer

Fit Q2/Q3 as CSD17484F4 (`C2862245`), R9/R12 as 0 Ω (`C21189`), and R11/R13 as 100 kΩ (`C25803`). Both pull-ups terminate at `PD_3V3`, U2's LDO_3V3 rail. This is the two-NMOS non-inverting buffer in the TPS26750 EVM and Figure 8-5 of the TPS26750 datasheet. R10 is intentionally absent; do not add the retired BJT base pull-down.

## Logic backup supply

U22, L2 and U24 provide motor-side logic backup; U5, L1 and U23 provide USB-side startup. Fit both LM66100 parts and R111. The wiring follows TI Figure 17: U23 CE senses V3V3_MOTOR, U23 ST and U24 CE share LOGIC_OR_PRIORITY, and R111 pulls that interlock up to V3V3_USB. U24 ST is grounded because it is unused. Do not substitute the simpler common-output CE wiring; equal inputs can turn both devices off. The 3.3 V header pins are logic references; an external accessory current budget has not been allocated.
