#pragma once
#include <stdbool.h>
#include <stdint.h>

typedef struct { bool valid; uint16_t mv, ma; } pd1180_contract_t;
/* TI SLVUCR7: MODE 03h, ACTIVE_PDO 34h, ACTIVE_RDO 35h,
 * POWER_STATUS 3Fh, PD_STATUS 40h. Arrays exclude the I2C count byte.
 * Only the reviewed fixed 48 V/5 A contract is accepted; AVS is rejected. */
pd1180_contract_t pd1180_decode_contract(const uint8_t mode[4], const uint8_t pdo[6],
  const uint8_t rdo[12], const uint8_t power[2], const uint8_t pd_status[4]);
