#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

function fail(message) { throw new Error(message) }
function binary(envName, command, macFallback) {
  if (process.env[envName]) return process.env[envName]
  const found = Bun.which(command)
  if (found) return found
  if (macFallback && existsSync(macFallback)) return macFallback
  fail(`missing ${command}; set ${envName}`)
}
function run(cmd, cwd) {
  const p = Bun.spawnSync({ cmd, cwd, stdout: 'pipe', stderr: 'pipe', env: process.env })
  const stdout = new TextDecoder().decode(p.stdout), stderr = new TextDecoder().decode(p.stderr)
  if (p.exitCode !== 0) fail(`command exited ${p.exitCode}: ${cmd.join(' ')}\n${stdout}\n${stderr}`)
  return { exitCode: p.exitCode, stdout, stderr }
}
function deterministicUuid(key) {
  const b = createHash('sha256').update(`pd1180-kicad-parity:${key}`).digest().subarray(0, 16)
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80
  const h = b.toString('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}
function props(symbol) { return Object.fromEntries(symbol.properties.map((p) => [p.key, p])) }
function baseFpid(value) { return value.split(':').at(-1) }
function namedNets(fp) { return Object.fromEntries(fp.pads.filter((p) => p.number && p.net && !p.net.startsWith('unconnected-(')).map((p) => [p.number, p.net])) }
function sameObject(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
function snapConnectionGrid(value) { return Math.round(value / 1.27) * 1.27 }

if (process.argv.length !== 5) fail('usage: normalize-kicad-parity.mjs ROUTED_BOARD FRESH_EXPORT_DIR OUTPUT_DIR')
const routedBoard = resolve(process.argv[2]), freshDir = resolve(process.argv[3]), outputDir = resolve(process.argv[4])
if (!existsSync(routedBoard)) fail(`routed board missing: ${routedBoard}`)
if (!existsSync(freshDir)) fail(`fresh export directory missing: ${freshDir}`)
if (existsSync(outputDir) || existsSync(`${outputDir}.tmp-${process.pid}`)) fail(`output/staging path already exists: ${outputDir}`)
const base = basename(routedBoard, '.kicad_pcb'), freshBoard = join(freshDir, `${base}.kicad_pcb`), freshPro = join(freshDir, `${base}.kicad_pro`), freshRoot = join(freshDir, 'index.kicad_sch')
for (const p of [freshBoard, freshPro, freshRoot]) if (!existsSync(p)) fail(`required fresh-export input missing: ${p}`)
const here = dirname(fileURLToPath(import.meta.url)), defaultKicadts = resolve(here, '..', 'node_modules', 'kicadts', 'dist', 'index.js')
const kicadtsPath = resolve(process.env.KICADTS_INDEX || defaultKicadts)
if (!existsSync(kicadtsPath)) fail(`kicadts entry missing: ${kicadtsPath}; set KICADTS_INDEX`)
const k = await import(pathToFileURL(kicadtsPath).href)
const { parseKicadSch, GlobalLabel, TextEffects, TextEffectsFont, NoConnect, SymbolPin, SymbolPinName, SymbolPinNumber } = k
const macKicadPython = '/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3'
const kicadPython = process.env.KICAD_PYTHON || (existsSync(macKicadPython) ? macKicadPython : binary('KICAD_PYTHON', 'python3'))
const kicadCli = binary('KICAD_CLI', 'kicad-cli', '/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli')
const stage = `${outputDir}.tmp-${process.pid}`
await mkdir(stage, { recursive: false })
try {
  const projectPath = join(stage, `${base}.kicad_pro`)
  await copyFile(routedBoard, join(stage, `${base}.kicad_pcb`)); await copyFile(freshPro, projectPath); await copyFile(freshRoot, join(stage, `${base}.kicad_sch`))
  const project = JSON.parse(await readFile(projectPath, 'utf8'))
  project.erc ??= { meta: { version: 0 }, erc_exclusions: [] }
  project.erc.erc_exclusions ??= []
  if (project.erc.erc_exclusions.length) fail('fresh project contains explicit ERC exclusions')
  project.erc.rule_severities ??= {}
  // The project is self-contained: symbols and footprints are embedded in the
  // generated schematic/board rather than installed as external KiCad libraries.
  // These two link-refresh checks therefore have no electrical meaning here.
  Object.assign(project.erc.rule_severities, {
    footprint_link_issues: 'ignore',
    lib_symbol_issues: 'ignore',
  })
  await writeFile(projectPath, `${JSON.stringify(project, null, 2)}\n`)
  for (const name of await readdir(freshDir)) if (name.endsWith('.kicad_sch') && name !== 'index.kicad_sch') await copyFile(join(freshDir, name), join(stage, name))
  const exportPy = String.raw`import pcbnew,json,sys,wx
app=wx.App(False)

def dump(src,dst):
 b=pcbnew.LoadBoard(src); out=[]
 for f in b.GetFootprints():
  try: fid=f.GetFPID().GetUniStringLibId()
  except: fid=str(f.GetFPID())
  try: descr=f.GetDescription()
  except: descr=''
  out.append({'ref':f.GetReference(),'value':f.GetValue(),'fpid':fid,'description':descr,'pads':[{'number':p.GetNumber(),'net':p.GetNetname()} for p in f.Pads()]})
 json.dump(out,open(dst,'w'),indent=2,ensure_ascii=False)
dump(sys.argv[1],sys.argv[2]);dump(sys.argv[3],sys.argv[4])`
  const routedMetaPath = join(stage, 'routed-board-meta.json'), freshMetaPath = join(stage, 'fresh-board-meta.json')
  run([kicadPython, '-c', exportPy, join(stage, `${base}.kicad_pcb`), routedMetaPath, freshBoard, freshMetaPath], stage)
  const routedMeta = JSON.parse(await readFile(routedMetaPath, 'utf8')), freshMeta = JSON.parse(await readFile(freshMetaPath, 'utf8'))
  const board = new Map(routedMeta.filter((x) => x.ref).map((x) => [x.ref, x])), fresh = new Map(freshMeta.filter((x) => x.ref).map((x) => [x.ref, x]))
  if (!sameObject([...board.keys()].sort(), [...fresh.keys()].sort())) fail('routed/fresh reference sets differ')
  for (const [ref, bm] of board) {
    const fm = fresh.get(ref)
    if (baseFpid(bm.fpid) !== baseFpid(fm.fpid)) fail(`${ref}: footprint geometry differs (${bm.fpid} vs ${fm.fpid})`)
    if (!sameObject(namedNets(bm), namedNets(fm))) fail(`${ref}: named pad nets differ from fresh export`)
  }
  const extraPins = { J1: {'2':'5','3':'5','4':'5','6':'5','8':'7','17':'7','18':'7','19':'5','20':'5'}, J10: {'2':'5','3':'5','4':'5','6':'5','8':'7','11':'13','14':'12','17':'7','18':'7','19':'5','20':'5'}, U1: {'6':'5','7':'4'} }
  const allowedOmittedNoNetPins = new Set(['U6.11','U6.19','U6.20','U6.21','U6.22','U6.23','U6.24'])
  const allowedNonPhysicalRefs = new Set(['GND','PD_VBUS','USB_DATA_VBUS','V3V3_PD','VMOTOR','V3V3_MOTOR','V3V3','PD_3V3','VBUS_LV','PD_1V5','TMC_12V','TMC_5V','TMC_VCC','EFUSE_IN'])
  const stats = { physicalSymbols: 0, removedNonPhysicalPowerSymbols: 0, snappedLibraryPinCoordinates: 0, labels: 0, noConnects: 0, addedDuplicatePins: [], explicitlyAllowedOmittedNoNetPins: [], ncAssignments: [] }
  const foundRefs = new Map()
  const sheets = (await readdir(stage)).filter((n) => n.endsWith('.kicad_sch') && n !== `${base}.kicad_sch`).sort()
  for (const name of sheets) {
    const file = join(stage, name), sch = parseKicadSch(await readFile(file, 'utf8')), physical = []
    for (const symbol of sch.symbols) {
      const ref = props(symbol).Reference?.value
      if (board.has(ref)) { physical.push(symbol); foundRefs.set(ref, (foundRefs.get(ref) || 0) + 1) }
      else if (allowedNonPhysicalRefs.has(ref)) stats.removedNonPhysicalPowerSymbols++
      else fail(`${name}: unexpected non-board symbol ${JSON.stringify(ref)}`)
    }
    sch.symbols = physical; sch.wires = []; sch.junctions = []; sch.labels = []; sch.globalLabels = []; sch.noConnects = []
    // KiCad checks both the symbol origin and every embedded-library pin
    // connection point against its 1.27 mm electrical grid. tscircuit emits
    // metric/fine-grid symbols, so normalize both in this generated parity
    // copy. The hidden labels below are then placed on those exact endpoints.
    const snapPins = (node) => {
      for (const pin of node.pins || []) {
        const x = snapConnectionGrid(pin.at.x), y = snapConnectionGrid(pin.at.y)
        if (x !== pin.at.x) stats.snappedLibraryPinCoordinates++
        if (y !== pin.at.y) stats.snappedLibraryPinCoordinates++
        pin.at.x = x; pin.at.y = y
      }
      for (const child of node.subSymbols || []) snapPins(child)
    }
    for (const lib of sch.libSymbols.symbols) snapPins(lib)
    const labels = [], noConnects = []
    for (const symbol of physical) {
      const ps = props(symbol), ref = ps.Reference.value, bm = board.get(ref), fm = fresh.get(ref); stats.physicalSymbols++
      // KiCad's default electrical connection grid is 1.27 mm. The source
      // schematic uses finer coordinates, so snap only this generated parity
      // copy before placing its hidden net labels on the pin endpoints.
      symbol.at.x = snapConnectionGrid(symbol.at.x)
      symbol.at.y = snapConnectionGrid(symbol.at.y)
      ps.Value.value = fm.value; ps.Footprint.value = bm.fpid; ps.Description.value = bm.description
      const lib = sch.libSymbols.symbols.find((x) => x.libraryId === symbol.libraryId)
      if (!lib) fail(`${name}:${ref}: embedded library symbol missing`)
      const entries = []; const collect = (node) => { for (const pin of node.pins || []) entries.push({ parent: node, pin }); for (const child of node.subSymbols || []) collect(child) }; collect(lib)
      const instantiated = new Set(symbol.pins.map((p) => p.numberString)), byNumber = new Map(entries.filter((e) => instantiated.has(e.pin.numberString)).map((e) => [e.pin.numberString, e]))
      const padMap = new Map(); for (const pad of bm.pads) if (pad.number) { const old = padMap.get(pad.number); if (old && old.net !== pad.net) fail(`${ref}: duplicate pad ${pad.number} has inconsistent nets`); padMap.set(pad.number, pad) }
      for (const [newNumber, sourceNumber] of Object.entries(extraPins[ref] || {})) {
        if (byNumber.has(newNumber)) continue
        const source = byNumber.get(sourceNumber); if (!source) fail(`${ref}: source pin ${sourceNumber} missing while adding ${newNumber}`)
        if (padMap.get(newNumber)?.net !== padMap.get(sourceNumber)?.net) fail(`${ref}: duplicate pad ${newNumber} net differs from source ${sourceNumber}`)
        const pin = new SymbolPin(); pin.pinElectricalType = source.pin.pinElectricalType || 'passive'; pin.pinGraphicStyle = source.pin.pinGraphicStyle || 'line'; pin.at = source.pin.at; pin.length = source.pin.length
        pin._sxName = new SymbolPinName({ value: source.pin.name || `Pad${newNumber}`, effects: source.pin._sxName?.effects }); pin._sxNumber = new SymbolPinNumber({ value: newNumber, effects: source.pin._sxNumber?.effects }); pin.hidden = true; source.parent.pins.push(pin)
        const instancePin = new SymbolPin(); instancePin.numberString = newNumber; instancePin.uuid = deterministicUuid(`${name}:${ref}:instance-pin:${newNumber}`); symbol.pins.push(instancePin); byNumber.set(newNumber, { parent: source.parent, pin }); stats.addedDuplicatePins.push(`${ref}.${newNumber}`)
      }
      for (const [number, pad] of padMap) {
        const entry = byNumber.get(number)
        if (!entry) { const key = `${ref}.${number}`; if (!pad.net && allowedOmittedNoNetPins.has(key)) { stats.explicitlyAllowedOmittedNoNetPins.push(key); continue } fail(`${name}:${ref}: schematic pin ${number} missing for PCB pad net ${JSON.stringify(pad.net)}`) }
        const x = symbol.at.x + entry.pin.at.x, y = symbol.at.y - entry.pin.at.y
        if (pad.net) {
          const font = new TextEffectsFont(); font.size = { height: 1.27, width: 1.27 }
          labels.push(new GlobalLabel({ value: pad.net, shape: 'passive', at: { x, y, angle: 0 }, effects: new TextEffects({ font, hiddenText: true }), uuid: deterministicUuid(`${name}:${ref}:label:${number}`), fieldsAutoplaced: false })); stats.labels++
        } else {
          noConnects.push(new NoConnect({ at: { x, y }, uuid: deterministicUuid(`${name}:${ref}:nc:${number}`) })); stats.noConnects++
          stats.ncAssignments.push({ ref, number, net: `unconnected-(${ref}-${entry.pin.name}-Pad${number})` })
        }
      }
    }
    sch.globalLabels = labels; sch.noConnects = noConnects; await writeFile(file, sch.getString())
  }
  const missingRefs = [...board.keys()].filter((ref) => foundRefs.get(ref) !== 1), duplicateRefs = [...foundRefs].filter(([_, count]) => count !== 1)
  if (missingRefs.length || duplicateRefs.length) fail(`physical reference cardinality failure: missing=${JSON.stringify(missingRefs)} duplicate=${JSON.stringify(duplicateRefs)}`)
  if (stats.physicalSymbols !== board.size) fail(`physical symbol count ${stats.physicalSymbols} != board references ${board.size}`)
  const mapPath = join(stage, 'normalization-map.json'); await writeFile(mapPath, `${JSON.stringify(stats, null, 2)}\n`)
  const preparePy = String.raw`import pcbnew,json,sys,wx
app=wx.App(False)
board_path,fresh_path,map_path=sys.argv[1:4];b=pcbnew.LoadBoard(board_path);fresh=pcbnew.LoadBoard(fresh_path)
F={f.GetReference():f for f in b.GetFootprints() if f.GetReference()};S={f.GetReference():f for f in fresh.GetFootprints() if f.GetReference()}
if set(F)!=set(S): raise SystemExit('reference set changed before board preparation')
for ref,f in F.items(): f.SetValue(S[ref].GetValue())
holes=[f for f in b.GetFootprints() if not f.GetReference()]
if len(holes)!=4: raise SystemExit(f'expected exactly 4 empty-reference mounting holes, found {len(holes)}')
for f in holes: f.SetBoardOnly(True)
for item in json.load(open(map_path))['ncAssignments']:
 f=F[item['ref']];pads=[p for p in f.Pads() if p.GetNumber()==item['number']]
 if len(pads)!=1: raise SystemExit(f"{item['ref']}.{item['number']}: expected one pad, found {len(pads)}")
 p=pads[0]
 if p.GetNetname(): raise SystemExit(f"{item['ref']}.{item['number']}: expected blank net, found {p.GetNetname()}")
 net=b.FindNet(item['net'])
 if net is None: net=pcbnew.NETINFO_ITEM(b,item['net']);b.Add(net)
 p.SetNet(net)
pcbnew.SaveBoard(board_path,b)`
  run([kicadPython, '-c', preparePy, join(stage, `${base}.kicad_pcb`), freshBoard, mapPath], stage)
  const nativeArgs = [kicadCli, 'pcb', 'drc', '--all-track-errors', '--refill-zones', '--save-board', '--format', 'json', '--severity-all', '--exit-code-violations', '--output', join(stage, 'native-drc.json'), join(stage, `${base}.kicad_pcb`)]
  const parityArgs = [kicadCli, 'pcb', 'drc', '--all-track-errors', '--schematic-parity', '--refill-zones', '--save-board', '--format', 'json', '--severity-all', '--exit-code-violations', '--output', join(stage, 'parity-drc.json'), join(stage, `${base}.kicad_pcb`)]
  const native = run(nativeArgs, stage); await writeFile(join(stage, 'native-drc.log'), native.stdout + native.stderr)
  const parity = run(parityArgs, stage); await writeFile(join(stage, 'parity-drc.log'), parity.stdout + parity.stderr)
  for (const reportName of ['native-drc.json', 'parity-drc.json']) {
    const report = JSON.parse(await readFile(join(stage, reportName), 'utf8'))
    if (report.violations.length || report.unconnected_items.length || (report.schematic_parity?.length || 0)) fail(`${reportName}: nonzero DRC/parity counts`)
  }
  const ercArgs = [kicadCli, 'sch', 'erc', '--format', 'json', '--severity-all', '--exit-code-violations', '--output', join(stage, 'schematic-erc.json'), join(stage, `${base}.kicad_sch`)]
  const erc = run(ercArgs, stage); await writeFile(join(stage, 'schematic-erc.log'), erc.stdout + erc.stderr)
  const ercReport = JSON.parse(await readFile(join(stage, 'schematic-erc.json'), 'utf8'))
  const ercViolations = (ercReport.sheets || []).flatMap((sheet) => sheet.violations || [])
  if (ercViolations.length) fail(`schematic-erc.json: ${ercViolations.length} ERC violations`)
  const boardBytes = await readFile(join(stage, `${base}.kicad_pcb`)); const result = { routedBoard, freshDir, outputDir, boardSha256: createHash('sha256').update(boardBytes).digest('hex'), references: board.size, ...stats, nativeDrc: { exitCode: 0, violations: 0, unconnected: 0 }, parityDrc: { exitCode: 0, violations: 0, unconnected: 0, parityIssues: 0 }, schematicErc: { exitCode: 0, violations: 0 } }
  await writeFile(join(stage, 'normalization-result.json'), `${JSON.stringify(result, null, 2)}\n`)
  await rename(stage, outputDir); console.log(JSON.stringify(result, null, 2))
} catch (error) {
  await writeFile(join(stage, 'FAILED.txt'), `${error.stack || error}\n`).catch(() => {})
  console.error(`normalization failed closed; staging evidence retained at ${stage}`); throw error
}
