#include "tmc5160_config.h"

/* ADI Rev. 1.18: external STEP/DIR, 16 microsteps + interpolation.
 * TOFF=0 keeps the chopper disabled throughout configuration. The waveform
 * parameters are a tuning starting point, not a qualified 5.5 A setup.
 * GLOBALSCALER=198 and IRUN=31 target approximately 5.5 A RMS at 33 mOhm. */
const tmc5160_register_t pd1180_tmc5160_boot_config[] = {
  {0x6Cu, PD1180_TMC_STEP_CHOPCONF & ~15u},
  {0x00u, PD1180_TMC_STEP_GCONF},
  {0x0Bu, PD1180_GLOBALSCALER},
  {0x11u, 10u},
  {0x6Du, 0u}, /* No automatic CoolStep current scaling before qualification. */
  {0x33u, 0u}, /* VDCMIN: dcStep disabled, matching grounded DCEN/DCIN. */
};
const size_t pd1180_tmc5160_boot_config_count =
  sizeof(pd1180_tmc5160_boot_config) / sizeof(pd1180_tmc5160_boot_config[0]);
