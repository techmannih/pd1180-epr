# Brake and overvoltage protection changes

Engineering working copy; **not ready for powered/full-current operation or fabrication**. No hardware was tested and no release was published. This report covers applied resistor changes, not an implemented brake-disconnect interlock.

## Actual changes

- **R61: 16 kΩ → 16.2 kΩ**, YAGEO **RT0603BRD0716K2L / C728583**. Retains brake-release margin after adding comparator common-mode/supply effects to the calculation.
- **R66: 1 kΩ → 1.2 kΩ**, YAGEO **RT0603BRD071K2L / C136970**. Lowers nominal motor cutoff from **53.69 V to 53.21 V**.
- TSX, component manifest, hardware contract and native KiCad PCB/schematic values match. Both are 0603, 0.1%, 25 ppm/°C. [Manufacturer/supplier selection](selection.json), [YAGEO datasheet](yageo-rt-datasheet.pdf).
- The [native comparison](native-change-check.json) proves every pad, net, footprint position, reference label, track, via and copper pour is unchanged. The 3D shapes are unchanged, so no new physical assembly or before/after 3D improvement is claimed.
- U6 TPS26630/R25 4.99 kΩ and the existing restricted firmware profile remain in place. The input regression now uses the actual compiled parts; catalog `null` inventory is explicitly unverified.

## Calculated thresholds and energy

Nominal brake-on **52.04 V**, release **51.39 V**, cutoff **53.21 V**. Expanded screening ranges are on **51.379–52.644 V**, off **50.732–52.147 V**, cutoff **52.595–53.826 V**. The two comparators share U12. Checking that common reference with independent comparator/resistor errors gives **0.108 V** minimum brake-before-cutoff separation; all 256 modeled corners are covered by regression. Absolute envelopes across different boards can overlap. Release is only **0.032 V** above the 50.4 V high-source plus 0.3 V allocation. These small static gaps require waveform testing.

The restricted no-load sensitivity assumes 1.5 A instantaneously in each phase, 15 rpm, +20% winding inductance and −20% capacitance. Its lossless bus result is **54.063 V**, or **54.563 V including a 0.5 V transient allocation**. The remaining **0.437 V** is conditional on those unmeasured assumptions. The active firmware request is nominal **0.842 A RMS / 10 rpm**, but both qualification locks remain false.

## Behavioral SPICE results

Thirteen cases ran at two timesteps; all timestep and applied-case energy-balance checks passed. [Results and exact parameters](../input-protection/simulation.json), [reproducible script](../../scripts/simulate-input-protection.py).

| Applied scenario | Peak bus, V |
|---|---:|
| full current brake working | 54.692 |
| full current brake open | 56.929 |
| full current brake recovery 100us | 55.490 |
| restricted brake working | 53.803 |
| restricted brake open | 54.057 |
| restricted supply loss brake open | 50.646 |

The full-current brake-recovery case starts the sensing state at 48 V while the bus is already at cutoff, with an assumed 100 µs RC lag. It exercises an initially OFF brake; it is not a measured delay. Full-current winding cases contain no mechanical return. Restricted cases add all 15 rpm rotor energy in 100 µs. These models omit actual source response, switching ripple, cable inductance and thermal behavior. The working-brake result also lacks the allocated 0.5 V margin at full current. **Neither a resistor-value fix nor driver disable closes running brake-failure protection.**

## Verification and remaining work

- Source and motor-assembly builds completed. The CLI still prints a C11/C12 bounding-box overlap warning; compiled error/warning records are empty and native copper checks found no shorts or unconnected items. This is not a warning-free fabrication release.
- Typecheck, 27 design tests, 14 power-audit tests and firmware host tests pass; schematic style reports zero issues.
- Native ERC: **0 violations**. Native PCB: **0 unconnected / 0 schematic parity issues**, with **403 existing silkscreen/text DRC violations** retained. Nothing was suppressed.
- `bun run review` fails at exact stock: **28/81 part types** verified available. R61/R66 have exact identity/package matches but null assembly-stock records. LCSC listing inventory does not reserve or establish JLC assembly stock. Under [AGENTS.md](../../AGENTS.md), missing stock blocks new placement/routing/release; this pass changes values at existing locations.
- **Brake-path feedback/interlock is still missing**: U30 AIN2 remains grounded. A return-voltage monitor would require actual sourced parts, input/backfeed analysis, new routing and startup/running-fault tests. No virtual/unconnected monitoring input was added.
- Full-current/load limits, energy absorption during a running brake failure, clamp/snubber, capacitor ripple, resistor/cooling selection, TI PD image and physical electrical/thermal/mechanical qualification remain open. **300 W is not a confirmed resistor requirement.**

Manufacturing and published viewer archives remain historical. Complete hashes, test counts and the open-work list are in [verification.json](verification.json). The existing copper solver report retains its original board hash; the input-protection and R61/R66 equivalence reports establish that its geometry has not changed, without pretending it was rerun.
