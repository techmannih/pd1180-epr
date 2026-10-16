# Board readiness — current assembly and external-system handoff

**Order hold remains. No assembled board has passed programming or powered qualification. Motion locks remain enabled.** Merging the design does not complete the checklist below. Check the timestamped [stock report](stock-report.json) and [verification result](verification.json) for the current revision.

Documentation updated 2026-10-17 against design `8139bca`. This update records existing evidence and outstanding work; it does not refresh supplier stock, rerun the full hardware review or qualify a power source.

## Design and procurement

| Item | Disposition | Evidence needed to close |
|---|---|---|
| U1 unused SBU | Corrected in source and native PCB | First-article cold-start FLT/EPR waveforms |
| R64 | Selected AR03BTCX4303 / C2984356; retains 430 kΩ, 0.1%, 25 ppm/°C, 0603 | Fresh inventory for the order; measured OVP threshold |
| U17 | Selected W25Q32JVSSIM / C6000508; same SOIC-8-208mil | Fresh inventory including assembly attrition; single-SPI read/write test before using storage |
| J1/J10 | Selected USB4105-GF-A-060 / C3025063; shared land pattern, shorter 0.60 mm shell stakes | Assembly process and connector retention acceptance on the 1.6 mm PCB |
| U16, U35 | Selected STM32G0B1CEU6 / C2829190 (UFQFPN48) and PCA9538PWR / C201530 with U37 reset buffer | Refresh exact JLC stock including spares; use this complete PCB/BOM/firmware revision |
| Placement | Three exact advisories reviewed against actual copper | Renew review if advice or layout changes |
| Silkscreen/text | **401 retained cosmetic findings** after the USB-edge and encoder-capacitor ECOs; native labels remain visible | Preserve the exact raw findings; no zero-DRC claim or implicit fabricator acceptance |
| Minimum copper connection width | Stricter review confirmed **U16 pin 8 OSC_IN at 0.0636 mm**, below the stated 0.09 mm minimum | Correct the pad entry, enable meaningful width checking, disposition the remaining markers and regenerate/recheck affected fabrication outputs |
| Fabrication and mounting | ENIG and all 63 filled/capped via-in-pad locations specified; physical approvals pending | Complete [manufacturing/mechanical acceptance](manufacturing-acceptance.md) |

The [sourcing review](sourcing-resolution.md) records why each replacement is acceptable or rejected. Stock is not reserved. These replacements address the former two-part shortage; current exact stock and assembler allocation still control procurement. Physical readiness remains separate.

## Copper-width review — 2026-10-16

The read-only audit used design `8139bcaac0d26eefba43a5b7cb0ee2b7a01d2931`, native PCB SHA-256 `4e53cf5210003b327a1b4cd49f3c5c81ff3a0f5f44277b71c384c29bc95a5cb3`. Fresh refill/DRC retained 401 cosmetic findings, zero unconnected items and zero parity issues; the copper Gerbers matched the fresh export apart from timestamps. These results did not exercise a meaningful minimum connection width: the committed project sets `min_connection` to **0 mm**.

A disposable copy with minimum connection and groove width set to **0.09 mm** produced **17 additional connection-width warning markers**. Native DRC plus independent polygon connectivity inspection confirmed the **U16 pin 8 / OSC_IN / F.Cu** trace-to-pad corner entry at approximately **X=80.900, Y=115.100 mm** is only **0.0636 mm** wide. The trace UUID is `4d982e36-1430-4d61-a500-c5d15533ec31`. This is a required connection that needs correction, not a claim that all power pours are invalid.

Q5 pin 1 and U12 pin 1 warning contacts have wider parallel routes; the 17 markers are not 17 independent confirmed defects. Remaining zone-contact markers need individual disposition. Sharp corners alone do not establish invalidity, and connectivity/clearance passes do not prove sufficient neck width or thermal capacity. **No copper or DRC rule was changed by this documentation update.** Preserve the fabrication hold until the confirmed neck and remaining markers are addressed and the revised outputs are checked.

## Programming, readback and cold boot — all physical results pending

- [ ] Record PCB serial/revision, release hashes, programmer/fixture identity and operator/date. Pass unpowered inspection; keep the motor disconnected.
- [ ] **TI EEPROM U3:** validate the archived Full Flash image, isolate the I2Cc bus, program at address 0 with fixed 5 V at J1 and a 3.3 V open-drain fixture. Save the programmer log and **all 65,536 bytes** of device readback. Run the PD readback comparator and archive its result.
- [ ] **STM32 U16:** program the commissioning diagnostics image over SWD at **0x08000000**, with target-voltage sensing and no programmer supply backfeed. Save the log, option-byte readout and **all 524,288 bytes** of main-flash readback; run the STM32 comparator. Keep readout protection disabled during qualification so verification is possible.
- [ ] **Cold boot:** remove J1, J10 and programmer power, verify rail discharge, release EEPROM isolation and detach the active programming fixture. Power from fixed 5 V first. Prove TPS26750 `APP ` mode and customer marker `PD118041`; verify the MCU boots its intended diagnostics image and the motor remains inhibited. Repeat power sequencing/reset tests, then the EPR tests. Record scope captures and boot logs; a software reset alone is not a cold boot.

Follow [the detailed programming procedure](pd-programming.md). The comparators require full-capacity dumps, compare every image byte and hash the entire dump. They do not claim that unprogrammed tail bytes or option bytes match an invented pattern, or that a file came from real hardware.

## External equipment and powered qualification

- [ ] Record the actual **48 V / 5 A EPR adapter and cable** model/serial, cable identity/EPR capability and negotiated contract (including e-marker verification for a detachable cable). Current candidate: **Delta ADP-240KB BA**, with a matching grounded Indian plug → IEC C5 mains cord for its C6 inlet. Confirm supplied contents; do not duplicate a suitable included output lead. Test attach/detach, load steps, source shutdown and backfeed. [Purchase links and complete inventory](external-system.md) identify candidates, not installed/qualified equipment.
- [ ] Keep supply capacity separate from motor demand: 240 W is the 48 V / 5 A source capability; the current U6/R25 motor path limits at nominal 3.607 A (about 173 W at 48 V before downstream losses), not a guaranteed continuous or shaft-power rating. Measure the application's consumption and thermal limits.
- [ ] Retain **J3: pin 1 VMOTOR, pin 2 switched BRAKE_RETURN**. Qualify the external resistor, heatsink, wiring and guarding against the defined speed, inertia, stop time and repeated-stop duty. **10 Ω / 300 W remains provisional**; its nominal power rating depends on cooling. No operation with J3 open is supported by the current run policy.
- [ ] Secure the actual motor/PCB and qualify the J2/J3 harnesses, crimps and strain relief before motion.
- [ ] On the assembled board, complete **supply/gate/fault checks → low-current unloaded motor test → braking and thermal tests**, in that order. Archive currents, rail/gate peaks, temperatures, ambient, load and stop profiles against each board serial.

The proposed first-motion envelope is about **0.827 A RMS, 10 rpm, 10 rpm/s, unloaded, 20–25°C**, after stationary checks. It is a test proposal, not a qualified rating. The [power-validation matrix](power-validation.md) defines acceptance/stop criteria. Keep all three firmware qualification flags false until the corresponding measured records support an explicitly reviewed test image. Do not unlock motion merely to make a test pass.

Prototype fabrication, first powered motion, and ready-to-run shipment are separate decisions. The latter requires both programming records, cold boot, qualified external equipment and per-board powered acceptance; no provider or order has been booked.

Runtime brake-voltage monitoring remains implemented with motion locked. It is not a backup energy absorber; full-current open-brake cases still exceed 55 V. See [completion and acceptance](completion-handoff.md).

## USB edge access revision (2026-10-14)

J1/J10 now sit 2 mm farther outward; the nominal mating faces extend 0.2856 mm beyond the board edge. Local native routing, matching manufacturing placements and the routed viewer are regenerated together. See [USB access evidence](usb-access.md). This resolves the recessed-port layout review item; actual cable/enclosure/mount fit and the existing programming, power, brake and thermal qualification items still require hardware evidence.
