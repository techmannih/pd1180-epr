#include "pd_voltage.h"
#include <assert.h>
#include <stdio.h>

typedef struct { uint16_t config, adc, raw, id, status; bool fail, ready; unsigned triggers; } fake_t;
static bool read_reg(void *p, uint8_t reg, uint16_t *v) {
  fake_t *f=p; if(f->fail) return false;
  switch(reg) {
    case 0:*v=f->config;break; case 1:*v=f->adc;break;
    case 0x05:*v=f->raw;break; case 0x3E:*v=f->id;break;
    case 0x0B:*v=f->status|(f->ready?2u:0u); f->ready=false;break;
    default:assert(0);return false;
  } return true;
}
static bool write_reg(void *p,uint8_t reg,uint16_t v) {
  fake_t *f=p;if(f->fail)return false;
  if(reg==0)f->config=v;
  else if(reg==1) {f->adc=v; f->ready=false; ++f->triggers;}
  else assert(0);
  return true;
}
int main(void) {
  fake_t f={.raw=15360,.id=0x5449,.status=1};
  pd1180_voltage_bus_t bus={read_reg,write_reg,&f};
  pd1180_pd_voltage_t s={0};
  assert(!pd1180_pd_voltage_fresh(&s,0));
  pd1180_pd_voltage_poll(&s,&bus,0); assert(s.pending && !s.valid && f.triggers==1);
  pd1180_pd_voltage_poll(&s,&bus,10); assert(!s.valid); // Old readable raw is insufficient.
  f.ready=true;pd1180_pd_voltage_poll(&s,&bus,20);
  assert(s.valid && s.millivolts==48000 && pd1180_pd_voltage_in_range(&s,20));
  assert(pd1180_pd_voltage_fresh(&s,120) && !pd1180_pd_voltage_fresh(&s,121));
  pd1180_pd_voltage_poll(&s,&bus,40); assert(f.triggers==2);
  pd1180_pd_voltage_poll(&s,&bus,60); assert(s.sampled_at==20);
  pd1180_pd_voltage_poll(&s,&bus,61); assert(!s.valid && !s.configured); // Stalled converter.
  pd1180_pd_voltage_poll(&s,&bus,70);f.adc=0xFB68;
  pd1180_pd_voltage_poll(&s,&bus,80);assert(!s.valid); // Sensor reset/configuration drift.
  pd1180_pd_voltage_poll(&s,&bus,90);f.ready=true; f.status=0;
  pd1180_pd_voltage_poll(&s,&bus,100);assert(!s.valid); // Trim checksum failure.
  f.status=1;f.id=0xFFFF;pd1180_pd_voltage_poll(&s,&bus,110);assert(!s.configured);
  f.id=0x5449;
  const uint16_t raw[]={1600,6400,8960,14080,16320,17600,27200,65535};
  const uint32_t mv[]={5000,20000,28000,44000,51000,55000,85000,0};
  for(unsigned i=0;i<sizeof(raw)/sizeof(*raw);++i) {
    s=(pd1180_pd_voltage_t){0};f.raw=raw[i];
    pd1180_pd_voltage_poll(&s,&bus,UINT32_MAX-4u); f.ready=true;
    pd1180_pd_voltage_poll(&s,&bus,5);
    assert(s.millivolts==mv[i]);
    assert(s.valid==(i!=7));
    assert(pd1180_pd_voltage_in_range(&s,5)==(i==3||i==4));
    assert(!pd1180_pd_voltage_fresh(&s,106));
  }
  s=(pd1180_pd_voltage_t){.valid=true,.millivolts=48000}; f.fail=true;
  pd1180_pd_voltage_poll(&s,&bus,1);assert(!s.valid && s.millivolts==0);
  puts("PASS: INA237 conversion freshness, I2C loss, reset, trim failure, scaling, range and timer wrap");
}
