#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef bool (*pd1180_spi_frame_fn)(void *context, const uint8_t tx[5], uint8_t rx[5]);
typedef struct {
  pd1180_spi_frame_fn frame;
  void *context;
  bool configured;
  uint32_t chopconf;
  uint8_t irun;
} pd1180_tmc_t;
typedef struct {
  uint32_t ioin, gstat, drv_status;
  bool valid, fault;
} pd1180_tmc_status_t;

bool pd1180_tmc_read(pd1180_tmc_t *driver, uint8_t address, uint32_t *value);
bool pd1180_tmc_write(pd1180_tmc_t *driver, uint8_t address, uint32_t value);
bool pd1180_tmc_status(pd1180_tmc_t *driver, pd1180_tmc_status_t *status);
/* Caller must hold DRV_ENN high and set SD_MODE high before initialization.
 * No OTP writes. Bridge timing/short thresholds keep manufacturer defaults
 * pending scope qualification. This function leaves TOFF=0 (bridge disabled). */
bool pd1180_tmc_configure_stepdir(pd1180_tmc_t *driver, uint16_t current_permille);
bool pd1180_tmc_set_current(pd1180_tmc_t *driver, uint16_t current_permille);
bool pd1180_tmc_set_chopper(pd1180_tmc_t *driver, bool enabled);
void pd1180_tmc_invalidate(pd1180_tmc_t *driver);
