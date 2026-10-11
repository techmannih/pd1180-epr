# Motor, board and cable assembly

The default 3D view and `motor-assembly.circuit.tsx` now show the ordered 34HS31-6004S1, existing adapter/post/PCB-fastener proposal, J2 motor mating harness, J3 brake mate, J7 industrial mate and two USB cable access gauges. This is a **nominal fit proposal**, not an approved mechanical kit, cable cut-length drawing or powered test result.

## What is connected in the model

| Connection | Assembly shown | Evidence / boundary |
|---|---|---|
| Motor → J2 | Four factory lead ends → insulated splice envelopes → black/green/red/blue pigtails → VHR-4N → B4P-VH | Wire exits follow compiled physical cavity positions. The pin/net/colour map remains in `motor-harness.md`. |
| J3 → external brake | VHR-2N and two outgoing conductors | The remote resistor, heatsink and attachment depend on the unqualified brake/load requirement; they are not invented in this model. |
| J7 → industrial equipment | PHDR-20VS and twenty outgoing conductors | Remote equipment is outside the assembly. Use numbered cavities from `connector-harnesses.md`; gray rendering does not specify wire identification. |
| J1 / J10 → USB cables | Two separate straight plug and cable access gauges | Generic 12 × 6 mm overmold envelopes; not a purchased cable, certification or proof of EPR capability. Select actual POWER/DATA cables within the checked space. |
| PCB → motor | Existing plate, four long posts, four PCB standoffs and four maximum screw-head envelopes | Front-flange support is a proposal. Rear motor case screws are not mounting authorization. |

VHR and PHDR housings use dimensions from the [JST VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) and [JST PHD catalogue](https://www.jst-mfg.com/product/pdf/eng/ePHD.pdf). They are simplified catalogue envelopes, not molded-production CAD: contact/latch details and release-tool access require the final parts. No alternative connector or extra PCB header is added.

The motor STEP already includes a shortened cable and four bare ends. Their measured end-face centres anchor the visible splices; the STEP has no wire colours, so assigning colours to those four geometric tips is illustrative. **Use the manufacturer's winding colours and continuity measurements**, never the order of the monochrome CAD tips. The factory cable is 1 m; the render does not authorize cutting it to the shortened CAD length.

The visible motor loop stays outside the motor/PCB gap. Splices are deliberately spread apart; their 28 × Ø5 mm envelopes reserve insulation space rather than assert exact TE dimensions. Final pigtail length, insulation bend limit, splice tooling and excess-cable retention must be set for the actual fixture.

## Assembly order

1. Approve the front-flange adapter's shared machine mount, tolerances and fastener/thread engagement. The modeled orange heads reserve maximum head/washer space; they are not a released screw specification.
2. Mount the plate and standoffs, then the PCB. Keep the defined 10 mm nominal motor-rear-to-PCB-bottom gap; protect exposed underside conductors from the conductive plate.
3. Make the motor harness using the exact housing, contacts and conductor sizes in `motor-harness.md`. Continuity-test each winding/cavity and inspect/pull-test the crimps before insertion.
4. Plug J2 from above, with the latch accessible. Anchor the loom to a qualified clamp on the fixture before allowing cable tension. **The clamp/attachment is still to be selected; the loose loop is not strain relief.** Do not force the factory cable into the narrow PCB/motor gap.
5. Attach the required brake and industrial harnesses using the cavity tables. Route brake power and low-level control/bus wiring separately and implement the required remote bus termination.
6. Connect DATA and qualified PD POWER cables to their separately marked ports. Follow the staged programming and commissioning procedure; never connect/disconnect the motor while energized.

## Checks and remaining limits

`harness-assembly-check.json` screens all five mated/access bodies and 674 insulated cable segments against the actual exported component bounds, screw-head envelopes, motor-body envelope, adapter plate and support posts. Intentional contact with each cable's own header is excluded. The exported harness vertices are separately checked against the generated CAD so a misplaced or reflected assembly cannot pass from a plausible screenshot.

Different-conductor wire separation is also screened; the minimum nominal gap is approximately 0.50 mm. These checks do not qualify molded latch details, cable-to-cable wear, minimum bend radii, tool/finger access, tolerances, crimp quality, thermal behavior or strain relief. The motor and adapter remain the same locked models; the PCB, schematic, routing and manufactured drill pattern are unchanged by this assembly addition.

U18/C52/C53 remain centered bottom-side `doNotPlace`. No rear magnet or holder is shown because this single-shaft motor has no confirmed rear rotating attachment. A centered optional footprint does not make the encoder operational. Mechanical approval and the existing powered/programming/order holds remain open.
