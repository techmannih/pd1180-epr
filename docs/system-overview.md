# NEMA34 system overview

Start with [the complete system](system-blocks/system-overview.svg), then open
[power domains](system-blocks/logic-power.svg),
[hardware protection](system-blocks/protection.svg), and
[control and telemetry](system-blocks/control-telemetry.svg).
Blue arrows are signals; dashed orange arrows are power. Two arrowheads indicate
two-way communication or returned motor energy, not two separate supplies.

![NEMA34 system overview](system-blocks/system-overview.svg)

## How the board operates

1. J1 receives USB-C PD power. U1 protects CC and U2 negotiates the configured
   48 V / 5 A EPR contract using U3's EEPROM image. U5 can power logic before
   motor power is enabled. J10 provides separate USB data and optional MCU power.
2. RP2040 checks the PD contract and configuration, raw input voltage from U38,
   temperature, fresh telemetry and fault inputs before requesting motor power. PD_READY
   is a firmware decision; it is not the same signal as the eFuse's MOTOR_PG.
3. U4 requires both PD_PATH_OK and POWER_PERMIT before enabling U6. The separate
   U10/U11/U33 chain requires MCU_RUN, MOTOR_PG, VMOTOR_OK and TEMP_OK to enable
   the motor driver. After motor power comes up, firmware additionally requires
   valid protected-bus voltage, driver readiness and brake preflight before
   asserting MCU_RUN. Reset defaults disable motion.
4. U7 regulates winding current using its integrated H-bridges. RP2040 supplies
   STEP/DIR and SPI configuration. J2's four WAGO poles connect to the two motor
   windings. The motor's 6 A/phase label is not an approved operating setting.
5. Deceleration or an externally driven motor can return energy to VMOTOR.
   U13 switches the independent Q16 brake near 52 V; J3's external resistor
   dissipates the energy. U22 backs the control rail from VMOTOR and U34 provides
   12 V brake-gate power during PD loss. The 10 ohm / 300 W resistor and cooling
   remain provisional.

DATA alone can boot RP2040 and its flash for diagnostics. It cannot power the
motor or the board's sensors. U18 is an optional, unpopulated encoder, with no
qualified magnet mounting or closed-loop motion claim. See
[the IC-purpose table and power states](usb-pd-architecture.md) for details.

## View and regenerate

The default routed `release/circuit.json` contains the four native
`system_block_page` records plus their blocks, routes and actual PCB-component
associations. Use the **System** tab and page selector in a supporting viewer.
Local preview: `bun run dev:system`. The SVG links above remain usable even if a
website deployment has not yet enabled its System tab.

`bun run build:pcb` rebuilds current source and the assembly, adds the diagrams,
checks the existing native-route fingerprint/DRC, and refreshes the default
viewer. Commit the refreshed generated files with source edits: a hosted rebuild
of an old committed `release/circuit.json` cannot update its schematic or diagram.
Run `bun run check:system` to reject missing/stale diagram metadata.

Authoring uses the official [system-block API](https://github.com/tscircuit/docs/pull/980)
in `system-overview.tsx`. The board stays on core 0.0.2112 and schematic-symbols
0.0.248; only the diagram layout uses the separately pinned core 0.0.2268 and
SVG renderer 0.0.455. The full-core upgrade experiment changed 908 solder-paste
records to 876 and changed schematic output, so it was not adopted for this
documentation change. CLI 0.0.3084 supports the newer viewer while the compatible
board compiler remains pinned.

The diagram generator seeds only existing source/PCB component identities into
the isolated renderer and appends only `system_block_*` records. It does not
generate replacement footprints or electrical connections. Tests reject missing
or ambiguous component links and prove all non-system records are preserved.

This is a review aid. Existing USB hole-clearance findings, sourcing and physical
qualification holds remain; firmware motion locks are still enabled.
