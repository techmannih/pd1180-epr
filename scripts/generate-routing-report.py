#!/usr/bin/env python3
"""Generate the final route summary from KiCad evidence."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import pcbnew


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("board", type=Path)
    parser.add_argument("drc", type=Path)
    parser.add_argument("manufacturing_report", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    board = pcbnew.LoadBoard(str(args.board.resolve()))
    drc = json.loads(args.drc.read_text())
    manufacturing = json.loads(args.manufacturing_report.read_text())
    tracks = list(board.GetTracks())
    vias = [item for item in tracks if isinstance(item, pcbnew.PCB_VIA)]
    route_segments = [item for item in tracks if not isinstance(item, pcbnew.PCB_VIA)]
    violations = drc.get("violations", [])
    unconnected = drc.get("unconnected_items", [])
    report = {
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "revision": "0.3.0",
        "complete": not violations and not unconnected,
        "router": "Freerouting seed with KiCad-reviewed local completion and 2.4 mm power-corridor reinforcement",
        "board": str(args.board),
        "statistics": {
            "components_including_mounts_and_service_pads": len(board.GetFootprints()),
            "supplier_backed_fitted_components": 254,
            "service_testpads": 11,
            "mounting_holes": 4,
            "pads": len(board.GetPads()),
            "traces": len(route_segments),
            "vias": len(vias),
            "copper_pours": len(board.Zones()),
            "layers": board.GetCopperLayerCount(),
        },
        "kicad_drc": {
            "report": str(args.drc),
            "violations": len(violations),
            "unconnected_items": len(unconnected),
        },
        "manufacturing": {
            "report": str(args.manufacturing_report),
            "gerber_and_drill_files": len(manufacturing.get("gerber_files", [])),
            "archive": "dist/pd1180-epr-r0.3-manufacturing.zip",
        },
        "physical_validation_required": [
            "high-current copper temperature rise at target motor profile",
            "48 V EPR negotiation and fault recovery",
            "motor-control firmware and shutdown timing",
            "brake resistor energy and thermal sizing",
            "motor rear-face fit and shaft-magnet alignment",
            "conducted and radiated EMC",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
