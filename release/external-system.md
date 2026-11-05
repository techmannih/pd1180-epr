> RP2040 redesign: retained external equipment below still needs physical qualification; the DDV top heatsink/TIM is an additional unresolved requirement. Older assembly CAD does not include a qualified DDV cooling installation.

# External equipment, connections and assembly sides

Applies to the current RP2040 / DRV8462 / raw-PD-sensing / WAGO revision and ordered **STEPPERONLINE 34HS31-6004S1**. This is a wiring and procurement plan, not evidence of powered operation. The supplied firmware remains motion-locked; TI PD programming, the operating envelope, mechanical attachment and first-article tests are still open.

## What connects, why, when and where

| Item | Why / when used | Exact connection / location | Current decision |
|---|---|---|---|
| Motor harness | Required whenever this board drives the motor's two windings | Factory motor cable → four TE 320559 splices → four 16 AWG pigtails → stripped wire → WAGO 2601-3104 J2 | Retain; make and qualify the separate cable assembly |
| EPR power source and cable | Supplies motor energy during operation | A source explicitly supporting a **48 V / 5 A EPR contract** → suitable 5 A EPR USB-C cable → J1 POWER | Framework 240 W adapter is a candidate; source and cable procurement/qualification remain open. A charger's total advertised wattage is insufficient evidence |
| USB data cable and host | Required MCU power during operation, plus setup/logs/diagnostics | Host USB → J10 DATA | Keep connected alongside J1 PD. PD alone cannot power RP2040; DATA does not supply motor energy |
| SW2 START/STOP | Requests the internal motion profile after qualification | Onboard switch → RP2040 GP11 → timer STEP/DIR → DRV8462 integrated bridges → J2 | Already on PCB; no external STEP/DIR box or control loom |
| SW1 RESET | Resets the MCU; must not restart motion automatically | Accessible top-side PCB switch | Already on PCB; reset is not a substitute for qualifying deceleration and regeneration |
| External brake assembly | Dissipates returned energy during the current conservative commissioning profile | J3 pin 1 VMOTOR → resistor → J3 pin 2 BRAKE_RETURN → Q16 → GND | Required for the current commissioning profile; startup continuity sensing must pass. Empty J3 provides no resistor dissipation. See [brake decision and procedure](brake-integration.md) |
| SWD / EEPROM fixture | Programs and verifies the board before motor operation | Programmer → labelled top service pads; isolated EEPROM sequence in [PD programming](pd-programming.md) | Qualified provider/tooling needed; no permanent loose service wires in the product |
| Optional encoder | Future position feedback, only after a compatible magnet installation is established | U18 alone on bottom; C52/C53 on top; I2C ENC_SDA/ENC_SCL and optional ENC_OUT | All three DNP. No encoder or magnet needed for the chosen open-loop control architecture |

The local-control architecture requires no external command harness. J2/J3 WAGO terminals are PCB BOM items; wires enter their clamps directly. No separate mating housings or socket contacts are required.

## External purchase and service list

Quantities are per motor/controller unless stated. **Identified manufacturer parts are not confirmed supplier stock.** No purchase was made by this work. Exact supplier, availability, genuine part identity and final installation must be checked before ordering. Machine-readable status and endpoint details are in `external-parts.json`; the matching shopping inventory is `sourcing/external-items.csv` in the repository.

| Need | Item and quantity | Part / specification and source | Purchase status / remaining work |
|---|---|---|---|
| Basic system | Motor ×1 | STEPPERONLINE **34HS31-6004S1**, [user's Amazon item](https://www.amazon.com/dp/B091C83HWF), [manufacturer drawing](https://files.omc-stepperonline.com/34HS31-6004S1_Full_Datasheet.pdf) | User reports already ordered; do not order another. Confirm received label and winding pairs |
| Basic system | EPR source ×1 | 48 V / 5 A on the selected output, compatible with this sink | Framework Power Adapter 240 W is the candidate; purchase and qualification remain unresolved. Verify actual source capabilities and negotiation |
| Basic system | EPR USB-C cable ×1 | 5 A, EPR-rated, electronically marked; source → J1 | [StarTech CC1M80GUSB4CABLE](https://www.startech.com/en-ca/cables/cc1m80gusb4cable), 1 m, 240 W EPR / 5 A / e-marker candidate; qualify actual source/sink negotiation and plug access |
| J2 harness | Four coloured conductors | Alpha **3057** 16 AWG family; black/green/red/blue. Proposed cuts **175/175/175/175 mm**, including 12 mm allowance | Exact stranded-wire codes: **3057 BK005 / GR005 / RD005 / BL005** (100 ft spools). Have the harness supplier cut traceable material; do not buy four full spools per motor. Lengths still require first-article approval; stock is not reserved |
| J2 harness | Insulated butt splices ×4 | TE **320559**, [manufacturer](https://www.te.com/en/product-320559.html) | Connect each factory 0.75 mm² lead to its own 16 AWG pigtail. Actual manufacturer AE STEP now modeled: nominal 32.131 mm length / 5.6134 mm diameter. Current V6 drawing archived; finished crimp still requires physical acceptance |
| Physical installation | Cable retention and board attachment | Must suit the received motor, existing four PCB holes, solder-tail clearance and actual cable path | **Unselected**. Confirm motor accessory threads and engagement before selecting mounting hardware |
| Commissioning | USB data cable ×1 and host | Actual host connector → USB-C J10; data-capable | USB-C host candidate: [StarTech USB2CC2M](https://www.startech.com/en-us/cables/usb2cc2m), 2 m, 480 Mbit/s USB 2.0. For **J10 DATA only**, not the 48 V EPR input. Match the actual host socket; existing qualified data cable may be reused |
| Commissioning service | SWD programmer, isolated EEPROM fixture and test equipment | Qualified 3.3 V programming interfaces, target-power arrangement, readback, current/bus-voltage/temperature measurements | Candidates: Raspberry Pi Debug Probe / CMSIS-DAP for U16; Total Phase Aardvark for U3 I2C. A qualified pad fixture is still required; see tool/power details below. Shared service equipment, not a per-motor accessory |
| Commissioning brake | Resistor ×1 | **10 Ω Vishay LPS0300H10R0GB, 300 W is a candidate only**, [datasheet](https://www.vishay.com/docs/50052/lps300.pdf) | **Do not treat 300 W as a purchase requirement.** Final pulse/average rating and cooling depend on load and tests |
| Commissioning brake | J3 termination | Onboard WAGO **236-402**; stripped wire, no separate mate/contact | Strip 5–6 mm; qualify clamp retention and cable support |
| Commissioning brake | Two conductors and resistor terminals | Proposed 16 AWG Alpha3057; **TE 152883 ×2** M4 ring terminals for the present resistor candidate, [manufacturer](https://www.te.com/en/product-152883.html) | Length, routing, terminal temperature, insulation protection and tooling unresolved; revisit terminals if the resistor changes |
| Commissioning brake | Heatsink/chassis, thermal interface, fasteners, guard and strain relief | Sized for the selected resistor's losses, pulse duty and ambient | **No approved parts or dimensions yet**; not the PCB or a plastic motor bracket |
| Optional feedback only | Magnet, holder and U18/C52/C53 population | AS5600-compatible rotating magnetic target and proven attachment | **Do not purchase or fit for the basic open-loop build.** No qualified rear rotating-shaft interface on the ordered single-shaft motor |

Ask the harness maker to quote a finished, labelled and tested J2 cable assembly; do not assume PCB assembly includes it. The nominal 1 m factory motor lead is not included in the four short pigtail lengths. Final slack management, cut length and retention need a physical first article. The [J2 cavity map](motor-harness.md#motor-cable-to-j2) and [wire endpoints](connector-harnesses.md) are authoritative for termination.

## What is on the bottom, and why?

The current TSX, compiled routed viewer and fitted placement file agree:

| Reference | Location and purpose | Fitted? |
|---|---|---|
| U18 AS5600 | Bottom at PCB `(0, 0)`, centered on the proposed motor axis for a motor-side magnetic target | **No — doNotPlace** |
| C52 100 nF | Top at `(0, −5.55)` mm; local encoder supply bypass | **No — doNotPlace** |
| C53 1 µF | Top at `(3, −4.5)` mm; additional encoder supply decoupling | **No — doNotPlace** |
| All 240 fitted components | Top, including J2, J3, switches and driver circuitry | **Yes — top-only BOM/CPL** |

U18 faces the motor-side magnetic target at the shaft axis. C52/C53 are on top; the optional bypass routing is reviewed in encoder-top-eco.json. All three remain optional and unpopulated. The AS5600 uses I2C; the former SPI encoder and R74 are removed.

The metal below J2 is the **solder tails of the top-mounted through-hole connector**. Those pins pass through plated holes; they are not a second bottom-side component. Copper tracks, vias, solder joints and unpopulated footprints can also exist on the underside of a top-assembled PCB. Keep electrical clearance between these exposed features and the metal motor; the preview gap is not proof of a secured or insulated installation.

**No top-side relocation is needed for the fitted assembly.** Moving U18 to top would change its relationship to a future magnet and would not solve the missing rear shaft/holder interface. Keep the three footprints DNP until that interface and magnetic gap are qualified. Bottom DNP bodies may still appear in a design preview; BOM/CPL and paste determine what is assembled.

## Order of setup

SW1 (printed reference **SW1**) resets RP2040 through RUN / NRST. SW2 is labelled **START/STOP** and requests normal motion through firmware: release then press to start; the next press requests deceleration to zero. The current implementation debounces for 30 ms, prevents a held button from starting at boot, ignores restart requests while stopping, and requires a separate fault acknowledgement before a new start. A stop timeout or SPI failure inhibits motion. These behaviors have host-test coverage; powered stopping performance remains unqualified.

A single START/STOP button suits this bounded local bench-control interface; [TI's DRV8833C EVM guide, §2.3](https://www.ti.com/lit/ug/slvuad4/slvuad4.pdf) uses the same operator pattern, without implying that its voltage/current ratings apply here. SW1 and SW2 are **not emergency-stop controls**. A machine application needs its own hazard/stop-function review. The existing green indicator means qualified supply/telemetry, not proof the shaft is stopped; clear RUN/STOP indication remains a product-usability item before general operator use. The present firmware remains motion-locked.

1. Finalize the source/cable, J2 harness, secure motor/PCB mounting, intended load, maximum speed and stop profile. Qualify the mandatory brake installation using the calculation and measurement plan, before expanding the operating envelope.
2. Have the provider assemble the top BOM and through-hole parts; leave U18/C52/C53 out. Program and verify the TI full-flash image and motion-locked RP2040 image using the documented fixtures.
3. Start with no motor: validate rails, protection, PD negotiation and programming. Follow [assembly acceptance](assembly.md) and [power validation](power-validation.md).
4. With all power removed and VMOTOR discharged, verify J2 cavity/winding continuity, connect the motor and the complete qualified brake installation. Never short J3 or connect its return directly to ground.
5. Only after the qualification gates pass, use an identified motor-test firmware build and staged unloaded tests; then add the approved load. Capture bus peaks during commanded stops, faults, reset and power loss, plus current and temperatures. Speed alone does not decide whether J3 is needed.
6. Normal local START/STOP uses SW2 after qualified power-up with both DATA USB and PD connected. The current shipped commissioning binary cannot perform this step. No laptop motion-control application or external command connector is required by the selected architecture.

The main ECO adds D20 cable-inductance recirculation and the R134/R135/R136/C98 divider into U30 AIN2. Three distinct fresh samples check continuity with motor-bus power permitted and the bridge inhibited. During RUN, fresh voltage-continuity checks now latch invalid/stale feedback, with the bounded braking observation interval described in `brake-integration.md`. This does not prove resistance, cooling, fault-response timing or regenerated-energy containment. The firmware retains all four false qualification locks.

## Exact wire and programming-tool candidates

[Alpha Wire 3057](https://www.alphawire.com/en/products/wire/hook-up-wire/premium/3057) is **16 AWG, 26/30 stranded tinned copper**, 300 V, UL1569 105°C, nominal insulation OD 2.3368 mm with ±0.0508 mm tolerance. Use 3057 BK005 (black), GR005 (green), RD005 (red) and BL005 (blue). The `/1` solid-wire family is not the specified harness wire. Order quantities above are cut conductors, not spool quantities. The same black/red codes are candidates for J3, subject to installed temperature and final cable length. Do not route them against the brake resistor or heatsink.

[Raspberry Pi Debug Probe](https://www.raspberrypi.com/documentation/microcontrollers/debug-probe.html) is a CMSIS-DAP SWD candidate for RP2040. Alternatively use BOOTSEL USB through J10 with the new UF2 and documented full 4 MiB readback procedure. A purpose-wired SWD fixture must connect SWDIO, SWCLK and ground at 3.3 V target logic levels; verify target power and reset wiring before attachment. It is not a direct plug onto these bare PCB pads. The previous STM32 ST-LINK setup is not a qualified programmer for this redesign.

[Total Phase Aardvark I2C/SPI Host Adapter](https://www.totalphase.com/products/aardvark-i2cspi/) is a concrete 3.3 V I2C tool candidate for U3, with a 100 kHz fixture profile. Its [manual](https://www.totalphase.com/support/articles/200468316-aardvark-i2c-spi-host-adapter-user-manual/) identifies pins 4 and 6 as controllable **+5 V target-power outputs**: leave both disconnected and target-power output OFF. Power this target through J1 as described in [pd-programming.md](pd-programming.md), connect ground first, isolate both U36 I2C paths with TP_PD_ISO, and check the actual pullups/levels before connection. Do not let the programmer supply the EEPROM rail or back-power another domain. Verify full readback with the existing programming checks. The candidate TI image exists; fixture use and board readback remain unperformed.

Tool identification does not validate a fixture. Source, cable, tool and harness candidates still need actual supplier allocation and physical acceptance. No purchase or supplier request has been made.
