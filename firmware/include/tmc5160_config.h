#pragma once

#include <stddef.h>
#include <stdint.h>

typedef struct { uint8_t address; uint32_t value; } tmc5160_register_t;

extern const tmc5160_register_t pd1180_tmc5160_boot_config[];
extern const size_t pd1180_tmc5160_boot_config_count;

#define PD1180_PHASE_CURRENT_RMS_MA 5500u
#define PD1180_RSENSE_MILLIOHM 33u
#define PD1180_GLOBALSCALER 198u
#define PD1180_IRUN 31u
#define PD1180_IHOLD 8u

#define PD1180_TMC_STEP_GCONF 0x00000068u
#define PD1180_TMC_STEP_CHOPCONF 0x144100C5u
