#include "brake_preflight.h"
#include <assert.h>
#include <stdio.h>
int main(void) {
  pd1180_brake_preflight_t s = {0};
  assert(!pd1180_brake_preflight_update(&s,false,false,true,1,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,60,48000,47900));
  for (unsigned n=0;n<100;n++)
    assert(!pd1180_brake_preflight_update(&s,true,false,true,60,48000,47900));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,120,48000,47900));
  assert(pd1180_brake_preflight_update(&s,true,false,true,180,48000,47900));
  assert(pd1180_brake_preflight_update(&s,true,true,true,240,52000,0));
  assert(!pd1180_brake_preflight_update(&s,false,true,true,300,52000,0));
  /* An open cable, stuck-on Q16, hot reverse leakage, shorted divider,
   * out-of-window rail or stale conversion must never enable the driver. */
  const uint32_t returns[] = {0, 21000, 60000};
  for (unsigned i=0;i<3;i++) for (unsigned n=0;n<10;n++)
    assert(!pd1180_brake_preflight_update(&s,true,false,true,400+60*n,48000,returns[i]));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1000,43000,43000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1060,51000,51000));
  assert(!pd1180_brake_preflight_update(&s,true,false,false,1120,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1180,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,false,1240,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1300,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1360,48000,48000));
  assert(pd1180_brake_preflight_update(&s,true,false,true,1420,48000,48000));
  puts("PASS: brake preflight open/stuck/leakage/stale faults, fresh sample count, brake switching and power-cycle invalidation");
}
