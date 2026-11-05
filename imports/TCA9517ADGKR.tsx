import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VCCA"],
  pin2: ["SCLA"],
  pin3: ["SDAA"],
  pin4: ["GND"],
  pin5: ["EN"],
  pin6: ["SDAB"],
  pin7: ["SCLB"],
  pin8: ["VCCB"]
} as const

const pinAttributes = {
  pin1: {requiresPower: true},
  pin8: {requiresPower: true},
  pin4: {requiresGround: true}
} as const

export const TCA9517ADGKR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      schWidth={1.96}
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C201698"
  ]
}}
      manufacturerPartNumber="TCA9517ADGKR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.975106mm" pcbY="-2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-0.324866mm" pcbY="-2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0.32512mm" pcbY="-2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="0.975106mm" pcbY="-2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="-0.975106mm" pcbY="2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-0.324866mm" pcbY="2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.32512mm" pcbY="2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.975106mm" pcbY="2.13106mm" width="0.3640074mm" height="1.6619982mm" radius="0.1820037mm" shape="pill" />
<silkscreenpath route={[{"x":-1.5761970000000929,"y":-1.0713974000000235},{"x":-1.5761970000000929,"y":1.0713974000000235},{"x":1.5761969999998655,"y":1.0713974000000235},{"x":1.5761969999998655,"y":-1.0713974000000235},{"x":-1.5761970000000929,"y":-1.0713974000000235}]} />
<silkscreencircle pcbX="-0.975106mm" pcbY="-0.319024mm" radius="0.150114mm" />
<silkscreencircle pcbX="-1.609344mm" pcbY="-2.13106mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.0889mm" pcbY="3.7686mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.7499970000000076,"y":3.2120590999999195},{"x":1.7499969999998939,"y":3.2120590999999195},{"x":1.7499969999998939,"y":-3.2120590999999195},{"x":-1.7499970000000076,"y":-3.2120590999999195},{"x":-1.7499970000000076,"y":3.2120590999999195}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C201698.obj?uuid=745f4a63f92f44b78c4ba3925feaa542",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C201698.step?uuid=745f4a63f92f44b78c4ba3925feaa542",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: -0.149083 },
      }}
      {...props}
    />
  )
}