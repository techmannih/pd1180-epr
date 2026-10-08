# PD1180 STM32 firmware

## Current deliverable: commissioning diagnostics, motion locked

`release/pd1180-commissioning-firmware.zip` contains an actual Cortex-M0+ ELF and raw binary for **STM32G0B1CBT6, LQFP48 GP, 128 KiB flash**. It is not a host executable. Do not use the different `...TxN` MCU variant. The archive manifest records source and image hashes.

The frozen PCB has a STEP/DIR conflict on U7 pins 23–25; see `docs/step-dir-hardware-review.md`. This image deliberately keeps POWER_PERMIT, MCU_RUN and SD_MODE low, even if an ARM command is sent. It does not spin a motor. The TI TPS26750 EEPROM configuration is also not yet generated/programmed.

Implemented target functions: ST USB CDC, PB6/PB7 I2C1 status reads from TPS26750 address 0x20 with count-byte validation, nominal ADC readings of USB VBUS/VMOTOR, safe GPIO initialization, and a 250 ms independent watchdog. USB attach/detach follows the PB0 VBUS divider. ADC values assume 3.3 V VDDA and require calibration. Hardware enumeration and timing remain untested.

USB commands are newline-terminated: `HELP`, `STATUS`, `DISARM`, `ARM`. ARM returns the blocking reason. Oversized lines are discarded. No command bypasses the hardware interlock. No CANopen, TMCL, RS485/RS232 motion or closed-loop encoder operation is claimed.

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

The pure-C safety state machine requires an explicit arm request, verified configuration/wiring, fresh data, an exact fixed 48 V/5 A contract, power-good/window/driver readiness and no protection/stop fault. Faults latch; DISARM then a new ARM is required. The target cannot satisfy configuration/wiring gates on the frozen design.

Host tests cover no automatic arm, thirteen independent shutdown cases, recovery latching, stalled timing, rejected non-48 V and under-current contracts, PD power role, capability mismatch, and physical GPIO mapping. Manufacturer pin order is independently checked: U16 pins 42–48 are PB3–PB9. Passing software tests does not substitute for physical bring-up.
