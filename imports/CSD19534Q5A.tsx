import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["S1"],
  pin2: ["S2"],
  pin3: ["S3"],
  pin4: ["G"],
  pin5: ["D1"],
  pin6: ["D2"],
  pin7: ["D3"],
  pin8: ["D4"],
  pin9: ["D5"]
} as const

export const CSD19534Q5A = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C114200"
  ]
}}
      manufacturerPartNumber="CSD19534Q5A"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.905mm" pcbY="-3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.635mm" pcbY="-3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.635mm" pcbY="-3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="1.905mm" pcbY="-3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="1.905mm" pcbY="3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.635mm" pcbY="3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-0.635mm" pcbY="3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-1.905mm" pcbY="3.025394mm" width="0.7999984mm" height="1.3210032mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0mm" pcbY="0.649986mm" width="4.5999908mm" height="3.5999928mm" shape="rect" />
<via connectsTo={`.${props.name} > .pin9`} pcbX="-0.499872mm" pcbY="1.150112mm" outerDiameter="0.6096mm" holeDiameter="0.3048mm" layers={["top","bottom"]} />
<via connectsTo={`.${props.name} > .pin9`} pcbX="0.500126mm" pcbY="1.150112mm" outerDiameter="0.6096mm" holeDiameter="0.3048mm" layers={["top","bottom"]} />
<via connectsTo={`.${props.name} > .pin9`} pcbX="-0.499872mm" pcbY="0.150114mm" outerDiameter="0.6096mm" holeDiameter="0.3048mm" layers={["top","bottom"]} />
<via connectsTo={`.${props.name} > .pin9`} pcbX="0.500126mm" pcbY="0.150114mm" outerDiameter="0.6096mm" holeDiameter="0.3048mm" layers={["top","bottom"]} />
<fabricationnotepath route={[{"x":-2.3755096000001004,"y":-3.101187600000003},{"x":-2.5862026000000924,"y":-3.101187600000003},{"x":-2.5862026000000924,"y":-3.101187600000003},{"x":-2.5862026000000924,"y":3.101187600000003},{"x":-2.5862026000000924,"y":3.101187600000003},{"x":-2.3755096000001004,"y":3.101187600000003}]} />
<fabricationnotepath route={[{"x":2.3755095999999867,"y":-3.101187600000003},{"x":2.5862025999999787,"y":-3.101187600000003},{"x":2.5862025999999787,"y":-3.101187600000003},{"x":2.5862025999999787,"y":3.101187600000003},{"x":2.5862025999999787,"y":3.101187600000003},{"x":2.3755095999999867,"y":3.101187600000003}]} />
<silkscreencircle pcbX="-2.84988mm" pcbY="-3.800094mm" radius="0.199898mm" />
<courtyardoutline outline={[{"x":-2.8899997999999414,"y":3.9358955999999807},{"x":2.889999800000055,"y":3.9358955999999807},{"x":2.889999800000055,"y":-3.9358955999999807},{"x":-2.8899997999999414,"y":-3.9358955999999807},{"x":-2.8899997999999414,"y":3.9358955999999807}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C114200.obj?uuid=92497acca17b48098aa21a0e69681f58",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C114200.step?uuid=92497acca17b48098aa21a0e69681f58",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.0058669999999998446, y: -0.000012700000070253736, z: 0 },
      }}
      {...props}
    />
  )
}