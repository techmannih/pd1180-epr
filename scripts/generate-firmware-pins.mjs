import { readFile, writeFile } from 'node:fs/promises'

const check = process.argv.includes('--check')
const pinmap = JSON.parse(await readFile(new URL('../docs/firmware-pinmap.json', import.meta.url)))
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
    return `#define PIN_${net.padEnd(17)} BOARD_PIN('${port}', ${bit}, ${pin})`
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
