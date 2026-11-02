#pragma once
#include <stdbool.h>
#include <stdint.h>

/* INA237 on raw PD_VBUS, separate from the ADS1115 VMOTOR/brake scan. */
typedef struct {
  bool (*read)(void *, uint8_t, uint16_t *);
  bool (*write)(void *, uint8_t, uint16_t);
  void *context;
} pd1180_voltage_bus_t;
typedef struct {
  bool configured, pending, valid;
  uint32_t triggered_at, sampled_at, millivolts;
} pd1180_pd_voltage_t;
void pd1180_pd_voltage_poll(pd1180_pd_voltage_t *, const pd1180_voltage_bus_t *, uint32_t now);
bool pd1180_pd_voltage_fresh(const pd1180_pd_voltage_t *, uint32_t now);
bool pd1180_pd_voltage_in_range(const pd1180_pd_voltage_t *, uint32_t now);
