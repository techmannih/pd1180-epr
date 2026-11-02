#pragma once
#include <stdbool.h>
#include <stdint.h>
typedef bool (*as5600_read_fn)(void *, uint8_t reg, uint8_t *bytes, uint8_t count);
typedef struct { uint16_t angle; uint8_t status; bool valid; } as5600_sample_t;
/* Read-only: never burn OTP, and reject missing/weak/strong magnets. */
bool as5600_sample(as5600_read_fn read, void *context, as5600_sample_t *sample);
