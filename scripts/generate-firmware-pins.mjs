import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const check = process.argv.includes('--check')
const pinmap = JSON.parse(await readFile('docs/firmware-pinmap.json'))
// RP2040 datasheet, QFN-56 package table; exposed GND is pad 57.
const gpioPins = [2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,27,28,29,30,31,32,34,35,36,37,38,39,40,41]
assert.deepEqual(pinmap.packagePinByGpio, gpioPins)
const source = await readFile('index.circuit.tsx','utf8')
const mcu = source.match(/<RP2040\s+name="U16"[\s\S]*?\/>/)?.[0]
assert(mcu, 'U16 must be the RP2040 package')
const actual = JSON.parse(mcu.match(/connections=\{(\{.*?\})\}/s)[1])
for (const [pin,net] of Object.entries(pinmap.mcu)) assert.equal(actual[pin],`net.${net}`,`${pin} contract differs from source`)
const entries = Object.entries(pinmap.gpio).map(([gpio,net])=>({gpio:Number(gpio),net,pin:gpioPins[Number(gpio)]})).sort((a,b)=>a.gpio-b.gpio)
assert.equal(new Set(entries.map(e=>e.net)).size,entries.length)
for (const {gpio,net,pin} of entries) assert.equal(actual[`pin${pin}`],`net.${net}`,`GPIO${gpio} has incorrect package pin`)
// Fixed-function bus checks: I2C0 GP20/21, I2C1 GP14/15, SPI0 GP16..19.
for (const [gpio,net] of Object.entries({14:'ENC_SDA',15:'ENC_SCL',16:'SPI_MISO',17:'DRV_CS_N',18:'SPI_SCK',19:'SPI_MOSI',20:'PD_SDA',21:'PD_SCL'})) assert.equal(pinmap.gpio[gpio],net)
for(const [pin,net] of Object.entries({19:'GND',23:'V1V1_MCU',45:'V1V1_MCU',50:'V1V1_MCU',46:'USB_DM',47:'USB_DP',51:'QSPI_SD3',52:'QSPI_SCK',53:'QSPI_SD0',54:'QSPI_SD2',55:'QSPI_SD1',56:'FLASH_CS_N',57:'GND'})) assert.equal(actual[`pin${pin}`],`net.${net}`)
const output = [
 '#pragma once','','#include <stdint.h>','',
 'typedef struct { uint8_t gpio; uint8_t package_pin; } board_pin_t;','',
 '#define BOARD_PIN(GPIO, PACKAGE_PIN) ((board_pin_t){ (GPIO), (PACKAGE_PIN) })','',
 ...entries.map(({gpio,pin,net})=>`#define PD1180_PIN_${net.padEnd(18)} BOARD_PIN(${gpio}, ${pin})`),'',
 '#define BOARD_XOSC_HZ 12000000u','#define BOARD_USB_CLOCK_HZ 48000000u','',
 '/* Generated from docs/firmware-pinmap.json; dedicated QSPI/USB/SWD are not GPIO. */','',
].join('\n')
const destination='firmware/include/board_pins.h'
if(check) assert.equal(await readFile(destination,'utf8'),output,'Run generate:firmware-pins')
else await writeFile(destination,output)
console.log(`RP2040 package/bus contract checked (${entries.length} GPIO signals).`)
