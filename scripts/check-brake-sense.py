#!/usr/bin/env python3
"""Prove thin BRAKE_RETURN copper serves only the low-current divider.

Remove that copper in a disposable board and require native DRC to report only
R134.1 disconnected, with the clamp, connector and Q16 still connected. This
negative test prevents a signal-width high-current path being exempted from the
power-corridor check. The committed board is never modified.
"""
import argparse,hashlib,json,os,shutil,subprocess,tempfile
from pathlib import Path
import pcbnew,wx
p=argparse.ArgumentParser(description=__doc__);p.add_argument('board',type=Path);p.add_argument('report',type=Path);a=p.parse_args()
app=wx.App(False);b=pcbnew.LoadBoard(str(a.board.resolve()));errors=[]
pads={(f.GetReference(),q.GetNumber()):q for f in b.GetFootprints() for q in f.Pads() if q.GetNetname()=='BRAKE_RETURN'}
expected={('R134','1'),('D20','2'),('J3','2'),*[('Q16',str(n)) for n in range(5,10)]}
if set(pads)!=expected:errors.append('BRAKE_RETURN endpoint set changed; reassess current paths')
removed=[]
for t in list(b.GetTracks()):
 if t.GetNetname()!='BRAKE_RETURN':continue
 if isinstance(t,pcbnew.PCB_VIA): take=t.GetWidth(pcbnew.F_Cu)<=500000
 else:take=t.GetWidth()<=200000
 if take:removed.append(t);b.Remove(t)
segments=[t for t in removed if not isinstance(t,pcbnew.PCB_VIA)]
if not segments:errors.append('No divider branch found')
cli=os.environ.get('KICAD_CLI','/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli')
with tempfile.TemporaryDirectory(prefix='brake-sense-') as tmp:
 out=Path(tmp)/a.board.name;pcbnew.SaveBoard(str(out),b)
 shutil.copyfile(a.board.with_suffix('.kicad_pro'),out.with_suffix('.kicad_pro'))
 report=Path(tmp)/'drc.json'
 subprocess.run([cli,'pcb','drc','--all-track-errors','--refill-zones','--format','json','--severity-all','--output',str(report),str(out)],check=True,stdout=subprocess.DEVNULL)
 drc=json.loads(report.read_text());unconnected=drc['unconnected_items']
 if drc['violations']:errors.append('Removing divider branch creates other native DRC violations')
 if len(unconnected)!=1 or not any('Pad 1 [BRAKE_RETURN] of R134' in i['description'] for i in unconnected[0]['items']):errors.append('Removing thin branch disconnects something other than R134.1')
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
result={'board_sha256':sha(a.board),'checker_sha256':sha(__file__),'segment_uuids':sorted(t.m_Uuid.AsString() for t in segments),'removed_vias':sum(isinstance(t,pcbnew.PCB_VIA) for t in removed),'length_mm':sum(t.GetLength()/1e6 for t in segments),'negative_drc_unconnected':unconnected,'negative_drc_violations':drc['violations'],'maximum_divider_current_a':55/(9910*.98),'reason':'Only the 9.91 kohm startup divider is disconnected by removing the thin branch; all brake power terminals remain connected. The branch carries <5.7 mA at 55 V, not the brake load current.','errors':errors}
a.report.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'segments':len(segments),'errors':errors}));raise SystemExit(bool(errors))
