# Reviewer requirements implementation

This summary describes the current RP2040 / DRV8462DDVR DATA-only revision. The earlier STM32/TMC5160 product ECO is retained in Git history and dated engineering evidence.

| Reviewer requirement | Implemented result | Assembly follow-through |
|---|---|---|
| Common controller architecture | RP2040, 12 MHz clock and 4 MiB QSPI flash | Program/read back and verify USB/cold boot |
| Integrated motor power switches | DRV8462DDVR integrated H-bridges, SPI readback and timer-driven STEP/DIR | Fit the selected top cooler/TIM and record current/temperature |
| DATA-powered MCU | J10 powers MCU; U39/U40 isolate board-powered inputs; U41 switches sensors | Measure DATA-only, both-source, suspend and detach behaviour |
| WAGO / spring clamps | J2 2601-3104 and J3 236-402 | Check strip lengths, retention, insulation and strain relief |
| PD voltage via ADC | U38 INA237 raw PD_VBUS; U30 ADS1115 protected VMOTOR | Compare both channels with meter readings |
| POWER_GOOD | Physical MOTOR_PG plus separately reported, firmware-derived PD_READY | Record startup, source loss and fault response |
| Rear mounting | Four original PCB holes match ordered-motor STEP axes | Measure rear thread/depth and select secure fastening |
| Readable review material | Nine functional schematic sheets, four System diagrams and IC-purpose table | Review the matching revision's exported files |
| Motor-test software | Diagnostic, stationary-power and bounded-motor profiles with hashed board records | Follow the staged first-article procedure |

Use [system overview](system-overview.md), [assembly](assembly.md), [commissioning](commissioning.md) and [reviewer checklist](reviewer-checklist.md). Current automated results are in [verification.json](verification.json); exact native findings are summarized in [verification.md](verification.md). Physical results are entered after assembly, alongside the board serial and programmed-image hashes.
