import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'

const check = process.argv.includes('--check')
const contractText = await readFile('hardware-contract.json', 'utf8')
const contract = JSON.parse(contractText)
const mechanicalText = await readFile(contract.mechanical.reference, 'utf8')
const mechanical = JSON.parse(mechanicalText)
const [boardWidth, boardHeight] = contract.mechanical.board_mm
const holes = contract.mechanical.mounting_holes
const pageWidth = 110
const boardLeft = (pageWidth - boardWidth) / 2
const boardTop = 24
const sx = (x) => boardLeft + x
const sy = (y) => boardTop + boardHeight - y
const clean = (n) => Number(n.toFixed(3))
const contractHash = createHash('sha256').update(contractText).digest('hex')
const mechanicalHash = createHash('sha256').update(mechanicalText).digest('hex')

const point = ([x, y]) => `${clean(sx(x))} ${clean(sy(y))}`
const perimeter = mechanical.board.perimeter
const first = perimeter[0]?.from
if (!first) throw new Error('Mechanical reference has no perimeter start point')
const outlineCommands = [`M${point(first)}`]
for (const segment of perimeter) {
  if (segment.type === 'line') outlineCommands.push(`L${point(segment.to)}`)
  else if (segment.type === 'polyline') {
    for (const vertex of segment.points) outlineCommands.push(`L${point(vertex)}`)
  } else if (segment.type === 'arc') {
    const endRadians = segment.end_deg * Math.PI / 180
    const end = [
      segment.center[0] + segment.radius * Math.cos(endRadians),
      segment.center[1] + segment.radius * Math.sin(endRadians),
    ]
    const delta = ((segment.end_deg - segment.start_deg) % 360 + 360) % 360
    const largeArc = delta > 180 ? 1 : 0
    // STEP coordinates use Y-up while SVG uses Y-down, so a positive STEP
    // arc is the counter-clockwise SVG sweep.
    outlineCommands.push(`A${segment.radius} ${segment.radius} 0 ${largeArc} 0 ${point(end)}`)
  } else throw new Error(`Unsupported perimeter segment: ${segment.type}`)
}
outlineCommands.push('Z')
const outlinePath = outlineCommands.join(' ')

const holeSvg = holes.map((hole, index) => {
  const x = clean(sx(hole.x_mm))
  const y = clean(sy(hole.y_mm))
  const r = clean(hole.diameter_mm / 2)
  return `<g><circle cx="${x}" cy="${y}" r="${r}"/><path d="M${clean(x - 3)} ${y}h6M${x} ${clean(y - 3)}v6"/><text x="${clean(x + 3.4)}" y="${clean(y - 2.4)}" font-size="2.2" fill="#111" stroke="none">H${index + 1}</text></g>`
}).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="110mm" height="145mm" viewBox="0 0 110 145" data-contract-sha256="${contractHash}" data-mechanical-sha256="${mechanicalHash}">
<rect width="110" height="145" fill="white"/>
<g font-family="Arial,sans-serif" fill="#111">
<text x="55" y="8" text-anchor="middle" font-size="4">PD1180-EPR / NEMA 34 mounting template</text>
<text x="55" y="14" text-anchor="middle" font-size="2.6">TOP VIEW · Print at 100% · Do not scale</text>
<path d="${outlinePath}" fill="none" stroke="#111" stroke-width="0.3"/>
<g fill="none" stroke="#111" stroke-width="0.22">${holeSvg}
<path d="M51 ${clean(boardTop + boardHeight / 2)}h8M55 ${clean(boardTop + boardHeight / 2 - 4)}v8" stroke="#888"/>
</g>
<g font-size="2.4">
<text x="55" y="19" text-anchor="middle">85.9 × 85.9 mm · 4 × Ø4.2 mm · asymmetric pattern</text>
<text x="55" y="115" text-anchor="middle">Hole coordinates from PCB lower-left corner:</text>
${holes.map((hole, index) => `<text x="55" y="${119 + index * 3}" text-anchor="middle">H${index + 1}: X ${hole.x_mm.toFixed(2)} mm · Y ${hole.y_mm.toFixed(2)} mm</text>`).join('\n')}
<text x="55" y="141" text-anchor="middle">Confirm motor rear-face holes and shaft alignment before fabrication.</text>
</g>
<path d="M45 132h20M45 130v4M65 130v4" fill="none" stroke="#111" stroke-width="0.3"/>
<text x="55" y="137" text-anchor="middle" font-size="2.5">Calibration: exactly 20 mm</text>
</g></svg>\n`

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1320 }, background: 'white' }).render().asPng()

const readPngDimensions = (buffer) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

if (check) {
  const existingSvg = await readFile('mounting-template.svg', 'utf8').catch(() => '')
  const existingPng = await readFile('previews/mounting-template.png').catch(() => Buffer.alloc(0))
  const pngDimensions = readPngDimensions(Buffer.from(existingPng))
  const errors = []
  if (existingSvg !== svg) errors.push('mounting-template.svg is stale; run bun run generate:mounting-template')
  // resvg uses the host font resolver, so otherwise-equivalent text pixels can
  // differ between macOS and Linux. The SVG is the checked mechanical source;
  // verify the PNG derivative by its format and exact physical aspect instead.
  if (pngDimensions?.width !== 1320 || pngDimensions?.height !== 1740) {
    errors.push('previews/mounting-template.png is missing or has the wrong 1320 x 1740 dimensions; run bun run generate:mounting-template')
  }
  console.log(JSON.stringify({ board_mm: [boardWidth, boardHeight], mounting_holes: holes.length, perimeter_segments: perimeter.length, contract_sha256: contractHash, mechanical_sha256: mechanicalHash, errors }, null, 2))
  if (errors.length) process.exitCode = 1
} else {
  await writeFile('mounting-template.svg', svg)
  await writeFile('previews/mounting-template.png', png)
  console.log(`Generated mounting-template.svg and previews/mounting-template.png for ${holes.length} holes.`)
}
