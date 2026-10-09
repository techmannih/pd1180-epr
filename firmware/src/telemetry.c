#include "telemetry.h"
#include <stddef.h>

int16_t pd1180_tmp102_deci_c(uint16_t raw) {
  int32_t value = raw >> 4;
  if (value & 0x800) value -= 4096;
  return (int16_t)(value * 10 / 16);
}

bool pd1180_phase_current_ma(uint16_t code, uint16_t zero, uint16_t vdda_mv,
                             int32_t *current_ma) {
  if (current_ma == NULL || code < 10 || code > 4085 ||
      zero < 1800 || zero > 2300 || vdda_mv < 3000 || vdda_mv > 3600) return false;
  /* 20 V/V * 0.005 ohm = 100 mV/A. */
  *current_ma = ((int32_t)code - zero) * (int32_t)vdda_mv * 10 / 4095;
  return true;
}

bool pd1180_ads1115_mv(int16_t code, uint16_t *millivolts) {
  if (millivolts == NULL || code < 0 || code == INT16_MAX) return false;
  *millivolts = (uint16_t)((int32_t)code / 8);
  return true;
}

uint16_t pd1180_thermal_limit_permille(int16_t temperature) {
  if (temperature >= 700) return 0;
  if (temperature <= 600) return 1000;
  return (uint16_t)(1000 - (temperature - 600) * 5);
}
