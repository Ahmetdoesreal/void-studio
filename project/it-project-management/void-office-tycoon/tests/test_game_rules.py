from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = PROJECT_ROOT / "server"
sys.path.insert(0, str(SERVER_DIR))

from game_rules import (  # noqa: E402
    FURNITURE_LAYOUT_VERSION,
    RuleError,
    apply_debug_action,
    build_world_cell,
    buy_department,
    create_department_placement,
    ensure_world,
    escape_check,
    new_session,
    record_minigame_result,
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
        self.assertEqual(session["world"]["spawnOffice"]["furnitureVersion"], FURNITURE_LAYOUT_VERSION)

    def test_build_world_cell_uses_normal_cell_coordinates(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 10

        session, action, _ = build_world_cell(session, 5, 16)

        self.assertTrue(action["built"])
        self.assertIn("5,16", session["world"]["builtPath"])
        self.assertEqual(session["points"], 9)

    def test_blackhole_danger_loses_run(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 10
        session["world"]["blackholes"] = [
            {"id": "test-hole", "x": 5, "y": 16, "dangerRadius": 0}
        ]

        session, action, _ = build_world_cell(session, 5, 16)

        self.assertFalse(action["built"])
        self.assertTrue(action["lost"])
        self.assertEqual(session["finalResult"]["status"], "lost_to_blackhole")

    def test_department_placement_has_current_furniture_metadata(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 100

        session, action, _ = buy_department(session, "quality", {"x": 2, "y": 12}, 0)
        placement = action["placement"]

        self.assertEqual(placement["subcellsPerCell"], 4)
        self.assertEqual(placement["furnitureVersion"], FURNITURE_LAYOUT_VERSION)
        self.assertEqual(placement["chunkCount"], 2)
        self.assertEqual(len(placement["occupiedCells"]), 32)
        self.assertGreaterEqual(len(placement["furniture"]), 8)
        self.assertGreaterEqual(len(placement["walls"]), 4)
        self.assertTrue(any(item["spriteId"] in {"desk", "woodDesk"} for item in placement["furniture"]))
        self.assertTrue(any(item["spriteId"] == "officeChair" for item in placement["furniture"]))

    def test_quality_office_alternates_mirrored_workstations(self) -> None:
        placement = create_department_placement("quality", {"x": 2, "y": 12}, 0)
        chair_flips = {
            bool(item.get("flipX"))
            for item in placement["furniture"]
            if item["spriteId"] == "officeChair"
        }

        self.assertEqual(chair_flips, {False, True})

    def test_mirrored_rooms_flip_corner_anchor_metadata(self) -> None:
        placement = create_department_placement("spawn", {"x": 4, "y": 8}, 90)

        self.assertTrue(
            any(
                item["spriteId"] == "plantTall" and item.get("anchor") == "ne"
                for item in placement["furniture"]
            )
        )

    def test_rotated_quality_footprint_stays_normalized(self) -> None:
        placement = create_department_placement("quality", {"x": 4, "y": 4}, 90)
        occupied = {(cell["x"], cell["y"]) for cell in placement["occupiedCells"]}

        self.assertEqual(placement["rotation"], 90)
        self.assertIn((4, 4), occupied)
        self.assertIn((7, 11), occupied)
        self.assertNotIn((8, 4), occupied)

    def test_legacy_world_and_placement_refresh_to_current_furniture_version(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 100
        session["world"]["blackholes"] = [
            {"id": "safe-hole-1", "x": 24, "y": 24, "dangerRadius": 0},
            {"id": "safe-hole-2", "x": 27, "y": 6, "dangerRadius": 0},
        ]
        session, action, _ = buy_department(session, "budget", {"x": 5, "y": 12}, 0)
        department = session["departments"][action["departmentId"]]
        department["placement"]["furnitureVersion"] = 1
        department["placement"]["furniture"] = []
        session["world"]["spawnOffice"]["furnitureVersion"] = 1
        session["world"]["size"] = 128
        session["world"]["subcellsPerCell"] = 8

        ensure_world(session)

        self.assertEqual(session["world"]["size"], 32)
        self.assertEqual(session["world"]["subcellsPerCell"], 4)
        self.assertEqual(session["world"]["spawnOffice"]["furnitureVersion"], FURNITURE_LAYOUT_VERSION)
        self.assertEqual(department["placement"]["furnitureVersion"], FURNITURE_LAYOUT_VERSION)
        self.assertTrue(department["placement"]["furniture"])

    def test_risk_vault_result_is_scored_server_side(self) -> None:
        session = new_session("COM0463-TEST")
        session, result, _ = record_minigame_result(
            session,
            {
                "minigameId": "risk_vault",
                "details": {"selected": ["r1", "r3", "r5"]},
            },
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["score"], 3)
        self.assertEqual(result["pointsEarned"], 70)
        self.assertEqual(session["minigameHistory"][-1]["minigameId"], "risk_vault")

    def test_stakeholder_booth_requires_the_best_choice_for_success(self) -> None:
        session = new_session("COM0463-TEST")
        session, result, _ = record_minigame_result(
            session,
            {
                "minigameId": "stakeholder_booth",
                "details": {"choiceId": "promise_later"},
            },
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["details"]["choiceLabel"], "Delay the update until after the sprint")

    def test_escape_check_succeeds_after_debug_completion(self) -> None:
        session = new_session("COM0463-TEST")
        session, _, _ = apply_debug_action(session, "build_all_departments")
        session, _, _ = apply_debug_action(session, "connect_to_light")

        session, result, _ = escape_check(session)

        self.assertTrue(result["eligible"])
        self.assertEqual(session["finalResult"]["status"], "escaped")
        self.assertTrue(session["departments"]["portal_room"]["built"])

    def test_department_cannot_be_placed_outside_32_by_32_world(self) -> None:
        session = new_session("COM0463-TEST")
        session["points"] = 100

        with self.assertRaises(RuleError):
            buy_department(session, "quality", {"x": 31, "y": 31}, 0)


if __name__ == "__main__":
    unittest.main()
