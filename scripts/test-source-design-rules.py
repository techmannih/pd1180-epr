"""Native geometry regression: reject narrow copper and a non-inset ground zone."""
import unittest
import pcbnew
import wx
from source_design_rules import policy, apply_ground_policy, audit


class NativeSourceRulesTest(unittest.TestCase):
    def test_actual_geometry(self):
        board = pcbnew.BOARD()
        board.SetCopperLayerCount(4)
        for a,b in zip([(0,0),(20,0),(20,20),(0,20)],[(20,0),(20,20),(0,20),(0,0)]):
            edge = pcbnew.PCB_SHAPE(board)
            edge.SetShape(pcbnew.SHAPE_T_SEGMENT)
            edge.SetLayer(pcbnew.Edge_Cuts)
            edge.SetStart(pcbnew.VECTOR2I(*[pcbnew.FromMM(x) for x in a]))
            edge.SetEnd(pcbnew.VECTOR2I(*[pcbnew.FromMM(x) for x in b]))
            board.Add(edge)
        net = pcbnew.NETINFO_ITEM(board, 'GND')
        board.Add(net)
        zone = pcbnew.ZONE(board)
        zone.SetNet(net); zone.SetLayer(pcbnew.In1_Cu); zone.SetZoneName('GND_PLANE')
        polygon = zone.Outline(); polygon.NewOutline()
        for x,y in [(0,0),(20,0),(20,20),(0,20)]: polygon.Append(pcbnew.FromMM(x),pcbnew.FromMM(y))
        zone.SetLocalClearance(pcbnew.FromMM(.20)); board.Add(zone)
        track = pcbnew.PCB_TRACK(board); track.SetNet(net); track.SetLayer(pcbnew.F_Cu)
        track.SetStart(pcbnew.VECTOR2I(5000000,5000000)); track.SetEnd(pcbnew.VECTOR2I(6000000,5000000))
        track.SetWidth(pcbnew.FromMM(.09)); board.Add(track)
        p=policy()
        before=audit(board,p)
        self.assertTrue(any('tracks below' in x for x in before['errors']))
        self.assertTrue(any('clearance' in x for x in before['errors']))
        self.assertTrue(any('outside' in x for x in before['errors']))
        apply_ground_policy(board,p)
        # Applying plane rules must not conceal a narrow routed track.
        self.assertTrue(any('tracks below' in x for x in audit(board,p)['errors']))
        track.SetWidth(pcbnew.FromMM(.15))
        after=audit(board,p)
        self.assertEqual(after['errors'],[])
        self.assertAlmostEqual(zone.Outline().Area()/1e12,19*19,places=4)
        self.assertEqual(after['minimum_actual_track_width_mm'],.15)


if __name__=='__main__':
    app=wx.App(False)
    unittest.main()
