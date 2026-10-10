#include "motor_service.h"

void pd1180_motor_service_reset(pd1180_motor_service_t *m) {
  pd1180_tmc_invalidate(&m->driver);
  m->status=(pd1180_tmc_status_t){0};
  m->attempted_configuration=false;
  m->applied_current_permille=0;
}
bool pd1180_motor_service(pd1180_motor_service_t *m, const pd1180_control_t *c,
                         pd1180_inputs_t *in, uint16_t requested) {
  in->driver_ready=false;
  if (!c->armed || !c->power_permit || !in->motor_power_good || !in->vmotor_in_range ||
      !in->configuration_verified || !in->motion_wiring_verified || !requested || requested>1000u) {
    pd1180_motor_service_reset(m);
    return false;
  }
  const uint16_t limit=(uint32_t)requested*c->current_limit_permille/1000u;
  if (limit<32u) return false;
  if (!m->driver.configured) {
    if (m->attempted_configuration) return false;
    m->attempted_configuration=true;
    if (!pd1180_tmc_configure_stepdir(&m->driver,limit)) return false;
    m->applied_current_permille=limit;
    if (!pd1180_tmc_set_chopper(&m->driver,true)) return false;
  }
  if (!pd1180_tmc_status(&m->driver,&m->status)) return false;
  // Verify the external step mode and its dcStep-disable pins continuously.
  if ((m->status.ioin&0x4Cu)!=0x40u) {
    pd1180_tmc_invalidate(&m->driver); return false;
  }
  if (limit!=m->applied_current_permille) {
    if (!pd1180_tmc_set_current(&m->driver,limit)) return false;
    m->applied_current_permille=limit;
  }
  in->driver_ready=true;
  return true;
}
