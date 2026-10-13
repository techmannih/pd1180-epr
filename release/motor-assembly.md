# Motor and PCB alignment preview

The selected motor is STEPPERONLINE 34HS31-6004S1, using the hash-locked manufacturer STEP in `engineering/mechanical/assembly.json`. Its 6 A/phase rating, winding colours, front mounting dimensions and single front shaft come from the manufacturer, not the smaller reference motors.

The PCB has four Ø4.2 mm mounting holes:

| Hole | PCB X mm | PCB Y mm |
|---|---:|---:|
| H1 | 24.447132 | −38.374311 |
| H2 | 38.374311 | 24.447132 |
| H3 | −24.447132 | 38.374311 |
| H4 | −38.374311 | −24.447132 |

Manufacturer rear thread size and usable screw depth remain unknown. Matching CAD axes does not establish a usable accessory thread. The model therefore does not specify a secured PCB mounting stack or modification of motor case screws.

The retained 19.5 mm PCB-bottom/rear-face gap is **only a visual alignment distance**, not a fabricated stack or verified final mounting height. The board is not shown as mechanically secured. Bottom pin clearance, tool access and actual fastening still require physical verification.

The active preview contains 15 named models: motor, J2 mating housing, four pigtails, four splice envelopes, four factory conductors and the factory cable jacket. Existing factory cable exit geometry remains; no new restraint bracket is assumed. See [connections](connector-harnesses.md).

The centered underside AS5047P and its bypass capacitors stay doNotPlace. This single-shaft motor has no documented rotating rear interface for an encoder magnet; no holder or magnet is modeled.

[Motor and J2 harness alignment view](../previews/onboard-control-after.png). Use `release/circuit.json` for the routed board viewer; this image illustrates the mechanical arrangement.

Checks cover physical 3D holes, manufacturer-axis alignment, J2 body/mating clearance, every exported mechanical transform and nominal wire clearance. They do not qualify screw engagement, clamp pull strength, crimp quality, thermal performance or powered operation.
