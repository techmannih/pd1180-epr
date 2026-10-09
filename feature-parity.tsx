/**
 * Machine-checked product feature contract. Components and nets are verified
 * against the generated circuit by scripts/check-feature-parity.mjs.
 */
export const FEATURE_PARITY = [
  {
    id: "usb_pd_epr",
    feature: "Separate USB-C PD POWER and USB 2.0 DATA",
    components: ["J1", "J10", "R105", "R106", "D15", "U1", "U2", "U3", "U4", "R107", "R108", "C72"],
    nets: ["PD_VBUS", "USB_DATA_VBUS", "USB_VBUS_SENSE", "USB_DP", "USB_DM", "PD_IRQ_N"],
    evidence: "docs/pd-configuration.json",
  },
  {
    id: "protected_power",
    feature: "eFuse, reverse blocking and dual-source 3.3 V logic power",
    components: ["U5", "U6", "Q4", "Q5", "U22", "U23", "U24"],
    nets: ["EFUSE_IN", "EFUSE_FAULT_N", "VMOTOR", "V3V3"],
    evidence: "docs/design.md",
  },
  {
    id: "motor_stage",
    feature: "TMC5160A and 100 V external MOSFET bridges",
    components: ["U7", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "R109", "R110", "J2"],
    nets: ["MOTOR_A1", "MOTOR_A2", "MOTOR_B1", "MOTOR_B2", "SENSE_A", "SENSE_B"],
    evidence: "docs/power-routing-check.json",
  },
  {
    id: "regeneration_brake",
    feature: "Independent overvoltage brake control and external resistor interface",
    components: ["U12", "U13", "U14", "U15", "Q16", "J3"],
    nets: ["BRAKE_DRIVE", "BRAKE_RETURN", "BRAKE_SENSE"],
    evidence: "docs/design.md",
  },
  {
    id: "controller",
    feature: "STM32 control, flash and SWD programming",
    components: ["U16", "U17", "TP_SWDIO", "TP_SWCLK", "TP_NRST"],
    nets: ["SWDIO", "MCU_RUN", "POWER_PERMIT"],
    evidence: "docs/firmware-pinmap.json",
  },
  {
    id: "encoder",
    feature: "Bottom-side AS5047P shaft encoder with ABI test access",
    components: ["U18", "TP_ENC_A", "TP_ENC_B", "TP_ENC_I"],
    nets: ["ENC_A", "ENC_B", "ENC_I", "ENC_CS_N"],
    evidence: "docs/design.md",
  },
  {
    id: "industrial_interfaces",
    feature: "CAN, RS485 and RS232",
    components: ["U19", "U20", "U21", "J7"],
    nets: ["CAN_H", "CAN_L", "RS485_A", "RS485_B", "RS232_TX", "RS232_RX"],
    evidence: "docs/compatibility.md",
  },
  {
    id: "machine_io",
    feature: "24 V machine inputs, Step/Dir, hardware enable and protected outputs",
    components: ["J7", "Q24", "Q25", "D11", "D12"],
    nets: ["STEP_24V", "DIR_24V", "OUT0", "OUT1"],
    evidence: "hardware-contract.json",
  },
] as const
