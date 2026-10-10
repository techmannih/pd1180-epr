#include "tmc5160_config.h"

/* ADI Rev. 1.18: external STEP/DIR, 16 microsteps + interpolation.
 * TOFF=0 keeps the chopper disabled throughout configuration. The waveform
 * parameters are a tuning starting point, not a qualified 5.5 A setup.
 * GLOBALSCALER=198 and IRUN=31 target approximately 5.5 A RMS at 33 mOhm. */
const tmc5160_register_t pd1180_tmc5160_boot_config[] = {
  {0x6Cu, PD1180_TMC_STEP_CHOPCONF & ~15u},
  {0x00u, PD1180_TMC_STEP_GCONF},
  /* Section 11.2: S2G_LEVEL >= 12 when regeneration can raise VS above 52 V.
   * S2VS=6, SHORTFILTER=1 and shortdelay=0 remain initial tuning values. */
  {0x09u, PD1180_TMC_SHORT_CONF},
  /* Make the four-clock dead-time baseline independent of OTP defaults.
   * Weak drive and gate timing still require bridge waveform qualification. */
  {0x0Au, PD1180_TMC_DRV_CONF},
  {0x0Bu, PD1180_GLOBALSCALER},
  {0x11u, 10u},
  {0x6Du, 0u}, /* No automatic CoolStep current scaling before qualification. */
  {0x33u, 0u}, /* VDCMIN: dcStep disabled, matching grounded DCEN/DCIN. */
};
const size_t pd1180_tmc5160_boot_config_count =
  sizeof(pd1180_tmc5160_boot_config) / sizeof(pd1180_tmc5160_boot_config[0]);
