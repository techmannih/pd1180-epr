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
  bool configuration_verified;
  bool sample_fresh;
  bool driver_ready;
  bool motion_wiring_verified;
  bool stop_active;
  bool temperature_valid;
  int16_t temperature_deci_c;
} pd1180_inputs_t;

typedef struct {
  bool power_permit;
  bool mcu_run;
  bool motor_commands_enabled;
  uint32_t contract_stable_ms;
  uint32_t motor_stable_ms;
  uint32_t power_start_ms;
  bool armed;
  bool fault_latched;
  uint16_t current_limit_permille;
} pd1180_control_t;

void pd1180_control_reset(pd1180_control_t *state);
void pd1180_control_tick(pd1180_control_t *state, const pd1180_inputs_t *inputs, uint32_t elapsed_ms);
bool pd1180_control_arm(pd1180_control_t *state, const pd1180_inputs_t *inputs);
void pd1180_control_disarm(pd1180_control_t *state);
