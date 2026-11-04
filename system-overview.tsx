import { systemblock } from "system-block-core"
const Block = systemblock.component

/** Functional interfaces only. The electrical connections remain in index.circuit.tsx. */
export const SystemOverview = () => (
  <>
    <systemblock.page name="system-overview" displayName="1. NEMA34 controller overview" direction="right"
      description="48 V EPR motor power; independent USB DATA. Design overview, not hardware qualification. Motion remains locked.">
      <Block name="pd" displayName="J1: USB-C PD POWER"
        description="U1 protection; U2 TPS26750 + U3 configuration. Requests 48 V / 5 A."
        pcbComponentNames={["J1", "U1", "U2", "U3", "U36"]} />
      <Block name="bus" displayName="Protected motor supply"
        description="Q4/Q5 reverse blocking; U6 eFuse. VMOTOR is separate from DATA VBUS."
        pcbComponentNames={["Q4", "Q5", "U6"]} />
      <Block name="driver" displayName="U7: DRV8462DDVR"
        description="Integrated dual H-bridge and winding-current regulation; J2 WAGO output."
        pcbComponentNames={["U7", "J2"]} />
      <Block name="motor" displayName="External NEMA34 motor"
        description="34HS31-6004S1. Run current and cooling still require qualification." />
      <Block name="control" displayName="U16: RP2040 controller"
        description="U17 boot flash. USB diagnostics, STEP/DIR and supervision; motion locked."
        pcbComponentNames={["U16", "U17"]} />
      <Block name="data" displayName="J10: USB DATA + logic power"
        description="U28 current limit, U25 3.3 V LDO. DATA-only can boot MCU, not motor."
        pcbComponentNames={["J10", "U28", "U25"]} />
      <Block name="logic" displayName="Board and MCU supplies"
        description="PD buck plus motor-bus backup; reverse-blocked selection. See power page."
        pcbComponentNames={["U5", "U22", "U23", "U24", "U26", "U27"]} />
      <Block name="brake" displayName="Independent brake + J3"
        description="Bus rise near 52 V switches Q16; external resistor converts returned energy to heat."
        pcbComponentNames={["U12", "U13", "U15", "U34", "Q16", "J3"]} />
      <Block name="resistor" displayName="External resistor + cooling"
        description="10 ohm / 300 W provisional. Cooling, duty cycle and mounting unqualified." />
      <systemblock.connection from="pd" to="bus" kind="power" label="PD_VBUS; gated by U4" />
      <systemblock.connection from="bus" to="driver" kind="power" direction="both" label="VMOTOR / returned energy" />
      <systemblock.connection from="driver" to="motor" kind="power" direction="both" label="J2: A1/A2/B1/B2" />
      <systemblock.connection from="pd" to="logic" kind="power" label="PD_VBUS" />
      <systemblock.connection from="logic" to="control" kind="power" label="V3V3_MCU" />
      <systemblock.connection from="data" to="control" kind="power" label="3.3 V via U27" />
      <systemblock.connection from="data" to="control" direction="both" label="USB 2.0" />
      <systemblock.connection from="control" to="driver" label="STEP/DIR, SPI; hardware run gates" />
      <systemblock.connection from="bus" to="brake" kind="power" label="VMOTOR" />
      <systemblock.connection from="brake" to="resistor" kind="power" label="J3: switched dissipation" />
    </systemblock.page>

    <systemblock.page name="logic-power" displayName="2. Power domains and PD-loss backup" direction="right"
      description="U5/U22/U34 are step-down bucks. Input VBUS rails are never joined. Arrows identify power paths, not firmware commands.">
      <Block name="pd" displayName="J1: PD_VBUS" description="5 V startup, then qualified 48 V EPR contract." pcbComponentName="J1" />
      <Block name="motor" displayName="U6: VMOTOR" description="Protected bus; can retain regenerative energy after PD loss." pcbComponentName="U6" />

        <Block name="pd-buck" displayName="U5 + L1: 3.3 V buck" description="V3V3_PD: boots before motor eFuse is enabled." pcbComponentNames={["U5", "L1"]} />
        <Block name="backup" displayName="U22 + L2: 3.3 V backup" description="V3V3_MOTOR: sustains brake logic from charged VMOTOR." pcbComponentNames={["U22", "L2"]} />
        <Block name="board-or" displayName="U23 / U24: supply selection" description="Reverse blocking and status interlock produce board V3V3." pcbComponentNames={["U23", "U24"]} />


        <Block name="data" displayName="J10 + U28: DATA 5 V" description="Current-limited input; no connection to VMOTOR." pcbComponentNames={["J10", "U28"]} />
        <Block name="ldo" displayName="U25: 3.3 V LDO" description="V3V3_USB; no PD negotiation on J10." pcbComponentName="U25" />

      <Block name="mcu-or" displayName="U26 / U27: MCU selection" description="Reverse-blocked board/DATA supply into V3V3_MCU." pcbComponentNames={["U26", "U27"]} />
      <Block name="mcu" displayName="U16 + U17: MCU / flash" description="Can boot from DATA only. Board peripherals require board power." pcbComponentNames={["U16", "U17"]} />
      <Block name="sensing" displayName="Board sensing and brake logic" description="V3V3: comparators, ADCs, temperature and driver logic." pcbComponentNames={["U12", "U13", "U14", "U29", "U30", "U38"]} />
      <Block name="brake-buck" displayName="U34 + L3: 12 V brake buck" description="VMOTOR supplies BRAKE_12V even if PD input disappears." pcbComponentNames={["U34", "L3"]} />
      <Block name="brake-driver" displayName="U15: brake gate drive" description="12 V gate power for Q16; not the motor H-bridge supply." pcbComponentNames={["U15", "Q16"]} />
      <systemblock.connection from="pd" to="pd-buck" kind="power" label="PD_VBUS" />
      <systemblock.connection from="motor" to="backup" kind="power" label="VMOTOR" />
      <systemblock.connection from="pd-buck" to="board-or" kind="power" label="V3V3_PD" />
      <systemblock.connection from="backup" to="board-or" kind="power" label="V3V3_MOTOR" />
      <systemblock.connection from="data" to="ldo" kind="power" label="USB_LOGIC_5V" />
      <systemblock.connection from="ldo" to="mcu-or" kind="power" label="V3V3_USB" />
      <systemblock.connection from="board-or" to="mcu-or" kind="power" label="V3V3" />
      <systemblock.connection from="mcu-or" to="mcu" kind="power" label="V3V3_MCU" />
      <systemblock.connection from="board-or" to="sensing" kind="power" label="V3V3" />
      <systemblock.connection from="motor" to="brake-buck" kind="power" label="VMOTOR" />
      <systemblock.connection from="brake-buck" to="brake-driver" kind="power" label="BRAKE_12V" />
    </systemblock.page>

    <systemblock.page name="protection" displayName="3. Power permission, run gates and brake" direction="right"
      description="Hardware inhibits are independent of software. Nominal thresholds are design targets; powered fault tests remain required.">
      <Block name="pd" displayName="U2: PD path status" description="Q2/Q3 translate controller status to PD_PATH_OK." pcbComponentNames={["U2", "Q2", "Q3"]} />
      <Block name="mcu" displayName="U16: firmware permission" description="Requires PD contract, fresh telemetry and qualification gates." pcbComponentName="U16" />
      <Block name="permit" displayName="U4: power AND gate" description="EFUSE_EN = PD_PATH_OK AND POWER_PERMIT." pcbComponentName="U4" />
      <Block name="efuse" displayName="U6: eFuse" description="Current/voltage protection, power good and latched fault." pcbComponentName="U6" />
      <Block name="ovp" displayName="U12 / U14: bus overvoltage" description="VMOTOR_OK deasserts near 53.21 V." pcbComponentNames={["U12", "U14"]} />
      <Block name="temp" displayName="U29: board temperature" description="TEMP_OK hardware inhibit; not a driver-junction measurement." pcbComponentName="U29" />
      <Block name="run" displayName="U10 / U11 / U33: run AND gates" description="MCU_RUN AND MOTOR_PG AND VMOTOR_OK AND TEMP_OK." pcbComponentNames={["U10", "U11", "U33"]} />
      <Block name="driver" displayName="U7: motor driver enable" description="RUN_SAFE low disables bridges. STEP/DIR and nSLEEP remain MCU-controlled." pcbComponentName="U7" />
      <Block name="threshold" displayName="U12 / U13: brake comparator" description="VMOTOR divider + reference; BRAKE_ON near 52 V without MCU command." pcbComponentNames={["U12", "U13"]} />
      <Block name="brake" displayName="U15 + Q16: brake switch" description="U22 backs logic; U34 supplies gate power. J3 resistor required." pcbComponentNames={["U15", "Q16", "U22", "U34", "J3"]} />
      <systemblock.connection from="pd" to="permit" label="PD_PATH_OK" />
      <systemblock.connection from="mcu" to="permit" label="POWER_PERMIT" />
      <systemblock.connection from="permit" to="efuse" label="EFUSE_EN" />
      <systemblock.connection from="efuse" to="run" label="MOTOR_PG" />
      <systemblock.connection from="mcu" to="run" label="MCU_RUN" />
      <systemblock.connection from="ovp" to="run" label="VMOTOR_OK" />
      <systemblock.connection from="temp" to="run" label="TEMP_OK" />
      <systemblock.connection from="run" to="driver" label="RUN_SAFE" />
      <systemblock.connection from="threshold" to="brake" label="BRAKE_ON" />
    </systemblock.page>

    <systemblock.page name="control-telemetry" displayName="4. Control, measurements and diagnostics" direction="right"
      description="PD_READY is derived from a valid EPR contract plus fresh raw-PD ADC data. MOTOR_PG is a separate eFuse signal.">
      <Block name="mcu" displayName="U16: RP2040" description="Firmware checks freshness, supply state and latched faults before allowing motion." pcbComponentName="U16" />
      <Block name="pd" displayName="U2 / U3: PD policy" description="TPS26750 APP/sink/EPR contract; EEPROM stores configuration. U36 isolates programming bus." pcbComponentNames={["U2", "U3", "U36"]} />
      <Block name="raw-adc" displayName="U38: INA237 raw-PD ADC" description="PD_VBUS before eFuse; independent of protected motor-bus voltage." pcbComponentName="U38" />
      <Block name="bus-adc" displayName="U30: ADS1115" description="VMOTOR divider, eFuse current monitor and J3 brake-return preflight." pcbComponentName="U30" />
      <Block name="phase" displayName="U31 / U32: phase-current sense" description="Inline shunts + INA240. Diagnostic samples, not motor current regulation." pcbComponentNames={["U31", "U32", "R115", "R116"]} />
      <Block name="temperature" displayName="U29: TMP102" description="Board temperature and hardware TEMP_OK output." pcbComponentName="U29" />
      <Block name="encoder" displayName="U18: optional AS5600 (DNP)" description="Angle telemetry only; rear magnet interface unqualified. No closed-loop motion claim." pcbComponentName="U18" />
      <Block name="driver" displayName="U7: DRV8462DDVR" description="SPI setup; STEP/DIR/nSLEEP commands; nFAULT and HOME feedback." pcbComponentName="U7" />
      <Block name="indicators" displayName="U35 / U37: status outputs" description="RGB and buzzer with reset-domain buffer. Indicators do not implement hardware protection." pcbComponentNames={["U35", "U37", "D16", "BZ1"]} />
      <Block name="controls" displayName="SW1 / SW2: local controls" description="Reset and local START/STOP. Qualification locks still prevent motion." pcbComponentNames={["SW1", "SW2"]} />
      <systemblock.connection from="pd" to="mcu" direction="both" label="PD_SCL / PD_SDA: contract" />
      <systemblock.connection from="raw-adc" to="mcu" direction="both" label="PD bus: raw voltage" />
      <systemblock.connection from="bus-adc" to="mcu" direction="both" label="PD bus: voltage / current / brake" />
      <systemblock.connection from="temperature" to="mcu" direction="both" label="PD bus: temperature" />
      <systemblock.connection from="phase" to="mcu" label="PHASE_A_ADC / PHASE_B_ADC" />
      <systemblock.connection from="encoder" to="mcu" direction="both" label="ENC_SCL / ENC_SDA" />
      <systemblock.connection from="mcu" to="driver" direction="both" label="SPI, STEP/DIR, fault / home" />
      <systemblock.connection from="mcu" to="indicators" label="PD I2C + STATUS_GPIO reset" />
      <systemblock.connection from="controls" to="mcu" label="NRST / USER_BUTTON_N" />
    </systemblock.page>
  </>
)
