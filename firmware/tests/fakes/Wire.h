#pragma once
#include <cstdint>
#include <cstddef>
#include <array>
#include <vector>
constexpr unsigned i2c0=0,i2c1=1;
class TwoWire {
public:
  bool started=false, indicatorPresent=false, pdPresent=false, temperaturePresent=false;
  uint16_t temperatureConfig=0, tempLow=0x3700, tempHigh=0x4600;
  std::vector<uint8_t> response;
  bool pdVoltagePresent=false, pdVoltageFail=false, pdVoltageReady=true;
  uint16_t pdVoltageConfig=0, pdVoltageAdc=0, pdVoltageRaw=15360, pdVoltageStatus=1;
  unsigned pdVoltageTriggers=0;
  bool adcPresent=false, adcReady=true, adcFail=false;
  uint16_t adcConfig=0;
  std::array<uint16_t,4> adcRaw = {20210, 8000, 19762, 0};
  std::vector<unsigned> adcChannels;
  unsigned transactions=0, failIndicatorWrite=0, indicatorWrites=0;
  std::array<uint8_t,4> indicatorRegisters = {0, 0xFF, 0, 0xFF};
  std::vector<std::array<uint8_t,2>> indicatorLog;
  TwoWire(unsigned,unsigned,unsigned) {}
  void setTimeout(unsigned) {}
  void begin() { started=true; }
  void end() { started=false; }
  void setClock(unsigned) {}
  void beginTransmission(unsigned a) { ++transactions; address=a; buffer.clear(); }
  void write(uint8_t value) { buffer.push_back(value); }
  int endTransmission(bool=true) {
    if (address==0x20 && pdPresent && !buffer.empty()) {selected=buffer[0];return 0;}
    if (address==0x48 && temperaturePresent && !buffer.empty()) {
      selected=buffer[0];
      if(buffer.size()==3) {
        const uint16_t word=(buffer[1]<<8)|buffer[2];
        if(selected==1) temperatureConfig=word;
        if(selected==2) tempLow=word;
        if(selected==3) tempHigh=word;
      }
      return 0;
    }
    if (address==0x40 && pdVoltagePresent && !pdVoltageFail && !buffer.empty()) {
      selected=buffer[0];
      if (buffer.size()==3) {
        const uint16_t word=static_cast<uint16_t>(buffer[1]<<8)|buffer[2];
        if(selected==0) pdVoltageConfig=word;
        else if(selected==1) {pdVoltageAdc=word; ++pdVoltageTriggers;}
        else return 1;
      }
      return 0;
    }
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
    adcReadBytes=0; response.clear();
    if (a==0x20 && pdPresent) {
      response.resize(count,0);response[0]=count-1;
      if(selected==3) {response[1]='A';response[2]='P';response[3]='P';response[4]=' ';}
      if(selected==6) {const char *id="PD118041";for(unsigned n=0;n<8;++n) response[n+1]=id[n];}
      uint32_t word=selected==0x34 ? ((960u<<10)|500u) : selected==0x35 ? ((9u<<28)|(500u<<10)|500u) : selected==0x3F ? 13u : 0u;
      if(selected>=0x34) for(unsigned n=0;n<4 && n+1<response.size();++n) response[n+1]=word>>(n*8);
      return count;
    }
    if(a==0x48 && temperaturePresent && count==2) {
      adcWord=selected==0 ? 0x1900 : selected==1 ? temperatureConfig : selected==2 ? tempLow : tempHigh;
      adcReadBytes=2;return 2;
    }
    if (a==0x40 && pdVoltagePresent && !pdVoltageFail && count==2) {
      switch(selected) {
        case 0:adcWord=pdVoltageConfig;break;case 1:adcWord=pdVoltageAdc;break;
        case 5:adcWord=pdVoltageRaw;break;case 0x3E:adcWord=0x5449;break;
        case 0x0B:adcWord=pdVoltageStatus|(pdVoltageReady?2u:0u);break;
        default:return 0;
      }
      adcReadBytes=2;return 2;
    }
    if (a==0x49 && adcPresent && !adcFail && count==2) {
      adcWord=selected==1 ? ((adcConfig&0x7FFFu)|(adcReady?0x8000u:0u)) : adcRaw[((adcConfig>>12)&7u)-4u];
      adcReadBytes=2; return 2;
    }
    availableByte=indicatorPresent && a==0x70 && count==1 && selected<=3;
    return availableByte ? 1 : 0;
  }
  int available() { return !response.empty() ? response.size() : adcReadBytes ? adcReadBytes : (availableByte ? 1 : 0); }
  int read() { if(!response.empty()) {const auto b=response.front();response.erase(response.begin());return b;} if(adcReadBytes) return (--adcReadBytes==1) ? adcWord>>8 : adcWord&255; if(!availableByte) return -1; availableByte=false; return indicatorRegisters[selected]; }
private:
  unsigned address=0, selected=0, adcReadBytes=0;
  uint16_t adcWord=0;
  bool availableByte=false;
  std::vector<uint8_t> buffer;
};
