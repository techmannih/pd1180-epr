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

The inspected NEMA17 source sets approximately 1 A peak with a 1.5 V reference and 0.3 Ω regulation shunts, at up to 20 V. NEMA23 sets approximately 3.965 A peak / 2.804 A RMS nominal at up to 28 V and uses TPS26630 with a 2.46 A nominal input limit. These are design settings, not measured full-load ratings. Its TPS26630 1× limiting approach informed the U6 change; this board now uses TPS26630RGER and its independently screened 4.99 kΩ input-current setting. The reference resistor value and operating current were not transferred to this 48 V system.

Neither inspected release establishes an unrestricted speed/load/stop envelope. NEMA17 explicitly says its revised DRV8825 board has not been physically tested. NEMA23 explicitly says that its blocking diode and TVS do not provide sustained regenerative braking and that continuous full-current operation on a hot motor is unqualified. Absence of an external brake connector in these references is therefore not evidence that our brake can be removed. The reference controls, reset states and test method are reusable; motor current, regenerated energy and cooling must be established for the selected 34HS31-6004S1 and application.

Current source/native checks, physical qualification and sourcing are separate evidence sets. Consult [verification](../verification.md), [assembly boundaries](complete-assembly.md) and [power validation](power-validation.md) before claiming a requirement is complete. The feature-presence check does not establish full reference parity.

## PD-1180 and the first prototype

The [ADI hardware manual, rev. 1.05](https://www.analog.com/media/en/technical-documentation/user-guides/PD-1180_hardware_manual_hw1.10_rev1.05.pdf), §§4.2, 4.3.1, 6 and 7, specifies a QSH8618-96-55-700 motor (7 Nm, 2700 g·cm² inertia) and a TMC262A driver. Its operating table gives 18–55 V, 5.5 A RMS and 7.8 A sine peak. Page 11 calls for supply buffering, gives a 2200 µF/63 V example, and identifies additional voltage limiting for some high-speed systems. Its connector list does not document our J3-style brake output. The controller's 50°C/30-minute current test does not qualify our PCB, motor or cooling.

The [TMCL manual, rev. 1.16](https://www.analog.com/media/en/dsp-documentation/software-manuals/PD-1180-TMCL_firmware_manual_fw4.48_rev1.16.pdf), §§3.7.3 and 6.1, provides configurable velocity/acceleration and a ramped stop. Example command values such as 1000 are controller units, not a 1000 rpm operating approval. They require the documented clock/divisor/microstep conversion and cannot be copied to TMC5160 registers.

Our 34HS31-6004S1, TMC5160A, reverse-blocked USB EPR input and 940 µF local bank need their own energy/current limits. The reference does not specify the attached load, stopping duty or brake-open tolerance for this product. It neither requires a 300 W external resistor here nor establishes that J3 is unnecessary. Its nominal 24 V option cannot be selected on our present 48 V UVLO/PD contract without redesign.

With the application still unknown, the first prototype scope is **the motor alone: no pulley, coupling, driven mechanism, gravity load or external back-drive**. Retain the existing nominal 10 rpm, 10 rpm/s and 0.842 A RMS commissioning profile and enforce its current request ceiling in firmware. This is a deliberately bounded engineering starting point; the final product's load/RPM/current remain unspecified. It does not unlock motion or close brake-fault protection. Physical current and speed must be measured before accepting the profile, and the remaining electrical/mechanical bring-up gates still apply.
