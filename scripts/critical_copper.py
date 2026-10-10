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
import re
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


def reservation_pieces(path, margin=.04):
    # Subtract the receiving terminal's box so load copper can reach the shunt.
    box = path["end_pad"].GetBoundingBox()
    lo, hi = xy(box.GetPosition()), xy(box.GetEnd())
    start_box = path["start_pad"].GetBoundingBox()
    start_lo, start_hi = xy(start_box.GetPosition()), xy(start_box.GetEnd())
    polygons = [[(start_lo[0]-margin, start_lo[1]-margin), (start_hi[0]+margin, start_lo[1]-margin),
                 (start_hi[0]+margin, start_hi[1]+margin), (start_lo[0]-margin, start_hi[1]+margin)]]
    for a, b in path["segments"]:
        length = math.dist(a, b)
        ux, uy = (b[0]-a[0])/length, (b[1]-a[1])/length
        radius = path["width"]/2 + margin
        polygons.append([(a[0]-ux*radius-uy*radius,a[1]-uy*radius+ux*radius),
                         (b[0]+ux*radius-uy*radius,b[1]+uy*radius+ux*radius),
                         (b[0]+ux*radius+uy*radius,b[1]+uy*radius-ux*radius),
                         (a[0]-ux*radius+uy*radius,a[1]-uy*radius-ux*radius)])
    for poly in polygons:
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


def reservation_polygons(path, margin=.04):
    # Merge overlapping segment buffers into one continuous reservation. The
    # router otherwise treats each tiny overlap as another obstacle boundary.
    merged = pcbnew.SHAPE_POLY_SET()
    for points in reservation_pieces(path, margin):
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
        own = [t for t in copper if is_branch_track(t, [path])]
        other = [t for t in copper if t.GetNetname() == path["net"] and t not in own and (isinstance(t, pcbnew.PCB_VIA) or t.GetLayer() == pcbnew.F_Cu)]
        others = [(t, t.GetEffectiveShape(pcbnew.F_Cu)) for t in other]
        others += [(p, p.GetEffectiveShape(pcbnew.F_Cu)) for p in pads if p.GetNetname() == path["net"] and p.IsOnLayer(pcbnew.F_Cu) and p.m_Uuid not in (path["start_pad"].m_Uuid, path["end_pad"].m_Uuid)]
        zones = [z.GetFilledPolysList(pcbnew.F_Cu) for z in board.Zones() if not z.GetIsRuleArea() and z.IsOnLayer(pcbnew.F_Cu) and z.GetNetname() == path["net"]]
        missing, joined = False, False
        # Evaluate the actual overlap outside the receiving pad. Sampling a
        # trace-radius disk just outside that pad falsely rejects a legitimate
        # pour-to-trace junction whose overlap lies wholly inside the pad.
        branch = pcbnew.SHAPE_POLY_SET()
        for item in [path["start_pad"], *own]:
            polygon = pcbnew.SHAPE_POLY_SET()
            item.TransformShapeToPolygon(polygon, pcbnew.F_Cu, 0, 1, pcbnew.ERROR_INSIDE)
            branch.BooleanAdd(polygon)
        receiving_pad = pcbnew.SHAPE_POLY_SET()
        path["end_pad"].TransformShapeToPolygon(receiving_pad, pcbnew.F_Cu, 0, 1, pcbnew.ERROR_INSIDE)
        branch.BooleanSubtract(receiving_pad)
        def overlaps_branch(polygon):
            intersection = pcbnew.SHAPE_POLY_SET(branch)
            intersection.BooleanIntersection(polygon)
            return intersection.OutlineCount() > 0
        for item, shape in others:
            if not branch.Collide(shape, 0):
                continue
            polygon = pcbnew.SHAPE_POLY_SET()
            item.TransformShapeToPolygon(polygon, pcbnew.F_Cu, 0, 1, pcbnew.ERROR_INSIDE)
            if overlaps_branch(polygon):
                joined = True
        if any(overlaps_branch(zone) for zone in zones):
            joined = True
        for a, b in path["segments"]:
            for p in samples(a, b):
                if not any(distance_to_segment(p, xy(t.GetStart()), xy(t.GetEnd())) < 0.002 for t in own):
                    missing = True
        if missing:
            errors.append(f'{path["name"]}: source copper was removed or moved')
        if joined:
            errors.append(f'{path["name"]}: another conductor/plane joins before the receiving terminal')
        evidence.append({"name": path["name"], "net": path["net"], "length_mm": round(sum(math.dist(a,b) for a,b in path["segments"]),3), "via_count": 0,
                         "path_preserved": not missing, "terminal_only_join": not joined,
                         "segment_uuids": sorted(str(t.m_Uuid.AsString()) for t in own)})
    return {"paths": evidence, "errors": errors}


def reserve_completed_branches(text, paths):
    """Export completed sense branches as routing obstacles, not destinations.

    Only the disposable DSN loses these already-connected IC pins/tracks.
    The native board retains them; copper import explicitly restores them,
    followed by full native connectivity/DRC and terminal-only join checks.
    Keeping both a branch and its keepout in DSN makes the router input violate
    its own obstacle rules and can prevent convergence.
    """
    removed = {path["name"]: 0 for path in paths}
    wire = re.compile(r"\(wire \(path F\.Cu ([0-9.]+)\s+([^()]+)\)\(net ([^()]+)\)\(type (?:route|protect)\)\)")
    def replace_wire(match):
        width, coords, net = match.groups()
        values = [float(v)/1000 for v in coords.split()]
        points = list(zip(values[0::2], [-v for v in values[1::2]]))
        if len(points) < 2 or len(values) % 2:
            raise ValueError("Invalid DSN wire")
        for path in paths:
            if net != path["net"] or abs(float(width)/1000-path["width"]) > .001:
                continue
            if all(any(distance_to_segment(a,s,e)<.001 and distance_to_segment(b,s,e)<.001
                       for s,e in path["segments"]) for a,b in zip(points,points[1:])):
                removed[path["name"]] += 1
                return ""
        return match.group()
    text = wire.sub(replace_wire, text)
    references = {}
    for path in paths:
        if not removed[path["name"]]:
            raise ValueError(f'{path["name"]}: no completed DSN copper found')
        reference, number = path["from"]
        references.setdefault(reference, set()).add(number)
    for reference, numbers in references.items():
        # KiCad may deduplicate identical footprint images, even with unique
        # FPIDs. Clone this instance's image before editing its destinations.
        component = next((m for m in re.finditer(r"    \(component (\S+)\n[\s\S]*?\n    \)", text)
                          if re.search(r"\(place " + re.escape(reference) + r" ", m.group())), None)
        if component is None:
            raise ValueError(f"Missing routing placement: {reference}")
        image_name = component.group(1)
        image = re.search(r"    \(image " + re.escape(image_name) + r"\n[\s\S]*?\n    \)", text)
        if not image:
            raise ValueError(f"Missing routing image: {image_name}")
        unique_name = reference + "_critical_reserved"
        replacement = image.group().replace("(image " + image_name, "(image " + unique_name, 1)
        for number in numbers:
            pattern = r"      \(pin [^\n]+ (?:\(rotate [^()]+\) )?" + re.escape(number) + r" [-0-9.]+ [-0-9.]+\)\n"
            replacement, count = re.subn(pattern, "", replacement)
            if count != 1:
                raise ValueError(f"Expected one routing pad for {reference}.{number}, got {count}")
        text = text[:image.end()] + "\n" + replacement + text[image.end():]
        # Image insertion is after placement, so component offsets remain valid.
        placement = re.search(r"      \(place " + re.escape(reference) + r" [^\n]+", component.group()).group()
        remainder = component.group().replace(placement + "\n", "")
        if "(place " not in remainder:
            remainder = ""
        new_component = "    (component " + unique_name + "\n" + placement + "\n    )"
        text = text[:component.start()] + remainder + "\n" + new_component + text[component.end():]
        for number in numbers:
            count = 0
            def replace_pins(match):
                nonlocal count
                pins = match.group(1).split()
                item = f"{reference}-{number}"
                count += pins.count(item)
                return "(pins " + " ".join(pin for pin in pins if pin != item) + ")"
            text = re.sub(r"\(pins ([^()]*)\)", replace_pins, text)
            if count != 1:
                raise ValueError(f"Expected one connected destination for {reference}.{number}, got {count}")
    return text, removed


def protect_seed_copper(text, seed_board):
    """Keep source constraints fixed while allowing an incomplete route to move."""
    seed_tracks = list(seed_board.GetTracks())
    wires = [t for t in seed_tracks if t.Type() == pcbnew.PCB_TRACE_T]
    vias = [t for t in seed_tracks if t.Type() == pcbnew.PCB_VIA_T]
    def wire(match):
        layer, width, coordinates, net = match.groups()
        values = [float(v)/1000 for v in coordinates.split()]
        points = list(zip(values[0::2], [-v for v in values[1::2]]))
        candidates = [t for t in wires if t.GetNetname() == net
                      and pcbnew.LayerName(t.GetLayer()) == layer
                      and abs(pcbnew.ToMM(t.GetWidth())-float(width)/1000) < .001]
        fixed = all(any(distance_to_segment(a,xy(t.GetStart()),xy(t.GetEnd())) < .001
                        and distance_to_segment(b,xy(t.GetStart()),xy(t.GetEnd())) < .001
                        for t in candidates) for a,b in zip(points,points[1:]))
        return match.group().replace('(type route)', '(type protect)') if fixed else match.group()
    text = re.sub(r'\(wire \(path (\S+) ([0-9.]+)\s+([^()]+)\)\(net ([^()]+)\)\(type route\)\)', wire, text)
    def via(match):
        x, y, net = match.groups()
        fixed = any(t.GetNetname() == net and math.dist(xy(t.GetPosition()),
                    (float(x)/1000,-float(y)/1000)) < .001 for t in vias)
        return match.group().replace('(type route)', '(type protect)') if fixed else match.group()
    return re.sub(r'\(via "[^"]+"\s+([-0-9.]+) ([-0-9.]+) \(net ([^()]+)\)\(type route\)\)', via, text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("keepouts", "dsn", "check"))
    parser.add_argument("board", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--dsn", type=Path)
    parser.add_argument("--fixed-board", type=Path,
                        help="During incremental routing, fix only copper from this seed PCB")
    args = parser.parse_args()
    import wx
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    paths = load_paths(board)
    if args.mode == "keepouts":
        add_pour_keepouts(board, paths)
        pcbnew.SaveBoard(str(args.output.resolve()), board)
    elif args.mode == "dsn":
        problems = check(board, paths)["errors"]
        if problems:
            raise ValueError(f"Cannot reserve incomplete or already-joined paths: {problems}")
        text, removed = reserve_completed_branches(args.dsn.read_text(), paths)
        # Existing local traces are immutable routing constraints. The keepouts
        # reserve their branches against NEW connections, including same-net
        # ones. They do not replace electrical net identities or native DRC.
        if args.fixed_board:
            seed = pcbnew.LoadBoard(str(args.fixed_board.resolve()))
            text = protect_seed_copper(text, seed)
        else:
            text = text.replace("(type route)", "(type protect)")
        polygons = []
        for path in paths:
            for i, points in enumerate(reservation_polygons(path, margin=0)):
                coordinates = " ".join(f"{x*1000:.3f} {-y*1000:.3f}" for x,y in points)
                polygons.append(f'    (keepout "{path["name"]}_{i}" (polygon F.Cu 0 {coordinates}))')
        marker = "\n  )\n  (placement"
        if text.count(marker) != 1:
            raise ValueError("Expected exactly one DSN structure/placement boundary")
        text = text.replace(marker, "\n"+"\n".join(polygons)+marker)
        args.output.write_text(text)
        args.output.with_suffix(".critical.json").write_text(json.dumps({
            "native_board_sha256": hashlib.sha256(args.board.read_bytes()).hexdigest(),
            "fixed_seed_sha256": hashlib.sha256(args.fixed_board.read_bytes()).hexdigest() if args.fixed_board else None,
            "reserved_completed_segments": removed,
            "import_requires_critical_branch_restoration": True,
        }, indent=2)+"\n")
    else:
        report = check(board, paths)
        report["board_sha256"] = hashlib.sha256(args.board.read_bytes()).hexdigest()
        import subprocess
        report["source_sha256"] = subprocess.check_output(
            ["bun", "scripts/circuit-source-hash.mjs", "dist/index/circuit.json"], text=True).strip()
        report["source_hasher_sha256"] = hashlib.sha256(Path("scripts/circuit-source-hash.mjs").read_bytes()).hexdigest()
        report["policy_sha256"] = hashlib.sha256(Path("routing/critical-paths.json").read_bytes()).hexdigest()
        report["checker_sha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        args.output.write_text(json.dumps(report, indent=2)+"\n")
        print(json.dumps(report, indent=2))
        if report["errors"]:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
