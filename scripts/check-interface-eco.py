#!/usr/bin/env python3
"""Compare native PCB components/pads before and after the interface removal.
Uses one KiCad board per subprocess to avoid SWIG cross-board ownership issues.
Fresh DRC/ERC remain separate mandatory evidence.
"""
import json,sys,subprocess,hashlib
from pathlib import Path
if len(sys.argv)==3 and sys.argv[1]=='--dump':
 import pcbnew,wx
 app=wx.App(False);b=pcbnew.LoadBoard(sys.argv[2]);out={}
 for f in b.GetFootprints():
  out[f.GetReference()]={'position':[f.GetPosition().x,f.GetPosition().y],'rotation':f.GetOrientationDegrees(),'layer':f.GetLayerName(),'value':f.GetValue(),'pads':[]}
  for p in f.Pads():out[f.GetReference()]['pads'].append({'pin':p.GetNumber(),'position':[p.GetPosition().x,p.GetPosition().y],'size':[p.GetSize().x,p.GetSize().y],'drill':[p.GetDrillSize().x,p.GetDrillSize().y],'net':'' if p.GetNetname().startswith('unconnected-(') else p.GetNetname()})
  out[f.GetReference()]['pads'].sort(key=lambda p:(p['pin'],p['position']))
 print(json.dumps(out));sys.exit(0)
if len(sys.argv)!=4:raise SystemExit('usage: check-interface-eco.py BEFORE AFTER REPORT')
before,after,report=sys.argv[1:];eco=json.loads(Path('engineering/interface-cleanup.json').read_text());errors=[]
def dump(path):return json.loads(subprocess.check_output([sys.executable,__file__,'--dump',path],stderr=subprocess.DEVNULL))
a,b=dump(before),dump(after)
if set(a)-set(b)!=set(eco['removed_components']) or set(b)-set(a):errors.append('Unexpected component additions/removals')
changes=[]
for ref in b:
 old=a[ref];new=b[ref]
 if {k:v for k,v in old.items() if k!='pads'}!={k:v for k,v in new.items() if k!='pads'}:errors.append(ref+' component geometry/value changed')
 if len(old['pads'])!=len(new['pads']):errors.append(ref+' pad count changed');continue
 for op,np in zip(old['pads'],new['pads']):
  if {k:v for k,v in op.items() if k!='net'}!={k:v for k,v in np.items() if k!='net'}:errors.append(ref+'.'+np['pin']+' pad geometry changed')
  if op['net']==np['net']:continue
  allowed=(ref=='J7' and np['pin'] not in eco['retained_j7_pins']) or (ref=='U16' and int(np['pin']) in eco['mcu_nc_pins'])
  if not allowed or np['net']:errors.append(ref+'.'+np['pin']+' unexpected connectivity change')
  changes.append({'ref':ref,'pin':np['pin'],'before':op['net'],'after':np['net']})
result={'before_sha256':hashlib.sha256(Path(before).read_bytes()).hexdigest(),'after_sha256':hashlib.sha256(Path(after).read_bytes()).hexdigest(),'removed_components':sorted(set(a)-set(b)),'retained_components':len(b),'pad_net_changes':changes,'errors':errors,'scope':'Every surviving component value/placement/layer and pad geometry unchanged; only specified U16/J7 pins disconnected. Fresh DRC/ERC separately checks copper connectivity.'}
Path(report).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'retained_components':len(b),'disconnected_pads':len(changes),'errors':errors}));sys.exit(bool(errors))
