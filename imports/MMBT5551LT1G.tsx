import type { TransistorProps } from "@tscircuit/props"

export const MMBT5551LT1G = (props: Omit<TransistorProps, "type">) => {
  return (
    <transistor
      type="npn"
      symbol={
        <symbol name="MMBT5551LT1G_NPN" width={1.4} height={1.4}>
          <schematictext text="{NAME}" schX={-0.35} schY={0.25} fontSize={0.18} color="#006464" anchor="bottom_left" />
          <port name="pin1" pinNumber={1} aliases={["base", "B"]} direction="left" schX={-0.7} schY={0} schStemLength={0.25} />
          <port name="pin3" pinNumber={3} aliases={["collector", "C"]} direction="up" schX={0.3} schY={0.7} schStemLength={0.25} />
          <port name="pin2" pinNumber={2} aliases={["emitter", "E"]} direction="down" schX={0.3} schY={-0.7} schStemLength={0.25} />
          <schematicpath points={[{ x: -0.45, y: 0 }, { x: -0.08, y: 0 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.08, y: -0.3 }, { x: -0.08, y: 0.3 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.08, y: 0.18 }, { x: 0.3, y: 0.42 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.08, y: -0.18 }, { x: 0.3, y: -0.42 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: 0.3, y: -0.42 }, { x: 0.18, y: -0.33 }, { x: 0.2, y: -0.48 }, { x: 0.3, y: -0.42 }]} strokeColor="#880000" isFilled fillColor="#880000" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C41095"
  ]
}}
      manufacturerPartNumber="MMBT5551LT1G"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="0.999998mm" pcbY="-0.94996mm" width="1.2500102mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0.999998mm" pcbY="0.94996mm" width="1.2500102mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-0.999998mm" pcbY="0mm" width="1.2500102mm" height="0.6999986mm" shape="rect" />
<fabricationnotepath route={[{"x":0.726211400000011,"y":1.5262098000000606},{"x":-0.726211400000011,"y":1.5262098000000606},{"x":-0.726211400000011,"y":0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.726211400000011,"y":-1.5262097999999469},{"x":-0.726211400000011,"y":-1.5262097999999469},{"x":-0.726211400000011,"y":-0.49458879999997407}]} />
<fabricationnotepath route={[{"x":0.726211400000011,"y":0.45539659999997184},{"x":0.726211400000011,"y":-0.45539659999985815}]} />
<courtyardoutline outline={[{"x":-1.8750030999998444,"y":1.6999844000000621},{"x":1.8750030999998444,"y":1.6999844000000621},{"x":1.8750030999998444,"y":-1.7000097999999753},{"x":-1.8750030999998444,"y":-1.7000097999999753},{"x":-1.8750030999998444,"y":1.6999844000000621}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C41095.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C41095.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000012700000070253736, y: -0.000012699999956566899, z: 0.050795 },
      }}
      {...props}
    />
  )
}
