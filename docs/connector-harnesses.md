# Connections in the onboard-control ECO

J7 and its external STEP/DIR/ENABLE/home/limit path are removed from TSX. The current native report has zero unconnected, schematic-parity and ERC findings and retains 401 text/silkscreen findings. The separate stricter copper-width review found an unresolved U16 pad-entry neck; see [readiness](readiness.md#copper-width-review--2026-10-16). Passing connectivity is not fabrication approval. No external command controller or separate stepper driver is needed by the selected architecture.

| Source | Destination | Connector and cable | Purpose / status |
|---|---|---|---|
| Ordered motor black lead (A+) | J2 pin 1, MOTOR_A1_OUT | TE320559 → Alpha3057 16 AWG → SVH-41T-P1.1 → VHR-4N / B4P-VH; 170 mm pigtail | Winding A; continuity and crimp acceptance pending |
| Motor green lead (A−) | J2 pin 2, MOTOR_A2 | Same; 170 mm pigtail | Winding A |
| Motor red lead (B+) | J2 pin 3, MOTOR_B1_OUT | Same; 170 mm pigtail | Winding B |
| Motor blue lead (B−) | J2 pin 4, MOTOR_B2 | Same; 165 mm pigtail | Winding B |
| Grounded Indian mains outlet | Delta ADP-240KB BA C6 inlet | Approved Indian mains plug → IEC C5 cord; exact cord SKU and supplied contents unconfirmed | AC input for the source candidate; not connected to the PCB directly |
| 48 V / 5 A EPR source | J1 POWER | Delta ADP-240KB BA candidate with suitable supplied EPR lead; a compatible detachable-cable source may instead use the documented 240 W / 5 A e-marked cable | Source capability is 240 W; actual draw and source/cable qualification remain separate. See [external equipment](external-system.md) |
| Setup/diagnostic host | J10 DATA | StarTech USB2CC2M candidate for a USB-C host, or a suitable existing data cable | Optional diagnostics; not motor power or the normal START control |
| J3 pin 1 VMOTOR | Brake resistor terminal 1 | VHR-2N + two SVH contacts; candidate resistor, cable/terminals described in brake-integration.md | Connected nominal CAD assembly; physical/thermal qualification incomplete |
| Brake resistor terminal 2 | J3 pin 2 BRAKE_RETURN / Q16 | Nominal 150/115 mm cable cuts modeled; installed lengths, temperature, heatsink and mounting unqualified | Switched return; not permanent GND |
| Programming equipment | SWD and isolated EEPROM test pads | Fixture/programmer acceptance pending | Manufacturing service only |

SW2 is on the PCB: PC6 to GND, with R133 to V3V3_MCU. STM32 supplies the motion command over existing PCB SPI traces, so there is no external command harness. SW1 remains RESET.

The J2 170/170/170/165 mm cut lengths include 12 mm termination/adjustment allowance and are CAD proposals requiring first-article fit. TE320559 uses the actual manufacturer AE STEP: nominal length 32.131 mm and diameter 5.6134 mm, translated without scaling. Rev V6 drawing and STEP are archived with hashes. The finished crimp is not dimensionally qualified by the uncrimped CAD. Physical harness retention remains open after removal of the unsupported adapter-mounted clamp. No loose cable is rendered as a completed external system.
