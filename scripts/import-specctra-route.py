#!/usr/bin/env python3
"""Import a freerouting SES file into the matching KiCad PCB."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import tempfile

import pcbnew
import wx


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("board", type=Path)
    parser.add_argument("session", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument(
        "--restore-bottom-rotation",
        action="store_true",
        help=(
            "restore the 180 degree bottom-placement convention after routing a "
            "DSN prepared by prepare-r03-dsn.py"
        ),
    )
    args = parser.parse_args()

    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    import_session = args.session.resolve()
    restored_bottom_placements = 0
    temporary_session: Path | None = None
    if args.restore_bottom_rotation:
        data = import_session.read_text()

        def restore_bottom_rotation(match: re.Match[str]) -> str:
            nonlocal restored_bottom_placements
            restored_bottom_placements += 1
            angle = (float(match.group("angle")) + 180.0) % 360.0
            angle_text = str(int(angle)) if angle.is_integer() else str(angle)
            return f'{match.group("prefix")}{angle_text}'

        data = re.sub(
            r'(?P<prefix>\(place\s+[^\s]+\s+[-.0-9]+\s+[-.0-9]+\s+back\s+)'
            r'(?P<angle>[-.0-9]+)',
            restore_bottom_rotation,
            data,
        )
        if restored_bottom_placements == 0:
            raise SystemExit("no bottom-side placements found in Specctra session")
        handle = tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".ses",
            prefix="pd1180-import-",
            dir=args.output.resolve().parent,
            delete=False,
        )
        handle.write(data)
        handle.close()
        temporary_session = Path(handle.name)
        import_session = temporary_session

    try:
        if not pcbnew.ImportSpecctraSES(board, str(import_session)):
            raise SystemExit("Specctra SES import failed")
    finally:
        if temporary_session is not None:
            temporary_session.unlink(missing_ok=True)
    board.BuildConnectivity()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(args.output.resolve()), board)

    report = {
        "board": str(args.output.resolve()),
        "footprints": len(board.GetFootprints()),
        "pads": len(board.GetPads()),
        "tracks_and_vias": len(board.GetTracks()),
        "unconnected_count": board.GetConnectivity().GetUnconnectedCount(True),
        "restored_bottom_placements": restored_bottom_placements,
    }
    if args.report:
        args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
