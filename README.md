# NEMA34 48 V EPR controller — RP2040 redesign

**Design revision 0.5.0-RP2040-DRAFT. Not ready to order or run a motor.** The source now uses RP2040, DRV8462DDVR with integrated power bridges, TPS26750 for the retained 48 V / 5 A EPR input, and an optional AS5600. The reviewer ECO follows merged PR #21 (`64c14cd`) and retains that 48 V architecture. Hardware is not qualified.

Start with [the redesign and evidence](docs/rp2040-redesign.md), [reviewer checklist](docs/reviewer-checklist.md) and [firmware instructions](firmware/README.md). `index.circuit.tsx` is the current schematic/placement source. The native route, manufacturing archive, copper analyses and routed viewer are regenerated for RP2040/DRV8462. Native KiCad reports 0 unconnected/parity/ERC findings, with the 8 requested J1/J10 hole errors and 451 cosmetic warnings retained. **The review exception does not authorize ordering.**

The new commissioning firmware is an ARM RP2040 image with verified ELF/BIN/UF2 format and matching source hashes. Its four qualification locks remain false. Passing firmware tests or compiling the source does not establish PCB routing, USB compliance, motor torque, heatsink capacity or physical fit.

The hosted preview opens `release/circuit.json`, containing the verified native route and current schematic. `index.circuit.tsx` remains editable; `bun run dev` opens that source. The 0.5 DRAFT marking remains because hardware qualification is incomplete.

| Function | This design |
| --- | --- |
| U16 MCU / U17 boot storage | RP2040 / W25Q32JV, 4 MiB QSPI flash, 12 MHz crystal |
| U7 motor stage | DRV8462DDVR, top-cooled DDV package; SPI configuration and STEP/DIR motion |
| Power | TPS26750 EPR sink, dedicated J1; independent DATA/logic-power J10 |
| PD monitoring | U38 INA237 measures raw PD_VBUS; ADS1115 retains protected VMOTOR. Fresh ADC conversion + TPS contract produce PD_READY; eFuse MOTOR_PG stays independent. |
| Terminals | J2 WAGO 2601-3104 motor; J3 WAGO 236-402 brake. No JST mating plugs; paired solder tails belong to each wire entry. |
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

Run `bun run review` for all engineering and artifact checks; consult its generated report. Strict `check:release` must continue to reject ordering while hardware, sourcing and USB-hole fabrication holds remain.

The completed reviewer scope and remaining physical acceptance steps are in [the handoff](docs/completion-handoff.md). The [ordered-motor manufacturer STEP archive](engineering/mechanical/34HS31-6004S1-manufacturer.zip) establishes the rear hole axes; it does not approve replacement screws or engagement depth.

Previous-board context: [historical README](docs/legacy-stm32-tmc-readme.md). It is retained for review, not as evidence for the redesign.
