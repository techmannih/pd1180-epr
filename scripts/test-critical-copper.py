#!/usr/bin/env python3
"""Native regressions for missing copper and premature same-net Kelvin joins."""

import unittest
import pcbnew
from critical_copper import check, vector, reservation_polygons


class KelvinIsolationTest(unittest.TestCase):
    def setUp(self):
        self.board = pcbnew.BOARD()
        self.net = pcbnew.NETINFO_ITEM(self.board, "GND")
        self.board.Add(self.net)
        self.held = [self.net]
        self.pads = []
        for name, position in (("U1", (0, 0)), ("R1", (5, 0))):
            fp = pcbnew.FOOTPRINT(self.board)
            fp.SetReference(name)
            pad = pcbnew.PAD(fp)
            pad.SetNumber("1")
            pad.SetAttribute(pcbnew.PAD_ATTRIB_SMD)
            pad.SetShape(pcbnew.PAD_SHAPE_RECT)
            layers = pcbnew.LSET()
            layers.AddLayer(pcbnew.F_Cu)
            pad.SetLayerSet(layers)
            pad.SetPosition(vector(position))
            pad.SetSize(vector((0.8, 0.8)))
            pad.SetNet(self.net)
            fp.Add(pad)
            self.board.Add(fp)
            self.held.extend([fp, pad])
            self.pads.append(pad)
        self.branch = self.track((0, 0), (5, 0))
        self.paths = [{"name": "RETURN", "net": "GND", "width": 0.15,
                       "segments": [((0, 0), (5, 0))], "start_pad": self.pads[0], "end_pad": self.pads[1]}]

    def track(self, a, b):
        track = pcbnew.PCB_TRACK(self.board)
        track.SetStart(vector(a))
        track.SetEnd(vector(b))
        track.SetWidth(pcbnew.FromMM(0.15))
        track.SetLayer(pcbnew.F_Cu)
        track.SetNet(self.net)
        self.board.Add(track)
        self.held.append(track)
        return track

    def test_terminal_load_connection_is_allowed(self):
        self.track((5, 0), (5, 2))
        self.assertEqual(check(self.board, self.paths)["errors"], [])

    def test_missing_branch_fails(self):
        self.board.Remove(self.branch)
        self.assertIn("source copper was removed", " ".join(check(self.board, self.paths)["errors"]))

    def test_same_ground_spur_before_terminal_fails(self):
        self.track((2, 0), (2, 2))
        self.assertIn("joins before", " ".join(check(self.board, self.paths)["errors"]))

    def test_same_ground_plane_via_before_terminal_fails(self):
        via = pcbnew.PCB_VIA(self.board)
        via.SetPosition(vector((2, 0)))
        via.SetWidth(pcbnew.FromMM(0.45))
        via.SetDrill(pcbnew.FromMM(0.2))
        via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        via.SetNet(self.net)
        self.board.Add(via)
        self.held.append(via)
        self.assertIn("joins before", " ".join(check(self.board, self.paths)["errors"]))

    def add_ground_fill(self, bottom):
        zone = pcbnew.ZONE(self.board)
        zone.SetLayer(pcbnew.F_Cu)
        zone.SetNet(self.net)
        polygon = pcbnew.SHAPE_POLY_SET()
        polygon.NewOutline()
        for point in ((1, bottom), (4, bottom), (4, 1), (1, 1)):
            p = vector(point)
            polygon.Append(p.x, p.y)
        zone.SetFilledPolysList(pcbnew.F_Cu, polygon)
        zone.SetIsFilled(True)
        self.board.Add(zone)
        self.held.extend([zone, polygon])

    def test_ground_fill_touching_trace_edge_fails(self):
        # The 0.15 mm trace overlaps this fill, although its center is outside.
        self.add_ground_fill(0.05)
        self.assertIn("joins before", " ".join(check(self.board, self.paths)["errors"]))

    def test_ground_fill_with_positive_gap_is_allowed(self):
        self.add_ground_fill(0.10)
        self.assertEqual(check(self.board, self.paths)["errors"], [])

    def test_segment_reservations_merge_and_leave_terminal_accessible(self):
        path = {**self.paths[0], "segments": [((0, 0), (2, 0)), ((2, 0), (5, 0))]}
        outlines = list(reservation_polygons(path))
        self.assertEqual(len(outlines), 1)
        polygon = pcbnew.SHAPE_POLY_SET()
        polygon.NewOutline()
        for point in outlines[0]:
            p = vector(point)
            polygon.Append(p.x, p.y)
        self.assertTrue(polygon.Contains(vector((2, 0))))
        self.assertFalse(polygon.Contains(vector((5, 0))))


if __name__ == "__main__":
    import wx
    app = wx.App(False)
    unittest.main()
