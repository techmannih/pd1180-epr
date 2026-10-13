# Product review evidence

This checklist maps the review concerns to the current implementation and the evidence still needed. It does not treat a proposed part or passing CAD check as physical qualification.

| Review concern | Current implementation | Remaining evidence |
|---|---|---|
| Centered bottom encoder, doNotPlace | U18 at (0,0), with bottom C52/C53, all DNP and excluded from fitted BOM/CPL/paste | Magnet, holder, field and gap only if feedback is to be fitted; the ordered single-shaft motor has no qualified rear rotating interface |
| Use relevant reference designs | Pinned NEMA17/NEMA23 source comparison | [Reference differences](reference-review.md); reference hardware does not establish firmware or current compatibility |
| Justify every external connection | J2 motor, conditional J3 brake, J1 power and J10 data; local SW2 control | [Endpoint schedule](connector-harnesses.md), exact source/cable models and final sourcing |
| Connect the actual motor | VHR-4N, SVH contacts, 16 AWG pigtails and TE320559 splices mapped to the four factory leads | Qualified harness tooling, crimps, lengths, continuity, retention and physical fit |
| Complete assembly | Named motor/harness models and four PCB holes | Rear thread/depth, secure attachment, solder-tail/tool/cable clearance; the alignment preview is not a fastening design |
| Accurate part names and dimensions | Manufacturer motor identity; individually named J2 housing, conductors and splices; 32.13 mm TE splice length | TE splice outside diameter remains unverified; nominal dimensions are not production tolerances |
| No wires without sourced destinations | J2 ends at the identified motor; J3 installation is conditional and not modeled as complete | Final brake decision, resistor/terminals/heatsink/cable installation; selected EPR source and cables |
| Board must actually operate | STM32 commissioning image, onboard controls and hardware protection paths | TI full-flash image, PD hardware review, approved current/load/stop settings and staged powered tests |

[PD configuration review](pd-configuration-review.md) records an unresolved hardware/image concern. [Stock evidence](stock-report.json) records exact-code results; missing exact matches are unverified, not proof of zero stock. [Verification](../verification.md) preserves failed checks. The [assembly/provider requirements](assembly.md) require programming and serial-numbered functional acceptance before a ready-to-run delivery.
