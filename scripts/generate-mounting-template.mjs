import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'

const check = process.argv.includes('--check')
const contractText = await readFile('hardware-contract.json', 'utf8')
const contract = JSON.parse(contractText)
const [boardWidth, boardHeight] = contract.mechanical.board_mm
const holes = contract.mechanical.mounting_holes
const pageWidth = 110
const boardLeft = (pageWidth - boardWidth) / 2
const boardTop = 24
const sx = (x) => boardLeft + x
const sy = (y) => boardTop + boardHeight - y
const clean = (n) => Number(n.toFixed(3))
const contractHash = createHash('sha256').update(contractText).digest('hex')

const holeSvg = holes.map((hole, index) => {
  const x = clean(sx(hole.x_mm))
  const y = clean(sy(hole.y_mm))
  const r = clean(hole.diameter_mm / 2)
  return `<g><circle cx="${x}" cy="${y}" r="${r}"/><path d="M${clean(x - 3)} ${y}h6M${x} ${clean(y - 3)}v6"/><text x="${clean(x + 3.4)}" y="${clean(y - 2.4)}" font-size="2.2" fill="#111" stroke="none">H${index + 1}</text></g>`
}).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="110mm" height="145mm" viewBox="0 0 110 145" data-contract-sha256="${contractHash}">
<rect width="110" height="145" fill="white"/>
<g font-family="Arial,sans-serif" fill="#111">
<text x="55" y="8" text-anchor="middle" font-size="4">PD1180-EPR / NEMA 34 mounting template</text>
<text x="55" y="14" text-anchor="middle" font-size="2.6">TOP VIEW · Print at 100% · Do not scale</text>
<rect x="${clean(boardLeft)}" y="${boardTop}" width="${boardWidth}" height="${boardHeight}" rx="5.9" fill="none" stroke="#111" stroke-width="0.3"/>
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

if (check) {
  const existingSvg = await readFile('mounting-template.svg', 'utf8').catch(() => '')
  const existingPng = await readFile('previews/mounting-template.png').catch(() => Buffer.alloc(0))
  const errors = []
  if (existingSvg !== svg) errors.push('mounting-template.svg is stale; run bun run generate:mounting-template')
  if (!Buffer.from(existingPng).equals(Buffer.from(png))) errors.push('previews/mounting-template.png is stale; run bun run generate:mounting-template')
  console.log(JSON.stringify({ board_mm: [boardWidth, boardHeight], mounting_holes: holes.length, contract_sha256: contractHash, errors }, null, 2))
  if (errors.length) process.exitCode = 1
} else {
  await writeFile('mounting-template.svg', svg)
  await writeFile('previews/mounting-template.png', png)
  console.log(`Generated mounting-template.svg and previews/mounting-template.png for ${holes.length} holes.`)
}
