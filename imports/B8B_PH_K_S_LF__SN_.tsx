import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"],
  pin6: ["pin6"],
  pin7: ["pin7"],
  pin8: ["pin8"]
} as const

export const B8B_PH_K_S_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C157974"
  ]
}}
      manufacturerPartNumber="B8B-PH-K-S(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin1"]} pcbX="6.999986mm" pcbY="0mm" holeWidth="0.9000236mm" holeHeight="0.9000236mm" outerWidth="1.3999972mm" outerHeight="1.3999972mm" rectPad={true} pcbRotation="0deg" shape="pill" />
<platedhole  portHints={["pin2"]} pcbX="4.99999mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="2.999994mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="0.999998mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin5"]} pcbX="-0.999998mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin6"]} pcbX="-2.999994mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin7"]} pcbX="-4.99999mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<platedhole  portHints={["pin8"]} pcbX="-6.999986mm" pcbY="0mm" outerDiameter="1.3999972mm" holeDiameter="0.9000236mm" shape="circle" />
<fabricationnotepath route={[{"x":-9.000007400000072,"y":-1.6999965999998494},{"x":9.000032799999872,"y":-1.6999965999998494}]} />
<fabricationnotepath route={[{"x":9.000032799999872,"y":-1.6999965999998494},{"x":9.000032799999872,"y":2.7999944000000596}]} />
<fabricationnotepath route={[{"x":9.000032799999872,"y":2.8000198000000864},{"x":-9.000007400000072,"y":2.8000198000000864}]} />
<fabricationnotepath route={[{"x":-9.000007400000072,"y":2.8000198000000864},{"x":-9.000007400000072,"y":-1.6999965999998494}]} />
<fabricationnotepath route={[{"x":-9.000007400000072,"y":0.599998800000094},{"x":-8.500872000000072,"y":0.599440000000186},{"x":-8.500872000000072,"y":2.199640000000045},{"x":8.400288000000046,"y":2.199640000000045},{"x":8.400288000000046,"y":0.7010400000001482},{"x":8.999727999999777,"y":0.7010400000001482}]} />
<fabricationnotepath route={[{"x":8.999727999999777,"y":-0.3987799999999879},{"x":8.400288000000046,"y":-0.3987799999999879},{"x":8.400288000000046,"y":-1.1988799999999173},{"x":4.001007999999956,"y":-1.1988799999999173},{"x":4.001007999999956,"y":-1.6992599999998674},{"x":3.99999200000002,"y":-1.6999965999998494}]} />
<fabricationnotepath route={[{"x":-3.99999200000002,"y":-1.6999965999998494},{"x":-3.99999200000002,"y":-1.6992599999998674},{"x":-3.99999200000002,"y":-1.1988799999999173},{"x":-8.39927200000011,"y":-1.1988799999999173},{"x":-8.39927200000011,"y":-0.3987799999999879},{"x":-9.001252000000022,"y":-0.3987799999999879}]} />
<fabricationnotepath route={[{"x":6.600012200000037,"y":1.8999962000000323},{"x":7.399527999999918,"y":1.8999200000000656},{"x":7.0007479999999305,"y":0.899159999999938}]} />
<fabricationnotepath route={[{"x":7.0000113999999485,"y":0.8999982000000273},{"x":6.600012200000037,"y":1.8999962000000323}]} />
<fabricationnotepath route={[{"x":-9.000007400000072,"y":2.7999944000000596},{"x":9.000007399999959,"y":2.7999944000000596},{"x":9.000007399999959,"y":0.6999986000000717},{"x":8.400008599999865,"y":0.6999986000000717},{"x":8.400008599999865,"y":2.1999956000000793},{"x":-8.500008400000183,"y":2.1999956000000793},{"x":-8.500008400000183,"y":0.5999987999999803},{"x":-9.000007400000072,"y":0.5999987999999803},{"x":-9.000007400000072,"y":2.699994599999968},{"x":-9.000007400000072,"y":2.7999944000000596}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-9.000007400000072,"y":-0.39999919999991107},{"x":-8.400008600000092,"y":-0.39999919999991107},{"x":-8.400008600000092,"y":-1.1999975999999606},{"x":-3.99999200000002,"y":-1.1999975999999606},{"x":-3.99999200000002,"y":-1.699996599999963},{"x":-9.000007400000072,"y":-1.699996599999963},{"x":-9.000007400000072,"y":-0.7999984000000495},{"x":-9.000007400000072,"y":-0.39999919999991107}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":9.000007399999959,"y":-0.39999919999991107},{"x":8.400008599999865,"y":-0.39999919999991107},{"x":8.400008599999865,"y":-1.1999975999999606},{"x":3.9999919999999065,"y":-1.1999975999999606},{"x":3.9999919999999065,"y":-1.699996599999963},{"x":9.000007399999959,"y":-1.699996599999963},{"x":9.000007399999959,"y":-1.5999967999998717},{"x":9.000007399999959,"y":-0.39999919999991107}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-9.249982000000045,"y":3.1499942000000374},{"x":9.249982000000045,"y":3.1499942000000374},{"x":9.249982000000045,"y":-1.9499965999998494},{"x":-9.249982000000045,"y":-1.9499965999998494},{"x":-9.249982000000045,"y":3.1499942000000374}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C157974.obj?uuid=1ce88b9c4af0470793a219e97dc9d90b",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C157974.step?uuid=1ce88b9c4af0470793a219e97dc9d90b",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -7.000000000000114, y: -0.0000011999999059986166, z: -0.000006999999999646178 },
      }}
      {...props}
    />
  )
}