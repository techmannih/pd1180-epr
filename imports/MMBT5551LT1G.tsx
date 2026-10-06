import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["B"],
  pin2: ["E"],
  pin3: ["C"]
} as const

export const MMBT5551LT1G = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
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
