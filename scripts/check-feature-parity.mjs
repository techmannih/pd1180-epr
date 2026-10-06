import { access, readFile, writeFile } from 'node:fs/promises'
import { FEATURE_PARITY } from '../feature-parity.tsx'

const circuit = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))
const sourceComponents = circuit.filter((row) => row.type === 'source_component')
const components = new Set(sourceComponents.map((row) => row.name))
const sourceByName = new Map(sourceComponents.map((row) => [row.name, row]))
const nets = new Set(circuit.filter((row) => row.type === 'source_net').map((row) => row.name))
const pcbBySource = new Map(circuit.filter((row) => row.type === 'pcb_component').map((row) => [row.source_component_id, row]))
const errors = []
const results = []

for (const item of FEATURE_PARITY) {
  const missingComponents = item.components.filter((name) => !components.has(name))
  const missingNets = item.nets.filter((name) => !nets.has(name))
  let evidenceExists = true
  try { await access(item.evidence) } catch { evidenceExists = false }
  if (missingComponents.length) errors.push(`${item.id}: missing components ${missingComponents.join(', ')}`)
  if (missingNets.length) errors.push(`${item.id}: missing nets ${missingNets.join(', ')}`)
  if (!evidenceExists) errors.push(`${item.id}: missing evidence ${item.evidence}`)
  results.push({ id: item.id, feature: item.feature, components: item.components.length, nets: item.nets.length, evidence: item.evidence, pass: !missingComponents.length && !missingNets.length && evidenceExists })
}

const bottomFitted = circuit.filter((row) => row.type === 'source_component').flatMap((source) => {
  const pcb = pcbBySource.get(source.source_component_id)
  return pcb && !pcb.do_not_place && pcb.layer !== 'top' ? [source.name] : []
})
if (bottomFitted.length) errors.push(`Top-only assembly violated by ${bottomFitted.join(', ')}`)

const usbCStandardConnector = sourceByName.get('J1')?.standard === 'usb_c'
if (!usbCStandardConnector) errors.push('J1 must use tscircuit connector standard="usb_c"')

const report = {
  checked_at: new Date().toISOString(),
  features: results.length,
  passing: results.filter((item) => item.pass).length,
  top_only_assembly: bottomFitted.length === 0,
  usb_c_standard_connector: usbCStandardConnector,
  results,
  errors,
}
await writeFile('docs/feature-parity-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
