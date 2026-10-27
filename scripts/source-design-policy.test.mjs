import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { sourceDesignPolicy, sourceDesignPolicyErrors, sourceDesignGeometryErrors } from './source-design-policy.mjs'
const source = readFileSync('index.circuit.tsx', 'utf8')
const standards = JSON.parse(readFileSync('board-standards.json'))
const board = { min_trace_width: .15, min_trace_to_pad_edge_clearance: .10 }
const project = { board: { design_settings: { rules: { min_track_width: .15 } } }, net_settings: { classes: [{ name: 'Default', clearance: .10 }] } }
test('source, compiled rules and native project agree on the requested limits', () => {
  expect(sourceDesignPolicyErrors(source, standards, board, project)).toEqual([])
  expect(sourceDesignPolicy(source).ground_plane).toEqual({net:'GND',layer:'inner1',clearance_mm:.30,board_edge_margin_mm:.50})
})
test('reject the former native 0.09 mm override even when native DRC passes', () => {
  const p = structuredClone(project); p.board.design_settings.rules.min_track_width = .09
  expect(sourceDesignPolicyErrors(source, standards, board, p)).toContain('Native/standards width: 0.09 != 0.15')
})
test('reject weakened ground policy and source/compiled disagreement', () => {
  const p = structuredClone(standards); p.fabrication.ground_plane.clearance_mm = .2; p.fabrication.ground_plane.board_edge_margin_mm = .2
  const errors = sourceDesignPolicyErrors(source, p, {...board,min_trace_width:.09}, project)
  expect(errors).toContain('GND clearance must be >=0.30 mm')
  expect(errors).toContain('GND edge margin must be >=0.50 mm')
  expect(errors).toContain('Compiled/standards width: 0.09 != 0.15')
})
test('comments cannot mask a changed JSX requirement', () => {
  const changed = source.replace('minTraceWidth="0.15mm"', 'minTraceWidth="0.09mm"')
  expect(sourceDesignPolicyErrors('// minTraceWidth="0.15mm"\n'+changed, standards, board, project)).toContain('TSX/standards width: 0.09 != 0.15')
})

test('actual geometry evidence rejects stale hashes, narrow tracks and non-inset ground', () => {
  const bindings = {board_sha256:'board',standards_sha256:'rules',checker_sha256:'checker'}
  const report = {...bindings, errors:[],track_count:2,minimum_actual_track_width_mm:.15,thin_track_uuids:[],ground_zones:[{name:'GND_PLANE',layer:'In1.Cu',clearance_mm:.3,outline_outside_required_inset_mm2:0}]}
  expect(sourceDesignGeometryErrors(report,standards,bindings)).toEqual([])
  for (const change of [r=>r.board_sha256='old',r=>r.checker_sha256='old',r=>r.minimum_actual_track_width_mm=.09,r=>r.thin_track_uuids.push('thin'),r=>r.ground_zones[0].clearance_mm=.2,r=>r.ground_zones[0].outline_outside_required_inset_mm2=.01,r=>r.ground_zones=[]]) {
    const r=structuredClone(report);change(r);expect(sourceDesignGeometryErrors(r,standards,bindings)).not.toEqual([])
  }
})
