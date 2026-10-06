#!/usr/bin/env python3
"""Remove generated corridor zones identified as isolated by KiCad DRC."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pcbnew


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("board", type=Path)
    parser.add_argument("drc_json", type=Path)
    args = parser.parse_args()

    report = json.loads(args.drc_json.read_text())
    isolated = {
        item["uuid"]
        for violation in report.get("violations", [])
        if violation.get("type") == "isolated_copper"
        for item in violation.get("items", [])
        if item.get("uuid")
    }
    board = pcbnew.LoadBoard(str(args.board))
    removed = []
    for zone in list(board.Zones()):
        uuid = zone.m_Uuid.AsString()
        if uuid in isolated:
            removed.append((zone.GetNetname(), pcbnew.LayerName(zone.GetLayer()), uuid))
            board.Remove(zone)
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    pcbnew.SaveBoard(str(args.board), board)
    print({"removed": len(removed), "zones": removed})


if __name__ == "__main__":
    main()
