import type { ChipProps } from "@tscircuit/props"

// User-selected land pattern, checked against all 48 C2847904 pad locations.
// `qfn48` is the footprint generator only: the physical part is LQFP-48.
// Keep its explicit EasyEDA LQFP model instead of inferring a QFN body.
export const stm32Footprint =
  "qfn48_pillpads_h10.2mm_pw0.27mm_pl1.5mm_pin1location(bottomside,left)"
export const stm32PinLabels = {
  "pin1": [
    "PC13"
  ],
  "pin2": [
    "PC14_OSC32_IN"
  ],
  "pin3": [
    "PC15_OSC32_OUT"
  ],
  "pin4": [
    "VBAT"
  ],
  "pin5": [
    "VREF_POS"
  ],
  "pin6": [
    "VDD",
    "VDDA"
  ],
  "pin7": [
    "VSS",
    "VSSA"
  ],
  "pin8": [
    "PF0_OSC_IN"
  ],
  "pin9": [
    "PF1_OSC_OUT"
  ],
  "pin10": [
    "PF2_NRST"
  ],
  "pin11": [
    "PA0"
  ],
  "pin12": [
    "PA1"
  ],
  "pin13": [
    "PA2"
  ],
  "pin14": [
    "PA3"
  ],
  "pin15": [
    "PA4"
  ],
  "pin16": [
    "PA5"
  ],
  "pin17": [
    "PA6"
  ],
  "pin18": [
    "PA7"
  ],
  "pin19": [
    "PB0"
  ],
  "pin20": [
    "PB1"
  ],
  "pin21": [
    "PB2"
  ],
  "pin22": [
    "PB10"
  ],
  "pin23": [
    "PB11"
  ],
  "pin24": [
    "PB12"
  ],
  "pin25": [
    "PB13"
  ],
  "pin26": [
    "PB14"
  ],
  "pin27": [
    "PB15"
  ],
  "pin28": [
    "PA8"
  ],
  "pin29": [
    "PA9"
  ],
  "pin30": [
    "PC6"
  ],
  "pin31": [
    "PC7"
  ],
  "pin32": [
    "PA10"
  ],
  "pin33": [
    "PA11_PA9_"
  ],
  "pin34": [
    "PA12_PA10_"
  ],
  "pin35": [
    "PA13"
  ],
  "pin36": [
    "PA14_BOOT0"
  ],
  "pin37": [
    "PA15"
  ],
  "pin38": [
    "PD0"
  ],
  "pin39": [
    "PD1"
  ],
  "pin40": [
    "PD2"
  ],
  "pin41": [
    "PD3"
  ],
  "pin42": [
    "PB3"
  ],
  "pin43": [
    "PB4"
  ],
  "pin44": [
    "PB5"
  ],
  "pin45": [
    "PB6"
  ],
  "pin46": [
    "PB7"
  ],
  "pin47": [
    "PB8"
  ],
  "pin48": [
    "PB9"
  ]
} as const
export const STM32G0B1 = (props: ChipProps<typeof stm32PinLabels>) => {
  return <chip
    supplierPartNumbers={{ jlcpcb: ["C2847904"] }}
    manufacturerPartNumber="STM32G0B1CBT6"
    footprint={stm32Footprint}
    cadModel={{
      objUrl: "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=a4b96ad857dc48c08dab3d0efdf20aec&pn=C2847904",
      rotationOffset: { x: 0, y: 0, z: 0 },
      positionOffset: { x: 0, y: 0, z: 0 },
    }}
    {...props}
    pinLabels={stm32PinLabels}
    pinAttributes={{ pin4: { requiresPower: true }, pin5: { requiresPower: true }, pin6: { requiresPower: true }, pin7: { requiresGround: true } }}
  />
}

// The standalone viewer must render the component, not the pin-label export.
export default STM32G0B1
