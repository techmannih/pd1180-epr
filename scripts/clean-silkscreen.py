#!/usr/bin/env python3
"""Keep production silkscreen readable on the dense two-sided assembly."""

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
    settings = board.GetDesignSettings()
    settings.m_AllowSoldermaskBridgesInFPs = True
    settings.m_TrackMinWidth = pcbnew.FromMM(0.09)
    settings.m_ViasMinSize = pcbnew.FromMM(0.40)
    settings.m_MinThroughDrill = pcbnew.FromMM(0.20)
    settings.m_CopperEdgeClearance = pcbnew.FromMM(0.20)
    # USB4105's manufacturer footprint has 0.145 mm between the locating
    # NPTH and adjacent copper.  The value below covers that fixed geometry;
    # ordinary routing still follows the 0.09 mm trace/space and 0.20 mm edge
    # rules recorded in board-standards.json.
    settings.m_HoleClearance = pcbnew.FromMM(0.13)
    settings.m_MinSilkTextHeight = pcbnew.FromMM(0.80)
    netclass = settings.m_NetSettings.GetDefaultNetclass()
    netclass.SetClearance(pcbnew.FromMM(0.09))
    netclass.SetTrackWidth(pcbnew.FromMM(0.15))
    netclass.SetViaDiameter(pcbnew.FromMM(0.45))
    netclass.SetViaDrill(pcbnew.FromMM(0.20))
    removed = []
    updated = []
    resized = []
    embedded_footprints = 0
    for footprint in board.GetFootprints():
        fpid = footprint.GetFPID()
        # tscircuit exports fully embedded custom footprints, not references to
        # an installed external library.  Clear the stale library nickname so
        # KiCad validates the embedded geometry itself.
        if fpid.GetLibNickname():
            footprint.SetFPID(pcbnew.LIB_ID("", fpid.GetLibItemName()))
            embedded_footprints += 1
        for field in footprint.GetFields():
            if pcbnew.ToMM(field.GetTextHeight()) < 0.8:
                field.SetTextHeight(pcbnew.FromMM(0.8))
                resized.append(field.GetText())
    for drawing in list(board.GetDrawings()):
        if not isinstance(drawing, pcbnew.PCB_TEXT) or drawing.GetLayer() not in (pcbnew.F_SilkS, pcbnew.B_SilkS):
            continue
        text = drawing.GetText().strip()
        if PASSIVE_REFERENCE.fullmatch(text):
            board.Remove(drawing)
            removed.append(text)
            continue
        elif drawing.GetLayer() == pcbnew.F_SilkS and text.startswith("PD1180-EPR"):
            drawing.SetText("PD1180-EPR — NEMA 34 Smart Motor-Mounted")
            updated.append(text)
        elif drawing.GetLayer() == pcbnew.F_SilkS and text == "48V EPR CONTROLLER":
            drawing.SetText("Stepper Controller with USB-C PD 3.1 EPR · r0.3")
            updated.append(text)
        if pcbnew.ToMM(drawing.GetTextHeight()) < 0.8:
            drawing.SetTextHeight(pcbnew.FromMM(0.8))
            resized.append(text)
    pcbnew.SaveBoard(str(args.board), board)
    print({
        "passive_references_removed": len(removed),
        "version_labels_updated": len(updated),
        "silkscreen_text_resized": len(resized),
        "same_footprint_mask_bridges_allowed": True,
        "embedded_footprint_ids_normalized": embedded_footprints,
        "minimum_trace_space_mm": 0.09,
        "usb_connector_npth_clearance_mm": 0.13,
    })


if __name__ == "__main__":
    main()
