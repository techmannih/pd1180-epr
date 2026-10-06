import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["LDO_3V3"],
  pin2: ["ADCIN1"],
  pin3: ["ADCIN2"],
  pin4: ["LDO_1V5"],
  pin5: ["GPIO0"],
  pin6: ["GPIO1"],
  pin7: ["GPIO2"],
  pin8: ["I2Ct_SDA"],
  pin9: ["I2Ct_SCL"],
  pin10: ["N_I2Ct_IRQ"],
  pin11: ["GND1"],
  pin12: ["GND2"],
  pin13: ["GPIO11"],
  pin14: ["GND3"],
  pin15: ["I2Cc_SDA"],
  pin16: ["I2Cc_SCL"],
  pin17: ["N_I2Cc_IRQ"],
  pin18: ["GPIO3"],
  pin19: ["GND5"],
  pin20: ["POWER_PATH_EN"],
  pin21: ["NC"],
  pin22: ["GPIO4","USB_P","LD1"],
  pin23: ["GPIO5","USB_N","LD2"],
  pin24: ["CC1"],
  pin25: ["CC2"],
  pin26: ["VBUS1"],
  pin27: ["VBUS2"],
  pin28: ["PP5V1"],
  pin29: ["PP5V2"],
  pin30: ["GPIO7"],
  pin31: ["GPIO6"],
  pin32: ["VIN_3V3"],
  pin33: ["GND4"]
} as const

const pinAttributes = {
  pin11: {requiresGround: true},
  pin12: {requiresGround: true},
  pin14: {requiresGround: true},
  pin19: {requiresGround: true},
  pin21: {doNotConnect: true},
  pin26: {requiresPower: true},
  pin27: {requiresPower: true},
  pin33: {requiresGround: true}
} as const

export const TPS26750SRSMR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C42166327"
  ]
}}
      manufacturerPartNumber="TPS26750SRSMR"
      footprint={<footprint>
        <smtpad portHints={["pin9"]} pcbX="2.050034mm" pcbY="-1.400048mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="2.050034mm" pcbY="-0.999998mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="2.050034mm" pcbY="-0.599948mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="2.050034mm" pcbY="-0.199898mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="2.050034mm" pcbY="0.199898mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="2.050034mm" pcbY="0.599948mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="2.050034mm" pcbY="0.999998mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="2.050034mm" pcbY="1.400048mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="-2.050034mm" pcbY="1.400048mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="-2.050034mm" pcbY="0.999998mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="-2.050034mm" pcbY="0.599948mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin28"]} pcbX="-2.050034mm" pcbY="0.199898mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin29"]} pcbX="-2.050034mm" pcbY="-0.199898mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin30"]} pcbX="-2.050034mm" pcbY="-0.599948mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin31"]} pcbX="-2.050034mm" pcbY="-0.999998mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin32"]} pcbX="-2.050034mm" pcbY="-1.400048mm" width="0.6999986mm" height="0.1999996mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin33"]} pcbX="0mm" pcbY="0mm" width="2.7999944mm" height="2.7999944mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-1.400048mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-1.000252mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-0.600202mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-0.200152mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="0.199898mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="0.599948mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="0.999744mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="1.399794mm" pcbY="-2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="1.399794mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="0.999744mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="0.599948mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="0.199898mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="-0.200152mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="-0.600202mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="-1.000252mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="-1.400048mm" pcbY="2.050034mm" width="0.1999996mm" height="0.6999986mm" radius="0.0999998mm" shape="pill" />
<fabricationnotepath route={[{"x":1.7909539999999993,"y":2.010155999999995},{"x":2.0598383999999896,"y":2.010155999999995},{"x":2.0598383999999896,"y":1.7413477999999856}]} />
<fabricationnotepath route={[{"x":-1.9401536000000021,"y":-1.7210278000000017},{"x":-1.939975799999985,"y":-1.7210278000000017},{"x":-1.6711675999999898,"y":-1.989836000000011}]} />
<fabricationnotepath route={[{"x":-1.9401536000000021,"y":1.7413477999999856},{"x":-1.9401536000000021,"y":2.010155999999995}]} />
<fabricationnotepath route={[{"x":-1.6711675999999898,"y":-1.989836000000011},{"x":-1.9401536000000021,"y":-1.989836000000011},{"x":-1.9401536000000021,"y":-1.7210278000000017}]} />
<fabricationnotepath route={[{"x":2.0598383999999896,"y":-1.7210278000000017},{"x":2.0598383999999896,"y":-1.989836000000011},{"x":1.7909539999999993,"y":-1.989836000000011}]} />
<fabricationnotepath route={[{"x":-1.9401536000000021,"y":2.010155999999995},{"x":-1.6711675999999898,"y":2.010155999999995}]} />
<silkscreencircle pcbX="-1.850136mm" pcbY="-2.389886mm" radius="0.100076mm" />
<courtyardoutline outline={[{"x":-2.6500333000000182,"y":2.65003329999999},{"x":2.6500333000000182,"y":2.65003329999999},{"x":2.6500333000000182,"y":-2.650033300000004},{"x":-2.6500333000000182,"y":-2.650033300000004},{"x":-2.6500333000000182,"y":2.65003329999999}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C42166327.obj?uuid=6dd4b697c6114e499488df6aa2ee6458",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C42166327.step?uuid=6dd4b697c6114e499488df6aa2ee6458",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}