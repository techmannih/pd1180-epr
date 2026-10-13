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

The active preview contains 15 named models: motor, J2 mating housing, four pigtails, four manufacturer TE320559 STEP bodies, four factory conductors and the factory cable jacket. Existing factory cable exit geometry remains; no new restraint bracket is assumed. See [connections](connector-harnesses.md).

The centered underside AS5047P and its bypass capacitors stay doNotPlace. This single-shaft motor has no documented rotating rear interface for an encoder magnet; no holder or magnet is modeled.

[Before](../previews/onboard-control-before.png) · [After](../previews/onboard-control-after.png). Both renders use the same camera. The after view uses current TSX source and does not claim refreshed manufacturing copper.

Checks cover physical 3D holes, manufacturer-axis alignment, J2 body/mating clearance, every exported mechanical transform and nominal wire clearance. They do not qualify screw engagement, clamp pull strength, crimp quality, thermal performance or powered operation.
