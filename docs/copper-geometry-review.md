# DATA-only ECO: actual filled copper

Compare the exact merged main `fd77f02` board against the final DATA-only MCU / sensor-switch / larger-bulk revision. Raw boards and meshes are retained in `engineering/rp2040-copper-evidence.zip`; the previous WAGO/JST comparison is also preserved.

Native KiCad: **8 retained USB hole-clearance errors, 475 cosmetic warnings, 0 other errors, 0 unconnected, 0 schematic-parity and 0 ERC findings**. All 58 bypass paths, four Kelvin branches and four USB reference paths pass independently.

![Actual filled copper by layer](copper-contact-review.png)

| Path | Main baseline (mΩ) | DATA-only ECO (mΩ) | Change |
|---|---:|---:|---:|
| MOTOR_A1 → R115:1 | 8.489 | 8.489 | +0.00% |
| MOTOR_B1 → R116:1 | 3.158 | 3.158 | +0.00% |
| MOTOR_A1_OUT → J2:1 | 5.312 | 5.312 | +0.00% |
| MOTOR_A2 → J2:2 | 21.495 | 20.897 | -2.78% |
| MOTOR_B1_OUT → J2:3 | 7.881 | 8.012 | +1.66% |
| MOTOR_B2 → J2:4 | 8.520 | 8.518 | -0.03% |
| PD_VBUS → Q4:1,2,3 | 19.157 | 19.794 | +3.33% |
| EFUSE_IN → U6:1,2 | 6.792 | 6.792 | +0.00% |
| VMOTOR → U7:2,11,12,21 | 14.107 | 14.701 | +4.21% |
| VMOTOR → J3:1 | 15.136 | 15.153 | +0.11% |
| BRAKE_RETURN → Q16:9 | 6.970 | 5.134 | -26.34% |

Every path uses 0.075/0.05 mm meshes, refined to 0.025/0.02 mm when needed for ≤3% adjacent-mesh convergence. Every common-mesh path remains within the existing +5% resistance-regression limit. The PD corner uses two restored transfer vias and a 0.5 mm B.Cu parallel path; the USB ground stitch is independently checked within 2 mm.

These estimates use 35 µm copper and assumed 20 µm via plating at 20°C. They exclude contact resistance, silicon/shunts, switching, hot copper and thermal/EMC effects. A passing comparative screen does not establish a safe motor current. Full-current, driver cooling, brake duty and hardware fault tests remain open.

Track ≥0.15 mm, GND clearance ≥0.30 mm, GND inset ≥0.50 mm and global copper-edge rule 0.20 mm are unchanged.
