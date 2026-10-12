# External connections after interface cleanup

Use the [source/destination table](product-eco.md#retained-connection-inventory). CAN/RS485/RS232, DIN0/1, OUT0/1 and J7's VMOTOR export have been removed from both source and native copper. They were not justified by a defined remote product.

- **J1 POWER:** actual 48 V/5 A EPR source and cable require selection/qualification.
- **J10 DATA:** host/data cable for commissioning; no USB motion implementation is claimed.
- **J2 motor:** VHR-4N, four SVH-41T-P1.1 contacts, Alpha3057 16 AWG pigtails, four TE320559 splices to the ordered motor. [Assembly procedure](complete-assembly.md).
- **J3 brake:** retained safety function; VHR-2N/two SVH contacts and candidate resistor/terminal details in [brake integration](brake-integration.md). BRAKE_RETURN is not ground. Final cable length, heatsink, mounting and retention unresolved.
- **J7 interim control:** existing physical B20B-PHDSS footprint; only HOME/STOPL/STOPR on pins 1/2/3, STEP/DIR on 6/7, GND on 8 and ENABLE on 18 remain. Every other pin is NC. Do not populate a 20-wire harness. Final connector/mate/cable depends on the actual controller and limit devices, still unselected.

The J7 input stages expect nominal 24 V, not direct 3.3 V MCU signals. STEP/DIR reach the TMC5160 via Q22/Q23 and U8/U9. ENABLE and voltage/temperature/power inhibits remain intact. Commissioning firmware stays motion-locked. No extra product has been added merely to justify spare pins.

Stock, crimp tooling, contact retention, cable temperature rise and completed-harness acceptance remain distinct from a nominal connector rating or CAD pass.
