import { test, expect } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { encodeGlb } from './assembly-glb.mjs'
import { bezier, tube } from './harness-geometry.mjs'

const triangle = positions => ({ name: 'triangle', positions, indices: [0, 1, 2] })

test('GLB bounds match the encoded float32 vertices exactly', () => {
  const bytes = encodeGlb([triangle([.1, -.2, .3, 1.1, 2.2, 3.3, -4.4, -5.5, -6.6])])
  const jsonLength = bytes.readUInt32LE(12)
  const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength))
  const accessor = gltf.accessors[0]
  const offset = 28 + jsonLength + gltf.bufferViews[accessor.bufferView].byteOffset
  for (let axis = 0; axis < 3; axis++) {
    const coordinates = Array.from({ length: accessor.count }, (_, i) => bytes.readFloatLE(offset + (i * 3 + axis) * 4))
    expect(accessor.min[axis]).toBe(Math.min(...coordinates))
    expect(accessor.max[axis]).toBe(Math.max(...coordinates))
  }
})

test('identical stored vertices serialize identically; real vertex changes do not', () => {
  const positions = [-.4019619216820569, 0, 0, 1, 0, 0, 0, 1, 0]
  const base = encodeGlb([triangle(positions)])
  const runtimeVariant = [...positions]
  runtimeVariant[0] = -.401961921682057
  expect(encodeGlb([triangle(runtimeVariant)]).equals(base)).toBe(true)
  const moved = [...positions]
  moved[0] += .001
  expect(encodeGlb([triangle(moved)]).equals(base)).toBe(false)
})

test('cable paths and GLB bytes agree across Bun and Node', () => {
  const control = [[18.820061, -37.6, 15.3], [18.820061, -37.6, 60], [-5.4, -185, 35], [-5.4, -185, -35]]
  const path = bezier(control, 40)
  const bytes = encodeGlb([tube('cable', path, 1.2, [.7, .06, .05, 1])])
  const code = `
    import { createHash } from 'node:crypto'
    import { encodeGlb } from ${JSON.stringify(new URL('./assembly-glb.mjs', import.meta.url).href)}
    import { bezier, tube } from ${JSON.stringify(new URL('./harness-geometry.mjs', import.meta.url).href)}
    const path = bezier(${JSON.stringify(control)}, 40)
    const bytes = encodeGlb([tube('cable', path, 1.2, [.7, .06, .05, 1])])
    console.log(JSON.stringify({ path, sha256: createHash('sha256').update(bytes).digest('hex') }))
  `
  const other = JSON.parse(execFileSync('node', ['--input-type=module', '-e', code], { encoding: 'utf8' }))
  expect(other.path).toEqual(path)
  expect(other.sha256).toBe(createHash('sha256').update(bytes).digest('hex'))
})
