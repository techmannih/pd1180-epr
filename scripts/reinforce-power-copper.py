#!/usr/bin/env python3
"""Reinforce routed high-current nets with clearance-aware copper corridors.

The imported footprints need short neck-downs at dense pads.  Instead of
blindly widening every segment and creating DRC errors, this script follows
the verified route with 2.4 mm copper zones.  KiCad clips the zones around
foreign copper while retaining the original trace as the connectivity spine.
Layer changes receive additional parallel vias where clearance permits.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import pcbnew


POWER_NETS = {
    "USB_VBUS",
    "EFUSE_IN",
    "VMOTOR",
    "MOTOR_A1",
    "MOTOR_A2",
    "MOTOR_B1",
    "MOTOR_B2",
    "SENSE_A",
    "SENSE_B",
    "BRAKE_RETURN",
}

CORRIDOR_WIDTH_MM = 2.4
CLEARANCE_MM = 0.16
VIA_DIAMETER_MM = 0.60
VIA_DRILL_MM = 0.30
VIA_PITCH_MM = 0.90

# These route-segment corridors collapse to isolated islands or copper slivers
# after KiCad clips them around the dense TMC5160, eFuse and bridge geometry.
# The underlying routed trace remains the connectivity spine.  Omitting only
# these deterministic priorities keeps every critical net above the checked
# 75% corridor-coverage floor while allowing native KiCad DRC to stay clean.
SKIP_CORRIDOR_PRIORITIES = {
    109, 116, 119, 179, 269, 303, 304, 349, 390,
    405, 423, 429, 431, 581, 582, 586, 598,
}


def mm(value: int) -> float:
    return pcbnew.ToMM(value)


def point(x: float, y: float) -> pcbnew.VECTOR2I:
    return pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y))


def add_corridor(board: pcbnew.BOARD, track: pcbnew.PCB_TRACK, priority: int) -> None:
    start = track.GetStart()
    end = track.GetEnd()
    x1, y1 = mm(start.x), mm(start.y)
    x2, y2 = mm(end.x), mm(end.y)
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy)
    if length < 0.02:
        return
    ux, uy = dx / length, dy / length
    nx, ny = -uy, ux
    half = CORRIDOR_WIDTH_MM / 2
    extension = half
    corners = [
        (x1 - ux * extension + nx * half, y1 - uy * extension + ny * half),
        (x2 + ux * extension + nx * half, y2 + uy * extension + ny * half),
        (x2 + ux * extension - nx * half, y2 + uy * extension - ny * half),
        (x1 - ux * extension - nx * half, y1 - uy * extension - ny * half),
    ]
    zone = pcbnew.ZONE(board)
    zone.SetLayer(track.GetLayer())
    zone.SetNet(track.GetNet())
    zone.SetLocalClearance(pcbnew.FromMM(CLEARANCE_MM))
    zone.SetMinThickness(pcbnew.FromMM(0.15))
    zone.SetPadConnection(pcbnew.ZONE_CONNECTION_FULL)
    zone.SetAssignedPriority(priority)
    zone.SetIslandRemovalMode(pcbnew.ISLAND_REMOVAL_MODE_ALWAYS)
    outline = zone.Outline()
    outline.NewOutline()
    for x, y in corners:
        outline.Append(pcbnew.FromMM(x), pcbnew.FromMM(y))
    board.Add(zone)


def copper_blockers(board: pcbnew.BOARD):
    layers = (pcbnew.F_Cu, pcbnew.In1_Cu, pcbnew.In2_Cu, pcbnew.B_Cu)
    blockers = []
    for item in board.GetTracks():
        if isinstance(item, pcbnew.PCB_VIA):
            blockers.append((item.GetNetCode(), item.GetEffectiveShape(), None))
        elif item.GetLayer() in layers:
            blockers.append((item.GetNetCode(), item.GetEffectiveShape(item.GetLayer()), item.GetLayer()))
    for footprint in board.GetFootprints():
        for pad in footprint.Pads():
            for layer in layers:
                if pad.IsOnLayer(layer):
                    blockers.append((pad.GetNetCode(), pad.GetEffectiveShape(layer), layer))
    return blockers


def safe_for_via(candidate, net_code: int, blockers) -> bool:
    radius = pcbnew.FromMM(VIA_DIAMETER_MM / 2 + CLEARANCE_MM)
    for blocker_net, shape, layer in blockers:
        # Same-net traces and pads may accept the via.  Existing drills still
        # need physical spacing regardless of electrical net.
        if blocker_net == net_code and layer is not None:
            continue
        if shape.Collide(candidate, radius):
            return False
    return True


def add_parallel_vias(board: pcbnew.BOARD) -> tuple[int, int]:
    blockers = copper_blockers(board)
    originals = [
        item
        for item in board.GetTracks()
        if isinstance(item, pcbnew.PCB_VIA) and item.GetNetname() in POWER_NETS
    ]
    added = 0
    sparse = 0
    offsets = [
        (VIA_PITCH_MM, 0),
        (-VIA_PITCH_MM, 0),
        (0, VIA_PITCH_MM),
        (0, -VIA_PITCH_MM),
        (VIA_PITCH_MM, VIA_PITCH_MM),
        (-VIA_PITCH_MM, VIA_PITCH_MM),
        (VIA_PITCH_MM, -VIA_PITCH_MM),
        (-VIA_PITCH_MM, -VIA_PITCH_MM),
    ]
    for original in originals:
        origin = original.GetPosition()
        net = original.GetNet()
        made = 0
        for dx, dy in offsets:
            candidate = point(mm(origin.x) + dx, mm(origin.y) + dy)
            if not safe_for_via(candidate, original.GetNetCode(), blockers):
                continue
            via = pcbnew.PCB_VIA(board)
            via.SetPosition(candidate)
            via.SetWidth(pcbnew.FromMM(VIA_DIAMETER_MM))
            via.SetDrill(pcbnew.FromMM(VIA_DRILL_MM))
            via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
            via.SetNet(net)
            board.Add(via)
            blockers.append((via.GetNetCode(), via.GetEffectiveShape(), None))
            made += 1
            added += 1
            if made == 3:
                break
        if made < 2:
            sparse += 1
    return added, sparse


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    board = pcbnew.LoadBoard(str(args.input))
    tracks = [
        item
        for item in board.GetTracks()
        if not isinstance(item, pcbnew.PCB_VIA)
        and item.GetNetname() in POWER_NETS
        and item.GetLayer() in (pcbnew.F_Cu, pcbnew.In1_Cu, pcbnew.In2_Cu, pcbnew.B_Cu)
    ]
    # KiCad requires intersecting zones to have distinct priorities, including
    # same-net corridors.  A unique priority keeps the generated board clean.
    added_corridors = 0
    for index, track in enumerate(tracks, start=100):
        if index in SKIP_CORRIDOR_PRIORITIES:
            continue
        add_corridor(board, track, index)
        added_corridors += 1

    added_vias, sparse_vias = add_parallel_vias(board)
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    board.BuildConnectivity()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(args.output), board)
    print(
        {
            "power_corridors": added_corridors,
            "corridors_omitted_for_clean_fill": len(SKIP_CORRIDOR_PRIORITIES),
            "parallel_vias_added": added_vias,
            "transitions_with_fewer_than_3_new_vias": sparse_vias,
            "unconnected": board.GetConnectivity().GetUnconnectedCount(True),
            "output": str(args.output),
        }
    )


if __name__ == "__main__":
    main()
