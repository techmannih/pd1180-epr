# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Routing release

The final KiCad board is generated from the verified connectivity route and reinforced by `scripts/reinforce-power-copper.py`. Dense package exits retain short neck-down traces; each critical routed segment receives a nominal 2.4 mm clearance-aware copper corridor, and layer transitions receive parallel 0.6/0.3 mm vias where geometry permits.

Isolated corridor polygons and slivers are removed after native fill/DRC. The original routed trace remains at each omitted location; current per-net coverage is recorded by `bun run check:power-routing` in `docs/power-routing-check.json`.

`bun run check:power-routing` checks corridor coverage, zone clearance, layer changes, via counts and the 1 oz IPC-2221 screening estimate. KiCad DRC remains the final geometric check.

## Filled-copper and USB follow-up

The MOTOR_A1 path from Q7 to R115 has a parallel B.Cu corridor tied through four existing drain-pad thermal vias and four new 0.60/0.30 mm transfer vias beside R115. Its F.Cu landing is 2.4 mm wide before clearance clipping. Terminal-only Kelvin checks remain mandatory. Filled-copper resistance screening and its assumptions are recorded in `engineering/filled-copper-review.json`; these estimates do not qualify temperature rise.

R71 now sits beside R72 on the top side. USB trunks use B.Cu over a local In2 GND region, with standard 0.50/0.30 mm return-stitching vias at the transitions. Five low-speed signals formerly crossing that region use other layers. `check-usb-reference.py` samples the actual filled reference plane every 0.05 mm along the four bottom trunks, excluding only signal-via antipads, and records nearby return vias. The portable checker binds this native report to the final PCB and checker hashes. The old route fails this check. The short top fanouts, final stack-up/impedance and USB electrical compliance still require review/measurement; a geometric pass does not replace an eye diagram.
