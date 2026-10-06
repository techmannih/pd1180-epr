# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.3 prototype handoff

Upload `pd1180-epr-r0.3-gerbers.zip` for the PCB and use `jlc-bom.csv` plus `jlc-cpl.csv` for top-side assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, filled/capped via-in-pad and top-only assembly.

The committed KiCad DRC has zero violations and zero unconnected items. Live JLCSearch evidence covers all 67 unique populated LCSC codes. The assembled board boots safe with blank U3/U16; 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style analysis reports zero issues across all 12 sheets; see `schematic-style-check.json`.

Use `pcb-3d.png` and `pcb-bottom.png` for visual review. Print `mounting-template.svg` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as `pd1180-epr-r0.3-glb.zip` so cloud imports do not serialize a large loose binary. `delivery-manifest.json` records the exact file sizes and hashes, while `sha256.json` recursively covers this release directory.
