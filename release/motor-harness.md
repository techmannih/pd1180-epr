# Motor hookup and encoder review

Compared against Rishabh's [NEMA17 v1.0.42](https://tscircuit.com/imrishabh18/rp2040-motor-controller?version=1.0.42) and [NEMA23 v1.3.2](https://tscircuit.com/imrishabh18/nema-23-stepper-controller?version=1.3.2). Retrieved source hashes and the checked pin map are in [motor-harness.json](motor-harness.json).

| Review item | Implementation |
|---|---|
| Small centered bottom encoder, DNP | Retain AS5047P U18 at the motor axis `(0,0)` on bottom. U18/C52/C53 are `doNotPlace`; no fitted BOM/CPL or paste. R74 remains fitted on top to deselect the absent SPI device. |
| Reference motor connector | NEMA17 uses JST PH, 2 mm; NEMA23 uses JST XH, 2.5 mm. J2 already uses JST VH, 3.96 mm, appropriate for reviewing this higher-current motor. |
| A real connection to the motor | Specify the matching housing, contacts, pigtail and factory-cable splice below. A bare PCB header alone is not a complete cable assembly. |
| Explain J2 and J7 | J2 carries only the four winding leads. J7 and its external control circuits are removed; local SW2 START/STOP uses onboard STM32 control. |
| Extra connectors | J1 = EPR POWER; J10 = USB DATA; J3 = external regeneration resistor. SWD and encoder observation use service pads, not additional cable headers. |
| Assembly clearance | Check the complete J2 body and a conservative vertical mating/insertion prism against component envelopes. Final cable bend, strain relief and fixture access still require physical approval. |

## Motor cable to J2

The ordered **STEPPERONLINE 34HS31-6004S1** has a 1 m, four-core **0.75 mm²** factory cable with bare lead ends, not a supplied JST plug. Its manufacturer drawing A1510 rev 0 specifies the colours below. The square J2 PCB pad is pin 1. Identify the mating housing cavities from the JST drawing; the view into the plug is mirrored relative to the solder-side PCB view.

| J2 cavity | Board net | Motor winding | Factory wire |
|---:|---|---|---|
| 1 | MOTOR_A1_OUT | A+ | Black |
| 2 | MOTOR_A2 | A− | Green |
| 3 | MOTOR_B1_OUT | B+ | Red |
| 4 | MOTOR_B2 | B− | Blue |

The connection is **motor factory cable → four insulated permanent splices → 16 AWG pigtail → crimp contacts in VHR-4N → top-entry J2**. This adds no extra board connector.

| Harness item | Quantity | Specification |
|---|---:|---|
| Mating housing | 1 | Genuine JST **VHR-4N** |
| Socket contact | 4 | JST **SVH-41T-P1.1**, for the 16 AWG pigtail; wire insulation OD 1.7–3.0 mm |
| Pigtail | 4 conductors | 16 AWG stranded copper, ≥105 °C and ≥250 V insulation, matching Black/Green/Red/Blue labels; maker confirms actual conductor/insulation fit to JST tooling |
| Insulated butt splice | 4 | TE **320559**, 0.3–1.42 mm² / 22–16 AWG; one factory conductor and one pigtail conductor per splice |
| Strain relief | 1 set | Unresolved after withdrawal of the unsupported fixture; qualify a real retention method before physical assembly. Connector solder joints must not carry cable tension |

JST's standard VH header rating is **10 A with 16 AWG wire**. That condition is why the specified pigtail uses 16 AWG. Do not claim 10 A for a direct crimp onto the motor's 0.75 mm² leads. A direct-crimp alternative would use the applicable contact range and would need its own current/temperature qualification. The connector rating does not raise the motor rating or qualify a driver current. The current conservative ceiling is 3.8 A RMS (3.781 A programmed nominal); the supplied motion-locked initial profile is about 0.827 A RMS. Neither setting has passed powered qualification. See the [JST VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) and [TE splice specification](https://www.te.com/en/product-320559.html).

The connector mates vertically from the populated side. Reserve 40 mm above the PCB at J2 for plugging and initial cable bend; route the loom outward around the motor, not through the PCB-to-motor gap. The catalogue mated connector height is 16.5 mm above the PCB. Revision B defines nominal 170/170/170/165 mm pigtail cuts and a 23.876 mm minimum bend radius; the harness maker must approve these on the first article; do not stretch the cable around a screw/post or across a sharp PCB edge.

Ask the harness maker to provide the completed cable as a separate line item. PCB assembly does not automatically include this cable, housing, contacts or motor. External harness inventory has not been reserved. Use the prescribed JST and TE tooling/application instructions, verify every cavity against the table, perform crimp pull tests and a continuity/shorts test, then label the finished cable. With power disconnected, black-to-green and red-to-blue must be the two winding pairs (nominal 0.48 Ω per phase at 25 °C, before cable/contact/test-lead resistance). Different phases and motor frame must be isolated. Never connect or disconnect J2 while the driver is energized.

## J7 after interface cleanup

J7, STEP/DIR/ENABLE/home/limit conditioning and their unused wires are removed. The STM32 now commands the TMC5160 internal SPI ramp from local SW2 START/STOP. The pre-existing protections remain; there is no external command harness. See [product correction](product-eco.md).

## Encoder boundary

Both reference boards leave the bottom sensor and two nearby capacitors unpopulated. This board now follows that assembly policy while retaining its existing SPI/ABI sensor interface. DNP means an optional, routed footprint, not an installed working encoder. All 252 fitted components and 19 service pads remain top-side.

The ordered motor is single-shaft. Its rear recess is not evidence of an accessible rotating shaft. A centered footprint does not create a magnet attachment: a compatible rear shaft/holder, diametric magnet, field strength and operating gap remain unresolved. Do not drill the motor, remove its case bolts or populate U18/C52/C53 on the assumption that the magnet will fit. Open-loop internal-ramp operation does not require this optional encoder; the supplied commissioning firmware remains motion-locked for the separately documented qualification reasons.

## Remaining assembly gates

The unsupported adapter, posts and fixture hardware have been removed. The existing four PCB holes remain unchanged. Rear thread/depth, fastening and cable retention are unverified; the model is an alignment preview. Motor electrical settings, TI PD programming, power/thermal/brake tests and pre-shipment motor-operation qualification remain in [power-validation.md](power-validation.md). No bench, crimp or physical-fit results are claimed by this review.
