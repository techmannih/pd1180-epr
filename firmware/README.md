# RP2040 / DRV8262 commissioning firmware

This revision targets **RP2040 + 4 MB W25Q32JV QSPI flash**, **DRV8262DDVR** (top-cooled DDV package), the retained **TPS26750 48 V / 5 A** power system and optional **AS5600**. The STM32/TMC5160 image and reports from the parent revision do not qualify this hardware. Do not flash an old STM32 binary into this board.

**The default diagnostics image keeps motor motion locked.** `motionWiringVerified`, `pdImageVerified`, `brakeHardwareVerified` and `rp2040UsbPowerVerified` are false. No USB command changes those qualifications. A successful build is not an assembled-board test.

## Build and software checks

Install PlatformIO Core 6.2.0 in a Python virtual environment. `platformio.ini` pins the Raspberry Pi platform by Git commit; that platform pins the Arduino-Pico framework and toolchain. Use Bun 1.3.14 for the repository scripts.

```sh
bun run check:firmware-pins
bun run check:firmware
PIO=/path/to/venv/bin/pio bun run build:firmware
bun run check:firmware-target
```

The target uses Arduino-Pico, RP2040 at 125 MHz, a 12 MHz crystal, W25Q-compatible boot2 and 4 MB external flash. The build checker validates the ARM ELF, flash/RAM vector bounds and UF2 family/address/payload, and archives the source hashes. It does not program a device. USB uses the generic prototype identity; assign an authorized product VID/PID before distribution.

## Wiring and control

`docs/firmware-pinmap.json` is checked against the manufacturer package order and source U16 connections. U42 uses GP17 CS, GP18 SCK and GP19 MOSI; GP16 is LDAC. SPI is TX-only. GP2/4 are phase enables A/B; GP1/0 are phase directions A/B. PD, temperature, bus ADC and indicators use I2C0 GP20/21. AS5600 uses I2C1 GP14/15 at 0x36. Dedicated QSPI pins are reserved for boot/XIP and are never bit-banged by application code. U17 is on **V3V3_MCU**, so DATA-only diagnostics can boot without board power. DATA USB is the sole MCU supply: PD alone leaves the RP2040 off. Motor operation requires both DATA and PD. U39 separates the board I²C domain; U40 provides powered-off isolation for incoming status signals. Board presence is the digital LOGIC_PG_MCU input on GP28, qualified for 20 ms. DATA-only operation cannot read the unpowered board ADC/PD/temperature devices.

DRV8262 uses PH/EN inputs rather than SPI registers or an internal STEP/DIR sequencer. MODE1/MODE2 are grounded; DECAY and TOFF use DVDD for smart-tune dynamic decay and 16 µs off-time. OCPM is grounded for latched overcurrent/overtemperature faults. U42 MCP4822 supplies independent VREF1/VREF2 through 12-bit SPI commands (mode 0, 8 MHz, gain 2); LDAC updates both channels together. R146/R147 are 1.5 kΩ current-mirror resistors. At the 800 mA RMS software ceiling, nominal peak reference is 359 mV. The DAC has **no readback**: `DAC_COMMANDS_PREPARED` confirms software preparation only. Phase-current calibration and low-current mirror accuracy must be measured; no physical DAC-presence claim is made.

The RP2040 timer advances a 64-state sine/cosine sequence (16 microsteps/full step) on a 20 µs scheduler tick, with a one-second ramp to **10 RPM**. At references below TI's 50 mV specified regulation range that winding is placed in high-side brake. Enables are low during phase/reference updates; both references latch before a 6 µs settling interval. After RUN_SAFE releases nSLEEP, the target waits 2 ms before enabling phases. Main renews a 25 ms lease; expired lease, late timer or physical fault disables both phase enables and drops MCU_RUN/POWER_PERMIT without catch-up steps. U10/U11/U33 independently gate **nSLEEP**, with R55 pulldown; this shutdown does not depend on SPI/DAC software. A 250 ms watchdog is serviced only by main. The default diagnostics image does not enable motion.

The local button requires release before a start request. Normal STOP ramps down; DISARM, power loss and faults stop immediately. Fault acknowledgement and another release/press are required before restarting. AS5600 angle/status reads reject missing/weak/strong magnets; it is optional telemetry, **not closed-loop control**. U18 remains DNP pending a proven rear magnet attachment on the single-shaft motor.

## Diagnostics and USB

Commands: `HELP`, `STATUS`, `POWER`, `DRIVER`, `PROFILE`, `DISARM`, `ARM` (blocked). Oversized command lines are discarded. STATUS includes board rail, PD contract, DATA VBUS, VMOTOR, phase diagnostics, brake continuity, temperature and readiness. DRIVER reports supply validity, physical nFAULT, software DAC readiness (no readback), and encoder validity/angle.

TMP102 thresholds remain 70 C trip / 55 C rearm, active-low hardware inhibit. ADS1115 samples VMOTOR, input-current monitor and brake return; raw **PD_VBUS** is independently measured by U38 INA237 (85 V input), at I²C address 0x40. `POWER` reports that raw voltage separately from VMOTOR, contract voltage/current, physical MOTOR_PG and derived PD_READY. PD_READY requires a fresh completed ADC conversion in the 44–51 V engineering window, live APP-mode sink 48 V/5 A EPR contract and the expected configuration identity. A stale, reset, missing or invalid sensor inhibits motion. This is not a dedicated hardware PD GPIO, nor an adapter/USB-PD certification. The eFuse MOTOR_PG input remains independently required. RP2040 GP26/27 read instantaneous INA240 phase voltages, GP28 digital LOGIC_PG_MCU board presence and GP29 DATA VBUS. ADC scaling assumes nominal 3.3 V and needs calibration; readings are not PWM-synchronous RMS measurements.

`NO_USB` prevents the Arduino core attaching before DATA VBUS is sensed. TinyUSB initializes at >=4 V; detach occurs below 3 V. USB suspend disarms, ends peripheral buses and invalidates telemetry. This port does not implement the old STM32 STOP0 routine: suspend current, inrush, pre-enumeration current, DATA removal and reverse current remain **unqualified**. The lock includes that explicit gate. No remote wake or motor start is requested. The independent brake retains U34's 12 V supply and Q16; integrated motor bridges do not replace regeneration protection.

## Programming and bench acceptance

Use an RP2040-compatible SWD probe with SWDIO, SWCLK, GND, MCU 3.3 V reference and RUN/reset, or BOOTSEL USB recovery. To request ROM USB boot, ground **TP_BOOTSEL** through its fitted 1 kohm connection to QSPI CS, pulse reset and release BOOTSEL once ROM USB boot is entered. Do not short QSPI CS directly or program while the motor bus is energized.

Program the generated UF2 using ROM USB, or the ELF/raw image using an RP2040-aware programmer at external-flash address **0x10000000**. Read back the programmed image range and compare its hash, then verify a full cold boot with USB-only power and with PD power. U3 has a **separate TI EEPROM image**; retain its complete 64 KiB readback and APP/EPR cold-boot verification procedure.

Use the three-stage procedure in [commissioning](../docs/commissioning.md): default diagnostics, stationary `power-test`, then bounded `bench-test`. Their prerequisites are inspections/readbacks and the preceding stage, not the motor/thermal tests that the bench profile exists to perform. Test builds require a board-bound operator record; the normal release image stays diagnostic. No source flags need to be edited.

The bench profile requests at most 0.8 A RMS / 10 rpm for 10 seconds before ramping down. The power-only profile permits the bus for at most 30 seconds, with nSLEEP and both phase enables low. Both require local START; USB ARM remains blocked. The 4-second motor startup deadline includes C18's ramp and the distinct brake ADC samples. Driver readiness remains valid between polls for at most 40 ms. PROFILE reports image type and record hash. No mode silently turns into unrestricted motor firmware.

## Evidence scope

Host tests run the actual target main loop using fake peripherals for USB-only startup, board-power loss/recovery, suspend/resume, detach, indicators and the ARM lock. Portable tests cover PD-contract rejection, latched faults, telemetry, brake timing, DRV8262 current-vector/limit checks and transport failures, encoder validity, phase ramp/stop/lease/late ISR/wraparound. The ARM build proves compilation against the pinned RP2040 APIs. Neither test method measures physical timing, USB current, thermal behavior or board connectivity.

Primary references: [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [RP2040 hardware design](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf), [TI DRV8262 SLVSFV5C](https://www.ti.com/lit/ds/symlink/drv8262.pdf), [AS5600 datasheet](https://look.ams-osram.com/m/7059eac7531a86fd/original/AS5600-DS000365.pdf), [Arduino-Pico PlatformIO](https://arduino-pico.readthedocs.io/en/latest/platformio.html).

Save a complete 4 MiB binary readback starting at 0x10000000, then compare every programmed byte against the registered image:

```sh
bun scripts/verify-programming.mjs --kind rp2040 --readback board-flash.bin --serial BOARD_SERIAL --operator OPERATOR --programmer PROGRAMMER --output readback-record.json
```

The checker requires a full-capacity dump, compares the entire image, hashes the entire dump, and explicitly reports that bytes outside the image were not compared. This file check cannot attest that the dump came from the identified hardware. Keep the programmer log; cold boot and motor operation are separate physical checks.

USB suspend also disables U41 (`SENSE_EN` GP24), floats encoder I2C, cancels the phase timer and idles at 60 MHz with USB clock retained (RP2040-E16). Resume restores the saved clock and phase timer, requires fresh board readiness, waits 10 ms for sensor supply settling and remains disarmed. Measure suspend current, wake timing and sensor-rail discharge; these have not been physically qualified.
