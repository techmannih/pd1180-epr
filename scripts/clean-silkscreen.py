#!/usr/bin/env python3
"""Keep production silkscreen readable on the dense all-top assembly."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import pcbnew


PASSIVE_REFERENCE = re.compile(r"^(?:R|C|D|L|Y)\d+$")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("board", type=Path)
    args = parser.parse_args()

    board = pcbnew.LoadBoard(str(args.board))
    removed = []
    updated = []
    for drawing in list(board.GetDrawings()):
        if not isinstance(drawing, pcbnew.PCB_TEXT) or drawing.GetLayer() != pcbnew.F_SilkS:
            continue
        text = drawing.GetText().strip()
        if PASSIVE_REFERENCE.fullmatch(text):
            board.Remove(drawing)
            removed.append(text)
        elif "PD1180-EPR r0.2" in text:
            drawing.SetText(text.replace("PD1180-EPR r0.2", "PD1180-EPR r0.3"))
            updated.append(text)
    pcbnew.SaveBoard(str(args.board), board)
    print({"passive_references_removed": len(removed), "version_labels_updated": len(updated)})


if __name__ == "__main__":
    main()
