# TPS26750 programming review — 2026-10-13

**A genuine TI Full Flash candidate is generated and register-reviewed. It has not been programmed or tested on this board.** Both TI agreements were accepted after the user's explicit approvals. The project, binary, license and notice are in `firmware/pd/ti-configuration.zip` and release copy `pd1180-ti-configuration.zip`; exact size/hash live in [pd-configuration.json](pd-configuration.json). The binary has 31,552 bytes, programmed at EEPROM offset 0; complete readback must contain all 65,536 device bytes. Do not hand-edit the TI binary.

## Applied unused-SBU correction

J1.10/16 and U1.1/2 are now NC; U1.14/15 connect to GND. The two PD_SBU nets and 44 associated segments/vias are removed. Two short ground segments connect U1.13/14/15. Refill required removing one isolated PD_VBUS zone and trimming two acute B.Cu fill tips with a 0.23 × 0.23 mm fill-only keepout. No DRC exclusion was added. The native comparison against merged PR #2 proves every unrelated footprint, pad geometry/net, hole, track and zone outline unchanged; derived pours were refilled. Native DRC, ERC, parity and unconnected counts are zero.

This implements the unused-channel arrangement in [TI's TPS26750/TPD4S480 investigation](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1624778/tps26750-tps26750-event-92-is-not-activating-at-correct-time-in-epr-negotiation). TI recommended leaving unused connector-side SBU disconnected and grounding system-side SBU; the reported customer result is not a powered result for our PCB. Fault response remains enabled. The [TPD4S480 datasheet](https://www.ti.com/lit/ds/symlink/tpd4s480.pdf), sections 6.3.4 and 7.2.2.5, explains the voltage-triggered EPR divider and detach-on-FLT behavior. Confirm startup and fault waveforms on the first article.

## Exported configuration and independent check

Device **TPS26750**, tool **2.0.1**, base **TPS26750_F809_11_59_0000.bin**. Register interpretation follows the [TPS26750 TRM SLVUCR7](https://www.ti.com/lit/pdf/SLVUCR7), tables 4-4, 4-12, 4-13, 4-18, 4-21, 4-26 and 6-6.

| Setting | Exported choice |
|---|---|
| Customer register 0x06 | ASCII `PD118041`; MCU polls this marker, but qualification lock stays false |
| Power/data | Sink only, no BQ integration, zero source PDOs; J1 USB communications and power/data swaps disabled |
| Fixed sink PDOs | 5/9/15 V at 3 A; 20/28/36/48 V at 5 A |
| Variable voltage | Tool retains an AVS capability record; automatic PPS and AVS requests disabled |
| GPIO0 | Event 33, digital input, noninverted; low invokes Type-C error recovery |
| GPIO2 | Event 92, push-pull output, initial low, noninverted to U1 EPR_EN |
| External power path | Sink-only tool defaults retained for existing TI buffer; measure polarity/timing |

`bun scripts/check-pd-image.mjs` checks these fields, file hashes and identical configuration records in both exported regions. Negative tests reject a DRP import reset, missing fault event, reversed GPIO2 polarity, enabled swaps and corruption. A customer marker is not cryptographic attestation. VCONN policy is not exposed in this tool/TRM revision; source behavior and cable negotiation require protocol capture before qualification.

**Tool import caveat:** importing the project in 2.0.1 reset question 1 to the DRP default and reapplied dependent fields despite selecting advanced-data import. Re-select the sink-only/no-BQ diagram, verify every advanced field, re-export and rerun the checker. Earlier rejected exports are excluded. Never assume importing JSON preserves the binary's reviewed settings.

EEPROM programming/readback, cold `APP ` boot, both connector orientations, FLT detach/recovery, EPR_EN transitions, actual 48 V/5 A source/cable contract and no unintended bridge enable remain untested. No serial-numbered readback or waveform exists. Follow [programming](pd-programming.md) and the [staged powered test matrix](power-validation.md); a passing exported-image check cannot close these hardware gates.
