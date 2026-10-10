#include "control.h"
#include "telemetry.h"

#define CONTRACT_STABLE_REQUIRED_MS 100u
#define MOTOR_STABLE_REQUIRED_MS 200u
#define REQUIRED_CONTRACT_MV 48000u
#define REQUIRED_CONTRACT_MA 5000u

static uint32_t saturating_add(uint32_t value, uint32_t increment, uint32_t limit) {
  if (value >= limit || increment >= limit - value) return limit;
  return value + increment;
}

void pd1180_control_reset(pd1180_control_t *state) {
  *state = (pd1180_control_t){0};
}

void pd1180_control_disarm(pd1180_control_t *state) {
  pd1180_control_reset(state);
}

static bool safe_contract(const pd1180_inputs_t *in) {
  return in->pd_app_mode && in->epr_contract && in->contract_mv == REQUIRED_CONTRACT_MV &&
    in->contract_ma == REQUIRED_CONTRACT_MA && in->configuration_verified && in->sample_fresh &&
    in->motion_wiring_verified && !in->pd_fault && !in->efuse_fault &&
    in->watchdog_healthy && !in->stop_active && in->temperature_valid &&
    in->temperature_deci_c >= -400 && in->temperature_deci_c < 700;
}

bool pd1180_control_arm(pd1180_control_t *state, const pd1180_inputs_t *inputs) {
  if (!safe_contract(inputs) || inputs->temperature_deci_c > 550 || state->fault_latched) return false;
  state->armed = true;
  return true;
}

void pd1180_control_tick(pd1180_control_t *state, const pd1180_inputs_t *inputs, uint32_t elapsed_ms) {
  const bool contract_valid = safe_contract(inputs) && elapsed_ms > 0 && elapsed_ms <= 20u;

  if (!contract_valid || !state->armed) {
    if (state->armed) state->fault_latched = true;
    state->armed = false;
    state->contract_stable_ms = 0;
    state->motor_stable_ms = 0;
    state->power_start_ms = 0;
    state->power_permit = false;
    state->mcu_run = false;
    state->motor_commands_enabled = false;
    state->current_limit_permille = 0;
    return;
  }

  state->contract_stable_ms = saturating_add(state->contract_stable_ms, elapsed_ms, CONTRACT_STABLE_REQUIRED_MS);
  state->current_limit_permille = pd1180_thermal_limit_permille(inputs->temperature_deci_c);
  state->power_permit = state->contract_stable_ms >= CONTRACT_STABLE_REQUIRED_MS;
  if (state->power_permit && !state->mcu_run) {
    state->power_start_ms = saturating_add(state->power_start_ms, elapsed_ms, 1000u);
    if (state->power_start_ms >= 1000u) {
      pd1180_control_reset(state);
      state->fault_latched = true;
      return;
    }
  }

  const bool motor_valid = state->power_permit && inputs->motor_power_good && inputs->vmotor_in_range && inputs->driver_ready;
  if (!motor_valid) {
    if (state->mcu_run) {
      state->fault_latched = true;
      state->armed = false;
      state->power_permit = false;
    }
    state->motor_stable_ms = 0;
    state->mcu_run = false;
    state->motor_commands_enabled = false;
    return;
  }

  state->motor_stable_ms = saturating_add(state->motor_stable_ms, elapsed_ms, MOTOR_STABLE_REQUIRED_MS);
  state->mcu_run = state->motor_stable_ms >= MOTOR_STABLE_REQUIRED_MS;
  state->motor_commands_enabled = state->mcu_run;
}
