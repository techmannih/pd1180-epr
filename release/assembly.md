# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Assembly

Use this guide to prepare the PCB/PCBA order and the subsequent installation, programming and first-article tests. The release package contains matched fabrication files, assembly data, software and verification evidence. [Commissioning](commissioning.md) gives the executable post-assembly sequence; `bun run check:release` enforces the recorded acceptance gates.

J2/J3 WAGO spring clamps and U38 INA237 raw PD_VBUS sensing are implemented. Selected first-article cooling parts are listed in [thermal qualification](thermal-qualification.md); install supported DDV top-side contact and record physical fit/temperature. The retained 1 oz stack requires its own current/thermal measurements; TI’s 2 oz recommendation is a different construction.

### Stack and placement

- 85.9 × 85.9 mm, 1.6 mm, four-layer board with four 4.2 mm mounting holes and 1 oz copper on all layers. The fabricator must confirm the USB impedance stack-up; current/thermal qualification remains pending.
- Assembly is top-side only. All fitted components and service pads are on top. U18 alone is on the bottom; its C52/C53 bypass footprints are on top. All three are DNP and omitted from the fitted BOM/CPL and paste. The encoder is centered on the intended motor shaft. Magnet dimensions, air gap, alignment and stray-field effects still require mechanical bring-up validation.
- Every via-in-pad requires epoxy filling and copper capping. The current native inventory in `engineering/rp2040-via-in-pad.json` contains 66 via-drill intersections with top paste lands, including C103. Q4/Q16 retain eight drain thermal vias; U34 retains four thermal vias. Confirm the complete current Gerber/drill set with the fabricator; old 62-location/40-bridge-via inventories are superseded.
- Check the imported land patterns, solder-mask/paste openings and manufacturer package drawings. JLC/EasyEDA data are a starting point, not a substitute for footprint review.
- Bulk capacitors and WAGO J2/J3 terminals are through-hole; clarify hand/wave/selective assembly with the assembler. Check capacitor polarity and the 25 mm capacitor height.

### Connector pinout

| Connector | Pins in order |
|---|---|
| J1, PD POWER | Dedicated USB-C EPR power; 48 V / 5 A requested contract; no USB data |
| J10, USB DATA | USB 2.0 to RP2040 and separate current-limited logic supply; no motor power |
| J2, motor | 1 A1, 2 A2, 3 B1, 4 B2 |
| J3, external brake | 1 VMOTOR, 2 switched resistor return (not a permanent ground) |

Pin numbering follows the imported physical footprints. J7 and the industrial command/transceiver interfaces are removed in the selected onboard-control design. Use the J2/J3 cavity map in [connector-harnesses.md](connector-harnesses.md); cables, resistor terminals and strain relief are separate procurement items; WAGO does not need mating housings or socket contacts. J6/J9 are retired; do not use their historical pinouts.

## Programming and first-article work order

Provide the matching release manifest, Gerbers/drills, top BOM/CPL, native reports, TI configuration archive and RP2040 diagnostic archive. The assembly team follows [commissioning](commissioning.md), which includes the separate board-bound stationary-power and bounded-motor build commands.

| Stage | Files and actions | Record |
|---|---|---|
| Fabrication and assembly | Confirm stack-up/USB impedance, ENIG, all 66 filled/capped via-in-pad locations, through-hole WAGO terminals and tall capacitors; review the eight USB hole findings and critical markings | Supplier disposition, revision/hash, inspection results |
| Parts and installation | Allocate the exact BOM quantities; fit driver cooler/TIM/support, J3 resistor/cooler/guard, motor restraint and strain relief | Parts identities, fit, fastening and continuity checks |
| TI programming | Program U3 M24512-RMN6TP with the registered full-flash image through the U36-isolated fixture | Complete **65,536-byte EEPROM readback**, image comparison, cold APP boot and actual EPR contract |
| MCU programming | Program RP2040/U17 with the diagnostic ELF/BIN/UF2 using SWD/BOOTSEL; raw BIN starts at **0x10000000** | Complete **4,194,304-byte QSPI readback**, image comparison, board serial and `PROFILE`/`POWER`/`STATUS`/`DRIVER` responses |
| Stationary supply test | Complete the diagnostic prerequisite record, build/read back `power-test`, then local START with J2 disconnected and J3 fitted | eFuse ramp, protected VMOTOR, MOTOR_PG, ADC readings and fault response; ENABLE/STEP stay low, bus switches off after 30 s |
| First motor test | Add stationary-test, installed-cooling and motor-restraint records; build/read back `bench-test` | <=800 mA RMS request (~773 mA nominal), 10 rpm unloaded, 10 s run and one-second stop ramp; record phase current, bus peak and temperatures |
| Application profile | Use first-article measurements to choose the intended current, load, duty and stopping envelope | Reviewed operating settings, repeatable per-board procedure and exact image hashes |

The normal firmware ZIP is the diagnostic image, with its four qualification flags false. Test profiles are already implemented and built explicitly from the operator's board-bound records; they do not require the future motor/thermal test to have passed before its first run. Every image boots disarmed. The standard bench image has no reverse or arbitrary-current/speed command.

### Programming fixture

Follow [PD programming](pd-programming.md) and [firmware programming](../firmware/README.md). Ground TP_PD_ISO before fixed-5 V target power to isolate U2's I2Cc bus from the U3 programming pads. Keep programmer VCC off and verify both-wire isolation and target power loss. SWD/J10 do not directly program the PD EEPROM. Use the **full-flash** binary at EEPROM address zero; TI's host-update commands assume an initialized working application and are a different procedure.

Keep J2 disconnected for initial programming and diagnostic supply checks. Program test images with PD removed, perform a fresh full readback and cold boot, and compare `PROFILE` with the board record before local START. Keep the raw device dumps and programmer logs alongside the comparator result.

### Assembly/test-provider brief

> Please quote fabrication, complete top-side assembly and programming for the supplied PD1180-EPR RP2040/DRV8462DDV revision. Include WAGO terminals, tall capacitors and the 66 filled/capped via-in-pad locations. Review the stack-up/USB impedance, eight USB hole-clearance findings and critical markings with the supplied acceptance record. Program and read back the TI EEPROM and RP2040 diagnostic images. The provided commissioning procedure then builds a 30-second stationary-power profile and a <=800 mA RMS request / 10 rpm / 10-second unloaded motor profile against serial-numbered prerequisite records. Please identify the fixture, installation, test-service scope, costs and lead time, and retain image hashes and measurement records for each tested board.

This is a prepared brief; no supplier service has been booked. [JLC programming](https://jlcpcb.com/help/article/pcba-programming-service) and [functional testing](https://jlcpcb.com/help/article/functional-test-service) require provider review of the actual interface, files and fixture. Agree whether the provider or the receiving team performs each post-assembly stage.

### Installation and acceptance record

Use [thermal installation](thermal-qualification.md) for the selected first-article driver cooler/TIM and brake resistor/cooler, support and guard requirements. The selected **10 Ω / 300 W Vishay resistor** uses its specified case-temperature rating; that rating is not the continuous dissipation of the assembled cooler. Record physical fit and measured temperatures during the staged tests.

The EPR adapter/cable, [J2 harness](motor-harness.md), ordered motor, J3 resistor/cooling, guard, fastening and programming fixture are external assembly items. Confirm their exact supply and assembly scope separately from the PCB BOM. The motor STEP establishes the four rear axes; measure thread/engagement and solder-tail clearance before selecting screws/spacers. The model's 19.5 mm gap is a preview dimension. Optional U18/C52/C53 stay DNP; rear magnet installation is an optional extension.

For each assembled board record its serial, release/image hashes, operator, instruments and date. Capture assembly inspection, complete device readbacks, cold boot, actual supply contract, voltage/current readings, interlock and stop response, and the motor/brake temperature traces appropriate to the selected profile. These records are filled after assembly; the software verification report describes automated checks only.

## Imported-part corrections

The RP2040 package has its own pin map, grounded exposed pad and local 1.1/3.3 V bypasses. U7 uses the 44-pin top-cooled DRV8462DDV footprint; DDW is not interchangeable. The eight external motor-bridge MOSFETs have been removed. Retained Q4/Q16 drain and U34 thermal vias require the stated filled/capped process. Verify all exact manufacturer lands and the current native BOM/CPL before assembly.

## PD power-path enable buffer

Fit Q2/Q3 as CSD17484F4 (`C2862245`), R9/R12 as 0 Ω (`C21189`), and R11/R13 as 100 kΩ (`C25803`). Both pull-ups terminate at `PD_3V3`, U2's LDO_3V3 rail. This is the two-NMOS non-inverting buffer in the TPS26750 EVM and Figure 8-5 of the TPS26750 datasheet. R10 is intentionally absent; do not add the retired BJT base pull-down.

## Logic backup supply

U22, L2 and U24 provide motor-side logic backup; U5, L1 and U23 provide PD-side startup. Fit both LM66100 parts and R111. The wiring follows TI Figure 17: U23 CE senses V3V3_MOTOR, U23 ST and U24 CE share LOGIC_OR_PRIORITY, and R111 pulls that interlock up to V3V3_PD. U24 ST is grounded because it is unused. U26 is removed. U27 reverse-blocks DATA-derived V3V3_USB into V3V3_MCU; there is no PD/board supply path to the MCU. U39 isolates the board I²C bus and U40 isolates the status/MISO inputs when DATA is absent. Do not substitute the simpler common-output CE wiring; equal inputs can turn both devices off. The 3.3 V service pads are logic references; an external accessory current budget has not been allocated.

## Indicator and programming-fixture acceptance

Verify the new top-side D16/D17/BZ1/Q26/U35/U36 parts and their polarity against the source/BOM, with R126 = 1 kΩ and R127 = 100 kΩ. Check the 19 bare service contacts against the fixture map in [pd-programming.md](pd-programming.md). The indicators consume board V3V3 and do not imply motor permission or correct PD programming. Verify RGB visibility, power indication, fault chirps, silent reset and the combined rail current using [indicators.md](indicators.md). Record these tests with the per-board firmware/configuration hashes.

Complete the serial-numbered programming/readback and cold-boot checklist in [readiness.md](readiness.md), then the supply/fault → low-current motion → brake/thermal sequence. Follow [manufacturing-acceptance.md](manufacturing-acceptance.md) for ENIG, all 66 filled/capped via-in-pad locations, stack-up, shorter USB stakes, actual mounting and harness acceptance. The default image supplies diagnostics; the recorded stationary-power and bounded-motor profiles support the following post-assembly tests.
