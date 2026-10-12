#include "local_motion.h"
#include "tmc5160_config.h"

void pd1180_local_motion_cancel(pd1180_local_motion_t *m) {
  *m=(pd1180_local_motion_t){0};
}
static bool button_event(pd1180_local_motion_t *m, bool pressed, uint32_t now) {
  if (!m->initialized) {
    m->initialized=true; m->stable_pressed=true;
    m->candidate_pressed=pressed; m->changed_at=now;
  }
  if (pressed!=m->candidate_pressed) {
    m->candidate_pressed=pressed; m->changed_at=now;
  }
  if (now-m->changed_at<30u || m->stable_pressed==pressed) return false;
  m->stable_pressed=pressed;
  if (!pressed) {m->release_seen=true; return false;}
  const bool event=m->release_seen;
  m->release_seen=false;
  return event;
}
static void fault(pd1180_local_motion_t *m, pd1180_control_t *c, pd1180_tmc_t *d) {
  pd1180_control_disarm(c); c->fault_latched=true;
  pd1180_tmc_invalidate(d); m->state=PD1180_MOTION_FAULT;
}
void pd1180_local_motion_update(pd1180_local_motion_t *m, pd1180_control_t *c,
  pd1180_inputs_t *in, pd1180_tmc_t *d, bool pressed, uint32_t now, bool qualified) {
  const bool event=button_event(m,pressed,now);
  if (!qualified) {pd1180_control_disarm(c); m->state=PD1180_MOTION_IDLE; return;}
  if (c->fault_latched) m->state=PD1180_MOTION_FAULT;
  if (m->state==PD1180_MOTION_FAULT) {
    if (event) {pd1180_control_disarm(c); m->state=PD1180_MOTION_IDLE;}
    return;
  }
  if (m->state!=PD1180_MOTION_IDLE && !c->armed) {
    pd1180_local_motion_cancel(m); return;
  }
  if (event) {
    if (m->state==PD1180_MOTION_IDLE) {
      if (pd1180_control_arm(c,in)) m->state=PD1180_MOTION_ARMING;
    } else if (m->state==PD1180_MOTION_ARMING) {
      pd1180_control_disarm(c); m->state=PD1180_MOTION_IDLE;
    } else if (m->state==PD1180_MOTION_RUNNING) {
      if (!pd1180_tmc_velocity(d,0)) {fault(m,c,d); return;}
      m->stop_at=m->velocity_poll_at=now; m->state=PD1180_MOTION_STOPPING;
    }
  }
  if (m->state==PD1180_MOTION_ARMING && c->motor_commands_enabled && in->driver_ready) {
    if (!pd1180_tmc_velocity(d,PD1180_BENCH_VMAX)) {fault(m,c,d); return;}
    m->state=PD1180_MOTION_RUNNING;
  }
  if (m->state==PD1180_MOTION_STOPPING) {
    if (now-m->stop_at>=3000u) {fault(m,c,d); return;}
    if (now-m->velocity_poll_at>=20u) {
      int32_t velocity;
      m->velocity_poll_at=now;
      if (!pd1180_tmc_actual_velocity(d,&velocity)) {fault(m,c,d); return;}
      if (!velocity) {pd1180_control_disarm(c); m->state=PD1180_MOTION_IDLE;}
    }
  }
}
