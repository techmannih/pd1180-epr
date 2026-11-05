#include <cassert>
#include "../target/main.cpp"

static bool suspended;
static unsigned sleeps;
static unsigned suspendEntries,suspendExits;
void initializeSuspendTimer() {}
void enterUsbSuspendPower() {++suspendEntries;}
void leaveUsbSuspendPower() {++suspendExits;}
bool usbIsSuspended() { return suspended; }
void sleepWhileUsbSuspended() { ++sleeps; }

static void advance(unsigned ms) { fakeNow+=ms; loop(); }
static void expectSafe() {
  for (auto p : {PD1180_PIN_MCU_RUN, PD1180_PIN_POWER_PERMIT, PD1180_PIN_DRV_SLEEP_N})
    assert(fakeLevels[pin(p)]==LOW);
  for (auto p : {PD1180_PIN_DRV_CS_N}) {
    assert(fakeModes[pin(p)]==INPUT);
    assert(fakeLevels[pin(p)]==HIGH);
  }
}
int main() {
  uint8_t identity[8] = {'P','D','1','1','8','0','4','1'};
  assert(pdConfigurationMatches(identity));
  for (unsigned i=0;i<sizeof(identity);i++) {identity[i]^=1; assert(!pdConfigurationMatches(identity)); identity[i]^=1;}
  memset(identity,0,sizeof(identity)); assert(!pdConfigurationMatches(identity));
  assert(!pdImageVerified && !motionQualified);
  // Real target call sites: raw PD measurement is independent of VMOTOR and
  // a valid PDO alone must not assert PD_READY. Neither eFuse PG nor ADC alone is enough.
  pdBus.pdVoltagePresent=true;
  pdReadOk=peripheralsStarted=inputs.epr_contract=true;
  memcpy(pdIdentity,identity,sizeof(identity)); // identity was deliberately cleared above
  memcpy(pdIdentity,"PD118041",8);
  lastGoodSample=20;
  fakeNow=10;pollPdVoltage(10);updatePdReady(10);assert(!inputs.pd_power_good);
  fakeNow=20;pollPdVoltage(20);updatePdReady(20);
  assert(pdVoltage.millivolts==48000 && inputs.pd_power_good && !inputs.motor_power_good);
  inputs.epr_contract=false;updatePdReady(20);assert(!inputs.pd_power_good);
  inputs.epr_contract=true;pdReadOk=false;updatePdReady(20);assert(!inputs.pd_power_good);
  pdReadOk=true;updatePdReady(121);assert(!inputs.pd_power_good);
  lastGoodSample=121;updatePdReady(121);assert(!inputs.pd_power_good); // ADC itself is stale.
  fakeNow=40;pollPdVoltage(40);pdBus.pdVoltageFail=true;
  fakeNow=50;pollPdVoltage(50);updatePdReady(50);assert(!pdVoltage.valid && !inputs.pd_power_good);
  pdBus.pdVoltageFail=false;pdBus.pdVoltagePresent=false;
  invalidateTelemetry();peripheralsStarted=false;lastPdVoltagePoll=0;fakeNow=0;
  // Exercise the actual mux scan and target call site: bus=200 ms, return=240
  // ms. Q16 goes low after the bus reading; the next scan recovers at 300 ms.
  pdBus.adcPresent=true;
  control.power_permit=true;
  for(unsigned t=10;t<=180;t+=10) {
    fakeNow=t; pollBusAdc(t);
    if(t%60==0) pollPower();
  }
  assert(brakePreflight.ready);
  control.mcu_run=true;
  for(unsigned t=190;t<=300;t+=10) {
    fakeNow=t;
    pdBus.adcRaw[2]=(t>200 && t<=240) ? 0 : 19762;
    pollBusAdc(t);
    if(t==240) {
      assert(adcSampleAt[0]==200 && adcSampleAt[2]==240);
      pollPower(); assert(inputs.brake_preflight_ok && !brakePreflight.faulted);
    }
    if(t==250 || t==300) {
      pollPower(); assert(inputs.brake_preflight_ok && !brakePreflight.faulted);
    }
  }
  assert(!brakePreflight.mismatch_pending);
  invalidateTelemetry(); fakeNow=lastAdcPoll=0; pdBus.adcChannels.clear();
  pdBus.adcPresent=true;
  for (unsigned n=1;n<=6;n++) pollBusAdc(n*10u);
  assert((pdBus.adcChannels==std::vector<unsigned>{0,1,2}));
  assert(adcValid[0] && adcValid[1] && adcValid[2]);
  assert(adcMv[2]==2470 && adcSampleAt[2]==60);
  pdBus.adcFail=true; pollBusAdc(70);
  assert(!adcValid[0] && !adcValid[1] && !adcValid[2]);
  pdBus.adcPresent=false; pdBus.adcFail=false; pdBus.transactions=0;
  invalidateTelemetry(); lastAdcPoll=0;
  fakeAdc[pin(PD1180_PIN_USB_VBUS_SENSE)]=279; // Approximately 5 V DATA supply.
  setup(); assert(!TinyUSBDevice.initialized); yield(); assert(usbTasks==0); advance(1);
  yield(); assert(usbTasks==1);
  assert(TinyUSBDevice.attached);
  assert(usbStarted && !peripheralsStarted && !pdBus.started);
  assert(pdBus.transactions==0);
  expectSafe();
  Serial.input="ARM\n";advance(1);advance(1);
  assert(Serial.output.find("BLOCKED")!=std::string::npos);
  expectSafe();

  fakeLevels[pin(PD1180_PIN_LOGIC_PG_MCU)]=HIGH;
  advance(1);assert(!peripheralsStarted);
  advance(19);assert(!peripheralsStarted);
  advance(1);assert(peripheralsStarted && pdBus.started);
  assert(fakeLevels[pin(PD1180_PIN_SENSE_EN)]==HIGH);
  phaseValid=true;samplePhaseCurrent(fakeNow);assert(!phaseValid);
  encoderSample.valid=true;pollEncoder(fakeNow);assert(!encoderSample.valid);
  assert(!spiStarted && motorSpi.transactions==0);
  inputs.motor_power_good=inputs.vmotor_in_range=true;
  pollDriver(fakeNow+20);
  assert(driverAwake && !spiStarted);
  pollDriver(fakeNow+22);
  assert(spiStarted && driverStatus.fault && !inputs.driver_ready);
  inputs.motor_power_good=false; pollDriver(fakeNow+23);
  assert(!spiStarted && fakeModes[pin(PD1180_PIN_SPI_MOSI)]==INPUT);
  encoderSample.valid=true;
  adcValid[0]=adcValid[2]=phaseValid=inputs.temperature_valid=true;
  brakePreflight.ready=inputs.brake_preflight_ok=true;
  fakeLevels[pin(PD1180_PIN_LOGIC_PG_MCU)]=LOW;
  advance(1);
  assert(!peripheralsStarted && !pdBus.started && !adcValid[0] && !adcValid[2] && !brakePreflight.ready && !inputs.brake_preflight_ok && !phaseValid && !inputs.temperature_valid);
  assert(!encoderSample.valid && !pdVoltage.valid && !inputs.pd_power_good);
  assert(fakeModes[pin(PD1180_PIN_PD_SCL)]==INPUT);
  expectSafe();

  fakeLevels[pin(PD1180_PIN_LOGIC_PG_MCU)]=HIGH;
  advance(1);advance(20);assert(peripheralsStarted);
  commandLength=3; responseLength=10;
  const auto reads=pdBus.transactions, reloads=watchdogReloads;
  suspended=true;advance(1);
  assert(sleeps==1 && watchdogReloads==reloads+1);
  assert(suspendEntries==1 && timerStops==1 && !stepTimerReady);
  assert(fakeLevels[pin(PD1180_PIN_SENSE_EN)]==LOW);
  assert(pdBus.transactions==reads && !pdBus.started && !peripheralsStarted);
  assert(commandLength==0 && responseLength==0 && fakeLevels[pin(PD1180_PIN_STATUS_GPIO)]==LOW);
  expectSafe();
  suspended=false;advance(1);assert(!peripheralsStarted);
  assert(suspendExits==1 && stepTimerReady && timerStarts==2);
  assert(fakeLevels[pin(PD1180_PIN_SENSE_EN)]==LOW);
  advance(20);assert(peripheralsStarted);
  expectSafe();

  suspended=true;advance(1);
  fakeAdc[pin(PD1180_PIN_USB_VBUS_SENSE)]=0;advance(1);
  assert(!usbStarted && !TinyUSBDevice.attached);
  expectSafe();
  // Timer/main-loop failure must latch a stop, never resume on the next lease.
  suspended=false;
  for(auto p:{PD1180_PIN_MOTOR_PG,PD1180_PIN_VMOTOR_OK,PD1180_PIN_EFUSE_FAULT_N,PD1180_PIN_DRV_FAULT_N,PD1180_PIN_MCU_RUN}) fakeLevels[pin(p)]=HIGH;
  fakeLevels[pin(PD1180_PIN_POWER_PERMIT)]=HIGH;
  desiredMotion=true;
  step_motion_renew(&stepMotion,time_us_32(),true);
  fakeNow+=26;stepInterrupt(nullptr);
  assert(stepTimerFault && !stepMotion.active);
  assert(fakeLevels[pin(PD1180_PIN_MCU_RUN)]==LOW && fakeLevels[pin(PD1180_PIN_POWER_PERMIT)]==LOW);
  advance(1); assert(control.fault_latched && !desiredMotion);
  advance(1); assert(control.fault_latched && !stepMotion.active);
  puts("PASS: target USB-only startup, power loss/recovery, suspend/resume, detach and ARM lock");
}
