import json,sys,math,time
import numpy as np
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
from shapely import contains_xy
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.sparse.linalg import spsolve
from pathlib import Path
# Usage: python screen-filled-power-copper.py copper.json NET grid_mm REF:pins REF:pins
# Requires numpy 2.0.2, scipy 1.13.1 and shapely 2.0.7. Not a thermal or order gate.
if len(sys.argv)!=6:raise SystemExit("Expected copper.json NET grid_mm REF:pins REF:pins")
source=json.load(open(sys.argv[1]))
net=sys.argv[2];step=float(sys.argv[3]);start=sys.argv[4];end=sys.argv[5]
if not 0.02<=step<=0.5:raise ValueError("Use a 0.02–0.5 mm mesh and check convergence")
items=[x for x in source['items'] if x['net']==net]
layers=['F.Cu','In1.Cu','In2.Cu','B.Cu']
def geom(item):return unary_union([Polygon(p[0],p[1:]).buffer(0) for p in item['polygons'] if len(p[0])>=3])
polys={l:unary_union([geom(x) for x in items if x['layer']==l]) for l in layers}
bounds=unary_union(list(polys.values())).bounds
xs=np.arange(math.floor(bounds[0]/step)*step-step,bounds[2]+step,step);ys=np.arange(math.floor(bounds[1]/step)*step-step,bounds[3]+step,step)
X,Y=np.meshgrid(xs,ys);indices={};coords=[];n=0
for l in layers:
 mask=contains_xy(polys[l],X,Y);idx=np.full(mask.shape,-1,dtype=np.int32);idx[mask]=np.arange(n,n+mask.sum());indices[l]=idx
 coords.extend(zip(X[mask],Y[mask]));n+=int(mask.sum())
coords=np.array(coords);edges=[]
# 9-point isotropic sheet-conductance stencil; sheet copper 35 um at 20 C.
sheet_r=1.724e-8/35e-6
for l,idx in indices.items():
 for dy,dx,weight in [(0,1,2/3),(1,0,2/3),(1,1,1/6),(1,-1,1/6)]:
  y0=slice(max(0,-dy),idx.shape[0]-max(0,dy));y1=slice(max(0,dy),idx.shape[0]-max(0,-dy))
  x0=slice(max(0,-dx),idx.shape[1]-max(0,dx));x1=slice(max(0,dx),idx.shape[1]-max(0,-dx))
  a=idx[y0,x0];b=idx[y1,x1];mask=(a>=0)&(b>=0)
  edges.extend(zip(a[mask],b[mask],np.full(mask.sum(),weight/sheet_r)))
# Through vias modelled as four contacts and three equal-length barrel sections.
# 20 um barrel plating and equally spaced planes are explicit modelling assumptions.
seen=set()
for item in items:
 if item['kind']=='pad' and max(item.get('drill_xy',[0,0]))>0:
  item=dict(item,uuid=item['ref']+':'+item['pin'],drill=min(item['drill_xy']),diameter=min(item['drill_xy'])+0.3)
 elif item['kind']!='via':continue
 x,y=item['at'];barrel=(round(x,6),round(y,6))
 if barrel in seen:continue
 seen.add(barrel);nodes=[]
 for l in layers:
  idx=indices[l];iy=int(round((y-ys[0])/step));ix=int(round((x-xs[0])/step));candidates=[]
  for yy in range(max(0,iy-2),min(len(ys),iy+3)):
   for xx in range(max(0,ix-2),min(len(xs),ix+3)):
    if idx[yy,xx]>=0:candidates.append(((xs[xx]-x)**2+(ys[yy]-y)**2,int(idx[yy,xx])))
  nodes.append(min(candidates)[1] if candidates and min(candidates)[0] < (item['diameter']/2+step)**2 else None)
 via_r=1.724e-8*(.0016/3)/(math.pi*(item['drill']*1e-3+20e-6)*20e-6)
 for a,b in zip(nodes,nodes[1:]):
  if a is not None and b is not None:edges.append((a,b,1/via_r))
edges=np.array(edges);a=edges[:,0].astype(int);b=edges[:,1].astype(int);g=edges[:,2]
L=coo_matrix((np.concatenate([g,g,-g,-g]),(np.concatenate([a,b,a,b]),np.concatenate([a,b,b,a]))),shape=(n,n)).tocsr()
def terminals(spec):
 ref,pins=spec.split(':');pins=pins.split(',');out=[]
 for p in items:
  if p['kind']=='pad' and p['ref']==ref and p['pin'] in pins:
   geo=geom(p);idx=indices[p['layer']];m=contains_xy(geo,X,Y)&(idx>=0);out.extend(idx[m].tolist())
 return np.unique(out)
s=terminals(start);t=terminals(end)
if not len(s) or not len(t):raise RuntimeError('No sampled terminal')
components, labels=connected_components(L,directed=False)
common=set(labels[s])&set(labels[t])
if not common:raise RuntimeError(f'Raster disconnected at {step} mm; native DRC remains authoritative')
active=np.isin(labels,list(common));boundary=np.union1d(s,t);free=np.setdiff1d(np.flatnonzero(active),boundary)
v=np.zeros(n);v[s]=1
v[free]=spsolve(L[free][:,free],-(L[free][:,s]@np.ones(len(s))))
current=float((L@v)[s].sum());r=1/current
result={'net':net,'from':start,'to':end,'grid_mm':step,'nodes':n,'resistance_mohm_20c':round(r*1000,4),'voltage_drop_mv_at_5_5a':round(r*5500,3),'loss_w_at_5_5a':round(r*5.5**2,4),'source_nodes':len(s),'destination_nodes':len(t),'components':components,'board_sha256':source['board_sha256']}
result['method']='9-point DC sheet-conductance screening; 35 um copper at 20 C, 20 um via plating, 1.6 mm equally spaced stack'
result['limitations']=['Grid approximation; validate mesh convergence and native connectivity separately', 'Ideal terminal contacts; via contacts approximate, copper thickness and barrel plating are assumptions', 'Excludes connector/contact, shunt and transistor resistance, AC/PWM/proximity effects and temperature feedback', 'DC 5.5 A comparison is not a duty-cycle, temperature-rise or current-rating qualification']
print(json.dumps(result,indent=2))
