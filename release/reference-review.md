# NEMA17 / NEMA23 comparison and reviewer response

**2026-10-11 — review remains open.** Compared the actual published source of NEMA17 **v1.0.42** and NEMA23 **v1.3.2** against controller baseline `0a53ace`. [Reference provenance and file hashes](../engineering/reference-comparison.json) pin the releases and retrieval URLs. Source-level comparison covered the board entrypoints, current/temperature circuits, status/alarm, encoder, power test access and PD control. It is not a certification of either reference board or this board.

The earlier `feature-parity` check covered ten functions already present on this board. It **did not establish complete parity** with the reference boards: RGB, buzzer, independent power LED and dedicated power probe pads were absent from that list. Its report now explicitly includes the comparison's open items and `reference_parity_complete: false`.

## Every reviewer line

| Reviewer request | Evidence-backed response now | What is still needed |
|---|---|---|
| Small encoder on bottom marked doNotPlace | U18 AS5047P and local C52/C53 are bottom DNP, excluded from fitted BOM/CPL and paste. R74 remains fitted top. See `assembly-check.json` and `native-decoupling-check.json`. | None for the optional footprint requirement; fitting and using it is a separate gate. |
| Use Rishabh's design as reference | Both exact reference releases were inspected; comparison below records retained functions and deliberate differences. | Close the newly found missing functions before saying reference parity is complete. |
| Perfectly centered; correct encoder arrangement | U18 package center is (0,0), on the motor axis. | The ordered single-shaft motor has no documented rear rotating-shaft interface. Magnet attachment, holder, field and working gap are unresolved; centering alone does not provide feedback. |
| Explain J7 / J2 and justify extra connectors | J2 is the winding connector. J7 combines the explicitly required industrial interfaces. J1/J10 provide separate POWER/DATA; J3 connects the retained regenerative brake resistor. No redundant SWD/encoder cable header remains. | Validate complete mating assemblies and external loads, not only the connector bodies. |
| Only specified interfaces | Current inventory is J1, J10, J2, J3, J7. CAN, RS485, RS232 and machine I/O remain by the user's requirement. | Define application protocols and OUT0/OUT1 load limits; hardware presence does not mean implemented firmware. |
| More assembly work; no way to connect motor | J2 is JST VH. VHR-4N housing, contacts, pigtails, splices and ordered-motor winding colours are specified. J2 insertion space is screened. | Build/inspect the actual harness, qualify strain relief and wire bends. Complete J3/J7 mating/tool access and the adapter fastening/tolerance study. |
| Carefully review and discover other issues | Missing visible/audible feedback, probe access, incomplete programming access and misleading scope claims are now recorded explicitly. Motor resistance temperature label corrected from 20 °C to the drawing's 25 °C. | Implement and reroute the diagnostics/test-access ECO; deliver the PD image and a real programming method; close the mechanical and powered gates. |
| Review paused | The open-items list is preserved; this document does not ask the reviewer to accept an “all updated” claim. | Send a revised review request only with specific completed changes and remaining limitations. |

## Functional comparison

| Function | NEMA17 / NEMA23 references | This NEMA34 controller / action |
|---|---|---|
| Separate power/data | Both separate motor PD and programming USB | Implemented J1/J10, with MCU-only DATA power and reverse blocking. |
| PD selection | 5–20 V GPIO selection / 5–28 V I2C selection | Deliberate fixed 48 V / 5 A EPR requirement. TPS26750 configuration image is missing; arbitrary lower-voltage motion is not supported. |
| Motor stage | DRV8825 / DRV8452 | Retain user-approved TMC5160A external bridges for this design target. Do not copy low-current shunts, connector ratings or thermal assumptions. |
| Winding connector | JST PH / JST XH | JST VH; exact mating cable now specified for the ordered bare-lead motor. |
| Actual phase telemetry | Two INA240 channels and separate inline shunts | Implemented, using 5 mΩ and 100 mV/A here. No copied calibration or claim of RMS/position measurement. |
| Board temperature | TMP102; software response / hardware interlock | TMP102 plus hardware inhibit and missing/stale-sensor firmware checks. Thermal correlation remains unmeasured. |
| RGB indication | Fitted RGB and transistor sinks | **Missing.** TP_STATUS is only a service pad. Need visible status circuitry and firmware states. |
| Audible alarm | Fitted buzzer and default-off driver | **Missing.** Add if selected; budget its current and keep fault protection independent of alarm software. |
| Independent power indication | Fitted logic-power LED | **Missing.** Useful for setup and distinguishing no power from a firmware fault. |
| PD / motor voltage probes | Labeled PD, VMOTOR, GND pads | **Missing.** Existing eleven pads cover SWD/status/ABI only. Dedicated guarded probe/fixture access is needed for commissioning. |
| Optional encoder | Centered bottom AS5600 plus two DNP caps | Centered bottom AS5047P plus two DNP caps already implemented; SPI retained. Ordered-motor magnetic attachment remains unresolved. |
| Boot/reset/debug | RP2040 BOOT/RUN, SWD, external flash | STM32 internal boot flash, SW1 reset and SWD/NRST recovery. No need to copy RP2040 UF2/BOOTSEL hardware. U17 is separate storage, not the MCU's boot flash. |
| PD programming | Config-pin/I2C PD controllers | TPS26750 requires a board-specific image in U3. Host PD I2C is distinct from EEPROM I2Cc. No dedicated I2Cc fixture pads or proven blank-board programming path exists. |
| Industrial buses | Not the basis of either reference design | Required additional hardware retained. CANopen/TMCL and RS485/RS232 application protocols are not in the commissioning firmware. |
| Mounting and thermal | Motor-specific holes, standoffs and thermal provision | Exact ordered-motor CAD/holes checked. Front-flange adapter remains a proposal; generic NEMA mounting assumptions cannot approve rear case screws. |
| Production files | Top assembly, DNP exclusion, named nets, routed checks | Implemented; retain 0.30 mm minimum drill, 58 filled/capped vias and fresh DRC/ERC after any ECO. |
| Motor firmware | Neither inspected release supplies executable motor firmware | Our binary runs USB diagnostics and keeps motion locked. Reference hardware is not evidence of ready-to-run firmware. |

Reference links: [NEMA17](https://tscircuit.com/imrishabh18/rp2040-motor-controller), [NEMA23](https://tscircuit.com/imrishabh18/nema-23-stepper-controller). Primary requirements for this board stay in `hardware-contract.json`.

## Concrete remaining work

1. **Diagnostics/test-access ECO:** decide RGB and buzzer scope, add independent power indication and PD/VMOTOR/GND probe access. All STM32 GPIOs are assigned; do not steal SWD, safety signals or industrial outputs. Evaluate an addressed I2C expander/controller with safe reset behaviour and default-off alarm, then review supply loading, firmware and failure behaviour. No part/placement/routing is approved by this proposal alone.
2. **Programming:** obtain the TI image and choose an evidenced preprogrammed-EEPROM flow or an isolated post-assembly fixture with actual bus/power/reset access. SWD pads and J10 do not establish U3 programming. Keep motion locked until configuration and hardware qualification are recorded.
3. **Complete external assembly:** J3/J7 mates/contacts are now specified in [connector-harnesses.md](connector-harnesses.md). Check their insertion/latch/tool envelopes with cable bends and fixture fasteners. Finalize strain relief, adapter tolerances, front-mount sharing and the external brake's mounting/cooling.
4. **Encoder limitation:** optional DNP footprint requirement is fulfilled. Do not fit it or advertise shaft feedback until rear rotating-shaft access and the magnet/holder/gap are established. An alternative coupling or motor variant would be a separate decision.
5. **Operating application:** qualify current waveform, hold current, STEP timing, speed/stopping and load; implement only the agreed industrial protocols. OUT0/OUT1 load/duty limits need definition. References do not resolve these NEMA34 requirements.

## What the existing checks establish

The baseline passed native DRC, unconnected-item, ERC and schematic-parity checks, all 46 local bypass paths and the critical-copper checks. Four manufacturing drills and open substrate apertures match the motor CAD axes. These are CAD facts; they do not clear the missing functions above or demonstrate motor operation. The comparison, cable-specification and resistance-label corrections do not change PCB copper or schematic connectivity.

`bun run review` validates the engineering package while preserving the order hold. `bun run check:release` must still reject an order release. The reviewer should be given both the actual changes and the unresolved gates, never a blanket completion claim.
