import { access, readFile, writeFile } from 'node:fs/promises'
import { FEATURE_PARITY } from '../feature-parity.tsx'

const circuit = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))
const sourceComponents = circuit.filter((row) => row.type === 'source_component')
const components = new Set(sourceComponents.map((row) => row.name))
const sourceByName = new Map(sourceComponents.map((row) => [row.name, row]))
const nets = new Set(circuit.filter((row) => row.type === 'source_net').map((row) => row.name))
const pcbBySource = new Map(circuit.filter((row) => row.type === 'pcb_component').map((row) => [row.source_component_id, row]))
const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
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

const fittedByLayer = Object.fromEntries(standards.assembly.populated_layers.map((layer) => [layer, []]))
const disallowedFitted = circuit.filter((row) => row.type === 'source_component').flatMap((source) => {
  const pcb = pcbBySource.get(source.source_component_id)
  if (!pcb || pcb.do_not_place) return []
  if (fittedByLayer[pcb.layer]) fittedByLayer[pcb.layer].push(source.name)
  return standards.assembly.populated_layers.includes(pcb.layer) ? [] : [source.name]
})
if (disallowedFitted.length) errors.push(`Assembly layer policy violated by ${disallowedFitted.join(', ')}`)

const usbCStandardConnectors = ['J1'].filter((name) => sourceByName.get(name)?.standard === 'usb_c')
if (usbCStandardConnectors.length !== 1) errors.push('J1 must use tscircuit connector standard="usb_c"')
if (sourceByName.has('J10')) errors.push('Single-port architecture must not fit a second USB-C receptacle J10')

const report = {
  checked_at: new Date().toISOString(),
  features: results.length,
  passing: results.filter((item) => item.pass).length,
  assembly_layers: Object.fromEntries(Object.entries(fittedByLayer).map(([layer, names]) => [layer, names.length])),
  usb_c_standard_connectors: usbCStandardConnectors,
  results,
  errors,
}
await writeFile('docs/feature-parity-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
