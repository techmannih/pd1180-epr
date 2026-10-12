#!/usr/bin/env python3
"""Apply the reviewed interface-removal ECO to a copy of the native PCB.

No placement or surviving pad geometry changes. Dedicated removed nets lose all
copper. The disconnected J7 VMOTOR branch is removed only up to its first junction.
Fresh native DRC is mandatory; this script does not approve or waive violations.
"""
import argparse,json,collections
from pathlib import Path
import pcbnew,wx
p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');p.add_argument('output');a=p.parse_args()
app=wx.App(False)
b=pcbnew.LoadBoard(a.input)
eco=json.loads(Path('engineering/interface-cleanup.json').read_text())
refs=set(eco['removed_components']); nets=set(eco['removed_nets']); tracks=list(b.GetTracks())
original={f.GetReference():f for f in b.GetFootprints()}
if not refs.issubset(original):raise SystemExit('Input board is not the expected pre-ECO board')
removed=[]
for t in tracks:
 if t.GetNetname() in nets:b.Remove(t);removed.append(t)
# Remove the branch connected to the old VMOTOR output pad. Use exact native
# endpoint adjacency and stop at a junction, via or a surviving functional pad.
j7=original['J7'];pad17=next(p for p in j7.Pads() if p.GetNumber()=='17')
net=pad17.GetNetname();point=pad17.GetPosition();active=list(b.GetTracks())
shared_branch=[]
while True:
 hits=[t for t in active if t.GetNetname()==net and (t.GetStart()==point or t.GetEnd()==point)]
 if len(hits)!=1 or isinstance(hits[0],pcbnew.PCB_VIA):break
 t=hits[0];other=t.GetEnd() if t.GetStart()==point else t.GetStart()
 b.Remove(t);active.remove(t);shared_branch.append(t)
 point=other
 if any(p.GetNetname()==net and p.HitTest(point) for f in b.GetFootprints() if f.GetReference() not in refs for p in f.Pads() if p is not pad17):break
for f in original.values():
 if f.GetReference()=='J7':allowed=set(map(str,eco['retained_j7_pins']))
 elif f.GetReference()=='U16':allowed={str(n) for n in range(1,49)}-set(map(str,eco['mcu_nc_pins']))
 else:continue
 for pad in f.Pads():
  if pad.GetNumber() not in allowed:pad.SetNetCode(0)
for ref in refs:b.Remove(original[ref])
for z in list(b.Zones()):
 if z.GetNetname() in nets:b.Remove(z)
b.BuildConnectivity();pcbnew.ZONE_FILLER(b).Fill(b.Zones())
Path(a.output).parent.mkdir(parents=True,exist_ok=True);pcbnew.SaveBoard(a.output,b)
print(json.dumps({'removed_components':sorted(refs),'removed_dedicated_tracks_and_vias':len(removed),'removed_j7_vmotor_branch_tracks':len(shared_branch),'output':a.output,'approval':'Fresh native DRC/ERC/parity required'}))
