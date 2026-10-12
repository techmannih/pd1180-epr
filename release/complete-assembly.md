# Revision B motor and J2 assembly

Open `motor-assembly.circuit.tsx`. The current preview contains 66 named parts: the ordered motor, custom plate and cable clamp, separate fasteners/spacers, J2 mate, four pigtails, four splices and the factory cable continuation. Unconnected J3/J7 and generic USB tails were removed. The complete powered system is not yet defined; [product correction](product-eco.md) lists every retained connection and blocker.

## Fabrication and assembly order

1. Obtain mechanical approval for sharing the motor's front flange with four NBK SHBS-M5-80 support posts. Do not loosen motor case screws. Confirm the exact motor body/cable dimensions and machine mounting access.
2. Quote the custom 85.9×85.9×3 mm 6061-T6 plate from `engineering/mechanical/fabrication/adapter-plate.dxf`, its hole CSV and SVG. General target tolerance is ±0.10 mm; no supplier has accepted it. Quote the PA12 support/cap STLs and approve print orientation/strength.
3. Assemble posts with M5×16 front and M5×10 top screws/washers. Fit the custom support beneath the plate using M3×12 fasteners. Verify thread engagement and tool access before applying an approved torque.
4. Fit four 6 mm Essentra spacers, PCB, M4×20 button screws, **8 mm DIN433 washers** and M4 nuts. The PCB bottom is nominally 19.5 mm above the motor rear. Check the approximately 1.6 mm screw-tip clearance and all tolerances; do not substitute larger washers.
5. Harness maker: retain enough factory cable for the modeled route and assembly adjustment. Fit four TE320559 splices (32.13 mm catalog length; OD still unverified) to Alpha3057 16 AWG pigtails. Nominal pigtail cuts are 170/170/170/165 mm, with 12 mm allowance already included. Confirm strip/crimp dimensions and actual cut length on the first article.
6. Insert SVH-41T-P1.1 contacts into VHR-4N cavities 1 black, 2 green, 3 red, 4 blue; confirm cavity orientation and winding continuity. Route the loop with minimum 23.876 mm bend radius. Fit the split clamp around the factory jacket, not a splice or bare conductor. Its nominal 7.5 mm bore comes from vendor CAD and must be checked against the physical cable. Qualify pull retention and hot creep; screw torque is not yet released.
7. Do not energize the motor until J3 braking, J7 command equipment, power source/cables, firmware/configuration and the staged acceptance tests are complete. J7 has only seven connected pins and has not yet been physically reduced.

## Evidence and limits

`motor-assembly-check.json` compares all 66 exported models with their generated geometry, checks holes and screw/post clearance. `harness-assembly-check.json` checks 429 cable segments, wire separation, cavity alignment and pigtail bend radius. `cable-support-check.json` checks actual support/cap/fastener mesh surfaces against the cables, excluding only the intended jacket passage. All are nominal CAD screens, not strength, tolerance, pull, thermal or physical-fit qualification.

U18/C52/C53 stay centered on the bottom and `doNotPlace`. The ordered single-front-shaft motor has no confirmed rear rotating attachment; no magnet holder has been invented. [Brake integration](brake-integration.md) remains open. [Before](../previews/product-eco/before.png) and [after](../previews/product-eco/after.png) use the same camera.
