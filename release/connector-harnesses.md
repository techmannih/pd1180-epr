# Connections in the onboard-control ECO

J7 and its external STEP/DIR/ENABLE/home/limit path are removed from TSX. The matching native PCB has zero unconnected, schematic-parity and ERC findings. Its 404 native text/silkscreen findings are retained and explicitly accepted; unrelated DRC findings remain blocking. No new external controller is needed or selected to justify a spare connector.

| Source | Destination | Connector and cable | Purpose / status |
|---|---|---|---|
| Ordered motor black lead (A+) | J2 pin 1, MOTOR_A1_OUT | TE320559 → Alpha3057 16 AWG → SVH-41T-P1.1 → VHR-4N / B4P-VH; 170 mm pigtail | Winding A; continuity and crimp acceptance pending |
| Motor green lead (A−) | J2 pin 2, MOTOR_A2 | Same; 170 mm pigtail | Winding A |
| Motor red lead (B+) | J2 pin 3, MOTOR_B1_OUT | Same; 170 mm pigtail | Winding B |
| Motor blue lead (B−) | J2 pin 4, MOTOR_B2 | Same; 165 mm pigtail | Winding B |
| 48 V / 5 A EPR source | J1 POWER | Exact source SKU and 5 A EPR cable still require qualification | Motor power; no generic USB cable or laptop supply is assumed |
| Setup/diagnostic host | J10 DATA | USB data cable SKU pending | Optional diagnostics; not the normal START control |
| J3 pin 1 VMOTOR | Brake resistor terminal 1 | VHR-2N + two SVH contacts; candidate resistor, cable/terminals described in brake-integration.md | Connected nominal CAD assembly; physical/thermal qualification incomplete |
| Brake resistor terminal 2 | J3 pin 2 BRAKE_RETURN / Q16 | Nominal 150/115 mm cable cuts modeled; installed lengths, temperature, heatsink and mounting unqualified | Switched return; not permanent GND |
| Programming equipment | SWD and isolated EEPROM test pads | Fixture/programmer acceptance pending | Manufacturing service only |

SW2 is on the PCB: PC6 to GND, with R133 to V3V3_MCU. STM32 supplies the motion command over existing PCB SPI traces, so there is no external command harness. SW1 remains RESET.

The J2 170/170/170/165 mm cut lengths include 12 mm termination/adjustment allowance and are CAD proposals requiring first-article fit. TE320559 uses the actual manufacturer AE STEP: nominal length 32.131 mm and diameter 5.6134 mm, translated without scaling. Rev V6 drawing and STEP are archived with hashes. The finished crimp is not dimensionally qualified by the uncrimped CAD. Physical harness retention remains open after removal of the unsupported adapter-mounted clamp. No loose cable is rendered as a completed external system.
