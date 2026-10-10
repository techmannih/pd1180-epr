import { TPS2553DBVR } from "./imports/TPS2553DBVR"
import { TLV75533PDBVR } from "./imports/TLV75533PDBVR"
import { TMP102AIDRLR } from "./imports/TMP102AIDRLR"
import { INA240A1DR } from "./imports/INA240A1DR"
import { FRM121WFR005TM } from "./imports/FRM121WFR005TM"
import { ADS1115IDGSR } from "./imports/ADS1115IDGSR"
import { B20B_PHDSS_LF__SN_ } from "./imports/B20B_PHDSS_LF__SN_"
import { TCAN332DR } from "./imports/TCAN332DR"
import { SS110 } from "./imports/SS110"
import { SM24CANB_02HTG } from "./imports/SM24CANB_02HTG"
import { PSM712_LF_T7 } from "./imports/PSM712_LF_T7"
import { MAX3485EESA_T } from "./imports/MAX3485EESA_T"
import { MAX3232ESE_T } from "./imports/MAX3232ESE_T"
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
import { TL431AIDBZR } from "./imports/TL431AIDBZR"
import { TLV3201AIDBVR } from "./imports/TLV3201AIDBVR"
import { TMC5160A_TA_T } from "./imports/TMC5160A_TA_T"
import { TPD4S480RUKR } from "./imports/TPD4S480RUKR"
import { TPS26631RGER } from "./imports/TPS26631RGER"
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
    defaultTraceWidth="0.25mm" minTraceWidth="0.15mm" minViaHoleDiameter="0.2mm" minViaPadDiameter="0.45mm"
    schAutoLayoutEnabled schTraceAutoLabelEnabled schMaxTraceDistance={0.8}
    autorouter="auto-local" autorouterEffortLevel="5x" autorouterVersion="beta_pipeline7" >
    {/* Four 4.191 mm STEP holes, rounded to the 4.2 mm fabrication drill. */}
    <hole name="H1" pcbX={38.4} pcbY={-24.5} diameter="4.2mm" />
    <hole name="H2" pcbX={24.5} pcbY={38.4} diameter="4.2mm" />
    <hole name="H3" pcbX={-38.4} pcbY={24.5} diameter="4.2mm" />
    <hole name="H4" pcbX={-24.5} pcbY={-38.4} diameter="4.2mm" />
    <schematicsheet name="usb-pd" displayName="USB-C PD POWER" sheetIndex={1} sheetWidth="400mm" sheetHeight="400mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="01 / USB-C PD POWER" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="J1: dedicated 48 V / 5 A EPR sink. USB DATA is on J10; the two VBUS rails are separate." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U1: 48 V CC/VBUS and unused SBU protection. U2: TPS26750 EPR sink controller. U3: PD policy EEPROM. U4: hardware power-permit gate." />
      <schematictext schX={-4} schY={5.1} fontSize={0.23} anchor="top_left" text="J1 D+/D-: not connected. Q1: protected VBUS control. Q2/Q3: PD-path level translation." />
    </schematicsheet>
    <schematicsheet name="logic-power" displayName="PD and Motor Backup Supplies" sheetIndex={2} sheetWidth="330mm" sheetHeight="335mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="02 / PD and Motor Backup Supplies" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="PD VBUS or DATA USB starts logic; the motor-bus buck retains brake-control backup after PD loss." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U5: PD 5-48 V buck. U22: VMOTOR backup buck. U23/U24 + R111: status-interlocked OR into board V3V3; U26/U27 power the separate MCU rail." />
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
      <schematictext schX={-8} schY={8.6} fontSize={0.26} anchor="top_left" text="3.3 V STM32G0B1; USB diagnostics, SWD, SPI motion control and external STEP/DIR." />
      <schematictext schX={-8} schY={7.8} fontSize={0.23} anchor="top_left" text="U16: system MCU with native USB, FDCAN and ADC monitoring. U17: 32 Mbit external SPI configuration/telemetry flash." />
    </schematicsheet>
    <schematicsheet name="encoder" displayName="Shaft Encoder and Monitor" sheetIndex={9} sheetWidth="335mm" sheetHeight="140mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="09 / Shaft Encoder and Monitor" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="AS5047P is centered on the PCB underside; shaft magnet alignment must be verified." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U18: 14-bit magnetic shaft encoder; SPI readout plus ABI incremental outputs and local 3.3 V filtering." />
    </schematicsheet>
    <schematicsheet name="usb-data" displayName="USB DATA and Attach Sense" sheetIndex={10} sheetWidth="380mm" sheetHeight="230mm">
      <schematictext schX={-7} schY={9} fontSize={0.6} anchor="top_left" text="10 / USB DATA and Attach Sense" />
      <schematictext schX={-7} schY={7.6} fontSize={0.26} anchor="top_left" text="J10: USB 2.0 DATA plus independent logic power. Separate CC pulldowns; no PD negotiation on this port." />
      <schematictext schX={-7} schY={6.8} fontSize={0.23} anchor="top_left" text="D15: D+/D-/CC ESD. R107/R108/C72: DATA VBUS attach sense. USB DATA cannot feed VMOTOR." />
    </schematicsheet>
    <schematicsheet name="inputs" displayName="24 V Inputs and Step/Direction" sheetIndex={11} sheetWidth="380mm" sheetHeight="435mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="11 / 24 V Inputs and Step/Direction" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="Non-isolated 24 V inputs. J7: keyed 20-pin harness combines all control I/O and industrial buses; pinout is in hardware-contract.json." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q17-Q23: HOME, limits, DIN0/1 and Step/Direction conditioners. Q14: hardware enable on the motion sheet." />
    </schematicsheet>
    <schematicsheet name="serial" displayName="CAN, RS485 and RS232" sheetIndex={12} sheetWidth="380mm" sheetHeight="230mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="12 / CAN, RS485 and RS232" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="External CAN/RS485 termination; J7 carries RS232, CAN and RS485." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="U19: 3.3 V CAN transceiver; D2: CAN TVS. U20: RS485 transceiver; D3: RS485 TVS. U21: RS232 transceiver." />
    </schematicsheet>
    <schematicsheet name="outputs" displayName="Hardware Enable and Outputs" sheetIndex={13} sheetWidth="360mm" sheetHeight="205mm">
      <schematictext schX={-4} schY={8} fontSize={0.6} anchor="top_left" text="13 / Hardware Enable and Outputs" />
      <schematictext schX={-4} schY={6.6} fontSize={0.26} anchor="top_left" text="J7: motor rail, 24 V hardware enable, OUT0 and OUT1. External loads need rating review." />
      <schematictext schX={-4} schY={5.8} fontSize={0.23} anchor="top_left" text="Q24/Q25: open-collector 24 V output drivers; base pulldowns keep outputs off during reset." />
    </schematicsheet>
    <schematicsection name="usb-data_J10" displayName="USB DATA / J10" />
    <schematicsheet name="usb-logic" displayName="USB Logic Power" sheetIndex={14} sheetWidth="320mm" sheetHeight="240mm">
      <schematictext schX={-5} schY={8} fontSize={0.6} anchor="top_left" text="14 / USB Logic Power" />
      <schematictext schX={-5} schY={6.6} fontSize={0.26} anchor="top_left" text="U28: DATA current limiter. U25: 3.3 V LDO. DATA powers MCU only; peripherals require board power." />
      <schematictext schX={-5} schY={5.8} fontSize={0.23} anchor="top_left" text="U26/U27: reverse-blocked V3V3_MCU. R119/R120 sense board power on PB1; PD status is polled." />
    </schematicsheet>
    <schematicsheet name="telemetry" displayName="Temperature and Current Diagnostics" sheetIndex={15} sheetWidth="370mm" sheetHeight="420mm">
      <schematictext schX={-5} schY={8} fontSize={0.6} anchor="top_left" text="15 / Temperature and Current Diagnostics" />
      <schematictext schX={-5} schY={6.6} fontSize={0.26} anchor="top_left" text="U29: power-stage temperature, address 0x48. U33: temperature hardware inhibit. U30: bus-monitor ADC, address 0x49." />
      <schematictext schX={-5} schY={5.8} fontSize={0.23} anchor="top_left" text="U31/U32: bidirectional winding telemetry, 20 V/V across 5 mOhm = 100 mV/A, centered at 1.65 V. Not a short-circuit trip." />
    </schematicsheet>
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
    <schematicsection name="usb-pd_U1" displayName="EPR Port Protection / U1" />
    <schematicsection name="usb-pd_U2" displayName="EPR PD Controller / U2" />
    <schematicsection name="usb-pd_U3" displayName="PD Configuration EEPROM / U3" />
    <schematicsection name="usb-pd_U4" displayName="PD Power-Path Gate / U4" />
    <schematicsection name="logic-power_U5" displayName="PD and Motor Backup Supplies / U5" />
    <schematicsection name="logic-power_L1" displayName="PD and Motor Backup Supplies / L1" />
    <schematicsection name="logic-power_U22" displayName="PD and Motor Backup Supplies / U22" />
    <schematicsection name="logic-power_L2" displayName="PD and Motor Backup Supplies / L2" />
    <schematicsection name="logic-power_U23" displayName="PD and Motor Backup Supplies / U23" />
    <schematicsection name="logic-power_U24" displayName="PD and Motor Backup Supplies / U24" />
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
    <schematicsection name="inputs_Q19" displayName="24 V Inputs and Step/Direction / Q19" />
    <schematicsection name="inputs_Q20" displayName="24 V Inputs and Step/Direction / Q20" />
    <schematicsection name="inputs_Q21" displayName="24 V Inputs and Step/Direction / Q21" />
    <schematicsection name="inputs_Q22" displayName="24 V Inputs and Step/Direction / Q22" />
    <schematicsection name="inputs_Q23" displayName="24 V Inputs and Step/Direction / Q23" />
    <schematicsection name="inputs_J7" displayName="24 V Inputs and Step/Direction / J7" />
    <schematicsection name="serial_U19" displayName="CAN, RS485 and RS232 / U19" />
    <schematicsection name="serial_U20" displayName="CAN, RS485 and RS232 / U20" />
    <schematicsection name="serial_U21" displayName="CAN, RS485 and RS232 / U21" />
    <schematicsection name="inputs_Q17" displayName="24 V Inputs and Step/Direction / Q17" />
    <schematicsection name="inputs_Q18" displayName="24 V Inputs and Step/Direction / Q18" />
    <schematicsection name="outputs_Q24" displayName="Hardware Enable and Outputs / Q24" />
    <schematicsection name="outputs_Q25" displayName="Hardware Enable and Outputs / Q25" />
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
    <net name="REFL_STEP" isPowerNet={false} />
    <net name="REFR_DIR" isPowerNet={false} />
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
    <net name="VREF_2V495" isPowerNet={false} />

    <net name="DATA_CC1" isPowerNet={false} />
    <net name="DATA_CC2" isPowerNet={false} />
    <net name="PD_SBU1_CONN" isPowerNet={false} />
    <net name="PD_SBU2_CONN" isPowerNet={false} />
    <net name="USB_DATA_VBUS" isPowerNet={true} />

    <net name="CAN_H" isPowerNet={false} />
    <net name="CAN_L" isPowerNet={false} />
    <net name="CAN_RX" isPowerNet={false} />
    <net name="CAN_TX" isPowerNet={false} />
    <net name="DIN0" isPowerNet={false} />
    <net name="DIN0_24V" isPowerNet={false} />
    <net name="DIN0_BASE" isPowerNet={false} />
    <net name="DIN1" isPowerNet={false} />
    <net name="DIN1_24V" isPowerNet={false} />
    <net name="DIN1_BASE" isPowerNet={false} />
    <net name="OUT0" isPowerNet={false} />
    <net name="OUT0_BASE" isPowerNet={false} />
    <net name="OUT0_DRIVE" isPowerNet={false} />
    <net name="OUT1" isPowerNet={false} />
    <net name="OUT1_BASE" isPowerNet={false} />
    <net name="OUT1_DRIVE" isPowerNet={false} />
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
    {/* Separate PD POWER and USB DATA ports; no shared VBUS or data paths. */}
    <USB4105_GF_A name="J1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={-5} schY={-3.5} pcbX={-36} pcbY={15}
      pcbRotation={270}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin11", "pin13", "pin12", "pin14", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schWidth={1.4}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin11: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin14: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin11", "pin12", "pin13", "pin14"]}

      connections={{ pin10: "net.PD_SBU1_CONN", pin16: "net.PD_SBU2_CONN", pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.PD_VBUS", pin8: "net.PD_VBUS", pin17: "net.PD_VBUS", pin18: "net.PD_VBUS", pin9: "net.CC2_CONN", pin15: "net.CC1_CONN" }} />
    <resistor name="R107" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={5} schY={0} pcbX={-22.25} pcbY={16.0}
      schRotation={-90}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.USB_VBUS_SENSE" }} pcbRotation={180} />
    <resistor name="R108" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={5} schY={-3} pcbX={-15.75} pcbY={18}
      schRotation={-90}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <capacitor name="C72" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={8} schY={-3} pcbX={-25.5} pcbY={14.75} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxVoltageRating="50V"
      connections={{ pin1: "net.USB_VBUS_SENSE", pin2: "net.GND" }} />
    <TPD4S480RUKR name="U1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={4.83} schY={-3.5} pcbX={-30} pcbY={24.5}
      schPinArrangement={{
        leftSide: { pins: ["pin20", "pin4", "pin5", "pin1", "pin2", "pin18", "pin13", "pin8", "pin21"], direction: "top-to-bottom" },
        rightSide: { pins: ["pin19", "pin17", "pin16", "pin12", "pin11", "pin15", "pin14", "pin9", "pin10", "pin3"], direction: "top-to-bottom" },
      }}
      noConnect={["pin14", "pin15"]}
      connections={{ pin1: "net.PD_SBU1_CONN", pin2: "net.PD_SBU2_CONN", pin3: "net.CC_VBIAS", pin4: "net.CC1_CONN", pin5: "net.CC2_CONN", pin6: "net.CC2_CONN", pin7: "net.CC1_CONN", pin8: "net.GND", pin9: "net.CC_FAULT_N", pin10: "net.PD_3V3", pin11: "net.CC2_PD", pin12: "net.CC1_PD", pin13: "net.GND", pin16: "net.EPR_EN", pin17: "net.EPR_BLK_GATE", pin18: "net.GND", pin19: "net.VBUS_LV", pin20: "net.PD_VBUS", pin21: "net.GND" }} />
    <TPS26750SRSMR name="U2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={0} schY={-12} pcbX={-24} pcbY={24}
      noConnect={["pin10", "pin21", "pin28", "pin29"]}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.GND", pin4: "net.PD_1V5", pin5: "net.CC_FAULT_N", pin6: "net.GND", pin7: "net.EPR_EN", pin8: "net.PD_SDA", pin9: "net.PD_SCL", pin11: "net.GND", pin12: "net.GND", pin13: "net.GND", pin14: "net.GND", pin15: "net.EEP_SDA", pin16: "net.EEP_SCL", pin17: "net.EEP_IRQ_N", pin18: "net.GND", pin19: "net.GND", pin20: "net.PD_PATH_HV", pin22: "net.GND", pin23: "net.GND", pin24: "net.CC1_PD", pin25: "net.CC2_PD", pin26: "net.VBUS_LV", pin27: "net.VBUS_LV", pin30: "net.GND", pin31: "net.GND", pin32: "net.V3V3", pin33: "net.GND" }} />
    <BSS123LT1G name="Q1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={3.8} schY={0} pcbX={-24.0} pcbY={40.5}
      connections={{ gate: "net.EPR_BLK_GATE", source: "net.VBUS_LV", drain: "net.PD_VBUS" }} schRotation={90} />

    <capacitor name="C1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={6.5} schY={3} pcbX={-31} pcbY={19} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.CC_VBIAS", pin2: "net.GND" }} />
    <capacitor name="C2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={12} schY={-7.5} pcbX={-29.6} pcbY={28.8} pcbRotation={90}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U1 > .pin10"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={2.63} schY={-7.5} pcbX={-24.0} pcbY={28.0}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC1_PD", pin2: "net.GND" }} />
    <capacitor name="C4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={7.03} schY={-7.5} pcbX={-21.5} pcbY={20.0}
      schRotation={-90}
      capacitance="220pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C106210"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.CC2_PD", pin2: "net.GND" }} />
    <capacitor name="C5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={8.5} schY={-7.5} pcbX={-18.5} pcbY={25.5}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VBUS_LV", pin2: "net.GND" }} />
    <capacitor name="C6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={-3} schY={-18} pcbX={-28.0} pcbY={20.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin32"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={13.2} schY={-7.5} pcbX={-26.0} pcbY={19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin1"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <capacitor name="C8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={10} schY={-7.5} pcbX={-24.0} pcbY={19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U2 > .pin4"
      maxVoltageRating="10V"
      connections={{ pin1: "net.PD_1V5", pin2: "net.GND" }} />
    <resistor name="R1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={9.5} schY={0} pcbX={-14} pcbY={36.0} pcbRotation={180} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.CC_FAULT_N" }} />
    <resistor name="R2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_J1" schX={8} schY={2} pcbX={-34.0} pcbY={24} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EPR_EN", pin2: "net.GND" }} />
    <M24512_RMN6TP name="U3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={16} schY={-12} pcbX={-19} pcbY={34}
      schPinArrangement={{ leftSide: ["pin1", "pin2", "pin3", "pin4"], rightSide: ["pin8", "pin6", "pin5", "pin7"] }}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.EEP_SDA", pin6: "net.EEP_SCL", pin7: "net.GND", pin8: "net.PD_3V3" }} />
    <capacitor name="C9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={14.55} schY={-7.5} pcbX={-23.75} pcbY={36.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U3 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <resistor name="R3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={13.85} schY={-8.5} pcbX={-24.0} pcbY={34.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SDA" }} />
    <resistor name="R4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={16} schY={-8.5} pcbX={-14.0} pcbY={34.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_SCL" }} pcbRotation={180} />
    <resistor name="R5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U3" schX={18} schY={-8.5} pcbX={-24.0} pcbY={32.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.EEP_IRQ_N" }} />
    <resistor name="R6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-11.6} pcbX={-34.0} pcbY={21.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SDA" }} />
    <resistor name="R7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={8} schY={-11.6} pcbX={-18} pcbY={29.25} layer="top" pcbRotation={180}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_SCL" }} />
    <resistor name="R9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-13.4} pcbX={-24.0} pcbY={30.0}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_HV", pin2: "net.PD_LEVEL_BASE" }} />
    <CSD17484F4 name="Q2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={11.17} schY={-13.4} pcbX={-17.5} pcbY={20.0} pcbRotation={180}
      connections={{ pin1: "net.PD_LEVEL_BASE", pin2: "net.GND", pin3: "net.PD_PATH_N" }} />
    <resistor name="R11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={5} schY={-15.2} pcbX={-14.0} pcbY={30.0} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_N" }} />
    <resistor name="R12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={8} schY={-15.2} pcbX={-25.5} pcbY={16.5} pcbRotation={180}
      resistance="0" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21189"] }}
      connections={{ pin1: "net.PD_PATH_N", pin2: "net.PD_INV_BASE" }} />
    <CSD17484F4 name="Q3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={9.5} schY={-16.5} pcbX={-29.5} pcbY={16.5} pcbRotation={180}
      connections={{ pin1: "net.PD_INV_BASE", pin2: "net.GND", pin3: "net.PD_PATH_OK" }} />
    <resistor name="R13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U2" schX={9.8} schY={-14.5} pcbX={-17.0} pcbY={27.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_3V3", pin2: "net.PD_PATH_OK" }} />
    <SN74LVC1G08DBVR name="U4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={0} schY={-22} pcbX={-12} pcbY={24}
      connections={{ pin1: "net.PD_PATH_OK", pin2: "net.POWER_PERMIT", pin3: "net.GND", pin4: "net.EFUSE_EN", pin5: "net.V3V3" }} />
    <resistor name="R14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={4} schY={-19} pcbX={-12.0} pcbY={21.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.POWER_PERMIT", pin2: "net.GND" }} />
    <resistor name="R15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={6} schY={-19} pcbX={-12.0} pcbY={27.0}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.EFUSE_EN", pin2: "net.GND" }} />
    <capacitor name="C10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-pd" schSectionName="usb-pd_U4" schX={-1.8} schY={-18} pcbX={-16.0} pcbY={23.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U4 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* POWER */}
    <LMR36510ADDAR name="U5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={0} schY={0} pcbX={-27} pcbY={8} layer="top"
      connections={{ pin1: "net.GND", pin2: "net.PD_VBUS", pin3: "net.PD_VBUS", pin4: "net.LOGIC_PG", pin5: "net.BUCK_FB", pin6: "net.BUCK_VCC", pin7: "net.BUCK_BOOT", pin8: "net.BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={4} schY={0} pcbX={-19} pcbY={11.5} layer="top"
      connections={{ pin1: "net.BUCK_SW", pin2: "net.V3V3_PD" }} />
    <capacitor name="C11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={2} schY={4} pcbX={-25} pcbY={1.5} pcbRotation={270} layer="top"
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} />
    <capacitor name="C12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={3} schY={4} pcbX={-27.635} pcbY={2.2289} layer="top"
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U5 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.PD_VBUS", pin2: "net.GND" }} />
    <capacitor name="C13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={4.2} schY={4}  pcbX={-25} pcbY={13} layer="top"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={3.75} schY={2.2} pcbX={-28.1} pcbY={13} layer="top"
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.BUCK_BOOT", pin2: "net.BUCK_SW" }} pcbRotation={180} />
    <capacitor name="C15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={8} schY={4} pcbX={-19} pcbY={16} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={9.2} schY={4} pcbX={-15.5} pcbY={16.25} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={10.4} schY={4} pcbX={-19} pcbY={18} layer="top"
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <resistor name="R16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={8.6} schY={1.4} pcbX={-21} pcbY={7.25} layer="top"
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.BUCK_FB" }} pcbRotation={180} />
    <resistor name="R17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={-2.6} schY={-2} pcbX={-22.25} pcbY={2.75} layer="top"
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U5" schX={5.5} schY={0.4} pcbX={-17.75} pcbY={6} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_PG" }} />
    <LMR36510ADDAR name="U22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={0} schY={-12} pcbX={-11} pcbY={9}
      connections={{ pin1: "net.GND", pin2: "net.VMOTOR", pin3: "net.VMOTOR", pin4: "net.MOTOR_LOGIC_PG", pin5: "net.MOTOR_BUCK_FB", pin6: "net.MOTOR_BUCK_VCC", pin7: "net.MOTOR_BUCK_BOOT", pin8: "net.MOTOR_BUCK_SW", pin9: "net.GND" }} />
    <SWPA6045S220MT name="L2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={4} schY={-12} pcbX={-3.5} pcbY={15}
      connections={{ pin1: "net.MOTOR_BUCK_SW", pin2: "net.V3V3_MOTOR" }} />
    <capacitor name="C62" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={5} schY={-8} pcbX={-6.0} pcbY={0.5}
      schRotation={-90}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C63" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={6.5} schY={-8} pcbX={-11.635} pcbY={3.4789}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U22 > .pin2"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C64" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={13} schY={-6.5} pcbX={-9.5} pcbY={14.3}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.MOTOR_BUCK_VCC", pin2: "net.GND" }} />
    <capacitor name="C65" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={4.75} schY={-9.8} pcbX={-12.8} pcbY={14.4}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.MOTOR_BUCK_BOOT", pin2: "net.MOTOR_BUCK_SW" }} pcbRotation={180} />
    <capacitor name="C66" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={7.73} schY={-8} pcbX={-5} pcbY={10.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} pcbRotation={180} />
    <capacitor name="C67" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={8.97} schY={-8} pcbX={-6.0} pcbY={20.0} pcbRotation={180}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C68" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={10.05} schY={-8} pcbX={-2.0} pcbY={20.0}
      schRotation={-90}
      capacitance="22uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C45783"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <resistor name="R102" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={6.8} schY={-11.4} pcbX={-14} pcbY={2.5}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_BUCK_FB" }} />
    <resistor name="R103" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={11.8} schY={-10.2} pcbX={-12} pcbY={18} pcbRotation={180}
      schRotation={-90}
      resistance="43.2k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C137720"] }}
      connections={{ pin1: "net.MOTOR_BUCK_FB", pin2: "net.GND" }} />
    <resistor name="R104" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U22" schX={5.5} schY={-11.6} pcbX={-2.5} pcbY={5.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.MOTOR_LOGIC_PG" }} pcbRotation={180} />
    <LM66100DCKR name="U23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={1} schY={-21} pcbX={-22} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND", pin3: "net.V3V3_MOTOR", pin5: "net.LOGIC_OR_PRIORITY", pin6: "net.V3V3" }} />
    <LM66100DCKR name="U24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U24" schX={11} schY={-21} pcbX={-10} pcbY={0}
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND", pin3: "net.LOGIC_OR_PRIORITY", pin5: "net.GND", pin6: "net.V3V3" }} />
    <resistor name="R111" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={6} schY={-19} pcbX={-27.5} pcbY={-2} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_PD", pin2: "net.LOGIC_OR_PRIORITY" }} />
    <capacitor name="C69" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={11.6} schY={4} pcbX={-25} pcbY={-1.8}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U23 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_PD", pin2: "net.GND" }} />
    <capacitor name="C70" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U24" schX={11.43} schY={-7.8} pcbX={-10.65} pcbY={-4.0251}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U24 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MOTOR", pin2: "net.GND" }} />
    <capacitor name="C71" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="logic-power" schSectionName="logic-power_U23" schX={6} schY={-23} pcbX={-25} pcbY={-4.5} layer="top"
      schRotation={-90}
      capacitance="10uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C96446"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="10V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={180} />
    <CSD19534Q5A name="Q4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={6} schY={0} pcbX={-8} pcbY={33}
      connections={{ source: "net.PD_VBUS", gate: "net.BLOCK_GATE", drain: "net.EFUSE_IN" }} />
    <BSS123LT1G name="Q5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={9.5} schY={3.5} pcbX={-8.0} pcbY={39.5}
      connections={{ gate: "net.BLOCK_FAST_GATE", source: "net.PD_VBUS", drain: "net.BLOCK_GATE" }} />
    <TPS26631RGER name="U6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={12} schY={0} schWidth={1.6} schHeight={2.8} pcbX={1} pcbY={25}
      schPinArrangement={{
        leftSide: ["pin1", "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin9", "pin10", "pin11", "pin12", "pin13", "pin8"],
        rightSide: ["pin18", "pin17", "pin16", "pin15", "pin14", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24", "pin25"],
      }}
      noConnect={["pin11", "pin19", "pin20", "pin21", "pin22", "pin23", "pin24"]}
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.EFUSE_IN", pin3: "net.BLOCK_GATE", pin4: "net.BLOCK_FAST_GATE", pin5: "net.PD_VBUS", pin6: "net.UVLO_DIV", pin7: "net.OVP_DIV", pin8: "net.GND", pin9: "net.SLEW_CAP", pin10: "net.ILIM_SET", pin12: "net.EFUSE_EN", pin13: "net.IIN_MON", pin14: "net.EFUSE_FAULT_N", pin15: "net.PG_DIV", pin16: "net.MOTOR_PG", pin17: "net.VMOTOR", pin18: "net.VMOTOR", pin25: "net.GND" }} />
    <resistor name="R19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={22} schY={4} pcbX={1.5} pcbY={21.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.UVLO_MID" }} />
    <resistor name="R20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={4} pcbX={3.0} pcbY={29.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.UVLO_MID", pin2: "net.UVLO_DIV" }} />
    <resistor name="R21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={4} pcbX={-3.5} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.UVLO_DIV", pin2: "net.GND" }} />
    <resistor name="R22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={21.29} schY={2.2} pcbX={5.5} pcbY={25.0}
      schRotation={-90}
      resistance="220" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22962"] }}
      connections={{ pin1: "net.PD_VBUS", pin2: "net.OVP_TOP" }} />
    <resistor name="R23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={25} schY={2.2} pcbX={-3.5} pcbY={23.0} pcbRotation={180}
      resistance="430k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25969"] }}
      connections={{ pin1: "net.OVP_TOP", pin2: "net.OVP_DIV" }} />
    <resistor name="R24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={2.2} pcbX={-3.5} pcbY={27.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.OVP_DIV", pin2: "net.GND" }} />
    <resistor name="R25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={6} schY={-3} pcbX={5.5} pcbY={23.0}
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
    <capacitor name="C19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={14.5} schY={-3.5} pcbX={1.5} pcbY={19.25} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.IIN_MON", pin2: "net.GND" }} />
    <resistor name="R27" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={16} schY={-1.4} pcbX={5.0} pcbY={18.5} pcbRotation={90}
      schRotation={-90}
      resistance="360k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23146"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.PG_DIV" }} />
    <resistor name="R28" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={16} schY={-3.2} pcbX={-7.0} pcbY={25.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.PG_DIV", pin2: "net.GND" }} />
    <resistor name="R29" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={18} schY={-1.4} pcbX={2.25} pcbY={14.25} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.MOTOR_PG" }} />
    <resistor name="R30" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={18} schY={1.4} pcbX={11.5} pcbY={23.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.EFUSE_FAULT_N" }} />
    <capacitor name="C20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28.33} schY={-3.2} pcbX={-7.0} pcbY={23.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.EFUSE_IN", pin2: "net.GND" }} />
    <capacitor name="C21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={20.5} schY={-7} pcbX={-1.25} pcbY={29.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="2.2uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C170101"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U6 > .pin17"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_C22" schX={22.4} schY={-7} pcbX={20} pcbY={28} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <EEUFR1J471 name="C23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_C23" schX={24.5} schY={-7} pcbX={35} pcbY={18} schRotation={-90}
      maxDecouplingTraceLength="30mm"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <resistor name="R31" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={24.67} schY={-4} pcbX={-7.0} pcbY={27.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.VMON_MID" }} />
    <resistor name="R32" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28} schY={-5} pcbX={11.5} pcbY={18.0}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMON_MID", pin2: "net.VMON_ADC" }} />
    <resistor name="R33" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={26.8} schY={-6.8} pcbX={13.5} pcbY={20.5} pcbRotation={180}
      schRotation={-90}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />
    <capacitor name="C24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motor-power" schSectionName="motor-power_U6" schX={28.5} schY={-8.5} pcbX={11.0} pcbY={20.5} pcbRotation={90}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.VMON_ADC", pin2: "net.GND" }} />

    {/* MOTION */}
    <TMC5160A_TA_T name="U7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={-3} schY={-4} pcbX={24} pcbY={-1}
      noConnect={["pin25"]}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.BOOT_B1", pin3: "net.TMC_12V", pin4: "net.VMOTOR", pin5: "net.TMC_5V", pin6: "net.GND", pin7: "net.GND", pin8: "net.SENSE_A", pin9: "net.SENSE_B", pin10: "net.GND", pin11: "net.GND", pin12: "net.GND", pin13: "net.TMC_CS_N", pin14: "net.SPI_SCK", pin15: "net.SPI_MOSI", pin16: "net.SPI_MISO", pin17: "net.REFL_STEP", pin18: "net.REFR_DIR", pin19: "net.GND", pin20: "net.V3V3", pin21: "net.SD_MODE", pin22: "net.V3V3", pin23: "net.GND", pin24: "net.GND", pin26: "net.TMC_DIAG0", pin27: "net.TMC_DIAG1", pin28: "net.DRV_EN_N", pin29: "net.TMC_VCC", pin30: "net.GND", pin31: "net.TMC_CPO", pin32: "net.TMC_CPI", pin33: "net.VMOTOR", pin34: "net.TMC_VCP", pin35: "net.BOOT_A2", pin36: "net.GH_A2_DRV", pin37: "net.MOTOR_A2", pin38: "net.GL_A2_DRV", pin39: "net.GL_A1_DRV", pin40: "net.MOTOR_A1", pin41: "net.GH_A1_DRV", pin42: "net.BOOT_A1", pin43: "net.BOOT_B2", pin44: "net.GH_B2_DRV", pin45: "net.MOTOR_B2", pin46: "net.GL_B2_DRV", pin47: "net.GL_B1_DRV", pin48: "net.MOTOR_B1", pin49: "net.GND" }} pcbRotation={180} />
    <capacitor name="C25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={4} pcbX={27.4} pcbY={6.5}
      schRotation={-90}
      pcbRotation={90}
      capacitance="4.7uF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C1779"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin3"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C26" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={-4} schY={4} pcbX={23.8} pcbY={6.7} layer="top"
      schRotation={-90}
      pcbRotation={90}
      capacitance="4.7uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C19666"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin5"
      maxVoltageRating="16V"
      connections={{ pin1: "net.TMC_5V", pin2: "net.GND" }} />
    <resistor name="R34" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={-5.5} schY={4} pcbX={20.25} pcbY={-8}
      schRotation={-90}
      resistance="2.2" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22939"] }}
      connections={{ pin1: "net.TMC_5V", pin2: "net.TMC_VCC" }} />
    <capacitor name="C27" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={2} schY={-4.2} pcbX={23.25} pcbY={-8.2}
      schRotation={-90}
      pcbRotation={270}
      capacitance="470nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C13967"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin29"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_VCC", pin2: "net.GND" }} />
    <capacitor name="C28" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={12} schY={4} pcbX={17.1} pcbY={-1.75} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin20"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C29" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={10.85} schY={2.2} pcbX={25.25} pcbY={-8.2}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin33"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <capacitor name="C30" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={0.4} pcbX={25} pcbY={-11.5}
      capacitance="22nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C107137"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_CPO", pin2: "net.TMC_CPI" }} />
    <capacitor name="C31" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={0.4} pcbX={28.8} pcbY={-12} schRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.TMC_VCP", pin2: "net.VMOTOR" }} pcbRotation={90} />
    <capacitor name="C61" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={12.05} schY={2.2} pcbX={25.6} pcbY={6.7}
      schRotation={-90}
      pcbRotation={90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15725"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U7 > .pin4"
      maxVoltageRating="100V"
      connections={{ pin1: "net.VMOTOR", pin2: "net.GND" }} />
    <resistor name="R35" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={-1.4} pcbX={6.5} pcbY={-5.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TMC_CS_N" }} />
    <resistor name="R36" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={-1.4} pcbX={15.0} pcbY={13.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.SD_MODE", pin2: "net.GND" }} />
    <resistor name="R37" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={3.55} schY={-5} pcbX={11.5} pcbY={14.5} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DRV_EN_N" }} />
    <CSD19534Q5A name="Q6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={0} schY={0} pcbX={13} pcbY={9}
      connections={{ source: "net.MOTOR_A1", gate: "net.GH_A1", drain: "net.VMOTOR" }} pcbRotation={90} />
    <CSD19534Q5A name="Q7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={13} schY={0} pcbX={13} pcbY={3}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A1", drain: "net.MOTOR_A1" }} pcbRotation={270} />
    <resistor name="R38" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={4} schY={2.5} pcbX={18.8} pcbY={10.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A1_DRV", pin2: "net.GH_A1" }} pcbRotation={180} />
    <resistor name="R39" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={17} schY={2.5} pcbX={7.2} pcbY={1.1}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A1_DRV", pin2: "net.GL_A1" }} />
    <resistor name="R40" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q6" schX={5.5} schY={2.5} pcbX={18.8} pcbY={13}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A1", pin2: "net.MOTOR_A1" }} />
    <resistor name="R41" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q7" schX={18.5} schY={2.5} pcbX={4.8} pcbY={-1}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A1", pin2: "net.SENSE_A" }} pcbRotation={270} />
    <capacitor name="C32" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5} schY={-3.2} pcbX={30.45} pcbY={-2}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_A1", pin2: "net.MOTOR_A1" }} pcbRotation={270} />
    <CSD19534Q5A name="Q8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={0} schY={-9} pcbX={13} pcbY={-13}
      connections={{ source: "net.MOTOR_A2", gate: "net.GH_A2", drain: "net.VMOTOR" }} pcbRotation={270} />
    <CSD19534Q5A name="Q9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={13} schY={-9} pcbX={13} pcbY={-7}
      connections={{ source: "net.SENSE_A", gate: "net.GL_A2", drain: "net.MOTOR_A2" }} pcbRotation={90} />
    <resistor name="R42" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={4} schY={-6.5} pcbX={7.2} pcbY={-14.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_A2_DRV", pin2: "net.GH_A2" }} />
    <resistor name="R43" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={17} schY={-6.5} pcbX={17.8} pcbY={-7.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_A2_DRV", pin2: "net.GL_A2" }} pcbRotation={90} />
    <resistor name="R44" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q8" schX={5.5} schY={-6.5} pcbX={7.2} pcbY={-17}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_A2", pin2: "net.MOTOR_A2" }} pcbRotation={180} />
    <resistor name="R45" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_Q9" schX={18.5} schY={-6.5} pcbX={17.8} pcbY={-11} pcbRotation={270}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_A2", pin2: "net.SENSE_A" }} />
    <capacitor name="C33" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={8} schY={-3.2} pcbX={27.5} pcbY={-8.2}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_A2", pin2: "net.MOTOR_A2" }} pcbRotation={270} />
    <CSD19534Q5A name="Q10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={0} schY={0} pcbX={35.6} pcbY={6}
      connections={{ source: "net.MOTOR_B1", gate: "net.GH_B1", drain: "net.VMOTOR" }} pcbRotation={90} />
    <CSD19534Q5A name="Q11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={13} schY={0} pcbX={35.6} pcbY={-1}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B1", drain: "net.MOTOR_B1" }} pcbRotation={270} />
    <resistor name="R46" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={4} schY={2.5} pcbX={41.2} pcbY={7.9}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B1_DRV", pin2: "net.GH_B1" }} pcbRotation={180} />
    <resistor name="R47" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={17} schY={2.5} pcbX={30.1} pcbY={-5.3}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B1_DRV", pin2: "net.GL_B1" }} pcbRotation={90} />
    <resistor name="R48" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q10" schX={5.5} schY={2.5} pcbX={41.2} pcbY={5.7}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B1", pin2: "net.MOTOR_B1" }} />
    <resistor name="R49" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q11" schX={18.5} schY={2.5} pcbX={30.1} pcbY={-8.5}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B1", pin2: "net.SENSE_B" }} pcbRotation={90} />
    <capacitor name="C34" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={11} schY={-3.2} pcbX={29.5} pcbY={6.3}
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_B1", pin2: "net.MOTOR_B1" }} pcbRotation={90} />
    <CSD19534Q5A name="Q12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={0} schY={-9} pcbX={35.6} pcbY={-18.6}
      connections={{ source: "net.MOTOR_B2", gate: "net.GH_B2", drain: "net.VMOTOR" }} pcbRotation={270} />
    <CSD19534Q5A name="Q13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={13} schY={-9} pcbX={35.6} pcbY={-12}
      connections={{ source: "net.SENSE_B", gate: "net.GL_B2", drain: "net.MOTOR_B2" }} pcbRotation={90} />
    <resistor name="R50" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={4} schY={-6.5} pcbX={30} pcbY={-20.5}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GH_B2_DRV", pin2: "net.GH_B2" }} />
    <resistor name="R51" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={17} schY={-6.5} pcbX={41.2} pcbY={-10.1}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.GL_B2_DRV", pin2: "net.GL_B2" }} pcbRotation={180} />
    <resistor name="R52" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q12" schX={5.5} schY={-6.5} pcbX={30} pcbY={-18.3}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GH_B2", pin2: "net.MOTOR_B2" }} />
    <resistor name="R53" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_Q13" schX={18.5} schY={-6.5} pcbX={41.2} pcbY={-12.3}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.GL_B2", pin2: "net.SENSE_B" }} />
    <capacitor name="C35" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U7" schX={5.46} schY={-5} pcbX={30.45} pcbY={1.6} schOrientation="vertical"
      capacitance="220nF" footprint="0805" supplierPartNumbers={{ jlcpcb: ["C513710"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="100V"
      connections={{ pin1: "net.BOOT_B2", pin2: "net.MOTOR_B2" }} pcbRotation={90} />
    <HoLLR2512_3W_33mR_1_ name="R109" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_R109" schX={6.5} schY={-14} schRotation={-90} pcbX={11.1} pcbY={-2}
      connections={{ pin1: "net.SENSE_A", pin2: "net.GND" }} pcbRotation={180} />
    <HoLLR2512_3W_33mR_1_ name="R110" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-b" schSectionName="bridge-b_R110" schX={6.5} schY={-14} schRotation={-90} pcbX={35.6} pcbY={-6.5}
      connections={{ pin1: "net.SENSE_B", pin2: "net.GND" }} pcbRotation={180} />
    <B4P_VH_LF__SN_ name="J2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="bridge-a" schSectionName="bridge-a_J2" schX={15} schY={-14} pcbX={20} pcbY={-39} allowOffBoard
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.MOTOR_A2", pin3: "net.MOTOR_B1_OUT", pin4: "net.MOTOR_B2" }} />
    <A_74LVC1G157GW_125 name="U8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U8" schX={15} schY={0} pcbX={4} pcbY={-8}
      connections={{ pin1: "net.STEP_IN", pin2: "net.GND", pin3: "net.STOP_L", pin4: "net.REFL_STEP", pin5: "net.V3V3", pin6: "net.SD_MODE" }} />
    <A_74LVC1G157GW_125 name="U9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U9" schX={0} schY={-10} pcbX={7.5} pcbY={-12.0}
      connections={{ pin1: "net.DIR_IN", pin2: "net.GND", pin3: "net.STOP_R", pin4: "net.REFR_DIR", pin5: "net.V3V3", pin6: "net.SD_MODE" }} pcbRotation={90} />
    <capacitor name="C36" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U8" schX={13.2} schY={4} pcbX={0.25} pcbY={-8.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U8 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C37" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U9" schX={14.4} schY={4} pcbX={4.25} pcbY={-13.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U9 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <SN74LVC1G08DBVR name="U10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={15} schY={-10} pcbX={-4} pcbY={-9}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.MOTOR_PG", pin3: "net.GND", pin4: "net.RUN_PG", pin5: "net.V3V3" }} />
    <SN74LVC1G08DBVR name="U11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={0} schY={-20} pcbX={-4} pcbY={-14}
      connections={{ pin1: "net.RUN_PG", pin2: "net.VMOTOR_OK", pin3: "net.GND", pin4: "net.RUN_WINDOW_OK", pin5: "net.V3V3" }} />
    <capacitor name="C38" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={15.6} schY={4} pcbX={-8.0} pcbY={-10.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U10 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C39" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U11" schX={16.8} schY={4} pcbX={-8.0} pcbY={-15.0}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U11 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R54" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_U10" schX={19} schY={-10} pcbX={0.0} pcbY={-10.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.MCU_RUN", pin2: "net.GND" }} />
    <resistor name="R55" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={9} schY={-15.5} pcbX={-4.0} pcbY={-17.0}
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.RUN_SAFE", pin2: "net.RUN_BASE" }} />
    <resistor name="R56" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={5} schY={-15.5} pcbX={0.0} pcbY={-14.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.RUN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q14" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={5} schY={-20} pcbX={1.0} pcbY={-17.0} pcbRotation={180}
      connections={{ base: "net.RUN_BASE", emitter: "net.ENABLE_CHAIN", collector: "net.DRV_EN_N" }} />
    <MMBT5551LT1G name="Q15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={9.103} schY={-20} pcbX={-4.0} pcbY={-20.0}
      connections={{ base: "net.HW_ENABLE_BASE", emitter: "net.GND", collector: "net.ENABLE_CHAIN" }} />
    <resistor name="R57" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={13} schY={-20} pcbX={-8.0} pcbY={-13.0}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.HW_ENABLE_24V", pin2: "net.HW_ENABLE_BASE" }} />
    <resistor name="R58" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={5} schY={-25} pcbX={0.0} pcbY={-12.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.HW_ENABLE_BASE", pin2: "net.GND" }} />
    <BAV21W_7_F name="D1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="motion" schSectionName="motion_enable" schX={12} schY={-25} pcbX={-4.0} pcbY={-23.5}
      schRotation={90}
      connections={{ pin1: "net.HW_ENABLE_BASE", pin2: "net.GND" }} />

    {/* BRAKE */}
    <TL431AIDBZR name="U12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U12" schX={0} schY={0} schWidth={2.34} pcbX={3} pcbY={-24}
      connections={{ pin1: "net.VREF_2V495", pin2: "net.VREF_2V495", pin3: "net.GND" }} />
    <resistor name="R59" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U12" schX={3} schY={2} pcbX={3.0} pcbY={-27.0}
      schRotation={-90}
      resistance="220" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22962"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.VREF_2V495" }} />
    <TLV3201AIDBVR name="U13" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U13" schX={17} schY={0} pcbX={8.75} pcbY={-22}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.GND", pin3: "net.BRAKE_SENSE", pin4: "net.VREF_2V495", pin5: "net.V3V3" }} />
    <resistor name="R60" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_sense" schX={21.67} schY={4} pcbX={7.5} pcbY={-19.0}
      schRotation={-90}
      resistance="180k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22827"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_MID" }} />
    <resistor name="R61" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_sense" schX={23.83} schY={4} pcbX={13.0} pcbY={-17.5}
      resistance="20k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.BRAKE_MID", pin2: "net.BRAKE_SENSE" }} />
    <resistor name="R62" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_sense" schX={25} schY={4} pcbX={11.75} pcbY={-20.5} pcbRotation={90}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.BRAKE_SENSE", pin2: "net.GND" }} />
    <resistor name="R63" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_sense" schX={22} schY={2.2} pcbX={10.0} pcbY={-17.5}
      resistance="1M" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22935"] }}
      connections={{ pin1: "net.BRAKE_ON", pin2: "net.BRAKE_SENSE" }} pcbRotation={90} />
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
    <resistor name="R66" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U14" schX={11} schY={-8} pcbX={-12.5} pcbY={-34.25} pcbRotation={180}
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
    <UCC27511DBVR name="U15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={17} schY={-12} pcbX={10} pcbY={26}
      connections={{ pin1: "net.TMC_12V", pin2: "net.BRAKE_DRIVE", pin3: "net.BRAKE_DRIVE", pin4: "net.GND", pin5: "net.GND", pin6: "net.BRAKE_ON" }} />
    <capacitor name="C42" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={22} schY={-8} pcbX={15} pcbY={35.5}
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <capacitor name="C43" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={23.2} schY={-8} pcbX={8.9} pcbY={22}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U15 > .pin1"
      maxVoltageRating="50V"
      connections={{ pin1: "net.TMC_12V", pin2: "net.GND" }} />
    <resistor name="R68" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={14} schY={-15.5} pcbX={12.55} pcbY={29}
      resistance="10" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C22859"] }}
      connections={{ pin1: "net.BRAKE_DRIVE", pin2: "net.BRAKE_GATE" }} pcbRotation={90} />
    <resistor name="R69" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_U15" schX={18.5} schY={-15.5} pcbX={12.55} pcbY={32.2}
      schRotation={-90}
      resistance="100k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.BRAKE_GATE", pin2: "net.GND" }} pcbRotation={90} />
    <CSD19534Q5A name="Q16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_Q16" schX={12} schY={-18} pcbX={8} pcbY={33}
      connections={{ source: "net.GND", gate: "net.BRAKE_GATE", drain: "net.BRAKE_RETURN" }} />
    <B2P_VH_LF__SN_ name="J3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="brake" schSectionName="brake_J3" schX={19} schY={-20} pcbX={0.0} pcbY={36.5} schPinArrangement={{ topSide: ["pin1"], bottomSide: ["pin2"] }}
      connections={{ pin1: "net.VMOTOR", pin2: "net.BRAKE_RETURN" }} />

    {/* MCU */}
    <STM32G0B1 name="U16" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={0} schY={0} pcbX={-20} pcbY={-12}
      connections={{ pin1: "net.STATUS_GPIO", pin2: "net.DIN0", pin3: "net.DIN1", pin4: "net.V3V3_MCU", pin5: "net.V3V3_MCU", pin6: "net.V3V3_MCU", pin7: "net.GND", pin8: "net.OSC_IN", pin9: "net.OSC_OUT", pin10: "net.NRST", pin11: "net.PHASE_A_ADC", pin12: "net.PHASE_B_ADC", pin13: "net.RS485_TX", pin14: "net.RS485_RX", pin15: "net.TMC_CS_N", pin16: "net.SPI_SCK", pin17: "net.SPI_MISO", pin18: "net.SPI_MOSI", pin19: "net.USB_VBUS_SENSE", pin20: "net.BOARD_POWER_SENSE", pin21: "net.EFUSE_FAULT_N", pin22: "net.RS485_DE", pin23: "net.ENC_CS_N", pin24: "net.FLASH_CS_N", pin25: "net.STOP_L", pin26: "net.STOP_R", pin27: "net.HOME_IN", pin28: "net.SD_MODE", pin29: "net.RS232_TX", pin30: "net.STEP_IN", pin31: "net.DIR_IN", pin32: "net.RS232_RX", pin33: "net.USB_DM", pin34: "net.USB_DP", pin35: "net.SWDIO", pin36: "net.SWCLK", pin37: "net.MCU_RUN", pin38: "net.CAN_RX", pin39: "net.CAN_TX", pin40: "net.OUT0_DRIVE", pin41: "net.OUT1_DRIVE", pin42: "net.TMC_DIAG0", pin43: "net.MOTOR_PG", pin44: "net.POWER_PERMIT", pin45: "net.PD_SCL", pin46: "net.PD_SDA", pin47: "net.TMC_DIAG1", pin48: "net.VMOTOR_OK" }} />
    <capacitor name="C44" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={5} schY={6} pcbX={-20.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin6"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C45" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={6.2} schY={6} pcbX={-18.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin5"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C46" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={7.4} schY={6} pcbX={-22.75} pcbY={-19.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U16 > .pin4"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <capacitor name="C47" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={8.6} schY={6} pcbX={-28.0} pcbY={-15.75} pcbRotation={180}
      schRotation={-90}
      capacitance="4.7uF" footprint="1206" supplierPartNumbers={{ jlcpcb: ["C51205"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.GND" }} />
    <resistor name="R70" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={-3.5} schY={4} pcbX={-12.5} pcbY={-12.0} pcbRotation={180}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3_MCU", pin2: "net.NRST" }} />
    <capacitor name="C48" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={-3.5} schY={2} pcbX={-12.5} pcbY={-14.0}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    <resistor name="R71" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={4.84} schY={0} pcbX={-27.5} pcbY={-11.5}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.USB_DP" }} />
    <resistor name="R72" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U16" schX={8.39} schY={0} pcbX={-27.5} pcbY={-13.75}
      resistance="22" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23345"] }}
      connections={{ pin1: "net.USB_DM_CONN", pin2: "net.USB_DM" }} />
    <X322516MLB4SI name="Y1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={0} schY={5.5} pcbX={-11} pcbY={-18}
      loadCapacitance="9pF"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND", pin3: "net.OSC_OUT", pin4: "net.GND" }} />
    <capacitor name="C49" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={-2.5} schY={4.5} pcbX={-15.0} pcbY={-19.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_IN", pin2: "net.GND" }} />
    <capacitor name="C50" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_Y1" schX={2.5} schY={4.5} pcbX={-8.0} pcbY={-21.0}
      schRotation={-90}
      capacitance="12pF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C38523"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="50V"
      connections={{ pin1: "net.OSC_OUT", pin2: "net.GND" }} />
    <TS_1088_AR02016 name="SW1" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_SW1" schX={5} schY={-3} pcbX={-18} pcbY={-40} layer="top" schRotation={-90}
      connections={{ pin1: "net.NRST", pin2: "net.GND" }} />
    {/* Top-side service pads replace a bulky debug connector. */}
    <testpoint name="TP_SWD_3V3" schSheetName="mcu" schSectionName="mcu_U16" schX={-8} schY={-4.8} pcbX={-22} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3_MCU" }} />
    <testpoint name="TP_SWDIO" schSheetName="mcu" schSectionName="mcu_U16" schX={-2} schY={-4.8} pcbX={-19.5} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWDIO" }} />
    <testpoint name="TP_SWD_GND" schSheetName="mcu" schSectionName="mcu_U16" schX={4} schY={-4.8} pcbX={-17} pcbY={-33.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />
    <testpoint name="TP_SWCLK" schSheetName="mcu" schSectionName="mcu_U16" schX={-8} schY={-6.8} pcbX={-21.25} pcbY={-35.8} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.SWCLK" }} />
    <testpoint name="TP_NRST" schSheetName="mcu" schSectionName="mcu_U16" schX={-2} schY={-6.8} pcbX={-19.25} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.NRST" }} />
    <testpoint name="TP_STATUS" schSheetName="mcu" schSectionName="mcu_U16" schX={4} schY={-6.8} pcbX={-17} pcbY={-36.3} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.STATUS_GPIO" }} />
    <W25Q32JVSSIQ name="U17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={13} schY={-2.5} schWidth={1.74} schHeight={2.4} pcbX={-13} pcbY={-26}
      schPinArrangement={{ leftSide: ["pin1", "pin2"], rightSide: ["pin5", "pin6"], topSide: ["pin3", "pin7", "pin8"], bottomSide: ["pin4"] }}
      connections={{ pin1: "net.FLASH_CS_N", pin2: "net.SPI_MISO", pin3: "net.V3V3", pin4: "net.GND", pin5: "net.SPI_MOSI", pin6: "net.SPI_SCK", pin7: "net.V3V3", pin8: "net.V3V3" }} />
    <resistor name="R73" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={10.2} schY={-1} pcbX={-8.0} pcbY={-27.75}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.FLASH_CS_N" }} />
    <capacitor name="C51" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="mcu" schSectionName="mcu_U17" schX={9.8} schY={6} pcbX={-17.25} pcbY={-23.25}
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U17 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />

    {/* ENCODER */}
    <AS5047P_ATSM name="U18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={0} schY={0} pcbX={0} pcbY={0} pcbRotation={180} layer="top"
      noConnect={["pin8", "pin9", "pin10"]}
      connections={{ pin1: "net.ENC_CS_N", pin2: "net.SPI_SCK", pin3: "net.SPI_MISO", pin4: "net.SPI_MOSI", pin5: "net.GND", pin6: "net.ENC_B", pin7: "net.ENC_A", pin11: "net.V3V3", pin12: "net.V3V3", pin13: "net.GND", pin14: "net.ENC_I" }} />
    <resistor name="R74" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={5} schY={4} pcbX={0.0} pcbY={5.5} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.ENC_CS_N" }} pcbRotation={90} />
    <capacitor name="C52" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={8} schY={4} pcbX={0.0} pcbY={-5.55} layer="top"
      schRotation={-90}
      pcbRotation={270}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U18 > .pin11"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <capacitor name="C53" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="encoder" schSectionName="encoder_U18" schX={9.2} schY={4} pcbX={3.3} pcbY={-5.3} pcbRotation={180} layer="top"
      schRotation={-90}
      capacitance="1uF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C15849"] }}
      maxDecouplingTraceLength="30mm"
      maxVoltageRating="25V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    {/* Encoder observation remains available without a second field connector. */}
    <testpoint name="TP_ENC_3V3" schSheetName="encoder" schSectionName="encoder_U18" schX={12} schY={-2} pcbX={-10} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.V3V3" }} />
    <testpoint name="TP_ENC_A" schSheetName="encoder" schSectionName="encoder_U18" schX={17} schY={-2} pcbX={-7.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_A" }} />
    <testpoint name="TP_ENC_B" schSheetName="encoder" schSectionName="encoder_U18" schX={22} schY={-2} pcbX={-5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_B" }} />
    <testpoint name="TP_ENC_I" schSheetName="encoder" schSectionName="encoder_U18" schX={14.5} schY={-3.8} pcbX={-2.5} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.ENC_I" }} />
    <testpoint name="TP_ENC_GND" schSheetName="encoder" schSectionName="encoder_U18" schX={19.5} schY={-3.8} pcbX={0} pcbY={-35} layer="top" footprint={<footprint><smtpad portHints={["pin1"]} pcbX="0mm" pcbY="0mm" shape="circle" radius="0.7mm" /><courtyardcircle pcbX="0mm" pcbY="0mm" radius="0.95mm" /></footprint>} connections={{ pin1: "net.GND" }} />

    {/* INTERFACES */}
    <B20B_PHDSS_LF__SN_ name="J7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_J7" schX={17} schY={-27} pcbX={-2} pcbY={-39}
      schWidth={5} schHeight={2.2}
      schPinArrangement={{ leftSide: { pins: ["pin1", "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin8", "pin17", "pin18"], direction: "top-to-bottom" }, rightSide: { pins: ["pin9", "pin10", "pin11", "pin12", "pin13", "pin14", "pin15", "pin16", "pin19", "pin20"], direction: "top-to-bottom" } }}
      connections={{ pin1: "net.HOME_24V", pin2: "net.STOPL_24V", pin3: "net.STOPR_24V", pin4: "net.DIN0_24V", pin5: "net.DIN1_24V", pin6: "net.STEP_24V", pin7: "net.DIR_24V", pin8: "net.GND", pin9: "net.RS232_TX_CONN", pin10: "net.RS232_RX_CONN", pin11: "net.GND", pin12: "net.CAN_H", pin13: "net.CAN_L", pin14: "net.GND", pin15: "net.RS485_A", pin16: "net.RS485_B", pin17: "net.VMOTOR", pin18: "net.HW_ENABLE_24V", pin19: "net.OUT0", pin20: "net.OUT1" }} />
    <MMBT5551LT1G name="Q19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={0} schY={-9} pcbX={8.0} pcbY={-31.0}
      connections={{ base: "net.STOP_L_BASE", emitter: "net.GND", collector: "net.STOP_L" }} />
    <resistor name="R83" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={5} schY={-7} pcbX={16.5} pcbY={-31.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STOPL_24V", pin2: "net.STOP_L_BASE" }} />
    <resistor name="R84" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={8} schY={-7} pcbX={12.25} pcbY={-34.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.STOP_L_BASE", pin2: "net.GND" }} />
    <resistor name="R85" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={11} schY={-7} pcbX={15.5} pcbY={-33.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STOP_L" }} pcbRotation={180} />
    <BAV21W_7_F name="D6" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q19" schX={9.5} schY={-7} pcbX={12.5} pcbY={-30.5} layer="top"
      schRotation={90}
      connections={{ pin1: "net.STOP_L_BASE", pin2: "net.GND" }} pcbRotation={180} />
    <MMBT5551LT1G name="Q20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={17} schY={-9} pcbX={8.0} pcbY={-26.5}
      connections={{ base: "net.STOP_R_BASE", emitter: "net.GND", collector: "net.STOP_R" }} />
    <resistor name="R86" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={22} schY={-7} pcbX={18.75} pcbY={-34.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STOPR_24V", pin2: "net.STOP_R_BASE" }} />
    <resistor name="R87" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={25} schY={-7} pcbX={22} pcbY={-34.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.STOP_R_BASE", pin2: "net.GND" }} />
    <resistor name="R88" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={28} schY={-7} pcbX={4.0} pcbY={-11.0}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STOP_R" }} />
    <BAV21W_7_F name="D7" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q20" schX={26.5} schY={-7} pcbX={20.0} pcbY={-11.5}
      schRotation={90}
      connections={{ pin1: "net.STOP_R_BASE", pin2: "net.GND" }} pcbRotation={90} />
    <MMBT5551LT1G name="Q21" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={0} schY={-18} pcbX={2.5} pcbY={9.9}
      connections={{ base: "net.HOME_IN_BASE", emitter: "net.GND", collector: "net.HOME_IN" }} pcbRotation={180} />
    <resistor name="R89" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={5} schY={-16} pcbX={25.25} pcbY={-34.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.HOME_24V", pin2: "net.HOME_IN_BASE" }} />
    <resistor name="R90" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={8} schY={-16} pcbX={27.0} pcbY={-31.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.HOME_IN_BASE", pin2: "net.GND" }} />
    <resistor name="R91" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={11} schY={-16} pcbX={33.0} pcbY={10.0} pcbRotation={180} layer="top"
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.HOME_IN" }} />
    <BAV21W_7_F name="D8" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q21" schX={9.5} schY={-16} pcbX={41.0} pcbY={-16.0} layer="top"
      schRotation={90}
      connections={{ pin1: "net.HOME_IN_BASE", pin2: "net.GND" }} pcbRotation={90} />
    <MMBT5551LT1G name="Q22" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={17} schY={-18} pcbX={6} pcbY={14}
      connections={{ base: "net.STEP_IN_BASE", emitter: "net.GND", collector: "net.STEP_IN" }} pcbRotation={180} />
    <resistor name="R92" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={22} schY={-16} pcbX={41.0} pcbY={-6.0} pcbRotation={90} layer="top"
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.STEP_24V", pin2: "net.STEP_IN_BASE" }} />
    <resistor name="R93" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={25} schY={-16} pcbX={30.5} pcbY={-12.0} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.STEP_IN_BASE", pin2: "net.GND" }} pcbRotation={90} />
    <resistor name="R94" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={28} schY={-16} pcbX={23.5} pcbY={9.5} layer="top"
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.STEP_IN" }} pcbRotation={180} />
    <BAV21W_7_F name="D9" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q22" schX={26.5} schY={-16} pcbX={29.0} pcbY={-15.0} layer="top"
      schRotation={90}
      connections={{ pin1: "net.STEP_IN_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q23" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={0} schY={-27} pcbX={8} pcbY={18}
      connections={{ base: "net.DIR_IN_BASE", emitter: "net.GND", collector: "net.DIR_IN" }} pcbRotation={180} />
    <resistor name="R95" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={5} schY={-25} pcbX={40.0} pcbY={10.0} pcbRotation={0} layer="top"
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIR_24V", pin2: "net.DIR_IN_BASE" }} />
    <resistor name="R96" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={8} schY={-25} pcbX={31.75} pcbY={-27.75} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.DIR_IN_BASE", pin2: "net.GND" }} pcbRotation={270} />
    <resistor name="R97" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={11} schY={-25} pcbX={40.5} pcbY={-20.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIR_IN" }} pcbRotation={90} />
    <BAV21W_7_F name="D10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q23" schX={9.5} schY={-25} pcbX={39} pcbY={26.0} layer="top"
      schRotation={90}
      connections={{ pin1: "net.DIR_IN_BASE", pin2: "net.GND" }} pcbRotation={180} />

    <USB4105_GF_A name="J10" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={-5} schY={0} pcbX={-36} pcbY={1} pcbRotation={270}
      schWidth={1.4}
      schPinArrangement={{ rightSide: { pins: ["pin7", "pin15", "pin9", "pin13", "pin12", "pin10", "pin16"], direction: "top-to-bottom" }, bottomSide: { pins: ["pin5", "pin1"], direction: "left-to-right" } }}
      schPinStyle={{ pin7: { topMargin: 0.1, bottomMargin: 0.1 }, pin15: { topMargin: 0.1, bottomMargin: 0.1 }, pin9: { topMargin: 0.1, bottomMargin: 0.1 }, pin13: { topMargin: 0.1, bottomMargin: 0.1 }, pin12: { topMargin: 0.1, bottomMargin: 0.1 }, pin10: { topMargin: 0.1, bottomMargin: 0.1 }, pin16: { topMargin: 0.1, bottomMargin: 0.1 } }}
      noConnect={["pin10", "pin16"]}
      connections={{ pin1: "net.GND", pin2: "net.GND", pin3: "net.GND", pin4: "net.GND", pin5: "net.GND", pin6: "net.GND", pin19: "net.GND", pin20: "net.GND", pin7: "net.USB_DATA_VBUS", pin8: "net.USB_DATA_VBUS", pin17: "net.USB_DATA_VBUS", pin18: "net.USB_DATA_VBUS", pin9: "net.DATA_CC2", pin15: "net.DATA_CC1", pin11: "net.USB_DP_CONN", pin13: "net.USB_DP_CONN", pin12: "net.USB_DM_CONN", pin14: "net.USB_DM_CONN" }} />
    <resistor name="R105" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={-5} schY={-6} schRotation={-90} pcbX={-31.5} pcbY={5} pcbRotation={180}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC1", pin2: "net.GND" }} />
    <resistor name="R106" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={-2} schY={-6} schRotation={-90} pcbX={-30} pcbY={-4}
      resistance="5.1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23186"] }} connections={{ pin1: "net.DATA_CC2", pin2: "net.GND" }} />
    <USBLC6_4SC6 name="D15" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={1} schY={-6} pcbX={-30.5} pcbY={1.2}
      connections={{ pin1: "net.USB_DP_CONN", pin2: "net.GND", pin3: "net.USB_DM_CONN", pin4: "net.DATA_CC1", pin5: "net.USB_DATA_VBUS", pin6: "net.DATA_CC2" }} />
    <capacitor name="C73" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-data" schSectionName="usb-data_J10" schX={5} schY={-6} schRotation={-90} pcbX={-30.5} pcbY={-1.75}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }} maxVoltageRating="50V" connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND" }} />

    <TCAN332DR name="U19" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={0} schY={0} pcbX={-32.0} pcbY={-23.5}
      noConnect={["pin5", "pin8"]}
      connections={{ pin1: "net.CAN_TX", pin2: "net.GND", pin3: "net.V3V3", pin4: "net.CAN_RX", pin6: "net.CAN_L", pin7: "net.CAN_H" }} />
    <capacitor name="C54" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={20.5} schY={7} pcbX={-31.4} pcbY={-28.5} pcbRotation={180}
      schRotation={-90}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U19 > .pin3"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R75" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U19" schX={4} schY={4} pcbX={-40.0} pcbY={-23.0}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.CAN_TX" }} />
    <SM24CANB_02HTG name="D2" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_CAN_TVS" schX={11} schY={4} pcbX={-27.0} pcbY={-26.5}
      connections={{ pin1: "net.CAN_H", pin2: "net.CAN_L", pin3: "net.GND" }} />
    <MAX3485EESA_T name="U20" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={17} schY={0} pcbX={-22} pcbY={-26}
      connections={{ pin1: "net.RS485_RX", pin2: "net.RS485_DE", pin3: "net.RS485_DE", pin4: "net.RS485_TX", pin5: "net.GND", pin6: "net.RS485_A", pin7: "net.RS485_B", pin8: "net.V3V3" }} />
    <capacitor name="C55" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={19} schY={7} pcbX={-26.75} pcbY={-23.5}
      schRotation={-90}
      pcbRotation={180}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U20 > .pin8"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R76" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={25} schY={4} pcbX={-22.0} pcbY={-31.5}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.RS485_DE", pin2: "net.GND" }} />
    <PSM712_LF_T7 name="D3" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U20" schX={28} schY={4} pcbX={-27.5} pcbY={-30.75}
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
    <capacitor name="C60" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="serial" schSectionName="serial_U21" schX={21.6} schY={7} pcbX={-39.5} pcbY={-5.2}
      schRotation={-90}
      pcbRotation={0}
      capacitance="100nF" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      maxDecouplingTraceLength="30mm"
      decouplingFor=".U21 > .pin16"
      maxVoltageRating="50V"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q17" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={0} schY={0} pcbX={-7} pcbY={-31}
      connections={{ base: "net.DIN0_BASE", emitter: "net.GND", collector: "net.DIN0" }} />
    <resistor name="R77" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={5} schY={2} pcbX={-4.75} pcbY={-28.0}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIN0_24V", pin2: "net.DIN0_BASE" }} pcbRotation={180} />
    <resistor name="R78" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={8} schY={2} pcbX={2.5} pcbY={-34.75}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.DIN0_BASE", pin2: "net.GND" }} />
    <resistor name="R79" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={11} schY={2} pcbX={-11.0} pcbY={-32.5}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIN0" }} />
    <BAV21W_7_F name="D4" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q17" schX={9.5} schY={2} pcbX={-7.5} pcbY={-25.75} layer="top"
      schRotation={90}
      connections={{ pin1: "net.DIN0_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q18" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={17} schY={0} pcbX={-2} pcbY={-31} pcbRotation={180}
      connections={{ base: "net.DIN1_BASE", emitter: "net.GND", collector: "net.DIN1" }} />
    <resistor name="R80" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={22} schY={2} pcbX={-8} pcbY={-23.75}
      resistance="47k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.DIN1_24V", pin2: "net.DIN1_BASE" }} />
    <resistor name="R81" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={25} schY={2} pcbX={4.5} pcbY={-15.5}
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.DIN1_BASE", pin2: "net.GND" }} pcbRotation={90} />
    <resistor name="R82" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={28} schY={2} pcbX={19.0} pcbY={-20.0} pcbRotation={180}
      schRotation={-90}
      resistance="4.7k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.DIN1" }} />
    <BAV21W_7_F name="D5" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="inputs" schSectionName="inputs_Q18" schX={26.5} schY={2} pcbX={1} pcbY={-20} layer="top"
      schRotation={90}
      connections={{ pin1: "net.DIN1_BASE", pin2: "net.GND" }} />
    <MMBT5551LT1G name="Q24" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={0} schY={0} pcbX={22} pcbY={17} layer="top"
      connections={{ base: "net.OUT0_BASE", emitter: "net.GND", collector: "net.OUT0" }} />
    <resistor name="R98" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={-3} schY={0} pcbX={19.25} pcbY={17.0} layer="top"
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.OUT0_DRIVE", pin2: "net.OUT0_BASE" }} pcbRotation={90} />
    <resistor name="R99" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={-1.5} schY={-2} pcbX={40.5} pcbY={0.5} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.OUT0_BASE", pin2: "net.GND" }} pcbRotation={270} />
    <SS110 name="D11" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q24" schX={4} schY={3} pcbX={15} pcbY={40} layer="top"
      schRotation={90}
      connections={{ pin1: "net.VMOTOR", pin2: "net.OUT0" }} />
    <MMBT5551LT1G name="Q25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={17} schY={0} pcbX={26} pcbY={17} layer="top"
      connections={{ base: "net.OUT1_BASE", emitter: "net.GND", collector: "net.OUT1" }} />
    <resistor name="R100" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={14} schY={0} pcbX={36.5} pcbY={10.0} layer="top"
      resistance="1k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.OUT1_DRIVE", pin2: "net.OUT1_BASE" }} />
    <resistor name="R101" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={15.5} schY={-2} pcbX={27.5} pcbY={13.5} layer="top"
      schRotation={-90}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.OUT1_BASE", pin2: "net.GND" }} pcbRotation={90} />
    <SS110 name="D12" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="outputs" schSectionName="outputs_Q25" schX={21} schY={3} pcbX={-16} pcbY={40} pcbRotation={180}
      schRotation={90}
      connections={{ pin1: "net.VMOTOR", pin2: "net.OUT1" }} />
    <trace name="BYPASS_C54" from=".U19 > .pin3" to=".C54 > .pin1" pcbPathRelativeTo=".U19 > .pin3" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":-2.599944},{"x":0.635,"y":-3.149944},{"x":0.935,"y":-3.449944},{"x":0.935,"y":-3.949944},{"x":0.985,"y":-3.999944},{"x":0.985,"y":-4.049944},{"x":1.285,"y":-4.349944},{"x":1.285,"y":-4.699944},{"x":1.335,"y":-4.749944},{"x":1.335,"y":-4.849944},{"x":1.385,"y":-4.899944},{"x":1.385,"y":-4.949944},{"x":1.425,"y":-5.0}]} />
    <trace name="BYPASS_C55" from=".U20 > .pin8" to=".C55 > .pin1" pcbPathRelativeTo=".U20 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":2.599944},{"x":-2.755,"y":2.599944},{"x":-2.855,"y":2.499944},{"x":-3.855,"y":2.499944},{"x":-3.925,"y":2.5}]} />
    <trace name="BYPASS_C60" from=".U21 > .pin16" to=".C60 > .pin1" pcbPathRelativeTo=".U21 > .pin16" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-4.445,"y":2.73558},{"x":-4.445,"y":3.43558},{"x":-4.645,"y":3.63558},{"x":-4.645,"y":4.58558},{"x":-4.695,"y":4.63558},{"x":-4.695,"y":5.03558},{"x":-4.745,"y":5.08558},{"x":-4.745,"y":5.13558},{"x":-4.795,"y":5.18558},{"x":-4.795,"y":5.23558},{"x":-4.825,"y":5.3}]} />
    {/* Local bypasses: <=3mm pad-to-pad placement, <=5mm routed path. */}
    <trace name="BYPASS_C2" from=".U1 > .pin10" to=".C2 > .pin1" pcbPathRelativeTo=".U1 > .pin10" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":1.499997,"y":0.799719},{"x":1.9,"y":0.799719},{"x":1.9,"y":3.475},{"x":0.4,"y":3.475}]} />
    <trace name="BYPASS_C6" from=".U2 > .pin32" to=".C6 > .pin1" pcbPathRelativeTo=".U2 > .pin32" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-2.050034,"y":-1.400048},{"x":-3.250034,"y":-2.600048},{"x":-3.300034,"y":-2.600048},{"x":-3.350034,"y":-2.650048},{"x":-3.400034,"y":-2.650048},{"x":-3.500034,"y":-2.750048},{"x":-3.650034,"y":-2.750048},{"x":-3.700034,"y":-2.800048},{"x":-3.750034,"y":-2.800048},{"x":-3.800034,"y":-2.850048},{"x":-3.850034,"y":-2.850048},{"x":-3.900034,"y":-2.900048},{"x":-3.950034,"y":-2.900048},{"x":-4.0,"y":-2.925}]} />
    <trace name="BYPASS_C7" from=".U2 > .pin1" to=".C7 > .pin1" pcbPathRelativeTo=".U2 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.400048,"y":-2.050034},{"x":-1.400048,"y":-2.600034},{"x":-1.700048,"y":-2.900034},{"x":-1.700048,"y":-3.300034},{"x":-1.750048,"y":-3.350034},{"x":-1.750048,"y":-3.400034},{"x":-1.800048,"y":-3.450034},{"x":-1.800048,"y":-3.500034},{"x":-1.850048,"y":-3.550034},{"x":-1.850048,"y":-3.650034},{"x":-1.900048,"y":-3.700034},{"x":-1.900048,"y":-3.750034},{"x":-2.000048,"y":-3.850034},{"x":-2.0,"y":-3.925}]} />
    <trace name="BYPASS_C8" from=".U2 > .pin4" to=".C8 > .pin1" pcbPathRelativeTo=".U2 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.200152,"y":-2.050034},{"x":-0.200152,"y":-2.750034},{"x":-0.000152,"y":-2.950034},{"x":-0.000152,"y":-3.850034},{"x":0.0,"y":-3.925}]} />
    <trace name="BYPASS_C9" from=".U3 > .pin8" to=".C9 > .pin1" pcbPathRelativeTo=".U3 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.905,"y":2.599944},{"x":-2.755,"y":2.599944},{"x":-2.855,"y":2.499944},{"x":-3.855,"y":2.499944},{"x":-3.925,"y":2.5}]} />
    <trace name="BYPASS_C10" from=".U4 > .pin5" to=".C10 > .pin1" pcbPathRelativeTo=".U4 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-3.050099,"y":-0.94996},{"x":-3.100099,"y":-0.99996},{"x":-3.175,"y":-1.0}]} />
    <trace name="BYPASS_C12" from=".U5 > .pin2" to=".C12 > .pin1" pcbPathRelativeTo=".U5 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.635,"y":-2.84607},{"x":-0.635,"y":-4.9461}]} />
    <trace name="BYPASS_C21" from=".U6 > .pin17" to=".C21 > .pin1" pcbPathRelativeTo=".U6 > .pin17" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":1.941957},{"x":-0.750062,"y":4.441957},{"x":-0.7875,"y":4.5}]} />
    <trace name="BYPASS_C25" from=".U7 > .pin3" to=".C25 > .pin1" pcbPathRelativeTo=".U7 > .pin3" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.75006,"y":-4.19989},{"x":-1.75006,"y":-4.74989},{"x":-1.85006,"y":-4.84989},{"x":-1.85006,"y":-5.19989},{"x":-3.10006,"y":-6.44989},{"x":-3.15006,"y":-6.44989},{"x":-3.20006,"y":-6.49989},{"x":-3.25006,"y":-6.49989},{"x":-3.30006,"y":-6.54989},{"x":-3.35006,"y":-6.54989},{"x":-3.4,"y":-6.5875}]} />
    <trace name="BYPASS_C26" from=".U7 > .pin5" to=".C26 > .pin1" pcbPathRelativeTo=".U7 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.750062,"y":-4.19989},{"x":-0.750062,"y":-4.79989},{"x":-0.700062,"y":-4.84989},{"x":-0.700062,"y":-4.94989},{"x":-0.650062,"y":-4.99989},{"x":-0.650062,"y":-5.19989},{"x":-0.450062,"y":-5.39989},{"x":-0.450062,"y":-5.49989},{"x":-0.400062,"y":-5.54989},{"x":-0.400062,"y":-5.59989},{"x":-0.350062,"y":-5.64989},{"x":-0.350062,"y":-5.69989},{"x":-0.100062,"y":-5.94989},{"x":-0.100062,"y":-6.24989},{"x":-0.050062,"y":-6.29989},{"x":-0.050062,"y":-6.34989},{"x":-6.2e-05,"y":-6.39989},{"x":-6.2e-05,"y":-6.44989},{"x":0.049938,"y":-6.49989},{"x":0.049938,"y":-6.59989},{"x":0.099938,"y":-6.64989},{"x":0.099938,"y":-6.69989},{"x":0.149938,"y":-6.74989},{"x":0.149938,"y":-6.79989},{"x":0.199938,"y":-6.84989},{"x":0.2,"y":-6.875}]} />
    <trace name="BYPASS_C27" from=".U7 > .pin29" to=".C27 > .pin1" pcbPathRelativeTo=".U7 > .pin29" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.750062,"y":4.19989},{"x":0.750062,"y":6.24989},{"x":0.75,"y":6.2875}]} />
    <trace name="BYPASS_C28" from=".U7 > .pin20" to=".C28 > .pin1" pcbPathRelativeTo=".U7 > .pin20" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":4.19989,"y":0.750062},{"x":6.04989,"y":0.750062},{"x":6.075,"y":0.75}]} />
    <trace name="BYPASS_C29" from=".U7 > .pin33" to=".C29 > .pin1" pcbPathRelativeTo=".U7 > .pin33" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.249934,"y":4.19989},{"x":-1.249934,"y":6.34989},{"x":-1.25,"y":6.375}]} />
    <trace name="BYPASS_C61" from=".U7 > .pin4" to=".C61 > .pin1" pcbPathRelativeTo=".U7 > .pin4" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.249934,"y":-4.19989},{"x":-1.249934,"y":-5.04989},{"x":-1.349934,"y":-5.14989},{"x":-1.349934,"y":-6.09989},{"x":-1.399934,"y":-6.14989},{"x":-1.399934,"y":-6.44989},{"x":-1.449934,"y":-6.49989},{"x":-1.449934,"y":-6.59989},{"x":-1.499934,"y":-6.64989},{"x":-1.499934,"y":-6.69989},{"x":-1.549934,"y":-6.74989},{"x":-1.549934,"y":-6.79989},{"x":-1.599934,"y":-6.84989},{"x":-1.6,"y":-6.875}]} />
    <trace name="BYPASS_C36" from=".U8 > .pin5" to=".C36 > .pin1" pcbPathRelativeTo=".U8 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.899922,"y":0.0},{"x":-2.925,"y":0.0}]} />
    <trace name="BYPASS_C37" from=".U9 > .pin5" to=".C37 > .pin1" pcbPathRelativeTo=".U9 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.899922,"y":-0.0},{"x":-0.949922,"y":0.05},{"x":-1.399922,"y":0.05},{"x":-1.599922,"y":0.25},{"x":-1.599922,"y":1.1},{"x":-1.349922,"y":1.35},{"x":-1.349922,"y":1.7},{"x":-1.299922,"y":1.75},{"x":-1.299922,"y":1.8},{"x":-1.249922,"y":1.85},{"x":-1.249922,"y":1.9},{"x":-1.199922,"y":1.95},{"x":-1.199922,"y":2.0},{"x":-1.149922,"y":2.05},{"x":-1.149922,"y":2.15},{"x":-1.099922,"y":2.2},{"x":-1.099922,"y":2.25},{"x":-1.049922,"y":2.3},{"x":-1.049922,"y":2.35},{"x":-0.999922,"y":2.4},{"x":-1.0,"y":2.425}]} />
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
    <resistor name="R119" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_board-sense" schX={20} schY={-9} schRotation={-90} pcbX={-28} pcbY={-7} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.BOARD_POWER_SENSE" }} />
    <resistor name="R120" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_board-sense" schX={20} schY={-12} schRotation={-90} pcbX={-28} pcbY={-9} pcbRotation={180}
      resistance="10k" footprint="0603" supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.BOARD_POWER_SENSE", pin2: "net.GND" }} />
    <TPS2553DBVR name="U28" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={0} schY={0} pcbX={-18} pcbY={3}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_DATA_VBUS", pin2: "net.GND", pin3: "net.USB_DATA_VBUS", pin5: "net.USB_ILIM", pin6: "net.USB_LOGIC_5V" }} pcbRotation={0} />
    <TLV75533PDBVR name="U25" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={12} schY={0} pcbX={-18} pcbY={-1}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.USB_LOGIC_5V", pin2: "net.GND", pin3: "net.USB_LOGIC_5V", pin5: "net.V3V3_USB" }} pcbRotation={90} />
    <LM66100DCKR name="U26" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={0} schY={-10} pcbX={-17} pcbY={-5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3", pin2: "net.GND", pin3: "net.V3V3_USB", pin5: "net.USB_OR_SELECT", pin6: "net.V3V3_MCU" }} pcbRotation={90} />
    <LM66100DCKR name="U27" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U27" schX={12} schY={-10} pcbX={-6} pcbY={-3.5}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND", pin3: "net.USB_OR_SELECT", pin5: "net.GND", pin6: "net.V3V3_MCU" }} pcbRotation={90} />
    <resistor name="R112" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={6} schY={-8} pcbX={-20.5} pcbY={-4.0}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.USB_OR_SELECT" }} pcbRotation={0} schRotation={-90} />
    <resistor name="R113" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={4} schY={-3} pcbX={-22.0} pcbY={5.5}
      layer="top"
      resistance="100k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.USB_ILIM", pin2: "net.GND" }} pcbRotation={0} schRotation={-90} />
    <capacitor name="C74" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U28" schX={-3} schY={-4} pcbX={-14.75} pcbY={5}
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
    <capacitor name="C75" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={9} schY={-4} pcbX={-14.7} pcbY={0.3}
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
    <capacitor name="C76" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U25" schX={15} schY={-4} pcbX={-14.7} pcbY={-2.3}
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
    <capacitor name="C77" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U26" schX={-3} schY={-14} pcbX={-13.2} pcbY={-5}
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
    <capacitor name="C78" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="usb-logic" schSectionName="usb-logic_U27" schX={16.2} schY={-4} pcbX={-5.0} pcbY={-6.0}
      layer="top"
      pcbRotation={0}
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U27 > .pin1"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3_USB", pin2: "net.GND" }} />
    <TMP102AIDRLR name="U29" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U29" schX={0} schY={0} pcbX={20} pcbY={8}
      layer="top"
      connections={{ pin1: "net.PD_SCL", pin2: "net.GND", pin3: "net.TEMP_OK", pin4: "net.GND", pin5: "net.V3V3", pin6: "net.PD_SDA" }} pcbRotation={0} />
    <SN74LVC1G08DBVR name="U33" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U29" schX={12} schY={0} pcbX={6} pcbY={4.5}
      layer="top"
      connections={{ pin1: "net.RUN_WINDOW_OK", pin2: "net.TEMP_OK", pin3: "net.GND", pin4: "net.RUN_SAFE", pin5: "net.V3V3" }} pcbRotation={0} />
    <resistor name="R114" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U29" schX={9} schY={1.3} pcbX={26.0} pcbY={10.0}
      layer="top"
      resistance="10k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C844918"] }}
      connections={{ pin1: "net.V3V3", pin2: "net.TEMP_OK" }} pcbRotation={90} schRotation={-90} />
    <ADS1115IDGSR name="U30" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U30" schX={0} schY={-12} pcbX={-6} pcbY={5}
      layer="top"
      noConnect={["pin2"]}
      connections={{ pin1: "net.V3V3", pin3: "net.GND", pin4: "net.VMON_ADC", pin5: "net.IIN_MON", pin6: "net.GND", pin7: "net.GND", pin8: "net.V3V3", pin9: "net.PD_SDA", pin10: "net.PD_SCL" }} pcbRotation={0} />
    <INA240A1DR name="U31" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U31" schX={0} schY={-24} pcbX={15} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_A1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_A_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_A1" }} pcbRotation={270} />
    <FRM121WFR005TM name="R115" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U31" schX={-4} schY={-21} pcbX={15} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_A1", pin2: "net.MOTOR_A1_OUT" }} pcbRotation={180} />
    <resistor name="R117" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U31" schX={4} schY={-24} pcbX={20} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_A_RAW", pin2: "net.PHASE_A_ADC" }} pcbRotation={270} />
    <INA240A1DR name="U32" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U32" schX={14} schY={-24} pcbX={25} pcbY={-25}
      layer="top"
      noConnect={["pin4"]}
      connections={{ pin1: "net.MOTOR_B1_OUT", pin2: "net.GND", pin3: "net.GND", pin5: "net.PHASE_B_RAW", pin6: "net.V3V3", pin7: "net.V3V3", pin8: "net.MOTOR_B1" }} pcbRotation={270} />
    <FRM121WFR005TM name="R116" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U32" schX={10} schY={-21} pcbX={25} pcbY={-20.5}
      layer="top"
      connections={{ pin1: "net.MOTOR_B1", pin2: "net.MOTOR_B1_OUT" }} pcbRotation={180} />
    <resistor name="R118" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U32" schX={18} schY={-24} pcbX={30} pcbY={-28.5}
      layer="top"
      resistance="1k"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PHASE_B_RAW", pin2: "net.PHASE_B_ADC" }} pcbRotation={270} />
    <capacitor name="C79" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U29" schX={0} schY={-6} pcbX={19.5} pcbY={6.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U29 > .pin5"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C80" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U30" schX={1.2} schY={-6} pcbX={-2.5} pcbY={7.0}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U30 > .pin8"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C81" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U31" schX={2.4} schY={-6} pcbX={20} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U31 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C82" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U32" schX={3.6} schY={-6} pcbX={30} pcbY={-24}
      layer="top"
      capacitance="100nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      decouplingFor=".U32 > .pin6"
      maxDecouplingTraceLength="5mm"
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} pcbRotation={90} />
    <capacitor name="C83" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U31" schX={5} schY={-28} pcbX={17.5} pcbY={-29.2}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_A_ADC", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C84" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U32" schX={19} schY={-28} pcbX={27.5} pcbY={-29.2}
      layer="top"
      capacitance="10nF"
      footprint="0603"
      supplierPartNumbers={{ jlcpcb: ["C57112"] }}
      schRotation={-90}
      maxVoltageRating="50V"
      connections={{ pin1: "net.PHASE_B_ADC", pin2: "net.GND" }} pcbRotation={0} />
    <capacitor name="C85" pcbStyle={{ silkscreenTextVisibility: "hidden" }} schSheetName="telemetry" schSectionName="telemetry_U33" schX={4.8} schY={-6} pcbX={3.0} pcbY={5.5}
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
    <trace name="BYPASS_C78" from=".U27 > .pin1" to=".C78 > .pin1" pcbPathRelativeTo=".U27 > .pin1" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.649986,"y":-1.100074},{"x":-0.799986,"y":-0.950074},{"x":-1.099986,"y":-0.950074},{"x":-1.349986,"y":-0.700074},{"x":-1.399986,"y":-0.700074},{"x":-1.449986,"y":-0.650074},{"x":-1.499986,"y":-0.650074},{"x":-1.549986,"y":-0.600074},{"x":-1.599986,"y":-0.600074},{"x":-1.649986,"y":-0.550074},{"x":-1.699986,"y":-0.550074},{"x":-1.749986,"y":-0.500074},{"x":-1.799986,"y":-0.500074},{"x":-1.849986,"y":-0.450074},{"x":-1.949986,"y":-0.450074},{"x":-1.999986,"y":-0.400074},{"x":-2.049986,"y":-0.400074},{"x":-2.099986,"y":-0.350074},{"x":-2.149986,"y":-0.350074},{"x":-2.199986,"y":-0.300074},{"x":-2.249986,"y":-0.300074},{"x":-2.299986,"y":-0.250074},{"x":-2.349986,"y":-0.250074},{"x":-2.399986,"y":-0.200074},{"x":-2.449986,"y":-0.200074},{"x":-2.5,"y":-0.175}]} />
    <trace name="BYPASS_C79" from=".U29 > .pin5" to=".C79 > .pin1" pcbPathRelativeTo=".U29 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-0.749986,"y":-0.000127},{"x":-0.849986,"y":-0.100127},{"x":-1.249986,"y":-0.100127},{"x":-1.299986,"y":-0.150127},{"x":-1.299986,"y":-1.950127},{"x":-1.325,"y":-2.0}]} />
    <trace name="BYPASS_C80" from=".U30 > .pin8" to=".C80 > .pin1" pcbPathRelativeTo=".U30 > .pin8" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.0,"y":2.109978},{"x":0.0,"y":1.559978},{"x":0.1,"y":1.459978},{"x":0.1,"y":1.109978},{"x":0.15,"y":1.059978},{"x":1.35,"y":1.059978},{"x":2.0,"y":1.709978},{"x":2.05,"y":1.709978},{"x":2.1,"y":1.759978},{"x":2.2,"y":1.759978},{"x":2.25,"y":1.809978},{"x":2.3,"y":1.809978},{"x":2.35,"y":1.859978},{"x":2.4,"y":1.859978},{"x":2.45,"y":1.909978},{"x":2.5,"y":1.909978},{"x":2.55,"y":1.959978},{"x":2.65,"y":1.959978},{"x":2.675,"y":2.0}]} />
    <trace name="BYPASS_C81" from=".U31 > .pin6" to=".C81 > .pin1" pcbPathRelativeTo=".U31 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.7051},{"x":0.635,"y":3.2551},{"x":0.335,"y":3.5551},{"x":0.335,"y":3.9051},{"x":0.285,"y":3.9551},{"x":0.285,"y":4.0051},{"x":0.235,"y":4.0551},{"x":0.235,"y":4.1051},{"x":0.185,"y":4.1551},{"x":0.185,"y":4.2551},{"x":-0.015,"y":4.4551},{"x":-0.015,"y":4.6551},{"x":-0.065,"y":4.7051},{"x":-0.065,"y":4.8051},{"x":-0.115,"y":4.8551},{"x":-0.115,"y":4.9051},{"x":-0.165,"y":4.9551},{"x":-0.175,"y":5.0}]} />
    <trace name="BYPASS_C82" from=".U32 > .pin6" to=".C82 > .pin1" pcbPathRelativeTo=".U32 > .pin6" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.635,"y":2.7051},{"x":0.635,"y":3.2551},{"x":0.335,"y":3.5551},{"x":0.335,"y":3.9051},{"x":0.285,"y":3.9551},{"x":0.285,"y":4.0051},{"x":0.235,"y":4.0551},{"x":0.235,"y":4.1051},{"x":0.185,"y":4.1551},{"x":0.185,"y":4.2551},{"x":-0.015,"y":4.4551},{"x":-0.015,"y":4.6551},{"x":-0.065,"y":4.7051},{"x":-0.065,"y":4.8051},{"x":-0.115,"y":4.8551},{"x":-0.115,"y":4.9051},{"x":-0.165,"y":4.9551},{"x":-0.175,"y":5.0}]} />
    <trace name="BYPASS_C85" from=".U33 > .pin5" to=".C85 > .pin1" pcbPathRelativeTo=".U33 > .pin5" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":-1.300099,"y":-0.94996},{"x":-1.600099,"y":-0.64996},{"x":-1.650099,"y":-0.64996},{"x":-2.050099,"y":-0.24996},{"x":-2.100099,"y":-0.24996},{"x":-2.150099,"y":-0.19996},{"x":-2.200099,"y":-0.19996},{"x":-2.250099,"y":-0.14996},{"x":-2.300099,"y":-0.14996},{"x":-2.350099,"y":-0.09996},{"x":-2.450099,"y":-0.09996},{"x":-2.500099,"y":-0.04996},{"x":-2.550099,"y":-0.04996},{"x":-2.600099,"y":4e-05},{"x":-2.650099,"y":4e-05},{"x":-2.700099,"y":0.05004},{"x":-2.750099,"y":0.05004},{"x":-2.850099,"y":0.15004},{"x":-2.950099,"y":0.15004},{"x":-3.0,"y":0.175}]} />
    <trace name="GATE_Q6" from=".R38 > .pin2" to=".Q6 > .pin4" pcbPathRelativeTo=".R38 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q7" from=".R39 > .pin2" to=".Q7 > .pin4" pcbPathRelativeTo=".R39 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q8" from=".R42 > .pin2" to=".Q8 > .pin4" pcbPathRelativeTo=".R42 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.725,"y":0.0},{"x":2.774606,"y":-0.005}]} />
    <trace name="GATE_Q9" from=".R43 > .pin2" to=".Q9 > .pin4" pcbPathRelativeTo=".R43 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":1.675,"y":0.85},{"x":1.725,"y":0.85},{"x":2.225,"y":1.35},{"x":2.225,"y":1.4},{"x":2.275,"y":1.45},{"x":2.275,"y":1.5},{"x":2.325,"y":1.55},{"x":2.325,"y":1.65},{"x":2.375,"y":1.7},{"x":2.375,"y":1.75},{"x":2.405,"y":1.774606}]} />
    <trace name="GATE_Q10" from=".R46 > .pin2" to=".Q10 > .pin4" pcbPathRelativeTo=".R46 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.525,"y":0.0},{"x":2.574606,"y":-0.005}]} />
    <trace name="GATE_Q11" from=".R47 > .pin2" to=".Q11 > .pin4" pcbPathRelativeTo=".R47 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":1.625,"y":-0.8},{"x":1.625,"y":-1.25},{"x":2.025,"y":-1.65},{"x":2.025,"y":-1.7},{"x":2.075,"y":-1.75},{"x":2.075,"y":-1.8},{"x":2.125,"y":-1.85},{"x":2.125,"y":-1.9},{"x":2.175,"y":-1.95},{"x":2.175,"y":-2.0},{"x":2.225,"y":-2.05},{"x":2.225,"y":-2.15},{"x":2.275,"y":-2.2},{"x":2.275,"y":-2.25},{"x":2.325,"y":-2.3},{"x":2.325,"y":-2.35},{"x":2.375,"y":-2.4},{"x":2.375,"y":-2.45},{"x":2.395,"y":-2.474606}]} />
    <trace name="GATE_Q12" from=".R50 > .pin2" to=".Q12 > .pin4" pcbPathRelativeTo=".R50 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.525,"y":0.0},{"x":2.574606,"y":-0.005}]} />
    <trace name="GATE_Q13" from=".R51 > .pin2" to=".Q13 > .pin4" pcbPathRelativeTo=".R51 > .pin2" thickness="0.2mm" maxLength="5mm" pcbPath={[{"x":0.825,"y":0.0},{"x":2.525,"y":0.0},{"x":2.574606,"y":-0.005}]} />
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
    <silkscreentext text="Y1" pcbX={-11.0000} pcbY={-15.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="SW1" pcbX={-18.0000} pcbY={-38.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J2 MOTOR" pcbX={20.0} pcbY={-36.0} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="J3" pcbX={0.0000} pcbY={38.5000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U16" pcbX={-20.0000} pcbY={-6.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U7" pcbX={20.0} pcbY={4.0} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U21" pcbX={-35.5} pcbY={-10.5} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U17" pcbX={-16.2500} pcbY={-26.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U5" pcbX={-31.5} pcbY={8} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U22" pcbX={-11.0} pcbY={16.25} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U18" pcbX={-2.5} pcbY={-4.6} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="SWD TEST" pcbX={-17.5} pcbY={-32} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="ENC TEST" pcbX={-6} pcbY={-33.4} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U3" pcbX={-21.7500} pcbY={34.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U19" pcbX={-36} pcbY={-23.5} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U20" pcbX={-18.7500} pcbY={-26.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U2" pcbX={-27.2500} pcbY={23.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U6" pcbX={-0.5000} pcbY={22.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U1" pcbX={-30} pcbY={21.6} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U4" pcbX={-9.2500} pcbY={24.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U11" pcbX={-4.0000} pcbY={-12.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U13" pcbX={10.0000} pcbY={-20.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U14" pcbX={5.0000} pcbY={-32.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U10" pcbX={-4.0000} pcbY={-7.0000} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U12" pcbX={2.5000} pcbY={-22.2500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U15" pcbX={12.0} pcbY={34.55} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U24" pcbX={-14.75} pcbY={7.2} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U23" pcbX={-23.75} pcbY={7.2} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U8" pcbX={6.3} pcbY={-8} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="U9" pcbX={7.5} pcbY={-9.7} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="L1" pcbX={-20} pcbY={15} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="L2" pcbX={-4} pcbY={19} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="R109" pcbX={20.0000} pcbY={-21.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
    <silkscreentext text="R110" pcbX={31.0000} pcbY={-21.7500} fontSize={0.8} anchorAlignment="center" layer="top" />
  </board>
)

export default PD1180EPR
