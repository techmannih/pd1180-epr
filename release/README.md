# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.4 ECO review handoff — powered validation pending

**ORDER HOLD.** These are engineering review files. Powered USB, current/thermal and system qualification remain open; do not submit a fabrication order from this package.

The ECO separates PD POWER and USB DATA, removes unsupported CAN/RS485/RS232 and general I/O circuits and the remaining J7 external command path, adds local START/STOP using the TMC5160 internal SPI ramp, while retaining external MOSFET bridges. USB DATA alone powers setup/diagnostics through a current-limited, reverse-blocked supply; the motor-bus backup supply is retained for brake control after PD loss. Status: onboard-control-eco-order-held. See `engineering/reviewer-eco.json` and `docs/step-dir-hardware-review.md`.

The ordered motor is STEPPERONLINE 34HS31-6004S1 (Amazon B091C83HWF). Its exact manufacturer STEP replaces the QSH reference. Existing four PCB holes are unchanged. Unsupported posts, adapter and fasteners have been removed; rear attachment and encoder mounting remain unresolved. See `motor-assembly.md` for the alignment preview and unresolved mechanical gates.

RGB, independent board-power indication, a reset-safe buzzer and eight new power/programming pads are included. See `indicators.md` and `pd-programming.md` for states, supply allocation and isolated EEPROM programming. The fixture and TI image still require qualification.

The included `pd1180-commissioning-firmware.zip` contains a real STM32 image with USB diagnostics. Motor power and motion remain locked. It does not prove motor operation.

J2 is JST VH and requires the separate VHR-4N cable assembly specified in `motor-harness.md`. J7 and its external input conditioning are removed; SW2 provides local START/STOP and SW1 remains RESET. U18 is centered on the bottom with nearby C52/C53; all three are DNP, excluded from fitted BOM/CPL and paste. All 247 fitted parts remain top-side. The ordered single-shaft motor has no qualified rear magnet interface.

The requested delivery is a fully assembled, programmed and functionally tested PCBA. `order-settings.json` requests programming and functional testing, with provider acceptance still pending. U3's TI full-flash image and a qualified motor-enabled U16 image are missing; the commissioning ZIP is not a substitute. Follow the repository README for wiring and diagnostic startup, and the included `assembly.md` for the provider request, first-article programming sequence and per-board acceptance requirements. Programming verification and the approved powered motor tests must pass before shipment. Blank or motion-locked boards do not satisfy ready-to-run delivery. No order or test service has been booked.

For the checked prototype handoff, use the newly generated Gerbers together with `jlc-bom.csv` plus `jlc-cpl.csv` for top-side assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for every via-in-pad listed in the order settings (including 40 MOSFET drain-pad and four U34 thermal vias), and top-side assembly.

Legacy archive/KiCad basenames retain the r0.3 suffix for pipeline compatibility; their contents, silkscreen and hardware contract are the r0.4 ECO identified by this delivery manifest.

The committed native KiCad checks have zero PCB DRC violations, zero unconnected items, zero schematic-parity issues and zero schematic ERC violations. See `kicad-drc.json` and `kicad-erc.json`. Live JLCSearch evidence covers all 81 unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all 23 sheets; see `schematic-style-check.json`. `circuit.json` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

Power calculations and the unperformed bench-test matrix are in `power-validation.md`; `power-audit.json` and `native-decoupling-check.json` contain the numerical evidence.

Use `pcb-3d.png` and `pcb-bottom.png` for visual review. Print `mounting-template.svg` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as `pd1180-epr-r0.3-glb.zip` so cloud imports do not serialize a large loose binary. `delivery-manifest.json` records the exact file sizes and hashes, while `sha256.json` recursively covers this release directory.
