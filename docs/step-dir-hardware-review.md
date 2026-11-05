# RP2040 / DRV8462 motion-control review

RP2040 generates STEP/DIR for U7 DRV8462DDVR and configures/checks its registers over SPI. The target uses a 20 µs timer and a command lease; a late timer or stalled main loop stops pulses, lowers enable and latches a fault. J7 and the former external command input are retired.

SW2 provides local START/STOP. The diagnostic image keeps motor power and motion inhibited. The explicit `power-test` profile enables only the stationary motor bus, with ENABLE/STEP low and a 30-second limit. The `bench-test` profile requests <=800 mA RMS, ramps to 10 rpm, runs for 10 seconds and then requests a one-second stop ramp. A second local press requests the same controlled stop. Faults, DATA loss, suspend and USB DISARM remove enable immediately; that response is distinct from a normal deceleration.

The hardware RUN_SAFE chain independently requires MCU_RUN, MOTOR_PG, VMOTOR_OK and TEMP_OK. The input eFuse and bus-powered brake remain active protection paths. Every boot starts disarmed; acknowledging a fault and starting again require separate actions. USB ARM does not start motion.

Target tests exercise startup timing, SPI-readiness freshness, pulse generation, the run/stop deadlines and fault handling. Follow [commissioning](commissioning.md) for board-bound profile builds and post-assembly measurements. The stop ramp is a software request whose physical response is measured during that procedure; it is not a certified emergency-stop function.
