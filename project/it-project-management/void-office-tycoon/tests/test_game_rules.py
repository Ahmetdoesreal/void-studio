from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = PROJECT_ROOT / "server"
sys.path.insert(0, str(SERVER_DIR))

from game_rules import (  # noqa: E402
    RuleError,
    apply_debug_action,
    build_world_cell,
    buy_department,
    create_department_placement,
    ensure_world,
    escape_check,
    new_session,
)


class GameRulesTest(unittest.TestCase):
    def test_new_session_uses_32_by_32_world_with_4_by_4_subcells(self) -> None:
        session = new_session("COM0463-TEST")

        self.assertEqual(session["world"]["size"], 32)
        self.assertEqual(session["world"]["subcellsPerCell"], 4)
        self.assertEqual(session["world"]["start"], {"x": 1, "y": 16})
        self.assertEqual(session["world"]["end"], {"x": 30, "y": 16})
        self.assertGreaterEqual(len(session["world"]["blackholes"]), 2)
        self.assertLessEqual(len(session["world"]["blackholes"]), 3)

    def test_build_world_cell_uses_normal_cell_coordinates(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 10

        session, action, _ = build_world_cell(session, 2, 16)

        self.assertTrue(action["built"])
        self.assertIn("2,16", session["world"]["builtPath"])
        self.assertEqual(session["points"], 8)

    def test_blackhole_danger_loses_run(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 10
        session["world"]["blackholes"] = [
            {"id": "test-hole", "x": 2, "y": 16, "dangerRadius": 0}
        ]

        session, action, _ = build_world_cell(session, 2, 16)

        self.assertFalse(action["built"])
        self.assertTrue(action["lost"])
        self.assertEqual(session["finalResult"]["status"], "lost_to_blackhole")

    def test_department_placement_has_4_by_4_subcell_metadata_and_walls(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 100
        session, _, _ = build_world_cell(session, 2, 16)

        session, action, _ = buy_department(session, "scope_desk", {"x": 2, "y": 14}, 0)
        placement = action["placement"]

        self.assertEqual(placement["subcellsPerCell"], 4)
        self.assertEqual(len(placement["occupiedCells"]), 3)
        self.assertGreaterEqual(len(placement["spriteStacks"]), 6)
        self.assertGreaterEqual(len(placement["walls"]), 4)
        for stack in [*placement["spriteStacks"], *placement["walls"]]:
            self.assertGreaterEqual(stack["subcell"]["x"], 0)
            self.assertLessEqual(stack["subcell"]["x"], 3)
            self.assertGreaterEqual(stack["subcell"]["y"], 0)
            self.assertLessEqual(stack["subcell"]["y"], 3)
        for wall in placement["walls"]:
            self.assertIn(wall["edge"], {"north", "west"})

    def test_rotated_irregular_department_footprint_stays_normalized(self) -> None:
        placement = create_department_placement("scope_desk", {"x": 4, "y": 4}, 90)
        occupied = [(cell["x"], cell["y"]) for cell in placement["occupiedCells"]]

        self.assertEqual(placement["rotation"], 90)
        self.assertEqual(occupied, [(5, 4), (4, 5), (5, 5)])

    def test_escape_check_succeeds_after_debug_completion(self) -> None:
        session = new_session("COM0463-TEST")
        session, _, _ = apply_debug_action(session, "build_all_departments")
        session, _, _ = apply_debug_action(session, "connect_to_light")

        session, result, _ = escape_check(session)

        self.assertTrue(result["eligible"])
        self.assertEqual(session["finalResult"]["status"], "escaped")
        self.assertTrue(session["departments"]["portal_room"]["built"])

    def test_legacy_world_and_placement_are_lazily_normalized(self) -> None:
        session = new_session("COM0463-TEST")
        department = session["departments"]["scope_desk"]
        department["built"] = True
        department["level"] = 1
        department["placement"] = {
            "anchorCell": {"x": 2, "y": 14},
            "rotation": 0,
            "occupiedCells": [{"x": 2, "y": 14}],
            "spriteStacks": [],
            "walls": [],
            "subcellsPerCell": 8,
        }
        session["world"]["size"] = 128
        session["world"]["subcellsPerCell"] = 8

        ensure_world(session)

        self.assertEqual(session["world"]["size"], 32)
        self.assertEqual(session["world"]["subcellsPerCell"], 4)
        self.assertEqual(department["placement"]["subcellsPerCell"], 4)

    def test_department_cannot_be_placed_outside_32_by_32_world(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 100

        with self.assertRaises(RuleError):
            buy_department(session, "risk_vault", {"x": 31, "y": 31}, 0)


if __name__ == "__main__":
    unittest.main()
