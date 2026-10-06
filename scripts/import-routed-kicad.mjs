import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { basename } from 'node:path'
import { KicadToCircuitJsonConverter } from 'kicad-to-circuit-json'
import { convertCircuitJsonToPcbSvg } from 'circuit-to-svg'
import { Resvg } from '@resvg/resvg-js'

const boardPath = process.argv[2]
if (!boardPath) throw new Error('Usage: bun scripts/import-routed-kicad.mjs <board.kicad_pcb>')
const converter = new KicadToCircuitJsonConverter()
converter.addFile(basename(boardPath), await readFile(boardPath, 'utf8'))
converter.runUntilFinished()
const output = converter.getOutput()
await mkdir('dist/routed', { recursive: true })
await writeFile('dist/routed/circuit.json', `${JSON.stringify(output, null, 2)}\n`)
const svg = convertCircuitJsonToPcbSvg(output, { width: 2400, height: 2400, showPcbGroups: false })
await writeFile('dist/routed/pcb.svg', svg)
await writeFile('dist/routed/pcb.png', new Resvg(svg).render().asPng())
const stats = converter.getStats()
const warnings = converter.getWarnings()
await writeFile('dist/routed/import-report.json', `${JSON.stringify({ board: boardPath, stats, warnings }, null, 2)}\n`)
console.log(JSON.stringify({ stats, warnings }, null, 2))
