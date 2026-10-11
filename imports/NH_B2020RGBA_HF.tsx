import { Fragment } from "react"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["R_K"],
  pin2: ["B_K"],
  pin3: ["A"],
  pin4: ["G_K"]
} as const

export const NH_B2020RGBA_HF = ({ connections, ...props }: ChipProps<typeof pinLabels>) => {
  return (
    <>
    <led
      pinLabels={{ pin1: ["R_K"], pin2: ["B_K"] }}
      symbol={
        <symbol>
          <port name="pin3" pinNumber={3} aliases={["A"]} direction="up" schX={0.7} schY={1.2} schStemLength={0.4} />
          <schematicpath points={[{x: 0.7, y: 0.8}, {x: 0.7, y: -0.6}]} />
          {[{pin: 1, label: "R_K", y: 0.6}, {pin: 4, label: "G_K", y: 0}, {pin: 2, label: "B_K", y: -0.6}].map(({pin, label, y}) => (
            <Fragment key={pin}>
              <port name={`pin${pin}`} pinNumber={pin} aliases={[label]} direction="left" schX={-0.7} schY={y} schStemLength={0.3} />
              <schematicpath points={[{x: -0.4, y}, {x: 0, y}]} />
              <schematicpath points={[{x: 0, y: y - 0.17}, {x: 0, y: y + 0.17}]} />
              <schematicpath points={[{x: 0, y}, {x: 0.35, y: y + 0.17}, {x: 0.35, y: y - 0.17}, {x: 0, y}]} isFilled fillColor="#ffffc2" />
              <schematicpath points={[{x: 0.35, y}, {x: 0.7, y}]} />
              <schematicpath points={[{x: 0.15, y: y + 0.23}, {x: -0.05, y: y + 0.4}, {x: 0.06, y: y + 0.37}]} />
            </Fragment>
          ))}
          <schematictext text="{NAME}" schX={-0.7} schY={1.2} fontSize={0.2} anchor="bottom_left" />
        </symbol>
      }
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
    {Object.entries(connections ?? {}).flatMap(([pin, targets]) =>
      (typeof targets === "string" ? [targets] : targets).map((target) =>
        <Fragment key={`${pin}:${target}`}><trace from={`.${props.name} > .${pin}`} to={target} /></Fragment>
      )
    )}
    </>
  )
}