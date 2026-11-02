#include "pd_voltage.h"

/* TI SBOSA20A: bus-only single shot, 1052 us, one sample. INA237 has
 * MANUFACTURER_ID but no documented DEVICE_ID register; do not probe 0x3F.
 * 16-bit VBUS at 0x05 is unsigned, with a 3.125 mV LSB. */
#define BUS_SINGLE_SHOT 0x1A00u

void pd1180_pd_voltage_poll(pd1180_pd_voltage_t *s, const pd1180_voltage_bus_t *bus, uint32_t now) {
  uint16_t config, status, raw;
  if (!s || !bus || !bus->read || !bus->write) { if (s) *s=(pd1180_pd_voltage_t){0}; return; }
  if (!s->configured) {
    if (!bus->read(bus->context,0x3E,&raw) || raw!=0x5449u ||
        !bus->write(bus->context,0x00,0) || !bus->read(bus->context,0x00,&config) || config!=0)
      goto failed;
    s->configured=true;
  }
  if (!s->pending) {
    if (s->valid && now-s->sampled_at<20u) return;
    /* Starting a new conversion clears CNVRF. A readable old VBUS register
     * cannot renew freshness without a newly completed conversion. */
    if (!bus->write(bus->context,0x01,BUS_SINGLE_SHOT)) goto failed;
    s->pending=true; s->triggered_at=now;
    return;
  }
  if (now-s->triggered_at>20u) goto failed;
  if (now-s->triggered_at<2u) return;
  if (!bus->read(bus->context,0x00,&config) || config!=0 ||
      !bus->read(bus->context,0x01,&config) || config!=BUS_SINGLE_SHOT ||
      !bus->read(bus->context,0x0B,&status) || !(status&1u)) goto failed;
  if (!(status&2u)) return;
  if (!bus->read(bus->context,0x05,&raw)) goto failed;
  s->millivolts=(uint32_t)raw*25u/8u;
  if (s->millivolts>85000u) goto failed;
  s->sampled_at=now; s->valid=true; s->pending=false;
  return;
failed:
  *s=(pd1180_pd_voltage_t){0};
}

bool pd1180_pd_voltage_fresh(const pd1180_pd_voltage_t *s, uint32_t now) {
  return s && s->valid && now-s->sampled_at<=100u;
}
bool pd1180_pd_voltage_in_range(const pd1180_pd_voltage_t *s, uint32_t now) {
  /* Engineering operating window, matching the existing VMOTOR interlock.
   * This does not certify USB-PD accuracy or replace the hardware OVP. */
  return pd1180_pd_voltage_fresh(s,now) && s->millivolts>=44000u && s->millivolts<=51000u;
}
