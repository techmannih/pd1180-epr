#include <Arduino.h>
#include <Wire.h>
#include <IWatchdog.h>
#include <stdio.h>
#include <string.h>
extern "C" {
#include "board_pins.h"
#include "control.h"
#include "pd_contract.h"
#include "telemetry.h"
}

// Commissioning image: motor outputs stay locked until the new ECO has passed
// route checks, programmed PD-image verification and powered bring-up.
// U7 mode-pin contention is corrected in source; firmware does not assume the PCB was rebuilt.
static constexpr bool motionWiringVerified = false;
static constexpr bool pdImageVerified = false;
static TwoWire pdBus(PB7, PB6);
static pd1180_control_t control;
static pd1180_inputs_t inputs;
static uint8_t pdMode[4], pdo[6], rdo[12], powerStatus[2], pdStatus[4];
static uint32_t lastPoll, lastTick, lastGoodSample, vbusMv, vmotorMv;
static uint32_t lastTemperaturePoll, lastTemperatureSample, temperatureConfiguredAt;
static uint32_t lastAdcPoll, lastPhaseSample, adcSampleAt[2];
static uint16_t adcMv[2];
static int32_t phaseMa[2];
static bool temperatureConfigured, adcPending, adcValid[2], phaseValid;
static uint8_t adcChannel;
static constexpr uint16_t temperatureConfig = 0x08C0; // Two faults, active-low comparator, 8 Hz.
static char response[384];
static size_t responseLength, responseSent;
static bool pdReadOk, usbStarted;
static char command[64];
static size_t commandLength;
static bool commandOverflow;

static pin_size_t pin(board_pin_t p) {
  return pinNametoDigitalPin(static_cast<PinName>(((p.port-'A')<<4) | p.bit));
}
static void safeOutputs() {
  digitalWrite(pin(PD1180_PIN_MCU_RUN), LOW);
  digitalWrite(pin(PD1180_PIN_POWER_PERMIT), LOW);
  digitalWrite(pin(PD1180_PIN_SD_MODE), LOW);
}
static void output(board_pin_t p, bool high) {
  digitalWrite(pin(p), high ? HIGH : LOW); // Set latch before making pin an output.
  pinMode(pin(p), OUTPUT);
}
static void reply(const char *text) {
  if (!usbStarted || responseSent < responseLength) return;
  responseLength = strnlen(text, sizeof(response)-1);
  memcpy(response,text,responseLength);
  responseSent = 0;
}
static bool pdRead(uint8_t reg, uint8_t *data, size_t len) {
  memset(data,0,len);
  pdBus.beginTransmission(0x20);
  pdBus.write(reg);
  if (pdBus.endTransmission(false) != 0) return false;
  if (pdBus.requestFrom(0x20, static_cast<int>(len+1), static_cast<int>(true)) != len+1) {
    while(pdBus.available()) pdBus.read();
    return false;
  }
  const int count = pdBus.read();
  if (count < static_cast<int>(len) || count > 64) {
    while(pdBus.available()) pdBus.read();
    return false;
  }
  for (size_t n=0;n<len;++n) data[n] = static_cast<uint8_t>(pdBus.read());
  return true;
}
// These devices use ordinary big-endian 16-bit registers, unlike the PD count-byte protocol.
static bool readRegister(uint8_t address, uint8_t reg, uint16_t &value) {
  pdBus.beginTransmission(address); pdBus.write(reg);
  if (pdBus.endTransmission(false) != 0) return false;
  if (pdBus.requestFrom(address, 2, static_cast<int>(true)) != 2) {
    while (pdBus.available()) pdBus.read();
    return false;
  }
  value = static_cast<uint16_t>(pdBus.read() << 8) | pdBus.read();
  return true;
}
static bool writeRegister(uint8_t address, uint8_t reg, uint16_t value) {
  pdBus.beginTransmission(address); pdBus.write(reg);
  pdBus.write(static_cast<uint8_t>(value >> 8)); pdBus.write(static_cast<uint8_t>(value));
  return pdBus.endTransmission() == 0;
}
static void pollTemperature(uint32_t now) {
  if (now-lastTemperaturePoll < 125u) return;
  lastTemperaturePoll=now;
  uint16_t cfg, low, high, raw;
  const bool configured = readRegister(0x48,1,cfg) && (cfg & 0x1FD0u)==temperatureConfig &&
    readRegister(0x48,2,low) && low==0x3700 && readRegister(0x48,3,high) && high==0x4600;
  if (!configured) {
    inputs.temperature_valid=false;
    temperatureConfigured=false;
    // Reinitialization after sensor reset cannot immediately make a stale sample valid.
    if (writeRegister(0x48,2,0x3700) && writeRegister(0x48,3,0x4600) &&
        writeRegister(0x48,1,temperatureConfig)) temperatureConfiguredAt=now;
    return;
  }
  temperatureConfigured=true;
  if (now-temperatureConfiguredAt < 150u || !readRegister(0x48,0,raw)) {
    inputs.temperature_valid=false;
    return;
  }
  inputs.temperature_deci_c=pd1180_tmp102_deci_c(raw);
  inputs.temperature_valid=inputs.temperature_deci_c>=-400 && inputs.temperature_deci_c<=1250;
  if (inputs.temperature_valid) lastTemperatureSample=now;
}
static void pollBusAdc(uint32_t now) {
  if (now-lastAdcPoll < 10u) return;
  lastAdcPoll=now;
  const uint16_t config=0x8383u | (static_cast<uint16_t>(4u+adcChannel)<<12);
  if (!adcPending) {
    adcPending=writeRegister(0x49,1,config);
    if (!adcPending) {adcValid[0]=false; adcValid[1]=false;}
    return;
  }
  uint16_t status, raw;
  if (!readRegister(0x49,1,status) || (status & 0x7FFFu)!=(config & 0x7FFFu)) {
    adcPending=false; adcValid[0]=false; adcValid[1]=false; return;
  }
  if (!(status & 0x8000u)) return;
  adcValid[adcChannel]=readRegister(0x49,0,raw) &&
    pd1180_ads1115_mv(static_cast<int16_t>(raw),&adcMv[adcChannel]);
  if (adcValid[adcChannel]) adcSampleAt[adcChannel]=now;
  adcChannel^=1; adcPending=false;
}
static void samplePhaseCurrent(uint32_t now) {
  if (now-lastPhaseSample < 1u) return;
  lastPhaseSample=now;
  const bool a=pd1180_phase_current_ma(analogRead(pin(PD1180_PIN_PHASE_A_ADC)),2048,3300,&phaseMa[0]);
  const bool b=pd1180_phase_current_ma(analogRead(pin(PD1180_PIN_PHASE_B_ADC)),2048,3300,&phaseMa[1]);
  phaseValid=a && b;
  // Instantaneous, nominal-VDDA diagnostics; not synchronous current control or an RMS measurement.
}
static uint32_t dividerMillivolts(board_pin_t input, uint32_t topK, uint32_t bottomK) {
  // VDDA is nominal 3.3 V; diagnostics only until measured/calibrated on hardware.
  return static_cast<uint32_t>((static_cast<uint64_t>(analogRead(pin(input))) * 3300u *
    (topK+bottomK)) / (4095u*bottomK));
}
static void pollPower() {
  vbusMv = dividerMillivolts(PD1180_PIN_USB_VBUS_SENSE,1000,47);
  vmotorMv = static_cast<uint32_t>(adcMv[0]) * 19u; // 360k / 20k divider, ADS1115 AIN0.
  // TI I2C reads include the leading byte count; all fields must succeed.
  pdReadOk = pdRead(0x03,pdMode,sizeof(pdMode)) && pdRead(0x34,pdo,sizeof(pdo)) &&
    pdRead(0x35,rdo,sizeof(rdo)) && pdRead(0x3F,powerStatus,sizeof(powerStatus)) &&
    pdRead(0x40,pdStatus,sizeof(pdStatus));
  if(pdReadOk) lastGoodSample=millis();
  const pd1180_contract_t contract = pd1180_decode_contract(pdMode,pdo,rdo,powerStatus,pdStatus);
  inputs.pd_app_mode = pdReadOk && memcmp(pdMode,"APP ",4)==0;
  inputs.epr_contract = pdReadOk && contract.valid;
  inputs.contract_mv = contract.mv;
  inputs.contract_ma = contract.ma;
  inputs.configuration_verified = pdImageVerified;
  inputs.motion_wiring_verified = motionWiringVerified;
  inputs.pd_fault = !pdReadOk;
  inputs.efuse_fault = digitalRead(pin(PD1180_PIN_EFUSE_FAULT_N)) == LOW;
  inputs.motor_power_good = digitalRead(pin(PD1180_PIN_MOTOR_PG)) == HIGH;
  inputs.vmotor_in_range = digitalRead(pin(PD1180_PIN_VMOTOR_OK)) == HIGH && adcValid[0] &&
    millis()-adcSampleAt[0]<=100u && vmotorMv >= 44000 && vmotorMv <= 51000;
  inputs.watchdog_healthy = true;
  inputs.driver_ready = false; // U7 is intentionally unpowered in this commissioning image.
  inputs.stop_active = digitalRead(pin(PD1180_PIN_STOP_L)) == LOW || digitalRead(pin(PD1180_PIN_STOP_R)) == LOW;
}
static void executeCommand() {
  command[commandLength]=0;
  if(!strcmp(command,"DISARM")) {
    safeOutputs(); pd1180_control_disarm(&control); reply("OK DISARM\r\n");
  } else if(!strcmp(command,"ARM")) {
    safeOutputs();
    reply("BLOCKED: ECO hardware and TI configuration not verified\r\n");
  } else if(!strcmp(command,"STATUS")) {
    char status[384];
    snprintf(status,sizeof(status),"PD_OK=%u EPR48=%u DATA_VBUS_MV=%lu VMOTOR_MV=%lu BUS_ADC_OK=%u IIN_MON_MV=%u IIN_ADC_OK=%u TEMP_DC=%d TEMP_OK=%u PHASE_A_MA=%ld PHASE_B_MA=%ld PHASE_OK=%u ADC_CALIBRATED=0 PG=%u WINDOW=%u RUN=0 BRINGUP_REQUIRED=1\r\n",
      pdReadOk,inputs.epr_contract,static_cast<unsigned long>(vbusMv),static_cast<unsigned long>(vmotorMv),
      adcValid[0] && millis()-adcSampleAt[0]<=100u,adcMv[1],adcValid[1] && millis()-adcSampleAt[1]<=100u,
      inputs.temperature_deci_c,inputs.temperature_valid,static_cast<long>(phaseMa[0]),static_cast<long>(phaseMa[1]),phaseValid,
      inputs.motor_power_good,inputs.vmotor_in_range);
    reply(status);
  } else if(!strcmp(command,"HELP")) {
    reply("PD1180 commissioning: STATUS, DISARM, ARM (blocked), HELP. No motion enabled.\r\n");
  } else reply("ERR unknown command\r\n");
}
void setup() {
  output(PD1180_PIN_MCU_RUN,false); output(PD1180_PIN_POWER_PERMIT,false); output(PD1180_PIN_SD_MODE,false);
  output(PD1180_PIN_RS485_DE,false); output(PD1180_PIN_OUT0_DRIVE,false); output(PD1180_PIN_OUT1_DRIVE,false);
  output(PD1180_PIN_TMC_CS_N,true); output(PD1180_PIN_ENC_CS_N,true); output(PD1180_PIN_FLASH_CS_N,true);
  output(PD1180_PIN_STATUS_GPIO,false);
  const board_pin_t inputsToSet[] = {PD1180_PIN_EFUSE_FAULT_N,PD1180_PIN_MOTOR_PG,PD1180_PIN_VMOTOR_OK,
    PD1180_PIN_STOP_L,PD1180_PIN_STOP_R,PD1180_PIN_STEP_IN,PD1180_PIN_DIR_IN,PD1180_PIN_PD_IRQ_N};
  for(auto p:inputsToSet) pinMode(pin(p),INPUT);
  analogReadResolution(12);
  pd1180_control_reset(&control);
  IWatchdog.begin(250000); // 250 ms nominal; never serviced by interrupt handlers.
  pdBus.begin(); pdBus.setClock(100000);
  lastTick=lastPoll=millis();
}
void loop() {
  // Hard interlock is independent of the shared logic/command parser.
  safeOutputs();
  const uint32_t now=millis();
  pollTemperature(now); pollBusAdc(now); samplePhaseCurrent(now);
  if (!temperatureConfigured || now-lastTemperatureSample>500u) inputs.temperature_valid=false;
  if(now-lastPoll >= 50u) { lastPoll=now; pollPower(); }
  if(!usbStarted && vbusMv >= 4000u) { SerialUSB.begin(); usbStarted=true; }
  if(usbStarted && vbusMv < 3000u) {
    SerialUSB.end(); usbStarted=false; commandLength=0; commandOverflow=false;
    responseLength=responseSent=0;
    pd1180_control_disarm(&control);
  }
  if(usbStarted) {
    if (SerialUSB && responseSent<responseLength) {
      const size_t count=min(responseLength-responseSent,static_cast<size_t>(SerialUSB.availableForWrite()));
      if (count) responseSent+=SerialUSB.write(reinterpret_cast<const uint8_t *>(response)+responseSent,count);
    }
    // Bounded parser: oversized lines are discarded whole, never as command suffixes.
    for(unsigned n=0; n<32 && SerialUSB.available(); ++n) {
      const char c=static_cast<char>(SerialUSB.read());
      if(c=='\r') continue;
      if(c=='\n') {
        if(commandOverflow) reply("ERR line too long\r\n");
        else executeCommand();
        commandLength=0; commandOverflow=false;
      } else if(!commandOverflow) {
        if(commandLength+1 < sizeof(command)) command[commandLength++]=c;
        else {commandOverflow=true; commandLength=0;}
      }
    }
  }
  const uint32_t tick=millis();
  if(tick-lastTick >= 10u) {
    inputs.sample_fresh=pdReadOk && tick-lastGoodSample<=100u;
    pd1180_control_tick(&control,&inputs,tick-lastTick); lastTick=tick;
    digitalWrite(pin(PD1180_PIN_STATUS_GPIO),(tick/500u)&1u);
  }
  safeOutputs();
  IWatchdog.reload();
}
