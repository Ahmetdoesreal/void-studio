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

PORTAL_ROOM_ID = "portal_room"

# The three office building types, one per resource. Each has a FIXED, rotatable
# shape in ROOM offsets (a room = ROOM_SIZE x ROOM_SIZE cells), matching the
# reference image: Budget = black L-corner, Team = blue L, Quality = green bar.
RESOURCE_BUILDING_IDS = ["budget", "team", "quality"]

BUILDING_SHAPES = {
    "budget": [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}],                    # L-corner, 3 rooms
    "team": [{"x": 0, "y": 0}, {"x": 0, "y": 1}, {"x": 0, "y": 2}, {"x": 1, "y": 2}],     # L, 4 rooms
    "quality": [{"x": 0, "y": 0}, {"x": 1, "y": 0}],                                      # bar, 2 rooms
    PORTAL_ROOM_ID: [{"x": 0, "y": 0}],
}

# Default anchors (used by debug helpers and legacy normalisation).
DEPARTMENT_WORLD_CELLS = {
    "budget": {"x": 1, "y": 11},
    "team": {"x": 1, "y": 17},
    "quality": {"x": 6, "y": 12},
    PORTAL_ROOM_ID: {"x": 27, "y": 14},
}

# A "room" (a.k.a. subcell) is a ROOM_SIZE x ROOM_SIZE block of normal cells.
# An office occupies whole rooms, not a subdivided single cell.
ROOM_SIZE = 4

# Furniture sprite keys (match client FURNI palette). A computer sits ON a desk
# (rendered lifted); an office chair faces the desk (a back-view sprite).
DESK_SURFACE = "desk"
COMPUTER_LIFT = 2.0
COMPUTER_OFFSET_X = -0.3  # nudge the computer left so it sits on the desk surface
DESK_CHAIR = "officeChairBack"  # office chair facing the desk (direction 6)

# Which computer models each office type uses on its desks.
COMPUTER_CHOICES = {
    "budget": ["monitor", "imac", "monitor"],
    "quality": ["laptop", "monitor", "imac"],
    "spawn": ["monitor", "laptop", "imac"],
}


def building_cost(type_id: str) -> int:
    return BUILDING_TYPES_BY_ID.get(type_id, {}).get("cost", 50)


# The three buyable office building types shown in the Department Shop. Each is
# tied to one resource, buyable repeatedly to expand the office. Applies its
# resourceEffect on every purchase.
BUILDING_TYPES = [
    {
        "id": "budget",
        "name": "Budget Office",
        "resource": "budget",
        "cost": 55,
        "resourceEffect": {"budget": 20, "team": -2, "quality": 0},
        "meaning": "Finance wing that protects and grows the project budget.",
        "shapeLabel": "L-corner",
    },
    {
        "id": "team",
        "name": "Team Office",
        "resource": "team",
        "cost": 80,
        "resourceEffect": {"budget": -4, "team": 22, "quality": 2},
        "meaning": "Collaboration space that keeps the team healthy and fast.",
        "shapeLabel": "L",
    },
    {
        "id": "quality",
        "name": "Quality Office",
        "resource": "quality",
        "cost": 45,
        "resourceEffect": {"budget": 0, "team": 2, "quality": 18},
        "meaning": "Dev/QA lab that turns effort into protected quality.",
        "shapeLabel": "bar",
    },
]
BUILDING_TYPES_BY_ID = {item["id"]: item for item in BUILDING_TYPES}


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
    # Buildings are placed instances (keyed by unique id like "budget#1"), added
    # to this dict on purchase. It starts empty.
    return {}


def building_type_built(session: dict[str, Any], type_id: str) -> bool:
    return any(
        d.get("typeId") == type_id and d.get("built")
        for d in session.get("departments", {}).values()
    )


def building_instances(session: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        d for d in session.get("departments", {}).values()
        if d.get("typeId") in BUILDING_TYPES_BY_ID and d.get("built")
    ]


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


def workstation_room_layout(rng: random.Random, type_id: str) -> dict[tuple, list]:
    """Simple one-workstation layout for a 4x4 room: a single desk with a
    computer on it and a chair facing the desk. Keyed by local (lx, ly); each
    entry is a list of (spriteId, lift, offsetX) drawn bottom-to-top."""
    comp = rng.choice(COMPUTER_CHOICES.get(type_id, COMPUTER_CHOICES["spawn"]))
    return {
        (1, 1): [(DESK_SURFACE, 0.0, 0.0), (comp, COMPUTER_LIFT, COMPUTER_OFFSET_X)],
        (1, 2): [(DESK_CHAIR, 0.0, 0.0)],
    }


def lounge_room_layout(rng: random.Random) -> dict[tuple, list]:
    """Simple lounge layout for a 4x4 room (Team office): a sofa, a coffee table
    and a plant."""
    return {
        (1, 1): [("sofa", 0.0, 0.0)],
        (1, 2): [("coffeeTable", 0.0, 0.0)],
        (2, 2): [("plant", 0.0, 0.0)],
    }


def generate_office_furniture(
    room_bases: list[tuple], rng: random.Random, type_id: str = "spawn"
) -> list[dict[str, Any]]:
    """Furnish each 4x4 room with a structured, real-office layout (not random
    scatter), so desks, computers, chairs and decor line up like an office.
    `room_bases` is the list of each room's top-left (north/west) corner cell."""
    items: list[dict[str, Any]] = []
    for (bx, by) in room_bases:
        layout = lounge_room_layout(rng) if type_id == "team" else workstation_room_layout(rng, type_id)
        for (lx, ly), pieces in layout.items():
            cx, cy = int(bx) + lx, int(by) + ly
            if not (0 <= cx < WORLD_SIZE and 0 <= cy < WORLD_SIZE):
                continue
            for sprite_id, lift, offset_x in pieces:
                item: dict[str, Any] = {"cell": {"x": cx, "y": cy}, "spriteId": sprite_id}
                if lift:
                    item["lift"] = lift
                if offset_x:
                    item["offsetX"] = offset_x
                items.append(item)
    return items


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


def building_room_offsets(type_id: str, rotation: int) -> list[dict[str, int]]:
    shape = BUILDING_SHAPES.get(type_id) or BUILDING_SHAPES.get("quality") or [{"x": 0, "y": 0}]
    return rotate_offsets(shape, rotation)


def occupied_cells_for_building(
    type_id: str, anchor_cell: dict[str, int], rotation: int
) -> list[dict[str, int]]:
    """Expand a building's room-shape into every normal cell it covers."""
    ax = int(anchor_cell["x"])
    ay = int(anchor_cell["y"])
    cells: list[dict[str, int]] = []
    for room in building_room_offsets(type_id, rotation):
        base_x = ax + room["x"] * ROOM_SIZE
        base_y = ay + room["y"] * ROOM_SIZE
        for dy in range(ROOM_SIZE):
            for dx in range(ROOM_SIZE):
                cells.append({"x": base_x + dx, "y": base_y + dy})
    return cells


def create_department_placement(
    department_id: str,
    anchor_cell: dict[str, int],
    rotation: int,
    preset_id: str = "single",
    seed: str | None = None,
) -> dict[str, Any]:
    # `department_id` is the building TYPE id (budget / team / quality / portal_room).
    normalized_rotation = normalize_rotation(rotation)
    occupied_cells = occupied_cells_for_building(department_id, anchor_cell, normalized_rotation)
    ax = int(anchor_cell["x"])
    ay = int(anchor_cell["y"])
    room_bases = [
        (ax + room["x"] * ROOM_SIZE, ay + room["y"] * ROOM_SIZE)
        for room in building_room_offsets(department_id, normalized_rotation)
    ]
    rng = random.Random(
        seed or f"{department_id}:{anchor_cell.get('x')},{anchor_cell.get('y')}:{normalized_rotation}"
    )
    return {
        "anchorCell": {"x": int(anchor_cell["x"]), "y": int(anchor_cell["y"])},
        "rotation": normalized_rotation,
        "presetId": department_id,
        "chunkCount": len(building_room_offsets(department_id, normalized_rotation)),
        "occupiedCells": occupied_cells,
        "furniture": generate_office_furniture(room_bases, rng, department_id),
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


def is_border_cell(world: dict[str, Any], x: int, y: int) -> bool:
    size = int(world.get("size", WORLD_SIZE))
    return x == 0 or y == 0 or x == size - 1 or y == size - 1


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
    on_border = any(
        is_border_cell(world, int(cell["x"]), int(cell["y"]))
        for cell in placement["occupiedCells"]
    )
    if not on_border and not placement_touches_buildable(buildable, placement["occupiedCells"]):
        raise RuleError("Place the office next to your corridor, an existing office, or a map border.")


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

    # Building instances are stored fully-formed on purchase; just backfill any
    # missing optional fields so older sessions stay renderable.
    for department in session.get("departments", {}).values():
        department.setdefault("worldCell", None)
        department.setdefault("placement", None)
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
        "furniture": generate_office_furniture([(ax, ay)], rng, "spawn"),
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

    departments = session.setdefault("departments", {})
    if department_id == PORTAL_ROOM_ID:
        raise RuleError("The Portal Room opens through the escape check.")
    if department_id not in BUILDING_TYPES_BY_ID:
        raise RuleError(f"Unknown building type: {department_id}")
    if not isinstance(anchor_cell, dict):
        raise RuleError("anchorCell is required when placing a building.")

    btype = BUILDING_TYPES_BY_ID[department_id]
    anchor = {
        "x": clamp_int(anchor_cell.get("x"), 0, WORLD_SIZE - 1),
        "y": clamp_int(anchor_cell.get("y"), 0, WORLD_SIZE - 1),
    }
    existing = sum(1 for d in departments.values() if d.get("typeId") == department_id)
    instance_id = f"{department_id}#{existing + 1}"
    seed = f"{session.get('sessionId')}:{instance_id}:{anchor['x']},{anchor['y']}:{rotation}"
    placement = create_department_placement(department_id, anchor, rotation, department_id, seed=seed)
    validate_department_placement(session, instance_id, placement)

    price = btype["cost"]
    if session["points"] < price:
        raise RuleError(f"Not enough points for {btype['name']}.")

    resource_delta = deepcopy(btype["resourceEffect"])
    session["points"] -= price
    instance = {
        "id": instance_id,
        "typeId": department_id,
        "name": btype["name"],
        "resource": btype["resource"],
        "meaning": btype["meaning"],
        "built": True,
        "level": 1,
        "builtAt": now_iso(),
        "lastChangedAt": now_iso(),
        "resourceEffect": deepcopy(resource_delta),
        "placement": deepcopy(placement),
        "worldCell": deepcopy(placement["anchorCell"]),
    }
    departments[instance_id] = instance
    apply_resource_delta(session, resource_delta)

    action = {
        "departmentId": instance_id,
        "departmentName": btype["name"],
        "action": "build",
        "cost": price,
        "resourceChange": resource_delta,
        "placement": deepcopy(placement),
        "timestamp": now_iso(),
    }

    check_collapse(session)
    log_entry = make_log_entry(
        session,
        minigame_id=None,
        department_built=btype["name"],
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
    if not is_border_cell(world, x, y) and not any(n in buildable for n in neighbors):
        raise RuleError("Build the corridor from your office, path, or a map border.")

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

    for type_id in RESOURCE_BUILDING_IDS:
        if not building_type_built(session, type_id):
            missing.append(f"Build a {BUILDING_TYPES_BY_ID[type_id]['name']}")

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
        portal_placement = create_department_placement(
            PORTAL_ROOM_ID, DEPARTMENT_WORLD_CELLS[PORTAL_ROOM_ID], 0
        )
        session["departments"][PORTAL_ROOM_ID] = {
            "id": PORTAL_ROOM_ID,
            "typeId": PORTAL_ROOM_ID,
            "name": "Portal Room",
            "resource": None,
            "built": True,
            "level": 1,
            "builtAt": now_iso(),
            "portal": True,
            "placement": portal_placement,
            "worldCell": deepcopy(portal_placement["anchorCell"]),
        }
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


def debug_place_building(session: dict[str, Any], type_id: str) -> dict[str, Any]:
    """Debug helper: place one building of a type at its default anchor (no cost,
    no validation)."""
    departments = session.setdefault("departments", {})
    anchor = deepcopy(DEPARTMENT_WORLD_CELLS.get(type_id, world_start()))
    anchor = {"x": clamp_int(anchor.get("x"), 0, WORLD_SIZE - 1), "y": clamp_int(anchor.get("y"), 0, WORLD_SIZE - 1)}
    placement = create_department_placement(type_id, anchor, 0)
    if type_id == PORTAL_ROOM_ID:
        instance_id = PORTAL_ROOM_ID
    else:
        existing = sum(1 for d in departments.values() if d.get("typeId") == type_id)
        instance_id = f"{type_id}#{existing + 1}"
    btype = BUILDING_TYPES_BY_ID.get(type_id, {"name": type_id, "resource": None})
    instance = {
        "id": instance_id,
        "typeId": type_id,
        "name": btype.get("name", type_id),
        "resource": btype.get("resource"),
        "built": True,
        "level": 1,
        "builtAt": now_iso(),
        "placement": placement,
        "worldCell": deepcopy(placement["anchorCell"]),
    }
    departments[instance_id] = instance
    return instance


def set_department_debug(
    session: dict[str, Any], department_id: str, built: bool | None, level: int | None
) -> dict[str, Any]:
    departments = session.setdefault("departments", {})
    if built is False:
        # Remove all instances of this type / this instance id.
        for key in [k for k, d in departments.items() if d.get("typeId") == department_id or k == department_id]:
            departments.pop(key, None)
        return {}
    if department_id in departments:
        return departments[department_id]
    return debug_place_building(session, department_id)


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
        for type_id in RESOURCE_BUILDING_IDS:
            debug_place_building(session, type_id)
    elif action == "upgrade_all_departments":
        for type_id in RESOURCE_BUILDING_IDS:
            debug_place_building(session, type_id)
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
        for type_id in RESOURCE_BUILDING_IDS:
            if not building_type_built(session, type_id):
                debug_place_building(session, type_id)
        debug_place_building(session, PORTAL_ROOM_ID)
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
        # Drop placed buildings and clear terminal state so the fresh sandbox is
        # actually playable again.
        session["departments"] = {}
        session["finalResult"] = None
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
