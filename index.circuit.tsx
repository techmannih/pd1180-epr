import { INA237AIDGSR } from "./imports/INA237AIDGSR"
import { SS10100_SMBF } from "./imports/SS10100_SMBF"
import { SchematicPages } from "./schematic-pages"
import { BoardDiagnostics } from "./board-diagnostics"
import { TPS2553DBVR } from "./imports/TPS2553DBVR"
import { TLV75533PDBVR } from "./imports/TLV75533PDBVR"
import { TMP102AIDRLR } from "./imports/TMP102AIDRLR"
import { INA240A1DR } from "./imports/INA240A1DR"
import { FRM121WFR005TM } from "./imports/FRM121WFR005TM"
import { ADS1115IDGSR } from "./imports/ADS1115IDGSR"
import { B20B_PHDSS_LF__SN_ } from "./imports/B20B_PHDSS_LF__SN_"
/** 48 V EPR single-axis stepper controller. See docs/release-status.json before fabrication. */
import { AS5600_ASOM } from "./imports/AS5600_ASOM"
import { A_74LVC1G157GW_125 } from "./imports/A_74LVC1G157GW_125"
import { WAGO_236_402 } from "./imports/WAGO_236_402"
import { WAGO_2601_3104 } from "./imports/WAGO_2601_3104"
import { B8B_PH_K_S_LF__SN_ } from "./imports/B8B_PH_K_S_LF__SN_"
import { BAV21W_7_F } from "./imports/BAV21W_7_F"
import { BSS123LT1G } from "./imports/BSS123LT1G"
import { CSD17484F4 } from "./imports/CSD17484F4"
import { CSD19534Q5A } from "./imports/CSD19534Q5A"
import { EEUFR1J471 } from "./imports/EEUFR1J471"
import { HoLLR2512_3W_33mR_1_ } from "./imports/HoLLR2512_3W_33mR_1_"
import { LM66100DCKR } from "./imports/LM66100DCKR"
import { LMR36510ADDAR } from "./imports/LMR36510ADDAR"
import { M24512_RMN6TP } from "./imports/M24512_RMN6TP"
import { MMBT5551LT1G } from "./imports/MMBT5551LT1G"
import { SN74LVC1G08DBVR } from "./imports/SN74LVC1G08DBVR"
import { RP2040 } from "./imports/RP2040"
import { SWPA6045S220MT } from "./imports/SWPA6045S220MT"
import { REF3425IDBVR } from "./imports/REF3425IDBVR"
import { SRP7050TA_470M } from "./imports/SRP7050TA_470M"
import { TLV3201AIDBVR } from "./imports/TLV3201AIDBVR"
import { DRV8462DDVR } from "./imports/DRV8462DDVR"
import { TPD4S480RUKR } from "./imports/TPD4S480RUKR"
import { TPS26630RGER } from "./imports/TPS26630RGER"
import { TPS26750SRSMR } from "./imports/TPS26750SRSMR"
import { TS_1088_AR02016 } from "./imports/TS_1088_AR02016"
import { UCC27511DBVR } from "./imports/UCC27511DBVR"
import { USBLC6_4SC6 } from "./imports/USBLC6_4SC6"
import { USB4105_GF_A } from "./imports/USB4105_GF_A"
import { W25Q32JVSSIQ } from "./imports/W25Q32JVSSIQ"
import { X322512MSB4SI } from "./imports/X322512MSB4SI"
import { BoardMarkings } from "./board-markings"

const arcPoints = (
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
  segments = 12,
) => Array.from({ length: segments }, (_, index) => {
  const angle = (startDeg + ((endDeg - startDeg) * (index + 1)) / segments) * Math.PI / 180
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
})

/**
 * Board perimeter measured from the supplied TMCM-1180 V1.1 STEP solid.
 * The STEP origin is the lower-left of an 85.9 mm envelope; tscircuit uses
 * the board center, so every point is translated by 42.95 mm.
 */
const TMCM1180_OUTLINE = [
  { x: 13.9, y: 2 },
  { x: 13.9, y: 8 },
  ...arcPoints(8, 8, 5.9, 0, 90),
  { x: 2, y: 13.9 },
  { x: 0, y: 15.9 },
  { x: 0, y: 70 },
  { x: 2, y: 72 },
  { x: 8, y: 72 },
  ...arcPoints(8, 77.9, 5.9, -90, 0),
  { x: 13.9, y: 83.9 },
  { x: 15.9, y: 85.9 },
  { x: 70, y: 85.9 },
  { x: 72, y: 83.9 },
  { x: 72, y: 77.9 },
  ...arcPoints(77.9, 77.9, 5.9, 180, 270),
  { x: 83.9, y: 72 },
  { x: 85.9, y: 70 },
  { x: 85.9, y: 15.9 },
  { x: 83.9, y: 13.9 },
  { x: 77.9, y: 13.9 },
  ...arcPoints(77.9, 8, 5.9, 90, 180),
  { x: 72, y: 2 },
  { x: 70, y: 0 },
  { x: 15.9, y: 0 },
  { x: 13.9, y: 2 },
].map(({ x, y }) => ({ x: x - 42.95, y: y - 42.95 }))

export const PD1180EPR = () => (
  <board name="PD1180_EPR" title="PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR" solderMaskColor="#245f2b" width="85.9mm" height="85.9mm" outline={TMCM1180_OUTLINE} layers={4} isViaInPadAllowed thickness="1.6mm" pcbStyle={{ viaPadDiameter: 0.6, viaHoleDiameter: 0.3 }}
    defaultTraceWidth="0.25mm" minTraceWidth="0.15mm" minViaHoleDiameter="0.3mm" minViaPadDiameter="0.5mm"
    schAutoLayoutEnabled schTraceAutoLabelEnabled schMaxTraceDistance={0.8}
    autorouter="auto-local" autorouterEffortLevel="5x" autorouterVersion="beta_pipeline7" >
    {/* 4.2 mm clearance holes aligned to the ordered 34HS31-6004S1 rear CAD axes. See the mechanical reference for the unqualified rear-thread interface. */}
    <SchematicPages />
    <hole name="H1" pcbX={24.447132} pcbY={-38.374311} diameter="4.2mm" />
    <hole name="H2" pcbX={38.374311} pcbY={24.447132} diameter="4.2mm" />
    <hole name="H3" pcbX={-24.447132} pcbY={38.374311} diameter="4.2mm" />
    <hole name="H4" pcbX={-38.374311} pcbY={-24.447132} diameter="4.2mm" />

    <schematicsection name="driver-power_U34" displayName="Regulated Driver Supply / U34" />
    <schematicsection name="usb-data_J10" displayName="USB DATA / J10" />

    <schematicsection name="telemetry_U29" displayName="telemetry / U29" />
    <schematicsection name="telemetry_U30" displayName="telemetry / U30" />
    <schematicsection name="telemetry_U31" displayName="telemetry / U31" />
    <schematicsection name="telemetry_U32" displayName="telemetry / U32" />
    <schematicsection name="telemetry_U33" displayName="telemetry / U33" />
    <schematicsection name="usb-logic_board-sense" displayName="usb-logic / Board power sense" />
    <schematicsection name="usb-logic_U25" displayName="usb-logic / U25" />
    <schematicsection name="usb-logic_U26" displayName="usb-logic / U26" />
    <schematicsection name="usb-logic_U27" displayName="usb-logic / U27" />
    <schematicsection name="usb-logic_U28" displayName="usb-logic / U28" />
    <schematicsection name="usb-pd_J1" displayName="Dedicated 48 V EPR PD POWER / J1" />
    <schematicsection name="usb-pd_U2" displayName="EPR PD Controller / U2" />
    <schematicsection name="usb-pd_U3" displayName="PD Configuration EEPROM / U3" />
    <schematicsection name="usb-pd_U4" displayName="PD Power-Path Gate / U4" />
    <schematicsection name="logic-power_U5" displayName="PD and Motor Backup Supplies / U5" />
    <schematicsection name="logic-power_U22" displayName="PD and Motor Backup Supplies / U22" />
    <schematicsection name="logic-power_U23" displayName="PD and Motor Backup Supplies / U23" />
    <schematicsection name="logic-power_U24" displayName="PD and Motor Backup Supplies / U24" />
    <schematicsection name="motor-power_U6" displayName="Protected 48 V Motor Bus / U6" />
    <schematicsection name="motor-power_C22" displayName="Protected 48 V Motor Bus / C22" />
    <schematicsection name="motor-power_C23" displayName="Protected 48 V Motor Bus / C23" />
    <schematicsection name="motion_U7" displayName="Motion Controller and Enable Chain / U7" />
    <schematicsection name="motion_U10" displayName="Motion Controller and Enable Chain / U10" />
    <schematicsection name="motion_U11" displayName="Motion Controller and Enable Chain / U11" />
    <schematicsection name="bridge-a_J2" displayName="Motor Phase A Power Bridge / J2" />
    <schematicsection name="brake_U12" displayName="Regeneration Brake and Overvoltage / U12" />
    <schematicsection name="brake_U13" displayName="Regeneration Brake and Overvoltage / U13" />
    <schematicsection name="brake_U14" displayName="Regeneration Brake and Overvoltage / U14" />
    <schematicsection name="brake_U15" displayName="Regeneration Brake and Overvoltage / U15" />
    <schematicsection name="brake_Q16" displayName="Regeneration Brake and Overvoltage / Q16" />
    <schematicsection name="brake_J3" displayName="Regeneration Brake and Overvoltage / J3" />
    <schematicsection name="mcu_U16" displayName="MCU, Clock, Memory and Debug / U16" />
    <schematicsection name="mcu_Y1" displayName="MCU, Clock, Memory and Debug / Y1" />
    <schematicsection name="user_start_stop" displayName="Local Start / Stop" />
    <schematicsection name="mcu_SW1" displayName="MCU, Clock, Memory and Debug / SW1" />
    <schematicsection name="mcu_U17" displayName="MCU, Clock, Memory and Debug / U17" />
    <schematicsection name="encoder_U18" displayName="Shaft Encoder and Monitor / U18" />
    <copperpour name="GND_PLANE" layer="inner1" connectsTo="net.GND" clearance="0.3mm" boardEdgeMargin="0.5mm" unbroken />
    <net name="BLOCK_FAST_GATE" isPowerNet={false} />
    <net name="BLOCK_GATE" isPowerNet={false} />
    <net name="BRAKE_DRIVE" isPowerNet={false} />
    <net name="BRAKE_GATE" isPowerNet={false} />
    <net name="BRAKE_MID" isPowerNet={false} />
    <net name="BRAKE_ON" isPowerNet={false} />
    <net name="BRAKE_RETURN" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="BRAKE_SENSE" isPowerNet={false} />
    <net name="BUCK_BOOT" isPowerNet={false} />
    <net name="BUCK_FB" isPowerNet={false} />
    <net name="BUCK_SW" isPowerNet={false} />
    <net name="BUCK_VCC" isPowerNet={false} />
    <net name="CC1_CONN" isPowerNet={false} />
    <net name="CC1_PD" isPowerNet={false} />
    <net name="CC2_CONN" isPowerNet={false} />
    <net name="CC2_PD" isPowerNet={false} />
    <net name="CC_FAULT_N" isPowerNet={false} />
    <net name="CC_VBIAS" isPowerNet={false} />
    <net name="EEP_IRQ_N" isPowerNet={false} />
    <net name="EEP_SCL" isPowerNet={false} />
    <net name="EEP_SDA" isPowerNet={false} />
    <net name="EFUSE_EN" isPowerNet={false} />
    <net name="EFUSE_FAULT_N" isPowerNet={false} />
    <net name="EFUSE_IN" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="EPR_BLK_GATE" isPowerNet={false} />
    <net name="EPR_EN" isPowerNet={false} />
    <net name="FLASH_CS_N" isPowerNet={false} />
    <net name="USER_BUTTON_N" isPowerNet={false} />
    <net name="GND" isGroundNet />
    <net name="MOTOR_A1_OUT" isPowerNet={false} />
    <net name="MOTOR_B1_OUT" isPowerNet={false} />
    <net name="PHASE_A_ADC" isPowerNet={false} />
    <net name="PHASE_A_RAW" isPowerNet={false} />
    <net name="PHASE_B_ADC" isPowerNet={false} />
    <net name="PHASE_B_RAW" isPowerNet={false} />
    <net name="RUN_WINDOW_OK" isPowerNet={false} />
    <net name="TEMP_OK" isPowerNet={false} />
    <net name="USB_ILIM" isPowerNet={false} />
    <net name="USB_LOGIC_5V" isPowerNet={true} />
    <net name="USB_OR_SELECT" isPowerNet={false} />
    <net name="V3V3_MCU" isPowerNet={true} />
    <net name="V3V3_USB" isPowerNet={true} />
    <net name="IIN_MON" isPowerNet={false} />
    <net name="ILIM_SET" isPowerNet={false} />
    <net name="LOGIC_OR_PRIORITY" isPowerNet={false} />
    <net name="LOGIC_PG" isPowerNet={false} />
    <net name="MCU_RUN" isPowerNet={false} />
    <net name="MOTOR_A1" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="MOTOR_A2" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="MOTOR_B1" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="MOTOR_B2" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="MOTOR_BUCK_BOOT" isPowerNet={false} />
    <net name="MOTOR_BUCK_FB" isPowerNet={false} />
    <net name="MOTOR_BUCK_SW" isPowerNet={false} />
    <net name="MOTOR_BUCK_VCC" isPowerNet={false} />
    <net name="MOTOR_LOGIC_PG" isPowerNet={false} />
    <net name="MOTOR_OVP_LOW" isPowerNet={false} />
    <net name="MOTOR_OVP_SENSE" isPowerNet={false} />
    <net name="MOTOR_PG" isPowerNet={false} />
    <net name="NRST" isPowerNet={false} />
    <net name="OSC_IN" isPowerNet={false} />
    <net name="OSC_OUT" isPowerNet={false} />
    <net name="OVP_DIV" isPowerNet={false} />
    <net name="OVP_TOP" isPowerNet={false} />
    <net name="PD_1V5" isPowerNet />
    <net name="PD_3V3" isPowerNet />
    <net name="PD_INV_BASE" isPowerNet={false} />
    <net name="BOARD_POWER_SENSE" isPowerNet={false} />
    <net name="PD_LEVEL_BASE" isPowerNet={false} />
    <net name="PD_PATH_HV" isPowerNet={false} />
    <net name="PD_PATH_N" isPowerNet={false} />
    <net name="PD_PATH_OK" isPowerNet={false} />
    <net name="PD_SCL" isPowerNet={false} />
    <net name="PD_SDA" isPowerNet={false} />
    <net name="PG_DIV" isPowerNet={false} />
    <net name="POWER_PERMIT" isPowerNet={false} />
    <net name="RUN_PG" isPowerNet={false} />
    <net name="RUN_SAFE" isPowerNet={false} />
    <net name="SLEW_CAP" isPowerNet={false} />
    <net name="SPI_MISO" isPowerNet={false} />
    <net name="SPI_MOSI" isPowerNet={false} />
    <net name="SPI_SCK" isPowerNet={false} />
    <net name="STATUS_GPIO" isPowerNet={false} />
    <net name="SWCLK" isPowerNet={false} />
    <net name="SWDIO" isPowerNet={false} />
    <net name="DRIVER_BUCK_BOOT" />
    <net name="DRIVER_BUCK_FB" />
    <net name="DRIVER_BUCK_SW" />
    <net name="DRIVER_BUCK_VCC" />
    <net name="BRAKE_12V" isPowerNet />
    <net name="USB_DM" isPowerNet={false} />
    <net name="USB_DM_CONN" isPowerNet={false} />
    <net name="USB_VBUS_SENSE" isPowerNet={false} />
    <net name="USB_DP" isPowerNet={false} />
    <net name="USB_DP_CONN" isPowerNet={false} />
    <net name="PD_VBUS" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="UVLO_DIV" isPowerNet={false} />
    <net name="UVLO_MID" isPowerNet={false} />
    <net name="V3V3" isPowerNet />
    <net name="V3V3_MOTOR" isPowerNet />
    <net name="V3V3_PD" isPowerNet />
    <net name="VBUS_LV" isPowerNet />
    <net name="VMON_ADC" isPowerNet={false} />
    <net name="VMON_MID" isPowerNet={false} />
    <net name="VMOTOR" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="VMOTOR_OK" isPowerNet={false} />
    <net name="VREF_2V5" isPowerNet={false} />

    <net name="DATA_CC1" isPowerNet={false} />
    <net name="DATA_CC2" isPowerNet={false} />
    <net name="USB_DATA_VBUS" isPowerNet={true} />

    {/* Edge-mounted USB shells/courtyards overhang for plug access. USB copper remains
        inside the board with independently checked 0.20 mm edge clearance. */}
    <USB4105_GF_A name="J1" schSectionName="usb-pd_J1" pcbX={-38} pcbY={15}
      allowOffBoard
      pcbRotation={270}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin11", "pin13", "pin12", "pin14", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schWidth={1.521}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin11: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin14: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin10", "pin11", "pin12", "pin13", "pin14", "pin16"]}

      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.PD_VBUS", pin8: "net.PD_VBUS", pin17: "net.PD_VBUS", pin18: "net.PD_VBUS", pin9: "net.CC2_CONN", pin15: "net.CC1_CONN" }} schSheetName="usb-pd" schX={-7.65} schY={3.902} />
    <resistor name="R107" schSectionName="usb-data_J10" pcbX={-22.25} pcbY={16.0}
      schRotation={-90}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.USB_VBUS_SENSE" }} pcbRotation={180} schSheetName="usb-data" schX={2.975} schY={4.445} />
    <resistor name="R108" schSectionName="usb-data_J10" pcbX={-15.75} pcbY={18}
      schRotation={-90}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} schSheetName="usb-data" schX={2.975} schY={2.495} />
    <capacitor name="C72" schSectionName="usb-data_J10" pcbX={-25.5} pcbY={14.75} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxVoltageRating="50V"
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} schSheetName="usb-data" schX={5.525} schY={2.495} />
    <TPD4S480RUKR name="U1" schSectionName="usb-pd_J1" pcbX={-30} pcbY={24.5} schWidth={1.641}
      schPinArrangement={{
        leftSide: { pins: ["pin20", "pin4", "pin5", "pin1", "pin2", "pin18", "pin13", "pin8", "pin21"], direction: "top-to-bottom" },
        rightSide: { pins: ["pin19", "pin17", "pin16", "pin12", "pin11", "pin15", "pin14", "pin9", "pin10", "pin3"], direction: "top-to-bottom" },
      }}
      noConnect={["pin1", "pin2"]}
      connections={{ pin3: "net.CC_VBIAS", pin4: "net.CC1_CONN", pin5: "net.CC2_CONN", pin6: "net.CC2_CONN", pin7: "net.CC1_CONN", pin8: "net.GND", pin9: "net.CC_FAULT_N", pin10: "net.PD_3V3", pin11: "net.CC2_PD", pin12: "net.CC1_PD", pin13: "net.GND", pin14: "net.GND", pin15: "net.GND", pin16: "net.EPR_EN", pin17: "net.EPR_BLK_GATE", pin18: "net.GND", pin19: "net.VBUS_LV", pin20: "net.PD_VBUS", pin21: "net.GND" }} schSheetName="usb-pd" schX={0} schY={3.902} />
    <TPS26750SRSMR name="U2" schSectionName="usb-pd_U2" pcbX={-24} pcbY={23.35}
      noConnect={["pin10", "pin21", "pin28", "pin29"]}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.GND", pin4: "net.PD_1V5", pin5: "net.CC_FAULT_N", pin6: "net.GND", pin7: "net.EPR_EN", pin8: "net.PD_SDA", pin9: "net.PD_SCL", pin11: "net.GND", pin12: "net.GND", pin13: "net.GND", pin14: "net.GND", pin15: "net.EEP_SDA", pin16: "net.EEP_SCL", pin17: "net.EEP_IRQ_N", pin18: "net.GND", pin19: "net.GND", pin20: "net.PD_PATH_HV", pin22: "net.GND", pin23: "net.GND", pin24: "net.CC1_PD", pin25: "net.CC2_PD", pin26: "net.VBUS_LV", pin27: "net.VBUS_LV", pin30: "net.GND", pin31: "net.GND", pin32: "net.V3V3", pin33: "net.GND" }} schSheetName="usb-pd" schX={-7.125} schY={-3.551} />
    <BSS123LT1G name="Q1" schSectionName="usb-pd_J1" pcbX={-38.0} pcbY={25.0}
      connections={{ gate: "net.EPR_BLK_GATE", source: "net.VBUS_LV", drain: "net.PD_VBUS" }} schRotation={90} pcbRotation={0} schSheetName="usb-pd" schX={8} schY={5} />

    <capacitor name="C1" schSectionName="usb-pd_J1" pcbX={-31} pcbY={19} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.CC_VBIAS", pin2: "net.GND" }} schSheetName="usb-pd" schX={2.7} schY={6.762} />
    <capacitor name="C2" schSectionName="usb-pd_J1" pcbX={-29.5} pcbY={28.75} pcbRotation={90}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U1 > .pin10"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} schSheetName="usb-pd" schX={6} schY={-0.3} />
    <capacitor name="C3" schSectionName="usb-pd_U2" pcbX={-20.5} pcbY={24.75}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC1_PD", pin2: "net.GND" }} pcbRotation={270} schSheetName="usb-pd" schX={-4.627} schY={-0.941} />
    <capacitor name="C4" schSectionName="usb-pd_U2" pcbX={-21.75} pcbY={19.1} pcbRotation={90}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC2_PD", pin2: "net.GND" }} schSheetName="usb-pd" schX={-0.446} schY={-0.941} />
    <capacitor name="C5" schSectionName="usb-pd_U2" pcbX={-31.8} pcbY={15.8}
      // Retain the existing native reference anchor when J1 moves outward.
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.775 } }}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VBUS_LV", pin2: "net.GND" }} pcbRotation={90} schSheetName="usb-pd" schX={0.95} schY={-0.941} />
    <capacitor name="C6" schSectionName="usb-pd_U2" pcbX={-28.0} pcbY={20.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin32"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="usb-pd" schX={-9.975} schY={-7.031} />
    <capacitor name="C7" schSectionName="usb-pd_U2" pcbX={-26.0} pcbY={19.1}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin1"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} schSheetName="usb-pd" schX={7.3} schY={-0.3} />
    <capacitor name="C8" schSectionName="usb-pd_U2" pcbX={-24.0} pcbY={19.1}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin4"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_1V5", pin2: "net.GND" }} schSheetName="usb-pd" schX={2.375} schY={-0.941} />
    <resistor name="R1" schSectionName="usb-pd_J1" pcbX={-38} pcbY={22.2} pcbRotation={0} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.CC_FAULT_N" }} schSheetName="usb-pd" schX={5.4} schY={3.198} />
    <resistor name="R2" schSectionName="usb-pd_J1" pcbX={-33.1} pcbY={25.5} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EPR_EN", pin2: "net.GND" }} pcbRotation={90} schSheetName="usb-pd" schX={4.05} schY={6.322} />
    <M24512_RMN6TP name="U3" schSectionName="usb-pd_U3" pcbX={-13.75} pcbY={30.0}
      schPinArrangement={{ leftSide: ["pin1", "pin2", "pin3", "pin4"], rightSide: ["pin8", "pin6", "pin5", "pin7"] }}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.EEP_PROG_SDA", pin6: "net.EEP_PROG_SCL", pin7: "net.GND", pin8: "net.PD_3V3" }} pcbRotation={0} schSheetName="usb-pd" schX={8.075} schY={-3.551} />
    <capacitor name="C9" schSectionName="usb-pd_U3" pcbX={-17.5} pcbY={32.5}
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U3 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} schSheetName="usb-pd" schX={8.6} schY={-0.3} />
    <resistor name="R3" schSectionName="usb-pd_U3" pcbX={-28.45} pcbY={31}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SDA" }} pcbRotation={0} schSheetName="usb-pd" schX={6.6} schY={-2.3} />
    <resistor name="R4" schSectionName="usb-pd_U3" pcbX={-0.25} pcbY={41.9}
      pcbSx={{ "& silkscreentext": { pcbX: 1.9, pcbY: 0 } }}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SCL" }} pcbRotation={0} schSheetName="usb-pd" schX={8} schY={-2} />
    <resistor name="R5" schSectionName="usb-pd_U3" pcbX={-35.25} pcbY={25.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_IRQ_N" }} pcbRotation={90} schSheetName="usb-pd" schX={10} schY={-2} />
    <resistor name="R6" schSectionName="usb-pd_U2" pcbX={-31.25} pcbY={21.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SDA" }} pcbRotation={0} schSheetName="usb-pd" schX={-2.375} schY={-3.319} />
    <resistor name="R7" schSectionName="usb-pd_U2" pcbX={-18.0} pcbY={25.5} layer="top" pcbRotation={0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SCL" }} schSheetName="usb-pd" schX={0.475} schY={-3.319} />
    <resistor name="R9" schSectionName="usb-pd_U2" pcbX={-31.75} pcbY={28.25}
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.375 } }}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_HV", pin2: "net.PD_LEVEL_BASE" }} pcbRotation={0} schSheetName="usb-pd" schX={-2.375} schY={-4.363} />
    <CSD17484F4 name="Q2" schSectionName="usb-pd_U2" pcbX={-17.5} pcbY={20.0} pcbRotation={180}
      connections={{ pin1: "net.PD_LEVEL_BASE", pin2: "net.GND", pin3: "net.PD_PATH_N" }} schSheetName="usb-pd" schX={3.619} schY={-6.363} />
    <resistor name="R11" schSectionName="usb-pd_U2" pcbX={-18.25} pcbY={23.25} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_N" }} pcbRotation={90} schSheetName="usb-pd" schX={-2.375} schY={-5.407} />
    <resistor name="R12" schSectionName="usb-pd_U2" pcbX={-25.5} pcbY={16.5} pcbRotation={180}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_N", pin2: "net.PD_INV_BASE" }} schSheetName="usb-pd" schX={0.475} schY={-5.407} schRotation={180} />
    <CSD17484F4 name="Q3" schSectionName="usb-pd_U2" pcbX={-29.5} pcbY={16.5} pcbRotation={180}
      connections={{ pin1: "net.PD_INV_BASE", pin2: "net.GND", pin3: "net.PD_PATH_OK" }} schSheetName="usb-pd" schX={2} schY={-9.3} />
    <resistor name="R13" schSectionName="usb-pd_U2" pcbX={-16.0} pcbY={21.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_OK" }} pcbRotation={0} schSheetName="usb-pd" schX={5.2} schY={-5.2} />
    <SN74LVC1G08DBVR name="U4" schSectionName="usb-pd_U4" pcbX={-12} pcbY={24}
      connections={{ pin1: "net.PD_PATH_OK", pin2: "net.POWER_PERMIT", pin3: "net.GND", pin4: "net.EFUSE_EN", pin5: "net.V3V3" }} schSheetName="logic-power" schX={-6.27} schY={-4.51} />
    <resistor name="R14" schSectionName="usb-pd_U4" pcbX={-12.0} pcbY={21.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.POWER_PERMIT", pin2: "net.GND" }} schSheetName="logic-power" schX={-2.47} schY={-2.86} />
    <resistor name="R15" schSectionName="usb-pd_U4" pcbX={-10.25} pcbY={27.25}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EFUSE_EN", pin2: "net.GND" }} pcbRotation={90} schSheetName="logic-power" schX={-0.57} schY={-2.86} />
    <capacitor name="C10" schSectionName="usb-pd_U4" pcbX={-16.0} pcbY={23.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U4 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="logic-power" schX={-7.6} schY={-1.21} />

    {/* POWER */}
    <LMR36510ADDAR name="U5" schSectionName="logic-power_U5" pcbX={-27} pcbY={8} layer="top"
      connections={{ pin1: "net.GND", pin2: "net.PD_VBUS", pin3: "net.PD_VBUS", pin4: "net.LOGIC_PG", pin5: "net.BUCK_FB", pin6: "net.BUCK_VCC", pin7: "net.BUCK_BOOT", pin8: "net.BUCK_SW", pin9: "net.GND" }} schSheetName="logic-power" schX={-9.808} schY={1.856} />
    <SWPA6045S220MT name="L1" schSectionName="logic-power_U5" pcbX={-19} pcbY={11.5} layer="top"
      connections={{ pin1: "net.BUCK_SW", pin2: "net.V3V3_PD" }} schSheetName="logic-power" schX={-6.928} schY={1.856} />
    <capacitor name="C11" schSectionName="logic-power_U5" pcbX={-25} pcbY={1.5} pcbRotation={270} layer="top"
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} schSheetName="logic-power" schX={-11} schY={6} />
    <capacitor name="C12" schSectionName="logic-power_U5" pcbX={-27.635} pcbY={2.2289} layer="top"
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U5 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} schSheetName="logic-power" schX={-9.7} schY={6} />
    <capacitor name="C13" schSectionName="logic-power_U5"  pcbX={-25} pcbY={13} layer="top"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.BUCK_VCC", pin2: "net.GND" }} schSheetName="logic-power" schX={-8.4} schY={6} />
    <capacitor name="C14" schSectionName="logic-power_U5" pcbX={-28.1} pcbY={13} layer="top"
      // Keep the existing native reference anchor after adding nearby C109.
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.375 } }}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BUCK_BOOT", pin2: "net.BUCK_SW" }} pcbRotation={180} schSheetName="logic-power" schX={-7.108} schY={3.44} />
    <capacitor name="C15" schSectionName="logic-power_U5" pcbX={-19} pcbY={16} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} schSheetName="logic-power" schX={-6} schY={6} />
    <capacitor name="C16" schSectionName="logic-power_U5" pcbX={-15.5} pcbY={16.25} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} schSheetName="logic-power" schX={-4.7} schY={6} />
    <capacitor name="C17" schSectionName="logic-power_U5" pcbX={-19} pcbY={18} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} schSheetName="logic-power" schX={-3.4} schY={6} />
    <resistor name="R16" schSectionName="logic-power_U5" pcbX={-21} pcbY={7.25} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.BUCK_FB" }} pcbRotation={180} schSheetName="logic-power" schX={-3.616} schY={2.864} />
    <resistor name="R17" schSectionName="logic-power_U5" pcbX={-22.25} pcbY={2.75} layer="top"
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }} schSheetName="logic-power" schX={-11.68} schY={0.416} />
    <resistor name="R18" schSectionName="logic-power_U5" pcbX={-17.75} pcbY={6} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_PG" }} schSheetName="logic-power" schX={-5.848} schY={2.144} />
    <LMR36510ADDAR name="U22" schSectionName="logic-power_U22" pcbX={-11} pcbY={9}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin4: "net.MOTOR_LOGIC_PG", pin5: "net.MOTOR_BUCK_FB", pin6: "net.MOTOR_BUCK_VCC", pin7: "net.MOTOR_BUCK_BOOT", pin8: "net.MOTOR_BUCK_SW", pin9: "net.GND" }} schSheetName="logic-power" schX={2.32} schY={0.596} />
    <SWPA6045S220MT name="L2" schSectionName="logic-power_U22" pcbX={-3.5} pcbY={15}
      connections={{ pin1: "net.MOTOR_BUCK_SW", pin2: "net.V3V3_MOTOR" }} schSheetName="logic-power" schX={6} schY={0.6} />
    <capacitor name="C62" schSectionName="logic-power_U22" pcbX={-6.4} pcbY={0.5}
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} pcbRotation={0} schSheetName="logic-power" schX={2} schY={6} />
    <capacitor name="C63" schSectionName="logic-power_U22" pcbX={-11.635} pcbY={3.4789}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U22 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} schSheetName="logic-power" schX={3.3} schY={6} />
    <capacitor name="C64" schSectionName="logic-power_U22" pcbX={-9.5} pcbY={14.3}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.MOTOR_BUCK_VCC", pin2: "net.GND" }} schSheetName="logic-power" schX={5} schY={6} />
    <capacitor name="C65" schSectionName="logic-power_U22" pcbX={-12.8} pcbY={14.4}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.MOTOR_BUCK_BOOT", pin2: "net.MOTOR_BUCK_SW" }} pcbRotation={180} schSheetName="logic-power" schX={4.5} schY={3.5} />
    <capacitor name="C66" schSectionName="logic-power_U22" pcbX={-5} pcbY={10.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} pcbRotation={180} schSheetName="logic-power" schX={7} schY={6} />
    <capacitor name="C67" schSectionName="logic-power_U22" pcbX={-6.0} pcbY={20.0} pcbRotation={180}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} schSheetName="logic-power" schX={8.3} schY={6} />
    <capacitor name="C68" schSectionName="logic-power_U22" pcbX={-2.0} pcbY={20.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} schSheetName="logic-power" schX={9.6} schY={6} />
    <resistor name="R102" schSectionName="logic-power_U22" pcbX={-14} pcbY={2.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_BUCK_FB" }} schSheetName="logic-power" schX={9} schY={2.2} />
    <resistor name="R103" schSectionName="logic-power_U22" pcbX={-12} pcbY={18} pcbRotation={180}
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.MOTOR_BUCK_FB", pin2: "net.GND" }} schSheetName="logic-power" schX={10.816} schY={1.892} />
    <resistor name="R104" schSectionName="logic-power_U22" pcbX={-2.5} pcbY={5.3}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_LOGIC_PG" }} pcbRotation={180} schSheetName="logic-power" schX={7.5} schY={2.2} />
    <LM66100DCKR name="U23" schSectionName="logic-power_U23" pcbX={-22} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND", pin3: "net.V3V3_MOTOR", pin5: "net.LOGIC_OR_PRIORITY", pin6: "net.V3V3" }} schSheetName="logic-power" schX={-6.27} schY={-6.16} />
    <LM66100DCKR name="U24" schSectionName="logic-power_U24" pcbX={-10} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND", pin3: "net.LOGIC_OR_PRIORITY", pin5: "net.GND", pin6: "net.V3V3" }} schSheetName="logic-power" schX={5.13} schY={-6.16} />
    <resistor name="R111" schSectionName="logic-power_U23" pcbX={-27.5} pcbY={-2} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_OR_PRIORITY" }} schSheetName="logic-power" schX={-2.47} schY={-5.06} />
    <capacitor name="C69" schSectionName="logic-power_U23" pcbX={-25} pcbY={-1.8}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U23 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} schSheetName="logic-power" schX={-2.0999999999999996} schY={6} />
    <capacitor name="C70" schSectionName="logic-power_U24" pcbX={-10.65} pcbY={-4.0251}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U24 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} schSheetName="logic-power" schX={10.9} schY={6} />
    <capacitor name="C71" schSectionName="logic-power_U23" pcbX={-25} pcbY={-4.5} layer="top"
      schRotation={-90}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={180} schSheetName="logic-power" schX={-9} schY={-1.2} />
    <CSD19534Q5A name="Q4" schSectionName="motor-power_U6" pcbX={-8} pcbY={33}
      connections={{ source: "net.PD_VBUS", gate: "net.BLOCK_GATE", drain: "net.EFUSE_IN" }} schSheetName="motor-power" schX={-11.25} schY={1.98} />
    <BSS123LT1G name="Q5" schSectionName="motor-power_U6" pcbX={-8.35} pcbY={40.75}
      referenceOffset={{ x: -3, y: 1 }}
      connections={{ gate: "net.BLOCK_FAST_GATE", source: "net.PD_VBUS", drain: "net.BLOCK_GATE" }} schSheetName="motor-power" schX={-8} schY={5} />
    <TPS26630RGER name="U6" schSectionName="motor-power_U6" schWidth={1.6} schHeight={2.8} pcbX={1} pcbY={25}
      schPinArrangement={{
        leftSide: ["pin1", "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin9", "pin10", "pin11", "pin12", "pin13", "pin8"],
        rightSide: ["pin18", "pin17", "pin16", "pin15", "pin14", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24", "pin25"],
      }}
      noConnect={["pin11", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24"]}
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.EFUSE_IN", pin3: "net.BLOCK_GATE", pin4: "net.BLOCK_FAST_GATE", pin5: "net.PD_VBUS", pin6: "net.UVLO_DIV", pin7: "net.OVP_DIV", pin8: "net.GND", pin9: "net.SLEW_CAP", pin10: "net.ILIM_SET", pin12: "net.EFUSE_EN", pin13: "net.IIN_MON", pin14: "net.EFUSE_FAULT_N", pin15: "net.PG_DIV", pin16: "net.MOTOR_PG", pin17: "net.VMOTOR", pin18: "net.VMOTOR", pin25: "net.GND" }} schSheetName="motor-power" schX={-5.25} schY={1.98} />
    <resistor name="R19" schSectionName="motor-power_U6" pcbX={1.5} pcbY={21.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.UVLO_MID" }} schSheetName="motor-power" schX={5.75} schY={5.739} />
    <resistor name="R20" schSectionName="motor-power_U6" pcbX={3.0} pcbY={29.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.UVLO_MID", pin2: "net.UVLO_DIV" }} schSheetName="motor-power" schX={7.75} schY={4.739} />
    <resistor name="R21" schSectionName="motor-power_U6" pcbX={-3.5} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.UVLO_DIV", pin2: "net.GND" }} schSheetName="motor-power" schX={10.75} schY={4.739} />
    <resistor name="R22" schSectionName="motor-power_U6" pcbX={5.5} pcbY={25.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.OVP_TOP" }} schSheetName="motor-power" schX={5.04} schY={4.498} />
    <resistor name="R23" schSectionName="motor-power_U6" pcbX={-3.5} pcbY={23.0} pcbRotation={180}
      resistance="422k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C705777"] }}
      connections={{ pin1: "net.OVP_TOP", pin2: "net.OVP_DIV" }} schSheetName="motor-power" schX={6.75} schY={3.498} />
    <resistor name="R24" schSectionName="motor-power_U6" pcbX={-3.5} pcbY={27.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C95204"] }}
      connections={{ pin1: "net.OVP_DIV", pin2: "net.GND" }} schSheetName="motor-power" schX={10.75} schY={3.498} />
    <resistor name="R25" schSectionName="motor-power_U6" pcbX={5.5} pcbY={23.0}
      schRotation={-90}
      resistance="4.99k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C7293210"] }}
      connections={{ pin1: "net.ILIM_SET", pin2: "net.GND" }} schSheetName="motor-power" schX={-11.25} schY={-0.09} />
    <capacitor name="C18" schSectionName="motor-power_U6" pcbX={5.5} pcbY={27.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.SLEW_CAP", pin2: "net.GND" }} schSheetName="motor-power" schX={8.75} schY={2.256} />
    <resistor name="R26" schSectionName="motor-power_U6" pcbX={5.0} pcbY={21.0}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.IIN_MON", pin2: "net.GND" }} schSheetName="motor-power" schX={10.75} schY={2.256} />
    <resistor name="R27" schSectionName="motor-power_U6" pcbX={5.0} pcbY={18.5} pcbRotation={90}
      schRotation={-90}
      resistance="360k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23146"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.PG_DIV" }} schSheetName="motor-power" schX={-1.25} schY={1.014} />
    <resistor name="R28" schSectionName="motor-power_U6" pcbX={-7.0} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PG_DIV", pin2: "net.GND" }} schSheetName="motor-power" schX={-1.25} schY={-0.228} />
    <resistor name="R29" schSectionName="motor-power_U6" pcbX={2.25} pcbY={14.25} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.MOTOR_PG" }} schSheetName="motor-power" schX={0.2} schY={1} />
    <resistor name="R30" schSectionName="motor-power_U6" pcbX={11.5} pcbY={23.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.EFUSE_FAULT_N" }} schSheetName="motor-power" schX={1.5} schY={3} />
    <capacitor name="C20" schSectionName="motor-power_U6" pcbX={-7.0} pcbY={23.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.GND" }} schSheetName="motor-power" schX={11.08} schY={-0.228} />
    <capacitor name="C21" schSectionName="motor-power_U6" pcbX={-1.25} pcbY={29.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U6 > .pin17"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} schSheetName="motor-power" schX={3.25} schY={-2.85} />
    <EEUFR1J471 name="C22" schSectionName="motor-power_C22" pcbX={20} pcbY={31.2} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} schSheetName="motor-power" schX={5.15} schY={-2.85} />
    <EEUFR1J471 name="C23" schSectionName="motor-power_C23" pcbX={22.25} pcbY={17.0} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} pcbRotation={90} schSheetName="motor-power" schX={7.25} schY={-2.85} />
    <resistor name="R31" schSectionName="motor-power_U6" pcbX={-7.0} pcbY={27.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.VMON_MID" }} schSheetName="motor-power" schX={5.42} schY={1.78} />
    <resistor name="R32" schSectionName="motor-power_U6" pcbX={11.5} pcbY={18.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMON_MID", pin2: "net.VMON_ADC" }} schSheetName="motor-power" schX={6.75} schY={0.47} />
    <resistor name="R33" schSectionName="motor-power_U6" pcbX={13.5} pcbY={20.5} pcbRotation={180}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} schSheetName="motor-power" schX={9.55} schY={-2.712} />
    <capacitor name="C24" schSectionName="motor-power_U6" pcbX={11.0} pcbY={20.5} pcbRotation={90}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} schSheetName="motor-power" schX={11.25} schY={-3.885} />

    {/* MOTION */}
    <DRV8462DDVR name="U7" schSectionName="motion_U7" pcbX={22.0} pcbY={-3.0}
 noConnect={["pin32","pin35","pin36","pin37","pin38"]}
 connections={{"pin1":"net.GND","pin2":"net.VMOTOR","pin3":"net.GND","pin4":"net.MOTOR_B1","pin5":"net.MOTOR_B1","pin6":"net.MOTOR_B1","pin7":"net.MOTOR_B2","pin8":"net.MOTOR_B2","pin9":"net.MOTOR_B2","pin10":"net.GND","pin11":"net.VMOTOR","pin12":"net.VMOTOR","pin13":"net.GND","pin14":"net.MOTOR_A2","pin15":"net.MOTOR_A2","pin16":"net.MOTOR_A2","pin17":"net.MOTOR_A1","pin18":"net.MOTOR_A1","pin19":"net.MOTOR_A1","pin20":"net.GND","pin21":"net.VMOTOR","pin22":"net.DRV_VCP","pin23":"net.DRV_CPH","pin24":"net.DRV_CPL","pin25":"net.DRV_SLEEP_N","pin26":"net.RUN_SAFE","pin27":"net.DRV_DIR","pin28":"net.DRV_STEP","pin29":"net.SPI_SCK","pin30":"net.SPI_MOSI","pin31":"net.SPI_MISO","pin33":"net.DRV_CS_N","pin34":"net.DRV_DVDD","pin39":"net.V3V3","pin40":"net.DRV_HOME_N","pin41":"net.DRV_FAULT_N","pin42":"net.V3V3","pin43":"net.DRV_DVDD","pin44":"net.GND"}} pcbRotation={90} schSheetName="motion" schX={-8} schY={3} />

    <WAGO_2601_3104 name="J2" schSectionName="bridge-a_J2" pcbX={11} pcbY={-37.6}
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.MOTOR_A2", pin3: "net.MOTOR_B1_OUT", pin4: "net.MOTOR_B2", pin5: "net.MOTOR_A1_OUT", pin6: "net.MOTOR_A2", pin7: "net.MOTOR_B1_OUT", pin8: "net.MOTOR_B2" }} schSheetName="motion" schX={11.5} schY={-3.8} />
    <SN74LVC1G08DBVR name="U10" schSectionName="motion_U10" pcbX={-4} pcbY={-9}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.MOTOR_PG", pin3: "net.GND", pin4: "net.RUN_PG", pin5: "net.V3V3" }} schSheetName="motor-power" schX={-2.5} schY={-6.5} />
    <SN74LVC1G08DBVR name="U11" schSectionName="motion_U11" pcbX={-4} pcbY={-14}
      connections={{ pin1: "net.RUN_PG", pin2: "net.VMOTOR_OK", pin3: "net.GND", pin4: "net.RUN_WINDOW_OK", pin5: "net.V3V3" }} schSheetName="motor-power" schX={2.5} schY={-6.5} />
    <capacitor name="C38" schSectionName="motion_U10" pcbX={-8.0} pcbY={-10.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U10 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="motor-power" schX={-1} schY={-3.5} />
    <capacitor name="C39" schSectionName="motion_U11" pcbX={-8.0} pcbY={-15.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U11 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="motor-power" schX={0.2} schY={-3.5} />
    <resistor name="R54" schSectionName="motion_U10" pcbX={0.0} pcbY={-10.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.GND" }} schSheetName="motor-power" schX={-5} schY={-6.5} />

    {/* Retained 12 V supply for the independent brake gate driver U15. */}
    <LMR36510ADDAR name="U34" layer="top" schSectionName="driver-power_U34" pcbX={-24.0} pcbY={30.1} pcbRotation={0} noConnect={["pin4"]}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin5: "net.DRIVER_BUCK_FB", pin6: "net.DRIVER_BUCK_VCC", pin7: "net.DRIVER_BUCK_BOOT", pin8: "net.DRIVER_BUCK_SW", pin9: "net.GND" }} schSheetName="brake" schX={-10.5} schY={-4.6} />
    <SRP7050TA_470M name="L3" layer="top" schSectionName="driver-power_U34" pcbX={-15.6} pcbY={37.75} pcbRotation={0}
      connections={{ pin1: "net.DRIVER_BUCK_SW", pin2: "net.BRAKE_12V" }} schSheetName="brake" schX={-4.6} schY={-4.6} />
    <resistor name="R121" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-18.975} pcbY={32.1}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.DRIVER_BUCK_FB" }} pcbRotation={90} schSheetName="brake" schX={-7} schY={-5.6} />
    <resistor name="R122" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-19.15} pcbY={29.75}
      resistance="9.09k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C861611"] }}
      connections={{ pin1: "net.DRIVER_BUCK_FB", pin2: "net.GND" }} pcbRotation={0} schSheetName="brake" schX={-7} schY={-7.1} />
    <capacitor name="C86" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-18.75} pcbY={27.5} pcbRotation={0}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }} maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} schSheetName="brake" schX={-12} schY={-1.4} />
    <capacitor name="C87" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-27.75} pcbY={28.5} pcbRotation={90}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }} maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} schSheetName="brake" schX={-10.7} schY={-1.4} />
    <capacitor name="C88" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-20.45} pcbY={32.13} pcbRotation={270}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.DRIVER_BUCK_VCC", pin2: "net.GND" }} schSheetName="brake" schX={-9.4} schY={-1.4} />
    <capacitor name="C89" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-27.8} pcbY={33.7} pcbRotation={270}
      pcbSx={{ "& silkscreentext": { pcbX: -2.3, pcbY: 0 } }}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="50V"
      connections={{ pin1: "net.DRIVER_BUCK_BOOT", pin2: "net.DRIVER_BUCK_SW" }} schSheetName="brake" schX={-7.325} schY={-3.6} />
    <capacitor name="C90" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-9.4} pcbY={38} pcbRotation={0}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.GND" }} schSheetName="brake" schX={-6.5} schY={-1.4} />
    <capacitor name="C91" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-5.3} pcbY={38.7} pcbRotation={90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.GND" }} schSheetName="brake" schX={-5.2} schY={-1.4} />
    <capacitor name="C92" layer="top" schSectionName="driver-power_U34" schRotation={-90} pcbX={-3.6} pcbY={41.75} pcbRotation={0}
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.6 } }}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.GND" }} schSheetName="brake" schX={-3.9} schY={-1.4} />

    {/* BRAKE */}
    <REF3425IDBVR name="U12" schSectionName="brake_U12" schWidth={2.24} pcbX={2.75} pcbY={-24.5}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.V3V3", pin4: "net.V3V3", pin5: "net.VREF_2V5", pin6: "net.VREF_2V5" }} pcbRotation={180} schSheetName="brake" schX={-11} schY={4} />
    <capacitor name="C93" layer="top" schSectionName="brake_U12" schRotation={-90} pcbX={3.0} pcbY={-27.0}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} schSheetName="brake" schX={-7.5} schY={6.6} />
    <capacitor name="C94" layer="top" schSectionName="brake_U12" schRotation={-90} pcbX={5.75} pcbY={-23.25}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.VREF_2V5", pin2: "net.GND" }} pcbRotation={90} schSheetName="brake" schX={-10} schY={6.6} />
    <TLV3201AIDBVR name="U13" schSectionName="brake_U13" pcbX={8.75} pcbY={-22}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.GND", pin3: "net.BRAKE_SENSE", pin4: "net.VREF_2V5", pin5: "net.V3V3" }} schSheetName="brake" schX={-5} schY={4} />
    <resistor name="R60" schSectionName="brake_sense" pcbX={7.5} pcbY={-19.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C326731"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_MID" }} schSheetName="brake" schX={-1.5} schY={6} />
    <resistor name="R61" schSectionName="brake_sense" pcbX={13.0} pcbY={-17.5}
      resistance="16.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C728583"] }}
      connections={{ pin1: "net.BRAKE_MID", pin2: "net.BRAKE_SENSE" }} schSheetName="brake" schX={0} schY={4.4} />
    <resistor name="R62" schSectionName="brake_sense" pcbX={11.75} pcbY={-20.5} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C95204"] }}
      connections={{ pin1: "net.BRAKE_SENSE", pin2: "net.GND" }} schSheetName="brake" schX={1.5} schY={0.8} />
    <resistor name="R63" schSectionName="brake_sense" pcbX={10.0} pcbY={-17.5}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C326730"] }}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.BRAKE_SENSE" }} pcbRotation={90} schSheetName="brake" schX={-5} schY={0.7} />
    <capacitor name="C40" schSectionName="brake_U13" pcbX={5.0} pcbY={-21.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U13 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="brake" schX={-6.2} schY={6.6} />
    <TLV3201AIDBVR name="U14" schSectionName="brake_U14" pcbX={-3.5} pcbY={-30.75}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND", pin3: "net.VREF_2V5", pin4: "net.MOTOR_OVP_SENSE", pin5: "net.V3V3" }} pcbRotation={0} schSheetName="brake" schX={5} schY={4} />
    <resistor name="R64" schSectionName="brake_U14" pcbX={-1.0} pcbY={-28.0}
      schRotation={-90}
      resistance="430k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C2984356"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.MOTOR_OVP_SENSE" }} schSheetName="brake" schX={10} schY={6} />
    <resistor name="R65" schSectionName="brake_U14" pcbX={1.25} pcbY={-32.25}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C723637"] }}
      connections={{ pin1: "net.MOTOR_OVP_SENSE", pin2: "net.MOTOR_OVP_LOW" }} pcbRotation={90} schSheetName="brake" schX={10} schY={3.4} />
    <resistor name="R66" schSectionName="brake_U14" pcbX={-12.5} pcbY={-34.25} pcbRotation={180}
      schRotation={-90}
      resistance="1.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C136970"] }}
      connections={{ pin1: "net.MOTOR_OVP_LOW", pin2: "net.GND" }} schSheetName="brake" schX={11.7} schY={1.8} />
    <resistor name="R67" schSectionName="brake_U14" pcbX={-1.0} pcbY={-26.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND" }} schSheetName="brake" schX={5} schY={0.7} />
    <capacitor name="C41" schSectionName="brake_U14" pcbX={-6.5} pcbY={-31.5}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U14 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} schSheetName="brake" schX={-4.9} schY={6.6} />
    <UCC27511DBVR name="U15" schSectionName="brake_U15" pcbX={10} pcbY={26} schWidth={2.15}
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.BRAKE_DRIVE", pin3: "net.BRAKE_DRIVE", pin4: "net.GND", pin5: "net.GND", pin6: "net.BRAKE_ON" }} schSheetName="brake" schX={2} schY={-4} />
    <capacitor name="C42" schSectionName="brake_U15" pcbX={12.75} pcbY={35.5}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.GND" }} pcbRotation={90} schSheetName="brake" schX={-2.5999999999999996} schY={-1.4} />
    <capacitor name="C43" schSectionName="brake_U15" pcbX={8.9} pcbY={22}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U15 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BRAKE_12V", pin2: "net.GND" }} schSheetName="brake" schX={-1.2999999999999998} schY={-1.4} />
    <resistor name="R68" schSectionName="brake_U15" pcbX={12.55} pcbY={29}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.BRAKE_DRIVE", pin2: "net.BRAKE_GATE" }} pcbRotation={90} schSheetName="brake" schX={4.5} schY={-5.8} />
    <resistor name="R69" schSectionName="brake_U15" pcbX={12.55} pcbY={32.2}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.BRAKE_GATE", pin2: "net.GND" }} pcbRotation={90} schSheetName="brake" schX={7} schY={-7} />
    <CSD19534Q5A name="Q16" schSectionName="brake_Q16" pcbX={8} pcbY={33}
      connections={{ source: "net.GND", gate: "net.BRAKE_GATE", drain: "net.BRAKE_RETURN" }} schSheetName="brake" schX={7} schY={-4} />
    <WAGO_236_402 name="J3" schHeight={1.4} schWidth={0.6} schSectionName="brake_J3" pcbX={35.5} pcbY={13} pcbRotation={180} schPinArrangement={{ topSide: ["pin1","pin3"], bottomSide: ["pin2","pin4"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN", pin3: "net.VMOTOR", pin4: "net.BRAKE_RETURN" }} schSheetName="brake" schX={12} schY={-4} />

    <SS10100_SMBF name="D20" layer="top" schRotation={90} pcbX={15} pcbY={40} pcbRotation={180}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN" }} schSheetName="brake" schX={11} schY={-7} />
    {/* Brake continuity preflight. Low impedance also rejects SS10100 hot reverse leakage. */}
    <resistor name="R134" layer="top" pcbX={-3.4} pcbY={-37.5} pcbRotation={180}
      resistance="4.7k" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C6675858"] }}
      connections={{ pin1: "net.BRAKE_RETURN", pin2: "net.BRAKE_FB_MID" }} schSheetName="brake" schX={3} schY={-8.5} />
    <resistor name="R135" layer="top" pcbX={-3.4} pcbY={-40.5}
      resistance="4.7k" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C6675858"] }}
      connections={{ pin1: "net.BRAKE_FB_MID", pin2: "net.BRAKE_FB" }} schSheetName="brake" schX={5} schY={-8.5} />
    <resistor name="R136" layer="top" schRotation={-90} pcbX={1} pcbY={-40.5} pcbRotation={90}
      resistance="510" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C7468460"] }}
      connections={{ pin1: "net.BRAKE_FB", pin2: "net.GND" }} schSheetName="brake" schX={7} schY={-8.5} />
    <capacitor name="C98" layer="top" schRotation={-90} pcbX={0.5} pcbY={-37.5}
      capacitance="10nF" footprint="0603" maxVoltageRating="50V" supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      connections={{ pin1: "net.BRAKE_FB", pin2: "net.GND" }} pcbRotation={180} schSheetName="brake" schX={9} schY={-8.5} />

<capacitor name="C25" pcbX={28.0} pcbY={-3.25} capacitance="100nF" footprint="0805" supplierPartNumbers={{jlcpcb:["C28233"]}} maxVoltageRating="100V" decouplingFor=".U7 > .pin11" connections={{pin1:"net.VMOTOR",pin2:"net.GND"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={-12} schY={6} />
    <capacitor name="C26" pcbX={28.0} pcbY={2.5} capacitance="100nF" footprint="0805" supplierPartNumbers={{jlcpcb:["C28233"]}} maxVoltageRating="100V" decouplingFor=".U7 > .pin21" connections={{pin1:"net.VMOTOR",pin2:"net.GND"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={-10.8} schY={6} />
    <capacitor name="C27" pcbX={16.25} pcbY={-9.0} capacitance="1uF" footprint="0603" supplierPartNumbers={{jlcpcb:["C15849"]}} maxVoltageRating="25V" decouplingFor=".U7 > .pin43" connections={{pin1:"net.DRV_DVDD",pin2:"net.GND"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={-5.5} schY={6} />
    <capacitor name="C28" pcbX={15.65} pcbY={-6.5} capacitance="100nF" footprint="0603" supplierPartNumbers={{jlcpcb:["C14663"]}} maxVoltageRating="50V" decouplingFor=".U7 > .pin42" connections={{pin1:"net.V3V3",pin2:"net.GND"}} pcbRotation={180} schRotation={-90} schSheetName="motion" schX={-4} schY={-1} />
    <capacitor name="C29" pcbX={25.75} pcbY={5.5} capacitance="1uF" footprint="0603" supplierPartNumbers={{jlcpcb:["C15849"]}} maxVoltageRating="25V" connections={{pin1:"net.DRV_VCP",pin2:"net.VMOTOR"}} pcbRotation={0} schRotation={-90} schSheetName="motion" schX={-3.9} schY={4} />
    <capacitor name="C30" pcbX={16.0} pcbY={3.75} capacitance="100nF" footprint="0805" supplierPartNumbers={{jlcpcb:["C28233"]}} maxVoltageRating="100V" connections={{pin1:"net.DRV_CPH",pin2:"net.DRV_CPL"}} pcbRotation={90} schSheetName="motion" schX={-3.9} schY={2.2} />
    <resistor name="R34" pcbX={16.25} pcbY={-2.75} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.V3V3",pin2:"net.DRV_CS_N"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={1} schY={6} />
    <resistor name="R35" pcbX={12} pcbY={-6.5} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.V3V3",pin2:"net.DRV_FAULT_N"}} pcbRotation={180} schRotation={-90} schSheetName="motion" schX={4} schY={6} />
    <resistor name="R36" pcbX={14.5} pcbY={-9.0} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.V3V3",pin2:"net.DRV_HOME_N"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={7} schY={6} />
    <resistor name="R37" pcbX={15.5} pcbY={1.0} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.DRV_SLEEP_N",pin2:"net.GND"}} pcbRotation={180} schRotation={-90} schSheetName="motion" schX={10} schY={6} />
    <resistor name="R38" pcbX={14.5} pcbY={-1.5} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.DRV_STEP",pin2:"net.GND"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={1} schY={2.7} />
    <resistor name="R39" pcbX={14.0} pcbY={3.5} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.DRV_DIR",pin2:"net.GND"}} pcbRotation={90} schRotation={-90} schSheetName="motion" schX={4} schY={2.7} />
    <resistor name="R55" pcbX={16.25} pcbY={6.5} resistance="10k" footprint="0603" supplierPartNumbers={{jlcpcb:["C844918"]}} connections={{pin1:"net.RUN_SAFE",pin2:"net.GND"}} pcbRotation={0} schRotation={-90} schSheetName="motion" schX={7} schY={2.7} />
    <capacitor name="C107" pcbX={-14.25} pcbY={-17.0} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin33" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={90} schSheetName="mcu" schX={-8.1} schY={-6.1} />
    <capacitor name="C106" pcbX={-14.25} pcbY={-13.5} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin42" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={90} schSheetName="mcu" schX={-6.8} schY={-6.1} />
    <capacitor name="C108" pcbX={-18.5} pcbY={-10.0} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin48" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={180} schSheetName="mcu" schX={-5.5} schY={-6.1} />
    <capacitor name="C100" pcbX={-19.25} pcbY={-11.25} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin49" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={180} schSheetName="mcu" schX={-4.199999999999999} schY={-6.1} />
    <capacitor name="C101" pcbX={-15.25} pcbY={-11.25} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin43" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={180} schSheetName="mcu" schX={-2.9000000000000004} schY={-6.1} />
    <capacitor name="C102" pcbX={-16.5} pcbY={-10.0} capacitance="1uF" footprint="0402" supplierPartNumbers={{jlcpcb:["C52923"]}} maxVoltageRating="25V" decouplingFor=".U16 > .pin44" connections={{pin1:"net.V3V3_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={0} schSheetName="mcu" schX={-1.5999999999999996} schY={-6.1} />
    <capacitor name="C103" pcbX={-17.25} pcbY={-11.25} capacitance="1uF" footprint="0402" supplierPartNumbers={{jlcpcb:["C52923"]}} maxVoltageRating="25V" decouplingFor=".U16 > .pin45" connections={{pin1:"net.V1V1_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={0} schSheetName="mcu" schX={-10} schY={-8.5} />
    <capacitor name="C104" pcbX={-18.75} pcbY={-22.0} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin23" connections={{pin1:"net.V1V1_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={180} schSheetName="mcu" schX={-8.7} schY={-8.5} />
    <capacitor name="C105" pcbX={-21.25} pcbY={-11.25} capacitance="100nF" footprint="0402" supplierPartNumbers={{jlcpcb:["C1525"]}} maxVoltageRating="16V" decouplingFor=".U16 > .pin50" connections={{pin1:"net.V1V1_MCU",pin2:"net.GND"}} schRotation={-90} pcbRotation={180} schSheetName="mcu" schX={-7.4} schY={-8.5} />
    <resistor name="R138" pcbX={-21.5} pcbY={-21.0} resistance="1k" footprint="0603" supplierPartNumbers={{jlcpcb:["C21190"]}} connections={{pin1:"net.OSC_OUT",pin2:"net.XTAL_OUT"}} pcbRotation={180} schSheetName="mcu" schX={-3.15} schY={-3.9} />
    <resistor name="R139" pcbX={-21.5} pcbY={-9.75} resistance="1k" footprint="0603" supplierPartNumbers={{jlcpcb:["C21190"]}} connections={{pin1:"net.FLASH_CS_N",pin2:"net.BOOTSEL_N"}} pcbRotation={180} schSheetName="mcu" schX={-3.15} schY={-5} />
    <testpoint name="TP_BOOTSEL" doNotPlace pcbX={-9.0} pcbY={-32.0} footprint={<footprint><smtpad portHints={["pin1"]} pcbX={0} pcbY={0} shape="circle" radius={0.7} /></footprint>} connections={{pin1:"net.BOOTSEL_N"}} pcbRotation={0} schSheetName="mcu" schX={12} schY={3.8} />
    <resistor name="R140" pcbX={0.0} pcbY={6.0} resistance="4.7k" footprint="0603" supplierPartNumbers={{jlcpcb:["C23162"]}} connections={{pin1:"net.V3V3",pin2:"net.ENC_SDA"}} pcbRotation={90} schRotation={-90} schSheetName="indicators" schX={9} schY={-2.35} />
    <resistor name="R141" pcbX={-1.5} pcbY={9.0} resistance="4.7k" footprint="0603" supplierPartNumbers={{jlcpcb:["C23162"]}} connections={{pin1:"net.V3V3",pin2:"net.ENC_SCL"}} pcbRotation={0} schRotation={-90} schSheetName="indicators" schX={11} schY={-2.35} />

    <net name="DRV_VCP" />
    <net name="DRV_CPH" />
    <net name="DRV_CPL" />
    <net name="DRV_SLEEP_N" />
    <net name="DRV_DIR" />
    <net name="DRV_STEP" />
    <net name="DRV_CS_N" />
    <net name="DRV_DVDD" />
    <net name="DRV_HOME_N" />
    <net name="DRV_FAULT_N" />
    <net name="BRAKE_FB_MID" />
    <net name="BRAKE_FB" />
    <net name="V1V1_MCU" />
    <net name="XTAL_OUT" />
    <net name="BOOTSEL_N" />
    <net name="ENC_SDA" />
    <net name="ENC_SCL" />
    <net name="QSPI_SD3" />
    <net name="QSPI_SCK" />
    <net name="QSPI_SD0" />
    <net name="QSPI_SD2" />
    <net name="QSPI_SD1" />
    <net name="ENC_OUT" />
    {/* MCU */}
    <RP2040 name="U16" schSectionName="mcu_U16" pcbX={-19.0} pcbY={-16.0}
      connections={{"pin2":"net.DRV_STEP","pin3":"net.DRV_DIR","pin4":"net.DRV_SLEEP_N","pin5":"net.DRV_FAULT_N","pin17":"net.ENC_SDA","pin18":"net.ENC_SCL","pin8":"net.MOTOR_PG","pin9":"net.EFUSE_FAULT_N","pin11":"net.VMOTOR_OK","pin12":"net.MCU_RUN","pin13":"net.POWER_PERMIT","pin14":"net.USER_BUTTON_N","pin15":"net.STATUS_GPIO","pin16":"net.DRV_HOME_N","pin27":"net.SPI_MISO","pin28":"net.DRV_CS_N","pin29":"net.SPI_SCK","pin30":"net.SPI_MOSI","pin31":"net.PD_SDA","pin32":"net.PD_SCL","pin38":"net.PHASE_A_ADC","pin39":"net.PHASE_B_ADC","pin40":"net.BOARD_POWER_SENSE","pin41":"net.USB_VBUS_SENSE","pin1":"net.V3V3_MCU","pin10":"net.V3V3_MCU","pin22":"net.V3V3_MCU","pin33":"net.V3V3_MCU","pin42":"net.V3V3_MCU","pin43":"net.V3V3_MCU","pin44":"net.V3V3_MCU","pin48":"net.V3V3_MCU","pin49":"net.V3V3_MCU","pin19":"net.GND","pin20":"net.OSC_IN","pin21":"net.OSC_OUT","pin23":"net.V1V1_MCU","pin24":"net.SWCLK","pin25":"net.SWDIO","pin26":"net.NRST","pin45":"net.V1V1_MCU","pin46":"net.USB_DM","pin47":"net.USB_DP","pin50":"net.V1V1_MCU","pin51":"net.QSPI_SD3","pin52":"net.QSPI_SCK","pin53":"net.QSPI_SD0","pin54":"net.QSPI_SD2","pin55":"net.QSPI_SD1","pin56":"net.FLASH_CS_N","pin57":"net.GND"}} noConnect={["pin6","pin7","pin34","pin35","pin36","pin37"]} pcbRotation={0} schSheetName="mcu" schX={-2.25} schY={0.025} />
    <capacitor name="C44" pcbX={-23.75} pcbY={-13.5}
      schRotation={-90}

      capacitance="100nF" footprint="0402" supplierPartNumbers={{ jlcpcb: ["C1525"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin1"
      maxVoltageRating="16V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} pcbRotation={270} schSheetName="mcu" schX={-12} schY={-6.1} />
    <capacitor name="C45" pcbX={-23.75} pcbY={-17.0}
      schRotation={-90}

      capacitance="100nF" footprint="0402" supplierPartNumbers={{ jlcpcb: ["C1525"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin10"
      maxVoltageRating="16V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} pcbRotation={270} schSheetName="mcu" schX={-10.7} schY={-6.1} />
    <capacitor name="C46" pcbX={-18.75} pcbY={-20.75}
      schRotation={-90}

      capacitance="100nF" footprint="0402" supplierPartNumbers={{ jlcpcb: ["C1525"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin22"
      maxVoltageRating="16V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} pcbRotation={0} schSheetName="mcu" schX={-9.4} schY={-6.1} />
    <capacitor name="C47" schSectionName="mcu_U16" pcbX={-28.0} pcbY={-15.75} pcbRotation={180}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} schSheetName="mcu"  schX={1} schY={-6.1} />
    <resistor name="R70" schSectionName="mcu_U16" pcbX={-10.5} pcbY={-11.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.NRST" }} pcbRotation={270} schSheetName="mcu" schX={-6.3} schY={3.025} />
    <capacitor name="C48" schSectionName="mcu_U16" pcbX={-8.0} pcbY={-16.75}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} pcbRotation={0} schSheetName="mcu" schX={-6.3} schY={1.525} />
    <resistor name="R71" schSectionName="mcu_U16" pcbX={-27.5} pcbY={-11.5}
      resistance="27" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25190"] }}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.USB_DP" }} schSheetName="mcu" schX={3.15} schY={-0.125} />
    <resistor name="R72" schSectionName="mcu_U16" pcbX={-27.5} pcbY={-13.75}
      resistance="27" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25190"] }}
      connections={{ pin1: "net.USB_DM_CONN", pin2: "net.USB_DM" }} schSheetName="mcu" schX={3.15} schY={-1.25} />
    <X322512MSB4SI name="Y1" schSectionName="mcu_Y1" pcbX={-23.0} pcbY={-25.0}
      loadCapacitance="20pF"
      connections={{"pin1":"net.OSC_IN","pin2":"net.GND","pin3":"net.XTAL_OUT","pin4":"net.GND"}} pcbRotation={0} schSheetName="mcu" schX={-2.25} schY={5.4} />
    <capacitor name="C49" schSectionName="mcu_Y1" pcbX={-25.0} pcbY={-28.0}
      schRotation={-90}
      capacitance="33pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C1663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND" }} pcbRotation={180} schSheetName="mcu" schX={-4.5} schY={4.6} />
    <capacitor name="C50" schSectionName="mcu_Y1" pcbX={-20.0} pcbY={-28.0}
      schRotation={-90}
      capacitance="33pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C1663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_OUT", pin2: "net.GND" }} pcbRotation={0} schSheetName="mcu" schX={0} schY={4.6} />
    <TS_1088_AR02016 name="SW1" schSectionName="mcu_SW1" pcbX={-25.0} pcbY={-40} layer="top" schRotation={-90}
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} schSheetName="mcu" schX={2.25} schY={-2.225} />
    <TS_1088_AR02016 name="SW2" schSectionName="user_start_stop" pcbX={-10.5} pcbY={-40} layer="top" schRotation={-90}
      connections={{ pin1: "net.USER_BUTTON_N", pin2: "net.GND" }} schSheetName="mcu" schX={11} schY={5.8} />
    <resistor name="R133" schSectionName="user_start_stop" pcbX={-16} pcbY={-40} layer="top" schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.USER_BUTTON_N" }} schSheetName="mcu" schX={8} schY={5.8} />

    {/* Top-side service pads replace a bulky debug connector. */}
    <testpoint doNotPlace name="TP_SWD_3V3" schSectionName="mcu_U16" pcbX={-22} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3_MCU" }} schSheetName="mcu" schX={5} schY={-5.7} />
    <testpoint doNotPlace name="TP_SWDIO" schSectionName="mcu_U16" pcbX={-19.5} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWDIO" }} schSheetName="mcu" schX={8.3} schY={-5.7} />
    <testpoint doNotPlace name="TP_SWD_GND" schSectionName="mcu_U16" pcbX={-17} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} schSheetName="mcu" schX={11.6} schY={-5.7} />
    <testpoint doNotPlace name="TP_SWCLK" schSectionName="mcu_U16" pcbX={-21.25} pcbY={-35.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWCLK" }} schSheetName="mcu" schX={5} schY={-8.2} />
    <testpoint doNotPlace name="TP_NRST" schSectionName="mcu_U16" pcbX={-19.25} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.NRST" }} schSheetName="mcu" schX={8.3} schY={-8.2} />
    <testpoint doNotPlace name="TP_STATUS" schSectionName="mcu_U16" pcbX={-17} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.STATUS_GPIO" }} schSheetName="mcu" schX={11.6} schY={-8.2} />
    <W25Q32JVSSIQ name="U17" schSectionName="mcu_U17" schWidth={1.74} schHeight={2.4} pcbX={-13.0} pcbY={-26.0}
      schPinArrangement={{ leftSide: ["pin1", "pin2"], rightSide: ["pin5", "pin6"], topSide: ["pin3", "pin7", "pin8"], bottomSide: ["pin4"] }}
      connections={{"pin1":"net.FLASH_CS_N","pin2":"net.QSPI_SD1","pin3":"net.QSPI_SD2","pin4":"net.GND","pin5":"net.QSPI_SD0","pin6":"net.QSPI_SCK","pin7":"net.QSPI_SD3","pin8":"net.V3V3_MCU"}} pcbRotation={0} schSheetName="mcu" schX={9.45} schY={-1.85} />
    <resistor name="R73" schSectionName="mcu_U17" pcbX={-8.0} pcbY={-27.75}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{"pin1":"net.V3V3_MCU","pin2":"net.FLASH_CS_N"}} schSheetName="mcu" schX={6.93} schY={-0.725} />
    <capacitor name="C51" schSectionName="mcu_U17" pcbX={-16.75} pcbY={-22.5}
      schRotation={-90}

      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U17 > .pin8"
      maxVoltageRating="50V"
      connections={{"pin1":"net.V3V3_MCU","pin2":"net.GND"}} pcbRotation={270} schSheetName="mcu" schX={-0.29999999999999893} schY={-6.1} />

    {/* ENCODER */}
    <AS5600_ASOM name="U18" kicadFootprintMetadata={{ footprintName: "AS5600-ASOM" }} schSectionName="encoder_U18" pcbX={0} pcbY={0} pcbRotation={0} layer="bottom" doNotPlace
      connections={{"pin1":"net.V3V3","pin2":"net.V3V3","pin3":"net.ENC_OUT","pin4":"net.GND","pin6":"net.ENC_SDA","pin7":"net.ENC_SCL","pin8":"net.GND"}} noConnect={["pin5"]} schSheetName="indicators" schX={0.95} schY={-4.99} />

    <capacitor name="C52" kicadFootprintMetadata={{ footprintName: "capacitor_cap0603" }} schSectionName="encoder_U18" pcbX={0.0} pcbY={-5.55} layer="top" doNotPlace
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U18 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="indicators" schX={4} schY={6} />
    <capacitor name="C53" kicadFootprintMetadata={{ footprintName: "capacitor_cap0603" }} schSectionName="encoder_U18" pcbX={3} pcbY={-4.5} pcbRotation={0} layer="top" doNotPlace
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="indicators" schX={5.3} schY={6} />
    {/* Encoder observation remains available without a second field connector. */}
    <testpoint doNotPlace name="TP_ENC_3V3" schSectionName="encoder_U18" pcbX={-10} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3" }} schSheetName="indicators" schX={7.55} schY={-6.09} />
    <testpoint doNotPlace name="TP_ENC_A" schSectionName="encoder_U18" pcbX={-7.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{"pin1":"net.ENC_SDA"}} schSheetName="indicators" schX={10.3} schY={-6.09} />
    <testpoint doNotPlace name="TP_ENC_B" schSectionName="encoder_U18" pcbX={-5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{"pin1":"net.ENC_SCL"}} schSheetName="indicators" schX={13.05} schY={-6.09} />
    <testpoint doNotPlace name="TP_ENC_I" schSectionName="encoder_U18" pcbX={-2.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{"pin1":"net.ENC_OUT"}} schSheetName="indicators" schX={8.925} schY={-7.08} />
    <testpoint doNotPlace name="TP_ENC_GND" schSectionName="encoder_U18" pcbX={0} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} schSheetName="indicators" schX={11.675} schY={-7.08} />

    {/* INTERFACES */}

    <USB4105_GF_A name="J10" schSectionName="usb-data_J10" pcbX={-38} pcbY={1} pcbRotation={270}
      allowOffBoard
      schWidth={1.521}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin13", "pin12", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin10", "pin16"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.USB_DATA_VBUS", pin8: "net.USB_DATA_VBUS", pin17: "net.USB_DATA_VBUS", pin18: "net.USB_DATA_VBUS", pin9: "net.DATA_CC2", pin15: "net.DATA_CC1", pin11: "net.USB_DP_CONN", pin13: "net.USB_DP_CONN", pin12: "net.USB_DM_CONN", pin14: "net.USB_DM_CONN" }} schSheetName="usb-data" schX={-5.525} schY={4.445} />
    <resistor name="R105" schSectionName="usb-data_J10" schRotation={-90} pcbX={-31.5} pcbY={5} pcbRotation={180}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC1", pin2: "net.GND" }} schSheetName="usb-data" schX={-5.525} schY={0.545} />
    <resistor name="R106" schSectionName="usb-data_J10" schRotation={-90} pcbX={-30} pcbY={-4}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC2", pin2: "net.GND" }} schSheetName="usb-data" schX={-3.5} schY={0.5} />
    <USBLC6_4SC6 name="D15" schSectionName="usb-data_J10" pcbX={-30.5} pcbY={1.2}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.GND", pin3: "net.USB_DM_CONN", pin4: "net.DATA_CC1", pin5: "net.USB_DATA_VBUS", pin6: "net.DATA_CC2" }} schSheetName="usb-data" schX={-0.2} schY={0.5} />
    <capacitor name="C73" schSectionName="usb-data_J10" schRotation={-90} pcbX={-30.5} pcbY={-1.75}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="50V" connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND" }} schSheetName="usb-data" schX={-10} schY={1.5} />

    <trace name="BYPASS_C93" from=".U12 > .pin4" to=".C93 > .pin1" pcbPathRelativeTo=".U12 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.35001,"y":0.94996},{"x":-0.97504,"y":0.94996},{"x":0.575,"y":2.5}]} />
    <trace name="BYPASS_C94" from=".U12 > .pin6" to=".C94 > .pin1" pcbPathRelativeTo=".U12 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.35001,"y":-0.94996},{"x":-1.87504,"y":-0.425},{"x":-3.0,"y":-0.425}]} />
    <trace name="BYPASS_C52" from=".U18 > .pin1" to=".C52 > .pin1" pcbPathRelativeTo=".U18 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.905,"y":-2.7051},{"x":0.6,"y":-3.9,"via":true,"fromLayer":"bottom","toLayer":"top"},{"x":0,"y":-4.725}]} />
    <trace name="BYPASS_C53" from=".C52 > .pin1" to=".C53 > .pin1" pcbPathRelativeTo=".C52 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.825,"y":-0.0},{"x":-0.825,"y":1.95},{"x":-1.05,"y":2.175}]} />
    <trace name="BYPASS_C25" from=".U7 > .pin11" to=".C25 > .pin1" pcbPathRelativeTo=".U7 > .pin11" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-0.3175,"y":-3.79995},{"x":-0.6,"y":-4.8},{"x":-1.1625,"y":-6.0}]} />
    <trace name="BYPASS_C26" from=".U7 > .pin21" to=".C26 > .pin1" pcbPathRelativeTo=".U7 > .pin21" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":6.0325,"y":-3.79995},{"x":5.75,"y":-4.75},{"x":4.5875,"y":-6.0}]} />
    <trace name="BYPASS_C27" from=".U7 > .pin43" to=".C27 > .pin1" pcbPathRelativeTo=".U7 > .pin43" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-6.0325,"y":3.79995},{"x":-6.35,"y":4.9},{"x":-6.825,"y":5.75}]} />
    <trace name="BYPASS_C28" from=".U7 > .pin42" to=".C28 > .pin1" pcbPathRelativeTo=".U7 > .pin42" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-5.3975,"y":3.79995},{"x":-5.15,"y":4.7},{"x":-4.4,"y":5.2},{"x":-3.5,"y":5.525}]} />
    <trace name="BYPASS_C44" from=".U16 > .pin1" to=".C44 > .pin1" pcbPathRelativeTo=".U16 > .pin1" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-3.424936,"y":2.600071},{"x":-4.75,"y":3.01}]} />
    <trace name="BYPASS_C45" from=".U16 > .pin10" to=".C45 > .pin1" pcbPathRelativeTo=".U16 > .pin10" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-3.424936,"y":-0.999871},{"x":-4.05,"y":-0.85},{"x":-4.75,"y":-0.49}]} />
    <trace name="BYPASS_C46" from=".U16 > .pin22" to=".C46 > .pin1" pcbPathRelativeTo=".U16 > .pin22" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":0.199898,"y":-3.425063},{"x":0.05,"y":-4.1},{"x":-0.26,"y":-4.75}]} />
    <trace name="BYPASS_C107" from=".U16 > .pin33" to=".C107 > .pin1" pcbPathRelativeTo=".U16 > .pin33" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":3.424936,"y":-0.999871},{"x":4.05,"y":-1.15},{"x":4.75,"y":-1.51}]} />
    <trace name="BYPASS_C106" from=".U16 > .pin42" to=".C106 > .pin1" pcbPathRelativeTo=".U16 > .pin42" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":3.424936,"y":2.600071},{"x":4.05,"y":2.45},{"x":4.75,"y":1.99}]} />
    <trace name="BYPASS_C108" from=".U16 > .pin48" to=".C108 > .pin1" pcbPathRelativeTo=".U16 > .pin48" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":0.599948,"y":3.425063},{"x":0.199898,"y":3.425063},{"x":0.26,"y":4.75},{"x":0.475,"y":5.0},{"x":0.475,"y":5.2},{"x":0.7,"y":5.425},{"x":0.7,"y":5.45},{"x":0.75,"y":5.5},{"x":0.75,"y":5.55},{"x":0.825,"y":5.625},{"x":0.8431,"y":5.637},{"x":0.85,"y":5.7},{"x":1.01,"y":6.0}]} />
    <trace name="BYPASS_C100" from=".U16 > .pin49" to=".C100 > .pin1" pcbPathRelativeTo=".U16 > .pin49" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":0.199898,"y":3.425063},{"x":0.26,"y":4.75}]} />
    <trace name="BYPASS_C101" from=".U16 > .pin43" to=".C101 > .pin1" pcbPathRelativeTo=".U16 > .pin43" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":2.599944,"y":3.425063},{"x":4.26,"y":4.75}]} />
    <trace name="BYPASS_C102" from=".U16 > .pin44" to=".C102 > .pin1" pcbPathRelativeTo=".U16 > .pin44" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":2.199894,"y":3.425063},{"x":2.05,"y":4.05},{"x":1.8,"y":4.35},{"x":1.8,"y":5.55},{"x":1.99,"y":6.0}]} />
    <trace name="BYPASS_C103" from=".U16 > .pin45" to=".C103 > .pin1" pcbPathRelativeTo=".U16 > .pin45" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":1.799844,"y":3.425063},{"x":1.65,"y":4.05},{"x":1.24,"y":4.75}]} />
    <trace name="BYPASS_C104" from=".U16 > .pin23" to=".C104 > .pin1" pcbPathRelativeTo=".U16 > .pin23" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":0.599948,"y":-3.425063},{"x":0.4,"y":-4.25},{"x":0.3,"y":-4.35},{"x":0.3,"y":-5.15},{"x":0.76,"y":-6.0}]} />
    <trace name="BYPASS_C105" from=".U16 > .pin50" to=".C105 > .pin1" pcbPathRelativeTo=".U16 > .pin50" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-0.200152,"y":3.425063},{"x":-0.3,"y":3.95},{"x":-0.7,"y":4.2},{"x":-1.15,"y":4.25},{"x":-1.74,"y":4.75}]} />
    <trace name="BYPASS_C51" from=".U17 > .pin8" to=".C51 > .pin1" pcbPathRelativeTo=".U17 > .pin8" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":3.530092},{"x":-3.75,"y":4.325}]} />
    <trace name="BYPASS_C29" from=".U7 > .pin22" to=".C29 > .pin1" pcbPathRelativeTo=".U7 > .pin22" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":6.6675,"y":-3.79995},{"x":8.5,"y":-2.925}]} />
    <trace name="BYPASS_C30" from=".U7 > .pin23" to=".C30 > .pin1" pcbPathRelativeTo=".U7 > .pin23" thickness="0.15mm" maxLength="5mm" pcbPath={[{"x":6.6675,"y":3.79995},{"x":6.35,"y":4.95},{"x":5.8375,"y":6.0}]} />
    {/* Local bypasses: <=3mm pad-to-pad placement, <=5mm routed path. */}
    <trace name="BYPASS_C2" from=".U1 > .pin10" to=".C2 > .pin1" pcbPathRelativeTo=".U1 > .pin10" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.499997,"y":0.799719},{"x":1.9,"y":0.799719},{"x":1.9,"y":2.2},{"x":1.3,"y":2.2},{"x":1.3,"y":2.9},{"x":0.6,"y":2.9997},{"x":0.5,"y":3.425}]} />
    <trace name="BYPASS_C6" from=".U2 > .pin32" to=".C6 > .pin1" pcbPathRelativeTo=".U2 > .pin32" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-2.050034,"y":-1.400048},{"x":-2.650034,"y":-1.675048},{"x":-3.300034,"y":-1.950048},{"x":-3.400034,"y":-2.000048},{"x":-3.500034,"y":-2.100048},{"x":-3.5,"y":-2.1},{"x":-3.65,"y":-2.1},{"x":-4.0,"y":-2.275}]} />
    <trace name="BYPASS_C7" from=".U2 > .pin1" to=".C7 > .pin1" pcbPathRelativeTo=".U2 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.400048,"y":-2.050034},{"x":-1.700048,"y":-2.250034},{"x":-1.750048,"y":-2.700034},{"x":-1.800048,"y":-2.800034},{"x":-1.800048,"y":-2.850034},{"x":-1.85,"y":-3.05},{"x":-2.0,"y":-3.425}]} />
    <trace name="BYPASS_C8" from=".U2 > .pin4" to=".C8 > .pin1" pcbPathRelativeTo=".U2 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.200152,"y":-2.050034},{"x":-0.2002,"y":-2.1},{"x":-0.012699,"y":-3.35},{"x":0.0,"y":-3.425}]} />
    <trace name="BYPASS_C9" from=".U3 > .pin8" to=".C9 > .pin1" pcbPathRelativeTo=".U3 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":2.599944},{"x":-2.055,"y":2.599944},{"x":-3.325056,"y":2.599944},{"x":-3.75,"y":1.675}]} />
    <trace name="BYPASS_C10" from=".U4 > .pin5" to=".C10 > .pin1" pcbPathRelativeTo=".U4 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C12" from=".U5 > .pin2" to=".C12 > .pin1" pcbPathRelativeTo=".U5 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-0.635,"y":-4.9461}]} />
    <trace name="BYPASS_C21" from=".U6 > .pin17" to=".C21 > .pin1" pcbPathRelativeTo=".U6 > .pin17" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":1.941957},{"x":-0.750062,"y":4.441957},{"x":-0.7875,"y":4.5}]} />

    <trace name="BYPASS_C38" from=".U10 > .pin5" to=".C38 > .pin1" pcbPathRelativeTo=".U10 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C39" from=".U11 > .pin5" to=".C39 > .pin1" pcbPathRelativeTo=".U11 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C40" from=".U13 > .pin5" to=".C40 > .pin1" pcbPathRelativeTo=".U13 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-2.650099,"y":0.40004},{"x":-2.650099,"y":0.45004},{"x":-2.700099,"y":0.50004},{"x":-2.700099,"y":0.55004},{"x":-2.750099,"y":0.60004},{"x":-2.750099,"y":0.65004},{"x":-2.800099,"y":0.70004},{"x":-2.800099,"y":0.75004},{"x":-2.850099,"y":0.80004},{"x":-2.850099,"y":0.85004},{"x":-2.900099,"y":0.90004},{"x":-2.900099,"y":0.95004},{"x":-2.925,"y":1.0}]} />
    <trace name="BYPASS_C41" from=".U14 > .pin5" to=".C41 > .pin1" pcbPathRelativeTo=".U14 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[".C41 > .pin1"]} />
    <trace name="BYPASS_C43" from=".U15 > .pin1" to=".C43 > .pin1" pcbPathRelativeTo=".U15 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.94996,"y":-1.149096},{"x":-0.94996,"y":-1.999096},{"x":-1.04996,"y":-2.099096},{"x":-1.04996,"y":-3.049096},{"x":-1.09996,"y":-3.099096},{"x":-1.09996,"y":-3.149096},{"x":-1.1,"y":-3.175}]} />

    <trace name="BYPASS_C63" from=".U22 > .pin2" to=".C63 > .pin1" pcbPathRelativeTo=".U22 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-0.635,"y":-4.6961}]} />
    <trace name="BYPASS_C69" from=".U23 > .pin1" to=".C69 > .pin1" pcbPathRelativeTo=".U23 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.699986,"y":-1.150074},{"x":-1.149986,"y":-1.150074},{"x":-1.499986,"y":-1.500074},{"x":-1.549986,"y":-1.500074},{"x":-1.599986,"y":-1.550074},{"x":-1.649986,"y":-1.550074},{"x":-1.699986,"y":-1.600074},{"x":-1.749986,"y":-1.600074},{"x":-1.799986,"y":-1.650074},{"x":-1.899986,"y":-1.650074},{"x":-1.949986,"y":-1.700074},{"x":-1.999986,"y":-1.700074},{"x":-2.049986,"y":-1.750074},{"x":-2.099986,"y":-1.750074},{"x":-2.149986,"y":-1.800074},{"x":-2.175,"y":-1.8}]} />
    <trace name="BYPASS_C70" from=".U24 > .pin1" to=".C70 > .pin1" pcbPathRelativeTo=".U24 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.649986,"y":-3.150074},{"x":-0.65,"y":-3.2001}]} />
    <resistor name="R119" schSectionName="usb-logic_board-sense" schRotation={-90} pcbX={-28} pcbY={-7} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.BOARD_POWER_SENSE" }} schSheetName="usb-data" schX={10.925} schY={-5.491} />
    <resistor name="R120" schSectionName="usb-logic_board-sense" schRotation={-90} pcbX={-28} pcbY={-9} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.BOARD_POWER_SENSE", pin2: "net.GND" }} schSheetName="usb-data" schX={10.925} schY={-7.081} />
    <TPS2553DBVR name="U28" schSectionName="usb-logic_U28" pcbX={-18} pcbY={3}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND", pin3: "net.USB_DATA_VBUS", pin5: "net.USB_ILIM", pin6: "net.USB_LOGIC_5V" }} pcbRotation={0} schSheetName="usb-data" schX={-8.075} schY={-0.721} />
    <TLV75533PDBVR name="U25" schSectionName="usb-logic_U25" pcbX={-18} pcbY={-1}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_LOGIC_5V", pin2: "net.GND", pin3: "net.USB_LOGIC_5V", pin5: "net.V3V3_USB" }} pcbRotation={90} schSheetName="usb-data" schX={3.325} schY={-0.721} />
    <LM66100DCKR name="U26" schSectionName="usb-logic_U26" pcbX={-17} pcbY={-5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3", pin2: "net.GND", pin3: "net.V3V3_USB", pin5: "net.USB_OR_SELECT", pin6: "net.V3V3_MCU" }} pcbRotation={90} schSheetName="usb-data" schX={-8.075} schY={-4.961} />
    <LM66100DCKR name="U27" schSectionName="usb-logic_U27" pcbX={-6} pcbY={-3.5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND", pin3: "net.USB_OR_SELECT", pin5: "net.GND", pin6: "net.V3V3_MCU" }} pcbRotation={90} schSheetName="usb-data" schX={3.325} schY={-6.021} />
    <resistor name="R112" schSectionName="usb-logic_U26" pcbX={-20.5} pcbY={-4.0}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.USB_OR_SELECT" }} pcbRotation={0} schRotation={-90} schSheetName="usb-data" schX={-2.375} schY={-3.901} />
    <resistor name="R113" schSectionName="usb-logic_U28" pcbX={-22.0} pcbY={5.5}
      layer="top"
      resistance="100k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.USB_ILIM", pin2: "net.GND" }} pcbRotation={0} schRotation={-90} schSheetName="usb-data" schX={-4.275} schY={-2.311} />
    <capacitor name="C74" schSectionName="usb-data_J10" pcbX={-14.75} pcbY={5}
      layer="top"
      pcbRotation={90}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U28 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND" }} schSheetName="usb-data" schX={-8.7} schY={1.5} />
    <capacitor name="C75" schSectionName="usb-logic_U25" pcbX={-14.7} pcbY={0.3}
      layer="top"
      pcbRotation={0}
      capacitance="1uF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U25 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.USB_LOGIC_5V", pin2: "net.GND" }} schSheetName="usb-data" schX={0.5} schY={-4} />
    <capacitor name="C76" schSectionName="usb-logic_U25" pcbX={-14.7} pcbY={-2.3}
      layer="top"
      pcbRotation={0}
      capacitance="10uF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      schRotation={-90}
      maxVoltageRating="10V"
      decouplingFor=".U25 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} schSheetName="usb-data" schX={6.175} schY={-2.841} />
    <capacitor name="C77" schSectionName="usb-logic_U26" pcbX={-13.2} pcbY={-5}
      layer="top"
      pcbRotation={90}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U26 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} schSheetName="usb-data" schX={-10.925} schY={-7.081} />
    <capacitor name="C78" schSectionName="usb-logic_U27" pcbX={-7.5} pcbY={-6}
      layer="top"
      pcbRotation={180}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U27 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} schSheetName="usb-data" schX={7.315} schY={-2.841} />
    <TMP102AIDRLR name="U29" schSectionName="telemetry_U29" pcbX={20} pcbY={8} schWidth={1.289}
      layer="top"
      connections={{ pin1: "net.PD_SCL", pin2: "net.GND", pin3: "net.TEMP_OK", pin4: "net.GND", pin5: "net.V3V3", pin6: "net.PD_SDA" }} pcbRotation={0} schSheetName="telemetry" schX={-10} schY={4.3} />
    <SN74LVC1G08DBVR name="U33" schSectionName="telemetry_U29" pcbX={6.3} pcbY={4.5}
      layer="top"
      connections={{ pin1: "net.RUN_WINDOW_OK", pin2: "net.TEMP_OK", pin3: "net.GND", pin4: "net.RUN_SAFE", pin5: "net.V3V3" }} pcbRotation={0} schSheetName="motor-power" schX={9} schY={-6.5} />
    <resistor name="R114" schSectionName="telemetry_U29" pcbX={26.5} pcbY={9.5}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TEMP_OK" }} pcbRotation={0} schRotation={-90} schSheetName="motor-power" schX={9} schY={-3.9} />
    <ADS1115IDGSR name="U30" schSectionName="telemetry_U30" pcbX={-6} pcbY={5}
      layer="top"
      noConnect={["pin2"]}
      connections={{ pin1: "net.V3V3", pin3: "net.GND", pin4: "net.VMON_ADC", pin5: "net.IIN_MON", pin6: "net.BRAKE_FB", pin7: "net.GND", pin8: "net.V3V3", pin9: "net.PD_SDA", pin10: "net.PD_SCL" }} pcbRotation={0} schSheetName="telemetry" schX={-1.5} schY={4.3} />
    {/* Raw PD voltage: 85 V input independent of VS; no motor-current shunt.
         The existing ADS1115 scan remains dedicated to VMOTOR/IIN/brake. */}
    <INA237AIDGSR name="U38" pcbX={-31.75} pcbY={10.0}
      layer="top" noConnect={["pin3"]}
      connections={{pin1:"net.GND",pin2:"net.GND",pin4:"net.PD_SDA",pin5:"net.PD_SCL",pin6:"net.V3V3",pin7:"net.GND",pin8:"net.PD_VBUS",pin9:"net.GND",pin10:"net.GND"}} pcbRotation={0} schSheetName="telemetry" schX={8.4} schY={4.3} />
    <capacitor name="C109" pcbX={-28.75} pcbY={14.75}
      layer="top" capacitance="100nF" footprint="0603" supplierPartNumbers={{jlcpcb:["C14663"]}}
      maxVoltageRating="50V" decouplingFor=".U38 > .pin6" maxDecouplingTraceLength="5mm"
      connections={{pin1:"net.V3V3",pin2:"net.GND"}} schRotation={-90} pcbRotation={0} schSheetName="telemetry" schX={0.6000000000000001} schY={1.5} />
    <trace name="BYPASS_C109" from=".U38 > .pin6" to=".C109 > .pin1" thickness="0.15mm" maxLength="5mm" pcbPath={[".C109 > .pin1"]} />
    <INA240A1DR name="U31" schSectionName="telemetry_U31" pcbX={15} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_A_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_A1" }} pcbRotation={270} schSheetName="motion" schX={-6.88} schY={-5.1} />
    <FRM121WFR005TM name="R115" schSectionName="telemetry_U31" pcbX={15} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_A1", pin2: "net.MOTOR_A1_OUT" }} pcbRotation={180} schSheetName="motion" schX={-10.32} schY={-3.6} />
    <resistor name="R117" schSectionName="telemetry_U31" pcbX={20} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_A_RAW", pin2: "net.PHASE_A_ADC" }} pcbRotation={270} schSheetName="motion" schX={-3.44} schY={-7.1} />
    <INA240A1DR name="U32" schSectionName="telemetry_U32" pcbX={25} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_B1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_B_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_B1" }} pcbRotation={270} schSheetName="motion" schX={5.16} schY={-5.1} />
    <FRM121WFR005TM name="R116" schSectionName="telemetry_U32" pcbX={25} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_B1", pin2: "net.MOTOR_B1_OUT" }} pcbRotation={180} schSheetName="motion" schX={1.72} schY={-3.6} />
    <resistor name="R118" schSectionName="telemetry_U32" pcbX={30} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_B_RAW", pin2: "net.PHASE_B_ADC" }} pcbRotation={270} schSheetName="motion" schX={10.32} schY={-7.1} />
    <capacitor name="C79" schSectionName="telemetry_U29" pcbX={19.5} pcbY={6.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U29 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} schSheetName="telemetry" schX={-2} schY={1.5} />
    <capacitor name="C80" schSectionName="telemetry_U30" pcbX={-2.5} pcbY={7.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U30 > .pin8"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} schSheetName="telemetry" schX={-0.7} schY={1.5} />
    <capacitor name="C81" schSectionName="telemetry_U31" pcbX={20} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U31 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} schSheetName="motion" schX={-2.7} schY={-1} />
    <capacitor name="C82" schSectionName="telemetry_U32" pcbX={30} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U32 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} schSheetName="motion" schX={-1.4} schY={-1} />
    <capacitor name="C83" schSectionName="telemetry_U31" pcbX={20.0} pcbY={-31.75}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_A_ADC", pin2: "net.GND" }} pcbRotation={90} schSheetName="motion" schX={-3.44} schY={-8.6} />
    <capacitor name="C84" schSectionName="telemetry_U32" pcbX={27.5} pcbY={-29.2}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_B_ADC", pin2: "net.GND" }} pcbRotation={0} schSheetName="motion" schX={10.32} schY={-8.6} />
    <capacitor name="C85" schSectionName="telemetry_U33" pcbX={3} pcbY={6.1}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U33 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} schSheetName="motor-power" schX={1.5} schY={-3.5} />
    <trace name="BYPASS_C74" from=".U28 > .pin1" to=".C74 > .pin1" pcbPathRelativeTo=".U28 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.35001,"y":-0.94996},{"x":1.50001,"y":-0.79996},{"x":1.80001,"y":-0.79996},{"x":2.05001,"y":-0.54996},{"x":2.10001,"y":-0.54996},{"x":2.55001,"y":-0.09996},{"x":2.55001,"y":0.20004},{"x":3.05001,"y":0.70004},{"x":3.05001,"y":0.75004},{"x":3.10001,"y":0.80004},{"x":3.10001,"y":0.90004},{"x":3.15001,"y":0.95004},{"x":3.15001,"y":1.00004},{"x":3.25001,"y":1.10004},{"x":3.25,"y":1.175}]} />
    <trace name="BYPASS_C75" from=".U25 > .pin1" to=".C75 > .pin1" pcbPathRelativeTo=".U25 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.300099,"y":-0.94996},{"x":1.300099,"y":-2.44996},{"x":1.3,"y":-2.475}]} />
    <trace name="BYPASS_C76" from=".U25 > .pin5" to=".C76 > .pin1" pcbPathRelativeTo=".U25 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-1.300099,"y":-2.44996},{"x":-1.3,"y":-2.475}]} />
    <trace name="BYPASS_C77" from=".U26 > .pin1" to=".C77 > .pin1" pcbPathRelativeTo=".U26 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.649986,"y":-1.950074},{"x":-0.749986,"y":-2.050074},{"x":-0.749986,"y":-3.000074},{"x":-0.799986,"y":-3.050074},{"x":-0.799986,"y":-3.750074},{"x":-0.825,"y":-3.8}]} />
    <trace name="BYPASS_C78" from=".U27 > .pin1" to=".C78 > .pin1" pcbPathRelativeTo=".U27 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[".C78 > .pin1"]} />
    <trace name="BYPASS_C79" from=".U29 > .pin5" to=".C79 > .pin1" pcbPathRelativeTo=".U29 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.749986,"y":-0.000127},{"x":-0.849986,"y":-0.100127},{"x":-1.249986,"y":-0.100127},{"x":-1.299986,"y":-0.150127},{"x":-1.299986,"y":-1.950127},{"x":-1.325,"y":-2.0}]} />
    <trace name="BYPASS_C80" from=".U30 > .pin8" to=".C80 > .pin1" pcbPathRelativeTo=".U30 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.0,"y":2.109978},{"x":0.0,"y":1.559978},{"x":0.1,"y":1.459978},{"x":0.1,"y":1.109978},{"x":0.15,"y":1.059978},{"x":1.35,"y":1.059978},{"x":2.0,"y":1.709978},{"x":2.05,"y":1.709978},{"x":2.1,"y":1.759978},{"x":2.2,"y":1.759978},{"x":2.25,"y":1.809978},{"x":2.3,"y":1.809978},{"x":2.35,"y":1.859978},{"x":2.4,"y":1.859978},{"x":2.45,"y":1.909978},{"x":2.5,"y":1.909978},{"x":2.55,"y":1.959978},{"x":2.65,"y":1.959978},{"x":2.675,"y":2.0}]} />
    <trace name="BYPASS_C81" from=".U31 > .pin6" to=".C81 > .pin1" pcbPathRelativeTo=".U31 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.7051},{"x":0.635,"y":3.2551},{"x":0.335,"y":3.5551},{"x":0.335,"y":3.9051},{"x":0.285,"y":3.9551},{"x":0.285,"y":4.0051},{"x":0.235,"y":4.0551},{"x":0.235,"y":4.1051},{"x":0.185,"y":4.1551},{"x":0.185,"y":4.2551},{"x":-0.015,"y":4.4551},{"x":-0.015,"y":4.6551},{"x":-0.065,"y":4.7051},{"x":-0.065,"y":4.8051},{"x":-0.115,"y":4.8551},{"x":-0.115,"y":4.9051},{"x":-0.165,"y":4.9551},{"x":-0.175,"y":5.0}]} />
    <trace name="BYPASS_C82" from=".U32 > .pin6" to=".C82 > .pin1" pcbPathRelativeTo=".U32 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.7051},{"x":0.635,"y":3.2551},{"x":0.335,"y":3.5551},{"x":0.335,"y":3.9051},{"x":0.285,"y":3.9551},{"x":0.285,"y":4.0051},{"x":0.235,"y":4.0551},{"x":0.235,"y":4.1051},{"x":0.185,"y":4.1551},{"x":0.185,"y":4.2551},{"x":-0.015,"y":4.4551},{"x":-0.015,"y":4.6551},{"x":-0.065,"y":4.7051},{"x":-0.065,"y":4.8051},{"x":-0.115,"y":4.8551},{"x":-0.115,"y":4.9051},{"x":-0.165,"y":4.9551},{"x":-0.175,"y":5.0}]} />
    <trace name="BYPASS_C85" from=".U33 > .pin5" to=".C85 > .pin1" pcbPathRelativeTo=".U33 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[".C85 > .pin1"]} />

    <trace name="PHASE_A_PLUS" from=".U31 > .pin8" to=".R115 > .pin1" pcbPathRelativeTo=".U31 > .pin8" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":2.7051},{"x":-2.005,"y":2.6051},{"x":-2.405,"y":2.6051},{"x":-2.755,"y":2.2551},{"x":-2.805,"y":2.2551},{"x":-3.455,"y":1.6051},{"x":-4.255,"y":1.6051},{"x":-4.305,"y":1.5551},{"x":-4.355,"y":1.5551},{"x":-4.405,"y":1.5051},{"x":-4.455,"y":1.5051},{"x":-4.5,"y":1.478788}]} />
    <trace name="PHASE_A_MINUS" from=".U31 > .pin1" to=".R115 > .pin2" pcbPathRelativeTo=".U31 > .pin1" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":-2.7051},{"x":-2.005,"y":-2.6051},{"x":-2.405,"y":-2.6051},{"x":-2.755,"y":-2.2551},{"x":-2.805,"y":-2.2551},{"x":-3.455,"y":-1.6051},{"x":-4.255,"y":-1.6051},{"x":-4.305,"y":-1.5551},{"x":-4.355,"y":-1.5551},{"x":-4.405,"y":-1.5051},{"x":-4.455,"y":-1.5051},{"x":-4.5,"y":-1.478788}]} />
    <trace name="PHASE_B_PLUS" from=".U32 > .pin8" to=".R116 > .pin1" pcbPathRelativeTo=".U32 > .pin8" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":2.7051},{"x":-2.005,"y":2.6051},{"x":-2.405,"y":2.6051},{"x":-2.755,"y":2.2551},{"x":-2.805,"y":2.2551},{"x":-3.455,"y":1.6051},{"x":-4.255,"y":1.6051},{"x":-4.305,"y":1.5551},{"x":-4.355,"y":1.5551},{"x":-4.405,"y":1.5051},{"x":-4.455,"y":1.5051},{"x":-4.5,"y":1.478788}]} />
    <trace name="PHASE_B_MINUS" from=".U32 > .pin1" to=".R116 > .pin2" pcbPathRelativeTo=".U32 > .pin1" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":-2.7051},{"x":-2.005,"y":-2.6051},{"x":-2.405,"y":-2.6051},{"x":-2.755,"y":-2.2551},{"x":-2.805,"y":-2.2551},{"x":-3.455,"y":-1.6051},{"x":-4.255,"y":-1.6051},{"x":-4.305,"y":-1.5551},{"x":-4.355,"y":-1.5551},{"x":-4.405,"y":-1.5051},{"x":-4.455,"y":-1.5051},{"x":-4.5,"y":-1.478788}]} />
    <trace name="BYPASS_C87" from=".U34 > .pin2" to=".C87 > .pin1" pcbPathRelativeTo=".U34 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-1.675,"y":-3.9},{"x":-2.125,"y":-3.9},{"x":-3.75,"y":-2.5125}]} />
    <trace name="BYPASS_C88" from=".U34 > .pin6" to=".C88 > .pin1" pcbPathRelativeTo=".U34 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.84607},{"x":1.55,"y":3.825},{"x":1.85,"y":3.9},{"x":2.149999,"y":3.9},{"x":3.235,"y":2.97607},{"x":3.55,"y":2.855}]} />
    <BoardMarkings />
    {/* Readable component references, placed clear of copper and adjacent labels. */}
    {/* Readable component references, placed clear of pads and adjacent labels. */}
    <silkscreentext text="ENC DNP" pcbX={0} pcbY={-8} fontSize={0.8} anchorAlignment="center" layer="bottom" />
    <silkscreentext text="SWD TEST" pcbX={-17.5} pcbY={-32} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="ENC TEST" pcbX={-6} pcbY={-33.4} fontSize={0.8} anchorAlignment="center" layer="top" />
    <BoardDiagnostics />
  </board>
)

export default PD1180EPR
