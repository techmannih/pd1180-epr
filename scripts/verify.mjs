import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Run every check, preserving each real exit status even when an earlier check fails.
const routed = process.argv.includes('--routed')
const verifiedInputPaths = ['AGENTS.md', 'board-diagnostics.tsx', 'schematic-pages.tsx', 'index.circuit.tsx', 'board-markings.tsx', 'feature-parity.tsx', 'mounting-template.svg', 'package.json', 'hardware-contract.json', 'board-standards.json', 'routing/requirements.json', 'routing/critical-paths.json', 'scripts/critical_copper.py', 'scripts/check-critical-copper.mjs', 'tscircuit.config.json', 'tscircuit.config.ts', 'tsconfig.json', 'scripts/check-board-standards.mjs', 'scripts/check-schematic-style.mjs', 'scripts/via-net-identity.test.mjs', 'checks/vendor/circuit-json-schematic-placement-analysis.browser.js']
verifiedInputPaths.push('routing/pin-escapes.json', 'scripts/prepare-routing-seed.py', 'scripts/check-routing-fingerprint.mjs', 'scripts/circuit-source-hash.mjs', 'scripts/reinforce-power-copper.py', 'scripts/check-release.mjs', 'scripts/release-gates.test.mjs', 'scripts/check-usb-reference.py', 'scripts/check-usb-reference.mjs')
verifiedInputPaths.push('scripts/power-audit.mjs', 'scripts/power-audit.test.mjs', 'scripts/check-decoupling.mjs', 'scripts/check-native-decoupling.py', 'docs/decoupling-targets.json')
verifiedInputPaths.push('scripts/check-brake-sense.py', 'scripts/check-power-eco.py', 'scripts/simulate-power-eco.py', 'engineering/power-thermal-eco.json', 'scripts/check-protection-refinement.mjs', 'engineering/protection-refinement.json')
verifiedInputPaths.push('scripts/check-power-routing.mjs', 'scripts/power-copper-geometry.mjs', 'scripts/power-copper-geometry.test.mjs')
verifiedInputPaths.push('motor-assembly.circuit.tsx', 'imports/MotorAssemblyCad.ts', 'engineering/mechanical/34hs31-6004s1.glb', 'engineering/mechanical/assembly.json', 'engineering/mechanical/34HS31-6004S1-manufacturer.zip', 'docs/motor-data.json', 'scripts/generate-motor-assembly.mjs', 'scripts/check-motor-assembly.mjs')
verifiedInputPaths.push('engineering/mechanical/harness-layout.json', 'engineering/mechanical/harness-proposal.zip', 'scripts/assembly-glb.mjs', 'scripts/assembly-glb.test.mjs', 'scripts/generate-harness-assembly.mjs', 'scripts/check-harness-assembly.mjs', 'scripts/harness-geometry.mjs', 'scripts/harness-geometry.test.mjs', 'docs/complete-assembly.md')
verifiedInputPaths.push('engineering/mechanical/ordered-motor-pcb-reference.json', 'scripts/motor-mounting-geometry.mjs', 'scripts/motor-mounting-geometry.test.mjs', 'scripts/design.test.mjs')
verifiedInputPaths.push('bun.lock', 'scripts/generate-cloud-viewer.mjs', 'scripts/refresh-routed-preview.mjs', 'scripts/check-cloud-viewer.mjs', 'scripts/cloud-viewer-net-names.test.mjs')
for (const dir of ['imports', 'firmware/src', 'firmware/include', 'firmware/target', 'firmware/boards']) {
  for (const file of (await readdir(dir)).sort()) verifiedInputPaths.push(`${dir}/${file}`)
}
verifiedInputPaths.push('firmware/platformio.ini', 'docs/firmware-pinmap.json', 'docs/pd-configuration.json', 'docs/release-status.json', 'scripts/build-firmware.mjs', 'scripts/check-operating-mode.mjs')
async function hashInputs() {
  return Object.fromEntries(await Promise.all(verifiedInputPaths.map(async (path) => [path, createHash('sha256').update(await readFile(path)).digest('hex')])))
}
verifiedInputPaths.push('engineering/motor-harness.json', 'docs/motor-harness.md', 'scripts/export-assembly.mjs', 'scripts/export-kicad-route.mjs', 'scripts/normalize-kicad-parity.mjs', 'scripts/export-manufacturing.mjs', 'scripts/check-assembly.mjs', 'scripts/assembly-policy.mjs', 'scripts/assembly-policy.test.mjs', 'scripts/export-release.mjs', 'scripts/check-delivery.mjs', 'scripts/check-stock.mjs', 'docs/external-system.md', 'docs/external-parts.json')
verifiedInputPaths.push('docs/indicators.md', 'docs/pd-programming.md')
verifiedInputPaths.push('scripts/verify-programming.mjs', 'scripts/verify-programming.test.mjs', 'docs/pd-configuration-review.md')
verifiedInputPaths.push('engineering/reference-comparison.json', 'docs/reference-review.md', 'docs/connector-harnesses.md', 'scripts/check-feature-parity.mjs')
verifiedInputPaths.push('engineering/onboard-control-eco.json', 'engineering/interface-cleanup.json', 'engineering/mechanical/assembly-parts.json', 'engineering/mechanical/34hs31-6004s1-routed-cable.glb', 'scripts/check-cable-support.mjs')
verifiedInputPaths.push('scripts/check-mechanical-assets.mjs', 'scripts/export-previews.mjs')
for (const file of (await readdir('engineering/mechanical/parts')).sort()) verifiedInputPaths.push(`engineering/mechanical/parts/${file}`)
verifiedInputPaths.push('scripts/native-eco-policy.mjs', 'scripts/native-eco-policy.test.mjs', 'engineering/unused-sbu-eco.json', 'scripts/check-placement.mjs', 'scripts/placement-review.mjs', 'scripts/placement-review.test.mjs', 'docs/placement-review.md', 'scripts/jlc-stock.mjs', 'scripts/jlc-stock.test.mjs')
verifiedInputPaths.push('scripts/fixtures/placement-reviewed.txt')
verifiedInputPaths.push('scripts/pd-image-policy.mjs', 'scripts/check-pd-image.mjs', 'scripts/pd-image-policy.test.mjs', 'docs/pd-tool-project.json', 'firmware/pd/ti-configuration.zip')
verifiedInputPaths.push('docs/readiness.md', 'docs/brake-integration.md', 'scripts/check-alternatives.mjs')
verifiedInputPaths.push('scripts/silkscreen-review.mjs', 'scripts/silkscreen-review.test.mjs', 'engineering/native-silk-hold.json', 'scripts/check-pcb-references.mjs', 'scripts/sync-pcb-references.py')
verifiedInputPaths.push('scripts/check-inventory.mjs', 'docs/stock-report.json', 'docs/alternatives.json', 'firmware/tests/test_brake_preflight.c', 'firmware/README.md')
verifiedInputPaths.push('docs/completion-handoff.md', 'engineering/mechanical/splice-evidence.json', 'engineering/mechanical/TE-320559-drawing.zip', 'engineering/filled-copper-review.json')
verifiedInputPaths.push('scripts/check-copper-evidence.mjs', 'scripts/copper-evidence.test.mjs')
verifiedInputPaths.push('docs/sourcing-resolution.md', 'docs/manufacturing-acceptance.md', 'sourcing/procurement-open-items.csv', 'release/order-settings.json', 'engineering/sourcing-native-metadata.json')
verifiedInputPaths.push('scripts/prepare-routing-rules.py', 'scripts/routing-rules.test.mjs')
verifiedInputPaths.push('scripts/splice-model.mjs', 'scripts/splice-model.test.mjs', 'engineering/mechanical/harness-parts.zip')
verifiedInputPaths.push('docs/u16-footprint.md', 'engineering/u16-footprint-review.json', 'docs/u35-footprint.md', 'engineering/u35-footprint-review.json', 'engineering/stocked-controller-eco.json', 'scripts/design.test.mjs')
verifiedInputPaths.push('scripts/check-usb-access.mjs', 'scripts/usb-access.test.mjs', 'engineering/usb-edge-eco.json', 'docs/usb-access.md')
verifiedInputPaths.push('scripts/render-local-mechanical.mjs', 'scripts/brake-assembly.mjs', 'scripts/brake-assembly.test.mjs', 'scripts/encoder-bypass-policy.mjs', 'scripts/encoder-bypass-policy.test.mjs', 'engineering/mechanical/brake-evidence.json', 'engineering/mechanical/Vishay-LPS300-manufacturer.zip', 'engineering/encoder-top-eco.json', 'docs/brake-assembly.md')
verifiedInputPaths.push('scripts/copper-geometry-policy.mjs', 'scripts/check-copper-geometry.mjs', 'scripts/copper-geometry-policy.test.mjs', 'scripts/refine-copper-geometry.py')
verifiedInputPaths.push('engineering/copper-geometry-review.json', 'docs/copper-geometry-review.md', 'docs/copper-contact-review.png', 'scripts/export-filled-power-copper.py', 'scripts/screen-filled-power-copper.py', 'scripts/test-filled-power-copper.py')
verifiedInputPaths.push('engineering/source-design-rule-eco.json', 'engineering/source-design-rule-delta.zip', 'scripts/apply-source-rule-eco.mjs', 'docs/source-design-rules.md', 'scripts/source-design-policy.mjs', 'scripts/source-design-policy.test.mjs', 'scripts/source_design_rules.py', 'scripts/test-source-design-rules.py', 'scripts/check-source-design-rules.mjs', 'scripts/add-board-planes.py', 'scripts/clean-silkscreen.py')
verifiedInputPaths.push('scripts/native-kicad-artifact.mjs', 'scripts/native-kicad-artifact.test.mjs', 'engineering/native-kicad-artifact.json')
const inputsBefore = await hashInputs()
const checks = [
  ['toolchain', ['run', 'check:toolchain']],
  ['cloud-package', ['run', 'check:cloud-package']],
  ['mounting-template', ['run', 'check:mounting-template']],
  ['typecheck', ['run', 'typecheck']],
  ['mechanical-assets', ['scripts/check-mechanical-assets.mjs']],
  ['cable-support', ['scripts/check-cable-support.mjs']],
  ['import-previews', ['run', 'check:import-previews']],
  ['firmware-pins', ['run', 'check:firmware-pins']],
  ['firmware', ['run', 'check:firmware']],
  ['firmware-target', ['run', 'check:firmware-target']],
  ['programming-readback-tests', ['test', 'scripts/verify-programming.test.mjs', 'scripts/pd-image-policy.test.mjs']],
  ['native-download-tests', ['test', 'scripts/kicad-download.test.mjs', 'scripts/native-kicad-artifact.test.mjs']],
  ['pd-image', ['scripts/check-pd-image.mjs']],
  ['operating-mode', ['run', 'check:operating-mode']],
  ['preview', ['run', 'build:preview']],
  ['cloud-viewer', ['run', 'check:cloud-viewer']],
  ['source-schematic', ['run', 'check:source-schematic']],
  ['schematic-style', ['run', 'check:schematic-style']],
  ['feature-parity', ['run', 'check:feature-parity']],
  ['normalize-svgs', ['run', 'normalize:svgs']],
  ['script-catalog', ['run', 'check:script-catalog']],
  ['topology-tests', ['test', 'scripts/copper-geometry-policy.test.mjs', 'scripts/brake-assembly.test.mjs', 'scripts/encoder-bypass-policy.test.mjs', 'scripts/usb-access.test.mjs', 'scripts/routing-rules.test.mjs', 'scripts/splice-model.test.mjs', 'scripts/copper-evidence.test.mjs', 'scripts/silkscreen-review.test.mjs', 'scripts/native-eco-policy.test.mjs', 'scripts/placement-review.test.mjs', 'scripts/jlc-stock.test.mjs', 'scripts/assembly-glb.test.mjs', 'scripts/harness-geometry.test.mjs', 'scripts/assembly-policy.test.mjs', 'scripts/motor-mounting-geometry.test.mjs', 'scripts/design.test.mjs', 'scripts/via-net-identity.test.mjs', 'scripts/power-copper-geometry.test.mjs', 'scripts/release-gates.test.mjs', 'scripts/power-audit.test.mjs', 'scripts/cloud-viewer-net-names.test.mjs']],
  ['netlist', ['run', 'check:netlist']],
  ['protection-refinement', ['scripts/check-protection-refinement.mjs']],
  ['usb-access', ['scripts/check-usb-access.mjs']],
  ['power-audit', ['run', 'check:power-audit']],
  ['filled-copper-evidence', ['scripts/check-copper-evidence.mjs']],
  ['power-simulation', ['run', 'check:power-simulation']],
  ['schematic', ['run', 'check:schematic']],
  ['placement', ['run', 'check:placement']],
  ['routing-difficulty', ['run', 'check:routing']],
  ['decoupling', ['run', 'check:decoupling', ...(routed ? ['--native'] : [])]],
  ['inventory-evidence', ['scripts/check-inventory.mjs', '--review']],
  ['assembly', ['run', 'check:assembly', '--review']],
  ['board-standards', ['run', 'check:standards']],
  ['source-design-policy-tests', ['test', 'scripts/source-design-policy.test.mjs']],
  ...(routed ? [['source-design-rules', ['scripts/check-source-design-rules.mjs']]] : []),
  ['local-copper', ['run', 'check:local-copper']],
  ['shorts', ['run', 'check:shorts']],
  ...(routed ? [['copper-geometry', ['scripts/check-copper-geometry.mjs']]] : []),
  ...(routed ? [['kicad-drc', ['run', 'check:kicad-drc']]] : []),
  ...(routed ? [['critical-copper', ['run', 'check:critical-copper']]] : []),
  ...(routed ? [['usb-reference', ['run', 'check:usb-reference']]] : []),
  ...(routed ? [['power-routing', ['run', 'check:power-routing']]] : []),
  ...(routed ? [['routing-fingerprint', ['run', 'check:routing-fingerprint']]] : []),
]
await mkdir('docs/checks', {recursive: true})
const results=[]
for (const [name,args] of checks) {
  const log=`docs/checks/${name}.log`
  const started=Date.now()
  const exit_code=await new Promise((resolve,reject)=>{
    const stream=createWriteStream(log)
    const child=spawn('bun',args,{stdio:['ignore','pipe','pipe']})
    child.stdout.pipe(stream,{end:false});child.stderr.pipe(stream,{end:false})
    child.on('error',reject)
    child.on('close',code=>stream.end(()=>resolve(code ?? 1)))
  })
  results.push({name,exit_code,status:exit_code===0?'pass':'fail',seconds:(Date.now()-started)/1000,log})
  console.log(`${name}: ${exit_code===0?'PASS':'FAIL'} (${log})`)
}
const data=JSON.parse(await readFile('dist/index/circuit.json'))
const releaseStatus=JSON.parse(await readFile('docs/release-status.json'))
const inputsAfter = await hashInputs()
const changedInputs = verifiedInputPaths.filter((path) => inputsBefore[path] !== inputsAfter[path])
await writeFile('docs/checks/input-stability.log', changedInputs.length ? `Changed during validation:\n${changedInputs.join('\n')}\n` : 'Verified inputs remained unchanged during validation.\n')
results.push({name:'input-stability',exit_code:changedInputs.length?1:0,status:changedInputs.length?'fail':'pass',seconds:0,log:'docs/checks/input-stability.log'})
console.log(`input-stability: ${changedInputs.length?'FAIL':'PASS'} (docs/checks/input-stability.log)`)
const counts={}
for(const row of data) if(row.type.endsWith('_error')||row.type.endsWith('_warning')) counts[row.type]=(counts[row.type]||0)+1
const messageCount = Object.values(counts).reduce((total, count) => total + count, 0)
await writeFile('docs/checks/source-messages.log', `${JSON.stringify(counts, null, 2)}\n`)
results.push({name:'source-messages',exit_code:messageCount ? 1 : 0,status:messageCount ? 'fail' : 'pass',seconds:0,log:'docs/checks/source-messages.log'})
console.log(`source-messages: ${messageCount ? 'FAIL' : 'PASS'} (${messageCount} errors/warnings)`)
const report={
  checked_at:new Date().toISOString(),
  entry_sha256:inputsBefore['index.circuit.tsx'],
  verified_inputs:inputsBefore,
  source_changed_during_validation:changedInputs,
  model:routed?'source checks plus externally routed KiCad PCB verification':'routing-disabled review preview',
  checks:results,
  circuit_messages:counts,
  routed_board_verified:routed && results.every(r=>r.exit_code===0),
  prototype_fabrication_orderable:routed && results.every(r=>r.exit_code===0) && releaseStatus.fabrication_orderable === true && Object.values(releaseStatus.prototype_order_gates).every(passed=>passed===true),
  production_released:false,
  limitations:[
    'The KiCad DRC proves geometric connectivity under the committed project rules; it does not replace physical validation.',
    'Raw placement heuristic output is retained with a narrow physical review and regression checks; all other failures remain blocking.',
    'Stock is a separate timestamped check in stock-report.json, not reserved assembly inventory.',
    'See routing-report.json for the final route record and release-status.json for hardware/firmware gates.'
  ]
}
await writeFile('docs/verification.json',JSON.stringify(report,null,2))
const verificationMarkdown = `# PD1180-EPR verification\n\n` +
  `Validated **${report.checked_at}** against the pinned local toolchain. This summary is generated by \`bun run verify\`; machine-readable results remain in [docs/verification.json](docs/verification.json).\n\n` +
  `| Check | Result | Time | Evidence |\n|---|---:|---:|---|\n` +
  results.map((result) => `| ${result.name} | ${result.status.toUpperCase()} | ${result.seconds.toFixed(1)} s | \`${result.log}\` |`).join('\n') +
  `\n\n- Routed KiCad board verified: **${report.routed_board_verified ? 'yes' : 'no'}**\n` +
  `- Source errors/warnings: **${messageCount}**\n` +
  `- Prototype fabrication orderable: **${report.prototype_fabrication_orderable ? 'yes' : 'no'}**\n` +
  `- Production released: **no**\n` +
  `- Verified entry SHA-256: \`${report.entry_sha256}\`\n\n` +
  `Production remains gated by PD programming/readback, qualified STM32 operation, brake/load sizing, mounting, magnet alignment and powered thermal/EMC validation. See [docs/release-status.json](docs/release-status.json).\n`
await writeFile('verification.md', verificationMarkdown)
if(results.some(r=>r.exit_code!==0))process.exitCode=1
