# Review of the four RP2040 placement advisories

The CLI heuristic connects ports to the nearest same-net port and compares straight lines with component centrelines. Those lines do not represent finished multilayer copper. Fresh placement DRC reports **zero errors and zero warnings**, with four orientation suggestions retained separately in `checks/placement-raw.log`.

| Part | Reason for retaining the current orientation | Native evidence |
|---|---|---|
| C26 | DRV8462 VMOTOR bypass, pin 1 on VMOTOR and pin 2 on GND; the orientation follows its explicit U7.21 power path. | Native same-side bypass length 2.6982 mm, below 5 mm; source endpoint/layer and native connectivity checks pass. |
| C41 | U14 brake/OVP supply bypass follows the explicit U14.5 top-layer connection. | Same-side power path 3.1323 mm, below 5 mm; native DRC/connectivity pass. |
| C80 | ADS1115 U30 supply bypass follows its U30.8 top-layer connection. | Same-side power path 3.9594 mm, below 5 mm; native DRC/connectivity pass. |
| R139 | The 1 kΩ BOOTSEL resistor separates FLASH_CS_N from the service pad BOOTSEL_N. This is a series boot strap, not a power bypass. Rotating it to optimize a straight nearest-port line is not required for its actual two-net routed connection. | Both distinct nets, 1 kΩ series isolation and RP2040 boot contract checked against compiled source; matched native connectivity and zero parity/open findings. |

The checker accepts only this exact list, zero placement errors/warnings, the current reviewed native geometry and fresh hash-bound DRC. It does not skip unknown advice or geometry changes. Native DRC retains exactly eight requested J1/J10 hole-clearance errors and 434 cosmetic warnings; there are zero other errors, unconnected or parity findings. ERC is checked separately. This is CAD review, not USB timing, thermal or powered validation.

Historical STM32 ECO restoration is regression-tested against the exact main `1c22abf` fixture. It is not applied to the intentionally replaced RP2040 geometry. Current SBU/independent protection checks and the complete geometry fingerprint are separate mandatory checks.
