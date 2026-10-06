import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["G"],
  pin2: ["S"],
  pin3: ["D"]
} as const

export const BSS123LT1G = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
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
