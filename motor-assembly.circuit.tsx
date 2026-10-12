import { assembly } from "@tscircuit/core"
import { PD1180EPR } from "./index.circuit"
import { MECHANICAL_PARTS } from "./imports/MotorAssemblyCad"

/** Motor and J2 harness alignment preview. Existing PCB holes retained; no unverified mounting hardware. */
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
