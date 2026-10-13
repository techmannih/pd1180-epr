# PD1180 STM32 firmware

## Current deliverable: commissioning diagnostics, motion locked

`release/pd1180-commissioning-firmware.zip` contains an actual Cortex-M0+ ELF and raw binary for **STM32G0B1CBT6, LQFP48 GP, 128 KiB flash**. It is not a host executable. Do not use the different `...TxN` MCU variant. The archive manifest records source and image hashes.

The source ECO removes J7 and selects the TMC5160 internal SPI ramp with SD_MODE low. U7 pins 17, 18 and 23–25 are grounded; the rebuilt hardware still needs verification. This image deliberately keeps POWER_PERMIT, MCU_RUN and SD_MODE low, even if an ARM command is sent. It does not spin a motor. The TI TPS26750 full-flash candidate is generated; physical programming/readback is still pending.

Implemented target functions: ST USB CDC, PB6/PB7 I2C1 status reads from TPS26750 address 0x20 with count-byte validation, TMP102 threshold programming/readback, ADS1115 bus readings, nominal ADC readings of DATA VBUS and both phase currents, safe GPIO initialization, and a 250 ms independent watchdog. USB attach/detach follows the PB0 VBUS divider. ADC values assume 3.3 V VDDA and require calibration. Hardware enumeration and timing remain untested.

USB commands are newline-terminated: `HELP`, `STATUS`, `DRIVER`, `DISARM`, `ARM`. ARM returns the blocking reason. Oversized lines are discarded. No command bypasses the hardware interlock. No CANopen, TMCL, RS485/RS232 motion or closed-loop encoder operation is claimed.

## Rebuild

Install Python 3 and `platformio==6.1.19` in a virtual environment. The pinned platform/core/compiler packages are fetched from the PlatformIO registry into `.cache/platformio`.

```sh
bun run check:firmware-pins
bun run check:firmware
PIO=/path/to/venv/bin/pio bun run build:firmware
bun run check:firmware-target
```

Build uses ststm32 20.0.0, ST Arduino core 3.0.0 (package 4.30000.0), and ARM GCC 12.3.1. The ST generic variant supplies the Cortex-M0+ startup, HAL, HSI PLL at 64 MHz and HSI48 USB clock. The external 16 MHz HSE is not required by this initial image. USB uses ST's generic CDC identity for prototype bring-up; assign an authorized product VID/PID before distribution.

## Program and inspect after assembly

Use ST-LINK SWDIO, SWCLK, NRST, ground and 3.3 V reference; avoid two competing board supplies. In STM32CubeProgrammer select the exact MCU, program `firmware.bin` at **0x08000000**, verify flash, then reset. Do not modify option bytes or mass-erase other devices. U3 requires a separate TI-generated image; do not flash this STM32 binary into the EEPROM.

First checks: POWER_PERMIT=0, MCU_RUN=0, SD_MODE=0, USB at default 5 V enumerates, STATUS reports the measured bus approximately correctly, no motor energization. Compare ADC readings to a meter. Record watchdog/reset and cable detach behavior. This is an untested prototype image, not proof of motor operation.

## Shared logic and tests

The pure-C safety state machine requires an explicit arm request, verified configuration/wiring, fresh data, an exact fixed 48 V/5 A contract, power-good/window/driver readiness and no protection/stop fault. Faults latch; the local button acknowledges the fault, then a separate release/press is required to start. DISARM cancels motion immediately. The commissioning target intentionally cannot satisfy the configuration/wiring gates before hardware bring-up.

Host tests cover no automatic arm, sixteen independent shutdown cases plus temperature and telemetry conversion boundaries, recovery latching, stalled timing, rejected non-48 V and under-current contracts, PD power role, capability mismatch, and physical GPIO mapping. Manufacturer pin order is independently checked: U16 pins 42–48 are PB3–PB9. The host harness also executes the actual target main loop with simulated USB/ADC/I²C for USB-only startup, rail qualification/loss/recovery, suspend/resume, detach and the ARM lock. It does not emulate STM32 STOP timing or measure current. Passing software tests does not substitute for physical bring-up.

## Reference-board diagnostics ECO

TMP102 at 0x48 uses active-low comparator mode, a two-conversion fault queue and 8 Hz conversion rate. Firmware writes and reads back the 70 °C trip and 55 °C release limits. An absent, reset, invalid or stale sensor blocks the safety state machine. U33 also gates RUN_SAFE from the physical ALERT line; manual rearm remains necessary after a software fault. The pure-C policy requests current reduction from 60–70 °C; motor current writes remain disabled in this commissioning image. PCB temperature does not establish MOSFET junction temperature.

ADS1115 at 0x49 samples VMON_ADC, IIN_MON and BRAKE_RETURN in rotating, nonblocking single-shot conversions at 128 SPS and ±4.096 V range. PA0/PA1 instead measure the INA240A1 phase outputs (5 mΩ × 20 V/V = 100 mV/A). STATUS includes validity flags and nominal instantaneous mA. Values are not calibrated, PWM-synchronous or RMS measurements. Open-sensor, zero-offset, PWM transient and bandwidth checks remain mandatory.

DATA USB supplies only `V3V3_MCU` through the limiter, LDO and reverse-blocking OR. The board `V3V3` rail powers the driver logic, flash, encoder and sensors from PD/VMOTOR only. PB1 now measures that rail through R119/R120; the unused PD interrupt is replaced by this sense input while PD status remains polled. Peripheral access starts only after a 2.9–3.6 V reading remains healthy for 20 ms and stops on the first unhealthy sample. Chip selects are open-drain, released into external board-domain pullups. I²C and board-input pins become high impedance/analog when that domain is unavailable. USB-only STATUS reports `BOARD_OK=0` and invalid telemetry, rather than stale measurements.

USB suspend disarms, clears pending commands/telemetry, ends I²C and holds STATUS_GPIO low. STOP0 retains GPIO safety levels and the USB pullup. The RTC wake timer uses the same LSI oscillator as the IWDG and wakes the main loop every nominal 50 ms; only main reloads the 250 ms watchdog. USB EXTI wakes on resume/reset. Interrupts are briefly masked around the final suspend check and WFI, then the pinned HSI PLL and HSI48 clocks are restored before a pending USB handler can run. Clock restart failures reset the MCU. No option-byte watchdog freeze, auto-arm or USB remote wake is used. Resume requires fresh board-power qualification and sensor initialization; suspended time cannot make old samples valid.

The CDC descriptor declares bus power and requests a 500 mA configuration. Firmware and the MCU-only rail now implement suspend handling, but the 2.5 mA USB suspend ceiling, wake latency, pre-enumeration current, inrush, reverse current and source handovers still need instrumented hardware qualification. The TPS2553 is overload protection, not proof of USB compliance. No USB power state enables the motor.

Power-mode implementation references: [ST RM0444](https://www.st.com/resource/en/reference_manual/rm0444-stm32g0x1-advanced-armbased-32bit-mcus-stmicroelectronics.pdf), the pinned ST G0 HAL PCD/PWR/RTC drivers and [USB-IF suspend-current ECN](https://compliance.usb.org/index.asp?UpdateFile=Electrical).

## TMC5160 internal SPI ramp and local START/STOP

The SPI transport implements the TMC5160A two-datagram read pipeline at 1 MHz, mode 3, validates the write echo, and checks IOIN version/mode pins, GSTAT and DRV_STATUS. `DRIVER` reports these registers without configuring or clearing faults in the locked image. SPI becomes high impedance whenever VMOTOR or the board domain is unavailable.

The separately tested motor service initializes with DRV_ENN high and TOFF zero, verifies SD_MODE and disabled dcStep pins, programs the current and 256-microstep setting, then lets the safety state machine qualify driver readiness before MCU_RUN. The first tuning setting is IRUN=6, GLOBALSCALER=139 and 33 mΩ sense resistance: approximately 0.83 A RMS. Thermal reduction scales this requested current and rounds downward. Reset, transport failure or driver fault invalidates configuration; automatic reinitialization while armed is prohibited. DISARM is required before another attempt.

These paths are integrated but not enabled in the archived commissioning image. Enabling them requires recorded PD-image/readback and powered hardware qualification; no USB command can bypass that decision. Gate timing, switching overshoot, short-circuit detection and chopper parameters remain starting values requiring oscilloscope and current-probe checks before increasing toward the 3.8 A RMS design ceiling. No OTP is programmed.

Initialization explicitly writes SHORT_CONF=0x00010C06 (S2G=12, S2VS=6, 1 µs filter, normal delay) and DRV_CONF=0x00000400 (four-clock break-before-make, weak drive). ADI §11.2 recommends S2G≥12 when VS can exceed 52 V. These initial settings no longer depend on OTP variants; both writes require a valid SPI echo while TOFF remains zero. The timing is not a measured or qualified gate waveform. Regression tests cover both documented OTP variants and reject corrupted writes to either register.

Protocol and register reference: [ADI TMC5160A datasheet, rev. 1.18](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf), sections 4 and 6. Host regressions cover pipelined reads, write corruption, invalid device responses, mode-pin mismatches, driver resets/faults, current derating and explicit rearm.

## Visible status and alarm

U35 TCA9538 at 0x70 drives the RGB LED and the active buzzer through Q26. PC13 / STATUS_GPIO is now its active-low reset, rather than a heartbeat; TP_STATUS probes that reset. It is held low by a physical 10 kΩ pulldown while the MCU resets, and firmware also asserts it on board-power loss, USB suspend or indicator-bus failure. The buzzer gate has a separate pulldown. Initialization writes the off latch before setting output directions, verifies register readback and waits before retrying after faults.

Blue identifies this motion-locked commissioning image. A latched motor fault, valid driver fault or valid temperature at/above 70 °C gives red plus a 200 ms alarm every 2 s; the alarm never controls motor protection. Amber/green describe power/telemetry states in a subsequently qualified application. `STATUS` includes `INDICATORS_OK`; zero can mean unpowered, not initialized or a bus fault. D17 independently indicates board V3V3 and stays off on DATA-only power. See [indicator circuitry and current budget](../docs/indicators.md).

Host tests use an emulated expander only; all other absent sensors still fail closed. They cover reset/power/suspend silence without I²C, output polarity, bounded alarm pulses, latch-before-direction ordering, each initialization-write failure and expander brownout. The archived image still needs electrical, sound and visibility tests on actual hardware. U3 programming uses the separate [isolated EEPROM fixture](../docs/pd-programming.md).


SW2 connects MCU PC6 to ground with an external 10 kΩ pull-up to V3V3_MCU.
After qualification, release then press SW2 to request the fixed bench profile:
nominal 10 rpm, nominal 10 rpm/s at the TMC internal 12 MHz clock (uncalibrated).
The MCU uses SPI VMAX/AMAX registers; there is no external STEP/DIR command cable.
SW1 remains RESET. Reference-board RP2040 RUN/BOOTSEL buttons are reset/boot controls,
not evidence of a motor start application; their firmware is not supplied.

Initialization sets VMAX=0 and verifies VACTUAL=0 before enabling the chopper.
A second SW2 press writes VMAX=0, retains bridge enable during the controlled ramp,
and removes enable after VACTUAL reads zero. A 3 s stop timeout or SPI failure
latches shutdown. This is a functional stop, not a safety-rated emergency stop.
USB suspend/detach, reset and supply faults cancel motion without automatic restart.
Host tests exercise button bounce, held-at-power-up, arm cancellation, actual velocity
stop completion, timeout, lost SPI acknowledgement and the qualification lock.
The shipped binary still has all three hardware qualification flags false; it cannot spin
this motor. TI configuration, scope/current-probe validation and powered testing remain required.

## Brake preflight and conservative operating envelope

The 2026-10-13 power ECO adds R134/R135 (4.7 kΩ each), R136 (510 Ω) and C98 to ADS1115 AIN2. The target cycles AIN0/1/2 and checks three distinct fresh AIN2 conversions against AIN0 before RUN. At 44–50.4 V bus, BRAKE_RETURN must be within ±10% of VMOTOR. Power-permit is allowed first so the check has a powered bus; the bridge remains inhibited. Missing/invalid feedback times out and latches a fault. Power loss, disarm, USB suspend and reset discard the result. During RUN the same monitoring remains active. The ADC multiplexes bus and brake-return conversions, normally up to 40 ms apart. A low return can therefore accompany an older 48 V bus sample during normal Q16 switching. Both channels must be valid and no older than 100 ms. The first mismatching observation starts a fixed 100 ms retry window regardless of the stored bus value, allowing a complete new ADC scan. Only a distinct fresh healthy pair within ±10% at 44–50.4 V clears the pending mismatch. Repeated polls, continued bad pairs, or just one updated channel cannot renew the deadline. Invalid/stale ADC or a bus outside 44–55 V faults immediately at the next check. The separate 44–51 V motor-bus interlock remains active. Checks run every 50 ms, followed by the 10 ms control tick. The 60 ms ADC scan, first detection, 100 ms retry and polling phase can accumulate to roughly 270 ms plus conversion/filter/I2C timing; this is not a guaranteed 100 ms disconnect-to-inhibit response. Measure the actual bound before enabling motion. A brake pulse that prevents a healthy pair for the whole retry window deliberately inhibits motion. This is voltage continuity surveillance, not brake-current/resistance measurement or a redundant energy sink. ADC/filter/poll/control latency and bus overshoot during an actual running cable-open event remain unmeasured. It cannot authorize higher-current operation.

`brakeHardwareVerified`, `motionWiringVerified` and `pdImageVerified` all remain false. Qualification must include a physically fitted brake resistor, open-cable preflight, clamp waveform, current-probe and thermal tests. No USB command can set these flags. The source ceiling uses GLOBALSCALER=139, IRUN=31 (3.781 A RMS nominal); the ±5% driver/±1% sense sensitivity gives 5.67 A sine peak, below the motor's 6 A/phase label. This is a conservative screen, not guaranteed calibration at this scaler. First motor-enabled testing is restricted to a secured, unloaded motor, 10 rpm, approximately 10 rpm/s ramps and IRUN=6 (0.827 A RMS), after the listed gates pass. Reset inhibits the driver; the watchdog has a nominal 250 ms timeout; bulk/brake energy absorption must be verified for that fault path.

The driver configuration, current setter and motor service reject requests above 240 permille before SPI access, including requests that would become smaller after thermal derating. With GS=139 this bounds IRUN to 6 (approximately 0.827 A RMS nominal); all three qualification locks and startup brake continuity checks remain required. This software bound is not a measured current guarantee.

The TI full-flash candidate is now archived with its license and project. Each PD poll also reads customer register 0x06 and requires `PD118041` before the configuration permit can become true. This identity is a version marker, not cryptographic attestation; programmer readback and the unchanged `pdImageVerified = false` qualification lock remain required. See `docs/pd-configuration-review.md`.
