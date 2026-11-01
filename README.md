# NEMA34 48 V EPR controller — RP2040 redesign

**Design revision 0.5.0-RP2040-DRAFT. Not ready to order or run a motor.** The source now uses RP2040, DRV8462DDVR with integrated power bridges, TPS26750 for the retained 48 V / 5 A EPR input, and an optional AS5600. This is an architecture change from main `1c22abf`, not a validated drop-in replacement.

Start with [the redesign and evidence](docs/rp2040-redesign.md), [reviewer checklist](docs/reviewer-checklist.md) and [firmware instructions](firmware/README.md). `index.circuit.tsx` is the current schematic/placement source. The old routed viewer, Gerbers, KiCad/manufacturing archives, thermal/copper analyses and assembly previews in `release/` still describe the STM32/TMC5160 board unless the redesign evidence explicitly identifies them as regenerated. **Do not order either set from this branch.**

The new commissioning firmware is an ARM RP2040 image with verified ELF/BIN/UF2 format and matching source hashes. Its four qualification locks remain false. Passing firmware tests or compiling the source does not establish PCB routing, USB compliance, motor torque, heatsink capacity or physical fit.

`bun run dev` and the draft hosted preview open the current **unrouted** source, with a revision 0.5 DRAFT marking. The obsolete routed viewer is excluded from this branch's published source package. `bun run build` and the full review still require a newly verified native route; source-preview success does not satisfy either release gate.

| Function | This design |
| --- | --- |
| U16 MCU / U17 boot storage | RP2040 / W25Q32JV, 4 MiB QSPI flash, 12 MHz crystal |
| U7 motor stage | DRV8462DDVR, top-cooled DDV package; SPI configuration and STEP/DIR motion |
| Power | TPS26750 EPR sink, dedicated J1; independent DATA/logic-power J10 |
| Encoder | AS5600 I²C, optional DNP U18 on bottom; C52/C53 on top |
| Protection | Independent eFuse, voltage window, thermal inhibit, hardware enable gates and external J3 braking resistor retained |
| Motor | STEPPERONLINE 34HS31-6004S1, 6 A/phase rating; this revision is not qualified at that current |
| Mounting | Existing four motor-CAD-aligned holes retained; rear screws, depth and secure installation still unqualified |

Source/firmware development checks:

```sh
bun install --frozen-lockfile
bunx tsci build index.circuit.tsx --routing-disabled --disable-parts-engine
bun run typecheck
bun run check:firmware-pins
bun run check:firmware
bun test scripts/rp2040-contract.test.mjs scripts/encoder-bypass-policy.test.mjs
bun run check:schematic-style
```

Run `bun run review` for the full release gate. It must remain blocking until routing, native CAD, release data and all affected architecture checks are regenerated and verified. Do not substitute the focused development checks for that gate.

Previous-board context: [historical README](docs/legacy-stm32-tmc-readme.md). It is retained for review, not as evidence for the redesign.
