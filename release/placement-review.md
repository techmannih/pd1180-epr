# Placement review: DRV8262DDVR and stocked components

The fresh placement DRC reports **zero errors and zero warnings**. Its separate heuristic draws straight connections to the nearest same-net port; it does not follow the completed multilayer copper. The nine orientation suggestions below are retained in `checks/placement-raw.log` and the committed regression fixture.

| Part | Reason for retaining the orientation | Independent evidence |
|---|---|---|
| C26 | VMOTOR bypass follows the existing explicit U7.21 power path. | Native same-side bypass path is under 5 mm; connectivity and clearance pass. |
| C83 | Nonpolar PHASE_A_ADC filter; C81 provides U31 supply bypass. | Native filter net/pad parity and connectivity pass; C81 bypass is separately checked. |
| R35 | DRV_FAULT_N_BOARD pull-up to V3V3, not a power bypass. Replacing U7 changes the nearest same-net endpoint. | Both pad nets match source; native routing, clearance and zero opens are verified. |
| R139 | BOOTSEL series resistor between FLASH_CS_N and BOOTSEL_N. | Source boot contract and native pin/net parity preserve the two distinct nets. |
| R140, R141 | Encoder/I²C pull-up placement is retained with the switched DATA-domain sensor rail. | Source rail contract, native clearance and connectivity pass. |
| R64, R65 | OVP-divider pin order and established routing are retained. | Divider thresholds are independently audited; native parity and clearance pass. |
| R73 | Reset pull-up; its nearest same-rail counterpart changes when components are added. | Reset-domain source contract and native pin/net connectivity pass. |

R144 no longer receives a suggestion after its relocation for the DAC LDAC pull-up. No component is rotated merely to optimize the straight-line heuristic. These checks do not establish analog noise or powered performance.

The ten reported courtyard intersections are axis-aligned bounding-box intersections around C22/C23. Both capacitors have explicit circumscribed 64-segment round courtyards, with a minimum 8.5 mm radius including body tolerance and assembly allowance. The checker intersects the actual compiled polygons and rejects real overlap. Native courtyard/clearance DRC is also required; the capacitor bodies are not reduced to their pad envelopes.

The regression accepts only this exact nine-part list, zero placement errors/warnings, checked polygon intersections and the current hash-bound native route. Unknown suggestions, real courtyard intersections and changed counts fail. Raw native DRC retains eight J1/J10 hole-clearance errors and 488 cosmetic warnings; other errors, unconnected items, schematic parity and ERC findings are zero. Manufacturing disposition remains separate.

Historical STM32 ECO restoration is regression-tested against the exact main `1c22abf` fixture. It is not applied to the replaced RP2040 geometry. Current independent protection checks and the complete routing fingerprint remain mandatory.
