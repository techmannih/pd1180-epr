#!/usr/bin/env python3
"""Preserve Kelvin branches during routing and check their final copper isolation.

DRC cannot distinguish a Kelvin return from another conductor on the same net.
These branches may join other copper only inside their specified shunt (or
analog bypass) terminal. The source PCB paths remain the geometry authority.
"""

import argparse
import hashlib
import json
import math
from pathlib import Path

import pcbnew


def xy(point):
    return pcbnew.ToMM(point.x), pcbnew.ToMM(point.y)


def vector(point):
    return pcbnew.VECTOR2I(*(pcbnew.FromMM(v) for v in point))


def distance_to_segment(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    length2 = dx * dx + dy * dy
    t = max(0, min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / length2)) if length2 else 0
    return math.dist(p, (a[0]+t*dx, a[1]+t*dy))


def samples(a, b, step=0.025):
    count = max(1, math.ceil(math.dist(a, b) / step))
    return [(a[0]+(b[0]-a[0])*i/count, a[1]+(b[1]-a[1])*i/count) for i in range(count+1)]


def load_paths(board):
    circuit = json.loads(Path("dist/index/circuit.json").read_text())
    policy = json.loads(Path("routing/critical-paths.json").read_text())
    components = {e["source_component_id"]: e["name"] for e in circuit if e["type"] == "source_component"}
    ports = {e["source_port_id"]: (components[e["source_component_id"]], str(e["pin_number"])) for e in circuit if e["type"] == "source_port"}
    source_xy = {ports[e["source_port_id"]]: (e["x"], e["y"]) for e in circuit if e["type"] == "pcb_port"}
    source_traces = {e.get("name"): e for e in circuit if e["type"] == "source_trace"}
    traces = {e["source_trace_id"]: e for e in circuit if e["type"] == "pcb_trace"}
    pads = {(fp.GetReference(), p.GetNumber()): p for fp in board.GetFootprints() for p in fp.Pads()}
    paths = []
    for rule in policy:
        start, end = tuple(rule["from"]), tuple(rule["to"])
        pa, pb = pads[start], pads[end]
        src = source_traces[rule["name"]]
        route = traces[src["source_trace_id"]]["route"]
        if any(p["route_type"] != "wire" or p["layer"] != "top" for p in route):
            raise ValueError(f'{rule["name"]}: expected a top-only, via-free Kelvin branch')
        x, y = xy(pa.GetPosition())
        sx, sy = source_xy[start]
        points = [(x + p["x"] - sx, y - p["y"] + sy) for p in route]
        points = [p for i, p in enumerate(points) if i == 0 or math.dist(p, points[i-1]) > 0.00001]
        if math.dist(points[-1], xy(pb.GetPosition())) > 0.001 or pa.GetNetCode() != pb.GetNetCode():
            raise ValueError(f'{rule["name"]}: source path no longer matches the native pads/net')
        paths.append({**rule, "points": points, "segments": list(zip(points, points[1:])),
                      "net": pa.GetNetname(), "width": src["min_trace_thickness"],
                      "start_pad": pa, "end_pad": pb})
    return paths


def is_branch_track(track, paths):
    if isinstance(track, pcbnew.PCB_VIA) or track.GetLayer() != pcbnew.F_Cu:
        return False
    a, b = xy(track.GetStart()), xy(track.GetEnd())
    for path in paths:
        if track.GetNetname() != path["net"] or abs(pcbnew.ToMM(track.GetWidth()) - path["width"]) > 0.001:
            continue
        if any(distance_to_segment(a, s, e) < 0.001 and distance_to_segment(b, s, e) < 0.001 for s, e in path["segments"]):
            return True
    return False


def clip(poly, axis, boundary, less):
    result = []
    for a, b in zip(poly, poly[1:] + poly[:1]):
        ia, ib = (a[axis] <= boundary, b[axis] <= boundary) if less else (a[axis] >= boundary, b[axis] >= boundary)
        if ia:
            result.append(a)
        if ia != ib:
            t = (boundary-a[axis])/(b[axis]-a[axis])
            result.append(tuple(a[j]+t*(b[j]-a[j]) for j in (0, 1)))
    return result


def reservation_pieces(path):
    # Subtract the receiving terminal's box so load copper can reach the shunt.
    box = path["end_pad"].GetBoundingBox()
    lo, hi = xy(box.GetPosition()), xy(box.GetEnd())
    for a, b in path["segments"]:
        length = math.dist(a, b)
        ux, uy = (b[0]-a[0])/length, (b[1]-a[1])/length
        radius = path["width"]/2 + 0.04
        poly = [(a[0]-ux*radius-uy*radius,a[1]-uy*radius+ux*radius),
                (b[0]+ux*radius-uy*radius,b[1]+uy*radius+ux*radius),
                (b[0]+ux*radius+uy*radius,b[1]+uy*radius-ux*radius),
                (a[0]-ux*radius+uy*radius,a[1]-uy*radius-ux*radius)]
        # Disjoint rectangles cover the complement of the terminal rectangle.
        for conditions in (((0,lo[0],True),), ((0,hi[0],False),),
                           ((0,lo[0],False),(0,hi[0],True),(1,lo[1],True)),
                           ((0,lo[0],False),(0,hi[0],True),(1,hi[1],False))):
            piece = poly
            for axis, boundary, less in conditions:
                piece = clip(piece, axis, boundary, less) if piece else []
            area = abs(sum(p[0]*q[1]-q[0]*p[1] for p,q in zip(piece,piece[1:]+piece[:1])))/2 if piece else 0
            if area > 0.00001:
                yield piece


def reservation_polygons(path):
    # Merge overlapping segment buffers into one continuous reservation. The
    # router otherwise treats each tiny overlap as another obstacle boundary.
    merged = pcbnew.SHAPE_POLY_SET()
    for points in reservation_pieces(path):
        piece = pcbnew.SHAPE_POLY_SET()
        piece.NewOutline()
        for point in points:
            p = vector(point)
            piece.Append(p.x, p.y)
        merged.BooleanAdd(piece)
    merged.Simplify()
    for i in range(merged.OutlineCount()):
        if merged.HoleCount(i):
            raise ValueError(f'{path["name"]}: reservation needs a polygon with holes')
        outline = merged.Outline(i)
        yield [xy(outline.CPoint(j)) for j in range(outline.PointCount())]


def add_pour_keepouts(board, paths):
    for path in paths:
        for points in reservation_polygons(path):
            zone = pcbnew.ZONE(board)
            zone.SetLayer(pcbnew.F_Cu)
            zone.SetIsRuleArea(True)
            zone.SetDoNotAllowTracks(False)
            zone.SetDoNotAllowVias(False)
            zone.SetDoNotAllowPads(False)
            zone.SetDoNotAllowZoneFills(True)
            zone.SetDoNotAllowFootprints(False)
            zone.SetZoneName(path["name"])
            zone.Outline().NewOutline()
            for p in points:
                zone.Outline().Append(*[pcbnew.FromMM(v) for v in p])
            board.Add(zone)


def check(board, paths):
    errors, evidence = [], []
    copper = list(board.GetTracks())
    pads = [p for fp in board.GetFootprints() for p in fp.Pads()]
    for path in paths:
        terminal = path["end_pad"].GetEffectiveShape(pcbnew.F_Cu)
        own = [t for t in copper if is_branch_track(t, [path])]
        other = [t for t in copper if t.GetNetname() == path["net"] and t not in own and (isinstance(t, pcbnew.PCB_VIA) or t.GetLayer() == pcbnew.F_Cu)]
        others = [(t, t.GetEffectiveShape(pcbnew.F_Cu)) for t in other]
        others += [(p, p.GetEffectiveShape(pcbnew.F_Cu)) for p in pads if p.GetNetname() == path["net"] and p.IsOnLayer(pcbnew.F_Cu) and p.m_Uuid not in (path["start_pad"].m_Uuid, path["end_pad"].m_Uuid)]
        zones = [z.GetFilledPolysList(pcbnew.F_Cu) for z in board.Zones() if not z.GetIsRuleArea() and z.IsOnLayer(pcbnew.F_Cu) and z.GetNetname() == path["net"]]
        missing, joined = False, False
        for a, b in path["segments"]:
            for p in samples(a, b):
                q = vector(p)
                if not any(distance_to_segment(p, xy(t.GetStart()), xy(t.GetEnd())) < 0.002 for t in own):
                    missing = True
                if terminal.Collide(q, 0):
                    continue
                radius = pcbnew.FromMM(path["width"]/2 - 0.002)
                if any(shape.Collide(q, radius) for _, shape in others) or any(zone.Collide(q, radius) for zone in zones):
                    joined = True
        if missing:
            errors.append(f'{path["name"]}: source copper was removed or moved')
        if joined:
            errors.append(f'{path["name"]}: another conductor/plane joins before the receiving terminal')
        evidence.append({"name": path["name"], "net": path["net"], "length_mm": round(sum(math.dist(a,b) for a,b in path["segments"]),3), "via_count": 0,
                         "path_preserved": not missing, "terminal_only_join": not joined,
                         "segment_uuids": sorted(str(t.m_Uuid.AsString()) for t in own)})
    return {"paths": evidence, "errors": errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("keepouts", "dsn", "check"))
    parser.add_argument("board", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--dsn", type=Path)
    args = parser.parse_args()
    import wx
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    paths = load_paths(board)
    if args.mode == "keepouts":
        add_pour_keepouts(board, paths)
        pcbnew.SaveBoard(str(args.output.resolve()), board)
    elif args.mode == "dsn":
        text = args.dsn.read_text()
        # Existing local traces are immutable routing constraints. The keepouts
        # reserve their branches against NEW connections, including same-net
        # ones. They do not replace electrical net identities or native DRC.
        text = text.replace("(type route)", "(type protect)")
        polygons = []
        for path in paths:
            for i, points in enumerate(reservation_polygons(path)):
                coordinates = " ".join(f"{x*1000:.3f} {-y*1000:.3f}" for x,y in points)
                polygons.append(f'    (keepout "{path["name"]}_{i}" (polygon F.Cu 0 {coordinates}))')
        marker = "\n  )\n  (placement"
        if text.count(marker) != 1:
            raise ValueError("Expected exactly one DSN structure/placement boundary")
        text = text.replace(marker, "\n"+"\n".join(polygons)+marker)
        args.output.write_text(text)
    else:
        report = check(board, paths)
        report["board_sha256"] = hashlib.sha256(args.board.read_bytes()).hexdigest()
        report["source_sha256"] = hashlib.sha256(Path("dist/index/circuit.json").read_bytes()).hexdigest()
        report["policy_sha256"] = hashlib.sha256(Path("routing/critical-paths.json").read_bytes()).hexdigest()
        report["checker_sha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        args.output.write_text(json.dumps(report, indent=2)+"\n")
        print(json.dumps(report, indent=2))
        if report["errors"]:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
