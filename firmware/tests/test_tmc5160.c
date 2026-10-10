#include "tmc5160.h"
#include "motor_service.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

typedef struct { uint32_t regs[128], pending; unsigned calls; bool fail, corrupt_echo; uint8_t corrupt_write_address; } fake_t;
static bool transfer(void *context,const uint8_t tx[5],uint8_t rx[5]) {
  fake_t *f=context; ++f->calls;
  if(f->fail)return false;
  rx[0]=0; for(unsigned i=1;i<5;++i)rx[i]=(uint8_t)(f->pending>>(8u*(4u-i)));
  const uint8_t addr=tx[0]&127u;
  const uint32_t value=((uint32_t)tx[1]<<24)|((uint32_t)tx[2]<<16)|((uint32_t)tx[3]<<8)|tx[4];
  if(tx[0]&128u) {
    assert(addr!=0x06); // OTP programming is never allowed by this driver.
    if(addr==1)f->regs[addr]&=~value; else f->regs[addr]=value;
    if(addr==0x09 || addr==0x0A) assert(!(f->regs[0x6C]&15u));
    f->pending=value^((f->corrupt_echo || (f->corrupt_write_address && addr==f->corrupt_write_address))?1u:0u);
  } else f->pending=f->regs[addr];
  return true;
}
int main(void) {
  fake_t f={0}; f.regs[4]=0x30000050;f.regs[1]=1;
  f.regs[0x09]=0x10606u; f.regs[0x0A]=0x200u;
  pd1180_tmc_t d={.frame=transfer,.context=&f};
  uint32_t value;
  assert(pd1180_tmc_read(&d,4,&value) && value==0x30000050 && f.calls==2);
  assert(pd1180_tmc_configure_stepdir(&d,180)); // Approx. 0.86 A RMS first tuning stage.
  assert(d.configured && !(f.regs[0x6C]&15u));
  assert(f.regs[0x09]==0x10C06u && f.regs[0x0A]==0x400u);
  assert(((f.regs[0x6C]>>24)&15u)==4 && !(f.regs[0x6C]&(3u<<30)));
  assert(((f.regs[0x10]>>8)&31u)==4 && f.regs[0x0B]==198);
  assert(pd1180_tmc_set_chopper(&d,true));
  assert(pd1180_tmc_set_current(&d,500) && d.irun==15);
  assert(!pd1180_tmc_set_current(&d,1001));
  pd1180_tmc_status_t status;
  for(unsigned bit=0;bit<3;++bit) {
    f.regs[1]=1u<<bit; assert(!pd1180_tmc_status(&d,&status) && !d.configured);
    assert(!pd1180_tmc_set_chopper(&d,true));f.regs[1]=0;
  }
  for(unsigned bit=0;bit<32;++bit) if((1u<<bit)&0x1E003000u) {
    f.regs[0x6F]=1u<<bit; assert(!pd1180_tmc_status(&d,&status));
  }
  f.regs[0x6F]=0;f.regs[4]=0xFFFFFFFF;assert(!pd1180_tmc_configure_stepdir(&d,180));
  f.regs[4]=0;assert(!pd1180_tmc_configure_stepdir(&d,180));
  f.regs[4]=0x30000040;assert(!pd1180_tmc_configure_stepdir(&d,180)); // Enabled bridge.
  f.regs[4]=0x30000010;assert(!pd1180_tmc_configure_stepdir(&d,180)); // Wrong mode.
  f.regs[4]=0x30000054;assert(!pd1180_tmc_configure_stepdir(&d,180)); // dcStep unexpectedly enabled.
  f.regs[4]=0x30000050;f.corrupt_echo=true;assert(!pd1180_tmc_configure_stepdir(&d,180));
  f.corrupt_echo=false;f.fail=true;assert(!pd1180_tmc_status(&d,&status) && !status.valid);
  f.fail=false;f.regs[1]=0;f.regs[0x6F]=0;f.regs[4]=0x30000050;
  pd1180_motor_service_t motor={.driver={.frame=transfer,.context=&f}};
  pd1180_control_t c={.armed=true,.power_permit=true,.current_limit_permille=1000};
  pd1180_inputs_t in={.motor_power_good=true,.vmotor_in_range=true};
  unsigned calls=f.calls;
  assert(!pd1180_motor_service(&motor,&c,&in,180) && f.calls==calls);
  in.configuration_verified=in.motion_wiring_verified=true;
  assert(pd1180_motor_service(&motor,&c,&in,180) && in.driver_ready);
  f.regs[1]=1;
  assert(!pd1180_motor_service(&motor,&c,&in,180) && !in.driver_ready);
  f.regs[1]=0;calls=f.calls;
  assert(!pd1180_motor_service(&motor,&c,&in,180) && f.calls==calls); // No automatic reconfigure after reset.
  c.armed=false;assert(!pd1180_motor_service(&motor,&c,&in,180));
  c.armed=true;assert(pd1180_motor_service(&motor,&c,&in,500));
  c.current_limit_permille=250;assert(pd1180_motor_service(&motor,&c,&in,500));
  assert(motor.driver.irun==3); // Thermal derating reaches actual current register.
  in.vmotor_in_range=false;assert(!pd1180_motor_service(&motor,&c,&in,500) && !in.driver_ready);
  for(unsigned levels=6;levels<=12;levels+=6) for(unsigned clocks=2;clocks<=4;clocks+=2) {
    fake_t defaults={0}; defaults.regs[4]=0x30000050;
    defaults.regs[0x09]=(1u<<16)|(levels<<8)|levels;
    defaults.regs[0x0A]=clocks<<8;
    pd1180_tmc_t chip={.frame=transfer,.context=&defaults};
    assert(pd1180_tmc_configure_stepdir(&chip,180));
    assert(defaults.regs[0x09]==0x10C06u && defaults.regs[0x0A]==0x400u);
    assert(!(defaults.regs[0x6C]&15u));
  }
  for(unsigned address=0x09;address<=0x0A;++address) {
    fake_t bad={0}; bad.regs[4]=0x30000050; bad.corrupt_write_address=(uint8_t)address;
    pd1180_tmc_t chip={.frame=transfer,.context=&bad};
    assert(!pd1180_tmc_configure_stepdir(&chip,180) && !chip.configured);
    assert(!(bad.regs[0x6C]&15u) && !pd1180_tmc_set_chopper(&chip,true));
  }
  puts("PASS: TMC explicit protection defaults, write failures, pipelined SPI, write echo, disabled initialization, mode checks, current limits and latched faults");
}
