#!/usr/bin/env python3
"""Reject unintended component/pad/hole changes in the power/thermal ECO.
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
 pads=[(f.GetReference(),p.GetNumber(),p.GetNetname(),p.GetEffectiveShape(pcbnew.F_Cu)) for f in b.GetFootprints() if not f.GetReference().startswith('TP_') for p in f.Pads() if p.GetAttribute()==pcbnew.PAD_ATTRIB_SMD and p.IsOnLayer(pcbnew.F_Cu)]
 overlaps=[]
 for via in b.GetTracks():
  if not isinstance(via,pcbnew.PCB_VIA):continue
  shape=via.GetEffectiveShape(pcbnew.F_Cu)
  for ref,pin,net,padshape in pads:
   if net==via.GetNetname() and padshape.Collide(shape,0):overlaps.append([ref,pin,round(via.GetPosition().x/1e6,3),round(via.GetPosition().y/1e6,3)])
 out['$via_pad_overlaps']=sorted(overlaps)
 print(json.dumps(out));sys.exit(0)
if len(sys.argv)!=5:raise SystemExit('usage: check-power-eco.py BEFORE AFTER FRESH_EXPORT REPORT')
before,after,fresh,report=sys.argv[1:];eco={'removed_components':[], 'added_components':['D20','R134','R135','R136','C98']};errors=[]
def dump(path):return json.loads(subprocess.check_output([sys.executable,__file__,'--dump',path],stderr=subprocess.DEVNULL))
a,b,c=dump(before),dump(after),dump(fresh)
old_vip=a.pop('$via_pad_overlaps');new_vip=b.pop('$via_pad_overlaps');c.pop('$via_pad_overlaps')
added_vip=[v for v in new_vip if v not in old_vip]
if added_vip:errors.append('New via overlaps fitted solder pad: '+str(added_vip))
if set(a)-set(b)!=set(eco['removed_components']) or set(b)-set(a)!=set(eco['added_components']):errors.append('Unexpected component additions/removals')
allowed={('U30','6'):'BRAKE_FB'}
changed_values={'U6','R25','R66'}
moved={'TP_VMOTOR','TP_PWR_GND'}
changes=[]
for ref in b:
 if ref not in a:
  if b[ref]!=c.get(ref):errors.append(ref+' added footprint differs from fresh source')
  continue
 old,new=a[ref],b[ref]
 ignored={'pads'} | ({'value'} if ref in changed_values else set()) | ({'position'} if ref in moved else set())
 if {k:v for k,v in old.items() if k not in ignored}!={k:v for k,v in new.items() if k not in ignored}:errors.append(ref+' unexpected component geometry/value change')
 if ref in changed_values|moved and new!=c.get(ref):errors.append(ref+' revised component differs from fresh source')
 if len(old['pads'])!=len(new['pads']):errors.append(ref+' pad count changed');continue
 for op,np in zip(old['pads'],new['pads']):
  ignored_pad={'net'} | ({'position'} if ref in moved else set())
  if {k:v for k,v in op.items() if k not in ignored_pad}!={k:v for k,v in np.items() if k not in ignored_pad}:errors.append(ref+'.'+np['pin']+' pad geometry changed')
  if op['net']==np['net']:continue
  if allowed.get((ref,np['pin']))!=np['net']:errors.append(ref+'.'+np['pin']+' unexpected connectivity change')
  changes.append({'ref':ref,'pin':np['pin'],'before':op['net'],'after':np['net']})
holes=[ref for ref in b if ref.startswith('HOLE@')]
if len(holes)!=4:errors.append('Expected four independent mounting holes')
result={'before_sha256':hashlib.sha256(Path(before).read_bytes()).hexdigest(),'after_sha256':hashlib.sha256(Path(after).read_bytes()).hexdigest(),'removed_components':sorted(set(a)-set(b)),'added_components':sorted(set(b)-set(a)),'retained_components':len(set(a)&set(b)),'mounting_holes_unchanged':len(holes)==4 and all(a.get(h)==b[h] for h in holes),'pad_net_changes':changes,'new_via_pad_overlaps':added_vip,'preexisting_via_pad_overlaps':len(old_vip),'errors':errors,'scope':'Only U6/R25/R66 values, two power-probe positions and U30 AIN2 connectivity may change. Five new footprints and affected parts must match fresh source. All other placement/pad geometry and all four holes unchanged. Native DRC/ERC/parity separately verifies copper.'}
Path(report).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));sys.exit(bool(errors))
