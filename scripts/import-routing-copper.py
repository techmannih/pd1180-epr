#!/usr/bin/env python3
"""Import SES copper from a world-aligned routing copy, preserving original footprints."""

import argparse
import json
from pathlib import Path

import pcbnew
import wx
from critical_copper import load_paths, is_branch_track, check


def pad_geometry(board):
    return sorted(
        (fp.GetReference(), pad.GetNumber(), pad.GetPosition().x,
         pad.GetPosition().y, pad.GetOrientationDegrees(), pad.GetLayerSet().FmtHex(),
         pad.GetNetname())
        for fp in board.GetFootprints() for pad in fp.Pads()
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("original_board", type=Path)
    parser.add_argument("routing_base", type=Path)
    parser.add_argument("session", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--restore-critical-branches", action="store_true")
    args = parser.parse_args()
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(args.original_board.resolve()))
    routed = pcbnew.LoadBoard(str(args.routing_base.resolve()))
    if board is None or routed is None:
        raise SystemExit("Cannot load original PCB or routing copy")
    original_pads, routing_pads = pad_geometry(board), pad_geometry(routed)
    if not pcbnew.ImportSpecctraSES(routed, str(args.session.resolve())):
        raise SystemExit("Specctra session import failed")
    after_routing = pad_geometry(routed)
    # Specctra's 0.1 um grid rounds package translations by up to 100 nm.
    # Allow only 100 nm in this disposable routing copy; original pads stay exact.
    mismatches = [(a, z) for a, z in zip(routing_pads, after_routing)
                  if a[:2] != z[:2] or a[4:] != z[4:]
                  or abs(a[2] - z[2]) > 100 or abs(a[3] - z[3]) > 100]
    if len(routing_pads) != len(after_routing):
        raise SystemExit("Router changed the pad count")
    if mismatches:
        print(json.dumps({"routing_pad_differences": mismatches[:8]}, indent=2))
        raise SystemExit("Router changed footprint placement or pin identity")
    paths = load_paths(board) if args.restore_critical_branches else []
    if paths and check(board, paths)["errors"]:
        raise SystemExit("Original critical copper is incomplete or already has premature joins")
    preserved = [t for t in board.GetTracks() if is_branch_track(t, paths)]
    held = list(board.GetTracks())
    for track in held:
        board.Remove(track)
    routed_tracks = list(routed.GetTracks())
    if args.restore_critical_branches:
        # SES contains routes around the reservations; native source provides
        # the completed branches. Reject duplicates instead of overlapping them.
        if any(is_branch_track(t, paths) for t in routed_tracks):
            raise SystemExit("SES unexpectedly contains reserved critical copper")
        routed_tracks.extend(preserved)
    held.extend(routed_tracks)
    for track in routed_tracks:
        net = board.FindNet(track.GetNetname())
        if net is None:
            raise SystemExit(f"Unknown routed net: {track.GetNetname()}")
        if isinstance(track, pcbnew.PCB_VIA):
            item = pcbnew.PCB_VIA(board)
            item.SetPosition(track.GetPosition())
            item.SetWidth(track.GetWidth(pcbnew.F_Cu))
            item.SetDrill(track.GetDrillValue())
            item.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        elif type(track) is pcbnew.PCB_TRACK:
            item = pcbnew.PCB_TRACK(board)
            item.SetStart(track.GetStart())
            item.SetEnd(track.GetEnd())
            item.SetWidth(track.GetWidth())
            item.SetLayer(track.GetLayer())
        else:
            raise SystemExit(f"Unsupported routed copper type: {type(track).__name__}")
        item.SetNet(net)
        board.Add(item)
        held.append(item)
    if pad_geometry(board) != original_pads:
        raise SystemExit("Copper import changed the original footprint geometry")
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    board.BuildConnectivity()
    if paths:
        problems = check(board, paths)["errors"]
        if problems:
            raise SystemExit(f"Imported routing violated terminal-only joins: {problems}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(args.output.resolve()), board)
    print(json.dumps({
        "original_pads_preserved": len(original_pads),
        "tracks_and_vias": len(board.GetTracks()),
        "unconnected": board.GetConnectivity().GetUnconnectedCount(True),
        "native_drc_still_required": True,
    }, indent=2))


if __name__ == "__main__":
    main()
