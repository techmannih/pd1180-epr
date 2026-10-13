# Current motor harness and assembly boundaries

Use `motor-assembly.circuit.tsx` for the current source preview. Native PCB routing is still pending for the onboard-control ECO. The current model is not a secured or ready-to-run product.

1. Keep the existing four PCB drills unchanged. No rear fasteners may be specified from the CAD bore alone; the extra front-post/adapter assembly is withdrawn.
2. Use J2 B4P-VH with VHR-4N and four SVH-41T-P1.1 contacts. The factory 0.75 mm² motor wires join 16 AWG Alpha3057 pigtails through four TE320559 splices. Do not apply the 10 A VH/16 AWG catalogue rating directly to the thinner factory wire or to a motor current setting.
3. Follow black/green/red/blue cavity order 1/2/3/4 and verify winding continuity. Proposed pigtail cuts are 170/170/170/165 mm including 12 mm allowance. The harness shop must approve strips, crimps, tooling and first-article lengths.
4. TE320559's 32.13 mm length is verified; the 5 mm model outside diameter remains provisional. A manufacturer Rev V2 drawing was retrieved from the distributor and archived in `engineering/mechanical/TE-320559-drawing.zip`; it dimensions length but not exterior diameter. TE lists V6, whose download remains unavailable. Rev V2 specifies 2.03–3.18 mm wire insulation OD. Alpha3057 fits that range; the factory 0.75 mm² conductor area does not establish its insulation OD. Measure the actual motor leads and obtain current TE crimp acceptance before using this splice. No production fit is claimed.
5. The factory motor cable exit remains. Final harness strain relief, board attachment and physical bend/tool clearance are unresolved; the removed custom bracket is not part of the BOM.
6. J3 brake circuitry remains because regeneration cannot be presumed harmless to the USB power path. Resistor, heatsink, mounting and final cable geometry still need the actual load/stop duty and qualification; see `brake-integration.md`.
7. No external STEP/DIR/enable or home/limit harness remains. SW2 requests the onboard SPI bench profile after qualification; SW1 resets the MCU. Both qualification flags are currently false.

See [source/destination inventory](connector-harnesses.md), [mounting status](motor-assembly.md) and [firmware](../firmware/README.md). Required external sourcing still includes the EPR source/cable, exact wire colour SKUs, crimp tooling, brake cooling/install and programming fixture. No parts have been purchased by this work.
