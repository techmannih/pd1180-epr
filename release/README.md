# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## r0.3 prototype handoff

Upload `pd1180-epr-r0.3-gerbers.zip` for the PCB and use `jlc-bom.csv` plus `jlc-cpl.csv` for top-side assembly. Apply every value in `order-settings.json`, especially four layers, 1 oz copper on all layers, filled/capped via-in-pad and top-only assembly.

The committed KiCad DRC has zero violations and zero unconnected items. Live JLCSearch evidence covers all 67 unique populated LCSC codes. The assembled board boots safe with blank U3/U16; 48 V EPR requires a TI-generated TPS26750 full-flash image, and motor operation requires programmed STM32 firmware plus staged powered validation.
