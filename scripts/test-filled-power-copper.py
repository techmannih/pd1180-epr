"""Analytic sanity checks for the optional offline copper screen (same Python dependencies)."""
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile


def rectangle(x0, y0, x1, y1):
    return [[[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]]]


def pad(ref, layer, polygons):
    return dict(net="TEST", layer=layer, kind="pad", ref=ref, pin="1",
                drill_xy=[0, 0], at=[0.5, 0.5], polygons=polygons)


def solve(items, mesh):
    with tempfile.TemporaryDirectory() as directory:
        fixture = Path(directory) / "copper.json"
        fixture.write_text(json.dumps(dict(board_sha256=None, items=items)))
        result = subprocess.check_output([
            sys.executable, str(Path(__file__).with_name("screen-filled-power-copper.py")),
            str(fixture), "TEST", str(mesh), "A:1", "B:1",
        ], text=True)
        return json.loads(result)["resistance_mohm_20c"]


sheet = [dict(net="TEST", layer="F.Cu", kind="fill", polygons=rectangle(0, 0, 30, 3)),
         pad("A", "F.Cu", rectangle(0, 0, .2, 3)),
         pad("B", "F.Cu", rectangle(29.8, 0, 30, 3))]
expected_sheet = 1.724e-8 * .0296 / (.003 * 35e-6) * 1000
coarse, fine = solve(sheet, .075), solve(sheet, .05)
assert abs(fine / expected_sheet - 1) < .03
assert abs(fine - expected_sheet) < abs(coarse - expected_sheet)

# Four layer records describe one plated barrel, not four parallel barrels.
barrel = [dict(net="TEST", layer=layer, kind="via", uuid=f"layer-{layer}",
               at=[.5, .5], drill=.3, diameter=.6, polygons=rectangle(.2, .2, .8, .8))
          for layer in ["F.Cu", "In1.Cu", "In2.Cu", "B.Cu"]]
barrel += [pad("A", "F.Cu", rectangle(.1, .1, .9, .9)),
           pad("B", "B.Cu", rectangle(.1, .1, .9, .9))]
expected_barrel = 1.724e-8 * .0016 / (math.pi * (.0003 + 20e-6) * 20e-6) * 1000
actual_barrel = solve(barrel, .05)
assert abs(actual_barrel / expected_barrel - 1) < .001
print(json.dumps(dict(rectangular_sheet_expected_mohm=expected_sheet,
    coarse_mohm=coarse, fine_mohm=fine, barrel_expected_mohm=expected_barrel,
    barrel_mohm=actual_barrel, passed=True), indent=2))
