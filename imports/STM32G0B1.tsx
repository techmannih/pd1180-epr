import type { ChipProps } from "@tscircuit/props"

// STM32G0B1CEU6, GP pinout. ST DS13560 Rev 6, figures 6 and 46.
// 0.5 mm pitch; 0.30 x 0.55 mm peripheral lands, 5.60 mm grounded EP.
export const stm32Footprint = <footprint>
  <smtpad portHints={["pin1"]} pcbX={-2.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin2"]} pcbX={-2.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin3"]} pcbX={-1.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin4"]} pcbX={-1.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin5"]} pcbX={-0.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin6"]} pcbX={-0.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin7"]} pcbX={0.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin8"]} pcbX={0.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin9"]} pcbX={1.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin10"]} pcbX={1.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin11"]} pcbX={2.25} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin12"]} pcbX={2.75} pcbY={-3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin13"]} pcbX={3.375} pcbY={-2.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin14"]} pcbX={3.375} pcbY={-2.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin15"]} pcbX={3.375} pcbY={-1.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin16"]} pcbX={3.375} pcbY={-1.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin17"]} pcbX={3.375} pcbY={-0.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin18"]} pcbX={3.375} pcbY={-0.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin19"]} pcbX={3.375} pcbY={0.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin20"]} pcbX={3.375} pcbY={0.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin21"]} pcbX={3.375} pcbY={1.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin22"]} pcbX={3.375} pcbY={1.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin23"]} pcbX={3.375} pcbY={2.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin24"]} pcbX={3.375} pcbY={2.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin25"]} pcbX={2.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin26"]} pcbX={2.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin27"]} pcbX={1.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin28"]} pcbX={1.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin29"]} pcbX={0.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin30"]} pcbX={0.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin31"]} pcbX={-0.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin32"]} pcbX={-0.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin33"]} pcbX={-1.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin34"]} pcbX={-1.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin35"]} pcbX={-2.25} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin36"]} pcbX={-2.75} pcbY={3.375} width={0.3} height={0.55} shape="rect" />
  <smtpad portHints={["pin37"]} pcbX={-3.375} pcbY={2.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin38"]} pcbX={-3.375} pcbY={2.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin39"]} pcbX={-3.375} pcbY={1.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin40"]} pcbX={-3.375} pcbY={1.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin41"]} pcbX={-3.375} pcbY={0.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin42"]} pcbX={-3.375} pcbY={0.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin43"]} pcbX={-3.375} pcbY={-0.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin44"]} pcbX={-3.375} pcbY={-0.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin45"]} pcbX={-3.375} pcbY={-1.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin46"]} pcbX={-3.375} pcbY={-1.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin47"]} pcbX={-3.375} pcbY={-2.25} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin48"]} pcbX={-3.375} pcbY={-2.75} width={0.55} height={0.3} shape="rect" />
  <smtpad portHints={["pin49"]} pcbX={0} pcbY={0} width={5.6} height={5.6}
    shape="rect" solderPasteMargin={-0.5} />
  <courtyardrect width={7.8} height={7.8} />
  <fabricationnotepath route={[{x:-3.5,y:-3.5},{x:3.5,y:-3.5},{x:3.5,y:3.5},{x:-3.5,y:3.5},{x:-3.5,y:-3.5}]} />
  <silkscreenpath route={[{x:-3.8,y:-3.1},{x:-3.8,y:-3.8},{x:-3.1,y:-3.8}]} />
  <silkscreentext text="{NAME}" pcbX={0} pcbY={4.6} anchorAlignment="center" />
</footprint>
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
  ],
  "pin49": ["EP_GND"]
} as const
export const STM32G0B1 = (props: ChipProps<typeof stm32PinLabels>) => {
  return <chip
    supplierPartNumbers={{ jlcpcb: ["C2829190"] }}
    manufacturerPartNumber="STM32G0B1CEU6"
    footprint={stm32Footprint}
    cadModel={{
      objUrl: "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=16912e571dfb42a9a47b4df7b841ed45&pn=C2829190",
      rotationOffset: { x: 0, y: 0, z: 90 },
      positionOffset: { x: 0, y: 0, z: 0 },
    }}
    {...props}
    pinLabels={stm32PinLabels}
    pinAttributes={{ pin4: { requiresPower: true }, pin5: { requiresPower: true }, pin6: { requiresPower: true }, pin7: { requiresGround: true }, pin49: { requiresGround: true } }}
  />
}

// The standalone viewer must render the component, not the pin-label export.
export default STM32G0B1
