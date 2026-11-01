#pragma once
#include <stdbool.h>
#include <stdint.h>

/* TI SLOSE79B, DDV only. Target: mode 1, MSB first, 1 MHz, CS high >=2 us.
 * ENABLE must be held LOW externally during configuration. No OTP writes. */
typedef bool (*drv8462_frame_fn)(void *, const uint8_t tx[2], uint8_t rx[2]);
typedef struct {
  drv8462_frame_fn frame;
  void *context;
  bool configured;
  bool enabled;
  uint8_t torque;
} drv8462_t;
typedef struct { uint8_t fault, diag1, diag2, diag3; bool valid; } drv8462_status_t;
#define DRV8462_BENCH_RMS_MA 800u
bool drv8462_read(drv8462_t *, uint8_t address, uint8_t *value);
bool drv8462_status(drv8462_t *, drv8462_status_t *);
bool drv8462_configure(drv8462_t *, uint16_t rms_ma, bool enable_pin_low);
bool drv8462_set_current(drv8462_t *, uint16_t rms_ma);
bool drv8462_enable(drv8462_t *, bool enable);
bool drv8462_verify(drv8462_t *);
void drv8462_invalidate(drv8462_t *);
