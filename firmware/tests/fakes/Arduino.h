#pragma once
#include <algorithm>
#include <cstdint>
#include <string>
#include <map>
using pin_size_t = unsigned;
using PinName = unsigned;
constexpr unsigned PB6=22, PB7=23;
constexpr unsigned LOW=0, HIGH=1, INPUT=0, OUTPUT=1, OUTPUT_OPEN_DRAIN=2, INPUT_ANALOG=3;
using std::min;
inline uint32_t fakeNow;
inline std::map<unsigned,unsigned> fakeModes, fakeLevels, fakeAdc;
inline unsigned pinNametoDigitalPin(PinName p) { return p; }
inline void digitalWrite(unsigned p,unsigned level) { fakeLevels[p]=level; }
inline void pinMode(unsigned p,unsigned mode) { fakeModes[p]=mode; }
inline int digitalRead(unsigned p) { return fakeLevels[p]; }
inline int analogRead(unsigned p) { return fakeAdc[p]; }
inline void analogReadResolution(int) {}
inline uint32_t millis() { return fakeNow; }
struct FakeSerial {
  bool started=false;
  std::string input, output;
  void begin() { started=true; }
  void end() { started=false; }
  explicit operator bool() const { return started; }
  int availableForWrite() { return 512; }
  size_t write(const uint8_t *p,size_t n) { output.append(reinterpret_cast<const char *>(p),n); return n; }
  int available() { return input.size(); }
  char read() { const auto c=input.front(); input.erase(0,1); return c; }
};
inline FakeSerial SerialUSB;
