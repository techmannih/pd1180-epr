import { readFile, readdir, writeFile } from 'node:fs/promises'

const standards = JSON.parse(await readFile('board-standards.json', 'utf8'))
const circuit = JSON.parse(await readFile('dist/index/circuit.json', 'utf8'))
const boardPath = 'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb'
const boardSource = await readFile(boardPath, 'utf8')
const errors = []
const warnings = []
const close = (actual, expected, tolerance = 1e-6) => Math.abs(actual - expected) <= tolerance

const sourceBoard = circuit.find((row) => row.type === 'source_board')
const pcbBoard = circuit.find((row) => row.type === 'pcb_board')
if (sourceBoard?.title !== standards.product_name) errors.push('Source board title does not match the canonical product name')
if (!pcbBoard) errors.push('Missing pcb_board record')
else {
  if (!close(pcbBoard.width, standards.project_geometry.board_width_mm)) errors.push(`Board width ${pcbBoard.width} mm does not match policy`)
  if (!close(pcbBoard.height, standards.project_geometry.board_height_mm)) errors.push(`Board height ${pcbBoard.height} mm does not match policy`)
  if (pcbBoard.num_layers !== standards.fabrication.layers) errors.push(`Expected ${standards.fabrication.layers} copper layers`)
  if (!close(pcbBoard.thickness, standards.fabrication.finished_thickness_mm)) errors.push('Finished thickness differs from policy')
  if (pcbBoard.min_board_edge_clearance < standards.fabrication.minimum_copper_to_edge_mm) errors.push('CAD copper-to-edge rule is below policy')
}

const components = circuit.filter((row) => row.type === 'pcb_component')
const badLayers = components.filter((row) => !standards.assembly.populated_layers.includes(row.layer))
if (badLayers.length) errors.push(`${badLayers.length} PCB components are outside the allowed assembly layers`)

const sheets = circuit.filter((row) => row.type === 'schematic_sheet')
if (sheets.length !== standards.project_geometry.schematic_sheet_count) errors.push(`Expected ${standards.project_geometry.schematic_sheet_count} schematic sheets, found ${sheets.length}`)
for (const sheet of sheets) if (sheet.sheet_size?.toLowerCase() !== standards.project_geometry.schematic_sheet_size) errors.push(`${sheet.name}: expected A4 sheet`)

const mountingHoles = circuit.filter((row) => row.type === 'pcb_hole' && close(row.hole_diameter, standards.project_geometry.mounting_hole_diameter_mm, 0.01))
if (mountingHoles.length !== standards.project_geometry.mounting_hole_count) errors.push(`Expected ${standards.project_geometry.mounting_hole_count} mounting holes, found ${mountingHoles.length}`)
const boardMountingHoles = mountingHoles.filter((row) => row.pcb_component_id == null)
const mountingHoleEvidence = []
for (const expected of standards.project_geometry.mounting_holes_centered_mm) {
  const actual = boardMountingHoles.find((row) => close(row.x, expected.x, 0.01) && close(row.y, expected.y, 0.01))
  if (!actual) errors.push(`${expected.name}: missing mounting hole at (${expected.x}, ${expected.y}) mm`)
  mountingHoleEvidence.push({ name: expected.name, expected: { x: expected.x, y: expected.y }, actual: actual ? { x: actual.x, y: actual.y, diameter: actual.hole_diameter } : null })
}
if (pcbBoard?.outline?.length < 20) errors.push('PCB outline does not contain the stepped TMCM-1180 perimeter and corner arcs')

const silk = circuit.filter((row) => row.type === 'pcb_silkscreen_text').map((row) => row.text)
for (const text of standards.markings.required_source_text) if (!silk.includes(text)) errors.push(`Missing source silkscreen marking: ${text}`)
for (const text of standards.markings.required_kicad_text) if (!boardSource.includes(`(gr_text "${text}"`)) errors.push(`Missing final KiCad marking: ${text}`)

function forms(name) {
  const found = []
  const needle = `\n\t(${name}`
  let cursor = 0
  while (true) {
    const offset = boardSource.indexOf(needle, cursor)
    if (offset < 0) break
    const start = offset + 2
    let depth = 0
    let quoted = false
    let escaped = false
    for (let index = start; index < boardSource.length; index++) {
      const char = boardSource[index]
      if (quoted) {
        if (escaped) escaped = false
        else if (char === '\\') escaped = true
        else if (char === '"') quoted = false
      } else if (char === '"') quoted = true
      else if (char === '(') depth++
      else if (char === ')' && --depth === 0) {
        found.push(boardSource.slice(start, index + 1))
        cursor = index + 1
        break
      }
    }
  }
  return found
}

const tolerance = standards.fabrication.via_pair_tolerance_mm
const viaSummary = new Map()
for (const form of forms('via')) {
  const pad = Number(form.match(/\(size ([0-9.]+)\)/)?.[1])
  const drill = Number(form.match(/\(drill ([0-9.]+)\)/)?.[1])
  if (!Number.isFinite(pad) || !Number.isFinite(drill)) {
    errors.push('Final board contains a via without parseable pad/drill dimensions')
    continue
  }
  const pair = standards.fabrication.via_pairs_mm.find((item) => close(pad, item.pad, tolerance) && close(drill, item.drill, tolerance))
  if (!pair) errors.push(`Unapproved via pair ${pad}/${drill} mm`)
  else {
    const ring = (pad - drill) / 2
    if (ring + tolerance < pair.minimum_annular_ring) errors.push(`${pair.name}: ${ring.toFixed(3)} mm annular ring is below policy`)
    viaSummary.set(pair.name, (viaSummary.get(pair.name) || 0) + 1)
  }
}
for (const pair of standards.fabrication.via_pairs_mm) {
  const count = viaSummary.get(pair.name) || 0
  if (pair.maximum_count != null && count > pair.maximum_count) errors.push(`${pair.name}: ${count} vias exceed maximum ${pair.maximum_count}`)
}

const gerberFiles = await readdir('dist/manufacturing/gerbers')
if (!standards.assembly.bottom_paste_allowed && gerberFiles.some((name) => /B[_-]Paste/i.test(name))) errors.push('Bottom paste Gerber is present for a top-only assembly')

const drc = JSON.parse(await readFile('dist/manufacturing/kicad-drc.json', 'utf8'))
if ((drc.violations || []).length) errors.push(`Final KiCad DRC contains ${drc.violations.length} violations`)
if ((drc.unconnected_items || []).length) errors.push(`Final KiCad DRC contains ${drc.unconnected_items.length} unconnected items`)

const assembly = JSON.parse(await readFile('docs/assembly-check.json', 'utf8'))
if (assembly.errors?.length) errors.push(...assembly.errors.map((error) => `Assembly: ${error}`))
const supplierBackedSources = circuit.filter((row) => row.type === 'source_component' && row.supplier_part_numbers?.jlcpcb?.length)
if (supplierBackedSources.length !== assembly.parts) errors.push(`Circuit has ${supplierBackedSources.length} supplier-backed source parts but the assembly manifest has ${assembly.parts}`)

const report = {
  checked_at: new Date().toISOString(),
  policy: 'board-standards.json',
  product_name: standards.product_name,
  geometry: {
    width_mm: pcbBoard?.width,
    height_mm: pcbBoard?.height,
    layers: pcbBoard?.num_layers,
    schematic_sheets: sheets.length,
    mounting_holes: mountingHoles.length,
    mounting_hole_positions: mountingHoleEvidence,
    outline_points: pcbBoard?.outline?.length ?? 0,
    mechanical_reference: standards.project_geometry.mechanical_reference,
  },
  assembly: { pcb_component_records: components.length, allowed_layers: standards.assembly.populated_layers, bottom_paste_present: gerberFiles.some((name) => /B[_-]Paste/i.test(name)) },
  via_counts: Object.fromEntries(viaSummary),
  markings_checked: standards.markings.required_source_text,
  drc: { violations: (drc.violations || []).length, unconnected_items: (drc.unconnected_items || []).length },
  warnings,
  errors,
}
await writeFile('docs/board-standards-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
