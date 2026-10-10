#pragma once
#include <cstdint>
#include <cstddef>
class TwoWire {
public:
  bool started=false;
  unsigned transactions=0;
  TwoWire(unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void setClock(unsigned) {}
  void beginTransmission(unsigned) { ++transactions; }
  void write(uint8_t) {}
  int endTransmission(bool=true) { return 1; } // Missing-device fault, not a fabricated healthy sensor.
  size_t requestFrom(int,int,int) { return 0; }
  int available() { return 0; }
  int read() { return -1; }
};
