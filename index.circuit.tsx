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
import { AS5047P_ATSM } from "./imports/AS5047P_ATSM"
import { A_74LVC1G157GW_125 } from "./imports/A_74LVC1G157GW_125"
import { B2P_VH_LF__SN_ } from "./imports/B2P_VH_LF__SN_"
import { B4P_VH_LF__SN_ } from "./imports/B4P_VH_LF__SN_"
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
import { STM32G0B1 } from "./imports/STM32G0B1"
import { SWPA6045S220MT } from "./imports/SWPA6045S220MT"
import { REF3425IDBVR } from "./imports/REF3425IDBVR"
import { SRP7050TA_470M } from "./imports/SRP7050TA_470M"
import { TLV3201AIDBVR } from "./imports/TLV3201AIDBVR"
import { TMC5160A_TA_T } from "./imports/TMC5160A_TA_T"
import { TPD4S480RUKR } from "./imports/TPD4S480RUKR"
import { TPS26630RGER } from "./imports/TPS26630RGER"
import { TPS26750SRSMR } from "./imports/TPS26750SRSMR"
import { TS_1088_AR02016 } from "./imports/TS_1088_AR02016"
import { UCC27511DBVR } from "./imports/UCC27511DBVR"
import { USBLC6_4SC6 } from "./imports/USBLC6_4SC6"
import { USB4105_GF_A } from "./imports/USB4105_GF_A"
import { W25Q32JVSSIQ } from "./imports/W25Q32JVSSIQ"
import { X322516MLB4SI } from "./imports/X322516MLB4SI"
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
  <board name="PD1180_EPR" title="PD1180-EPR — NEMA 34 Smart Motor-Mounted Stepper Controller with USB-C PD 3.1 EPR" solderMaskColor="#245f2b" width="85.9mm" height="85.9mm" outline={TMCM1180_OUTLINE} layers={4} isViaInPadAllowed thickness="1.6mm"
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
    <schematicsection name="bridge-a_Q6" displayName="Motor Phase A Power Bridge / Q6" />
    <schematicsection name="bridge-a_Q7" displayName="Motor Phase A Power Bridge / Q7" />
    <schematicsection name="bridge-a_Q8" displayName="Motor Phase A Power Bridge / Q8" />
    <schematicsection name="bridge-a_Q9" displayName="Motor Phase A Power Bridge / Q9" />
    <schematicsection name="bridge-a_R109" displayName="Motor Phase A Power Bridge / R109" />
    <schematicsection name="bridge-a_J2" displayName="Motor Phase A Power Bridge / J2" />
    <schematicsection name="bridge-b_Q10" displayName="Motor Phase B Power Bridge / Q10" />
    <schematicsection name="bridge-b_Q11" displayName="Motor Phase B Power Bridge / Q11" />
    <schematicsection name="bridge-b_Q12" displayName="Motor Phase B Power Bridge / Q12" />
    <schematicsection name="bridge-b_Q13" displayName="Motor Phase B Power Bridge / Q13" />
    <schematicsection name="bridge-b_R110" displayName="Motor Phase B Power Bridge / R110" />
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
    <net name="BOOT_A1" isPowerNet={false} />
    <net name="BOOT_A2" isPowerNet={false} />
    <net name="BOOT_B1" isPowerNet={false} />
    <net name="BOOT_B2" isPowerNet={false} />
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
    <net name="DRV_EN_N" isPowerNet={false} />
    <net name="EEP_IRQ_N" isPowerNet={false} />
    <net name="EEP_SCL" isPowerNet={false} />
    <net name="EEP_SDA" isPowerNet={false} />
    <net name="EFUSE_EN" isPowerNet={false} />
    <net name="EFUSE_FAULT_N" isPowerNet={false} />
    <net name="EFUSE_IN" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="ENC_A" isPowerNet={false} />
    <net name="ENC_B" isPowerNet={false} />
    <net name="ENC_CS_N" isPowerNet={false} />
    <net name="ENC_I" isPowerNet={false} />
    <net name="EPR_BLK_GATE" isPowerNet={false} />
    <net name="EPR_EN" isPowerNet={false} />
    <net name="FLASH_CS_N" isPowerNet={false} />
    <net name="GH_A1" isPowerNet={false} />
    <net name="GH_A1_DRV" isPowerNet={false} />
    <net name="GH_A2" isPowerNet={false} />
    <net name="GH_A2_DRV" isPowerNet={false} />
    <net name="GH_B1" isPowerNet={false} />
    <net name="GH_B1_DRV" isPowerNet={false} />
    <net name="GH_B2" isPowerNet={false} />
    <net name="GH_B2_DRV" isPowerNet={false} />
    <net name="GL_A1" isPowerNet={false} />
    <net name="GL_A1_DRV" isPowerNet={false} />
    <net name="GL_A2" isPowerNet={false} />
    <net name="GL_A2_DRV" isPowerNet={false} />
    <net name="GL_B1" isPowerNet={false} />
    <net name="GL_B1_DRV" isPowerNet={false} />
    <net name="GL_B2" isPowerNet={false} />
    <net name="GL_B2_DRV" isPowerNet={false} />
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
    <net name="RUN_BASE" isPowerNet={false} />
    <net name="RUN_PG" isPowerNet={false} />
    <net name="RUN_SAFE" isPowerNet={false} />
    <net name="SD_MODE" isPowerNet={false} />
    <net name="SENSE_A" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="SENSE_B" isPowerNet={false} nominalTraceWidth="2.4mm" />
    <net name="SLEW_CAP" isPowerNet={false} />
    <net name="SPI_MISO" isPowerNet={false} />
    <net name="SPI_MOSI" isPowerNet={false} />
    <net name="SPI_SCK" isPowerNet={false} />
    <net name="STATUS_GPIO" isPowerNet={false} />
    <net name="SWCLK" isPowerNet={false} />
    <net name="SWDIO" isPowerNet={false} />
    <net name="TMC_12V" isPowerNet />
    <net name="TMC_5V" isPowerNet />
    <net name="TMC_CPI" isPowerNet={false} />
    <net name="TMC_CPO" isPowerNet={false} />
    <net name="TMC_CS_N" isPowerNet={false} />
    <net name="TMC_DIAG0" isPowerNet={false} />
    <net name="TMC_DIAG1" isPowerNet={false} />
    <net name="TMC_VCC" isPowerNet />
    <net name="TMC_VCP" isPowerNet={false} />
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
    <net name="DRIVER_BUCK_FB" />
    <net name="DRIVER_BUCK_VCC" />
    <net name="DRIVER_BUCK_BOOT" />
    <net name="DRIVER_BUCK_SW" />
    <net name="VREF_2V5" isPowerNet={false} />

    <net name="DATA_CC1" isPowerNet={false} />
    <net name="DATA_CC2" isPowerNet={false} />
    <net name="USB_DATA_VBUS" isPowerNet={true} />

    {/* Separate PD POWER and USB DATA ports; no shared VBUS or data paths. */}
    <USB4105_GF_A name="J1" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={-8.5} schY={-2.95} pcbX={-36} pcbY={15}
      pcbRotation={270}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin11", "pin13", "pin12", "pin14", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schWidth={1.4}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin11: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin14: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin10", "pin11", "pin12", "pin13", "pin14", "pin16"]}

      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.PD_VBUS", pin8: "net.PD_VBUS", pin17: "net.PD_VBUS", pin18: "net.PD_VBUS", pin9: "net.CC2_CONN", pin15: "net.CC1_CONN" }} />
    <resistor name="R107" schSheetName="usb-data" schSectionName="usb-data_J10" schX={3.5} schY={1.3} pcbX={-22.25} pcbY={16.0}
      schRotation={-90}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.USB_VBUS_SENSE" }} pcbRotation={180} />
    <resistor name="R108" schSheetName="usb-data" schSectionName="usb-data_J10" schX={3.5} schY={-1.7} pcbX={-15.75} pcbY={18}
      schRotation={-90}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <capacitor name="C72" schSheetName="usb-data" schSectionName="usb-data_J10" schX={6.5} schY={-1.7} pcbX={-25.5} pcbY={14.75} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxVoltageRating="50V"
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <TPD4S480RUKR name="U1" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={1.33} schY={-2.95} pcbX={-30} pcbY={24.5}
      schPinArrangement={{
        leftSide: { pins: ["pin20", "pin4", "pin5", "pin1", "pin2", "pin18", "pin13", "pin8", "pin21"], direction: "top-to-bottom" },
        rightSide: { pins: ["pin19", "pin17", "pin16", "pin12", "pin11", "pin15", "pin14", "pin9", "pin10", "pin3"], direction: "top-to-bottom" },
      }}
      noConnect={["pin1", "pin2"]}
      connections={{ pin3: "net.CC_VBIAS", pin4: "net.CC1_CONN", pin5: "net.CC2_CONN", pin6: "net.CC2_CONN", pin7: "net.CC1_CONN", pin8: "net.GND", pin9: "net.CC_FAULT_N", pin10: "net.PD_3V3", pin11: "net.CC2_PD", pin12: "net.CC1_PD", pin13: "net.GND", pin14: "net.GND", pin15: "net.GND", pin16: "net.EPR_EN", pin17: "net.EPR_BLK_GATE", pin18: "net.GND", pin19: "net.VBUS_LV", pin20: "net.PD_VBUS", pin21: "net.GND" }} />
    <TPS26750SRSMR name="U2" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-7.5} schY={-0.95} pcbX={-24} pcbY={23.35}
      noConnect={["pin10", "pin21", "pin28", "pin29"]}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.GND", pin4: "net.PD_1V5", pin5: "net.CC_FAULT_N", pin6: "net.GND", pin7: "net.EPR_EN", pin8: "net.PD_SDA", pin9: "net.PD_SCL", pin11: "net.GND", pin12: "net.GND", pin13: "net.GND", pin14: "net.GND", pin15: "net.EEP_SDA", pin16: "net.EEP_SCL", pin17: "net.EEP_IRQ_N", pin18: "net.GND", pin19: "net.GND", pin20: "net.PD_PATH_HV", pin22: "net.GND", pin23: "net.GND", pin24: "net.CC1_PD", pin25: "net.CC2_PD", pin26: "net.VBUS_LV", pin27: "net.VBUS_LV", pin30: "net.GND", pin31: "net.GND", pin32: "net.V3V3", pin33: "net.GND" }} />
    <BSS123LT1G name="Q1" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={5} schY={-0.5} pcbX={-38.0} pcbY={25.0}
      connections={{ gate: "net.EPR_BLK_GATE", source: "net.VBUS_LV", drain: "net.PD_VBUS" }} schRotation={90} pcbRotation={0} />

    <capacitor name="C1" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={3} schY={3.55} pcbX={-31} pcbY={19} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.CC_VBIAS", pin2: "net.GND" }} />
    <capacitor name="C2" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={8.5} schY={-6.95} pcbX={-29.5} pcbY={28.75} pcbRotation={90}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U1 > .pin10"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C3" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-4.87} schY={3.55} pcbX={-20.5} pcbY={24.75}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC1_PD", pin2: "net.GND" }} pcbRotation={270} />
    <capacitor name="C4" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-0.47} schY={3.55} pcbX={-21.75} pcbY={19.1} pcbRotation={90}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC2_PD", pin2: "net.GND" }} />
    <capacitor name="C5" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={1} schY={3.55} pcbX={-31.8} pcbY={15.8}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VBUS_LV", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C6" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-10.5} schY={-6.95} pcbX={-28.0} pcbY={20.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin32"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C7" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={5.7} schY={3.55} pcbX={-26.0} pcbY={19.1}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin1"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C8" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={2.5} schY={3.55} pcbX={-24.0} pcbY={19.1}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin4"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_1V5", pin2: "net.GND" }} />
    <resistor name="R1" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={6} schY={-4.55} pcbX={-38} pcbY={22.2} pcbRotation={0} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.CC_FAULT_N" }} />
    <resistor name="R2" schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={4.5} schY={2.55} pcbX={-33.1} pcbY={25.5} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EPR_EN", pin2: "net.GND" }} pcbRotation={90} />
    <M24512_RMN6TP name="U3" schSheetName="usb-pd-policy" schSectionName="usb-pd_U3" schX={8.5} schY={-0.95} pcbX={-13.75} pcbY={30.0}
      schPinArrangement={{ leftSide: ["pin1", "pin2", "pin3", "pin4"], rightSide: ["pin8", "pin6", "pin5", "pin7"] }}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.EEP_PROG_SDA", pin6: "net.EEP_PROG_SCL", pin7: "net.GND", pin8: "net.PD_3V3" }} pcbRotation={0} />
    <capacitor name="C9" schSheetName="usb-pd-policy" schSectionName="usb-pd_U3" schX={7.05} schY={3.55} pcbX={-17.5} pcbY={32.5}
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U3 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <resistor name="R3" schSheetName="usb-pd-policy" schSectionName="usb-pd_U3" schX={6.35} schY={2.55} pcbX={-28.55} pcbY={31}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SDA" }} pcbRotation={0} />
    <resistor name="R4" schSheetName="usb-pd-policy" schSectionName="usb-pd_U3" schX={8.5} schY={2.55} pcbX={-0.25} pcbY={41.9}
      pcbSx={{ "& silkscreentext": { pcbX: 1.9, pcbY: 0 } }}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SCL" }} pcbRotation={0} />
    <resistor name="R5" schSheetName="usb-pd-policy" schSectionName="usb-pd_U3" schX={10.5} schY={2.55} pcbX={-35.25} pcbY={25.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_IRQ_N" }} pcbRotation={90} />
    <resistor name="R6" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-2.5} schY={-0.55} pcbX={-31.25} pcbY={21.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SDA" }} pcbRotation={0} />
    <resistor name="R7" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={0.5} schY={-0.55} pcbX={-18.0} pcbY={25.5} layer="top" pcbRotation={0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SCL" }} />
    <resistor name="R9" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-2.5} schY={-2.35} pcbX={-31.75} pcbY={28.25}
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.375 } }}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_HV", pin2: "net.PD_LEVEL_BASE" }} pcbRotation={0} />
    <CSD17484F4 name="Q2" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={3.67} schY={-2.35} pcbX={-17.5} pcbY={20.0} pcbRotation={180}
      connections={{ pin1: "net.PD_LEVEL_BASE", pin2: "net.GND", pin3: "net.PD_PATH_N" }} />
    <resistor name="R11" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={-2.5} schY={-4.15} pcbX={-18.25} pcbY={23.25} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_N" }} pcbRotation={90} />
    <resistor name="R12" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={0.5} schY={-4.15} pcbX={-25.5} pcbY={16.5} pcbRotation={180}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_N", pin2: "net.PD_INV_BASE" }} />
    <CSD17484F4 name="Q3" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={2} schY={-7} pcbX={-29.5} pcbY={16.5} pcbRotation={180}
      connections={{ pin1: "net.PD_INV_BASE", pin2: "net.GND", pin3: "net.PD_PATH_OK" }} />
    <resistor name="R13" schSheetName="usb-pd-policy" schSectionName="usb-pd_U2" schX={2.3} schY={-3.45} pcbX={-16.0} pcbY={21.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_OK" }} pcbRotation={0} />
    <SN74LVC1G08DBVR name="U4" schSheetName="logic-selection" schSectionName="usb-pd_U4" schX={-6.6} schY={-2.2} pcbX={-12} pcbY={24}
      connections={{ pin1: "net.PD_PATH_OK", pin2: "net.POWER_PERMIT", pin3: "net.GND", pin4: "net.EFUSE_EN", pin5: "net.V3V3" }} />
    <resistor name="R14" schSheetName="logic-selection" schSectionName="usb-pd_U4" schX={-2.6} schY={0.8} pcbX={-12.0} pcbY={21.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.POWER_PERMIT", pin2: "net.GND" }} />
    <resistor name="R15" schSheetName="logic-selection" schSectionName="usb-pd_U4" schX={-0.6} schY={0.8} pcbX={-10.25} pcbY={27.25}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EFUSE_EN", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C10" schSheetName="logic-selection" schSectionName="usb-pd_U4" schX={-8} schY={3.8} pcbX={-16.0} pcbY={23.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U4 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* POWER */}
    <LMR36510ADDAR name="U5" schSheetName="logic-power" schSectionName="logic-power_U5" schX={-3.9} schY={-2.7} pcbX={-27} pcbY={8} layer="top"
      connections={{ pin1: "net.GND", pin2: "net.PD_VBUS", pin3: "net.PD_VBUS", pin4: "net.LOGIC_PG", pin5: "net.BUCK_FB", pin6: "net.BUCK_VCC", pin7: "net.BUCK_BOOT", pin8: "net.BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L1" schSheetName="logic-power" schSectionName="logic-power_U5" schX={0.1} schY={-2.7} pcbX={-19} pcbY={11.5} layer="top"
      connections={{ pin1: "net.BUCK_SW", pin2: "net.V3V3_PD" }} />
    <capacitor name="C11" schSheetName="logic-power" schSectionName="logic-power_U5" schX={-1.9} schY={1.3} pcbX={-25} pcbY={1.5} pcbRotation={270} layer="top"
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} />
    <capacitor name="C12" schSheetName="logic-power" schSectionName="logic-power_U5" schX={-0.9} schY={1.3} pcbX={-27.635} pcbY={2.2289} layer="top"
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U5 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} />
    <capacitor name="C13" schSheetName="logic-power" schSectionName="logic-power_U5" schX={0.3} schY={1.3}  pcbX={-25} pcbY={13} layer="top"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C14" schSheetName="logic-power" schSectionName="logic-power_U5" schX={-0.15} schY={-0.5} pcbX={-28.1} pcbY={13} layer="top"
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BUCK_BOOT", pin2: "net.BUCK_SW" }} pcbRotation={180} />
    <capacitor name="C15" schSheetName="logic-power" schSectionName="logic-power_U5" schX={4.1} schY={1.3} pcbX={-19} pcbY={16} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C16" schSheetName="logic-power" schSectionName="logic-power_U5" schX={5.3} schY={1.3} pcbX={-15.5} pcbY={16.25} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C17" schSheetName="logic-power" schSectionName="logic-power_U5" schX={6.5} schY={1.3} pcbX={-19} pcbY={18} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <resistor name="R16" schSheetName="logic-power" schSectionName="logic-power_U5" schX={4.7} schY={-1.3} pcbX={-21} pcbY={7.25} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.BUCK_FB" }} pcbRotation={180} />
    <resistor name="R17" schSheetName="logic-power" schSectionName="logic-power_U5" schX={-6.5} schY={-4.7} pcbX={-22.25} pcbY={2.75} layer="top"
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R18" schSheetName="logic-power" schSectionName="logic-power_U5" schX={1.6} schY={-2.3} pcbX={-17.75} pcbY={6} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_PG" }} />
    <LMR36510ADDAR name="U22" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={-6.5} schY={-4.45} pcbX={-11} pcbY={9}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin4: "net.MOTOR_LOGIC_PG", pin5: "net.MOTOR_BUCK_FB", pin6: "net.MOTOR_BUCK_VCC", pin7: "net.MOTOR_BUCK_BOOT", pin8: "net.MOTOR_BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L2" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={-2.5} schY={-4.45} pcbX={-3.5} pcbY={15}
      connections={{ pin1: "net.MOTOR_BUCK_SW", pin2: "net.V3V3_MOTOR" }} />
    <capacitor name="C62" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={-1.5} schY={-0.45} pcbX={-6.4} pcbY={0.5}
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C63" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={0} schY={-0.45} pcbX={-11.635} pcbY={3.4789}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U22 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C64" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={6.5} schY={1.05} pcbX={-9.5} pcbY={14.3}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.MOTOR_BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C65" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={-1.75} schY={-2.25} pcbX={-12.8} pcbY={14.4}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.MOTOR_BUCK_BOOT", pin2: "net.MOTOR_BUCK_SW" }} pcbRotation={180} />
    <capacitor name="C66" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={1.23} schY={-0.45} pcbX={-5} pcbY={10.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} pcbRotation={180} />
    <capacitor name="C67" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={2.47} schY={-0.45} pcbX={-6.0} pcbY={20.0} pcbRotation={180}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C68" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={3.55} schY={-0.45} pcbX={-2.0} pcbY={20.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <resistor name="R102" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={0.3} schY={-3.85} pcbX={-14} pcbY={2.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_BUCK_FB" }} />
    <resistor name="R103" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={5.3} schY={-2.65} pcbX={-12} pcbY={18} pcbRotation={180}
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.MOTOR_BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R104" schSheetName="logic-backup" schSectionName="logic-power_U22" schX={-1} schY={-4.05} pcbX={-2.5} pcbY={5.3}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_LOGIC_PG" }} pcbRotation={180} />
    <LM66100DCKR name="U23" schSheetName="logic-selection" schSectionName="logic-power_U23" schX={-6.6} schY={-5.2} pcbX={-22} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND", pin3: "net.V3V3_MOTOR", pin5: "net.LOGIC_OR_PRIORITY", pin6: "net.V3V3" }} />
    <LM66100DCKR name="U24" schSheetName="logic-selection" schSectionName="logic-power_U24" schX={5.4} schY={-5.2} pcbX={-10} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND", pin3: "net.LOGIC_OR_PRIORITY", pin5: "net.GND", pin6: "net.V3V3" }} />
    <resistor name="R111" schSheetName="logic-selection" schSectionName="logic-power_U23" schX={-2.6} schY={-3.2} pcbX={-27.5} pcbY={-2} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_OR_PRIORITY" }} />
    <capacitor name="C69" schSheetName="logic-selection" schSectionName="logic-power_U23" schX={-3.6} schY={-5.2} pcbX={-25} pcbY={-1.8}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U23 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C70" schSheetName="logic-selection" schSectionName="logic-power_U24" schX={8.4} schY={-5.2} pcbX={-10.65} pcbY={-4.0251}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U24 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C71" schSheetName="logic-selection" schSectionName="logic-power_U23" schX={-9.2} schY={3.8} pcbX={-25} pcbY={-4.5} layer="top"
      schRotation={-90}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={180} />
    <CSD19534Q5A name="Q4" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-11.25} schY={0.55} pcbX={-8} pcbY={33}
      connections={{ source: "net.PD_VBUS", gate: "net.BLOCK_GATE", drain: "net.EFUSE_IN" }} />
    <BSS123LT1G name="Q5" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-7.75} schY={4.05} pcbX={-8.35} pcbY={40.75}
      referenceOffset={{ x: -3, y: 1 }}
      connections={{ gate: "net.BLOCK_FAST_GATE", source: "net.PD_VBUS", drain: "net.BLOCK_GATE" }} />
    <TPS26630RGER name="U6" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-5.25} schY={0.55} schWidth={1.6} schHeight={2.8} pcbX={1} pcbY={25}
      schPinArrangement={{
        leftSide: ["pin1", "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin9", "pin10", "pin11", "pin12", "pin13", "pin8"],
        rightSide: ["pin18", "pin17", "pin16", "pin15", "pin14", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24", "pin25"],
      }}
      noConnect={["pin11", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24"]}
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.EFUSE_IN", pin3: "net.BLOCK_GATE", pin4: "net.BLOCK_FAST_GATE", pin5: "net.PD_VBUS", pin6: "net.UVLO_DIV", pin7: "net.OVP_DIV", pin8: "net.GND", pin9: "net.SLEW_CAP", pin10: "net.ILIM_SET", pin12: "net.EFUSE_EN", pin13: "net.IIN_MON", pin14: "net.EFUSE_FAULT_N", pin15: "net.PG_DIV", pin16: "net.MOTOR_PG", pin17: "net.VMOTOR", pin18: "net.VMOTOR", pin25: "net.GND" }} />
    <resistor name="R19" schSheetName="motor-power" schSectionName="motor-power_U6" schX={4.75} schY={4.55} pcbX={1.5} pcbY={21.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.UVLO_MID" }} />
    <resistor name="R20" schSheetName="motor-power" schSectionName="motor-power_U6" schX={7.75} schY={4.55} pcbX={3.0} pcbY={29.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.UVLO_MID", pin2: "net.UVLO_DIV" }} />
    <resistor name="R21" schSheetName="motor-power" schSectionName="motor-power_U6" schX={10.75} schY={4.55} pcbX={-3.5} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.UVLO_DIV", pin2: "net.GND" }} />
    <resistor name="R22" schSheetName="motor-power" schSectionName="motor-power_U6" schX={4.04} schY={2.75} pcbX={5.5} pcbY={25.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.OVP_TOP" }} />
    <resistor name="R23" schSheetName="motor-power" schSectionName="motor-power_U6" schX={7.75} schY={2.75} pcbX={-3.5} pcbY={23.0} pcbRotation={180}
      resistance="422k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C705777"] }}
      connections={{ pin1: "net.OVP_TOP", pin2: "net.OVP_DIV" }} />
    <resistor name="R24" schSheetName="motor-power" schSectionName="motor-power_U6" schX={10.75} schY={2.75} pcbX={-3.5} pcbY={27.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C95204"] }}
      connections={{ pin1: "net.OVP_DIV", pin2: "net.GND" }} />
    <resistor name="R25" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-11.25} schY={-2.45} pcbX={5.5} pcbY={23.0}
      schRotation={-90}
      resistance="4.99k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C7293210"] }}
      connections={{ pin1: "net.ILIM_SET", pin2: "net.GND" }} />
    <capacitor name="C18" schSheetName="motor-power" schSectionName="motor-power_U6" schX={7.75} schY={0.95} pcbX={5.5} pcbY={27.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.SLEW_CAP", pin2: "net.GND" }} />
    <resistor name="R26" schSheetName="motor-power" schSectionName="motor-power_U6" schX={10.75} schY={0.95} pcbX={5.0} pcbY={21.0}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.IIN_MON", pin2: "net.GND" }} />
    <resistor name="R27" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-1.25} schY={-0.85} pcbX={5.0} pcbY={18.5} pcbRotation={90}
      schRotation={-90}
      resistance="360k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23146"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.PG_DIV" }} />
    <resistor name="R28" schSheetName="motor-power" schSectionName="motor-power_U6" schX={-1.25} schY={-2.65} pcbX={-7.0} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PG_DIV", pin2: "net.GND" }} />
    <resistor name="R29" schSheetName="motor-power" schSectionName="motor-power_U6" schX={0.75} schY={-0.85} pcbX={2.25} pcbY={14.25} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.MOTOR_PG" }} />
    <resistor name="R30" schSheetName="motor-power" schSectionName="motor-power_U6" schX={0.75} schY={1.95} pcbX={11.5} pcbY={23.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.EFUSE_FAULT_N" }} />
    <capacitor name="C20" schSheetName="motor-power" schSectionName="motor-power_U6" schX={11.08} schY={-2.65} pcbX={-7.0} pcbY={23.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.GND" }} />
    <capacitor name="C21" schSheetName="motor-power" schSectionName="motor-power_U6" schX={3.25} schY={-6.45} pcbX={-1.25} pcbY={29.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U6 > .pin17"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C22" schSheetName="motor-power" schSectionName="motor-power_C22" schX={5.15} schY={-6.45} pcbX={20} pcbY={31.2} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C23" schSheetName="motor-power" schSectionName="motor-power_C23" schX={7.25} schY={-6.45} pcbX={29.6} pcbY={17.5} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <resistor name="R31" schSheetName="motor-power" schSectionName="motor-power_U6" schX={7.42} schY={-3.45} pcbX={-7.0} pcbY={27.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.VMON_MID" }} />
    <resistor name="R32" schSheetName="motor-power" schSectionName="motor-power_U6" schX={10.75} schY={-4.45} pcbX={11.5} pcbY={18.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMON_MID", pin2: "net.VMON_ADC" }} />
    <resistor name="R33" schSheetName="motor-power" schSectionName="motor-power_U6" schX={9.55} schY={-6.25} pcbX={13.5} pcbY={20.5} pcbRotation={180}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />
    <capacitor name="C24" schSheetName="motor-power" schSectionName="motor-power_U6" schX={11.25} schY={-7.95} pcbX={11.0} pcbY={20.5} pcbRotation={90}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />

    {/* MOTION */}
    <TMC5160A_TA_T name="U7" schSheetName="motion" schSectionName="motion_U7" schX={-6.25} schY={-5.2} pcbX={24} pcbY={-1}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.BOOT_B1", pin3: "net.TMC_12V", pin4: "net.TMC_12V", pin5: "net.TMC_5V", pin6: "net.GND", pin7: "net.GND", pin8: "net.SENSE_A", pin9: "net.SENSE_B", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin13: "net.TMC_CS_N", pin14: "net.SPI_SCK", pin15: "net.SPI_MOSI", pin16: "net.SPI_MISO", pin17: "net.GND", pin18: "net.GND", pin19: "net.GND", pin20: "net.V3V3", pin21: "net.SD_MODE", pin22: "net.V3V3", pin23: "net.GND", pin24: "net.GND", pin25: "net.GND", pin26: "net.TMC_DIAG0", pin27: "net.TMC_DIAG1", pin28: "net.DRV_EN_N", pin29: "net.TMC_VCC", pin30: "net.GND", pin31: "net.TMC_CPO", pin32: "net.TMC_CPI", pin33: "net.VMOTOR", pin34: "net.TMC_VCP", pin35: "net.BOOT_A2", pin36: "net.GH_A2_DRV", pin37: "net.MOTOR_A2", pin38: "net.GL_A2_DRV", pin39: "net.GL_A1_DRV", pin40: "net.MOTOR_A1", pin41: "net.GH_A1_DRV", pin42: "net.BOOT_A1", pin43: "net.BOOT_B2", pin44: "net.GH_B2_DRV", pin45: "net.MOTOR_B2", pin46: "net.GL_B2_DRV", pin47: "net.GL_B1_DRV", pin48: "net.MOTOR_B1", pin49: "net.GND" }} pcbRotation={180} />
    <capacitor name="C25" schSheetName="motion" schSectionName="motion_U7" schX={1.75} schY={2.8} pcbX={27.4} pcbY={6.5}
      schRotation={-90}
      pcbRotation={90}
      capacitance="4.7uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C1779"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin3"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C26" schSheetName="motion" schSectionName="motion_U7" schX={-7.25} schY={2.8} pcbX={23.8} pcbY={6.7} layer="top"
      schRotation={-90}
      pcbRotation={90}
      capacitance="4.7uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C19666"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin5"
      maxVoltageRating="16V"
      connections={{ pin1: "net.TMC_5V", pin2: "net.GND" }} />
    <resistor name="R34" schSheetName="motion" schSectionName="motion_U7" schX={-8.75} schY={2.8} pcbX={20.25} pcbY={-8}
      schRotation={-90}
      resistance="2.2" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22939"] }}
      connections={{ pin1: "net.TMC_5V", pin2: "net.TMC_VCC" }} />
    <capacitor name="C27" schSheetName="motion" schSectionName="motion_U7" schX={-1.25} schY={-5.4} pcbX={23.25} pcbY={-8.2}
      schRotation={-90}
      pcbRotation={270}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin29"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_VCC", pin2: "net.GND" }} />
    <capacitor name="C28" schSheetName="motion" schSectionName="motion_U7" schX={8.75} schY={2.8} pcbX={17.1} pcbY={-1.75} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin20"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C29" schSheetName="motion" schSectionName="motion_U7" schX={7.6} schY={1} pcbX={25.25} pcbY={-8.2}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin33"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C30" schSheetName="motion" schSectionName="motion_U7" schX={1.75} schY={-0.8} pcbX={25} pcbY={-11.5}
      capacitance="22nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C107137"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_CPO", pin2: "net.TMC_CPI" }} />
    <capacitor name="C31" schSheetName="motion" schSectionName="motion_U7" schX={4.75} schY={-0.8} pcbX={28.8} pcbY={-12} schRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_VCP", pin2: "net.VMOTOR" }} pcbRotation={90} />
    <capacitor name="C61" schSheetName="motion" schSectionName="motion_U7" schX={2.95} schY={2.8} pcbX={25.6} pcbY={6.7}
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin4"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <resistor name="R35" schSheetName="motion" schSectionName="motion_U7" schX={1.75} schY={-2.6} pcbX={6.5} pcbY={-5.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TMC_CS_N" }} />
    <resistor name="R36" schSheetName="motion" schSectionName="motion_U7" schX={4.75} schY={-2.6} pcbX={15.0} pcbY={13.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.SD_MODE", pin2: "net.GND" }} />
    <resistor name="R37" schSheetName="motion" schSectionName="motion_U7" schX={0.3} schY={-6.2} pcbX={11.5} pcbY={14.5} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DRV_EN_N" }} />
    <CSD19534Q5A name="Q6" schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={-9.25} schY={2.55} pcbX={13} pcbY={9}
      connections={{ source: "net.MOTOR_A1", gate: "net.GH_A1", drain: "net.VMOTOR" }} pcbRotation={90} />
    <CSD19534Q5A name="Q7" schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={3.75} schY={2.55} pcbX={13} pcbY={3}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A1", drain: "net.MOTOR_A1" }} pcbRotation={270} />
    <resistor name="R38" schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={-5.25} schY={5.05} pcbX={18.8} pcbY={10.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A1_DRV", pin2: "net.GH_A1" }} pcbRotation={180} />
    <resistor name="R39" schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={7.75} schY={5.05} pcbX={7.2} pcbY={1.1}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A1_DRV", pin2: "net.GL_A1" }} />
    <resistor name="R40" schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={-3.75} schY={5.05} pcbX={18.8} pcbY={13}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A1", pin2: "net.MOTOR_A1" }} />
    <resistor name="R41" schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={9.25} schY={5.05} pcbX={4.8} pcbY={-1}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A1", pin2: "net.SENSE_A" }} pcbRotation={270} />
    <capacitor name="C32" schSheetName="motion" schSectionName="motion_U7" schX={1.75} schY={-4.4} pcbX={30.45} pcbY={-2}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BOOT_A1", pin2: "net.MOTOR_A1" }} pcbRotation={270} />
    <CSD19534Q5A name="Q8" schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={-9.25} schY={-4.45} pcbX={13} pcbY={-13}
      connections={{ source: "net.MOTOR_A2", gate: "net.GH_A2", drain: "net.VMOTOR" }} pcbRotation={270} />
    <CSD19534Q5A name="Q9" schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={3.75} schY={-4.45} pcbX={13} pcbY={-7}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A2", drain: "net.MOTOR_A2" }} pcbRotation={90} />
    <resistor name="R42" schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={-5.25} schY={-1.95} pcbX={7.2} pcbY={-14.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A2_DRV", pin2: "net.GH_A2" }} />
    <resistor name="R43" schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={7.75} schY={-1.95} pcbX={17.8} pcbY={-7.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A2_DRV", pin2: "net.GL_A2" }} pcbRotation={90} />
    <resistor name="R44" schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={-3.75} schY={-1.95} pcbX={7.2} pcbY={-17}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A2", pin2: "net.MOTOR_A2" }} pcbRotation={180} />
    <resistor name="R45" schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={9.25} schY={-1.95} pcbX={17.8} pcbY={-11} pcbRotation={270}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A2", pin2: "net.SENSE_A" }} />
    <capacitor name="C33" schSheetName="motion" schSectionName="motion_U7" schX={4.75} schY={-4.4} pcbX={27.5} pcbY={-8.2}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BOOT_A2", pin2: "net.MOTOR_A2" }} pcbRotation={270} />
    <CSD19534Q5A name="Q10" schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={-9.25} schY={2.55} pcbX={35.6} pcbY={6}
      connections={{ source: "net.MOTOR_B1", gate: "net.GH_B1", drain: "net.VMOTOR" }} pcbRotation={90} />
    <CSD19534Q5A name="Q11" schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={3.75} schY={2.55} pcbX={35.6} pcbY={-1}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B1", drain: "net.MOTOR_B1" }} pcbRotation={270} />
    <resistor name="R46" schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={-5.25} schY={5.05} pcbX={41.2} pcbY={7.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.GH_B1" }} pcbRotation={180} />
    <resistor name="R47" schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={7.75} schY={5.05} pcbX={30.1} pcbY={-5.3}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B1_DRV", pin2: "net.GL_B1" }} pcbRotation={90} />
    <resistor name="R48" schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={-3.75} schY={5.05} pcbX={41.2} pcbY={5.7}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B1", pin2: "net.MOTOR_B1" }} />
    <resistor name="R49" schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={9.25} schY={5.05} pcbX={30.1} pcbY={-8.5}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B1", pin2: "net.SENSE_B" }} pcbRotation={90} />
    <capacitor name="C34" schSheetName="motion" schSectionName="motion_U7" schX={7.75} schY={-4.4} pcbX={29.5} pcbY={6.3}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BOOT_B1", pin2: "net.MOTOR_B1" }} pcbRotation={90} />
    <CSD19534Q5A name="Q12" schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={-9.25} schY={-4.45} pcbX={35.6} pcbY={-17.2}
      connections={{ source: "net.MOTOR_B2", gate: "net.GH_B2", drain: "net.VMOTOR" }} pcbRotation={270} />
    <CSD19534Q5A name="Q13" schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={3.75} schY={-4.45} pcbX={35.6} pcbY={-11.4}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B2", drain: "net.MOTOR_B2" }} pcbRotation={90} />
    <resistor name="R50" schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={-5.25} schY={-1.95} pcbX={30} pcbY={-20.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B2_DRV", pin2: "net.GH_B2" }} />
    <resistor name="R51" schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={7.75} schY={-1.95} pcbX={41.2} pcbY={-10.1}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B2_DRV", pin2: "net.GL_B2" }} pcbRotation={180} />
    <resistor name="R52" schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={-3.75} schY={-1.95} pcbX={30} pcbY={-18.3}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B2", pin2: "net.MOTOR_B2" }} />
    <resistor name="R53" schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={9.25} schY={-1.95} pcbX={41.2} pcbY={-12.3}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B2", pin2: "net.SENSE_B" }} />
    <capacitor name="C35" schSheetName="motion" schSectionName="motion_U7" schX={2.21} schY={-6.2} pcbX={30.45} pcbY={1.6} schOrientation="vertical"
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BOOT_B2", pin2: "net.MOTOR_B2" }} pcbRotation={90} />
    <HoLLR2512_3W_33mR_1_ name="R109" schSheetName="bridge-a" schSectionName="bridge-a_R109" schX={-2.75} schY={-8.45} schRotation={-90} pcbX={11.1} pcbY={-2}
      connections={{ pin1: "net.SENSE_A", pin2: "net.GND" }} pcbRotation={180} />
    <HoLLR2512_3W_33mR_1_ name="R110" schSheetName="bridge-b" schSectionName="bridge-b_R110" schX={-2.75} schY={-8.45} schRotation={-90} pcbX={35.6} pcbY={-6.5}
      connections={{ pin1: "net.SENSE_B", pin2: "net.GND" }} pcbRotation={180} />
    <B4P_VH_LF__SN_ name="J2" schSheetName="bridge-a" schSectionName="bridge-a_J2" schX={5.75} schY={-8.45} pcbX={11.8} pcbY={-37.6}
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.MOTOR_A2", pin3: "net.MOTOR_B1_OUT", pin4: "net.MOTOR_B2" }} />
    <SN74LVC1G08DBVR name="U10" schSheetName="motion-enable" schSectionName="motion_U10" schX={-7.5} schY={-1.7} pcbX={-4} pcbY={-9}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.MOTOR_PG", pin3: "net.GND", pin4: "net.RUN_PG", pin5: "net.V3V3" }} />
    <SN74LVC1G08DBVR name="U11" schSheetName="motion-enable" schSectionName="motion_U11" schX={5.5} schY={-1.7} pcbX={-4} pcbY={-14}
      connections={{ pin1: "net.RUN_PG", pin2: "net.VMOTOR_OK", pin3: "net.GND", pin4: "net.RUN_WINDOW_OK", pin5: "net.V3V3" }} />
    <capacitor name="C38" schSheetName="motion-enable" schSectionName="motion_U10" schX={0.4} schY={3.7} pcbX={-8.0} pcbY={-10.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U10 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C39" schSheetName="motion-enable" schSectionName="motion_U11" schX={1.6} schY={3.7} pcbX={-8.0} pcbY={-15.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U11 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R54" schSheetName="motion-enable" schSectionName="motion_U10" schX={-0.5} schY={-1.7} pcbX={0.0} pcbY={-10.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.GND" }} />
    <resistor name="R55" schSheetName="motion-enable" schSectionName="motion_enable" schX={1.5} schY={0.4} pcbX={-4.0} pcbY={-17.0}
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.RUN_SAFE", pin2: "net.RUN_BASE" }} />
    <resistor name="R56" schSheetName="motion-enable" schSectionName="motion_enable" schX={-2.5} schY={0.4} pcbX={0.0} pcbY={-14.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.RUN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q14" schSheetName="motion-enable" schSectionName="motion_enable" schX={-4.5} schY={-2.7} pcbX={1.0} pcbY={-17.0} pcbRotation={180}
      connections={{ base: "net.RUN_BASE", emitter: "net.GND", collector: "net.DRV_EN_N" }} />

    {/* Regulated external gate supply: ADI TMC5160A datasheet Figure 3.2. */}
    <LMR36510ADDAR name="U34" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={-3.5} schY={-1.2} pcbX={-24.0} pcbY={30.1} pcbRotation={0} noConnect={["pin4"]}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin5: "net.DRIVER_BUCK_FB", pin6: "net.DRIVER_BUCK_VCC", pin7: "net.DRIVER_BUCK_BOOT", pin8: "net.DRIVER_BUCK_SW", pin9: "net.GND" }} />
    <SRP7050TA_470M name="L3" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={1.5} schY={-1.2} pcbX={-15.6} pcbY={37.75} pcbRotation={0}
      connections={{ pin1: "net.DRIVER_BUCK_SW", pin2: "net.TMC_12V" }} />
    <capacitor name="C86" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={-6.5} schY={2.8} schRotation={-90} pcbX={-18.75} pcbY={27.5} pcbRotation={0}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }} maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C87" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={-5} schY={2.8} schRotation={-90} pcbX={-27.75} pcbY={28.5} pcbRotation={90}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }} maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C88" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={-3.5} schY={2.8} schRotation={-90} pcbX={-20.45} pcbY={32.13} pcbRotation={270}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.DRIVER_BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C89" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={-0.5} schY={0.8} schRotation={-90} pcbX={-27.8} pcbY={33.7} pcbRotation={270}
      pcbSx={{ "& silkscreentext": { pcbX: -2.3, pcbY: 0 } }}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="50V"
      connections={{ pin1: "net.DRIVER_BUCK_BOOT", pin2: "net.DRIVER_BUCK_SW" }} />
    <capacitor name="C90" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={3.5} schY={2.8} schRotation={-90} pcbX={-9.4} pcbY={38} pcbRotation={0}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C91" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={5} schY={2.8} schRotation={-90} pcbX={-5.3} pcbY={38.7} pcbRotation={90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C92" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={6.5} schY={2.8} schRotation={-90} pcbX={-3.6} pcbY={41.75} pcbRotation={0}
      pcbSx={{ "& silkscreentext": { pcbX: 0, pcbY: -1.6 } }}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <resistor name="R121" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={0} schY={-3.2} schRotation={-90} pcbX={-18.975} pcbY={32.1}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.TMC_12V", pin2: "net.DRIVER_BUCK_FB" }} pcbRotation={90} />
    <resistor name="R122" layer="top" schSheetName="driver-power" schSectionName="driver-power_U34" schX={0} schY={-6.2} schRotation={-90} pcbX={-19.15} pcbY={29.75}
      resistance="9.09k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C861611"] }}
      connections={{ pin1: "net.DRIVER_BUCK_FB", pin2: "net.GND" }} pcbRotation={0} />

    {/* BRAKE */}
    <REF3425IDBVR name="U12" schSheetName="brake" schSectionName="brake_U12" schX={-7} schY={-3.7} schWidth={2.24} pcbX={2.75} pcbY={-24.5}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.V3V3", pin4: "net.V3V3", pin5: "net.VREF_2V5", pin6: "net.VREF_2V5" }} pcbRotation={180} />
    <capacitor name="C93" layer="top" schSheetName="brake" schSectionName="brake_U12" schX={-2.3} schY={0} schRotation={-90} pcbX={3.0} pcbY={-27.0}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C94" layer="top" schSheetName="brake" schSectionName="brake_U12" schX={-1.1} schY={0} schRotation={-90} pcbX={5.75} pcbY={-23.25}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="25V"
      connections={{ pin1: "net.VREF_2V5", pin2: "net.GND" }} pcbRotation={90} />
    <TLV3201AIDBVR name="U13" schSheetName="brake" schSectionName="brake_U13" schX={2.5} schY={-3.7} pcbX={8.75} pcbY={-22}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.GND", pin3: "net.BRAKE_SENSE", pin4: "net.VREF_2V5", pin5: "net.V3V3" }} />
    <resistor name="R60" schSheetName="brake" schSectionName="brake_sense" schX={7.17} schY={0.3} pcbX={7.5} pcbY={-19.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C326731"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_MID" }} />
    <resistor name="R61" schSheetName="brake" schSectionName="brake_sense" schX={9.33} schY={0.3} pcbX={13.0} pcbY={-17.5}
      resistance="16.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C728583"] }}
      connections={{ pin1: "net.BRAKE_MID", pin2: "net.BRAKE_SENSE" }} />
    <resistor name="R62" schSheetName="brake" schSectionName="brake_sense" schX={10.5} schY={0.3} pcbX={11.75} pcbY={-20.5} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C95204"] }}
      connections={{ pin1: "net.BRAKE_SENSE", pin2: "net.GND" }} />
    <resistor name="R63" schSheetName="brake" schSectionName="brake_sense" schX={7.5} schY={-1.5} pcbX={10.0} pcbY={-17.5}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C326730"] }}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.BRAKE_SENSE" }} pcbRotation={90} />
    <capacitor name="C40" schSheetName="brake" schSectionName="brake_U13"  schX={-3.5} schY={0} pcbX={5.0} pcbY={-21.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U13 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <TLV3201AIDBVR name="U14" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-11.6} schY={0.3} pcbX={3} pcbY={-30}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND", pin3: "net.VREF_2V5", pin4: "net.MOTOR_OVP_SENSE", pin5: "net.V3V3" }} />
    <resistor name="R64" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-6.92} schY={4.3} pcbX={-1.0} pcbY={-28.0}
      schRotation={-90}
      resistance="430k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C861400"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.MOTOR_OVP_SENSE" }} />
    <resistor name="R65" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-3.6} schY={4.3} pcbX={4.55} pcbY={-32.6}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C723637"] }}
      connections={{ pin1: "net.MOTOR_OVP_SENSE", pin2: "net.MOTOR_OVP_LOW" }} />
    <resistor name="R66" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-0.6} schY={4.3} pcbX={-12.5} pcbY={-34.25} pcbRotation={180}
      schRotation={-90}
      resistance="1.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C136970"] }}
      connections={{ pin1: "net.MOTOR_OVP_LOW", pin2: "net.GND" }} />
    <resistor name="R67" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-6.27} schY={2.5} pcbX={-1.0} pcbY={-26.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND" }} />
    <capacitor name="C41" schSheetName="brake-ovp" schSectionName="brake_U14" schX={-8.6} schY={1.3} pcbX={1.5} pcbY={-33.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U14 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <UCC27511DBVR name="U15" schSheetName="brake-ovp" schSectionName="brake_U15" schX={5.4} schY={-3.7} pcbX={10} pcbY={26}
      connections={{ pin1: "net.TMC_12V", pin2: "net.BRAKE_DRIVE", pin3: "net.BRAKE_DRIVE", pin4: "net.GND", pin5: "net.GND", pin6: "net.BRAKE_ON" }} />
    <capacitor name="C42" schSheetName="brake-ovp" schSectionName="brake_U15" schX={10.4} schY={0.3} pcbX={12.75} pcbY={35.5}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C43" schSheetName="brake-ovp" schSectionName="brake_U15" schX={11.6} schY={0.3} pcbX={8.9} pcbY={22}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U15 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <resistor name="R68" schSheetName="brake-ovp" schSectionName="brake_U15" schX={2.4} schY={-7.2} pcbX={12.55} pcbY={29}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.BRAKE_DRIVE", pin2: "net.BRAKE_GATE" }} pcbRotation={90} />
    <resistor name="R69" schSheetName="brake-ovp" schSectionName="brake_U15" schX={6.9} schY={-7.2} pcbX={12.55} pcbY={32.2}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.BRAKE_GATE", pin2: "net.GND" }} pcbRotation={90} />
    <CSD19534Q5A name="Q16" schSheetName="brake-ovp" schSectionName="brake_Q16" schX={0.4} schY={-5.7} pcbX={8} pcbY={33}
      connections={{ source: "net.GND", gate: "net.BRAKE_GATE", drain: "net.BRAKE_RETURN" }} />
    <B2P_VH_LF__SN_ name="J3" schSheetName="brake-ovp" schSectionName="brake_J3" schX={10} schY={-6.7} pcbX={0.0} pcbY={36.5} schPinArrangement={{ topSide: ["pin1"], bottomSide: ["pin2"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN" }} />

    <SS10100_SMBF name="D20" layer="top" schSheetName="brake-feedback" schX={-7} schY={-3} schRotation={90} pcbX={15} pcbY={40} pcbRotation={180}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN" }} />
    {/* Brake continuity preflight. Low impedance also rejects SS10100 hot reverse leakage. */}
    <resistor name="R134" layer="top" schSheetName="brake-feedback" schX={-7} schY={2} pcbX={-3.4} pcbY={-37.5} pcbRotation={180}
      resistance="4.7k" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C6675858"] }}
      connections={{ pin1: "net.BRAKE_RETURN", pin2: "net.BRAKE_FB_MID" }} />
    <resistor name="R135" layer="top" schSheetName="brake-feedback" schX={-2} schY={2} pcbX={-3.4} pcbY={-40.5}
      resistance="4.7k" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C6675858"] }}
      connections={{ pin1: "net.BRAKE_FB_MID", pin2: "net.BRAKE_FB" }} />
    <resistor name="R136" layer="top" schSheetName="brake-feedback" schX={3} schY={2} schRotation={-90} pcbX={1} pcbY={-40.5} pcbRotation={90}
      resistance="510" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C7468460"] }}
      connections={{ pin1: "net.BRAKE_FB", pin2: "net.GND" }} />
    <capacitor name="C98" layer="top" schSheetName="brake-feedback" schX={6} schY={2} schRotation={-90} pcbX={2.5} pcbY={-37.5} pcbRotation={90}
      capacitance="10nF" footprint="0603" maxVoltageRating="50V" supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      connections={{ pin1: "net.BRAKE_FB", pin2: "net.GND" }} />

    {/* MCU */}
    <STM32G0B1 name="U16" schSheetName="mcu" schSectionName="mcu_U16" schX={-2.5} schY={-1.3} pcbX={-20} pcbY={-12}
      noConnect={["pin2", "pin3", "pin13", "pin14", "pin22", "pin25", "pin26", "pin27", "pin29", "pin31", "pin32", "pin38", "pin39", "pin40", "pin41"]}
      connections={{ pin1: "net.STATUS_GPIO", pin4: "net.V3V3_MCU", pin5: "net.V3V3_MCU", pin6: "net.V3V3_MCU", pin7: "net.GND", pin8: "net.OSC_IN", pin9: "net.OSC_OUT", pin10: "net.NRST", pin11: "net.PHASE_A_ADC", pin12: "net.PHASE_B_ADC", pin15: "net.TMC_CS_N", pin16: "net.SPI_SCK", pin17: "net.SPI_MISO", pin18: "net.SPI_MOSI", pin19: "net.USB_VBUS_SENSE", pin20: "net.BOARD_POWER_SENSE", pin21: "net.EFUSE_FAULT_N", pin23: "net.ENC_CS_N", pin24: "net.FLASH_CS_N", pin28: "net.SD_MODE", pin30: "net.USER_BUTTON_N", pin33: "net.USB_DM", pin34: "net.USB_DP", pin35: "net.SWDIO", pin36: "net.SWCLK", pin37: "net.MCU_RUN", pin42: "net.TMC_DIAG0", pin43: "net.MOTOR_PG", pin44: "net.POWER_PERMIT", pin45: "net.PD_SCL", pin46: "net.PD_SDA", pin47: "net.TMC_DIAG1", pin48: "net.VMOTOR_OK" }} />
    <capacitor name="C44" schSheetName="mcu" schSectionName="mcu_U16" schX={2.5} schY={4.7} pcbX={-20.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin6"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C45" schSheetName="mcu" schSectionName="mcu_U16" schX={3.7} schY={4.7} pcbX={-18.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C46" schSheetName="mcu" schSectionName="mcu_U16" schX={4.9} schY={4.7} pcbX={-22.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin4"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C47" schSheetName="mcu" schSectionName="mcu_U16" schX={6.1} schY={4.7} pcbX={-28.0} pcbY={-15.75} pcbRotation={180}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <resistor name="R70" schSheetName="mcu" schSectionName="mcu_U16" schX={-7} schY={2.7} pcbX={-12.5} pcbY={-12.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.NRST" }} />
    <capacitor name="C48" schSheetName="mcu" schSectionName="mcu_U16" schX={-7} schY={0.7} pcbX={-12.5} pcbY={-14.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    <resistor name="R71" schSheetName="mcu" schSectionName="mcu_U16" schX={2.34} schY={-1.3} pcbX={-27.5} pcbY={-11.5}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.USB_DP" }} />
    <resistor name="R72" schSheetName="mcu" schSectionName="mcu_U16" schX={5.89} schY={-1.3} pcbX={-27.5} pcbY={-13.75}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DM_CONN", pin2: "net.USB_DM" }} />
    <X322516MLB4SI name="Y1" schSheetName="mcu" schSectionName="mcu_Y1" schX={-2.5} schY={4.2} pcbX={-11} pcbY={-18}
      loadCapacitance="9pF"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND", pin3: "net.OSC_OUT", pin4: "net.GND" }} />
    <capacitor name="C49" schSheetName="mcu" schSectionName="mcu_Y1" schX={-5} schY={3.2} pcbX={-15.0} pcbY={-19.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND" }} />
    <capacitor name="C50" schSheetName="mcu" schSectionName="mcu_Y1" schX={0} schY={3.2} pcbX={-8.0} pcbY={-21.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_OUT", pin2: "net.GND" }} />
    <TS_1088_AR02016 name="SW1" schSheetName="mcu" schSectionName="mcu_SW1" schX={2.5} schY={-4.3} pcbX={-25.0} pcbY={-40} layer="top" schRotation={-90}
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    <TS_1088_AR02016 name="SW2" schSheetName="user-control" schSectionName="user_start_stop" schX={0} schY={0} pcbX={-10.5} pcbY={-40} layer="top" schRotation={-90}
      connections={{ pin1: "net.USER_BUTTON_N", pin2: "net.GND" }} />
    <resistor name="R133" schSheetName="user-control" schSectionName="user_start_stop" schX={0} schY={3} pcbX={-16} pcbY={-40} layer="top" schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.USER_BUTTON_N" }} />

    {/* Top-side service pads replace a bulky debug connector. */}
    <testpoint doNotPlace name="TP_SWD_3V3" schSheetName="mcu" schSectionName="mcu_U16" schX={-10.5} schY={-6.1} pcbX={-22} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3_MCU" }} />
    <testpoint doNotPlace name="TP_SWDIO" schSheetName="mcu" schSectionName="mcu_U16" schX={-4.5} schY={-6.1} pcbX={-19.5} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWDIO" }} />
    <testpoint doNotPlace name="TP_SWD_GND" schSheetName="mcu" schSectionName="mcu_U16" schX={1.5} schY={-6.1} pcbX={-17} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />
    <testpoint doNotPlace name="TP_SWCLK" schSheetName="mcu" schSectionName="mcu_U16" schX={-10.5} schY={-8.1} pcbX={-21.25} pcbY={-35.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWCLK" }} />
    <testpoint doNotPlace name="TP_NRST" schSheetName="mcu" schSectionName="mcu_U16" schX={-4.5} schY={-8.1} pcbX={-19.25} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.NRST" }} />
    <testpoint doNotPlace name="TP_STATUS" schSheetName="mcu" schSectionName="mcu_U16" schX={1.5} schY={-8.1} pcbX={-17} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.STATUS_GPIO" }} />
    <W25Q32JVSSIQ name="U17" schSheetName="mcu" schSectionName="mcu_U17" schX={10.5} schY={-3.8} schWidth={1.74} schHeight={2.4} pcbX={-13} pcbY={-26}
      schPinArrangement={{ leftSide: ["pin1", "pin2"], rightSide: ["pin5", "pin6"], topSide: ["pin3", "pin7", "pin8"], bottomSide: ["pin4"] }}
      connections={{ pin1: "net.FLASH_CS_N", pin2: "net.SPI_MISO", pin3: "net.V3V3", pin4: "net.GND", pin5: "net.SPI_MOSI", pin6: "net.SPI_SCK", pin7: "net.V3V3", pin8: "net.V3V3" }} />
    <resistor name="R73" schSheetName="mcu" schSectionName="mcu_U17" schX={7.7} schY={-2.3} pcbX={-8.0} pcbY={-27.75}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.FLASH_CS_N" }} />
    <capacitor name="C51" schSheetName="mcu" schSectionName="mcu_U17" schX={7.3} schY={4.7} pcbX={-17.25} pcbY={-23.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U17 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* ENCODER */}
    <AS5047P_ATSM name="U18" kicadFootprintMetadata={{ footprintName: "AS5047P-ATSM" }} schSheetName="encoder" schSectionName="encoder_U18" schX={-11} schY={-1.8} pcbX={0} pcbY={0} pcbRotation={180} layer="bottom" doNotPlace
      noConnect={["pin8", "pin9", "pin10"]}
      connections={{ pin1: "net.ENC_CS_N", pin2: "net.SPI_SCK", pin3: "net.SPI_MISO", pin4: "net.SPI_MOSI", pin5: "net.GND", pin6: "net.ENC_B", pin7: "net.ENC_A", pin11: "net.V3V3", pin12: "net.V3V3", pin13: "net.GND", pin14: "net.ENC_I" }} />
    <resistor name="R74" schSheetName="encoder" schSectionName="encoder_U18" schX={-6} schY={2.2} pcbX={0} pcbY={6} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.ENC_CS_N" }} pcbRotation={90} />
    <capacitor name="C52" kicadFootprintMetadata={{ footprintName: "capacitor_cap0603" }} schSheetName="encoder" schSectionName="encoder_U18" schX={-3} schY={2.2} pcbX={0.0} pcbY={-5.55} layer="bottom" doNotPlace
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U18 > .pin11"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C53" kicadFootprintMetadata={{ footprintName: "capacitor_cap0603" }} schSheetName="encoder" schSectionName="encoder_U18" schX={-1.8} schY={2.2} pcbX={3.3} pcbY={-5.3} pcbRotation={180} layer="bottom" doNotPlace
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    {/* Encoder observation remains available without a second field connector. */}
    <testpoint doNotPlace name="TP_ENC_3V3" schSheetName="encoder" schSectionName="encoder_U18" schX={1} schY={-3.8} pcbX={-10} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3" }} />
    <testpoint doNotPlace name="TP_ENC_A" schSheetName="encoder" schSectionName="encoder_U18" schX={6} schY={-3.8} pcbX={-7.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_A" }} />
    <testpoint doNotPlace name="TP_ENC_B" schSheetName="encoder" schSectionName="encoder_U18" schX={11} schY={-3.8} pcbX={-5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_B" }} />
    <testpoint doNotPlace name="TP_ENC_I" schSheetName="encoder" schSectionName="encoder_U18" schX={3.5} schY={-5.6} pcbX={-2.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_I" }} />
    <testpoint doNotPlace name="TP_ENC_GND" schSheetName="encoder" schSectionName="encoder_U18" schX={8.5} schY={-5.6} pcbX={0} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />

    {/* INTERFACES */}

    <USB4105_GF_A name="J10" schSheetName="usb-data" schSectionName="usb-data_J10" schX={-6.5} schY={1.3} pcbX={-36} pcbY={1} pcbRotation={270}
      schWidth={1.4}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin13", "pin12", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin10", "pin16"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.USB_DATA_VBUS", pin8: "net.USB_DATA_VBUS", pin17: "net.USB_DATA_VBUS", pin18: "net.USB_DATA_VBUS", pin9: "net.DATA_CC2", pin15: "net.DATA_CC1", pin11: "net.USB_DP_CONN", pin13: "net.USB_DP_CONN", pin12: "net.USB_DM_CONN", pin14: "net.USB_DM_CONN" }} />
    <resistor name="R105" schSheetName="usb-data" schSectionName="usb-data_J10" schX={-6.5} schY={-4.7} schRotation={-90} pcbX={-31.5} pcbY={5} pcbRotation={180}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC1", pin2: "net.GND" }} />
    <resistor name="R106" schSheetName="usb-data" schSectionName="usb-data_J10" schX={-3.5} schY={-4.7} schRotation={-90} pcbX={-30} pcbY={-4}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC2", pin2: "net.GND" }} />
    <USBLC6_4SC6 name="D15" schSheetName="usb-data" schSectionName="usb-data_J10" schX={-0.5} schY={-4.7} pcbX={-30.5} pcbY={1.2}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.GND", pin3: "net.USB_DM_CONN", pin4: "net.DATA_CC1", pin5: "net.USB_DATA_VBUS", pin6: "net.DATA_CC2" }} />
    <capacitor name="C73" schSheetName="usb-data" schSectionName="usb-data_J10" schX={3.5} schY={-4.7} schRotation={-90} pcbX={-30.5} pcbY={-1.75}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="50V" connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND" }} />

    <trace name="BYPASS_C87" from=".U34 > .pin2" to=".C87 > .pin1" pcbPathRelativeTo=".U34 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-1.675,"y":-3.9},{"x":-2.125,"y":-3.9},{"x":-3.75,"y":-2.5125}]} />
    <trace name="BYPASS_C88" from=".U34 > .pin6" to=".C88 > .pin1" pcbPathRelativeTo=".U34 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.84607},{"x":1.55,"y":3.825},{"x":1.85,"y":3.9},{"x":2.149999,"y":3.9},{"x":3.235,"y":2.97607},{"x":3.55,"y":2.855}]} />
    <trace name="BYPASS_C93" from=".U12 > .pin4" to=".C93 > .pin1" pcbPathRelativeTo=".U12 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.35001,"y":0.94996},{"x":-0.97504,"y":0.94996},{"x":0.575,"y":2.5}]} />
    <trace name="BYPASS_C94" from=".U12 > .pin6" to=".C94 > .pin1" pcbPathRelativeTo=".U12 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.35001,"y":-0.94996},{"x":-1.87504,"y":-0.425},{"x":-3.0,"y":-0.425}]} />
    {/* Local bypasses: <=3mm pad-to-pad placement, <=5mm routed path. */}
    <trace name="BYPASS_C2" from=".U1 > .pin10" to=".C2 > .pin1" pcbPathRelativeTo=".U1 > .pin10" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.499997,"y":0.799719},{"x":1.9,"y":0.799719},{"x":1.9,"y":2.2},{"x":1.3,"y":2.2},{"x":1.3,"y":2.9},{"x":0.6,"y":2.9997},{"x":0.5,"y":3.425}]} />
    <trace name="BYPASS_C6" from=".U2 > .pin32" to=".C6 > .pin1" pcbPathRelativeTo=".U2 > .pin32" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-2.050034,"y":-1.400048},{"x":-2.650034,"y":-1.675048},{"x":-3.300034,"y":-1.950048},{"x":-3.400034,"y":-2.000048},{"x":-3.500034,"y":-2.100048},{"x":-3.5,"y":-2.1},{"x":-3.65,"y":-2.1},{"x":-4.0,"y":-2.275}]} />
    <trace name="BYPASS_C7" from=".U2 > .pin1" to=".C7 > .pin1" pcbPathRelativeTo=".U2 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.400048,"y":-2.050034},{"x":-1.700048,"y":-2.250034},{"x":-1.750048,"y":-2.700034},{"x":-1.800048,"y":-2.800034},{"x":-1.800048,"y":-2.850034},{"x":-1.85,"y":-3.05},{"x":-2.0,"y":-3.425}]} />
    <trace name="BYPASS_C8" from=".U2 > .pin4" to=".C8 > .pin1" pcbPathRelativeTo=".U2 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.200152,"y":-2.050034},{"x":-0.2002,"y":-2.1},{"x":-0.012699,"y":-3.35},{"x":0.0,"y":-3.425}]} />
    <trace name="BYPASS_C9" from=".U3 > .pin8" to=".C9 > .pin1" pcbPathRelativeTo=".U3 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":2.599944},{"x":-2.055,"y":2.599944},{"x":-3.325056,"y":2.599944},{"x":-3.75,"y":1.675}]} />
    <trace name="BYPASS_C10" from=".U4 > .pin5" to=".C10 > .pin1" pcbPathRelativeTo=".U4 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C12" from=".U5 > .pin2" to=".C12 > .pin1" pcbPathRelativeTo=".U5 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-0.635,"y":-4.9461}]} />
    <trace name="BYPASS_C21" from=".U6 > .pin17" to=".C21 > .pin1" pcbPathRelativeTo=".U6 > .pin17" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":1.941957},{"x":-0.750062,"y":4.441957},{"x":-0.7875,"y":4.5}]} />
    <trace name="BYPASS_C25" from=".U7 > .pin3" to=".C25 > .pin1" pcbPathRelativeTo=".U7 > .pin3" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.75006,"y":-4.19989},{"x":-1.75006,"y":-4.74989},{"x":-1.85006,"y":-4.84989},{"x":-1.85006,"y":-5.19989},{"x":-3.10006,"y":-6.44989},{"x":-3.15006,"y":-6.44989},{"x":-3.20006,"y":-6.49989},{"x":-3.25006,"y":-6.49989},{"x":-3.30006,"y":-6.54989},{"x":-3.35006,"y":-6.54989},{"x":-3.4,"y":-6.5875}]} />
    <trace name="BYPASS_C26" from=".U7 > .pin5" to=".C26 > .pin1" pcbPathRelativeTo=".U7 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":-4.19989},{"x":-0.750062,"y":-4.79989},{"x":-0.700062,"y":-4.84989},{"x":-0.700062,"y":-4.94989},{"x":-0.650062,"y":-4.99989},{"x":-0.650062,"y":-5.19989},{"x":-0.450062,"y":-5.39989},{"x":-0.450062,"y":-5.49989},{"x":-0.400062,"y":-5.54989},{"x":-0.400062,"y":-5.59989},{"x":-0.350062,"y":-5.64989},{"x":-0.350062,"y":-5.69989},{"x":-0.100062,"y":-5.94989},{"x":-0.100062,"y":-6.24989},{"x":-0.050062,"y":-6.29989},{"x":-0.050062,"y":-6.34989},{"x":-6.2e-05,"y":-6.39989},{"x":-6.2e-05,"y":-6.44989},{"x":0.049938,"y":-6.49989},{"x":0.049938,"y":-6.59989},{"x":0.099938,"y":-6.64989},{"x":0.099938,"y":-6.69989},{"x":0.149938,"y":-6.74989},{"x":0.149938,"y":-6.79989},{"x":0.199938,"y":-6.84989},{"x":0.2,"y":-6.875}]} />
    <trace name="BYPASS_C27" from=".U7 > .pin29" to=".C27 > .pin1" pcbPathRelativeTo=".U7 > .pin29" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.750062,"y":4.19989},{"x":0.750062,"y":6.24989},{"x":0.75,"y":6.2875}]} />
    <trace name="BYPASS_C28" from=".U7 > .pin20" to=".C28 > .pin1" pcbPathRelativeTo=".U7 > .pin20" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":4.19989,"y":0.750062},{"x":6.04989,"y":0.750062},{"x":6.075,"y":0.75}]} />
    <trace name="BYPASS_C29" from=".U7 > .pin33" to=".C29 > .pin1" pcbPathRelativeTo=".U7 > .pin33" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.249934,"y":4.19989},{"x":-1.249934,"y":6.34989},{"x":-1.25,"y":6.375}]} />
    <trace name="BYPASS_C61" from=".U7 > .pin4" to=".C61 > .pin1" pcbPathRelativeTo=".U7 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.249934,"y":-4.19989},{"x":-1.249934,"y":-5.04989},{"x":-1.349934,"y":-5.14989},{"x":-1.349934,"y":-6.09989},{"x":-1.399934,"y":-6.14989},{"x":-1.399934,"y":-6.44989},{"x":-1.449934,"y":-6.49989},{"x":-1.449934,"y":-6.59989},{"x":-1.499934,"y":-6.64989},{"x":-1.499934,"y":-6.69989},{"x":-1.549934,"y":-6.74989},{"x":-1.549934,"y":-6.79989},{"x":-1.599934,"y":-6.84989},{"x":-1.6,"y":-6.875}]} />
    <trace name="BYPASS_C38" from=".U10 > .pin5" to=".C38 > .pin1" pcbPathRelativeTo=".U10 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C39" from=".U11 > .pin5" to=".C39 > .pin1" pcbPathRelativeTo=".U11 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C40" from=".U13 > .pin5" to=".C40 > .pin1" pcbPathRelativeTo=".U13 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-2.650099,"y":0.40004},{"x":-2.650099,"y":0.45004},{"x":-2.700099,"y":0.50004},{"x":-2.700099,"y":0.55004},{"x":-2.750099,"y":0.60004},{"x":-2.750099,"y":0.65004},{"x":-2.800099,"y":0.70004},{"x":-2.800099,"y":0.75004},{"x":-2.850099,"y":0.80004},{"x":-2.850099,"y":0.85004},{"x":-2.900099,"y":0.90004},{"x":-2.900099,"y":0.95004},{"x":-2.925,"y":1.0}]} />
    <trace name="BYPASS_C41" from=".U14 > .pin5" to=".C41 > .pin1" pcbPathRelativeTo=".U14 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-1.300099,"y":-2.94996},{"x":-1.325,"y":-3.0}]} />
    <trace name="BYPASS_C43" from=".U15 > .pin1" to=".C43 > .pin1" pcbPathRelativeTo=".U15 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.94996,"y":-1.149096},{"x":-0.94996,"y":-1.999096},{"x":-1.04996,"y":-2.099096},{"x":-1.04996,"y":-3.049096},{"x":-1.09996,"y":-3.099096},{"x":-1.09996,"y":-3.149096},{"x":-1.1,"y":-3.175}]} />
    <trace name="BYPASS_C44" from=".U16 > .pin6" to=".C44 > .pin1" pcbPathRelativeTo=".U16 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.249936,"y":-4.249928},{"x":-0.249936,"y":-4.799928},{"x":-0.549936,"y":-5.099928},{"x":-0.549936,"y":-5.999928},{"x":-0.649936,"y":-6.099928},{"x":-0.649936,"y":-6.249928},{"x":-0.699936,"y":-6.299928},{"x":-0.699936,"y":-6.349928},{"x":-0.749936,"y":-6.399928},{"x":-0.75,"y":-6.425}]} />
    <trace name="BYPASS_C45" from=".U16 > .pin5" to=".C45 > .pin1" pcbPathRelativeTo=".U16 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":-4.249928},{"x":-0.550062,"y":-4.449928},{"x":-0.550062,"y":-4.599928},{"x":-0.150062,"y":-4.999928},{"x":-0.150062,"y":-5.199928},{"x":0.949938,"y":-6.299928},{"x":0.999938,"y":-6.299928},{"x":1.049938,"y":-6.349928},{"x":1.099938,"y":-6.349928},{"x":1.149938,"y":-6.399928},{"x":1.199938,"y":-6.399928},{"x":1.25,"y":-6.425}]} />
    <trace name="BYPASS_C46" from=".U16 > .pin4" to=".C46 > .pin1" pcbPathRelativeTo=".U16 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.249934,"y":-4.249928},{"x":-1.249934,"y":-4.799928},{"x":-1.349934,"y":-4.899928},{"x":-1.349934,"y":-5.199928},{"x":-2.449934,"y":-6.299928},{"x":-2.499934,"y":-6.299928},{"x":-2.549934,"y":-6.349928},{"x":-2.599934,"y":-6.349928},{"x":-2.649934,"y":-6.399928},{"x":-2.699934,"y":-6.399928},{"x":-2.75,"y":-6.425}]} />
    <trace name="BYPASS_C51" from=".U17 > .pin8" to=".C51 > .pin1" pcbPathRelativeTo=".U17 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":3.530092},{"x":-4.205,"y":3.530092},{"x":-4.25,"y":3.575}]} />
    <trace name="BYPASS_C52" from=".U18 > .pin11" to=".C52 > .pin1" pcbPathRelativeTo=".U18 > .pin11" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.0,"y":2.800096},{"x":-0.0,"y":4.725}]} />
    <trace name="BYPASS_C63" from=".U22 > .pin2" to=".C63 > .pin1" pcbPathRelativeTo=".U22 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-0.635,"y":-4.6961}]} />
    <trace name="BYPASS_C69" from=".U23 > .pin1" to=".C69 > .pin1" pcbPathRelativeTo=".U23 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.699986,"y":-1.150074},{"x":-1.149986,"y":-1.150074},{"x":-1.499986,"y":-1.500074},{"x":-1.549986,"y":-1.500074},{"x":-1.599986,"y":-1.550074},{"x":-1.649986,"y":-1.550074},{"x":-1.699986,"y":-1.600074},{"x":-1.749986,"y":-1.600074},{"x":-1.799986,"y":-1.650074},{"x":-1.899986,"y":-1.650074},{"x":-1.949986,"y":-1.700074},{"x":-1.999986,"y":-1.700074},{"x":-2.049986,"y":-1.750074},{"x":-2.099986,"y":-1.750074},{"x":-2.149986,"y":-1.800074},{"x":-2.175,"y":-1.8}]} />
    <trace name="BYPASS_C70" from=".U24 > .pin1" to=".C70 > .pin1" pcbPathRelativeTo=".U24 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.649986,"y":-3.150074},{"x":-0.65,"y":-3.2001}]} />
    <resistor name="R119" schSheetName="usb-logic" schSectionName="usb-logic_board-sense" schX={11.5} schY={-4.7} schRotation={-90} pcbX={-28} pcbY={-7} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.BOARD_POWER_SENSE" }} />
    <resistor name="R120" schSheetName="usb-logic" schSectionName="usb-logic_board-sense" schX={11.5} schY={-7.7} schRotation={-90} pcbX={-28} pcbY={-9} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.BOARD_POWER_SENSE", pin2: "net.GND" }} />
    <TPS2553DBVR name="U28" schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={-8.5} schY={4.3} pcbX={-18} pcbY={3}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND", pin3: "net.USB_DATA_VBUS", pin5: "net.USB_ILIM", pin6: "net.USB_LOGIC_5V" }} pcbRotation={0} />
    <TLV75533PDBVR name="U25" schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={3.5} schY={4.3} pcbX={-18} pcbY={-1}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_LOGIC_5V", pin2: "net.GND", pin3: "net.USB_LOGIC_5V", pin5: "net.V3V3_USB" }} pcbRotation={90} />
    <LM66100DCKR name="U26" schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={-8.5} schY={-3.7} pcbX={-17} pcbY={-5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3", pin2: "net.GND", pin3: "net.V3V3_USB", pin5: "net.USB_OR_SELECT", pin6: "net.V3V3_MCU" }} pcbRotation={90} />
    <LM66100DCKR name="U27" schSheetName="usb-logic" schSectionName="usb-logic_U27" schX={3.5} schY={-5.7} pcbX={-6} pcbY={-3.5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND", pin3: "net.USB_OR_SELECT", pin5: "net.GND", pin6: "net.V3V3_MCU" }} pcbRotation={90} />
    <resistor name="R112" schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={-2.5} schY={-1.7} pcbX={-20.5} pcbY={-4.0}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.USB_OR_SELECT" }} pcbRotation={0} schRotation={-90} />
    <resistor name="R113" schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={-4.5} schY={1.3} pcbX={-22.0} pcbY={5.5}
      layer="top"
      resistance="100k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.USB_ILIM", pin2: "net.GND" }} pcbRotation={0} schRotation={-90} />
    <capacitor name="C74" schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={-11.5} schY={0.3} pcbX={-14.75} pcbY={5}
      layer="top"
      pcbRotation={90}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U28 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND" }} />
    <capacitor name="C75" schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={0.5} schY={0.3} pcbX={-14.7} pcbY={0.3}
      layer="top"
      pcbRotation={0}
      capacitance="1uF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U25 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.USB_LOGIC_5V", pin2: "net.GND" }} />
    <capacitor name="C76" schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={6.5} schY={0.3} pcbX={-14.7} pcbY={-2.3}
      layer="top"
      pcbRotation={0}
      capacitance="10uF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      schRotation={-90}
      maxVoltageRating="10V"
      decouplingFor=".U25 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <capacitor name="C77" schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={-11.5} schY={-7.7} pcbX={-13.2} pcbY={-5}
      layer="top"
      pcbRotation={90}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U26 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C78" schSheetName="usb-logic" schSectionName="usb-logic_U27" schX={7.7} schY={0.3} pcbX={-7.5} pcbY={-6}
      layer="top"
      pcbRotation={180}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U27 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <TMP102AIDRLR name="U29" schSheetName="telemetry" schSectionName="telemetry_U29" schX={-6} schY={3.65} pcbX={20} pcbY={8}
      layer="top"
      connections={{ pin1: "net.PD_SCL", pin2: "net.GND", pin3: "net.TEMP_OK", pin4: "net.GND", pin5: "net.V3V3", pin6: "net.PD_SDA" }} pcbRotation={0} />
    <SN74LVC1G08DBVR name="U33" schSheetName="telemetry" schSectionName="telemetry_U29" schX={6} schY={3.65} pcbX={6.3} pcbY={4.5}
      layer="top"
      connections={{ pin1: "net.RUN_WINDOW_OK", pin2: "net.TEMP_OK", pin3: "net.GND", pin4: "net.RUN_SAFE", pin5: "net.V3V3" }} pcbRotation={0} />
    <resistor name="R114" schSheetName="telemetry" schSectionName="telemetry_U29" schX={3} schY={4.95} pcbX={26.5} pcbY={9.5}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TEMP_OK" }} pcbRotation={0} schRotation={-90} />
    <ADS1115IDGSR name="U30" schSheetName="telemetry" schSectionName="telemetry_U30" schX={-6} schY={-5} pcbX={-6} pcbY={5}
      layer="top"
      noConnect={["pin2"]}
      connections={{ pin1: "net.V3V3", pin3: "net.GND", pin4: "net.VMON_ADC", pin5: "net.IIN_MON", pin6: "net.BRAKE_FB", pin7: "net.GND", pin8: "net.V3V3", pin9: "net.PD_SDA", pin10: "net.PD_SCL" }} pcbRotation={0} />
    <INA240A1DR name="U31" schSheetName="phase-current" schSectionName="telemetry_U31" schX={-8} schY={-0.2} pcbX={15} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_A_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_A1" }} pcbRotation={270} />
    <FRM121WFR005TM name="R115" schSheetName="phase-current" schSectionName="telemetry_U31" schX={-12} schY={2.8} pcbX={15} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_A1", pin2: "net.MOTOR_A1_OUT" }} pcbRotation={180} />
    <resistor name="R117" schSheetName="phase-current" schSectionName="telemetry_U31" schX={-4} schY={-4.2} pcbX={20} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_A_RAW", pin2: "net.PHASE_A_ADC" }} pcbRotation={270} />
    <INA240A1DR name="U32" schSheetName="phase-current" schSectionName="telemetry_U32" schX={6} schY={-0.2} pcbX={25} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_B1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_B_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_B1" }} pcbRotation={270} />
    <FRM121WFR005TM name="R116" schSheetName="phase-current" schSectionName="telemetry_U32" schX={2} schY={2.8} pcbX={25} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_B1", pin2: "net.MOTOR_B1_OUT" }} pcbRotation={180} />
    <resistor name="R118" schSheetName="phase-current" schSectionName="telemetry_U32" schX={12} schY={-4.2} pcbX={30} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_B_RAW", pin2: "net.PHASE_B_ADC" }} pcbRotation={270} />
    <capacitor name="C79" schSheetName="telemetry" schSectionName="telemetry_U29" schX={-3} schY={1} pcbX={19.5} pcbY={6.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U29 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C80" schSheetName="telemetry" schSectionName="telemetry_U30" schX={-4.2} schY={1} pcbX={-2.5} pcbY={7.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U30 > .pin8"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C81" schSheetName="phase-current" schSectionName="telemetry_U31" schX={-4} schY={4.5} pcbX={20} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U31 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C82" schSheetName="phase-current" schSectionName="telemetry_U32" schX={-2.8} schY={4.5} pcbX={30} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U32 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C83" schSheetName="phase-current" schSectionName="telemetry_U31" schX={-4} schY={-7.2} pcbX={17.5} pcbY={-29.2}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_A_ADC", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C84" schSheetName="phase-current" schSectionName="telemetry_U32" schX={12} schY={-7.2} pcbX={27.5} pcbY={-29.2}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_B_ADC", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C85" schSheetName="telemetry" schSectionName="telemetry_U33" schX={-5.4} schY={1} pcbX={3} pcbY={6.1}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U33 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} />
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
    <trace name="GATE_Q6" from=".R38 > .pin2" to=".Q6 > .pin4" pcbPathRelativeTo=".R38 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q7" from=".R39 > .pin2" to=".Q7 > .pin4" pcbPathRelativeTo=".R39 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q8" from=".R42 > .pin2" to=".Q8 > .pin4" pcbPathRelativeTo=".R42 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q9" from=".R43 > .pin2" to=".Q9 > .pin4" pcbPathRelativeTo=".R43 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":1.675,"y":0.85},{"x":1.725,"y":0.85},{"x":2.225,"y":1.35},{"x":2.225,"y":1.4},{"x":2.275,"y":1.45},{"x":2.275,"y":1.5},{"x":2.325,"y":1.55},{"x":2.325,"y":1.65},{"x":2.375,"y":1.7},{"x":2.375,"y":1.75},{"x":2.405,"y":1.774606}]} />
    <trace name="GATE_Q10" from=".R46 > .pin2" to=".Q10 > .pin4" pcbPathRelativeTo=".R46 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.525,"y":0.0},{"x":2.574606,"y":-0.005}]} />
    <trace name="GATE_Q11" from=".R47 > .pin2" to=".Q11 > .pin4" pcbPathRelativeTo=".R47 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":1.625,"y":-0.8},{"x":1.625,"y":-1.25},{"x":2.025,"y":-1.65},{"x":2.025,"y":-1.7},{"x":2.075,"y":-1.75},{"x":2.075,"y":-1.8},{"x":2.125,"y":-1.85},{"x":2.125,"y":-1.9},{"x":2.175,"y":-1.95},{"x":2.175,"y":-2.0},{"x":2.225,"y":-2.05},{"x":2.225,"y":-2.15},{"x":2.275,"y":-2.2},{"x":2.275,"y":-2.25},{"x":2.325,"y":-2.3},{"x":2.325,"y":-2.35},{"x":2.375,"y":-2.4},{"x":2.375,"y":-2.45},{"x":2.395,"y":-2.474606}]} />
    <trace name="GATE_Q12" from=".R50 > .pin2" to=".Q12 > .pin4" pcbPathRelativeTo=".R50 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.0,"y":0.0},{"x":2.574606,"y":1.395}]} />
    <trace name="GATE_Q13" from=".R51 > .pin2" to=".Q13 > .pin4" pcbPathRelativeTo=".R51 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.0,"y":0.0},{"x":2.574606,"y":-0.605}]} />
    <trace name="BOOT_C32" from=".U7 > .pin42" to=".C32 > .pin1" pcbPathRelativeTo=".U7 > .pin42" thickness="0.2mm" maxLength="6mm" pcbPath={[{"x":-4.19989,"y":0.249936},{"x":-5.04989,"y":0.249936},{"x":-5.14989,"y":0.149936},{"x":-6.09989,"y":0.149936},{"x":-6.14989,"y":0.099936},{"x":-6.39989,"y":0.099936},{"x":-6.45,"y":0.0875}]} />
    <trace name="BOOT_C33" from=".U7 > .pin35" to=".C33 > .pin1" pcbPathRelativeTo=".U7 > .pin35" thickness="0.2mm" maxLength="6mm" pcbPath={[{"x":-2.249932,"y":4.19989},{"x":-2.249932,"y":4.74989},{"x":-2.349932,"y":4.84989},{"x":-2.349932,"y":5.19989},{"x":-3.399932,"y":6.24989},{"x":-3.449932,"y":6.24989},{"x":-3.5,"y":6.2875}]} />
    <trace name="BOOT_C34" from=".U7 > .pin2" to=".C34 > .pin1" pcbPathRelativeTo=".U7 > .pin2" thickness="0.2mm" maxLength="6mm" pcbPath={[{"x":-2.249932,"y":-4.19989},{"x":-2.249932,"y":-4.74989},{"x":-2.349932,"y":-4.84989},{"x":-2.349932,"y":-5.19989},{"x":-2.399932,"y":-5.24989},{"x":-2.599932,"y":-5.24989},{"x":-3.099932,"y":-5.74989},{"x":-4.149932,"y":-5.74989},{"x":-4.199932,"y":-5.79989},{"x":-4.249932,"y":-5.79989},{"x":-4.299932,"y":-5.84989},{"x":-4.349932,"y":-5.84989},{"x":-4.399932,"y":-5.89989},{"x":-4.449932,"y":-5.89989},{"x":-4.499932,"y":-5.94989},{"x":-4.549932,"y":-5.94989},{"x":-4.599932,"y":-5.99989},{"x":-4.699932,"y":-5.99989},{"x":-4.749932,"y":-6.04989},{"x":-4.799932,"y":-6.04989},{"x":-4.849932,"y":-6.09989},{"x":-4.899932,"y":-6.09989},{"x":-4.949932,"y":-6.14989},{"x":-4.999932,"y":-6.14989},{"x":-5.049932,"y":-6.19989},{"x":-5.099932,"y":-6.19989},{"x":-5.149932,"y":-6.24989},{"x":-5.249932,"y":-6.24989},{"x":-5.299932,"y":-6.29989},{"x":-5.349932,"y":-6.29989},{"x":-5.399932,"y":-6.34989},{"x":-5.449932,"y":-6.34989},{"x":-5.5,"y":-6.3875}]} />
    <trace name="BOOT_C35" from=".U7 > .pin43" to=".C35 > .pin1" pcbPathRelativeTo=".U7 > .pin43" thickness="0.2mm" maxLength="6mm" pcbPath={[{"x":-4.19989,"y":-0.249936},{"x":-4.74989,"y":-0.249936},{"x":-4.84989,"y":-0.349936},{"x":-5.19989,"y":-0.349936},{"x":-6.39989,"y":-1.549936},{"x":-6.39989,"y":-1.599936},{"x":-6.44989,"y":-1.649936},{"x":-6.45,"y":-1.6875}]} />
    <trace name="ANALOG_GND_C26" from=".U7 > .pin6" to=".C26 > .pin2" pcbPathRelativeTo=".U7 > .pin6" thickness="0.15mm" maxLength="7mm" pcbPath={[{"x":-0.249936,"y":-4.19989},{"x":-0.249936,"y":-5.04989},{"x":-0.149936,"y":-5.14989},{"x":-0.149936,"y":-5.24989},{"x":0.900064,"y":-6.29989},{"x":0.900064,"y":-7.44989},{"x":0.500064,"y":-7.84989},{"x":0.500064,"y":-7.89989},{"x":0.450064,"y":-7.94989},{"x":0.450064,"y":-7.99989},{"x":0.400064,"y":-8.04989},{"x":0.400064,"y":-8.09989},{"x":0.350064,"y":-8.14989},{"x":0.350064,"y":-8.24989},{"x":0.300064,"y":-8.29989},{"x":0.300064,"y":-8.34989},{"x":0.250064,"y":-8.39989},{"x":0.250064,"y":-8.44989},{"x":0.200064,"y":-8.49989},{"x":0.2,"y":-8.525}]} />
    <trace name="KELVIN_B_LOW" from=".U7 > .pin10" to=".R110 > .pin2" pcbPathRelativeTo=".U7 > .pin10" thickness="0.15mm" maxLength="35mm" pcbPath={[{"x":1.75006,"y":-4.19989},{"x":1.85006,"y":-3.39989},{"x":2.75006,"y":-2.49989},{"x":2.75006,"y":2.50011},{"x":2.55006,"y":2.70011},{"x":-2.84994,"y":2.90011},{"x":-3.94994,"y":4.00011},{"x":-6.64994,"y":4.50011},{"x":-8.533712,"y":5.5}]} />
    <trace name="KELVIN_B_HIGH" from=".U7 > .pin9" to=".R110 > .pin1" pcbPathRelativeTo=".U7 > .pin9" thickness="0.15mm" maxLength="35mm" pcbPath={[{"x":1.249934,"y":-4.19989},{"x":1.049934,"y":-3.29989},{"x":0.949934,"y":-3.19989},{"x":-3.150066,"y":-3.19989},{"x":-3.950066,"y":-3.99989},{"x":-5.750066,"y":-4.29989},{"x":-7.150066,"y":-4.29989},{"x":-9.450066,"y":-2.39989},{"x":-10.250066,"y":2.40011},{"x":-14.666288,"y":5.5}]} />
    <trace name="KELVIN_A_HIGH" from=".U7 > .pin8" to=".R109 > .pin1" pcbPathRelativeTo=".U7 > .pin8" thickness="0.15mm" maxLength="25mm" pcbPath={[{"x":0.750062,"y":-4.19989},{"x":0.750062,"y":-4.74989},{"x":0.900062,"y":-4.89989},{"x":0.900062,"y":-5.19989},{"x":3.100062,"y":-5.19989},{"x":6.250062,"y":-2.04989},{"x":6.550062,"y":-2.04989},{"x":9.400062,"y":0.80011},{"x":9.450062,"y":0.80011},{"x":9.500062,"y":0.85011},{"x":9.550062,"y":0.85011},{"x":9.600062,"y":0.90011},{"x":9.650062,"y":0.90011},{"x":9.700062,"y":0.95011},{"x":9.750062,"y":0.95011},{"x":9.800062,"y":1.00011},{"x":9.833712,"y":1.0}]} />
    <trace name="KELVIN_A_LOW" from=".U7 > .pin7" to=".R109 > .pin2" pcbPathRelativeTo=".U7 > .pin7" thickness="0.15mm" maxLength="25mm" pcbPath={[{"x":0.249936,"y":-4.19989},{"x":0.249936,"y":-4.74989},{"x":0.399936,"y":-4.89989},{"x":0.399936,"y":-5.19989},{"x":0.499936,"y":-5.19989},{"x":0.799936,"y":-5.49989},{"x":6.099936,"y":-5.49989},{"x":7.149936,"y":-6.54989},{"x":8.799936,"y":-6.54989},{"x":8.849936,"y":-6.49989},{"x":12.349936,"y":-6.49989},{"x":12.749936,"y":-6.09989},{"x":12.749936,"y":-6.04989},{"x":12.799936,"y":-5.99989},{"x":12.799936,"y":-5.94989},{"x":12.849936,"y":-5.89989},{"x":12.849936,"y":-5.79989},{"x":12.899936,"y":-5.74989},{"x":12.899936,"y":-5.69989},{"x":12.949936,"y":-5.64989},{"x":12.949936,"y":-5.59989},{"x":12.999936,"y":-5.54989},{"x":12.999936,"y":-5.49989},{"x":13.049936,"y":-5.44989},{"x":13.049936,"y":-5.39989},{"x":13.099936,"y":-5.34989},{"x":13.099936,"y":-5.24989},{"x":13.149936,"y":-5.19989},{"x":13.149936,"y":-1.49989},{"x":15.399936,"y":0.75011},{"x":15.449936,"y":0.75011},{"x":15.499936,"y":0.80011},{"x":15.549936,"y":0.80011},{"x":15.599936,"y":0.85011},{"x":15.649936,"y":0.85011},{"x":15.699936,"y":0.90011},{"x":15.799936,"y":0.90011},{"x":15.899936,"y":1.00011},{"x":15.966288,"y":1.0}]} />
    <trace name="PHASE_A_PLUS" from=".U31 > .pin8" to=".R115 > .pin1" pcbPathRelativeTo=".U31 > .pin8" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":2.7051},{"x":-2.005,"y":2.6051},{"x":-2.405,"y":2.6051},{"x":-2.755,"y":2.2551},{"x":-2.805,"y":2.2551},{"x":-3.455,"y":1.6051},{"x":-4.255,"y":1.6051},{"x":-4.305,"y":1.5551},{"x":-4.355,"y":1.5551},{"x":-4.405,"y":1.5051},{"x":-4.455,"y":1.5051},{"x":-4.5,"y":1.478788}]} />
    <trace name="PHASE_A_MINUS" from=".U31 > .pin1" to=".R115 > .pin2" pcbPathRelativeTo=".U31 > .pin1" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":-2.7051},{"x":-2.005,"y":-2.6051},{"x":-2.405,"y":-2.6051},{"x":-2.755,"y":-2.2551},{"x":-2.805,"y":-2.2551},{"x":-3.455,"y":-1.6051},{"x":-4.255,"y":-1.6051},{"x":-4.305,"y":-1.5551},{"x":-4.355,"y":-1.5551},{"x":-4.405,"y":-1.5051},{"x":-4.455,"y":-1.5051},{"x":-4.5,"y":-1.478788}]} />
    <trace name="PHASE_B_PLUS" from=".U32 > .pin8" to=".R116 > .pin1" pcbPathRelativeTo=".U32 > .pin8" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":2.7051},{"x":-2.005,"y":2.6051},{"x":-2.405,"y":2.6051},{"x":-2.755,"y":2.2551},{"x":-2.805,"y":2.2551},{"x":-3.455,"y":1.6051},{"x":-4.255,"y":1.6051},{"x":-4.305,"y":1.5551},{"x":-4.355,"y":1.5551},{"x":-4.405,"y":1.5051},{"x":-4.455,"y":1.5051},{"x":-4.5,"y":1.478788}]} />
    <trace name="PHASE_B_MINUS" from=".U32 > .pin1" to=".R116 > .pin2" pcbPathRelativeTo=".U32 > .pin1" thickness="0.15mm" maxLength="6mm" pcbPath={[{"x":-1.905,"y":-2.7051},{"x":-2.005,"y":-2.6051},{"x":-2.405,"y":-2.6051},{"x":-2.755,"y":-2.2551},{"x":-2.805,"y":-2.2551},{"x":-3.455,"y":-1.6051},{"x":-4.255,"y":-1.6051},{"x":-4.305,"y":-1.5551},{"x":-4.355,"y":-1.5551},{"x":-4.405,"y":-1.5051},{"x":-4.455,"y":-1.5051},{"x":-4.5,"y":-1.478788}]} />
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
