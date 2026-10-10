#include <cassert>
#include "../target/main.cpp"

static bool suspended;
static unsigned sleeps;
void initializeSuspendTimer() {}
bool usbIsSuspended() { return suspended; }
void sleepWhileUsbSuspended() { ++sleeps; }

static void advance(unsigned ms) { fakeNow+=ms; loop(); }
static void expectSafe() {
  for (auto p : {PD1180_PIN_MCU_RUN, PD1180_PIN_POWER_PERMIT, PD1180_PIN_SD_MODE,
                 PD1180_PIN_RS485_DE, PD1180_PIN_OUT0_DRIVE, PD1180_PIN_OUT1_DRIVE})
    assert(fakeLevels[pin(p)]==LOW);
  for (auto p : {PD1180_PIN_TMC_CS_N, PD1180_PIN_ENC_CS_N, PD1180_PIN_FLASH_CS_N}) {
    assert(fakeModes[pin(p)]==OUTPUT_OPEN_DRAIN);
    assert(fakeLevels[pin(p)]==HIGH);
  }
}
int main() {
  fakeAdc[pin(PD1180_PIN_USB_VBUS_SENSE)]=279; // Approximately 5 V DATA supply.
  setup(); advance(1);
  assert(usbStarted && !peripheralsStarted && !pdBus.started);
  assert(pdBus.transactions==0);
  expectSafe();
  SerialUSB.input="ARM\n";advance(1);advance(1);
  assert(SerialUSB.output.find("BLOCKED")!=std::string::npos);
  expectSafe();

  fakeAdc[pin(PD1180_PIN_BOARD_POWER_SENSE)]=2048;
  advance(1);assert(!peripheralsStarted);
  advance(19);assert(!peripheralsStarted);
  advance(1);assert(peripheralsStarted && pdBus.started);
  assert(!spiStarted && motorSpi.transactions==0);
  inputs.motor_power_good=inputs.vmotor_in_range=true;
  pollDriver(fakeNow+20);
  assert(spiStarted && !tmcStatus.valid && !inputs.driver_ready);
  inputs.motor_power_good=false; pollDriver(fakeNow+21);
  assert(!spiStarted && fakeModes[pin(PD1180_PIN_SPI_MOSI)]==INPUT_ANALOG);
  adcValid[0]=phaseValid=inputs.temperature_valid=true;
  fakeAdc[pin(PD1180_PIN_BOARD_POWER_SENSE)]=0;
  advance(1);
  assert(!peripheralsStarted && !pdBus.started && !adcValid[0] && !phaseValid && !inputs.temperature_valid);
  assert(fakeModes[pin(PD1180_PIN_PD_SCL)]==INPUT_ANALOG);
  expectSafe();

  fakeAdc[pin(PD1180_PIN_BOARD_POWER_SENSE)]=2048;
  advance(1);advance(20);assert(peripheralsStarted);
  commandLength=3; responseLength=10;
  const auto reads=pdBus.transactions, reloads=IWatchdog.reloads;
  suspended=true;advance(1);
  assert(sleeps==1 && IWatchdog.reloads==reloads+1);
  assert(pdBus.transactions==reads && !pdBus.started && !peripheralsStarted);
  assert(commandLength==0 && responseLength==0 && fakeLevels[pin(PD1180_PIN_STATUS_GPIO)]==LOW);
  expectSafe();
  suspended=false;advance(1);assert(!peripheralsStarted);
  advance(20);assert(peripheralsStarted);
  expectSafe();

  suspended=true;advance(1);
  fakeAdc[pin(PD1180_PIN_USB_VBUS_SENSE)]=0;advance(1);
  assert(!usbStarted && !SerialUSB.started);
  expectSafe();
  puts("PASS: target USB-only startup, power loss/recovery, suspend/resume, detach and ARM lock");
}
