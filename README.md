# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

PD1180-EPR is an 85.9 × 85.9 mm, four-layer controller for the QSH8618-96-55-700 NEMA 34 stepper motor. A single USB-C connection provides USB 2.0 data and requests a 48 V / 5 A USB Power Delivery 3.1 EPR contract. The board combines protected power entry, a TMC5160A external-MOSFET motor stage, STM32G0B1 control, magnetic position feedback and industrial control interfaces.

**Revision:** r0.3 · **Status:** prototype-fabrication-ready · **Assembly:** top side only · **Production validation:** open

[View the board on tscircuit](https://tscircuit.com/techmannih/pd1180-epr) · [Open the manufacturing release](release/) · [Read the reviewer checklist](docs/reviewer-checklist.md)

![PD1180-EPR assembled-board overview](previews/pd1180-epr-overview.png)

| Top assembly | Bottom copper and board marking |
|---|---|
| ![PD1180-EPR top render](previews/pd1180-epr-top.png) | ![PD1180-EPR bottom render](previews/pd1180-epr-bottom.png) |

## Feature overview

| Area | Implementation |
|---|---|
| USB-C power | TPS26750 sink-only USB PD 3.1 EPR controller requesting 48 V / 5 A |
| USB protection | TPD4S480 CC/data protection and controlled VBUS sensing |
| Input protection | TPS26631 eFuse, inrush control, voltage qualification, current limit and reverse-current blocking |
| Motor stage | TMC5160A with eight 100 V CSD19534Q5A MOSFETs and two 33 mΩ phase shunts |
| Motor target | QSH8618-96-55-700, 5.5 A RMS phase current, 7.0 Nm holding torque |
| Controller | STM32G0B1CBT6 with USB device, CAN, SPI, I²C and serial peripherals |
| Position feedback | Top-side AS5047P magnetic encoder at the shaft axis, with ABI monitor output |
| Motion inputs | 24 V Step/Dir plus HOME, left stop and right stop inputs |
| Communications | USB 2.0, CAN, RS485 and RS232 |
| Outputs | Hardware enable plus two protected low-side outputs |
| Braking | External switched brake-resistor interface with independent overvoltage shutdown |
| Programming | SWD for STM32 and configuration EEPROM for the PD controller |
| Assembly | 251 fitted parts, all on the top side; bottom paste is absent |

The board powers up inhibited. A valid EPR contract, eFuse status, motor-power-good signal, voltage window, external hardware enable and MCU request must all agree before the bridge can run. Reset defaults keep `POWER_PERMIT`, `MCU_RUN`, `RS485_DE`, both protected outputs and standalone-mode selection inactive.

## Power architecture

```text
USB-C J1
  ├── USB D+/D− ── TPD4S480 ────────────────────────────── STM32 USB
  └── VBUS/CC ──── TPD4S480 ── TPS26750 ── TPS26631 ───── VMOTOR
                                             │                │
                                             │                ├── TMC5160A + external H bridges
                                             │                ├── motor connector J2
                                             │                └── external brake connector J3
                 USB-side 3.3 V buck ────────┼── ideal-diode OR ── V3V3
                 motor-side 3.3 V buck ──────┘
```

The requested contract is 240 W. The nominal eFuse current limit is approximately 4.48 A, so the board-side motor input limit is about 215 W at 48 V before conversion and switching losses. USB input current and phase current are different quantities; the motor-stage target is 5.5 A RMS per phase.

The motor bulk bank stores only about 0.237 J between 48 V and the nominal 53 V brake threshold. It cannot absorb sustained regeneration. J3 connects a separately selected braking resistor and heatsink; 10 Ω / 300 W is an initial engineering target, not a validated load rating. Actual speed, attached inertia, stopping time and duty cycle determine the final resistor and thermal design.

Detailed calculations, tolerances and protection behavior are recorded in [docs/design.md](docs/design.md).

## Motor control and feedback

The TMC5160A controls two external MOSFET bridges. Four bootstrap capacitors, charge-pump support, gate resistors, local driver rails and two 3 W current shunts are represented explicitly. Native ramp control can select the board's limit inputs; Step/Dir mode selects the external conditioned inputs.

The AS5047P shares SPI with the motor driver and external flash, using an independent chip-select. Its ABI outputs are available on J5 for monitoring. The board assumes a diametrically magnetized shaft magnet aligned to the sensor axis; magnet diameter, gap, runout and stray-field behavior remain mechanical validation items.

Firmware must configure current scaling, gate drive, dead time, chopper behavior, motion limits and encoder calibration for the actual motor. A register default is not approval for 5.5 A operation.

## Interfaces

| Connector | Function | Pins / notes |
|---|---|---|
| J1 | USB-C EPR + USB 2.0 | 48 V / 5 A requested contract; USB device data; shell bonded to ground |
| J2 | Motor | A1, A2, B1, B2 |
| J3 | External brake | VMOTOR and switched resistor return |
| J4 | SWD | 3.3 V reference, SWDIO, GND, SWCLK, NRST, status GPIO |
| J5 | Encoder monitor | 3.3 V, A, B, index, GND; monitor outputs only |
| J6 | Serial buses | RS232 TX/RX, CAN H/L, RS485 A/B and grounds |
| J7 | Machine inputs | IN0, IN1, STOP L, STOP R, HOME, GND |
| J8 | Step/Dir | 24 V STEP, 24 V DIR, GND and 3.3 V reference |
| J9 | Outputs and enable | **48 V VMOTOR**, hardware enable, OUT0 and OUT1 |

CAN and RS485 are non-isolated. Termination and RS485 bias belong at the system level. J9 exposes the motor bus; it is not a regulated 24 V accessory output.

## Firmware contract

The generated STM32 pin contract lives in [docs/firmware-pinmap.json](docs/firmware-pinmap.json) and [firmware/include/board_pins.h](firmware/include/board_pins.h). The host-testable safety state machine keeps the board reviewable without requiring an embedded toolchain.

| Function | MCU signals |
|---|---|
| Motor SPI | `TMC_CS_N`, `SPI_SCK`, `SPI_MISO`, `SPI_MOSI`, `TMC_DIAG0`, `TMC_DIAG1` |
| Encoder/flash | `ENC_CS_N`, `FLASH_CS_N` on the shared SPI bus |
| USB | `USB_DM`, `USB_DP` |
| Power safety | `PD_IRQ_N`, `EFUSE_FAULT_N`, `MOTOR_PG`, `VMOTOR_OK`, `POWER_PERMIT`, `MCU_RUN` |
| Motion inputs | `STEP_IN`, `DIR_IN`, `STOP_L`, `STOP_R`, `HOME_IN` |
| Communications | CAN RX/TX, RS485 RX/TX/DE and RS232 RX/TX |
| Monitoring | `VMON_ADC`, `IIN_MON`, status GPIO |

The STM32 target peripheral port and TI-generated TPS26750 full-flash image are release inputs. The assembled board is intentionally safe with blank U3 and U16, but it cannot negotiate 48 V or run the motor until both devices are programmed.

## Schematic organization

The design is split into twelve A4 functional sheets:

| Sheet | Scope |
|---|---|
| USB PD | USB-C receptacle, CC/data protection, PD controller and configuration EEPROM |
| Logic power | USB-side and motor-side buck supplies with reverse-blocked rail ORing |
| Motor power | eFuse, reverse blocking, bulk capacitance and motor-bus qualification |
| Motion | TMC5160A control, mode selection, limit inputs and encoder interface |
| Bridge A / Bridge B | External MOSFET half-bridges, bootstrap networks and phase shunts |
| Brake | Bus-voltage comparators, brake MOSFET drive and external resistor connector |
| MCU | STM32G0B1, clock, reset, SWD, flash and shared control buses |
| Encoder | AS5047P supply, SPI/ABI signals and monitor connector |
| Inputs | 24 V Step/Dir, stop, home and digital input conditioning |
| Outputs | Protected low-side outputs and hardware enable chain |
| Serial | CAN, RS485 and RS232 transceivers with ESD support |

Rendered SVG and PNG sheets are available under `dist/schematics/`; the release package contains the twelve SVG sheets.

## PCB, mechanics and assembly

| Property | r0.3 value |
|---|---:|
| Board outline | 85.9 × 85.9 mm, rounded corners |
| Copper layers | 4 |
| Finished thickness | 1.6 mm |
| Copper weight | 1 oz on every layer |
| Mounting | Four 4.2 mm holes on the documented asymmetric motor pattern |
| Power corridor | Nominal 2.4 mm with 0.16 mm zone clearance |
| General/power via | 0.60 mm pad / 0.30 mm finished drill |
| Dense signal via | 0.45 mm pad / 0.20 mm finished drill |
| Via-in-pad exception | Six 0.40/0.20 mm holes, filled and capped |
| Assembly side | Top only |
| Solder mask / legend | Green / white |

All fitted components are on top, including the centered encoder and its local bypass parts. Bottom copper and silkscreen are used, while bottom paste is absent. The bottom carries the `ts` and `Made with tscircuit` board marking. Bulk capacitors and through-hole headers may require selective or hand soldering.

The current KiCad route passes with zero DRC violations and zero unconnected items. Power nets use reinforced copper corridors and parallel transfer vias. The 1 oz external-layer IPC-2221 screening result is 6.12 A at a 20 °C rise; enclosure temperature, layer sharing, neck-down regions, connector heating and switching losses still require powered thermal measurements.

## Parts and procurement

- 251 populated components use exact JLCPCB/LCSC identities.
- The fitted BOM contains 67 unique LCSC codes.
- The latest committed live check reports 67/67 available.
- Eleven selected alternative candidates are currently available.
- TPD4S480 has no approved drop-in replacement; a lower-voltage CC protector is not suitable for 48 V EPR.
- Automatic substitution is disabled. Package, pinout, polarity, voltage, current and thermal limits must be reviewed before any change.

The EPR source, certified 5 A EPR cable, QSH8618 motor, shaft magnet, brake resistor/heatsink, mating housings, contacts, wire and external bus termination are system items outside the assembled PCB BOM. See [docs/procurement.md](docs/procurement.md) and [sourcing/](sourcing/).

## Verification

Run the same fail-closed review used in CI:

```sh
bun install --frozen-lockfile
bun run review
```

The review covers the pinned toolchain, compact tscircuit cloud package, TypeScript, firmware pin contract and host tests, source topology, netlist, schematic/PCB placement, decoupling, exact supplier identities, top-only assembly, local critical copper, shorts, KiCad DRC, power routing, route fingerprint, live stock, alternatives, preview export, release archives and recursive hashes.

Current committed results:

| Gate | Result |
|---|---|
| KiCad DRC | PASS — 0 violations, 0 unconnected items |
| Topology regression | PASS — 11 tests, 518 assertions |
| Decoupling | PASS — 32/32 targets |
| Assembly | PASS — 251/251 fitted parts on top |
| Stock | PASS — 67/67 unique fitted LCSC codes available |
| Alternatives | PASS — 11/11 selected candidates available |
| Release delivery | PASS — 31 required files, 4 ZIP archives, 30 recursive SHA-256 entries |
| Route identity | PASS — source topology/placement and routed KiCad hashes match |

Machine-readable evidence is stored in [docs/verification.json](docs/verification.json), [docs/board-standards-check.json](docs/board-standards-check.json), [docs/power-routing-check.json](docs/power-routing-check.json), [docs/stock-report.json](docs/stock-report.json) and [release/delivery-manifest.json](release/delivery-manifest.json).

## Manufacturing release

The `release/` directory contains:

- PCB Gerber ZIP and the routed KiCad project ZIP;
- complete manufacturing ZIP with drills, Gerbers, DRC, BOM, CPL and project files;
- JLCPCB BOM and top-side placement CSV;
- ZIP-packaged 3D GLB plus top and bottom renders;
- twelve schematic-sheet SVGs;
- order settings, hardware contract, power-routing evidence and release status;
- delivery manifest and recursive SHA-256 hashes.

Apply every value in [release/order-settings.json](release/order-settings.json), especially four layers, 1 oz copper on all layers, 1.6 mm thickness, filled/capped via-in-pad and top-only assembly. Review component orientation, polarity, connector direction and the through-hole assembly plan in the JLC viewer before submitting the order.

The tscircuit cloud package intentionally excludes generated `dist/`, `release/`, snapshot and firmware-build payloads. The release GLB is ZIP-packaged because the GitHub importer skips archive payloads while loose multi-megabyte models can exceed the sandbox RPC limit. This keeps online builds small and reliable while GitHub retains the complete manufacturing handoff and its hashes. `bun run check:cloud-package` enforces this separation.

## Repository map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Automatic design and review rules for AI-assisted changes |
| `board-standards.json` | Machine-readable fabrication, via, marking, assembly and delivery policy |
| `hardware-contract.json` | Product dimensions, ratings, controller and reset-safe outputs |
| `index.circuit.tsx` | Authoritative code-defined circuit, schematic layout and PCB intent |
| `imports/` | Locally pinned component models and symbol/footprint corrections |
| `firmware/` | Safety state machine, generated pins and TMC5160A startup configuration |
| `routing/` | Power-copper requirements and guarded route fingerprint |
| `docs/` | Design calculations, assembly, procurement, bring-up and verification evidence |
| `scripts/` | Documented generation and fail-closed review tools |
| `sourcing/` | Stock-qualified BOM, alternatives and external-system items |
| `previews/` | Lightweight images used by this README and tscircuit package |
| `dist/` | Generated circuit, schematics, routed PCB and manufacturing outputs |
| `release/` | Orderable prototype handoff with archive and hash verification |

## Bring-up and remaining gates

The r0.3 files are suitable for a prototype PCB and top-side assembly order. They are not a production release. Before applying motor power:

1. Generate and independently review the sink-only TPS26750 EPR configuration, then program U3.
2. Integrate the STM32 target firmware and verify immediate fault shutdown on the bench.
3. Confirm the motor rear-face pattern, shaft magnet alignment, air gap and enclosure clearances.
4. Select the brake resistor/heatsink from measured load inertia, speed and stopping duty.
5. Perform current-limited rail bring-up before fitting the motor.
6. Measure gate waveforms, phase current, bus overshoot, connector temperature and PCB temperature.
7. Complete USB PD, cable-fault, regeneration, ESD, EMC and representative-load testing.

The staged procedure and sign-off points are in [docs/bring-up.md](docs/bring-up.md). Prototype-order gates and physical system-validation gates remain separate in [docs/release-status.json](docs/release-status.json).
