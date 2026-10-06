#include "tmc5160_config.h"

/* Register addresses and bit layouts follow the TMC5160A Rev. 1.18 data sheet.
 * GLOBALSCALER=198 with CS=31 and 33 mOhm shunts targets about 5.5 A RMS.
 * The bridge remains disabled until the safety state machine asserts MCU_RUN. */
const tmc5160_register_t pd1180_tmc5160_boot_config[] = {
  {0x00u, 0x00000008u}, /* GCONF: shaft=0, diag defaults, multistep_filt=1 */
  {0x0Bu, PD1180_GLOBALSCALER},
  {0x10u, (6u << 16) | (PD1180_IRUN << 8) | PD1180_IHOLD}, /* IHOLD_IRUN */
  {0x11u, 10u},        /* TPOWERDOWN */
  {0x20u, 0u},         /* RAMPMODE: positioning */
  {0x6Cu, 0x000101D5u}, /* CHOPCONF conservative spreadCycle baseline */
  {0x70u, 0xC40C001Eu}, /* PWMCONF: documented reset-style baseline */
};

const size_t pd1180_tmc5160_boot_config_count =
  sizeof(pd1180_tmc5160_boot_config) / sizeof(pd1180_tmc5160_boot_config[0]);
