#pragma once
#include "Arduino.h"
struct FakeUsb {
 bool attached=false,initialized=false;
 void attach(){attached=true;}
 void detach(){attached=false;}
};
inline FakeUsb TinyUSBDevice;
inline void TinyUSB_Device_Init(unsigned){TinyUSBDevice.initialized=true; Serial.begin(115200);}

inline unsigned usbTasks;
inline void TinyUSB_Device_Task(){++usbTasks;}
inline void TinyUSB_Device_FlushCDC(){}
