#include "control.h"
#include "power_domain.h"
#include "pd_contract.h"
#include "board_pins.h"
#include "telemetry.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

static pd1180_inputs_t valid_inputs(void) {
  return (pd1180_inputs_t){
    .pd_app_mode = true, .epr_contract = true, .contract_mv = 48000, .contract_ma = 5000,
    .motor_power_good = true, .vmotor_in_range = true, .watchdog_healthy = true,
    .configuration_verified = true, .sample_fresh = true, .driver_ready = true,
    .motion_wiring_verified = true, .temperature_valid = true, .temperature_deci_c = 250,
  };
}
static void ticks(pd1180_control_t *s, pd1180_inputs_t *i, unsigned n) {
  for (unsigned j=0;j<n;++j) pd1180_control_tick(s,i,10);
}
static void running(pd1180_control_t *s, pd1180_inputs_t *i) {
  *i=valid_inputs(); pd1180_control_reset(s);
  assert(pd1180_control_arm(s,i)); ticks(s,i,40); assert(s->mcu_run);
}
static void put32(uint8_t *p, uint32_t v) {
  for (unsigned n=0;n<4;++n) p[n]=(uint8_t)(v>>(8*n));
}
static void test_board_power_domain(void) {
  pd1180_board_power_t power = {0};
  assert(!pd1180_board_power_update(&power,0,0));
  assert(!pd1180_board_power_update(&power,3300,10));
  assert(!pd1180_board_power_update(&power,3300,29));
  assert(pd1180_board_power_update(&power,3300,30));
  assert(!pd1180_board_power_update(&power,2800,31));
  assert(!pd1180_board_power_update(&power,3300,32));
  assert(!pd1180_board_power_update(&power,3700,52));
  assert(!pd1180_board_power_update(&power,3300,UINT32_MAX-10));
  assert(pd1180_board_power_update(&power,3300,9));
}

int main(void) {
  test_board_power_domain();
  pd1180_control_t s; pd1180_inputs_t i=valid_inputs();
  pd1180_control_reset(&s); ticks(&s,&i,100);
  assert(!s.power_permit && !s.mcu_run); /* never auto-arm */
  assert(pd1180_control_arm(&s,&i)); ticks(&s,&i,9); assert(!s.power_permit);
  ticks(&s,&i,1); assert(s.power_permit && !s.mcu_run);
  ticks(&s,&i,18); assert(!s.mcu_run); ticks(&s,&i,1); assert(s.mcu_run);
  for (unsigned fault=0;fault<15;++fault) {
    running(&s,&i);
    switch(fault) {
      case 0:i.pd_fault=true;break; case 1:i.efuse_fault=true;break;
      case 2:i.motor_power_good=false;break; case 3:i.vmotor_in_range=false;break;
      case 4:i.watchdog_healthy=false;break; case 5:i.sample_fresh=false;break;
      case 6:i.driver_ready=false;break; case 7:i.motion_wiring_verified=false;break;
      case 8:i.configuration_verified=false;break; case 9:i.stop_active=true;break;
      case 10:i.contract_mv=50000;break; case 11:i.contract_ma=3000;break;
      case 12:i.epr_contract=false;break;
      case 13:i.temperature_valid=false;break; case 14:i.temperature_deci_c=700;break;
    }
    pd1180_control_tick(&s,&i,10);
    assert(!s.power_permit && !s.mcu_run && s.fault_latched);
    i=valid_inputs(); ticks(&s,&i,100); assert(!s.mcu_run);
    assert(!pd1180_control_arm(&s,&i));
    pd1180_control_disarm(&s); assert(pd1180_control_arm(&s,&i));
  }
  running(&s,&i); pd1180_control_tick(&s,&i,1000); assert(!s.mcu_run && s.fault_latched);
  pd1180_control_disarm(&s); assert(!s.power_permit && !s.mcu_run);
  i=valid_inputs(); i.motor_power_good=false; assert(pd1180_control_arm(&s,&i));
  ticks(&s,&i,120); assert(!s.power_permit && s.fault_latched);
  pd1180_control_disarm(&s);
  i=valid_inputs(); i.motion_wiring_verified=false; assert(!pd1180_control_arm(&s,&i));
  running(&s,&i); i.temperature_deci_c=650;
  pd1180_control_tick(&s,&i,10); assert(s.mcu_run && s.current_limit_permille==750);
  i.temperature_deci_c=700; pd1180_control_tick(&s,&i,10);
  assert(s.fault_latched && !s.mcu_run && s.current_limit_permille==0);
  pd1180_control_disarm(&s); i.temperature_deci_c=560;
  assert(!pd1180_control_arm(&s,&i)); i.temperature_deci_c=550;
  assert(pd1180_control_arm(&s,&i));
  assert(pd1180_tmp102_deci_c(0x1900)==250);
  assert(pd1180_tmp102_deci_c(0xf600)==-100);
  int32_t current=0;
  assert(pd1180_phase_current_ma(3011,2048,3300,&current) && current>7700 && current<7800);
  assert(pd1180_phase_current_ma(1085,2048,3300,&current) && current< -7700 && current> -7800);
  assert(!pd1180_phase_current_ma(4095,2048,3300,&current));
  assert(!pd1180_phase_current_ma(2048,2048,0,&current));
  uint16_t mv=0; assert(pd1180_ads1115_mv(20000,&mv) && mv==2500);
  assert(!pd1180_ads1115_mv(-1,&mv)); assert(!pd1180_ads1115_mv(32767,&mv));
  uint8_t mode[4]={'A','P','P',' '}, pdo[6]={0}, rdo[12]={0}, power[2]={13,0}, pd[4]={0};
  put32(pdo,(960u<<10)|500u); put32(rdo,(9u<<28)|(500u<<10)|500u);
  assert(pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  put32(pdo,(400u<<10)|500u); assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  put32(pdo,(960u<<10)|500u); put32(rdo,(9u<<28)|(300u<<10)|300u);
  assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  put32(rdo,(9u<<28)|(500u<<10)|500u|(1u<<26)); assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  put32(rdo,(9u<<28)|(500u<<10)|500u); pd[0]=64; assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  pd[0]=0; power[0]=0; assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  power[0]=13; mode[0]='P'; assert(!pd1180_decode_contract(mode,pdo,rdo,power,pd).valid);
  assert(PD1180_PIN_POWER_PERMIT.port=='B' && PD1180_PIN_POWER_PERMIT.bit==5 && PD1180_PIN_POWER_PERMIT.package_pin==44);
  assert(PD1180_PIN_PD_SCL.bit==6 && PD1180_PIN_PD_SDA.bit==7 && PD1180_PIN_VMOTOR_OK.bit==9);
  puts("PASS: manual arm, 15 fault cases and thermal/telemetry boundaries, latched stop, stale timing, fixed PDO/RDO decoder, package pins");
  return 0;
}
