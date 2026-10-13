#include "brake_preflight.h"
#include <assert.h>
#include <stdio.h>

static void qualify(pd1180_brake_preflight_t *s, uint32_t start) {
  assert(!pd1180_brake_preflight_update(s,false,false,true,start,start,48000,48000));
  assert(!pd1180_brake_preflight_update(s,true,false,true,start+60,start+60,48000,47900));
  for (unsigned n=0;n<100;n++)
    assert(!pd1180_brake_preflight_update(s,true,false,true,start+60,start+60,48000,47900));
  assert(!pd1180_brake_preflight_update(s,true,false,true,start+120,start+120,48000,47900));
  assert(pd1180_brake_preflight_update(s,true,false,true,start+180,start+180,48000,47900));
}

int main(void) {
  pd1180_brake_preflight_t s = {0};
  /* Startup rejects an open cable, stuck-on Q16, clamp leakage, divider fault,
   * invalid bus and stale conversion. Only distinct valid samples qualify. */
  const uint32_t returns[] = {0, 21000, 60000};
  for (unsigned i=0;i<3;i++) for (unsigned n=0;n<10;n++)
    assert(!pd1180_brake_preflight_update(&s,true,false,true,60*n,60*n,48000,returns[i]));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1000,1000,43000,43000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1060,1060,51000,51000));
  assert(!pd1180_brake_preflight_update(&s,true,false,false,1120,1120,48000,48000));
  assert(!pd1180_brake_preflight_update(&s,true,false,true,1180,1000,48000,48000));
  qualify(&s,0);
  assert(pd1180_brake_preflight_update(&s,true,true,true,240,240,48000,47900));
  assert(!pd1180_brake_preflight_update(&s,true,true,true,300,300,48000,0));
  assert(s.faulted && !s.ready);
  /* Reconnection or leaving RUN cannot clear a runtime fault. */
  for (unsigned n=0;n<10;n++)
    assert(!pd1180_brake_preflight_update(&s,true,false,true,360+60*n,360+60*n,48000,48000));
  qualify(&s,1000);
  assert(pd1180_brake_preflight_update(&s,true,true,true,1240,1240,48000,48000));

  /* Low return is expected while Q16 brakes. Repeated software polls must
   * never extend the observation gap from the last healthy conversion. */
  assert(pd1180_brake_preflight_update(&s,true,true,true,1300,1300,52000,0));
  assert(pd1180_brake_preflight_update(&s,true,true,true,1340,1300,52000,0));
  assert(!pd1180_brake_preflight_update(&s,true,true,true,1341,1300,52000,0));
  assert(s.faulted);
  qualify(&s,2000);
  assert(!pd1180_brake_preflight_update(&s,true,true,true,2281,2180,48000,48000));
  qualify(&s,3000);
  assert(!pd1180_brake_preflight_update(&s,true,true,false,3240,3240,48000,48000));
  qualify(&s,4000);
  assert(!pd1180_brake_preflight_update(&s,true,true,true,4240,4240,55000,0));
  qualify(&s,5000);
  assert(!pd1180_brake_preflight_update(&s,true,true,true,5240,5240,43000,43000));
  s = (pd1180_brake_preflight_t){0};
  assert(!pd1180_brake_preflight_update(&s,true,true,true,60,60,48000,48000));
  assert(s.faulted);

  /* Unsigned elapsed-time arithmetic remains correct across millis wrap. */
  qualify(&s,UINT32_MAX-200u);
  assert(pd1180_brake_preflight_update(&s,true,true,true,39,39,48000,48000));
  assert(pd1180_brake_preflight_update(&s,true,true,true,99,99,52000,0));
  assert(!pd1180_brake_preflight_update(&s,true,true,true,140,140,52000,0));
  puts("PASS: startup and runtime brake faults, stale samples, bounded braking observation gap, fault latch and timer wrap");
}
