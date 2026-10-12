#pragma once
#include "control.h"
#include "tmc5160.h"

typedef enum { PD1180_MOTION_IDLE, PD1180_MOTION_ARMING, PD1180_MOTION_RUNNING,
  PD1180_MOTION_STOPPING, PD1180_MOTION_FAULT } pd1180_motion_state_t;
typedef struct {
  pd1180_motion_state_t state;
  bool initialized, candidate_pressed, stable_pressed, release_seen;
  uint32_t changed_at, stop_at, velocity_poll_at;
} pd1180_local_motion_t;

/* Release, then press: start; next press: controlled stop. A fault needs a
 * separate acknowledgement press followed by another release/press to start.
 * Caller applies control outputs immediately after this nonblocking service. */
void pd1180_local_motion_update(pd1180_local_motion_t *motion, pd1180_control_t *control,
  pd1180_inputs_t *inputs, pd1180_tmc_t *driver, bool pressed, uint32_t now,
  bool hardware_qualified);
void pd1180_local_motion_cancel(pd1180_local_motion_t *motion);
