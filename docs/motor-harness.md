# Motor hookup and rear assembly

J2 is **WAGO 2601-3104**, a four-pole lever-operated PCB spring clamp. J3 is **WAGO 236-402**, a two-pole tool-operated CAGE CLAMP for the external brake resistor. Both are top-mounted. No JST housing or socket contacts are needed. The motor terminal stays on the ordered motor's cable-exit side.

## Motor cable to J2

The ordered **STEPPERONLINE 34HS31-6004S1** has a 1 m, four-core **0.75 mm²** cable. Manufacturer drawing A1510 rev 0 defines the winding colours. Match the numbered **wire entries**, not the eight solder tails: each pole has two PCB pins (1/5, 2/6, 3/7, 4/8).

| J2 wire entry | Board net | Winding | Factory colour |
|---:|---|---|---|
| 1 | MOTOR_A1_OUT | A+ | Black |
| 2 | MOTOR_A2 | A− | Green |
| 3 | MOTOR_B1_OUT | B+ | Red |
| 4 | MOTOR_B2 | B− | Blue |

The modeled harness retains **factory cable → four TE 320559 insulated splices → four Alpha Wire 3057 16 AWG pigtails → J2 spring clamps**. The splices support 0.3–1.42 mm². They join the modeled pigtails to the factory cable; they are not required by the spring-clamp principle. A direct factory-wire installation is within the WAGO stranded-wire range, but would need its own routing, cut-length and retention acceptance.

For J2, strip **8–9 mm**, open the lever, insert one untinned stranded conductor fully and close the lever. Confirm no exposed copper or stray strands and perform a retention check. WAGO specifies **0.14–1.5 mm² stranded**, **10 A UL / 300 V** and **17.5 A IEC / 160 V**. Ratings do not qualify the motor's 6 A/phase operation or the board's thermal performance. See the [WAGO product](https://www.wago.com/global/pcb-terminal-blocks-and-pluggable-connectors/pcb-terminal-block/p/2601-3104) and [manufacturer datasheet](https://www1.futureelectronics.com/doc/WAGO/2601-3104.pdf).

The terminal body is nominally **16.58 mm** above the PCB, with vertical wire entry. The model reserves access above it and uses **175 mm** pigtail cuts including 12 mm termination/adjustment allowance. These are nominal CAD lengths, not approved production cuts. The modeled minimum bend radius is **23.876 mm**. Use the supplier's assembly instructions; qualify splice crimps, clamp retention, cable support and terminal temperature on the first article. Solder joints must not carry cable tension.

With power disconnected, black–green and red–blue must be the winding pairs (nominal 0.48 Ω per phase at 25 °C, excluding cable/contact/meter resistance). Different phases and the frame must be isolated. Never connect or disconnect windings while energized.

## Brake connection

J3 wire entry 1 is **VMOTOR**, entry 2 **BRAKE_RETURN**; solder pins 1/3 and 2/4 respectively are paired. Strip **5–6 mm** and operate the 236-series spring clamp with the specified tool. The reviewed 16 AWG conductor fits its **0.08–2.5 mm²** range. This is a 45° wire-entry terminal. It is not a plug-in JST connection. See [WAGO 236-402](https://www.wago.com/global/pcb-terminal-blocks-and-pluggable-connectors/pcb-terminal-block/p/236-402).

Two Alpha3057 leads connect J3 to TE152883 M4 rings at the selected first-article Vishay LPS0300H10R0GB 10 Ω resistor. Nominal CAD cuts are **165 / 210 mm**, including 16 mm allowance; physical installation may require revision. The resistor is nonpolar; the model routes the two conductors without crossing. BRAKE_RETURN is switched by Q16 and is **not ground**. Fit the specified cooling/guard and strain relief, then measure resistor duty/temperature during commissioning; see [brake integration](brake-integration.md).

## Rear mounting and encoder

The four Ø4.2 mm PCB holes retain the exact rear axes from the ordered motor's [manufacturer STEP](https://files.omc-stepperonline.com/34HS31-6004S1.STEP), also preserved in the [hash-verified archive](../engineering/mechanical/34HS31-6004S1-manufacturer.zip). The rear-axis coordinates and transforms are in [ordered-motor-pcb-reference.json](../engineering/mechanical/ordered-motor-pcb-reference.json).

The STEP confirms alignment, not accessory-thread size, usable engagement or permission to replace motor case bolts. The **19.5 mm** board-to-rear separation is a preview assumption. No mounting screws, spacer stack or mechanically secured assembly is claimed.

**U18 AS5600** is centered on the bottom; its DNP capacitors C52/C53 remain on top. It uses I2C, not the earlier SPI/ABI sensor interface. The ordered single-shaft motor has no documented rotating rear magnet attachment. Leave the sensor DNP until magnet mounting, field and airgap are qualified. RP2040/DRV8262 motion remains locked independently of this optional encoder.
