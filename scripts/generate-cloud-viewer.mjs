import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { KicadToCircuitJsonConverter } from 'kicad-to-circuit-json'

const DEFAULT_SOURCE = 'dist/index/circuit.json'
const DEFAULT_BOARD = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const DEFAULT_OUTPUT = 'release/circuit.json'

function groupCounts(circuit) {
  return Object.fromEntries(
    Object.entries(Object.groupBy(circuit, (element) => element.type))
      .map(([type, elements]) => [type, elements.length]),
  )
}

function portKey(componentName, pinNumber) {
  return `${componentName}:${String(pinNumber)}`
}

export async function createCloudViewerCircuit({
  sourceCircuitPath = DEFAULT_SOURCE,
  routedBoardPath = DEFAULT_BOARD,
} = {}) {
  const sourceCircuit = JSON.parse(await readFile(sourceCircuitPath, 'utf8'))
  const converter = new KicadToCircuitJsonConverter()
  converter.addFile(basename(routedBoardPath), await readFile(routedBoardPath, 'utf8'))
  converter.runUntilFinished()
  const routedCircuit = converter.getOutput()

  const sourceComponents = new Map(
    sourceCircuit
      .filter((element) => element.type === 'source_component')
      .map((element) => [element.source_component_id, element]),
  )
  const sourcePorts = new Map(
    sourceCircuit
      .filter((element) => element.type === 'source_port')
      .map((element) => [element.source_port_id, element]),
  )
  const basePcbComponents = new Map(
    sourceCircuit
      .filter((element) => element.type === 'pcb_component')
      .map((element) => [element.pcb_component_id, element]),
  )
  const basePortByKey = new Map()
  const sourceTraceByPort = new Map()

  for (const trace of sourceCircuit.filter((element) => element.type === 'source_trace')) {
    for (const sourcePortId of trace.connected_source_port_ids || []) {
      if (!sourceTraceByPort.has(sourcePortId)) sourceTraceByPort.set(sourcePortId, trace.source_trace_id)
    }
  }
  for (const pcbPort of sourceCircuit.filter((element) => element.type === 'pcb_port')) {
    const sourcePort = sourcePorts.get(pcbPort.source_port_id)
    const pcbComponent = basePcbComponents.get(pcbPort.pcb_component_id)
    const sourceComponent = sourceComponents.get(pcbComponent?.source_component_id)
    if (!sourcePort || !sourceComponent) continue
    basePortByKey.set(portKey(sourceComponent.name, sourcePort.pin_number), pcbPort)
  }

  const routedSourceComponents = new Map(
    routedCircuit
      .filter((element) => element.type === 'source_component')
      .map((element) => [element.source_component_id, element]),
  )
  const routedPcbComponents = new Map(
    routedCircuit
      .filter((element) => element.type === 'pcb_component')
      .map((element) => [element.pcb_component_id, element]),
  )
  const routedPortToBasePort = new Map()
  for (const routedPort of routedCircuit.filter((element) => element.type === 'pcb_port')) {
    const pcbComponent = routedPcbComponents.get(routedPort.pcb_component_id)
    const sourceComponent = routedSourceComponents.get(pcbComponent?.source_component_id)
    const pinMatch = routedPort.source_port_id?.match(/_port_(.+)$/)
    if (!sourceComponent || !pinMatch) continue
    const basePort = basePortByKey.get(portKey(sourceComponent.name, pinMatch[1]))
    if (basePort) routedPortToBasePort.set(routedPort.pcb_port_id, basePort)
  }

  const importedTypes = new Set(['pcb_trace', 'pcb_via', 'pcb_copper_pour'])
  const circuit = sourceCircuit.filter((element) => !importedTypes.has(element.type))
  let attributedTraceCount = 0
  const attributedSourceTraces = new Set()

  for (const [index, imported] of routedCircuit.filter((element) => element.type === 'pcb_trace').entries()) {
    const trace = structuredClone(imported)
    trace.pcb_trace_id = `pcb_trace_cloud_routed_${index}`
    trace.subcircuit_id = 'subcircuit_source_group_0'
    let sourceTraceId
    for (const point of trace.route || []) {
      for (const endpointField of ['start_pcb_port_id', 'end_pcb_port_id']) {
        if (!point[endpointField]) continue
        const basePort = routedPortToBasePort.get(point[endpointField])
        if (basePort) {
          point[endpointField] = basePort.pcb_port_id
          sourceTraceId ||= sourceTraceByPort.get(basePort.source_port_id)
        } else {
          delete point[endpointField]
        }
      }
    }
    if (sourceTraceId) {
      trace.source_trace_id = sourceTraceId
      attributedTraceCount += 1
      attributedSourceTraces.add(sourceTraceId)
    } else {
      delete trace.source_trace_id
    }
    circuit.push(trace)
  }

  for (const [index, imported] of routedCircuit.filter((element) => element.type === 'pcb_via').entries()) {
    const via = structuredClone(imported)
    via.pcb_via_id = `pcb_via_cloud_routed_${index}`
    via.subcircuit_id = 'subcircuit_source_group_0'
    delete via.source_trace_id
    delete via.pcb_port_ids
    circuit.push(via)
  }
  for (const [index, imported] of routedCircuit.filter((element) => element.type === 'pcb_copper_pour').entries()) {
    const pour = structuredClone(imported)
    pour.pcb_copper_pour_id = `pcb_copper_pour_cloud_routed_${index}`
    pour.subcircuit_id = 'subcircuit_source_group_0'
    circuit.push(pour)
  }

  const sourceCounts = groupCounts(sourceCircuit)
  const routedCounts = groupCounts(routedCircuit)
  const outputCounts = groupCounts(circuit)
  return {
    circuit,
    report: {
      schema_version: 1,
      source_circuit: sourceCircuitPath,
      routed_board: routedBoardPath,
      mapped_pcb_ports: routedPortToBasePort.size,
      imported_pcb_ports: routedCounts.pcb_port || 0,
      attributed_pcb_traces: attributedTraceCount,
      attributed_source_traces: attributedSourceTraces.size,
      source_counts: sourceCounts,
      routed_board_counts: routedCounts,
      cloud_viewer_counts: outputCounts,
      converter_warnings: converter.getWarnings(),
    },
  }
}

export async function writeCloudViewerCircuit({
  outputPath = DEFAULT_OUTPUT,
  reportPath = 'docs/cloud-viewer-check.json',
  ...options
} = {}) {
  const result = await createCloudViewerCircuit(options)
  await mkdir('release', { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(result.circuit)}\n`)
  if (reportPath) {
    await mkdir('docs', { recursive: true })
    await writeFile(reportPath, `${JSON.stringify({ ...result.report, errors: [] }, null, 2)}\n`)
  }
  return result
}

if (import.meta.main) {
  const { report } = await writeCloudViewerCircuit()
  console.log(JSON.stringify(report, null, 2))
}
