"""Apply/audit native geometry against the source-aligned board design policy."""
import argparse
import hashlib
import json
from pathlib import Path
import pcbnew


def policy():
    p = json.loads(Path('board-standards.json').read_text())['fabrication']
    g = p['ground_plane']
    if p['minimum_trace_width_mm'] < .15 or g['clearance_mm'] < .30 or g['board_edge_margin_mm'] < .50:
        raise ValueError('User-required 0.15 mm track / 0.30 mm GND clearance / 0.50 mm GND edge floors must not be lowered')
    if g['net'] != 'GND' or g['layer'] != 'inner1':
        raise ValueError('Expected the source GND_PLANE on inner1')
    return p


def ground_outline(board, p):
    outline = pcbnew.SHAPE_POLY_SET()
    if not board.GetBoardPolygonOutlines(outline, False, None, False, False) or outline.OutlineCount() != 1:
        raise ValueError('Expected one valid board perimeter')
    outline.Deflate(pcbnew.FromMM(p['ground_plane']['board_edge_margin_mm']),
                    pcbnew.CORNER_STRATEGY_ROUND_ALL_CORNERS, pcbnew.FromMM(.001))
    if outline.OutlineCount() != 1:
        raise ValueError('Ground inset splits the plane; geometry review required')
    return outline


def apply_ground_policy(board, p):
    allowed = ground_outline(board, p)
    grounds = [z for z in board.Zones() if not z.GetIsRuleArea() and z.GetNetname() == 'GND']
    main = [z for z in grounds if z.GetLayer() == pcbnew.In1_Cu]
    if len(main) != 1:
        raise ValueError('Expected exactly one native inner1 GND plane')
    for z in grounds:
        z.SetLocalClearance(pcbnew.FromMM(p['ground_plane']['clearance_mm']))
        if z is main[0]:
            # SetOutline stores a raw pointer in KiCad. Copy into the
            # zone-owned polygon so a local Python polygon cannot dangle.
            z.Outline().RemoveAllContours()
            z.Outline().Append(allowed)
            z.SetZoneName('GND_PLANE')
            z.SetMinThickness(pcbnew.FromMM(p['ground_plane']['minimum_fill_width_mm']))
        else:
            clipped = pcbnew.SHAPE_POLY_SET(z.Outline())
            clipped.BooleanIntersection(allowed)
            z.Outline().RemoveAllContours()
            z.Outline().Append(clipped)


def audit(board, p):
    errors = []
    tracks = [t for t in board.GetTracks() if not isinstance(t, pcbnew.PCB_VIA)]
    thin = [t.m_Uuid.AsString() for t in tracks if t.GetWidth() < pcbnew.FromMM(p['minimum_trace_width_mm'])]
    if thin: errors.append(f'{len(thin)} tracks below {p["minimum_trace_width_mm"]} mm')
    allowed = ground_outline(board, p)
    rows = []
    for z in board.Zones():
        if z.GetIsRuleArea() or z.GetNetname() != 'GND': continue
        outside = pcbnew.SHAPE_POLY_SET(z.Outline())
        outside.BooleanSubtract(allowed)
        clearance = pcbnew.ToMM(z.GetLocalClearance())
        outside_area = outside.Area()/1e12
        if clearance < p['ground_plane']['clearance_mm'] - 1e-9:
            errors.append(f'GND zone {z.m_Uuid.AsString()} clearance {clearance} mm is below policy')
        if outside_area > 1e-8:
            errors.append(f'GND zone {z.m_Uuid.AsString()} extends outside the required edge inset')
        rows.append({'uuid': z.m_Uuid.AsString(), 'layer': pcbnew.LayerName(z.GetLayer()), 'name': z.GetZoneName(),
                     'clearance_mm': clearance, 'outline_outside_required_inset_mm2': outside_area})
    if len([r for r in rows if r['layer'] == 'In1.Cu' and r['name'] == 'GND_PLANE']) != 1:
        errors.append('Missing/ambiguous native GND_PLANE')
    return {'minimum_actual_track_width_mm': min((pcbnew.ToMM(t.GetWidth()) for t in tracks), default=None),
            'track_count': len(tracks), 'thin_track_uuids': thin, 'ground_zones': rows, 'errors': errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['apply', 'check'])
    parser.add_argument('board', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    import wx
    app = wx.App(False)
    p = policy()
    board = pcbnew.LoadBoard(str(args.board.resolve()))
    if args.mode == 'apply':
        if args.output.resolve() == args.board.resolve(): raise ValueError('Use a separate output board')
        apply_ground_policy(board, p)
        pcbnew.ZONE_FILLER(board).Fill(board.Zones())
        pcbnew.SaveBoard(str(args.output.resolve()), board)
    else:
        result = audit(board, p)
        result.update(board_sha256=hashlib.sha256(args.board.read_bytes()).hexdigest(),
                      standards_sha256=hashlib.sha256(Path('board-standards.json').read_bytes()).hexdigest(),
                      checker_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2)+'\n')
        print(json.dumps(result, indent=2))
        if result['errors']: raise SystemExit(1)


if __name__ == '__main__': main()
