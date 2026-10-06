import type { InductorProps } from "@tscircuit/props"

export const SWPA6045S220MT = (props: Omit<InductorProps, "inductance">) => {
  return (
    <inductor
      inductance="22uH"
      supplierPartNumbers={{
  "jlcpcb": [
    "C83454"
  ]
}}
      manufacturerPartNumber="SWPA6045S220MT"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.602992mm" pcbY="0mm" width="2.4740108mm" height="5.0200052mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="2.602992mm" pcbY="0mm" width="2.4740108mm" height="5.0200052mm" shape="rect" />
<fabricationnotepath route={[{"x":-3.0762193999999,"y":2.6624280000002045},{"x":-3.0762193999999,"y":3.0762194000000136},{"x":3.07616859999996,"y":3.0762194000000136},{"x":3.07616859999996,"y":2.6624280000002045}]} />
<fabricationnotepath route={[{"x":-3.0762193999999,"y":-2.662377200000037},{"x":-3.0762193999999,"y":-3.07616859999996},{"x":3.07616859999996,"y":-3.07616859999996},{"x":3.07616859999996,"y":-2.662377200000037}]} />
<courtyardoutline outline={[{"x":-4.089997400000016,"y":3.250019400000042},{"x":4.089997400000129,"y":3.250019400000042},{"x":4.089997400000129,"y":-3.2499685999999883},{"x":-4.089997400000016,"y":-3.2499685999999883},{"x":-4.089997400000016,"y":3.250019400000042}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C83454.obj?uuid=38d40b1b5688411c9194395505ca5302",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C83454.step?uuid=38d40b1b5688411c9194395505ca5302",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000025400000026820635, y: -0.000025399999913133797, z: -0.01 },
      }}
      {...props}
    />
  )
}