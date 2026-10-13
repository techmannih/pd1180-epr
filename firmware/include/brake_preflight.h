#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef struct {
  uint32_t last_sample_at;
  uint8_t consecutive_samples;
  bool have_sample;
  bool ready;
} pd1180_brake_preflight_t;

/* Startup continuity only, not a runtime brake-current measurement. */
bool pd1180_brake_preflight_update(pd1180_brake_preflight_t *state,
  bool power_permit, bool running, bool fresh, uint32_t sample_at,
  uint32_t bus_mv, uint32_t return_mv);
