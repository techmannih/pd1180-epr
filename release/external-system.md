# External equipment, connections and assembly sides

Applies to the revision 0.4.1 ECO plus PR #2 safety refinement and ordered **STEPPERONLINE 34HS31-6004S1**. This is a wiring and procurement plan, not evidence of powered operation. The supplied firmware remains motion-locked; TI PD programming, the operating envelope, mechanical attachment and first-article tests are still open.

Documentation reviewed **2026-10-17** against design commit `8139bca`. The current assembly has 54 mechanical models, including J2 and J3; only optional U18 is on the bottom. The purchase list below separates per-unit equipment from shared programming/test tools. A rendered part, identified supplier or written test procedure is not a completed purchase or hardware qualification.

## Power source, mains lead and cable

The required source capability is **48 V / 5 A USB-C PD EPR on one output (240 W)**. This is the adapter's capacity, not a measured or constant 240 W motor load. Actual consumption depends on speed, load and current setting. A multiport charger's combined wattage does not establish the required 48 V contract.

The current India procurement candidate is **Delta Electronics ADP-240KB BA**. Delta's [ADP-240KB B family specification](https://filecenter.deltaww.com/ImagesNew/PSBG/202507151534070720002.pdf) lists 240 W, a 48 V output, C6 AC inlet and 0–35°C operating ambient. Exact-part purchase pages checked on 2026-10-17 are [element14 India, order code 4756741](https://in.element14.com/delta-electronics/adp-240kb-ba/ac-dc-power-supply-5-36-48vv-3/dp/4756741) and [DigiKey India, 1145-ADP-240KBBA-ND](https://www.digikey.in/en/products/detail/delta-electronics/ADP-240KB-BA/23026419); both identify the 48 V / 5 A output. Prices, stock, tax and delivery must be checked at purchase. No unit has been ordered or tested by this work.

For that Delta variant, provide an approved **grounded Indian mains plug → IEC C5 cloverleaf cord** to mate with its **C6 inlet**. DigiKey lists the AC cord separately. Confirm the shipped inlet, mains rating and contents before choosing the exact cord SKU; it is not selected yet. The USB-C output lead must support the source's full 48 V / 5 A EPR operation. Use the supplied lead when suitable; do not buy a second cable merely because it appears as a separate inventory row. A detachable replacement must be **240 W EPR-rated, 5 A and electronically marked**. The StarTech cable below is an alternative for a compatible detachable-cable source, not an extension for a captive output lead.

The earlier [Framework 240 W adapter](https://frame.work/products/power-adapter-240w) remains an alternative candidate; India availability/delivery is unconfirmed. Select one source set. With either candidate, record the actual cable identity, negotiate 48 V / 5 A with this sink, and measure startup, droop, shutdown and load-step behavior before approving it.

The board has a separate limit: **U6 TPS26630 with R25 = 4.99 kΩ gives nominal 3.607 A current limiting**, or about **173 W at 48 V in the protected motor-power path**. This calculation is neither a guaranteed continuous output nor shaft power; tolerance, losses and thermal limits still apply. A larger adapter cannot raise this hardware limit. J10 supplies MCU diagnostics only; no second motor supply or external stepper driver is required by the selected architecture. The onboard STM32 and TMC5160 provide local control, so no Arduino/Raspberry Pi is required. See [power validation](power-validation.md) and the input-protection contract.

Reviewer wording: “The board requires a USB-C PD EPR source supporting 48 V / 5 A on one output, with a compatible EPR cable. The 240 W figure is source capacity; motor consumption and the usable operating envelope still require measurement.”

## What connects, why, when and where

| Item | Why / when used | Exact connection / location | Current decision |
|---|---|---|---|
| Motor harness | Required whenever this board drives the motor's two windings | Factory motor cable → four TE 320559 splices → four 16 AWG pigtails → VHR-4N → top-mounted J2 | Retain; make and qualify the separate cable assembly |
| EPR power source and cable | Supplies motor energy during operation | Mains cord → source explicitly supporting a **48 V / 5 A EPR contract** → suitable supplied or detachable EPR lead → J1 POWER | Delta ADP-240KB BA is the current procurement candidate; source, cable and mains-cord acceptance remain open |
| USB data cable and host | Setup, logs and commissioning diagnostics | Host USB → J10 DATA | Service equipment; does not supply motor power or replace the onboard motion controller |
| SW2 START/STOP | Requests the internal motion profile after qualification | Onboard switch → STM32 PC6 → PCB SPI → TMC5160 internal ramp → bridges → J2 | Already on PCB; no external STEP/DIR box or control loom |
| SW1 RESET | Resets the MCU; must not restart motion automatically | Accessible top-side PCB switch | Already on PCB; reset is not a substitute for qualifying deceleration and regeneration |
| External brake assembly | Dissipates returned energy during the current conservative commissioning profile | J3 pin 1 VMOTOR → resistor → J3 pin 2 BRAKE_RETURN → Q16 → GND | Required for the current commissioning profile; startup continuity sensing must pass. Empty J3 provides no resistor dissipation. See [brake decision and procedure](brake-integration.md) |
| SWD / EEPROM fixture | Programs and verifies the board before motor operation | Programmer → labelled top service pads; isolated EEPROM sequence in [PD programming](pd-programming.md) | Qualified provider/tooling needed; no permanent loose service wires in the product |
| Optional encoder | Future position feedback, only after a compatible magnet installation is established | U18 alone on bottom; C52/C53 on top; PCB SPI/ABI connections | All three DNP. No encoder or magnet needed for the chosen open-loop control architecture |

The local-control architecture requires no external command harness. J2/J3 board headers are already PCB BOM items; the mating housings and contacts below are separate.

## External purchase and service list

Quantities are per motor/controller unless stated. **Identified manufacturer parts are not confirmed supplier stock.** No purchase was made by this work. Exact supplier, availability, genuine part identity and final installation must be checked before ordering. Machine-readable status and endpoint details are in `external-parts.json`; the matching shopping inventory is `sourcing/external-items.csv` in the repository.

| Need | Item and quantity | Part / specification and source | Purchase status / remaining work |
|---|---|---|---|
| Basic system | Motor ×1 | STEPPERONLINE **34HS31-6004S1**, [user's Amazon item](https://www.amazon.com/dp/B091C83HWF), [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) | User reports already ordered; do not order another. Confirm received label and winding pairs |
| Basic system | EPR source ×1 | Delta **ADP-240KB BA**, 48 V / 5 A on its USB-C output; purchase links above | Candidate only; no purchase, source/sink negotiation or load qualification recorded |
| Basic system | Mains cord ×1 | Grounded Indian plug → IEC C5 for the Delta C6 inlet; approved cord rated for the actual mains and adapter input | Exact SKU unselected; confirm whether the seller includes a suitable cord. Do not substitute a two-wire unearthed lead |
| Basic system | EPR USB-C connection ×1 | Suitable supplied output lead, or 240 W EPR / 5 A electronically marked detachable cable; source → J1 | No duplicate purchase when a suitable lead is supplied. [StarTech CC1M80GUSB4CABLE](https://www.startech.com/en-ca/cables/cc1m80gusb4cable), 1 m, is a candidate only for a compatible detachable-cable source; qualify negotiation and plug access |
| J2 harness | Housing ×1 | JST **VHR-4N**, [VH catalogue](https://www.jst-mfg.com/product/pdf/eng/eVH.pdf) | Identified; confirm supply and mating orientation |
| J2 harness | Crimp contacts ×4 | JST **SVH-41T-P1.1**, same catalogue | Identified for the 16 AWG pigtails; approved tooling and pull tests required |
| J2 harness | Four coloured conductors | Alpha **3057** 16 AWG family; black/green/red/blue. Proposed cuts **170/170/170/165 mm**, including 12 mm allowance | Exact stranded-wire codes: **3057 BK005 / GR005 / RD005 / BL005** (100 ft spools). Have the harness supplier cut traceable material; do not buy four full spools per motor. Lengths still require first-article approval; stock is not reserved |
| J2 harness | Insulated butt splices ×4 | TE **320559**, [manufacturer](https://www.te.com/en/product-320559.html) | Connect each factory 0.75 mm² lead to its own 16 AWG pigtail. Actual manufacturer AE STEP now modeled: nominal 32.131 mm length / 5.6134 mm diameter. Current V6 drawing archived; finished crimp still requires physical acceptance |
| Physical installation | Cable retention, board attachment and electrical clearance/insulation | Must suit the received motor, existing four PCB holes, exposed solder tails and actual cable path | **Unselected**. Confirm accessory threads/depth, fastening, insulation and strain relief; the preview gap is not an approved installation |
| Commissioning | USB data cable ×1 and host | Actual host connector → USB-C J10; data-capable | USB-C host candidate: [StarTech USB2CC2M](https://www.startech.com/en-us/cables/usb2cc2m), 2 m, 480 Mbit/s USB 2.0. For **J10 DATA only**, not the 48 V EPR input. Match the actual host socket; existing qualified data cable may be reused |
| Commissioning service | SWD programmer, isolated EEPROM fixture and test equipment | Qualified 3.3 V interfaces, fixed-5 V programming source, current-limited startup supply, multimeter, appropriately rated differential voltage/current probes and temperature measurement | Candidates: STLINK-V3MINIE for U16; Total Phase Aardvark for U3 I2C. A qualified pad fixture is still required. A commissioning provider can supply this shared equipment; it is not permanently attached to each motor |
| Commissioning brake | Resistor ×1 | **10 Ω Vishay LPS0300H10R0GB, 300 W is a candidate only**, [datasheet](https://www.vishay.com/docs/50052/lps300.pdf) | **Do not treat 300 W as a purchase requirement.** Final pulse/average rating and cooling depend on load and tests |
| Commissioning brake | J3 housing ×1, contacts ×2 | JST **VHR-2N**, **SVH-41T-P1.1** | Only for the qualified external brake installation |
| Commissioning brake | Two conductors and resistor terminals | Proposed 16 AWG Alpha3057; **TE 152883 ×2** M4 ring terminals for the present resistor candidate, [manufacturer](https://www.te.com/en/product-152883.html) | Length, routing, terminal temperature, insulation protection and tooling unresolved; revisit terminals if the resistor changes |
| Commissioning brake | Heatsink/chassis, thermal interface, fasteners, guard and strain relief | Sized for the selected resistor's losses, pulse duty and ambient | **No approved parts or dimensions yet**; not the PCB or a plastic motor bracket |
| Optional feedback only | Magnet, holder and U18/C52/C53 population | AS5047P-compatible rotating magnetic target and proven attachment | **Do not purchase or fit for the basic open-loop build.** No qualified rear rotating-shaft interface on the ordered single-shaft motor |

Ask the harness maker to quote a finished, labelled and tested J2 cable assembly; do not assume PCB assembly includes it. The nominal 1 m factory motor lead is not included in the four short pigtail lengths. Final slack management, cut length and retention need a physical first article. The [J2 cavity map](motor-harness.md#motor-cable-to-j2) and [wire endpoints](connector-harnesses.md) are authoritative for termination.

## What is on the bottom, and why?

The current TSX, compiled routed viewer and fitted placement file agree:

| Reference | Location and purpose | Fitted? |
|---|---|---|
| U18 AS5047P | Bottom at PCB `(0, 0)`, centered on the proposed motor axis for a motor-side magnetic target | **No — doNotPlace** |
| C52 100 nF | Top at `(0, −5.55)` mm; encoder supply bypass through the reviewed short via path | **No — doNotPlace** |
| C53 1 µF | Top at `(3.3, −7.0)` mm; additional encoder supply decoupling | **No — doNotPlace** |
| All 255 fitted components | Top, including J2, J3, switches and driver circuitry | **Yes — top-only BOM/CPL** |

U18 faces the proposed motor-side magnetic target at the shaft axis. C52/C53 are on top; the reviewed U18/C52 bypass uses one 0.60/0.30 mm through via and measures approximately 3.873 mm including board thickness. See [encoder placement evidence](brake-assembly.md#bottom-side-constraint). All three remain optional and unpopulated. R74 remains on top to keep the absent encoder deselected on SPI.

The metal below J2 is the **solder tails of the top-mounted through-hole connector**. Those pins pass through plated holes; they are not a second bottom-side component. Copper tracks, vias, solder joints and unpopulated footprints can also exist on the underside of a top-assembled PCB. Keep electrical clearance between these exposed features and the metal motor; the preview gap is not proof of a secured or insulated installation.

The C52/C53 top relocation is already implemented. Keep U18 bottom and all three footprints DNP until the rear rotating interface and magnetic gap are qualified. Only U18 may appear as a bottom DNP body in the current preview; BOM/CPL and paste determine what is assembled.

## Order of setup

SW1 (printed reference **SW1**) resets the STM32 through NRST. SW2 is labelled **START/STOP** and requests normal motion through firmware: release then press to start; the next press requests deceleration to zero. The current implementation debounces for 30 ms, prevents a held button from starting at boot, ignores restart requests while stopping, and requires a separate fault acknowledgement before a new start. A stop timeout or SPI failure inhibits motion. These behaviors have host-test coverage; powered stopping performance remains unqualified.

A single START/STOP button suits this bounded local bench-control interface; [TI's DRV8833C EVM guide, §2.3](https://www.ti.com/lit/ug/slvuad4/slvuad4.pdf) uses the same operator pattern, without implying that its voltage/current ratings apply here. SW1 and SW2 are **not emergency-stop controls**. A machine application needs its own hazard/stop-function review. The existing green indicator means qualified supply/telemetry, not proof the shaft is stopped; clear RUN/STOP indication remains a product-usability item before general operator use. The present firmware remains motion-locked.

1. Finalize the source/cable, J2 harness, secure motor/PCB mounting, intended load, maximum speed and stop profile. Qualify the mandatory brake installation using the calculation and measurement plan, before expanding the operating envelope.
2. Have the provider assemble the top BOM and through-hole parts; leave U18/C52/C53 out. Program and verify the TI full-flash image and motion-locked STM32 image using the documented fixtures.
3. Start with no motor: validate rails, protection, PD negotiation and programming. Follow [assembly acceptance](assembly.md) and [power validation](power-validation.md).
4. With all power removed and VMOTOR discharged, verify J2 cavity/winding continuity, connect the motor and the complete qualified brake installation. Never short J3 or connect its return directly to ground.
5. Only after the qualification gates pass, use an identified motor-test firmware build and staged unloaded tests; then add the approved load. Capture bus peaks during commanded stops, faults, reset and power loss, plus current and temperatures. Speed alone does not decide whether J3 is needed.
6. Normal local START/STOP uses SW2 after qualified power-up. The current shipped commissioning binary cannot perform this step. No laptop motion-control application or external command connector is required by the selected architecture.

The main ECO adds D20 cable-inductance recirculation and the R134/R135/R136/C98 divider into U30 AIN2. Three distinct fresh samples check continuity with motor-bus power permitted and the bridge inhibited. During RUN, fresh voltage-continuity checks now latch invalid/stale feedback, with the bounded braking observation interval described in `brake-integration.md`. This does not prove resistance, cooling, fault-response timing or regenerated-energy containment. The firmware retains all three false qualification locks.

## Exact wire and programming-tool candidates

[Alpha Wire 3057](https://www.alphawire.com/en/products/wire/hook-up-wire/premium/3057) is **16 AWG, 26/30 stranded tinned copper**, 300 V, UL1569 105°C, nominal insulation OD 2.3368 mm with ±0.0508 mm tolerance. Use 3057 BK005 (black), GR005 (green), RD005 (red) and BL005 (blue). The `/1` solid-wire family is not the specified harness wire. Order quantities above are cut conductors, not spool quantities. The same black/red codes are candidates for J3, subject to installed temperature and final cable length. Do not route them against the brake resistor or heatsink.

[STLINK-V3MINIE](https://www.st.com/en/development-tools/stlink-v3minie.html) is a concrete SWD programmer candidate; the [UM2910 manual](https://www.st.com/resource/en/user_manual/um2910-stlinkv3minie-evaluation-board-stmicroelectronics.pdf) covers its target interface. A purpose-wired fixture must connect the board's SWDIO, SWCLK, NRST, ground and target-voltage sense pads. It is not a direct plug onto these bare PCB pads.

[Total Phase Aardvark I2C/SPI Host Adapter](https://www.totalphase.com/products/aardvark-i2cspi/) is a concrete 3.3 V I2C tool candidate for U3, with a 100 kHz fixture profile. Its [manual](https://www.totalphase.com/support/articles/200468316-aardvark-i2c-spi-host-adapter-user-manual/) identifies pins 4 and 6 as controllable **+5 V target-power outputs**: leave both disconnected and target-power output OFF. Power this target through J1 as described in [pd-programming.md](pd-programming.md), connect ground first, isolate both U36 I2C paths with TP_PD_ISO, and check the actual pullups/levels before connection. Do not let the programmer supply the EEPROM rail or back-power another domain. Verify full readback with the existing programming checks. The candidate TI image exists; fixture use and board readback remain unperformed.

Tool identification does not validate a fixture. Source, cable, tool and harness candidates still need actual supplier allocation and physical acceptance. No purchase or supplier request has been made.

## Acceptance records to deliver

- Exact PCBA revision/serial, motor label and winding map; completed J2/J3 harness continuity, insulation, crimp/pull and retention checks.
- Source and mains-cord identities, supplied/detachable EPR lead identity, 48 V / 5 A negotiation trace and source transient/fault measurements.
- Selected resistor, pulse/average duty, rated cooling/TIM, terminal guard and secure mounting records. **10 Ω / 300 W and the rendered heatsink remain provisional.**
- TI U3 programming log and full **65,536-byte** readback; STM32 U16 programming log, option bytes and full **524,288-byte** readback; compare against the registered images using [the programming procedure](pd-programming.md).
- Power-removed cold boot, PD APP/`PD118041` marker and MCU/inhibit checks, followed by stationary supply/fault checks, low-current unloaded motion, then braking/thermal tests for a defined load/speed envelope. All three motion locks remain false until the corresponding hardware evidence supports a reviewed test image.

None of these physical records exists yet. [Readiness](readiness.md) also records the unresolved copper-width finding; completing the external shopping list does not clear fabrication or motor-operation holds.
