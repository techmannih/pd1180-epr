# Sourcing replacements — 2026-10-14

Five boards need five of each IC/resistor and ten USB receptacles, before assembler attrition. [Catalog evidence](../sourcing/replacement-catalog-evidence.json) records exact public JLC identities and available-order quantities. Refresh the release stock report immediately before ordering; no inventory was purchased or reserved.

| Reference | Previous identity | Selected identity | Review |
|---|---|---|---|
| R64 | RT0603BRD07430KL / C861400 | **Viking AR03BTCX4303 / C2984356** | 430 kΩ, 0.1%, 25 ppm/°C, 100 mW, 75 V, 0603; unchanged OVP calculation and land pattern |
| U17 | W25Q32JVSSIQ / C179173 | **Winbond W25Q32JVSSIM / C6000508** | Same 32 Mbit, 2.7–3.6 V, industrial SOIC-8-208mil pinout; M/Q behavior reviewed below |
| J1/J10 | USB4105-GF-A / C3020560 | **GCT USB4105-GF-A-060 / C3025063** | Same contact positions, polarity and PCB land pattern; 48 V/5 A retained; shell stakes change from 0.95 to 0.60 mm |
| U16 | STM32G0B1CBT6 / C2847904 | **STM32G0B1CEU6 / C2829190** | Same GP peripheral assignment; new UFQFPN48 footprint/ground pad/local routing and 512 KiB firmware/readback target |
| U35 | TCA9538PWR / C2652286 | **PCA9538PWR / C201530** | Same TSSOP16 lands and base register map; mandatory U37 PD_3V3-domain reset buffer, C99 bypass and R137 pulldown added |

[Viking AR datasheet, rev F6](https://www.viking.com.tw/Templates/att/AR_Series%20Data%20Sheet%20%28Edition%20REV.F6%29.pdf?lng=en): `03` is 0603, `B` is 0.1%, `C` is 25 ppm/°C, `X` is the 1/10 W option, `4303` is 430 kΩ. Its 75 V limit and temperature range cover the existing resistor screen. This substitution does not change brake/OVP thresholds or approve higher bus voltage.

[Winbond's M/Q explanation](https://www.winbond.com/hq/support/faq/technical/?__locale=en) and the [W25Q32JV manufacturer datasheet](https://datasheet.lcsc.com/datasheet/pdf/a0a57990083dbaa836cd5aa8d7b11749.pdf?productCode=C2999380) establish that M has programmable QE, initially zero, and different identification behavior. This board uses single SPI; pin 3 /WP and pin 7 /HOLD are tied to V3V3. Current motion/diagnostics firmware only releases FLASH_CS_N and does not depend on flash ID or stored settings. Future storage code must recognize the selected M part's ID and explicitly review status/QE handling; do not reuse an IQ-only ID check. First-article storage read/write is required before storage becomes a relied-on function. Only nine pieces were observed; assembler attrition may exceed that margin.

[GCT drawing USB4105, rev B4](https://gct.co/files/drawings/usb4105.pdf) shows a common PCB layout and the stake-length ordering option. Existing pad positions/nets and both CC paths are retained, including the doubled VBUS/GND lands. The -060 version is electrically selected; shorter stakes need reflow/joint and retention acceptance for this 1.6 mm board. The existing generic-family 3D model conservatively shows 0.95 mm stakes and is explicitly not an exact mechanical-fit approval. No cable/load retention claim follows from the drawing. The -120 candidate had zero available-order quantity.

[TI PCA9538 §7.2.1.1](https://www.ti.com/lit/ds/symlink/pca9538.pdf) documents RESET-to-VCC injection when RESET exceeds VCC. The previous direct PC13 / V3V3_MCU connection was therefore correctly rejected as a drop-in. This authorized revision fixes that circuit: U37 SN74LVC1G17DBVR / C7836 is powered by PD_3V3, C99 bypasses it and R137 pulls the buffered U35_RESET_N low. R132 keeps the MCU-side input low during reset. Review [the independent-rail reset analysis](indicators.md); do not fit PCA9538 on an older board that lacks this buffer.

U16 STM32G0B1CEU6 is a package change, not an assembly-only substitution. Use the regenerated Gerbers/BOM/CPL and CE firmware archive together. [The footprint and memory contract](u16-footprint.md) document the exposed ground pad, GP pinout and full 512 KiB readback. No N-suffix MCU is approved.

## Inventory and allocation

The initial replacement screen found 306 orderable U16, 3,982 U35 and 13,507 U37 pieces. The current `stock-report.json` controls every order decision; it must prove all fitted identities and the assembler's required spares. No parts were ordered, reserved or allocated. [Procurement handoff](../sourcing/procurement-open-items.csv) records the new identities and remaining allocation/process acceptance. A passing stock query does not close fabrication, programming or powered qualification.

## Additional U35 candidate screened

TI **TCAL9538PWR / C22445411**, TSSOP-16, was found with 13 available-order pieces in the dated [candidate evidence](../sourcing/tcal9538-candidate-evidence.json). It is **not selected**. The [TI TCAL9538 datasheet, Rev B](https://www.ti.com/lit/ds/symlink/tcal9538.pdf) specifies a 3.6 V maximum operating supply and 4 V absolute pin limits; its P-port clamp condition refers to VCC. This review did not establish guaranteed power-off leakage/tolerance for every connection when independently sequenced PD_3V3 is off while MCU/indicator rails are present. Matching the TSSOP pinout, address and base registers is insufficient. Review and test that power sequence before approving it; PCA9538 with its reviewed reset buffer is the selected BOM part. The observed quantity is neither reserved nor an instruction to purchase.

The inventory checker now attempts the official exact-part lookup even if the numeric JLCSearch request fails. Only official available-order evidence counts. Unknown official inventory stays unknown; cached index stock cannot replace it.

## Inventory authority and incomplete index evidence

The numeric JLCSearch query remains mandatory and its result is retained as `index_status` (`exact-match`, `no-exact-match`, or `network-error`) in every live report. On 2026-10-13 it returned empty results for numerous fitted supplier codes; C23146 also produced HTTP 500 before returning an empty result on retry. An empty secondary index is not evidence that JLCPCB lacks that exact part. The previous rule requiring a successful index match conflicted with the independently verified official catalog and has been corrected in `AGENTS.md`.

Availability means the official JLCPCB response identified the exact code and expected package and supplied sufficient **Available Order Qty**, bounded by warehouse stock. Index quantities never authorize an order or rescue a failed official query. Missing official identity, wrong package, unpurchasable state and unknown quantities still fail review; known zero/insufficient stock still fails procurement. Regression tests cover index outages, absent/fuzzy index entries, official identity mismatch and zero orderable stock. The replacements address the former U16/U35 shortages only while current exact stock remains sufficient. No query reserves inventory or clears physical order holds.

The stock checker limits the full-BOM refresh to two concurrent lookups and uses bounded retries for transport/HTTP failures (including the observed HTTP 429 / curl 56 response). Exhausted requests remain unverified and fail review; cached/index quantities cannot replace official inventory.
