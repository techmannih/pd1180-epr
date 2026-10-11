import { AO3400A } from "./imports/AO3400A"
import { BAV21W_7_F } from "./imports/BAV21W_7_F"
import { FUET_9650B_3V } from "./imports/FUET_9650B_3V"
import { NH_B2020RGBA_HF } from "./imports/NH_B2020RGBA_HF"
import { SN74LVC2G66DCUR } from "./imports/SN74LVC2G66DCUR"
import { TCA9538PWR } from "./imports/TCA9538PWR"
import { XL_1608SURC_06 } from "./imports/XL_1608SURC_06"

export const BoardDiagnostics = () => (
  <>
    <schematicsheet name="indicators" displayName="Status Indicators and Audible Alarm" sheetIndex={17} sheetWidth="450mm" sheetHeight="400mm">
      <schematictext schX={-8} schY={9} fontSize={0.6} anchor="top_left" text="17 / Status Indicators and Audible Alarm" />
      <schematictext schX={-8} schY={7.6} fontSize={0.26} anchor="top_left" text="U35: 3.3 V I2C GPIO at 0x70. Active-low RGB sinks; PC13 holds RESET low until board power is ready." />
      <schematictext schX={-8} schY={6.8} fontSize={0.23} anchor="top_left" text="BZ1: active 3 V alarm. Q26 + R127 keep it off at reset; D18 clamps the switched lead." />
    </schematicsheet>
    <schematicsection name="indicators_U35" displayName="Status Indicators and Audible Alarm" />
    <schematicsheet name="pd-programming" displayName="PD Programming and Power Probes" sheetIndex={18} sheetWidth="450mm" sheetHeight="400mm">
      <schematictext schX={-8} schY={9} fontSize={0.6} anchor="top_left" text="18 / PD Programming and Power Probes" />
      <schematictext schX={-8} schY={7.6} fontSize={0.26} anchor="top_left" text="U36 isolates both I2Cc wires when TP_PD_ISO is grounded. Normal boot: pad released." />
      <schematictext schX={-8} schY={6.8} fontSize={0.23} anchor="top_left" text="Program with fixed 5 V on J1, 3.3 V open-drain I2C and programmer VCC output OFF." />
    </schematicsheet>
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
    <TCA9538PWR name="U35" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schWidth={2.34} schHeight={1.6} schPinArrangement={{ topSide: ["pin16"], leftSide: ["pin3", "pin14", "pin15"], rightSide: ["pin4", "pin5", "pin6", "pin7", "pin13"], bottomSide: ["pin1", "pin2", "pin8", "pin9", "pin10", "pin11", "pin12"] }} schSheetName="indicators" schSectionName="indicators_U35" schX={0} schY={0}
      pcbX={35.5} pcbY={-24.25} pcbRotation={0} layer="top" noConnect={["pin13"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.STATUS_GPIO", pin4: "net.RGB_R_DRV", pin5: "net.RGB_G_DRV", pin6: "net.RGB_B_DRV", pin7: "net.BUZZER_EN", pin8: "net.GND", pin9: "net.GND", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin14: "net.PD_SCL", pin15: "net.PD_SDA", pin16: "net.PD_3V3" }} />
    <NH_B2020RGBA_HF name="D16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schPinArrangement={{ topSide: ["pin3"], leftSide: ["pin1", "pin4", "pin2"] }} schSheetName="indicators" schSectionName="indicators_U35" schX={8} schY={1}
      pcbX={-40.25} pcbY={-18.0} pcbRotation={90} layer="top"
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_B_K", pin3: "net.V3V3", pin4: "net.RGB_G_K" }} />
    <FUET_9650B_3V name="BZ1" schSheetName="indicators" schSectionName="indicators_U35" schX={14} schY={-10}
      pcbX={-36.5} pcbY={-10.8} pcbRotation={0} layer="top"
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} />
    <AO3400A name="Q26" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="indicators" schSectionName="indicators_U35" schX={11} schY={-15}
      pcbX={-32.25} pcbY={-18.0} pcbRotation={0} layer="top"
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND", pin3: "net.BUZZER_LOW" }} />
    <XL_1608SURC_06 name="D17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="indicators" schSectionName="indicators_U35" schX={25} schY={0}
      pcbX={-37.5} pcbY={-19.5} pcbRotation={0} layer="top" schRotation={270}
      connections={{ pin1: "net.GND", pin2: "net.POWER_LED_A" }} />
    <BAV21W_7_F name="D18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="indicators" schSectionName="indicators_U35" schX={20} schY={-10}
      pcbX={-36.5} pcbY={-17.0} pcbRotation={0} layer="top" schRotation={90}
      connections={{ pin1: "net.V3V3", pin2: "net.BUZZER_LOW" }} />
    <resistor name="R123" schSheetName="indicators" schSectionName="indicators_U35" schX={5} schY={3}
      pcbX={39.25} pcbY={-24.25} pcbRotation={270} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.RGB_R_K", pin2: "net.RGB_R_DRV" }} />
    <resistor name="R124" schSheetName="indicators" schSectionName="indicators_U35" schX={5} schY={0}
      pcbX={39.25} pcbY={-27.25} pcbRotation={90} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.RGB_G_K", pin2: "net.RGB_G_DRV" }} />
    <resistor name="R125" schSheetName="indicators" schSectionName="indicators_U35" schX={5} schY={-3}
      pcbX={40.0} pcbY={-22.0} pcbRotation={0} layer="top" resistance="330" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23138"] }} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.RGB_B_K", pin2: "net.RGB_B_DRV" }} />
    <resistor name="R126" schSheetName="indicators" schSectionName="indicators_U35" schX={6.5} schY={-15}
      pcbX={-28.75} pcbY={-18.0} pcbRotation={180} layer="top" resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.BUZZER_EN", pin2: "net.BUZZER_GATE" }} />
    <resistor name="R127" schSheetName="indicators" schSectionName="indicators_U35" schX={8} schY={-18}
      pcbX={-35.0} pcbY={-19.75} pcbRotation={90} layer="top" resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.BUZZER_GATE", pin2: "net.GND" }} />
    <resistor name="R128" schSheetName="indicators" schSectionName="indicators_U35" schX={25} schY={4}
      pcbX={-27.5} pcbY={-25.75} pcbRotation={90} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.V3V3", pin2: "net.POWER_LED_A" }} />
    <capacitor name="C95" schSheetName="indicators" schSectionName="indicators_U35" schX={-5} schY={4}
      pcbX={31.9} pcbY={-22.8} pcbRotation={270} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U35 > .pin16" pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C96" schSheetName="indicators" schSectionName="indicators_U35" schX={10.5} schY={4}
      pcbX={-33} pcbY={-4.9} pcbRotation={180} layer="top" capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <SN74LVC2G66DCUR name="U36" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={0} schY={0}
      pcbX={-9.0} pcbY={20.0} pcbRotation={90} layer="top"
      connections={{ pin1: "net.EEP_SDA", pin2: "net.EEP_PROG_SDA", pin3: "net.EEP_LINK_EN", pin4: "net.GND", pin5: "net.EEP_SCL", pin6: "net.EEP_PROG_SCL", pin7: "net.EEP_LINK_EN", pin8: "net.PD_3V3" }} />
    <capacitor name="C97" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-5} schY={-7}
      pcbX={-9.1} pcbY={16.5} pcbRotation={180} layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} schRotation={270} decouplingFor=".U36 > .pin8" pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <resistor name="R129" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={7} schY={3}
      pcbX={-12.0} pcbY={19.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SDA" }} />
    <resistor name="R130" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={12} schY={3}
      pcbX={-12.25} pcbY={16.5} pcbRotation={0} layer="top" resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_PROG_SCL" }} />
    <resistor name="R131" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={-7} schY={3}
      pcbX={-15.0} pcbY={20.0} pcbRotation={0} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_LINK_EN" }} />
    <testpoint name="TP_PD_VREF" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={5} schY={-10}
      pcbX={-15.5} pcbY={25.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_3V3" }} />
    <testpoint name="TP_PD_GND" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={10} schY={-10}
      pcbX={-20.0} pcbY={22.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} />
    <testpoint name="TP_EEP_SDA" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={5} schY={-14}
      pcbX={-19.25} pcbY={20.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SDA" }} />
    <testpoint name="TP_EEP_SCL" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={10} schY={-14}
      pcbX={0.75} pcbY={19.25} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_PROG_SCL" }} />
    <testpoint name="TP_PD_ISO" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={15} schY={-14}
      pcbX={7.0} pcbY={38.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.EEP_LINK_EN" }} />
    <testpoint name="TP_PD_VBUS" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={22} schY={-10}
      pcbX={7.0} pcbY={41.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.PD_VBUS" }} />
    <testpoint name="TP_VMOTOR" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={27} schY={-10}
      pcbX={10.5} pcbY={38.0} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.VMOTOR" }} />
    <testpoint name="TP_PWR_GND" schSheetName="pd-programming" schSectionName="pd-programming_U36" schX={22} schY={-14}
      pcbX={19.5} pcbY={40.75} pcbRotation={0} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} shape="circle" radius="0.7mm" /><courtyardcircle radius="0.95mm" /></footprint>}
      connections={{ pin1: "net.GND" }} />
    <resistor name="R132" schSheetName="indicators" schSectionName="indicators_U35" schX={-7} schY={-3}
      pcbX={40.75} pcbY={-24.25} pcbRotation={90} layer="top" resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }} schRotation={270} pcbStyle={{ silkscreenTextVisibility: "hidden" }}
      connections={{ pin1: "net.STATUS_GPIO", pin2: "net.GND" }} />
    <trace name="BUZZER_BULK" from=".BZ1 > .pin1" to=".C96 > .pin1" thickness="0.3mm" maxLength="7mm" pcbPath={[".C96 > .pin1"]} />
    <trace name="BYPASS_C95" from=".U35 > .pin16" to=".C95 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C95 > .pin1"]} />
    <trace name="BYPASS_C97" from=".U36 > .pin8" to=".C97 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C97 > .pin1"]} />
  </>
)
