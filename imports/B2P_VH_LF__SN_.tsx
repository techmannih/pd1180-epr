import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"]
} as const

export const B2P_VH_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C160315"
  ]
}}
      manufacturerPartNumber="B2P-VH(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin1"]} pcbX="-1.980184mm" pcbY="0mm" holeWidth="1.7999964mm" holeHeight="1.7999964mm" outerWidth="2.499995mm" outerHeight="2.499995mm" rectPad={true} pcbRotation="0deg" shape="pill" />
<platedhole  portHints={["pin2"]} pcbX="1.980184mm" pcbY="0mm" outerDiameter="2.499995mm" holeDiameter="1.7999964mm" shape="circle" />
<fabricationnotepath route={[{"x":-3.929989599999999,"y":-4.800015799999983},{"x":3.929989599999999,"y":-4.800015799999983}]} />
<fabricationnotepath route={[{"x":3.929989599999999,"y":-4.800015799999983},{"x":3.929989599999999,"y":1.99999600000001}]} />
<fabricationnotepath route={[{"x":3.929989599999999,"y":1.9800315999999611},{"x":-3.929989599999999,"y":1.9800315999999611}]} />
<fabricationnotepath route={[{"x":-3.929964200000086,"y":1.99999600000001},{"x":-3.929964200000086,"y":-4.799990399999956}]} />
<fabricationnotepath route={[{"x":1.819986199999903,"y":1.99999600000001},{"x":1.819986199999903,"y":3.699992599999973}]} />
<fabricationnotepath route={[{"x":-1.8198337999999694,"y":1.9989800000000741},{"x":-1.8198337999999694,"y":3.700780000000009}]} />
<fabricationnotepath route={[{"x":-1.8200369999999566,"y":3.699992599999973},{"x":1.819986199999903,"y":3.699992599999973}]} />
<fabricationnotepath route={[{"x":-1.8026888000000554,"y":3.3417510000000448},{"x":1.819986199999903,"y":3.3417510000000448}]} />
<fabricationnotepath route={[{"x":-1.8026888000000554,"y":2.3817579999999907},{"x":1.819986199999903,"y":2.3817579999999907}]} />
<fabricationnotepath route={[{"x":-1.8200369999999566,"y":2.8417520000000422},{"x":1.819986199999903,"y":2.8417520000000422}]} />
<fabricationnotepath route={[{"x":1.7999964000000546,"y":1.99999600000001},{"x":1.7999964000000546,"y":3.699992599999973},{"x":-1.7999964000000546,"y":3.699992599999973},{"x":-1.7999964000000546,"y":1.99999600000001},{"x":-1.4499843999999484,"y":1.99999600000001},{"x":-1.4499843999999484,"y":3.4499804000000722},{"x":1.4999970000000076,"y":3.4499804000000722},{"x":1.4999970000000076,"y":1.99999600000001},{"x":1.7999964000000546,"y":1.99999600000001}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-4.2099869999999555,"y":4.174985799999945},{"x":4.209986999999842,"y":4.174985799999945},{"x":4.209986999999842,"y":-5.02499679999994},{"x":-4.2099869999999555,"y":-5.02499679999994},{"x":-4.2099869999999555,"y":4.174985799999945}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160315.obj?uuid=0122b456e2ab45a9ad6da6f6a6ef2c44",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160315.step?uuid=0122b456e2ab45a9ad6da6f6a6ef2c44",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 1.9800000000000002, y: 4.024992499999998, z: -2.9500189999999997 },
      }}
      {...props}
    />
  )
}