#!/usr/bin/env python3
"""Reject unintended component/pad/hole changes in the onboard-control ECO.
One native PCB per subprocess avoids cross-board SWIG ownership issues.
"""
import json,sys,subprocess,hashlib
from pathlib import Path
if len(sys.argv)==3 and sys.argv[1]=='--dump':
 import pcbnew,wx
 app=wx.App(False);b=pcbnew.LoadBoard(sys.argv[2]);out={}
 for f in b.GetFootprints():
  # Empty references are separate mounting-hole footprints, never one dict entry.
  key=f.GetReference() or 'HOLE@%d,%d'%(f.GetPosition().x,f.GetPosition().y)
  if key in out:raise SystemExit('Duplicate reference/hole: '+key)
  out[key]={'position':[f.GetPosition().x,f.GetPosition().y],'rotation':f.GetOrientationDegrees(),'layer':f.GetLayerName(),'value':f.GetValue(),'pads':[]}
  for p in f.Pads():out[key]['pads'].append({'pin':p.GetNumber(),'position':[p.GetPosition().x,p.GetPosition().y],'size':[p.GetSize().x,p.GetSize().y],'drill':[p.GetDrillSize().x,p.GetDrillSize().y],'net':'' if p.GetNetname().startswith('unconnected-(') else p.GetNetname()})
  out[key]['pads'].sort(key=lambda p:(p['pin'],p['position']))
 print(json.dumps(out));sys.exit(0)
if len(sys.argv)!=5:raise SystemExit('usage: check-onboard-eco.py BEFORE AFTER FRESH_EXPORT REPORT')
before,after,fresh,report=sys.argv[1:];eco=json.loads(Path('engineering/onboard-control-eco.json').read_text());errors=[]
def dump(path):return json.loads(subprocess.check_output([sys.executable,__file__,'--dump',path],stderr=subprocess.DEVNULL))
a,b,c=dump(before),dump(after),dump(fresh)
if set(a)-set(b)!=set(eco['removed_components']) or set(b)-set(a)!=set(eco['added_components']):errors.append('Unexpected component additions/removals')
allowed={('U7','17'):'GND',('U7','18'):'GND',('U7','25'):'GND',('Q14','2'):'GND',('U16','30'):'USER_BUTTON_N',**{('U16',str(p)):'' for p in [25,26,27,31]}}
changes=[]
for ref in b:
 if ref not in a:
  if b[ref]!=c.get(ref):errors.append(ref+' added footprint differs from fresh source')
  continue
 old,new=a[ref],b[ref]
 if {k:v for k,v in old.items() if k!='pads'}!={k:v for k,v in new.items() if k!='pads'}:errors.append(ref+' component geometry/value changed')
 if len(old['pads'])!=len(new['pads']):errors.append(ref+' pad count changed');continue
 for op,np in zip(old['pads'],new['pads']):
  if {k:v for k,v in op.items() if k!='net'}!={k:v for k,v in np.items() if k!='net'}:errors.append(ref+'.'+np['pin']+' pad geometry changed')
  if op['net']==np['net']:continue
  if allowed.get((ref,np['pin']))!=np['net']:errors.append(ref+'.'+np['pin']+' unexpected connectivity change')
  changes.append({'ref':ref,'pin':np['pin'],'before':op['net'],'after':np['net']})
holes=[ref for ref in b if ref.startswith('HOLE@')]
if len(holes)!=4:errors.append('Expected four independent mounting holes')
result={'before_sha256':hashlib.sha256(Path(before).read_bytes()).hexdigest(),'after_sha256':hashlib.sha256(Path(after).read_bytes()).hexdigest(),'removed_components':sorted(set(a)-set(b)),'added_components':sorted(set(b)-set(a)),'retained_components':len(set(a)&set(b)),'mounting_holes_unchanged':len(holes)==4 and all(a.get(h)==b[h] for h in holes),'pad_net_changes':changes,'errors':errors,'scope':'Every surviving component value/placement/layer, pad geometry and all four mounting holes unchanged; added control footprints match the fresh source. Native DRC/ERC/parity separately verifies copper.'}
Path(report).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));sys.exit(bool(errors))
