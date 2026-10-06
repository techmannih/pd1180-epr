import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["PGND"],
  pin2: ["VIN"],
  pin3: ["EN"],
  pin4: ["PG"],
  pin5: ["FB"],
  pin6: ["VCC"],
  pin7: ["BOOT"],
  pin8: ["SW"],
  pin9: ["PAD"]
} as const

const pinAttributes = {
  pin1: {requiresGround: true},
  pin2: {requiresPower: true},
  pin6: {requiresPower: true}
} as const

export const LMR36510ADDAR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C1858393"
  ]
}}
      manufacturerPartNumber="LMR36510ADDAR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.905mm" pcbY="-2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-0.635mm" pcbY="-2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="0.635mm" pcbY="-2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="1.905mm" pcbY="-2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="-1.905mm" pcbY="2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="-0.635mm" pcbY="2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.635mm" pcbY="2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="1.905mm" pcbY="2.84607mm" width="0.6999986mm" height="1.6999966mm" radius="0.3499993mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="-0mm" pcbY="0mm" width="3.499993mm" height="2.499995mm" shape="rect" />
<fabricationnotepath route={[{"x":-2.5999694000000773,"y":1.9999960000001238},{"x":-2.5999694000000773,"y":-1.99999600000001}]} />
<fabricationnotepath route={[{"x":2.5999693999999636,"y":1.9999960000001238},{"x":2.5999693999999636,"y":-1.99999600000001}]} />
<fabricationnotepath route={[{"x":-2.5999694000000773,"y":1.9999960000001238},{"x":2.5999693999999636,"y":1.9999960000001238}]} />
<fabricationnotepath route={[{"x":-2.5999694000000773,"y":-1.99999600000001},{"x":2.5999693999999636,"y":-1.99999600000001}]} />
<fabricationnotepath route={[{"x":-2.7940000000000964,"y":-2.3114000000000487},{"x":-2.983175014216158,"y":-2.4503174491942445},{"x":-2.9100812288966154,"y":-2.6733478108984627},{"x":-2.675378771103283,"y":-2.6733478108984627},{"x":-2.6022849857838537,"y":-2.4503174491942445},{"x":-2.791460000000029,"y":-2.3114000000000487}]} />
<courtyardoutline outline={[{"x":-2.7499950000000126,"y":3.9460683000000927},{"x":2.7499950000000126,"y":3.9460683000000927},{"x":2.7499950000000126,"y":-3.9460683000000927},{"x":-2.7499950000000126,"y":-3.9460683000000927},{"x":-2.7499950000000126,"y":3.9460683000000927}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1858393.obj?uuid=765d86d522014712af5a26ea59477fa9",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1858393.step?uuid=765d86d522014712af5a26ea59477fa9",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0, z: 0.1 },
      }}
      {...props}
    />
  )
}