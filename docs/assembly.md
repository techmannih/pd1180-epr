# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Assembly

The requested deliverable is a fabricated, fully populated, programmed and functionally tested PCBA. Ordering remains on hold. `bun run check:release` checks the documented release gates; it is not a powered test. Follow [the README startup procedure](../README.md#connections-and-operation) and [power-validation.md](power-validation.md) for commissioning.

### Stack and placement

- 85.9 × 85.9 mm, 1.6 mm, four-layer board with four 4.2 mm mounting holes and 1 oz copper on all layers. The fabricator must confirm the USB impedance stack-up; current/thermal qualification remains pending.
- Assembly is top-side only. All fitted components, the AS5047P, its local bypass parts and service pads are on top. The encoder is centered on the intended motor shaft. Magnet dimensions, air gap, alignment and stray-field effects are validated during mechanical bring-up.
- The ten CSD19534Q5A drain pads contain four connected 0.60/0.30 mm through vias each (40 total), and U34 has four exposed-pad thermal vias. The final top-side route has 69 via drills overlapping top solder lands; exact locations are recorded in `engineering/top-side-placement.json`. Order epoxy-filled and copper-capped processing for every via-in-pad, with no finished via drill below 0.30 mm.
- Check the imported land patterns, solder-mask/paste openings and manufacturer package drawings. JLC/EasyEDA data are a starting point, not a substitute for footprint review.
- Bulk capacitors and JST headers are through-hole; clarify hand/wave/selective assembly with the assembler. Check capacitor polarity and the 25 mm capacitor height.

### Connector pinout

| Connector | Pins in order |
|---|---|
| J1, PD POWER | Dedicated USB-C EPR power; 48 V / 5 A requested contract; no USB data |
| J10, USB DATA | USB 2.0 to STM32 and separate current-limited logic supply; no motor power |
| J2, motor | 1 A1, 2 A2, 3 B1, 4 B2 |
| J3, external brake | 1 VMOTOR, 2 switched resistor return (not a permanent ground) |
| J7, industrial harness | 1 HOME, 2 STOP L, 3 STOP R, 4 IN0, 5 IN1, 6 STEP, 7 DIR, 8 GND, 9 RS232 TX, 10 RS232 RX, 11 GND, 12 CAN H, 13 CAN L, 14 GND, 15 RS485 A, 16 RS485 B, 17 VMOTOR, 18 HW ENABLE, 19 OUT0, 20 OUT1 |

Pin numbering follows the imported physical footprints. J7 is the 20-pin B20B-PHDSS(LF)(SN), with PHDR-20VS mating housing. Its signal map is authoritative in `hardware-contract.json`. J7 pin 17 carries nominal 48 V VMOTOR, not regulated 24 V. J6/J9 are retired; do not use their old pinouts. Inputs remain nominal 24 V, with a shared ground. Mating housings, contacts, wire gauge and strain relief are separate procurement items.

## Programming and external items

Program U3 with the approved TI-generated TPS26750 full-flash image and U16 with board-specific firmware before motor bring-up. The TI image is currently missing; the supplied STM32 image is for motion-locked commissioning only. Keep POWER_PERMIT and MCU_RUN low in blank/reset/fault states. SWD is a 3.3 V interface provided on labelled top service pads; use a pogo fixture with the adjacent 3.3 V and ground pads.

### Programming and test work order

JLCPCB currently offers [programming](https://jlcpcb.com/help/article/pcba-programming-service) and [functional testing](https://jlcpcb.com/help/article/functional-test-service) for **Standard PCBA**, subject to review of the customer's files, interfaces and test method. Programming takes place after assembly. Request these services explicitly and obtain acceptance for this board's 48 V motor/brake test and fixture; no service has been booked or confirmed here.

Supply the following before approving a ready-to-run batch:

1. Exact board revision and release hashes; matching top BOM/CPL; complete through-hole/tall-part assembly scope; 69 filled/capped via-in-pad locations and the agreed stack-up.
2. U3 **M24512-RMN6TP**: approved full-flash BIN, hash, reviewed EEPROM programming method and readback verification. [TI's EVM guide](https://www.ti.com/lit/ug/slvucp8/slvucp8.pdf) describes generating the full-flash binary. This board's U3 uses EEP_SDA/EEP_SCL on U2's I2Cc bus, separate from the STM32's PD_SDA/PD_SCL host bus. Post-assembly access, power sequencing and bus ownership still need a demonstrated fixture method; do not assume SWD or J10 directly programs this EEPROM.
3. U16 **STM32G0B1CBT6**: qualified motor-enabled BIN/HEX, hash, SWD pad drawing, flash address `0x08000000` for a raw BIN, supply arrangement and readback procedure. The existing commissioning archive is suitable only for initial diagnostic testing. Do not substitute it as the final motor-operating image.
4. Exact motor and brake load, qualified current/microstep settings, STEP pulse/ direction timing and maximum rate, supply/cable, external 24 V controls, heatsink, enclosure and ambient limits. These operating limits must come from first-article qualification, not the 5.5 A target alone.
5. An accepted fixture and test procedure: labelled power/USB/motor/J7 connections, current limiting, probes, controlled loads, expected readings, stop criteria and an operator demonstration. Agree who performs first-article qualification and who tests the remaining boards.

### Acceptance record

No hardware results exist yet. Complete first-article qualification using every applicable row in [power-validation.md](power-validation.md). From that qualified design, approve a repeatable per-board test covering:

| Per-board evidence | Acceptance requirement |
|---|---|
| Assembly inspection | Correct revision/parts, polarity, solder joints, filled/capped lands and all ordered through-hole parts fitted |
| Programming | U3/U16 identity, exact image hashes, successful verify/readback and reset behavior recorded |
| Power and USB | Required rails within qualified limits, negotiated 48 V / 5 A contract, no unintended enable, USB diagnostics and source transitions working |
| Motor operation | Controlled STEP/DIR test in both directions at the approved current/speed/load; record measured phase current and driver status |
| Inhibits and stop | Hardware enable, limits, watchdog/reset and the approved fault tests inhibit motion; no automatic re-arm |
| Thermal/brake | Test at the qualified load/duty/ambient using the approved resistor/heatsink; record bus peak and temperatures against approved limits |
| Handoff | Board serial, inspector/tester, date, instruments, results, firmware/configuration hashes and PASS/FAIL; retain supporting traces/video |

Blank devices, a programmed-but-motion-locked image, a USB-only demo, or an assembly photograph do not meet the requested ready-to-run acceptance. Keep shipment acceptance pending until the agreed tests pass; do not replace missing results with a CAD check. Factory testing against a qualified fixture also does not establish operation with an unspecified motor or load.

The EPR charger, EPR cable, motor, shaft magnet, external braking resistor/heatsink and bus terminators are not assembled PCB components. Their final part numbers and load-dependent ratings are release gates. All populated PCB parts have timestamped JLCSearch evidence; external-brake stock is still unverified.

The hosted tscircuit 3D assembly does not currently include a motor primitive because `assembly.motor` does not support a `nema34` standard. Do not substitute `nema23` or invent an unsupported enum. Until native NEMA 34 support exists, verify the motor fit with `mounting-template.svg`, the motor drawing, standoff dimensions and an external mechanical assembly review.

## Imported-part corrections

The STM32 registry component is retained with a complete datasheet pin-label override, power/ground attributes and a courtyard. CSD19534 drain thermal vias are implemented in the final KiCad route with explicit drain-net identities and bottom copper ties. Q2/Q3 use the exact CSD17484F4 PicoStar-3 land pattern and G/S/D pin map from the imported JLC part. BAV21 polarity is explicit, bulk capacitor pads carry polarity aliases, imported transistor symbols have reference text, and vertical headers specify top-side cable insertion.

## PD power-path enable buffer

Fit Q2/Q3 as CSD17484F4 (`C2862245`), R9/R12 as 0 Ω (`C21189`), and R11/R13 as 100 kΩ (`C25803`). Both pull-ups terminate at `PD_3V3`, U2's LDO_3V3 rail. This is the two-NMOS non-inverting buffer in the TPS26750 EVM and Figure 8-5 of the TPS26750 datasheet. R10 is intentionally absent; do not add the retired BJT base pull-down.

## Logic backup supply

U22, L2 and U24 provide motor-side logic backup; U5, L1 and U23 provide PD-side startup. Fit both LM66100 parts and R111. The wiring follows TI Figure 17: U23 CE senses V3V3_MOTOR, U23 ST and U24 CE share LOGIC_OR_PRIORITY, and R111 pulls that interlock up to V3V3_PD. U24 ST is grounded because it is unused. U26/U27 separately combine board V3V3 and DATA-derived V3V3_USB into V3V3_MCU. Do not substitute the simpler common-output CE wiring; equal inputs can turn both devices off. The 3.3 V service pads are logic references; an external accessory current budget has not been allocated.
