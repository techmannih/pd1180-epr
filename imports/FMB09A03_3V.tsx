import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["POS"],
  pin2: ["NEG"]
} as const

export const FMB09A03_3V = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{pin1:{requiresPower:true},pin2:{requiresGround:true}}}
      schPinArrangement={{topSide:[1],bottomSide:[2]}}
      schWidth={1.2}
      schHeight={1.2}
      supplierPartNumbers={{
  "jlcpcb": [
    "C417385"
  ]
}}
      manufacturerPartNumber="FMB09A03-3V"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="-2.499995mm" pcbY="0mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="2.499995mm" pcbY="0mm" outerDiameter="1.7999964mm" holeDiameter="0.999998mm" shape="circle" />
<silkscreenpath route={[{"x":-3.0481270000000222,"y":1.6509999999999536},{"x":-2.286126999999965,"y":1.6509999999999536}]} />
<silkscreenpath route={[{"x":-2.6671269999999367,"y":2.158999999999992},{"x":-2.6671269999999367,"y":1.2699999999998681}]} />
<silkscreencircle pcbX="-0.000381mm" pcbY="0mm" radius="4.59994mm" />
<silkscreencircle pcbX="-0.000381mm" pcbY="0mm" radius="0.750062mm" />
<silkscreentext text="{NAME}" pcbX="0.003683mm" pcbY="5.5974mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-3.048000000000002,"y":1.524000000000001},{"x":-2.158999999999992,"y":1.524000000000001},{"x":-2.158999999999992,"y":1.77800000000002},{"x":-3.1749999999999545,"y":1.77800000000002},{"x":-3.1749999999999545,"y":1.524000000000001},{"x":-3.048000000000002,"y":1.524000000000001}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-2.5985216000000264,"y":1.2352782000000389},{"x":-2.5985216000000264,"y":2.124278200000049},{"x":-2.8525216000000455,"y":2.124278200000049},{"x":-2.8525216000000455,"y":1.1082781999999725},{"x":-2.5985216000000264,"y":1.1082781999999725},{"x":-2.5985216000000264,"y":1.2352782000000389}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-4.750118000000157,"y":4.749991000000023},{"x":4.749864000000002,"y":4.749991000000023},{"x":4.749864000000002,"y":-4.749991000000023},{"x":-4.750118000000157,"y":-4.749991000000023},{"x":-4.750118000000157,"y":4.749991000000023}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C417385.obj?uuid=ebec7e12a60540929ad44f78bf29e6c9",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C417385.step?uuid=ebec7e12a60540929ad44f78bf29e6c9",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: -0.00012700000013410317, z: -0.000009000000000369823 },
      }}
      {...props}
    />
  )
}