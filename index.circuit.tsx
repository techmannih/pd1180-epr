/** 48 V EPR single-axis stepper controller. See docs/release-status.json before fabrication. */
import { AS5047P_ATSM } from "./imports/AS5047P_ATSM"
import { A_74LVC1G157GW_125 } from "./imports/A_74LVC1G157GW_125"
import { B2P_VH_LF__SN_ } from "./imports/B2P_VH_LF__SN_"
import { B4B_PH_K_S_LF__SN_ } from "./imports/B4B_PH_K_S_LF__SN_"
import { B4P_VH_LF__SN_ } from "./imports/B4P_VH_LF__SN_"
import { B8B_PH_K_S_LF__SN_ } from "./imports/B8B_PH_K_S_LF__SN_"
import { BAV21W_7_F } from "./imports/BAV21W_7_F"
import { BSS123LT1G } from "./imports/BSS123LT1G"
import { CSD19534Q5A } from "./imports/CSD19534Q5A"
import { EEUFR1J471 } from "./imports/EEUFR1J471"
import { HoLLR2512_3W_33mR_1_ } from "./imports/HoLLR2512_3W_33mR_1_"
import { LM66100DCKR } from "./imports/LM66100DCKR"
import { LMR36510ADDAR } from "./imports/LMR36510ADDAR"
import { M24512_RMN6TP } from "./imports/M24512_RMN6TP"
import { MAX3232ESE_T } from "./imports/MAX3232ESE_T"
import { MAX3485EESA_T } from "./imports/MAX3485EESA_T"
import { MMBT5551LT1G } from "./imports/MMBT5551LT1G"
import { PSM712_LF_T7 } from "./imports/PSM712_LF_T7"
import { SM24CANB_02HTG } from "./imports/SM24CANB_02HTG"
import { SN74LVC1G08DBVR } from "./imports/SN74LVC1G08DBVR"
import { SS110 } from "./imports/SS110"
import { STM32G0B1 } from "./imports/STM32G0B1"
import { SWPA6045S220MT } from "./imports/SWPA6045S220MT"
import { TCAN332DR } from "./imports/TCAN332DR"
import { TL431AIDBZR } from "./imports/TL431AIDBZR"
import { TLV3201AIDBVR } from "./imports/TLV3201AIDBVR"
import { TMC5160A_TA_T } from "./imports/TMC5160A_TA_T"
import { TPD4S480RUKR } from "./imports/TPD4S480RUKR"
import { TPS26631RGER } from "./imports/TPS26631RGER"
import { TPS26750SRSMR } from "./imports/TPS26750SRSMR"
import { TS_1088_AR02016 } from "./imports/TS_1088_AR02016"
import { UCC27511DBVR } from "./imports/UCC27511DBVR"
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
    defaultTraceWidth="0.25mm" minTraceWidth="0.15mm" minViaHoleDiameter="0.2mm" minViaPadDiameter="0.45mm"
    schAutoLayoutEnabled schTraceAutoLabelEnabled schMaxTraceDistance={0.8}
    autorouter="auto-local" autorouterEffortLevel="5x" autorouterVersion="beta_pipeline7" >
    {/* Four 4.191 mm STEP holes, rounded to the 4.2 mm fabrication drill. */}
    <hole name="H1" pcbX={38.4} pcbY={-24.5} diameter="4.2mm" />
    <hole name="H2" pcbX={24.5} pcbY={38.4} diameter="4.2mm" />
    <hole name="H3" pcbX={-38.4} pcbY={24.5} diameter="4.2mm" />
    <hole name="H4" pcbX={-24.5} pcbY={-38.4} diameter="4.2mm" />
    <schematicsheet name="usb-pd" displayName="USB-C EPR Power and USB Data" sheetIndex={1} sheetWidth="400mm" sheetHeight="400mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="01 / USB-C EPR Power and USB Data" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="J1 carries 48 V / 5 A EPR power and USB 2.0 device data on one USB-C receptacle." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U1: 48 V CC/VBUS and D+/D- protection. U2: TPS26750 EPR sink controller. U3: PD policy EEPROM. U4: hardware power-permit gate." />
      <schematictext schX={-4} schY={5.1} fontSize={0.23} anchor="top_left" text="R107/R108/C72: 5-60 V attach sense. Q1: protected VBUS control. Q2/Q3: PD-path level translation." />
    </schematicsheet>
    <schematicsheet name="logic-power" displayName="USB and Motor Logic Supplies" sheetIndex={2} sheetWidth="330mm" sheetHeight="335mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="02 / USB and Motor Logic Supplies" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Either USB or motor bus sustains 3.3 V; ideal diodes block reverse current." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U5: USB 5 V buck. U22: motor-bus auxiliary buck. U23/U24: ideal-diode OR into the shared 3.3 V rail." />
    </schematicsheet>
    <schematicsheet name="motor-power" displayName="Protected 48 V Motor Bus" sheetIndex={3} sheetWidth="385mm" sheetHeight="185mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="03 / Protected 48 V Motor Bus" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Nominal eFuse limit 4.48 A. No reverse energy into the USB source." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q4: reverse-blocking power MOSFET. Q5: fast gate clamp. U6: TPS26631 48 V eFuse, current monitor and fault output." />
    </schematicsheet>
    <schematicsheet name="motion" displayName="Motion Controller and Enable Chain" sheetIndex={4} sheetWidth="340mm" sheetHeight="325mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="04 / Motion Controller and Enable Chain" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="SPI-controlled TMC5160A. Driver remains disabled until the hardware enable chain is valid." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U7: motion controller and gate driver. U8/U9: Step/Dir limit multiplexers. U10/U11 + Q14/Q15: hardwired enable interlock." />
    </schematicsheet>
    <schematicsheet name="bridge-a" displayName="Motor Phase A Power Bridge" sheetIndex={5} sheetWidth="315mm" sheetHeight="325mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="05 / Motor Phase A Power Bridge" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Phase A target 5.5 A RMS; Kelvin sense routing and high-current copper require review." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q6/Q8: high-side MOSFETs. Q7/Q9: low-side MOSFETs. R109: 33 mOhm, 3 W phase-current shunt." />
    </schematicsheet>
    <schematicsheet name="bridge-b" displayName="Motor Phase B Power Bridge" sheetIndex={6} sheetWidth="315mm" sheetHeight="330mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="06 / Motor Phase B Power Bridge" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Phase B target 5.5 A RMS; independent 33 milliohm sense resistor." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q10/Q12: high-side MOSFETs. Q11/Q13: low-side MOSFETs. R110: 33 mOhm, 3 W phase-current shunt." />
    </schematicsheet>
    <schematicsheet name="brake" displayName="Regeneration Brake and Overvoltage" sheetIndex={7} sheetWidth="370mm" sheetHeight="345mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="07 / Regeneration Brake and Overvoltage" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Nominal brake threshold 52.9 V; external resistor sizing depends on total stored mechanical energy." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U12: precision threshold reference. U13/U14: overvoltage comparators. U15: MOSFET gate driver. Q16: brake switch." />
    </schematicsheet>
    <schematicsheet name="mcu" displayName="MCU, Clock, Memory and Debug" sheetIndex={8} sheetWidth="295mm" sheetHeight="190mm">
      <schematictext schX={-8} schY={10} fontSize={0.6} anchor="top_left" text="08 / MCU, Clock, Memory and Debug" />
      <schematictext schX={-8} schY={8.6} fontSize={0.26} anchor="top_left" text="3.3 V STM32G0B1; USB data, SWD, SPI motion control and serial interfaces." />
      <schematictext schX={-8} schY={7.8} fontSize={0.23} anchor="top_left" text="U16: system MCU with native USB, FDCAN and ADC monitoring. U17: 32 Mbit external SPI configuration/telemetry flash." />
    </schematicsheet>
    <schematicsheet name="encoder" displayName="Shaft Encoder and Monitor" sheetIndex={9} sheetWidth="335mm" sheetHeight="140mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="09 / Shaft Encoder and Monitor" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="AS5047P is centered on the PCB underside; shaft magnet alignment must be verified." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U18: 14-bit magnetic shaft encoder; SPI readout plus ABI incremental outputs and local 3.3 V filtering." />
    </schematicsheet>
    <schematicsheet name="serial" displayName="CAN, RS485 and RS232" sheetIndex={10} sheetWidth="380mm" sheetHeight="230mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="10 / CAN, RS485 and RS232" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="External CAN/RS485 termination; J6 carries RS232, CAN and RS485." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U19: 3.3 V CAN transceiver; D2: CAN TVS. U20: RS485 transceiver; D3: RS485 TVS. U21: RS232 transceiver." />
    </schematicsheet>
    <schematicsheet name="inputs" displayName="24 V Inputs and Step/Direction" sheetIndex={11} sheetWidth="365mm" sheetHeight="435mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="11 / 24 V Inputs and Step/Direction" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Non-isolated 24 V inputs. J7 consolidates home, stops, digital inputs and Step/Direction." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q17-Q23: 24 V tolerant NPN input conditioners for HOME, limits, DIN0/1 and Step/Direction signals." />
    </schematicsheet>
    <schematicsheet name="outputs" displayName="Hardware Enable and Outputs" sheetIndex={12} sheetWidth="360mm" sheetHeight="205mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="12 / Hardware Enable and Outputs" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="J9: motor rail, 24 V hardware enable, OUT0 and OUT1. External loads need rating review." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q24/Q25: open-collector 24 V output drivers; base pulldowns keep outputs off during reset." />
    </schematicsheet>
    <schematicsection name="usb-pd_J1" displayName="48 V EPR Power and USB 2.0 Data / J1" />
    <schematicsection name="usb-pd_U1" displayName="EPR Port Protection / U1" />
    <schematicsection name="usb-pd_U2" displayName="EPR PD Controller / U2" />
    <schematicsection name="usb-pd_U3" displayName="PD Configuration EEPROM / U3" />
    <schematicsection name="usb-pd_U4" displayName="PD Power-Path Gate / U4" />
    <schematicsection name="logic-power_U5" displayName="USB and Motor Logic Supplies / U5" />
    <schematicsection name="logic-power_L1" displayName="USB and Motor Logic Supplies / L1" />
    <schematicsection name="logic-power_U22" displayName="USB and Motor Logic Supplies / U22" />
    <schematicsection name="logic-power_L2" displayName="USB and Motor Logic Supplies / L2" />
    <schematicsection name="logic-power_U23" displayName="USB and Motor Logic Supplies / U23" />
    <schematicsection name="logic-power_U24" displayName="USB and Motor Logic Supplies / U24" />
    <schematicsection name="motor-power_Q4" displayName="Protected 48 V Motor Bus / Q4" />
    <schematicsection name="motor-power_U6" displayName="Protected 48 V Motor Bus / U6" />
    <schematicsection name="motor-power_C22" displayName="Protected 48 V Motor Bus / C22" />
    <schematicsection name="motor-power_C23" displayName="Protected 48 V Motor Bus / C23" />
    <schematicsection name="motion_U7" displayName="Motion Controller and Enable Chain / U7" />
    <schematicsection name="motion_U8" displayName="Motion Controller and Enable Chain / U8" />
    <schematicsection name="motion_U9" displayName="Motion Controller and Enable Chain / U9" />
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
    <schematicsection name="mcu_SW1" displayName="MCU, Clock, Memory and Debug / SW1" />
    <schematicsection name="mcu_U17" displayName="MCU, Clock, Memory and Debug / U17" />
    <schematicsection name="encoder_U18" displayName="Shaft Encoder and Monitor / U18" />
    <schematicsection name="serial_U19" displayName="CAN, RS485 and RS232 / U19" />
    <schematicsection name="serial_U20" displayName="CAN, RS485 and RS232 / U20" />
    <schematicsection name="serial_U21" displayName="CAN, RS485 and RS232 / U21" />
    <schematicsection name="serial_J6" displayName="CAN, RS485 and RS232 / J6" />
    <schematicsection name="inputs_Q17" displayName="24 V Inputs and Step/Direction / Q17" />
    <schematicsection name="inputs_Q18" displayName="24 V Inputs and Step/Direction / Q18" />
    <schematicsection name="inputs_Q19" displayName="24 V Inputs and Step/Direction / Q19" />
    <schematicsection name="inputs_Q20" displayName="24 V Inputs and Step/Direction / Q20" />
    <schematicsection name="inputs_Q21" displayName="24 V Inputs and Step/Direction / Q21" />
    <schematicsection name="inputs_Q22" displayName="24 V Inputs and Step/Direction / Q22" />
    <schematicsection name="inputs_Q23" displayName="24 V Inputs and Step/Direction / Q23" />
    <schematicsection name="inputs_J7" displayName="24 V Inputs and Step/Direction / J7" />
    <schematicsection name="outputs_Q24" displayName="Hardware Enable and Outputs / Q24" />
    <schematicsection name="outputs_Q25" displayName="Hardware Enable and Outputs / Q25" />
    <schematicsection name="outputs_J9" displayName="Hardware Enable and Outputs / J9" />
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
    <net name="CAN_H" isPowerNet={false} />
    <net name="CAN_L" isPowerNet={false} />
    <net name="CAN_RX" isPowerNet={false} />
    <net name="CAN_TX" isPowerNet={false} />
    <net name="CC1_CONN" isPowerNet={false} />
    <net name="CC1_PD" isPowerNet={false} />
    <net name="CC2_CONN" isPowerNet={false} />
    <net name="CC2_PD" isPowerNet={false} />
    <net name="CC_FAULT_N" isPowerNet={false} />
    <net name="CC_VBIAS" isPowerNet={false} />
    <net name="DIN0" isPowerNet={false} />
    <net name="DIN0_24V" isPowerNet={false} />
    <net name="DIN0_BASE" isPowerNet={false} />
    <net name="DIN1" isPowerNet={false} />
    <net name="DIN1_24V" isPowerNet={false} />
    <net name="DIN1_BASE" isPowerNet={false} />
    <net name="DIR_24V" isPowerNet={false} />
    <net name="DIR_IN" isPowerNet={false} />
    <net name="DIR_IN_BASE" isPowerNet={false} />
    <net name="DRV_EN_N" isPowerNet={false} />
    <net name="EEP_IRQ_N" isPowerNet={false} />
    <net name="EEP_SCL" isPowerNet={false} />
    <net name="EEP_SDA" isPowerNet={false} />
    <net name="EFUSE_EN" isPowerNet={false} />
    <net name="EFUSE_FAULT_N" isPowerNet={false} />
    <net name="EFUSE_IN" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="ENABLE_CHAIN" isPowerNet={false} />
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
    <net name="GND" isGroundNet />
    <net name="HOME_24V" isPowerNet={false} />
    <net name="HOME_IN" isPowerNet={false} />
    <net name="HOME_IN_BASE" isPowerNet={false} />
    <net name="HW_ENABLE_24V" isPowerNet={false} />
    <net name="HW_ENABLE_BASE" isPowerNet={false} />
    <net name="IIN_MON" isPowerNet={false} />
    <net name="ILIM_SET" isPowerNet={false} />
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
    <net name="OUT0" isPowerNet={false} />
    <net name="OUT0_BASE" isPowerNet={false} />
    <net name="OUT0_DRIVE" isPowerNet={false} />
    <net name="OUT1" isPowerNet={false} />
    <net name="OUT1_BASE" isPowerNet={false} />
    <net name="OUT1_DRIVE" isPowerNet={false} />
    <net name="OVP_DIV" isPowerNet={false} />
    <net name="OVP_TOP" isPowerNet={false} />
    <net name="PD_1V5" isPowerNet />
    <net name="PD_3V3" isPowerNet />
    <net name="PD_INV_BASE" isPowerNet={false} />
    <net name="PD_IRQ_N" isPowerNet={false} />
    <net name="PD_LEVEL_BASE" isPowerNet={false} />
    <net name="PD_PATH_HV" isPowerNet={false} />
    <net name="PD_PATH_N" isPowerNet={false} />
    <net name="PD_PATH_OK" isPowerNet={false} />
    <net name="PD_SCL" isPowerNet={false} />
    <net name="PD_SDA" isPowerNet={false} />
    <net name="PG_DIV" isPowerNet={false} />
    <net name="POWER_PERMIT" isPowerNet={false} />
    <net name="REFL_STEP" isPowerNet={false} />
    <net name="REFR_DIR" isPowerNet={false} />
    <net name="RS232_C1N" isPowerNet={false} />
    <net name="RS232_C1P" isPowerNet={false} />
    <net name="RS232_C2N" isPowerNet={false} />
    <net name="RS232_C2P" isPowerNet={false} />
    <net name="RS232_RX" isPowerNet={false} />
    <net name="RS232_RX_CONN" isPowerNet={false} />
    <net name="RS232_TX" isPowerNet={false} />
    <net name="RS232_TX_CONN" isPowerNet={false} />
    <net name="RS232_VN" isPowerNet={false} />
    <net name="RS232_VP" isPowerNet={false} />
    <net name="RS485_A" isPowerNet={false} />
    <net name="RS485_B" isPowerNet={false} />
    <net name="RS485_DE" isPowerNet={false} />
    <net name="RS485_RX" isPowerNet={false} />
    <net name="RS485_TX" isPowerNet={false} />
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
    <net name="STEP_24V" isPowerNet={false} />
    <net name="STEP_IN" isPowerNet={false} />
    <net name="STEP_IN_BASE" isPowerNet={false} />
    <net name="STOPL_24V" isPowerNet={false} />
    <net name="STOPR_24V" isPowerNet={false} />
    <net name="STOP_L" isPowerNet={false} />
    <net name="STOP_L_BASE" isPowerNet={false} />
    <net name="STOP_R" isPowerNet={false} />
    <net name="STOP_R_BASE" isPowerNet={false} />
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
    <net name="USB_DM_PROTECTED" isPowerNet={false} />
    <net name="USB_VBUS_SENSE" isPowerNet={false} />
    <net name="USB_DP" isPowerNet={false} />
    <net name="USB_DP_CONN" isPowerNet={false} />
    <net name="USB_DP_PROTECTED" isPowerNet={false} />
    <net name="USB_VBUS" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="UVLO_DIV" isPowerNet={false} />
    <net name="UVLO_MID" isPowerNet={false} />
    <net name="V3V3" isPowerNet />
    <net name="V3V3_MOTOR" isPowerNet />
    <net name="V3V3_USB" isPowerNet />
    <net name="VBUS_LV" isPowerNet />
    <net name="VMON_ADC" isPowerNet={false} />
    <net name="VMON_MID" isPowerNet={false} />
    <net name="VMOTOR" isPowerNet nominalTraceWidth="2.4mm" />
    <net name="VMOTOR_OK" isPowerNet={false} />
    <net name="VREF_2V495" isPowerNet={false} />

    {/* One USB-C receptacle carries EPR power and USB 2.0 data. */}
    <USB4105_GF_A name="J1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={0} schY={0} schWidth={1.575} pcbX={-36} pcbY={15}
      pcbRotation={270}
      noConnect={["pin10", "pin16"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.USB_VBUS", pin8: "net.USB_VBUS", pin17: "net.USB_VBUS", pin18: "net.USB_VBUS", pin9: "net.CC2_CONN", pin15: "net.CC1_CONN", pin11: "net.USB_DP_CONN", pin13: "net.USB_DP_CONN", pin12: "net.USB_DM_CONN", pin14: "net.USB_DM_CONN" }} />
    <resistor name="R107" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={5} schY={3} pcbX={-22.0} pcbY={16.0}
      schRotation={-90}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.USB_VBUS", pin2: "net.USB_VBUS_SENSE" }} />
    <resistor name="R108" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={7.5} schY={3} pcbX={-19.0} pcbY={16.0}
      schRotation={-90}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <capacitor name="C72" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={10} schY={3} pcbX={-23.0} pcbY={14.0} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxVoltageRating="50V"
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <TPD4S480RUKR name="U1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={17} schY={0} pcbX={-30} pcbY={24.5}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.USB_DM_CONN", pin3: "net.CC_VBIAS", pin4: "net.CC1_CONN", pin5: "net.CC2_CONN", pin6: "net.CC2_CONN", pin7: "net.CC1_CONN", pin8: "net.GND", pin9: "net.CC_FAULT_N", pin10: "net.PD_3V3", pin11: "net.CC2_PD", pin12: "net.CC1_PD", pin13: "net.GND", pin14: "net.USB_DM_PROTECTED", pin15: "net.USB_DP_PROTECTED", pin16: "net.EPR_EN", pin17: "net.EPR_BLK_GATE", pin18: "net.GND", pin19: "net.VBUS_LV", pin20: "net.USB_VBUS", pin21: "net.GND" }} />
    <TPS26750SRSMR name="U2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={0} schY={-12} pcbX={-24} pcbY={24}
      noConnect={["pin21", "pin28", "pin29"]}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.GND", pin4: "net.PD_1V5", pin5: "net.CC_FAULT_N", pin6: "net.GND", pin7: "net.EPR_EN", pin8: "net.PD_SDA", pin9: "net.PD_SCL", pin10: "net.PD_IRQ_N", pin11: "net.GND", pin12: "net.GND", pin13: "net.GND", pin14: "net.GND", pin15: "net.EEP_SDA", pin16: "net.EEP_SCL", pin17: "net.EEP_IRQ_N", pin18: "net.GND", pin19: "net.GND", pin20: "net.PD_PATH_HV", pin22: "net.GND", pin23: "net.GND", pin24: "net.CC1_PD", pin25: "net.CC2_PD", pin26: "net.VBUS_LV", pin27: "net.VBUS_LV", pin30: "net.GND", pin31: "net.GND", pin32: "net.V3V3", pin33: "net.GND" }} />
    <BSS123LT1G name="Q1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={21.69} schY={4} pcbX={-24.0} pcbY={40.5}
      connections={{ gate: "net.EPR_BLK_GATE", source: "net.VBUS_LV", drain: "net.USB_VBUS" }} />
    <capacitor name="C1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={25} schY={4} pcbX={-27.0} pcbY={16.0} layer="bottom"
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.CC_VBIAS", pin2: "net.GND" }} />
    <capacitor name="C2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={28} schY={4} pcbX={-29.6} pcbY={28.8} pcbRotation={90}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U1 > .pin10"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-8} pcbX={-24.0} pcbY={28.0}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC1_PD", pin2: "net.GND" }} />
    <capacitor name="C4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={3.5} schY={-8} pcbX={-21.5} pcbY={20.0}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC2_PD", pin2: "net.GND" }} />
    <capacitor name="C5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={10.85} schY={-8} pcbX={-18.5} pcbY={25.5}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VBUS_LV", pin2: "net.GND" }} />
    <capacitor name="C6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={3} schY={-20} pcbX={-28.0} pcbY={20.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin32"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={29.5} schY={4} pcbX={-26.0} pcbY={19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin1"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={11.23} schY={-9.8} pcbX={-24.0} pcbY={19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin4"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_1V5", pin2: "net.GND" }} />
    <resistor name="R1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={22.31} schY={2.2} pcbX={-18.0} pcbY={36.0} pcbRotation={180} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.CC_FAULT_N" }} />
    <resistor name="R2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U1" schX={25} schY={2.2} pcbX={-34.0} pcbY={22.0} layer="bottom"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EPR_EN", pin2: "net.GND" }} />
    <M24512_RMN6TP name="U3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={17} schY={-12} pcbX={-19} pcbY={34}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.EEP_SDA", pin6: "net.EEP_SCL", pin7: "net.GND", pin8: "net.PD_3V3" }} />
    <capacitor name="C9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={31} schY={4} pcbX={-23.75} pcbY={36.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U3 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <resistor name="R3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={25} schY={-8} pcbX={-24.0} pcbY={34.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SDA" }} />
    <resistor name="R4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={28} schY={-8} pcbX={-14.0} pcbY={34.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SCL" }} />
    <resistor name="R5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={22} schY={-9.8} pcbX={-24.0} pcbY={32.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_IRQ_N" }} />
    <resistor name="R6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-11.6} pcbX={-34.0} pcbY={21.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SDA" }} />
    <resistor name="R7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={8} schY={-11.6} pcbX={-20.0} pcbY={31.0} layer="bottom"
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SCL" }} />
    <resistor name="R8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={10.93} schY={-11.6} pcbX={-20.5} pcbY={28.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_IRQ_N" }} />
    <resistor name="R9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-13.4} pcbX={-24.0} pcbY={30.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_PATH_HV", pin2: "net.PD_LEVEL_BASE" }} />
    <resistor name="R10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={7.84} schY={-13.4} pcbX={-21.5} pcbY={18.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_LEVEL_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={11.17} schY={-13.4} pcbX={-17.5} pcbY={20.0}
      connections={{ base: "net.PD_LEVEL_BASE", emitter: "net.GND", collector: "net.PD_PATH_N" }} />
    <resistor name="R11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-15.2} pcbX={-14.0} pcbY={30.0} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.PD_PATH_N" }} />
    <resistor name="R12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={8} schY={-15.2} pcbX={-25.0} pcbY={16.5} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.PD_PATH_N", pin2: "net.PD_INV_BASE" }} />
    <MMBT5551LT1G name="Q3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={9.5} schY={-16.5} pcbX={-29.5} pcbY={16.5}
      connections={{ base: "net.PD_INV_BASE", emitter: "net.GND", collector: "net.PD_PATH_OK" }} />
    <resistor name="R13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-17} pcbX={-17.0} pcbY={28.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.PD_PATH_OK" }} />
    <SN74LVC1G08DBVR name="U4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={0} schY={-24} pcbX={-12} pcbY={24}
      connections={{ pin1: "net.PD_PATH_OK", pin2: "net.POWER_PERMIT", pin3: "net.GND", pin4: "net.EFUSE_EN", pin5: "net.V3V3" }} />
    <resistor name="R14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={6} schY={-20} pcbX={-12.0} pcbY={21.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.POWER_PERMIT", pin2: "net.GND" }} />
    <resistor name="R15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={8} schY={-20} pcbX={-12.0} pcbY={27.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EFUSE_EN", pin2: "net.GND" }} />
    <capacitor name="C10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={4.5} schY={-20} pcbX={-16.0} pcbY={23.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U4 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* POWER */}
    <LMR36510ADDAR name="U5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={0} schY={0} pcbX={-25} pcbY={7} layer="bottom"
      connections={{ pin1: "net.GND", pin2: "net.USB_VBUS", pin3: "net.USB_VBUS", pin4: "net.LOGIC_PG", pin5: "net.BUCK_FB", pin6: "net.BUCK_VCC", pin7: "net.BUCK_BOOT", pin8: "net.BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L1" schX={17} schY={0} pcbX={-15} pcbY={7} layer="bottom"
      connections={{ pin1: "net.BUCK_SW", pin2: "net.V3V3_USB" }} />
    <capacitor name="C11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={5} schY={4} pcbX={-21.0} pcbY={8.5} pcbRotation={90} layer="bottom"
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.USB_VBUS", pin2: "net.GND" }} />
    <capacitor name="C12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={6.5} schY={4} pcbX={-22.3} pcbY={1.5} layer="bottom"
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U5 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.USB_VBUS", pin2: "net.GND" }} />
    <capacitor name="C13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={11} schY={4} pcbX={-30.0} pcbY={7.0} layer="bottom"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={4.75} schY={2.2} pcbX={-30.0} pcbY={5.0} layer="bottom"
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BUCK_BOOT", pin2: "net.BUCK_SW" }} />
    <capacitor name="C15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L1" schX={21.17} schY={4} pcbX={-15.0} pcbY={12.0} layer="bottom"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <capacitor name="C16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L1" schX={22.38} schY={4} pcbX={-19.0} pcbY={12.0} pcbRotation={180} layer="bottom"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <capacitor name="C17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L1" schX={21.73} schY={2.8} pcbX={-11.0} pcbY={12.0} layer="bottom"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <resistor name="R16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={8.32} schY={2.2} pcbX={-30.0} pcbY={9.0} layer="bottom"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.BUCK_FB" }} />
    <resistor name="R17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={11} schY={2.2} pcbX={-19.0} pcbY={1.5} layer="bottom"
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={5.25} schY={0.4} pcbX={-30.0} pcbY={3.0} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.LOGIC_PG" }} />
    <LMR36510ADDAR name="U22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={0} schY={-12} pcbX={-15} pcbY={10}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin4: "net.MOTOR_LOGIC_PG", pin5: "net.MOTOR_BUCK_FB", pin6: "net.MOTOR_BUCK_VCC", pin7: "net.MOTOR_BUCK_BOOT", pin8: "net.MOTOR_BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L2" schX={17} schY={-12} pcbX={-6} pcbY={15}
      connections={{ pin1: "net.MOTOR_BUCK_SW", pin2: "net.V3V3_MOTOR" }} />
    <capacitor name="C62" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={5} schY={-8} pcbX={-15.0} pcbY={16.0}
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C63" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={6.5} schY={-8} pcbX={-15.75} pcbY={4.0}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U22 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C64" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={11} schY={-8} pcbX={-18.5} pcbY={4.5}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.MOTOR_BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C65" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={4.75} schY={-9.8} pcbX={-20.0} pcbY={14.5}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.MOTOR_BUCK_BOOT", pin2: "net.MOTOR_BUCK_SW" }} />
    <capacitor name="C66" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L2" schX={21.11} schY={-8} pcbX={-6.0} pcbY={10.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C67" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L2" schX={22.6} schY={-8} pcbX={-6.0} pcbY={20.0} pcbRotation={180}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C68" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_L2" schX={21.76} schY={-9.2} pcbX={-2.0} pcbY={20.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <resistor name="R102" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={8.32} schY={-9.8} pcbX={-18.5} pcbY={2.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_BUCK_FB" }} />
    <resistor name="R103" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={11} schY={-9.8} pcbX={-13.5} pcbY={18.5} pcbRotation={180}
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.MOTOR_BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R104" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={5.25} schY={-11.6} pcbX={-6.5} pcbY={7.5}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_LOGIC_PG" }} />
    <LM66100DCKR name="U23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={0} schY={-24} pcbX={-27.0} pcbY={1.0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND", pin3: "net.V3V3", pin5: "net.GND", pin6: "net.V3V3" }} />
    <LM66100DCKR name="U24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U24" schX={17} schY={-16} pcbX={-10} pcbY={8}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND", pin3: "net.V3V3", pin5: "net.GND", pin6: "net.V3V3" }} />
    <capacitor name="C69" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={22.93} schY={2.8} pcbX={-27.75} pcbY={-2.75}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U23 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <capacitor name="C70" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U24" schX={22.7} schY={-9.2} pcbX={-10.75} pcbY={4.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U24 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C71" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={8} schY={-20} pcbX={-27.0} pcbY={-4.0} layer="bottom"
      schRotation={-90}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <CSD19534Q5A name="Q4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_Q4" schX={0} schY={0} pcbX={-8} pcbY={33}
      connections={{ source: "net.USB_VBUS", gate: "net.BLOCK_GATE", drain: "net.EFUSE_IN" }} />
    <BSS123LT1G name="Q5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_Q4" schX={5} schY={4} pcbX={-8.0} pcbY={39.5}
      connections={{ gate: "net.BLOCK_FAST_GATE", source: "net.USB_VBUS", drain: "net.BLOCK_GATE" }} />
    <TPS26631RGER name="U6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={17} schY={0} pcbX={1} pcbY={25}
      noConnect={["pin11", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24"]}
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.EFUSE_IN", pin3: "net.BLOCK_GATE", pin4: "net.BLOCK_FAST_GATE", pin5: "net.USB_VBUS", pin6: "net.UVLO_DIV", pin7: "net.OVP_DIV", pin8: "net.GND", pin9: "net.SLEW_CAP", pin10: "net.ILIM_SET", pin12: "net.EFUSE_EN", pin13: "net.IIN_MON", pin14: "net.EFUSE_FAULT_N", pin15: "net.PG_DIV", pin16: "net.MOTOR_PG", pin17: "net.VMOTOR", pin18: "net.VMOTOR", pin25: "net.GND" }} />
    <resistor name="R19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={22} schY={4} pcbX={1.5} pcbY={21.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.USB_VBUS", pin2: "net.UVLO_MID" }} />
    <resistor name="R20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={4} pcbX={3.0} pcbY={29.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.UVLO_MID", pin2: "net.UVLO_DIV" }} />
    <resistor name="R21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={4} pcbX={-3.5} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.UVLO_DIV", pin2: "net.GND" }} />
    <resistor name="R22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={21.29} schY={2.2} pcbX={5.5} pcbY={25.0}
      schRotation={-90}
      resistance="220" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22962"] }}
      connections={{ pin1: "net.USB_VBUS", pin2: "net.OVP_TOP" }} />
    <resistor name="R23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={2.2} pcbX={-3.5} pcbY={23.0} pcbRotation={180}
      resistance="430k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25969"] }}
      connections={{ pin1: "net.OVP_TOP", pin2: "net.OVP_DIV" }} />
    <resistor name="R24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={2.2} pcbX={-3.5} pcbY={27.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.OVP_DIV", pin2: "net.GND" }} />
    <resistor name="R25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={21.94} schY={0.4} pcbX={5.5} pcbY={23.0}
      schRotation={-90}
      resistance="4.02k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C141679"] }}
      connections={{ pin1: "net.ILIM_SET", pin2: "net.GND" }} />
    <capacitor name="C18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={0.4} pcbX={5.5} pcbY={27.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.SLEW_CAP", pin2: "net.GND" }} />
    <resistor name="R26" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={0.4} pcbX={5.0} pcbY={21.0}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.IIN_MON", pin2: "net.GND" }} />
    <capacitor name="C19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={22.24} schY={-1.4} pcbX={1.5} pcbY={19.0} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.IIN_MON", pin2: "net.GND" }} />
    <resistor name="R27" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={-1.4} pcbX={5.0} pcbY={19.0} pcbRotation={180}
      schRotation={-90}
      resistance="360k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23146"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.PG_DIV" }} />
    <resistor name="R28" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={27.67} schY={-1.4} pcbX={-7.0} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.PG_DIV", pin2: "net.GND" }} />
    <resistor name="R29" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={22.54} schY={-3.2} pcbX={1.0} pcbY={17.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.MOTOR_PG" }} />
    <resistor name="R30" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={-3.2} pcbX={9.0} pcbY={25.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.EFUSE_FAULT_N" }} />
    <capacitor name="C20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28.33} schY={-3.2} pcbX={-7.0} pcbY={23.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.GND" }} />
    <capacitor name="C21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={21.44} schY={-7} pcbX={-1.25} pcbY={29.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U6 > .pin17"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_C22" schX={22.78} schY={-7} pcbX={30} pcbY={22} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_C23" schX={22.09} schY={-8.2} pcbX={32} pcbY={8} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <resistor name="R31" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={24.67} schY={-5} pcbX={-7.0} pcbY={27.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.VMON_MID" }} />
    <resistor name="R32" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={-5} pcbX={9.0} pcbY={23.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMON_MID", pin2: "net.VMON_ADC" }} />
    <resistor name="R33" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={26.8} schY={-6.8} pcbX={9.0} pcbY={27.0} pcbRotation={180}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />
    <capacitor name="C24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25.33} schY={-6.8} pcbX={8.5} pcbY={21.0} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />

    {/* MOTION */}
    <TMC5160A_TA_T name="U7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={0} schY={0} pcbX={8} pcbY={5}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.BOOT_B1", pin3: "net.TMC_12V", pin4: "net.VMOTOR", pin5: "net.TMC_5V", pin6: "net.GND", pin7: "net.GND", pin8: "net.SENSE_A", pin9: "net.SENSE_B", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin13: "net.TMC_CS_N", pin14: "net.SPI_SCK", pin15: "net.SPI_MOSI", pin16: "net.SPI_MISO", pin17: "net.REFL_STEP", pin18: "net.REFR_DIR", pin19: "net.GND", pin20: "net.V3V3", pin21: "net.SD_MODE", pin22: "net.V3V3", pin23: "net.ENC_B", pin24: "net.ENC_A", pin25: "net.ENC_I", pin26: "net.TMC_DIAG0", pin27: "net.TMC_DIAG1", pin28: "net.DRV_EN_N", pin29: "net.TMC_VCC", pin30: "net.GND", pin31: "net.TMC_CPO", pin32: "net.TMC_CPI", pin33: "net.VMOTOR", pin34: "net.TMC_VCP", pin35: "net.BOOT_A2", pin36: "net.GH_A2_DRV", pin37: "net.MOTOR_A2", pin38: "net.GL_A2_DRV", pin39: "net.GL_A1_DRV", pin40: "net.MOTOR_A1", pin41: "net.GH_A1_DRV", pin42: "net.BOOT_A1", pin43: "net.BOOT_B2", pin44: "net.GH_B2_DRV", pin45: "net.MOTOR_B2", pin46: "net.GL_B2_DRV", pin47: "net.GL_B1_DRV", pin48: "net.MOTOR_B1", pin49: "net.GND" }} />
    <capacitor name="C25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={4} pcbX={4.5} pcbY={-2.0}
      schRotation={-90}
      pcbRotation={270}
      capacitance="4.7uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C1779"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin3"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C26" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={-4} schY={4} pcbX={8.0} pcbY={-0.8} layer="bottom"
      schRotation={-90}
      pcbRotation={270}
      capacitance="4.7uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C19666"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin5"
      maxVoltageRating="16V"
      connections={{ pin1: "net.TMC_5V", pin2: "net.GND" }} />
    <resistor name="R34" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={-5.5} schY={4} pcbX={-4.5} pcbY={5.0}
      schRotation={-90}
      resistance="2.2" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22939"] }}
      connections={{ pin1: "net.TMC_5V", pin2: "net.TMC_VCC" }} />
    <capacitor name="C27" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={2.2} pcbX={9} pcbY={12.0}
      schRotation={-90}
      pcbRotation={90}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin29"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_VCC", pin2: "net.GND" }} />
    <capacitor name="C28" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={20} schY={7} pcbX={14.1} pcbY={5.75} pcbRotation={270}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin20"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C29" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={10.85} schY={2.2} pcbX={6.75} pcbY={11.8}
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin33"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C30" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={0.4} pcbX={4.5} pcbY={16.0}
      capacitance="22nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C107137"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_CPO", pin2: "net.TMC_CPI" }} />
    <capacitor name="C31" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={0.4} pcbX={-4.5} pcbY={3.0} schRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_VCP", pin2: "net.VMOTOR" }} />
    <capacitor name="C61" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={12.05} schY={2.2} pcbX={7} pcbY={-1.05}
      schRotation={-90}
      pcbRotation={0}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin4"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <resistor name="R35" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={-1.4} pcbX={3.0} pcbY={-5.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TMC_CS_N" }} />
    <resistor name="R36" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={-1.4} pcbX={14.9} pcbY={10.5}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.SD_MODE", pin2: "net.GND" }} />
    <resistor name="R37" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={3.55} schY={-5} pcbX={11.5} pcbY={14.5} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DRV_EN_N" }} />
    <CSD19534Q5A name="Q6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={0} schY={0} pcbX={16} pcbY={16}
      connections={{ source: "net.MOTOR_A1", gate: "net.GH_A1", drain: "net.VMOTOR" }} />
    <CSD19534Q5A name="Q7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={17} schY={0} pcbX={19.5} pcbY={7}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A1", drain: "net.MOTOR_A1" }} />
    <resistor name="R38" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={4} schY={2.5} pcbX={11.5} pcbY={16.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A1_DRV", pin2: "net.GH_A1" }} />
    <resistor name="R39" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={21} schY={2.5} pcbX={23.95} pcbY={7.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A1_DRV", pin2: "net.GL_A1" }} />
    <resistor name="R40" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={5.5} schY={2.5} pcbX={21.0} pcbY={16.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A1", pin2: "net.MOTOR_A1" }} />
    <resistor name="R41" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={22.5} schY={2.5} pcbX={23.95} pcbY={5.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A1", pin2: "net.SENSE_A" }} />
    <capacitor name="C32" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={-3.2} pcbX={15.5} pcbY={1.5}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_A1", pin2: "net.MOTOR_A1" }} />
    <CSD19534Q5A name="Q8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={0} schY={-12} pcbX={24} pcbY={-8}
      connections={{ source: "net.MOTOR_A2", gate: "net.GH_A2", drain: "net.VMOTOR" }} />
    <CSD19534Q5A name="Q9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={17} schY={-12} pcbX={24} pcbY={-17}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A2", drain: "net.MOTOR_A2" }} />
    <resistor name="R42" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={4} schY={-9.5} pcbX={24.0} pcbY={-2.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A2_DRV", pin2: "net.GH_A2" }} />
    <resistor name="R43" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={21} schY={-9.5} pcbX={24.0} pcbY={-27.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A2_DRV", pin2: "net.GL_A2" }} />
    <resistor name="R44" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={5.5} schY={-9.5} pcbX={27.5} pcbY={-2.5}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A2", pin2: "net.MOTOR_A2" }} />
    <resistor name="R45" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={22.5} schY={-9.5} pcbX={20.5} pcbY={-27.5} pcbRotation={180}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A2", pin2: "net.SENSE_A" }} />
    <capacitor name="C33" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={-3.2} pcbX={8.0} pcbY={16.0}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_A2", pin2: "net.MOTOR_A2" }} />
    <CSD19534Q5A name="Q10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={0} schY={0} pcbX={16} pcbY={-7}
      connections={{ source: "net.MOTOR_B1", gate: "net.GH_B1", drain: "net.VMOTOR" }} />
    <CSD19534Q5A name="Q11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={17} schY={0} pcbX={16} pcbY={-16}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B1", drain: "net.MOTOR_B1" }} />
    <resistor name="R46" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={4} schY={2.5} pcbX={11.0} pcbY={-7.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.GH_B1" }} />
    <resistor name="R47" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={21} schY={2.5} pcbX={11.0} pcbY={-16.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B1_DRV", pin2: "net.GL_B1" }} />
    <resistor name="R48" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={5.5} schY={2.5} pcbX={11.0} pcbY={-9.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B1", pin2: "net.MOTOR_B1" }} />
    <resistor name="R49" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={22.5} schY={2.5} pcbX={11.0} pcbY={-18.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B1", pin2: "net.SENSE_B" }} />
    <capacitor name="C34" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={11} schY={-3.2} pcbX={-4.0} pcbY={-5.0}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_B1", pin2: "net.MOTOR_B1" }} />
    <CSD19534Q5A name="Q12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={0} schY={-12} pcbX={32} pcbY={-8}
      connections={{ source: "net.MOTOR_B2", gate: "net.GH_B2", drain: "net.VMOTOR" }} />
    <CSD19534Q5A name="Q13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={17} schY={-12} pcbX={32} pcbY={-17}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B2", drain: "net.MOTOR_B2" }} />
    <resistor name="R50" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={4} schY={-9.5} pcbX={37.0} pcbY={-8.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B2_DRV", pin2: "net.GH_B2" }} />
    <resistor name="R51" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={21} schY={-9.5} pcbX={37.0} pcbY={-17.0}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B2_DRV", pin2: "net.GL_B2" }} />
    <resistor name="R52" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={5.5} schY={-9.5} pcbX={37.0} pcbY={-10.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B2", pin2: "net.MOTOR_B2" }} />
    <resistor name="R53" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={22.5} schY={-9.5} pcbX={37.0} pcbY={-19.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B2", pin2: "net.SENSE_B" }} />
    <capacitor name="C35" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5.46} schY={-5} pcbX={10.0} pcbY={-4.5} schOrientation="vertical"
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_B2", pin2: "net.MOTOR_B2" }} />
    <HoLLR2512_3W_33mR_1_ name="R109" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_R109" schX={0} schY={-24} schRotation={-90} pcbX={20} pcbY={-24}
      connections={{ pin1: "net.SENSE_A", pin2: "net.GND" }} />
    <HoLLR2512_3W_33mR_1_ name="R110" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_R110" schX={0} schY={-24} schRotation={-90} pcbX={31} pcbY={-24}
      connections={{ pin1: "net.SENSE_B", pin2: "net.GND" }} />
    <B4P_VH_LF__SN_ name="J2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_J2" schX={17} schY={-24} pcbX={20} pcbY={-39}
      connections={{ pin1: "net.MOTOR_A1", pin2: "net.MOTOR_A2", pin3: "net.MOTOR_B1", pin4: "net.MOTOR_B2" }} />
    <A_74LVC1G157GW_125 name="U8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U8" schX={17} schY={0} pcbX={4} pcbY={-8}
      connections={{ pin1: "net.STEP_IN", pin2: "net.GND", pin3: "net.STOP_L", pin4: "net.REFL_STEP", pin5: "net.V3V3", pin6: "net.SD_MODE" }} />
    <A_74LVC1G157GW_125 name="U9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U9" schX={0} schY={-12} pcbX={8} pcbY={-13}
      connections={{ pin1: "net.DIR_IN", pin2: "net.GND", pin3: "net.STOP_R", pin4: "net.REFR_DIR", pin5: "net.V3V3", pin6: "net.SD_MODE" }} />
    <capacitor name="C36" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U8" schX={21.2} schY={7} pcbX={0.25} pcbY={-8.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U8 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C37" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U9" schX={22.4} schY={7} pcbX={4.25} pcbY={-13.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U9 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <SN74LVC1G08DBVR name="U10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={17} schY={-12} pcbX={-4} pcbY={-9}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.MOTOR_PG", pin3: "net.GND", pin4: "net.RUN_PG", pin5: "net.V3V3" }} />
    <SN74LVC1G08DBVR name="U11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={0} schY={-24} pcbX={-4} pcbY={-14}
      connections={{ pin1: "net.RUN_PG", pin2: "net.VMOTOR_OK", pin3: "net.GND", pin4: "net.RUN_SAFE", pin5: "net.V3V3" }} />
    <capacitor name="C38" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={23.6} schY={7} pcbX={-8.0} pcbY={-10.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U10 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C39" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={24.8} schY={7} pcbX={-8.0} pcbY={-15.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U11 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R54" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={20.5} schY={-8} pcbX={0.0} pcbY={-10.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.GND" }} />
    <resistor name="R55" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={8} schY={-20} pcbX={-4.0} pcbY={-17.0}
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.RUN_SAFE", pin2: "net.RUN_BASE" }} />
    <resistor name="R56" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={3} schY={-20} pcbX={0.0} pcbY={-14.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.RUN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={3.45} schY={-21.8} pcbX={1.0} pcbY={-17.0} pcbRotation={180}
      connections={{ base: "net.RUN_BASE", emitter: "net.ENABLE_CHAIN", collector: "net.DRV_EN_N" }} />
    <MMBT5551LT1G name="Q15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={7.86} schY={-21.8} pcbX={-4.0} pcbY={-20.0}
      connections={{ base: "net.HW_ENABLE_BASE", emitter: "net.GND", collector: "net.ENABLE_CHAIN" }} />
    <resistor name="R57" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={12.7} schY={-21.8} pcbX={-8.0} pcbY={-13.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.HW_ENABLE_24V", pin2: "net.HW_ENABLE_BASE" }} />
    <resistor name="R58" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={5} schY={-23.6} pcbX={0.0} pcbY={-12.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.HW_ENABLE_BASE", pin2: "net.GND" }} />
    <BAV21W_7_F name="D1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={8} schY={-23.6} pcbX={-4.0} pcbY={-23.5}
      schRotation={90}
      connections={{ pin1: "net.HW_ENABLE_BASE", pin2: "net.GND" }} />

    {/* BRAKE */}
    <TL431AIDBZR name="U12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U12" schX={0} schY={0} schWidth={2.34} pcbX={3} pcbY={-24}
      connections={{ pin1: "net.VREF_2V495", pin2: "net.VREF_2V495", pin3: "net.GND" }} />
    <resistor name="R59" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U12" schX={5} schY={4} pcbX={3.0} pcbY={-27.0}
      schRotation={-90}
      resistance="220" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22962"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.VREF_2V495" }} />
    <TLV3201AIDBVR name="U13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={17} schY={0} pcbX={9} pcbY={-22}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.GND", pin3: "net.BRAKE_SENSE", pin4: "net.VREF_2V495", pin5: "net.V3V3" }} />
    <resistor name="R60" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={21.67} schY={4} pcbX={7.5} pcbY={-19.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_MID" }} />
    <resistor name="R61" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={23.83} schY={4} pcbX={13.0} pcbY={-22.0}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.BRAKE_MID", pin2: "net.BRAKE_SENSE" }} />
    <resistor name="R62" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={25} schY={4} pcbX={12.0} pcbY={-25.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.BRAKE_SENSE", pin2: "net.GND" }} />
    <resistor name="R63" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={22} schY={2.2} pcbX={7.5} pcbY={-17.0}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.BRAKE_SENSE" }} />
    <capacitor name="C40" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={20} schY={1} pcbX={5.0} pcbY={-21.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U13 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <TLV3201AIDBVR name="U14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={0} schY={-12} pcbX={3} pcbY={-30}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND", pin3: "net.VREF_2V495", pin4: "net.MOTOR_OVP_SENSE", pin5: "net.V3V3" }} />
    <resistor name="R64" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={4.68} schY={-8} pcbX={-1.0} pcbY={-28.0}
      schRotation={-90}
      resistance="430k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25969"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.MOTOR_OVP_SENSE" }} />
    <resistor name="R65" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={8} schY={-8} pcbX={6.0} pcbY={-34.0}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.MOTOR_OVP_SENSE", pin2: "net.MOTOR_OVP_LOW" }} />
    <resistor name="R66" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={11} schY={-8} pcbX={-1.0} pcbY={-34.0} pcbRotation={180}
      schRotation={-90}
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.MOTOR_OVP_LOW", pin2: "net.GND" }} />
    <resistor name="R67" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={5.33} schY={-9.8} pcbX={-1.0} pcbY={-26.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.VMOTOR_OK", pin2: "net.GND" }} />
    <capacitor name="C41" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={21.2} schY={1} pcbX={2.5} pcbY={-33.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U14 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <UCC27511DBVR name="U15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={17} schY={-12} pcbX={16} pcbY={30}
      connections={{ pin1: "net.TMC_12V", pin2: "net.BRAKE_DRIVE", pin3: "net.BRAKE_DRIVE", pin4: "net.GND", pin5: "net.GND", pin6: "net.BRAKE_ON" }} />
    <capacitor name="C42" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={22} schY={-8} pcbX={16.0} pcbY={33.5}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C43" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={23.2} schY={-8} pcbX={15.0} pcbY={26.0}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U15 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <resistor name="R68" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={14} schY={-15.5} pcbX={17.5} pcbY={26.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.BRAKE_DRIVE", pin2: "net.BRAKE_GATE" }} />
    <resistor name="R69" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={15.5} schY={-15.5} pcbX={20.0} pcbY={28.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.BRAKE_GATE", pin2: "net.GND" }} />
    <CSD19534Q5A name="Q16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_Q16" schX={12} schY={-18} pcbX={8} pcbY={33}
      connections={{ source: "net.GND", gate: "net.BRAKE_GATE", drain: "net.BRAKE_RETURN" }} />
    <B2P_VH_LF__SN_ name="J3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_J3" schX={17} schY={-24} pcbX={0.0} pcbY={36.5} schPinArrangement={{ topSide: ["pin1"], bottomSide: ["pin2"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN" }} />

    {/* MCU */}
    <STM32G0B1 name="U16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={0} schY={0} pcbX={-20} pcbY={-12}
      connections={{ pin1: "net.STATUS_GPIO", pin2: "net.DIN0", pin3: "net.DIN1", pin4: "net.V3V3", pin5: "net.V3V3", pin6: "net.V3V3", pin7: "net.GND", pin8: "net.OSC_IN", pin9: "net.OSC_OUT", pin10: "net.NRST", pin11: "net.VMON_ADC", pin12: "net.IIN_MON", pin13: "net.RS485_TX", pin14: "net.RS485_RX", pin15: "net.TMC_CS_N", pin16: "net.SPI_SCK", pin17: "net.SPI_MISO", pin18: "net.SPI_MOSI", pin19: "net.USB_VBUS_SENSE", pin20: "net.PD_IRQ_N", pin21: "net.EFUSE_FAULT_N", pin22: "net.RS485_DE", pin23: "net.ENC_CS_N", pin24: "net.FLASH_CS_N", pin25: "net.STOP_L", pin26: "net.STOP_R", pin27: "net.HOME_IN", pin28: "net.SD_MODE", pin29: "net.RS232_TX", pin30: "net.STEP_IN", pin31: "net.DIR_IN", pin32: "net.RS232_RX", pin33: "net.USB_DM", pin34: "net.USB_DP", pin35: "net.SWDIO", pin36: "net.SWCLK", pin37: "net.MCU_RUN", pin38: "net.CAN_RX", pin39: "net.CAN_TX", pin40: "net.OUT0_DRIVE", pin41: "net.OUT1_DRIVE", pin42: "net.TMC_DIAG0", pin43: "net.MOTOR_PG", pin44: "net.POWER_PERMIT", pin45: "net.PD_SCL", pin46: "net.PD_SDA", pin47: "net.TMC_DIAG1", pin48: "net.VMOTOR_OK" }} />
    <capacitor name="C44" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={5} schY={6} pcbX={-20.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin6"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C45" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={6.2} schY={6} pcbX={-18.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C46" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={7.4} schY={6} pcbX={-22.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin4"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C47" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={5.6} schY={4.8} pcbX={-28.0} pcbY={-12.0} pcbRotation={180}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R70" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={-3.5} schY={4} pcbX={-12.5} pcbY={-12.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.NRST" }} />
    <capacitor name="C48" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={-3.5} schY={2} pcbX={-12.5} pcbY={-14.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    <resistor name="R71" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={4.84} schY={0} pcbX={-12.5} pcbY={-10.0}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DP_PROTECTED", pin2: "net.USB_DP" }} />
    <resistor name="R72" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={8.39} schY={0} pcbX={-27.5} pcbY={-14.5}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DM_PROTECTED", pin2: "net.USB_DM" }} />
    <X322516MLB4SI name="Y1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={0} schY={5.5} pcbX={-11} pcbY={-18}
      loadCapacitance="9pF"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND", pin3: "net.OSC_OUT", pin4: "net.GND" }} />
    <capacitor name="C49" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={-2} schY={6} pcbX={-15.0} pcbY={-19.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND" }} />
    <capacitor name="C50" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={2} schY={6} pcbX={-8.0} pcbY={-21.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_OUT", pin2: "net.GND" }} />
    <TS_1088_AR02016 name="SW1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_SW1" schX={5} schY={-3} pcbX={-14} pcbY={-40} pcbRotation={180} layer="top" schRotation={-90}
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    {/* Bottom-side service pads replace a bulky debug connector. */}
    <testpoint name="TP_SWD_3V3" schSheetName="mcu" schSectionName="mcu_U16" schX={-8} schY={-4.8} pcbX={-20} pcbY={-33} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3" }} />
    <testpoint name="TP_SWDIO" schSheetName="mcu" schSectionName="mcu_U16" schX={-6} schY={-4.8} pcbX={-17} pcbY={-33} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWDIO" }} />
    <testpoint name="TP_SWD_GND" schSheetName="mcu" schSectionName="mcu_U16" schX={-4} schY={-4.8} pcbX={-14} pcbY={-33} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />
    <testpoint name="TP_SWCLK" schSheetName="mcu" schSectionName="mcu_U16" schX={-8} schY={-6.2} pcbX={-20} pcbY={-30} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWCLK" }} />
    <testpoint name="TP_NRST" schSheetName="mcu" schSectionName="mcu_U16" schX={-6} schY={-6.2} pcbX={-17} pcbY={-30} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.NRST" }} />
    <testpoint name="TP_STATUS" schSheetName="mcu" schSectionName="mcu_U16" schX={-4} schY={-6.2} pcbX={-14} pcbY={-30} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.STATUS_GPIO" }} />
    <W25Q32JVSSIQ name="U17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={13} schY={-2.5} pcbX={-13} pcbY={-26}
      connections={{ pin1: "net.FLASH_CS_N", pin2: "net.SPI_MISO", pin3: "net.V3V3", pin4: "net.GND", pin5: "net.SPI_MOSI", pin6: "net.SPI_SCK", pin7: "net.V3V3", pin8: "net.V3V3" }} />
    <resistor name="R73" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={12} schY={1} pcbX={-8.0} pcbY={-26.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.FLASH_CS_N" }} />
    <capacitor name="C51" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={6.8} schY={4.8} pcbX={-17.25} pcbY={-23.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U17 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* ENCODER */}
    <AS5047P_ATSM name="U18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={0} schY={0} pcbX={0} pcbY={0} pcbRotation={180} layer="bottom"
      noConnect={["pin8", "pin9", "pin10"]}
      connections={{ pin1: "net.ENC_CS_N", pin2: "net.SPI_SCK", pin3: "net.SPI_MISO", pin4: "net.SPI_MOSI", pin5: "net.GND", pin6: "net.ENC_B", pin7: "net.ENC_A", pin11: "net.V3V3", pin12: "net.V3V3", pin13: "net.GND", pin14: "net.ENC_I" }} />
    <resistor name="R74" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={5} schY={4} pcbX={-8.0} pcbY={4.5} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.ENC_CS_N" }} />
    <capacitor name="C52" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={8} schY={4} pcbX={0.0} pcbY={-5.8} layer="bottom"
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U18 > .pin11"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C53" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={9.2} schY={4} pcbX={6.0} pcbY={-5.0} pcbRotation={180} layer="bottom"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    {/* Encoder observation remains available without a second field connector. */}
    <testpoint name="TP_ENC_3V3" schSheetName="encoder" schSectionName="encoder_U18" schX={17} schY={-4} pcbX={-12} pcbY={-34} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3" }} />
    <testpoint name="TP_ENC_A" schSheetName="encoder" schSectionName="encoder_U18" schX={19} schY={-4} pcbX={-9} pcbY={-34} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_A" }} />
    <testpoint name="TP_ENC_B" schSheetName="encoder" schSectionName="encoder_U18" schX={21} schY={-4} pcbX={-6} pcbY={-34} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_B" }} />
    <testpoint name="TP_ENC_I" schSheetName="encoder" schSectionName="encoder_U18" schX={23} schY={-4} pcbX={-3} pcbY={-34} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_I" }} />
    <testpoint name="TP_ENC_GND" schSheetName="encoder" schSectionName="encoder_U18" schX={25} schY={-4} pcbX={0} pcbY={-34} layer="bottom" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />

    {/* INTERFACES */}
    <TCAN332DR name="U19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={0} schY={0} pcbX={-32.0} pcbY={-23.5}
      noConnect={["pin5", "pin8"]}
      connections={{ pin1: "net.CAN_TX", pin2: "net.GND", pin3: "net.V3V3", pin4: "net.CAN_RX", pin6: "net.CAN_L", pin7: "net.CAN_H" }} />
    <capacitor name="C54" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={22} schY={7} pcbX={-31.4} pcbY={-28.5} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U19 > .pin3"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R75" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={4} schY={4} pcbX={-40.0} pcbY={-23.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.CAN_TX" }} />
    <SM24CANB_02HTG name="D2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={11} schY={4} pcbX={-27.0} pcbY={-26.5}
      connections={{ pin1: "net.CAN_H", pin2: "net.CAN_L", pin3: "net.GND" }} />
    <MAX3485EESA_T name="U20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={17} schY={0} pcbX={-22} pcbY={-26}
      connections={{ pin1: "net.RS485_RX", pin2: "net.RS485_DE", pin3: "net.RS485_DE", pin4: "net.RS485_TX", pin5: "net.GND", pin6: "net.RS485_A", pin7: "net.RS485_B", pin8: "net.V3V3" }} />
    <capacitor name="C55" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={23.1} schY={7} pcbX={-26.75} pcbY={-23.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U20 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R76" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={25} schY={4} pcbX={-22.0} pcbY={-31.5}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.RS485_DE", pin2: "net.GND" }} />
    <PSM712_LF_T7 name="D3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={28} schY={4} pcbX={-27.5} pcbY={-31.0}
      connections={{ pin1: "net.RS485_A", pin2: "net.RS485_B", pin3: "net.GND" }} />
    <MAX3232ESE_T name="U21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={0} schY={-12} pcbX={-35.5} pcbY={-10.5}
      noConnect={["pin7", "pin9"]}
      connections={{ pin1: "net.RS232_C1P", pin2: "net.RS232_VP", pin3: "net.RS232_C1N", pin4: "net.RS232_C2P", pin5: "net.RS232_C2N", pin6: "net.RS232_VN", pin8: "net.GND", pin10: "net.GND", pin11: "net.RS232_TX", pin12: "net.RS232_RX", pin13: "net.RS232_RX_CONN", pin14: "net.RS232_TX_CONN", pin15: "net.GND", pin16: "net.V3V3" }} />
    <capacitor name="C56" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={-4} schY={-10.8} pcbX={-35.5} pcbY={-16.0}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.RS232_C1P", pin2: "net.RS232_C1N" }} />
    <capacitor name="C57" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={-4} schY={-12.2} pcbX={-39.0} pcbY={-16.0}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.RS232_C2P", pin2: "net.RS232_C2N" }} />
    <capacitor name="C58" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={3} schY={-8.5} pcbX={-35.5} pcbY={-18.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.RS232_VP", pin2: "net.GND" }} />
    <capacitor name="C59" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={5} schY={-9.8} pcbX={-39.0} pcbY={-18.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.RS232_VN", pin2: "net.GND" }} />
    <capacitor name="C60" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={22.55} schY={5.8} pcbX={-39.5} pcbY={-5.2}
      schRotation={-90}
      pcbRotation={0}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U21 > .pin16"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <B8B_PH_K_S_LF__SN_ name="J6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_J6" schX={17} schY={-12} pcbX={-15.5} pcbY={-2.0}
      connections={{ pin1: "net.RS232_TX_CONN", pin2: "net.RS232_RX_CONN", pin3: "net.GND", pin4: "net.CAN_H", pin5: "net.CAN_L", pin6: "net.GND", pin7: "net.RS485_A", pin8: "net.RS485_B" }} />
    <B8B_PH_K_S_LF__SN_ name="J7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_J7" schX={17} schY={-36} pcbX={2.0} pcbY={-38.5}
      connections={{ pin1: "net.HOME_24V", pin2: "net.STOPL_24V", pin3: "net.STOPR_24V", pin4: "net.DIN0_24V", pin5: "net.DIN1_24V", pin6: "net.STEP_24V", pin7: "net.DIR_24V", pin8: "net.GND" }} />
    <MMBT5551LT1G name="Q17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={0} schY={0} pcbX={-7} pcbY={-31}
      connections={{ base: "net.DIN0_BASE", emitter: "net.GND", collector: "net.DIN0" }} />
    <resistor name="R77" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={5} schY={4} pcbX={-7.0} pcbY={-28.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIN0_24V", pin2: "net.DIN0_BASE" }} />
    <resistor name="R78" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={8} schY={4} pcbX={-4.5} pcbY={-34.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.DIN0_BASE", pin2: "net.GND" }} />
    <resistor name="R79" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={11} schY={4} pcbX={-11.0} pcbY={-32.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIN0" }} />
    <BAV21W_7_F name="D4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={9.5} schY={4} pcbX={-4.0} pcbY={-24.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.DIN0_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={17} schY={-1.3} pcbX={-2} pcbY={-31} pcbRotation={180}
      connections={{ base: "net.DIN1_BASE", emitter: "net.GND", collector: "net.DIN1" }} />
    <resistor name="R80" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={22} schY={4} pcbX={-4.5} pcbY={-26.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIN1_24V", pin2: "net.DIN1_BASE" }} />
    <resistor name="R81" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={25} schY={4} pcbX={0.0} pcbY={-21.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.DIN1_BASE", pin2: "net.GND" }} />
    <resistor name="R82" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={28} schY={4} pcbX={9.5} pcbY={-34.0} pcbRotation={180}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIN1" }} />
    <BAV21W_7_F name="D5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={26.5} schY={4} pcbX={4.0} pcbY={-24.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.DIN1_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={0} schY={-12} pcbX={8.0} pcbY={-31.0}
      connections={{ base: "net.STOP_L_BASE", emitter: "net.GND", collector: "net.STOP_L" }} />
    <resistor name="R83" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={5} schY={-8} pcbX={12.0} pcbY={-28.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STOPL_24V", pin2: "net.STOP_L_BASE" }} />
    <resistor name="R84" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={8} schY={-8} pcbX={13.0} pcbY={-34.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.STOP_L_BASE", pin2: "net.GND" }} />
    <resistor name="R85" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={11} schY={-8} pcbX={15.5} pcbY={-28.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STOP_L" }} />
    <BAV21W_7_F name="D6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={9.5} schY={-8} pcbX={10.0} pcbY={-24.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.STOP_L_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={17} schY={-12} pcbX={8.0} pcbY={-26.5}
      connections={{ base: "net.STOP_R_BASE", emitter: "net.GND", collector: "net.STOP_R" }} />
    <resistor name="R86" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={22} schY={-8} pcbX={16.5} pcbY={-34.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STOPR_24V", pin2: "net.STOP_R_BASE" }} />
    <resistor name="R87" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={25} schY={-8} pcbX={20.0} pcbY={-34.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.STOP_R_BASE", pin2: "net.GND" }} />
    <resistor name="R88" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={28} schY={-8} pcbX={4.0} pcbY={-11.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STOP_R" }} />
    <BAV21W_7_F name="D7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={26.5} schY={-8} pcbX={15.5} pcbY={-1.8}
      schRotation={90}
      connections={{ pin1: "net.STOP_R_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={0} schY={-24} pcbX={13} pcbY={-31}
      connections={{ base: "net.HOME_IN_BASE", emitter: "net.GND", collector: "net.HOME_IN" }} />
    <resistor name="R89" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={5} schY={-20} pcbX={23.5} pcbY={-34.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.HOME_24V", pin2: "net.HOME_IN_BASE" }} />
    <resistor name="R90" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={8} schY={-20} pcbX={27.0} pcbY={-31.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.HOME_IN_BASE", pin2: "net.GND" }} />
    <resistor name="R91" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={11} schY={-20} pcbX={34.0} pcbY={-12.0} pcbRotation={180} layer="bottom"
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.HOME_IN" }} />
    <BAV21W_7_F name="D8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={9.5} schY={-20} pcbX={38.0} pcbY={-9.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.HOME_IN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={17} schY={-24} pcbX={18} pcbY={-31}
      connections={{ base: "net.STEP_IN_BASE", emitter: "net.GND", collector: "net.STEP_IN" }} />
    <resistor name="R92" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={22} schY={-20} pcbX={38.0} pcbY={-6.0} pcbRotation={180} layer="bottom"
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STEP_24V", pin2: "net.STEP_IN_BASE" }} />
    <resistor name="R93" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={25} schY={-20} pcbX={34.0} pcbY={-3.0} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.STEP_IN_BASE", pin2: "net.GND" }} />
    <resistor name="R94" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={28} schY={-20} pcbX={34.0} pcbY={0.0} layer="bottom"
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STEP_IN" }} />
    <BAV21W_7_F name="D9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={26.5} schY={-20} pcbX={34.0} pcbY={-21.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.STEP_IN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={0} schY={-36} pcbX={23} pcbY={-31}
      connections={{ base: "net.DIR_IN_BASE", emitter: "net.GND", collector: "net.DIR_IN" }} />
    <resistor name="R95" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={5} schY={-32} pcbX={34.0} pcbY={3.0} pcbRotation={180} layer="bottom"
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIR_24V", pin2: "net.DIR_IN_BASE" }} />
    <resistor name="R96" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={8} schY={-32} pcbX={30.0} pcbY={-18.0} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.DIR_IN_BASE", pin2: "net.GND" }} />
    <resistor name="R97" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={11} schY={-32} pcbX={37.5} pcbY={-21.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIR_IN" }} />
    <BAV21W_7_F name="D10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={9.5} schY={-32} pcbX={38.0} pcbY={15.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.DIR_IN_BASE", pin2: "net.GND" }} />
    <B4B_PH_K_S_LF__SN_ name="J9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_J9" schX={0} schY={-12} pcbX={14} pcbY={39.5}
      connections={{ pin1: "net.VMOTOR", pin2: "net.HW_ENABLE_24V", pin3: "net.OUT0", pin4: "net.OUT1" }} />
    <MMBT5551LT1G name="Q24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={0} schY={0} pcbX={18} pcbY={-31} layer="bottom"
      connections={{ base: "net.OUT0_BASE", emitter: "net.GND", collector: "net.OUT0" }} />
    <resistor name="R98" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={-3} schY={0} pcbX={18} pcbY={-27.0} layer="bottom"
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.OUT0_DRIVE", pin2: "net.OUT0_BASE" }} />
    <resistor name="R99" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={-1.5} schY={-2} pcbX={22.0} pcbY={-31.0} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.OUT0_BASE", pin2: "net.GND" }} />
    <SS110 name="D11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={11} schY={4} pcbX={23.0} pcbY={30.0} layer="bottom"
      schRotation={90}
      connections={{ pin1: "net.VMOTOR", pin2: "net.OUT0" }} />
    <MMBT5551LT1G name="Q25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={17} schY={0} pcbX={27} pcbY={-31} layer="bottom"
      connections={{ base: "net.OUT1_BASE", emitter: "net.GND", collector: "net.OUT1" }} />
    <resistor name="R100" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={14} schY={0} pcbX={27.0} pcbY={-27.0} layer="bottom"
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.OUT1_DRIVE", pin2: "net.OUT1_BASE" }} />
    <resistor name="R101" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={15.5} schY={-2} pcbX={30.0} pcbY={-28.5} layer="bottom"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.OUT1_BASE", pin2: "net.GND" }} />
    <SS110 name="D12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={28} schY={4} pcbX={-16} pcbY={40}
      schRotation={90}
      connections={{ pin1: "net.VMOTOR", pin2: "net.OUT1" }} />
    {/* Local bypasses: <=3mm pad-to-pad placement, <=5mm routed path. */}
    <trace name="BYPASS_C2" from=".U1 > .pin10" to=".C2 > .pin1" pcbPathRelativeTo=".U1 > .pin10" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 1.499997, "y": 0.799719}, {"x": 2.0, "y": 1.8}, {"x": 0.4, "y": 3.475}]} />
    <trace name="BYPASS_C6" from=".U2 > .pin32" to=".C6 > .pin1" pcbPathRelativeTo=".U2 > .pin32" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -2.050034, "y": -1.400048}, {"x": -3.150034, "y": -1.400048}, {"x": -3.150034, "y": -2.925}, {"x": -4.0, "y": -2.925}]} />
    <trace name="BYPASS_C7" from=".U2 > .pin1" to=".C7 > .pin1" pcbPathRelativeTo=".U2 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.400048, "y": -2.050034}, {"x": -1.400048, "y": -3.150034}, {"x": -2.0, "y": -3.150034}, {"x": -2.0, "y": -3.925}]} />
    <trace name="BYPASS_C8" from=".U2 > .pin4" to=".C8 > .pin1" pcbPathRelativeTo=".U2 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.200152, "y": -2.050034}, {"x": -0.200152, "y": -3.150034}, {"x": 0.0, "y": -3.150034}, {"x": 0.0, "y": -3.925}]} />
    <trace name="BYPASS_C9" from=".U3 > .pin8" to=".C9 > .pin1" pcbPathRelativeTo=".U3 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.905, "y": 2.599944}, {"x": -1.905, "y": 3.699944}, {"x": -3.925, "y": 3.699944}, {"x": -3.925, "y": 2.5}]} />
    <trace name="BYPASS_C10" from=".U4 > .pin5" to=".C10 > .pin1" pcbPathRelativeTo=".U4 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.300099, "y": -0.94996}, {"x": -2.400099, "y": -0.94996}, {"x": -2.400099, "y": -1.0}, {"x": -3.175, "y": -1.0}]} />
    <trace name="BYPASS_C12" from=".U5 > .pin2" to=".C12 > .pin1" pcbPathRelativeTo=".U5 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 0.635, "y": -2.84607}, {"x": 1.875, "y": -5.5}]} />
    <trace name="BYPASS_C21" from=".U6 > .pin17" to=".C21 > .pin1" pcbPathRelativeTo=".U6 > .pin17" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.750062, "y": 1.941957}, {"x": -0.750062, "y": 3.041957}, {"x": -0.7875, "y": 3.041957}, {"x": -0.7875, "y": 4.5}]} />
    <trace name="BYPASS_C25" from=".U7 > .pin3" to=".C25 > .pin1" pcbPathRelativeTo=".U7 > .pin3" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.75006, "y": -4.19989}, {"x": -1.75006, "y": -5.35}, {"x": -3, "y": -5.35}, {"x": -3, "y": -6.0875}, {"x": -3.5, "y": -6.0875}]} />
    <trace name="BYPASS_C26" from=".U7 > .pin5" to=".C26 > .pin1" pcbPathRelativeTo=".U7 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.750062, "y": -4.19989}, {"x": -0.750062, "y": -5.2, "via": true, "fromLayer": "top", "toLayer": "bottom"}, {"x": 0.0, "y": -6.625}]} />
    <trace name="BYPASS_C27" from=".U7 > .pin29" to=".C27 > .pin1" pcbPathRelativeTo=".U7 > .pin29" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 0.750062, "y": 4.19989}, {"x": 0.750062, "y": 6.0875}, {"x": 1, "y": 6.0875}]} />
    <trace name="BYPASS_C28" from=".U7 > .pin20" to=".C28 > .pin1" pcbPathRelativeTo=".U7 > .pin20" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 4.19989, "y": 0.750062}, {"x": 6.1, "y": 0.750062}, {"x": 6.1, "y": 1.575}]} />
    <trace name="BYPASS_C29" from=".U7 > .pin33" to=".C29 > .pin1" pcbPathRelativeTo=".U7 > .pin33" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.249934, "y": 4.19989}, {"x": -1.25, "y": 5.975}]} />
    <trace name="BYPASS_C61" from=".U7 > .pin4" to=".C61 > .pin1" pcbPathRelativeTo=".U7 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.249934, "y": -4.19989}, {"x": -1.249934, "y": -5.8}, {"x": -1.825, "y": -6.05}]} />
    <trace name="BYPASS_C36" from=".U8 > .pin5" to=".C36 > .pin1" pcbPathRelativeTo=".U8 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.899922, "y": 0.0}, {"x": -1.999922, "y": 0.0}, {"x": -1.999922, "y": 0.0}, {"x": -2.925, "y": 0.0}]} />
    <trace name="BYPASS_C37" from=".U9 > .pin5" to=".C37 > .pin1" pcbPathRelativeTo=".U9 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.899922, "y": 0.0}, {"x": -1.999922, "y": 0.0}, {"x": -1.999922, "y": 0.0}, {"x": -2.925, "y": 0.0}]} />
    <trace name="BYPASS_C38" from=".U10 > .pin5" to=".C38 > .pin1" pcbPathRelativeTo=".U10 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.300099, "y": -0.94996}, {"x": -2.400099, "y": -0.94996}, {"x": -2.400099, "y": -1.0}, {"x": -3.175, "y": -1.0}]} />
    <trace name="BYPASS_C39" from=".U11 > .pin5" to=".C39 > .pin1" pcbPathRelativeTo=".U11 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.300099, "y": -0.94996}, {"x": -2.400099, "y": -0.94996}, {"x": -2.400099, "y": -1.0}, {"x": -3.175, "y": -1.0}]} />
    <trace name="BYPASS_C40" from=".U13 > .pin5" to=".C40 > .pin1" pcbPathRelativeTo=".U13 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.300099, "y": -0.94996}, {"x": -2.400099, "y": -0.94996}, {"x": -2.400099, "y": 1.0}, {"x": -3.175, "y": 1.0}]} />
    <trace name="BYPASS_C41" from=".U14 > .pin5" to=".C41 > .pin1" pcbPathRelativeTo=".U14 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.300099, "y": -0.94996}, {"x": -2.400099, "y": -0.94996}, {"x": -2.400099, "y": -3.0}, {"x": -1.325, "y": -3.0}]} />
    <trace name="BYPASS_C43" from=".U15 > .pin1" to=".C43 > .pin1" pcbPathRelativeTo=".U15 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.94996, "y": -1.149096}, {"x": -0.94996, "y": -2.249096}, {"x": -1.0, "y": -2.249096}, {"x": -1.0, "y": -3.175}]} />
    <trace name="BYPASS_C44" from=".U16 > .pin6" to=".C44 > .pin1" pcbPathRelativeTo=".U16 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.249936, "y": -4.249928}, {"x": -0.249936, "y": -5.349928}, {"x": -0.75, "y": -5.349928}, {"x": -0.75, "y": -6.425}]} />
    <trace name="BYPASS_C45" from=".U16 > .pin5" to=".C45 > .pin1" pcbPathRelativeTo=".U16 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.750062, "y": -4.249928}, {"x": -0.750062, "y": -5.349928}, {"x": 1.25, "y": -5.349928}, {"x": 1.25, "y": -6.425}]} />
    <trace name="BYPASS_C46" from=".U16 > .pin4" to=".C46 > .pin1" pcbPathRelativeTo=".U16 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.249934, "y": -4.249928}, {"x": -1.249934, "y": -5.349928}, {"x": -2.75, "y": -5.349928}, {"x": -2.75, "y": -6.425}]} />
    <trace name="BYPASS_C51" from=".U17 > .pin8" to=".C51 > .pin1" pcbPathRelativeTo=".U17 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.905, "y": 3.530092}, {"x": -1.905, "y": 4.630092}, {"x": -4.25, "y": 4.630092}, {"x": -4.25, "y": 3.575}]} />
    <trace name="BYPASS_C52" from=".U18 > .pin11" to=".C52 > .pin1" pcbPathRelativeTo=".U18 > .pin11" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 0, "y": 2.800096}, {"x": 0, "y": 4.975}]} />
    <trace name="BYPASS_C54" from=".U19 > .pin3" to=".C54 > .pin1" pcbPathRelativeTo=".U19 > .pin3" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": 0.635, "y": -2.599944}, {"x": 1.425, "y": -5.0}]} />
    <trace name="BYPASS_C55" from=".U20 > .pin8" to=".C55 > .pin1" pcbPathRelativeTo=".U20 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -1.905, "y": 2.599944}, {"x": -1.905, "y": 3.699944}, {"x": -3.925, "y": 3.699944}, {"x": -3.925, "y": 2.5}]} />
    <trace name="BYPASS_C60" from=".U21 > .pin16" to=".C60 > .pin1" pcbPathRelativeTo=".U21 > .pin16" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -4.445, "y": 2.73558}, {"x": -4.825, "y": 5.3}]} />
    <trace name="BYPASS_C63" from=".U22 > .pin2" to=".C63 > .pin1" pcbPathRelativeTo=".U22 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.635, "y": -2.84607}, {"x": -0.635, "y": -3.94607}, {"x": -0.75, "y": -3.94607}, {"x": -0.75, "y": -5.175}]} />
    <trace name="BYPASS_C69" from=".U23 > .pin1" to=".C69 > .pin1" pcbPathRelativeTo=".U23 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.649986, "y": -1.100074}, {"x": -0.649986, "y": -2.200074}, {"x": -0.75, "y": -2.200074}, {"x": -0.75, "y": -2.925}]} />
    <trace name="BYPASS_C70" from=".U24 > .pin1" to=".C70 > .pin1" pcbPathRelativeTo=".U24 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x": -0.649986, "y": -1.100074}, {"x": -0.649986, "y": -2.200074}, {"x": -0.75, "y": -2.200074}, {"x": -0.75, "y": -2.925}]} />
    <BoardMarkings />
    {/* Readable component references, placed clear of copper and adjacent labels. */}
    {/* Readable component references, placed clear of pads and adjacent labels. */}
    <silkscreentext text="Y1" pcbX={-11.0000} pcbY={-15.7500} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="SW1" pcbX={-14.0000} pcbY={-38.5000} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="J1 EPR + USB DATA" pcbX={-33.0} pcbY={21.0} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="J2 MOTOR" pcbX={20.0} pcbY={-36.0} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J6" pcbX={-15.5000} pcbY={-0.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J7" pcbX={2.0000} pcbY={-37.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J3" pcbX={0.0000} pcbY={38.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J9" pcbX={14.0000} pcbY={40.4500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U16" pcbX={-20.0000} pcbY={-6.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U7" pcbX={2.0000} pcbY={5.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U21" pcbX={-34.0000} pcbY={-0.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U17" pcbX={-16.2500} pcbY={-26.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U5" pcbX={-38.0000} pcbY={7.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U22" pcbX={-18.2500} pcbY={10.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U18 ENCODER" pcbX={0} pcbY={8} fontSize={0.8} anchorAlignment="center" layer="bottom" />
    <silkscreentext text="SWD TEST" pcbX={-17} pcbY={-28} fontSize={0.7} anchorAlignment="center" layer="bottom" />
    <silkscreentext text="ENC TEST" pcbX={-6} pcbY={-32} fontSize={0.7} anchorAlignment="center" layer="bottom" />
    <silkscreentext text="U3" pcbX={-21.7500} pcbY={34.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U19" pcbX={-35.2500} pcbY={-25.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U20" pcbX={-18.7500} pcbY={-26.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U2" pcbX={-27.2500} pcbY={23.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U6" pcbX={-0.5000} pcbY={22.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U1" pcbX={-36.5000} pcbY={23.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U4" pcbX={-9.2500} pcbY={24.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U11" pcbX={-4.0000} pcbY={-12.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U13" pcbX={10.0000} pcbY={-20.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U14" pcbX={5.0000} pcbY={-32.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U10" pcbX={-4.0000} pcbY={-7.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U12" pcbX={2.5000} pcbY={-22.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U15" pcbX={13.5000} pcbY={30.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U24" pcbX={-10.0000} pcbY={10.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U23" pcbX={-29.0000} pcbY={1.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U8" pcbX={4.0000} pcbY={-6.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U9" pcbX={8.0000} pcbY={-11.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="L1" pcbX={-25.0000} pcbY={10.0000} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="L2" pcbX={-6.0000} pcbY={18.0000} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="R109" pcbX={20.0000} pcbY={-21.7500} fontSize={0.7} anchorAlignment="center" layer="top" />
    <silkscreentext text="R110" pcbX={31.0000} pcbY={-21.7500} fontSize={0.7} anchorAlignment="center" layer="top" />
  </board>
)

export default PD1180EPR
