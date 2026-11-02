#include "drv8462.h"

static bool transfer(drv8462_t *d, uint8_t command, uint8_t data, uint8_t *value) {
  uint8_t tx[2]={command,data}, rx[2]={0};
  if (!d || !d->frame || !d->frame(d->context,tx,rx) || (rx[0]&0xc0u)!=0xc0u) {
    if(d) drv8462_invalidate(d);
    return false;
  }
  *value=rx[1]; return true;
}
void drv8462_invalidate(drv8462_t *d) { d->configured=false; d->enabled=false; }
bool drv8462_read(drv8462_t *d, uint8_t reg, uint8_t *value) {
  if(reg>0x3fu || !value) return false;
  return transfer(d,0x40u|reg,0,value);
}
static bool write(drv8462_t *d, uint8_t reg, uint8_t value) {
  uint8_t ignored; return transfer(d,reg,value,&ignored);
}
static bool matches(drv8462_t *d, uint8_t reg, uint8_t expected) {
  uint8_t value;
  if (!drv8462_read(d,reg,&value) || value!=expected) { drv8462_invalidate(d); return false; }
  return true;
}
static bool checked_write(drv8462_t *d, uint8_t reg, uint8_t value) {
  return write(d,reg,value) && matches(d,reg,value);
}
bool drv8462_status(drv8462_t *d, drv8462_status_t *s) {
  *s=(drv8462_status_t){0};
  s->valid=drv8462_read(d,0,&s->fault) && drv8462_read(d,1,&s->diag1) &&
    drv8462_read(d,2,&s->diag2) && drv8462_read(d,3,&s->diag3);
  if(!s->valid || s->fault || s->diag1 || (s->diag2&0x60u)) {
    drv8462_invalidate(d); return false;
  }
  return true;
}
static bool torque_code(uint16_t rms_ma, uint8_t *code) {
  if(rms_ma<50u || rms_ma>DRV8462_BENCH_RMS_MA) return false;
  /* I_FS=10 A*(TRQ_DAC+1)/256 at nominal 3.3 V/0.33 V/A.
   * Floor requested current so quantization never raises the requested value.
   * This is nominal; device/reference tolerances still require bench measurement. */
  const uint32_t steps=(uint32_t)rms_ma*362u/10000u;
  if(!steps || steps>256u) return false;
  *code=(uint8_t)(steps-1u); return true;
}
bool drv8462_set_current(drv8462_t *d, uint16_t rms_ma) {
  uint8_t code;
  if(!d->configured || !torque_code(rms_ma,&code)) { drv8462_invalidate(d); return false; }
  if(!checked_write(d,0x0e,code) || !checked_write(d,0x0d,code)) return false;
  d->torque=code; return true;
}
bool drv8462_configure(drv8462_t *d, uint16_t rms_ma, bool enable_pin_low) {
  uint8_t code;
  drv8462_invalidate(d);
  if(!enable_pin_low || !torque_code(rms_ma,&code)) return false;
  /* Explicit unlock; disable outputs before clearing the startup latch.
   * Latched OCP/OTSD, overtemperature warning reporting enabled. */
  if(!checked_write(d,0x06,0x39) || !checked_write(d,0x04,0x0e) ||
     !write(d,0x06,0xb9) || !matches(d,0x06,0x39) ||
     !checked_write(d,0x05,0x06) || /* STEP/DIR pins, 1/16 microsteps */
     !checked_write(d,0x0c,0x90) || /* latched open-load, rising STEP, no interpolation */
     !checked_write(d,0x0f,0x20) || /* no automatic standstill current change */
     !checked_write(d,0x10,0x10) || /* external VREF tied to DVDD */
     !checked_write(d,0x0e,code) || !checked_write(d,0x0d,code)) return false;
  drv8462_status_t status;
  if(!drv8462_status(d,&status)) return false;
  d->torque=code; d->configured=true; return true;
}
bool drv8462_verify(drv8462_t *d) {
  drv8462_status_t status;
  return d->configured && drv8462_status(d,&status) &&
    matches(d,0x04,d->enabled?0x8e:0x0e) && matches(d,0x05,0x06) &&
    matches(d,0x06,0x39) && matches(d,0x0c,0x90) && matches(d,0x0f,0x20) &&
    matches(d,0x10,0x10) && matches(d,0x0e,d->torque) && matches(d,0x0d,d->torque);
}
bool drv8462_enable(drv8462_t *d, bool enabled) {
  if(!d->configured || !checked_write(d,0x04,enabled?0x8e:0x0e)) return false;
  d->enabled=enabled; return true;
}
