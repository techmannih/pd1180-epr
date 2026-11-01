# RP2040 / DRV8462 redesign

Revision: 0.5.0-RP2040-DRAFT, based on main `1c22abf`. User-selected architecture: **RP2040 + DRV8462DDVR + TPS26750 + AS5600, retaining 48 V EPR**. Engineering changes only; no assembled motor operation or manufacturing approval is claimed.

## Electrical changes

- U16 becomes RP2040 with its own 12 MHz CL20 pF crystal, 1 kΩ oscillator resistor, local I/O/core/VREG capacitors, QSPI boot wiring, 27 Ω USB series resistors and BOOTSEL test pad. Existing W25Q32JV U17 is now boot storage and is supplied from the independently powered MCU rail. TESTEN and exposed pad 57 are grounded. The compiled contract checks the package pins independently of the generated GPIO header.
- U7 becomes **DRV8462DDVR (DDV, 44 pins)**. It contains both motor H-bridges. Q6–Q13, Q14, the old gate networks and the TMC regulation shunts R109/R110 are removed. The DDW pinout/rating is not interchangeable. MODE selects SPI; VREF uses DVDD. NC/reserved pins follow the DDV table.
- Motor enable is still gated by RUN_SAFE independently of STEP commands. The eFuse, thermal/voltage gates, brake Q16, freewheel clamp and brake-feedback monitor remain. U34 and L3 remain: their renamed BRAKE_12V output powers U15, even though the old TMC supply function is gone.
- R115/R116 and INA240 phase-current diagnostics remain; DRV8462 regulates using its internal current sensing. Their Kelvin routing still needs fresh native verification.
- U18 becomes AS5600, I²C address 0x36 on RP2040 I²C1. Its 5 V/3 V supply pins are tied to 3.3 V per the 3.3 V circuit, DIR is low, PGO is unconnected. It is **DNP**, centered on the motor axis on the bottom; both bypass capacitors stay on top. The single-shaft ordered motor has no qualified rear magnet installation. Firmware reports valid magnet/angle telemetry only, not closed-loop position control.
- J1/J10, PD controller/configuration, four mounting holes, brake attachment and other unrelated circuits are retained. J2/J3 remain JST VH in this revision; the earlier spring-clamp requirement is still open. There is still no separate raw PD_VBUS ADC divider. Existing telemetry measures VMOTOR after the eFuse; this must not be described as raw input voltage sensing.

## Firmware behavior

The new driver requires a real STEP generator; the old TMC internal ramp cannot be reused. The target now uses a 20 µs timer, SPI mode 1 configuration/readback, a one-second ramp to 10 rpm and a maximum requested commissioning current of 0.8 A RMS. Quantization gives about **0.773 A RMS nominal**, not a measured guarantee. Four qualification flags block motor power/motion by default.

A 25 ms command lease and late-timer fault stop pulses and lower enable. The fault latches rather than automatically restarting after a stalled loop. PD contract, eFuse power-good/fault, voltage window, temperature, brake continuity and driver-register checks remain required. The watchdog is serviced only by the main loop. No register OTP or AS5600 programming is performed.

USB-only startup retains boot-flash power. Firmware delays USB initialization until DATA VBUS is present and detaches when it disappears. Target tests cover initialization, detach/suspend/power-loss and timer-fault cases; USB current, enumeration, suspend current and GPIO timing remain **unmeasured**. See [firmware/README](../firmware/README.md) for RP2040 BOOTSEL/SWD programming and full-flash readback. The old STM32 image and address must not be used.

## Current and thermal limits

TI lists the DDV device at up to 10 A full-scale / 7 A RMS under suitable conditions, with an external heatsink on the exposed top. That number is not this board's qualified continuous current. At 6 A RMS per phase, the simplified two-phase conduction estimate `2 × I_RMS² × R_HS+LS` gives about **6.9 W** at 0.096 Ω and **13.2 W** at 0.184 Ω. These are two resistance cases from the datasheet, not a complete thermal model: switching losses, current convention, temperature feedback, duty, airflow and PCB/TIM/heatsink paths still matter. The published 44.2 °C/W reference-board junction-to-ambient value would not support that dissipation without an appropriate cooling assembly.

Consequently the 6 A/phase motor rating is **not enabled**. The source needs its top-cooled DDV heatsink/TIM and final copper/thermal design qualified. Retaining 48 V preserves the input architecture; it does not prove full rated torque or high-speed performance. Brake energy and the provisional 10 Ω / 300 W external resistor still require load-specific qualification.

TI section 9.1 requires support at both ends of the IC, recommends less than 45 N mounting force in production, and permits the heatsink to be grounded or floating. The DDV top junction-to-case resistance is 0.7 °C/W; heatsink and interface resistance must be added. Neither that mechanical support nor an exact TIM/heatsink is implemented by the current assembly CAD. Section 9.3 recommends 2 oz outer copper; this board's retained 1 oz stack has **not** been qualified as an equivalent thermal/current implementation. A heatsink picture or the IC's headline current rating cannot close these design requirements.

## Evidence and open work

[Machine-readable revision evidence](../engineering/rp2040-redesign.json) records the actual checks and blockers. Fresh source build, compiled connectivity, native DRC, host firmware and ARM build results must be distinguished. Source previews are unrouted. Older zero-error counts, copper resistance, switching simulations and assembly views do not carry over.

Full release closure requires routing with local bypass/return loops, current-carrying copper, thermal-via/process review, USB reference/impedance, fresh refill/DRC/ERC/parity and regenerated matched BOM/CPL/Gerbers/viewer. No failed check is waived. Exact JLC stock must be refreshed at ordering; inventory is not reserved, and the new driver had insufficient stock for the configured batch during this review.

Physical closure requires secured mounting, optional encoder magnet qualification, a top heatsink/TIM, completed J3 brake installation, 48 V/5 A EPR source/cable, full programming readback and cold boot, then staged no-motor, low-current, braking, thermal and fault tests.

## Primary references

- [TI DRV8462 datasheet](https://www.ti.com/lit/ds/symlink/drv8462.pdf): DDV pin table, recommended capacitors, SPI registers, current scaling, thermal/layout data.
- [Raspberry Pi RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf) and [hardware design guide](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf): package pins, power, QSPI, crystal, USB, boot.
- [AS5600 manufacturer page](https://ams-osram.com/products/sensors/position-sensors/ams-as5600-position-sensor): 3.3 V circuit, I²C and magnet validity.
- [Ordered motor](https://www.omc-stepperonline.com/s-series-nema-34-stepper-motor-4-8nm-679-87oz-in-14mm-key-way-shaft-1m-cable-34hs31-6004s1): physical/rated motor, not measured controller performance.
