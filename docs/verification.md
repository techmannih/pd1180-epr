# Engineering verification evidence

The current automated result is [verification.json](verification.json); the root [verification.md](../verification.md) is its generated summary. Run `bun run review` to check source, firmware, native routing, assembly outputs and release consistency for the same revision.

The current DATA-only native PCB reports **0 unconnected items, 0 schematic-parity findings and 0 ERC findings**. Raw DRC contains **8 J1/J10 hole-clearance errors and 488 cosmetic warnings**, with no other accepted electrical errors. Keep those exact findings visible in the fabricator review. The retained USB exception records the geometry; it does not record manufacturer acceptance.

[Power-copper evidence](copper-geometry-review.md), native bypass/Kelvin checks and source/native spacing checks cover the routed board. The reports bind the result to input hashes. The release checker rejects changed inputs or failed engineering checks; inventory quantities and assembly/process acceptance are recorded independently in [release-status.json](release-status.json).

[Assembly](assembly.md) describes fabrication files and installation. [Commissioning](commissioning.md) supplies diagnostic, stationary-power and bounded-motor software workflows. Programming/readback, cold boot, current, braking and temperature results are recorded on assembled hardware. The behavioral simulation cases remain available for choosing and evaluating that test envelope.
