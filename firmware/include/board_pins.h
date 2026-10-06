#pragma once

#include <stdint.h>

typedef struct { char port; uint8_t bit; uint8_t package_pin; } board_pin_t;

#define BOARD_PIN(PORT, BIT, PACKAGE_PIN) ((board_pin_t){ (PORT), (BIT), (PACKAGE_PIN) })

#define PIN_STATUS_GPIO       BOARD_PIN('C', 13, 1)
#define PIN_DIN0              BOARD_PIN('C', 14, 2)
#define PIN_DIN1              BOARD_PIN('C', 15, 3)
#define PIN_OSC_IN            BOARD_PIN('F', 0, 8)
#define PIN_OSC_OUT           BOARD_PIN('F', 1, 9)
#define PIN_NRST              BOARD_PIN('F', 2, 10)
#define PIN_VMON_ADC          BOARD_PIN('A', 0, 11)
#define PIN_IIN_MON           BOARD_PIN('A', 1, 12)
#define PIN_RS485_TX          BOARD_PIN('A', 2, 13)
#define PIN_RS485_RX          BOARD_PIN('A', 3, 14)
#define PIN_TMC_CS_N          BOARD_PIN('A', 4, 15)
#define PIN_SPI_SCK           BOARD_PIN('A', 5, 16)
#define PIN_SPI_MISO          BOARD_PIN('A', 6, 17)
#define PIN_SPI_MOSI          BOARD_PIN('A', 7, 18)
#define PIN_PD_IRQ_N          BOARD_PIN('B', 1, 20)
#define PIN_EFUSE_FAULT_N     BOARD_PIN('B', 2, 21)
#define PIN_RS485_DE          BOARD_PIN('B', 10, 22)
#define PIN_ENC_CS_N          BOARD_PIN('B', 11, 23)
#define PIN_FLASH_CS_N        BOARD_PIN('B', 12, 24)
#define PIN_STOP_L            BOARD_PIN('B', 13, 25)
#define PIN_STOP_R            BOARD_PIN('B', 14, 26)
#define PIN_HOME_IN           BOARD_PIN('B', 15, 27)
#define PIN_SD_MODE           BOARD_PIN('A', 8, 28)
#define PIN_RS232_TX          BOARD_PIN('A', 9, 29)
#define PIN_STEP_IN           BOARD_PIN('C', 6, 30)
#define PIN_DIR_IN            BOARD_PIN('C', 7, 31)
#define PIN_RS232_RX          BOARD_PIN('A', 10, 32)
#define PIN_USB_DM            BOARD_PIN('A', 11, 33)
#define PIN_USB_DP            BOARD_PIN('A', 12, 34)
#define PIN_SWDIO             BOARD_PIN('A', 13, 35)
#define PIN_SWCLK             BOARD_PIN('A', 14, 36)
#define PIN_MCU_RUN           BOARD_PIN('A', 15, 37)
#define PIN_CAN_RX            BOARD_PIN('D', 0, 38)
#define PIN_CAN_TX            BOARD_PIN('D', 1, 39)
#define PIN_OUT0_DRIVE        BOARD_PIN('D', 2, 40)
#define PIN_OUT1_DRIVE        BOARD_PIN('D', 3, 41)
#define PIN_TMC_DIAG0         BOARD_PIN('D', 4, 42)
#define PIN_MOTOR_PG          BOARD_PIN('B', 3, 43)
#define PIN_POWER_PERMIT      BOARD_PIN('B', 4, 44)
#define PIN_PD_SCL            BOARD_PIN('B', 5, 45)
#define PIN_PD_SDA            BOARD_PIN('B', 6, 46)
#define PIN_TMC_DIAG1         BOARD_PIN('B', 7, 47)
#define PIN_VMOTOR_OK         BOARD_PIN('B', 8, 48)

#define BOARD_HSE_HZ 16000000u
#define BOARD_USB_CLOCK_HZ 48000000u

/* Generated from docs/firmware-pinmap.json; do not edit by hand. */
