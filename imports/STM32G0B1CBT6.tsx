import { type ChipProps } from "@tscircuit/props"
const pinLabels = {
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
export const STM32G0B1CBT6 = (props: ChipProps<typeof pinLabels>) => (
  <chip
    footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.7500579999999957mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-2.2499319999999727mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-1.7500599999999622mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-1.249933999999996mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-0.7500619999999856mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="-0.24993599999999105mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="0.24993600000001948mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="0.750062000000014mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="1.249934000000053mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="1.750060000000019mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="2.2499320000000296mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="2.750058000000024mm" pcbY="-4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="4.249928000000011mm" pcbY="-2.750058000000003mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="4.249928000000011mm" pcbY="-2.249932000000001mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="4.249928000000011mm" pcbY="-1.7500600000000048mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="4.249928000000011mm" pcbY="-1.2499340000000103mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="4.249928000000011mm" pcbY="-0.7500619999999998mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="4.249928000000011mm" pcbY="-0.24993600000001237mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="4.249928000000011mm" pcbY="0.24993599999999816mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="4.249928000000011mm" pcbY="0.7500619999999856mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="4.249928000000011mm" pcbY="1.249933999999996mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="4.249928000000011mm" pcbY="1.7500599999999977mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="4.249928000000011mm" pcbY="2.249931999999994mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="4.249928000000011mm" pcbY="2.7500579999999957mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="2.750058000000024mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="2.2499320000000296mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="1.750060000000019mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin28"]} pcbX="1.249934000000053mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin29"]} pcbX="0.750062000000014mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin30"]} pcbX="0.24993600000001948mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin31"]} pcbX="-0.24993599999999105mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin32"]} pcbX="-0.7500619999999856mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin33"]} pcbX="-1.249933999999996mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin34"]} pcbX="-1.7500599999999622mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin35"]} pcbX="-2.2499319999999727mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin36"]} pcbX="-2.7500579999999957mm" pcbY="4.249927999999997mm" layer="top" width="0.27000199999999996mm" height="1.499997mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin37"]} pcbX="-4.249927999999983mm" pcbY="2.7500579999999957mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin38"]} pcbX="-4.249927999999983mm" pcbY="2.249931999999994mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin39"]} pcbX="-4.249927999999983mm" pcbY="1.7500599999999977mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin40"]} pcbX="-4.249927999999983mm" pcbY="1.249933999999996mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin41"]} pcbX="-4.249927999999983mm" pcbY="0.7500619999999856mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin42"]} pcbX="-4.249927999999983mm" pcbY="0.24993599999999816mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin43"]} pcbX="-4.249927999999983mm" pcbY="-0.24993600000001237mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin44"]} pcbX="-4.249927999999983mm" pcbY="-0.7500619999999998mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin45"]} pcbX="-4.249927999999983mm" pcbY="-1.2499340000000103mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin46"]} pcbX="-4.249927999999983mm" pcbY="-1.7500600000000048mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin47"]} pcbX="-4.249927999999983mm" pcbY="-2.249932000000001mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<smtpad portHints={["pin48"]} pcbX="-4.249927999999983mm" pcbY="-2.750058000000003mm" layer="top" width="1.499997mm" height="0.27000199999999996mm" radius="0.13500099999999998mm" shape="pill" />
<fabricationnotepath route={[{"x":-2.8955999999999733,"y":3.3400999999999925},{"x":3.302000000000021,"y":3.3400999999999925},{"x":3.302000000000021,"y":-3.314700000000002},{"x":-3.327399999999983,"y":-3.314700000000002},{"x":-3.327399999999983,"y":3.3400999999999925},{"x":-2.5653999999999826,"y":3.3400999999999925}]} strokeWidth={0.19999959999999997} />
<fabricationnotepath route={[{"x":-3.3899855999999886,"y":-4.059986800000004},{"x":-3.5791606142161356,"y":-4.198904249194129},{"x":-3.506066828896735,"y":-4.421934610898454},{"x":-3.2713643711032603,"y":-4.421934610898454},{"x":-3.1982705857838596,"y":-4.198904249194129},{"x":-3.3874456000000066,"y":-4.059986800000004}]} strokeWidth={0.39999919999999994} />
<silkscreencircle pcbX={-2.6200099999999793} pcbY={-2.8300680000000042} radius={0.170434} layer="top" strokeWidth={0.254} />
<courtyardoutline outline={[{"x":-5.249926499999987,"y":5.249926499999994},{"x":5.249926500000015,"y":5.249926499999994},{"x":5.249926500000015,"y":-5.249926499999994},{"x":-5.249926499999987,"y":-5.249926499999994},{"x":-5.249926499999987,"y":5.249926499999994}]} layer="top" />
      </footprint>}
    pinLabels={pinLabels}
    pinAttributes={{
  "pin1": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true
  },
  "pin2": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true
  },
  "pin3": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true
  },
  "pin4": {
    "isInput": true,
    "requiresPower": true,
    "includeInBoardPinout": false,
    "shouldHaveDecouplingCapacitor": true
  },
  "pin5": {
    "isInput": true,
    "isOutput": true,
    "includeInBoardPinout": false,
    "shouldHaveDecouplingCapacitor": true
  },
  "pin6": {
    "isInput": true,
    "mustBeConnected": true,
    "requiresPower": true,
    "includeInBoardPinout": false,
    "shouldHaveDecouplingCapacitor": true
  },
  "pin7": {
    "mustBeConnected": true,
    "requiresGround": true,
    "requiresVoltage": 0,
    "includeInBoardPinout": false
  },
  "pin8": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true
  },
  "pin9": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true
  },
  "pin10": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_tx"
    ]
  },
  "pin11": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_sck",
      "uart_tx"
    ]
  },
  "pin12": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_sck",
      "uart_rx"
    ]
  },
  "pin13": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_mosi",
      "uart_tx"
    ]
  },
  "pin14": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_miso",
      "uart_rx"
    ]
  },
  "pin15": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_mosi",
      "spi_cs",
      "uart_tx"
    ]
  },
  "pin16": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_sck",
      "uart_tx",
      "uart_rx"
    ]
  },
  "pin17": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_miso"
    ]
  },
  "pin18": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_mosi"
    ]
  },
  "pin19": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_cs",
      "uart_tx",
      "uart_rx"
    ]
  },
  "pin20": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_rx"
    ]
  },
  "pin21": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_miso",
      "uart_tx"
    ]
  },
  "pin22": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_sck",
      "uart_tx",
      "uart_rx"
    ]
  },
  "pin23": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_mosi",
      "uart_tx",
      "uart_rx"
    ]
  },
  "pin24": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_cs"
    ]
  },
  "pin25": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_sck"
    ]
  },
  "pin26": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_miso"
    ]
  },
  "pin27": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_mosi"
    ]
  },
  "pin28": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_cs"
    ]
  },
  "pin29": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_miso",
      "uart_tx"
    ]
  },
  "pin30": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_tx"
    ]
  },
  "pin31": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_rx"
    ]
  },
  "pin32": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_mosi",
      "uart_rx"
    ]
  },
  "pin33": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_miso",
      "uart_tx"
    ]
  },
  "pin34": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_mosi",
      "uart_rx"
    ]
  },
  "pin35": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_rx"
    ]
  },
  "pin36": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_tx"
    ]
  },
  "pin37": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_cs",
      "uart_rx"
    ]
  },
  "pin38": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_cs"
    ]
  },
  "pin39": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_sck"
    ]
  },
  "pin40": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "uart_rx"
    ]
  },
  "pin41": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_miso",
      "uart_tx"
    ]
  },
  "pin42": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_sck",
      "uart_tx"
    ]
  },
  "pin43": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_miso",
      "uart_rx"
    ]
  },
  "pin44": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "spi_mosi"
    ]
  },
  "pin45": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_miso",
      "uart_tx"
    ]
  },
  "pin46": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_mosi",
      "uart_rx"
    ]
  },
  "pin47": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_scl",
      "spi_sck",
      "uart_tx"
    ]
  },
  "pin48": {
    "isInput": true,
    "isOutput": true,
    "isBidirectional": true,
    "canUseTriState": true,
    "isGpio": true,
    "canUseInternalPullup": true,
    "canUseInternalPulldown": true,
    "canUseOpenDrain": true,
    "canUsePushPull": true,
    "capabilities": [
      "i2c_sda",
      "spi_cs",
      "uart_rx"
    ]
  }
}}
    supplierPartNumbers={{
  "jlcpcb": [
    "C2847904"
  ]
}}
    manufacturerPartNumber="STM32G0B1CBT6"
    cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2847904.obj?uuid=a4b96ad857dc48c08dab3d0efdf20aec",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2847904.step?uuid=a4b96ad857dc48c08dab3d0efdf20aec",
        pcbRotationOffset: 0,
        modelOriginPosition: {"x":0,"y":0,"z":0.000795},
    }}
    {...props}
  />
)