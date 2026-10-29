import ts from 'typescript'

// Read actual JSX attributes, not comments or similarly named documentation.
// Refuse an unevaluated expression rather than silently assuming its value.
export function sourceDesignPolicy(text) {
  const ast = ts.createSourceFile('index.circuit.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const elements = []
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) elements.push(node)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  function attributes(node) {
    return Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(a => [a.name.getText(ast), a.initializer && ts.isStringLiteral(a.initializer) ? a.initializer.text : null]))
  }
  const boards = elements.filter(n => n.tagName.getText(ast) === 'board')
  const pours = elements.filter(n => n.tagName.getText(ast) === 'copperpour' && attributes(n).name === 'GND_PLANE')
  if (boards.length !== 1 || pours.length !== 1) throw new Error('Expected exactly one board and one GND_PLANE source element')
  const board = attributes(boards[0]), pour = attributes(pours[0])
  const mm = (value, label) => {
    if (!/^\d+(?:\.\d+)?mm$/.test(value || '')) throw new Error(`${label} must be an explicit mm value for the design-rule audit`)
    return Number(value.slice(0, -2))
  }
  return { minimum_trace_width_mm: mm(board.minTraceWidth, 'minTraceWidth'), minimum_copper_to_hole_mm: mm(board.minTraceToHoleEdgeClearance, 'minTraceToHoleEdgeClearance'), ground_plane: {
    net: pour.connectsTo?.replace(/^net\./, ''), layer: pour.layer,
    clearance_mm: mm(pour.clearance, 'GND clearance'), board_edge_margin_mm: mm(pour.boardEdgeMargin, 'GND edge margin'),
  } }
}

export function sourceDesignPolicyErrors(text, standards, compiledBoard, project) {
  const source = sourceDesignPolicy(text), policy = standards.fabrication, errors = []
  const requireEqual = (a, b, label) => { if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 1e-9) errors.push(`${label}: ${a} != ${b}`) }
  if (!(policy.minimum_trace_width_mm >= .15)) errors.push('Minimum trace width must be >=0.15 mm')
  if (!(policy.ground_plane?.clearance_mm >= .30)) errors.push('GND clearance must be >=0.30 mm')
  if (!(policy.ground_plane?.board_edge_margin_mm >= .50)) errors.push('GND edge margin must be >=0.50 mm')
  requireEqual(source.minimum_trace_width_mm, policy.minimum_trace_width_mm, 'TSX/standards width')
  requireEqual(compiledBoard?.min_trace_width, policy.minimum_trace_width_mm, 'Compiled/standards width')
  if (!(policy.minimum_copper_to_hole_mm >= .20)) errors.push('Copper-to-hole minimum must be >=0.20 mm')
  requireEqual(source.minimum_copper_to_hole_mm, policy.minimum_copper_to_hole_mm, 'TSX/standards hole clearance')
  requireEqual(compiledBoard?.min_trace_to_hole_edge_clearance, policy.minimum_copper_to_hole_mm, 'Compiled/standards hole clearance')
  requireEqual(project.board?.design_settings?.rules?.min_hole_clearance, policy.minimum_copper_to_hole_mm, 'Native/standards hole clearance')
  requireEqual(project.board?.design_settings?.rules?.min_track_width, policy.minimum_trace_width_mm, 'Native/standards width')
  for (const key of ['clearance_mm', 'board_edge_margin_mm']) requireEqual(source.ground_plane[key], policy.ground_plane?.[key], `TSX/standards GND ${key}`)
  for (const key of ['net', 'layer']) if (source.ground_plane[key] !== policy.ground_plane?.[key]) errors.push(`GND ${key} differs from source`)
  const nc = project.net_settings?.classes?.find(c => c.name === 'Default')
  requireEqual(nc?.clearance, policy.minimum_trace_space_mm, 'Native/standards spacing')
  requireEqual(compiledBoard?.min_trace_to_pad_edge_clearance, policy.minimum_trace_space_mm, 'Compiled/standards spacing')
  return errors
}

export function sourceDesignGeometryErrors(report, standards, bindings) {
  const errors = [], p = standards.fabrication
  for (const [key,hash] of Object.entries(bindings)) if (report[key] !== hash) errors.push(`Stale native geometry evidence: ${key}`)
  if (!Array.isArray(report.errors) || report.errors.length) errors.push('Native geometry has unresolved errors')
  if (!(report.track_count > 0) || !(report.minimum_actual_track_width_mm >= p.minimum_trace_width_mm) || !Array.isArray(report.thin_track_uuids) || report.thin_track_uuids.length) errors.push('Actual tracks violate the width floor')
  if (!Array.isArray(report.ground_zones) || report.ground_zones.filter(z => z.name === 'GND_PLANE' && z.layer === 'In1.Cu').length !== 1) errors.push('Missing actual GND_PLANE')
  for (const z of report.ground_zones || []) if (!(z.clearance_mm >= p.ground_plane.clearance_mm) || !Number.isFinite(z.outline_outside_required_inset_mm2) || z.outline_outside_required_inset_mm2 > 1e-8) errors.push(`GND zone violates clearance or edge inset: ${z.uuid}`)
  return errors
}
