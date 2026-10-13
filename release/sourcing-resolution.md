# Sourcing correction — 2026-10-13

Five boards need five of each IC/resistor and ten USB receptacles, before assembler attrition. [Catalog evidence](../sourcing/replacement-catalog-evidence.json) records exact public JLC identities and available-order quantities. Refresh the release stock report immediately before ordering; no inventory was purchased or reserved.

| Reference | Previous identity | Selected identity | Review |
|---|---|---|---|
| R64 | RT0603BRD07430KL / C861400 | **Viking AR03BTCX4303 / C2984356** | 430 kΩ, 0.1%, 25 ppm/°C, 100 mW, 75 V, 0603; unchanged OVP calculation and land pattern |
| U17 | W25Q32JVSSIQ / C179173 | **Winbond W25Q32JVSSIM / C6000508** | Same 32 Mbit, 2.7–3.6 V, industrial SOIC-8-208mil pinout; M/Q behavior reviewed below |
| J1/J10 | USB4105-GF-A / C3020560 | **GCT USB4105-GF-A-060 / C3025063** | Same contact positions, polarity and PCB land pattern; 48 V/5 A retained; shell stakes change from 0.95 to 0.60 mm |
| U16 | STM32G0B1CBT6 / C2847904 | **Retained; not resolved** | No stocked reviewed substitute found. C5270241, C5270267, C2978903 and C3029185 also returned zero available |
| U35 | TCA9538PWR / C2652286 | **Retained; not resolved** | NXP C2652289 unavailable; TI C201530 rejected for the reset-rail issue below |

[Viking AR datasheet, rev F6](https://www.viking.com.tw/Templates/att/AR_Series%20Data%20Sheet%20%28Edition%20REV.F6%29.pdf?lng=en): `03` is 0603, `B` is 0.1%, `C` is 25 ppm/°C, `X` is the 1/10 W option, `4303` is 430 kΩ. Its 75 V limit and temperature range cover the existing resistor screen. This substitution does not change brake/OVP thresholds or approve higher bus voltage.

[Winbond's M/Q explanation](https://www.winbond.com/hq/support/faq/technical/?__locale=en) and the [W25Q32JV manufacturer datasheet](https://datasheet.lcsc.com/datasheet/pdf/a0a57990083dbaa836cd5aa8d7b11749.pdf?productCode=C2999380) establish that M has programmable QE, initially zero, and different identification behavior. This board uses single SPI; pin 3 /WP and pin 7 /HOLD are tied to V3V3. Current motion/diagnostics firmware only releases FLASH_CS_N and does not depend on flash ID or stored settings. Future storage code must recognize the selected M part's ID and explicitly review status/QE handling; do not reuse an IQ-only ID check. First-article storage read/write is required before storage becomes a relied-on function. Only nine pieces were observed; assembler attrition may exceed that margin.

[GCT drawing USB4105, rev B4](https://gct.co/files/drawings/usb4105.pdf) shows a common PCB layout and the stake-length ordering option. Existing pad positions/nets and both CC paths are retained, including the doubled VBUS/GND lands. The -060 version is electrically selected; shorter stakes need reflow/joint and retention acceptance for this 1.6 mm board. The existing generic-family 3D model conservatively shows 0.95 mm stakes and is explicitly not an exact mechanical-fit approval. No cable/load retention claim follows from the drawing. The -120 candidate had zero available-order quantity.

[TI PCA9538 §7.2.1.1](https://www.ti.com/lit/ds/symlink/pca9538.pdf) documents RESET-to-VCC backfeed when RESET exceeds VCC. Our STATUS_GPIO is driven from V3V3_MCU while U35 uses independently sequenced PD_3V3. Matching TSSOP pin numbers and address 0x70 do not solve this. **Do not fit PCA9538PWR / C201530 as a drop-in.** A supply/reset redesign would require its own review. The selected TCA9538 remains unchanged.

## Concrete procurement path for U16 and U35

Request the **exact two MPNs and packages**, five fitted pieces each **plus the assembler's required spares**, using JLC Global Sourcing/consignment or a provider that accepts traceable externally sourced components. [JLC's own-parts procedure](https://jlcpcb.com/help/article/how-to-use-my-own-parts-for-pcb-assembly-order) requires material in My Parts and explicit BOM matching. Record provider acceptance, source invoice/lot, accepted quantity and selected BOM line; a retail listing is not assembler allocation.

The unsent request lines are in [procurement-open-items.csv](../sourcing/procurement-open-items.csv). Engineering-review CI records these exact shortages and may pass; strict procurement and order approval remain blocked while these entries have no accepted inventory. If private inventory is later allocated, add a separately reviewed authenticated-evidence path to the stock checker; do not overwrite public API results or invent quantities. Nothing has been ordered or sent to a supplier.
