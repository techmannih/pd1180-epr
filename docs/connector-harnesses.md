# Connections in the onboard-control ECO

J2 and J3 use onboard WAGO spring clamps; no separate mating plugs or socket contacts are required. SW2 supplies the onboard motion request and J7 remains removed. The exact native findings and held exceptions are recorded in the current verification reports.

| Source | Destination | Connector and cable | Purpose / status |
|---|---|---|---|
| Ordered motor black lead (A+) | J2 pin 1, MOTOR_A1_OUT | TE320559 → Alpha3057 16 AWG → stripped wire → WAGO 2601-3104; 175 mm pigtail | Winding A; continuity and crimp acceptance pending |
| Motor green lead (A−) | J2 pin 2, MOTOR_A2 | Same; 175 mm pigtail | Winding A |
| Motor red lead (B+) | J2 pin 3, MOTOR_B1_OUT | Same; 175 mm pigtail | Winding B |
| Motor blue lead (B−) | J2 pin 4, MOTOR_B2 | Same; 175 mm pigtail | Winding B |
| 48 V / 5 A EPR source | J1 POWER | Exact source SKU and 5 A EPR cable still require qualification | Motor power; no generic USB cable or laptop supply is assumed |
| Setup/diagnostic host | J10 DATA | USB data cable SKU pending | Optional diagnostics; not the normal START control |
| J3 pin 1 VMOTOR | Brake resistor terminal 1 | WAGO 236-402 spring clamp; candidate resistor, cable/terminals described in brake-integration.md | Connected nominal CAD assembly; physical/thermal qualification incomplete |
| Brake resistor terminal 2 | J3 pin 2 BRAKE_RETURN / Q16 | Nominal 165/210 mm cable cuts modeled; installed lengths, temperature, heatsink and mounting unqualified | Switched return; not permanent GND |
| Programming equipment | SWD and isolated EEPROM test pads | Fixture/programmer acceptance pending | Manufacturing service only |

SW2 is on the PCB: RP2040 GP11 to GND, with R133 to V3V3_MCU. RP2040 configures DRV8462 over SPI and generates STEP/DIR pulses, so there is no external command harness. SW1 remains RESET.

The J2 175/175/175/175 mm cut lengths include 12 mm termination/adjustment allowance and are CAD proposals requiring first-article fit. TE320559 uses the actual manufacturer AE STEP: nominal length 32.131 mm and diameter 5.6134 mm, translated without scaling. Rev V6 drawing and STEP are archived with hashes. The finished crimp is not dimensionally qualified by the uncrimped CAD. Physical harness retention remains open after removal of the unsupported adapter-mounted clamp. No loose cable is rendered as a completed external system.
