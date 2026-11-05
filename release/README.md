# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## 0.5.0-RP2040-DRAFT review handoff — powered validation pending

This package contains the checked design, diagnostic firmware and post-assembly commissioning procedure. Physical inspection, programming/readback, powered measurements and manufacturer acceptance are recorded separately from software verification.

This revision uses RP2040 STEP/DIR control, DRV8462DDVR integrated H-bridges, TPS26750 48 V EPR and an optional DNP AS5600 encoder. The independent eFuse, brake/OVP and hardware enable chain remain. USB DATA powers diagnostics separately; the motor-bus backup supply preserves brake control after PD loss. Status: native-cad-verified-hardware-unqualified. See `rp2040-redesign.md` and its hash-bound evidence.

The ordered motor is STEPPERONLINE 34HS31-6004S1 (Amazon B091C83HWF). Its exact manufacturer STEP replaces the QSH reference. Existing four PCB holes are unchanged. Unsupported posts, adapter and fasteners have been removed; rear attachment and encoder mounting remain unresolved. See `motor-assembly.md` for the alignment preview and unresolved mechanical gates.

RGB, independent board-power indication, a reset-safe buzzer and eight new power/programming pads are included. See `indicators.md` and `pd-programming.md` for states, supply allocation and isolated EEPROM programming. The fixture and TI image still require qualification.

The eFuse remains nominally 3.607 A and the independent brake remains required. The default RP2040 image is inhibited. The explicit bench-test profile requests at most 0.8 A RMS (approximately 0.773 A after quantization), 10 rpm unloaded and a 10-second run before automatic ramp-down. The stationary power-test profile never enables the bridges. With the current 2000 uF bank, the 6 A winding corner reaches 54.321 V in the model. The delayed 100 us recovery case reaches 54.745 V and still lacks the allocated 0.5 V reserve below the 55 V system review limit. Neither full motor current nor the DDV top-side heatsink/TIM is qualified.

The included `pd1180-commissioning-firmware.zip` contains RP2040 ELF/BIN/UF2 diagnostics, with motor power and motion locked. Use its manifest and the RP2040 programming/readback instructions; the old STM32 image/address is invalid.

J3 now includes spring-clamp termination, paired cable, rings and provisional resistor/cooling installation; see `brake-assembly.md`. J2 is WAGO 2601-3104 and requires the separately prepared motor cable assembly specified in `motor-harness.md`. J7 and its external input conditioning are removed; SW2 provides local START/STOP and SW1 remains RESET. U18 alone is on the bottom; C52/C53 are on top; all three are DNP, excluded from fitted BOM/CPL and paste. All 243 fitted parts remain top-side. The ordered single-shaft motor has no qualified rear magnet interface.

The requested delivery is a fully assembled, programmed and functionally tested PCBA. `order-settings.json` requests programming and functional testing, with provider acceptance still pending. U3's register-reviewed TI full-flash candidate is included in pd1180-ti-configuration.zip, with programming/readback pending. Use the included `commissioning.md` and blank record template to build separate serial-bound stationary and bounded motor-test images after their respective inspections. A full-current production operating profile is outside this commissioning scope. Follow the repository README for wiring and diagnostic startup, and the included `assembly.md` for the provider request, first-article programming sequence and per-board acceptance requirements. Programming verification and the approved powered motor tests must pass before shipment. The default diagnostic image deliberately leaves motion inhibited; post-assembly tests use the documented profiles. No order or test service has been booked.

Fabrication inputs are the matched Gerbers together with `jlc-bom.csv` plus `jlc-cpl.csv` for top-side assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, epoxy-filled/copper-capped processing for every via-in-pad listed in the order settings (see the exact native inventory in rp2040-via-in-pad.json, including C103’s USB fanout via), and top-side assembly.

Legacy archive/KiCad basenames retain the r0.3 suffix for pipeline compatibility; their contents and hardware contract correspond to 0.5.0-RP2040-DRAFT, identified by this delivery manifest.

The native reports contain 483 raw PCB DRC findings (eight retained J1/J10 hole-clearance errors plus 475 cosmetic warnings; no other native errors), 0 unconnected items, 0 schematic-parity issues and 0 schematic ERC violations. See `kicad-drc.json` and `kicad-erc.json`. Live JLCSearch plus exact-ID official catalog evidence covers all 85 unique populated LCSC codes. Reset circuitry is designed to inhibit motor power with blank U3/U16; this has not been measured on hardware. 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed RP2040 firmware plus staged powered validation.

The tscircuit viewer-equivalent schematic style result is recorded across all 9 sheets; see `schematic-style-check.json`. `circuit.json` preserves that source schematic/3D model and replays the exact verified KiCad traces, vias and copper pours in the hosted PCB viewer without rerunning the cloud autorouter.

External equipment and candidates are listed in [external-system.md](external-system.md) and [external-parts.json](external-parts.json); the current profile requires a qualified brake assembly.

Power calculations and the unperformed bench-test matrix are in `power-validation.md`; `power-audit.json` and `native-decoupling-check.json` contain the numerical evidence.

Use `pcb-3d.png` and `pcb-bottom.png` for visual review. Print `mounting-template.svg` at 100% and measure its calibration bar before comparing it with the motor. The complete 3D model is stored as `pd1180-epr-r0.3-glb.zip` so cloud imports do not serialize a large loose binary. `delivery-manifest.json` records the exact file sizes and hashes, while `sha256.json` recursively covers this release directory.
