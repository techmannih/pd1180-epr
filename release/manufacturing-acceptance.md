# Manufacturing and mechanical acceptance

**Engineering review package; fabrication and motor operation remain held.** Use the current RP2040 / DRV8462DDVR / TPS26750 release, with U38 raw-PD sensing and WAGO J2/J3. Record release hash, supplier, drawing revision, operator/date and evidence for each acceptance. A catalogue capability is not this board's manufacturing approval.

## Current fabrication instructions

| Area | Requirement | Acceptance evidence |
|---|---|---|
| PCB | 85.9 × 85.9 mm stepped outline; four layers; 1.6 mm; 1 oz on every layer; ENIG; top assembly | Supplier accepts the actual stack-up, electrical test and drawing |
| Copper | Minimum track **0.15 mm**; copper spacing **0.10 mm**; global copper-to-edge **0.20 mm** | Retain source/native rules; do not substitute defaults |
| GND inner plane | Clearance **0.30 mm**, edge inset **0.50 mm** | Independent of the global edge rule |
| Via-in-pad | **66 locations**, epoxy filled and copper capped | Coordinate list and board hash in `rp2040-via-in-pad.json`; inspect planarity and joints |
| Fitted assembly | **243 components**, all top; U18 bottom DNP, C52/C53 top DNP | Matching BOM/CPL/Gerbers; selective or hand soldering of WAGO terminals and tall parts agreed |
| USB receptacles | C3025063 / USB4105-GF-A-060; 0.60 mm stakes on a 1.6 mm board | Joint/retention acceptance; stakes need not protrude through the board |
| USB routing | 90 Ω differential design target, ±10% project tolerance | Selected stack-up, actual geometry field-solver result and coupon/TDR plus functional USB test |
| Driver cooling | DDV exposed **top** pad, TIM, heatsink and mechanically supported contact | See `thermal-qualification.md`; no approved cooling assembly or full-current rating yet |
| Motor mounting | Four unchanged Ø4.2 mm holes aligned to manufacturer STEP axes | Actual rear threads, engagement and fastening load path still unconfirmed |
| J2/J3 harnesses | WAGO direct wire termination; no mating housings/socket contacts | Strip, retention, continuity, strain relief, access and temperature records |

The exact via list, including U38/C109 and C103 signal fanout locations, supersedes historical inventories. Keep connector plated holes and motor mounting holes open. [JLC's via-covering specification](https://jlcpcb.com/help/article/pcb-via-covering) distinguishes filled/capped processing from ordinary tenting or mask plugging.

[JLC stack-up data](https://jlcpcb.com/impedance) must be matched to the actual four-layer requirement. Do not substitute 0.5 oz inner copper or change to 2 oz outer copper without a reviewed geometry/impedance/process update. TI recommends 2 oz outer layers for DRV8462; the retained 1 oz design has no full-current thermal qualification. Ground-reference continuity is not an impedance measurement.

## Native findings and retained holds

Read the current `kicad-drc.json` rather than a historical screenshot. The reviewed baseline has **eight J1/J10 hole-clearance errors and 475 cosmetic warnings**, with zero unconnected, schematic-parity and ERC findings. Those retained errors are permitted for engineering review only. Obtain explicit fabricator acceptance or a reviewed footprint correction before ordering; do not lower rules merely to obtain zero errors. Cosmetic review must also ensure safety/polarity markings remain legible.

## Mounting measurements

The manufacturer STEP and Ø4.2 mm PCB drill do not specify an accessory screw thread. As of this handoff the user has no physical measurements available. Do not remove structural tie bolts or assume the rear case screws can support accessories. Record thread size/pitch, usable engagement, bottoming clearance, permitted torque, under-head length and approved load path. Confirm motor-to-board insulation, through-hole solder-tail clearance and retention. The **19.5 mm preview gap is not a selected spacer height**. No screw/spacer set is approved.

## Harness acceptance

J2 is **WAGO 2601-3104**: four wire entries, eight solder tails, pairs 1/5, 2/6, 3/7 and 4/8. Use black/green/red/blue Alpha 3057 16 AWG pigtails, nominal **175 mm each**, with 8–9 mm strip at WAGO. J3 is **WAGO 236-402**: entries 1 and 2, pairs 1/3 and 2/4, 5–6 mm strip. J3 red/black cuts are nominal **165/210 mm**. BRAKE_RETURN is switched, not ground. Actual cut lengths require a first article. See `connector-harnesses.md` and `motor-harness.md`.

Four [TE 320559](https://www.te.com/en/product-320559.html) butt splices join individual 0.75 mm² motor leads to 16 AWG pigtails, one conductor per end. The accepted wire range is 22–16 AWG / 0.3–1.42 mm²; the 3.18 mm insulation limit is not splice diameter. Archived CAD nominal body diameter/length are 5.6134/32.131 mm. Inspect finished crimps, not just uncrimped CAD. Use [TE 114-2157](https://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocFormat=pdf&DocLang=English&DocNm=114-2157&DocType=Specification+Or+Standard&PartCntxt=320559) and the exact tool instructions for strip/crimp/pull criteria; destructive tests use coupons. Inspect strand insertion and clamp retention, keep insulation out of the clamp contact and copper enclosed, and qualify wire/terminal temperatures.

J3 uses two TE 152883 M4 rings at the provisional resistor. Cooling, terminal guard and strain relief are separate required assembly items. WAGO terminal installation does not remove these requirements.

## Components and programming

U16 is **RP2040 / C2040, LQFN-56(7×7)** with an exposed ground land. U17 is **W25Q32JVSSIM / C6000508, SOIC-8-208mil**, on V3V3_MCU and the QSPI boot bus. Approve the actual stencil and joints from the current Gerbers; do not reuse older MCU stencil/programming instructions. See `u16-footprint.md`.

U35 remains PCA9538PWR with U37 PD_3V3-domain reset buffering. Its supplier-style TSSOP-16 land pattern requires the acceptance described in `u35-footprint.md`.

Program U3 with the registered TI image, read the full **65,536-byte EEPROM**, then verify a cold APP boot and actual EPR contract. Program U16's external flash with the current RP2040 image and read back **4,194,304 bytes from 0x10000000**. All four motion qualification flags remain false. The included diagnostics image is not a ready-to-run deliverable. Secure installation, voltage/fault tests and qualified low-current/braking/thermal tests must precede a motor-enabled image.

Both USB mating faces nominally extend 0.2856 mm beyond the board edge; qualify real plug/enclosure access using `usb-access.md`.

## Record supplied for manufacturer review

Use [manufacturing-acceptance-record.json](../engineering/manufacturing-acceptance-record.json) for the exact release identity, supplier stack-up, impedance evidence, filled/capped process, USB-hole disposition and critical-marking inspection. Blank fields are outstanding approvals, not implied acceptance. This request has not been sent to a supplier.

Review the actual final top/bottom fabrication plots and first assembled article. Confirm PWR/DATA identity, motor phase order, brake polarity/return, capacitor polarity and programming/service contacts. The brake return is **not GND**. A readable screen preview does not establish the legibility of printed or assembly-obscured markings. Reject removal or ambiguity of these identifiers even if cosmetic reference overlaps are retained for engineering review.
