# MOTOR_A2 exported-board connection repair

The downloaded tscircuit v0.3.111 board (main a0ccee1) reproduces one unconnected MOTOR_A2 finding after KiCad refills the zones. The reported 0.5675 mm and 19.1576 mm In1.Cu tracks retain their native coordinates. A narrow connecting pour neck is removed during refill; the resulting gap is approximately 0.0534 mm.

The native zone used a 0.20 mm minimum fill width. The downloaded zone uses 0.25 mm. This revision adds a 0.60 mm explicit In1.Cu MOTOR_A2 track from (111.05, 134.50) to (112.00, 133.55) mm, retaining the existing copper. Every other unfilled native object is unchanged, including all footprints, other tracks, zone outlines/settings and mounting holes.

Fresh paired KiCad verification: **0 unconnected, 0 schematic-parity issues, 0 ERC findings**. The existing **8 J1/J10 hole-clearance errors and 488 cosmetic warnings remain**. Exact reports and the corrected paired project are in [the test ZIP](../engineering/motor-a2-export-fix.zip).

The focused regression rejects removal, duplication, narrowing, wrong-layer/wrong-net edits and unrelated native changes. Run `bun test scripts/motor-a2-export-bridge.test.mjs`.

This is an expedited draft for the user's independent test. The complete manufacturing/release bundle and power-copper evidence have not been regenerated for this additional track; their existing hash guards must continue to reject stale evidence. The updated routed preview includes the bridge, but a new website download/refill result has not yet been verified. Use the corrected paired project in the test ZIP for the reported native result. No full-review/CI or hosted-download pass is claimed.
