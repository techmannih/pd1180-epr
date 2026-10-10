#include <Arduino.h>
#include "usbd_def.h"
#include "stm32g0xx_ll_rcc.h"
#include "usb_suspend.h"

extern "C" PCD_HandleTypeDef g_hpcd;
static RTC_HandleTypeDef wakeTimer;

void initializeSuspendTimer() {
  // IWDG already enabled LSI. The RTC wake timer runs from that same oscillator,
  // giving five wake intervals per watchdog period regardless of LSI tolerance.
  __HAL_RCC_PWR_CLK_ENABLE();
  HAL_PWR_EnableBkUpAccess();
  __HAL_RCC_RTC_CONFIG(RCC_RTCCLKSOURCE_LSI);
  __HAL_RCC_RTC_ENABLE();
  __HAL_RCC_RTCAPB_CLK_ENABLE();
  wakeTimer.Instance = RTC;
  wakeTimer.Init.HourFormat = RTC_HOURFORMAT_24;
  wakeTimer.Init.AsynchPrediv = 127;
  wakeTimer.Init.SynchPrediv = 249;
  wakeTimer.Init.OutPut = RTC_OUTPUT_DISABLE;
  wakeTimer.Init.OutPutPolarity = RTC_OUTPUT_POLARITY_HIGH;
  wakeTimer.Init.OutPutType = RTC_OUTPUT_TYPE_OPENDRAIN;
  if (HAL_RTC_Init(&wakeTimer) != HAL_OK) Error_Handler();
  HAL_NVIC_SetPriority(RTC_TAMP_IRQn, 2, 0);
  HAL_NVIC_EnableIRQ(RTC_TAMP_IRQn);
}

extern "C" void RTC_TAMP_IRQHandler() {
  HAL_RTCEx_WakeUpTimerIRQHandler(&wakeTimer);
  // The main loop, never this interrupt, must service the independent watchdog.
}

bool usbIsSuspended() {
  const auto *device = static_cast<volatile USBD_HandleTypeDef *>(g_hpcd.pData);
  return device && device->dev_state == USBD_STATE_SUSPENDED;
}

static void restoreClocks() {
  // STOP retains PLL configuration but wakes on HSI16. Restore the pinned
  // generic G0B1 clock (64 MHz PLL + HSI48) before pending USB IRQs execute.
  LL_RCC_HSI48_Enable();
  LL_RCC_PLL_Enable();
  uint32_t remaining = 200000;
  while (!LL_RCC_HSI48_IsReady() || !LL_RCC_PLL_IsReady()) {
    if (!--remaining) NVIC_SystemReset();
  }
  LL_RCC_SetSysClkSource(LL_RCC_SYS_CLKSOURCE_PLL);
  remaining = 200000;
  while (LL_RCC_GetSysClkSource() != LL_RCC_SYS_CLKSOURCE_STATUS_PLL) {
    if (!--remaining) NVIC_SystemReset();
  }
}

void sleepWhileUsbSuspended() {
  // RTC wake also lets main detect cable removal and reload the 250 ms IWDG.
  if (HAL_RTCEx_SetWakeUpTimer_IT(&wakeTimer, 99, RTC_WAKEUPCLOCK_RTCCLK_DIV16) != HAL_OK)
    Error_Handler();
  __HAL_USB_WAKEUP_EXTI_ENABLE_IT();
  HAL_SuspendTick();
  __disable_irq();
  // Atomic recheck avoids sleeping after a resume/reset already handled by USB.
  if (usbIsSuspended() && (USB->CNTR & USB_CNTR_SUSPRDY)) {
    __DSB();
    HAL_PWR_EnterSTOPMode(PWR_MAINREGULATOR_ON, PWR_STOPENTRY_WFI);
    restoreClocks();
  }
  __enable_irq();
  HAL_ResumeTick();
  if (HAL_RTCEx_DeactivateWakeUpTimer(&wakeTimer) != HAL_OK) Error_Handler();
}
