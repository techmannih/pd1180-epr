# Current motor harness and assembly boundaries

Use `motor-assembly.circuit.tsx` for the current source preview. The corresponding native PCB passes DRC, ERC and schematic parity; powered and mechanical qualification remain pending. The current model is not a secured or ready-to-run product.

1. Keep the existing four PCB drills unchanged. Rear fastening requires a confirmed thread specification and usable screw depth; CAD bore alignment alone is insufficient.
2. Use J2 B4P-VH with VHR-4N and four SVH-41T-P1.1 contacts. The factory 0.75 mm² motor wires join 16 AWG Alpha3057 pigtails through four TE320559 splices. Do not apply the 10 A VH/16 AWG catalogue rating directly to the thinner factory wire or to a motor current setting.
3. Follow black/green/red/blue cavity order 1/2/3/4 and verify winding continuity. Proposed pigtail cuts are 170/170/170/165 mm including 12 mm allowance. The harness shop must approve strips, crimps, tooling and first-article lengths.
4. TE320559's 32.13 mm length is verified; the 5 mm model outside diameter remains provisional. Actual TE drawing/CAD retrieval remains blocked by its download endpoint. No production fit is claimed.
5. The factory motor cable exit remains. Final harness strain relief, board attachment and physical bend/tool clearance are unresolved. No retention bracket is qualified.
6. J3 brake circuitry remains because regeneration cannot be presumed harmless to the USB power path. Resistor, heatsink, mounting and final cable geometry still need the actual load/stop duty and qualification; see `brake-integration.md`.
7. The motion command path is entirely on the PCB. SW2 requests the onboard SPI bench profile after qualification; SW1 resets the MCU. Both qualification flags are currently false.

See [source/destination inventory](connector-harnesses.md), [mounting status](motor-assembly.md) and [firmware](../firmware/README.md). The [external equipment guide](external-system.md) records the required EPR source/cable, J2 items and commissioning services separately from conditional brake cooling/install and optional encoder purchases. It also explains why U18/C52/C53 are bottom-side DNP and why visible J2 solder tails do not require moving components. No parts have been purchased by this work.
