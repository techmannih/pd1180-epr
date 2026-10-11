import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["R_K"],
  pin2: ["B_K"],
  pin3: ["A"],
  pin4: ["G_K"]
} as const

export const NH_B2020RGBA_HF = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2874116"
  ]
}}
      manufacturerPartNumber="NH-B2020RGBA-HF"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="0.849884mm" pcbY="0.54991mm" width="0.7999984mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.849884mm" pcbY="-0.54991mm" width="0.7999984mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-0.849884mm" pcbY="-0.54991mm" width="0.7999984mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.849884mm" pcbY="0.54991mm" width="0.7999984mm" height="0.6999986mm" shape="rect" />
<silkscreenpath route={[{"x":1.399971800000003,"y":-0.5599683999998888},{"x":1.8499327999999196,"y":-0.5599683999998888}]} />
<silkscreenpath route={[{"x":1.6199865999999474,"y":-0.31000699999992776},{"x":1.6199865999999474,"y":-0.8100059999999303}]} />
<silkscreenpath route={[{"x":-1.0499852000000374,"y":1.0499852000000374},{"x":1.0500105999998368,"y":1.0499852000000374}]} />
<silkscreenpath route={[{"x":1.0499852000000374,"y":0.07089140000005045},{"x":1.0500105999998368,"y":-0.07089140000005045}]} />
<silkscreenpath route={[{"x":-1.0499852000000374,"y":0.07089140000005045},{"x":-1.0500105999999505,"y":-0.07089140000005045}]} />
<silkscreenpath route={[{"x":-1.0499852000000374,"y":-1.0499852000000374},{"x":1.0500105999998368,"y":-1.0499852000000374}]} />
<silkscreentext text="{NAME}" pcbX="0.3302mm" pcbY="2.0922mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-0.3899916000000303,"y":0.6675120000001016},{"x":-0.38996620000011717,"y":0.9924796000000242},{"x":-0.38996620000011717,"y":0.9924796000000242},{"x":-0.049961800000005496,"y":0.9924796000000242},{"x":-0.3899916000000303,"y":0.6675120000001016}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":1.3999972000000298,"y":-0.49999899999988884},{"x":1.8999961999999186,"y":-0.49999899999988884},{"x":1.8999961999999186,"y":-0.5999987999999803},{"x":1.3999972000000298,"y":-0.5999987999999803},{"x":1.3999972000000298,"y":-0.49999899999988884}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":1.5931895999999597,"y":-0.8109203999999863},{"x":1.5931895999999597,"y":-0.3109213999998701},{"x":1.6931893999999375,"y":-0.3109213999998701},{"x":1.6931893999999375,"y":-0.8109203999999863},{"x":1.5931895999999597,"y":-0.8109203999999863}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-1.4998831999999993,"y":1.2999852000000374},{"x":1.4998831999999993,"y":1.2999852000000374},{"x":1.4998831999999993,"y":-1.3000105999999505},{"x":-1.4998831999999993,"y":-1.3000105999999505},{"x":-1.4998831999999993,"y":1.2999852000000374}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2874116.obj?uuid=68f120d615fe4215afc90e0249d956ce",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2874116.step?uuid=68f120d615fe4215afc90e0249d956ce",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0.000012699999956566899, z: 0 },
      }}
      {...props}
    />
  )
}