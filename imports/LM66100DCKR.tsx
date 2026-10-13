import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VIN"],
  pin2: ["GND"],
  pin3: ["N_CE"],
  pin4: ["NC"],
  pin5: ["ST"],
  pin6: ["VOUT"]
} as const

const pinAttributes = {
  pin1: {requiresPower: true},
  pin2: {requiresGround: true},
  pin4: {doNotConnect: true}
} as const

export const LM66100DCKR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2869734"
  ]
}}
      manufacturerPartNumber="LM66100DCKR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.649986mm" pcbY="-1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.649986mm" pcbY="-1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.649986mm" pcbY="1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.649986mm" pcbY="1.100074mm" width="0.350012mm" height="0.850011mm" shape="rect" />
<fabricationnotepath route={[{"x":-0.999998000000005,"y":0.4999990000000025},{"x":-0.999998000000005,"y":-0.48999140000000807},{"x":0.9999979999998914,"y":-0.48999140000000807},{"x":0.9999979999998914,"y":0.48999140000000807},{"x":0.9899903999998969,"y":0.4999990000000025},{"x":-0.999998000000005,"y":0.4999990000000025}]} />
<silkscreencircle pcbX="-1.070102mm" pcbY="-0.910082mm" radius="0.050038mm" />
<silkscreencircle pcbX="-0.780034mm" pcbY="-0.260096mm" radius="0.050038mm" />
<courtyardoutline outline={[{"x":-1.249998000000005,"y":1.7750795000000608},{"x":1.2499979999998914,"y":1.7750795000000608},{"x":1.2499979999998914,"y":-1.775079499999947},{"x":-1.249998000000005,"y":-1.775079499999947},{"x":-1.249998000000005,"y":1.7750795000000608}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2869734.obj?uuid=190ec793c4fb4dd685e7d8ea6d5a8fd2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2869734.step?uuid=190ec793c4fb4dd685e7d8ea6d5a8fd2",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.5 },
      }}
      {...props}
    />
  )
}