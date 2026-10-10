#include "power_domain.h"

bool pd1180_board_power_update(pd1180_board_power_t *state, uint32_t rail_mv, uint32_t now) {
  if (rail_mv < 2900u || rail_mv > 3600u) {
    state->ready = false;
    state->qualifying = false;
  } else if (!state->qualifying) {
    state->healthy_since = now;
    state->qualifying = true;
  } else if (now - state->healthy_since >= 20u) {
    state->ready = true;
  }
  return state->ready;
}
