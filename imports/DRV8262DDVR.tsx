import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND2"],
  pin2: ["VM4"],
  pin3: ["PGNDB2"],
  pin4: ["BOUT13"],
  pin5: ["BOUT12"],
  pin6: ["BOUT11"],
  pin7: ["BOUT23"],
  pin8: ["BOUT22"],
  pin9: ["BOUT21"],
  pin10: ["PGNDB1"],
  pin11: ["VM3"],
  pin12: ["VM2"],
  pin13: ["PGNDA2"],
  pin14: ["AOUT23"],
  pin15: ["AOUT22"],
  pin16: ["AOUT21"],
  pin17: ["AOUT13"],
  pin18: ["AOUT12"],
  pin19: ["AOUT11"],
  pin20: ["PGNDA1"],
  pin21: ["VM1"],
  pin22: ["VCP"],
  pin23: ["CPH"],
  pin24: ["CPL"],
  pin25: ["nSLEEP"],
  pin26: ["EN1"],
  pin27: ["PH1"],
  pin28: ["EN2"],
  pin29: ["PH2"],
  pin30: ["DECAY"],
  pin31: ["RSVD1"],
  pin32: ["TOFF"],
  pin33: ["VREF1"],
  pin34: ["VREF2"],
  pin35: ["RSVD2"],
  pin36: ["IPROPI1"],
  pin37: ["IPROPI2"],
  pin38: ["MODE2"],
  pin39: ["MODE1"],
  pin40: ["OCPM"],
  pin41: ["nFAULT"],
  pin42: ["VCC"],
  pin43: ["DVDD"],
  pin44: ["GND1"]
} as const

const pinAttributes = {
  pin1: {requiresGround: true},
  pin42: {requiresPower: true},
  pin44: {requiresGround: true}
} as const

export const DRV8262DDVR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      schWidth={1.49}
      supplierPartNumbers={{
  "jlcpcb": [
    "C33828788"
  ]
}}
      manufacturerPartNumber="DRV8262DDVR"
      footprint="tssop44_p0.635mm_w5.9999mm_pw0.4mm_pl1.6mm_rounded0mm_pin1location(leftside,bottom)"
      // TI DDV0044D: exposed thermal metal is on TOP, not a PCB solder pad.
      // Same DDV lead land pattern as DRV8462; no fictitious pin45/underside paste.
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C29780285.obj?uuid=cf5243222a414b389af12f2ed19093be",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C29780285.step?uuid=cf5243222a414b389af12f2ed19093be",
        modelOriginPosition: { x: 0, y: 0.0000127, z: -0.65 },
      }}
      {...props}
    />
  )
}