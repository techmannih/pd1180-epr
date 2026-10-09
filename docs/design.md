# PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR

## Electrical design and validation

### Scope

PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR is a 48 V EPR single-axis controller for a 5.5 A RMS stepper motor, with magnetic encoder feedback and serial/control interfaces. Its 85.9 mm square outline, four M4 mounting holes, shaft-axis location and connector placement are explicit in the PCB model. The selected 25 mm bulk capacitors require matching enclosure clearance.

### Power sequence

1. J1 VBUS initially supplies 5 V. U5, LMR36510, starts from this and provides V3V3_PD before any motor power is enabled. U23 passes that rail to V3V3. LM5164 was rejected for this position because its 6 V minimum input cannot bootstrap from default USB 5 V. J10 separately carries USB 2.0 D+/D− data and requires J1 startup power.
2. U1, TPD4S480, protects J1's CC and SBU contacts. J1 data pins and the protected SBU outputs are unused. C2 is the required 1 µF local VPWR/LDO_3V3 bypass. U1's VBUS divider feeds U2's low-voltage VBUS sense pins. Q1 bypasses that divider in SPR with its source toward VBUS_LV and drain toward raw VBUS.
3. U2, TPS26750, boots in SafeMode: ADCIN1 to LDO_3V3, ADCIN2 to ground, I2Ct address 0x20. The 64 KiB EEPROM is at 0x50 on the independent I2Cc bus. An appropriate TI configuration image is required; a blank EEPROM does not negotiate 48 V.
4. PD POWER_PATH_EN is not a logic-level output. Q2/Q3 are the CSD17484F4 dual-NMOS non-inverting buffer used by the TPS26750 EVM: R9 and R12 are 0 Ω gate links, while R11 and R13 are 100 kΩ pull-ups to U2's own PD_3V3/LDO_3V3 rail. U4 then combines PD_PATH_OK with the MCU power permit. Firmware may assert that permit only after an active 48 V / 5 A EPR contract and valid fault status. Loss of the contract must remove the permit immediately.
5. U6, TPS26631, provides inrush/current limiting and voltage qualification. Q4 implements reverse-current blocking, with Q5 providing its fast gate pull-down. Motor bulk capacitance is downstream of this switch.
6. U22 generates V3V3_MOTOR from the switched motor bus. U23/U24 implement TI LM66100 Figure 17 continuous-output ORing: U23 CE senses V3V3_MOTOR, U23 ST drives U24 CE through LOGIC_OR_PRIORITY, and R111 pulls that interlock up to V3V3_PD. This removes the equal-input both-off condition of the simpler cross-coupled circuit. U24 ST is grounded because its status indication is unused, as allowed by the pin-function table. The motor buck keeps the MCU, voltage reference and brake comparators powered when USB is removed while VMOTOR remains energized; either buck alone must support the full logic load. Verify switchover droop, cold start and no reverse current on the bench.

PP5V is not connected in this sink-only implementation. Power-source operation, power-role swaps and VCONN-role swaps must be disabled in the PD configuration. The PP5V treatment and TPD4S480 behavior if 3.3 V collapses while VBUS remains in EPR require a TI application review and bench validation before release.

### Calculations

| Item | Nominal calculation | Implication |
|---|---|---|
| Logic rail | 1 V × (1 + 100 kΩ / 43.2 kΩ) | 3.315 V before ideal-diode loss; check load drop, reference and tolerance |
| eFuse current limit | 18,000 / 4,020 Ω | 4.478 A nominal; approximately 215 W motor input at 48 V |
| Input UVLO | 1.2 V × (1 + 360 kΩ / 10 kΩ) | 44.4 V nominal; prevents motor operation on SPR or 36 V EPR |
| Input OVP | 1.2 V × (1 + 430.22 kΩ / 10 kΩ) | 52.83 V nominal; calculate full comparator/resistor tolerances |
| Motor ADC scale | (360 kΩ + 20 kΩ) / 20 kΩ | 19:1; 48 V gives 2.526 V |
| Current monitor | approximately 27.9 µA/A × 20 kΩ | approximately 0.558 V/A; calibrate using the U6 datasheet limits |
| Phase shunt | 5.5² × 0.033 Ω | approximately 1.0 W per shunt; selected 3 W parts need copper/thermal verification |
| Bulk energy, 48→53 V | ½ × 940 µF × (53²−48²) | only 0.237 J; bulk capacitors cannot absorb sustained regeneration |
| Brake switch on | 2.495 × (1 + 200 kΩ/10 kΩ + 200 kΩ/1 MΩ) | approximately 52.89 V |
| Brake switch off | above − 3.3 × 200 kΩ/1 MΩ | approximately 52.23 V; nominal 0.66 V hysteresis |
| Motor OVP shutdown | 2.495 × (1 + 430 kΩ/21 kΩ) | approximately 53.58 V; independent of MCU software |
| Initial brake load | 53² / 10 Ω | approximately 281 W while on, 5.3 A; external resistor/heatsink/pulse-energy rating required |

The resistor tolerances, comparator offset, reference error, gate delay, wiring inductance, maximum regenerated power and maximum bus overshoot must be evaluated together. The 60 V motor-driver rating is not a usable transient clamp setting. A generic 51 V TVS can clamp far above 60 V and is not an adequate motor-bus braking strategy.

### Motion and shutdown

U7 drives eight 100 V external MOSFETs and two 33 mΩ phase shunts. Four 220 nF bootstrap capacitors, the charge pump, local 12 V/5 V bypasses and the VCC filter are represented explicitly. Current scaling, gate drive, dead time and chopper settings must be determined from the actual motor and validated waveforms; default register values are not an approved 5.5 A setup.

U8/U9 select native left/right endstop signals in ramp mode or external Step/Dir signals in step mode. The transistor input stages invert their external signals. Open inputs read high; firmware and TMC switch polarity must account for this. The maximum Step/Dir rate has not been qualified.

DRV_EN_N has a pull-up. Its sink path requires two series transistors: MCU_RUN with motor power-good and voltage-good, plus the externally asserted hardware-enable input. Open or grounded hardware enable disables the bridge. This is a functional enable, not a certified safe-torque-off circuit. The motor-side buck sustains this logic while motor capacitors are charged; power-loss disable timing and comparator operation still need bench validation.

The AS5047P is a bottom-side part at the board origin, facing the motor shaft magnet. Its SPI port shares the bus with TMC5160 and flash; each device has a separate CS and all unselected devices must release MISO. Its ABI outputs remain on labelled service pads; U7 pins23/24 are grounded and pin25 is NC for the selected STEP/DIR mode.

### Interfaces

CAN uses TCAN332 and RS485 uses MAX3485E. Supply bypass and bus ESD parts are included. Fit 120 Ω termination externally only at the two physical ends of each bus; establish RS485 bias at the system level. These are non-isolated interfaces.

RS232 uses MAX3232 at 3.3 V, with its four charge-pump capacitors. J10 USB 2.0 D+/D− has USBLC6-4SC6 shunt ESD protection and MCU-side 22 Ω series resistors. R107/R108 provide a divided and filtered VBUS attach sense on PB0/ADC_IN8: 1 MΩ over 47 kΩ gives about 0.224 V at J10's nominal 5 V. J10 VBUS is independent from the EPR rail. Firmware must keep the USB peripheral detached unless `USB_VBUS_SENSE` indicates present VBUS. Route USB as a 90 Ω differential pair with an uninterrupted reference plane; no impedance claim is made for the current placement.

GPIO/stop/home/Step/Dir inputs use 160 V NPN stages and base-emitter reverse protection. Nominal use is 24 V logic; thresholds and transient immunity are unqualified. Outputs are low-side NPN switches with flyback diodes; begin qualification below 100 mA per channel. J7 pin17 is **the 48 V motor bus**, not a regulated 24 V accessory rail. An accessory requiring 24 V needs a separate supply.

The logic rail is supplied from reverse-blocked USB-derived and motor-derived regulators. TMCL command execution, CANopen CiA profiles, standalone programs and motor tuning are firmware work outside the circuit netlist.

### Layout release requirements

The r0.4 ECO route reinforces the high-current nets with nominal 2.4 mm copper corridors and parallel 0.6/0.3 mm vias. The 1 oz IPC-2221 external-layer screening estimate is 6.12 A at a 20 °C rise. Dense package exits, clipped zone geometry, current sharing between layers and enclosure temperature still require powered thermal validation. Verify the bridge loops, Kelvin shunt returns, charge-pump/bootstrap paths, QFN thermal stitching and eFuse copper against the manufacturers' layout guidance.

The imported CSD19534 footprint contains four vias inside its drain pad. They are now explicitly connected to the drain and the board declares via-in-pad fabrication. Specify filled-and-capped vias; ordinary open holes can wick solder and invalidate assembly assumptions.

### Primary power-part ratings

The [GCT USB4105 specification](https://gct.co/files/specs/usb4105-spec.pdf) rates the connector for 48 V, 5 A on VBUS and 240 W. The [TPS26750 datasheet](https://www.ti.com/lit/ds/symlink/tps26750.pdf), Figure 8-5 and section 8.4.1.2.2.6, define the POWER_PATH_EN two-NMOS buffer; the exact [CSD17484F4](https://www.ti.com/lit/ds/symlink/csd17484f4.pdf) used by TI's EVM is fitted for Q2/Q3. The [LM66100 datasheet](https://www.ti.com/lit/ds/symlink/lm66100.pdf), Figure 17 and section 9.2.2.1, describe the status-interlocked dual-input ORing circuit used for the two logic supplies. These ratings do not validate the assembled PCB.

### Datasheet-based motor assumptions

The [QSH8618-96-55-700 motor datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/qsh8618_datasheet_rev1.08.pdf) specifies 5.5 A phase current, 7.0 Nm holding torque, 1.8-degree steps and rotor inertia 2700 g·cm² = 0.00027 kg·m².

Calculated rotor-only kinetic energy is 0.370 J at 500 RPM, 1.480 J at 1000 RPM and 5.922 J at 2000 RPM, using E = ½ J (2πn/60)². These are examples, not approved operating speeds. The 940 µF bulk bank absorbs only 0.237 J between 48 V and 53 V. Attached-load inertia, gearing, gravity and stopping time increase the braking requirement; the final speed limit and resistor pulse duty cannot be inferred from holding torque. The 10 Ω / 300 W external brake remains a starting specification. See `motor-data.json` for machine-readable inputs.
