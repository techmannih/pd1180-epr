# PD1180-EPR

PD1180-EPR is a code-defined, four-layer single-axis stepper controller powered from a USB-C PD 3.1 EPR 48 V / 5 A contract. It combines a TMC5160A with external MOSFET bridges, an STM32G0B1 controller, an on-axis AS5047P magnetic encoder, USB 2.0, CAN, RS485, RS232, Step/Dir, 24 V inputs, protected outputs, hardware shutdown and an external braking-resistor interface.

The 85.9 × 85.9 mm board has four M4 mounting holes and 251 populated parts. Every populated PCB part is assigned an exact JLCPCB/LCSC code; the checked BOM contains 67 unique orderable codes. All populated parts, including the encoder and its local components, are on the top side.

## Project layout

- `index.circuit.tsx`: complete circuit, multi-sheet schematic placement, PCB placement and local critical copper.
- `imports/`: locally pinned JLCPCB/EasyEDA component models.
- `firmware/`: generated STM32G0B1 pin contract, safety state machine and TMC5160A boot configuration.
- `docs/`: design, pinout, procurement, verification, assembly and bring-up records.
- `routing/`: final power-copper and via requirements.
- `sourcing/`: stock-qualified BOM, alternatives and external system items.
- `release/`: order settings and the final prototype handoff.
- `scripts/`: topology, placement, copper, stock, assembly and release checks.
- `dist/index/`: generated circuit JSON plus top/bottom PCB and schematic previews.
- `dist/schematics/`: the 12 individual schematic sheets.
- `dist/routed/`: routed-board circuit JSON plus a reviewable PCB SVG/PNG.
- `dist/manufacturing/`: routed KiCad project, 12 child schematic sheets, Gerbers, drill files, DRC, BOM, CPL and 3D render.
- `dist/pd1180-epr-r0.3-manufacturing.zip`: complete fabrication and assembly handoff.

## Build and verify

```sh
bun install --frozen-lockfile
bun run dev
bun run build:preview
bun run verify:preview
BOARD_QUANTITY=10 bun run check:stock
bun run export:previews
bun run verify --routed
bun run check:stock
bun run check:alternatives
bun run check:release
bun run export:release
```

The checks validate source connectivity, component placement, top-only assembly, critical bypass routing, the final KiCad DRC, stock evidence and generated outputs. See [verification](docs/verification.md), [assembly](docs/assembly.md), [bring-up](docs/bring-up.md), [procurement](docs/procurement.md) and [system compatibility](docs/compatibility.md).

## Power architecture

The requested USB input contract is 240 W. The eFuse is set to approximately **4.48 A nominal**, providing about **215 W at 48 V** before conversion and switching losses. Phase current and USB input current are different quantities. The r0.3 board uses 2.4 mm clearance-aware copper corridors and parallel power vias; the 1 oz IPC-2221 screening estimate is 6.12 A at a 20 °C rise. Prototype thermal validation remains required at the selected PWM frequency and enclosure airflow.

Reverse-blocked USB-side and motor-bus buck regulators feed the 3.3 V logic rail. This keeps the brake-control logic alive while the motor bus contains energy after cable removal. The external EPR source, 5 A EPR cable, motor, shaft magnet and braking resistor/heatsink are system items.

## Configuration and bring-up

U3 requires a TI-generated, sink-only TPS26750 full-flash image for 48 V EPR negotiation. The STM32 safety logic and pin contract are in `firmware/`; the target peripheral port and powered validation remain release inputs. The r0.3 files are suitable for a top-side prototype assembly order, with U3 and U16 assembled blank unless programming images are supplied. Complete the staged electrical, thermal, motor, USB-PD and EMC tests in `docs/bring-up.md` before connection to a production load.

Third-party component models retain their own upstream licensing and identifying metadata. The dependency graph is pinned by `bun.lock`; the local package is not published to a tscircuit account.
