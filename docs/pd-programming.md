# PD EEPROM fixture and power probes

U3 holds the TPS26750 application image. USB DATA and MCU SWD do not program a blank U3. U36 (SN74LVC2G66DCUR) separates the controller's EEPROM I2Cc bus from the EEPROM-side programming pads. R131 normally enables both switches. Grounding TP_PD_ISO opens both wires; R129/R130 provide 4.7 kΩ EEPROM-side pullups. Existing controller-side pullups remain.

The TI-generated full-flash candidate and both license approvals are recorded. `pd-configuration.json` identifies the binary and its hash; it is not itself flashable. Fixture implementation, physical programming/readback and cold boot remain required before shipment.

## Fixture contacts

| Pad | Function | Fixture connection |
|---|---|---|
| TP_PD_GND | Logic ground | First make / last break ground |
| TP_PD_VREF | PD_3V3 | High-impedance target-voltage sense only |
| TP_PD_ISO | EEP_LINK_EN | Ground during programming; release for normal boot |
| TP_EEP_SDA | U3 pin 5 | 3.3 V open-drain SDA |
| TP_EEP_SCL | U3 pin 6 | 3.3 V open-drain SCL |
| TP_PD_VBUS | Raw PD input | Rated voltage probe; up to the documented EPR/transient envelope |
| TP_VMOTOR | Protected motor bus | Rated voltage probe; retain discharge/regen precautions |
| TP_PWR_GND | Power ground | Power measurement return |

Silkscreen **1 = TP_PD_VREF, 2 = TP_PD_GND, 3 = TP_EEP_SDA**; the remaining new contacts are marked SCL, ISO, PD V, VM and GND. These are fixture identifiers, not an assumed connector pin order.

All are bare top-side Ø1.4 mm copper pads, excluded from fitted BOM/CPL and the solder-paste stencil. This is a custom pogo fixture footprint, not a standard programming connector. Source coordinates below use the board centre as (0, 0), +X right and +Y up when viewed from the component side. The native KiCad coordinates use X = 100 + source X and Y = 100 − source Y, in millimetres; verify the exact release board before fabricating the fixture.

| Pad | Source X, Y (mm) | Native KiCad X, Y (mm) |
|---|---|---|
| TP_PD_VREF | −15.50, 25.25 | 84.50, 74.75 |
| TP_PD_GND | −20.00, 22.25 | 80.00, 77.75 |
| TP_EEP_SDA | −19.25, 20.25 | 80.75, 79.75 |
| TP_EEP_SCL | 0.75, 19.25 | 100.75, 80.75 |
| TP_PD_ISO | 7.00, 38.00 | 107.00, 62.00 |
| TP_PD_VBUS | 7.00, 41.00 | 107.00, 59.00 |
| TP_VMOTOR | 10.50, 38.00 | 110.50, 62.00 |
| TP_PWR_GND | 19.50, 40.75 | 119.50, 59.25 |

Keep probe barrels and cable strain relief clear of adjacent parts. The 48 V pads are not logic contacts and must not reach the programmer.

## Blank-board sequence

1. Disconnect the motor, brake load and other externally driven interfaces. Discharge VMOTOR and verify it before attaching the fixture. Keep MCU reset asserted through TP_NRST so no application activity starts.
2. With the board unpowered, connect grounds, pull TP_PD_ISO low and keep programmer SDA/SCL high impedance. Disable the programmer's VCC output. U36 is not specified as power-off isolation; do not drive an unpowered board.
3. Apply a current-limited **fixed 5 V source to J1**. Do not negotiate EPR during programming. Verify PD_3V3 at TP_PD_VREF is within the EEPROM/controller operating range and verify isolation stays asserted before enabling the programmer.
4. Use a 3.3 V open-drain programmer at 100 kHz. Do not add 5 V pullups. U3 address pins E0/E1/E2 are grounded and WC is grounded; its 7-bit address is 0x50 (wire address bytes 0xA0 write / 0xA1 read). The [ST M24512 datasheet](https://www.st.com/resource/en/datasheet/m24512-r.pdf) specifies 65,536 bytes, a two-byte memory address sent high byte first, 128-byte pages and up to 5 ms per write cycle. End each write before the next 128-byte boundary, then ACK-poll for completion with a bounded timeout; abort on timeout rather than continuing to the next page. This EEPROM uses ordinary I2C memory transactions, not the TPS26750 register byte-count protocol.
5. Write the approved **full** TI flash image, read back the programmed address range and compare it byte-for-byte. Record board serial number, binary SHA-256, programmer settings and readback SHA-256. Never substitute the requirements JSON or a register dump.
6. Return programmer SDA/SCL to high impedance, remove board power, verify discharge, then release TP_PD_ISO. Remove the fixture or leave only high-impedance probes attached. Release MCU reset.
7. Cold boot on fixed 5 V first. Verify the TPS26750 enters APP mode and boots the intended configuration. Only then run the staged EPR/power tests. Keep motor outputs locked until the approved PD image and hardware qualification records are in place.

The fixture must stop I2C immediately if target VREF falls, and must not release isolation while actively programming. Qualify ground-first sequencing, contact bounce, isolation at both wires, absent-target behavior, interrupted writes and recovery on a first article. This document specifies the intended procedure; it is not evidence that a fixture or assembled board has passed it.

## Electrical basis

TI's [SN74LVC2G66 datasheet](https://www.ti.com/lit/ds/symlink/sn74lvc2g66.pdf) specifies two normally open bilateral channels controlled independently. Pins 3 and 7 are joined so the fixture opens both together. The switch is powered from PD_3V3; its analog ports must remain inside the allowed supply range. There is no separate programmer power input to backfeed that rail.

With both sides joined, the paired 4.7 kΩ pullups give about 2.35 kΩ per line (approximately 1.4 mA at 3.3 V). With isolation asserted, each side retains its own 4.7 kΩ pullup. Bus rise time/capacitance, low-level voltage through the switch and cold boot must be measured on the first article. TI image generation follows the [TPS26750 application customization guide](https://www.ti.com/lit/ug/slvucp8/slvucp8.pdf).

## Save and verify programming readback

The provider must save the programmer's log and complete raw memory dump: U3 has 65,536 bytes starting at 0x0000; U16 has 131,072 bytes starting at 0x08000000. Keep the board serial, fixture/programmer identity, operator and programming timestamp with those files. A copied input binary is not a device readback.

From the repository root, compare a U16 dump with the current commissioning archive:

```sh
bun scripts/verify-programming.mjs --kind stm32 --serial FIRST-ARTICLE-001 \
  --operator 'provider engineer' --programmer 'ST-LINK serial / tool version' \
  --readback /path/to/u16-readback.bin --output /path/to/u16-verification.json
```

For U3, use the same command with `--kind pd` and the EEPROM dump. The reviewed TI Full Flash candidate is registered under `eeprom.image` in `pd-configuration.json`; its `path` is the release ZIP and `archive_member` is `fullFlash.bin`. Extract that member for the programmer, starting at address 0. It has 31,552 bytes, not the full EEPROM capacity. Read back all 65,536 device bytes for the comparator, which checks every programmed image byte and explicitly does not qualify the remaining tail. Never relabel a low-region export or requirements JSON to bypass that check. Archive the matching TI project export and tool version with the image. The file comparator checks identity and content; it cannot determine whether the TI settings are electrically correct.

The command checks every image byte, rejects stale STM32 source identities, and refuses to overwrite an earlier report. Bytes beyond the image are recorded in the full dump hash but not accepted against an invented padding pattern. A successful comparison proves neither cold APP boot nor motor operation. Keep the separate cold-boot, EPR negotiation, safety-inhibit and motor test records required in `power-validation.md`.

The [unused-SBU correction](pd-configuration-review.md) is applied and native-checked. Its physical startup/fault validation remains open even after a successful memory comparison.

## Prepared TI image; physical programming pending

Run `bun scripts/check-pd-image.mjs` before programming. Keep all three motion qualification flags false. Retain the complete EEPROM dump, programmer log, serial and SHA-256; verify `APP ` and register 0x06 = `PD118041`, then perform the stationary fault/negotiation sequence in `pd-configuration-review.md`. An exported binary is not a readback. TI tool import can reset role-dependent fields; use the archived reviewed binary or re-export and revalidate all fields. No hardware was flashed in this review.
