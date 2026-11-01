import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { powerPaths } from './check-copper-evidence.mjs'

// Geometry comes from export-filled-power-copper.py after native zone refill.
// Keep raw per-path results; a converged DC screen is not thermal qualification.
const [geometryPath, outputDirectory] = process.argv.slice(2)
if (!geometryPath || !outputDirectory) throw new Error('Usage: PYTHON=... bun scripts/generate-copper-screens.mjs filled-copper.json output-directory')
const geometry = JSON.parse(await readFile(geometryPath))
const architecture = JSON.parse(await readFile('engineering/power-audit.json')).architecture
const run = promisify(execFile)
await mkdir(outputDirectory, {recursive:true})
const rows=[], refined=[]
for (const [net, from, to] of powerPaths({architecture})) {
  const pair=[]; const sequence=[]
  for (const grid of [.075,.05,.025,.02]) {
    if (grid<.05 && Math.abs(sequence.at(-2).resistance_mohm_20c/sequence.at(-1).resistance_mohm_20c-1)<=.03) break
    const {stdout} = await run(process.env.PYTHON || 'python3', ['scripts/screen-filled-power-copper.py', geometryPath, net, String(grid), from, to], {maxBuffer:1024*1024})
    const result=JSON.parse(stdout)
    if (result.board_sha256!==geometry.board_sha256 || result.net!==net || result.from!==from || result.to!==to || result.grid_mm!==grid || !(result.resistance_mohm_20c>0)) throw new Error('Unexpected copper-screen result')
    await writeFile(join(outputDirectory, `${net}-${to.replaceAll(':','-').replaceAll(',','_')}-${grid}.json`),JSON.stringify(result,null,2)+'\n')
    sequence.push(result)
    if(grid<.05) refined.push(result); else {rows.push(result);pair.push(result)}
    console.log(net,from,to,grid,result.resistance_mohm_20c)
  }
}
const model_source_sha256={}
for(const path of ['scripts/export-filled-power-copper.py','scripts/screen-filled-power-copper.py','scripts/test-filled-power-copper.py']) model_source_sha256[path]=createHash('sha256').update(await readFile(path)).digest('hex')
await writeFile(join(outputDirectory,'summary.json'),JSON.stringify({architecture,board_sha256:geometry.board_sha256,model_source_sha256,rows,refined},null,2)+'\n')
