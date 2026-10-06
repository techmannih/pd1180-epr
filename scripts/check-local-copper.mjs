import {readFile,writeFile} from 'node:fs/promises'
import {checkEachPcbTraceNonOverlapping,checkPadTraceClearance,checkViaTraceClearance,checkViaPadClearance,checkPadPadClearance,checkPcbTraceLengths,checkPcbTracesOutOfBoard,checkCopperToBoardEdgeClearance} from '@tscircuit/checks'
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const checks={checkEachPcbTraceNonOverlapping,checkPadTraceClearance,checkViaTraceClearance,checkViaPadClearance,checkPadPadClearance,checkPcbTraceLengths,checkPcbTracesOutOfBoard,checkCopperToBoardEdgeClearance}
const results=[]
for(const [name,check] of Object.entries(checks)) {
 const errors=check(data)
 results.push({name,errors})
 console.log(`${name}: ${errors.length}`)
 for(const error of errors)console.log(error.message)
}
await writeFile('docs/local-copper-check.json',JSON.stringify({scope:'Existing local traces only; no routing-completeness claim',results},null,2))
if(results.some(x=>x.errors.length))process.exitCode=1
