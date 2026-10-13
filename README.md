# PD1180-EPR — NEMA 34 motor-mounted controller

A four-layer, 85.9 × 85.9 mm controller for the **STEPPERONLINE 34HS31-6004S1** motor. The motor is rated 4.8 Nm holding torque and 6 A/phase. Its operating current, speed, load and stopping limits still need qualification with this board.

The control path is **SW2 START/STOP → STM32G0B1 → SPI → TMC5160A → external MOSFET bridges → motor**. SW1 is **RESET** and SW2 is **START/STOP**. Normal local operation is intended to use these buttons after commissioning; a laptop is used for setup and diagnostics.

**Engineering review only.** The supplied firmware is motion-locked, the TI PD configuration image is missing, and the assembly has not been powered or mechanically qualified. The manufacturing order remains on hold. Current automated results and failures are in [verification.md](verification.md).

The latest local protection-value changes and their remaining blockers are in [the protection change report](engineering/brake-protection/README.md). Published viewer/manufacturing archives have not been refreshed for these changes.

[Board viewer](https://tscircuit.com/techmannih/NEMA-34-Smart-Motor-Mounted-Stepper-Controller) · [Review files](release/) · [Reviewer checklist](docs/reviewer-checklist.md)

## Connections and external equipment

There are **two JST VH headers and two USB-C ports**. Each has a separate purpose.

| Connection | Purpose | What connects to it |
|---|---|---|
| **J2 MOTOR — 4-pin JST VH** | Drives the motor's two windings | The ordered motor through a **VHR-4N** housing, four **SVH-41T-P1.1** contacts, four 16 AWG pigtails and four **TE 320559** splices to its factory leads. Harness fabrication and physical validation are pending. |
| **J3 BRAKE — 2-pin JST VH** | Connection for a resistor that dissipates regenerated energy during deceleration or back-driving | **Only when required by the qualified operating envelope:** VHR-2N, two SVH-41T-P1.1 contacts, a two-wire harness, selected resistor, terminals and cooling/mounting. The resistor and complete installation are not yet selected. |
| **J1 PD POWER — USB-C** | Supplies motor and board power | A source explicitly supporting **48 V / 5 A USB PD EPR**, with a compatible **5 A EPR e-marked cable**. Exact source/cable models remain unselected. |
| **J10 USB DATA — USB-C** | Setup, logs and commissioning diagnostics; also supplies MCU logic independently | A host and data-capable USB cable. This port does **not** supply motor power. |

J2 pin order is **1 black A+, 2 green A−, 3 red B+, 4 blue B−**. Verify winding continuity and connector cavity numbering before connection. Make or break motor connections only with power removed and the bus discharged.

J3 pin 1 is **VMOTOR**; pin 2 is **BRAKE_RETURN**, switched by Q16, not permanent ground. J3 is not a speed-boost connection. An empty J3 cannot dissipate braking energy. **A 300 W resistor is not a confirmed requirement**: the documented 10 Ω / 300 W part is a candidate, and the need, rating and heatsink depend on load, speed and stopping duty. See [brake selection and connection](docs/brake-integration.md).

For quantities, cable lengths, part numbers, sourcing gaps and setup sequence, use [external equipment](docs/external-system.md) and the [wire endpoint schedule](docs/connector-harnesses.md). SWD and PD EEPROM programming use temporary service fixtures on test pads.

## Controls and circuitry

- **SW1 RESET:** resets the MCU and inhibits motion; no automatic restart.
- **SW2 START/STOP:** release then press to request the local profile; press again for controlled deceleration. It is a normal operating control, not an emergency stop. The current commissioning image cannot start the motor.
- **Motor stage:** TMC5160A with eight external MOSFETs and phase shunts. The 5.5 A RMS design target is not a qualified setting for the motor's 6 A/phase rating.
- **Protection and diagnostics:** input eFuse/reverse blocking, voltage and temperature inhibition, regenerative-brake switching, phase/bus measurements, RGB status, power LED and buzzer.
- **Assembly:** 247 fitted components and 19 bare service pads on top; 81 unique fitted supplier codes. The schematic has 23 A4 sheets.
- **Optional encoder:** U18 AS5047P is centered on the bottom with C52/C53, all **doNotPlace** and excluded from fitted BOM/CPL and paste. The single-shaft motor has no qualified rear magnet installation.

The [NEMA17/NEMA23 comparison](docs/reference-review.md) explains applicable design choices. [Circuit design](docs/design.md), [USB/power architecture](docs/usb-pd-architecture.md) and [firmware](firmware/README.md) give the implementation details.

## Assembly preview

Open `motor-assembly.circuit.tsx` for the motor and J2 harness model, or `release/circuit.json` for the routed board viewer. The four existing Ø4.2 mm mounting holes are preserved.

![Motor and J2 harness alignment preview; attachment is not qualified](previews/onboard-control-after.png)

The 19.5 mm model separation is a visual alignment distance, not a verified mounting stack. Rear thread/depth, fastening, solder-tail clearance and harness retention remain unresolved. TE 320559 splice length is 32.13 mm; its modeled outside diameter and proposed pigtail lengths still require physical checks. See [motor assembly](docs/motor-assembly.md) and [harness specification](docs/motor-harness.md).

## Review and acceptance

Run `bun run review` for the prescribed review sequence. The [verification report](verification.md), [stock evidence](docs/stock-report.json) and [delivery check](docs/delivery-check.json) retain actual results; a successful build does not establish motor operation.

Before a ready-to-run delivery, complete:

1. Exact PCB-part and external-equipment sourcing, including package/stock confirmation.
2. TI-generated U3 full-flash image, PD hardware review and verified programming/readback.
3. J2 harness, secure PCB/motor mounting and the load-dependent J3 decision.
4. Staged power, current, gate-drive, stopping, thermal and EMC tests; then qualify the motor-enabled firmware.
5. Provider acceptance of assembly, programming and serial-numbered functional tests before shipment.

[Assembly/provider requirements](docs/assembly.md) · [Power test matrix](docs/power-validation.md) · [PD configuration review](docs/pd-configuration-review.md) · [Release status](docs/release-status.json)

Revision 0.4 review files retain some `r0.3` archive basenames for pipeline compatibility. Use the delivery manifest and hashes to identify their contents.

PCB names come from their footprints. Custom imports include a native `{NAME}` reference template, so every instance resolves its own name, including SW1 and SW2. Each template has one footprint-local position above the courtyard and uses the default text size; there are no board-level reference labels, assembly-layer replacements or per-instance overlap adjustments. `docs/pcb-reference-check.json` checks that every component has exactly one matching reference. Overlaps and fabrication-rule failures remain reported; this view is not a silkscreen fabrication approval.
