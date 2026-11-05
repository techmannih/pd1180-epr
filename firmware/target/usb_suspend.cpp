#include <Arduino.h>
#include <Adafruit_TinyUSB.h>
#include <hardware/clocks.h>
#include <pico/stdlib.h>
#include "usb_suspend.h"

static uint32_t savedSystemClock;
void initializeSuspendTimer() {}
bool usbIsSuspended() { return TinyUSBDevice.suspended(); }
void enterUsbSuspendPower() {
  if(savedSystemClock) return;
  savedSystemClock=clock_get_hz(clk_sys);
  // RP2040-E16 requires clk_sys > 48 MHz while USB remains active.
  // Do not switch to the 12 MHz crystal or disable the USB PLL on suspend.
  // Peripheral buses and the STEP timer have already stopped.
  set_sys_clock_khz(60000,true);
}
void leaveUsbSuspendPower() {
  if(!savedSystemClock) return;
  set_sys_clock_khz(savedSystemClock/1000u,true);
  savedSystemClock=0;
}
void sleepWhileUsbSuspended() {
  // Pico SDK alarm/WFE sleep, not a busy-poll delay. USB IRQ can wake the core;
  // periodic return keeps the independent 250 ms watchdog serviced.
  // This power-saving implementation is not a measured USB-current approval.
  sleep_us(1000);
}
