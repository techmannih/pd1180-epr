#include "power_domain.h"

bool pd1180_board_power_update(pd1180_board_power_t *state, bool power_good, uint32_t now) {
  if (!power_good) {
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
