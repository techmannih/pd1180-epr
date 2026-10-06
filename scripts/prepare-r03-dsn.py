#!/usr/bin/env python3
"""Apply the release routing rules to a KiCad-exported Specctra DSN."""

from __future__ import annotations

from pathlib import Path
import re
import sys
import textwrap


POWER_NETS = (
    "USB_VBUS",
    "EFUSE_IN",
    "VMOTOR",
    "MOTOR_A1",
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
        raise SystemExit("usage: prepare-r03-dsn.py INPUT.dsn OUTPUT.dsn")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    data = source.read_text()

    # The package-specific SMD spacing remains governed by pad geometry;
    # routed copper uses a 0.16 mm target where the router is in control.
    data = data.replace("(clearance 100)\n      (clearance 25 (type smd_smd))", "(clearance 160)\n      (clearance 25 (type smd_smd))", 1)

    class_re = re.compile(
        r"    \(class kicad_default (?P<names>.*?)"
        r"(?P<body>\n      \(circuit\n        \(use_via .*?\n      \)\n"
        r"      \(rule\n        \(width 150\)\n        \(clearance 100\)\n      \)\n    \))",
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
    default_class = (
        "    (class kicad_default "
        + wrapped_names(default_names)
        + match.group("body").replace("(clearance 100)", "(clearance 160)")
    )
    power_class = (
        "\n    (class POWER_2OZ "
        + " ".join(POWER_NETS)
        + "\n      (circuit\n        (use_via \"Via[0-3]_600:300_um\")\n      )"
        # Dense QFN and PowerPAK pins need a short neck-down. The release
        # board reinforces these 0.50 mm connections with broad copper zones
        # and via arrays; forcing 2 mm uniformly cannot enter the packages.
        + "\n      (rule\n        (width 500)\n        (clearance 200)\n      )\n    )"
    )
    data = data[: match.start()] + default_class + power_class + data[match.end() :]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(data)
    print(f"wrote {output} with {len(default_names)} signal nets and {len(POWER_NETS)} power nets")


if __name__ == "__main__":
    main()
