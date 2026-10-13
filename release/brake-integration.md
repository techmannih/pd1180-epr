# J3 brake decision, wiring and external installation

**Retain J3 as a provision on the current 48 V board. Whether the finished application needs an external resistor, and its final rating, remain unqualified. A 300 W resistor is not a confirmed purchase requirement.** J3 does not increase motor speed or torque. Do not wait for poor speed performance and then add a resistor: this branch addresses overvoltage from returned energy during slowing, stopping or external driving.

## Why and when it is used

The motor can return energy to VMOTOR. The input's TPS26631/Q4/Q5 reverse-blocking path means the EPR source cannot be credited with absorbing it. The nominal 48 V bus has limited headroom below the TMC5160A's **55 V VS operating ceiling**; this ceiling is not a test target. Driver disable/input isolation alone does not dissipate returned energy. See [TI TPS2663](https://www.ti.com/lit/ds/symlink/tps2663.pdf) and [TMC5160A](https://www.analog.com/media/en/technical-documentation/data-sheets/TMC5160A_datasheet_rev1.18.pdf), alongside the actual board's `power-audit.json`.

| Situation | Decision |
|---|---|
| Current unknown load, maximum RPM and stop duty | Keep J3/protection; do not declare the external resistor mandatory for every possible use or safe to omit for all uses |
| Low-speed, unloaded, low-current commissioning | Energy screen may support a bounded test without a large resistor, but a qualified test plan and measured bus peaks are still required |
| Faster/heavier load, rapid or repeated stops, gravity/external backdrive | Calculate returned energy and power; provide a qualified dissipation path before testing that envelope |
| Empty J3 | Brake comparator/MOSFET still exist, but there is **no external resistor load to dissipate energy** |
| Motor does not reach requested speed | Investigate supply, current settings, ramp, torque/load and firmware; J3 is not the speed remedy |

U13/U15/Q16 are intended to switch the brake automatically as the bus rises: calculated nominal turn-on **51.99 V**, release **51.34 V**. U14 inhibits motion at nominal **53.69 V**. These are calculated thresholds, not measured limits; tolerances, response time and switching overshoot must be qualified together.

## How to connect it

`J3 pin 1 (VMOTOR) → resistor terminal 1 → resistor → terminal 2 → J3 pin 2 (BRAKE_RETURN) → Q16 → GND`

J3 is the top-mounted **B2P-VH(LF)(SN)**, not another power input. Pin 2 is a **switched return, not permanent GND**. Use the numbered cavities/pads, not the apparent left/right order in a 3D view. Do not short the two pins, attach a power supply to J3, or bypass Q16 by grounding the resistor return.

Make or remove the connection only with both USB sources disconnected and the bus verified discharged. The resistor is nonpolar, but both harness endpoints must follow the pin map. Inspect termination/insulation, check resistance and absence of shorts before energizing. See [the external purchase list](external-system.md#external-purchase-and-service-list) for parts and unresolved sourcing.

## Candidate parts and where to mount them

The candidate remains **Vishay LPS0300H10R0GB, 10 Ω, 300 W**. It is a heatsink-mounted resistor; 300 W is not a free-air rating. The [manufacturer drawing](https://www.vishay.com/docs/50052/lps300.pdf) specifies a 60×57 mm body, 64.7 mm maximum width, 15.2±0.5 mm body height, two Ø4.2 mounting holes and two M4 terminals with 8 mm useful depth. Mounting hole pitch is 57 mm; terminal pitch is 34×36 mm diagonally. Its bottom case must remain at or below 85°C for 300 W, with 0.112°C/W element-to-case resistance. Use the specified thermal interface and flat mounting surface; connection and heatsink screw torque is 2 N·m, 2.5 N·m maximum. The resistor must mount to an independently sized metal heatsink/chassis, not the PCB or PA12 cable support.

Proposed terminations are **VHR-2N + two SVH-41T-P1.1** at J3, two Alpha3057 16 AWG conductors, and **TE152883** rings at the resistor. [TE's specification](https://www.te.com/en/product-152883.html) supports 18–16 AWG, M4/4.3 mm hole, 1.4–2.67 mm insulation OD, 300 V and 0–105°C. Alpha3057 maximum OD2.3876 mm fits that window. This checks nominal ranges only: ring-head clearance, stack/screw engagement, crimp tooling, purchased stock and local terminal temperature still require acceptance. The rings are partially insulated; a finger-safe barrier and cable support are required at the remote installation.

## Calculated screen

- The 940 µF bulk bank absorbs **0.237 J nominal**, or **0.190 J at initial −20% capacitance**, from 48 to 53 V. At a 50.4 V starting bus (a design allowance, not a measured charger), the latter margin drops to **0.101 J**. Temperature, ageing, ESR/ESL and spikes are not covered by these simple energy figures.
- The firmware's nominal motor-only commissioning profile is approximately **10 rpm / 0.84 A RMS**. Rotor plus approximate winding energy is **0.00305 J** with the current assumptions, far below the above nominal-start margin. This does not establish a 300 W need, authorize unlocking the firmware, or cover an attached load.
- At 53 V and nominal 10 Ω: current **5.30 A**, instantaneous dissipation **280.9 W**.
- At the 55 V review limit and 9.8 Ω (−2%): **5.61 A**, **308.7 W**. The 300 W part is **not approved for continuous operation at this worst-case point**; pulse/duty limits need the manufacturer's curve and actual load.
- Even at 280.9 W continuous and an assumed 50°C ambient, keeping the case at 85°C requires combined case-interface/heatsink-to-ambient resistance no greater than **0.125°C/W**. An arbitrary small aluminum plate cannot be called adequate.
- Manufacturer rotor inertia 1400 g·cm² converts to 0.00014 kg·m². At 1000 rpm its rotor energy alone is **0.768 J**, before attached load and winding energy. This is an example, not the application's maximum speed or braking duty.
- Size the installation from `E = 0.5 × (Jmotor + Jload) × ω²`, stop duration, stops/minute, external driving energy and ambient. Verify transistor/connector/cable temperatures and bus peaks in the powered prototype.

`V²/R` is the resistor's instantaneous power **while switched on**. Average regenerated power depends on returned energy per stop and stops per second, plus any sustained backdrive. A resistor must satisfy its pulse curve as well as its continuous, derated thermal limit; neither motor nameplate current nor the 280.9 W on-power calculation alone proves that 300 W continuous is needed. Calculation inputs, equations and limitations are saved in [j3-energy-review.json](j3-energy-review.json); no physical measurements are represented by that file.

## How to decide and validate

1. Record maximum speed, reflected load inertia, stop time, stops/minute, gravity/backdrive and ambient. Include normal SW2 stopping and fault/reset/power-loss cases, which may stop differently.
2. Review the worst bus starting voltage, minimum capacitance, protection tolerance/response and returned energy. Establish a stop-test limit below the applicable operating ceilings with engineering margin. Select a resistor/pulse rating and cooling only if the approved envelope needs that path, or qualify a different energy-management design.
3. Complete no-motor power/gate/protection tests first. Keep the commissioning firmware locked until the documented prerequisites have evidence. Start motor tests at bounded unloaded low current/speed with suitable bus-voltage and phase-current instrumentation; do not use driver failure as the overvoltage detector.
4. Record VMOTOR peaks, Q16 switching, stop behavior, current and temperatures. Increase load/speed/duty only within reviewed limits. Validate source removal, reset and repeated stops as well as normal deceleration.
5. Record either **resistor fitted with exact qualified installation** or **resistor omitted for a specifically bounded operating envelope**, including measurements and configuration. Successful low-speed operation alone cannot justify removing protection for unrestricted use.

## What is missing

Maximum speed, attached inertia/load, fastest stop, repeated-stop duty and maximum ambient have been requested. Without them, no final resistor, heatsink, cable length, mounting location or guard dimensions are defensible. The current model therefore has no invented resistor/heatsink assembly. The two electrical endpoints are defined; physical routing/retention remain open. Keep motion locked and ordering on hold pending hardware review and validation.
