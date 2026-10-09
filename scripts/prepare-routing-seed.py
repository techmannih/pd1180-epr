#!/usr/bin/env python3
"""Add the reviewed thermal arrays and local capacitor ground returns before routing."""

import argparse
import json
import math
from pathlib import Path

import pcbnew
import wx


def point(x, y):
    return pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y))


def coordinates(position):
    return pcbnew.ToMM(position.x), pcbnew.ToMM(position.y)


def add_via(board, position, net):
    via = pcbnew.PCB_VIA(board)
    via.SetPosition(position)
    via.SetWidth(pcbnew.FromMM(0.6))
    via.SetDrill(pcbnew.FromMM(0.3))
    via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
    via.SetNet(net)
    board.Add(via)


def add_track(board, start, end, net, layer, width):
    track = pcbnew.PCB_TRACK(board)
    track.SetStart(start)
    track.SetEnd(end)
    track.SetWidth(pcbnew.FromMM(width))
    track.SetLayer(layer)
    track.SetNet(net)
    board.Add(track)


def via_clear(board, candidate, pad):
    layers = (pcbnew.F_Cu, pcbnew.In1_Cu, pcbnew.In2_Cu, pcbnew.B_Cu)
    clearance_radius = pcbnew.FromMM(0.3 + 0.16)
    for footprint in board.GetFootprints():
        for other in footprint.Pads():
            if other.GetNetCode() == pad.GetNetCode():
                continue
            for layer in layers:
                if other.IsOnLayer(layer) and other.GetEffectiveShape(layer).Collide(candidate, clearance_radius):
                    return False
    for track in board.GetTracks():
        if track.GetNetCode() == pad.GetNetCode() and not isinstance(track, pcbnew.PCB_VIA):
            continue
        if track.GetEffectiveShape().Collide(candidate, clearance_radius):
            return False
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.source.resolve()))
    if any(isinstance(track, pcbnew.PCB_VIA) for track in board.GetTracks()):
        raise SystemExit("Use a fresh top-side source export; this command is not additive to an existing route")
    footprints = {fp.GetReference(): fp for fp in board.GetFootprints()}
    policy = json.loads(Path("board-standards.json").read_text())["fabrication"]["thermal_via_in_pad"]
    thermal = []
    for reference in policy["references"]:
        pad = next(p for p in footprints[reference].Pads() if p.GetNumber() == policy["pad_number"])
        x, y = coordinates(pad.GetPosition())
        corners = [(x - 0.5, y - 0.5), (x + 0.5, y - 0.5), (x + 0.5, y + 0.5), (x - 0.5, y + 0.5)]
        shape = pad.GetEffectiveShape(pcbnew.F_Cu)
        for vx, vy in corners:
            if not all(shape.Collide(point(vx + dx, vy + dy), 0)
                       for dx, dy in ((-0.3, 0), (0.3, 0), (0, -0.3), (0, 0.3))):
                raise SystemExit(f"{reference}: thermal via does not fit within drain pad")
            add_via(board, point(vx, vy), pad.GetNet())
            thermal.append({"reference": reference, "net": pad.GetNetname(), "x": vx, "y": vy})
        for start, end in zip(corners, corners[1:] + corners[:1]):
            add_track(board, point(*start), point(*end), pad.GetNet(), pcbnew.B_Cu, 0.25)

    # Include the two buck-controller internal VCC bypass capacitors as well as
    # the separately constrained input/supply bypasses in the source design.
    capacitors = [pair[2] for pair in json.loads(Path("docs/decoupling-targets.json").read_text())] + ["C13", "C64"]
    returns = []
    for reference in capacitors:
        footprint = footprints[reference]
        if footprint.GetLayer() != pcbnew.F_Cu:
            raise SystemExit(f"{reference}: expected top-side capacitor")
        pad = next(p for p in footprint.Pads() if p.GetNumber() == "2")
        if pad.GetNetname() != "GND":
            raise SystemExit(f"{reference}: pin 2 is not the expected ground return")
        x, y = coordinates(pad.GetPosition())
        cx, cy = coordinates(footprint.GetPosition())
        angle = math.atan2(y - cy, x - cx)
        candidate = None
        for distance in (0.9, 1.1, 1.3, 1.5):
            for delta in (0, math.pi / 4, -math.pi / 4, math.pi / 2, -math.pi / 2):
                proposed = point(x + distance * math.cos(angle + delta), y + distance * math.sin(angle + delta))
                # Keep the return via outside the capacitor solderable land.
                if pad.GetEffectiveShape(pcbnew.F_Cu).Collide(proposed, pcbnew.FromMM(0.4)):
                    continue
                if via_clear(board, proposed, pad):
                    candidate = proposed
                    break
            if candidate is not None:
                break
        if candidate is None:
            raise SystemExit(f"{reference}: no clear local ground-return via position")
        add_via(board, candidate, pad.GetNet())
        add_track(board, pad.GetPosition(), candidate, pad.GetNet(), pcbnew.F_Cu, 0.2)
        returns.append({"reference": reference, "via": coordinates(candidate), "length_mm": math.dist((x, y), coordinates(candidate))})

    # Full-board planes are regenerated on the final routed board. Native DRC
    # must check every short escape and the completed connections to the planes.
    for zone in list(board.Zones()):
        board.Remove(zone)
    board.BuildConnectivity()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(args.output.resolve()), board)
    report = {"thermal_vias": thermal, "capacitor_ground_returns": returns, "native_drc_still_required": True}
    args.output.with_suffix(".seed.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Added {len(thermal)} thermal vias and {len(returns)} local capacitor ground returns")


if __name__ == "__main__":
    main()
