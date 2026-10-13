# Board readiness — 2026-10-13

**Order hold remains. Motor operation is not qualified.** The 0.4.1 ECO fixes the unused-SBU connection and prepares a real TI programming image; it does not create physical test results.

| Work item | Current result | What closes it |
|---|---|---|
| U1 unused SBU | Applied in source and native PCB; ERC/parity/unconnected zero; no new electrical DRC findings | First-article startup and FLT waveforms still required |
| Native reference labels | 404 retained findings: 186 text-height, 118 silk-over-copper, 100 silk-overlap; all 255 labels inside outline | User-approved label/fabrication resolution and fresh zero-violation DRC; labels are preserved as requested |
| Three placement advisories | Actual copper/polarity reviewed; exact exceptions guarded, raw output retained | Any changed advice or unrelated copper must pass renewed review |
| Stock/package check | Official exact-ID catalog supplements JLCSearch; unknown stock never passes; only Chinese/English through-hole-label translation allowed | Five current unavailable identities need stock allocation or a fully reviewed replacement |
| TI configuration | Full Flash binary + project + license; both register regions match; MCU verifies customer marker | Program U3, read back 65,536 bytes, verify hash, cold APP boot and PD/fault behavior |
| STM32 | Compiled diagnostics with configuration-identity check; all three motion locks false | Measured stationary and low-current qualification before a new motor-enabled image |
| J3 | Retained, pin 1 VMOTOR / pin 2 BRAKE_RETURN; external brake required for current run policy | Resistor/heatsink, harness, guarding and worst-stop energy qualification |
| Motor/mount/thermal | Ordered motor reference and bounded unloaded first test documented | Physical thread/depth, mounting/strain relief, current and temperature measurements |

The five unavailable BOM identities are **C179173 U17**, **C861400 R64**, **C2652286 U35**, **C2847904 U16**, and **C3020560 J1/J10**. See the timestamp in `stock-report.json`; warehouse inventory can include reserved material, so the checker uses the lower of warehouse and available-order quantities. No parts have been reserved. Similar USB connectors, different MCU packages, 1% replacements for the precision OVP resistor, or reset-less expanders are not approved substitutes. Purchase/consignment of the exact part still needs assembler acceptance and an updated stock gate.

The 10 Ω/300 W brake and source reference are candidates, not purchases or a proven system. No suitable final heatsink can be established without load and duty. The first proposed qualification is secured, unloaded, 20–25°C, 10 rpm, 10 rpm/s and about 0.827 A RMS, with the brake installed, after stationary supply/gate/fault checks. It is not authorized merely by merging this revision.

The user-facing decision is two separate gates: procure/fabricate a reviewed first article after silkscreen/DRC resolution and stock/fabricator/mounting preflight; then measure and qualify operation. A complete ready-to-run PCBA additionally needs a provider's accepted programming/test procedure and serial-numbered results. No test provider or order has been booked.

Evidence: [PD review](pd-configuration-review.md), [J3/brake](brake-integration.md), [test matrix](power-validation.md), [programming/readback](pd-programming.md), [placement review](placement-review.md), `verification.json`, `release-status.json` and `engineering/power-eco-simulation/results.json`. All simulated peaks are estimates; negative cases deliberately retain unsafe outcomes.
