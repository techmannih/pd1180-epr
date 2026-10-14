# U35 stocked expander and reset revision

U35 is **TI PCA9538PWR / C201530**, PW / TSSOP-16. The previous TCA9538PWR was unavailable. This revision retains its 0.65 mm pitch, 0.34 × 1.73 mm capsule lands, 5.73 mm row spacing, placement, C95 placement and 0x70 address. The generator remains `dfn16_pillpads_p0.65mm_w7.46mm_pw0.34mm_pl1.73mm_pin1location(leftside,bottom)`; it describes lands, while the physical package is TSSOP-16.

The [TI PCA9538 datasheet](https://www.ti.com/lit/ds/symlink/pca9538.pdf) verifies the PW pin map and base I2C register behavior. TI's example land pattern uses 0.45 × 1.50 mm lands and 5.8 mm row spacing. The retained supplier-style geometry requires assembler stencil/solder-joint acceptance.

PCA9538 is **not a drop-in on the former reset wiring**. U37 SN74LVC1G17DBVR translates the PC13 reset level into PD_3V3, with R132 input and R137 output pulldowns plus C99 bypassing. See [indicator power/reset review](indicators.md) for the erratum, electrical limits and qualification cases. The base register map, RGB/buzzer port assignments and firmware reset polarity are retained; unused INT remains open.

Its explicit supplier model uses C201530 and EasyEDA UUID `534f03d8fe164fbab551f91e5a792e30`, the same TSSOP body as the former part, with the retained 90° transform. Provenance: [JLCEDA/EasyEDA Official Library](https://easyeda.com), [JLCEDA](https://lceda.cn/).

Stock is verified independently in `stock-report.json`; inventory is not reserved. First-article reset silence, independent rail sequencing and brownout remain measured acceptance items.

The final two-mesh DC copper screen records the effect of the new reset-network via antipads. Five motor paths are unchanged at the 0.05 mm mesh. MOTOR_B2 rises from 6.7556 to 7.1207 mΩ (+5.40%); at the screen's 5.5 A comparison current this adds about 2.0 mV and 0.011 W. These are model estimates, not measured temperature or a continuous-current rating. All native motor connections remain intact; thermal qualification stays open. See `engineering/filled-copper-review.json` for assumptions and convergence.
