#!/usr/bin/env python3
"""Prevent redundant ground fanouts when native connectivity returns base proxies."""
import importlib.util
from pathlib import Path
import unittest

import pcbnew
import wx

spec = importlib.util.spec_from_file_location(
    "plane_escapes", Path(__file__).with_name("prepare-plane-escapes.py"))
escapes = importlib.util.module_from_spec(spec)
spec.loader.exec_module(escapes)


class PlaneConnectionTest(unittest.TestCase):
    def setUp(self):
        self.board = pcbnew.BOARD()
        self.net = pcbnew.NETINFO_ITEM(self.board, "GND")
        self.board.Add(self.net)
        self.fp = pcbnew.FOOTPRINT(self.board)
        self.pad = pcbnew.PAD(self.fp)
        self.pad.SetAttribute(pcbnew.PAD_ATTRIB_SMD)
        layers = pcbnew.LSET()
        layers.AddLayer(pcbnew.F_Cu)
        self.pad.SetLayerSet(layers)
        self.pad.SetSize(escapes.vector((.8, .8)))
        self.pad.SetNet(self.net)
        self.fp.Add(self.pad)
        self.board.Add(self.fp)

    def test_isolated_smd_pad_requires_escape(self):
        self.board.BuildConnectivity()
        self.assertFalse(escapes.connected_to_through_copper(self.board, self.pad))

    def test_existing_bypass_via_is_not_duplicated(self):
        track = pcbnew.PCB_TRACK(self.board)
        track.SetStart(escapes.vector((0, 0)))
        track.SetEnd(escapes.vector((1, 0)))
        track.SetLayer(pcbnew.F_Cu)
        track.SetWidth(pcbnew.FromMM(.2))
        track.SetNet(self.net)
        self.board.Add(track)
        via = pcbnew.PCB_VIA(self.board)
        via.SetPosition(track.GetEnd())
        via.SetWidth(pcbnew.FromMM(.6))
        via.SetDrill(pcbnew.FromMM(.3))
        via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        via.SetNet(self.net)
        self.board.Add(via)
        self.board.BuildConnectivity()
        self.assertTrue(escapes.connected_to_through_copper(self.board, self.pad))

    def test_plated_connector_pad_already_reaches_planes(self):
        self.pad.SetAttribute(pcbnew.PAD_ATTRIB_PTH)
        self.pad.SetLayerSet(pcbnew.LSET.AllCuMask())
        self.pad.SetDrillSize(escapes.vector((.3, .3)))
        self.board.BuildConnectivity()
        self.assertTrue(escapes.connected_to_through_copper(self.board, self.pad))


if __name__ == "__main__":
    app = wx.App(False)
    unittest.main()
