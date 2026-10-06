import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const circuitPath = process.argv[2] || 'dist/index/circuit.json'
const analyzerPath = new URL('../checks/vendor/circuit-json-schematic-placement-analysis.browser.js', import.meta.url)
const expectedAnalyzerSha256 = '62428d06ace175a8474161908505eb4e1a1e8ece649c93a3d423a643bcc242bc'

const analyzerSource = await readFile(analyzerPath)
const analyzerSha256 = createHash('sha256').update(analyzerSource).digest('hex')
if (analyzerSha256 !== expectedAnalyzerSha256) {
  throw new Error(`Schematic style analyzer hash mismatch: expected ${expectedAnalyzerSha256}, got ${analyzerSha256}`)
}

const { analyzeSchematicPlacement, createSchematicPlacementIssueArtifacts } = await import(analyzerPath.href)
const circuitJson = JSON.parse(await readFile(circuitPath, 'utf8'))
const analysis = analyzeSchematicPlacement(circuitJson)
const artifacts = createSchematicPlacementIssueArtifacts(circuitJson, { analysis })
const report = {
  checked_at: new Date().toISOString(),
  circuit_path: circuitPath,
  analyzer: {
    source: 'https://jscdn.tscircuit.com/@tscircuit/circuit-json-schematic-placement-analysis/latest/dist/browser.js',
    sha256: analyzerSha256,
  },
  total_issues: artifacts.length,
  counts: analysis.getIssueCounts(),
  issues: artifacts.map(({ issueIndex, issue, schematicSheetId, descriptionXml }) => ({
    issue_index: issueIndex,
    type: issue.lineItemType,
    schematic_sheet_id: schematicSheetId,
    schematic_sheet_name: issue.schematicSheetName || issue.hostSchematicBox?.schematicSheetName || issue.schematicBox?.schematicSheetName || null,
    message: issue.message || null,
    description_xml: descriptionXml,
  })),
}

await mkdir('docs/checks', { recursive: true })
await writeFile('docs/checks/schematic-style.json', `${JSON.stringify(report, null, 2)}\n`)

console.log(`Schematic style analysis: ${report.total_issues} issue(s)`)
for (const [type, count] of Object.entries(report.counts)) console.log(`- ${type}: ${count}`)
console.log('Evidence: docs/checks/schematic-style.json')
if (report.total_issues !== 0) process.exitCode = 1
