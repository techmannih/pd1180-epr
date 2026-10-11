# External cable assemblies and connector justification

This closes the missing **mating-part specification**, not physical harness qualification. These parts are outside the populated PCB BOM. Do not treat the header's presence in 3D as a complete cable assembly. Motor wiring is specified separately in [motor-harness.md](motor-harness.md).

| Header | Purpose / reason retained | Mating assembly |
|---|---|---|
| J1 | Required USB-C PD POWER input | EPR-rated source and 5 A EPR cable for the approved 48 V contract; exact source/cable still to be qualified |
| J10 | Required USB DATA/setup, independent of motor power | USB data cable; it does not energize the motor rail |
| J2 | Four motor-winding leads | VHR-4N, four SVH-41T-P1.1 contacts, 16 AWG pigtails and four TE 320559 splices to the motor's factory leads |
| J3 | External resistor for the retained regenerative brake; PCB copper/USB source cannot absorb arbitrary braking energy | **VHR-2N**, two **SVH-41T-P1.1** contacts; 16 AWG, insulation OD 1.7–3.0 mm; wire insulation/temperature rating and length must match the external resistor installation |
| J7 | One consolidated harness for user-required industrial I/O and buses | **PHDR-20VS**, twenty **SPHD-001T-P0.5** contacts; 22 AWG / approximately 0.33 mm², insulation OD 1.0–1.5 mm |

[JST VH drawing](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) specifies 10 A with 16 AWG for the standard VH family. [JST PHD drawing](https://www.jst-mfg.com/product/pdf/eng/ePHD.pdf) specifies 3 A with 22 AWG, 250 V, and the stated housing/contact pairing. These are connector conditions, not a rating for the board's outputs. Harness stock, crimp tooling, pull tests, temperature rise and completed cable assemblies are not yet verified or procured.

## J3 brake cable

| Cavity | Board net | Connection |
|---|---|---|
| 1 | VMOTOR | One resistor terminal |
| 2 | BRAKE_RETURN | Other resistor terminal; switched by Q16 |

The resistor is connected **between** these pins. Pin 2 is not permanent ground. Route the pair together, keep it away from the encoder and low-level sensing, and anchor the cable to the approved mechanical fixture. The proposed 10 Ω resistor/heatsink still needs load-energy, pulse and temperature qualification. No generic 300 W label approves operation without its specified heatsink.

## J7 industrial harness

Use the numbered physical cavities and continuity-test each lead. The mating-face and wire-entry views are reversed; do not infer numbering from a rendered screenshot.

| Cavity | Signal | Harness constraint |
|---|---|---|
| 1 | HOME_24V | Nominal 24 V input, shared board ground |
| 2 / 3 | STOPL_24V / STOPR_24V | Nominal 24 V limit inputs |
| 4 / 5 | DIN0_24V / DIN1_24V | Nominal 24 V digital inputs |
| 6 / 7 | STEP_24V / DIR_24V | External step/direction inputs; timing must be qualified |
| 8 | GND | Control reference |
| 9 / 10 | RS232_TX_CONN / RS232_RX_CONN | RS232 signal levels; cross TX/RX to the peer, not TTL UART |
| 11 | GND | RS232 reference |
| 12 / 13 | CAN_H / CAN_L | Twisted pair; terminate only at the two physical bus ends |
| 14 | GND | Shared bus reference; no galvanic isolation is provided |
| 15 / 16 | RS485_A / RS485_B | Twisted pair; verify peer polarity and end termination/bias |
| 17 | VMOTOR | Protected motor bus, nominal **48 V**; never connect to 24 V input pins or treat as a regulated 24 V supply |
| 18 | HW_ENABLE_24V | Nominal 24 V hardware-enable input |
| 19 / 20 | OUT0 / OUT1 | Low-side transistor outputs; not push-pull outputs or a 3 A power-output rating |

CAN/RS485 endpoint termination belongs in the external harness. Select its resistance from the actual bus/cable requirements (normally 120 Ω at each end), and document RS485 bias ownership. The connector inventory does not specify CANopen, TMCL or another application protocol; those are absent from the commissioning firmware.

OUT0/OUT1 use MMBT5551 stages with flyback diodes returning to VMOTOR. No approved load/current/duty rating exists. Do not connect an inductive load powered from a separate 24 V source and assume the VMOTOR clamp is suitable: that interface needs a load-specific clamp and power-off/backfeed review. Keep outputs unused until that load specification is qualified.

## Remaining assembly evidence

J2 has a conservative vertical insertion-envelope check. J3 and J7 still need complete mated-body, release/tool access, wire-bend and enclosure-envelope checks, followed by physical approval. A wire clamp, its attachment, strain-relief path, connector removal procedure and pin-1 harness labels are not yet fabrication-released. Do not close the reviewer's assembly comment from bare headers alone.

No extra diagnostic cable headers are added: STM32 SWD/NRST and optional encoder ABI remain bare top-side service pads. Industrial functions remain because the user explicitly required them; any subsequent removal requires a requirements change.
