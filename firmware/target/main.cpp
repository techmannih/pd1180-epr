#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <IWatchdog.h>
#include "usb_suspend.h"
#include <stdio.h>
#include <string.h>
extern "C" {
#include "board_pins.h"
#include "control.h"
#include "brake_preflight.h"
#include "pd_contract.h"
#include "telemetry.h"
#include "power_domain.h"
#include "tmc5160.h"
#include "motor_service.h"
#include "tmc5160_config.h"
#include "local_motion.h"
}

// Commissioning image: motor outputs stay locked until the new ECO has passed
// route checks, programmed PD-image verification and powered bring-up.
// U7 mode-pin contention is corrected in source; firmware does not assume the PCB was rebuilt.
static constexpr bool motionWiringVerified = false;
static constexpr bool pdImageVerified = false;
static constexpr bool brakeHardwareVerified = false;
static constexpr bool motionQualified = motionWiringVerified && pdImageVerified && brakeHardwareVerified;
static pd1180_brake_preflight_t brakePreflight;
static TwoWire pdBus(PB7, PB6);
static SPIClass motorSpi(PA7, PA6, PA5);
static bool spiStarted;
static bool motorFrame(void *, const uint8_t tx[5], uint8_t rx[5]);
static pd1180_motor_service_t motor = {};
static auto &tmc = motor.driver;
static auto &tmcStatus = motor.status;
static constexpr uint16_t commissioningCurrentPermille = PD1180_BENCH_CURRENT_MAX_PERMILLE; // Start below 1 A RMS; tune on the bench.
static uint32_t lastDriverPoll;
static pd1180_control_t control;
static pd1180_local_motion_t localMotion;
static pd1180_inputs_t inputs;
static pd1180_board_power_t boardPower;
static bool peripheralsStarted, wasSuspended;
static bool indicatorsReady, indicatorResetReleased;
static uint32_t indicatorAttemptAt, lastIndicatorPoll;
static uint32_t boardMv;
static uint8_t pdMode[4], pdIdentity[8], pdo[6], rdo[12], powerStatus[2], pdStatus[4];
static uint32_t lastPoll, lastTick, lastGoodSample, vbusMv, vmotorMv;
static uint32_t lastTemperaturePoll, lastTemperatureSample, temperatureConfiguredAt;
static uint32_t lastAdcPoll, lastPhaseSample, adcSampleAt[3];
static uint16_t adcMv[3];
static int32_t phaseMa[2];
static bool temperatureConfigured, adcPending, adcValid[3], phaseValid;
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
static const board_pin_t boardInputs[] = {PD1180_PIN_EFUSE_FAULT_N,PD1180_PIN_MOTOR_PG,PD1180_PIN_VMOTOR_OK,
  PD1180_PIN_TMC_DIAG0,PD1180_PIN_TMC_DIAG1};
static void releaseChipSelect(board_pin_t p) {
  digitalWrite(pin(p), HIGH);
  pinMode(pin(p), OUTPUT_OPEN_DRAIN); // Only external board-domain pullups drive high.
}
static void invalidateTelemetry() {
  inputs = {};
  brakePreflight = {};
  adcChannel = 0;
  pd1180_local_motion_cancel(&localMotion);
  temperatureConfigured = false;
  adcPending = false;
  adcValid[0] = adcValid[1] = adcValid[2] = phaseValid = pdReadOk = false;
  adcMv[0] = adcMv[1] = adcMv[2] = 0;
  phaseMa[0] = phaseMa[1] = 0;
  vmotorMv = 0;
  pd1180_motor_service_reset(&motor);
  pd1180_control_disarm(&control);
}
static void stopPeripherals() {
  safeOutputs();
  // U35 RESET is hardware-gated: no I2C transaction is needed to silence BZ1.
  digitalWrite(pin(PD1180_PIN_STATUS_GPIO), LOW);
  indicatorsReady = indicatorResetReleased = false;
  if (peripheralsStarted) pdBus.end();
  if (spiStarted) motorSpi.end();
  spiStarted=false;
  releaseChipSelect(PD1180_PIN_TMC_CS_N);
  for (auto p : {PD1180_PIN_SPI_SCK, PD1180_PIN_SPI_MOSI, PD1180_PIN_SPI_MISO})
    pinMode(pin(p), INPUT_ANALOG);
  // No internal pullups or push-pull highs may energize the dead board rail.
  pinMode(pin(PD1180_PIN_PD_SCL), INPUT_ANALOG);
  pinMode(pin(PD1180_PIN_PD_SDA), INPUT_ANALOG);
  for (auto p : boardInputs) pinMode(pin(p), INPUT_ANALOG);
  peripheralsStarted = false;
  invalidateTelemetry();
}
static void startPeripherals() {
  for (auto p : boardInputs) pinMode(pin(p), INPUT);
  pdBus.begin(); pdBus.setClock(100000);
  peripheralsStarted = true;
  temperatureConfiguredAt = millis();
  indicatorAttemptAt = millis();
  digitalWrite(pin(PD1180_PIN_STATUS_GPIO), HIGH);
  indicatorResetReleased = true;
}
// U7 needs VMOTOR as well as VCC_IO. Do not clock or drive its inputs when
// the motor domain is absent, even if the encoder/board logic is powered.
static bool motorFrame(void *, const uint8_t tx[5], uint8_t rx[5]) {
  if (!spiStarted || !peripheralsStarted || !inputs.motor_power_good ||
      !inputs.vmotor_in_range || (usbStarted && usbIsSuspended())) return false;
  motorSpi.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE3));
  digitalWrite(pin(PD1180_PIN_TMC_CS_N), LOW);
  for (unsigned i=0;i<5;++i) rx[i]=motorSpi.transfer(tx[i]);
  digitalWrite(pin(PD1180_PIN_TMC_CS_N), HIGH);
  motorSpi.endTransaction();
  delayMicroseconds(2); // Explicit CS-high gap; ADI requires >=2 system clocks.
  return true;
}
static void pollDriver(uint32_t now) {
  if (!inputs.motor_power_good || !inputs.vmotor_in_range) {
    if (spiStarted) motorSpi.end();
    spiStarted=false; pd1180_motor_service_reset(&motor);
    inputs.driver_ready=false;
    for (auto p : {PD1180_PIN_SPI_SCK,PD1180_PIN_SPI_MOSI,PD1180_PIN_SPI_MISO})
      pinMode(pin(p),INPUT_ANALOG);
    return;
  }
  if (!spiStarted) { motorSpi.begin(); spiStarted=true; }
  if (now-lastDriverPoll<20u) return;
  lastDriverPoll=now;
  // Read-only in the unqualified commissioning image. Faults are not cleared
  // automatically; every reset/power loss invalidates the configured state.
  if (motionQualified) {
    pd1180_motor_service(&motor,&control,&inputs,commissioningCurrentPermille);
  } else {
    pd1180_tmc_status(&tmc,&tmcStatus);
    inputs.driver_ready=false;
  }
}
static void reply(const char *text) {
  if (!usbStarted || responseSent < responseLength) return;
  responseLength = strnlen(text, sizeof(response)-1);
  memcpy(response,text,responseLength);
  responseSent = 0;
}
static bool pdRead(uint8_t reg, uint8_t *data, size_t len) {
  if (usbStarted && usbIsSuspended()) return false;
  memset(data,0,len);
  pdBus.beginTransmission(0x20);
  pdBus.write(reg);
  if (pdBus.endTransmission(false) != 0 || (usbStarted && usbIsSuspended())) return false;
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
  if (usbStarted && usbIsSuspended()) return false;
  pdBus.beginTransmission(address); pdBus.write(reg);
  if (pdBus.endTransmission(false) != 0 || (usbStarted && usbIsSuspended())) return false;
  if (pdBus.requestFrom(address, 2, static_cast<int>(true)) != 2) {
    while (pdBus.available()) pdBus.read();
    return false;
  }
  value = static_cast<uint16_t>(pdBus.read() << 8) | pdBus.read();
  return true;
}
static bool writeRegister(uint8_t address, uint8_t reg, uint16_t value) {
  if (usbStarted && usbIsSuspended()) return false;
  pdBus.beginTransmission(address); pdBus.write(reg);
  pdBus.write(static_cast<uint8_t>(value >> 8)); pdBus.write(static_cast<uint8_t>(value));
  return pdBus.endTransmission() == 0;
}
// TCA9538: A1/A0 grounded (0x70); P0/P1/P2 sink RGB, P3 drives the alarm MOSFET.
// R132 holds RESET low during MCU reset. R127 keeps the buzzer gate low while
// expander ports are inputs. The output latch is initialized before direction.
static bool indicatorWrite(uint8_t reg, uint8_t value) {
  if (!peripheralsStarted || (usbStarted && usbIsSuspended())) return false;
  pdBus.beginTransmission(0x70); pdBus.write(reg); pdBus.write(value);
  return pdBus.endTransmission() == 0;
}
static bool indicatorRead(uint8_t reg, uint8_t &value) {
  if (!peripheralsStarted || (usbStarted && usbIsSuspended())) return false;
  pdBus.beginTransmission(0x70); pdBus.write(reg);
  if (pdBus.endTransmission(false) != 0 || (usbStarted && usbIsSuspended())) return false;
  if (pdBus.requestFrom(0x70, 1, static_cast<int>(true)) != 1) {
    while (pdBus.available()) pdBus.read();
    return false;
  }
  value = static_cast<uint8_t>(pdBus.read());
  return true;
}
static void resetIndicators(uint32_t now) {
  digitalWrite(pin(PD1180_PIN_STATUS_GPIO), LOW);
  indicatorsReady = indicatorResetReleased = false;
  indicatorAttemptAt = now;
}
static void pollIndicators(uint32_t now) {
  if (!peripheralsStarted) return;
  if (usbStarted && usbIsSuspended()) { resetIndicators(now); return; }
  if (!indicatorResetReleased) {
    if (now - indicatorAttemptAt < 1000u) return;
    digitalWrite(pin(PD1180_PIN_STATUS_GPIO), HIGH);
    indicatorResetReleased = true;
    indicatorAttemptAt = now;
    return;
  }
  if (now - indicatorAttemptAt < 1u || now - lastIndicatorPoll < 50u) return;
  lastIndicatorPoll = now;
  if (!indicatorsReady) {
    if (!indicatorWrite(1, 0x07) || !indicatorWrite(2, 0) || !indicatorWrite(3, 0xF0)) {
      resetIndicators(now); return;
    }
  }
  const bool fault = control.fault_latched || (tmcStatus.valid && tmcStatus.fault) ||
    (inputs.temperature_valid && inputs.temperature_deci_c >= 700);
  uint8_t value;
  if (fault) value = 0x06 | ((now % 2000u < 200u) ? 0x08 : 0); // Red; bounded chirp.
  else if (!motionQualified) value = 0x03; // Blue: commissioning lock.
  else if (!inputs.sample_fresh || !inputs.temperature_valid || !inputs.epr_contract)
    value = 0x04; // Amber: waiting for qualified power/telemetry.
  else value = 0x05; // Green: qualified, with RUN reported separately over USB.
  uint8_t config, actual;
  // Detect a reset/brownout or failed write instead of leaving a stale alert latched.
  if (!indicatorRead(3, config) || config != 0xF0 || !indicatorWrite(1, value) ||
      !indicatorRead(1, actual) || actual != value) {
    resetIndicators(now); return;
  }
  indicatorsReady = true;
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
    if (!adcPending) {adcValid[0]=false; adcValid[1]=false; adcValid[2]=false;}
    return;
  }
  uint16_t status, raw;
  if (!readRegister(0x49,1,status) || (status & 0x7FFFu)!=(config & 0x7FFFu)) {
    adcPending=false; adcValid[0]=false; adcValid[1]=false; adcValid[2]=false; return;
  }
  if (!(status & 0x8000u)) return;
  adcValid[adcChannel]=readRegister(0x49,0,raw) &&
    pd1180_ads1115_mv(static_cast<int16_t>(raw),&adcMv[adcChannel]);
  if (adcValid[adcChannel]) adcSampleAt[adcChannel]=now;
  adcChannel=(adcChannel+1u)%3u; adcPending=false;
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
static bool pdConfigurationMatches(const uint8_t *identity) {
  static constexpr uint8_t expected[8] = {'P','D','1','1','8','0','4','1'};
  return memcmp(identity, expected, sizeof(expected)) == 0;
}
static void pollPower() {
  vbusMv = dividerMillivolts(PD1180_PIN_USB_VBUS_SENSE,1000,47);
  vmotorMv = static_cast<uint32_t>(adcMv[0]) * 19u; // 360k / 20k divider, ADS1115 AIN0.
  // TI I2C reads include the leading byte count; all fields must succeed.
  pdReadOk = pdRead(0x03,pdMode,sizeof(pdMode)) && pdRead(0x06,pdIdentity,sizeof(pdIdentity)) && pdRead(0x34,pdo,sizeof(pdo)) &&
    pdRead(0x35,rdo,sizeof(rdo)) && pdRead(0x3F,powerStatus,sizeof(powerStatus)) &&
    pdRead(0x40,pdStatus,sizeof(pdStatus));
  if(pdReadOk) lastGoodSample=millis();
  const pd1180_contract_t contract = pd1180_decode_contract(pdMode,pdo,rdo,powerStatus,pdStatus);
  inputs.pd_app_mode = pdReadOk && memcmp(pdMode,"APP ",4)==0;
  inputs.epr_contract = pdReadOk && contract.valid;
  inputs.contract_mv = contract.mv;
  inputs.contract_ma = contract.ma;
  inputs.configuration_verified = pdImageVerified && pdReadOk && pdConfigurationMatches(pdIdentity);
  inputs.motion_wiring_verified = motionWiringVerified && brakeHardwareVerified;
  inputs.pd_fault = !pdReadOk;
  inputs.efuse_fault = digitalRead(pin(PD1180_PIN_EFUSE_FAULT_N)) == LOW;
  inputs.motor_power_good = digitalRead(pin(PD1180_PIN_MOTOR_PG)) == HIGH;
  inputs.vmotor_in_range = digitalRead(pin(PD1180_PIN_VMOTOR_OK)) == HIGH && adcValid[0] &&
    millis()-adcSampleAt[0]<=100u && vmotorMv >= 44000 && vmotorMv <= 51000;
  inputs.brake_preflight_ok = pd1180_brake_preflight_update(&brakePreflight,
    control.power_permit, control.mcu_run, adcValid[0] && adcValid[2] &&
    millis()-adcSampleAt[0]<=100u && millis()-adcSampleAt[2]<=100u,
    millis(), adcSampleAt[2], vmotorMv, static_cast<uint32_t>(adcMv[2])*991u/51u);
  inputs.watchdog_healthy = true;
  inputs.driver_ready = motionQualified && tmc.configured &&
    tmcStatus.valid && !tmcStatus.fault && millis()-lastDriverPoll<=40u;
  inputs.stop_active = false; // External limit interface removed; local STOP uses the controlled ramp.
}
static void executeCommand() {
  command[commandLength]=0;
  if(!strcmp(command,"DISARM")) {
    safeOutputs(); pd1180_local_motion_cancel(&localMotion); pd1180_control_disarm(&control); pd1180_motor_service_reset(&motor); reply("OK DISARM\r\n");
  } else if(!strcmp(command,"ARM")) {
    reply("BLOCKED: use local START/STOP; hardware qualification required\r\n");
  } else if(!strcmp(command,"DRIVER")) {
    char status[160];
    snprintf(status,sizeof(status),"TMC_VALID=%u IOIN=%08lX GSTAT=%08lX DRV_STATUS=%08lX CONFIGURED=%u FAULT=%u\r\n",
      tmcStatus.valid,static_cast<unsigned long>(tmcStatus.ioin),static_cast<unsigned long>(tmcStatus.gstat),
      static_cast<unsigned long>(tmcStatus.drv_status),tmc.configured,tmcStatus.fault);
    reply(status);
  } else if(!strcmp(command,"STATUS")) {
    char status[384];
    snprintf(status,sizeof(status),"BOARD_MV=%lu BOARD_OK=%u PD_OK=%u EPR48=%u DATA_VBUS_MV=%lu VMOTOR_MV=%lu BRAKE_OK=%u BUS_ADC_OK=%u IIN_MON_MV=%u IIN_ADC_OK=%u TEMP_DC=%d TEMP_OK=%u PHASE_A_MA=%ld PHASE_B_MA=%ld PHASE_OK=%u ADC_CALIBRATED=0 PG=%u WINDOW=%u RUN=%u INDICATORS_OK=%u BRINGUP_REQUIRED=%u\r\n",
      static_cast<unsigned long>(boardMv),peripheralsStarted,pdReadOk,inputs.epr_contract,static_cast<unsigned long>(vbusMv),static_cast<unsigned long>(vmotorMv),
      inputs.brake_preflight_ok, adcValid[0] && millis()-adcSampleAt[0]<=100u,adcMv[1],adcValid[1] && millis()-adcSampleAt[1]<=100u,
      inputs.temperature_deci_c,inputs.temperature_valid,static_cast<long>(phaseMa[0]),static_cast<long>(phaseMa[1]),phaseValid,
      inputs.motor_power_good,inputs.vmotor_in_range,control.mcu_run && inputs.driver_ready,indicatorsReady,
      !motionQualified);
    reply(status);
  } else if(!strcmp(command,"HELP")) {
    reply("PD1180 commissioning: STATUS, DRIVER, DISARM, ARM (blocked), HELP. No motion enabled.\r\n");
  } else reply("ERR unknown command\r\n");
}
void setup() {
  tmc.frame=motorFrame;
  output(PD1180_PIN_MCU_RUN,false); output(PD1180_PIN_POWER_PERMIT,false); output(PD1180_PIN_SD_MODE,false);
  // Removed field-bus and unassigned general I/O pins remain in reset input state.
  releaseChipSelect(PD1180_PIN_TMC_CS_N); releaseChipSelect(PD1180_PIN_ENC_CS_N); releaseChipSelect(PD1180_PIN_FLASH_CS_N);
  output(PD1180_PIN_STATUS_GPIO,false);
  pinMode(pin(PD1180_PIN_USER_BUTTON_N), INPUT); // R133 is on the MCU rail.
  analogReadResolution(12);
  pd1180_control_reset(&control);
  IWatchdog.begin(250000); // 250 ms nominal; never serviced by interrupt handlers.
  initializeSuspendTimer();
  stopPeripherals();
  lastTick=lastPoll=millis();
}
void loop() {
  // Qualification is a firmware build decision, never a USB command override.
  if (!motionQualified) safeOutputs();
  const uint32_t now=millis();
  vbusMv = dividerMillivolts(PD1180_PIN_USB_VBUS_SENSE,1000,47);
  if (usbStarted && usbIsSuspended() && vbusMv >= 3000u) {
    if (!wasSuspended) {
      stopPeripherals(); boardPower = {};
      commandLength=0; commandOverflow=false; responseLength=responseSent=0;
      digitalWrite(pin(PD1180_PIN_STATUS_GPIO),LOW);
      wasSuspended=true;
    }
    IWatchdog.reload();
    sleepWhileUsbSuspended();
    return;
  }
  if (wasSuspended) { wasSuspended=false; lastTick=lastPoll=now; }
  boardMv = dividerMillivolts(PD1180_PIN_BOARD_POWER_SENSE,10,10);
  const bool boardReady=pd1180_board_power_update(&boardPower,boardMv,now);
  if (peripheralsStarted && !boardReady) stopPeripherals();
  if (!peripheralsStarted && boardReady) startPeripherals();
  if (peripheralsStarted) {
    pollTemperature(now); pollBusAdc(now); samplePhaseCurrent(now);
    if (!temperatureConfigured || now-lastTemperatureSample>500u) inputs.temperature_valid=false;
    if(now-lastPoll >= 50u) { lastPoll=now; pollPower(); }
    pollDriver(now);
  }
  if(!usbStarted && vbusMv >= 4000u) { SerialUSB.begin(); usbStarted=true; }
  if(usbStarted && vbusMv < 3000u) {
    SerialUSB.end(); usbStarted=false; commandLength=0; commandOverflow=false;
    responseLength=responseSent=0;
    safeOutputs(); pd1180_local_motion_cancel(&localMotion); pd1180_control_disarm(&control);
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
  }
  if (motionQualified) {
    digitalWrite(pin(PD1180_PIN_POWER_PERMIT),control.power_permit?HIGH:LOW);
    digitalWrite(pin(PD1180_PIN_SD_MODE),LOW); // TMC internal SPI ramp, never STEP/DIR.
    digitalWrite(pin(PD1180_PIN_MCU_RUN),control.mcu_run && inputs.driver_ready?HIGH:LOW);
  } else safeOutputs();
  pd1180_local_motion_update(&localMotion,&control,&inputs,&tmc,
    digitalRead(pin(PD1180_PIN_USER_BUTTON_N))==LOW,tick,
    motionQualified && peripheralsStarted);
  // Apply cancellations and transport/stop-timeout failures before any other work.
  if (!control.armed || control.fault_latched) safeOutputs();
  pollIndicators(tick);
  IWatchdog.reload();
}
