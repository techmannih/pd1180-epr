# NEMA34 electrical design

The current assembly uses RP2040, DRV8462DDVR and TPS26750 with a 48 V / 5 A USB-C EPR request. [System overview](system-overview.md) shows the signal and energy flow; [IC purposes](usb-pd-architecture.md) explains each device. The authoritative connections are in `index.circuit.tsx` and `hardware-contract.json`.

## Power and control

- **J1 POWER:** U1 protects the USB-C CC interface; U2 negotiates EPR using U3's programmed configuration. U6 protects the motor input. U38 INA237 measures raw PD_VBUS, while U30 ADS1115 measures protected VMOTOR and brake feedback.
- **J10 DATA:** powers RP2040 and its 4 MiB QSPI flash through U28/U25/U27. U39/U40 isolate independently powered board signals. U41 switches phase/encoder sensor power during USB suspend. Connect DATA as well as POWER for a motor test.
- **Board protection supply:** U5 derives 3.3 V from PD; U22 derives backup 3.3 V from VMOTOR; U23/U24 select that supply. This powers the independent protection/brake circuitry. U34 provides BRAKE_12V to U15.
- **Motor drive:** U7 DRV8462DDVR integrates both H-bridges. RP2040 supplies STEP/DIR and SPI configuration/readback. The DDV top-cooled package has its own footprint and pin map.
- **Enable:** PD_PATH_OK and POWER_PERMIT gate the eFuse. MCU_RUN, MOTOR_PG, VMOTOR_OK and TEMP_OK gate the driver. Reset, DATA loss and faults return the commanded outputs to the inhibited state.
- **Regeneration:** U13/U15/Q16 switch the J3 resistor near 52 V to dissipate returned motor energy. The brake retains its motor-bus-derived supply during PD loss.

## Connections and assembly

J2 is a WAGO 2601-3104 four-pole motor clamp; J3 is a WAGO 236-402 two-pole brake clamp. See [harness pinouts](connector-harnesses.md). The fitted assembly is top-side; optional AS5600 U18 is bottom DNP and C52/C53 are top DNP. Encoder magnet installation and closed-loop control are optional extension work, separate from the configured open-loop motor test.

The four PCB mounting axes align with the ordered STEPPERONLINE 34HS31-6004S1 STEP. Select rear fastening from measured thread/depth and fit, following [motor assembly](motor-assembly.md). Use the selected driver/brake cooling parts and installation requirements in [thermal qualification](thermal-qualification.md).

## Software and validation

The default image provides diagnostics. Explicit board-bound `power-test` and `bench-test` profiles provide a 30-second stationary supply test and a <=800 mA RMS request, 10 rpm, 10-second unloaded run with a one-second stop ramp. Follow [commissioning](commissioning.md) for prerequisites, builds, programming, full readback and cold boot.

Current native checks report 0 unconnected items, 0 schematic-parity findings and 0 ERC findings. Raw DRC records 8 USB J1/J10 hole-clearance errors and 475 cosmetic warnings. Resolve the USB footprint/process acceptance with the fabricator; retain the report with the assembly package. See [verification](verification.md) for exact evidence and [assembly](assembly.md) for the fabrication and post-assembly workflow.

The 6 A/phase motor label is a motor rating, not the selected test current. Source-bound bus/brake simulations and installed cooling measurements determine the later operating envelope. Earlier STM32/TMC5160 material is historical; use this document and the linked current architecture for this revision.
