# Review of the three orientation advisories

The CLI's placement heuristic connects each port to the nearest same-net port and tests straight lines against the component centreline. It does not trace the finished multilayer copper. Its three suggestions are retained in `checks/placement-raw.log`; this review does not change component orientation or suppress native DRC.

| Part | Physical reason for retaining orientation | Regression evidence |
|---|---|---|
| C23 | Polarized VMOTOR bulk capacitor: pin 1 at (127.100005,82.5) is VMOTOR; pin 2 is GND. It has existing B.Cu/In2.Cu power routing and reviewed pours. Rotating it requires rerouting power/polarity, not a cosmetic fix. | Unchanged pad polarity and native copper; power-routing and zero-unconnected DRC. |
| R56 | RUN_BASE pull-down sits between its actual top-layer base route and GND. Nearest-port lines do not represent the routed branch to Q14. | Native pad/net, placement and branch geometry preserved; zero-unconnected DRC. |
| C41 | U14.5 has a direct top-layer bypass path to C41.1 and a short ground branch/stitch at C41.2. Reversing the capacitor lengthens that local supply connection. | Native decoupling checker requires an actual same-side copper path ≤5 mm; unchanged ground branch and native DRC. |

`check-placement.mjs` accepts only these exact three advisories with zero placement errors/warnings and a fresh native report with zero unconnected/parity issues and only the exact 405 retained native-reference findings. `native-eco-policy.mjs` protects every unrelated footprint/pad/track/zone outline against integrated main commit 97ea91e, including these branches. Focused negative tests reject changed advice, new errors, a narrowed C23 route, moved mounting hole and wrong U1 net. Electrical DRC, connectivity, parity and ERC remain blocking checks. The retained cosmetic findings and physical fabrication acceptance remain separately documented. New placement/copper changes require a new physical review. No powered or thermal measurement is inferred.
