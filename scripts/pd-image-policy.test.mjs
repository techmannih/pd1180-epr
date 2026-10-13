import { test, expect } from 'bun:test'
import {readFileSync} from 'node:fs';import{createHash}from'node:crypto';import JSZip from'jszip';import{validatePdImage}from'./pd-image-policy.mjs'
const c=JSON.parse(readFileSync('docs/pd-configuration.json')),p=readFileSync(c.project.path),z=await JSZip.loadAsync(readFileSync('firmware/pd/ti-configuration.zip')),b=await z.file('fullFlash.bin').async('nodebuffer')
test('reviewed TI export passes and byte corruption fails',()=>{expect(validatePdImage(p,b,c).matching_configuration_regions).toBe(2);const bad=Buffer.from(b);bad[2206]^=1;expect(()=>validatePdImage(p,bad,c)).toThrow()})
test('DRP import reset, missing fault mapping, inverted EPR output and role swaps fail even with refreshed JSON hash',()=>{
 for(const [reg,index,mask] of [[0x28,0,2],[0x5c,36,1],[0x5c,32,4],[0x29,0,0x40]]){const q=JSON.parse(p);q.configuration.data.selected_ace.find(x=>x.register===reg).data[index]^=mask;const bytes=Buffer.from(JSON.stringify(q)),config=structuredClone(c);config.project.sha256=createHash('sha256').update(bytes).digest('hex');expect(()=>validatePdImage(bytes,b,config)).toThrow()}
})
