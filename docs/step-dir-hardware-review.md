# TMC5160 operating-mode review

The current source uses the TMC5160 internal SPI ramp with SD_MODE held low. J7 and its external STEP/DIR/ENABLE/home/limit conditioning have been removed. U7 pins 17, 18, 23, 24 and 25 are grounded; the retained STM32 PA8 connection and R36 pulldown keep SD_MODE low. The prior external STEP/DIR architecture is superseded.

SW2 is a local START/STOP input on STM32 PC6 with a 10k pull-up to the MCU power domain. SW1 remains reset. Firmware selects positive velocity mode, limits the commissioning target to approximately 10 RPM at the nominal clock, and commands VMAX=0 before a normal stop. It waits for zero actual velocity before disarming; communication failures and stop timeout latch a fault. A physical release and a separate press are required to start again.

The existing hardware RUN_SAFE chain, driver-enable pull-up, temperature inhibit, bus protection and brake stage remain. U7 pin functions and velocity-ramp semantics are checked against [ADI TMC5160A datasheet Rev.1.18](https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf). These changes do not certify a stop time or emergency-stop function.

The actual STM32 image and host tests build, but `motionWiringVerified` and `pdImageVerified` remain false. Motor power/motion are locked until the TI image, gate drive, current regulation, protection and powered motor behavior have recorded bench evidence.
