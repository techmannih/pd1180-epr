import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'

await mkdir('firmware/build', { recursive: true })
const compiler = process.env.CC || 'cc'
const common = ['-std=c11', '-Wall', '-Wextra', '-Werror', '-Wpedantic', '-Ifirmware/include',
  'firmware/src/power_domain.c', 'firmware/src/control.c', 'firmware/src/telemetry.c', 'firmware/src/pd_contract.c', 'firmware/src/tmc5160_config.c', 'firmware/src/tmc5160.c', 'firmware/src/motor_service.c']

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)))
  })
}

await run(compiler, [...common, 'firmware/tests/test_control.c', '-o', 'firmware/build/control_tests'])
await run('firmware/build/control_tests', [])
await run(compiler, [...common, 'firmware/tests/test_tmc5160.c', '-o', 'firmware/build/tmc5160_tests'])
await run('firmware/build/tmc5160_tests', [])
await run(compiler, [...common, 'firmware/src/main.c', '-o', 'firmware/build/pd1180_firmware_sim'])
await run('firmware/build/pd1180_firmware_sim', [])
const objects=[]
for (const name of ['power_domain','control','telemetry','pd_contract','tmc5160_config','tmc5160','motor_service']) {
  const object=`firmware/build/${name}.o`
  await run(compiler,['-std=c11','-Wall','-Wextra','-Werror','-Ifirmware/include','-c',`firmware/src/${name}.c`,'-o',object])
  objects.push(object)
}
await run(process.env.CXX || 'c++',['-std=gnu++17','-Wall','-Wextra','-Werror',
  '-Ifirmware/tests/fakes','-Ifirmware/include','firmware/tests/test_target_power.cpp',...objects,
  '-o','firmware/build/target_power_tests'])
await run('firmware/build/target_power_tests',[])
console.log('Firmware safety logic and pin contract compiled and passed.')
