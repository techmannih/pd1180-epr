import {execFileSync} from 'node:child_process'
const output=execFileSync('bunx',['tsci','check','netlist','index.circuit.tsx'],{encoding:'utf8',maxBuffer:8e6})
console.log(output)
// Some tsci check versions print errors but still exit zero.
const count=Number(output.match(/Errors:\s*(\d+)/)?.[1]??NaN)
if(!Number.isFinite(count)||count>0)process.exitCode=1
