import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["1A"],
  pin2: ["1B"],
  pin3: ["2C"],
  pin4: ["GND"],
  pin5: ["2A"],
  pin6: ["2B"],
  pin7: ["1C"],
  pin8: ["VCC"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true},
  pin8: {requiresPower: true}
} as const

export const SN74LVC2G66DCUR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C181970"
  ]
}}
      manufacturerPartNumber="SN74LVC2G66DCUR"
      footprint={<footprint>
        <smtpad portHints={["pin8"]} pcbX="-1.549908mm" pcbY="-0.750062mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-1.549908mm" pcbY="-0.249936mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="-1.549908mm" pcbY="0.249936mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-1.549908mm" pcbY="0.750062mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="1.549908mm" pcbY="0.750062mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="1.549908mm" pcbY="0.249936mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="1.549908mm" pcbY="-0.249936mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<smtpad portHints={["pin1"]} pcbX="1.549908mm" pcbY="-0.750062mm" width="0.7500112mm" height="0.2500122mm" radius="0.1250061mm" shape="pill" />
<silkscreenpath route={[{"x":0.8998712000001206,"y":-1.000048799999945},{"x":0.8998712000001206,"y":0.9998964000001251},{"x":-0.9001506000000745,"y":0.9998964000001251},{"x":-0.9001506000000745,"y":-1.000048799999945}]} />
<silkscreenpath route={[{"x":-0.2541016000000127,"y":-1.0161015999998426},{"x":-0.9001506000000745,"y":-1.0161015999998426}]} />
<silkscreenpath route={[{"x":0.2538984000000255,"y":-1.0161015999998426},{"x":0.8998712000001206,"y":-1.0161015999998426}]} />
<silkscreenpath route={[{"x":0.2538729999999987,"y":-1.0160761999998158},{"x":0.1794781224214148,"y":-1.195681322421251},{"x":-0.00012700000002041634,"y":-1.2700761999999486},{"x":-0.17973212242145564,"y":-1.195681322421251},{"x":-0.25412699999992583,"y":-1.0160761999998158}]} />
<silkscreentext text="{NAME}" pcbX="0.248412mm" pcbY="2.00838mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.1749135999998543,"y":1.2499218000000383},{"x":2.174913599999968,"y":1.2499218000000383},{"x":2.174913599999968,"y":-1.2500741999998581},{"x":-2.1749135999998543,"y":-1.2500741999998581},{"x":-2.1749135999998543,"y":1.2499218000000383}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C181970.obj?uuid=714a6271b466408e99a25b85bfe66811",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C181970.step?uuid=714a6271b466408e99a25b85bfe66811",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -0.0001142999999501626, y: -0.00007619999996677507, z: -0.149083 },
      }}
      {...props}
    />
  )
}