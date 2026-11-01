#pragma once
#include "Arduino.h"
constexpr unsigned MSBFIRST=1, SPI_MODE1=1, spi0=0;
struct SPISettings { SPISettings(unsigned,unsigned,unsigned) {} };
struct SPIClassRP2040 {
  bool started=false;
  unsigned transactions=0;
  SPIClassRP2040(unsigned,unsigned,unsigned,unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void beginTransaction(SPISettings) { ++transactions; }
  uint8_t transfer(uint8_t) { return 0xFF; }
  void endTransaction() {}
};
