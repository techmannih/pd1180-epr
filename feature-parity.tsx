/**
 * Existing product feature inventory, not complete reference-board parity.
 * Missing functions and reviewer closure are tracked in engineering/reference-comparison.json.
 * Components and nets are verified
 * against the generated circuit by scripts/check-feature-parity.mjs.
 */
export const FEATURE_PARITY = [
  {
    id: "usb_pd_epr",
    feature: "Separate USB-C PD POWER and USB 2.0 DATA",
    components: ["J1", "J10", "R105", "R106", "D15", "U1", "U2", "U3", "U4", "R107", "R108", "C72"],
    nets: ["PD_VBUS", "USB_DATA_VBUS", "USB_VBUS_SENSE", "USB_DP", "USB_DM", "PD_SCL", "PD_SDA"],
    evidence: "docs/pd-configuration.json",
  },
  {
    id: "protected_power",
    feature: "eFuse, reverse blocking and independent USB DATA logic power",
    components: ["U5", "U6", "Q4", "Q5", "U22", "U23", "U24", "U25", "U26", "U27", "U28"],
    nets: ["EFUSE_IN", "EFUSE_FAULT_N", "VMOTOR", "V3V3", "V3V3_USB", "V3V3_MCU", "BOARD_POWER_SENSE"],
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
    feature: "Centered optional bottom-side AS5047P (DNP) with top ABI test access",
    components: ["U18", "TP_ENC_A", "TP_ENC_B", "TP_ENC_I"],
    nets: ["ENC_A", "ENC_B", "ENC_I", "ENC_CS_N"],
    evidence: "docs/design.md",
  },
  {
    id: "thermal_inhibit",
    feature: "Board temperature diagnostics and hardware motor inhibit",
    components: ["U29", "U33", "R114", "C79", "C85"],
    nets: ["TEMP_OK", "RUN_WINDOW_OK", "RUN_SAFE"],
    evidence: "hardware-contract.json",
  },
  {
    id: "phase_diagnostics",
    feature: "Bidirectional phase-current diagnostics and separate bus telemetry",
    components: ["U30", "U31", "U32", "R115", "R116", "R117", "R118", "C83", "C84"],
    nets: ["PHASE_A_ADC", "PHASE_B_ADC", "VMON_ADC", "IIN_MON"],
    evidence: "docs/firmware-pinmap.json",
  },
  {
    id: "local_control",
    feature: "Local START/STOP and independent reset; MCU-controlled SPI ramp",
    components: ["SW1", "SW2", "R133", "U16", "U7", "U10", "U11", "U33", "Q14"],
    nets: ["USER_BUTTON_N", "SD_MODE", "RUN_SAFE", "DRV_EN_N"],
    evidence: "hardware-contract.json",
  },
  {
    id: "indicators",
    feature: "RGB status, independent power LED and reset-safe audible alarm",
    components: ["U35", "D16", "D17", "BZ1", "Q26", "D18", "R123", "R124", "R125", "R126", "R127", "R128", "R132", "C95", "C96"],
    nets: ["STATUS_GPIO", "RGB_R_DRV", "RGB_G_DRV", "RGB_B_DRV", "BUZZER_GATE", "BUZZER_LOW", "POWER_LED_A"],
    evidence: "docs/indicators.md",
  },
  {
    id: "pd_fixture",
    feature: "Isolated EEPROM programming and power-probe access",
    components: ["U36", "R129", "R130", "R131", "C97", "TP_PD_VREF", "TP_PD_GND", "TP_EEP_SDA", "TP_EEP_SCL", "TP_PD_ISO", "TP_PD_VBUS", "TP_VMOTOR", "TP_PWR_GND"],
    nets: ["EEP_PROG_SDA", "EEP_PROG_SCL", "EEP_LINK_EN", "PD_VBUS", "VMOTOR"],
    evidence: "docs/pd-programming.md",
  },
] as const
