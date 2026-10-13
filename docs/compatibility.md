# System compatibility

This board targets the STEPPERONLINE 34HS31-6004S1 and local onboard control. The commissioning image is motion-locked; these are design connections, not a claim of qualified motor operation.

| Area | Current implementation and compatibility |
|---|---|
| Motor power | J1 USB PD EPR, requested 48 V / 5 A contract; exact source, cable and TI image pending |
| Logic power | PD/motor-bus regulators feed board V3V3; a separately reverse-blocked DATA supply can power V3V3_MCU |
| Motor stage | TMC5160A and external MOSFET bridges; current setting requires motor-specific qualification |
| Command path | Onboard STM32 SPI ramp, SW2 START/STOP and SW1 RESET |
| Motor cable | J2 JST VH, VHR-4N and specified contacts/pigtails/splices; see [harness](motor-harness.md) |
| Braking | J3 switched external resistor provision; fitting and ratings depend on qualified regeneration duty |
| USB data | J10 USB device setup/diagnostics; independent from J1 power; no dashboard/motion protocol compatibility is claimed |
| Encoder | Optional bottom AS5047P and local capacitors, all DNP; magnetic attachment unqualified |
| Programming | Top SWD and isolated PD EEPROM service pads; separate programming fixtures |
| Mechanics | 85.9 × 85.9 mm stepped PCB, four Ø4.2 mm holes; rear fastening and clearance unqualified |
| Assembly | All fitted parts and service pads on top, no bottom paste; through-hole assembly must be included in provider scope |

The RP2040/DRV8825 and RP2040/DRV8452 reference designs use different processors, drivers and current limits. Their firmware and current settings are not interchangeable with this board. See [reference comparison](reference-review.md) and [external equipment](external-system.md).
