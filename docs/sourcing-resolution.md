# Current sourcing and replacement history

The current source manifest and exact live `stock-report.json` control ordering. Historical observations below do not reserve stock. The configured lot is five boards, before provider attrition; J1 and J10 require ten USB receptacles.

## Codes for the user's stock check

| Reference | JLCPCB code | Exact selected part | Five-board quantity |
|---|---|---|---:|
| R66 | C5454462 | AT0603BRD071K2L, 1.2 kΩ 0.1% 0603 | 5 |
| R60 | C351604 | PTFR0805B180KN9, 180 kΩ 0.1% 0805 | 5 |
| BZ1 | C417385 | FMB09A03-3V, 3 V active through-hole | 5 |
| J1/J10 | C3025063 | USB4105-GF-A-060 | 10 |
| U7 | C33828788 | DRV8262DDVR, HTSSOP-44 DDV | 5 |

R66 also changes from RT0603BRD071K2L / C136970 to **AT0603BRD071K2L / C5454462**, retaining 1.2 kΩ, 0.1%, 25 ppm/°C, 100 mW, 75 V and the 0603 footprint. Its fresh official available-order count was 1,937; the earlier code was zero.

The 2026-11-06 ECO replaces U7 DRV8462DDVR / C29780285, R60 RT0603BRD07180KL / C326731, BZ1 FUET-9650B-3V / C391032, and U36 SN74LVC2G66DCUR / C181970. U36 is now **SN74LVC2G66DCTR / C2651913** (MSOP-8, 0.65 mm pitch). U7 needs the added **MCP4822-E/SN / C16040 (U42)** and 1.5 kΩ current-mirror resistors. These are source/footprint/control changes, not assembly substitutions on the old PCB.

Consult the timestamped fresh report for current stock. Use **Available Order Qty**, bounded by warehouse stock; a larger warehouse/index count alone is not orderable inventory. Quantities are unreserved and exclude supplier attrition.

## Current identities

| Reference | Selected identity | Assembly/electrical constraint |
|---|---|---|
| U16 | RP2040 / C2040 | LQFN-56(7×7), current QSPI boot architecture; older STM32 is not fitted |
| U17 | W25Q32JVSSIM / C6000508 | Required 4 MiB QSPI boot flash on V3V3_MCU; full flash readback and cold boot required |
| U7 | DRV8262DDVR / C33828788 | DDV top-cooled pinout; do not substitute DDW |
| U36 | SN74LVC2G66DCTR / C2651913 | 0.65 mm pitch; use the new placement and footprint, not the old DCU land pattern |
| U42 | MCP4822-E/SN / C16040 | Dual DAC current references; no readback, gain 2, simultaneous LDAC update |
| U35 | PCA9538PWR / C201530 | Retain U37 PD_3V3-domain reset buffer, C99 and R137 |
| U37 | SN74LVC1G17DBVR / C7836 | Reset-domain isolation; do not omit |
| R64 | AR03BTCX4303 / C2984356 | 430 kΩ, 0.1%, 0603; preserve threshold tolerance |
| J2 | WAGO 2601-3104 / C20252915 | Four entries/eight tails, 3.5 mm pitch, direct wire clamp |
| J3 | WAGO 236-402 / C3819425 | Two entries/four tails, 5 mm pitch, direct wire clamp |
| U38 | INA237AIDGSR / C2864837 | Raw PD_VBUS ADC, 85 V input capability, VSSOP-10 |

The prior `replacement-catalog-evidence.json`, `stocked-controller-eco.json` and dated U16 review document the former revision only. They do not override the current fitted manifest. `procurement-open-items.csv` now names current parts and unresolved allocation/process work.

The former single-SPI settings-flash explanation no longer applies: U17 now boots RP2040 through QSPI. Its M-suffix identification/status behavior must remain compatible with the pinned boot stage. Current source/firmware contract checks cover QSPI wiring and the 4 MiB configuration; physical cold boot/readback is still required. See [U16/boot-flash contract](u16-footprint.md).

[GCT drawing USB4105, rev B4](https://gct.co/files/drawings/usb4105.pdf) shows a common PCB layout and the stake-length ordering option. Existing pad positions/nets and both CC paths are retained, including the doubled VBUS/GND lands. The -060 version is electrically selected; shorter stakes need reflow/joint and retention acceptance for this 1.6 mm board. The existing generic-family 3D model conservatively shows 0.95 mm stakes and is explicitly not an exact mechanical-fit approval. No cable/load retention claim follows from the drawing. The -120 candidate had zero available-order quantity.

[TI PCA9538 §7.2.1.1](https://www.ti.com/lit/ds/symlink/pca9538.pdf) documents RESET-to-VCC injection when RESET exceeds VCC. The previous direct PC13 / V3V3_MCU connection was therefore correctly rejected as a drop-in. This authorized revision fixes that circuit: U37 SN74LVC1G17DBVR / C7836 is powered by PD_3V3, C99 bypasses it and R137 pulls the buffered U35_RESET_N low. R132 keeps the MCU-side input low during reset. Review [the independent-rail reset analysis](indicators.md); do not fit PCA9538 on an older board that lacks this buffer.

## Additional U35 candidate screened

TI **TCAL9538PWR / C22445411**, TSSOP-16, was found with 13 available-order pieces in the dated [candidate evidence](../sourcing/tcal9538-candidate-evidence.json). It is **not selected**. The [TI TCAL9538 datasheet, Rev B](https://www.ti.com/lit/ds/symlink/tcal9538.pdf) specifies a 3.6 V maximum operating supply and 4 V absolute pin limits; its P-port clamp condition refers to VCC. This review did not establish guaranteed power-off leakage/tolerance for every connection when independently sequenced PD_3V3 is off while MCU/indicator rails are present. Matching the TSSOP pinout, address and base registers is insufficient. Review and test that power sequence before approving it; PCA9538 with its reviewed reset buffer is the selected BOM part. The observed quantity is neither reserved nor an instruction to purchase.

The inventory checker now attempts the official exact-part lookup even if the numeric JLCSearch request fails. Only official available-order evidence counts. Unknown official inventory stays unknown; cached index stock cannot replace it.

## Inventory authority and incomplete index evidence

The numeric JLCSearch query remains mandatory and its result is retained as `index_status` (`exact-match`, `no-exact-match`, or `network-error`) in every live report. On 2026-10-13 it returned empty results for numerous fitted supplier codes; C23146 also produced HTTP 500 before returning an empty result on retry. An empty secondary index is not evidence that JLCPCB lacks that exact part. The previous rule requiring a successful index match conflicted with the independently verified official catalog and has been corrected in `AGENTS.md`.

Availability means the official JLCPCB response identified the exact code and expected package and supplied sufficient **Available Order Qty**, bounded by warehouse stock. Index quantities never authorize an order or rescue a failed official query. Missing official identity, wrong package, unpurchasable state and unknown quantities still fail review; known zero/insufficient stock still fails procurement. Regression tests cover index outages, absent/fuzzy index entries, official identity mismatch and zero orderable stock. The replacements address the former U16/U35 shortages only while current exact stock remains sufficient. Allocate parts with the assembler using the timestamped quantities; record fabrication/installation acceptance separately.

The stock checker limits the full-BOM refresh to two concurrent lookups and uses bounded retries for transport/HTTP failures (including the observed HTTP 429 / curl 56 response). Exhausted requests remain unverified and fail review; cached/index quantities cannot replace official inventory.
