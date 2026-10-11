# Status, power and alarm circuitry

U35 is a TCA9538PWR at 7-bit address 0x70 on the existing board-domain I2C bus. U35 and C95 use **PD_3V3**, the same rail as the PD_SCL/PD_SDA pull-ups. TI requires SCL/SDA not to exceed VCC, including startup and power removal; the expander must not use the independently sequenced V3V3 rail. A0/A1 are grounded. It supplies the four outputs needed by the RGB LED and alarm without taking pins away from the industrial interfaces. PC13 / STATUS_GPIO, formerly a heartbeat service signal, now controls U35's active-low RESET. TP_STATUS exposes that reset signal. R132 holds it low during MCU reset; firmware releases it only after board power is qualified.

D16 is the common-anode NH-B2020RGBA-HF: pin 3 anode, pin 1 red, pin 2 blue and pin 4 green. P0/P1/P2 sink red/green/blue through 1 kΩ/330 Ω/330 Ω. U35 P4–P7 stay inputs tied to GND; INT is intentionally unused. Firmware initializes output latch 0x07 before direction register 0xF0, checks register readback and resets U35 on communication failure. No indicator state enables motion.

| Visible state | Meaning |
|---|---|
| Blue | Commissioning firmware; motion locked |
| Amber | Qualified application waiting for fresh power/temperature telemetry |
| Green | Qualified power/telemetry; query USB STATUS for actual RUN state |
| Red with 200 ms chirp every 2 s | Latched control fault, valid driver fault or measured board temperature at/above 70 °C |
| All off | Reset, absent board supply, USB suspend or indicator I2C failure |

D17 is an independent red power LED through R128 (4.7 kΩ) on **board V3V3**. It does not indicate USB-only MCU power; measure TP_SWD_3V3 for that rail. These additions cannot be powered from USB DATA alone.

BZ1 is an active FUET-9650B-3V buzzer with an internal oscillator. Q26 AO3400A switches its negative lead; R126 (1 kΩ) limits gate charging to below 3.7 mA at a 3.6 V rail, within U35’s 10 mA high-output limit. R127 (100 kΩ) holds the gate low while U35 is reset or unpowered. D18 BAV21W has its cathode on V3V3 and anode on the switched lead. C96 supplies bulk decoupling through a constrained top-layer path of at most 7 mm to the positive terminal. The larger buzzer body needs this longer branch; this is distinct from the IC bypass limits. This alarm is an operator indication, independent of the motor's hardware inhibit chain.

## Design allocations and qualification

Allocate 75 mA additional logic-system current: 60 mA for buzzer margin plus LED, expander and gate/pullup current. The buzzer specifies at most 30 mA at **3 V** and operates over 2–5 V; the 60 mA allowance at board-rail extremes is a design budget, not a manufacturer maximum or measured result. At 3.6 V the allocation is 0.27 W. The LED/buzzer load is on V3V3; expander and gate-drive current is on PD_3V3. Check combined rail load, supply/OR-device drop and thermal margin at minimum/maximum rail and enclosure temperature.

Nominal RGB currents from typical forward voltages are approximately 1.3 mA red, 1.8 mA green and 1.5 mA blue at 3.3 V before sink-voltage drop. Actual LED brightness and colour balance depend on bins, temperature and rail tolerance; the listed maximum green/blue forward voltage leaves little low-rail headroom. Verify clear visibility at the qualified minimum supply. Power LED current is approximately 0.28 mA at a nominal 2 V forward drop. No optical brightness guarantee is inferred from a schematic.

Firmware host tests cover output polarity, latch-before-direction initialization, alarm duration, reset, missing I2C device, failed initialization writes, expander brownout and USB/power isolation. First-article tests must also verify audible output, cold-boot silence, reset/watchdog silence, rail-current transients and no sound after a bus failure.

Primary sources: [TI TCA9538](https://www.ti.com/lit/ds/symlink/tca9538.pdf), [AOS AO3400A](https://www.aosmd.com/sites/default/files/res/datasheets/AO3400A.pdf), [NationStar LED](https://datasheet.lcsc.com/datasheet/pdf/231c4d2c9a56cafdc8401a79fb0bfc62.pdf?productCode=C2874116), [FUET buzzer](https://datasheet.lcsc.com/datasheet/pdf/108add109d00ccdea1734cb9c944bf18.pdf?productCode=C391032).
