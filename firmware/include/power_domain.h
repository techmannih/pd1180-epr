#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef struct {
  bool ready;
  bool qualifying;
  uint32_t healthy_since;
} pd1180_board_power_t;

/* U5 power-good is buffered into DATA-powered GP28. Never report it as ADC voltage. */
bool pd1180_board_power_update(pd1180_board_power_t *state, bool power_good, uint32_t now);
