import { assembly } from "@tscircuit/core"
import { PD1180EPR } from "./index.circuit"
import { MECHANICAL_PARTS } from "./imports/MotorAssemblyCad"

/** Explicit physical parts. Prototype clamps and unverified dimensions stay labelled. */
export default () => (
  <assembly.device name="nema34_34HS31_6004S1_controller">
    <PD1180EPR />
    {MECHANICAL_PARTS.map((part) => (
      <assembly.subassembly
        key={part.name}
        name={part.name}
        displayName={part.description}
        cadModel={{
          glbUrl: part.url,
          modelUnitToMmScale: 1,
          positionOffset: { x: 0, y: 0, z: part.z },
        }}
      />
    ))}
  </assembly.device>
)
