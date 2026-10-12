# Onboard-control and mounting simplification — 12 October 2026

This supersedes the earlier external-command/front-post proposal. **Current source, firmware and native PCB routing are implemented; fresh native DRC, schematic parity and ERC pass. No powered or mechanically secured product is claimed.**

- Removed J7 and 33 associated parts from TSX: U8/U9 and bypasses, six input/enable transistor stages and their dedicated resistors/diodes. Exact refs/nets: `engineering/onboard-control-eco.json`.
- Added top-side SW2 START/STOP and R133 MCU-domain pull-up. SW1 RESET remains.
- Grounded unused U7 ramp-mode inputs; grounded Q14 emitter after removal of Q15. Power, voltage, temperature, driver-disable pull-up and regenerative-brake circuitry remain.
- Implemented bounded internal SPI velocity control and debounced local start/controlled stop. Held-at-startup, fault, reset, communication failure and power recovery do not automatically restart motion. The shipped STM32 image remains locked pending TI image and powered qualification.
- Removed 51 mounting fixture models (long posts, adapter, spacers, screws, nuts/washers and attached clamp/support). Kept all four Ø4.2 mm PCB holes and their positions unchanged; no replacement fasteners assumed.
- Kept the connected 15-part motor/J2 harness preview. The existing 19.5 mm gap is only a display separation, not a qualified mounting stack.

[Before](../previews/onboard-control-before.png) · [After](../previews/onboard-control-after.png).

## Retained connection inventory

The exact [source/destination table](connector-harnesses.md) replaces the earlier J7 inventory. There is no external command product to source. J2 remains JST VH because PH/XH current ratings do not establish suitability for this motor. The original motor's 0.75 mm² conductors and 16 AWG crimp tails are treated separately.

## References and limits

NEMA17 `imrishabh18/rp2040-motor-controller` v1.0.42 and NEMA23 `imrishabh18/nema-23-stepper-controller` v1.3.2 route onboard RP2040 outputs to their drivers. Their RUN/BOOTSEL switches are reset/boot controls, and both READMEs explicitly omit executable motor firmware. They are hardware references, not proof of a tested turnkey system. Our STM32/TMC5160 uses a local START/STOP button and internal SPI ramp; RP2040-specific BOOTSEL wiring is not copied.

J3 remains under [brake review](brake-integration.md). It cannot be removed based only on connector count: reverse blocking prevents assuming recovered energy will flow back into the USB source. Load inertia, speed, stop duty, resistor/heatsink placement and harness remain unresolved.

Rear motor thread/usable depth, final board fastening and harness retention, TE splice OD, TI full-flash image, exact stocked BOM and powered/current/thermal/EMC tests remain open. Source/3D checks do not close these gates. Current native fabrication outputs have been regenerated. The review/order gate remains blocked by sourcing and qualification; a clean CAD export is not a ready-to-run product.

The CLI's intermediate C11/C12 overlap message is still printed. Final source records contain no errors/warnings and the schematic style analyzer reports zero issues; this does not mean the CLI log itself is warning-free.

## Final build result

Both `bun run build` and the configured website build pass locally, including 3D previews. The viewer checker now validates the actual mechanical parts manifest instead of the obsolete fixed count of three. BOM export uses reviewed source identities independently of a missing stock-service response; live availability still blocks ordering.

The full rerun passes 34 of 37 checks and all 66 regression tests. Three checks remain failed: placement (C23/R56/C41 routing-crossing/rotation suggestions), assembly and board standards (exact live stock/package evidence). The placement log separately reports zero placement DRC errors/warnings; these suggestions were not waived or used to change the approved routing. Fresh native PCB DRC, connectivity, schematic parity and ERC are all zero. See `docs/onboard-control-build-check.json` and `verification.md`. No hardware operation or published release is claimed.
