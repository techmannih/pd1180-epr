# WAGO reviewer ECO: actual filled copper

The comparison gate checks the **same new WAGO layout before and after reinforcement**. The separate PR #21 JST comparison is also shown; moved terminals lengthen several paths. A passing reinforcement gate does not mean every path improved versus the old connector layout.

Native KiCad: 8 retained USB hole-clearance errors, 451 cosmetic warnings, 0 other errors, 0 unconnected, 0 parity and 0 ERC. No electrical finding is waived. All 55 local bypass paths, four Kelvin branches and four USB reference paths are required to pass independently.

![Actual filled copper by layer](copper-contact-review.png)

| Net / destination | WAGO before reinforcement mΩ | Final mΩ | PR #21 JST mΩ |
|---|---:|---:|---:|
| MOTOR_A1 → R115:1 | 9.148 | 8.489 | 9.148 |
| MOTOR_B1 → R116:1 | 3.158 | 3.158 | 3.158 |
| MOTOR_A1_OUT → J2:1 | 5.634 | 5.312 | 5.054 |
| MOTOR_A2 → J2:2 | 21.495 | 21.495 | 13.130 |
| MOTOR_B1_OUT → J2:3 | 10.833 | 7.881 | 5.737 |
| MOTOR_B2 → J2:4 | 9.062 | 8.520 | 8.012 |
| PD_VBUS → Q4:1,2,3 | 19.468 | 19.157 | 20.897 |
| EFUSE_IN → U6:1,2 | 6.792 | 6.792 | 6.792 |
| VMOTOR → U7:2,11,12,21 | 19.027 | 14.107 | 18.570 |
| VMOTOR → J3:1 | 27.482 | 15.136 | 3.246 |
| BRAKE_RETURN → Q16:9 | 25.591 | 6.970 | 1.410 |

All 11 paths use 0.075/0.05 mm meshes; refine to 0.025/0.02 mm when needed for ≤3% adjacent-mesh convergence. Values above use the common 0.05 mm mesh. The independent A1 corridor priority and explicit transfer-via tie prevent new A2 reinforcement from cutting the pre-existing A1 copper.

These are copper-only estimates at 20°C with 35 µm copper and assumed 20 µm via plating. Contacts, shunts, transistors, switching, thermal feedback and EMC are excluded. The longest motor output path is about 21.3 mΩ: about 0.013 W at nominal 0.773 A RMS, but 0.77 W at 6 A, before hot-copper and contact losses. This does not establish an allowable current or temperature. The phase-current and DDV cooling qualification remain open.

The brake feed/return total is about 22.1 mΩ at 20°C (about 0.62 W at 5.3 A while braking). Brake duty and the resistor/heatsink remain unqualified; the clamps, wire installation and board temperature require measurement.

Raw boards, actual filled polygons and per-path numerical results are in `engineering/rp2040-copper-evidence.zip`. `routing/power-feed.json` binds the independently checked new geometry. Track ≥0.15 mm, GND clearance ≥0.30 mm, GND inset ≥0.50 mm and global copper-edge rule 0.20 mm remain unchanged.
