#pragma once

#include <stdint.h>

typedef struct { char port; uint8_t bit; uint8_t package_pin; } board_pin_t;

#define BOARD_PIN(PORT, BIT, PACKAGE_PIN) ((board_pin_t){ (PORT), (BIT), (PACKAGE_PIN) })

#define PD1180_PIN_STATUS_GPIO       BOARD_PIN('C', 13, 1)
#define PD1180_PIN_DIN0              BOARD_PIN('C', 14, 2)
#define PD1180_PIN_DIN1              BOARD_PIN('C', 15, 3)
#define PD1180_PIN_OSC_IN            BOARD_PIN('F', 0, 8)
#define PD1180_PIN_OSC_OUT           BOARD_PIN('F', 1, 9)
#define PD1180_PIN_NRST              BOARD_PIN('F', 2, 10)
#define PD1180_PIN_VMON_ADC          BOARD_PIN('A', 0, 11)
#define PD1180_PIN_IIN_MON           BOARD_PIN('A', 1, 12)
#define PD1180_PIN_RS485_TX          BOARD_PIN('A', 2, 13)
#define PD1180_PIN_RS485_RX          BOARD_PIN('A', 3, 14)
#define PD1180_PIN_TMC_CS_N          BOARD_PIN('A', 4, 15)
#define PD1180_PIN_SPI_SCK           BOARD_PIN('A', 5, 16)
#define PD1180_PIN_SPI_MISO          BOARD_PIN('A', 6, 17)
#define PD1180_PIN_SPI_MOSI          BOARD_PIN('A', 7, 18)
#define PD1180_PIN_USB_VBUS_SENSE    BOARD_PIN('B', 0, 19)
#define PD1180_PIN_PD_IRQ_N          BOARD_PIN('B', 1, 20)
#define PD1180_PIN_EFUSE_FAULT_N     BOARD_PIN('B', 2, 21)
#define PD1180_PIN_RS485_DE          BOARD_PIN('B', 10, 22)
#define PD1180_PIN_ENC_CS_N          BOARD_PIN('B', 11, 23)
#define PD1180_PIN_FLASH_CS_N        BOARD_PIN('B', 12, 24)
#define PD1180_PIN_STOP_L            BOARD_PIN('B', 13, 25)
#define PD1180_PIN_STOP_R            BOARD_PIN('B', 14, 26)
#define PD1180_PIN_HOME_IN           BOARD_PIN('B', 15, 27)
#define PD1180_PIN_SD_MODE           BOARD_PIN('A', 8, 28)
#define PD1180_PIN_RS232_TX          BOARD_PIN('A', 9, 29)
#define PD1180_PIN_STEP_IN           BOARD_PIN('C', 6, 30)
#define PD1180_PIN_DIR_IN            BOARD_PIN('C', 7, 31)
#define PD1180_PIN_RS232_RX          BOARD_PIN('A', 10, 32)
#define PD1180_PIN_USB_DM            BOARD_PIN('A', 11, 33)
#define PD1180_PIN_USB_DP            BOARD_PIN('A', 12, 34)
#define PD1180_PIN_SWDIO             BOARD_PIN('A', 13, 35)
#define PD1180_PIN_SWCLK             BOARD_PIN('A', 14, 36)
#define PD1180_PIN_MCU_RUN           BOARD_PIN('A', 15, 37)
#define PD1180_PIN_CAN_RX            BOARD_PIN('D', 0, 38)
#define PD1180_PIN_CAN_TX            BOARD_PIN('D', 1, 39)
#define PD1180_PIN_OUT0_DRIVE        BOARD_PIN('D', 2, 40)
#define PD1180_PIN_OUT1_DRIVE        BOARD_PIN('D', 3, 41)
#define PD1180_PIN_TMC_DIAG0         BOARD_PIN('B', 3, 42)
#define PD1180_PIN_MOTOR_PG          BOARD_PIN('B', 4, 43)
#define PD1180_PIN_POWER_PERMIT      BOARD_PIN('B', 5, 44)
#define PD1180_PIN_PD_SCL            BOARD_PIN('B', 6, 45)
#define PD1180_PIN_PD_SDA            BOARD_PIN('B', 7, 46)
#define PD1180_PIN_TMC_DIAG1         BOARD_PIN('B', 8, 47)
#define PD1180_PIN_VMOTOR_OK         BOARD_PIN('B', 9, 48)

#define BOARD_HSE_HZ 16000000u
#define BOARD_USB_CLOCK_HZ 48000000u

/* Generated from docs/firmware-pinmap.json; do not edit by hand. */
