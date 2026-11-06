#include "board_pins.h"
#include "control.h"
#include "drv8262.h"

#include <stdio.h>

int main(void) {
  pd1180_control_t control;
  pd1180_control_reset(&control);
  const pd1180_inputs_t inputs = {
    .pd_power_good = true, .pd_app_mode = true,
    .epr_contract = true,
    .contract_mv = 48000,
    .contract_ma = 5000,
    .motor_power_good = true,
    .vmotor_in_range = true,
    .watchdog_healthy = true,
    .configuration_verified = true, .sample_fresh = true, .driver_ready = true, .brake_preflight_ok = true, .motion_wiring_verified = true,
    .temperature_valid = true, .temperature_deci_c = 250,
  };
  if (!pd1180_control_arm(&control, &inputs)) return 1;
  for (unsigned elapsed = 0; elapsed < 350; elapsed += 10) pd1180_control_tick(&control, &inputs, 10);
  printf("permit=%u run=%u bench_rms_ma=%u mcu_run_gpio=%u\n",
    control.power_permit, control.mcu_run, DRV8262_BENCH_RMS_MA,
    PD1180_PIN_MCU_RUN.gpio);
  return control.motor_commands_enabled ? 0 : 1;
}
