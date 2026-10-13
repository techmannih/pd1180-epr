import {test,expect} from 'bun:test'
import {normalizeOfficialPart} from './jlc-stock.mjs'
const record = (extra={}) => ({code:200,data:{componentCode:'C728583',componentModelEn:'RT0603BRD0716K2L',componentSpecificationEn:'0603',overseasStockCount:4528,canPresaleNumber:4479,isBuyComponent:'1',...extra}})
test('official stock respects reserved quantities and exact supplier identity',()=>{
  expect(normalizeOfficialPart(record(),'C728583').stock).toBe(4479)
  expect(normalizeOfficialPart(record(),'C728584')).toBeNull()
  expect(normalizeOfficialPart({code:500,data:record().data},'C728583')).toBeNull()
  expect(normalizeOfficialPart(record({isBuyComponent:'0'}),'C728583').can_purchase).toBe(false)
})
test('unknown stock is never coerced to zero or availability',()=>{
  for (const value of [null,undefined,-1,NaN,'4479']) {
    expect(normalizeOfficialPart(record({canPresaleNumber:value}),'C728583').stock).toBeNull()
    expect(normalizeOfficialPart(record({overseasStockCount:value}),'C728583').stock).toBeNull()
  }
  expect(normalizeOfficialPart(record({canPresaleNumber:0}),'C728583').stock).toBe(0)
})

import { packagesMatch } from './jlc-stock.mjs'
import { inventoryEvidencePasses } from './jlc-stock.mjs'
test('review records known shortages without relaxing the procurement or identity gate', () => {
  const part = {mpn:'EXACT-PART', stock:0, status:'insufficient', package_match:true}
  expect(inventoryEvidencePasses(part)).toBe(false)
  expect(inventoryEvidencePasses(part,true)).toBe(true)
  for (const delta of [{stock:null},{stock:-1},{mpn:null},{package_match:false},
    {status:'unverified-network-error'},{status:'package-mismatch'},{status:'not-purchasable'}])
    expect(inventoryEvidencePasses({...part,...delta},true)).toBe(false)
  const alt={...part,expected_package_match:true,package_compatible:false,classification:'not-approved-redesign-required'}
  expect(inventoryEvidencePasses(alt,true,true)).toBe(true)
  expect(inventoryEvidencePasses({...alt,classification:'drop-in'},true,true)).toBe(false)
  expect(inventoryEvidencePasses({...alt,expected_package_match:false},true,true)).toBe(false)
})
test('only translates the through-hole label, retaining pitch and body dimensions', () => {
  expect(packagesMatch('插件,P=3.96mm', 'Plugin,P=3.96mm')).toBe(true)
  expect(packagesMatch('插件,D12.5xL25mm', 'Plugin,D12.5xL25mm')).toBe(true)
  expect(packagesMatch('插件,P=3.96mm', 'Plugin,P=2.54mm')).toBe(false)
  expect(packagesMatch('插件,D12.5xL25mm', 'Plugin,D10xL25mm')).toBe(false)
  expect(packagesMatch('0603', null)).toBe(false)
})

import {catalogEvidence} from './jlc-stock.mjs'
test('index outage does not skip exact official available-order evidence',async()=>{
  const seen=[]
  const result=await catalogEvidence('C728583',{
    readIndex:async url=>{seen.push(url);throw new Error('HTTP 503')},
    readOfficial:async code=>{seen.push(code);return {exact:normalizeOfficialPart(record(),'C728583')}}
  })
  expect(seen).toEqual(['https://jlcsearch.tscircuit.com/components/list.json?search=728583','C728583'])
  expect(result.search_error).toBe('HTTP 503')
  expect(result.exact.stock).toBe(4479)
})
test('official zero or unavailable quantities cannot fall back to cached index stock',async()=>{
  const readIndex=async()=>({components:[{lcsc:728583,mfr:'RT0603BRD0716K2L',package:'0603',stock:9000}]})
  const zero=await catalogEvidence('C728583',{readIndex,readOfficial:async()=>({exact:normalizeOfficialPart(record({canPresaleNumber:0}),'C728583')})})
  expect(zero.exact.stock).toBe(0)
  for(const readOfficial of [async()=>{throw new Error('timeout')},async()=>({exact:null}),async()=>({exact:{lcsc:'C1',stock:9000}})]){
    const result=await catalogEvidence('C728583',{readIndex,readOfficial})
    expect(result.exact).toBeNull()
  }
})
