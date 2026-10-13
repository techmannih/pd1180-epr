#!/usr/bin/env python3
"""Record the visible final KiCad silkscreen text on both assembly sides."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pcbnew


def text_row(item: pcbnew.PCB_TEXT, owner: str) -> dict[str, object]:
    position = item.GetPosition()
    return {
        "text": item.GetText(),
        "owner": owner,
        "layer": "top" if item.GetLayer() == pcbnew.F_SilkS else "bottom",
        "x_mm": round(pcbnew.ToMM(position.x), 6),
        "y_mm": round(pcbnew.ToMM(position.y), 6),
        "height_mm": round(pcbnew.ToMM(item.GetTextHeight()), 6),
        "width_mm": round(pcbnew.ToMM(item.GetTextWidth()), 6),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("board", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    board = pcbnew.LoadBoard(str(args.board.resolve()))
    labels: list[dict[str, object]] = []
    for drawing in board.GetDrawings():
        if isinstance(drawing, pcbnew.PCB_TEXT) and drawing.GetLayer() in (pcbnew.F_SilkS, pcbnew.B_SilkS):
            labels.append(text_row(drawing, "board"))
    for footprint in board.GetFootprints():
        for field in (footprint.Reference(), footprint.Value()):
            if field.IsVisible() and field.GetLayer() in (pcbnew.F_SilkS, pcbnew.B_SilkS):
                labels.append(text_row(field, footprint.GetReference()))

    labels.sort(key=lambda item: (str(item["layer"]), str(item["text"]), float(item["x_mm"]), float(item["y_mm"])))
    report = {
        "schema_version": 2,
        "source_board": str(args.board),
        "minimum_recorded_text_height_mm": min((row["height_mm"] for row in labels), default=None),
        "labels": labels,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"labels": len(labels), "output": str(args.output)}, indent=2))


if __name__ == "__main__":
    main()
