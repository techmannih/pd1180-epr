#!/usr/bin/env python3
"""Remove only native-DRC-identified dangling power stubs after interface deletion.
Runs on a staging PCB; never waives a remaining violation or updates approval hashes.
"""
import argparse,json,subprocess
from pathlib import Path
import pcbnew,wx
p=argparse.ArgumentParser(description=__doc__);p.add_argument('board');p.add_argument('--once',action='store_true');p.add_argument('--allow-net',action='append',default=[]);p.add_argument('--cli',default='/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli');a=p.parse_args()
app=wx.App(False);board=Path(a.board).resolve();report=board.parent/'drc.json';removed=[]
if a.once:
 drc=json.loads(report.read_text());ids={i['uuid'] for v in drc['violations'] if v['type'] in ['track_dangling','via_dangling'] for i in v['items']}
 b=pcbnew.LoadBoard(str(board));held=list(b.GetTracks());matched=[]
 for t in held:
  uid=t.m_Uuid.AsString()
  if uid not in ids:continue
  if t.GetNetname() not in ['GND','V3V3','VMOTOR',*a.allow_net]:raise SystemExit('Unexpected dangling net: '+t.GetNetname())
  matched.append(uid);removed.append({'uuid':uid,'net':t.GetNetname()});b.Remove(t)
 if set(matched)!=ids:raise SystemExit('DRC item set did not match native tracks')
 b.BuildConnectivity();pcbnew.ZONE_FILLER(b).Fill(b.Zones());pcbnew.SaveBoard(str(board),b)
 (board.parent/'removed-last.json').write_text(json.dumps(removed))
 raise SystemExit(0)
for iteration in range(30):
 subprocess.run([a.cli,'pcb','drc','--format','json','--output',str(report),str(board)],check=True,stdout=subprocess.DEVNULL)
 drc=json.loads(report.read_text());ids={i['uuid'] for v in drc['violations'] if v['type'] in ['track_dangling','via_dangling'] for i in v['items']}
 if not ids:break
 import sys
 subprocess.run([sys.executable,__file__,str(board),'--once',*[v for n in a.allow_net for v in ['--allow-net',n]]],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 removed.extend(json.loads((board.parent/'removed-last.json').read_text()))
 print(json.dumps({'iteration':iteration,'removed':len(ids)}),flush=True)
else:raise SystemExit('Dangling cleanup did not converge; inspect report')
(board.parent/'stub-removal.json').write_text(json.dumps(removed,indent=2)+'\n')
print(json.dumps({'dangling_tracks_removed':len(removed),'remaining_violations':len(drc['violations']),'unconnected':len(drc['unconnected_items'])}))
if drc['violations'] or drc['unconnected_items']:raise SystemExit(1)
