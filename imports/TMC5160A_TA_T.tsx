import { type ChipProps } from "@tscircuit/props"
const pinLabels = {
  "pin1": [
    "HB1"
  ],
  "pin2": [
    "CB1"
  ],
  "pin3": [
    "12VOUT"
  ],
  "pin4": [
    "VSA"
  ],
  "pin5": [
    "5VOUT"
  ],
  "pin6": [
    "GNDA"
  ],
  "pin7": [
    "SRAL"
  ],
  "pin8": [
    "SRAH"
  ],
  "pin9": [
    "SRBH"
  ],
  "pin10": [
    "SRBL"
  ],
  "pin11": [
    "TST_MODE"
  ],
  "pin12": [
    "CLK"
  ],
  "pin13": [
    "CSN_CFG3"
  ],
  "pin14": [
    "SCK_CFG2"
  ],
  "pin15": [
    "SDI_CFG1"
  ],
  "pin16": [
    "SDO_CFG0"
  ],
  "pin17": [
    "REFL_STEP"
  ],
  "pin18": [
    "REFR_DIR"
  ],
  "pin19": [
    "GNDD1"
  ],
  "pin20": [
    "VCC_IO"
  ],
  "pin21": [
    "SD_MODE"
  ],
  "pin22": [
    "SPI_MODE"
  ],
  "pin23": [
    "ENCB_DCEN_CFG4"
  ],
  "pin24": [
    "ENCA_DCIN_CFG5"
  ],
  "pin25": [
    "ENCN_DCO_CFG6"
  ],
  "pin26": [
    "DIAG0_SWN"
  ],
  "pin27": [
    "DIAG1_SWP"
  ],
  "pin28": [
    "DRV_ENN"
  ],
  "pin29": [
    "VCC"
  ],
  "pin30": [
    "GNDD2"
  ],
  "pin31": [
    "CPO"
  ],
  "pin32": [
    "CPI"
  ],
  "pin33": [
    "VS"
  ],
  "pin34": [
    "VCP"
  ],
  "pin35": [
    "CA2"
  ],
  "pin36": [
    "HA2"
  ],
  "pin37": [
    "BMA2"
  ],
  "pin38": [
    "LA2"
  ],
  "pin39": [
    "LA1"
  ],
  "pin40": [
    "BMA1"
  ],
  "pin41": [
    "HA1"
  ],
  "pin42": [
    "CA1"
  ],
  "pin43": [
    "CB2"
  ],
  "pin44": [
    "HB2"
  ],
  "pin45": [
    "BMB2"
  ],
  "pin46": [
    "LB2"
  ],
  "pin47": [
    "LB1"
  ],
  "pin48": [
    "BMB1"
  ],
  "pin49": [
    "EP"
  ]
} as const
export const TMC5160A_TA_T = (props: ChipProps<typeof pinLabels>) => (
  <chip
    footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.7500580000001946mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin2"]} pcbX="-2.249932000000058mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-1.7500600000000759mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin4"]} pcbX="-1.249934000000053mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-0.7500619999999572mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin6"]} pcbX="-0.2499359999999342mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin7"]} pcbX="0.24993599999982052mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin8"]} pcbX="0.7500619999999572mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin9"]} pcbX="1.2499339999999393mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin10"]} pcbX="1.7500599999999622mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin11"]} pcbX="2.249932000000058mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin12"]} pcbX="2.750058000000081mm" pcbY="-4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin13"]} pcbX="4.1998899999998685mm" pcbY="-2.750058000000081mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin14"]} pcbX="4.1998899999998685mm" pcbY="-2.249932000000058mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin15"]} pcbX="4.1998899999998685mm" pcbY="-1.7500599999999622mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin16"]} pcbX="4.1998899999998685mm" pcbY="-1.2499339999999393mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin17"]} pcbX="4.1998899999998685mm" pcbY="-0.7500619999999572mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin18"]} pcbX="4.1998899999998685mm" pcbY="-0.2499359999999342mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin19"]} pcbX="4.1998899999998685mm" pcbY="0.2499360000000479mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin20"]} pcbX="4.1998899999998685mm" pcbY="0.7500619999999572mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin21"]} pcbX="4.1998899999998685mm" pcbY="1.249934000000053mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin22"]} pcbX="4.1998899999998685mm" pcbY="1.7500599999999622mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin23"]} pcbX="4.1998899999998685mm" pcbY="2.249932000000058mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin24"]} pcbX="4.1998899999998685mm" pcbY="2.750058000000081mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin25"]} pcbX="2.750058000000081mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin26"]} pcbX="2.249932000000058mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin27"]} pcbX="1.7500599999999622mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin28"]} pcbX="1.2499339999999393mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin29"]} pcbX="0.7500619999999572mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin30"]} pcbX="0.24993599999982052mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin31"]} pcbX="-0.2499359999999342mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin32"]} pcbX="-0.7500619999999572mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin33"]} pcbX="-1.249934000000053mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin34"]} pcbX="-1.7500600000000759mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin35"]} pcbX="-2.249932000000058mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin36"]} pcbX="-2.7500580000001946mm" pcbY="4.199889999999982mm" layer="top" width="0.2800096mm" height="1.5999967999999998mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin37"]} pcbX="-4.199889999999982mm" pcbY="2.750058000000081mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin38"]} pcbX="-4.199889999999982mm" pcbY="2.249932000000058mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin39"]} pcbX="-4.199889999999982mm" pcbY="1.7500599999999622mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin40"]} pcbX="-4.199889999999982mm" pcbY="1.249934000000053mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin41"]} pcbX="-4.199889999999982mm" pcbY="0.7500619999999572mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin42"]} pcbX="-4.199889999999982mm" pcbY="0.2499360000000479mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin43"]} pcbX="-4.199889999999982mm" pcbY="-0.2499359999999342mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin44"]} pcbX="-4.199889999999982mm" pcbY="-0.7500619999999572mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin45"]} pcbX="-4.199889999999982mm" pcbY="-1.2499339999999393mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin46"]} pcbX="-4.199889999999982mm" pcbY="-1.7500599999999622mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin47"]} pcbX="-4.199889999999982mm" pcbY="-2.249932000000058mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin48"]} pcbX="-4.199889999999982mm" pcbY="-2.750058000000081mm" layer="top" width="1.5999967999999998mm" height="0.2800096mm" radius="0.1400048mm" shape="pill" />
<smtpad portHints={["pin49"]} pcbX="0mm" pcbY="0mm" layer="top" width="4.9999899999999995mm" height="4.9999899999999995mm" shape="rect" />
<fabricationnotepath route={[{"x":-3.5761929999999893,"y":3.080511999999999},{"x":-3.5761929999999893,"y":3.5761929999998756},{"x":-3.0805120000001125,"y":3.5761929999998756}]} strokeWidth={0.15239999999999998} />
<fabricationnotepath route={[{"x":3.5761929999998756,"y":3.080511999999999},{"x":3.5761929999998756,"y":3.5761929999998756},{"x":3.080511999999999,"y":3.5761929999998756}]} strokeWidth={0.15239999999999998} />
<fabricationnotepath route={[{"x":-3.5761929999999893,"y":-3.080511999999999},{"x":-3.5761929999999893,"y":-3.5761929999999893},{"x":-3.0805120000001125,"y":-3.5761929999999893}]} strokeWidth={0.15239999999999998} />
<fabricationnotepath route={[{"x":3.5761929999998756,"y":-3.080511999999999},{"x":3.5761929999998756,"y":-3.5761929999999893},{"x":3.080511999999999,"y":-3.5761929999999893}]} strokeWidth={0.15239999999999998} />
<fabricationnotepath route={[{"x":-3.1713932000000113,"y":-3.1713932000000113},{"x":-3.1713932000000113,"y":3.1713932000000113},{"x":3.1713931999998977,"y":3.1713932000000113},{"x":3.1713931999998977,"y":-3.1713932000000113},{"x":-3.1713932000000113,"y":-3.1713932000000113}]} strokeWidth={0.15239999999999998} />
<silkscreencircle pcbX={-2.750058000000081} pcbY={-5.299963999999932} radius={0.100076} layer="top" strokeWidth={0.19999959999999997} />
<silkscreencircle pcbX={-2.6713179999999284} pcbY={-2.6713179999999284} radius={0.150114} layer="top" strokeWidth={0.29999939999999997} />
<courtyardoutline outline={[{"x":-5.249888400000032,"y":5.249888400000032},{"x":5.249888399999918,"y":5.249888400000032},{"x":5.249888399999918,"y":-5.249888400000032},{"x":-5.249888400000032,"y":-5.249888400000032},{"x":-5.249888400000032,"y":5.249888400000032}]} layer="top" />
      </footprint>}
    pinLabels={pinLabels}
    supplierPartNumbers={{
  "jlcpcb": [
    "C516354"
  ]
}}
    manufacturerPartNumber="TMC5160A-TA-T"
    cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C516354.obj?uuid=a396a72d4bc5451488d3c2f08fc922f7",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C516354.step?uuid=a396a72d4bc5451488d3c2f08fc922f7",
        pcbRotationOffset: 90,
        modelOriginPosition: {"x":0.0007082000000702138,"y":-0.002038700000070115,"z":0.000917},
    }}
    {...props}
  />
)