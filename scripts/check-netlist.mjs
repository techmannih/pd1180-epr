import {readFile} from 'node:fs/promises'
import {runAllNetlistChecks} from '@tscircuit/checks'
import {categorizeErrorOrWarning} from '@tscircuit/circuit-json-util'

// verify.mjs builds this artifact first. Apply the pinned checker directly to
// that same board; the CLI entry-file path starts a redundant schematic render.
const circuit=JSON.parse(await readFile('dist/index/circuit.json','utf8'))
const generated=circuit.filter(row=>row.type?.endsWith('_error') || row.type?.endsWith('_warning') || row.error_type || row.warning_type)
const findings=[...generated.filter(row=>categorizeErrorOrWarning(row)==='netlist'),...await runAllNetlistChecks(circuit)]
const unique=[...new Map(findings.map(row=>[JSON.stringify(row),row])).values()]
const warnings=unique.filter(row=>row.warning_type || row.type?.endsWith('_warning'))
const errors=unique.filter(row=>!warnings.includes(row))
console.log(`Errors: ${errors.length}\nWarnings: ${warnings.length}`)
for(const row of unique) console.log(JSON.stringify(row))
if(errors.length || warnings.length) process.exitCode=1
