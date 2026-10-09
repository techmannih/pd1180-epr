# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## System compatibility and integration

| Area | PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR, r0.4 ECO |
|---|---|
| Input power | USB-C PD 3.1 EPR 48 V / 5 A requested contract; the motor output remains inhibited until a valid contract is confirmed |
| Logic power | Independent USB-side and motor-bus buck regulators, reverse-blocked into the 3.3 V rail |
| Motor stage | TMC5160A with external MOSFET bridges; 5.5 A RMS phase-current design target |
| USB | J1 PD POWER plus J10 USB DATA; both cables required for setup, no need for the EPR charger to provide host data |
| Step/Dir | 24 V transistor-conditioned Step and Direction inputs |
| Encoder | Bottom-side AS5047P aligned at board center, plus labelled ABI service pads |
| Field buses | CAN, RS485 and RS232; bus termination is fitted in the external harness |
| Outputs | Hardware enable and two protected low-side outputs on consolidated J7; pin17 exposes VMOTOR |
| Programming | Bottom-side SWD service pads for the STM32 and an I2C configuration EEPROM for the PD controller |
| Mechanics | 85.9 × 85.9 mm TMCM-1180 V1.1 stepped outline, four 4.2 mm mounting holes on the documented asymmetric pattern |
| Assembly | All fitted parts and service pads on top; no bottom paste. Through-hole headers and bulk capacitors may require selective or hand soldering. Revalidate the encoder magnet gap and orientation. |

Verify connector polarity, voltage, wire gauge, mating housings and cable keying against [assembly.md](assembly.md) before building a harness.
