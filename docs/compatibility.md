# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

See [the reference comparison and reviewer response](reference-review.md) for missing functions and unresolved gates. This table describes hardware intent; industrial protocols and motor operation are not implemented in the commissioning image.

## System compatibility and integration

| Area | PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR, r0.4 ECO |
|---|---|
| Input power | USB-C PD 3.1 EPR 48 V / 5 A requested contract; the motor output remains inhibited until a valid contract is confirmed |
| Logic power | PD and motor-bus buck OR plus current-limited DATA LDO, reverse-blocked into the shared 3.3 V rail |
| Motor stage | TMC5160A with external MOSFET bridges; 5.5 A RMS phase-current design target |
| USB | J1 PD POWER plus J10 USB DATA; DATA alone powers setup; PD is required for motion, no need for the EPR charger to provide host data |
| Step/Dir | 24 V transistor-conditioned Step and Direction inputs |
| Encoder | Optional bottom-side AS5047P at board center (DNP), plus labelled top ABI service pads |
| Field buses | CAN, RS485 and RS232; bus termination is fitted in the external harness |
| Outputs | Hardware enable and two protected low-side outputs on consolidated J7; pin17 exposes VMOTOR |
| Programming | Top-side SWD service pads for the STM32 and an I2C configuration EEPROM for the PD controller |
| Mechanics | 85.9 × 85.9 mm TMCM-1180 V1.1 stepped outline, four 4.2 mm mounting holes on the documented asymmetric pattern |
| Assembly | All fitted parts and service pads on top; no bottom paste. Through-hole headers and bulk capacitors may require selective or hand soldering. Revalidate the encoder magnet gap and orientation. |

Verify connector polarity, voltage, wire gauge, mating housings and cable keying against [assembly.md](assembly.md) before building a harness.

## Related application reference

The separate [tscircuit motor-driver-firmware repository](https://github.com/tscircuit/motor-driver-firmware) provides MicroPython control and a Web Serial dashboard for an RP2040/DRV8847 profile. It is distinct from the two PCB source releases inspected here. Its controller/protocol organization is a useful software reference; the supplied image, wiring and coil-sequencing driver are not compatible with this STM32/TMC5160 board. A port needs the correct SPI/current-control adapter, platform services, USB protocol, safe external STEP/DIR ownership and hardware validation. Existing `HELP`/`STATUS`/`DRIVER` CDC commands do not establish dashboard compatibility. No firmware port or dashboard support is claimed by this comparison.
