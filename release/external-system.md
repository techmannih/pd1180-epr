# External equipment, connections and assembly sides

Applies to the revision 0.4 and ordered **STEPPERONLINE 34HS31-6004S1**. This is a wiring and procurement plan, not evidence of powered operation. The supplied firmware remains motion-locked; TI PD programming, the operating envelope, mechanical attachment and first-article tests are still open.

## What connects, why, when and where

| Item | Why / when used | Exact connection / location | Current decision |
|---|---|---|---|
| Motor harness | Required whenever this board drives the motor's two windings | Factory motor cable → four TE 320559 splices → four 16 AWG pigtails → VHR-4N → top-mounted J2 | Retain; make and qualify the separate cable assembly |
| EPR power source and cable | Supplies motor energy during operation | A source explicitly supporting a **48 V / 5 A EPR contract** → suitable 5 A EPR USB-C cable → J1 POWER | Required; exact source and cable SKUs not selected. A charger's total advertised wattage is insufficient evidence |
| USB data cable and host | Setup, logs and commissioning diagnostics | Host USB → J10 DATA | Service equipment; does not supply motor power or replace the onboard motion controller |
| SW2 START/STOP | Requests the internal motion profile after qualification | Onboard switch → STM32 PC6 → PCB SPI → TMC5160 internal ramp → bridges → J2 | Already on PCB; no external STEP/DIR box or control loom |
| SW1 RESET | Resets the MCU; must not restart motion automatically | Accessible top-side PCB switch | Already on PCB; reset is not a substitute for qualifying deceleration and regeneration |
| External brake assembly | Dissipates returned energy when the approved load/speed/stop profile needs it | J3 pin 1 VMOTOR → resistor → J3 pin 2 BRAKE_RETURN → Q16 → GND | Retain the provision pending the load decision. Empty J3 provides no resistor dissipation. See [brake decision and procedure](brake-integration.md) |
| SWD / EEPROM fixture | Programs and verifies the board before motor operation | Programmer → labelled top service pads; isolated EEPROM sequence in [PD programming](pd-programming.md) | Qualified provider/tooling needed; no permanent loose service wires in the product |
| Optional encoder | Future position feedback, only after a compatible magnet installation is established | U18 centered on bottom, with C52/C53; PCB SPI/ABI connections | All three DNP. No encoder or magnet needed for the chosen open-loop control architecture |

The local-control architecture requires no external command harness. J2/J3 board headers are already PCB BOM items; the mating housings and contacts below are separate.

## External purchase and service list

Quantities are per motor/controller unless stated. **Identified manufacturer parts are not confirmed supplier stock.** No purchase was made by this work. Exact supplier, availability, genuine part identity and final installation must be checked before ordering. Machine-readable status and endpoint details are in `external-parts.json`; the matching shopping inventory is `sourcing/external-items.csv` in the repository.

| Need | Item and quantity | Part / specification and source | Purchase status / remaining work |
|---|---|---|---|
| Basic system | Motor ×1 | STEPPERONLINE **34HS31-6004S1**, [user's Amazon item](https://www.amazon.com/dp/B091C83HWF), [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) | User reports already ordered; do not order another. Confirm received label and winding pairs |
| Basic system | EPR source ×1 | 48 V / 5 A on the selected output, compatible with this sink | **Exact model and supplier unresolved**; verify actual source capabilities and negotiation |
| Basic system | EPR USB-C cable ×1 | 5 A, EPR-rated, electronically marked; source → J1 | **Exact model and length unresolved**; qualify the actual cable with the chosen source |
| J2 harness | Housing ×1 | JST **VHR-4N**, [VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) | Identified; confirm supply and mating orientation |
| J2 harness | Crimp contacts ×4 | JST **SVH-41T-P1.1**, same catalogue | Identified for the 16 AWG pigtails; approved tooling and pull tests required |
| J2 harness | Four coloured conductors | Alpha **3057** 16 AWG family; black/green/red/blue. Proposed cuts **170/170/170/165 mm**, including 12 mm allowance | Exact colour/order codes and stock unresolved; lengths are CAD proposals, not a released harness drawing |
| J2 harness | Insulated butt splices ×4 | TE **320559**, [manufacturer](https://www.te.com/en/product-320559.html) | Connect each factory 0.75 mm² lead to its own 16 AWG pigtail. Nominal 32.13 mm length verified; 5 mm CAD OD still provisional |
| Physical installation | Cable retention and board attachment | Must suit the received motor, existing four PCB holes, solder-tail clearance and actual cable path | **Unselected**. Confirm motor accessory threads and engagement before selecting mounting hardware |
| Commissioning | USB data cable ×1 and host | Actual host connector → USB-C J10; data-capable | Exact cable SKU/length unresolved; existing suitable equipment may be reused |
| Commissioning service | SWD programmer, isolated EEPROM fixture and test equipment | Qualified 3.3 V programming interfaces, target-power arrangement, readback, current/bus-voltage/temperature measurements | Provider/tooling unresolved. These are shared service tools, not extra equipment required on every running motor |
| Conditional brake | Resistor ×1 | **10 Ω Vishay LPS0300H10R0GB, 300 W is a candidate only**, [datasheet](https://www.vishay.com/docs/50052/lps300.pdf) | **Do not treat 300 W as a purchase requirement.** Final resistance, pulse/average rating and need depend on load and tests |
| Conditional brake | J3 housing ×1, contacts ×2 | JST **VHR-2N**, **SVH-41T-P1.1** | Only for the qualified external brake installation |
| Conditional brake | Two conductors and resistor terminals | Proposed 16 AWG Alpha3057; **TE 152883 ×2** M4 ring terminals for the present resistor candidate, [manufacturer](https://www.te.com/en/product-152883.html) | Length, routing, terminal temperature, insulation protection and tooling unresolved; revisit terminals if the resistor changes |
| Conditional brake | Heatsink/chassis, thermal interface, fasteners, guard and strain relief | Sized for the selected resistor's losses, pulse duty and ambient | **No approved parts or dimensions yet**; not the PCB or a plastic motor bracket |
| Optional feedback only | Magnet, holder and U18/C52/C53 population | AS5047P-compatible rotating magnetic target and proven attachment | **Do not purchase or fit for the basic open-loop build.** No qualified rear rotating-shaft interface on the ordered single-shaft motor |

Ask the harness maker to quote a finished, labelled and tested J2 cable assembly; do not assume PCB assembly includes it. The nominal 1 m factory motor lead is not included in the four short pigtail lengths. Final slack management, cut length and retention need a physical first article. The [J2 cavity map](motor-harness.md#motor-cable-to-j2) and [wire endpoints](connector-harnesses.md) are authoritative for termination.

## What is on the bottom, and why?

The current TSX, compiled routed viewer and fitted placement file agree:

| Reference | Location and purpose | Fitted? |
|---|---|---|
| U18 AS5047P | Bottom at PCB `(0, 0)`, centered on the proposed motor axis for a motor-side magnetic target | **No — doNotPlace** |
| C52 100 nF | Bottom at `(0, −5.55)` mm; local encoder supply bypass | **No — doNotPlace** |
| C53 1 µF | Bottom at `(3.3, −5.3)` mm; additional encoder supply decoupling | **No — doNotPlace** |
| All 247 fitted components | Top, including J2, J3, switches and driver circuitry | **Yes — top-only BOM/CPL** |

U18 faces the motor-side magnetic target at the shaft axis. C52/C53 are on the same side to keep its bypass connections local. All three remain optional and unpopulated. R74 remains on top to keep the absent encoder deselected on SPI.

The metal below J2 is the **solder tails of the top-mounted through-hole connector**. Those pins pass through plated holes; they are not a second bottom-side component. Copper tracks, vias, solder joints and unpopulated footprints can also exist on the underside of a top-assembled PCB. Keep electrical clearance between these exposed features and the metal motor; the preview gap is not proof of a secured or insulated installation.

**No top-side relocation is needed for the fitted assembly.** Moving U18 to top would change its relationship to a future magnet and would not solve the missing rear shaft/holder interface. Keep the three footprints DNP until that interface and magnetic gap are qualified. Bottom DNP bodies may still appear in a design preview; BOM/CPL and paste determine what is assembled.

## Order of setup

SW1 is labelled **RESET** and resets the STM32 through NRST. SW2 is labelled **START/STOP** and requests normal motion through firmware: release then press to start; the next press requests deceleration to zero. The current implementation debounces for 30 ms, prevents a held button from starting at boot, ignores restart requests while stopping, and requires a separate fault acknowledgement before a new start. A stop timeout or SPI failure inhibits motion. These behaviors have host-test coverage; powered stopping performance remains unqualified.

A single START/STOP button suits this bounded local bench-control interface; [TI's DRV8833C EVM guide, §2.3](https://www.ti.com/lit/ug/slvuad4/slvuad4.pdf) uses the same operator pattern, without implying that its voltage/current ratings apply here. SW1 and SW2 are **not emergency-stop controls**. A machine application needs its own hazard/stop-function review. The existing green indicator means qualified supply/telemetry, not proof the shaft is stopped; clear RUN/STOP indication remains a product-usability item before general operator use. The present firmware remains motion-locked.

1. Finalize the source/cable, J2 harness, secure motor/PCB mounting, intended load, maximum speed and stop profile. Decide the brake requirement from the calculation and measurement plan, before expanding the operating envelope.
2. Have the provider assemble the top BOM and through-hole parts; leave U18/C52/C53 out. Program and verify the TI full-flash image and motion-locked STM32 image using the documented fixtures.
3. Start with no motor: validate rails, protection, PD negotiation and programming. Follow [assembly acceptance](assembly.md) and [power validation](power-validation.md).
4. With all power removed and VMOTOR discharged, verify J2 cavity/winding continuity, connect the motor and, if required by the approved test plan, the complete brake installation. Never short J3 or connect its return directly to ground.
5. Only after the qualification gates pass, use an identified motor-test firmware build and staged unloaded tests; then add the approved load. Capture bus peaks during commanded stops, faults, reset and power loss, plus current and temperatures. Speed alone does not decide whether J3 is needed.
6. Normal local START/STOP uses SW2 after qualified power-up. The current shipped commissioning binary cannot perform this step. No laptop motion-control application or external command connector is required by the selected architecture.
