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

export const SN74LVC2G66DCTR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2651913"
  ]
}}
      manufacturerPartNumber="SN74LVC2G66DCTR"
      footprint={<footprint>
        <smtpad portHints={["pin5"]} pcbX="-1.89992mm" pcbY="0.975106mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-1.89992mm" pcbY="0.324866mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-1.89992mm" pcbY="-0.32512mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-1.89992mm" pcbY="-0.975106mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="1.89992mm" pcbY="0.975106mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="1.89992mm" pcbY="0.324866mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="1.89992mm" pcbY="-0.32512mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="1.89992mm" pcbY="-0.975106mm" width="1.0999978mm" height="0.3999992mm" shape="rect" />
<silkscreenpath route={[{"x":-1.3999972000000298,"y":-1.349933799999917},{"x":-1.3999972000000298,"y":-1.3999209999998357}]} />
<silkscreenpath route={[{"x":1.3999972000000298,"y":-1.349933799999917},{"x":1.3999972000000298,"y":-1.4999207999999271}]} />
<silkscreenpath route={[{"x":-1.3999718000001167,"y":1.5000731999999743},{"x":-1.3999718000001167,"y":1.350086200000078}]} />
<silkscreenpath route={[{"x":1.3999972000000298,"y":1.5000731999999743},{"x":1.3999972000000298,"y":1.350086200000078}]} />
<silkscreenpath route={[{"x":-1.3999718000001167,"y":1.5000731999999743},{"x":1.399971800000003,"y":1.5000731999999743}]} />
<silkscreenpath route={[{"x":-1.3999972000000298,"y":-1.4999207999999271},{"x":1.3999972000000298,"y":-1.4999207999999271}]} />
<silkscreencircle pcbX="2.032mm" pcbY="-1.778mm" radius="0.127mm" />
<silkscreentext text="{NAME}" pcbX="-0.006096mm" pcbY="2.497584mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.699918900000057,"y":1.7500731999999743},{"x":2.699918900000057,"y":1.7500731999999743},{"x":2.699918900000057,"y":-1.7499207999999271},{"x":-2.699918900000057,"y":-1.7499207999999271},{"x":-2.699918900000057,"y":1.7500731999999743}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2651913.obj?uuid=a9c4af1c6887409da4aae582bac61c76",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2651913.step?uuid=a9c4af1c6887409da4aae582bac61c76",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.00007620000019414874, z: -0.65 },
      }}
      {...props}
    />
  )
}