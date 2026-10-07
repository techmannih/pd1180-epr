# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Routing release

The final KiCad board is generated from the verified connectivity route and reinforced by `scripts/reinforce-power-copper.py`. Dense package exits retain short neck-down traces; each critical routed segment receives a nominal 2.4 mm clearance-aware copper corridor, and layer transitions receive parallel 0.6/0.3 mm vias where geometry permits.

Seventeen deterministic corridor polygons are omitted where KiCad's clearance clipping would otherwise leave isolated copper or slivers. The original routed trace remains at each omitted location, and the final per-net corridor coverage remains 84.6–100% as checked by `bun run check:power-routing`.

`bun run check:power-routing` checks corridor coverage, zone clearance, layer changes, via counts and the 1 oz IPC-2221 screening estimate. KiCad DRC remains the final geometric check.
