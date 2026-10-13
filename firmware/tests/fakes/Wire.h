#pragma once
#include <cstdint>
#include <cstddef>
#include <array>
#include <vector>
class TwoWire {
public:
  bool started=false, indicatorPresent=false;
  bool adcPresent=false, adcReady=true, adcFail=false;
  uint16_t adcConfig=0;
  std::array<uint16_t,4> adcRaw = {20210, 8000, 19762, 0};
  std::vector<unsigned> adcChannels;
  unsigned transactions=0, failIndicatorWrite=0, indicatorWrites=0;
  std::array<uint8_t,4> indicatorRegisters = {0, 0xFF, 0, 0xFF};
  std::vector<std::array<uint8_t,2>> indicatorLog;
  TwoWire(unsigned,unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void setClock(unsigned) {}
  void beginTransmission(unsigned a) { ++transactions; address=a; buffer.clear(); }
  void write(uint8_t value) { buffer.push_back(value); }
  int endTransmission(bool=true) {
    if (address==0x49 && adcPresent && !adcFail && !buffer.empty()) {
      selected=buffer[0];
      if (buffer.size()==3 && selected==1) {
        adcConfig=static_cast<uint16_t>(buffer[1]<<8)|buffer[2];
        adcChannels.push_back(((adcConfig>>12)&7u)-4u);
      }
      return 0;
    }
    // Other sensors remain missing: tests never invent a healthy motor supply.
    if (address!=0x70 || !indicatorPresent || buffer.empty()) return 1;
    selected=buffer[0];
    if (selected>3) return 1;
    if (buffer.size()==2) {
      ++indicatorWrites;
      if (indicatorWrites==failIndicatorWrite) return 1;
      indicatorRegisters[selected]=buffer[1];
      indicatorLog.push_back({static_cast<uint8_t>(selected),buffer[1]});
    }
    return 0;
  }
  size_t requestFrom(int a,int count,int) {
    adcReadBytes=0;
    if (a==0x49 && adcPresent && !adcFail && count==2) {
      adcWord=selected==1 ? ((adcConfig&0x7FFFu)|(adcReady?0x8000u:0u)) : adcRaw[((adcConfig>>12)&7u)-4u];
      adcReadBytes=2; return 2;
    }
    availableByte=indicatorPresent && a==0x70 && count==1 && selected<=3;
    return availableByte ? 1 : 0;
  }
  int available() { return adcReadBytes ? adcReadBytes : (availableByte ? 1 : 0); }
  int read() { if(adcReadBytes) return (--adcReadBytes==1) ? adcWord>>8 : adcWord&255; if(!availableByte) return -1; availableByte=false; return indicatorRegisters[selected]; }
private:
  unsigned address=0, selected=0, adcReadBytes=0;
  uint16_t adcWord=0;
  bool availableByte=false;
  std::vector<uint8_t> buffer;
};
