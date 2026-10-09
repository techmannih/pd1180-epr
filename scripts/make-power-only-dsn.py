#!/usr/bin/env python3
"""Create a power-only Specctra DSN for the first autorouting pass."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


POWER_NETS = {
    "PD_VBUS",
    "EFUSE_IN",
    "VMOTOR",
    "MOTOR_A1",
    "MOTOR_A2",
    "MOTOR_B1",
    "MOTOR_B2",
    "SENSE_A",
    "SENSE_B",
    "BRAKE_RETURN",
}


def matching_paren(text: str, start: int) -> int:
    depth = 0
    quoted = False
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if quoted:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                quoted = False
            continue
        if char == '"':
            quoted = True
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return index + 1
    raise ValueError(f"unbalanced expression at byte {start}")


def find_form(text: str, name: str) -> tuple[int, int]:
    match = re.search(rf"\({re.escape(name)}(?:\s|\))", text)
    if not match:
        raise ValueError(f"missing ({name} ...) form")
    return match.start(), matching_paren(text, match.start())


def indent_block(block: str, spaces: int) -> str:
    prefix = " " * spaces
    return "\n".join(prefix + line if line else line for line in block.splitlines())


def extract_named_net(network_body: str, net_name: str) -> str:
    match = re.search(rf"\(net\s+(?:\"{re.escape(net_name)}\"|{re.escape(net_name)})(?:\s|\))", network_body)
    if not match:
        raise ValueError(f"power net {net_name} is absent from DSN")
    return network_body[match.start() : matching_paren(network_body, match.start())]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    source = args.source.read_text()
    network_start, network_end = find_form(source, "network")
    network = source[network_start:network_end]

    net_forms = [extract_named_net(network, name) for name in sorted(POWER_NETS)]
    power_class_start, power_class_end = find_form(network, "class POWER_2OZ")
    power_class = network[power_class_start:power_class_end]
    replacement = "(network\n"
    replacement += "\n".join(indent_block(form, 4) for form in net_forms)
    replacement += "\n" + indent_block(power_class, 4) + "\n  )"
    source = source[:network_start] + replacement + source[network_end:]

    wiring_start, wiring_end = find_form(source, "wiring")
    source = source[:wiring_start] + "(wiring\n  )" + source[wiring_end:]

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_text(source)
    print(f"Wrote {args.destination} with {len(net_forms)} power nets and no pre-routes")


if __name__ == "__main__":
    main()
