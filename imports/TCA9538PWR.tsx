import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["A0"],
  pin2: ["A1"],
  pin3: ["N_RESET"],
  pin4: ["P0"],
  pin5: ["P1"],
  pin6: ["P2"],
  pin7: ["P3"],
  pin8: ["GND"],
  pin9: ["P4"],
  pin10: ["P5"],
  pin11: ["P6"],
  pin12: ["P7"],
  pin13: ["N_INT"],
  pin14: ["SCL"],
  pin15: ["SDA"],
  pin16: ["VCC"]
} as const

const pinAttributes = {
  pin8: {requiresGround: true},
  pin16: {requiresPower: true}
} as const

export const TCA9538PWR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2652286"
  ]
}}
      manufacturerPartNumber="TCA9538PWR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.275078mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-1.625092mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-0.975106mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-0.324866mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.32512mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.975106mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="1.625092mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="2.275078mm" pcbY="-2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="-2.275078mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="-1.625092mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="-0.975106mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="-0.324866mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="0.32512mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="0.975106mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="1.625092mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="2.275078mm" pcbY="2.865755mm" width="0.3430016mm" height="1.7314926mm" radius="0.1715008mm" shape="pill" />
<silkscreenpath route={[{"x":-2.5761949999999842,"y":-1.7712690000000748},{"x":-2.5761949999999842,"y":1.771523000000002},{"x":2.5761949999999842,"y":1.771523000000002},{"x":2.5761949999999842,"y":-1.7712690000000748},{"x":-2.5761949999999842,"y":-1.7712690000000748}]} />
<silkscreencircle pcbX="-2.032mm" pcbY="-1.27mm" radius="0.150114mm" />
<silkscreencircle pcbX="-2.898902mm" pcbY="-2.865755mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.2413mm" pcbY="4.556127mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.7499950000001263,"y":3.981501299999991},{"x":2.749994999999899,"y":3.981501299999991},{"x":2.749994999999899,"y":-3.981501299999877},{"x":-2.7499950000001263,"y":-3.981501299999877},{"x":-2.7499950000001263,"y":3.981501299999991}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2652286.obj?uuid=534f03d8fe164fbab551f91e5a792e30",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2652286.step?uuid=534f03d8fe164fbab551f91e5a792e30",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.00012700000002041634, y: 0, z: -0.019205 },
      }}
      {...props}
    />
  )
}