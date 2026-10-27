import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import JSZip from 'jszip'
import { attachNativeKicadArtifact, nativeKicadCircuitText } from './native-kicad-artifact.mjs'
import { circuitSourceHash } from './circuit-source-hash.mjs'

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
test('native link requires matching source and every native project member', async () => {
  const source=[{type:'source_project_metadata'},{type:'pcb_board',width:10}]
  const zip=new JSZip().file('board.kicad_pcb','copper').file('board.kicad_pro','rules')
  const bytes=await zip.generateAsync({type:'nodebuffer'})
  const reference={url:'https://raw.githubusercontent.com/techmannih/pd1180-epr/'+'a'.repeat(40)+'/release/native.zip',sha256:sha(bytes),project_file:'board.kicad_pro',source_circuit_sha256:circuitSourceHash(source),files:{'board.kicad_pcb':sha('copper'),'board.kicad_pro':sha('rules')}}
  const circuit=await attachNativeKicadArtifact(structuredClone(source),source,bytes,reference,'copper')
  expect(circuit[0].native_kicad_project.circuit_json_sha256).toBe(sha(nativeKicadCircuitText(source)))
  await expect(attachNativeKicadArtifact(structuredClone(source),[...source,{type:'source_net',name:'changed'}],bytes,reference,'copper')).rejects.toThrow('different source revision')
  await expect(attachNativeKicadArtifact(structuredClone(source),source,bytes,reference,'changed route with unchanged source')).rejects.toThrow('Viewer PCB differs')
  zip.file('board.kicad_pcb','changed copper')
  await expect(attachNativeKicadArtifact(structuredClone(source),source,await zip.generateAsync({type:'nodebuffer'}),reference,'copper')).rejects.toThrow('stale: board.kicad_pcb')
})
