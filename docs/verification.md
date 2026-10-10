# Verification evidence

The current generated summary is [verification.md](../verification.md), with per-check results and input hashes in [verification.json](verification.json). Run `bun run review` to refresh engineering checks, live supplier evidence and review artifacts.

Native manufacturing evidence is in `dist/manufacturing/kicad-drc.json` and `dist/manufacturing/kicad-erc.json`. The checks include all severities, connectivity and schematic parity. The current route record is [routing-report.json](routing-report.json), and the final terminal-only sense-path evidence is [critical-copper-check.json](critical-copper-check.json).

`check:release` additionally enforces [release-status.json](release-status.json). Passing CAD checks does not clear the order hold: USB power behavior, clipped power-copper necks, thermal performance, TI configuration and powered commissioning remain unqualified. Production and motor operation are not released.
