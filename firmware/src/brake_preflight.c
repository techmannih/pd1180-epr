#include "brake_preflight.h"

bool pd1180_brake_preflight_update(pd1180_brake_preflight_t *s,
  bool power_permit, bool running, bool fresh, uint32_t now,
  uint32_t bus_sample_at, uint32_t sample_at,
  uint32_t bus_mv, uint32_t return_mv) {
  if (!power_permit) {
    *s = (pd1180_brake_preflight_t){0};
    return false;
  }
  if (s->faulted) return false;
  const uint32_t bus_age = now - bus_sample_at, return_age = now - sample_at;
  fresh = fresh && bus_age <= PD1180_BRAKE_SAMPLE_MAX_AGE_MS &&
    return_age <= PD1180_BRAKE_SAMPLE_MAX_AGE_MS;
  const uint32_t oldest_sample_at = bus_age > return_age ? bus_sample_at : sample_at;
  const bool new_pair = !s->have_sample ||
    (bus_sample_at != s->last_bus_sample_at && sample_at != s->last_sample_at);
  const bool bus_valid = bus_mv >= 44000u && bus_mv <= 50400u;
  const bool follows_bus = return_mv >= bus_mv * 9u / 10u &&
    return_mv <= bus_mv * 11u / 10u;
  if (running) {
    /* The muxed ADC can sample VMOTOR 40 ms before BRAKE_RETURN. Q16 may
     * turn on between those conversions: even a stored 48 V bus reading
     * can legitimately accompany a low return. Do not infer an open brake
     * from that single mixed-time observation. Allow one 100 ms retry window
     * from its first observation, enough for the next complete 60 ms scan
     * and 50 ms poll phase. Only a fresh, distinct healthy pair clears it.
     * Repeated polls or one refreshed channel cannot extend the deadline.
     * Stale/invalid ADC and out-of-range bus still fail at once.
     * This delay is not backup energy absorption or hardware qualification. */
    if (!s->ready || !fresh || bus_mv < 44000u || bus_mv >= 55000u ||
        (s->mismatch_pending && now - s->mismatch_since > PD1180_BRAKE_BLANKING_MAX_MS)) {
      s->ready = false;
      s->faulted = true;
      return false;
    }
    if (bus_valid && follows_bus && new_pair) {
      s->have_sample = true;
      s->last_bus_sample_at = bus_sample_at;
      s->last_sample_at = sample_at;
      s->last_healthy_at = oldest_sample_at;
      s->mismatch_pending = false;
    }
    if (!(bus_valid && follows_bus) && !s->mismatch_pending) {
      s->mismatch_pending = true;
      s->mismatch_since = now;
    }
    return true;
  }
  s->mismatch_pending = false;
  /* Below the minimum hardware brake threshold, a connected resistor brings
   * BRAKE_RETURN close to VMOTOR. ±10% includes divider/ADC tolerances.
   * Open resistor + specified 2 mA hot clamp leakage is below 21 V with the
   * 9.91 kohm divider, so it cannot pass the 44 V minimum supply test. */
  if (!fresh || !bus_valid || !follows_bus) {
    s->mismatch_pending = false;
    s->consecutive_samples = 0;
    s->ready = false;
    return false;
  }
  if (new_pair) {
    s->have_sample = true;
    s->last_bus_sample_at = bus_sample_at;
    s->last_sample_at = sample_at;
    s->last_healthy_at = oldest_sample_at;
    if (s->consecutive_samples < 3u) ++s->consecutive_samples;
  }
  s->ready = s->consecutive_samples >= 3u;
  return s->ready;
}
