#include <cassert>
#include "../target/main.cpp"

static bool suspended;
void initializeSuspendTimer() {}
bool usbIsSuspended() { return suspended; }
void sleepWhileUsbSuspended() {}

static void start(unsigned now) {
  fakeNow=now;
  startPeripherals();
  assert(fakeLevels[pin(PD1180_PIN_STATUS_GPIO)]==HIGH);
}
static void expectReset() {
  assert(fakeLevels[pin(PD1180_PIN_STATUS_GPIO)]==LOW);
  assert(!indicatorsReady && !indicatorResetReleased);
}
int main() {
  setup(); expectReset();
  pdBus.indicatorPresent=true;
  start(100);
  pollIndicators(100); assert(pdBus.indicatorWrites==0); // Reset release settle time.
  pollIndicators(101); assert(indicatorsReady);
  assert((pdBus.indicatorLog[0]==std::array<uint8_t,2>{1,0x07})); // Latch off first.
  assert((pdBus.indicatorLog[1]==std::array<uint8_t,2>{2,0x00}));
  assert((pdBus.indicatorLog[2]==std::array<uint8_t,2>{3,0xF0})); // Only P0..3 outputs.
  assert(pdBus.indicatorRegisters[1]==0x03); // Blue commissioning indication.
  assert(!control.mcu_run && !control.power_permit);

  control.fault_latched=true;
  pollIndicators(2001); assert(pdBus.indicatorRegisters[1]==0x0E); // Red + alarm.
  pollIndicators(2251); assert(pdBus.indicatorRegisters[1]==0x06); // Alarm bounded to 200 ms.
  control.fault_latched=false;
  pollIndicators(2301); assert(pdBus.indicatorRegisters[1]==0x03);

  // An expander brownout must trigger a reset, then replay the safe latch/config sequence.
  pdBus.indicatorRegisters[3]=0xFF;
  pollIndicators(2351); expectReset();
  pollIndicators(3350); expectReset();
  pollIndicators(3351); assert(indicatorResetReleased && !indicatorsReady);
  pollIndicators(3401); assert(indicatorsReady && pdBus.indicatorRegisters[3]==0xF0);

  control.fault_latched=true; pollIndicators(4001);
  assert(pdBus.indicatorRegisters[1]&8);
  const auto count=pdBus.transactions;
  stopPeripherals(); expectReset();
  assert(pdBus.transactions==count); // Power loss/suspend silence requires no functioning bus.
  pollIndicators(4500); assert(pdBus.transactions==count);

  // A failure at any initialization write leaves outputs reset, never partly enabled.
  for (unsigned failed=1;failed<=3;++failed) {
    pdBus.indicatorWrites=0; pdBus.failIndicatorWrite=failed;
    start(5000+failed*2000);
    pollIndicators(fakeNow+1); expectReset();
  }
  pdBus.failIndicatorWrite=0;
  start(12000); pollIndicators(12001); assert(indicatorsReady);
  pdBus.indicatorPresent=false;
  pollIndicators(12051); expectReset();
  suspended=usbStarted=true;
  const auto suspendedCount=pdBus.transactions;
  pollIndicators(14000); // Suspend holds RESET low and permits no I2C.
  pollIndicators(14051); expectReset();
  assert(pdBus.transactions==suspendedCount);
  puts("PASS: indicator polarity, safe initialization, reset, bounded alarm, brownout and bus faults");
}
