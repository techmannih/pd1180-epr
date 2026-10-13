# Connection and cable schedule

The board uses local onboard motion control. J2 carries the motor windings; J3 is a conditional external brake-resistor connection. J1 and J10 provide separate USB power and data. The following table identifies every retained external connection.

| Source | Destination | Connector and cable | Purpose / status |
|---|---|---|---|
| Ordered motor black lead (A+) | J2 pin 1, MOTOR_A1_OUT | TE320559 → Alpha3057 16 AWG → SVH-41T-P1.1 → VHR-4N / B4P-VH; 170 mm pigtail | Winding A; continuity and crimp acceptance pending |
| Motor green lead (A−) | J2 pin 2, MOTOR_A2 | Same; 170 mm pigtail | Winding A |
| Motor red lead (B+) | J2 pin 3, MOTOR_B1_OUT | Same; 170 mm pigtail | Winding B |
| Motor blue lead (B−) | J2 pin 4, MOTOR_B2 | Same; 165 mm pigtail | Winding B |
| 48 V / 5 A EPR source | J1 POWER | Exact source SKU and 5 A EPR cable still require qualification | Motor power; no generic USB cable or laptop supply is assumed |
| Setup/diagnostic host | J10 DATA | USB data cable SKU pending | Optional diagnostics; not the normal START control |
| J3 pin 1 VMOTOR | Brake resistor terminal 1 | VHR-2N + two SVH contacts; candidate resistor, cable/terminals described in brake-integration.md | Retained regeneration protection; physical system incomplete |
| Brake resistor terminal 2 | J3 pin 2 BRAKE_RETURN / Q16 | Final length, heat-resistant routing, heatsink and mounting unresolved | Switched return; not permanent GND |
| Programming equipment | SWD and isolated EEPROM test pads | Fixture/programmer acceptance pending | Manufacturing service only |

SW2 is on the PCB: PC6 to GND, with R133 to V3V3_MCU. STM32 supplies the motion command over existing PCB SPI traces, so there is no external command harness. SW1 remains RESET.

The J2 170/170/170/165 mm cut lengths include 12 mm termination/adjustment allowance and are CAD proposals requiring first-article fit. TE320559 length is verified at 32.13 mm; its current 5 mm OD model remains unverified. Physical harness retention remains unqualified. J3 external hardware is not modeled as a completed installation.

See [external equipment and purchase quantities](external-system.md) for why/when/how/where each item is used, bottom-side placement and sourcing status. J3 is not a speed aid: [brake integration](brake-integration.md) defines the conditional resistor decision, wiring, cooling and staged measurements. An empty J3 has no resistor dissipation.
