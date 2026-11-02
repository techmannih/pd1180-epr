#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "drv8462.h"
#include "as5600.h"
#include "step_motion.h"
typedef struct {uint8_t reg[64]; bool dead, ff, drop_write; unsigned frames;} fake_t;
static bool frame(void *ctx,const uint8_t tx[2],uint8_t rx[2]) {
  fake_t *f=ctx; f->frames++;
  if(f->dead) return false;
  if(f->ff) {rx[0]=rx[1]=255;return true;}
  assert(!(tx[0]&0x80)); uint8_t a=tx[0]&63;
  rx[0]=0xc0|(f->reg[0]&63);rx[1]=f->reg[a];
  if(!(tx[0]&0x40) && !f->drop_write) {
    f->reg[a]=tx[1];
    if(a==6 && (tx[1]&128)) {f->reg[0]=0;f->reg[6]&=127;f->reg[3]|=4;}
  }
  return true;
}
static void drivers(void) {
  fake_t f={0};drv8462_t d={.frame=frame,.context=&f};
  assert(!drv8462_configure(&d,800,false));assert(f.frames==0);
  assert(!drv8462_configure(&d,801,true));assert(f.frames==0);
  f.reg[0]=0x20; // startup UVLO latch may be explicitly cleared while ENABLE low.
  assert(drv8462_configure(&d,800,true));assert(d.configured && !d.enabled);
  assert(f.reg[0x0e]==27 && f.reg[0x0d]==27); // 0.773 A RMS nominal, floored.
  assert(f.reg[4]==0x0e && f.reg[5]==6 && f.reg[6]==0x39 && f.reg[0xc]==0x90);
  assert(drv8462_enable(&d,true));assert(drv8462_verify(&d));
  f.reg[5]=0x16; // corrupt SPI_STEP must never pass as pin-driven motion.
  assert(!drv8462_verify(&d) && !d.configured);
  assert(drv8462_configure(&d,800,true));f.drop_write=true;
  assert(!drv8462_set_current(&d,400) && !d.configured);
  f.drop_write=false;assert(drv8462_configure(&d,800,true));f.reg[0]=8;
  assert(!drv8462_verify(&d));assert(!d.configured);
  f.reg[0]=0;f.dead=true;assert(!drv8462_configure(&d,800,true));
  f.dead=false;f.ff=true;assert(!drv8462_configure(&d,800,true));
}
static bool encoder(void *ctx,uint8_t reg,uint8_t *data,uint8_t count) {
  assert(reg==0x0b && count==3);memcpy(data,ctx,3);return true;
}
static void encoders(void) {
  as5600_sample_t s;uint8_t bytes[]={0x20,0x0a,0xbc};
  assert(as5600_sample(encoder,bytes,&s) && s.angle==0xabc);
  for(unsigned n=0;n<3;n++) {bytes[0]=(uint8_t[]){0,0x30,0x28}[n];assert(!as5600_sample(encoder,bytes,&s) && !s.valid);}
  bytes[0]=0x20;bytes[1]=0xfa;assert(!as5600_sample(encoder,bytes,&s));
  assert(!as5600_sample(NULL,NULL,&s));
}
static void steps(void) {
  step_motion_t s={0};uint32_t now=0xfffffff0u;unsigned pulses=0;
  step_motion_renew(&s,now,true);
  for(unsigned n=0;n<100000;n++) {
    now+=20;
    if(n%500==0)step_motion_renew(&s,now,true);
    if(step_motion_tick(&s,now,true)) pulses++;
  }
  assert(s.speed_millihz==STEP_MOTION_MAX_MILLIHZ);assert(pulses>790 && pulses<810);
  step_motion_renew(&s,now,false);
  for(unsigned n=0;n<51000;n++){now+=20;if(n%500==0)step_motion_renew(&s,now,false);step_motion_tick(&s,now,true);}
  assert(!s.active && !s.high && !s.speed_millihz);
  step_motion_renew(&s,now,true);assert(!step_motion_tick(&s,now+20,false));assert(!s.active);
  step_motion_renew(&s,now,true);
  for(unsigned n=1;n<=1250;n++)step_motion_tick(&s,now+n*20,true);
  assert(!s.active); // expired 25 ms main-loop lease
  step_motion_renew(&s,now,true);assert(!step_motion_tick(&s,now+101,true) && !s.active);
}
int main(void){drivers();encoders();steps();puts("DRV8462 transport/readback/faults, AS5600 validity, timed STEP/stop/lease/wraparound: PASS");}
