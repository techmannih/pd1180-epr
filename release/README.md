# PD1180-EPR — revision 0.4 review package

**Engineering review only — order hold.** The current package is not authorization to fabricate or a ready-to-run delivery.

For the STEPPERONLINE 34HS31-6004S1 motor. Local SW2 START/STOP commands the STM32/TMC5160 internal ramp; SW1 is RESET. The supplied commissioning firmware supports USB diagnostics but remains motion-locked. The TI PD full-flash image and powered motor qualification are pending.

## Connections

| Connector | Purpose | External equipment |
|---|---|---|
| J2, 4-pin JST VH | Motor winding connection | VHR-4N, four SVH-41T-P1.1 contacts, four 16 AWG pigtails and four TE320559 splices to the motor leads; physical harness qualification pending |
| J3, 2-pin JST VH | Conditional regenerated-energy dissipation | VHR-2N, two SVH contacts, two-wire harness and selected resistor/terminals/cooling/mounting; final brake requirement and installation unresolved |
| J1, USB-C POWER | Motor and board supply | Qualified 48 V / 5 A EPR source and 5 A EPR e-marked cable; exact products unselected |
| J10, USB-C DATA | Setup/diagnostics and independent MCU logic | Host and data-capable cable; does not supply motor power |

J3 is not a speed aid. Its return is switched, not permanently grounded. The documented 300 W resistor is only a candidate; an empty J3 cannot dissipate brake energy. See [external equipment](external-system.md), [endpoint schedule](connector-harnesses.md), [J2 harness](motor-harness.md) and [brake decision](brake-integration.md).

## Assembly and qualification

All 247 fitted components and 19 bare service pads are top-side. U18/C52/C53 are centered/local bottom DNP encoder footprints, excluded from fitted BOM/CPL and paste. The single-shaft motor has no qualified rear magnet installation.

The 3D view contains the motor and J2 harness. Four Ø4.2 mm PCB holes are present, but rear fastening, the visual 19.5 mm gap, cable retention and final harness fit remain unqualified. See [motor assembly](motor-assembly.md). Part numbers in [external-parts.json](external-parts.json) identify candidates and selected items; they are not stock reservations.

[Verification](verification.json) preserves actual check results. Native reports are [DRC](kicad-drc.json) and [ERC](kicad-erc.json); schematic style covers 23 sheets in [its report](schematic-style-check.json). Live PCB stock evidence covers 81 unique fitted supplier codes. Failed sourcing/placement gates and pending programming, power, thermal, mechanical and EMC qualification must be resolved before acceptance.

The intended delivery includes complete assembly, programming/readback and serial-numbered functional tests. Provider acceptance is pending. Follow [assembly requirements](assembly.md), [power test matrix](power-validation.md) and [order settings](order-settings.json). Blank or motion-locked assemblies do not meet ready-to-run acceptance.

Use the matching Gerbers, BOM/CPL and order settings, including the four-layer stack, 1 oz copper, top assembly and specified filled/capped via-in-pad treatment. The routed viewer preserves the source schematic and native KiCad copper. Native renders are [top](pcb-3d.png) and [bottom](pcb-bottom.png); full 3D models are in the GLB ZIPs.

Some archive/KiCad basenames retain r0.3 for pipeline compatibility. This package is revision 0.4; [delivery-manifest.json](delivery-manifest.json) and [sha256.json](sha256.json) identify the exact contents. Run `bun run review` from the repository for the prescribed review sequence.
