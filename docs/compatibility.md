# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## System compatibility and integration

| Area | PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR, r0.3 |
|---|---|
| Input power | USB-C PD 3.1 EPR 48 V / 5 A requested contract; the motor output remains inhibited until a valid contract is confirmed |
| Logic power | Independent USB-side and motor-bus buck regulators, reverse-blocked into the 3.3 V rail |
| Motor stage | TMC5160A with external MOSFET bridges; 5.5 A RMS phase-current design target |
| USB | USB-C receptacle with EPR power and USB 2.0 data |
| Step/Dir | 24 V transistor-conditioned Step and Direction inputs |
| Encoder | Top-side AS5047P aligned at board center, plus an encoder monitor connector |
| Field buses | CAN, RS485 and RS232; bus termination is fitted in the external harness |
| Outputs | Hardware enable and two protected low-side outputs on J9; J9 also exposes VMOTOR |
| Programming | SWD connector for the STM32 and an I2C configuration EEPROM for the PD controller |
| Mechanics | 85.9 × 85.9 mm rounded outline, four 4.2 mm mounting holes on the documented asymmetric pattern |
| Assembly | Every populated component is on the top side; through-hole headers and bulk capacitors may require selective or hand soldering |

Verify connector polarity, voltage, wire gauge, mating housings and cable keying against [assembly.md](assembly.md) before building a harness.
