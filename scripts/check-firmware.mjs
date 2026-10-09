import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'

await mkdir('firmware/build', { recursive: true })
const compiler = process.env.CC || 'cc'
const common = ['-std=c11', '-Wall', '-Wextra', '-Werror', '-Wpedantic', '-Ifirmware/include',
  'firmware/src/control.c', 'firmware/src/telemetry.c', 'firmware/src/pd_contract.c', 'firmware/src/tmc5160_config.c']

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)))
  })
}

await run(compiler, [...common, 'firmware/tests/test_control.c', '-o', 'firmware/build/control_tests'])
await run('firmware/build/control_tests', [])
await run(compiler, [...common, 'firmware/src/main.c', '-o', 'firmware/build/pd1180_firmware_sim'])
await run('firmware/build/pd1180_firmware_sim', [])
console.log('Firmware safety logic and pin contract compiled and passed.')
