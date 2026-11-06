# Current reference-board and reviewer decisions

Reviewed 2026-11-03 against the published releases in [source provenance](../engineering/reviewer-power-reference.json). The old STM32/TMC5160 comparison is available in Git history; it does not describe this board.

| Requirement / review comment | Current decision and evidence | Remaining qualification |
|---|---|---|
| MCU supply should follow NEMA14/17/23 | NEMA23 v1.4.7 and NEMA14 RP2040 v1.13.2 support PD or DATA logic power. NEMA17 v1.0.48 requires DATA. Retain dual-source operation; see [power paths](usb-pd-architecture.md). | Supply handover, back-power and USB current tests. |
| Cheaper DRV8262 variant | Retain DDVR for the 6 A/phase design target. DRV8262 DDWR is 5 A RMS per bridge in dual-bridge mode (TI Rev. C §5.3) with a different pinout and bottom thermal pad; it is not a drop-in substitution. | DDVR's top heatsink/TIM, allowed RMS current and transient margin are unqualified. |
| Too many schematic sheets / unclear chips | Consolidate 26 pages into nine functional A4 pages, with supply names, role notes and a table covering every IC. | Review the actual page images alongside native electrical results. |
| Multiple buck-boost converters | U5, U22 and U34 are step-down bucks. U5 starts logic from PD, U22 keeps brake control powered from a charged motor bus, U34 supplies the brake gate driver. | PD-removal/regeneration behaviour on assembled hardware. |
| Unclear logic circuits | U4 gates input power permission. U10/U11/U33 combine MCU_RUN, MOTOR_PG, VMOTOR_OK and TEMP_OK into RUN_SAFE. No gate is removed to hide complexity. | Fault injection and startup/reset timing. |
| POWER_GOOD | Physical eFuse MOTOR_PG plus derived PD_READY: fresh raw-PD reading and a live valid EPR contract. | Readback and supply/fault tests. |
| Read PD voltage via ADC | U38 INA237 measures PD_VBUS before the eFuse. U30 ADS1115 measures protected VMOTOR and other diagnostics. | Voltage calibration and stale/missing-sensor fault tests. |
| WAGO / spring clamp | J2 2601-3104 motor and J3 236-402 brake terminals replace JST. J2 remains on the motor wire-exit side. | Real wire insertion, retention, bend clearance and strain relief. |
| Bottom encoder only | Optional U18 AS5600 alone on bottom; C52/C53 are top DNP. | Rear magnet interface is not established for the ordered single-shaft motor. |
| Rear mounting holes | Four unchanged holes align to the manufacturer's STEP model. | Rear thread, engagement depth, spacer height and secure fastening remain unmeasured. |

The reference boards are examples, not evidence that this 48 V NEMA34 assembly is qualified. Motion locks stay enabled. The eight USB NPTH-to-pad errors and raw cosmetic warnings stay visible; a schematic cleanup does not approve fabrication. See [completion handoff](completion-handoff.md), [thermal qualification](thermal-qualification.md) and [power validation](power-validation.md).
