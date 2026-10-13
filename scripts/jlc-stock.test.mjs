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
test('only translates the through-hole label, retaining pitch and body dimensions', () => {
  expect(packagesMatch('插件,P=3.96mm', 'Plugin,P=3.96mm')).toBe(true)
  expect(packagesMatch('插件,D12.5xL25mm', 'Plugin,D12.5xL25mm')).toBe(true)
  expect(packagesMatch('插件,P=3.96mm', 'Plugin,P=2.54mm')).toBe(false)
  expect(packagesMatch('插件,D12.5xL25mm', 'Plugin,D10xL25mm')).toBe(false)
  expect(packagesMatch('0603', null)).toBe(false)
})
