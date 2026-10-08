import type { PlatformConfig } from "@tscircuit/props"

export default {
  platformConfig: {
    // Parts, footprints and pin definitions are pinned under imports/. Remote
    // metadata lookups otherwise hold the dev viewer's render queue open.
    // Live supplier checks remain in the independent check:stock release gate.
    partsEngineDisabled: true,
    // Interactive previews use the same routing policy as build:preview.
    // The final routed board is available as release/circuit.json.
    routingDisabled: true,
  } satisfies PlatformConfig,
}
