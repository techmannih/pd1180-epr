import { assembly } from "@tscircuit/core"
import { PD1180EPR } from "./index.circuit"
import { MOTOR_GLB, MOTOR_FIXTURE_GLB, MOTOR_REAR_Z } from "./imports/MotorAssemblyCad"

/** Ordered 34HS31-6004S1 fit study; adapter unqualified, encoder attachment unresolved. */
export default () => (
  <assembly.device name="ordered_motor_controller_fit">
    <PD1180EPR />
    <assembly.subassembly
      name="ordered_motor"
      displayName="Ordered STEPPERONLINE 34HS31-6004S1 STEP"
      cadModel={{
        glbUrl: MOTOR_GLB,
        modelUnitToMmScale: 1,
        positionOffset: { x: 0, y: 0, z: MOTOR_REAR_Z },
      }}
    />
    <assembly.subassembly
      name="adapter_proposal"
      displayName="Adapter and fasteners — CAD proposal; encoder unresolved"
      cadModel={{ glbUrl: MOTOR_FIXTURE_GLB, modelUnitToMmScale: 1 }}
    />
  </assembly.device>
)
