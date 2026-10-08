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
  pin9: ["D5"],
} as const

type PowerMosfetConnections = {
  source?: string
  gate?: string
  drain?: string
}
type PowerMosfetProps = Omit<
  ChipProps<typeof pinLabels>,
  "connections"
> & {
  connections?: PowerMosfetConnections
}

export const CSD19534Q5A = ({ connections, ...props }: PowerMosfetProps) => {
  return (
    <>
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
    {connections?.source && <trace name={`${props.name}_PIN1_SOURCE`} from={`.${props.name} > .pin1`} to={connections.source} />}
    {connections?.source && <trace name={`${props.name}_PIN2_SOURCE`} from={`.${props.name} > .pin2`} to={connections.source} />}
    {connections?.source && <trace name={`${props.name}_PIN3_SOURCE`} from={`.${props.name} > .pin3`} to={connections.source} />}
    {connections?.gate && <trace name={`${props.name}_PIN4_GATE`} from={`.${props.name} > .pin4`} to={connections.gate} />}
    {connections?.drain && <trace name={`${props.name}_PIN5_DRAIN`} from={`.${props.name} > .pin5`} to={connections.drain} />}
    {connections?.drain && <trace name={`${props.name}_PIN6_DRAIN`} from={`.${props.name} > .pin6`} to={connections.drain} />}
    {connections?.drain && <trace name={`${props.name}_PIN7_DRAIN`} from={`.${props.name} > .pin7`} to={connections.drain} />}
    {connections?.drain && <trace name={`${props.name}_PIN8_DRAIN`} from={`.${props.name} > .pin8`} to={connections.drain} />}
    {connections?.drain && <trace name={`${props.name}_PIN9_DRAIN`} from={`.${props.name} > .pin9`} to={connections.drain} />}
    </>
  )
}
