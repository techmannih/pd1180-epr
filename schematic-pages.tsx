import { Fragment } from "react"

const pages = [
  [
    "usb-pd",
    "USB-C PD POWER",
    "J1: 48 V / 5 A EPR power only; USB DATA is on J10.",
    "U1 protects CC/VBUS. Q1 controls protected VBUS; C1/C2 provide local bypass."
  ],
  [
    "usb-pd-policy",
    "PD Controller and EEPROM",
    "U2 TPS26750 negotiates EPR; U3 stores the board-specific TI configuration.",
    "Q2/Q3 translate PD path control. TI image and powered qualification remain required."
  ],
  [
    "logic-power",
    "PD Backup Supply",
    "U5 converts PD VBUS to V3V3_PD; L1 and its feedback/bypass network are shown here.",
    "Input spans default USB 5 V through the specified 48 V EPR operating target."
  ],
  [
    "logic-backup",
    "Motor Backup Supply",
    "U22 converts VMOTOR to V3V3_MOTOR for brake-control backup after PD loss.",
    "L2, feedback and local bypass remain on the motor supply domain."
  ],
  [
    "logic-selection",
    "Logic Supply Selection and Power Permit",
    "U23/U24 and R111 form the status-interlocked reverse-blocked board supply.",
    "U4 combines PD path status with POWER_PERMIT to control the eFuse enable."
  ],
  [
    "motor-power",
    "Protected 48 V Motor Bus",
    "Q4/Q5 provide reverse blocking; U6 is the eFuse and input-current monitor.",
    "Nominal 1x current limit 3.607 A. C22/C23 are motor bulk; R31-R33/C24 monitor voltage."
  ],
  [
    "motion",
    "Motion Controller",
    "U7 TMC5160A drives the external bridges; nominal regulated driver supply is 12 V.",
    "Bootstrap, charge-pump and local bypass parts are shown with the controller."
  ],
  [
    "motion-enable",
    "Onboard Motion and Hardware Enable",
    "STM32 commands U7 over SPI. U10/U11/U33 and Q14 retain hardware inhibits.",
    "The driver remains inhibited until the hardware safety conditions permit motion."
  ],
  [
    "bridge-a",
    "Motor Phase A Power Bridge",
    "Q6/Q8 high-side and Q7/Q9 low-side switches form phase A; R109 is the Kelvin shunt.",
    "J2 connects both motor windings. The 3.8 A RMS design ceiling is not a qualified setting."
  ],
  [
    "bridge-b",
    "Motor Phase B Power Bridge",
    "Q10/Q12 high-side and Q11/Q13 low-side switches form phase B.",
    "R110 is the independent 33 mOhm shunt; preserve the Kelvin sense connections."
  ],
  [
    "brake",
    "Brake Reference and Turn-on Threshold",
    "U12 is the 2.5 V reference. U13 commands braking at nominal 52.0 V.",
    "External braking resistor and heatsink sizing depends on stored mechanical energy."
  ],
  [
    "brake-ovp",
    "Overvoltage Inhibit and Brake Driver",
    "U14 inhibits motion at nominal 53.21 V; U15/Q16 switch the external J3 brake load.",
    "Brake control remains powered from the protected motor bus through the backup supply."
  ],
  [
    "mcu",
    "MCU Clock Memory and Debug",
    "U16 STM32G0B1 commands the TMC5160 ramp generator over SPI; SW2 requests Start/Stop.",
    "U17 is configuration storage. Y1, SW1 and the bare SWD/NRST pads support bring-up."
  ],
  [
    "encoder",
    "Optional Shaft Encoder",
    "U18 AS5047P is centered on bottom; C52/C53 are top-side. All are DNP.",
    "SPI plus ABI test access; magnet interface for the ordered single-shaft motor is unqualified."
  ],
  [
    "usb-data",
    "USB DATA and Attach Sense",
    "J10 supplies USB 2.0 DATA and independent MCU logic power; no PD on this port.",
    "D15 protects D+/D-/CC. R107/R108/C72 sense DATA VBUS; DATA cannot feed VMOTOR."
  ],
  null, // External machine inputs removed; preserve later sheet numbering.
  [
    "user-control",
    "Local Start and Stop",
    "SW2 requests motion from the onboard STM32. R133 pulls the input to MCU logic power.",
    "Debounce requires release before start; reset, power loss and faults never auto-start."
  ],
  null, // Removed interface sheet; retain subsequent approved sheet numbers.
  null, // Removed interface sheet; retain subsequent approved sheet numbers.
  null, // Removed interface sheet; retain subsequent approved sheet numbers.
  [
    "usb-logic",
    "USB Logic Power",
    "U28 limits DATA power; U25 regulates V3V3_USB. U26/U27 reverse-block the MCU rail.",
    "R119/R120 sense board supply on PB1. Industrial peripherals require board power."
  ],
  [
    "telemetry",
    "Temperature and Bus Diagnostics",
    "U29 TMP102 senses temperature; U33 provides hardware inhibit. U30 ADS1115 monitors the bus.",
    "Sensor addresses are 0x48 and 0x49. Temperature correlation requires load testing."
  ],
  [
    "phase-current",
    "Phase Current Diagnostics",
    "U31/U32 INA240A1 measure the two 5 mOhm inline shunts at 20 V/V.",
    "Nominal 100 mV/A about 1.65 V; instantaneous diagnostics, not a short-circuit trip."
  ],
  [
    "driver-power",
    "Regulated Driver Supply",
    "U34 is the 65 V buck supplying nominal 12 V to U7 VSA/12VOUT and U15.",
    "TMC5160 external supply range is 10-13 V; ripple and startup require bench validation."
  ],
  [
    "indicators",
    "Status and Independent Power Indication",
    "U35 PCA9538 at 0x70; U37 buffers PC13 reset into PD_3V3 with default-low bias.",
    "D17 shows board V3V3 independently of firmware; USB-only MCU power is distinct."
  ],
  [
    "alarm",
    "Audible Fault Alarm",
    "BZ1 active buzzer is driven by Q26 with a gate pulldown and D18 clamp.",
    "The alarm defaults off. Motor protection remains independent of the audible indication."
  ],
  [
    "pd-programming",
    "PD Programming and Power Probes",
    "U36 isolates both PD EEPROM I2Cc wires when TP_PD_ISO is grounded.",
    "Use fixed 5 V fixture power and a 3.3 V open-drain programmer; VREF is sense-only."
  ]
  , ["brake-feedback", "Brake Continuity Preflight",
    "R134-R136 sense J3 return on U30 AIN2 before motion; C98 filters the ADC input.",
    "This check detects an absent resistor or stuck-on Q16; it does not prove braking current."]
] as const

export const SchematicPages = () => <>
  {pages.map((page, index) => { if (!page) return null; const [name, title, purpose, notes] = page; return <Fragment key={name}><schematicsheet name={name} displayName={title} sheetIndex={index + 1} sheetSize="A4">
    <schematictext schX={0} schY={9} fontSize={0.5} anchor="center" text={`${String(index + 1).padStart(2, "0")} / ${title}`} />
    <schematictext schX={0} schY={7.8} fontSize={0.23} anchor="center" text={purpose} />
    <schematictext schX={0} schY={7.1} fontSize={0.23} anchor="center" text={notes} />
  </schematicsheet></Fragment>})}
</>
