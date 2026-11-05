# RP2040 / DRV8462 commissioning firmware

This revision targets **RP2040 + 4 MB W25Q32JV QSPI flash**, **DRV8462DDVR** (top-cooled DDV package), the retained **TPS26750 48 V / 5 A** power system and optional **AS5600**. The STM32/TMC5160 image and reports from the parent revision do not qualify this hardware. Do not flash an old STM32 binary into this board.

**Motor motion remains locked.** `motionWiringVerified`, `pdImageVerified`, `brakeHardwareVerified` and `rp2040UsbPowerVerified` are false. No USB command changes those qualifications. A successful build is not an assembled-board test.

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

`docs/firmware-pinmap.json` is checked against the manufacturer package order and source U16 connections. SPI0 uses GP16/17/18/19 (MISO/CS/SCK/MOSI). PD, temperature, bus ADC and indicators use I2C0 GP20/21. AS5600 uses I2C1 GP14/15 at 0x36. Dedicated QSPI pins are reserved for boot/XIP and are never bit-banged by application code. U17 is on **V3V3_MCU**, so DATA-only diagnostics can boot without board power. DATA USB is the sole MCU supply: PD alone leaves the RP2040 off. Motor operation requires both DATA and PD. U39 separates the board I²C domain; U40 provides powered-off isolation for incoming status/MISO signals. Board presence is the digital LOGIC_PG_MCU input on GP28, qualified for 20 ms. DATA-only operation cannot read the unpowered board ADC/PD/temperature devices.

DRV8462 uses **SPI mode 1**, 16-bit frames, 1 MHz and a >=2 us CS-high gap. Configuration and current writes require readback. The initial profile uses 1/16 microsteps and a nominal current request capped at 800 mA RMS; quantization produces about 773 mA at the maximum request with nominal DVDD/KV. VREF and gain tolerances still require measurement. This does not authorize the motor's rated 6 A operation. No OTP programming, autotune or automatic fault clearing while running is implemented.

The RP2040 timer generates STEP edges every 20 us tick with a one-second ramp to **10 RPM** (200 full steps/rev). Main must renew a 25 ms safety lease; a stale lease, late timer or physical fault stops pulses with no catch-up burst. The retained U10/U11/U33 chain independently gates active-high ENABLE with power-good, voltage-window and temperature conditions. R55 pulls ENABLE low. The 250 ms watchdog is serviced only by main. These settings remain disabled until hardware qualification is recorded.

The local button requires release before a start request. Normal STOP ramps down; DISARM, power loss and faults stop immediately. Fault acknowledgement and another release/press are required before restarting. AS5600 angle/status reads reject missing/weak/strong magnets; it is optional telemetry, **not closed-loop control**. U18 remains DNP pending a proven rear magnet attachment on the single-shaft motor.

## Diagnostics and USB

Commands: `HELP`, `STATUS`, `POWER`, `DRIVER`, `DISARM`, `ARM` (blocked). Oversized command lines are discarded. STATUS includes board rail, PD contract, DATA VBUS, VMOTOR, phase diagnostics, brake continuity, temperature and readiness. DRIVER includes DRV fault registers and encoder validity/angle.

TMP102 thresholds remain 70 C trip / 55 C rearm, active-low hardware inhibit. ADS1115 samples VMOTOR, input-current monitor and brake return; raw **PD_VBUS** is independently measured by U38 INA237 (85 V input), at I²C address 0x40. `POWER` reports that raw voltage separately from VMOTOR, contract voltage/current, physical MOTOR_PG and derived PD_READY. PD_READY requires a fresh completed ADC conversion in the 44–51 V engineering window, live APP-mode sink 48 V/5 A EPR contract and the expected configuration identity. A stale, reset, missing or invalid sensor inhibits motion. This is not a dedicated hardware PD GPIO, nor an adapter/USB-PD certification. The eFuse MOTOR_PG input remains independently required. RP2040 GP26/27 read instantaneous INA240 phase voltages, GP28 digital LOGIC_PG_MCU board presence and GP29 DATA VBUS. ADC scaling assumes nominal 3.3 V and needs calibration; readings are not PWM-synchronous RMS measurements.

`NO_USB` prevents the Arduino core attaching before DATA VBUS is sensed. TinyUSB initializes at >=4 V; detach occurs below 3 V. USB suspend disarms, ends peripheral buses and invalidates telemetry. This port does not implement the old STM32 STOP0 routine: suspend current, inrush, pre-enumeration current, DATA removal and reverse current remain **unqualified**. The lock includes that explicit gate. No remote wake or motor start is requested. The independent brake retains U34's 12 V supply and Q16; integrated motor bridges do not replace regeneration protection.

## Programming and bench acceptance

Use an RP2040-compatible SWD probe with SWDIO, SWCLK, GND, MCU 3.3 V reference and RUN/reset, or BOOTSEL USB recovery. To request ROM USB boot, ground **TP_BOOTSEL** through its fitted 1 kohm connection to QSPI CS, pulse reset and release BOOTSEL once ROM USB boot is entered. Do not short QSPI CS directly or program while the motor bus is energized.

Program the generated UF2 using ROM USB, or the ELF/raw image using an RP2040-aware programmer at external-flash address **0x10000000**. Read back the programmed image range and compare its hash, then verify a full cold boot with USB-only power and with PD power. U3 has a **separate TI EEPROM image**; retain its complete 64 KiB readback and APP/EPR cold-boot verification procedure.

Before unlocking: native routing/DRC/ERC and exact pad map; 1.1/3.3 V rails and reset; oscillator startup; USB enumeration/current; PD image/readback; power-good and all fault paths; brake preflight; STEP/current waveforms at low current; heatsink/TIM installation; thermal, braking and EMC tests. Record the exact board/firmware hashes. Motor-rated current, speed, torque and stopping duty are not yet approved.

## Evidence scope

Host tests run the actual target main loop using fake peripherals for USB-only startup, board-power loss/recovery, suspend/resume, detach, indicators and the ARM lock. Portable tests cover PD-contract rejection, latched faults, telemetry, brake timing, DRV transport/configuration corruption, encoder validity, STEP ramp/stop/lease/late ISR/wraparound. The ARM build proves compilation against the pinned RP2040 APIs. Neither test method measures physical timing, USB current, thermal behavior or board connectivity.

Primary references: [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [RP2040 hardware design](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf), [TI DRV8462 SLOSE79B](https://www.ti.com/lit/ds/symlink/drv8462.pdf), [AS5600 datasheet](https://look.ams-osram.com/m/7059eac7531a86fd/original/AS5600-DS000365.pdf), [Arduino-Pico PlatformIO](https://arduino-pico.readthedocs.io/en/latest/platformio.html).

Save a complete 4 MiB binary readback starting at 0x10000000, then compare every programmed byte against the registered image:

```sh
bun scripts/verify-programming.mjs --kind rp2040 --readback board-flash.bin --serial BOARD_SERIAL --operator OPERATOR --programmer PROGRAMMER --output readback-record.json
```

The checker requires a full-capacity dump, compares the entire image, hashes the entire dump, and explicitly reports that bytes outside the image were not compared. This file check cannot attest that the dump came from the identified hardware. Keep the programmer log; cold boot and motor operation are separate physical checks.

USB suspend also disables U41 (`SENSE_EN` GP24), floats encoder I2C, cancels the STEP timer and idles at 60 MHz with USB clock retained (RP2040-E16). Resume restores the saved clock and STEP timer, requires fresh board readiness, waits 10 ms for sensor supply settling and remains disarmed. Measure suspend current, wake timing and sensor-rail discharge; these have not been physically qualified.
