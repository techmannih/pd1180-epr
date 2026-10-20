#!/usr/bin/env python3
"""Reproduce the 2026-10-20 copper ECO from the hash-locked main board.

Usage: KiCad Python scripts/refine-copper-geometry.py BASELINE OUTPUT
Source must be freshly compiled first. Never use this ECO to reroute a different
revision. All native checks, actual-fill screens and release exports follow it.
"""
import hashlib
import json
from pathlib import Path
import runpy
import sys
import pcbnew
import wx
from critical_copper import load_paths, add_pour_keepouts, check

BASELINE = '4e53cf5210003b327a1b4cd49f3c5c81ff3a0f5f44277b71c384c29bc95a5cb3'

def v(x, y):
    return pcbnew.VECTOR2I(round(x * 1e6), round(y * 1e6))

def main():
    src, dst = map(Path, sys.argv[1:3])
    if src.resolve() == dst.resolve():
        raise ValueError('Use a separate output path')
    if hashlib.sha256(src.read_bytes()).hexdigest() != BASELINE:
        raise ValueError('ECO input differs from reviewed main 8139bca')
    settings = json.loads(src.with_suffix('.kicad_pro').read_text())
    app = wx.App(False)
    board = pcbnew.LoadBoard(str(src.resolve()))
    pcbnew.KIID.SeedGenerator(20261020)
    tracks = {t.m_Uuid.AsString(): t for t in board.GetTracks()}
    def added_track(net, start, end, width=.15):
        t = pcbnew.PCB_TRACK(board)
        t.SetNet(board.FindNet(net)); t.SetLayer(pcbnew.F_Cu)
        t.SetWidth(pcbnew.FromMM(width)); t.SetStart(v(*start)); t.SetEnd(v(*end))
        board.Add(t)
    tracks['4d982e36-1430-4d61-a500-c5d15533ec31'].SetEnd(v(80.8,115.2))
    # Move the complete gate-via junction clear of a redundant pad-corner touch.
    old, new = v(93.5163,60.7126), v(93.6163,60.8126)
    for t in board.GetTracks():
        if t.GetNetname() != 'BLOCK_FAST_GATE': continue
        if isinstance(t, pcbnew.PCB_VIA):
            if t.GetPosition() == old: t.SetPosition(new)
        else:
            if t.GetStart() == old: t.SetStart(new)
            if t.GetEnd() == old: t.SetEnd(new)
    # Keep U12's existing direct pad-to-pad ground link; avoid grazing pad 1.
    tracks['8c894eed-461a-4ae8-9dc5-d16d548e7b07'].SetStart(v(100.64999,124.0))
    added_track('GND', (100.64999,124.0), (101.14999,124.5))
    # Source-matched outward chamfer, maintaining the 0.15 mm Kelvin branch.
    tracks['f9109076-03b8-4d85-a982-f5154b85651d'].SetEnd(v(134.218066,103.20811))
    tracks['110230f3-3a27-42e5-8ad8-982e99c602de'].SetStart(v(134.250066,103.50011))
    added_track('SENSE_B', (134.218066,103.20811), (134.150066,103.40011))
    added_track('SENSE_B', (134.150066,103.40011), (134.250066,103.50011))
    retained = []
    for zone in list(board.Zones()):
        if zone.GetIsRuleArea() and zone.GetZoneName() == 'KELVIN_B_HIGH':
            retained.append(zone); board.Remove(zone)
        if not zone.GetIsRuleArea() and zone.GetNetname() == 'GND' and zone.GetLayer() == pcbnew.In1_Cu:
            zone.SetMinThickness(pcbnew.FromMM(.25))
    paths = load_paths(board)
    add_pour_keepouts(board, [p for p in paths if p['name'] == 'KELVIN_B_HIGH'])
    consolidate = runpy.run_path(str(Path(__file__).with_name('reinforce-power-copper.py')))['consolidate_power_zones']
    result = consolidate(board)
    board.BuildConnectivity()
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    isolation = check(board, paths)
    if isolation['errors']:
        raise ValueError(isolation['errors'])
    dst.parent.mkdir(parents=True, exist_ok=True)
    pcbnew.SaveBoard(str(dst.resolve()), board)
    settings['board']['design_settings']['rules'].update(min_connection=.09, min_groove_width=.09)
    dst.with_suffix('.kicad_pro').write_text(json.dumps(settings,indent=2)+'\n')
    print(json.dumps({'consolidated_power_zones':result,'kelvin_errors':isolation['errors'],
        'board_sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'output':str(dst)},indent=2))

if __name__ == '__main__': main()
