# Review of the six WAGO/INA237 ECO placement advisories

The CLI heuristic connects each port to the nearest same-net port and compares straight lines with component centrelines. These lines are not the finished multilayer route. Fresh placement DRC reports **zero errors and zero warnings**, with six orientation suggestions retained in `checks/placement-raw.log` and the committed regression fixture.

| Part | Reason for retaining the orientation | Native evidence |
|---|---|---|
| C26 | DRV8462 VMOTOR bypass follows its explicit U7.21 power path. | Same-side bypass 2.6982 mm, below 5 mm; native bypass and connectivity checks pass. |
| C80 | ADS1115 supply bypass follows its explicit U30.8 power path. | Same-side bypass 3.9594 mm, below 5 mm; native bypass and connectivity checks pass. |
| R139 | 1 kΩ series BOOTSEL resistor between FLASH_CS_N and BOOTSEL_N, not a power bypass. | Exact source boot contract, native pin/net parity and zero opens verify the two separate routed nets. |
| R64 | Upper 430 kΩ OVP-divider resistor retains its original placement and VMOTOR/MOTOR_OVP_SENSE pin order. Moving nearby R65/U14 changes the nearest-port heuristic. | Source power audit checks divider values/thresholds; native parity, clearance and connectivity pass. No new reference-net or power bypass assumption is made. |
| R65 | Middle 20 kΩ OVP-divider resistor moved clear of the taller J2 terminal body; its two pads remain MOTOR_OVP_SENSE and MOTOR_OVP_LOW. | The affected native routes were regenerated. Fresh refilled DRC and schematic parity show no short, clearance or open-net finding on either divider net. |
| C83 | Nonpolar 10 nF PHASE_A_ADC-to-GND signal filter moved clear of the J2 terminal. It is not the U31 supply bypass; C81 retains that function. | Exact source filter connectivity and native parity/open-net checks pass. U31/C81 remains independently checked by the native bypass gate. |

C41 no longer receives an orientation suggestion after the U14 relocation. Its regenerated same-side U14.5 bypass measures **1.8112 mm**, below 5 mm.

The checker accepts only this exact nine-part list, zero placement errors/warnings, the current native geometry and fresh hash-bound DRC. The regression rejects unknown suggestions and changed counts. Raw native DRC retains the eight user-deferred J1/J10 hole-clearance errors and 475 cosmetic warnings; there are zero other errors, unconnected or parity findings. ERC is checked separately. This CAD review does not qualify analog noise, thermal performance or powered operation.

Historical STM32 ECO restoration is regression-tested against the exact main `1c22abf` fixture. It is not applied to the replaced RP2040 geometry. Current independent protection checks and the complete routing fingerprint remain mandatory.

## DATA-only ECO, 2026-11-05

The CLI reports ten bounding-box intersections around C22/C23. Both parts have explicit circumscribed 64-segment round courtyards (minimum radius 8.5 mm including body tolerance/assembly allowance). The placement checker now intersects the actual compiled polygons and rejects any real overlap; native courtyard/clearance DRC remains independently required. The raw CLI findings are retained. This is not permission to shrink the capacitor body to its pads.

Nine nearest-port orientation advisories remain: C26, C83, R139, R140, R141, R144, R64, R65 and R73. R73 is the unchanged reset pull-up; adding U41/C113 changes its nearest same-rail counterpart, not its pin mapping or required reset connection. Changing the encoder/I2C rail changes the CLI's nearest counterpart; this heuristic does not inspect actual routed copper. Accept only alongside checked native connectivity/DRC and preserved local bypass/Kelvin routes.
