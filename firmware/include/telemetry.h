#pragma once
#include <stdbool.h>
#include <stdint.h>

/* Normal-mode TMP102, ADS1115 +/-4.096 V, INA240A1 with a 5 mOhm shunt.
 * ADC conversion uses measured VDDA; calibration and bandwidth remain board tests.
 */
int16_t pd1180_tmp102_deci_c(uint16_t register_value);
bool pd1180_phase_current_ma(uint16_t adc_code, uint16_t zero_code,
                             uint16_t vdda_mv, int32_t *current_ma);
bool pd1180_ads1115_mv(int16_t code, uint16_t *millivolts);
uint16_t pd1180_thermal_limit_permille(int16_t temperature_deci_c);
