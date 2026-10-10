#pragma once
#include "control.h"
#include "tmc5160.h"

typedef struct {
  pd1180_tmc_t driver;
  pd1180_tmc_status_t status;
  bool attempted_configuration;
  uint16_t applied_current_permille;
} pd1180_motor_service_t;
/* Call with DRV_ENN held high until control.mcu_run is asserted. Any false
 * return clears driver_ready; the caller must run the safety tick and apply
 * its outputs before performing unrelated work. No automatic fault retry. */
bool pd1180_motor_service(pd1180_motor_service_t *motor, const pd1180_control_t *control,
                         pd1180_inputs_t *inputs, uint16_t requested_current_permille);
void pd1180_motor_service_reset(pd1180_motor_service_t *motor);
