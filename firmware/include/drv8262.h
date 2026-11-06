#pragma once
#include <stdbool.h>
#include <stdint.h>

/* TI SLVSFV5C DDV dual bridge, PH/EN. Microchip DS20002249B MCP4822.
 * RUN_SAFE independently controls nSLEEP; the target must wait >=1 ms after
 * wake before enabling EN1/EN2. apply sends both DAC words, pulses LDAC,
 * waits for settling and only then enables the requested phases.
 * The DAC has no readback: configured means commands prepared, not measured. */
typedef struct {
  uint16_t word_a, word_b;
  bool phase_a, phase_b, enable_a, enable_b;
} drv8262_output_t;
typedef bool (*drv8262_apply_fn)(void *, const drv8262_output_t *);
typedef struct {
  drv8262_apply_fn apply;
  void *context;
  uint16_t rms_ma;
  uint8_t microstep;
  bool configured, enabled;
} drv8262_t;
#define DRV8262_BENCH_RMS_MA 800u
#define DRV8262_MICROSTEPS 16u
bool drv8262_configure(drv8262_t *, uint16_t rms_ma, bool sleep_asserted);
bool drv8262_set_current(drv8262_t *, uint16_t rms_ma);
bool drv8262_enable(drv8262_t *, bool enabled);
bool drv8262_step(drv8262_t *, bool reverse);
void drv8262_invalidate(drv8262_t *);
bool drv8262_output(uint8_t microstep, uint16_t rms_ma, bool enabled, drv8262_output_t *);
