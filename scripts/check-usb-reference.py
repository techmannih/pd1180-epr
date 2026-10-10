"""Check the USB bottom-layer trunks against native filled In2 ground copper."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import pcbnew
import wx

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('board', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
app = wx.App(False)
board = pcbnew.LoadBoard(str(args.board.resolve()))
nets = ['USB_DP', 'USB_DM', 'USB_DP_CONN', 'USB_DM_CONN']
xy = lambda p: (pcbnew.ToMM(p.x), pcbnew.ToMM(p.y))
tracks = list(board.GetTracks())
vias = [t for t in tracks if isinstance(t, pcbnew.PCB_VIA)]
ground_vias = [xy(v.GetPosition()) for v in vias if v.GetNetname() == 'GND']
planes = [z.GetFilledPolysList(pcbnew.In2_Cu) for z in board.Zones()
          if not z.GetIsRuleArea() and z.GetNetname() == 'GND' and z.IsOnLayer(pcbnew.In2_Cu)]
errors, results = [], []
for net in nets:
    transfers = [xy(v.GetPosition()) for v in vias if v.GetNetname() == net]
    lengths, uncovered, samples = {}, [], 0
    for t in tracks:
        if isinstance(t, pcbnew.PCB_VIA) or t.GetNetname() != net:
            continue
        layer = board.GetLayerName(t.GetLayer())
        a, b = xy(t.GetStart()), xy(t.GetEnd())
        length = math.dist(a, b)
        lengths[layer] = lengths.get(layer, 0) + length
        if layer != 'B.Cu':
            continue
        for i in range(math.ceil(length / .05) + 1):
            ratio = min(1, i * .05 / length) if length else 0
            p = (a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio)
            # A through signal via necessarily has an antipad in the ground plane.
            if any(math.dist(p, v) <= .45 for v in transfers):
                continue
            samples += 1
            point = pcbnew.VECTOR2I(pcbnew.FromMM(p[0]), pcbnew.FromMM(p[1]))
            if not any(plane.Contains(point) for plane in planes):
                uncovered.append([round(v, 4) for v in p])
    distances = [min(math.dist(v, g) for g in ground_vias) for v in transfers]
    if not lengths.get('B.Cu') or any(layer not in ['F.Cu', 'B.Cu'] for layer in lengths):
        errors.append(f'{net}: expected bottom trunks and top fanouts only')
    if uncovered:
        errors.append(f'{net}: {len(uncovered)} samples lack In2 ground reference')
    if not transfers or max(distances, default=0) > 2:
        errors.append(f'{net}: a signal transition lacks ground stitching within 2 mm')
    results.append(dict(net=net, length_mm={k: round(v, 3) for k, v in lengths.items()},
        checked_samples=samples, uncovered_samples=uncovered,
        maximum_ground_stitch_distance_mm=round(max(distances, default=0), 3)))
report = dict(board_sha256=hashlib.sha256(args.board.read_bytes()).hexdigest(),
    checker_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    sample_pitch_mm=.05, signal_via_antipad_exclusion_radius_mm=.45,
    maximum_ground_stitch_distance_mm=2, nets=results, errors=errors,
    limitation='Geometric return-path check for the full-speed interface; not an impedance, eye-diagram or USB compliance measurement.')
args.output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
raise SystemExit(bool(errors))
