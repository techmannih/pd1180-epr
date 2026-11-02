#include "step_motion.h"
void step_motion_stop(step_motion_t *s) { *s=(step_motion_t){0}; }
void step_motion_renew(step_motion_t *s, uint32_t now, bool run) {
  if(!s->active && !run) return;
  if(!s->active) { s->last_us=now; s->phase=0; s->speed_millihz=0; s->high=false; s->ramp_remainder=0; }
  s->active=true; s->lease_us=now; s->requested=run;
}
bool step_motion_tick(step_motion_t *s, uint32_t now, bool hardware_ok) {
  const uint32_t dt=now-s->last_us;
  if(!s->active || !hardware_ok || now-s->lease_us>=25000u || dt>100u) {
    step_motion_stop(s); return false;
  }
  s->last_us=now;
  /* One-second acceleration to 10 RPM. No backlog of pulses after a delayed ISR. */
  s->ramp_remainder+=dt*STEP_MOTION_MAX_MILLIHZ;
  uint32_t increment=s->ramp_remainder/1000000u;
  s->ramp_remainder%=1000000u;
  if(s->requested) {
    s->speed_millihz+=increment;
    if(s->speed_millihz>STEP_MOTION_MAX_MILLIHZ) s->speed_millihz=STEP_MOTION_MAX_MILLIHZ;
  } else if(s->speed_millihz<=increment) { step_motion_stop(s); return false; }
  else s->speed_millihz-=increment;
  s->phase+=s->speed_millihz*dt;
  if(s->high) { s->high=false; return false; }
  if(s->phase>=1000000000u) { s->phase-=1000000000u; s->high=true; }
  return s->high;
}
