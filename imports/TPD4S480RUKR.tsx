import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["DP", "C_SBU1"],
  pin2: ["DM", "C_SBU2"],
  pin3: ["VBIAS"],
  pin4: ["CC1", "C_CC1"],
  pin5: ["CC2", "C_CC2"],
  pin6: ["RPD_G2"],
  pin7: ["RPD_G1"],
  pin8: ["GND3"],
  pin9: ["N_FLT"],
  pin10: ["VPWR"],
  pin11: ["CC2"],
  pin12: ["CC1"],
  pin13: ["GND2"],
  pin14: ["SBU2"],
  pin15: ["SBU1"],
  pin16: ["EPR_EN"],
  pin17: ["EPR_BLK_G"],
  pin18: ["GND1"],
  pin19: ["VBUS_LV"],
  pin20: ["VBUS"],
  pin21: ["EP"]
} as const

const pinAttributes = {
  pin8: {requiresGround: true},
  pin13: {requiresGround: true},
  pin18: {requiresGround: true},
  pin20: {requiresPower: true}
} as const

export const TPD4S480RUKR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C43131250"
  ]
}}
      manufacturerPartNumber="TPD4S480RUKR"
      footprint={<footprint>
        <smtpad portHints={["pin21"]} pcbX="0.000127mm" pcbY="-0.000127mm" width="1.6999966mm" height="1.6999966mm" shape="rect" />
<smtpad portHints={["pin20"]} pcbX="-1.499997mm" pcbY="-0.799973mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin19"]} pcbX="-1.499997mm" pcbY="-0.399923mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin18"]} pcbX="-1.499997mm" pcbY="0.000127mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin17"]} pcbX="-1.499997mm" pcbY="0.399923mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin16"]} pcbX="-1.499997mm" pcbY="0.799973mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin15"]} pcbX="-0.799973mm" pcbY="1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin14"]} pcbX="-0.399923mm" pcbY="1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin13"]} pcbX="0.000127mm" pcbY="1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="0.400177mm" pcbY="1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="0.800227mm" pcbY="1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="1.499997mm" pcbY="0.799719mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="1.499997mm" pcbY="0.399669mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="1.499997mm" pcbY="-0.000127mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="1.499997mm" pcbY="-0.400177mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="1.499997mm" pcbY="-0.800227mm" width="0.7999984mm" height="0.1999996mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0.800227mm" pcbY="-1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.400177mm" pcbY="-1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.000127mm" pcbY="-1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.399923mm" pcbY="-1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.799973mm" pcbY="-1.499997mm" width="0.1999996mm" height="0.7999984mm" shape="rect" />
<fabricationnotepath route={[{"x":-1.5499079999999594,"y":0.9999725999999782},{"x":-1.5499079999999594,"y":1.5499079999999594},{"x":-0.9999725999999782,"y":1.5499079999999594}]} />
<fabricationnotepath route={[{"x":1.549958800000013,"y":-1.0000233999999182},{"x":1.549958800000013,"y":-1.549958800000013},{"x":1.0000234000000319,"y":-1.549958800000013}]} />
<fabricationnotepath route={[{"x":0.9499854000000596,"y":1.5499079999999594},{"x":1.549958800000013,"y":1.5499079999999594},{"x":1.549958800000013,"y":0.9999725999999782}]} />
<fabricationnotepath route={[{"x":-1.5499079999999594,"y":-1.1001247999998895},{"x":-1.5499079999999594,"y":-1.549958800000013},{"x":-1.0500105999999505,"y":-1.549958800000013}]} />
<silkscreencircle pcbX="-1.396619mm" pcbY="-1.904873mm" radius="0.100076mm" />
<courtyardoutline outline={[{"x":-2.1499962000000323,"y":2.149996200000146},{"x":2.1499962000000323,"y":2.149996200000146},{"x":2.1499962000000323,"y":-2.1499962000000323},{"x":-2.1499962000000323,"y":-2.1499962000000323},{"x":-2.1499962000000323,"y":2.149996200000146}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C43131250.obj?uuid=71760926877f42c6b0f5954e672bfe89",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C43131250.step?uuid=71760926877f42c6b0f5954e672bfe89",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.00015240000004723697, y: -0.0001015999999935957, z: 0 },
      }}
      {...props}
    />
  )
}
