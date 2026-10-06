# Firmware

This directory contains the board-level safety state machine, generated STM32G0B1 pin contract and the initial TMC5160A current configuration. The host build makes the power sequence and immediate fault shutdown reviewable without requiring an STM32 toolchain.

```sh
cmake -S firmware -B firmware/build
cmake --build firmware/build
ctest --test-dir firmware/build --output-on-failure
```

`POWER_PERMIT` remains low until a stable 48 V / 5 A EPR contract is reported. `MCU_RUN` remains low until motor power-good and the independent VMOTOR window are also stable. Any PD/eFuse/watchdog fault removes both outputs in the same state-machine tick.

The final STM32 target port must bind these pure-C modules to GPIO, ADC, SPI, USB, CAN and serial peripherals. The generated TI TPS26750 configuration image is an external release input and must be programmed into U3 before EPR operation.
