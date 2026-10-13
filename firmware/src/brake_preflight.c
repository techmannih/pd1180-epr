#include "brake_preflight.h"

bool pd1180_brake_preflight_update(pd1180_brake_preflight_t *s,
  bool power_permit, bool running, bool fresh, uint32_t now, uint32_t sample_at,
  uint32_t bus_mv, uint32_t return_mv) {
  if (!power_permit) {
    *s = (pd1180_brake_preflight_t){0};
    return false;
  }
  if (s->faulted) return false;
  fresh = fresh && now - sample_at <= PD1180_BRAKE_SAMPLE_MAX_AGE_MS;
  const bool bus_valid = bus_mv >= 44000u && bus_mv <= 50400u;
  const bool follows_bus = return_mv >= bus_mv * 9u / 10u &&
    return_mv <= bus_mv * 11u / 10u;
  if (running) {
    /* Q16 intentionally pulls BRAKE_RETURN low above brake turn-on. Permit
     * only a bounded observation gap, measured from the last healthy ADC
     * conversion (never from a repeated poll). This is NOT an energy sink:
     * only the restricted unloaded profile may be qualified for this delay. */
    const bool braking_window = bus_mv > 50400u && bus_mv < 55000u &&
      now - s->last_healthy_at <= PD1180_BRAKE_BLANKING_MAX_MS;
    if (!s->ready || !fresh || (!(bus_valid && follows_bus) && !braking_window)) {
      s->ready = false;
      s->faulted = true;
      return false;
    }
    if (bus_valid && follows_bus) s->last_healthy_at = sample_at;
    return true;
  }
  /* Below the minimum hardware brake threshold, a connected resistor brings
   * BRAKE_RETURN close to VMOTOR. ±10% includes divider/ADC tolerances.
   * Open resistor + specified 2 mA hot clamp leakage is below 21 V with the
   * 9.91 kohm divider, so it cannot pass the 44 V minimum supply test. */
  if (!fresh || !bus_valid || !follows_bus) {
    s->consecutive_samples = 0;
    s->ready = false;
    return false;
  }
  if (!s->have_sample || sample_at != s->last_sample_at) {
    s->have_sample = true;
    s->last_sample_at = sample_at;
    s->last_healthy_at = sample_at;
    if (s->consecutive_samples < 3u) ++s->consecutive_samples;
  }
  s->ready = s->consecutive_samples >= 3u;
  return s->ready;
}
