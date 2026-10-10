#!/usr/bin/env python3
"""Add outline-conformal GND and V3V3 planes to the routed four-layer PCB."""

from __future__ import annotations

import argparse
from pathlib import Path

import pcbnew
import wx


PLANES = (("GND", pcbnew.In1_Cu), ("V3V3", pcbnew.In2_Cu))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.input))
    outline = pcbnew.SHAPE_POLY_SET()
    if not board.GetBoardPolygonOutlines(outline, False, None, False, False):
        raise SystemExit("Edge.Cuts does not form a valid closed board outline")
    if outline.OutlineCount() != 1:
        raise SystemExit(f"expected one board outline, found {outline.OutlineCount()}")

    net_by_name = {net.GetNetname(): net for net in board.GetNetInfo().NetsByName().values()}
    added: list[dict[str, object]] = []
    for net_name, layer in PLANES:
        net = net_by_name.get(net_name)
        if net is None:
            raise SystemExit(f"missing required plane net: {net_name}")
        zone = pcbnew.ZONE(board)
        zone.SetLayer(layer)
        zone.SetNet(net)
        zone.SetOutline(outline)
        zone.SetLocalClearance(pcbnew.FromMM(0.20))
        zone.SetMinThickness(pcbnew.FromMM(0.15))
        zone.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
        zone.SetThermalReliefGap(pcbnew.FromMM(0.25))
        zone.SetThermalReliefSpokeWidth(pcbnew.FromMM(0.30))
        zone.SetIslandRemovalMode(pcbnew.ISLAND_REMOVAL_MODE_ALWAYS)
        zone.SetAssignedPriority(10 if net_name == "GND" else 9)
        board.Add(zone)
        added.append({"net": net_name, "layer": pcbnew.LayerName(layer)})

    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    board.BuildConnectivity()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(args.output), board)
    print(
        {
            "planes": added,
            "outline_vertices": outline.VertexCount(),
            "unconnected": board.GetConnectivity().GetUnconnectedCount(True),
            "output": str(args.output),
        }
    )


if __name__ == "__main__":
    main()
