# Engineering evidence map

The repository keeps generated checks separate from design intent. This index maps the short root-level files to their complete evidence so reviewers and future board agents can find the authoritative record quickly.

| Engineering area | Contract / source | Generated evidence |
|---|---|---|
| Product features | `feature-parity.tsx`, `hardware-contract.json` | `docs/feature-parity-check.json` |
| Board markings | `board-markings.tsx`, `board-standards.json` | `docs/board-standards-check.json` |
| Mechanical pattern | `hardware-contract.json`, `mounting-template.svg` | `previews/mounting-template.png` |
| Power copper | `routing/requirements.json`, `scripts/reinforce-power-copper.py` | `docs/power-routing-check.json` |
| Assembly | `board-standards.json` | `docs/assembly-check.json`, `release/jlc-bom.csv`, `release/jlc-cpl.csv` |
| Component supply | `index.circuit.tsx`, `sourcing/` | `docs/stock-report.json`, `docs/alternatives.json` |
| Firmware interface | `hardware-contract.json` | `docs/firmware-pinmap.json`, `firmware/include/board_pins.h` |
| Complete review | `scripts/verify.mjs` | `verification.md`, `docs/verification.json`, `docs/checks/` |
| Delivery integrity | `board-standards.json` | `delivery-manifest.json`, `release/sha256.json` |

Compatibility patch files are added only when the pinned tscircuit version requires them. Do not carry version-specific prototype patches into this board without a failing regression fixture.
