#include "tmc5160.h"
#include "tmc5160_config.h"
#include <string.h>

#define IOIN 0x04u
#define GSTAT 0x01u
#define CHOPCONF 0x6Cu
#define DRIVER_FAULT_MASK 0x1E003000u /* OT, OTPW, S2GA/B, S2VSA/B; not open-load */

static uint32_t payload(const uint8_t rx[5]) {
  return ((uint32_t)rx[1]<<24)|((uint32_t)rx[2]<<16)|((uint32_t)rx[3]<<8)|rx[4];
}
static bool frame(pd1180_tmc_t *d, uint8_t address, uint32_t value, uint8_t rx[5]) {
  const uint8_t tx[5]={address,(uint8_t)(value>>24),(uint8_t)(value>>16),(uint8_t)(value>>8),(uint8_t)value};
  memset(rx,0,5);
  return d && d->frame && d->frame(d->context,tx,rx);
}
bool pd1180_tmc_read(pd1180_tmc_t *d, uint8_t address, uint32_t *value) {
  uint8_t rx[5];
  if (!value || address>0x7Fu || !frame(d,address,0,rx) || !frame(d,address,0,rx)) return false;
  *value=payload(rx);
  return true;
}
bool pd1180_tmc_write(pd1180_tmc_t *d, uint8_t address, uint32_t value) {
  uint8_t rx[5];
  if (address>0x7Fu || !frame(d,address|0x80u,value,rx) || !frame(d,IOIN,0,rx)) return false;
  // The next datagram echoes the prior write, including write-only registers.
  // IFCNT is UART-only; it must not be used as an SPI acknowledgement.
  return payload(rx)==value;
}
void pd1180_tmc_invalidate(pd1180_tmc_t *d) { d->configured=false; d->chopconf=0; d->irun=0; }
bool pd1180_tmc_status(pd1180_tmc_t *d, pd1180_tmc_status_t *s) {
  *s=(pd1180_tmc_status_t){0};
  s->valid=pd1180_tmc_read(d,IOIN,&s->ioin) && (s->ioin>>24)==0x30u &&
    pd1180_tmc_read(d,GSTAT,&s->gstat) && pd1180_tmc_read(d,0x6Fu,&s->drv_status);
  s->fault=!s->valid || (s->gstat&7u) || (s->drv_status&DRIVER_FAULT_MASK);
  if (s->fault) pd1180_tmc_invalidate(d);
  return s->valid && !s->fault;
}
bool pd1180_tmc_set_current(pd1180_tmc_t *d, uint16_t permille) {
  if (!d->configured || !permille || permille>1000u) return false;
  const uint32_t scale=(32u*permille)/1000u;
  if (!scale) return false;
  const uint8_t irun=(uint8_t)(scale-1u), ihold=irun<PD1180_IHOLD?irun:PD1180_IHOLD;
  if (!pd1180_tmc_write(d,0x10u,(6u<<16)|((uint32_t)irun<<8)|ihold)) {
    pd1180_tmc_invalidate(d); return false;
  }
  d->irun=irun;
  return true;
}
bool pd1180_tmc_set_chopper(pd1180_tmc_t *d, bool enabled) {
  if (enabled && !d->configured) return false;
  const uint32_t value=enabled?PD1180_TMC_STEP_CHOPCONF:(PD1180_TMC_STEP_CHOPCONF&~15u);
  uint32_t actual;
  if (!pd1180_tmc_write(d,CHOPCONF,value) || !pd1180_tmc_read(d,CHOPCONF,&actual) || actual!=value) {
    pd1180_tmc_invalidate(d); return false;
  }
  d->chopconf=value;
  return true;
}
bool pd1180_tmc_configure_stepdir(pd1180_tmc_t *d, uint16_t permille) {
  pd1180_tmc_invalidate(d);
  uint32_t ioin, actual;
  if (!permille || permille>1000u || !pd1180_tmc_read(d,IOIN,&ioin) ||
      (ioin>>24)!=0x30u || (ioin&0x50u)!=0x50u || (ioin&0x0Cu)) return false;
  for (size_t i=0;i<pd1180_tmc5160_boot_config_count;++i) {
    const tmc5160_register_t reg=pd1180_tmc5160_boot_config[i];
    if (!pd1180_tmc_write(d,reg.address,reg.value)) return false;
  }
  if (!pd1180_tmc_read(d,CHOPCONF,&actual) || actual!=(PD1180_TMC_STEP_CHOPCONF&~15u) ||
      !pd1180_tmc_read(d,0x00u,&actual) || actual!=PD1180_TMC_STEP_GCONF ||
      !pd1180_tmc_write(d,GSTAT,7u)) return false;
  d->chopconf=PD1180_TMC_STEP_CHOPCONF&~15u;
  pd1180_tmc_status_t status;
  if (!pd1180_tmc_status(d,&status)) return false;
  d->configured=true;
  return pd1180_tmc_set_current(d,permille);
}
