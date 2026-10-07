import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const path = new URL('../docs/alternatives.json', import.meta.url)
const data = JSON.parse(await readFile(path))
const checked = []

for (const part of data.parts) {
  if (!part.alternative) {
    checked.push({ ...part, status: 'no-drop-in-selected' })
    continue
  }
  const numericLcsc = part.alternative.replace(/^C/, '')
  const url = `https://jlcsearch.tscircuit.com/components/list.json?search=${numericLcsc}`
  try {
    const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '-L', '--retry', '2', '--max-time', '40', url], { maxBuffer: 8_000_000 })
    const response = JSON.parse(stdout)
    const exact = (response.components || []).find(item => `C${String(item.lcsc).replace(/^C/, '')}` === part.alternative)
    checked.push({
      ...part,
      mpn: exact?.mfr ?? part.mpn ?? null,
      package: exact?.package ?? part.package ?? null,
      stock: exact?.stock ?? null,
      checked_at: new Date().toISOString(),
      evidence: url,
      status: !exact ? 'unverified-no-exact-match' : exact.stock > 0 ? 'available' : 'out-of-stock',
    })
  } catch (error) {
    checked.push({ ...part, checked_at: new Date().toISOString(), evidence: url, status: 'unverified-network-error', error: error.message })
  }
}

const report = { ...data, checked_at: new Date().toISOString(), parts: checked }
await writeFile(path, JSON.stringify(report, null, 2) + '\n')
const problems = checked.filter(part => part.alternative && part.status !== 'available')
console.log(JSON.stringify({ checked: checked.filter(part => part.alternative).length, available: checked.filter(part => part.status === 'available').length, problems }, null, 2))
if (checked.some(part => part.status === 'unverified-network-error')) process.exitCode = 1
