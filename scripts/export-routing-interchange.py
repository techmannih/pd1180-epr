#!/usr/bin/env python3
"""Export world-aligned pad geometry for Specctra routing without changing CAD placement."""

import argparse
import hashlib
import json
from pathlib import Path

import pcbnew
import wx


def pad_geometry(board):
    return sorted(
        (fp.GetReference(), pad.GetNumber(), pad.GetPosition().x,
         pad.GetPosition().y, pad.GetOrientationDegrees(), pad.GetLayerSet().FmtHex(),
         pad.GetNetname())
        for fp in board.GetFootprints() for pad in fp.Pads()
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("board", type=Path)
    parser.add_argument("output_directory", type=Path)
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    if board is None:
        raise SystemExit("Cannot load source PCB")
    args.output_directory.mkdir(parents=True, exist_ok=True)
    held = []
    references = set()
    for index, fp in enumerate(board.GetFootprints()):
        if not fp.GetReference():
            fp.SetReference(f"ROUTING_HOLE_{index}")
        if fp.GetReference() in references:
            raise SystemExit(f"Duplicate reference: {fp.GetReference()}")
        references.add(fp.GetReference())
    before = pad_geometry(board)
    for fp in board.GetFootprints():
        pads = list(fp.Pads())
        held.extend(pads)
        geometry = [(p, p.GetPosition(), p.GetOrientationDegrees(), p.GetLayerSet()) for p in pads]
        # The routing copy uses unique, unrotated package images. Bottom pads
        # remain explicitly on B.Cu; their actual locations and shapes are kept.
        fp.SetOrientationDegrees(0)
        fp.SetLayer(pcbnew.F_Cu)
        fp.SetFPID(pcbnew.LIB_ID("", fp.GetReference() + "_routing"))
        for pad, position, angle, layers in geometry:
            pad.SetPosition(position)
            pad.SetOrientationDegrees(angle)
            pad.SetLayerSet(layers)
    if pad_geometry(board) != before:
        raise SystemExit("Routing normalization changed pad geometry or net identity")
    pcb_path = args.output_directory / "routing-base.kicad_pcb"
    dsn_path = args.output_directory / "routing-input.dsn"
    pcbnew.SaveBoard(str(pcb_path.resolve()), board)
    if not pcbnew.ExportSpecctraDSN(board, str(dsn_path.resolve())):
        raise SystemExit("Specctra export failed")
    report = {
        "source": str(args.board),
        "source_sha256": hashlib.sha256(args.board.read_bytes()).hexdigest(),
        "pads_verified": len(before),
        "pad_geometry_unchanged": True,
        "bottom_rotation_compensation_required": False,
        "import_method": "import-routing-copper.py; never import routing-copy placement",
    }
    (args.output_directory / "interchange.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
