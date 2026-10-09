# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.4 ECO review handoff — powered validation pending

The ECO separates PD POWER and USB DATA, consolidates the industrial harness and corrects the TMC5160 STEP/DIR pins while retaining external MOSFET bridges. USB setup uses both cables; the motor-bus backup supply is retained for brake control after PD loss. Status: prototype-cad-verified-system-validation-pending. See `engineering/reviewer-eco.json` and `docs/step-dir-hardware-review.md`.

The included `pd1180-commissioning-firmware.zip` contains a real STM32 image with USB diagnostics. Motor power and motion remain locked. It does not prove motor operation.

For the checked prototype handoff, use the newly generated Gerbers together with `jlc-bom.csv` plus `jlc-cpl.csv` for two-sided assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for the 40 MOSFET drain-pad thermal vias, and top/bottom assembly.

Legacy archive/KiCad basenames retain the r0.3 suffix for pipeline compatibility; their contents, silkscreen and hardware contract are the r0.4 ECO identified by this delivery manifest.

The committed native KiCad checks have zero PCB DRC violations, zero unconnected items, zero schematic-parity issues and zero schematic ERC violations. See `kicad-drc.json` and `kicad-erc.json`. Live JLCSearch evidence covers all 68 unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all 13 sheets; see `schematic-style-check.json`. `circuit.json` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

Use `pcb-3d.png` and `pcb-bottom.png` for visual review. Print `mounting-template.svg` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as `pd1180-epr-r0.3-glb.zip` so cloud imports do not serialize a large loose binary. `delivery-manifest.json` records the exact file sizes and hashes, while `sha256.json` recursively covers this release directory.
