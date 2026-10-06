#include "board_pins.h"
#include "control.h"
#include "tmc5160_config.h"

#include <stdio.h>

int main(void) {
  pd1180_control_t control;
  pd1180_control_reset(&control);
  const pd1180_inputs_t inputs = {
    .pd_app_mode = true,
    .epr_contract = true,
    .contract_mv = 48000,
    .contract_ma = 5000,
    .motor_power_good = true,
    .vmotor_in_range = true,
    .watchdog_healthy = true,
  };
  for (unsigned elapsed = 0; elapsed < 350; elapsed += 10) pd1180_control_tick(&control, &inputs, 10);
  printf("permit=%u run=%u tmc_registers=%zu mcu_run_pin=P%c%u\n",
    control.power_permit, control.mcu_run, pd1180_tmc5160_boot_config_count,
    PIN_MCU_RUN.port, PIN_MCU_RUN.bit);
  return control.motor_commands_enabled ? 0 : 1;
}
