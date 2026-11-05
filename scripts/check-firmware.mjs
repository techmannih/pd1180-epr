import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'

await mkdir('firmware/build', { recursive: true })
const compiler = process.env.CC || 'cc'
const common = ['-std=c11', '-Wall', '-Wextra', '-Werror', '-Wpedantic', '-Ifirmware/include',
  'firmware/src/power_domain.c', 'firmware/src/control.c', 'firmware/src/brake_preflight.c', 'firmware/src/telemetry.c', 'firmware/src/pd_contract.c', 'firmware/src/pd_voltage.c', 'firmware/src/drv8462.c', 'firmware/src/step_motion.c', 'firmware/src/as5600.c']

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)))
  })
}

await run(compiler, [...common, 'firmware/tests/test_brake_preflight.c', '-o', 'firmware/build/brake_preflight_tests'])
await run('firmware/build/brake_preflight_tests', [])
await run(compiler, [...common, 'firmware/tests/test_control.c', '-o', 'firmware/build/control_tests'])
await run('firmware/build/control_tests', [])
await run(compiler, [...common, 'firmware/tests/test_rp2040_driver.c', '-o', 'firmware/build/rp2040_driver_tests'])
await run('firmware/build/rp2040_driver_tests', [])
await run(compiler, [...common, 'firmware/tests/test_pd_voltage.c', '-o', 'firmware/build/pd_voltage_tests'])
await run('firmware/build/pd_voltage_tests', [])
await run(compiler, [...common, 'firmware/src/main.c', '-o', 'firmware/build/pd1180_firmware_sim'])
await run('firmware/build/pd1180_firmware_sim', [])
const objects=[]
for (const name of ['power_domain','brake_preflight','control','telemetry','pd_contract','pd_voltage','drv8462','step_motion','as5600']) {
  const object=`firmware/build/${name}.o`
  await run(compiler,['-std=c11','-Wall','-Wextra','-Werror','-Ifirmware/include','-c',`firmware/src/${name}.c`,'-o',object])
  objects.push(object)
}
for (const test of ['target_power', 'indicators']) {
  await run(process.env.CXX || 'c++',['-std=gnu++17','-Wall','-Wextra','-Werror',
    '-Ifirmware/tests/fakes','-Ifirmware/include',`firmware/tests/test_${test}.cpp`,...objects,
    '-o',`firmware/build/${test}_tests`])
  await run(`firmware/build/${test}_tests`,[])
}
console.log('RP2040 target call sites and portable safety/driver/encoder/STEP tests passed. Pin contract is checked separately by check:firmware-pins.')

for (const profile of [1,2]) {
  await run(process.env.CXX || 'c++',['-std=gnu++17','-Wall','-Wextra','-Werror',
    `-DPD1180_TEST_PROFILE=${profile}`, '-DPD1180_TEST_RECORD_SHA="'+'0'.repeat(64)+'"',
    '-Ifirmware/tests/fakes','-Ifirmware/include','firmware/tests/test_commissioning.cpp',...objects,
    '-o',`firmware/build/commissioning_${profile}_tests`])
  await run(`firmware/build/commissioning_${profile}_tests`,[])
}
