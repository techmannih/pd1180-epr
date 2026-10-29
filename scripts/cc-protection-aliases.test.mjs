import { beforeAll, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { createElement } from "react"
import { Circuit } from "@tscircuit/core"
import { getFullConnectivityMapFromCircuitJson } from "circuit-json-to-connectivity-map"
import { TPD4S480RUKR } from "../imports/TPD4S480RUKR"

// TI SLVSH00, table 4-1: pins 4/5 are C_CC1/C_CC2 (connector side),
// pins 12/11 are CC1/CC2 (system side). OVP switches are not PCB shorts.
// https://www.ti.com/lit/ds/symlink/tpd4s480.pdf
let compiled
let compiledConnections
let publishedConnections
const published = JSON.parse(readFileSync(new URL("../release/circuit.json", import.meta.url), "utf8"))

beforeAll(async () => {
  const circuit = new Circuit({ platform: { pcbDisabled: true, routingDisabled: true } })
  circuit.schematicDisabled = true
  circuit.add(createElement("board", { width: 10, height: 10, schematicDisabled: true },
    createElement(TPD4S480RUKR, { name: "U1", cadModel: undefined,
      connections: { pin4: "net.CC1_CONN", pin5: "net.CC2_CONN", pin12: "net.CC1_PD", pin11: "net.CC2_PD" },
    }),
  ))
  await circuit.renderUntilSettled()
  compiled = circuit.getCircuitJson()
  // Setup and missing-net failures must not count as reproducing the bug.
  compiledConnections = ccConnections(compiled)
  publishedConnections = ccConnections(published)
})

function ccConnections(circuit) {
  const map = getFullConnectivityMapFromCircuitJson(circuit)
  const nets = circuit.filter(row => row.type === "source_net" && /^CC[12]_(CONN|PD)$/.test(row.name))
  expect(nets.map(row => row.name).sort()).toEqual(["CC1_CONN", "CC1_PD", "CC2_CONN", "CC2_PD"])
  const connections = nets.map(row => map.getNetConnectedToId(row.source_net_id))
  expect(connections.every(Boolean)).toBe(true)
  return connections
}

test("actual U1 import keeps connector and protected CC nets separate", () => {
  expect(new Set(compiledConnections).size).toBe(4)
})

test("published NEMA34 circuit keeps connector and protected CC nets separate", () => {
  expect(new Set(publishedConnections).size).toBe(4)
})

test("published U1 physical pins retain the intended connector and controller nets", () => {
  const map = getFullConnectivityMapFromCircuitJson(published)
  const u1 = published.find(row => row.type === "source_component" && row.name === "U1")
  for (const [pin, name] of [[4, "CC1_CONN"], [7, "CC1_CONN"], [5, "CC2_CONN"], [6, "CC2_CONN"], [12, "CC1_PD"], [11, "CC2_PD"]]) {
    const port = published.find(row => row.type === "source_port" && row.source_component_id === u1.source_component_id && row.pin_number === pin)
    const net = published.find(row => row.type === "source_net" && row.name === name)
    expect(port).toBeDefined()
    expect(net).toBeDefined()
    expect(map.getNetConnectedToId(port.source_port_id)).toBe(map.getNetConnectedToId(net.source_net_id))
  }
})

test("published CC copper already has unique physical vias; do not delete real copper", () => {
  const allVias = published.filter(row => row.type === "pcb_via")
  expect(allVias).toHaveLength(643)
  expect(new Set(allVias.map(row => `${row.x}:${row.y}`)).size).toBe(643)
  const nets = new Set(published.filter(row => row.type === "source_net" && /^CC[12]_(CONN|PD)$/.test(row.name)).map(row => row.source_net_id))
  const vias = published.filter(row => row.type === "pcb_via" && nets.has(row.source_net_id))
  expect(vias).toHaveLength(12)
  expect(new Set(vias.map(row => `${row.x}:${row.y}`)).size).toBe(12)
})
