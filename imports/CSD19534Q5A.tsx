import type { MosfetProps } from "@tscircuit/props"

type PowerMosfetConnections = {
  source?: string
  gate?: string
  drain?: string
}
type PowerMosfetProps = Omit<
  MosfetProps,
  "channelType" | "mosfetMode" | "connections" | "symbol"
> & {
  connections?: PowerMosfetConnections
}

export const CSD19534Q5A = ({ connections, ...props }: PowerMosfetProps) => {
  return (
    <>
    <mosfet
      channelType="n"
      mosfetMode="enhancement"
      symbol={
        <symbol width={3.6} height={3.4}>
          <schematictext text={props.name} schX={0} schY={0.9} fontSize={0.18} color="#006464" anchor="bottom_center" />
          <schematicrect schX={0} schY={0} width={2} height={2.4} strokeWidth={0.03} color="#880000" />
          <port name="pin1" pinNumber={1} aliases={["S1", "source"]} direction="left" schX={-1.4} schY={0.8} schStemLength={0.4} />
          <port name="pin2" pinNumber={2} aliases={["S2"]} direction="left" schX={-1.4} schY={0.4} schStemLength={0.4} />
          <port name="pin3" pinNumber={3} aliases={["S3"]} direction="left" schX={-1.4} schY={0} schStemLength={0.4} />
          <port name="pin4" pinNumber={4} aliases={["G", "gate"]} direction="left" schX={-1.4} schY={-0.4} schStemLength={0.4} />
          <port name="pin5" pinNumber={5} aliases={["D1", "drain"]} direction="left" schX={-1.4} schY={-0.8} schStemLength={0.4} />
          <port name="pin9" pinNumber={9} aliases={["D5"]} direction="right" schX={1.4} schY={0.8} schStemLength={0.4} />
          <port name="pin8" pinNumber={8} aliases={["D4"]} direction="right" schX={1.4} schY={0.4} schStemLength={0.4} />
          <port name="pin7" pinNumber={7} aliases={["D3"]} direction="right" schX={1.4} schY={0} schStemLength={0.4} />
          <port name="pin6" pinNumber={6} aliases={["D2"]} direction="right" schX={1.4} schY={-0.4} schStemLength={0.4} />
          <schematictext text="CSD19534Q5A" schX={0} schY={-1.48} fontSize={0.15} color="#006464" anchor="top_center" />
        </symbol>
      }
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
