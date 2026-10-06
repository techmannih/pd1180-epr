# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Verification summary

The committed source, generated previews, routed KiCad board and manufacturing package were checked together on 2026-10-06.

| Check | Result |
|---|---|
| TypeScript typecheck | PASS |
| tscircuit preview build | PASS |
| Topology tests | PASS — 11 tests, 518 assertions |
| Netlist | PASS — 0 errors, 0 warnings |
| Schematic placement | PASS |
| PCB placement | PASS |
| Routing-difficulty precheck | PASS |
| Decoupling | PASS — 32/32 targets |
| Assembly side | PASS — 251/251 populated parts on top |
| Local critical copper | PASS — 8/8 checks |
| tscircuit shorts check | PASS |
| KiCad PCB DRC | PASS — 0 violations, 0 unconnected items |
| Live stock snapshot | PASS — 67/67 unique LCSC codes available |
| Alternative-parts check | PASS — 11/11 reviewed alternatives available |

`bun run verify --routed` reproduces the source and routed-board checks. Detailed logs are written to `docs/checks/`, the KiCad DRC record is in `dist/manufacturing/kicad-drc.json`, and the route statistics are in `docs/routing-report.json`.

The KiCad rules use 0.09 mm minimum copper clearance, 0.40 mm minimum via diameter and 0.20 mm minimum drill. Generated footprint-library-link and automatic silkscreen clipping checks are ignored; copper shorts, clearances, drills, annular rings, connectivity and board geometry remain enabled. The routed board passes those enabled manufacturing rules with no findings.

Hardware release still requires the TI TPS26750 configuration image, motor firmware, brake-resistor sizing, magnet/mechanical confirmation, and bench thermal/EMC validation. These physical gates are tracked in `release-status.json`.
