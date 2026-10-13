# NEMA17 / NEMA23 reference comparison

The source comparison uses [NEMA17 v1.0.42](https://tscircuit.com/imrishabh18/rp2040-motor-controller?version=1.0.42) and [NEMA23 v1.3.2](https://tscircuit.com/imrishabh18/nema-23-stepper-controller?version=1.3.2). Retrieved source URLs and hashes are recorded in [reference-comparison.json](../engineering/reference-comparison.json). This comparison establishes design provenance, not tested performance or complete equivalence.

| Function | Reference designs | Application to this board |
|---|---|---|
| Power and data | Separate motor PD and programming USB | J1 supplies EPR motor power; J10 supplies USB diagnostics and MCU logic independently. |
| Onboard motor control | RP2040 drives DRV8825 / DRV8452 | STM32 controls the TMC5160 internal SPI ramp and external bridges. SW2 requests local START/STOP. |
| Power profile | Lower-voltage PD selection | This power stage requires a qualified 48 V / 5 A EPR source and board-specific TPS26750 image. Reference PD settings do not apply. |
| Motor connector | JST PH / JST XH | J2 uses JST VH with a specified VHR-4N harness. Current ratings must be checked for the actual contacts, wire and temperature; the smaller motor's connector is not a current qualification. |
| Current telemetry | INA240 channels and inline shunts | Two INA240 channels with 5 mΩ shunts; calibration and PWM behavior require powered checks. |
| Temperature | TMP102 monitoring / inhibition | TMP102, hardware temperature inhibit and freshness checks; junction-temperature correlation is unmeasured. |
| Indication | RGB, independent power LED and buzzer | D16 RGB, D17 power LED and Q26-driven BZ1; [states and load budget](indicators.md). |
| Test/programming access | Power probes and processor/PD access | 19 bare service pads, including SWD and isolated U3 EEPROM access; [programming procedure](pd-programming.md). |
| Optional feedback | Centered bottom AS5600 and two DNP capacitors | Centered bottom AS5047P U18 with C52/C53, all DNP. The ordered motor's magnet/holder interface is not established. |
| Buttons | RP2040 BOOT/RUN serve boot/reset | STM32 SW1 is RESET; SW2 is a firmware START/STOP input. RP2040 BOOTSEL circuitry is not required for this processor. |
| Mechanics | Motor-specific mounting and clearances | Use the ordered 34HS31-6004S1 manufacturer geometry. Rear attachment, harness retention and thermal installation still require validation. |
| Firmware evidence | Neither inspected release supplies executable motor firmware | This repository supplies a motion-locked commissioning image. Neither the references nor a CAD build demonstrate a running product. |

The retained external connections are J2 MOTOR, J3 conditional BRAKE, J1 PD POWER and J10 USB DATA. Every connection and purchase boundary is listed in [connector-harnesses.md](connector-harnesses.md) and [external-system.md](external-system.md).

Current source/native checks, physical qualification and sourcing are separate evidence sets. Consult [verification](../verification.md), [assembly boundaries](complete-assembly.md) and [power validation](power-validation.md) before claiming a requirement is complete. The feature-presence check does not establish full reference parity.
