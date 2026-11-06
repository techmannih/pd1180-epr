import { SN74LVC1G17DBVR } from "./imports/SN74LVC1G17DBVR"
import { AO3400A } from "./imports/AO3400A"
import { BAV21W_7_F } from "./imports/BAV21W_7_F"
import { FMB09A03_3V } from "./imports/FMB09A03_3V"
import { NH_B2020RGBA_HF } from "./imports/NH_B2020RGBA_HF"
import { SN74LVC2G66DCTR } from "./imports/SN74LVC2G66DCTR"
import { PCA9538PWR } from "./imports/PCA9538PWR"
import { XL_1608SURC_06 } from "./imports/XL_1608SURC_06"

export const BoardDiagnostics = () => (
  <>

    <schematicsection name="indicators_U35" displayName="Status Indicators" />

    <schematicsection name="indicators_power-led" displayName="Independent board-power indicator" />
    <schematicsection name="alarm_BZ1" displayName="Audible Fault Alarm" />
    <schematicsection name="pd-programming_U36" displayName="PD Programming and Power Probes" />
    <net name="U35_RESET_N" isPowerNet={false} />
    <net name="BUZZER_EN" isPowerNet={false} />
    <net name="BUZZER_GATE" isPowerNet={false} />
    <net name="BUZZER_LOW" isPowerNet={false} />
    <net name="EEP_LINK_EN" isPowerNet={false} />
    <net name="EEP_PROG_SCL" isPowerNet={false} />
    <net name="EEP_PROG_SDA" isPowerNet={false} />
    <net name="POWER_LED_A" isPowerNet={false} />
    <net name="RGB_B_DRV" isPowerNet={false} />
    <net name="RGB_B_K" isPowerNet={false} />
    <net name="RGB_G_DRV" isPowerNet={false} />
    <net name="RGB_G_K" isPowerNet={false} />
    <net name="RGB_R_DRV" isPowerNet={false} />
    <net name="RGB_R_K" isPowerNet={false} />
    <PCA9538PWR name="U35" schWidth={2.132} schHeight={1.6} schPinArrangement={{ topSide: ["pin16"], leftSide: ["pin3", "pin14", "pin15"], rightSide: ["pin4", "pin5", "pin6", "pin7", "pin13"], bottomSide: ["pin1", "pin2", "pin8", "pin9", "pin10", "pin11", "pin12"] }} schSectionName="indicators_U35"
      pcbX={35.5} pcbY={-24.25} pcbRotation={0} layer="top" noConnect={["pin13"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.U35_RESET_N", pin4: "net.RGB_R_DRV", pin5: "net.RGB_G_DRV", pin6: "net.RGB_B_DRV", pin7: "net.BUZZER_EN", pin8: "net.GND", pin9: "net.GND", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin14: "net.PD_SCL_BOARD", pin15: "net.PD_SDA_BOARD", pin16: "net.PD_3V3" }} schSheetName="indicators" schX={-6.175} schY={2.112} />
    {/* The PCA9538 RESET erratum forbids direct drive from the independent MCU rail. */}
    <SN74LVC1G17DBVR name="U37" schSectionName="indicators_U35" schWidth={1.485} schHeight={0.97}
      schPinArrangement={{leftSide:["pin2"],rightSide:["pin4","pin1"],topSide:["pin5"],bottomSide:["pin3"]}}
      pcbX={26.5} pcbY={-32.25} layer="top" noConnect={["pin1"]}
      connections={{pin2:"net.STATUS_GPIO",pin3:"net.GND",pin4:"net.U35_RESET_N",pin5:"net.PD_3V3"}} schSheetName="indicators" schX={-6.175} schY={6.108} />
    <capacitor name="C99" schSectionName="indicators_U35" schRotation={270}
      pcbX={22.75} pcbY={-33.2} pcbRotation={180} layer="top" capacitance="100nF" footprint="0603"
      supplierPartNumbers={{jlcpcb:["C14663"]}} maxVoltageRating="50V" decouplingFor=".U37 > .pin5"
      connections={{pin1:"net.PD_3V3",pin2:"net.GND"}} schSheetName="indicators" schX={-12.16} schY={4.272} />
    <resistor name="R137" schSectionName="indicators_U35" schRotation={270}
      pcbX={24} pcbY={-29.5} pcbRotation={0} layer="top" resistance="47k" footprint="0603"
      supplierPartNumbers={{jlcpcb:["C25819"]}} connections={{pin1:"net.U35_RESET_N",pin2:"net.GND"}} schSheetName="indicators" schX={-1.425} schY={6.108} />
    <trace name="BYPASS_C99" from=".U37 > .pin5" to=".C99 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C99 > .pin1"]} />
    <NH_B2020RGBA_HF name="D16" schPinArrangement={{ topSide: ["pin3"], leftSide: ["pin1", "pin4", "pin2"] }} schSectionName="indicators_U35"
      pcbX={-40.25} pcbY={-18.0} pcbRotation={90} layer="top"
      pcbSx={{ "& silkscreentext": { pcbX: 0.3302, pcbY: 0.9 } }}
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_B_K", pin3: "net.V3V3", pin4: "net.RGB_G_K" }} schSheetName="indicators" schX={1.568} schY={2.714} />
    <FMB09A03_3V name="BZ1" schSectionName="alarm_BZ1"
      pcbX={-36.5} pcbY={-10.8} pcbRotation={0} layer="top"
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} schSheetName="indicators" schX={-6.389} schY={-2.68} />
    <AO3400A name="Q26" schSectionName="alarm_BZ1"
      pcbX={-32.25} pcbY={-18.0} pcbRotation={0} layer="top"
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND", pin3: "net.BUZZER_LOW" }} schSheetName="indicators" schX={-8.372} schY={-5.485} />
    <XL_1608SURC_06 name="D17"
      pcbX={-37.5} pcbY={-19.5} pcbRotation={0} layer="top"
      connections={{ pin1: "net.GND", pin2: "net.POWER_LED_A" }} schSheetName="indicators" schX={11} schY={2.112} schRotation={-90} schSectionName="indicators_power-led" />
    <BAV21W_7_F name="D18" schSectionName="alarm_BZ1"
      pcbX={-36.5} pcbY={-17.0} pcbRotation={0} layer="top" schRotation={90}
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} schSheetName="indicators" schX={-1.7} schY={-2.7} />
    <resistor name="R123" schSectionName="indicators_U35"
      pcbX={39.25} pcbY={-24.25} pcbRotation={270} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_R_DRV" }} schSheetName="indicators" schX={-1.425} schY={3.732} />
    <resistor name="R124" schSectionName="indicators_U35"
      pcbX={39.25} pcbY={-27.25} pcbRotation={90} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }}
      connections={{ pin1: "net.RGB_G_K", pin2: "net.RGB_G_DRV" }} schSheetName="indicators" schX={-1.425} schY={2.112} />
    <resistor name="R125" schSectionName="indicators_U35"
      pcbX={40.0} pcbY={-22.0} pcbRotation={0} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }}
      connections={{ pin1: "net.RGB_B_K", pin2: "net.RGB_B_DRV" }} schSheetName="indicators" schX={-1.425} schY={0.492} />
    <resistor name="R126" schSectionName="alarm_BZ1"
      pcbX={-28.75} pcbY={-18.0} pcbRotation={180} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.BUZZER_EN", pin2: "net.BUZZER_GATE" }} schSheetName="indicators" schX={-11.387} schY={-5.485} />
    <resistor name="R127" schSectionName="alarm_BZ1"
      pcbX={-41.25} pcbY={-21.25} pcbRotation={90} layer="top" resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }} schRotation={270}
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND" }} schSheetName="indicators" schX={-8.372} schY={-8} />
    <resistor name="R128"
      pcbX={-26.5} pcbY={-25.75} pcbRotation={90} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.POWER_LED_A" }} schSheetName="indicators" schX={11} schY={3.732} schRotation={270} schSectionName="indicators_power-led" />
    <capacitor name="C95" schSectionName="indicators_U35"
      pcbX={31.85} pcbY={-22.8} pcbRotation={270} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U35 > .pin16"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} schSheetName="indicators" schX={-10.925} schY={4.272} />
    <capacitor name="C96" schSectionName="alarm_BZ1"
      pcbX={-39} pcbY={-5.3} pcbRotation={180} layer="top" capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }} schRotation={270}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="indicators" schX={6.6} schY={6} />
    <SN74LVC2G66DCTR name="U36" schSectionName="pd-programming_U36"
      pcbX={-2.25} pcbY={32.5} pcbRotation={180} layer="top"
      connections={{ pin1: "net.EEP_SDA", pin2: "net.EEP_PROG_SDA", pin3: "net.EEP_LINK_EN", pin4: "net.GND", pin5: "net.EEP_SCL", pin6: "net.EEP_PROG_SCL", pin7: "net.EEP_LINK_EN", pin8: "net.PD_3V3" }} schSheetName="telemetry" schX={-4.5} schY={-3.8} />
    <capacitor name="C97" schSectionName="pd-programming_U36"
      pcbX={-3.5} pcbY={35.25} pcbRotation={180} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U36 > .pin8"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} schSheetName="telemetry" schX={-9.5} schY={-7.3} />
    <resistor name="R129" schSectionName="pd-programming_U36"
      pcbX={-12.0} pcbY={19.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SDA" }} schSheetName="telemetry" schX={2.5} schY={-2.3} />
    <resistor name="R130" schSectionName="pd-programming_U36"
      pcbX={-12.25} pcbY={16.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SCL" }} schSheetName="telemetry" schX={7.5} schY={-2.3} />
    <resistor name="R131" schSectionName="pd-programming_U36"
      pcbX={-15.0} pcbY={20.0} pcbRotation={0} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_LINK_EN" }} schSheetName="telemetry" schX={-11.5} schY={-2.3} />
    <testpoint doNotPlace name="TP_PD_VREF" schSectionName="pd-programming_U36"
      pcbX={-15.5} pcbY={25.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_3V3" }} schSheetName="telemetry" schX={-9.5} schY={-6.3} />
    <testpoint doNotPlace name="TP_PD_GND" schSectionName="pd-programming_U36"
      pcbX={-20.0} pcbY={22.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} schSheetName="telemetry" schX={-2.5} schY={-6.3} />
    <testpoint doNotPlace name="TP_EEP_SDA" schSectionName="pd-programming_U36"
      pcbX={-19.25} pcbY={20.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SDA" }} schSheetName="telemetry" schX={4.5} schY={-6.3} />
    <testpoint doNotPlace name="TP_EEP_SCL" schSectionName="pd-programming_U36"
      pcbX={0.75} pcbY={19.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SCL" }} schSheetName="telemetry" schX={11.5} schY={-6.3} />
    <testpoint doNotPlace name="TP_PD_ISO" schSectionName="pd-programming_U36"
      pcbX={7.0} pcbY={38.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_LINK_EN" }} schSheetName="telemetry" schX={-9.5} schY={-8.8} />
    <testpoint doNotPlace name="TP_PD_VBUS" schSectionName="pd-programming_U36"
      pcbX={7.0} pcbY={41.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_VBUS" }} schSheetName="telemetry" schX={-2.5} schY={-8.8} />
    <testpoint doNotPlace name="TP_VMOTOR" schSectionName="pd-programming_U36"
      pcbX={9.5} pcbY={39.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.VMOTOR" }} schSheetName="telemetry" schX={4.5} schY={-8.8} />
    <testpoint doNotPlace name="TP_PWR_GND" schSectionName="pd-programming_U36"
      pcbX={23.75} pcbY={41.75} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} schSheetName="telemetry" schX={11.5} schY={-8.8} />
    <resistor name="R132" schSectionName="indicators_U35"
      pcbX={40.75} pcbY={-24.25} pcbRotation={90} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270}
      connections={{ pin1: "net.STATUS_GPIO", pin2: "net.GND" }} schSheetName="indicators" schX={-10} schY={6.8} />
    <trace name="BUZZER_BULK" from=".BZ1 > .pin1" to=".C96 > .pin1" thickness="0.3mm" maxLength="7mm" pcbPath={[".C96 > .pin1"]} />
    <trace name="BYPASS_C95" from=".U35 > .pin16" to=".C95 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C95 > .pin1"]} />
    <trace name="BYPASS_C97" from=".U36 > .pin8" to=".C97 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C97 > .pin1"]} />
  </>
)
