# Board readiness — stocked U16/U35 revision

**Order hold remains. No assembled board has passed programming or powered qualification. Motion locks remain enabled.** Merging the design does not complete the checklist below. Check the timestamped [stock report](stock-report.json) and [verification result](verification.json) for the current revision.

The 2026-10-20 [copper geometry review](copper-geometry-review.md) consolidates the power pours and closes all 17 findings exposed by enabling 0.09 mm connection-width checks. Native copper/clearance, connectivity, parity and ERC pass. These are CAD results, not a temperature-rise or motor-operation qualification. The fresh stock check records shortages for R60, BZ1, R65 and U6; no part substitution is included in this copper revision.

## Design and procurement

| Item | Disposition | Evidence needed to close |
|---|---|---|
| U1 unused SBU | Corrected in source and native PCB | First-article cold-start FLT/EPR waveforms |
| R64 | Selected AR03BTCX4303 / C2984356; retains 430 kΩ, 0.1%, 25 ppm/°C, 0603 | Fresh inventory for the order; measured OVP threshold |
| U17 | Selected W25Q32JVSSIM / C6000508; same SOIC-8-208mil | Fresh inventory including assembly attrition; single-SPI read/write test before using storage |
| J1/J10 | Selected USB4105-GF-A-060 / C3025063; shared land pattern, shorter 0.60 mm shell stakes | Assembly process and connector retention acceptance on the 1.6 mm PCB |
| U16, U35 | Selected STM32G0B1CEU6 / C2829190 (UFQFPN48) and PCA9538PWR / C201530 with U37 reset buffer | Refresh exact JLC stock including spares; use this complete PCB/BOM/firmware revision |
| Placement | Three exact advisories reviewed against actual copper | Renew review if advice or layout changes |
| Silkscreen/text | **The retained baseline now contains 401 cosmetic findings. Native labels are unchanged by the copper revision.** | Raw DRC still reports them; no zero-DRC claim or implicit fabricator acceptance |
| Fabrication and mounting | ENIG and all 62 filled/capped via-in-pad locations specified; physical approvals pending | Complete [manufacturing/mechanical acceptance](manufacturing-acceptance.md) |

The [sourcing review](sourcing-resolution.md) records why each replacement is acceptable or rejected. Stock is not reserved. These replacements address the former two-part shortage; current exact stock and assembler allocation still control procurement. Physical readiness remains separate.

## Programming, readback and cold boot — all physical results pending

- [ ] Record PCB serial/revision, release hashes, programmer/fixture identity and operator/date. Pass unpowered inspection; keep the motor disconnected.
- [ ] **TI EEPROM U3:** validate the archived Full Flash image, isolate the I2Cc bus, program at address 0 with fixed 5 V at J1 and a 3.3 V open-drain fixture. Save the programmer log and **all 65,536 bytes** of device readback. Run the PD readback comparator and archive its result.
- [ ] **STM32 U16:** program the commissioning diagnostics image over SWD at **0x08000000**, with target-voltage sensing and no programmer supply backfeed. Save the log, option-byte readout and **all 524,288 bytes** of main-flash readback; run the STM32 comparator. Keep readout protection disabled during qualification so verification is possible.
- [ ] **Cold boot:** remove J1, J10 and programmer power, verify rail discharge, release EEPROM isolation and detach the active programming fixture. Power from fixed 5 V first. Prove TPS26750 `APP ` mode and customer marker `PD118041`; verify the MCU boots its intended diagnostics image and the motor remains inhibited. Repeat power sequencing/reset tests, then the EPR tests. Record scope captures and boot logs; a software reset alone is not a cold boot.

Follow [the detailed programming procedure](pd-programming.md). The comparators require full-capacity dumps, compare every image byte and hash the entire dump. They do not claim that unprogrammed tail bytes or option bytes match an invented pattern, or that a file came from real hardware.

## External equipment and powered qualification

- [ ] Record the actual **48 V / 5 A EPR adapter and cable** model/serial, cable e-marker identity and negotiated contract. Test attach/detach, load steps, source shutdown and backfeed. A reference product or the motor's Amazon link is not evidence for the installed supply.
- [ ] Retain **J3: pin 1 VMOTOR, pin 2 switched BRAKE_RETURN**. Qualify the external resistor, heatsink, wiring and guarding against the defined speed, inertia, stop time and repeated-stop duty. **10 Ω / 300 W remains provisional**; its nominal power rating depends on cooling. No operation with J3 open is supported by the current run policy.
- [ ] Secure the actual motor/PCB and qualify the J2/J3 harnesses, crimps and strain relief before motion.
- [ ] On the assembled board, complete **supply/gate/fault checks → low-current unloaded motor test → braking and thermal tests**, in that order. Archive currents, rail/gate peaks, temperatures, ambient, load and stop profiles against each board serial.

The proposed first-motion envelope is about **0.827 A RMS, 10 rpm, 10 rpm/s, unloaded, 20–25°C**, after stationary checks. It is a test proposal, not a qualified rating. The [power-validation matrix](power-validation.md) defines acceptance/stop criteria. Keep all three firmware qualification flags false until the corresponding measured records support an explicitly reviewed test image. Do not unlock motion merely to make a test pass.

Prototype fabrication, first powered motion, and ready-to-run shipment are separate decisions. The latter requires both programming records, cold boot, qualified external equipment and per-board powered acceptance; no provider or order has been booked.

Runtime brake-voltage monitoring remains implemented with motion locked. It is not a backup energy absorber; full-current open-brake cases still exceed 55 V. See [completion and acceptance](completion-handoff.md).

## USB edge access revision (2026-10-14)

J1/J10 now sit 2 mm farther outward; the nominal mating faces extend 0.2856 mm beyond the board edge. Local native routing, matching manufacturing placements and the routed viewer are regenerated together. See [USB access evidence](usb-access.md). This resolves the recessed-port layout review item; actual cable/enclosure/mount fit and the existing programming, power, brake and thermal qualification items still require hardware evidence.
