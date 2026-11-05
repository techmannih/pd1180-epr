#pragma once

#include <stdbool.h>
#include <stdint.h>

typedef struct {
  bool power_test_only; // Stationary commissioning profile: ENABLE always remains low.
  bool pd_app_mode;
  bool epr_contract;
  uint16_t contract_mv;
  uint16_t contract_ma;
  bool pd_power_good; // Fresh raw PD voltage + live 48 V/5 A contract/identity.
  bool pd_fault;
  bool efuse_fault;
  bool motor_power_good;
  bool vmotor_in_range;
  bool watchdog_healthy;
  bool configuration_verified;
  bool sample_fresh;
  bool driver_ready;
  bool brake_preflight_ok;
  bool motion_wiring_verified;
  bool stop_active;
  bool temperature_valid;
  int16_t temperature_deci_c;
} pd1180_inputs_t;

#define PD1180_STARTUP_TIMEOUT_MS 4000u
#define PD1180_POWER_TEST_TIMEOUT_MS 30000u

typedef struct {
  bool power_permit;
  bool mcu_run;
  bool motor_commands_enabled;
  uint32_t contract_stable_ms;
  uint32_t motor_stable_ms;
  uint32_t power_start_ms;
  uint32_t power_test_ms;
  bool power_test_ready;
  bool armed;
  bool fault_latched;
  uint16_t current_limit_permille;
} pd1180_control_t;

void pd1180_control_reset(pd1180_control_t *state);
void pd1180_control_tick(pd1180_control_t *state, const pd1180_inputs_t *inputs, uint32_t elapsed_ms);
bool pd1180_control_arm(pd1180_control_t *state, const pd1180_inputs_t *inputs);
void pd1180_control_disarm(pd1180_control_t *state);
