#include <cassert>
#include "../target/main.cpp"
static bool suspended;
void initializeSuspendTimer() {}
void enterUsbSuspendPower() {}
void leaveUsbSuspendPower() {}
bool usbIsSuspended() {return suspended;}
void sleepWhileUsbSuspended() {}
static unsigned stepEdges;
static bool previousStep;
static void advance(unsigned ms) {
  for(unsigned i=0;i<ms;++i) {
    for(fakeMicros=0;fakeMicros<1000;fakeMicros+=20) {
      stepInterrupt(nullptr);
      const bool level=fakeLevels[pin(PD1180_PIN_DRV_STEP)];
      if(level && !previousStep) ++stepEdges;
      previousStep=level;
    }
    fakeMicros=0; ++fakeNow; loop();
  }
}
static void press() {fakeLevels[pin(PD1180_PIN_USER_BUTTON_N)]=LOW;advance(40);fakeLevels[pin(PD1180_PIN_USER_BUTTON_N)]=HIGH;advance(40);}
int main() {
  static_assert(PD1180_TEST_PROFILE==1 || PD1180_TEST_PROFILE==2);
  fakeLevels[pin(PD1180_PIN_USER_BUTTON_N)]=HIGH;
  fakeAdc[pin(PD1180_PIN_USB_VBUS_SENSE)]=279;
  for(auto p:{PD1180_PIN_LOGIC_PG_MCU,PD1180_PIN_EFUSE_FAULT_N,PD1180_PIN_DRV_FAULT_N}) fakeLevels[pin(p)]=HIGH;
  pdBus.pdPresent=pdBus.pdVoltagePresent=pdBus.adcPresent=pdBus.temperaturePresent=true;
  motorSpi.present=true;
  setup();advance(400);
  assert(inputs.pd_power_good && inputs.temperature_valid && inputs.configuration_verified);
  assert(!control.armed && !fakeLevels[pin(PD1180_PIN_POWER_PERMIT)] && stepEdges==0);
  press();advance(1450); // C18 ramp interval: motor power is not yet good.
  assert(control.power_permit && !control.mcu_run && !control.fault_latched && stepEdges==0);
  fakeLevels[pin(PD1180_PIN_MOTOR_PG)]=fakeLevels[pin(PD1180_PIN_VMOTOR_OK)]=HIGH;
  advance(400);
  if(powerTestOnly) {
    assert(control.power_permit && !control.mcu_run && stepEdges==0);
    advance(30000);assert(!control.power_permit && control.fault_latched && stepEdges==0);
  } else {
    assert(control.mcu_run && driver.configured && driverStatus.valid && stepEdges>0);
    assert(currentMa<=800 && driver.torque==27); // quantized nominal ~0.773 A
    advance(12000);
    assert(!control.armed && !control.power_permit && !control.mcu_run && !stepMotion.active);
    const auto stopped=stepEdges;advance(2000);assert(stepEdges==stopped); // no automatic repeat
    press();advance(600);assert(control.mcu_run);
    fakeLevels[pin(PD1180_PIN_DRV_FAULT_N)]=LOW;advance(1);
    assert(!fakeLevels[pin(PD1180_PIN_MCU_RUN)] && !fakeLevels[pin(PD1180_PIN_POWER_PERMIT)]);
    advance(40);assert(control.fault_latched && !desiredMotion);
    fakeLevels[pin(PD1180_PIN_DRV_FAULT_N)]=HIGH;advance(1000);assert(!control.mcu_run);
    press();advance(100);assert(!control.armed); // acknowledge only
    press();advance(600);assert(control.mcu_run);
    suspended=true;advance(1);assert(!control.mcu_run && !control.power_permit && !desiredMotion);
    suspended=false;advance(800);assert(!control.armed && !control.mcu_run);
  }
  puts(powerTestOnly ? "PASS: stationary profile powers bus, never STEP/ENABLE, expires and latches" : "PASS: real target delayed startup, SPI readback, bounded motion/stop, fault latch and suspend");
}
