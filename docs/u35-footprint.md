# U35 footprint and CAD

U35 remains Texas Instruments TCA9538PWR, PW / TSSOP-16 (5.0 × 4.4 mm nominal body), JLCPCB C2652286. The selected native footprint is:

`dfn16_pillpads_p0.65mm_w7.46mm_pw0.34mm_pl1.73mm_pin1location(leftside,bottom)`

`dfn16` selects the pad generator, not the physical package. The explicit C2652286 EasyEDA TSSOP OBJ/STEP and its existing 90° rotation are retained. Pin aliases, supplies, reset, I²C, indicator connections and schematic coordinates are unchanged. The footprint generates its own U35 reference.

## Geometry and local clearance

The 16 capsule lands are 0.34 × 1.73 mm at 0.65 mm pitch, with row centres ±2.865 mm and 7.46 mm outer copper span. Pins 1–8 run left to right on the bottom row and 16–9 on the top row in the source coordinate system. Compared with the previous supplier import, maximum pad-centre change is 0.000755 mm per axis; pad width decreases by 0.0030016 mm and length by 0.0014926 mm.

The generator's 5.8 × 8.0 mm courtyard initially overlapped the C95 bypass courtyard by 0.03 mm. C95 moves 0.05 mm left, from (31.9, −22.8) to (31.85, −22.8), leaving 0.02 mm between courtyards. Its original routing endpoints remain within the moved pads; the native connectivity and bypass-path checks must pass. No mounting holes or unrelated components move.

[TI TCA9538 datasheet](https://www.ti.com/lit/ds/symlink/tca9538.pdf), PW0016A example board layout, shows 0.45 × 1.50 mm lands and 5.8 mm between row centres. The selected supplier-style pattern instead uses narrower, longer lands and 5.73 mm between row centres. It is not an exact copy of TI's example; assembler solder-joint and stencil acceptance remain required.

## Model and sourcing

The [C2652286 OBJ](https://modelcdn.tscircuit.com/easyeda_models/assets/C2652286.obj?uuid=534f03d8fe164fbab551f91e5a792e30) was downloaded and rendered. Before the retained transform it measures 6.40558 × 5.0 × 1.049205 mm including leads. The corresponding [STEP](https://modelcdn.tscircuit.com/easyeda_models/assets/C2652286.step?uuid=534f03d8fe164fbab551f91e5a792e30) remains assigned. See `previews/u35/footprinter-tssop-3d.png` and `engineering/u35-footprint-review.json`.

This footprint change does not resolve exact-part inventory. Consult `stock-report.json` for the timestamped official available-order quantity. Procurement and physical qualification remain separate open gates.
