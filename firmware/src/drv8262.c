#include "drv8262.h"

/* sin(0..pi/2) at 1/16 full-step intervals, Q15. Integer-only ISR. */
static const uint16_t sine[17] = {
  0,3212,6393,9512,12540,15447,18205,20788,23170,
  25330,27246,28899,30274,31357,32138,32610,32767
};
static int32_t signed_sine(uint8_t phase) {
  phase &= 63u;
  const uint8_t quadrant=phase/16u, offset=phase%16u;
  const int32_t value=sine[(quadrant&1u)?16u-offset:offset];
  return quadrant>=2u?-value:value;
}
bool drv8262_output(uint8_t phase,uint16_t rms_ma,bool enabled,drv8262_output_t *out) {
  if(!out || rms_ma<50u || rms_ma>DRV8262_BENCH_RMS_MA) return false;
  const int32_t samples[2]={signed_sine(phase+16u),signed_sine(phase)};
  uint16_t code[2]; bool positive[2], drive[2];
  for(unsigned n=0;n<2;n++) {
    positive[n]=samples[n]>=0;
    const uint32_t magnitude=(uint32_t)(positive[n]?samples[n]:-samples[n]);
    /* Ipeak=sqrt(2)*Irms, VREF=Ipeak*212uA/A*1500ohm.
     * MCP4822 gain=2 gives nominal 1mV/code. Floor both conversions.
     * Gain/reference/mirror tolerances require real phase-current calibration. */
    const uint32_t peak_ma=(uint32_t)rms_ma*1414u/1000u;
    code[n]=(uint16_t)((uint64_t)peak_ma*31800u*magnitude/(100000u*32767ull));
    /* TI specifies current regulation only for VREF >=50mV. At smaller
     * setpoints brake this winding rather than claiming valid regulation. */
    drive[n]=enabled && code[n]>=50u;
    if(!drive[n]) code[n]=0;
  }
  *out=(drv8262_output_t){
    .word_a=(uint16_t)(0x1000u|code[0]),
    .word_b=(uint16_t)(0x9000u|code[1]),
    .phase_a=positive[0],.phase_b=positive[1],
    .enable_a=drive[0],.enable_b=drive[1]
  };
  return true;
}
void drv8262_invalidate(drv8262_t *d) {
  if(d) {d->configured=false; d->enabled=false; d->microstep=0;}
}
static bool apply(drv8262_t *d) {
  drv8262_output_t out;
  if(!d || !d->apply || !drv8262_output(d->microstep,d->rms_ma,d->enabled,&out) || !d->apply(d->context,&out)) {
    drv8262_invalidate(d); return false;
  }
  return true;
}
bool drv8262_configure(drv8262_t *d,uint16_t rms_ma,bool sleep_asserted) {
  drv8262_invalidate(d);
  if(!d || !sleep_asserted || rms_ma<50u || rms_ma>DRV8262_BENCH_RMS_MA) return false;
  d->rms_ma=rms_ma;
  if(!apply(d)) return false;
  d->configured=true; return true;
}
bool drv8262_set_current(drv8262_t *d,uint16_t rms_ma) {
  if(!d || !d->configured || rms_ma<50u || rms_ma>DRV8262_BENCH_RMS_MA) {drv8262_invalidate(d);return false;}
  d->rms_ma=rms_ma; return apply(d);
}
bool drv8262_enable(drv8262_t *d,bool enabled) {
  if(!d || !d->configured) return false;
  d->enabled=enabled; return apply(d);
}
bool drv8262_step(drv8262_t *d,bool reverse) {
  if(!d || !d->configured || !d->enabled) return false;
  d->microstep=(uint8_t)((d->microstep+(reverse?63u:1u))&63u);
  return apply(d);
}
