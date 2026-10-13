# Current product configuration

PD1180-EPR revision 0.4 uses local START/STOP control for the STEPPERONLINE 34HS31-6004S1. STM32 commands the TMC5160 internal SPI ramp; SW1 resets the MCU. Power, voltage, temperature and driver-enable protection gate operation.

The current connection inventory is **J2 MOTOR, J3 BRAKE, J1 PD POWER and J10 USB DATA**. The [endpoint schedule](connector-harnesses.md) identifies each source, destination, cable and purpose; the [external equipment guide](external-system.md) distinguishes identified parts from unselected equipment.

The 3D model contains the motor and J2 mating harness. Four Ø4.2 mm PCB holes are retained. Board attachment, the visual 19.5 mm separation, cable retention, splice outside diameter and first-article harness lengths are not mechanically qualified. U18/C52/C53 are optional bottom DNP footprints; the motor has no qualified rear magnet installation.

The commissioning firmware remains motion-locked. TI PD programming, exact sourcing, the operating envelope, the J3 fit/omit decision and powered tests remain open. See [current verification](../verification.md), [review checklist](reviewer-checklist.md) and [power test matrix](power-validation.md). No motor-operation or production-readiness claim is made.
