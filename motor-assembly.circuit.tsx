import { assembly } from "@tscircuit/core"
import { PD1180EPR } from "./index.circuit"
import { QSH8618_MOTOR_GLB, MOTOR_FIXTURE_GLB, MOTOR_REAR_Z } from "./imports/MotorAssemblyCad"

/** Bare QSH8618-96 fit study; custom adapter and encoder parts remain proposals. */
export default () => (
  <assembly.device name="QSH8618_controller_fit">
    <PD1180EPR />
    <assembly.subassembly
      name="QSH8618_96_motor"
      displayName="Exact bare QSH8618-96 STEP"
      cadModel={{
        glbUrl: QSH8618_MOTOR_GLB,
        modelUnitToMmScale: 1,
        positionOffset: { x: 0, y: 0, z: MOTOR_REAR_Z },
      }}
    />
    <assembly.subassembly
      name="adapter_and_encoder_proposal"
      displayName="Adapter, fasteners and encoder — CAD proposal"
      cadModel={{ glbUrl: MOTOR_FIXTURE_GLB, modelUnitToMmScale: 1 }}
    />
  </assembly.device>
)
