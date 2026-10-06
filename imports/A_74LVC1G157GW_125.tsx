import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["I1"],
  pin2: ["GND"],
  pin3: ["I0"],
  pin4: ["Y"],
  pin5: ["VCC"],
  pin6: ["S"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true},
  pin5: {requiresPower: true}
} as const

export const A_74LVC1G157GW_125 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C135822"
  ]
}}
      manufacturerPartNumber="74LVC1G157GW,125"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="0.899922mm" pcbY="0mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.899922mm" pcbY="0.649986mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-0.899922mm" pcbY="0.649986mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="-0.899922mm" pcbY="0mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.899922mm" pcbY="-0.649986mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="0.899922mm" pcbY="-0.649986mm" width="0.8999982mm" height="0.3999992mm" shape="rect" />
<fabricationnotepath route={[{"x":0.7001001999999801,"y":1.0175494000000072},{"x":0.7001001999999801,"y":1.0998962000000176}]} />
<fabricationnotepath route={[{"x":0.7001001999999801,"y":-1.1000993999999906},{"x":0.7001001999999801,"y":-1.0177526000000086}]} />
<fabricationnotepath route={[{"x":-0.6998970000000071,"y":1.0175494000000072},{"x":-0.6998970000000071,"y":1.0998962000000176}]} />
<fabricationnotepath route={[{"x":-0.6998970000000071,"y":-1.1000993999999906},{"x":-0.6998970000000071,"y":-1.0177526000000086}]} />
<fabricationnotepath route={[{"x":0.7001001999999801,"y":-1.1000993999999906},{"x":-0.6998970000000071,"y":-1.1000993999999906}]} />
<fabricationnotepath route={[{"x":0.7001001999999801,"y":1.0998962000000176},{"x":-0.6998970000000071,"y":1.0998962000000176}]} />
<silkscreencircle pcbX="1.016mm" pcbY="-1.27mm" radius="0.127mm" />
<courtyardoutline outline={[{"x":-1.5999211000000173,"y":1.2498963999999972},{"x":1.599921100000003,"y":1.2498963999999972},{"x":1.599921100000003,"y":-1.2500995999999986},{"x":-1.5999211000000173,"y":-1.2500995999999986},{"x":-1.5999211000000173,"y":1.2498963999999972}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C135822.obj?uuid=c48363a009b446bc89c236a3f3be363d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C135822.step?uuid=c48363a009b446bc89c236a3f3be363d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0.0001015999999935957, y: 0.00008889999999439624, z: 0 },
      }}
      {...props}
    />
  )
}