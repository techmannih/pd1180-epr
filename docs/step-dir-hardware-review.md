# RP2040 / DRV8262 motion-control review

RP2040 generates 16-microstep PH/EN sequencing for U7 DRV8262DDVR. U42 MCP4822 supplies independent current references; this driver has no STEP/DIR indexer or SPI registers. The 20 µs scheduler, 25 ms main-loop lease and late-timer fault prevent catch-up motion after a stalled loop. RUN_SAFE independently gates nSLEEP; both phase enables have hardware pulldowns.

SW2 provides local START/STOP. Diagnostics never enable motion. The stationary power profile holds nSLEEP/phase enables low for its 30-second window. The bench profile requests at most 800 mA RMS, 10 rpm and a 10-second run followed by a one-second stop ramp. Faults, DATA loss, suspend and USB DISARM disable immediately; restarting requires acknowledgement and another button press.

The DAC has no readback. Software readiness means both current-reference commands were prepared; physical nFAULT, bus/brake/temperature telemetry and hardware gates remain independent. The first-article procedure measures both reference voltages, phase-current regulation, zero crossing, wake and stop timing. See [commissioning](commissioning.md) and [firmware](../firmware/README.md). These are software controls, not a certified emergency-stop function.
