import type { MosfetProps } from "@tscircuit/props"

export const BSS123LT1G = (props: Omit<MosfetProps, "channelType" | "mosfetMode">) => {
  return (
    <mosfet
      channelType="n"
      mosfetMode="enhancement"
      symbol={
        <symbol name="BSS123LT1G_NMOS" width={1.4} height={1.4}>
          <schematictext text="{NAME}" schX={-0.35} schY={0.25} fontSize={0.18} color="#006464" anchor="bottom_left" />
          <port name="pin1" pinNumber={1} aliases={["gate", "G"]} direction="left" schX={-0.7} schY={0} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["source", "S"]} direction="down" schX={0.25} schY={-0.7} schStemLength={0.25} />
          <port name="pin3" pinNumber={3} aliases={["drain", "D"]} direction="up" schX={0.25} schY={0.7} schStemLength={0.25} />
          <schematicpath points={[{ x: -0.5, y: 0 }, { x: -0.25, y: 0 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.2, y: -0.28 }, { x: -0.2, y: 0.28 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.12, y: -0.2 }, { x: 0.25, y: -0.2 }, { x: 0.25, y: -0.45 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.12, y: 0.2 }, { x: 0.25, y: 0.2 }, { x: 0.25, y: 0.45 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: 0.25, y: 0.08 }, { x: 0.13, y: -0.05 }, { x: 0.37, y: -0.05 }, { x: 0.25, y: 0.08 }]} strokeColor="#880000" isFilled fillColor="#880000" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C78755"
  ]
}}
      manufacturerPartNumber="BSS123LT1G"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="1.149985mm" pcbY="0.94996mm" width="0.999998mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-1.149985mm" pcbY="0mm" width="0.999998mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="1.149985mm" pcbY="-0.94996mm" width="0.999998mm" height="0.7999984mm" shape="rect" />
<fabricationnotepath route={[{"x":-0.6999731999999881,"y":0.6359398000000027},{"x":-0.6999731999999881,"y":1.4999461999999966}]} />
<fabricationnotepath route={[{"x":-0.6999731999999881,"y":1.4999461999999966},{"x":0.30005020000000115,"y":1.4999461999999966}]} />
<fabricationnotepath route={[{"x":0.7000239999999991,"y":-0.31402020000000164},{"x":0.7000239999999991,"y":0.31391859999999383}]} />
<fabricationnotepath route={[{"x":-0.6999731999999881,"y":-1.5000478000000044},{"x":-0.6999731999999881,"y":-0.6360414000000105}]} />
<fabricationnotepath route={[{"x":-0.6999731999999881,"y":-1.5000478000000044},{"x":0.30005020000000115,"y":-1.5000478000000044}]} />
<courtyardoutline outline={[{"x":-1.8999840000000034,"y":1.6999589999999927},{"x":1.8999840000000034,"y":1.6999589999999927},{"x":1.8999840000000034,"y":-1.700035200000002},{"x":-1.8999840000000034,"y":-1.700035200000002},{"x":-1.8999840000000034,"y":1.6999589999999927}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C78755.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C78755.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.00003809999999759839, y: -0.00003810000001180924, z: 0.050795 },
      }}
      {...props}
    />
  )
}
