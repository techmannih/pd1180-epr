#pragma once

#include <stdbool.h>
#include <stdint.h>

typedef struct {
  bool pd_app_mode;
  bool epr_contract;
  uint16_t contract_mv;
  uint16_t contract_ma;
  bool pd_fault;
  bool efuse_fault;
  bool motor_power_good;
  bool vmotor_in_range;
  bool watchdog_healthy;
} pd1180_inputs_t;

typedef struct {
  bool power_permit;
  bool mcu_run;
  bool motor_commands_enabled;
  uint32_t contract_stable_ms;
  uint32_t motor_stable_ms;
} pd1180_control_t;

void pd1180_control_reset(pd1180_control_t *state);
void pd1180_control_tick(pd1180_control_t *state, const pd1180_inputs_t *inputs, uint32_t elapsed_ms);
