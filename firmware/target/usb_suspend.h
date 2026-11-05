#pragma once

void initializeSuspendTimer();
bool usbIsSuspended();
void sleepWhileUsbSuspended();

void enterUsbSuspendPower();
void leaveUsbSuspendPower();
