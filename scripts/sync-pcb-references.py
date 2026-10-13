#!/usr/bin/env python3
"""Copy compiled footprint-default references without layout or text overrides."""
import argparse,json,re,math,uuid
from pathlib import Path
REFERENCE=re.compile(r'^(?:U|R|C|D|Q|L|Y|J|SW|BZ)\d+$')

def forms(text,head):
    for m in re.finditer(r'\('+re.escape(head)+r'(?=\s)',text):
        depth=0;quoted=False;escaped=False
        for i in range(m.start(),len(text)):
            c=text[i]
            if quoted:
                if escaped:escaped=False
                elif c=='\\':escaped=True
                elif c=='"':quoted=False
            elif c=='"':quoted=True
            elif c=='(':depth+=1
            elif c==')':
                depth-=1
                if depth==0:
                    yield m.start(),i+1,text[m.start():i+1];break

def replace(text,edits):
    for a,b,value in sorted(edits,reverse=True):text=text[:a]+value+text[b:]
    return text

def stripped(text):
    edits=[]
    for a,b,s in forms(text,'property'):
        if s.startswith('(property "Reference"'):edits.append((a,b,''))
    for kind in ['gr_text','fp_text']:
        for a,b,s in forms(text,kind):
            strings=re.findall(r'"(?:\\.|[^"\\])*"',s)
            if strings:
                value=json.loads(strings[0])
                if REFERENCE.fullmatch(value) or '${REFERENCE}' in value or value in ['RESET','START/STOP','J2\nMOTOR']:edits.append((a,b,''))
    return re.sub(r'\s+',' ',replace(text,edits)).strip()

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('board',type=Path);p.add_argument('--source',type=Path,default=Path('dist/index/circuit.json'));args=p.parse_args()
    original=args.board.read_text();circuit=json.loads(args.source.read_text())
    names={r['source_component_id']:r['name'] for r in circuit if r['type']=='source_component'}
    components={r['pcb_component_id']:names.get(r.get('source_component_id')) for r in circuit if r['type']=='pcb_component'}
    labels={}
    source_refs={ref for ref in components.values() if ref and REFERENCE.fullmatch(ref)}
    for r in circuit:
        if r['type']!='pcb_silkscreen_text':continue
        ref=components.get(r.get('pcb_component_id'))
        if ref and REFERENCE.fullmatch(ref):
            if ref in labels:raise ValueError(f'Duplicate reference text: {ref}')
            if r['text']!=ref:raise ValueError(f'Unexpected replacement reference text: {ref}')
            labels[ref]=r
    missing=source_refs-set(labels)
    if missing:raise ValueError(f'Footprint references missing from source: {sorted(missing)}')
    edits=[];seen=set();removed=[]
    for a,b,footprint in forms(original,'footprint'):
        field=next((x for x in forms(footprint,'property') if x[2].startswith('(property "Reference"')),None)
        if not field:continue
        ref=json.loads(re.match(r'\(property "Reference" ("[^"]*")',field[2])[1])
        if not REFERENCE.fullmatch(ref):continue
        if ref not in source_refs:raise ValueError(f'Native part absent from source: {ref}')
        seen.add(ref)
        local=[]
        for u,v,s in forms(footprint,'fp_text'):
            if re.search(r'\$\{REFERENCE\}|"'+re.escape(ref)+r'"',s):local.append((u,v,''))
        r=labels[ref]
        at=next(forms(footprint,'at'))[2];xyz=[float(v) for v in re.findall(r'-?[\d.]+',at)];fx,fy=xyz[:2];angle=math.radians(xyz[2] if len(xyz)>2 else 0)
        dx=100+r['anchor_position']['x']-fx;dy=100-r['anchor_position']['y']-fy
        x=dx*math.cos(angle)-dy*math.sin(angle);y=dx*math.sin(angle)+dy*math.cos(angle)
        rot=r.get('ccw_rotation',0)%360;side=('F.' if r['layer']=='top' else 'B.')+'SilkS'
        uid=str(uuid.uuid5(uuid.NAMESPACE_URL,'pd1180-reference-'+ref))
        effects=f'(effects (font (size {r["font_size"]} {r["font_size"]}) (thickness 0.12)){" (justify mirror)" if r["layer"]=="bottom" else ""})'
        common=f'(at {x:.6f} {y:.6f} {rot:g}) (layer "{side}") (uuid "{uid}") {effects}'
        local.append((field[0],field[1],f'(property "Reference" "{ref}" {common})'))
        edits.append((a,b,replace(footprint,local)))
    if seen!=source_refs:raise ValueError(f'Unmatched source references: {source_refs-seen}')
    for a,b,s in forms(original,'gr_text'):
        value=json.loads(re.match(r'\(gr_text ("(?:\\.|[^"\\])*")',s)[1])
        if REFERENCE.fullmatch(value) or value in ['RESET','START/STOP','J2\nMOTOR']:
            edits.append((a,b,''));removed.append(value)
    result=re.sub(r'[ \t]+\n','\n',replace(original,edits))
    assert stripped(original)==stripped(result),'Non-label native data changed'
    args.board.write_text(result)
    print(json.dumps({'default_references':len(labels),'footprints_without_reference_text':sorted(source_refs-set(labels)),'detached_labels_removed':removed,'non_label_native_data_unchanged':True},indent=2))
if __name__=='__main__':main()
