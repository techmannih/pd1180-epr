// Unpopulated footprints remain electrically checked but are never assembled.
export function assemblyPolicyErrors(circuit, standards, fittedNames) {
  const errors = []
  const names = new Map(circuit.filter(row => row.type === 'source_component').map(row => [row.source_component_id, row.name]))
  const optional = standards.assembly.optional_unpopulated_parts ?? {}
  const seen = new Set()
  for (const row of circuit.filter(row => row.type === 'pcb_component')) {
    const name = names.get(row.source_component_id)
    if (Object.hasOwn(optional, name)) {
      seen.add(name)
      if (!row.do_not_place || row.layer !== optional[name]) errors.push(`${name}: must be unpopulated on ${optional[name]}`)
      if (fittedNames.has(name)) errors.push(`${name}: optional footprint must be absent from the fitted manifest`)
    } else {
      if (row.do_not_place) errors.push(`${name}: unexpected unpopulated component`)
      if (!standards.assembly.populated_layers.includes(row.layer)) errors.push(`${name}: layer ${row.layer} is not permitted`)
    }
  }
  for (const name of Object.keys(optional)) if (!seen.has(name)) errors.push(`${name}: missing optional footprint`)
  const encoder = circuit.find(row => row.type === 'pcb_component' && names.get(row.source_component_id) === 'U18')
  if (!encoder || Math.hypot(encoder.center.x, encoder.center.y) > 1e-6) errors.push('Encoder must be centered on the motor axis at (0, 0)')
  return errors
}
