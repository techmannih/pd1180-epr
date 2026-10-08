import { readFile, writeFile } from 'node:fs/promises'

const check = process.argv.includes('--check')
const pinmap = JSON.parse(await readFile(new URL('../docs/firmware-pinmap.json', import.meta.url)))
// Independent manufacturer package order: ST DS13560 rev 6, figure 5,
// STM32G0B1CxT GP (not the different CxTxN package variant).
const physicalPins = ('PC13 PC14 PC15 VBAT VREF+ VDD/VDDA VSS/VSSA PF0 PF1 PF2 ' +
  'PA0 PA1 PA2 PA3 PA4 PA5 PA6 PA7 PB0 PB1 PB2 PB10 PB11 PB12 ' +
  'PB13 PB14 PB15 PA8 PA9 PC6 PC7 PA10 PA11 PA12 PA13 PA14 PA15 ' +
  'PD0 PD1 PD2 PD3 PB3 PB4 PB5 PB6 PB7 PB8 PB9').split(' ')
for (const [pin, gpio] of Object.entries(pinmap.pin_to_gpio)) {
  if (physicalPins[Number(pin.slice(3)) - 1] !== gpio) throw new Error(`${pin}: ${gpio} conflicts with ST LQFP48 GP pinout`)
}
const source = await readFile(new URL('../index.circuit.tsx', import.meta.url), 'utf8')
const mcu = source.match(/<STM32G0B1\s+name="U16"[\s\S]*?\/>/)?.[0]
for (const [pin, net] of Object.entries(pinmap.pin_to_net)) {
  if (!mcu?.includes(`${pin}: "net.${net}"`)) throw new Error(`${pin}: firmware net ${net} differs from U16`)
}
const entries = Object.entries(pinmap.pin_to_net)
  .filter(([pin]) => pinmap.pin_to_gpio[pin])
  .map(([pin, net]) => ({ pin: Number(pin.slice(3)), gpio: pinmap.pin_to_gpio[pin], net }))
  .sort((a, b) => a.pin - b.pin)

const lines = [
  '#pragma once',
  '',
  '#include <stdint.h>',
  '',
  'typedef struct { char port; uint8_t bit; uint8_t package_pin; } board_pin_t;',
  '',
  '#define BOARD_PIN(PORT, BIT, PACKAGE_PIN) ((board_pin_t){ (PORT), (BIT), (PACKAGE_PIN) })',
  '',
  ...entries.map(({ pin, gpio, net }) => {
    const [, port, bit] = gpio.match(/^P([A-Z])(\d+)$/)
    return `#define PD1180_PIN_${net.padEnd(17)} BOARD_PIN('${port}', ${bit}, ${pin})`
  }),
  '',
  '#define BOARD_HSE_HZ 16000000u',
  '#define BOARD_USB_CLOCK_HZ 48000000u',
  '',
  '/* Generated from docs/firmware-pinmap.json; do not edit by hand. */',
  '',
]
const output = lines.join('\n')
const destination = new URL('../firmware/include/board_pins.h', import.meta.url)
if (check) {
  const existing = await readFile(destination, 'utf8').catch(() => '')
  if (existing !== output) throw new Error('firmware/include/board_pins.h is stale; run bun run generate:firmware-pins')
  console.log(`Firmware pin header is current (${entries.length} signals).`)
} else {
  await writeFile(destination, output)
  console.log(`Generated firmware/include/board_pins.h (${entries.length} signals).`)
}
