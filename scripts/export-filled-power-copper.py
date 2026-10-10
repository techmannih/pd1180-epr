import pcbnew, wx, json, hashlib, argparse
from pathlib import Path
parser=argparse.ArgumentParser(description="Export actual filled KiCad power copper for offline resistance screening")
parser.add_argument("board", type=Path)
parser.add_argument("output", type=Path)
args=parser.parse_args()
app=wx.App(False)
p=args.board
b=pcbnew.LoadBoard(str(p.resolve()))
nets=set(json.loads(Path('board-standards.json').read_text())['routing']['critical_power_nets'])
# Preserve holes in actual KiCad zone fills; 5 um inscribed polygon approximation for curved lands.
def ring(line):
 return [[pcbnew.ToMM(line.CPoint(i).x),pcbnew.ToMM(line.CPoint(i).y)] for i in range(line.PointCount())]
def polygons(poly):
 return [[ring(poly.Outline(i))]+[ring(poly.Hole(i,j)) for j in range(poly.HoleCount(i))] for i in range(poly.OutlineCount())]
layers=[pcbnew.F_Cu,pcbnew.In1_Cu,pcbnew.In2_Cu,pcbnew.B_Cu]
items=[]
for z in b.Zones():
 if z.GetNetname() not in nets or z.GetIsRuleArea():continue
 for layer in layers:
  if z.IsOnLayer(layer):items.append({'net':z.GetNetname(),'layer':b.GetLayerName(layer),'kind':'fill','polygons':polygons(z.GetFilledPolysList(layer))})
for t in b.GetTracks():
 if t.GetNetname() not in nets:continue
 for layer in layers:
  if not t.IsOnLayer(layer):continue
  poly=pcbnew.SHAPE_POLY_SET();t.TransformShapeToPolygon(poly,layer,0,5000,pcbnew.ERROR_INSIDE)
  row={'net':t.GetNetname(),'layer':b.GetLayerName(layer),'kind':'via' if t.Type()==pcbnew.PCB_VIA_T else 'track','polygons':polygons(poly),'uuid':t.m_Uuid.AsString()}
  if row['kind']=='track':row['a']=[pcbnew.ToMM(t.GetStart().x),pcbnew.ToMM(t.GetStart().y)];row['b']=[pcbnew.ToMM(t.GetEnd().x),pcbnew.ToMM(t.GetEnd().y)];row['width']=pcbnew.ToMM(t.GetWidth())
  else:row['at']=[pcbnew.ToMM(t.GetPosition().x),pcbnew.ToMM(t.GetPosition().y)];row['drill']=pcbnew.ToMM(t.GetDrillValue());row['diameter']=pcbnew.ToMM(t.GetWidth(layer))
  items.append(row)
for f in b.GetFootprints():
 for pad in f.Pads():
  if pad.GetNetname() not in nets:continue
  for layer in layers:
   if not pad.IsOnLayer(layer):continue
   poly=pcbnew.SHAPE_POLY_SET();pad.TransformShapeToPolygon(poly,layer,0,5000,pcbnew.ERROR_INSIDE)
   items.append({'net':pad.GetNetname(),'layer':b.GetLayerName(layer),'kind':'pad','ref':f.GetReference(),'pin':pad.GetNumber(),'drill_xy':[pcbnew.ToMM(pad.GetDrillSize().x),pcbnew.ToMM(pad.GetDrillSize().y)],'at':[pcbnew.ToMM(pad.GetPosition().x),pcbnew.ToMM(pad.GetPosition().y)],'polygons':polygons(poly)})
args.output.write_text(json.dumps({'board_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'items':items}))
print('exported',len(items),'native copper objects')
