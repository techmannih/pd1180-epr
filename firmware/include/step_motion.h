#pragma once
#include <stdbool.h>
#include <stdint.h>
/* Target calls tick from a 20 us timer. Lease must be renewed by the main
 * safety loop, not an interrupt. Missing the lease stops pulses without catch-up. */
typedef struct { uint32_t last_us, lease_us, phase, speed_millihz, ramp_remainder; bool high, active, requested; } step_motion_t;
#define STEP_MOTION_MAX_MILLIHZ 533333u /* 200 steps/rev *16 *10 RPM /60 */
void step_motion_stop(step_motion_t *);
bool step_motion_tick(step_motion_t *, uint32_t now_us, bool hardware_ok);
void step_motion_renew(step_motion_t *, uint32_t now_us, bool run);
