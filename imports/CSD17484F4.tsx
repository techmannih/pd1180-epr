import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["G", "gate"],
  pin2: ["S", "source"],
  pin3: ["D", "drain"],
} as const

export const CSD17484F4 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <mosfet
      channelType="n"
      mosfetMode="enhancement"
      symbol={
        <symbol>
          <schematicpath points={[{"x":0,"y":0},{"x":0.12,"y":-0.04},{"x":0.12,"y":0.04},{"x":0,"y":0}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0.4,"y":0.04},{"x":0.34,"y":-0.06},{"x":0.46,"y":-0.06},{"x":0.4,"y":0.04}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0,"y":0.14},{"x":0.2,"y":0.14},{"x":0.2,"y":0.2},{"x":0.4,"y":0.2},{"x":0.4,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0},{"x":0.2,"y":0},{"x":0.2,"y":-0.2},{"x":0.4,"y":-0.2},{"x":0.4,"y":-0.06}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.14},{"x":0,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.04,"y":0.18},{"x":-0.04,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.04},{"x":0,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.18},{"x":0,"y":-0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":0},{"x":-0.04,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.48,"y":0.04},{"x":0.44,"y":0.04},{"x":0.36,"y":0.04},{"x":0.32,"y":0.04}]} strokeColor="#880000" />
          <port name="pin3" pinNumber={3} aliases={["D", "drain"]} direction="up" schX={0.2} schY={0.4} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["G", "gate"]} direction="left" schX={-0.4} schY={0} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["S", "source"]} direction="down" schX={0.2} schY={-0.4} schStemLength={0.2} />
          <schematictext schX={0.03} schY={0.62} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C2862245"
  ]
}}
      manufacturerPartNumber="CSD17484F4"
      footprint={<footprint>
        <smtpad portHints={["pin3"]} pcbX="0.29986605mm" pcbY="-0mm" width="0.350012mm" height="0.499999mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.34986595mm" pcbY="0.175006mm" width="0.2500122mm" height="0.150114mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.34986595mm" pcbY="-0.175006mm" width="0.2500122mm" height="0.150114mm" shape="rect" />
<silkscreenpath route={[{"x":-0.4749101500000279,"y":0.3999229999998306},{"x":-0.6251003500000252,"y":0.3999229999998306},{"x":-0.6251003500000252,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":0.524960849999843,"y":-0.4001515999999583},{"x":0.634968249999929,"y":-0.4001515999999583},{"x":0.634968249999929,"y":0.3999229999998306},{"x":0.524960849999843,"y":0.3999229999998306}]} />
<silkscreenpath route={[{"x":0.5249100500000168,"y":0.3999229999998306},{"x":0.3532060499999261,"y":0.3999229999998306}]} />
<silkscreenpath route={[{"x":0.35462844999983645,"y":-0.40010080000013204},{"x":0.5249100500000168,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":-0.6251003500000252,"y":-0.40010080000013204},{"x":-0.47409734999996545,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":-0.12596495000002506,"y":-0.40010080000013204},{"x":0.14507845000002817,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":0.14657704999990528,"y":0.3999229999998306},{"x":-0.1251521500000763,"y":0.3999229999998306}]} />
<silkscreenpath route={[{"x":-0.6251003500000252,"y":-0.40010080000013204},{"x":-0.47409734999996545,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":-0.12596495000002506,"y":-0.40010080000013204},{"x":0.14507845000002817,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":0.14657704999990528,"y":0.3999229999998306},{"x":0.07502524999983962,"y":0.3999229999998306}]} />
<silkscreenpath route={[{"x":0.09529444999986936,"y":-0.40010080000013204},{"x":0.14507845000002817,"y":-0.40010080000013204}]} />
<silkscreenpath route={[{"x":0.14657704999990528,"y":0.3999229999998306},{"x":0.03773804999980257,"y":0.3999229999998306}]} />
<silkscreentext text="{NAME}" pcbX="0.00040005mm" pcbY="1.404114mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-0.7248720500000445,"y":0.5498978000000534},{"x":0.7248720500000445,"y":0.5498978000000534},{"x":0.7248720500000445,"y":-0.5501264000000674},{"x":-0.7248720500000445,"y":-0.5501264000000674},{"x":-0.7248720500000445,"y":0.5498978000000534}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2862245.obj?uuid=2172206070d24ac0a7f8df923a642e0e",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2862245.step?uuid=2172206070d24ac0a7f8df923a642e0e",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.025012650000007852, y: 0.00011430000006384944, z: -0.01 },
      }}
      {...props}
    />
  )
}
