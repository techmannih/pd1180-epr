# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.3 review handoff — order blocked

**Do not order for external STEP/DIR operation.** The review found that U7 pins 23–25 share encoder nets that conflict with their STEP/DIR functions. See the repository's `docs/step-dir-hardware-review.md`. Schematic changes await an explicit freeze exception. Status: blocked-external-step-dir-hardware-conflict.

The included `pd1180-commissioning-firmware.zip` contains a real STM32 image with USB diagnostics. Motor power and motion remain locked. It does not prove motor operation.

After the electrical blocker is resolved and manufacturing checks rerun, use newly generated Gerbers together with `jlc-bom.csv` plus `jlc-cpl.csv` for two-sided assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for the 40 MOSFET drain-pad thermal vias, and top/bottom assembly.

The committed native KiCad checks have zero PCB DRC violations, zero unconnected items, zero schematic-parity issues and zero schematic ERC violations. See `kicad-drc.json` and `kicad-erc.json`. Live JLCSearch evidence covers all 67 unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all 12 sheets; see `schematic-style-check.json`. `circuit.json` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

Use `pcb-3d.png` and `pcb-bottom.png` for visual review. Print `mounting-template.svg` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as `pd1180-epr-r0.3-glb.zip` so cloud imports do not serialize a large loose binary. `delivery-manifest.json` records the exact file sizes and hashes, while `sha256.json` recursively covers this release directory.
