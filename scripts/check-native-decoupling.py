#!/usr/bin/env python3
"""Measure short IC-to-capacitor paths in the final native top-layer copper.

Planes and vias are deliberately excluded: each specified bypass must retain
a short top-layer connection. Native DRC remains the connectivity authority.
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


def route_length(start, end, tracks, pads):
    net = start.GetNetCode()
    segments = [(xy(t.GetStart()), xy(t.GetEnd()), pcbnew.ToMM(t.GetWidth()) / 2)
                for t in tracks if t.GetNetCode() == net and t.GetLayer() == pcbnew.F_Cu]
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
        if pad.GetNetCode() != net or not pad.IsOnLayer(pcbnew.F_Cu):
            continue
        shape = pad.GetEffectiveShape(pcbnew.F_Cu)
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
    for ic, pin, capacitor, *_ in targets:
        start = next(p for p in footprints[ic].Pads() if p.GetNumber() == str(pin))
        end = next(p for p in footprints[capacitor].Pads() if p.GetNumber() == '1')
        length = route_length(start, end, tracks, pads) if start.GetNetCode() == end.GetNetCode() else None
        passed = length is not None and length <= 5
        results.append(dict(ic=ic, pin=pin, capacitor=capacitor,
                            top_route_length_mm=length, maximum_mm=5, passed=passed))
        if not passed:
            errors.append(f'{ic}.{pin} to {capacitor}.1: no top-layer path within 5 mm ({length})')
    digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    report = dict(board_sha256=digest(args.board), targets_sha256=digest(target_path),
                  checker_sha256=digest(Path(__file__)), results=results, errors=errors,
                  limitation='Copper-path geometry only; ground-loop inductance and powered ripple require measurement.')
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(dict(checked=len(results), errors=errors)))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
