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

#define PD1180_TMC_RAMP_GCONF 0x00000000u
#define PD1180_TMC_RAMP_CHOPCONF 0x004100C5u
#define PD1180_TMC_SHORT_CONF ((1u << 16) | (12u << 8) | 6u)
#define PD1180_TMC_DRV_CONF (4u << 8)

/* ADI rev1.18 section 14: 12 MHz nominal internal clock, 200 steps/rev,
 * 256 microsteps. About 10 rpm and 10 rpm/s; clock tolerance is uncalibrated. */
#define PD1180_BENCH_VMAX 11930u
#define PD1180_BENCH_AMAX 130u
