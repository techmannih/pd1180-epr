import { Circuit } from 'system-block-core'
import { convertCircuitJsonToSystemSvg } from 'system-block-svg'
import { createElement } from 'react'
import { isDeepStrictEqual } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { SystemOverview, systemPageLayouts } from '../system-overview'

export const isSystemRecord = row => row.type.startsWith('system_block_')

// Only diagram geometry is arranged here. Core still resolves/validates every
// physical association and interface. Avoid its widely spaced graph layout so
// the four pages remain legible in the website's normal 620 px viewer.
function arrangeSystemPages(records) {
  const width = 180, height = 124
  const point = ([x, y]) => ({ x: x - width / 2, y: height / 2 - y })
  for (const page of records.filter(row => row.type === 'system_block_page')) {
    const layout = systemPageLayouts[page.name]
    if (!layout) throw new Error(`Missing system page layout: ${page.name}`)
    page.width = width
    page.height = height
    const groups = records.filter(row => row.type === 'system_block_group' && row.system_block_page_id === page.system_block_page_id)
    if (groups.length !== Object.keys(layout.groups).length) throw new Error(`Stale group layout: ${page.name}`)
    for (const group of groups) {
      const box = layout.groups[group.name]
      if (!box) throw new Error(`Missing subsystem boundary: ${page.name}/${group.name}`)
      const [x, y, w, h] = box
      group.center = point([x + w / 2, y + h / 2])
      group.width = w
      group.height = h
    }
    const blocks = records.filter(row => row.type === 'system_block_component' && row.system_block_page_id === page.system_block_page_id)
    if (blocks.length !== Object.keys(layout.blocks).length) throw new Error(`Stale block layout: ${page.name}`)
    for (const block of blocks) {
      if (!layout.blocks[block.name]) throw new Error(`Missing block position: ${page.name}/${block.name}`)
      block.center = point(layout.blocks[block.name])
      block.width = 46
      block.height = 26
      const group = groups.find(row => row.system_block_group_id === block.system_block_group_id)
      if (!group || Math.abs(block.center.x - group.center.x) + block.width / 2 > group.width / 2 || Math.abs(block.center.y - group.center.y) + block.height / 2 > group.height / 2) {
        throw new Error(`Block outside subsystem boundary: ${page.name}/${block.name}`)
      }
    }
    const byId = new Map(blocks.map(block => [block.system_block_component_id, block]))
    const connections = records.filter(row => row.type === 'system_block_connection' && row.system_block_page_id === page.system_block_page_id)
    if (connections.length !== Object.keys(layout.routes).length) throw new Error(`Stale route layout: ${page.name}`)
    for (const connection of connections) {
      const from = byId.get(connection.from_system_block_component_id)
      const to = byId.get(connection.to_system_block_component_id)
      const key = connection.name || `${from.name}:${to.name}`
      const route = layout.routes[key]
      if (!route) throw new Error(`Missing interface route: ${page.name}/${key}`)
      connection.route = route.points.map(point)
      connection.label_anchor_center = point(route.label)
      for (const [end, block] of [[connection.route[0], from], [connection.route.at(-1), to]]) {
        const dx = Math.abs(end.x - block.center.x), dy = Math.abs(end.y - block.center.y)
        if (!((dx === 23 && dy <= 13) || (dy === 13 && dx <= 23))) throw new Error(`Detached diagram arrow: ${page.name}/${key}`)
      }
      for (let i = 1; i < connection.route.length; i++) {
        const a = connection.route[i - 1], b = connection.route[i]
        if (a.x !== b.x && a.y !== b.y) throw new Error(`Non-orthogonal diagram arrow: ${page.name}/${key}`)
        for (const block of blocks) {
          const left = block.center.x - 23, right = block.center.x + 23
          const bottom = block.center.y - 13, top = block.center.y + 13
          const crosses = a.x === b.x
            ? a.x > left && a.x < right && Math.max(a.y, b.y) > bottom && Math.min(a.y, b.y) < top
            : a.y > bottom && a.y < top && Math.max(a.x, b.x) > left && Math.min(a.x, b.x) < right
          if (crosses) throw new Error(`Diagram arrow crosses block: ${page.name}/${key}/${block.name}`)
        }
      }
    }
  }
  return records
}

// The recent core is used only for diagram layout. Seed identity/association
// context from the already compiled PCB; never re-render footprints or nets.
export async function renderSystemOverview(board) {
  const circuit = new Circuit()
  const root = board.find(row => row.type === 'source_group' && row.name === 'PD1180_EPR')
  if (!root?.is_subcircuit || root.subcircuit_id !== 'subcircuit_source_group_0') {
    throw new Error('Expected the single PD1180_EPR root subcircuit; review system association context')
  }
  for (const row of board.filter(row => ['source_component', 'pcb_component'].includes(row.type))) {
    circuit.db[row.type].insert(structuredClone(row))
  }
  circuit.add(createElement('group', { name: 'system-context', subcircuit: true }, createElement(SystemOverview)))
  await circuit.renderUntilSettled()
  const output = circuit.getCircuitJson()
  const errors = output.filter(row => row.type.endsWith('_error') || row.type.endsWith('_warning'))
  if (errors.length) throw new Error(`System layout failed: ${JSON.stringify(errors)}`)
  const records = output.filter(isSystemRecord)
  if (records.filter(row => row.type === 'system_block_page').length !== 4) throw new Error('Expected all four system pages')
  const ids = new Set(board.filter(row => row.type === 'pcb_component').map(row => row.pcb_component_id))
  for (const row of records) for (const id of row.pcb_component_ids || []) {
    if (!ids.has(id)) throw new Error(`Unknown physical component association: ${id}`)
  }
  // Match Circuit JSON serialization: omit optional undefined properties.
  return arrangeSystemPages(JSON.parse(JSON.stringify(records)))
}

export function appendSystemOverview(board, records) {
  if (records.some(row => !isSystemRecord(row))) throw new Error('Only system block metadata may be appended')
  const original = board.filter(row => !isSystemRecord(row))
  const combined = [...original, ...records]
  if (!isDeepStrictEqual(combined.filter(row => !isSystemRecord(row)), original)) throw new Error('System diagram changed the board')
  return combined
}

export async function exportSystemSvgs(records, outputDirectory = 'docs/system-blocks') {
  await mkdir(outputDirectory, { recursive: true })
  for (const page of records.filter(row => row.type === 'system_block_page')) {
    const svg = convertCircuitJsonToSystemSvg(records, { systemBlockPageId: page.system_block_page_id, width: 1600 })
    await writeFile(`${outputDirectory}/${page.name}.svg`, svg)
  }
}

if (import.meta.main) {
  const sourcePath = 'dist/index/circuit.json'
  const assemblyPath = 'dist/motor-assembly/circuit.json'
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const assembly = JSON.parse(await readFile(assemblyPath, 'utf8'))
  const records = await renderSystemOverview(source)
  // Both entrypoints get identical metadata; all existing rows remain exact.
  await writeFile(sourcePath, `${JSON.stringify(appendSystemOverview(source, records), null, 2)}\n`)
  await writeFile(assemblyPath, `${JSON.stringify(appendSystemOverview(assembly, records), null, 2)}\n`)
  await exportSystemSvgs(records)
  console.log(`Added four system pages (${records.length} records); electrical/PCB/schematic rows preserved`)
}
