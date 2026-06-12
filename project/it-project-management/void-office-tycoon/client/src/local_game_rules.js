// local_game_rules.js
// Port of game_rules.py for static frontend deployment

export const CHUNK_COUNT = 32;
export const SUBCELLS_PER_CELL = 4;
export const WORLD_SIZE = CHUNK_COUNT;
export const BLACKHOLE_DANGER_RADIUS = 2;
export const PATH_BUILD_COST = 1;
export const MAX_PLAYS_PER_MINIGAME = 2;
export const STARTING_POINTS = 30;

export const DEFAULT_RESOURCES = {
    budget: 70,
    team: 70,
    quality: 70,
};

export const RESOURCE_LABELS = {
    budget: "Budget",
    team: "Team",
    quality: "Quality",
};

export const SCENARIOS = [
    {
        id: "SC-01",
        minigameId: "scope_fog",
        title: "Scope Fog",
        points: 60,
        successDelta: { budget: 5, team: 3, quality: 6 },
        failDelta: { budget: -10, team: -5, quality: -5 },
    },
    {
        id: "SC-02",
        minigameId: "bug_rain",
        title: "Bug Rain",
        points: 70,
        successDelta: { budget: 0, team: 4, quality: 12 },
        failDelta: { budget: -5, team: -6, quality: -15 },
    },
    {
        id: "SC-03",
        minigameId: "budget_rift",
        title: "Budget Rift",
        points: 65,
        successDelta: { budget: 0, team: 0, quality: 0 },
        failDelta: { budget: 0, team: 0, quality: 0 },
    },
    {
        id: "SC-04",
        minigameId: "risk_vault",
        title: "Risk Vault",
        points: 70,
        successDelta: { budget: 4, team: 2, quality: 10 },
        failDelta: { budget: -7, team: -4, quality: -10 },
    },
    {
        id: "SC-05",
        minigameId: "stakeholder_booth",
        title: "Stakeholder Booth",
        points: 55,
        successDelta: { budget: 2, team: 12, quality: 3 },
        failDelta: { budget: -4, team: -10, quality: -3 },
    },
];

export const SCENARIOS_BY_MINIGAME = Object.fromEntries(SCENARIOS.map(s => [s.minigameId, s]));
export const SCENARIOS_BY_ID = Object.fromEntries(SCENARIOS.map(s => [s.id, s]));

export const BUDGET_RIFT_CHOICES = {
    budget_patch: {
        label: "Lock down the supply chain",
        resourceDelta: { budget: 15, team: -4, quality: 0 },
    },
    team_sync: {
        label: "Invest in crew resilience",
        resourceDelta: { budget: -6, team: 14, quality: 2 },
    },
    quality_gate: {
        label: "Pre-pay for release safeguards",
        resourceDelta: { budget: -8, team: 0, quality: 16 },
    },
};

export const CORRECT_BACKLOG_ORDER = ["s1", "s6", "s2", "s4", "s3", "s5"];
export const SERIOUS_BUG_IDS = new Set(["b1", "b3", "b5"]);
export const CRITICAL_RISK_IDS = new Set(["r1", "r3", "r5"]);

export const STAKEHOLDER_BOOTH_CHOICES = {
    reply_with_decision: {
        label: "Present the trade-off and ask for a ruling",
        best: true,
    },
    promise_later: {
        label: "Defer the hard talk to the next cycle",
        best: false,
    },
    send_metrics_only: {
        label: "Broadcast raw dashboards without commentary",
        best: false,
    },
};

export const PORTAL_ROOM_ID = "portal_room";
export const RESOURCE_BUILDING_IDS = ["budget", "team", "quality"];

export const BUILDING_SHAPES = {
    budget: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    team: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    quality: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    [PORTAL_ROOM_ID]: [{ x: 0, y: 0 }],
};

export const DEPARTMENT_WORLD_CELLS = {
    budget: { x: 1, y: 11 },
    team: { x: 1, y: 17 },
    quality: { x: 6, y: 12 },
    [PORTAL_ROOM_ID]: { x: 27, y: 14 },
};

export const ROOM_SIZE = 4;
export const FURNITURE_LAYOUT_VERSION = 4;

export const DESK_SURFACE = "desk";
export const COMPUTER_LIFT = 1.65;
export const COMPUTER_OFFSET_X = -0.18;
export const COMPUTER_OFFSET_Y = -0.24;
export const WORKSTATION_CHAIR = "officeChair";
export const WORKSTATION_CHAIR_OFFSET_X = 0.2;
export const WORKSTATION_CHAIR_OFFSET_Y = -0.16;
export const MEETING_CHAIR = "chair";
export const MEETING_CHAIR_OFFSET_X = 0.14;
export const MEETING_CHAIR_OFFSET_Y = -0.12;

export const COMPUTER_CHOICES = {
    budget: ["monitor", "imac", "monitor"],
    team: ["laptop", "monitor", "laptop"],
    quality: ["laptop", "monitor", "imac"],
    spawn: ["monitor", "laptop", "imac"],
};

export const BUILDING_TYPES = [
    {
        id: "budget",
        name: "Budget Office",
        resource: "budget",
        cost: 55,
        resourceEffect: { budget: 20, team: -2, quality: 0 },
        meaning: "Finance wing that protects and grows the project budget.",
        shapeLabel: "L-corner",
    },
    {
        id: "team",
        name: "Team Office",
        resource: "team",
        cost: 80,
        resourceEffect: { budget: -4, team: 22, quality: 2 },
        meaning: "Collaboration space that keeps the team healthy and fast.",
        shapeLabel: "L",
    },
    {
        id: "quality",
        name: "Quality Office",
        resource: "quality",
        cost: 45,
        resourceEffect: { budget: 0, team: 2, quality: 18 },
        meaning: "Dev/QA lab that turns effort into protected quality.",
        shapeLabel: "bar",
    },
];

export const BUILDING_TYPES_BY_ID = Object.fromEntries(BUILDING_TYPES.map(b => [b.id, b]));

export class RuleError extends Error {
    constructor(message) {
        super(message);
        this.name = "RuleError";
    }
}

export function now_iso() {
    return new Date().toISOString();
}

export function update_play_time(session) {
    if (session.paused || session.finalResult) return;
    const last_resumed = session.lastResumedAt;
    if (last_resumed) {
        try {
            const delta = new Date() - new Date(last_resumed);
            session.playTimeMs = (session.playTimeMs || 0) + delta;
        } catch (e) { }
    }
    session.lastResumedAt = now_iso();
}

export function clamp(value, low = 0, high = 100) {
    return Math.max(low, Math.min(high, parseInt(value, 10) || 0));
}

export function clamp_int(value, low, high) {
    let parsed = parseInt(value, 10);
    if (isNaN(parsed)) parsed = low;
    return Math.max(low, Math.min(high, parsed));
}

export function new_departments() {
    return {};
}

export function building_type_built(session, type_id) {
    return Object.values(session.departments || {}).some(d => d.typeId === type_id && d.built);
}

export function building_instances(session) {
    return Object.values(session.departments || {}).filter(d => BUILDING_TYPES_BY_ID[d.typeId] && d.built);
}

export function coord_key(x, y) {
    return `${x},${y}`;
}

export function distance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function world_start() {
    return { x: 1, y: Math.floor(WORLD_SIZE / 2) };
}

export function world_end() {
    return { x: WORLD_SIZE - 2, y: Math.floor(WORLD_SIZE / 2) };
}

export function normalize_rotation(value) {
    let rotation = clamp_int(value, 0, 270);
    if (![0, 90, 180, 270].includes(rotation)) {
        rotation = [0, 90, 180, 270].reduce((prev, curr) => Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev);
    }
    return rotation;
}

export function rotate_offsets(cells, rotation) {
    rotation = normalize_rotation(rotation);
    let rotated = cells.map(cell => {
        let x = parseInt(cell.x, 10);
        let y = parseInt(cell.y, 10);
        if (rotation === 90) [x, y] = [y, -x];
        else if (rotation === 180) [x, y] = [-x, -y];
        else if (rotation === 270) [x, y] = [-y, x];
        return { x, y };
    });
    const min_x = Math.min(...rotated.map(c => c.x));
    const min_y = Math.min(...rotated.map(c => c.y));
    return rotated.map(cell => ({ x: cell.x - min_x, y: cell.y - min_y }));
}

export function perimeter_walls(occupied_cells) {
    const occupied = new Set(occupied_cells.map(c => coord_key(c.x, c.y)));
    const walls = [];
    for (const cell of occupied_cells) {
        for (const [edge, neighborX, neighborY] of [
            ["north", cell.x, cell.y - 1],
            ["west", cell.x - 1, cell.y]
        ]) {
            if (!occupied.has(coord_key(neighborX, neighborY))) {
                walls.push({
                    cell: { x: cell.x, y: cell.y },
                    edge: edge,
                    subcell: { x: 0, y: 0 },
                    sprites: [{ id: `wall_${edge}`, layer: "wall" }]
                });
            }
        }
    }
    return walls;
}

export function building_room_offsets(type_id, rotation) {
    const shape = BUILDING_SHAPES[type_id] || BUILDING_SHAPES["quality"] || [{ x: 0, y: 0 }];
    return rotate_offsets(shape, rotation);
}

export function occupied_cells_for_building(type_id, anchor_cell, rotation) {
    const ax = parseInt(anchor_cell.x, 10);
    const ay = parseInt(anchor_cell.y, 10);
    const cells = [];
    for (const room of building_room_offsets(type_id, rotation)) {
        const base_x = ax + room.x * ROOM_SIZE;
        const base_y = ay + room.y * ROOM_SIZE;
        for (let dy = 0; dy < ROOM_SIZE; dy++) {
            for (let dx = 0; dx < ROOM_SIZE; dx++) {
                cells.push({ x: base_x + dx, y: base_y + dy });
            }
        }
    }
    return cells;
}

function seededRandom(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
    return function () {
        s ^= s << 13; s ^= s >> 17; s ^= s << 5;
        return ((s >>> 0) % 1000) / 1000;
    };
}

export function create_department_placement(department_id, anchor_cell, rotation, preset_id = "single", seed = null) {
    const normalized_rotation = normalize_rotation(rotation);
    const occupied_cells = occupied_cells_for_building(department_id, anchor_cell, normalized_rotation);
    const ax = parseInt(anchor_cell.x, 10);
    const ay = parseInt(anchor_cell.y, 10);
    const room_bases = building_room_offsets(department_id, normalized_rotation).map(room => [
        ax + room.x * ROOM_SIZE,
        ay + room.y * ROOM_SIZE
    ]);
    
    // Fallback: furniture generation is implemented in main.js, so we return empty and main.js re-runs it anyway!
    // But we need to match the python output structure.
    return {
        anchorCell: { x: ax, y: ay },
        rotation: normalized_rotation,
        presetId: department_id,
        chunkCount: building_room_offsets(department_id, normalized_rotation).length,
        occupiedCells: occupied_cells,
        furniture: [], // Frontend handles its own furniture generation
        furnitureVersion: FURNITURE_LAYOUT_VERSION,
        spriteStacks: [],
        walls: perimeter_walls(occupied_cells),
        subcellsPerCell: SUBCELLS_PER_CELL,
    };
}

export function department_cells(department) {
    const placement = department.placement;
    if (placement && Array.isArray(placement.occupiedCells)) {
        return placement.occupiedCells.map(c => ({ x: parseInt(c.x, 10), y: parseInt(c.y, 10) }));
    }
    const cell = department.worldCell;
    if (department.built && cell && cell.x !== undefined && cell.y !== undefined) {
        return [{ x: parseInt(cell.x, 10), y: parseInt(cell.y, 10) }];
    }
    return [];
}

export function office_cell_keys(session) {
    const keys = new Set();
    const spawn = session.world?.spawnOffice;
    if (spawn && Array.isArray(spawn.cells)) {
        for (const cell of spawn.cells) keys.add(coord_key(parseInt(cell.x, 10), parseInt(cell.y, 10)));
    }
    for (const department of Object.values(session.departments || {})) {
        if (department.built) {
            for (const cell of department_cells(department)) {
                keys.add(coord_key(cell.x, cell.y));
            }
        }
    }
    return keys;
}

export function is_border_cell(world, x, y) {
    const size = parseInt(world.size || WORLD_SIZE, 10);
    return x === 0 || y === 0 || x === size - 1 || y === size - 1;
}

export function placement_touches_buildable(buildable, occupied_cells) {
    const own = new Set(occupied_cells.map(c => coord_key(parseInt(c.x, 10), parseInt(c.y, 10))));
    for (const cell of occupied_cells) {
        const neighbors = [
            coord_key(cell.x + 1, cell.y),
            coord_key(cell.x - 1, cell.y),
            coord_key(cell.x, cell.y + 1),
            coord_key(cell.x, cell.y - 1),
        ];
        if (neighbors.some(n => buildable.has(n) && !own.has(n))) return true;
    }
    return false;
}

export function cell_touches_blackhole_danger(world, x, y) {
    for (const blackhole of (world.blackholes || [])) {
        const radius = parseFloat(blackhole.dangerRadius || BLACKHOLE_DANGER_RADIUS);
        const center_x = parseFloat(blackhole.x) + 0.5;
        const center_y = parseFloat(blackhole.y) + 0.5;
        const min_dx = Math.max(parseFloat(x) - center_x, 0.0, center_x - parseFloat(x + 1));
        const min_dy = Math.max(parseFloat(y) - center_y, 0.0, center_y - parseFloat(y + 1));
        if (Math.max(min_dx, min_dy) <= radius) return blackhole;
    }
    return null;
}

export function validate_department_placement(session, department_id, placement) {
    const world = session.world;
    const end_key = coord_key(world.end.x, world.end.y);
    const path = new Set(world.builtPath || []);
    const offices = office_cell_keys(session);

    for (const cell of placement.occupiedCells) {
        const x = parseInt(cell.x, 10);
        const y = parseInt(cell.y, 10);
        const key = coord_key(x, y);
        if (!in_world_bounds(world, x, y)) throw new RuleError("Office must stay inside the 32x32 world.");
        if (key === end_key || path.has(key)) throw new RuleError("Offices cannot overlap the corridor or the nebula gate.");
        if (offices.has(key)) throw new RuleError("Offices cannot overlap the spawn office or another department.");
        if (cell_touches_blackhole_danger(world, x, y)) throw new RuleError("Offices cannot touch blackhole gravity fields.");
    }

    const buildable = new Set([...path, ...offices]);
    const on_border = placement.occupiedCells.some(cell => is_border_cell(world, parseInt(cell.x, 10), parseInt(cell.y, 10)));
    if (!on_border && !placement_touches_buildable(buildable, placement.occupiedCells)) {
        throw new RuleError("Place the office next to your corridor, an existing office, or a map border.");
    }
}

export function generate_blackholes(seed) {
    const rng = seededRandom(seed);
    const count = 2 + Math.floor(rng() * 2);
    const blackholes = [];
    const reserved = [world_start(), world_end(), ...Object.values(DEPARTMENT_WORLD_CELLS)];
    let attempts = 0;

    while (blackholes.length < count && attempts < 400) {
        attempts++;
        const candidate = {
            x: 7 + Math.floor(rng() * (WORLD_SIZE - 14)),
            y: 5 + Math.floor(rng() * (WORLD_SIZE - 11)),
        };
        if (reserved.some(cell => distance(candidate, cell) <= 5)) continue;
        if (blackholes.some(hole => distance(candidate, hole) <= 7)) continue;
        blackholes.push({
            id: `blackhole_${blackholes.length + 1}`,
            x: candidate.x,
            y: candidate.y,
            dangerRadius: BLACKHOLE_DANGER_RADIUS,
        });
    }
    return blackholes;
}

export function build_spawn_office(world, seed) {
    const start = world.start || world_start();
    const ax = parseInt(start.x, 10);
    const ay = parseInt(start.y, 10);
    const cells = [];
    for (let dy = 0; dy < ROOM_SIZE; dy++) {
        for (let dx = 0; dx < ROOM_SIZE; dx++) {
            if (ax + dx >= 0 && ax + dx < WORLD_SIZE && ay + dy >= 0 && ay + dy < WORLD_SIZE) {
                cells.push({ x: ax + dx, y: ay + dy });
            }
        }
    }
    return {
        cells,
        walls: perimeter_walls(cells),
        furniture: [], // Let main.js generate furniture
        furnitureVersion: FURNITURE_LAYOUT_VERSION,
    };
}

export function new_world(seed) {
    const start = world_start();
    const end = world_end();
    return {
        size: WORLD_SIZE,
        subcellsPerCell: SUBCELLS_PER_CELL,
        theme: "darkness_to_nebula",
        start,
        end,
        pathBuildCost: PATH_BUILD_COST,
        blackholes: generate_blackholes(seed),
        builtPath: [coord_key(start.x, start.y)],
        spawnOffice: build_spawn_office({ start }, seed),
        connectedToLight: false,
        lostToBlackhole: null,
    };
}

export function normalize_path_cells(world, value) {
    const cells = Array.isArray(value) ? value : [];
    const normalized = [];
    const size = parseInt(world.size || WORLD_SIZE, 10);
    for (const item of cells) {
        let x, y;
        if (typeof item === "string" && item.includes(",")) {
            const parts = item.split(",");
            x = clamp_int(parts[0], 0, size - 1);
            y = clamp_int(parts[1], 0, size - 1);
        } else if (typeof item === "object" && item !== null) {
            x = clamp_int(item.x, 0, size - 1);
            y = clamp_int(item.y, 0, size - 1);
        } else continue;
        
        const key = coord_key(x, y);
        if (!normalized.includes(key) && in_world_bounds(world, x, y)) {
            normalized.push(key);
        }
    }
    if (normalized.length === 0) {
        const start = world.start || world_start();
        normalized.push(coord_key(start.x, start.y));
    }
    return normalized;
}

export function ensure_world(session) {
    if (!session.world) session.world = new_world(session.sessionId || "legacy-world");
    const world = session.world;
    world.size = WORLD_SIZE;
    world.subcellsPerCell = SUBCELLS_PER_CELL;
    world.theme = world.theme || "darkness_to_nebula";
    world.start = world_start();
    world.end = world_end();
    world.pathBuildCost = PATH_BUILD_COST;
    world.lostToBlackhole = world.lostToBlackhole || null;
    world.connectedToLight = world.connectedToLight || false;
    world.blackholes = world.blackholes || [];
    
    const normalized_path = normalize_path_cells(world, world.builtPath || []);
    const start_key = coord_key(world.start.x, world.start.y);
    if (!normalized_path.includes(start_key)) normalized_path.unshift(start_key);
    world.builtPath = normalized_path;
    world.connectedToLight = world.builtPath.includes(coord_key(world.end.x, world.end.y));
    
    if (world.blackholes.length === 0) world.blackholes = generate_blackholes(session.sessionId || "legacy-world");
    
    if (!world.spawnOffice || world.spawnOffice.furnitureVersion !== FURNITURE_LAYOUT_VERSION) {
        world.spawnOffice = build_spawn_office(world, session.sessionId || "spawn");
    }
    return session;
}

export function new_session(student_id = null) {
    const timestamp = now_iso();
    const clean_student_id = (student_id || "").trim() || "CLASS-ID";
    const session_id = `vot-${Math.random().toString(36).substring(2, 12)}`;

    return {
        sessionId: session_id,
        studentId: clean_student_id.substring(0, 80),
        createdAt: timestamp,
        updatedAt: timestamp,
        playTimeMs: 0,
        lastResumedAt: timestamp,
        points: STARTING_POINTS,
        totalEarned: STARTING_POINTS,
        totalSpent: 0,
        finalScore: 0,
        resources: JSON.parse(JSON.stringify(DEFAULT_RESOURCES)),
        departments: new_departments(),
        world: new_world(session_id),
        currentScenarioIndex: 0,
        minigameHistory: [],
        choiceLog: [],
        paused: false,
        finalResult: null,
    };
}

export function current_scenario(session) {
    const index = parseInt(session.currentScenarioIndex || 0, 10) % SCENARIOS.length;
    return JSON.parse(JSON.stringify(SCENARIOS[index]));
}

export function normalize_scenario_id(value, session) {
    if (!value) return current_scenario(session);
    if (SCENARIOS_BY_MINIGAME[value]) return JSON.parse(JSON.stringify(SCENARIOS_BY_MINIGAME[value]));
    if (SCENARIOS_BY_ID[value]) return JSON.parse(JSON.stringify(SCENARIOS_BY_ID[value]));
    throw new RuleError(`Unknown minigame id: ${value}`);
}

export function apply_resource_delta(session, delta) {
    for (const key of Object.keys(DEFAULT_RESOURCES)) {
        session.resources[key] = clamp((session.resources[key] || 0) + (delta[key] || 0));
    }
}

export function touch(session) {
    update_play_time(session);
    session.updatedAt = now_iso();
}

export function check_collapse(session) {
    ensure_world(session);
    if (session.finalResult) return;

    const collapsed = Object.keys(session.resources).filter(key => session.resources[key] <= 0);
    if (collapsed.length === 0) return;

    const labels = collapsed.map(key => RESOURCE_LABELS[key] || key).join(", ");
    session.finalScore = 0;
    session.finalResult = {
        status: "collapsed",
        escaped: false,
        timestamp: now_iso(),
        reason: `The office collapsed because ${labels} reached zero.`,
        finalScore: 0,
    };
}

export function check_game_over(session) {
    ensure_world(session);
    if (session.finalResult) return;

    // Count total plays used across all minigames
    const history = session.minigameHistory || [];
    const total_max_plays = SCENARIOS.length * MAX_PLAYS_PER_MINIGAME; // 5 × 2 = 10

    if (history.length < total_max_plays) return; // Still has minigame plays left

    // All minigame plays exhausted — check if escape is still possible
    const missing = missing_escape_requirements(session);
    if (missing.length === 0) return; // Can still escape

    // Check if player has enough points to meet remaining requirements
    const departments_needed = RESOURCE_BUILDING_IDS.filter(id => !building_type_built(session, id));
    const dept_cost = departments_needed.reduce((sum, id) => sum + (BUILDING_TYPES_BY_ID[id]?.cost || 0), 0);
    const can_afford_depts = session.points >= dept_cost;

    if (!can_afford_depts || missing.some(m => m.includes("Raise"))) {
        // Cannot afford remaining departments or resources too low — game over
        session.finalScore = 0;
        session.finalResult = {
            status: "game_over",
            escaped: false,
            timestamp: now_iso(),
            reason: "All minigame attempts have been used. The office could not reach the nebula in time.",
            finalScore: 0,
            missing: missing,
        };
    }
}

export function ensure_action_allowed(session) {
    ensure_world(session);
    if (session.paused) throw new RuleError("The session is paused.");
    if (session.finalResult) throw new RuleError("The session already has a final result.");
}

export function record_minigame_result(session, payload) {
    ensure_world(session);
    ensure_action_allowed(session);

    const scenario = normalize_scenario_id(payload.minigameId, session);
    const play_count = (session.minigameHistory || []).filter(e => e.minigameId === scenario.minigameId).length;
    
    if (play_count >= MAX_PLAYS_PER_MINIGAME) {
        throw new RuleError(`${scenario.title} has already been played ${MAX_PLAYS_PER_MINIGAME} times.`);
    }

    const details = payload.details || {};
    const minigame_id = scenario.minigameId;
    let success = false, score = 0, resource_delta = {};
    let finalDetails = details;

    if (minigame_id === "scope_fog") {
        const order = (details.order || []).map(String);
        score = order.reduce((acc, item, idx) => acc + (idx < CORRECT_BACKLOG_ORDER.length && CORRECT_BACKLOG_ORDER[idx] === item ? 1 : 0), 0);
        success = score === CORRECT_BACKLOG_ORDER.length;
        resource_delta = JSON.parse(JSON.stringify(success ? scenario.successDelta : scenario.failDelta));
        finalDetails = { order };
    } else if (minigame_id === "bug_rain") {
        const selected = [...new Set((details.selected || []).map(String))].sort();
        const correct = [...SERIOUS_BUG_IDS].sort();
        score = selected.filter(item => SERIOUS_BUG_IDS.has(item)).length;
        success = selected.join(',') === correct.join(',');
        resource_delta = JSON.parse(JSON.stringify(success ? scenario.successDelta : scenario.failDelta));
        finalDetails = { selected };
    } else if (minigame_id === "risk_vault") {
        const selected = [...new Set((details.selected || []).map(String))].sort();
        const correct = [...CRITICAL_RISK_IDS].sort();
        score = selected.filter(item => CRITICAL_RISK_IDS.has(item)).length;
        success = selected.join(',') === correct.join(',');
        resource_delta = JSON.parse(JSON.stringify(success ? scenario.successDelta : scenario.failDelta));
        finalDetails = { selected };
    } else if (minigame_id === "stakeholder_booth") {
        const choice_id = details.choiceId || "";
        if (!STAKEHOLDER_BOOTH_CHOICES[choice_id]) throw new RuleError("Stakeholder Booth requires a valid choiceId.");
        const choice = STAKEHOLDER_BOOTH_CHOICES[choice_id];
        success = Boolean(choice.best);
        score = success ? 1 : 0;
        resource_delta = JSON.parse(JSON.stringify(success ? scenario.successDelta : scenario.failDelta));
        finalDetails = { choiceId: choice_id, choiceLabel: choice.label };
    } else if (minigame_id === "budget_rift") {
        const choice_id = details.choiceId || "";
        if (!BUDGET_RIFT_CHOICES[choice_id]) throw new RuleError("Budget Rift requires a valid choiceId.");
        resource_delta = JSON.parse(JSON.stringify(BUDGET_RIFT_CHOICES[choice_id].resourceDelta));
        const projected = {};
        for (const key of Object.keys(DEFAULT_RESOURCES)) projected[key] = clamp(session.resources[key] + (resource_delta[key] || 0));
        success = Object.values(projected).every(v => v >= 50);
        score = 1;
        finalDetails = { choiceId: choice_id, choiceLabel: BUDGET_RIFT_CHOICES[choice_id].label };
    } else {
        success = Boolean(payload.success);
        score = parseInt(payload.score || 0, 10);
        resource_delta = JSON.parse(JSON.stringify(success ? scenario.successDelta : scenario.failDelta));
    }

    const awards_points = success || minigame_id === "budget_rift";
    const points_earned = awards_points ? scenario.points : 0;
    session.points += points_earned;
    session.totalEarned = (session.totalEarned || 0) + points_earned;
    apply_resource_delta(session, resource_delta);
    session.currentScenarioIndex = (parseInt(session.currentScenarioIndex || 0, 10) + 1) % SCENARIOS.length;

    const result = {
        minigameId: scenario.minigameId,
        scenarioId: scenario.id,
        title: scenario.title,
        success,
        score,
        pointsEarned: points_earned,
        resourceChange: resource_delta,
        details: finalDetails,
        timestamp: now_iso(),
    };
    session.minigameHistory.push(result);

    check_collapse(session);
    if (!session.finalResult) check_game_over(session);
    touch(session);
    return { session, result };
}

export function buy_department(session, department_id, anchor_cell = null, rotation = 0, preset_id = "single") {
    ensure_world(session);
    ensure_action_allowed(session);

    if (!session.departments) session.departments = {};
    if (department_id === PORTAL_ROOM_ID) throw new RuleError("The Portal Room opens through the escape check.");
    if (!BUILDING_TYPES_BY_ID[department_id]) throw new RuleError(`Unknown building type: ${department_id}`);
    if (!anchor_cell || typeof anchor_cell !== 'object') throw new RuleError("anchorCell is required when placing a building.");

    const btype = BUILDING_TYPES_BY_ID[department_id];
    const anchor = {
        x: clamp_int(anchor_cell.x, 0, WORLD_SIZE - 1),
        y: clamp_int(anchor_cell.y, 0, WORLD_SIZE - 1),
    };
    const existing = Object.values(session.departments).filter(d => d.typeId === department_id).length;
    const instance_id = `${department_id}#${existing + 1}`;
    
    const placement = create_department_placement(department_id, anchor, rotation, department_id);
    validate_department_placement(session, department_id, placement);

    const price = btype.cost;
    if (session.points < price) throw new RuleError(`Not enough points for ${btype.name}.`);

    const resource_delta = JSON.parse(JSON.stringify(btype.resourceEffect));
    session.points -= price;
    session.totalSpent = (session.totalSpent || 0) + price;
    const instance = {
        id: instance_id,
        typeId: department_id,
        name: btype.name,
        resource: btype.resource,
        meaning: btype.meaning,
        built: true,
        level: 1,
        builtAt: now_iso(),
        lastChangedAt: now_iso(),
        resourceEffect: JSON.parse(JSON.stringify(resource_delta)),
        placement: JSON.parse(JSON.stringify(placement)),
        worldCell: JSON.parse(JSON.stringify(placement.anchorCell)),
    };
    session.departments[instance_id] = instance;
    apply_resource_delta(session, resource_delta);

    const action = {
        departmentId: instance_id,
        departmentName: btype.name,
        action: "build",
        cost: price,
        resourceChange: resource_delta,
        placement: JSON.parse(JSON.stringify(placement)),
        timestamp: now_iso(),
    };

    check_collapse(session);
    touch(session);
    return { session, action };
}

export function set_pause(session, paused) {
    ensure_world(session);
    update_play_time(session);
    session.paused = Boolean(paused);
    session.lastResumedAt = now_iso();
    touch(session);
    return session;
}

export function in_world_bounds(world, x, y) {
    const size = parseInt(world.size || WORLD_SIZE, 10);
    return x >= 0 && x < size && y >= 0 && y < size;
}

export function update_light_connection(world, x, y) {
    const end = world.end;
    if (distance({ x, y }, end) <= 1) {
        world.connectedToLight = true;
        const end_key = coord_key(end.x, end.y);
        if (!world.builtPath.includes(end_key)) world.builtPath.push(end_key);
    }
}

export function build_world_cell(session, x, y) {
    ensure_world(session);
    ensure_action_allowed(session);

    const world = session.world;
    if (!in_world_bounds(world, x, y)) throw new RuleError("That cell is outside the 32x32 office grid.");

    const cell_key = coord_key(x, y);
    const offices = office_cell_keys(session);
    if ((world.builtPath || []).includes(cell_key)) throw new RuleError("That path tile is already built.");
    if (offices.has(cell_key)) throw new RuleError("Corridors cannot run through an office.");
    
    const buildable = new Set([...(world.builtPath || []), ...offices]);
    const neighbors = [coord_key(x + 1, y), coord_key(x - 1, y), coord_key(x, y + 1), coord_key(x, y - 1)];
    
    if (!is_border_cell(world, x, y) && !neighbors.some(n => buildable.has(n))) {
        throw new RuleError("Build the corridor from your office, path, or a map border.");
    }

    const blackhole = cell_touches_blackhole_danger(world, x, y);
    if (blackhole) {
        world.lostToBlackhole = { x, y, blackholeId: blackhole.id };
        session.finalResult = {
            status: "lost_to_blackhole",
            escaped: false,
            timestamp: now_iso(),
            reason: "The path touched a blackhole gravity field and the office was swallowed.",
        };
        touch(session);
        return {
            session, action: {
                built: false, lost: true, x, y, cost: 0, connectedToLight: false
            }
        };
    }

    if (session.points < PATH_BUILD_COST) throw new RuleError(`Path tiles cost ${PATH_BUILD_COST} points.`);

    session.points -= PATH_BUILD_COST;
    session.totalSpent = (session.totalSpent || 0) + PATH_BUILD_COST;
    world.builtPath.push(cell_key);
    update_light_connection(world, x, y);

    const action = {
        built: true,
        lost: false,
        x, y,
        cost: PATH_BUILD_COST,
        connectedToLight: Boolean(world.connectedToLight),
    };
    touch(session);
    return { session, action };
}

export function missing_escape_requirements(session) {
    ensure_world(session);
    const missing = [];
    if (!session.world.connectedToLight) missing.push("Build a safe path from the office core to the nebula gate");

    for (const type_id of RESOURCE_BUILDING_IDS) {
        if (!building_type_built(session, type_id)) missing.push(`Build a ${BUILDING_TYPES_BY_ID[type_id].name}`);
    }

    for (const [resource, value] of Object.entries(session.resources)) {
        if (value < 50) missing.push(`Raise ${RESOURCE_LABELS[resource]} to at least 50`);
    }
    return missing;
}

export function escape_check(session) {
    ensure_world(session);
    if (session.finalResult && session.finalResult.status === "collapsed") {
        return {
            session, result: {
                eligible: false, missing: ["The office has already collapsed."], finalResult: session.finalResult
            }
        };
    }

    const missing = missing_escape_requirements(session);
    const eligible = missing.length === 0;
    if (eligible && !session.finalResult) {
        const portal_placement = create_department_placement(PORTAL_ROOM_ID, DEPARTMENT_WORLD_CELLS[PORTAL_ROOM_ID], 0);
        if (!session.departments) session.departments = {};
        session.departments[PORTAL_ROOM_ID] = {
            id: PORTAL_ROOM_ID,
            typeId: PORTAL_ROOM_ID,
            name: "Portal Room",
            resource: null,
            built: true,
            level: 1,
            builtAt: now_iso(),
            portal: true,
            placement: portal_placement,
            worldCell: JSON.parse(JSON.stringify(portal_placement.anchorCell)),
        };
        session.finalScore = session.points;
        session.finalResult = {
            status: "escaped",
            escaped: true,
            timestamp: now_iso(),
            reason: "The Portal Room opened and the office escaped the void.",
            finalScore: session.points,
        };
    }

    const result = { eligible, missing, finalResult: JSON.parse(JSON.stringify(session.finalResult || null)) };
    touch(session);
    return { session, result };
}

export function build_report(session, proposal = {}) {
    ensure_world(session);
    const state = proposal.state || {};
    let final_result = session.finalResult;
    if (!final_result) {
        final_result = {
            status: "in_progress",
            escaped: false,
            reason: "The office is still being built.",
            missing: missing_escape_requirements(session),
        };
    }

    const is_escaped = final_result && final_result.escaped;
    const final_score = is_escaped ? session.points : 0;
    session.finalScore = final_score;

    return {
        projectTitle: state.projectTitle || "Void Office Tycoon",
        studentId: session.studentId,
        sessionId: session.sessionId,
        points: session.points,
        totalEarned: session.totalEarned || 0,
        totalSpent: session.totalSpent || 0,
        finalScore: final_score,
        playTimeMs: session.playTimeMs || 0,
        resources: JSON.parse(JSON.stringify(session.resources)),
        builtDepartments: Object.values(session.departments || {}).filter(d => d.built),
        world: JSON.parse(JSON.stringify(session.world)),
        minigameResults: JSON.parse(JSON.stringify(session.minigameHistory || [])),
        choiceLog: JSON.parse(JSON.stringify(session.choiceLog || [])),
        finalResult: JSON.parse(JSON.stringify(final_result)),
        reflectionPrompts: [
            "Which department choice protected the project most?",
            "Which resource became hardest to balance?",
            "What would you change in the next office expansion plan?",
        ],
        successCriteria: JSON.parse(JSON.stringify(state.successCriteria || [])),
        kpis: JSON.parse(JSON.stringify(state.kpis || [])),
        generatedAt: now_iso(),
    };
}
