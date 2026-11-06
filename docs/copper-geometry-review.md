# DRV8262DDVR ECO: actual filled copper

Compare merged main `5035034` with the final DRV8262DDVR/DAC and stocked-component ECO. Exact native boards, filled polygons and raw numerical results are retained in `engineering/rp2040-copper-evidence.zip`, including the previous DATA-only evidence.

Native KiCad: **8 retained USB hole-clearance errors, 488 cosmetic warnings, 0 other errors, 0 unconnected, 0 schematic-parity and 0 ERC findings**. All 58 bypass paths, four Kelvin branches and four USB reference paths pass independently.

| Path | Main baseline (mΩ) | DRV8262 ECO (mΩ) | Change |
|---|---:|---:|---:|
| MOTOR_A1 → R115:1 | 8.489 | 8.440 | -0.58% |
| MOTOR_B1 → R116:1 | 3.158 | 3.158 | +0.00% |
| MOTOR_A1_OUT → J2:1 | 5.312 | 5.312 | +0.00% |
| MOTOR_A2 → J2:2 | 20.897 | 20.381 | -2.47% |
| MOTOR_B1_OUT → J2:3 | 8.012 | 8.012 | +0.00% |
| MOTOR_B2 → J2:4 | 8.518 | 8.518 | +0.00% |
| PD_VBUS → Q4:1,2,3 | 19.794 | 20.686 | +4.51% |
| EFUSE_IN → U6:1,2 | 6.792 | 7.088 | +4.36% |
| VMOTOR → U7:2,11,12,21 | 14.701 | 14.701 | +0.00% |
| VMOTOR → J3:1 | 15.153 | 15.153 | +0.00% |
| BRAKE_RETURN → Q16:9 | 5.134 | 5.179 | +0.87% |

Every path uses 0.075/0.05 mm meshes, refined to 0.025/0.02 mm where required for ≤3% adjacent-mesh convergence. Every common-mesh path remains within the existing +5% resistance-regression limit. U36's new package required a PD-path detour; the 1.35 mm B.Cu parallel track, wider inner transfer tracks and four additional transfer vias reduce its resistance. USB ground-reference and local stitch continuity are independently checked.

These estimates use 35 µm copper and assumed 20 µm via plating at 20°C. They exclude contact resistance, silicon/shunts, switching, hot copper and thermal/EMC effects. This comparative check does not establish allowable motor current; calibrated phase current, installed cooling and braking tests belong to first-article qualification.

Track ≥0.15 mm, GND clearance ≥0.30 mm, GND inset ≥0.50 mm and global copper-edge rule 0.20 mm are unchanged.
