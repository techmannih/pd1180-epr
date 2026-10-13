import type { CapacitorProps } from "@tscircuit/props"

export const EEUFR1J471 = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="470uF"
      polarized
      supplierPartNumbers={{
  "jlcpcb": [
    "C407954"
  ]
}}
      manufacturerPartNumber="EEUFR1J471"
      footprint={<footprint>
        <platedhole  portHints={["pin1","anode","pos"]} pcbX="-2.499995mm" pcbY="0mm" outerDiameter="2.0999958mm" holeDiameter="1.1999976mm" shape="circle" />
<platedhole  portHints={["pin2","cathode","neg"]} pcbX="2.499995mm" pcbY="0mm" outerDiameter="2.0999958mm" holeDiameter="1.1999976mm" shape="circle" />
<fabricationnotepath route={[{"x":-4.140326999999999,"y":0.17780000000000484},{"x":-5.816726999999986,"y":0.17780000000000484}]} />
<fabricationnotepath route={[{"x":-5.00392699999999,"y":-0.6603999999999957},{"x":-5.00392699999999,"y":1.0668000000000006}]} />
<silkscreencircle pcbX="-0.000127mm" pcbY="0mm" radius="6.249924mm" />
<fabricationnotepath route={[{"x":-6.000114999999994,"y":0.2500122000000147},{"x":-4.000118999999998,"y":0.2500122000000147},{"x":-4.000118999999998,"y":0},{"x":-6.000114999999994,"y":0},{"x":-6.000114999999994,"y":0.2500122000000147}]} strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":-5.0921665999999846,"y":-0.8112759999999923},{"x":-5.0921665999999846,"y":1.1887200000000178},{"x":-4.842154399999998,"y":1.1887200000000178},{"x":-4.842154399999998,"y":-0.8112759999999923},{"x":-5.0921665999999846,"y":-0.8112759999999923}]} strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-6.505003999999985,"y":6.37498140000001},{"x":6.504978599999987,"y":6.37498140000001},{"x":6.504978599999987,"y":-6.37500679999998},{"x":-6.505003999999985,"y":-6.37500679999998},{"x":-6.505003999999985,"y":6.37498140000001}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C407954.obj?uuid=1492b678811d4009bce52665832646fc",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C407954.step?uuid=1492b678811d4009bce52665832646fc",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.005012699999984882, y: 0.000012699999999199463, z: -16.510007 },
      }}
      {...restProps}
    />
  )
}