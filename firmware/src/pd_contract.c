#include "pd_contract.h"
#include <string.h>
static uint32_t le32(const uint8_t *p) {
  return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}
pd1180_contract_t pd1180_decode_contract(const uint8_t mode[4], const uint8_t pdo[6],
  const uint8_t rdo[12], const uint8_t power[2], const uint8_t pd_status[4]) {
  const uint32_t p = le32(pdo), r = le32(rdo);
  pd1180_contract_t out = {0};
  /* Do not use POWER_STATUS bit1: the TRM's description contradicts
   * PD_STATUS.PresentPDRole. Use the unambiguous PD_STATUS bit6 instead. */
  if (memcmp(mode, "APP ", 4) || (power[0] & 13u) != 13u ||
      (pd_status[0] & 64u) || (p >> 30) != 0 || !(r >> 28) ||
      (r & ((1u << 27) | (1u << 26)))) return out;
  const uint32_t mv = ((p >> 10) & 1023u) * 50u;
  const uint32_t offered = (p & 1023u) * 10u;
  const uint32_t operating = ((r >> 10) & 1023u) * 10u;
  const uint32_t maximum = (r & 1023u) * 10u;
  if (mv != 48000u || offered != 5000u || operating != 5000u || maximum != 5000u) return out;
  out.valid = true; out.mv = (uint16_t)mv; out.ma = (uint16_t)operating;
  return out;
}
