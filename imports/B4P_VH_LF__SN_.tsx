import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"]
} as const

export const B4P_VH_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C160317"
  ]
}}
      manufacturerPartNumber="B4P-VH(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin1"]} pcbX="-5.940044mm" pcbY="0mm" holeWidth="1.7999964mm" holeHeight="1.7999964mm" outerWidth="2.499995mm" outerHeight="2.499995mm" rectPad={true} pcbRotation="0deg" shape="pill" />
<platedhole  portHints={["pin3"]} pcbX="1.980184mm" pcbY="0mm" outerDiameter="2.499995mm" holeDiameter="1.7999964mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="-1.97993mm" pcbY="0mm" outerDiameter="2.499995mm" holeDiameter="1.7999964mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="5.940044mm" pcbY="0mm" outerDiameter="2.499995mm" holeDiameter="1.7999964mm" shape="circle" />
<fabricationnotepath route={[{"x":-7.890002000000095,"y":-4.800015799999983},{"x":7.889976599999841,"y":-4.800015799999983}]} />
<fabricationnotepath route={[{"x":7.890001999999981,"y":-4.800015799999983},{"x":7.889976599999841,"y":1.99999600000001}]} />
<fabricationnotepath route={[{"x":7.889976599999841,"y":1.9800315999999611},{"x":-7.890002000000095,"y":1.9800315999999611}]} />
<fabricationnotepath route={[{"x":-7.889951200000041,"y":1.99999600000001},{"x":-7.889951200000041,"y":-4.799990399999956}]} />
<fabricationnotepath route={[{"x":5.779998599999999,"y":1.99999600000001},{"x":5.779998599999999,"y":3.699992599999973}]} />
<fabricationnotepath route={[{"x":-5.779820800000039,"y":1.9989800000000741},{"x":-5.779820800000039,"y":3.700780000000009}]} />
<fabricationnotepath route={[{"x":-5.780049400000053,"y":3.699992599999973},{"x":5.779998599999999,"y":3.699992599999973}]} />
<fabricationnotepath route={[{"x":-5.762675800000011,"y":3.3417510000000448},{"x":5.779998599999999,"y":3.3417510000000448}]} />
<fabricationnotepath route={[{"x":-5.762675800000011,"y":2.3817579999999907},{"x":5.779998599999999,"y":2.3817579999999907}]} />
<fabricationnotepath route={[{"x":-5.780049400000053,"y":2.8417520000000422},{"x":5.779998599999999,"y":2.8417520000000422}]} />
<fabricationnotepath route={[{"x":5.800013799999988,"y":2.099995799999988},{"x":5.800013799999988,"y":3.699992599999973},{"x":-5.700013999999896,"y":3.699992599999973},{"x":-5.700013999999896,"y":1.99999600000001},{"x":-5.500014400000055,"y":1.99999600000001},{"x":-5.500014400000055,"y":3.39999320000004},{"x":5.600014199999919,"y":3.39999320000004},{"x":5.600014199999919,"y":2.099995799999988},{"x":5.800013799999988,"y":2.099995799999988}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-8.169974000000025,"y":4.149992200000042},{"x":8.169973999999911,"y":4.149992200000042},{"x":8.169973999999911,"y":-5.049990399999956},{"x":-8.169974000000025,"y":-5.049990399999956},{"x":-8.169974000000025,"y":4.149992200000042}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160317.obj?uuid=44fc2a9cb35f414086a0db7dfbeda783",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C160317.step?uuid=44fc2a9cb35f414086a0db7dfbeda783",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 5.9400005, y: 0, z: -0.00000660000000030081 },
      }}
      {...props}
    />
  )
}