import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CATHODE"],
  pin2: ["REF"],
  pin3: ["ANODE"]
} as const

export const TL431AIDBZR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{ pin1: { requiresPower: true }, pin3: { requiresGround: true } }}
      supplierPartNumbers={{
  "jlcpcb": [
    "C23892"
  ]
}}
      manufacturerPartNumber="TL431AIDBZR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="1.235075mm" pcbY="-0.94996mm" width="1.0700004mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="1.235075mm" pcbY="0.94996mm" width="1.0700004mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-1.235075mm" pcbY="0mm" width="1.0700004mm" height="0.5999988mm" shape="rect" />
<fabricationnotepath route={[{"x":0.8760714000002281,"y":1.5361919999999145},{"x":-0.8763253999998142,"y":1.5361919999999145},{"x":-0.8763253999998142,"y":0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.8760714000002281,"y":-1.5361920000000282},{"x":-0.8763253999998142,"y":-1.5361920000000282},{"x":-0.8763253999998142,"y":-0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.8760714000002281,"y":0.45539659999997184},{"x":0.8760714000002281,"y":-0.45539659999985815}]} />
<courtyardoutline outline={[{"x":-2.020075199999951,"y":1.6999844000000621},{"x":2.020075200000065,"y":1.6999844000000621},{"x":2.020075200000065,"y":-1.7000097999999753},{"x":-2.020075199999951,"y":-1.7000097999999753},{"x":-2.020075199999951,"y":1.6999844000000621}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23892.obj?uuid=cefd4596db214da394d9632b2b88f8f2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23892.step?uuid=cefd4596db214da394d9632b2b88f8f2",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0.000012699999956566899, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
