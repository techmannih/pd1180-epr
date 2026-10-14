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

// The DFN generator describes the lands; the physical PW package is TSSOP-16.
export const tca9538Footprint =
  "dfn16_pillpads_p0.65mm_w7.46mm_pw0.34mm_pl1.73mm_pin1location(leftside,bottom)"

export const TCA9538PWR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{ jlcpcb: ["C2652286"] }}
      manufacturerPartNumber="TCA9538PWR"
      footprint={tca9538Footprint}
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

export default TCA9538PWR
