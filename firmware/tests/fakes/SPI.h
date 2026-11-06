#pragma once
#include "Arduino.h"
#include <vector>
constexpr unsigned MSBFIRST=1, SPI_MODE0=0, spi0=0;
struct SPISettings {
  unsigned hz,order,mode;
  SPISettings(unsigned h,unsigned o,unsigned m):hz(h),order(o),mode(m) {}
};
struct SPIClassRP2040 {
  bool started=false;
  unsigned transactions=0;
  unsigned hz=0,order=0,mode=0;
  void (*transferObserver)(uint8_t)=nullptr;
  std::vector<uint8_t> bytes;
  SPIClassRP2040(unsigned,unsigned,unsigned,unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void beginTransaction(SPISettings settings) { ++transactions;hz=settings.hz;order=settings.order;mode=settings.mode; }
  uint8_t transfer(uint8_t value) {if(transferObserver)transferObserver(value);bytes.push_back(value);return 0xff;}
  void endTransaction() {}
};
