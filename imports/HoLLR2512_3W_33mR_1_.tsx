import type { ResistorProps } from "@tscircuit/props"

export const HoLLR2512_3W_33mR_1_ = (props: Omit<ResistorProps, "resistance">) => {
  return (
    <resistor
      resistance="33mOhm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C2985721"
  ]
}}
      manufacturerPartNumber="HoLLR2512-3W-33mR-1%"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-3.066288mm" pcbY="0mm" width="1.999996mm" height="3.2999934mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="3.066288mm" pcbY="0mm" width="1.999996mm" height="3.2999934mm" shape="rect" />
<fabricationnotepath route={[{"x":2.793999999999869,"y":-1.9049999999999727},{"x":4.228947599999856,"y":-1.9049999999999727},{"x":4.228947599999856,"y":2.008174800000006},{"x":2.793999999999869,"y":2.008174800000006}]} />
<fabricationnotepath route={[{"x":-2.7939999999999827,"y":-1.9049999999999727},{"x":-4.2289475999999695,"y":-1.9049999999999727},{"x":-4.2289475999999695,"y":2.008174800000006},{"x":-2.7939999999999827,"y":2.008174800000006}]} />
<courtyardoutline outline={[{"x":-4.316286000000105,"y":1.8999966999999742},{"x":4.316285999999991,"y":1.8999966999999742},{"x":4.316285999999991,"y":-1.8999966999999742},{"x":-4.316286000000105,"y":-1.8999966999999742},{"x":-4.316286000000105,"y":1.8999966999999742}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2985721.obj?uuid=38c9626c76914cceaef43323dbad924e",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2985721.step?uuid=38c9626c76914cceaef43323dbad924e",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.01 },
      }}
      {...props}
    />
  )
}
