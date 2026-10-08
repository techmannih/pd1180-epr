import { readFile, readdir, writeFile } from 'node:fs/promises'
import { CircuitRunner } from '@tscircuit/eval'

// Use the same entrypoint selection and runtime configuration as the dev viewer.
const importFiles = (await readdir('imports')).filter((file) => /\.(tsx?|jsx?)$/.test(file)).sort().map((file) => `imports/${file}`)
const files = ['tscircuit.config.ts', 'tscircuit.config.json', 'tsconfig.json', ...importFiles]
const fsMap = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])))
const results = []
for (const file of importFiles.filter((file) => file.endsWith('.tsx'))) {
  const runner = new CircuitRunner()
  try {
    await runner.executeWithFsMap({ fsMap: { ...fsMap }, mainComponentPath: file })
    await runner.renderUntilSettled()
    const circuit = await runner.getCircuitJson()
    const counts = Object.fromEntries(['source_component', 'schematic_component', 'pcb_component'].map((type) => [type, circuit.filter((item) => item.type === type).length]))
    const errors = circuit.filter((item) => item.type === 'source_failed_to_create_component_error')
    const pass = Object.values(counts).every((count) => count > 0) && errors.length === 0
    results.push({ file, pass, counts, errors })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${file}: ${JSON.stringify(counts)}`)
  } catch (error) {
    results.push({ file, pass: false, error: String(error) })
    console.error(`FAIL ${file}: ${error}`)
  }
}
const pass = results.length > 0 && results.every((result) => result.pass)
await writeFile('docs/import-preview-check.json', `${JSON.stringify({ checked_at: new Date().toISOString(), pass, components: results.length, results }, null, 2)}\n`)
if (!pass) process.exitCode = 1
