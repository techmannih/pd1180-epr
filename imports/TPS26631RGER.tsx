import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["IN2"],
  pin2: ["IN1"],
  pin3: ["B_GATE"],
  pin4: ["DRV"],
  pin5: ["IN_SYS"],
  pin6: ["UVLO"],
  pin7: ["OVP"],
  pin8: ["GND"],
  pin9: ["dVdT"],
  pin10: ["ILIM"],
  pin11: ["MODE"],
  pin12: ["N_SHDN"],
  pin13: ["IMON"],
  pin14: ["N_FLT"],
  pin15: ["PGTH"],
  pin16: ["PGOOD"],
  pin17: ["OUT2"],
  pin18: ["OUT1"],
  pin19: ["N_C6"],
  pin20: ["N_C5"],
  pin21: ["N_C4"],
  pin22: ["N_C3"],
  pin23: ["N_C2"],
  pin24: ["N_C1"],
  pin25: ["EP"]
} as const

const pinAttributes = {
  pin8: {requiresGround: true}
} as const

export const TPS26631RGER = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C1850273"
  ]
}}
      manufacturerPartNumber="TPS26631RGER"
      footprint={<footprint>
        <smtpad portHints={["pin25"]} pcbX="0.000762mm" pcbY="-0.000889mm" width="2.5999948mm" height="2.5999948mm" shape="rect" />
<smtpad portHints={["pin24"]} pcbX="-1.94818mm" pcbY="-1.250061mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin23"]} pcbX="-1.94818mm" pcbY="-0.749935mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin22"]} pcbX="-1.94818mm" pcbY="-0.250063mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin21"]} pcbX="-1.94818mm" pcbY="0.249809mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin20"]} pcbX="-1.94818mm" pcbY="0.749935mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin19"]} pcbX="-1.94818mm" pcbY="1.249807mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin18"]} pcbX="-1.249934mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin17"]} pcbX="-0.750062mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin16"]} pcbX="-0.249936mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin15"]} pcbX="0.249936mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin14"]} pcbX="0.750062mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin13"]} pcbX="1.249934mm" pcbY="1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="1.94818mm" pcbY="1.249807mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="1.94818mm" pcbY="0.749935mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="1.94818mm" pcbY="0.249809mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="1.94818mm" pcbY="-0.250063mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="1.94818mm" pcbY="-0.749935mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="1.94818mm" pcbY="-1.250061mm" width="0.6999986mm" height="0.299974mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="1.249934mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0.750062mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.249936mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-0.249936mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.750062mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-1.249934mm" pcbY="-1.941957mm" width="0.299974mm" height="0.6999986mm" shape="rect" />
<fabricationnotepath route={[{"x":1.69992040000011,"y":-2.1000466000000415},{"x":2.1000212000000147,"y":-2.1000466000000415},{"x":2.1000212000000147,"y":-1.7000220000001036}]} />
<fabricationnotepath route={[{"x":1.6000222000001258,"y":2.0999449999999342},{"x":2.1000212000000147,"y":2.0999449999999342},{"x":2.1000212000000147,"y":1.6999457999997958}]} />
<fabricationnotepath route={[{"x":-2.1000973999998678,"y":1.6956278000000111},{"x":-2.1000973999998678,"y":2.095601600000009},{"x":-1.7001235999998698,"y":2.095601600000009}]} />
<fabricationnotepath route={[{"x":-1.7001235999998698,"y":-2.1043392000001404},{"x":-2.1000973999998678,"y":-2.1043392000001404},{"x":-2.0999703999998474,"y":-1.7000220000001036}]} />
<silkscreencircle pcbX="-1.905mm" pcbY="-2.540127mm" radius="0.127mm" />
<courtyardoutline outline={[{"x":-2.5481792999999016,"y":2.5419562999999243},{"x":2.5481793000000152,"y":2.5419562999999243},{"x":2.5481793000000152,"y":-2.541956300000038},{"x":-2.5481792999999016,"y":-2.541956300000038},{"x":-2.5481792999999016,"y":2.5419562999999243}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1850273.obj?uuid=3654f3e3e10f4db0800aff4bd5674e66",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1850273.step?uuid=3654f3e3e10f4db0800aff4bd5674e66",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}