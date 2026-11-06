#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "drv8262.h"
#include "as5600.h"
#include "step_motion.h"
typedef struct {drv8262_output_t last; bool fail; unsigned calls;} fake_t;
static bool apply(void *ctx,const drv8262_output_t *out) {
  fake_t *f=ctx;f->calls++;f->last=*out;return !f->fail;
}
static void drivers(void) {
  fake_t f={0};drv8262_t d={.apply=apply,.context=&f};
  assert(!drv8262_configure(&d,800,false) && f.calls==0);
  assert(!drv8262_configure(&d,801,true) && f.calls==0);
  assert(drv8262_configure(&d,800,true) && d.configured && !d.enabled);
  assert(!f.last.enable_a && !f.last.enable_b && f.last.word_a==0x1000 && f.last.word_b==0x9000);
  assert(drv8262_enable(&d,true));
  // 800mA RMS => 1131mA peak => 359mV nominal. B is zero at phase 0.
  assert((f.last.word_a&4095)==359 && (f.last.word_b&4095)==0);
  assert(f.last.enable_a && !f.last.enable_b && f.last.phase_a);
  for(unsigned k=1;k<=64;k++) {
    assert(drv8262_step(&d,false));
    const unsigned a=f.last.word_a&4095,b=f.last.word_b&4095;
    assert(a<=359 && b<=359);
    assert(f.last.enable_a==(a>=50) && f.last.enable_b==(b>=50));
    // Constant current-vector magnitude, allowing DAC quantization and the
    // specified <50mV zero-crossing blanking, not a mirror of the sine table.
    const unsigned square=a*a+b*b;
    assert(square>126000 && square<=130000);
    if(k==16) assert(!f.last.enable_a && f.last.phase_b && b==359);
    if(k==32) assert(!f.last.phase_a && a==359 && !f.last.enable_b);
    if(k==48) assert(!f.last.enable_a && !f.last.phase_b && b==359);
  }
  assert(d.microstep==0);assert(drv8262_step(&d,true) && d.microstep==63);
  assert(drv8262_set_current(&d,400));assert((f.last.word_a&4095)<300);
  assert(drv8262_enable(&d,false));assert(!f.last.enable_a && !f.last.enable_b);
  assert(!drv8262_step(&d,false));
  f.fail=true;assert(!drv8262_enable(&d,true) && !d.configured && !d.enabled);
  assert(!drv8262_configure(&d,800,true));
  f.fail=false;assert(drv8262_configure(&d,800,true));
  assert(!drv8262_set_current(&d,801) && !d.configured);
  assert(!drv8262_output(0,0,true,&f.last));
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
int main(void){drivers();encoders();steps();puts("DRV8262 current vector/limits/transport failures, AS5600 validity, timed STEP/stop/lease/wraparound: PASS");}
