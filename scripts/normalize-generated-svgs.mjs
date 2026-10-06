import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const roots = ['dist/index', 'dist/schematics', 'dist/routed']
let normalized = 0

for (const root of roots) {
  let entries = []
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    continue
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.svg')) continue
    const path = join(root, entry.name)
    const source = await readFile(path, 'utf8')
    const clean = `${source.replace(/[ \t]+$/gm, '').trimEnd()}\n`
    if (clean !== source) {
      await writeFile(path, clean)
      normalized++
    }
  }
}

console.log(`Normalized ${normalized} generated SVG file(s).`)
