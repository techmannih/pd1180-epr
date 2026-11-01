#pragma once

#include <stdint.h>

typedef struct { uint8_t gpio; uint8_t package_pin; } board_pin_t;

#define BOARD_PIN(GPIO, PACKAGE_PIN) ((board_pin_t){ (GPIO), (PACKAGE_PIN) })

#define PD1180_PIN_DRV_STEP           BOARD_PIN(0, 2)
#define PD1180_PIN_DRV_DIR            BOARD_PIN(1, 3)
#define PD1180_PIN_DRV_SLEEP_N        BOARD_PIN(2, 4)
#define PD1180_PIN_DRV_FAULT_N        BOARD_PIN(3, 5)
#define PD1180_PIN_MOTOR_PG           BOARD_PIN(6, 8)
#define PD1180_PIN_EFUSE_FAULT_N      BOARD_PIN(7, 9)
#define PD1180_PIN_VMOTOR_OK          BOARD_PIN(8, 11)
#define PD1180_PIN_MCU_RUN            BOARD_PIN(9, 12)
#define PD1180_PIN_POWER_PERMIT       BOARD_PIN(10, 13)
#define PD1180_PIN_USER_BUTTON_N      BOARD_PIN(11, 14)
#define PD1180_PIN_STATUS_GPIO        BOARD_PIN(12, 15)
#define PD1180_PIN_DRV_HOME_N         BOARD_PIN(13, 16)
#define PD1180_PIN_ENC_SDA            BOARD_PIN(14, 17)
#define PD1180_PIN_ENC_SCL            BOARD_PIN(15, 18)
#define PD1180_PIN_SPI_MISO           BOARD_PIN(16, 27)
#define PD1180_PIN_DRV_CS_N           BOARD_PIN(17, 28)
#define PD1180_PIN_SPI_SCK            BOARD_PIN(18, 29)
#define PD1180_PIN_SPI_MOSI           BOARD_PIN(19, 30)
#define PD1180_PIN_PD_SDA             BOARD_PIN(20, 31)
#define PD1180_PIN_PD_SCL             BOARD_PIN(21, 32)
#define PD1180_PIN_PHASE_A_ADC        BOARD_PIN(26, 38)
#define PD1180_PIN_PHASE_B_ADC        BOARD_PIN(27, 39)
#define PD1180_PIN_BOARD_POWER_SENSE  BOARD_PIN(28, 40)
#define PD1180_PIN_USB_VBUS_SENSE     BOARD_PIN(29, 41)

#define BOARD_XOSC_HZ 12000000u
#define BOARD_USB_CLOCK_HZ 48000000u

/* Generated from docs/firmware-pinmap.json; dedicated QSPI/USB/SWD are not GPIO. */
