#pragma once
#include "Arduino.h"
constexpr unsigned MSBFIRST=1, SPI_MODE1=1, spi0=0;
struct SPISettings { SPISettings(unsigned,unsigned,unsigned) {} };
struct SPIClassRP2040 {
  bool started=false;
  unsigned transactions=0, byteIndex=0;
  bool present=false;
  uint8_t command=0, registers[64]={};
  SPIClassRP2040(unsigned,unsigned,unsigned,unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void beginTransaction(SPISettings) { ++transactions; byteIndex=0; }
  uint8_t transfer(uint8_t value) {
    if(!present) return 0xFF;
    if(byteIndex++==0) {command=value;return 0xC0;}
    const auto reg=command&0x3F;
    if(!(command&0x40)) registers[reg]=(reg==6 ? value&0x7F : value);
    return registers[reg];
  }
  void endTransaction() {}
};
