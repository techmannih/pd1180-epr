#pragma once
#include "Arduino.h"
constexpr unsigned MSBFIRST=1, SPI_MODE3=3;
struct SPISettings { SPISettings(unsigned,unsigned,unsigned) {} };
struct SPIClass {
  bool started=false;
  unsigned transactions=0;
  SPIClass(unsigned,unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void beginTransaction(SPISettings) { ++transactions; }
  uint8_t transfer(uint8_t) { return 0xFF; }
  void endTransaction() {}
};
