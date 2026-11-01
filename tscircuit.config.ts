import type { PlatformConfig } from "@tscircuit/props"

export default {
  platformConfig: {
    // Parts, footprints and pin definitions are pinned under imports/. Remote
    // metadata lookups otherwise hold the dev viewer's render queue open.
    // Live supplier checks remain in the independent check:stock release gate.
    partsEngineDisabled: true,
    // Interactive previews use the same routing policy as build:preview.
    // This redesign previews current source placement. release/circuit.json
    // remains historical and is excluded until a new route is qualified.
    routingDisabled: true,
  } satisfies PlatformConfig,
}
