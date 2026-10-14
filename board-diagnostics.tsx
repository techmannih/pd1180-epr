import { AO3400A } from "./imports/AO3400A"
import { BAV21W_7_F } from "./imports/BAV21W_7_F"
import { FUET_9650B_3V } from "./imports/FUET_9650B_3V"
import { NH_B2020RGBA_HF } from "./imports/NH_B2020RGBA_HF"
import { SN74LVC2G66DCUR } from "./imports/SN74LVC2G66DCUR"
import { TCA9538PWR } from "./imports/TCA9538PWR"
import { XL_1608SURC_06 } from "./imports/XL_1608SURC_06"

export const BoardDiagnostics = () => (
  <>

    <schematicsection name="indicators_U35" displayName="Status Indicators" />

    <schematicsection name="alarm_BZ1" displayName="Audible Fault Alarm" />
    <schematicsection name="pd-programming_U36" displayName="PD Programming and Power Probes" />
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
    <TCA9538PWR name="U35" schWidth={2.34} schHeight={1.6} schPinArrangement={{ topSide: ["pin16"], leftSide: ["pin3", "pin14", "pin15"], rightSide: ["pin4", "pin5", "pin6", "pin7", "pin13"], bottomSide: ["pin1", "pin2", "pin8", "pin9", "pin10", "pin11", "pin12"] }} schSheetName="indicators" schSectionName="indicators_U35" schX={-6.5} schY={-2.2}
      pcbX={35.5} pcbY={-24.25} pcbRotation={0} layer="top" noConnect={["pin13"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.STATUS_GPIO", pin4: "net.RGB_R_DRV", pin5: "net.RGB_G_DRV", pin6: "net.RGB_B_DRV", pin7: "net.BUZZER_EN", pin8: "net.GND", pin9: "net.GND", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin14: "net.PD_SCL", pin15: "net.PD_SDA", pin16: "net.PD_3V3" }} />
    <NH_B2020RGBA_HF name="D16" schPinArrangement={{ topSide: ["pin3"], leftSide: ["pin1", "pin4", "pin2"] }} schSheetName="indicators" schSectionName="indicators_U35" schX={1.5} schY={-1.2}
      pcbX={-40.25} pcbY={-18.0} pcbRotation={90} layer="top"
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_B_K", pin3: "net.V3V3", pin4: "net.RGB_G_K" }} />
    <FUET_9650B_3V name="BZ1" schSheetName="alarm" schSectionName="alarm_BZ1" schX={0.75} schY={2.3}
      pcbX={-36.5} pcbY={-10.8} pcbRotation={0} layer="top"
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} />
    <AO3400A name="Q26" schSheetName="alarm" schSectionName="alarm_BZ1" schX={-2.25} schY={-2.7}
      pcbX={-32.25} pcbY={-18.0} pcbRotation={0} layer="top"
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND", pin3: "net.BUZZER_LOW" }} />
    <XL_1608SURC_06 name="D17" schSheetName="indicators" schSectionName="indicators_U35" schX={11.5} schY={-2.2}
      pcbX={-37.5} pcbY={-19.5} pcbRotation={0} layer="top" schRotation={270}
      connections={{ pin1: "net.GND", pin2: "net.POWER_LED_A" }} />
    <BAV21W_7_F name="D18" schSheetName="alarm" schSectionName="alarm_BZ1" schX={6.75} schY={2.3}
      pcbX={-36.5} pcbY={-17.0} pcbRotation={0} layer="top" schRotation={90}
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} />
    <resistor name="R123" schSheetName="indicators" schSectionName="indicators_U35" schX={-1.5} schY={0.8}
      pcbX={39.25} pcbY={-24.25} pcbRotation={270} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_R_DRV" }} />
    <resistor name="R124" schSheetName="indicators" schSectionName="indicators_U35" schX={-1.5} schY={-2.2}
      pcbX={39.25} pcbY={-27.25} pcbRotation={90} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }}
      connections={{ pin1: "net.RGB_G_K", pin2: "net.RGB_G_DRV" }} />
    <resistor name="R125" schSheetName="indicators" schSectionName="indicators_U35" schX={-1.5} schY={-5.2}
      pcbX={40.0} pcbY={-22.0} pcbRotation={0} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }}
      connections={{ pin1: "net.RGB_B_K", pin2: "net.RGB_B_DRV" }} />
    <resistor name="R126" schSheetName="alarm" schSectionName="alarm_BZ1" schX={-6.75} schY={-2.7}
      pcbX={-28.75} pcbY={-18.0} pcbRotation={180} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.BUZZER_EN", pin2: "net.BUZZER_GATE" }} />
    <resistor name="R127" schSheetName="alarm" schSectionName="alarm_BZ1" schX={-5.25} schY={-5.7}
      pcbX={-35.0} pcbY={-19.75} pcbRotation={90} layer="top" resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }} schRotation={270}
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND" }} />
    <resistor name="R128" schSheetName="indicators" schSectionName="indicators_U35" schX={11.5} schY={0.8}
      pcbX={-27.5} pcbY={-25.75} pcbRotation={90} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270}
      connections={{ pin1: "net.V3V3", pin2: "net.POWER_LED_A" }} />
    <capacitor name="C95" schSheetName="indicators" schSectionName="indicators_U35" schX={-11.5} schY={1.8}
      pcbX={31.85} pcbY={-22.8} pcbRotation={270} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U35 > .pin16"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C96" schSheetName="alarm" schSectionName="alarm_BZ1" schX={4.75} schY={2.3}
      pcbX={-33} pcbY={-4.9} pcbRotation={180} layer="top" capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }} schRotation={270}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <SN74LVC2G66DCUR name="U36" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-4.5} schY={1.8}
      pcbX={-9.0} pcbY={20.0} pcbRotation={90} layer="top"
      connections={{ pin1: "net.EEP_SDA", pin2: "net.EEP_PROG_SDA", pin3: "net.EEP_LINK_EN", pin4: "net.GND", pin5: "net.EEP_SCL", pin6: "net.EEP_PROG_SCL", pin7: "net.EEP_LINK_EN", pin8: "net.PD_3V3" }} />
    <capacitor name="C97" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-9.5} schY={-5.2}
      pcbX={-9.1} pcbY={16.5} pcbRotation={180} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U36 > .pin8"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <resistor name="R129" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={2.5} schY={4.8}
      pcbX={-12.0} pcbY={19.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SDA" }} />
    <resistor name="R130" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={7.5} schY={4.8}
      pcbX={-12.25} pcbY={16.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SCL" }} />
    <resistor name="R131" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-11.5} schY={4.8}
      pcbX={-15.0} pcbY={20.0} pcbRotation={0} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_LINK_EN" }} />
    <testpoint doNotPlace name="TP_PD_VREF" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-9.5} schY={-3.2}
      pcbX={-15.5} pcbY={25.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_3V3" }} />
    <testpoint doNotPlace name="TP_PD_GND" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-2.5} schY={-3.2}
      pcbX={-20.0} pcbY={22.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} />
    <testpoint doNotPlace name="TP_EEP_SDA" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={4.5} schY={-3.2}
      pcbX={-19.25} pcbY={20.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SDA" }} />
    <testpoint doNotPlace name="TP_EEP_SCL" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={11.5} schY={-3.2}
      pcbX={0.75} pcbY={19.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SCL" }} />
    <testpoint doNotPlace name="TP_PD_ISO" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-9.5} schY={-8.2}
      pcbX={7.0} pcbY={38.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_LINK_EN" }} />
    <testpoint doNotPlace name="TP_PD_VBUS" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-2.5} schY={-8.2}
      pcbX={7.0} pcbY={41.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_VBUS" }} />
    <testpoint doNotPlace name="TP_VMOTOR" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={4.5} schY={-8.2}
      pcbX={9.5} pcbY={40.75} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.VMOTOR" }} />
    <testpoint doNotPlace name="TP_PWR_GND" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={11.5} schY={-8.2}
      pcbX={22} pcbY={40.75} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} />
    <resistor name="R132" schSheetName="indicators" schSectionName="indicators_U35" schX={-10.5} schY={0.8}
      pcbX={40.75} pcbY={-24.25} pcbRotation={90} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270}
      connections={{ pin1: "net.STATUS_GPIO", pin2: "net.GND" }} />
    <trace name="BUZZER_BULK" from=".BZ1 > .pin1" to=".C96 > .pin1" thickness="0.3mm" maxLength="7mm" pcbPath={[".C96 > .pin1"]} />
    <trace name="BYPASS_C95" from=".U35 > .pin16" to=".C95 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C95 > .pin1"]} />
    <trace name="BYPASS_C97" from=".U36 > .pin8" to=".C97 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C97 > .pin1"]} />
  </>
)
