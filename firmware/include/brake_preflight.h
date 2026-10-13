#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef struct {
  uint32_t last_sample_at;
  uint32_t last_healthy_at;
  uint8_t consecutive_samples;
  bool have_sample;
  bool ready;
  bool faulted;
} pd1180_brake_preflight_t;

/* Voltage-based continuity surveillance, not brake-current or resistance
 * measurement. A runtime fault stays latched until motor power is removed. */
#define PD1180_BRAKE_SAMPLE_MAX_AGE_MS 100u
#define PD1180_BRAKE_BLANKING_MAX_MS 100u
bool pd1180_brake_preflight_update(pd1180_brake_preflight_t *state,
  bool power_permit, bool running, bool fresh, uint32_t now, uint32_t sample_at,
  uint32_t bus_mv, uint32_t return_mv);
