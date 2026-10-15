#!/usr/bin/env python3
"""Measure local bypass and buzzer bulk paths in final component-side copper.

Planes are excluded. Ordinary bypasses stay on the IC side; U18/C52 alone
uses one specified through via, including its barrel in the unchanged 5 mm limit.
"""
import argparse
from collections import defaultdict
import hashlib
import heapq
import json
import math
from pathlib import Path

import pcbnew
import wx


def xy(point):
    return (pcbnew.ToMM(point.x), pcbnew.ToMM(point.y))


def vector(point):
    return pcbnew.VECTOR2I(*(pcbnew.FromMM(v) for v in point))


def route_length(start, end, tracks, pads, layer):
    net = start.GetNetCode()
    segments = [(xy(t.GetStart()), xy(t.GetEnd()), pcbnew.ToMM(t.GetWidth()) / 2)
                for t in tracks if t.GetNetCode() == net and t.GetLayer() == layer]
    points = sorted({point for a, b, _ in segments for point in (a, b)})
    points.extend([xy(start.GetPosition()), xy(end.GetPosition())])
    first, last = len(points) - 2, len(points) - 1
    graph = defaultdict(list)

    def connect(i, j):
        distance = math.dist(points[i], points[j])
        graph[i].append((j, distance))
        graph[j].append((i, distance))

    for a, b, radius in segments:
        dx, dy = b[0] - a[0], b[1] - a[1]
        square = dx * dx + dy * dy
        on_segment = []
        for i, point in enumerate(points):
            ratio = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / square if square else 0
            ratio = max(0, min(1, ratio))
            projection = (a[0] + ratio * dx, a[1] + ratio * dy)
            if math.dist(point, projection) <= radius:
                on_segment.append((ratio, i))
        on_segment.sort()
        for (_, i), (_, j) in zip(on_segment, on_segment[1:]):
            connect(i, j)

    for pad in pads:
        if pad.GetNetCode() != net or not pad.IsOnLayer(layer):
            continue
        shape = pad.GetEffectiveShape(layer)
        indices = [i for i, point in enumerate(points) if shape.Collide(vector(point), 0)]
        for offset, i in enumerate(indices):
            for j in indices[offset + 1:]:
                connect(i, j)

    distances, queue = {first: 0}, [(0, first)]
    while queue:
        distance, node = heapq.heappop(queue)
        if node == last:
            return distance
        if distance != distances[node]:
            continue
        for neighbour, length in graph[node]:
            candidate = distance + length
            if candidate < distances.get(neighbour, math.inf):
                distances[neighbour] = candidate
                heapq.heappush(queue, (candidate, neighbour))
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('board', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    footprints = {f.GetReference(): f for f in board.GetFootprints()}
    all_tracks = list(board.GetTracks())
    tracks = [t for t in all_tracks if not isinstance(t, pcbnew.PCB_VIA)]
    pads = [p for f in footprints.values() for p in f.Pads()]
    target_path = Path('docs/decoupling-targets.json')
    targets = json.loads(target_path.read_text())
    results, errors = [], []
    for ic, pin, capacitor, *options in targets:
        start = next(p for p in footprints[ic].Pads() if p.GetNumber() == str(pin))
        end = next(p for p in footprints[capacitor].Pads() if p.GetNumber() == '1')
        layer = footprints[ic].GetLayer()
        same_side = layer in (pcbnew.F_Cu, pcbnew.B_Cu) and footprints[capacitor].GetLayer() == layer
        length = route_length(start, end, tracks, pads, layer) if same_side and start.GetNetCode() == end.GetNetCode() else None
        transition = options[0].get('layer_transition') if options else None
        via_evidence = None
        if transition:
            assert (ic,pin,capacitor)==('U18',11,'C52')
            assert transition['from']=='bottom' and transition['to']=='top'
            assert transition['native_xy_mm']==[99.4,103.9] and transition['source_xy_mm']==[-.6,-3.9]
            assert transition['pad_mm']==.6 and transition['drill_mm']==.3 and transition['maximum_vias']==1
            assert transition['barrel_mm']==1.6 and board.GetDesignSettings().GetBoardThickness()==1600000
            vias=[t for t in all_tracks if isinstance(t,pcbnew.PCB_VIA) and math.dist(xy(t.GetPosition()),(99.4,103.9))<1e-6]
            if len(vias)==1 and layer==pcbnew.B_Cu and footprints[capacitor].GetLayer()==pcbnew.F_Cu:
                via=vias[0]
                if via.GetNetCode()==start.GetNetCode()==end.GetNetCode() and all(via.GetWidth(ly)==600000 for ly in (pcbnew.F_Cu,pcbnew.In1_Cu,pcbnew.In2_Cu,pcbnew.B_Cu)) and via.GetDrillValue()==300000 and via.GetViaType()==pcbnew.VIATYPE_THROUGH:
                    bottom=route_length(start,via,tracks,pads,pcbnew.B_Cu)
                    top=route_length(via,end,tracks,pads,pcbnew.F_Cu)
                    if bottom is not None and top is not None:
                        length=bottom+1.6+top
                        via_evidence=dict(xy_mm=xy(via.GetPosition()),pad_mm=.6,drill_mm=.3,barrel_mm=1.6,bottom_mm=bottom,top_mm=top)
        passed = length is not None and length <= 5
        results.append(dict(ic=ic, pin=pin, capacitor=capacitor,
                            layer=board.GetLayerName(layer), route_length_mm=length, maximum_mm=5, passed=passed,
                            layer_transition=via_evidence))
        if not passed:
            errors.append(f'{ic}.{pin} to {capacitor}.1: no approved copper path within 5 mm ({length})')
    # The buzzer bulk branch has a separate 7 mm body-clearance budget. Do not
    # relax the 5 mm IC bypass limit to accommodate the larger buzzer package.
    buzzer = next(p for p in footprints['BZ1'].Pads() if p.GetNumber() == '1')
    bulk = next(p for p in footprints['C96'].Pads() if p.GetNumber() == '1')
    same_top = footprints['BZ1'].GetLayer() == footprints['C96'].GetLayer() == pcbnew.F_Cu
    bulk_length = route_length(buzzer, bulk, tracks, pads, pcbnew.F_Cu) if same_top and buzzer.GetNetCode() == bulk.GetNetCode() else None
    bulk_result = dict(component='BZ1', pin=1, capacitor='C96', layer='F.Cu',
                       route_length_mm=bulk_length, maximum_mm=7,
                       passed=bulk_length is not None and bulk_length <= 7)
    if not bulk_result['passed']:
        errors.append(f'BZ1.1 to C96.1: no top-layer bulk path within 7 mm ({bulk_length})')
    digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    report = dict(board_sha256=digest(args.board), targets_sha256=digest(target_path),
                  checker_sha256=digest(Path(__file__)), results=results, bulk_results=[bulk_result], errors=errors,
                  limitation='Copper-path geometry only; ground-loop inductance and powered ripple require measurement.')
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(dict(checked=len(results), errors=errors)))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
