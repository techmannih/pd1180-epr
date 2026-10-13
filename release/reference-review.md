# NEMA17 / NEMA23 comparison and reviewer response

**2026-10-12 implementation:** [product correction](product-eco.md) supersedes the old interface inventory. Dedicated CAN/RS485/RS232/general-I/O circuits and native copper are removed, and the J2/mounting model is revised. J7 is now removed and local START/STOP is implemented; the brake installation and physical qualification remain open.

**2026-10-11 — review remains open.** Compared the actual published source of NEMA17 **v1.0.42** and NEMA23 **v1.3.2** against controller baseline `0a53ace`. [Reference provenance and file hashes](../engineering/reference-comparison.json) pin the releases and retrieval URLs. Source-level comparison covered the board entrypoints, current/temperature circuits, status/alarm, encoder, power test access and PD control. It is not a certification of either reference board or this board.

The earlier `feature-parity` check covered ten functions already present on this board. It **did not establish complete parity** with the reference boards: RGB, buzzer, independent power LED and dedicated power probe pads were absent from that list. The inventory now also checks the implemented indicators and isolated programming access. Its report still includes the comparison's mechanical, firmware and qualification gaps, with `reference_parity_complete: false`.

## Every reviewer line

| Reviewer request | Evidence-backed response now | What is still needed |
|---|---|---|
| Small encoder on bottom marked doNotPlace | U18 AS5047P and local C52/C53 are bottom DNP, excluded from fitted BOM/CPL and paste. R74 remains fitted top. See `assembly-check.json` and `native-decoupling-check.json`. | None for the optional footprint requirement; fitting and using it is a separate gate. |
| Use Rishabh's design as reference | Both exact reference releases were inspected; comparison below records retained functions and deliberate differences. | Diagnostics and programming-access additions are implemented; mechanical, image and powered qualification remain open. |
| Perfectly centered; correct encoder arrangement | U18 package center is (0,0), on the motor axis. | The ordered single-shaft motor has no documented rear rotating-shaft interface. Magnet attachment, holder, field and working gap are unresolved; centering alone does not provide feedback. |
| Explain J7 / J2 and justify extra connectors | J2 is the winding connector. J7 and its external command circuits are removed; SW2 provides local control. J1/J10 provide separate POWER/DATA; J3 connects the retained regenerative brake resistor. No redundant SWD/encoder cable header remains. | Validate complete mating assemblies and external loads, not only the connector bodies. |
| Only specified interfaces | Current inventory is J1, J10, J2, J3. Undefined buses/general I/O and the J7 motor-bus output have been removed. | No external command/limit harness is required by this local-control architecture. |
| More assembly work; no way to connect motor | J2 is JST VH. VHR-4N housing, contacts, pigtails, splices and ordered-motor winding colours are specified. J2 insertion space is screened; the retained J2 mate, motor splices and cable route are modeled and collision-screened. J3 installation remains unresolved. | Build/inspect the actual harness, qualify strain relief and wire bends. Complete J3 resistor/cooling installation and verified motor mounting without assumed rear threads. |
| Carefully review and discover other issues | Added visible/audible feedback, power probes and isolated EEPROM programming access. Motor resistance temperature label corrected from 20 °C to the drawing's 25 °C. | Supply the TI image, qualify the described programming fixture, and close mechanical/powered gates. |
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
| RGB indication | Fitted RGB and transistor sinks | D16 RGB with U35 TCA9538 sinks; PC13 reset, current limiting and firmware fault/power states. |
| Audible alarm | Fitted buzzer and default-off driver | BZ1 active buzzer with Q26, gate pulldown and clamp; default-off/reset-tested. Hardware motor protection remains independent. |
| Independent power indication | Fitted logic-power LED | D17/R128 indicate board V3V3 independently; USB-only MCU power is distinct. |
| PD / motor voltage probes | Labeled PD, VMOTOR, GND pads | Added TP_PD_VBUS, TP_VMOTOR and TP_PWR_GND plus five programming pads; 19 service pads total. |
| Optional encoder | Centered bottom AS5600 plus two DNP caps | Centered bottom AS5047P plus two DNP caps already implemented; SPI retained. Ordered-motor magnetic attachment remains unresolved. |
| Boot/reset/debug | RP2040 BOOT/RUN, SWD, external flash | STM32 internal boot flash, SW1 reset and SWD/NRST recovery. No need to copy RP2040 UF2/BOOTSEL hardware. U17 is separate storage, not the MCU's boot flash. |
| PD programming | Config-pin/I2C PD controllers | TPS26750 requires a board-specific image in U3. Host PD I2C is distinct from EEPROM I2Cc. U36 isolates both I2Cc wires; EEPROM-side SDA/SCL, VREF, GND and isolation pads are present. The fixed-5 V fixture procedure still needs a built-fixture readback/APP-boot demonstration. |
| Industrial buses | Not the basis of either reference design | Unsupported bus hardware removed. No remote bus product or application protocol is claimed. |
| Mounting and thermal | Motor-specific holes, standoffs and thermal provision | Exact ordered-motor CAD/holes checked. Unsupported adapter/posts/fasteners removed; existing four holes retained. Rear threads and a secured assembly remain unverified. |
| Production files | Top assembly, DNP exclusion, named nets, routed checks | Implemented; retain 0.30 mm minimum drill, 58 filled/capped vias and fresh DRC/ERC after any ECO. |
| Motor firmware | Neither inspected release supplies executable motor firmware | Our binary implements local START/STOP and the bounded internal ramp, but runs USB diagnostics with motion locked until hardware qualification. Reference hardware is not evidence of ready-to-run firmware. |

Reference links: [NEMA17](https://tscircuit.com/imrishabh18/rp2040-motor-controller), [NEMA23](https://tscircuit.com/imrishabh18/nema-23-stepper-controller). Primary requirements for this board stay in `hardware-contract.json`.

## Concrete remaining work

1. **Diagnostics qualification:** the user-approved ECO adds RGB, independent board-power indication, a driven buzzer and eight pads. U35 uses the existing I2C bus with PC13 hardware reset; the removed industrial interfaces are not restored. [Indicator states, 75 mA allocation and tests](indicators.md) distinguish host-tested behavior from unmeasured brightness/current/audio.
2. **Programming:** obtain the TI image and implement/qualify the [U36-isolated fixture](pd-programming.md), including power sequencing, readback and cold boot. SWD pads and J10 do not establish U3 programming. Keep motion locked until configuration and hardware qualification are recorded.
3. **Complete external assembly:** J2/J3 mates/contacts are specified in [connector-harnesses.md](connector-harnesses.md). Check their insertion/latch/tool envelopes with cable bends and fixture fasteners. Qualify a real strain-relief and mounting method, and the external brake's mounting/cooling.
4. **Encoder limitation:** optional DNP footprint requirement is fulfilled. Do not fit it or advertise shaft feedback until rear rotating-shaft access and the magnet/holder/gap are established. An alternative coupling or motor variant would be a separate decision.
5. **Operating application:** qualify current waveform, hold current, internal-ramp speed/stopping and load. No industrial protocols or OUT0/OUT1 are included. References do not resolve these NEMA34 requirements.

## What the existing checks establish

The current local-control ECO passes fresh native DRC/ERC and schematic parity with zero violations and zero unconnected items. Consult the regenerated electrical-copper reports and their hashes; live sourcing and hardware qualification remain separate gates. All 252 fitted parts and 19 service pads are on top; the three optional encoder footprints remain bottom-side DNP. Four manufacturing drills and open substrate apertures must also pass the regenerated assembly check. These are CAD facts, not evidence of motor operation.
