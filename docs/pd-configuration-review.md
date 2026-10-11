# TPS26750 programming review — 2026-10-11

The TI full-flash image has not been generated. The application tool is open at version 2.0.1, awaiting explicit user acceptance of its license. No configuration, programming or powered result is being reported as complete.

## Unused TPD4S480 SBU channels

Current frozen source: J1 pins 10/16 connect to U1 C_SBU1/C_SBU2 pins 1/2 through PD_SBU1_CONN/PD_SBU2_CONN. U1 system-side SBU2/SBU1 pins 14/15 are explicitly no-connect. This is a power-only port; USB DATA uses J10.

TI's [TPS26750/TPD4S480 investigation](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1624778/tps26750-tps26750-event-92-is-not-activating-at-correct-time-in-epr-negotiation) describes a matching unused-SBU arrangement with repeated false faults. TI recommended disconnecting the unused connector-side SBU channels and grounding the system-side SBU channels; the customer reported that this resolved the false faults. This is evidence of a credible design risk, not a measurement on this PCB.

Proposed correction: no-connect J1 pins 10/16 and U1 pins 1/2, connect U1 pins 14/15 to GND, and remove the two now-unused SBU nets. Preserve all other pins, values, component positions and schematic layout. Refresh affected copper, source/native parity, ERC/DRC, frozen-schematic comparison of unaffected records and the manufacturing export. **Not applied:** the user explicitly froze the schematic; this narrow exception is awaiting approval.

Do not waive this finding by disabling the FLT response in the PD configuration. Keep it in the order hold until the correction or a documented manufacturer-approved alternative has been verified.

## EPR control and fault response

The same TI discussion confirms that a sink's GPIO2 EPR event can follow the source's PS_RDY message. Do not interpret that pin alone as proof that the bus voltage is safe. The [TPD4S480 datasheet](https://www.ti.com/lit/ds/symlink/tpd4s480.pdf), section 6.3.4, describes the voltage-triggered EPR adapter as well as EPR_EN control. Section 7.2.2.5 recommends forcing a detach on FLT to remove VBUS after a short-to-VBUS event.

Review GPIO0 fault input/event and GPIO2 EPR_EN against the **TPS26750** tool device, not TPS26750A. Save the exact event/polarity assignments in the TI project; exercise FLT, cold boot, transitions and cable removal in the first article. Do not invent an event code or consider a 48 V status report alone a completed protection test.
