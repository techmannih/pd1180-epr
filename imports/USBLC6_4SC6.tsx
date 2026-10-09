import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"],
  pin6: ["pin6"]
} as const

export const USBLC6_4SC6 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <port name="pin1" pinNumber={1} aliases={["1"]} direction="left" schX={-1.2} schY={0.7} schStemLength={0.4} />
          <port name="pin2" pinNumber={2} aliases={["2"]} direction="left" schX={-1.2} schY={0} schStemLength={0.4} />
          <schematicpath points={[{"x":-0.4,"y":0.2},{"x":-0.2,"y":0.4},{"x":-0.4,"y":0.6},{"x":-0.4,"y":0.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":0.6},{"x":-0.2,"y":0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.2},{"x":0.4,"y":0.4},{"x":0.2,"y":0.6},{"x":0.2,"y":0.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":0.6},{"x":0.4,"y":0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":0.8},{"x":-0.2,"y":1},{"x":-0.4,"y":1.2},{"x":-0.4,"y":0.8}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":1.2},{"x":-0.2,"y":0.8}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.8},{"x":0.4,"y":1},{"x":0.2,"y":1.2},{"x":0.2,"y":0.8}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":1.2},{"x":0.4,"y":0.8}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":-0.6},{"x":-0.2,"y":-0.4},{"x":-0.4,"y":-0.2},{"x":-0.4,"y":-0.6}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":-0.2},{"x":-0.2,"y":-0.6}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.6},{"x":0.4,"y":-0.4},{"x":0.2,"y":-0.2},{"x":0.2,"y":-0.6}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":-0.2},{"x":0.4,"y":-0.6}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":-1.2},{"x":-0.2,"y":-1},{"x":-0.4,"y":-0.8},{"x":-0.4,"y":-1.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":-0.8},{"x":-0.2,"y":-1.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-1.2},{"x":0.4,"y":-1},{"x":0.2,"y":-0.8},{"x":0.2,"y":-1.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":-0.8},{"x":0.4,"y":-1.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":-0.2},{"x":0.1,"y":0},{"x":-0.1,"y":0.2},{"x":-0.1,"y":-0.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":0.2},{"x":0.1,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":1},{"x":-0.2,"y":1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":1},{"x":-0.6,"y":1},{"x":-0.6,"y":-1},{"x":-0.4,"y":-1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":-1},{"x":0.2,"y":-1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":-1},{"x":0.6,"y":-1},{"x":0.6,"y":1},{"x":0.4,"y":1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.4,"y":0.4},{"x":0.6,"y":0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.4},{"x":-0.2,"y":0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":0.4},{"x":-0.6,"y":0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":0},{"x":-0.6,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":0},{"x":0.6,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.6,"y":-0.4},{"x":0.4,"y":-0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.4},{"x":-0.2,"y":-0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.4,"y":-0.4},{"x":-0.6,"y":-0.4}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":1},{"x":0.1,"y":0.7},{"x":0.8,"y":0.7}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":0.4},{"x":-0.1,"y":0.7},{"x":-0.8,"y":0.7}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.1,"y":-0.4},{"x":-0.1,"y":-0.7},{"x":-0.8,"y":-0.7}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-1},{"x":0,"y":-0.7},{"x":0.8,"y":-0.7}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.6,"y":0},{"x":0.8,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.6,"y":0},{"x":-0.8,"y":0}]} strokeColor="#880000" />
          <schematiccircle center={{ x: 0.1, y: 1 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.1, y: 0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.6, y: 0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: 0.6, y: 0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: 0.6, y: -0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.6, y: -0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.1, y: -0.4 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: 0, y: -1 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: 0.6, y: 0 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.6, y: 0 }} radius={0.02} strokeWidth={0.02} color="#880000" />
          <schematicpath points={[{"x":0.1,"y":-0.2},{"x":0.04,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.1,"y":0.2},{"x":0.16,"y":0.2}]} strokeColor="#880000" />
          <port name="pin3" pinNumber={3} aliases={["3"]} direction="left" schX={-1.2} schY={-0.7} schStemLength={0.4} />
          <port name="pin4" pinNumber={4} aliases={["4"]} direction="right" schX={1.2} schY={-0.7} schStemLength={0.4} />
          <port name="pin5" pinNumber={5} aliases={["5"]} direction="right" schX={1.2} schY={0} schStemLength={0.4} />
          <port name="pin6" pinNumber={6} aliases={["6"]} direction="right" schX={1.2} schY={0.7} schStemLength={0.4} />
          <schematicrect schX={0} schY={0} width={1.6} height={2.6} strokeWidth={0.02} color="#880000" />
          <schematiccircle center={{ x: -0.65, y: 1.15 }} radius={0.05} strokeWidth={0.02} color="#880000" isFilled fillColor="#880000" />
          <schematictext schX={-0.001} schY={1.5} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C111212"
  ]
}}
      manufacturerPartNumber="USBLC6-4SC6"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.94996mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.94996mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.94996mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.94996mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<silkscreenpath route={[{"x":1.5391891999998961,"y":-0.8892031999998835},{"x":1.5391891999998961,"y":0.8892031999999972}]} />
<silkscreenpath route={[{"x":-1.5391892000000098,"y":-0.8892031999998835},{"x":-1.5391892000000098,"y":0.8892031999999972}]} />
<silkscreencircle pcbX="-1.668272mm" pcbY="-1.301496mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.1524mm" pcbY="2.6764mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.6999843999999484,"y":1.9350994999999784},{"x":1.7000097999999753,"y":1.9350994999999784},{"x":1.7000097999999753,"y":-1.9350994999998647},{"x":-1.6999843999999484,"y":-1.9350994999998647},{"x":-1.6999843999999484,"y":1.9350994999999784}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C111212.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C111212.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.000012700000070253736, z: -0.048939 },
      }}
      {...props}
    />
  )
}