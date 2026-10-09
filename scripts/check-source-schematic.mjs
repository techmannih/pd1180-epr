import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

const circuitPath = process.argv[2] || "dist/index/circuit.json"
const reportPath = process.argv[3] || "docs/checks/source-schematic.json"
const bytes = await readFile(circuitPath)
const circuit = JSON.parse(bytes)
const failures = []
const checks = []

function check(condition, message, details = undefined) {
  checks.push({ ok: Boolean(condition), message, ...(details === undefined ? {} : { details }) })
  if (!condition) failures.push({ message, details })
}

function mapBy(items, key) {
  return Object.fromEntries(items.map((item) => [item[key], item]))
}

function groupBy(items, keyFn) {
  const result = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (!result.has(key)) result.set(key, [])
    result.get(key).push(item)
  }
  return result
}

const ofType = (type) => circuit.filter((element) => element.type === type)
const sheets = ofType("schematic_sheet").sort((a, b) => a.sheet_index - b.sheet_index)
const sourceComponents = ofType("source_component")
const sourcePorts = ofType("source_port")
const sourceNets = ofType("source_net")
const schematicComponents = ofType("schematic_component")
const schematicPorts = ofType("schematic_port")
const schematicTexts = ofType("schematic_text")
const pcbPorts = ofType("pcb_port")

const sourceComponentById = mapBy(sourceComponents, "source_component_id")
const sourceComponentByName = mapBy(sourceComponents, "name")
const sourcePortById = mapBy(sourcePorts, "source_port_id")
const sourceNetByKey = mapBy(sourceNets, "subcircuit_connectivity_map_key")
const sourcePortsByComponent = groupBy(sourcePorts, (port) => port.source_component_id)
const connectedPortGroups = groupBy(
  sourcePorts.filter((port) => port.subcircuit_connectivity_map_key),
  (port) => port.subcircuit_connectivity_map_key,
)

const schematicComponentsBySource = groupBy(
  schematicComponents,
  (component) => component.source_component_id,
)
const componentMappingIssues = sourceComponents.filter(
  (component) => (schematicComponentsBySource.get(component.source_component_id) || []).length !== 1,
)
const schematicComponentsOnUnknownSheets = schematicComponents.filter(
  (component) => !ofType("schematic_sheet").some((sheet) => sheet.schematic_sheet_id === component.schematic_sheet_id),
)
check(sourceComponents.length === schematicComponents.length, "source and schematic component counts match", {
  source: sourceComponents.length,
  schematic: schematicComponents.length,
})
check(componentMappingIssues.length === 0, "every source component maps to exactly one schematic component", {
  violations: componentMappingIssues.map((component) => component.name),
})
check(schematicComponentsOnUnknownSheets.length === 0, "every schematic component belongs to a declared sheet", {
  violations: schematicComponentsOnUnknownSheets.map((component) => component.schematic_component_id),
})

const refPin = (ref, pin) => {
  const component = sourceComponentByName[ref]
  return component
    ? (sourcePortsByComponent.get(component.source_component_id) || []).find(
        (port) => String(port.pin_number) === String(pin),
      )
    : undefined
}
const pinNet = (ref, pin) => {
  const port = refPin(ref, pin)
  return port ? sourceNetByKey[port.subcircuit_connectivity_map_key]?.name || null : undefined
}
const portLabel = (port) => {
  const component = sourceComponentById[port.source_component_id]
  return `${component?.name || port.source_component_id}.${port.pin_number}:${port.name}`
}
const peerLabels = (key) =>
  (connectedPortGroups.get(key) || []).map((port) => portLabel(port)).sort()

// 1. Sheet inventory, immutable dimensions, and explanatory annotations.
const expectedSheetGeometry = {
  "usb-pd": [1, 400, 400, 4],
  "logic-power": [2, 330, 335, 3],
  "motor-power": [3, 385, 185, 3],
  motion: [4, 340, 325, 3],
  "bridge-a": [5, 315, 325, 3],
  "bridge-b": [6, 315, 330, 3],
  brake: [7, 370, 345, 3],
  mcu: [8, 295, 190, 3],
  encoder: [9, 335, 140, 3],
  "usb-data": [10, 380, 230, 3],
  serial: [12, 380, 230, 3],
  inputs: [11, 380, 435, 3],
  outputs: [13, 360, 205, 3],
}
check(sheets.length === 13, "exactly 13 schematic sheets", { actual: sheets.length })
check(new Set(sheets.map((sheet) => sheet.name)).size === 13, "all schematic sheet names are unique")

const annotations = schematicTexts.filter(
  (text) => !text.schematic_component_id && Number(text.font_size) >= 0.23,
)
const annotationSummary = []
for (const sheet of sheets) {
  const expected = expectedSheetGeometry[sheet.name]
  check(Boolean(expected), `known fixed geometry for sheet ${sheet.name}`)
  if (!expected) continue
  const [index, width, height, annotationCount] = expected
  check(sheet.sheet_index === index, `${sheet.name} keeps sheet index ${index}`)
  check(
    sheet.sheet_width === width && sheet.sheet_height === height,
    `${sheet.name} keeps fixed ${width} x ${height} frame`,
    { actual: [sheet.sheet_width, sheet.sheet_height] },
  )
  const sheetAnnotations = annotations.filter(
    (annotation) => annotation.schematic_sheet_id === sheet.schematic_sheet_id,
  )
  check(
    sheetAnnotations.length === annotationCount,
    `${sheet.name} has ${annotationCount} explanatory annotations`,
    { actual: sheetAnnotations.length, texts: sheetAnnotations.map((item) => item.text) },
  )
  check(
    sheetAnnotations.some((item) => item.text.startsWith(`${String(index).padStart(2, "0")} /`)),
    `${sheet.name} has numbered sheet heading`,
  )
  check(
    sheetAnnotations.some((item) => /\b(?:U|Q|J|R|D)\d+/.test(item.text) && item.text.includes(":")),
    `${sheet.name} explains component roles`,
  )
  annotationSummary.push({
    index,
    name: sheet.name,
    display_name: sheet.display_name,
    frame: [width, height],
    annotations: sheetAnnotations.map((item) => item.text),
  })
}
check(annotations.length === 40, "40 high-level sheet annotations are present", {
  actual: annotations.length,
})

// Every schematic coordinate and approximate text/component/shape extent must remain within its sheet frame.
const sheetById = mapBy(sheets, "schematic_sheet_id")
const pointViolations = []
const extentViolations = []
const sheetBoundsSummary = []

function within(sheet, x, y, tolerance = 1e-9) {
  const scale = 10.16 / 1.1 // KiCad mm per tscircuit schematic unit
  const margin = 5 / scale
  const minX = sheet.center.x - sheet.sheet_width / (2 * scale) + margin
  const maxX = sheet.center.x + sheet.sheet_width / (2 * scale) - margin
  const minY = sheet.center.y - sheet.sheet_height / (2 * scale) + margin
  const maxY = sheet.center.y + sheet.sheet_height / (2 * scale) - margin
  return (
    x >= minX - tolerance && x <= maxX + tolerance && y >= minY - tolerance && y <= maxY + tolerance
  )
}

function collectXY(value, path = "$", result = []) {
  if (!value || typeof value !== "object") return result
  if (Number.isFinite(value.x) && Number.isFinite(value.y)) {
    result.push({ x: value.x, y: value.y, path })
  }
  if (
    Number.isFinite(value.x1) &&
    Number.isFinite(value.y1) &&
    Number.isFinite(value.x2) &&
    Number.isFinite(value.y2)
  ) {
    result.push({ x: value.x1, y: value.y1, path: `${path}.start` })
    result.push({ x: value.x2, y: value.y2, path: `${path}.end` })
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectXY(entry, `${path}[${index}]`, result))
  } else {
    for (const [key, entry] of Object.entries(value)) {
      if (entry && typeof entry === "object") collectXY(entry, `${path}.${key}`, result)
    }
  }
  return result
}

function addExtent(element, sheet, minX, maxX, minY, maxY, kind) {
  const corners = [
    [minX, minY],
    [minX, maxY],
    [maxX, minY],
    [maxX, maxY],
  ]
  if (!corners.every(([x, y]) => within(sheet, x, y))) {
    extentViolations.push({
      sheet: sheet.name,
      element: element[`${element.type}_id`] || element.type,
      type: element.type,
      kind,
      extent: { minX, maxX, minY, maxY },
    })
  }
}

for (const sheet of sheets) {
  const sheetElements = circuit.filter(
    (element) => element.schematic_sheet_id === sheet.schematic_sheet_id,
  )
  let pointCount = 0
  for (const element of sheetElements) {
    const points = collectXY(element)
    pointCount += points.length
    for (const point of points) {
      if (!within(sheet, point.x, point.y)) {
        pointViolations.push({
          sheet: sheet.name,
          element: element[`${element.type}_id`] || element.type,
          type: element.type,
          path: point.path,
          x: point.x,
          y: point.y,
        })
      }
    }
    if (element.center && element.size?.width && element.size?.height) {
      addExtent(
        element,
        sheet,
        element.center.x - element.size.width / 2,
        element.center.x + element.size.width / 2,
        element.center.y - element.size.height / 2,
        element.center.y + element.size.height / 2,
        "component-size",
      )
    }
    if (element.center && element.width && element.height) {
      addExtent(
        element,
        sheet,
        element.center.x - element.width / 2,
        element.center.x + element.width / 2,
        element.center.y - element.height / 2,
        element.center.y + element.height / 2,
        "rect",
      )
    }
    if (element.center && element.radius) {
      addExtent(
        element,
        sheet,
        element.center.x - element.radius,
        element.center.x + element.radius,
        element.center.y - element.radius,
        element.center.y + element.radius,
        "circle",
      )
    }
    if (element.type === "schematic_text" && element.position) {
      const fontSize = Number(element.font_size) || 0.18
      const estimatedWidth = Math.max(fontSize, String(element.text || "").length * fontSize * 0.62)
      const estimatedHeight = fontSize * 1.25
      const anchor = String(element.anchor || "center")
      let minX = element.position.x - estimatedWidth / 2
      let maxX = element.position.x + estimatedWidth / 2
      let minY = element.position.y - estimatedHeight / 2
      let maxY = element.position.y + estimatedHeight / 2
      if (anchor.includes("left")) [minX, maxX] = [element.position.x, element.position.x + estimatedWidth]
      if (anchor.includes("right")) [minX, maxX] = [element.position.x - estimatedWidth, element.position.x]
      if (anchor.includes("top")) [minY, maxY] = [element.position.y - estimatedHeight, element.position.y]
      if (anchor.includes("bottom")) [minY, maxY] = [element.position.y, element.position.y + estimatedHeight]
      addExtent(element, sheet, minX, maxX, minY, maxY, "estimated-text")
    }
  }
  sheetBoundsSummary.push({
    index: sheet.sheet_index,
    name: sheet.name,
    elements: sheetElements.length,
    coordinate_points_checked: pointCount,
  })
}
check(pointViolations.length === 0, "all schematic coordinate points are inside fixed sheet frames", {
  violations: pointViolations,
})
check(
  extentViolations.length === 0,
  "all component, shape, and estimated text extents are inside fixed sheet frames",
  { violations: extentViolations },
)

// 2. Canonical connectivity: every net is real and has at least two source ports.
const netCounts = sourceNets.map((net) => ({
  name: net.name,
  key: net.subcircuit_connectivity_map_key,
  ports: (connectedPortGroups.get(net.subcircuit_connectivity_map_key) || []).length,
}))
const smallNets = netCounts.filter((net) => net.ports < 2)
const unknownKeys = [...connectedPortGroups.keys()].filter((key) => !sourceNetByKey[key])
const netHistogram = Object.fromEntries(
  [...groupBy(netCounts, (net) => net.ports)].map(([count, entries]) => [count, entries.length]),
)
check(sourceNets.length === 182, "182 named source nets are present", { actual: sourceNets.length })
check(connectedPortGroups.size === sourceNets.length, "every named source net has connected ports", {
  connected_groups: connectedPortGroups.size,
  source_nets: sourceNets.length,
})
check(smallNets.length === 0, "every connected net has at least two source ports", {
  violations: smallNets,
})
check(unknownKeys.length === 0, "every connectivity key resolves to a named source net", {
  unknown_keys: unknownKeys,
})

// 3. Independent PD POWER and DATA receptacles, rails and CC paths.
const usbCComponents = sourceComponents.filter((component) => component.standard === "usb_c")
const usbNamedConnectors = sourceComponents.filter(
  (component) => component.ftype === "simple_connector" && /usb|type.?c/i.test(component.manufacturer_part_number || ""),
)
check(usbCComponents.length === 2, "exactly two USB-C-standard connector exists", {
  refs: usbCComponents.map((component) => component.name),
})
check(["J1", "J10"].every(ref => usbCComponents.some(c => c.name === ref)), "PD J1 and DATA J10 use standard USB-C")
check(usbNamedConnectors.length === 2, "exactly two connector MPN is USB/Type-C related", {
  refs: usbNamedConnectors.map((component) => component.name),
})
check(!sourceComponentByName.J6 && !sourceComponentByName.J9, "J7 consolidates industrial harness connectors")

const usbExpectedPins = [
  ["J1", 7, "PD_VBUS"], ["J1", 8, "PD_VBUS"], ["J1", 17, "PD_VBUS"], ["J1", 18, "PD_VBUS"],
  ["J1", 15, "CC1_CONN"], ["J1", 9, "CC2_CONN"],
  ["J10", 11, "USB_DP_CONN"], ["J10", 13, "USB_DP_CONN"],
  ["J10", 12, "USB_DM_CONN"], ["J10", 14, "USB_DM_CONN"],
  ["U1", 20, "PD_VBUS"], ["U1", 19, "VBUS_LV"],
  ["U1", 4, "CC1_CONN"], ["U1", 7, "CC1_CONN"], ["U1", 12, "CC1_PD"], ["U2", 24, "CC1_PD"],
  ["U1", 5, "CC2_CONN"], ["U1", 6, "CC2_CONN"], ["U1", 11, "CC2_PD"], ["U2", 25, "CC2_PD"],
  ["D15", 1, "USB_DP_CONN"],
  ["R71", 1, "USB_DP_CONN"], ["R71", 2, "USB_DP"], ["U16", 34, "USB_DP"],
  ["D15", 3, "USB_DM_CONN"],
  ["R72", 1, "USB_DM_CONN"], ["R72", 2, "USB_DM"], ["U16", 33, "USB_DM"],
  ...[7,8,17,18].map(pin => ["J10", pin, "USB_DATA_VBUS"]),
  ["J10",15,"DATA_CC1"], ["J10",9,"DATA_CC2"], ["R105",1,"DATA_CC1"], ["R106",1,"DATA_CC2"],
  ["R105",2,"GND"], ["R106",2,"GND"], ["R107",1,"USB_DATA_VBUS"], ["U22",2,"VMOTOR"],
  ["U6", 5, "PD_VBUS"], ["Q4", 1, "PD_VBUS"], ["Q4", 5, "EFUSE_IN"],
]
const usbMismatches = usbExpectedPins
  .map(([ref, pin, expected]) => ({ ref, pin, expected, actual: pinNet(ref, pin) }))
  .filter((entry) => entry.actual !== entry.expected)
check(usbMismatches.length === 0, "separate-port EPR, CC, D+/D-, protection, and MCU chains match", {
  mismatches: usbMismatches,
})
check([11,12,13,14].every(pin => pinNet("J1", pin) === null), "PD J1 data pins are NC")
check(pinNet("J10",10) === null && pinNet("J10",16) === null, "DATA J10 SBU pins are NC")
check(pinNet("J1",7) !== pinNet("J10",7), "PD and DATA VBUS remain separate")

const j1 = sourceComponentByName.J1
const j1PinSummary = (sourcePortsByComponent.get(j1.source_component_id) || [])
  .sort((a, b) => Number(a.pin_number) - Number(b.pin_number))
  .map((port) => ({ pin: port.pin_number, name: port.name, net: sourceNetByKey[port.subcircuit_connectivity_map_key]?.name || "NC" }))

// 4. Capacitors and test points must be electrically attached, never isolated decorations.
const capacitors = sourceComponents.filter((component) => component.ftype === "simple_capacitor")
const capacitorIssues = []
for (const capacitor of capacitors) {
  const ports = sourcePortsByComponent.get(capacitor.source_component_id) || []
  const keys = ports.map((port) => port.subcircuit_connectivity_map_key).filter(Boolean)
  if (ports.length !== 2 || keys.length !== 2 || new Set(keys).size !== 2) {
    capacitorIssues.push({ ref: capacitor.name, reason: "pins are missing or shorted to one net", ports: ports.map(portLabel) })
    continue
  }
  for (const key of keys) {
    if ((connectedPortGroups.get(key) || []).length < 2) {
      capacitorIssues.push({ ref: capacitor.name, reason: "pin lands on an isolated net", net: sourceNetByKey[key]?.name })
    }
  }
}
check(capacitors.length === 73, "73 capacitors audited", { actual: capacitors.length })
check(capacitorIssues.length === 0, "all capacitor pins connect to two distinct, shared nets", {
  violations: capacitorIssues,
})

const testPoints = sourceComponents.filter((component) => component.ftype === "simple_test_point")
const testPointIssues = []
const testPointSummary = []
for (const testPoint of testPoints) {
  const ports = sourcePortsByComponent.get(testPoint.source_component_id) || []
  const port = ports[0]
  const key = port?.subcircuit_connectivity_map_key
  const peers = key ? connectedPortGroups.get(key) || [] : []
  const nonTestPointPeers = peers.filter(
    (peer) => sourceComponentById[peer.source_component_id]?.ftype !== "simple_test_point",
  )
  if (ports.length !== 1 || !key || peers.length < 2 || nonTestPointPeers.length === 0) {
    testPointIssues.push({ ref: testPoint.name, ports: ports.map(portLabel), peers: peerLabels(key) })
  }
  testPointSummary.push({
    ref: testPoint.name,
    net: sourceNetByKey[key]?.name || null,
    total_ports_on_net: peers.length,
    non_testpoint_peers: nonTestPointPeers.length,
  })
}
check(testPoints.length === 11, "11 test points audited", { actual: testPoints.length })
check(testPointIssues.length === 0, "every test point probes a shared functional net", {
  violations: testPointIssues,
})

// 5. Exact, intentional no-connect allowlist. Source connectivity is canonical; graphical
// is_connected can be false for ports intentionally joined by matching net labels.
const expectedNoConnects = [
  "J1.11:DP2", "J1.12:DM", "J1.13:DP", "J1.14:DN2", "J10.10:SBU1", "J10.16:SBU2",
  "U1.14:SBU2", "U1.15:SBU1", "U7.25:ENCN_DCO_CFG6",
  "U2.21:NC", "U2.28:PP5V1", "U2.29:PP5V2",
  "U23.4:NC", "U24.4:NC",
  "U6.11:MODE", "U6.19:N_C6", "U6.20:N_C5", "U6.21:N_C4", "U6.22:N_C3", "U6.23:N_C2", "U6.24:N_C1",
  "U18.8:W", "U18.9:V", "U18.10:U",
  "U19.5:NC1", "U19.8:NC2",
  "U21.7:T2OUT", "U21.9:R2OUT",
].sort()
const actualNoConnectPorts = sourcePorts.filter((port) => !port.subcircuit_connectivity_map_key)
const actualNoConnects = actualNoConnectPorts.map(portLabel).sort()
const missingNoConnects = expectedNoConnects.filter((label) => !actualNoConnects.includes(label))
const extraNoConnects = actualNoConnects.filter((label) => !expectedNoConnects.includes(label))
check(
  actualNoConnects.length === expectedNoConnects.length && missingNoConnects.length === 0 && extraNoConnects.length === 0,
  "source no-connect set exactly matches the reviewed intentional allowlist",
  { expected: expectedNoConnects, actual: actualNoConnects, missing: missingNoConnects, extra: extraNoConnects },
)

const schematicPortSourceIds = new Set(schematicPorts.map((port) => port.source_port_id))
const pcbPortSourceIds = new Set(pcbPorts.map((port) => port.source_port_id))
const ncMissingSchematicPin = actualNoConnectPorts.filter((port) => !schematicPortSourceIds.has(port.source_port_id)).map(portLabel)
const ncMissingPcbPad = actualNoConnectPorts.filter((port) => !pcbPortSourceIds.has(port.source_port_id)).map(portLabel)
check(ncMissingSchematicPin.length === 0, "every intentional NC is represented by a schematic pin", {
  missing: ncMissingSchematicPin,
})
check(ncMissingPcbPad.length === 0, "every intentional NC is represented by a PCB pad", {
  missing: ncMissingPcbPad,
})

// Stacked physical pins may be hidden from the drawn symbol, but they must be a small,
// explicit set of electrically connected duplicates; no NC pin may disappear this way.
const expectedHiddenSchematicPorts = [
  "J1.2:EH2", "J1.3:EH3", "J1.4:EH4", "J1.6:GND2", "J1.8:VBUS2",
  "J1.17:VBUS3", "J1.18:VBUS4", "J1.19:GND3", "J1.20:GND4",
  ...["2:EH2","3:EH3","4:EH4","6:GND2","8:VBUS2","11:DP2","14:DN2","17:VBUS3","18:VBUS4","19:GND3","20:GND4"].map(pin => `J10.${pin}`),
  "U1.6:RPD_G2", "U1.7:RPD_G1",
].sort()
const actualHiddenSchematicPorts = sourcePorts
  .filter((port) => !schematicPortSourceIds.has(port.source_port_id))
  .map(portLabel)
  .sort()
const hiddenPortDelta = [
  ...expectedHiddenSchematicPorts.filter((label) => !actualHiddenSchematicPorts.includes(label)),
  ...actualHiddenSchematicPorts.filter((label) => !expectedHiddenSchematicPorts.includes(label)),
]
check(hiddenPortDelta.length === 0, "only the expected stacked duplicate pins are hidden in schematic symbols", {
  expected: expectedHiddenSchematicPorts,
  actual: actualHiddenSchematicPorts,
  delta: hiddenPortDelta,
})
check(
  sourcePorts
    .filter((port) => !schematicPortSourceIds.has(port.source_port_id))
    .every((port) => Boolean(port.subcircuit_connectivity_map_key)),
  "all hidden schematic pins are electrically connected; no NC is hidden",
)

const report = {
  generated_at: new Date().toISOString(),
  input: {
    path: circuitPath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
  },
  result: failures.length === 0 ? "PASS" : "FAIL",
  failures,
  counts: {
    elements: circuit.length,
    sheets: sheets.length,
    source_components: sourceComponents.length,
    source_ports: sourcePorts.length,
    connected_source_ports: sourcePorts.length - actualNoConnectPorts.length,
    intentional_no_connect_ports: actualNoConnectPorts.length,
    source_nets: sourceNets.length,
    minimum_ports_per_connected_net: Math.min(...netCounts.map((net) => net.ports)),
    capacitors: capacitors.length,
    test_points: testPoints.length,
    annotations: annotations.length,
    frame_point_violations: pointViolations.length,
    frame_extent_violations: extentViolations.length,
  },
  net_port_histogram: netHistogram,
  usb_c: {
    connectors: usbCComponents.map((component) => component.name),
    j1_pins: j1PinSummary,
    verified_chain: usbExpectedPins.map(([ref, pin, expected]) => ({ ref, pin, net: expected })),
  },
  intentional_no_connects: actualNoConnects,
  test_points: testPointSummary,
  sheets: annotationSummary,
  sheet_bounds: sheetBoundsSummary,
  checks,
}

await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Source schematic audit: ${report.result}`)
console.log(`Input SHA-256: ${report.input.sha256}`)
console.log(`Sheets: ${report.counts.sheets}; annotations: ${report.counts.annotations}`)
console.log(
  `Nets: ${report.counts.source_nets}; minimum ports/net: ${report.counts.minimum_ports_per_connected_net}; under-connected: ${smallNets.length}`,
)
console.log(`USB-C-standard connectors: ${usbCComponents.map((component) => component.name).join(", ") || "none"}`)
console.log(`Capacitors: ${capacitors.length}; issues: ${capacitorIssues.length}`)
console.log(`Test points: ${testPoints.length}; issues: ${testPointIssues.length}`)
console.log(`Intentional NC pins: ${actualNoConnects.length}; allowlist delta: ${missingNoConnects.length + extraNoConnects.length}`)
console.log(`Frame point violations: ${pointViolations.length}; extent violations: ${extentViolations.length}`)
console.log(`Assertions: ${checks.length - failures.length}/${checks.length} passed`)
console.log(`Evidence: ${reportPath}`)
if (failures.length) process.exitCode = 1
