#include "control.h"

#include <assert.h>

static pd1180_inputs_t valid_inputs(void) {
  return (pd1180_inputs_t){
    .pd_app_mode = true, .epr_contract = true,
    .contract_mv = 48000, .contract_ma = 5000,
    .motor_power_good = true, .vmotor_in_range = true,
    .watchdog_healthy = true,
  };
}

int main(void) {
  pd1180_control_t state;
  pd1180_inputs_t inputs = valid_inputs();
  pd1180_control_reset(&state);
  assert(!state.power_permit && !state.mcu_run);

  pd1180_control_tick(&state, &inputs, 99);
  assert(!state.power_permit);
  pd1180_control_tick(&state, &inputs, 1);
  assert(state.power_permit && !state.mcu_run);
  pd1180_control_tick(&state, &inputs, 198);
  assert(!state.mcu_run);
  pd1180_control_tick(&state, &inputs, 1);
  assert(state.mcu_run && state.motor_commands_enabled);

  inputs.efuse_fault = true;
  pd1180_control_tick(&state, &inputs, 1);
  assert(!state.power_permit && !state.mcu_run && !state.motor_commands_enabled);

  inputs = valid_inputs();
  inputs.contract_mv = 36000;
  pd1180_control_tick(&state, &inputs, 1000);
  assert(!state.power_permit);
  return 0;
}
