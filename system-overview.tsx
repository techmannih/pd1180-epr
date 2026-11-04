import { systemblock } from "system-block-core"
const Block = systemblock.component

/** Review interfaces only; electrical connections remain in index.circuit.tsx. */
export const SystemOverview = () => (
  <>
    <systemblock.page name="system-overview" displayName="1. Start here: power and motion" direction="right"
      description="Orange dashed arrows carry power; blue arrows carry signals. Read the PD input, motor supply and motor drive first. Details are on pages 2–4.">
      <systemblock.group name="inputs" displayName="USB inputs">
        <Block name="pd" displayName="PD power · J1"
          description={"48 V / 5 A EPR request\nU2 TPS26750 + U1 protection"}
          pcbComponentNames={["J1", "U1", "U2", "U3", "U36"]} />
        <Block name="data" displayName="USB data · J10"
          description={"USB diagnostics + MCU power\nDATA alone cannot run the motor"}
          pcbComponentNames={["J10", "U28", "U25"]} />
      </systemblock.group>
      <systemblock.group name="control-domain" displayName="Power and control">
        <Block name="bus" displayName="Motor supply"
          description={"U6 eFuse + Q4/Q5\nLimits input; blocks reverse flow"}
          pcbComponentNames={["Q4", "Q5", "U6"]} />
        <Block name="control" displayName="Controller · U16"
          description={"RP2040 + U17 flash\nMotion locked pending bench tests"}
          pcbComponentNames={["U16", "U17"]} />
      </systemblock.group>
      <systemblock.group name="motor-domain" displayName="Motor and brake">
        <Block name="brake" displayName="Brake output · J3"
          description={"Near 52 V: Q16 switches resistor\nExternal 10 Ω / 300 W provisional"}
          pcbComponentNames={["U12", "U13", "U15", "U34", "Q16", "J3"]} />
        <Block name="driver" displayName="Motor drive · U7"
          description={"DRV8462DDVR\nBuilt-in bridges; current control"}
          pcbComponentName="U7" />
        <Block name="motor" displayName="Motor output · J2"
          description={"WAGO → external NEMA34\n34HS31-6004S1; current unqualified"}
          pcbComponentName="J2" />
      </systemblock.group>
      <systemblock.connection from="pd" to="bus" kind="power" label="PD input" />
      <systemblock.connection from="bus" to="driver" kind="power" direction="both" label="Motor bus / regen" />
      <systemblock.connection from="driver" to="motor" kind="power" direction="both" label="Two windings" />
      <systemblock.connection from="pd" to="control" kind="power" label="Logic power (p.2)" />
      <systemblock.connection name="data-power" from="data" to="control" kind="power" label="3.3 V" />
      <systemblock.connection name="data-link" from="data" to="control" direction="both" label="USB" />
      <systemblock.connection from="control" to="driver" label="Commands" />
      <systemblock.connection from="bus" to="brake" kind="power" label="Bus energy" />
    </systemblock.page>

    <systemblock.page name="logic-power" displayName="2. What powers each circuit" direction="right"
      description="The PD and DATA inputs are not joined. U5/U22/U34 are step-down bucks, not buck-boosts. VMOTOR backup keeps the independent brake powered during PD loss.">
      <systemblock.group name="sources" displayName="3.3 V sources">
        <Block name="pd-buck" displayName="PD → 3.3 V"
          description={"J1 → U5 + L1 buck\nBoots before motor power is on"}
          pcbComponentNames={["J1", "U5", "L1"]} />
        <Block name="backup" displayName="Motor bus → 3.3 V"
          description={"VMOTOR → U22 + L2 buck\nBrake-logic backup if PD is lost"}
          pcbComponentNames={["U6", "U22", "L2"]} />
        <Block name="data" displayName="DATA → 3.3 V"
          description={"J10 → U28 current limit\nU25 LDO; no PD negotiation"}
          pcbComponentNames={["J10", "U28", "U25"]} />
      </systemblock.group>
      <systemblock.group name="board-domain" displayName="Board supply">
        <Block name="board-or" displayName="Board supply selection"
          description={"U23 / U24 ideal diodes\nSelect power; prevent backfeed"}
          pcbComponentNames={["U23", "U24"]} />
        <Block name="sensing" displayName="Board logic"
          description={"Sensors, run gates, comparators\nDATA alone does not power these"}
          pcbComponentNames={["U12", "U13", "U14", "U29", "U30", "U38"]} />
      </systemblock.group>
      <systemblock.group name="mcu-domain" displayName="MCU supply">
        <Block name="mcu-or" displayName="MCU supply selection"
          description={"U26 / U27 ideal diodes\nBoard power OR DATA power"}
          pcbComponentNames={["U26", "U27"]} />
        <Block name="mcu" displayName="MCU + flash"
          description={"U16 RP2040 + U17\nDATA-only diagnostics possible"}
          pcbComponentNames={["U16", "U17"]} />
      </systemblock.group>
      <systemblock.group name="brake-domain" displayName="Brake gate supply">
        <Block name="brake-buck" displayName="Motor bus → 12 V"
          description={"VMOTOR → U34 + L3 buck\nBrake gate power during PD loss"}
          pcbComponentNames={["U34", "L3"]} />
        <Block name="brake-driver" displayName="Brake gate driver"
          description={"U15 drives Q16\nSeparate from the motor bridges"}
          pcbComponentNames={["U15", "Q16"]} />
      </systemblock.group>
      <systemblock.connection from="pd-buck" to="board-or" kind="power" label="3.3 V" />
      <systemblock.connection from="backup" to="board-or" kind="power" label="Backup 3.3 V" />
      <systemblock.connection from="data" to="mcu-or" kind="power" label="USB 3.3 V" />
      <systemblock.connection from="board-or" to="mcu-or" kind="power" label="V3V3" />
      <systemblock.connection from="mcu-or" to="mcu" kind="power" label="MCU 3.3 V" />
      <systemblock.connection from="board-or" to="sensing" kind="power" label="V3V3" />
      <systemblock.connection from="brake-buck" to="brake-driver" kind="power" label="12 V" />
    </systemblock.page>

    <systemblock.page name="protection" displayName="3. What allows or stops motion" direction="right"
      description="Power permission and driver enable are separate gates. The brake responds to bus voltage independently of firmware. Nominal thresholds still need bench verification.">
      <systemblock.group name="power-permission" displayName="Power permission">
        <Block name="pd" displayName="PD path ready"
          description={"U2 status via Q2 / Q3\nPD_PATH_OK is a hardware input"}
          pcbComponentNames={["U2", "Q2", "Q3"]} />
        <Block name="permit" displayName="Power gate · U4"
          description={"PD_PATH_OK AND POWER_PERMIT\nBoth required to enable eFuse"}
          pcbComponentName="U4" />
        <Block name="efuse" displayName="Input protection · U6"
          description={"Limits current / input voltage\nReports physical MOTOR_PG"}
          pcbComponentName="U6" />
      </systemblock.group>
      <systemblock.group name="motion-permission" displayName="Motor enable">
        <Block name="mcu" displayName="Firmware permission"
          description={"U16 checks contract + sensors\nQualification locks must clear"}
          pcbComponentName="U16" />
        <Block name="run" displayName="Run gates · U10/11/33"
          description={"MCU_RUN AND MOTOR_PG AND\nVMOTOR_OK AND TEMP_OK"}
          pcbComponentNames={["U10", "U11", "U33"]} />
        <Block name="driver" displayName="Driver enable · U7"
          description={"RUN_SAFE low disables bridges\nSTEP/DIR + sleep also use MCU"}
          pcbComponentName="U7" />
      </systemblock.group>
      <systemblock.group name="limits-domain" displayName="Hardware sensing">
        <Block name="limits" displayName="Hardware limits"
          description={"U12/U14: overvoltage ~53.21 V\nU29: board-temperature inhibit"}
          pcbComponentNames={["U12", "U14", "U29"]} />
      </systemblock.group>
      <systemblock.group name="independent-brake" displayName="Independent brake">
        <Block name="threshold" displayName="Brake threshold"
          description={"U12 reference + U13 comparator\nBus near 52 V → BRAKE_ON"}
          pcbComponentNames={["U12", "U13"]} />
        <Block name="brake" displayName="Brake switch · J3"
          description={"U15 + Q16 → external resistor\nNo MCU command needed"}
          pcbComponentNames={["U15", "Q16", "J3"]} />
      </systemblock.group>
      <systemblock.connection from="pd" to="permit" label="PD ready" />
      <systemblock.connection from="mcu" to="permit" label="POWER_PERMIT" />
      <systemblock.connection from="permit" to="efuse" label="EFUSE_EN" />
      <systemblock.connection from="efuse" to="run" label="MOTOR_PG" />
      <systemblock.connection from="mcu" to="run" label="MCU_RUN" />
      <systemblock.connection from="limits" to="run" label="Voltage + temp OK" />
      <systemblock.connection from="run" to="driver" label="RUN_SAFE" />
      <systemblock.connection from="threshold" to="brake" label="BRAKE_ON" />
    </systemblock.page>

    <systemblock.page name="control-telemetry" displayName="4. What the controller reads and controls" direction="right"
      description="PD_READY is firmware-derived from the EPR contract and fresh U38 raw-voltage data. It is not the hardware eFuse MOTOR_PG. Optional encoder is telemetry only.">
      <systemblock.group name="sensors" displayName="Supply + motor sensing">
        <Block name="pd" displayName="PD contract"
          description={"U2 TPS26750 + U3 EEPROM\nU36 isolates EEPROM programming"}
          pcbComponentNames={["U2", "U3", "U36"]} />
        <Block name="voltage" displayName="Voltage / brake ADCs"
          description={"U38: raw PD before eFuse\nU30: VMOTOR, IMON, brake return"}
          pcbComponentNames={["U38", "U30"]} />
        <Block name="feedback" displayName="Current + temperature"
          description={"U31/U32: phase-current sense\nU29: board temperature (I2C)"}
          pcbComponentNames={["U31", "U32", "R115", "R116", "U29"]} />
      </systemblock.group>
      <systemblock.group name="controller" displayName="Controller + buttons">
        <Block name="controls" displayName="Local buttons"
          description={"SW1: RESET; SW2: START/STOP\nMotion locks still apply"}
          pcbComponentNames={["SW1", "SW2"]} />
        <Block name="mcu" displayName="Controller · U16"
          description={"PD_READY: contract + fresh ADC\nMOTOR_PG: separate eFuse signal"}
          pcbComponentName="U16" />
      </systemblock.group>
      <systemblock.group name="interfaces" displayName="Outputs + feedback">
        <Block name="driver" displayName="Motor driver · U7"
          description={"SPI setup + STEP/DIR + sleep\nnFAULT / HOME feedback"}
          pcbComponentName="U7" />
        <Block name="indicators" displayName="Status outputs"
          description={"U35/U37 → RGB LED + buzzer\nIndication only; not protection"}
          pcbComponentNames={["U35", "U37", "D16", "BZ1"]} />
        <Block name="encoder" displayName="Optional encoder · U18"
          description={"AS5600 angle telemetry (DNP)\nMagnet mounting not qualified"}
          pcbComponentName="U18" />
      </systemblock.group>
      <systemblock.connection from="pd" to="mcu" direction="both" label="PD I2C" />
      <systemblock.connection from="voltage" to="mcu" direction="both" label="PD I2C" />
      <systemblock.connection from="feedback" to="mcu" direction="both" label="ADC + PD I2C" />
      <systemblock.connection from="mcu" to="encoder" direction="both" label="Encoder I2C" />
      <systemblock.connection from="mcu" to="driver" direction="both" label="Control / feedback" />
      <systemblock.connection from="mcu" to="indicators" label="I2C + reset" />
      <systemblock.connection from="controls" to="mcu" label="RESET / button" />
    </systemblock.page>
  </>
)

// Diagram-only coordinates, in a compact 180 × 124 canvas. The current core
// API has no manual-position props. Apply these to system_block_* records only;
// associations, endpoints and all electrical/PCB/schematic records stay intact.
// Coordinates use a top-left origin for readable layout authoring.
type Point = [number, number]
type Route = { points: Point[]; label: Point }
type PageLayout = { groups: Record<string, [number, number, number, number]>; blocks: Record<string, Point>; routes: Record<string, Route> }
export const systemPageLayouts: Record<string, PageLayout> = {
  "system-overview": {
    groups: { inputs: [2,0,52,81], "control-domain": [64,0,52,81], "motor-domain": [126,0,52,122] },
    blocks: { pd: [28, 20], bus: [90, 20], brake: [152, 20], data: [28, 64], control: [90, 64], driver: [152, 64], motor: [152, 106] },
    routes: {
      "pd:bus": { points: [[51,20],[67,20]], label: [59,16] },
      "bus:driver": { points: [[90,33],[90,42],[152,42],[152,51]], label: [121,39] },
      "driver:motor": { points: [[152,77],[152,93]], label: [164,85] },
      "pd:control": { points: [[28,33],[28,42],[74,42],[74,51]], label: [51,39] },
      "data-power": { points: [[51,59],[67,59]], label: [59,55] },
      "data-link": { points: [[51,69],[67,69]], label: [59,73] },
      "control:driver": { points: [[113,64],[129,64]], label: [121,60] },
      "bus:brake": { points: [[113,20],[129,20]], label: [121,16] },
    },
  },
  "logic-power": {
    groups: { sources: [2,0,52,122], "board-domain": [64,0,114,37], "mcu-domain": [64,44,114,37], "brake-domain": [64,86,114,36] },
    blocks: { "pd-buck": [28,20], "board-or": [90,20], sensing: [152,20], backup: [28,64], "mcu-or": [90,64], mcu: [152,64], data: [28,106], "brake-buck": [90,106], "brake-driver": [152,106] },
    routes: {
      "pd-buck:board-or": { points: [[51,20],[67,20]], label: [59,16] },
      "backup:board-or": { points: [[28,51],[28,42],[74,42],[74,33]], label: [51,39] },
      "data:mcu-or": { points: [[28,93],[28,85],[74,85],[74,77]], label: [51,82] },
      "board-or:mcu-or": { points: [[90,33],[90,51]], label: [100,40.5] },
      "mcu-or:mcu": { points: [[113,64],[129,64]], label: [121,60] },
      "board-or:sensing": { points: [[113,20],[129,20]], label: [121,16] },
      "brake-buck:brake-driver": { points: [[113,106],[129,106]], label: [121,102] },
    },
  },
  protection: {
    groups: { "power-permission": [2,0,176,37], "motion-permission": [2,44,176,37], "limits-domain": [2,86,52,36], "independent-brake": [64,86,114,36] },
    blocks: { pd: [28,20], permit: [90,20], efuse: [152,20], mcu: [28,64], run: [90,64], driver: [152,64], limits: [28,106], threshold: [90,106], brake: [152,106] },
    routes: {
      "pd:permit": { points: [[51,20],[67,20]], label: [59,16] },
      "mcu:permit": { points: [[28,51],[28,42],[74,42],[74,33]], label: [51,39] },
      "permit:efuse": { points: [[113,20],[129,20]], label: [121,16] },
      "efuse:run": { points: [[152,33],[152,42],[106,42],[106,51]], label: [129,39] },
      "mcu:run": { points: [[51,64],[67,64]], label: [59,60] },
      "limits:run": { points: [[46,93],[46,85],[74,85],[74,77]], label: [51,83] },
      "run:driver": { points: [[113,64],[129,64]], label: [121,60] },
      "threshold:brake": { points: [[113,106],[129,106]], label: [121,102] },
    },
  },
  "control-telemetry": {
    groups: { sensors: [2,0,52,122], controller: [64,0,52,81], interfaces: [126,0,52,122] },
    blocks: { pd: [28,20], voltage: [28,64], feedback: [28,106], controls: [90,20], mcu: [90,64], driver: [152,20], indicators: [152,64], encoder: [152,106] },
    routes: {
      "pd:mcu": { points: [[28,33],[28,42],[74,42],[74,51]], label: [51,39] },
      "voltage:mcu": { points: [[51,64],[67,64]], label: [59,60] },
      "feedback:mcu": { points: [[28,93],[28,85],[74,85],[74,77]], label: [51,82] },
      "mcu:encoder": { points: [[106,77],[106,85],[152,85],[152,93]], label: [129,82] },
      "mcu:driver": { points: [[106,51],[106,42],[152,42],[152,33]], label: [129,39] },
      "mcu:indicators": { points: [[113,64],[129,64]], label: [121,60] },
      "controls:mcu": { points: [[90,33],[90,51]], label: [105,36.5] },
    },
  },
}
