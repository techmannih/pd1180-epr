# PD1180-EPR reviewer checklist

Start with `bun install --frozen-lockfile` and run `bun run review`. Machine checks produce evidence under `docs/`, `routing/` and `release/`; this checklist focuses reviewer time on design decisions and physical risks.

## Requirements and mechanics

- [ ] Product revision, motor model, phase-current target and USB-C PD contract match `hardware-contract.json`.
- [ ] Board outline matches the TMCM-1180 V1.1 stepped 85.9 × 85.9 mm perimeter and all four 4.2 mm mounting holes match the documented asymmetric coordinates.
- [ ] Shaft axis, magnet gap, motor rear-face hardware, standoffs, cable exits and enclosure height have physical drawings or measurements.
- [ ] All fitted parts and service pads are on top; bypass capacitors surround their ICs and the encoder remains centered. Validate the revised encoder-to-magnet gap.
- [ ] Tall bulk capacitors, connectors, brake resistor/heatsink, cable and motor are covered by the mechanical/assembly boundary.

## Schematic

- [ ] `bun run check:schematic-style` reports zero issues and `docs/checks/schematic-style.json` records zero issues for every viewer analysis category.
- [ ] All 13 A4 sheets have a clear function, rail names, connector pin numbers and readable signal flow.
- [ ] Imported pin numbering is checked against manufacturer drawings for USB-C, TPS26750, TPD4S480, TPS26631, TMC5160A, MOSFETs, shunts and connectors.
- [ ] `docs/usb-pd-architecture.md` matches the compiled netlist: J1 carries EPR CC/VBUS, J10 carries USB 2.0 D+/D− with independent CC pulldowns, and only J10 VBUS feeds the attach divider. U22 retains motor-bus brake backup.
- [ ] Reset defaults hold POWER_PERMIT, MCU_RUN and every external driver/output inactive.
- [ ] PD contract, power-good, voltage window and fault signals gate the motor stage independently of a normal firmware command.
- [ ] Every IC supply pin has local bypassing; bulk-capacitance, discharge and reverse-feed paths are explained.
- [ ] Unused pins, shields, exposed pads, test points and external termination requirements are explicit.

## Power, protection and thermal

- [ ] Input/eFuse UVLO, OVP, inrush and current-limit calculations include tolerance and startup state.
- [ ] TPS26631 `IIN_MON` and the independent VMOTOR divider reach separate STM32 ADC inputs; phase-current regulation remains on the TMC5160A shunt inputs.
- [ ] Phase-current programming, RMS/peak convention, shunt dissipation and current-sense polarity are consistent.
- [ ] Regeneration energy, 60 V driver margin and external brake resistor/heatsink pulse/average ratings are reviewed for the actual load.
- [ ] Connector, cable, via and copper current ratings are checked at enclosure temperature.
- [ ] USB detach, hard reset, cable fault, 3.3 V collapse and residual VMOTOR energy all lead to a safe state.

## Placement and routing

- [ ] Protection parts sit at the connector and high-current/charge-pump/bootstrap loops are compact.
- [ ] Shunt sense connections are Kelvin-routed and cannot be bypassed by load copper.
- [ ] Critical power nets meet the 2.4 mm corridor, 0.16 mm clearance and parallel-via policy.
- [ ] Ordinary vias follow the reviewed 0.60/0.30 or 0.45/0.20 mm pairs; only the documented sixteen 0.40/0.20 mm filled/capped dense-signal exceptions remain.
- [ ] Q4, Q6–Q13 and Q16 each retain exactly four 0.60/0.30 mm drain-pad thermal vias (40 total), with epoxy-filled and copper-capped via-in-pad processing in the quote.
- [ ] Ground continuity, return paths, thermal-pad stitching, plane necks and copper-to-edge clearance are visually inspected.
- [ ] USB D+/D− routing has a continuous reference path and the fabricator stack-up/impedance target is reviewed.
- [ ] Product/revision, connector function, polarity/pin 1 and `Made with tscircuit` markings are readable and clear of pads/holes.

## Sourcing and assembly

- [ ] BOM manufacturer part number, package, polarity and exact LCSC code match each imported footprint.
- [ ] Live stock is refreshed immediately before ordering; timestamped evidence is availability information, not a reservation.
- [ ] Alternatives are checked for pinout, voltage/current/temperature rating, package, lifecycle and firmware impact.
- [ ] JLC placement preview is manually reviewed for IC pin 1, diode/capacitor polarity, connector orientation, rotations and centroids.
- [ ] Filled/capped via-in-pad, four layers, 1 oz copper, 1.6 mm thickness and top-side assembly are present in the quote.

## Delivery and bring-up

- [ ] Verify the corrected STEP/DIR pin configuration at U7 pins 23–25 against the routed board; see `step-dir-hardware-review.md`. A clean geometric DRC does not validate mode-dependent pin functions.

- [ ] `bun run review` passes and `release/delivery-manifest.json` matches the exact release files.
- [ ] Gerber, drill, BOM, CPL, KiCad, schematic, 3D, firmware contract and SHA-256 files open successfully.
- [ ] Prototype-order gates and system-validation gates are reported separately.
- [ ] TPS26750 full-flash image and STM32 firmware hashes are recorded before powered motor testing.
- [ ] Bring-up begins current-limited without a motor, then validates rails, PD negotiation, protection, brake, gate drive, current regulation and thermal rise in stages.
- [ ] Production status remains blocked until mechanical fit, programmed operation, thermal, fault, EMC/ESD and load testing have recorded evidence.

Reviewer sign-off should record board revision, commit, release hashes, open risks and the exact evidence used. Do not sign off from screenshots alone.
