#include <Arduino.h>
#include <Adafruit_TinyUSB.h>
#include "usb_suspend.h"
void initializeSuspendTimer() {}
bool usbIsSuspended() { return TinyUSBDevice.suspended(); }
// Outputs are already off. USB suspend current remains a measured qualification
// gate: WFI is not evidence that RP2040 + external flash meet the bus budget.
void sleepWhileUsbSuspended() { delay(1); }
