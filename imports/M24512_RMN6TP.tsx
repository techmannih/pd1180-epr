import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["E0"],
  pin2: ["E1"],
  pin3: ["E2"],
  pin4: ["VSS"],
  pin5: ["SDA"],
  pin6: ["SCL"],
  pin7: ["WC"],
  pin8: ["VCC"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true},
  pin8: {requiresPower: true}
} as const

export const M24512_RMN6TP = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C79991"
  ]
}}
      manufacturerPartNumber="M24512-RMN6TP"
      footprint={<footprint>
        <smtpad portHints={["pin5"]} pcbX="1.905mm" pcbY="2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.635mm" pcbY="2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-0.635mm" pcbY="2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="-1.905mm" pcbY="2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="1.905mm" pcbY="-2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0.635mm" pcbY="-2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-0.635mm" pcbY="-2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<smtpad portHints={["pin1"]} pcbX="-1.905mm" pcbY="-2.599944mm" width="0.58801mm" height="1.7999964mm" radius="0.294005mm" shape="pill" />
<fabricationnotepath route={[{"x":-2.5262078000000656,"y":-1.5214091999999937},{"x":2.526207799999952,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":-2.5262078000000656,"y":1.5214092000001074},{"x":2.526207799999952,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":-2.5262078000000656,"y":-0.43538139999998293},{"x":-2.5262078000000656,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":-2.5262078000000656,"y":0.44889420000004066},{"x":-2.5262078000000656,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":-2.0675600000000713,"y":-1.5214091999999937},{"x":-2.5262078000000656,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":-0.7975599999999758,"y":-1.5214091999999937},{"x":-1.7424400000001015,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":0.47244000000000597,"y":-1.5214091999999937},{"x":-0.47244000000011965,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":1.7424399999999878,"y":-1.5214091999999937},{"x":0.7975599999999758,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":2.526207799999952,"y":-1.5214091999999937},{"x":2.0675599999999577,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":2.526207799999952,"y":1.5214092000001074},{"x":2.526207799999952,"y":-1.5214091999999937}]} />
<fabricationnotepath route={[{"x":-2.0675600000000713,"y":1.5214092000001074},{"x":-2.5262078000000656,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":-0.7975599999999758,"y":1.5214092000001074},{"x":-1.7424400000001015,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":0.47244000000000597,"y":1.5214092000001074},{"x":-0.47244000000011965,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":1.7424399999999878,"y":1.5214092000001074},{"x":0.7975599999999758,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":2.526207799999952,"y":1.5214092000001074},{"x":2.0675599999999577,"y":1.5214092000001074}]} />
<fabricationnotepath route={[{"x":-2.5262078000000656,"y":-0.43538139999998293},{"x":-2.5262078000000656,"y":0.44889420000004066}]} />
<silkscreencircle pcbX="-1.905mm" pcbY="-1.016mm" radius="0.150114mm" />
<courtyardoutline outline={[{"x":-2.699982400000067,"y":3.7499422000000777},{"x":2.7000077999998666,"y":3.7499422000000777},{"x":2.7000077999998666,"y":-3.749942199999964},{"x":-2.699982400000067,"y":-3.749942199999964},{"x":-2.699982400000067,"y":3.7499422000000777}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C79991.obj?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C79991.step?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
