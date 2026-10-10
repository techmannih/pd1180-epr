#!/usr/bin/env python3
"""Apply signal and power routing rules to the world-aligned Specctra export."""

from __future__ import annotations

from pathlib import Path
import re
import json
import sys
import textwrap


POWER_NETS = (
    "PD_VBUS",
    "EFUSE_IN",
    "VMOTOR",
    "MOTOR_A1",
    "MOTOR_A1_OUT",
    "MOTOR_B1_OUT",
    "MOTOR_A2",
    "MOTOR_B1",
    "MOTOR_B2",
    "SENSE_A",
    "SENSE_B",
    "BRAKE_RETURN",
)


def wrapped_names(names: list[str], indent: str = "      ") -> str:
    return textwrap.fill(
        " ".join(names),
        width=94,
        initial_indent=indent,
        subsequent_indent=indent,
    ).lstrip()


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare-routing-rules.py INPUT.dsn OUTPUT.dsn")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    data = source.read_text()

    # Use the reviewed fabrication clearance, including the short dense-pad
    # escapes already checked in native KiCad. Power zones retain 0.16 mm.
    standards = json.loads(Path("board-standards.json").read_text())
    clearance_um = round(1000 * standards["fabrication"]["minimum_trace_space_mm"])
    data, replaced = re.subn(
        r"\(clearance (?:90|100|200)\)\n      \(clearance (?:22\.5|25|50) \(type smd_smd\)\)",
        f"(clearance {clearance_um})\n      (clearance 22.5 (type smd_smd))",
        data,
        count=1,
    )
    if replaced != 1:
        raise SystemExit("board-level routing rule not found")

    class_re = re.compile(
        r"    \(class kicad_default (?P<names>.*?)"
        r"(?P<body>\n      \(circuit\n        \(use_via .*?\n      \)\n"
        r"      \(rule\n        \(width (?:150|200)\)\n        \(clearance (?:90|100|200)\)\n      \)\n    \))",
        re.S,
    )
    match = class_re.search(data)
    if not match:
        raise SystemExit("kicad_default class not found")

    names = re.findall(r"[A-Za-z0-9_]+", match.group("names"))
    missing = sorted(set(POWER_NETS) - set(names))
    if missing:
        raise SystemExit(f"power nets missing from default class: {missing}")
    default_names = [name for name in names if name not in POWER_NETS]
    default_body = re.sub(r"\(width (?:150|200)\)", "(width 150)", match.group("body"))
    default_body = re.sub(r"\(clearance (?:90|100|200)\)", f"(clearance {clearance_um})", default_body)
    default_class = (
        "    (class kicad_default "
        + wrapped_names(default_names)
        + default_body
    )
    power_class = (
        "\n    (class POWER "
        + " ".join(POWER_NETS)
        + "\n      (circuit\n        (use_via \"Via[0-3]_600:300_um\")\n      )"
        # Dense QFN and PowerPAK pins need a short neck-down. The release
        # board reinforces these 0.50 mm connections with broad copper zones
        # and via arrays; forcing 2 mm uniformly cannot enter the packages.
        + f"\n      (rule\n        (width 500)\n        (clearance {clearance_um})\n      )\n    )"
    )
    data = data[: match.start()] + default_class + power_class + data[match.end() :]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(data)
    print(
        f"wrote {output} with {len(default_names)} signal nets, "
        f"{len(POWER_NETS)} power nets; placements are unchanged"
    )


if __name__ == "__main__":
    main()
