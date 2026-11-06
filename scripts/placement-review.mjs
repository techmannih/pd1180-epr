import polygonClipping from 'polygon-clipping'
export const reviewed = ['C26','C83','R139','R140','R141','R35','R64','R65','R73']

function courtyard(circuit, name) {
  const source = circuit.find(r => r.type === 'source_component' && r.name === name)
  const component = circuit.find(r => r.type === 'pcb_component' && r.source_component_id === source?.source_component_id)
  if (!component) throw new Error(`Missing courtyard component ${name}`)
  const rows = circuit.filter(r => r.pcb_component_id === component.pcb_component_id && r.type.startsWith('pcb_courtyard_'))
  if (!rows.length) throw new Error(`Missing explicit courtyard for ${name}`)
  return rows.map(row => {
    if (row.outline) return [row.outline.map(p => [p.x,p.y])]
    const {x,y} = row.center
    if (row.radius) return [Array.from({length:65},(_,i)=>[x+row.radius*Math.cos(i*Math.PI/32),y+row.radius*Math.sin(i*Math.PI/32)])]
    const angle=(row.ccw_rotation??0)*Math.PI/180
    return [[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(([sx,sy])=>[x+sx*row.width/2*Math.cos(angle)-sy*row.height/2*Math.sin(angle),y+sx*row.width/2*Math.sin(angle)+sy*row.height/2*Math.cos(angle)])]
  })
}

export function placementAdvisories(output, status, circuit=[]) {
  if (!/^placement drc:\s*Errors: 0\s*Warnings: 0\s*$/m.test(output)) throw new Error('Placement DRC contains unexpected errors/warnings')
  const advice = [...output.matchAll(/^  - (\w+) connections cross the routing path between its pads\. Suggested move: rotate \1 180 degrees\.$/gm)].map(m=>m[1]).sort()
  const summary = output.match(/^placement summary: (?:(\d+) courtyard collisions, )?(\d+) suboptimal orientations$/m)
  if (status !== 1 || Number(summary?.[2]) !== reviewed.length || JSON.stringify(advice)!==JSON.stringify(reviewed)) throw new Error('Placement advisories changed; physical review required')
  const pairs = new Map([...output.matchAll(/^  - (\w+) and (\w+) courtyard collision by /gm)].map(m=>[[m[1],m[2]].sort().join(':'),[m[1],m[2]]]))
  if (pairs.size !== Number(summary?.[1]??0)) throw new Error('Courtyard summary differs from detailed collisions')
  for (const [key,[a,b]] of pairs) {
    // The CLI uses axis-aligned bounds for polygon courtyards. Permit only
    // demonstrated empty intersections involving these round 16 mm capacitors.
    if (![a,b].some(n=>n==='C22'||n==='C23') || polygonClipping.intersection(courtyard(circuit,a),courtyard(circuit,b)).length) throw new Error(`Actual or unreviewed courtyard collision: ${key}`)
  }
  return advice
}
