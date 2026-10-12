#!/usr/bin/env python3
"""Finish the reviewed interface ECO after dangling-stub cleanup, on a staging board.
Adds the C41 ground return and trims a 0.30 x 0.31 mm B.Cu acute pour tip.
Fresh native DRC/ERC/parity are mandatory after this operation.
"""
import sys,pcbnew,wx
app=wx.App(False)
if len(sys.argv)!=2:raise SystemExit('usage: finish-interface-copper.py STAGING_BOARD')
p=sys.argv[1];b=pcbnew.LoadBoard(p)
net=next(p.GetNetCode() for f in b.GetFootprints() if f.GetReference()=='C41' for p in f.Pads() if p.GetNumber()=='2')
def pt(x,y):return pcbnew.VECTOR2I(pcbnew.FromMM(x),pcbnew.FromMM(y))
if any(isinstance(t,pcbnew.PCB_VIA) and t.GetPosition()==pt(102.325,132.4) for t in b.GetTracks()):raise SystemExit('Repair already applied')
for start,end,layer in [((102.325,133),(102.325,132.4),pcbnew.F_Cu),((102.325,132.4),(104.225,132.4),pcbnew.In1_Cu)]:
 t=pcbnew.PCB_TRACK(b);t.SetStart(pt(*start));t.SetEnd(pt(*end));t.SetLayer(layer);t.SetWidth(pcbnew.FromMM(.25));t.SetNetCode(net);b.Add(t)
v=pcbnew.PCB_VIA(b);v.SetPosition(pt(102.325,132.4));v.SetWidth(pcbnew.FromMM(.6));v.SetDrill(pcbnew.FromMM(.3));v.SetViaType(pcbnew.VIATYPE_THROUGH);v.SetLayerPair(pcbnew.F_Cu,pcbnew.B_Cu);v.SetNetCode(net);b.Add(v)
z=pcbnew.ZONE(b);z.SetLayer(pcbnew.B_Cu);z.SetIsRuleArea(True);z.SetDoNotAllowZoneFills(True);z.SetDoNotAllowTracks(False);z.SetDoNotAllowVias(False);z.SetDoNotAllowPads(False);z.SetDoNotAllowFootprints(False);z.SetZoneName('Interface ECO: trim acute B.Cu pour tip');o=z.Outline();o.NewOutline()
for x,y in [(108.18,96.94),(108.48,96.94),(108.48,97.25),(108.18,97.25)]:o.Append(pcbnew.FromMM(x),pcbnew.FromMM(y))
b.Add(z);b.BuildConnectivity();pcbnew.ZONE_FILLER(b).Fill(b.Zones());pcbnew.SaveBoard(p,b)
