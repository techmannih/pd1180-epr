# U16 footprint and CAD

U16 remains ST STM32G0B1CBT6, LQFP-48 (7 × 7 mm body), JLCPCB C2847904. The user-selected native footprint is:

`qfn48_pillpads_h10.2mm_pw0.27mm_pl1.5mm_pin1location(bottomside,left)`

`qfn48` selects the pad generator, not the physical package. An explicit EasyEDA C2847904 LQFP OBJ is retained; the generic generator must not substitute a QFN body. The community JavaScript component and React-global workaround are removed. Pin aliases, power metadata and the schematic remain unchanged. The native footprint supplies the U16 reference; no detached label is added.

## Geometry

The generated pattern has 48 rounded lands, 0.27 × 1.50 mm, at 0.50 mm pitch. Row centre lines are at ±4.25 mm and the copper's overall span is 10.00 mm. Pin 1 is bottom-left, followed by pins 2–12 along the bottom edge. Comparison against the previous imported lands checks every pin, not just the bounding box. Original EasyEDA coordinate rounding is below 0.0001 mm per axis.

[ST DS13560 Rev 6](https://www.st.com/resource/en/datasheet/stm32g0b1cb.pdf), table 85 and figure 44, specify LQFP-48 and show an example with 0.30 × 1.20 mm lands, the same pitch and row centres, and a 9.70 mm outer span. The selected pattern is therefore not an exact copy of ST's example. Solder-joint/process acceptance remains an assembler review item; a generated footprint or successful DRC does not establish it.

## CAD evidence

The retained [EasyEDA C2847904 model](https://modelcdn.tscircuit.com/easyeda_models/download?uuid=a4b96ad857dc48c08dab3d0efdf20aec&pn=C2847904) was fetched and rendered. Its OBJ envelope measures approximately 9.006 × 9.006 × 1.449 mm, including the leads, with no model scale or orientation change. See `previews/u16/footprinter-lqfp-3d.png` and `previews/u16/footprinter-pcb.svg`.

Exact-component stock remains independent of the CAD library. Consult the refreshed `stock-report.json`; local CAD does not reserve or procure C2847904. Firmware programming and hardware qualification remain open as described in `completion-handoff.md`.
