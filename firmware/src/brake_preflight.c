#include "brake_preflight.h"

bool pd1180_brake_preflight_update(pd1180_brake_preflight_t *s,
  bool power_permit, bool running, bool fresh, uint32_t sample_at,
  uint32_t bus_mv, uint32_t return_mv) {
  if (!power_permit) {
    *s = (pd1180_brake_preflight_t){0};
    return false;
  }
  /* Q16 intentionally pulls its drain low during braking. Do not mistake that
   * for an open resistor after RUN; every new power cycle requires rechecking. */
  if (running) return s->ready;
  /* Below the minimum hardware brake threshold, a connected resistor brings
   * BRAKE_RETURN close to VMOTOR. ±10% includes divider/ADC tolerances.
   * Open resistor + specified 2 mA hot clamp leakage is below 21 V with the
   * 9.91 kohm divider, so it cannot pass the 44 V minimum supply test. */
  if (!fresh || bus_mv < 44000u || bus_mv > 50400u ||
      return_mv < bus_mv * 9u / 10u || return_mv > bus_mv * 11u / 10u) {
    s->consecutive_samples = 0;
    s->ready = false;
    return false;
  }
  if (!s->have_sample || sample_at != s->last_sample_at) {
    s->have_sample = true;
    s->last_sample_at = sample_at;
    if (s->consecutive_samples < 3u) ++s->consecutive_samples;
  }
  s->ready = s->consecutive_samples >= 3u;
  return s->ready;
}
