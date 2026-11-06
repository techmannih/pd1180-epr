import { Fragment } from "react"

/** Functional review order; independent of physical PCB placement and nets. */
export const schematicPages = [
  ["usb-pd", "USB-C EPR input and negotiation",
    "J1 / U1: protected POWER port. U2 TPS26750: 48 V / 5 A sink. U3: configuration EEPROM.",
    "Q1 limits protected VBUS; Q2/Q3 translate POWER_PATH_EN. DATA USB is on sheet 7."],
  ["logic-power", "Logic supply and source selection",
    "U5: PD input to 3.3 V. U22: motor-bus backup to 3.3 V. U23/U24: reverse-blocking selection.",
    "Backup keeps brake control powered during PD loss. U4: PD_PATH_OK AND POWER_PERMIT -> EFUSE_EN."],
  ["motor-power", "Protected motor bus and enable interlocks",
    "Q4/Q5: reverse blocking. U6: latching eFuse / input-current limit. C22/C23: motor energy storage.",
    "U10/U11/U33: MCU_RUN AND MOTOR_PG AND VMOTOR_OK AND TEMP_OK -> RUN_SAFE. Default OFF."],
  ["motion", "Integrated motor driver and winding feedback",
    "U7 DRV8262DDVR: two internal bridges, PH/EN control; U42 dual DAC current references. J2: WAGO winding terminal.",
    "U31/U32: instantaneous phase-current diagnostics, not RMS control. DDV requires qualified top cooling."],
  ["brake", "Independent regeneration brake and overvoltage cutoff",
    "U12: 2.5 V reference. U13: brake near 52 V. U14: inhibit near 53.21 V. U15/Q16: brake switch.",
    "U34/L3: 12 V brake gate supply, NOT motor-driver power. J3: external resistor; 10 ohm / 300 W provisional."],
  ["mcu", "RP2040, boot memory and local controls",
    "U16: phase sequencing, USB diagnostics and power supervision. U17: 4 MiB QSPI boot flash. Y1: 12 MHz.",
    "SW1: reset. SW2: START/STOP request. TP_BOOTSEL + reset: ROM USB recovery. Motion stays locked."],
  ["usb-data", "USB DATA and independent MCU power",
    "J10 / D15: protected USB 2.0 DATA. U28: input current limit. U25: DATA 5 V to 3.3 V LDO.",
    "U27: DATA-only MCU power. U39/U40: powered-off I/O isolation. PD alone cannot power the MCU."],
  ["telemetry", "Supply telemetry and PD programming access",
    "U29: temperature. U30: VMOTOR, input-current and brake-return ADC. U38: raw PD_VBUS ADC.",
    "U36: isolates EEPROM programming bus. Fixed 5 V fixture only; TP_PD_VREF is sense-only. See programming guide."],
  ["indicators", "Indicators, alarm and optional encoder",
    "U35: RGB / buzzer I2C outputs. U37: reset-domain buffer. Q26: buzzer switch. D17: board-power LED.",
    "U41: switched DATA-powered sensors. U18 AS5600 + C52/C53: DNP; no qualified rear magnet / closed-loop control."],
] as const

export const SchematicPages = () => <>
  {schematicPages.map(([name, title, purpose, notes], index) => <Fragment key={name}>
    <schematicsheet name={name} displayName={title} sheetIndex={index + 1} sheetSize="A4">
      <schematictext schX={0} schY={10} fontSize={0.45} anchor="center" text={`${String(index + 1).padStart(2, "0")} / ${title}`} />
      <schematictext schX={0} schY={9} fontSize={0.23} anchor="center" text={purpose} />
      <schematictext schX={0} schY={8.4} fontSize={0.23} anchor="center" text={notes} />
    </schematicsheet>
  </Fragment>)}
</>
