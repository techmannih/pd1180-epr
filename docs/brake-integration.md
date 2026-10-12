# J3 brake integration — retained, installation not qualified

J3 pin 1 supplies VMOTOR to the resistor; its other terminal returns through J3 pin 2, BRAKE_RETURN, to Q16. U13 hysteresis and U15 drive the brake independently of a software-only command. The motor can regenerate when decelerated or externally driven, while the USB input cannot be assumed to absorb returned energy. The retained bulk capacitors absorb only about 0.237 J nominal between 48 and 53 V (0.190 J at minimum capacitance). Removing the brake is not approved.

The candidate remains **Vishay LPS0300H10R0GB, 10 Ω, 300 W**. It is a heatsink-mounted resistor; 300 W is not a free-air rating. The [manufacturer drawing](https://www.vishay.com/docs/50052/lps300.pdf) specifies a 60×57 mm body, 64.7 mm maximum width, 15.2±0.5 mm body height, two Ø4.2 mounting holes and two M4 terminals with 8 mm useful depth. Mounting hole pitch is 57 mm; terminal pitch is 34×36 mm diagonally. Its bottom case must remain at or below 85°C for 300 W, with 0.112°C/W element-to-case resistance. Use the specified thermal interface and flat mounting surface; connection and heatsink screw torque is 2 N·m, 2.5 N·m maximum. The resistor must mount to an independently sized metal heatsink/chassis, not the PCB or PA12 cable support.

Proposed terminations are **VHR-2N + two SVH-41T-P1.1** at J3, two Alpha3057 16 AWG conductors, and **TE152883** rings at the resistor. [TE's specification](https://www.te.com/en/product-152883.html) supports 18–16 AWG, M4/4.3 mm hole, 1.4–2.67 mm insulation OD, 300 V and 0–105°C. Alpha3057 maximum OD2.3876 mm fits that window. This checks nominal ranges only: ring-head clearance, stack/screw engagement, crimp tooling, purchased stock and local terminal temperature still require acceptance. The rings are partially insulated; a finger-safe barrier and cable support are required at the remote installation.

## Calculated screen

- At 53 V and nominal 10 Ω: current **5.30 A**, instantaneous dissipation **280.9 W**.
- At the 55 V review limit and 9.8 Ω (−2%): **5.61 A**, **308.7 W**. The 300 W part is **not approved for continuous operation at this worst-case point**; pulse/duty limits need the manufacturer's curve and actual load.
- Even at 280.9 W continuous and an assumed 50°C ambient, keeping the case at 85°C requires combined case-interface/heatsink-to-ambient resistance no greater than **0.125°C/W**. An arbitrary small aluminum plate cannot be called adequate.
- Manufacturer rotor inertia 1400 g·cm² converts to 0.00014 kg·m². At 1000 rpm its rotor energy alone is **0.768 J**, before attached load and winding energy. This is an example, not the application's maximum speed or braking duty.
- Size the installation from `E = 0.5 × (Jmotor + Jload) × ω²`, stop duration, stops/minute, external driving energy and ambient. Verify transistor/connector/cable temperatures and bus peaks in the powered prototype.

## What is missing

Maximum speed, attached inertia/load, fastest stop, repeated-stop duty and maximum ambient have been requested. Without them, no final heatsink, cable length, mounting location or guard dimensions are defensible. Those values also determine whether the existing resistor is appropriate. The current model therefore has no fabricated resistor/heatsink assembly and does not pretend that hiding the old loose wires completed it. The exact two endpoints above are defined; physical routing/retention remain open. Keep motion locked and ordering on hold pending hardware review and validation.
