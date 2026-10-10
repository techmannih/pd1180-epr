# Bare QSH8618-96 motor assembly

The user selected the **bare QSH8618-96** on 2026-10-11. The supplied `QSH8618-96_STEP.step` is preserved as `engineering/mechanical/QSH8618-96.step`, SHA-256 `3884aa3811c2fac5b409e7dbb8d588325d0def3b163c96486b6738f05efa3986`. The ordered motor suffix and rear geometry must match this file.

**This motor does not have the four rear PCB mounting threads shown in the PD86-1180 assembly.** The PCB holes still match the TMCM/PD86 reference pattern, but that does not establish a direct fit to this bare motor. Do not drill the motor, use its side grooves as screw holes, or remove its case tie bolts.

Open `motor-assembly.circuit.tsx` for the exact motor and PCB with an adapter/encoder proposal. It uses `assembly.subassembly` with the supplied STEP converted to GLB; it does not substitute a NEMA 23 primitive. Orange cylinders represent the maximum screw-head/washer envelopes. Custom adapter parts are **proposals, not fabrication-released hardware**.

![Bare motor assembly proposal](../previews/motor-assembly-corrected.png)

![Rear-face clearance, side view](../previews/motor-assembly-side.png)

The exported assembly is checked for the PCB/motor axis mapping and the 9.5 mm minimum axial gap. `release/qsh8618-assembly-proposal.zip` contains the same assembly as an offline GLB.

## PCB screw clearance

Q12, Q13, R97, C5, R2 and SW1 were repositioned on top. Q13 moved with Q12 to preserve their courtyard clearance. The local gate traces and drain thermal vias moved with the MOSFETs; affected connections were rerouted. The four mounting holes, schematic and netlist remain unchanged.

The component-mesh screen uses an 8 mm maximum head/washer diameter and 3.5 mm height above the PCB, with at least 0.5 mm nominal component clearance. Latest exact results are in `docs/motor-assembly-check.json`.

| Hole | Nearest fitted component | Nominal head clearance |
|---|---|---:|
| H1 | Q12 | 0.79 mm |
| H2 | C22 | 1.09 mm |
| H3 | R2 | 0.88 mm |
| H4 | SW1 | 1.38 mm |

These are imported CAD-body clearances, not a tolerance study. Use M4 hardware whose **complete head and washer remain within Ø8 mm**. A larger washer is outside this check. Check assembly tolerances and tool access before mechanical release.

## Proposed adapter

The supplied motor CAD has four Ø5.5 mm holes at `(±34.79, ±34.79)` mm in its front flange. Four support posts run from the flange's rear face to a separate plate behind the motor. This avoids inventing rear threads or modifying the motor case.

| Item | Nominal proposal |
|---|---|
| Support posts | Four, Ø8 mm × 88 mm; M5 fastening interfaces |
| Rear plate | 85.9 × 85.9 × 3 mm, 6061-T6 aluminum; Ø20 mm center aperture |
| Motor-to-plate gap | 0.5 mm |
| PCB standoffs | Four, M4, Ø8 mm × 6 mm |
| PCB bottom above motor rear | 0.5 + 3 + 6 = **9.5 mm** |
| PCB hole pattern carried by plate | H1 `(38.4,−24.5)`, H2 `(24.5,38.4)`, H3 `(−38.4,24.5)`, H4 `(−24.5,−38.4)` mm |
| Plate clearance holes | Ø5.5 mm at motor posts; Ø4.5 mm at PCB standoffs |

The mesh screen finds approximately **1.67 mm** minimum nominal clearance between the proposed long posts and the motor case. The exact transform is STEP shaft axis X → assembly vertical Z, STEP Y/Z → PCB X/Y, with the motor rear face at PCB Z = −10.3 mm. PCB mid-plane is Z = 0.

The posts share the motor's **front machine-mounting interface**. The machine bracket, bolt engagement, post-end design, tolerances, tightening torque, bending/vibration strength and heat transfer are not defined by the motor STEP. They require mechanical approval before fabrication. The GLB shows nominal envelopes, not detailed threads, an approved fastener kit or a load qualification.

## Top-side encoder proposal

U18 remains on top, centered on the shaft. In the supplied bare-motor CAD, the rear shaft end is recessed 3.5 mm from the rear case face. Its Ø3 mm × 5 mm central bore is visible; **the STEP does not establish an M3 thread**.

A proposed nonmagnetic PEEK extension holder locates on that bore with a Ø2.8 × 3 mm pilot and seats on the shaft end. Its outer diameter is 10.5 mm, inside the motor's Ø17 mm rear opening. It carries a diametrically magnetized Ø8 × 6 mm magnet in a Ø8.1 mm pocket with a 0.2 mm retainer and Ø6 mm retainer aperture. The solid stem below the magnet is 6.5 mm long. Bonding, tolerance, retention and speed limits require engineering qualification; no adhesive or supplier part has been approved.

- Magnet top to PCB bottom: **0.5 mm** nominal.
- Retainer to PCB bottom: **0.3 mm** nominal.
- PCB thickness: **1.6 mm**.
- Estimated magnet-to-sensor-die distance: `0.5 + 1.6 + 1.1 − 0.306 = 2.894 mm`, using nominal package dimensions. This is not a measured die position.
- Candidate magnet grade: N48SH. Final supplier must guarantee the AS5047P's required **35–70 mT** perpendicular field at the die's 1.1 mm sensing radius over the complete gap/temperature tolerance range. Dimensions and grade alone do not establish this.
- Preliminary concentricity target: ≤0.1 mm radial offset; axial runout target ≤0.05 mm. Validate field diagnostics and angular error at temperature and speed.

The stock PD86 magnet is not automatically suitable: its reference arrangement has the sensor on the underside, whereas this PCB intentionally keeps U18 on top. Do not enable closed-loop operation based on this CAD preview.

## Before mechanical release

1. Confirm the purchased bare-motor variant against the supplied rear-shaft CAD.
2. Approve use of the front machine-mount holes and finalize the bracket/post fasteners and tolerances.
3. Select a stocked magnet with guaranteed field data for the proposed stack.
4. Qualify holder retention, runout, spin/vibration, tool access and complete physical fit.

These mechanical gates are in addition to the existing PD-image, firmware and powered-test holds. They are not cleared by zero PCB DRC.

References: [ADI QSH8618](https://www.analog.com/en/products/qsh8618.html), [PD-1180 reference assembly](https://www.analog.com/media/en/technical-documentation/user-guides/pd-1180_hardware_manual_hw1.10_rev1.05.pdf), [AS5047P datasheet](https://look.ams-osram.com/m/d05ee39221f9857/original/AS5047P-DS000324.pdf), [tscircuit subassembly](https://docs.tscircuit.com/elements/assembly-subassembly).
