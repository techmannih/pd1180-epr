#include "control.h"

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

void pd1180_control_tick(pd1180_control_t *state, const pd1180_inputs_t *inputs, uint32_t elapsed_ms) {
  const bool contract_valid = inputs->pd_app_mode && inputs->epr_contract &&
    inputs->contract_mv >= REQUIRED_CONTRACT_MV && inputs->contract_ma >= REQUIRED_CONTRACT_MA &&
    !inputs->pd_fault && !inputs->efuse_fault && inputs->watchdog_healthy;

  if (!contract_valid) {
    state->contract_stable_ms = 0;
    state->motor_stable_ms = 0;
    state->power_permit = false;
    state->mcu_run = false;
    state->motor_commands_enabled = false;
    return;
  }

  state->contract_stable_ms = saturating_add(state->contract_stable_ms, elapsed_ms, CONTRACT_STABLE_REQUIRED_MS);
  state->power_permit = state->contract_stable_ms >= CONTRACT_STABLE_REQUIRED_MS;

  const bool motor_valid = state->power_permit && inputs->motor_power_good && inputs->vmotor_in_range;
  if (!motor_valid) {
    state->motor_stable_ms = 0;
    state->mcu_run = false;
    state->motor_commands_enabled = false;
    return;
  }

  state->motor_stable_ms = saturating_add(state->motor_stable_ms, elapsed_ms, MOTOR_STABLE_REQUIRED_MS);
  state->mcu_run = state->motor_stable_ms >= MOTOR_STABLE_REQUIRED_MS;
  state->motor_commands_enabled = state->mcu_run;
}
