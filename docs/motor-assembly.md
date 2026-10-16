# Motor and PCB alignment preview

The selected motor is STEPPERONLINE 34HS31-6004S1, using the hash-locked manufacturer STEP in `engineering/mechanical/assembly.json`. Its 6 A/phase rating, winding colours, front mounting dimensions and single front shaft come from the manufacturer, not the smaller reference motors.

At the user's request, the four existing Ø4.2 mm PCB holes are unchanged:

| Hole | PCB X mm | PCB Y mm |
|---|---:|---:|
| H1 | 24.447132 | −38.374311 |
| H2 | 38.374311 | 24.447132 |
| H3 | −24.447132 | 38.374311 |
| H4 | −38.374311 | −24.447132 |

The 51-part adapter/front-post/fastener/spacer/clamp assembly is withdrawn. No replacement fasteners have been invented. Manufacturer rear thread size and usable screw depth remain unknown. Matching CAD axes does not establish a usable accessory thread. No existing motor case screws are removed by this design.

The retained 19.5 mm PCB-bottom/rear-face gap is **only the previous preview separation**, not a fabricated stack or verified final mounting height. The board is not shown as mechanically secured. Bottom pin clearance, tool access and actual fastening still require physical verification.

The active preview contains **54 named mechanical models**, covering the motor and J2 harness plus the J3 mating plug/contacts, two cables, ring terminals, manufacturer resistor body, nominal fasteners and provisional cooling/guard installation. The earlier 15-model motor/J2-only preview is historical. Existing factory cable exit geometry remains; no new motor restraint bracket is assumed. See [connections](connector-harnesses.md) and [brake assembly](brake-assembly.md).

The centered AS5047P U18 is the only bottom-side footprint. Its bypass capacitors C52/C53 are on top; all three stay doNotPlace. This single-shaft motor has no documented rotating rear interface for an encoder magnet; no holder or magnet is modeled or required for the open-loop build.

[Historical before](../previews/onboard-control-before.png) · [Historical after](../previews/onboard-control-after.png). Both renders show the 2026-10-12 control ECO from the same camera. They predate the J3 assembly and encoder-capacitor move; open `motor-assembly.circuit.tsx` or the default routed 3D view for the current assembly.

Checks cover physical 3D holes, manufacturer-axis alignment, J2 body/mating clearance, every exported mechanical transform and nominal wire clearance. They do not qualify screw engagement, clamp pull strength, crimp quality, thermal performance or powered operation.
