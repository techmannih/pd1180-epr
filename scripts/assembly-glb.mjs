import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
export const encodeGlb = (meshes, generator = 'Mechanical assembly; dimensions in millimeters') => {
  const j = { asset: { version: '2.0', generator }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [] }
  const chunks = []; let length = 0
  const accessor = (values, type, componentType) => {
    const a = componentType === 5126 ? new Float32Array(values) : new Uint32Array(values)
    const bytes = Buffer.from(a.buffer); const view = j.bufferViews.length
    j.bufferViews.push({ buffer: 0, byteOffset: length, byteLength: bytes.length }); chunks.push(bytes); length += bytes.length
    const entry = { bufferView: view, componentType, count: values.length / (type === 'VEC3' ? 3 : 1), type }
    if (type === 'VEC3') {
      // Bounds describe the stored float32 vertices, not intermediate doubles
      // whose last bits can differ between JavaScript runtimes/platforms.
      entry.min = [0,1,2].map(k => Math.min(...a.filter((_,i) => i%3 === k)))
      entry.max = [0,1,2].map(k => Math.max(...a.filter((_,i) => i%3 === k)))
    }
    j.accessors.push(entry); return j.accessors.length - 1
  }
  for (const mesh of meshes) {
    const material = j.materials.length
    j.materials.push({ name: mesh.name, pbrMetallicRoughness: { baseColorFactor: mesh.color || [.35,.39,.44,1], metallicFactor: .1, roughnessFactor: .7 }, doubleSided: true })
    j.meshes.push({ name: mesh.name, primitives: [{ attributes: { POSITION: accessor(mesh.positions,'VEC3',5126) }, indices: accessor(mesh.indices,'SCALAR',5125), material }] })
    j.scenes[0].nodes.push(j.nodes.length); j.nodes.push({ name: mesh.name, mesh: j.meshes.length - 1 })
  }
  j.buffers.push({ byteLength: length }); let json = Buffer.from(JSON.stringify(j)); json = Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)])
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2,4); header.writeUInt32LE(28+json.length+length,8); header.writeUInt32LE(json.length,12); header.writeUInt32LE(0x4e4f534a,16)
  const binaryHeader = Buffer.alloc(8); binaryHeader.writeUInt32LE(length); binaryHeader.writeUInt32LE(0x004e4942,4)
  return Buffer.concat([header,json,binaryHeader,...chunks])
}

export async function readGlb(path) {
  const bytes = await readFile(path)
  if (bytes.toString('ascii',0,4) !== 'glTF' || bytes.readUInt32LE(8) !== bytes.length) throw new Error(`Invalid GLB: ${path}`)
  const size = bytes.readUInt32LE(12), json = JSON.parse(bytes.toString('utf8',20,20+size))
  const bin = bytes.subarray(28+size)
  const accessor = id => {
    const a=json.accessors[id], v=json.bufferViews[a.bufferView], width={SCALAR:1,VEC3:3}[a.type]
    const read={5126:['readFloatLE',4],5125:['readUInt32LE',4],5123:['readUInt16LE',2],5121:['readUInt8',1]}[a.componentType]
    if (!width || !read || a.sparse) throw new Error('Unsupported mesh accessor')
    return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>bin[read[0]]((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||width*read[1])+k*read[1])))
  }
  const meshes=[]
  for(const node of json.nodes) {
    if(node.mesh===undefined) continue
    if(node.matrix || node.rotation || node.scale || node.children) throw new Error('Unexpected transformed CAD node; update the screen before accepting this model')
    const offset=node.translation||[0,0,0], triangles=[]
    for(const p of json.meshes[node.mesh].primitives) {
      const points=accessor(p.attributes.POSITION).map(v=>v.map((x,k)=>x+offset[k])), indices=accessor(p.indices).flat()
      for(let i=0;i<indices.length;i+=3) triangles.push(indices.slice(i,i+3).map(k=>points[k]))
    }
    meshes.push({name:node.name,triangles})
  }
  return {meshes,sha256:createHash('sha256').update(bytes).digest('hex')}
}
