#!/usr/bin/env python3
"""Add clearance-checked short escapes to the two intended internal planes.

Unreachable lands remain in the netlist for the router. This never removes a
connection or changes a net; native DRC and filled-plane connectivity are still
required after routing. Kelvin source lands and branches are reserved.
"""
import argparse
import json
import math
from pathlib import Path
import pcbnew
import wx
from critical_copper import load_paths, check, reservation_polygons, vector, xy, distance_to_segment


def connected_to_through_copper(board, pad):
    if pad.GetDrillSize().x:
        return True
    # KiCad returns the entire connected copper island, including remote vias.
    for item in board.GetConnectivity().GetConnectedItems(pad):
        # Connectivity collections expose vias through the PCB_TRACK base proxy.
        if item.Type() == pcbnew.PCB_VIA_T:
            return True
        if isinstance(item, pcbnew.PAD) and item.GetDrillSize().x:
            return True
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.input.resolve()))
    paths = load_paths(board)
    if check(board, paths)['errors']:
        raise SystemExit('Kelvin input is not isolated')
    excluded = {p['start_pad'].m_Uuid.AsString() for p in paths}
    reservations = []
    for path in paths:
        for polygon in reservation_polygons(path):
            poly = pcbnew.SHAPE_POLY_SET()
            poly.NewOutline()
            for point in polygon:
                q = vector(point)
                poly.Append(q.x, q.y)
            reservations.append(poly)
    pads = [p for fp in board.GetFootprints() for p in fp.Pads()]
    pad_shapes = [(p, p.GetEffectiveShape(pcbnew.F_Cu)) for p in pads if p.IsOnLayer(pcbnew.F_Cu)]
    outline = pcbnew.SHAPE_POLY_SET()
    if not board.GetBoardPolygonOutlines(outline, False, None, False, False):
        raise SystemExit('Invalid board outline')
    boundary = outline.Outline(0)
    vertices = [xy(boundary.CPoint(i)) for i in range(boundary.PointCount())]
    clearance = pcbnew.FromMM(.10)
    added, skipped = [], []
    held = []
    board.BuildConnectivity()
    for pad in pads:
        if pad.GetNetname() not in ('GND', 'V3V3') or not pad.IsOnLayer(pcbnew.F_Cu):
            continue
        if pad.m_Uuid.AsString() in excluded or connected_to_through_copper(board, pad):
            continue
        start = pad.GetPosition()
        cx, cy = xy(start)
        tracks = list(board.GetTracks())
        track_shapes = [(t, t.GetEffectiveShape()) for t in tracks if t.IsOnLayer(pcbnew.F_Cu)]
        candidate = None
        for distance in (.8, 1.0, 1.25, 1.5, 1.75, 2.0):
            for angle in range(0, 360, 45):
                a = math.radians(angle)
                q = vector((cx+distance*math.cos(a), cy+distance*math.sin(a)))
                if not outline.Contains(q) or any(distance_to_segment(xy(q),a,b)<.5 for a,b in zip(vertices,vertices[1:]+vertices[:1])):
                    continue
                route = pcbnew.SHAPE_SEGMENT(start, q, pcbnew.FromMM(.2))
                if any(shape.Collide(q, pcbnew.FromMM(.4)) for _, shape in pad_shapes):
                    continue  # No new via-in-pad exceptions, including on this net.
                if any(p.GetNetCode()!=pad.GetNetCode() and shape.Collide(route, clearance) for p,shape in pad_shapes):
                    continue
                if any(t.GetNetCode()!=pad.GetNetCode() and shape.Collide(route, clearance) for t,shape in track_shapes):
                    continue
                if any(shape.Collide(route, 0) or shape.Collide(q, pcbnew.FromMM(.3)) for shape in reservations):
                    continue
                conflict = False
                for t in tracks:
                    if isinstance(t, pcbnew.PCB_VIA):
                        if t.GetEffectiveShape().Collide(q, pcbnew.FromMM(.4)):
                            conflict=True; break
                    elif t.GetNetCode()!=pad.GetNetCode() and t.GetEffectiveShape().Collide(q, pcbnew.FromMM(.4)):
                        conflict=True; break
                if conflict:
                    continue
                candidate=q
                break
            if candidate is not None:
                break
        reference = pad.GetParentFootprint().GetReference()+'.'+pad.GetNumber()
        if candidate is None:
            skipped.append(reference)
            continue
        via=pcbnew.PCB_VIA(board)
        via.SetPosition(candidate); via.SetWidth(pcbnew.FromMM(.6)); via.SetDrill(pcbnew.FromMM(.3))
        via.SetLayerPair(pcbnew.F_Cu,pcbnew.B_Cu); via.SetNet(pad.GetNet()); board.Add(via)
        track=pcbnew.PCB_TRACK(board)
        track.SetStart(start);track.SetEnd(candidate);track.SetWidth(pcbnew.FromMM(.2))
        track.SetLayer(pcbnew.F_Cu);track.SetNet(pad.GetNet());board.Add(track)
        held.extend([via,track])
        added.append({'pin':reference,'net':pad.GetNetname(),'via_mm':xy(candidate),'escape_mm':math.dist(xy(start),xy(candidate))})
        board.BuildConnectivity()
    errors=check(board,paths)['errors']
    if errors:
        raise SystemExit(f'Plane escape violated Kelvin isolation: {errors}')
    pcbnew.SaveBoard(str(args.output.resolve()),board)
    report={'added':added,'remaining_for_router':skipped,'native_drc_required':True}
    args.output.with_suffix('.escapes.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'added':len(added),'remaining_for_router':skipped}))


if __name__ == '__main__':
    main()
