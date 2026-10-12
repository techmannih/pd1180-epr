#include "local_motion.h"
#include "tmc5160_config.h"
#include <assert.h>
#include <stdio.h>

static uint32_t regs[128], pending, now;
static unsigned velocity_writes;
static bool fail;
static bool frame(void *unused,const uint8_t tx[5],uint8_t rx[5]) {
  (void)unused;
  if (fail) return false;
  for(unsigned i=1;i<5;++i) rx[i]=(uint8_t)(pending>>(8u*(4u-i)));
  const unsigned a=tx[0]&127u;
  if (tx[0]&128u) {
    pending=regs[a]=((uint32_t)tx[1]<<24)|((uint32_t)tx[2]<<16)|((uint32_t)tx[3]<<8)|tx[4];
    if(a==0x27u) ++velocity_writes;
  } else pending=regs[a];
  return true;
}
static pd1180_local_motion_t m;
static pd1180_control_t c;
static pd1180_tmc_t d={.frame=frame};
static pd1180_inputs_t in={.pd_app_mode=true,.epr_contract=true,.contract_mv=48000,.contract_ma=5000,
  .configuration_verified=true,.motion_wiring_verified=true,.sample_fresh=true,.watchdog_healthy=true,
  .temperature_valid=true,.temperature_deci_c=250};
static void step(bool pressed,unsigned elapsed,bool qualified) {
  now+=elapsed; pd1180_local_motion_update(&m,&c,&in,&d,pressed,now,qualified);
}
static void release(void) {step(false,1,true); step(false,30,true);}
static void press(void) {step(true,1,true); step(true,30,true);}
static void ready(void) {
  d.configured=true; in.driver_ready=true; c.mcu_run=c.motor_commands_enabled=true;
}
int main(void) {
  step(true,100,true); step(true,100,true);
  assert(!c.armed && !velocity_writes); // A held button at startup cannot start.
  release(); step(true,1,true); step(false,5,true); step(true,5,true); step(true,29,true);
  assert(!c.armed); step(true,1,true);
  assert(c.armed && m.state==PD1180_MOTION_ARMING && !velocity_writes);
  step(true,200,true); assert(!velocity_writes); // No ramp until all control gates pass.
  ready(); step(true,1,true);
  assert(m.state==PD1180_MOTION_RUNNING && regs[0x27]==PD1180_BENCH_VMAX);
  release(); regs[0x22]=5000; press();
  assert(m.state==PD1180_MOTION_STOPPING && regs[0x27]==0 && c.mcu_run);
  step(true,20,true); assert(c.mcu_run); // Keep bridge enabled during deceleration.
  regs[0x22]=0; step(true,20,true);
  assert(!c.armed && !c.mcu_run && m.state==PD1180_MOTION_IDLE);
  step(true,1000,true); assert(!c.armed); // Holding STOP cannot restart.
  release(); press(); assert(c.armed); release(); press();
  assert(!c.armed && m.state==PD1180_MOTION_IDLE); // Cancel an incomplete arm.
  release(); press(); ready(); step(true,1,true);
  release(); regs[0x22]=1000; press(); step(true,3000,true);
  assert(c.fault_latched && !c.mcu_run && !d.configured);
  release(); press(); assert(!c.armed && !c.fault_latched); // Acknowledge only.
  release(); press(); ready(); fail=true; step(true,1,true);
  assert(c.fault_latched && !c.armed && !d.configured); // Lost command acknowledgement.
  fail=false; release(); press(); release(); press(); ready(); step(true,1,true);
  c.fault_latched=true; c.mcu_run=c.armed=false;
  step(true,1,true); release(); press(); assert(!c.armed);
  pd1180_local_motion_cancel(&m); pd1180_control_disarm(&c);
  step(true,100,true); assert(!c.armed); // Resume/reset requires release.
  release(); const unsigned before=velocity_writes;
  step(true,1,false); step(true,30,false);
  assert(!c.armed && velocity_writes==before); // Qualification is not button-bypassable.
  puts("PASS: local button debounce, release-before-start, motion gates, ramp stop, timeout, SPI failure and no automatic restart");
}
