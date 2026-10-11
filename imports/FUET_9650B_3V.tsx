import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["POS"],
  pin2: ["NEG"]
} as const

export const FUET_9650B_3V = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{
        pin1: { requiresPower: true },
        pin2: { requiresGround: true },
      }}
      symbol={
        <symbol>
          <port name="pin1" pinNumber={1} aliases={["POS"]} direction="left" schX={-0.2} schY={0.2} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["NEG"]} direction="left" schX={-0.2} schY={0} schStemLength={0.2} />
          <schematicpath points={[{"x":0.38,"y":0.4},{"x":0.2,"y":0.24}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.04},{"x":0.38,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.38,"y":0.4},{"x":0.38,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.24},{"x":0.2,"y":-0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.24},{"x":0,"y":-0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.04},{"x":0.2,"y":-0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.24},{"x":0.2,"y":0.24}]} strokeColor="#880000" />
          <schematictext schX={0.08} schY={0.6} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C391032"
  ]
}}
      manufacturerPartNumber="FUET-9650B-3V"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="4.500372mm" pcbY="0mm" width="2.499995mm" height="1.7999964mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-4.500372mm" pcbY="0mm" width="2.499995mm" height="1.7999964mm" shape="rect" />
<silkscreenpath route={[{"x":-5.079542800000013,"y":-1.2319254000000228},{"x":-5.079542800000013,"y":-5.080000000000041}]} />
<silkscreenpath route={[{"x":-5.079542800000013,"y":3.302000000000021},{"x":-5.079542800000013,"y":1.2319254000000228}]} />
<silkscreenpath route={[{"x":5.080457199999955,"y":-5.080000000000041},{"x":-5.079542800000013,"y":-5.080000000000041}]} />
<silkscreenpath route={[{"x":5.080457199999955,"y":-1.2311888000000408},{"x":5.080457199999955,"y":-5.080000000000041}]} />
<silkscreenpath route={[{"x":5.080457199999955,"y":5.080000000000041},{"x":5.080457199999955,"y":1.2311633999999003}]} />
<silkscreenpath route={[{"x":-4.381042800000159,"y":-2.413000000000011},{"x":-2.9840427999999974,"y":-2.413000000000011}]} />
<silkscreenpath route={[{"x":2.8579571999998734,"y":-2.5399999999999636},{"x":4.254957199999922,"y":-2.5399999999999636}]} />
<silkscreenpath route={[{"x":3.5564571999999544,"y":-1.7779999999999063},{"x":3.5564571999999544,"y":-3.3019999999999072}]} />
<silkscreenpath route={[{"x":-5.079542800000013,"y":3.302000000000021},{"x":-3.3015428000001066,"y":5.080000000000041},{"x":5.080457199999955,"y":5.080000000000041}]} />
<silkscreencircle pcbX="0.000508mm" pcbY="0mm" radius="1.17094mm" />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="6.080508mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":3.4924237999998695,"y":0.19050000000004275},{"x":5.651423799999861,"y":0.19050000000004275},{"x":5.651423799999861,"y":-0.19050000000004275},{"x":3.4924237999998695,"y":-0.19050000000004275},{"x":3.4924237999998695,"y":0.19050000000004275}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":4.409897200000046,"y":-1.0700003999999126},{"x":4.409897200000046,"y":1.0889996000000792},{"x":4.790897200000018,"y":1.0889996000000792},{"x":4.790897200000018,"y":-1.0700003999999126},{"x":4.409897200000046,"y":-1.0700003999999126}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-5.508244000000104,"y":0.19050000000004275},{"x":-3.3492440000001125,"y":0.19050000000004275},{"x":-3.3492440000001125,"y":-0.19050000000004275},{"x":-5.508244000000104,"y":-0.19050000000004275},{"x":-5.508244000000104,"y":0.19050000000004275}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-2.5501092000000654,"y":4.850003000000129},{"x":-4.850104600000009,"y":4.850003000000129},{"x":-4.850104600000009,"y":2.950006799999983},{"x":-2.5501092000000654,"y":4.850003000000129}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-6.000369500000033,"y":5.049990399999956},{"x":6.00036949999992,"y":5.049990399999956},{"x":6.00036949999992,"y":-5.049990399999956},{"x":-6.000369500000033,"y":-5.049990399999956},{"x":-6.000369500000033,"y":5.049990399999956}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C391032.obj?uuid=01837209aada41dc9731c0ff01df96cf",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C391032.step?uuid=01837209aada41dc9731c0ff01df96cf",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.00010160000010728254, y: 0, z: -0.2 },
      }}
      {...props}
    />
  )
}
