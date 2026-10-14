import { test, expect } from 'bun:test'
import { spawnSync } from 'node:child_process'

test('DSN wrapping preserves quoted identifiers and cannot truncate wiring import', () => {
  const result = spawnSync('python3', ['-c', String.raw`
import importlib.util,json,re
spec=importlib.util.spec_from_file_location('routing_rules','scripts/prepare-routing-rules.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
# This NC identifier used to split at a hyphen exactly at the wrap boundary.
names=['X'*48,'"unconnected-(U2-N_I2Ct_IRQ-Pad10)"','"a quoted net with spaces"','"'+('long-'*25)+'name"','PD_3V3']
wrapped=m.wrapped_names(names)
tokens=re.findall(r'"(?:\\.|[^"\\])*"|[^\s]+',wrapped)
assert tokens==names,(tokens,names)
assert all('\n' not in t for t in tokens)
print(json.dumps({'tokens':tokens,'wrapped':wrapped}))
`], { encoding: 'utf8' })
  expect(result.status, result.stderr).toBe(0)
  const output = JSON.parse(result.stdout)
  expect(output.tokens).toContain('"unconnected-(U2-N_I2Ct_IRQ-Pad10)"')
  expect(output.wrapped).toContain('\n')
})
