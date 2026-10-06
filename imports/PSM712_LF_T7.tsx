import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["A11"],
  pin2: ["A12"],
  pin3: ["K"]
} as const

export const PSM712_LF_T7 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C32677"
  ]
}}
      manufacturerPartNumber="PSM712-LF-T7"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="1.101344mm" pcbY="-0.94996mm" width="1.0374884mm" height="0.532003mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="1.101344mm" pcbY="0.94996mm" width="1.0374884mm" height="0.532003mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-1.101344mm" pcbY="0mm" width="1.0374884mm" height="0.532003mm" shape="rect" />
<fabricationnotepath route={[{"x":0.8586978000000727,"y":1.5262098000000606},{"x":-0.8586978000000727,"y":1.5262098000000606},{"x":-0.8586978000000727,"y":0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.8586978000000727,"y":-1.5262097999999469},{"x":-0.8586978000000727,"y":-1.5262097999999469},{"x":-0.8586978000000727,"y":-0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.8586978000000727,"y":0.45539659999997184},{"x":0.8586978000000727,"y":-0.45539659999985815}]} />
<courtyardoutline outline={[{"x":-1.8700882000000547,"y":1.700009800000089},{"x":1.870088199999941,"y":1.700009800000089},{"x":1.870088199999941,"y":-1.6999843999999484},{"x":-1.8700882000000547,"y":-1.6999843999999484},{"x":-1.8700882000000547,"y":1.700009800000089}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C32677.obj?uuid=cefd4596db214da394d9632b2b88f8f2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C32677.step?uuid=cefd4596db214da394d9632b2b88f8f2",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
