# RP2040 / DRV8462 reviewer checklist

Revision 0.5.0-RP2040-DRAFT. Begin with [the redesign](rp2040-redesign.md) and [exact evidence](../engineering/rp2040-redesign.json). No ordering or motor-operation approval is recorded.

- [ ] Read the nine functional sheets alongside [every IC’s purpose and power paths](usb-pd-architecture.md). Compare the [reference power-source evidence](../engineering/reviewer-power-reference.json); NEMA23/NEMA14 support dual-source MCU power.
- [ ] Check the exact DDV 44-pin table, integrated bridges, VREF/DVDD, MODE, reserved pins and both charge-pump paths against TI's DRV8462 datasheet. DDW is not an interchangeable substitute.
- [ ] Review RP2040 power pins/EP57, core/VREG bypass, 12 MHz crystal, QSPI boot flash on the independent MCU rail, USB series resistors and BOOTSEL/SWD access.
- [ ] Reproduce the compiled electrical and firmware pin contracts and host tests. Verify register readback, safe startup, power loss, stalled-loop/STEP lease fault latching and explicit restart.
- [ ] Review the independent RUN_SAFE chain and retained U34/L3 BRAKE_12V supply to U15. Brake/OVP/eFuse/thermal protection must not be bypassed by MCU code.
- [ ] Verify all four qualification flags remain false, including after USB ARM. Record actual USB startup/configured/suspend current and detach behavior before enabling that flag.
- [ ] Verify AS5600 SDA/SCL use I²C1, 3.3 V wiring and magnet-valid status. U18/C52/C53 remain DNP; only U18 may be on the bottom. Do not claim closed-loop operation.
- [ ] Verify fresh source build/style, native export, filled-zone DRC, ERC, schematic parity, local bypass/return loops and zero unconnected items. Older board reports are historical.
- [ ] Finish routed current-carrying copper, shunt Kelvin branches, USB reference/impedance, thermal via/process and top-cooled DDV heatsink/TIM analysis. Source paths are not an ampacity qualification.
- [ ] Preserve 0.15 mm tracks, 0.10 mm spacing, 0.30 mm GND clearance, 0.50 mm GND inset and 0.20 mm global copper-edge rule. Resolve USB hole-to-pad manufacturing acceptance separately; do not hide it by lowering a global rule.
- [ ] Regenerate matched manufacturing files, BOM/CPL, routed viewer, assembly CAD and release hashes. Source/release mismatches must keep the full review gate red.
- [ ] Refresh official JLC stock/package for the exact fitted BOM. DRV8462DDVR quantity was insufficient for the configured batch; availability is not reserved.
- [ ] Qualify motor-side connector/wire entry, rear screws/depth/insulation, heatsink clearance and mechanical security. Existing holes match the motor CAD, not an accepted fastening assembly.
- [x] Reviewer ECO implements WAGO spring-clamp J2/J3, separate raw PD_VBUS ADC (INA237), and separately reported derived PD_READY plus physical MOTOR_PG.
- [ ] Verify those paths and terminal/harness access on assembled hardware; derived PD_READY is not a newly added TPS GPIO.
- [ ] Program/read back TI EEPROM and RP2040 flash, verify cold boot and fault outputs, then staged low-current motor, brake and thermal tests. No 6 A operation until qualified.

Run `bun run review` before any handoff as a completed board. It must remain blocking while any affected CAD/release check is stale or failing. Use [firmware instructions](../firmware/README.md) for the new commissioning image; the old STM32 programming address/image is invalid for U16.
