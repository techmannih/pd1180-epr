#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef struct {
  bool ready;
  bool qualifying;
  uint32_t healthy_since;
} pd1180_board_power_t;

/* Rail is measured before the MCU OR, via the equal 10k divider on PB1. */
bool pd1180_board_power_update(pd1180_board_power_t *state, uint32_t rail_mv, uint32_t now);
