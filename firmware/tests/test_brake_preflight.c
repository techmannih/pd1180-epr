#include "brake_preflight.h"
#include <assert.h>
#include <stdio.h>

static bool sample(pd1180_brake_preflight_t *s, bool power, bool running,
  bool valid, uint32_t now, uint32_t at, uint32_t bus, uint32_t ret) {
  return pd1180_brake_preflight_update(s,power,running,valid,now,at,at,bus,ret);
}

static void qualify(pd1180_brake_preflight_t *s, uint32_t start) {
  assert(!sample(s,false,false,true,start,start,48000,48000));
  assert(!sample(s,true,false,true,start+60,start+60,48000,47900));
  for (unsigned n=0;n<100;n++)
    assert(!sample(s,true,false,true,start+60,start+60,48000,47900));
  assert(!sample(s,true,false,true,start+120,start+120,48000,47900));
  assert(sample(s,true,false,true,start+180,start+180,48000,47900));
}

int main(void) {
  pd1180_brake_preflight_t s = {0};
  /* Startup rejects an open cable, stuck-on Q16, clamp leakage, divider fault,
   * invalid bus and stale conversion. Only distinct valid samples qualify. */
  const uint32_t returns[] = {0, 21000, 60000};
  for (unsigned i=0;i<3;i++) for (unsigned n=0;n<10;n++)
    assert(!sample(&s,true,false,true,60*n,60*n,48000,returns[i]));
  assert(!sample(&s,true,false,true,1000,1000,43000,43000));
  assert(!sample(&s,true,false,true,1060,1060,51000,51000));
  assert(!sample(&s,true,false,false,1120,1120,48000,48000));
  assert(!sample(&s,true,false,true,1180,1000,48000,48000));
  qualify(&s,0);
  assert(sample(&s,true,true,true,240,240,48000,47900));
  assert(sample(&s,true,true,true,300,300,48000,0));
  assert(sample(&s,true,true,true,400,400,48000,0));
  assert(!sample(&s,true,true,true,401,401,48000,0));
  assert(s.faulted && !s.ready);
  /* Reconnection or leaving RUN cannot clear a runtime fault. */
  for (unsigned n=0;n<10;n++)
    assert(!sample(&s,true,false,true,360+60*n,360+60*n,48000,48000));
  qualify(&s,1000);
  assert(sample(&s,true,true,true,1240,1240,48000,48000));

  /* Low return is expected while Q16 brakes. Repeated software polls must
   * never extend the deadline from the first mismatching observation. */
  assert(sample(&s,true,true,true,1300,1300,52000,0));
  assert(sample(&s,true,true,true,1340,1300,52000,0));
  assert(!sample(&s,true,true,true,1401,1400,52000,0));
  assert(s.faulted);
  qualify(&s,2000);
  assert(!sample(&s,true,true,true,2281,2180,48000,48000));
  qualify(&s,3000);
  assert(!sample(&s,true,true,false,3240,3240,48000,48000));
  qualify(&s,4000);
  assert(!sample(&s,true,true,true,4240,4240,55000,0));
  qualify(&s,5000);
  assert(!sample(&s,true,true,true,5240,5240,43000,43000));
  s = (pd1180_brake_preflight_t){0};
  assert(!sample(&s,true,true,true,60,60,48000,48000));
  assert(s.faulted);

  /* Unsigned elapsed-time arithmetic remains correct across millis wrap. */
  qualify(&s,UINT32_MAX-200u);
  assert(sample(&s,true,true,true,39,39,48000,48000));
  assert(sample(&s,true,true,true,99,99,52000,0));
  assert(!sample(&s,true,true,true,200,200,52000,0));
  /* Real ADC order is bus -> input current -> brake return, 20 ms per
   * channel. Q16 turns on after bus=48 V at 200, return=0 at 240.
   * The prior implementation immediately latched this normal transition. */
  qualify(&s,0);
  assert(pd1180_brake_preflight_update(&s,true,true,true,240,200,240,48000,0));
  assert(!s.faulted);
  assert(pd1180_brake_preflight_update(&s,true,true,true,260,260,240,52000,0));
  assert(pd1180_brake_preflight_update(&s,true,true,true,280,260,280,48000,47900));
  assert(s.last_healthy_at==260 && !s.faulted);
  /* A normal brake pulse entirely between bus conversions is also ambiguous. */
  assert(pd1180_brake_preflight_update(&s,true,true,true,320,320,300,48000,0));
  assert(pd1180_brake_preflight_update(&s,true,true,true,340,320,340,48000,48000));
  assert(s.last_healthy_at==320);
  /* Persistent open fails within the same bounded gap, even if ADC channels
   * keep updating. Low nominal bus cannot bypass this deadline. */
  assert(pd1180_brake_preflight_update(&s,true,true,true,380,380,360,48000,0));
  assert(pd1180_brake_preflight_update(&s,true,true,true,420,400,420,48000,0));
  assert(!pd1180_brake_preflight_update(&s,true,true,true,481,460,480,48000,0));
  assert(s.faulted);
  qualify(&s,1000);
  /* One stuck timestamp, fresh return, and repeated polls cannot count as
   * multiple healthy pairs or refresh the observation deadline. */
  assert(pd1180_brake_preflight_update(&s,true,true,true,1200,1180,1200,48000,48000));
  assert(s.last_healthy_at==1180);
  assert(pd1180_brake_preflight_update(&s,true,true,true,1280,1180,1280,48000,48000));
  assert(s.last_healthy_at==1180);
  assert(!pd1180_brake_preflight_update(&s,true,true,true,1281,1180,1281,48000,48000));
  qualify(&s,UINT32_MAX-200u);
  assert(pd1180_brake_preflight_update(&s,true,true,true,20,UINT32_MAX-19u,20,48000,0));
  assert(pd1180_brake_preflight_update(&s,true,true,true,40,20,40,48000,48000));
  assert(s.last_healthy_at==20);
  /* A normal stop followed by valid idle preflight must not carry a pending
   * retry deadline into a later RUN. A fault already latched stays latched. */
  qualify(&s,7000);
  assert(sample(&s,true,true,true,7240,7240,48000,0));
  assert(s.mismatch_pending);
  assert(sample(&s,true,false,true,7260,7260,48000,48000));
  assert(!s.mismatch_pending);
  assert(sample(&s,true,true,true,7360,7360,48000,48000));
  puts("PASS: startup and runtime brake faults, stale samples, bounded braking observation gap, fault latch and timer wrap");
}
