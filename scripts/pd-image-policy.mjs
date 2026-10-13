import { createHash } from 'node:crypto'
const sha = b => createHash('sha256').update(b).digest('hex')
export function validatePdImage(projectBytes, image, config) {
  if (sha(projectBytes)!==config.project.sha256 || sha(image)!==config.eeprom.image.sha256 || image.length!==config.eeprom.image.bytes) throw new Error('PD export hash/length mismatch')
  if(image.length>65536 || image.length<2048 || image.readUInt32LE(0)!==0x800)throw new Error('Expected TI full-flash address header')
  const p=JSON.parse(projectBytes), rows=p.configuration.data.selected_ace
  const r=reg=>{const xs=rows.filter(x=>x.register===reg);if(xs.length!==1)throw new Error(`Missing/duplicate register ${reg}`);return Buffer.from(xs[0].data)}
  const bits=(reg,start,n)=>Number((BigInt('0x'+[...r(reg)].reverse().map(x=>x.toString(16).padStart(2,'0')).join(''))>>BigInt(start))&((1n<<BigInt(n))-1n))
  const require=(condition,why)=>{if(!condition)throw new Error(why)}
  require(p.questionnaire.device==='TPS26750' && p.questionnaire.toolBuildVersion==='2.0.1' && p.questionnaire.answers[1]===3,'Expected TPS26750 sink-only without BQ questionnaire')
  require(r(6).toString()==='PD118041','Unexpected configuration identity')
  require(r(0x27).equals(Buffer.from('0408120018430000000000000000','hex')),'Sink path and GPIO multiplexing differ from reviewed no-BQ profile')
  require(bits(0x28,0,2)===0 && bits(0x28,10,2)===0,'Sink-only PD, USB data disabled')
  require(bits(0x29,4,4)===0 && bits(0x29,12,4)===0,'Power/data role swaps must be disabled')
  require(bits(0x32,0,8)===0,'No source PDOs permitted')
  require(bits(0x33,0,3)===4 && bits(0x33,3,3)===4,'Expected tool EPR capability table')
  const fixed=[];for(const i of [1,5,9,13,29,33,37]){const v=r(0x33).readUInt32LE(i);require((v>>>30)===0,'Expected fixed voltage PDO');fixed.push({mv:((v>>>10)&1023)*50,ma:(v&1023)*10})}
  require(JSON.stringify(fixed)===JSON.stringify([{mv:5000,ma:3000},{mv:9000,ma:3000},{mv:15000,ma:3000},{mv:20000,ma:5000},{mv:28000,ma:5000},{mv:36000,ma:5000},{mv:48000,ma:5000}]),'Unexpected fixed sink capabilities')
  require(bits(0x37,12,10)===500 && bits(0x37,64,1)===0 && bits(0x37,128,1)===0,'Max 5 A; PPS/AVS requests disabled')
  require(bits(0x5c,288,8)===33 && bits(0x5c,0,1)===0 && bits(0x5c,224,1)===0 && bits(0x5c,256,1)===0,'GPIO0 must be digital active-low fault input')
  require(bits(0x5c,304,8)===92 && bits(0x5c,2,1)===1 && bits(0x5c,66,1)===0 && bits(0x5c,98,1)===0 && bits(0x5c,226,1)===0 && bits(0x5c,258,1)===0,'GPIO2 must directly drive EPR_EN, initially low')
  // Byte-search the exported configurable register records, not TI executable
  // instructions. Both full-flash regions must contain identical reviewed data.
  for(const reg of [6,0x27,0x28,0x29,0x32,0x33,0x37,0x42,0x5c]) {
    const data=r(reg), record=Buffer.concat([Buffer.from([0x0f,reg,0,data.length-1]),data]);let count=0,pos=0
    while((pos=image.indexOf(record,pos))!==-1){count++;pos+=record.length}
    require(count===2,`Reviewed register 0x${reg.toString(16)} not identical in both exported regions`)
  }
  return {fixed_sink_pdos:fixed,customer_use:'PD118041',source_pdos:0,power_data_swaps:false,pps_avs_requests:false,gpio0_event:33,gpio2_event:92,matching_configuration_regions:2,programmed:false,readback_verified:false}
}
