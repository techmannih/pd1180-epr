# U16 and boot-flash assembly contract

The current design uses **Raspberry Pi RP2040 / JLCPCB C2040**, LQFN-56(7×7), with exposed ground land represented as pin 57. The source land pattern is `imports/RP2040.tsx`; final solder/paste/drill geometry is in the paired native release. Follow the [RP2040 hardware-design guidance](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf) and approve stencil windowing, filled/capped via-in-pad and QFN joint inspection against those actual files.

U17 is **Winbond W25Q32JVSSIM / C6000508**, SOIC-8-208mil, **4 MiB**. It is required boot flash on V3V3_MCU. All six QSPI signals, including SD2 and SD3, connect to RP2040; it is not an optional settings device. Firmware uses the pinned RP2040 boot stage and flash configuration. Verify cold BOOTSEL/application boot and complete readback on the assembled board.

Supply contracts: RP2040 I/O/USB/ADC and regulator input use V3V3_MCU; its regulator output supplies V1V1_MCU. Preserve bypasses and clock circuitry. Native pin/net checks cover these connections; they do not replace measured sequencing or solder inspection.

Use the current `pd1180-commissioning-firmware.zip`, with the registered hashes and source identity. The raw application address is **0x10000000**. Complete external-flash readback is **4,194,304 bytes**; follow `pd-programming.md` and `firmware/README.md`, including the erased tail and device/operator evidence. Do not flash a previous STM32 image or use its address, memory size or pinout.

All four qualification flags remain false. The commissioning image can diagnose the board but cannot authorize motor operation. Optional AS5600 U18 is bottom DNP; C52/C53 are top DNP. The native board's eight retained USB hole errors and cosmetic findings remain separate manufacturing holds.

Historical `engineering/u16-footprint-review.json` and `engineering/stocked-controller-eco.json` describe the superseded MCU ECO. They must not be used as assembly instructions for this revision. Current architecture evidence is `rp2040-redesign.json`, `rp2040-via-in-pad.json`, the manifest and the paired native project.
