from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
import random
from typing import Any
from uuid import uuid4


CHUNK_COUNT = 32
SUBCELLS_PER_CELL = 4
WORLD_SIZE = CHUNK_COUNT
BLACKHOLE_DANGER_RADIUS = 2
PATH_BUILD_COST = 1
MAX_PLAYS_PER_MINIGAME = 2
STARTING_POINTS = 30

DEFAULT_RESOURCES = {
    "budget": 70,
    "team": 70,
    "quality": 70,
}

RESOURCE_LABELS = {
    "budget": "Budget",
    "team": "Team",
    "quality": "Quality",
}

SCENARIOS = [
    {
        "id": "SC-01",
        "minigameId": "scope_fog",
        "title": "Scope Fog",
        "points": 60,
        "successDelta": {"budget": 5, "team": 3, "quality": 6},
        "failDelta": {"budget": -10, "team": -5, "quality": -5},
    },
    {
        "id": "SC-02",
        "minigameId": "bug_rain",
        "title": "Bug Rain",
        "points": 70,
        "successDelta": {"budget": 0, "team": 4, "quality": 12},
        "failDelta": {"budget": -5, "team": -6, "quality": -15},
    },
    {
        "id": "SC-03",
        "minigameId": "budget_rift",
        "title": "Budget Rift",
        "points": 65,
        "successDelta": {"budget": 0, "team": 0, "quality": 0},
        "failDelta": {"budget": 0, "team": 0, "quality": 0},
    },
]

SCENARIOS_BY_MINIGAME = {item["minigameId"]: item for item in SCENARIOS}
SCENARIOS_BY_ID = {item["id"]: item for item in SCENARIOS}

BUDGET_RIFT_CHOICES = {
    "budget_patch": {
        "label": "Stabilize procurement",
        "resourceDelta": {"budget": 15, "team": -4, "quality": 0},
    },
    "team_sync": {
        "label": "Protect the team",
        "resourceDelta": {"budget": -6, "team": 14, "quality": 2},
    },
    "quality_gate": {
        "label": "Fund quality gates",
        "resourceDelta": {"budget": -8, "team": 0, "quality": 16},
    },
}

REQUIRED_DEPARTMENT_IDS = [
    "scope_desk",
    "bug_lab",
    "sprint_floor",
    "risk_vault",
    "stakeholder_booth",
]

PORTAL_ROOM_ID = "portal_room"

DEPARTMENT_WORLD_CELLS = {
    "scope_desk": {"x": 2, "y": 14},
    "bug_lab": {"x": 2, "y": 17},
    "sprint_floor": {"x": 5, "y": 15},
    "risk_vault": {"x": 8, "y": 13},
    "stakeholder_booth": {"x": 8, "y": 18},
    PORTAL_ROOM_ID: {"x": 30, "y": 16},
}

DEPARTMENT_FOOTPRINTS = {
    "scope_desk": {
        "label": "#_/##",
        "cells": [{"x": 0, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 1}],
    },
    "bug_lab": {
        "label": "##_/_#",
        "cells": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 1, "y": 1}],
    },
    "sprint_floor": {
        "label": "##_#_",
        "cells": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}],
    },
    "risk_vault": {
        "label": "#/#/#",
        "cells": [{"x": 0, "y": 0}, {"x": 0, "y": 1}, {"x": 0, "y": 2}],
    },
    "stakeholder_booth": {
        "label": "##_#_",
        "cells": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}],
    },
    PORTAL_ROOM_ID: {
        "label": "##/##",
        "cells": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 1}],
    },
}

# A "room" (a.k.a. subcell) is a ROOM_SIZE x ROOM_SIZE block of normal cells.
# An office occupies whole rooms, not a subdivided single cell.
ROOM_SIZE = 4

# Office expansion shape presets in ROOM offsets. An expansion covers 1-3 rooms;
# the shape is picked randomly when placing, then rotatable.
EXPANSION_PRESETS = {
    "single": [{"x": 0, "y": 0}],
    "duo_h": [{"x": 0, "y": 0}, {"x": 1, "y": 0}],
    "duo_v": [{"x": 0, "y": 0}, {"x": 0, "y": 1}],
    "ell": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}],
    "row": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 2, "y": 0}],
}
EXPANSION_PRESET_IDS = list(EXPANSION_PRESETS)

# Cost scales with how many rooms the rolled shape covers.
CHUNK_PRICE = {1: 25, 2: 45, 3: 65}

# Real Habbo furniture sprite keys (match client FURNI palette).
# Desktop devices always sit ON a desk (rendered lifted), never on the floor.
DESK_SURFACE = "desk"
DESKTOP_ITEMS = ["monitor", "laptop", "imac"]
STANDALONE_FURNITURE = [
    "chair", "officeChair", "plant", "plantTall", "lamp",
    "shelf", "books", "coffeeTable", "sofa", "table", "woodDesk",
]
OFFICE_FURNITURE = [DESK_SURFACE] + DESKTOP_ITEMS + STANDALONE_FURNITURE


def expansion_cost(chunk_count: int) -> int:
    return CHUNK_PRICE.get(int(chunk_count), CHUNK_PRICE[max(CHUNK_PRICE)])


DEPARTMENT_CATALOG = [
    {
        "id": "scope_desk",
        "name": "Scope Desk",
        "price": 40,
        "upgradePrice": 30,
        "resourceEffect": {"budget": 5, "team": 0, "quality": 8},
        "upgradeEffect": {"budget": 4, "team": 2, "quality": 5},
        "meaning": "Clarifies must-have work before the project spends effort.",
        "gridArea": "scope",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS["scope_desk"]),
    },
    {
        "id": "bug_lab",
        "name": "Bug Lab",
        "price": 45,
        "upgradePrice": 34,
        "resourceEffect": {"budget": -4, "team": 2, "quality": 15},
        "upgradeEffect": {"budget": -3, "team": 3, "quality": 9},
        "meaning": "Turns quality work into visible project protection.",
        "gridArea": "quality",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS["bug_lab"]),
    },
    {
        "id": "sprint_floor",
        "name": "Sprint Floor",
        "price": 50,
        "upgradePrice": 38,
        "resourceEffect": {"budget": -5, "team": 15, "quality": 4},
        "upgradeEffect": {"budget": -4, "team": 9, "quality": 4},
        "meaning": "Shows how coordination and velocity depend on team health.",
        "gridArea": "team",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS["sprint_floor"]),
    },
    {
        "id": "risk_vault",
        "name": "Risk Vault",
        "price": 55,
        "upgradePrice": 42,
        "resourceEffect": {"budget": 10, "team": -2, "quality": 6},
        "upgradeEffect": {"budget": 8, "team": 0, "quality": 4},
        "meaning": "Stores warnings before they become expensive surprises.",
        "gridArea": "risk",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS["risk_vault"]),
    },
    {
        "id": "stakeholder_booth",
        "name": "Stakeholder Booth",
        "price": 50,
        "upgradePrice": 38,
        "resourceEffect": {"budget": 5, "team": 10, "quality": 3},
        "upgradeEffect": {"budget": 4, "team": 7, "quality": 3},
        "meaning": "Makes communication decisions part of the build strategy.",
        "gridArea": "stakeholder",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS["stakeholder_booth"]),
    },
    {
        "id": PORTAL_ROOM_ID,
        "name": "Portal Room",
        "price": 0,
        "upgradePrice": 0,
        "resourceEffect": {"budget": 0, "team": 0, "quality": 0},
        "upgradeEffect": {"budget": 0, "team": 0, "quality": 0},
        "meaning": "Opens only when the office is complete and balanced.",
        "gridArea": "portal",
        "footprint": deepcopy(DEPARTMENT_FOOTPRINTS[PORTAL_ROOM_ID]),
        "portal": True,
    },
]


class RuleError(ValueError):
    """Raised for client-correctable game rule failures."""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp(value: int, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, int(value)))


def clamp_int(value: Any, low: int, high: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = low
    return max(low, min(high, parsed))


def new_departments() -> dict[str, dict[str, Any]]:
    departments: dict[str, dict[str, Any]] = {}
    for item in DEPARTMENT_CATALOG:
        department = deepcopy(item)
        department["built"] = False
        department["level"] = 0
        department["builtAt"] = None
        department["worldCell"] = None
        department["placement"] = None
        departments[department["id"]] = department
    return departments


def coord_key(x: int, y: int) -> str:
    return f"{x},{y}"


def distance(a: dict[str, int], b: dict[str, int]) -> int:
    return max(abs(a["x"] - b["x"]), abs(a["y"] - b["y"]))


def world_start() -> dict[str, int]:
    return {"x": 1, "y": WORLD_SIZE // 2}


def world_end() -> dict[str, int]:
    return {"x": WORLD_SIZE - 2, "y": WORLD_SIZE // 2}


def normalize_rotation(value: Any) -> int:
    rotation = clamp_int(value, 0, 270)
    if rotation not in {0, 90, 180, 270}:
        rotation = min((0, 90, 180, 270), key=lambda item: abs(item - rotation))
    return rotation


def rotated_offsets(department_id: str, rotation: int) -> list[dict[str, int]]:
    footprint = DEPARTMENT_FOOTPRINTS.get(department_id, {"cells": [{"x": 0, "y": 0}]})
    cells = deepcopy(footprint["cells"])
    rotation = normalize_rotation(rotation)
    rotated: list[dict[str, int]] = []

    for cell in cells:
        x = int(cell["x"])
        y = int(cell["y"])
        if rotation == 90:
            x, y = y, -x
        elif rotation == 180:
            x, y = -x, -y
        elif rotation == 270:
            x, y = -y, x
        rotated.append({"x": x, "y": y})

    min_x = min(cell["x"] for cell in rotated)
    min_y = min(cell["y"] for cell in rotated)
    normalized = [{"x": cell["x"] - min_x, "y": cell["y"] - min_y} for cell in rotated]
    return sorted(normalized, key=lambda cell: (cell["y"], cell["x"]))


def rotate_offsets(cells: list[dict[str, int]], rotation: int) -> list[dict[str, int]]:
    """Rotate an arbitrary set of chunk offsets and re-normalise to origin."""
    rotation = normalize_rotation(rotation)
    rotated: list[dict[str, int]] = []
    for cell in cells:
        x = int(cell["x"])
        y = int(cell["y"])
        if rotation == 90:
            x, y = y, -x
        elif rotation == 180:
            x, y = -x, -y
        elif rotation == 270:
            x, y = -y, x
        rotated.append({"x": x, "y": y})
    min_x = min(cell["x"] for cell in rotated)
    min_y = min(cell["y"] for cell in rotated)
    normalized = [{"x": cell["x"] - min_x, "y": cell["y"] - min_y} for cell in rotated]
    return sorted(normalized, key=lambda cell: (cell["y"], cell["x"]))


def preset_offsets(preset_id: str, rotation: int) -> list[dict[str, int]]:
    cells = EXPANSION_PRESETS.get(preset_id, EXPANSION_PRESETS["single"])
    return rotate_offsets(cells, rotation)


def room_count_for_preset(preset_id: str, rotation: int) -> int:
    return len(preset_offsets(preset_id, rotation))


def occupied_cells_for_preset(
    preset_id: str, anchor_cell: dict[str, int], rotation: int
) -> list[dict[str, int]]:
    """Expand a room-offset preset into every normal cell it covers. Each room is
    a ROOM_SIZE x ROOM_SIZE block of cells."""
    anchor_x = int(anchor_cell["x"])
    anchor_y = int(anchor_cell["y"])
    cells: list[dict[str, int]] = []
    for room in preset_offsets(preset_id, rotation):
        base_x = anchor_x + room["x"] * ROOM_SIZE
        base_y = anchor_y + room["y"] * ROOM_SIZE
        for dy in range(ROOM_SIZE):
            for dx in range(ROOM_SIZE):
                cells.append({"x": base_x + dx, "y": base_y + dy})
    return cells


def generate_office_furniture(
    cells: list[dict[str, int]], rng: random.Random
) -> list[dict[str, Any]]:
    """Scatter furniture across the room's interior cells (one piece per cell),
    keeping the north/west edge cells clear for the back walls."""
    cellset = {(int(c["x"]), int(c["y"])) for c in cells}

    def is_back_edge(x: int, y: int) -> bool:
        return (x - 1, y) not in cellset or (x, y - 1) not in cellset

    interior = [(x, y) for (x, y) in cellset if not is_back_edge(x, y)]
    if not interior:
        interior = list(cellset)
    room_count = max(1, len(cells) // (ROOM_SIZE * ROOM_SIZE))
    target = min(len(interior), room_count * rng.randint(4, 6))
    chosen = rng.sample(interior, target) if target else []

    items: list[dict[str, Any]] = []
    for x, y in sorted(chosen, key=lambda c: (c[1], c[0])):
        cell = {"x": x, "y": y}
        if rng.random() < 0.45:
            # Workstation: a desk with a computer sitting on top of it.
            items.append({"cell": cell, "spriteId": DESK_SURFACE})
            items.append({"cell": cell, "spriteId": rng.choice(DESKTOP_ITEMS), "lift": 1.6})
        else:
            items.append({"cell": cell, "spriteId": rng.choice(STANDALONE_FURNITURE)})
    return items


def occupied_cells_for_placement(
    department_id: str, anchor_cell: dict[str, int], rotation: int
) -> list[dict[str, int]]:
    anchor_x = int(anchor_cell["x"])
    anchor_y = int(anchor_cell["y"])
    return [
        {
            "x": anchor_x + offset["x"],
            "y": anchor_y + offset["y"],
            "offsetX": offset["x"],
            "offsetY": offset["y"],
        }
        for offset in rotated_offsets(department_id, rotation)
    ]


def clamp_anchor_for_department(
    department_id: str, anchor_cell: dict[str, Any], rotation: int
) -> dict[str, int]:
    offsets = rotated_offsets(department_id, rotation)
    max_offset_x = max(offset["x"] for offset in offsets)
    max_offset_y = max(offset["y"] for offset in offsets)
    return {
        "x": clamp_int(anchor_cell.get("x"), 0, WORLD_SIZE - 1 - max_offset_x),
        "y": clamp_int(anchor_cell.get("y"), 0, WORLD_SIZE - 1 - max_offset_y),
    }


def subcell_stack_for_cell(department_id: str, cell: dict[str, int]) -> list[dict[str, Any]]:
    center = SUBCELLS_PER_CELL // 2
    return [
        {
            "cell": {"x": cell["x"], "y": cell["y"]},
            "subcell": {"x": center, "y": center},
            "sprites": [
                {"id": "department_floor", "layer": "floor"},
                {"id": department_id, "layer": "object"},
            ],
        },
        {
            "cell": {"x": cell["x"], "y": cell["y"]},
            "subcell": {"x": max(0, center - 1), "y": center},
            "sprites": [
                {"id": "status_decal", "layer": "decal"},
                {"id": f"{department_id}_glow", "layer": "effect"},
            ],
        },
    ]


def perimeter_walls(occupied_cells: list[dict[str, int]]) -> list[dict[str, Any]]:
    occupied = {coord_key(cell["x"], cell["y"]) for cell in occupied_cells}
    walls: list[dict[str, Any]] = []
    for cell in occupied_cells:
        for edge, neighbor, subcell in [
            ("north", coord_key(cell["x"], cell["y"] - 1), {"x": 0, "y": 0}),
            ("west", coord_key(cell["x"] - 1, cell["y"]), {"x": 0, "y": 0}),
        ]:
            if neighbor not in occupied:
                walls.append(
                    {
                        "cell": {"x": cell["x"], "y": cell["y"]},
                        "edge": edge,
                        "subcell": subcell,
                        "sprites": [{"id": f"wall_{edge}", "layer": "wall"}],
                    }
                )
    return walls


def create_department_placement(
    department_id: str,
    anchor_cell: dict[str, int],
    rotation: int,
    preset_id: str = "single",
    seed: str | None = None,
) -> dict[str, Any]:
    normalized_rotation = normalize_rotation(rotation)
    if preset_id not in EXPANSION_PRESETS:
        preset_id = "single"
    occupied_cells = occupied_cells_for_preset(preset_id, anchor_cell, normalized_rotation)
    rng = random.Random(
        seed or f"{department_id}:{anchor_cell.get('x')},{anchor_cell.get('y')}:{preset_id}:{normalized_rotation}"
    )
    return {
        "anchorCell": {"x": int(anchor_cell["x"]), "y": int(anchor_cell["y"])},
        "rotation": normalized_rotation,
        "presetId": preset_id,
        "chunkCount": room_count_for_preset(preset_id, normalized_rotation),
        "occupiedCells": occupied_cells,
        "furniture": generate_office_furniture(occupied_cells, rng),
        "spriteStacks": [],
        "walls": perimeter_walls(occupied_cells),
        "subcellsPerCell": SUBCELLS_PER_CELL,
    }


def department_cells(department: dict[str, Any]) -> list[dict[str, int]]:
    placement = department.get("placement") if isinstance(department.get("placement"), dict) else None
    if placement and isinstance(placement.get("occupiedCells"), list):
        return [
            {"x": int(cell["x"]), "y": int(cell["y"])}
            for cell in placement["occupiedCells"]
            if isinstance(cell, dict) and "x" in cell and "y" in cell
        ]
    cell = department.get("worldCell")
    if department.get("built") and isinstance(cell, dict) and "x" in cell and "y" in cell:
        return [{"x": int(cell["x"]), "y": int(cell["y"])}]
    return []


def department_at_cell(
    session: dict[str, Any], x: int, y: int, excluding_department_id: str | None = None
) -> dict[str, Any] | None:
    for department_id, department in session.get("departments", {}).items():
        if department_id == excluding_department_id or not department.get("built"):
            continue
        if any(cell["x"] == x and cell["y"] == y for cell in department_cells(department)):
            return department
    return None


def office_cell_keys(session: dict[str, Any]) -> set[str]:
    """All normal cells occupied by offices (spawn room + built departments)."""
    keys: set[str] = set()
    spawn = session.get("world", {}).get("spawnOffice")
    if isinstance(spawn, dict):
        for cell in spawn.get("cells", []):
            keys.add(coord_key(int(cell["x"]), int(cell["y"])))
    for department in session.get("departments", {}).values():
        if department.get("built"):
            for cell in department_cells(department):
                keys.add(coord_key(cell["x"], cell["y"]))
    return keys


def placement_touches_buildable(buildable: set[str], occupied_cells: list[dict[str, int]]) -> bool:
    own = {coord_key(int(c["x"]), int(c["y"])) for c in occupied_cells}
    for cell in occupied_cells:
        neighbors = [
            coord_key(cell["x"] + 1, cell["y"]),
            coord_key(cell["x"] - 1, cell["y"]),
            coord_key(cell["x"], cell["y"] + 1),
            coord_key(cell["x"], cell["y"] - 1),
        ]
        if any(neighbor in buildable and neighbor not in own for neighbor in neighbors):
            return True
    return False


def cell_touches_blackhole_danger(world: dict[str, Any], x: int, y: int) -> dict[str, Any] | None:
    for blackhole in world.get("blackholes", []):
        radius = float(blackhole.get("dangerRadius", BLACKHOLE_DANGER_RADIUS))
        center_x = float(blackhole["x"]) + 0.5
        center_y = float(blackhole["y"]) + 0.5
        min_dx = max(float(x) - center_x, 0.0, center_x - float(x + 1))
        min_dy = max(float(y) - center_y, 0.0, center_y - float(y + 1))
        if max(min_dx, min_dy) <= radius:
            return blackhole
    return None


def validate_department_placement(
    session: dict[str, Any], department_id: str, placement: dict[str, Any]
) -> None:
    world = session["world"]
    end_key = coord_key(world["end"]["x"], world["end"]["y"])
    path = set(world.get("builtPath", []))
    offices = office_cell_keys(session)

    for cell in placement["occupiedCells"]:
        x = int(cell["x"])
        y = int(cell["y"])
        key = coord_key(x, y)
        if not in_world_bounds(world, x, y):
            raise RuleError("Office must stay inside the 32x32 world.")
        if key == end_key or key in path:
            raise RuleError("Offices cannot overlap the corridor or the nebula gate.")
        if key in offices:
            raise RuleError("Offices cannot overlap the spawn office or another department.")
        if cell_touches_blackhole_danger(world, x, y):
            raise RuleError("Offices cannot touch blackhole gravity fields.")

    buildable = path | offices
    if not placement_touches_buildable(buildable, placement["occupiedCells"]):
        raise RuleError("Place the office next to your corridor or an existing office.")


def reserved_world_cells() -> list[dict[str, int]]:
    return [
        world_start(),
        world_end(),
        *deepcopy(list(DEPARTMENT_WORLD_CELLS.values())),
    ]


def generate_blackholes(seed: str) -> list[dict[str, Any]]:
    rng = random.Random(seed)
    count = rng.randint(2, 3)
    blackholes: list[dict[str, Any]] = []
    reserved = reserved_world_cells()
    attempts = 0

    while len(blackholes) < count and attempts < 400:
        attempts += 1
        candidate = {
            "x": rng.randint(7, WORLD_SIZE - 7),
            "y": rng.randint(5, WORLD_SIZE - 6),
        }
        if any(distance(candidate, cell) <= 5 for cell in reserved):
            continue
        if any(distance(candidate, hole) <= 7 for hole in blackholes):
            continue
        blackholes.append(
            {
                "id": f"blackhole_{len(blackholes) + 1}",
                "x": candidate["x"],
                "y": candidate["y"],
                "dangerRadius": BLACKHOLE_DANGER_RADIUS,
            }
        )

    return blackholes


def starting_office(start: dict[str, int]) -> list[str]:
    """A small pre-built office room the player expands from, instead of a
    single lonely tile. Stays inside the grid and ends at the front door so the
    player marker faces the void."""
    sx, sy = start["x"], start["y"]
    offsets = [(0, -1), (1, -1), (0, 0), (1, 0), (0, 1), (1, 1), (2, 0)]
    cells: list[str] = []
    for ox, oy in offsets:
        x, y = sx + ox, sy + oy
        if 0 <= x < WORLD_SIZE and 0 <= y < WORLD_SIZE:
            key = coord_key(x, y)
            if key not in cells:
                cells.append(key)
    return cells


def new_world(seed: str) -> dict[str, Any]:
    start = world_start()
    end = world_end()
    return {
        "size": WORLD_SIZE,
        "subcellsPerCell": SUBCELLS_PER_CELL,
        "theme": "darkness_to_nebula",
        "start": start,
        "end": end,
        "pathBuildCost": PATH_BUILD_COST,
        "blackholes": generate_blackholes(seed),
        "builtPath": [coord_key(start["x"], start["y"])],
        "spawnOffice": build_spawn_office({"start": start}, seed),
        "connectedToLight": False,
        "lostToBlackhole": None,
    }


def ensure_world(session: dict[str, Any]) -> dict[str, Any]:
    if "world" not in session:
        session["world"] = new_world(session.get("sessionId", "legacy-world"))
    world = session["world"]
    world["size"] = WORLD_SIZE
    world["subcellsPerCell"] = SUBCELLS_PER_CELL
    world["theme"] = world.get("theme") or "darkness_to_nebula"
    world["start"] = world_start()
    world["end"] = world_end()
    world["pathBuildCost"] = PATH_BUILD_COST
    world.setdefault("lostToBlackhole", None)
    world.setdefault("connectedToLight", False)
    world.setdefault("blackholes", [])
    normalized_path = normalize_path_cells(world, world.get("builtPath", []))
    start_key = coord_key(world["start"]["x"], world["start"]["y"])
    if start_key not in normalized_path:
        normalized_path.insert(0, start_key)
    world["builtPath"] = normalized_path
    world["connectedToLight"] = coord_key(world["end"]["x"], world["end"]["y"]) in world["builtPath"]
    if not world["blackholes"]:
        world["blackholes"] = generate_blackholes(session.get("sessionId", "legacy-world"))
    for index, blackhole in enumerate(world["blackholes"], start=1):
        blackhole["id"] = blackhole.get("id") or f"blackhole_{index}"
        blackhole["x"] = clamp_int(blackhole.get("x"), 0, WORLD_SIZE - 1)
        blackhole["y"] = clamp_int(blackhole.get("y"), 0, WORLD_SIZE - 1)
        blackhole["dangerRadius"] = clamp_int(
            blackhole.get("dangerRadius", BLACKHOLE_DANGER_RADIUS), 0, 8
        )
    # Spawn office: a single furnished chunk the player expands from.
    if not isinstance(world.get("spawnOffice"), dict):
        world["spawnOffice"] = build_spawn_office(world, session.get("sessionId", "spawn"))

    if "departments" in session:
        for department_id, department in session["departments"].items():
            department.setdefault("footprint", deepcopy(DEPARTMENT_FOOTPRINTS.get(department_id, {"cells": [{"x": 0, "y": 0}]})))
            department.setdefault("worldCell", None)
            department.setdefault("placement", None)
            # Only synthesise a placement for legacy built departments missing one.
            # Stored placements (shape + furniture) are preserved as authored.
            if department.get("built") and not isinstance(department.get("placement"), dict):
                anchor = department.get("worldCell") or deepcopy(DEPARTMENT_WORLD_CELLS.get(department_id, world_start()))
                anchor = anchor if isinstance(anchor, dict) else world_start()
                anchor = {"x": clamp_int(anchor.get("x"), 0, WORLD_SIZE - 1), "y": clamp_int(anchor.get("y"), 0, WORLD_SIZE - 1)}
                department["placement"] = create_department_placement(department_id, anchor, 0, "single")
            if isinstance(department.get("placement"), dict):
                department["placement"].setdefault("furniture", [])
                department["placement"].setdefault("walls", [])
                department["worldCell"] = deepcopy(department["placement"]["anchorCell"])
    return session


def build_spawn_office(world: dict[str, Any], seed: str) -> dict[str, Any]:
    """The spawn office is one room (ROOM_SIZE x ROOM_SIZE cells) anchored at the
    start cell, which sits at its top-left corner."""
    start = world.get("start", world_start())
    ax, ay = int(start["x"]), int(start["y"])
    cells = [
        {"x": ax + dx, "y": ay + dy}
        for dy in range(ROOM_SIZE)
        for dx in range(ROOM_SIZE)
        if 0 <= ax + dx < WORLD_SIZE and 0 <= ay + dy < WORLD_SIZE
    ]
    rng = random.Random(f"{seed}:spawn-office")
    return {
        "cells": cells,
        "walls": perimeter_walls(cells),
        "furniture": generate_office_furniture(cells, rng),
    }


def new_session(student_id: str | None = None) -> dict[str, Any]:
    timestamp = now_iso()
    clean_student_id = (student_id or "").strip() or "CLASS-ID"
    session_id = f"vot-{uuid4().hex[:10]}"

    return {
        "sessionId": session_id,
        "studentId": clean_student_id[:80],
        "createdAt": timestamp,
        "updatedAt": timestamp,
        "points": STARTING_POINTS,
        "resources": deepcopy(DEFAULT_RESOURCES),
        "departments": new_departments(),
        "world": new_world(session_id),
        "currentScenarioIndex": 0,
        "minigameHistory": [],
        "choiceLog": [],
        "paused": False,
        "finalResult": None,
    }


def current_scenario(session: dict[str, Any]) -> dict[str, Any]:
    index = int(session.get("currentScenarioIndex", 0)) % len(SCENARIOS)
    return deepcopy(SCENARIOS[index])


def normalize_scenario_id(value: str | None, session: dict[str, Any]) -> dict[str, Any]:
    if not value:
        return current_scenario(session)
    if value in SCENARIOS_BY_MINIGAME:
        return deepcopy(SCENARIOS_BY_MINIGAME[value])
    if value in SCENARIOS_BY_ID:
        return deepcopy(SCENARIOS_BY_ID[value])
    raise RuleError(f"Unknown minigame id: {value}")


def apply_resource_delta(session: dict[str, Any], delta: dict[str, int]) -> None:
    for key in DEFAULT_RESOURCES:
        session["resources"][key] = clamp(session["resources"].get(key, 0) + delta.get(key, 0))


def touch(session: dict[str, Any]) -> None:
    session["updatedAt"] = now_iso()


def check_collapse(session: dict[str, Any]) -> None:
    ensure_world(session)
    if session.get("finalResult"):
        return

    collapsed = [key for key, value in session["resources"].items() if value <= 0]
    if not collapsed:
        return

    labels = ", ".join(RESOURCE_LABELS.get(key, key) for key in collapsed)
    session["finalResult"] = {
        "status": "collapsed",
        "escaped": False,
        "timestamp": now_iso(),
        "reason": f"The office collapsed because {labels} reached zero.",
    }


def ensure_action_allowed(session: dict[str, Any]) -> None:
    ensure_world(session)
    if session.get("paused"):
        raise RuleError("The session is paused.")
    if session.get("finalResult"):
        raise RuleError("The session already has a final result.")


def make_log_entry(
    session: dict[str, Any],
    *,
    minigame_id: str | None,
    department_built: str | None,
    resource_change: dict[str, int],
    debug_action: str | None = None,
) -> dict[str, Any]:
    entry = {
        "studentId": session["studentId"],
        "minigameId": minigame_id,
        "departmentBuilt": department_built,
        "resourceChange": deepcopy(resource_change),
        "timestamp": now_iso(),
        "finalResult": deepcopy(session.get("finalResult")),
    }
    if debug_action:
        entry["debugAction"] = debug_action
    return entry


def record_minigame_result(
    session: dict[str, Any], payload: dict[str, Any]
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    ensure_world(session)
    ensure_action_allowed(session)

    scenario = normalize_scenario_id(payload.get("minigameId"), session)

    # Enforce per-minigame play limit
    play_count = sum(
        1 for entry in session.get("minigameHistory", [])
        if entry.get("minigameId") == scenario["minigameId"]
    )
    if play_count >= MAX_PLAYS_PER_MINIGAME:
        raise RuleError(
            f"{scenario['title']} has already been played {MAX_PLAYS_PER_MINIGAME} times."
        )

    details = payload.get("details") if isinstance(payload.get("details"), dict) else {}
    success = bool(payload.get("success"))
    resource_delta = deepcopy(scenario["successDelta"] if success else scenario["failDelta"])

    if scenario["minigameId"] == "budget_rift":
        choice_id = details.get("choiceId")
        if choice_id not in BUDGET_RIFT_CHOICES:
            raise RuleError("Budget Rift requires a valid choiceId.")
        resource_delta = deepcopy(BUDGET_RIFT_CHOICES[choice_id]["resourceDelta"])
        projected = {
            key: clamp(session["resources"][key] + resource_delta.get(key, 0))
            for key in DEFAULT_RESOURCES
        }
        success = all(value >= 50 for value in projected.values())
        details["choiceLabel"] = BUDGET_RIFT_CHOICES[choice_id]["label"]

    # Budget Rift is a judgement call rather than a skill check: making a choice
    # always earns its points, while the resource trade-off is the real lesson.
    awards_points = success or scenario["minigameId"] == "budget_rift"
    points_earned = scenario["points"] if awards_points else 0
    session["points"] += points_earned
    apply_resource_delta(session, resource_delta)
    session["currentScenarioIndex"] = (int(session.get("currentScenarioIndex", 0)) + 1) % len(SCENARIOS)

    result = {
        "minigameId": scenario["minigameId"],
        "scenarioId": scenario["id"],
        "title": scenario["title"],
        "success": success,
        "score": int(payload.get("score", 0)),
        "pointsEarned": points_earned,
        "resourceChange": resource_delta,
        "details": details,
        "timestamp": now_iso(),
    }
    session["minigameHistory"].append(result)

    check_collapse(session)
    log_entry = make_log_entry(
        session,
        minigame_id=scenario["id"],
        department_built=None,
        resource_change=resource_delta,
    )
    session["choiceLog"].append(log_entry)
    touch(session)
    return session, result, log_entry


def buy_department(
    session: dict[str, Any],
    department_id: str,
    anchor_cell: dict[str, Any] | None = None,
    rotation: int = 0,
    preset_id: str = "single",
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    ensure_world(session)
    ensure_action_allowed(session)

    departments = session.get("departments", {})
    if department_id == PORTAL_ROOM_ID:
        raise RuleError("The Portal Room opens through the escape check.")
    if department_id not in departments:
        raise RuleError(f"Unknown department id: {department_id}")

    department = departments[department_id]
    is_upgrade = bool(department.get("built"))
    if is_upgrade and department.get("level", 0) >= 2:
        raise RuleError(f"{department['name']} is already fully upgraded.")

    resource_delta = deepcopy(department["upgradeEffect"] if is_upgrade else department["resourceEffect"])
    placement = department.get("placement")
    if not is_upgrade:
        if not isinstance(anchor_cell, dict):
            raise RuleError("anchorCell is required when placing a new department.")
        anchor = {
            "x": clamp_int(anchor_cell.get("x"), 0, WORLD_SIZE - 1),
            "y": clamp_int(anchor_cell.get("y"), 0, WORLD_SIZE - 1),
        }
        seed = f"{session.get('sessionId')}:{department_id}:{anchor['x']},{anchor['y']}:{preset_id}:{rotation}"
        placement = create_department_placement(department_id, anchor, rotation, preset_id, seed=seed)
        validate_department_placement(session, department_id, placement)
        price = expansion_cost(placement["chunkCount"])
    else:
        price = department["upgradePrice"]

    if session["points"] < price:
        raise RuleError(f"Not enough points for {department['name']}.")

    session["points"] -= price
    department["built"] = True
    department["level"] = 2 if is_upgrade else 1
    department["builtAt"] = department["builtAt"] or now_iso()
    department["lastChangedAt"] = now_iso()
    if placement:
        department["placement"] = deepcopy(placement)
        department["worldCell"] = deepcopy(placement["anchorCell"])
    apply_resource_delta(session, resource_delta)

    action = {
        "departmentId": department_id,
        "departmentName": department["name"],
        "action": "upgrade" if is_upgrade else "build",
        "cost": price,
        "resourceChange": resource_delta,
        "placement": deepcopy(department.get("placement")),
        "timestamp": now_iso(),
    }

    check_collapse(session)
    log_entry = make_log_entry(
        session,
        minigame_id=None,
        department_built=department["name"],
        resource_change=resource_delta,
    )
    session["choiceLog"].append(log_entry)
    touch(session)
    return session, action, log_entry


def set_pause(session: dict[str, Any], paused: bool) -> dict[str, Any]:
    ensure_world(session)
    session["paused"] = bool(paused)
    touch(session)
    return session


def in_world_bounds(world: dict[str, Any], x: int, y: int) -> bool:
    size = int(world.get("size", WORLD_SIZE))
    return 0 <= x < size and 0 <= y < size


def is_near_blackhole(world: dict[str, Any], x: int, y: int) -> dict[str, Any] | None:
    return cell_touches_blackhole_danger(world, x, y)


def is_adjacent_to_path(world: dict[str, Any], x: int, y: int) -> bool:
    path = set(world.get("builtPath", []))
    neighbors = [
        coord_key(x + 1, y),
        coord_key(x - 1, y),
        coord_key(x, y + 1),
        coord_key(x, y - 1),
    ]
    return any(item in path for item in neighbors)


def update_light_connection(world: dict[str, Any], x: int, y: int) -> None:
    end = world["end"]
    if distance({"x": x, "y": y}, end) <= 1:
        world["connectedToLight"] = True
        end_key = coord_key(end["x"], end["y"])
        if end_key not in world["builtPath"]:
            world["builtPath"].append(end_key)


def build_world_cell(
    session: dict[str, Any], x: int, y: int
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    ensure_world(session)
    ensure_action_allowed(session)

    world = session["world"]
    if not in_world_bounds(world, x, y):
        raise RuleError("That cell is outside the 32x32 office grid.")

    cell_key = coord_key(x, y)
    offices = office_cell_keys(session)
    if cell_key in world.get("builtPath", []):
        raise RuleError("That path tile is already built.")
    if cell_key in offices:
        raise RuleError("Corridors cannot run through an office.")
    buildable = set(world.get("builtPath", [])) | offices
    neighbors = [coord_key(x + 1, y), coord_key(x - 1, y), coord_key(x, y + 1), coord_key(x, y - 1)]
    if not any(n in buildable for n in neighbors):
        raise RuleError("Build the corridor outward from your office or path.")

    blackhole = is_near_blackhole(world, x, y)
    if blackhole:
        world["lostToBlackhole"] = {"x": x, "y": y, "blackholeId": blackhole["id"]}
        session["finalResult"] = {
            "status": "lost_to_blackhole",
            "escaped": False,
            "timestamp": now_iso(),
            "reason": "The path touched a blackhole gravity field and the office was swallowed.",
        }
        log_entry = make_log_entry(
            session,
            minigame_id=None,
            department_built=f"Unsafe path {cell_key}",
            resource_change={},
        )
        session["choiceLog"].append(log_entry)
        touch(session)
        return session, {
            "built": False,
            "lost": True,
            "x": x,
            "y": y,
            "cost": 0,
            "connectedToLight": False,
        }, log_entry

    if session["points"] < PATH_BUILD_COST:
        raise RuleError(f"Path tiles cost {PATH_BUILD_COST} points.")

    session["points"] -= PATH_BUILD_COST
    world["builtPath"].append(cell_key)
    update_light_connection(world, x, y)

    action = {
        "built": True,
        "lost": False,
        "x": x,
        "y": y,
        "cost": PATH_BUILD_COST,
        "connectedToLight": world.get("connectedToLight", False),
    }
    log_entry = make_log_entry(
        session,
        minigame_id=None,
        department_built=f"Path {cell_key}",
        resource_change={},
    )
    session["choiceLog"].append(log_entry)
    touch(session)
    return session, action, log_entry


def missing_escape_requirements(session: dict[str, Any]) -> list[str]:
    ensure_world(session)
    missing: list[str] = []
    if not session["world"].get("connectedToLight"):
        missing.append("Build a safe path from the office core to the nebula gate")

    for department_id in REQUIRED_DEPARTMENT_IDS:
        department = session["departments"][department_id]
        if not department.get("built"):
            missing.append(f"Build {department['name']}")

    for resource, value in session["resources"].items():
        if value < 50:
            missing.append(f"Raise {RESOURCE_LABELS[resource]} to at least 50")

    return missing


def escape_check(session: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    ensure_world(session)
    if session.get("finalResult") and session["finalResult"].get("status") == "collapsed":
        result = {
            "eligible": False,
            "missing": ["The office has already collapsed."],
            "finalResult": session["finalResult"],
        }
        return session, result, make_log_entry(session, minigame_id=None, department_built=None, resource_change={})

    missing = missing_escape_requirements(session)
    eligible = len(missing) == 0
    if eligible and not session.get("finalResult"):
        session["departments"][PORTAL_ROOM_ID]["built"] = True
        session["departments"][PORTAL_ROOM_ID]["level"] = 1
        session["departments"][PORTAL_ROOM_ID]["builtAt"] = now_iso()
        portal_placement = create_department_placement(
            PORTAL_ROOM_ID, DEPARTMENT_WORLD_CELLS[PORTAL_ROOM_ID], 0
        )
        session["departments"][PORTAL_ROOM_ID]["placement"] = portal_placement
        session["departments"][PORTAL_ROOM_ID]["worldCell"] = deepcopy(portal_placement["anchorCell"])
        session["finalResult"] = {
            "status": "escaped",
            "escaped": True,
            "timestamp": now_iso(),
            "reason": "The Portal Room opened and the office escaped the void.",
        }

    result = {
        "eligible": eligible,
        "missing": missing,
        "finalResult": deepcopy(session.get("finalResult")),
    }
    log_entry = make_log_entry(
        session,
        minigame_id=None,
        department_built="Portal Room" if eligible else None,
        resource_change={},
    )
    session["choiceLog"].append(log_entry)
    touch(session)
    return session, result, log_entry


def built_departments(session: dict[str, Any]) -> list[dict[str, Any]]:
    ensure_world(session)
    return [
        deepcopy(department)
        for department in session["departments"].values()
        if department.get("built")
    ]


def build_report(session: dict[str, Any], proposal: dict[str, Any]) -> dict[str, Any]:
    ensure_world(session)
    state = proposal.get("state", {})
    final_result = session.get("finalResult")
    if not final_result:
        missing = missing_escape_requirements(session)
        final_result = {
            "status": "in_progress",
            "escaped": False,
            "reason": "The office is still being built.",
            "missing": missing,
        }

    return {
        "projectTitle": state.get("projectTitle", "Void Office Tycoon"),
        "studentId": session["studentId"],
        "sessionId": session["sessionId"],
        "points": session["points"],
        "resources": deepcopy(session["resources"]),
        "builtDepartments": built_departments(session),
        "world": deepcopy(session["world"]),
        "minigameResults": deepcopy(session["minigameHistory"]),
        "choiceLog": deepcopy(session["choiceLog"]),
        "finalResult": deepcopy(final_result),
        "reflectionPrompts": [
            "Which department choice protected the project most?",
            "Which resource became hardest to balance?",
            "What would you change in the next office expansion plan?",
        ],
        "successCriteria": deepcopy(state.get("successCriteria", [])),
        "kpis": deepcopy(state.get("kpis", [])),
        "generatedAt": now_iso(),
    }


def normalize_path_cells(world: dict[str, Any], value: Any) -> list[str]:
    cells = value if isinstance(value, list) else []
    normalized: list[str] = []
    size = int(world.get("size", WORLD_SIZE))
    for item in cells:
        if isinstance(item, str) and "," in item:
            raw_x, raw_y = item.split(",", 1)
            x = clamp_int(raw_x, 0, size - 1)
            y = clamp_int(raw_y, 0, size - 1)
        elif isinstance(item, dict):
            x = clamp_int(item.get("x"), 0, size - 1)
            y = clamp_int(item.get("y"), 0, size - 1)
        else:
            continue
        key = coord_key(x, y)
        if key not in normalized and in_world_bounds(world, x, y):
            normalized.append(key)
    if not normalized:
        start = world.get("start", world_start())
        normalized.append(coord_key(start["x"], start["y"]))
    return normalized


def safe_light_path(world: dict[str, Any]) -> list[str]:
    start = world.get("start", world_start())
    end = world.get("end", world_end())
    route: list[str] = []
    for y in range(start["y"], -1, -1):
        route.append(coord_key(start["x"], y))
    for x in range(start["x"] + 1, end["x"] + 1):
        route.append(coord_key(x, 0))
    for y in range(1, end["y"] + 1):
        route.append(coord_key(end["x"], y))
    return route


def set_department_debug(
    session: dict[str, Any], department_id: str, built: bool | None, level: int | None
) -> dict[str, Any]:
    if department_id not in session["departments"]:
        raise RuleError(f"Unknown department id: {department_id}")
    department = session["departments"][department_id]
    next_level = clamp_int(level if level is not None else department.get("level", 0), 0, 2)
    next_built = bool(built) if built is not None else next_level > 0
    if next_built and next_level == 0:
        next_level = 1
    department["built"] = next_built
    department["level"] = next_level if next_built else 0
    department["builtAt"] = department.get("builtAt") or (now_iso() if next_built else None)
    department["lastChangedAt"] = now_iso()
    if next_built:
        anchor = clamp_anchor_for_department(
            department_id, deepcopy(DEPARTMENT_WORLD_CELLS.get(department_id, world_start())), 0
        )
        department["placement"] = create_department_placement(department_id, anchor, 0)
        department["worldCell"] = deepcopy(department["placement"]["anchorCell"])
    else:
        department["placement"] = None
        department["worldCell"] = None
    return department


def force_minigame_debug(session: dict[str, Any], value: Any) -> dict[str, Any]:
    payload = value if isinstance(value, dict) else {}
    scenario = normalize_scenario_id(payload.get("minigameId"), session)
    success = bool(payload.get("success", True))
    resource_delta = deepcopy(scenario["successDelta"] if success else scenario["failDelta"])
    if scenario["minigameId"] == "budget_rift":
        choice_id = payload.get("choiceId") or "budget_patch"
        resource_delta = deepcopy(BUDGET_RIFT_CHOICES.get(choice_id, BUDGET_RIFT_CHOICES["budget_patch"])["resourceDelta"])
    points_earned = scenario["points"] if success else 0
    session["points"] += points_earned
    apply_resource_delta(session, resource_delta)
    result = {
        "minigameId": scenario["minigameId"],
        "scenarioId": scenario["id"],
        "title": scenario["title"],
        "success": success,
        "score": int(payload.get("score", 999 if success else 0)),
        "pointsEarned": points_earned,
        "resourceChange": resource_delta,
        "details": {"debugForced": True},
        "timestamp": now_iso(),
    }
    session["minigameHistory"].append(result)
    session["currentScenarioIndex"] = (int(session.get("currentScenarioIndex", 0)) + 1) % len(SCENARIOS)
    return result


def apply_debug_action(
    session: dict[str, Any], action: str, value: Any = None
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    ensure_world(session)
    result: dict[str, Any] = {"action": action}

    if action == "set_points":
        session["points"] = max(0, int(value or 0))
    elif action == "set_resource":
        payload = value if isinstance(value, dict) else {}
        key = payload.get("key")
        if key not in DEFAULT_RESOURCES:
            raise RuleError("Unknown resource key.")
        session["resources"][key] = clamp_int(payload.get("value"), 0, 100)
    elif action == "set_paused":
        session["paused"] = bool(value)
    elif action == "set_current_scenario":
        session["currentScenarioIndex"] = clamp_int(value, 0, len(SCENARIOS) - 1)
    elif action == "set_department":
        payload = value if isinstance(value, dict) else {}
        department = set_department_debug(
            session,
            str(payload.get("departmentId", "")),
            payload.get("built"),
            payload.get("level"),
        )
        result["department"] = deepcopy(department)
    elif action == "build_all_departments":
        for department_id in REQUIRED_DEPARTMENT_IDS:
            set_department_debug(session, department_id, True, 1)
    elif action == "upgrade_all_departments":
        for department_id in REQUIRED_DEPARTMENT_IDS:
            set_department_debug(session, department_id, True, 2)
    elif action == "set_world_path":
        session["world"]["builtPath"] = normalize_path_cells(session["world"], value)
        session["world"]["connectedToLight"] = coord_key(session["world"]["end"]["x"], session["world"]["end"]["y"]) in session["world"]["builtPath"]
    elif action == "connect_to_light":
        session["world"]["builtPath"] = safe_light_path(session["world"])
        session["world"]["connectedToLight"] = True
    elif action == "move_blackhole":
        payload = value if isinstance(value, dict) else {}
        blackhole_id = payload.get("id")
        blackhole = next((item for item in session["world"]["blackholes"] if item["id"] == blackhole_id), None)
        if not blackhole:
            raise RuleError("Unknown blackhole id.")
        blackhole["x"] = clamp_int(payload.get("x"), 0, session["world"].get("size", WORLD_SIZE) - 1)
        blackhole["y"] = clamp_int(payload.get("y"), 0, session["world"].get("size", WORLD_SIZE) - 1)
    elif action == "set_blackhole_radius":
        payload = value if isinstance(value, dict) else {}
        blackhole_id = payload.get("id")
        blackhole = next((item for item in session["world"]["blackholes"] if item["id"] == blackhole_id), None)
        if not blackhole:
            raise RuleError("Unknown blackhole id.")
        blackhole["dangerRadius"] = clamp_int(payload.get("dangerRadius"), 0, 8)
    elif action == "regenerate_blackholes":
        session["world"]["blackholes"] = generate_blackholes(f"{session['sessionId']}-{now_iso()}")
        session["world"]["lostToBlackhole"] = None
    elif action == "force_minigame_result":
        result["minigameResult"] = force_minigame_debug(session, value)
    elif action == "force_escape":
        session["world"]["connectedToLight"] = True
        for department_id in REQUIRED_DEPARTMENT_IDS:
            set_department_debug(session, department_id, True, max(1, session["departments"][department_id].get("level", 1)))
        set_department_debug(session, PORTAL_ROOM_ID, True, 1)
        for key in DEFAULT_RESOURCES:
            session["resources"][key] = max(session["resources"].get(key, 0), 50)
        session["finalResult"] = {
            "status": "escaped",
            "escaped": True,
            "timestamp": now_iso(),
            "reason": "Debug forced the Portal Room open.",
        }
    elif action == "force_collapse":
        session["resources"]["budget"] = 0
        session["finalResult"] = {
            "status": "collapsed",
            "escaped": False,
            "timestamp": now_iso(),
            "reason": "Debug forced a resource collapse.",
        }
    elif action == "force_blackhole_loss":
        hole = session["world"]["blackholes"][0] if session["world"]["blackholes"] else {"id": "debug_blackhole", "x": 16, "y": 16}
        session["world"]["lostToBlackhole"] = {"x": hole["x"], "y": hole["y"], "blackholeId": hole["id"]}
        session["finalResult"] = {
            "status": "lost_to_blackhole",
            "escaped": False,
            "timestamp": now_iso(),
            "reason": "Debug forced the office into a blackhole gravity field.",
        }
    elif action == "clear_final_result":
        session["finalResult"] = None
        session["world"]["lostToBlackhole"] = None
    elif action == "reset_sandbox_world":
        session["world"] = new_world(f"{session['sessionId']}-{now_iso()}")
        for department_id, department in session["departments"].items():
            if department.get("built"):
                anchor = clamp_anchor_for_department(
                    department_id, deepcopy(DEPARTMENT_WORLD_CELLS.get(department_id, world_start())), 0
                )
                department["placement"] = create_department_placement(department_id, anchor, 0)
                department["worldCell"] = deepcopy(department["placement"]["anchorCell"])
            else:
                department["placement"] = None
                department["worldCell"] = None
    else:
        raise RuleError(f"Unknown debug action: {action}")

    touch(session)
    log_entry = make_log_entry(
        session,
        minigame_id=None,
        department_built=None,
        resource_change={},
        debug_action=action,
    )
    session["choiceLog"].append(log_entry)
    result["message"] = f"Debug action applied: {action}"
    return session, result, log_entry
