#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <hardware/watchdog.h>
#include <hardware/sync.h>
#include <pico/time.h>
#include <Adafruit_TinyUSB.h>
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
#include "drv8462.h"
#include "as5600.h"
#include "step_motion.h"



}

// Commissioning image: motor outputs stay locked until the new ECO has passed
// route checks, programmed PD-image verification and powered bring-up.
// Source and target are RP2040/DDV; release remains locked pending routing and physical validation.
static constexpr bool motionWiringVerified = false;
static constexpr bool pdImageVerified = false;
static constexpr bool brakeHardwareVerified = false;
static constexpr bool rp2040UsbPowerVerified = false;
static constexpr bool motionQualified = motionWiringVerified && pdImageVerified && brakeHardwareVerified && rp2040UsbPowerVerified;
static pd1180_brake_preflight_t brakePreflight;
static TwoWire pdBus(i2c0, 20, 21);
static TwoWire encoderBus(i2c1, 14, 15);
static SPIClassRP2040 motorSpi(spi0, 16, 17, 18, 19);
static bool spiStarted;
static bool motorFrame(void *, const uint8_t tx[2], uint8_t rx[2]);
static drv8462_t driver = {};
static drv8462_status_t driverStatus;
static bool driverAttempted, driverAwake;
static uint32_t driverWakeAt;
static uint16_t currentMa;
static as5600_sample_t encoderSample;
static uint32_t lastEncoderPoll;
static step_motion_t stepMotion;
static repeating_timer_t stepTimer;
static volatile bool stepTimerFault;
static bool stepTimerReady;
static bool desiredMotion, buttonCandidate=true, buttonStable=true, buttonReleased;
static uint32_t buttonChanged;
static uint32_t lastDriverPoll;
static pd1180_control_t control;

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
static bool pdReadOk, usbStarted, usbInitialized;
static char command[64];
static size_t commandLength;
static bool commandOverflow;

// The pinned core's weak yield calls a USB mutex before it is initialized.
// Guard both TinyUSB service calls until DATA VBUS permits initialization.
extern "C" void yield() {
  if(usbInitialized) {TinyUSB_Device_Task(); TinyUSB_Device_FlushCDC();}
}

static pin_size_t pin(board_pin_t p) { return p.gpio; }
static void stopSteps() {
  const uint32_t flags=save_and_disable_interrupts();
  step_motion_stop(&stepMotion);
  gpio_put(PD1180_PIN_DRV_STEP.gpio,0);
  restore_interrupts(flags);
}
static void cancelMotion() { stopSteps(); desiredMotion=false; buttonReleased=false; }
static void resetDriver() {
  drv8462_invalidate(&driver); driverStatus={}; driverAttempted=false;
  driverAwake=false; gpio_put(PD1180_PIN_DRV_SLEEP_N.gpio,0);
}
static bool stepInterrupt(repeating_timer_t *) {
  const bool ok=gpio_get(PD1180_PIN_MOTOR_PG.gpio) && gpio_get(PD1180_PIN_VMOTOR_OK.gpio) &&
    gpio_get(PD1180_PIN_EFUSE_FAULT_N.gpio) && gpio_get(PD1180_PIN_DRV_FAULT_N.gpio) &&
    gpio_get(PD1180_PIN_MCU_RUN.gpio);
  const uint32_t now=time_us_32();
  if(stepMotion.active && (!ok || now-stepMotion.lease_us>=25000u || now-stepMotion.last_us>100u)) {
    stepTimerFault=true;
    gpio_put(PD1180_PIN_MCU_RUN.gpio,0);
    gpio_put(PD1180_PIN_POWER_PERMIT.gpio,0);
  }
  gpio_put(PD1180_PIN_DRV_STEP.gpio,step_motion_tick(&stepMotion,now,ok));
  return true;
}
static void safeOutputs() {
  digitalWrite(pin(PD1180_PIN_MCU_RUN), LOW);
  digitalWrite(pin(PD1180_PIN_POWER_PERMIT), LOW);
  stopSteps();
}
static void output(board_pin_t p, bool high) {
  digitalWrite(pin(p), high ? HIGH : LOW); // Set latch before making pin an output.
  pinMode(pin(p), OUTPUT);
}
static const board_pin_t boardInputs[] = {PD1180_PIN_EFUSE_FAULT_N,PD1180_PIN_MOTOR_PG,PD1180_PIN_VMOTOR_OK,
  PD1180_PIN_DRV_FAULT_N,PD1180_PIN_DRV_HOME_N};
static void releaseChipSelect(board_pin_t p) {
  digitalWrite(pin(p), HIGH);
  pinMode(pin(p), INPUT); // External board-domain pullup; never back-power an absent rail.
}
static void invalidateTelemetry() {
  inputs = {};
  brakePreflight = {};
  adcChannel = 0;
  cancelMotion();
  temperatureConfigured = false;
  adcPending = false;
  adcValid[0] = adcValid[1] = adcValid[2] = phaseValid = pdReadOk = false;
  adcMv[0] = adcMv[1] = adcMv[2] = 0;
  phaseMa[0] = phaseMa[1] = 0;
  vmotorMv = 0;
  resetDriver();
  encoderSample={};
  pd1180_control_disarm(&control);
}
static void stopPeripherals() {
  safeOutputs();
  // U35 RESET is hardware-gated: no I2C transaction is needed to silence BZ1.
  digitalWrite(pin(PD1180_PIN_STATUS_GPIO), LOW);
  indicatorsReady = indicatorResetReleased = false;
  if (peripheralsStarted) { pdBus.end(); encoderBus.end(); }
  pinMode(pin(PD1180_PIN_ENC_SDA),INPUT); pinMode(pin(PD1180_PIN_ENC_SCL),INPUT);
  if (spiStarted) motorSpi.end();
  spiStarted=false;
  releaseChipSelect(PD1180_PIN_DRV_CS_N);
  for (auto p : {PD1180_PIN_SPI_SCK, PD1180_PIN_SPI_MOSI, PD1180_PIN_SPI_MISO})
    pinMode(pin(p), INPUT);
  // No internal pullups or push-pull highs may energize the dead board rail.
  pinMode(pin(PD1180_PIN_PD_SCL), INPUT);
  pinMode(pin(PD1180_PIN_PD_SDA), INPUT);
  for (auto p : boardInputs) pinMode(pin(p), INPUT);
  peripheralsStarted = false;
  invalidateTelemetry();
}
static void startPeripherals() {
  for (auto p : boardInputs) pinMode(pin(p), INPUT);
  pdBus.begin(); pdBus.setClock(100000); pdBus.setTimeout(5);
  encoderBus.begin(); encoderBus.setClock(100000); encoderBus.setTimeout(5);
  peripheralsStarted = true;
  temperatureConfiguredAt = millis();
  indicatorAttemptAt = millis();
  digitalWrite(pin(PD1180_PIN_STATUS_GPIO), HIGH);
  indicatorResetReleased = true;
}
// U7 needs VMOTOR as well as VCC_IO. Do not clock or drive its inputs when
// the motor domain is absent, even if the encoder/board logic is powered.
static bool motorFrame(void *, const uint8_t tx[2], uint8_t rx[2]) {
  if (!spiStarted || !peripheralsStarted || !inputs.motor_power_good ||
      !inputs.vmotor_in_range || (usbStarted && usbIsSuspended())) return false;
  motorSpi.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE1));
  digitalWrite(pin(PD1180_PIN_DRV_CS_N), LOW);
  pinMode(pin(PD1180_PIN_DRV_CS_N),OUTPUT);
  for (unsigned i=0;i<2;++i) rx[i]=motorSpi.transfer(tx[i]);
  releaseChipSelect(PD1180_PIN_DRV_CS_N);
  motorSpi.endTransaction();
  delayMicroseconds(2); // Explicit CS-high gap; TI timing table requires >=2 us.
  return true;
}
static void pollDriver(uint32_t now) {
  inputs.driver_ready=false;
  if (!inputs.motor_power_good || !inputs.vmotor_in_range) {
    digitalWrite(pin(PD1180_PIN_MCU_RUN),LOW); stopSteps(); resetDriver();
    if(spiStarted) motorSpi.end();
    spiStarted=false;
    for(auto p:{PD1180_PIN_SPI_SCK,PD1180_PIN_SPI_MOSI,PD1180_PIN_SPI_MISO}) pinMode(pin(p),INPUT);
    return;
  }
  if(!driverAwake) {
    digitalWrite(pin(PD1180_PIN_DRV_SLEEP_N),HIGH); driverWakeAt=now; driverAwake=true; return;
  }
  if(now-driverWakeAt<2u) return;
  if(!spiStarted) {motorSpi.begin(); spiStarted=true;}
  if(now-lastDriverPoll<20u) return;
  lastDriverPoll=now;
  if(!motionQualified) { drv8462_status(&driver,&driverStatus); return; }
  if(!control.armed || !control.power_permit) {resetDriver();return;}
  if(!driver.configured) {
    if(driverAttempted) {control.fault_latched=true;return;}
    driverAttempted=true;
    currentMa=DRV8462_BENCH_RMS_MA*control.current_limit_permille/1000u;
    if(!drv8462_configure(&driver,currentMa,!gpio_get(PD1180_PIN_MCU_RUN.gpio)) ||
       !drv8462_enable(&driver,true)) {safeOutputs();control.fault_latched=true;return;}
  }
  const uint16_t requested=DRV8462_BENCH_RMS_MA*control.current_limit_permille/1000u;
  if(requested!=currentMa && !drv8462_set_current(&driver,requested)) {
    safeOutputs();control.fault_latched=true;return;
  }
  currentMa=requested;
  inputs.driver_ready=drv8462_verify(&driver) && drv8462_status(&driver,&driverStatus) &&
    digitalRead(pin(PD1180_PIN_DRV_FAULT_N))==HIGH;
  if(!inputs.driver_ready) {safeOutputs();control.fault_latched=true;}
}
static bool encoderRead(void *, uint8_t reg, uint8_t *bytes, uint8_t count) {
  encoderBus.beginTransmission(0x36); encoderBus.write(reg);
  if(encoderBus.endTransmission(false)!=0 || encoderBus.requestFrom(0x36,(int)count,(int)true)!=count) return false;
  for(uint8_t i=0;i<count;i++) bytes[i]=encoderBus.read();
  return true;
}
static void pollEncoder(uint32_t now) {
  if(now-lastEncoderPoll<100u) return;
  lastEncoderPoll=now; as5600_sample(encoderRead,nullptr,&encoderSample);
}
static void serviceButton(uint32_t now) {
  const bool pressed=digitalRead(pin(PD1180_PIN_USER_BUTTON_N))==LOW;
  if(pressed!=buttonCandidate) {buttonCandidate=pressed;buttonChanged=now;}
  if(now-buttonChanged>=30u && buttonStable!=pressed) {
    buttonStable=pressed;
    if(!pressed) buttonReleased=true;
    else if(buttonReleased) {
      buttonReleased=false;
      if(!motionQualified || !stepTimerReady) return;
      if(control.fault_latched) {
        safeOutputs(); pd1180_control_disarm(&control);resetDriver();desiredMotion=false;
        const uint32_t flags=save_and_disable_interrupts(); stepTimerFault=false; restore_interrupts(flags);
      }
      else if(desiredMotion) {desiredMotion=false;}
      else if(pd1180_control_arm(&control,&inputs)) desiredMotion=true;
    }
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
// PCA9538 (reset buffered into PD_3V3 by U37): A1/A0 grounded (0x70); P0/P1/P2 sink RGB, P3 drives the alarm MOSFET.
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
  const bool fault = control.fault_latched || (driverStatus.valid && driverStatus.fault) ||
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
    millis(), adcSampleAt[0], adcSampleAt[2], vmotorMv, static_cast<uint32_t>(adcMv[2])*991u/51u);
  inputs.watchdog_healthy = true;
  inputs.driver_ready = motionQualified && driver.configured &&
    driverStatus.valid && !driverStatus.fault && millis()-lastDriverPoll<=40u;
  inputs.stop_active = false; // External limit interface removed; local STOP uses the controlled ramp.
}
static void executeCommand() {
  command[commandLength]=0;
  if(!strcmp(command,"DISARM")) {
    safeOutputs(); cancelMotion(); pd1180_control_disarm(&control); resetDriver(); reply("OK DISARM\r\n");
  } else if(!strcmp(command,"ARM")) {
    reply("BLOCKED: use local START/STOP; hardware qualification required\r\n");
  } else if(!strcmp(command,"DRIVER")) {
    char status[160];
    snprintf(status,sizeof(status),"DRV8462_VALID=%u FAULT=%02X DIAG1=%02X DIAG2=%02X CONFIGURED=%u ENCODER_VALID=%u ANGLE=%u\r\n",
      driverStatus.valid,driverStatus.fault,driverStatus.diag1,driverStatus.diag2,driver.configured,
      encoderSample.valid,encoderSample.angle);
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
  driver.frame=motorFrame;
  output(PD1180_PIN_MCU_RUN,false); output(PD1180_PIN_POWER_PERMIT,false); output(PD1180_PIN_DRV_STEP,false); output(PD1180_PIN_DRV_DIR,false); output(PD1180_PIN_DRV_SLEEP_N,false);
  // Removed field-bus and unassigned general I/O pins remain in reset input state.
  releaseChipSelect(PD1180_PIN_DRV_CS_N); // QSPI belongs to the boot ROM/XIP controller; never bit-bang it.
  output(PD1180_PIN_STATUS_GPIO,false);
  pinMode(pin(PD1180_PIN_USER_BUTTON_N), INPUT); // R133 is on the MCU rail.
  analogReadResolution(12);
  pd1180_control_reset(&control);
  watchdog_enable(250,true); // 250 ms nominal; never serviced by interrupt handlers.
  initializeSuspendTimer();
  stepTimerReady=add_repeating_timer_us(-20,stepInterrupt,nullptr,&stepTimer);
  if(!stepTimerReady) stepTimerFault=true;
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
    watchdog_update();
    sleepWhileUsbSuspended();
    return;
  }
  if (wasSuspended) { wasSuspended=false; lastTick=lastPoll=now; }
  boardMv = dividerMillivolts(PD1180_PIN_BOARD_POWER_SENSE,10,10);
  const bool boardReady=pd1180_board_power_update(&boardPower,boardMv,now);
  if (peripheralsStarted && !boardReady) stopPeripherals();
  if (!peripheralsStarted && boardReady) startPeripherals();
  if (peripheralsStarted) {
    pollTemperature(now); pollBusAdc(now); samplePhaseCurrent(now); pollEncoder(now);
    if (!temperatureConfigured || now-lastTemperatureSample>500u) inputs.temperature_valid=false;
    if(now-lastPoll >= 50u) { lastPoll=now; pollPower(); }
    pollDriver(now);
  }
  if(!usbStarted && vbusMv >= 4000u) {
    // NO_USB prevents the Arduino core attaching before our VBUS observation.
    // Initialize once; later cable events only reconnect the same descriptors.
    if(!usbInitialized) { TinyUSB_Device_Init(0); usbInitialized=true; }
    TinyUSBDevice.attach(); usbStarted=true;
  }
  if(usbStarted && vbusMv < 3000u) {
    TinyUSBDevice.detach(); usbStarted=false; commandLength=0; commandOverflow=false;
    responseLength=responseSent=0;
    safeOutputs(); cancelMotion(); pd1180_control_disarm(&control);
  }
  if(usbStarted) {
    if (Serial && responseSent<responseLength) {
      const size_t count=min(responseLength-responseSent,static_cast<size_t>(Serial.availableForWrite()));
      if (count) responseSent+=Serial.write(reinterpret_cast<const uint8_t *>(response)+responseSent,count);
    }
    // Bounded parser: oversized lines are discarded whole, never as command suffixes.
    for(unsigned n=0; n<32 && Serial.available(); ++n) {
      const char c=static_cast<char>(Serial.read());
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

    digitalWrite(pin(PD1180_PIN_MCU_RUN),control.mcu_run && inputs.driver_ready?HIGH:LOW);
  } else safeOutputs();
  if(stepTimerFault) {safeOutputs(); control.fault_latched=true; desiredMotion=false;}
  serviceButton(tick);
  const uint32_t flags=save_and_disable_interrupts();
  if(motionQualified && control.mcu_run && inputs.driver_ready && !control.fault_latched) {
    step_motion_renew(&stepMotion,time_us_32(),desiredMotion);
    if(!desiredMotion && stepMotion.speed_millihz==0) pd1180_control_disarm(&control);
  } else step_motion_stop(&stepMotion);
  restore_interrupts(flags);
  // Apply cancellations and transport/stop-timeout failures before any other work.
  if (!control.armed || control.fault_latched) safeOutputs();
  pollIndicators(tick);
  watchdog_update();
}
