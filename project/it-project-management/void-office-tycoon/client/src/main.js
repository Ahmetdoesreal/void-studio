import './styles.css';
import Phaser from 'phaser';
import actionTilesSprite from './assets/sprites/habbo_world/action_tiles.png';
import blackholeSprite from './assets/sprites/habbo_world/blackhole_habbo.png';
import coffeeTableSprite from './assets/sprites/habbo_world/coffee_table.png';
import coffeeMachineSprite from './assets/sprites/habbo_world/coffee_machine.png';
import floorLampSprite from './assets/sprites/habbo_world/floor_lamp.png';
import goldTileSprite from './assets/sprites/habbo_world/gold_tile.png';
import labTableSprite from './assets/sprites/habbo_world/lab_table.png';
import laptopDeskSprite from './assets/sprites/habbo_world/laptop_desk.png';
import nebulaGateSprite from './assets/sprites/habbo_world/nebula_gate_habbo.png';
import officeChairSprite from './assets/sprites/habbo_world/office_chair.png';
import officeDoorSprite from './assets/sprites/habbo_world/office_door.png';
import plantSprite from './assets/sprites/habbo_world/plant.png';
import playerSprite from './assets/sprites/habbo_world/player_habbo.png';
import portalRoomSprite from './assets/sprites/habbo_world/portal_room_habbo.png';
import sofaSprite from './assets/sprites/habbo_world/sofa.png';
import tableSprite from './assets/sprites/habbo_world/table.png';
import vaultDoorSprite from './assets/sprites/habbo_world/vault_door.png';
import tileVoidSprite from './assets/sprites/habbo_world/void_tile.png';
import wallPanelSprite from './assets/sprites/habbo_world/wall_panel.png';
import woodFloorSprite from './assets/sprites/habbo_world/wood_floor.png';

const appEl = document.querySelector('#app');

const api = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `Request failed: ${response.status}`);
    }
    return payload;
  },
  get(path) {
    return this.request(path);
  },
  post(path, body = {}) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};

const STORAGE_KEY = 'voidOfficeTycoon.sessionId';
const FULLSCREEN_PATH = '/fullscreen';
const CHUNK_COUNT = 32;
const SUBCELLS_PER_CELL = 4;
const WORLD_TILE_SIZE = CHUNK_COUNT;
const TILE_STEP_X = 24;
const TILE_STEP_Y = 12;
const BOARD_LEFT_PADDING = 64;
const BOARD_TOP_PADDING = 80;
const MIN_MAP_ZOOM = 0.12;
const MAX_MAP_ZOOM = 1.6;
const ZOOM_STEP = 0.15;
const CORRECT_BACKLOG_ORDER = ['s1', 's6', 's2', 's4', 's3', 's5'];
const START_BACKLOG_ORDER = ['s3', 's1', 's5', 's2', 's6', 's4'];

const sprites = {
  tileVoid: tileVoidSprite,
  pathFloor: woodFloorSprite,
  lightFloor: goldTileSprite,
  actionTiles: actionTilesSprite,
  blackhole: blackholeSprite,
  player: playerSprite,
  officeCore: tableSprite,
  scope_desk: laptopDeskSprite,
  bug_lab: labTableSprite,
  sprint_floor: actionTilesSprite,
  risk_vault: vaultDoorSprite,
  stakeholder_booth: coffeeMachineSprite,
  nebulaGate: nebulaGateSprite,
  portal_room: portalRoomSprite,
  coffeeTable: coffeeTableSprite,
  coffeeMachine: coffeeMachineSprite,
  floorLamp: floorLampSprite,
  labTable: labTableSprite,
  laptopDesk: laptopDeskSprite,
  officeChair: officeChairSprite,
  officeDoor: officeDoorSprite,
  plant: plantSprite,
  sofa: sofaSprite,
  table: tableSprite,
  vaultDoor: vaultDoorSprite,
  wallPanel: wallPanelSprite
};

const spriteKeyByUrl = new Map(Object.entries(sprites).map(([key, value]) => [value, key]));

function spriteKeyForUrl(url) {
  return spriteKeyByUrl.get(url) || 'tileVoid';
}

const SAMPLE_OFFICE = {
  bounds: { minX: 7, maxX: 21, minY: 7, maxY: 19 },
  floors: [
    { sprite: 'actionTiles', minX: 10, maxX: 14, minY: 16, maxY: 18 },
    { sprite: 'lightFloor', minX: 17, maxX: 20, minY: 14, maxY: 18 }
  ],
  furniture: [
    { id: 'front-door', sprite: 'officeDoor', x: 7, y: 15, size: 'tall' },
    { id: 'scope-desk', sprite: 'laptopDesk', x: 10, y: 9, size: 'medium' },
    { id: 'scope-chair', sprite: 'officeChair', x: 10, y: 10, size: 'small' },
    { id: 'planning-table', sprite: 'table', x: 13, y: 10, size: 'medium' },
    { id: 'planning-chair-west', sprite: 'officeChair', x: 12, y: 10, size: 'small' },
    { id: 'planning-chair-east', sprite: 'officeChair', x: 14, y: 10, size: 'small' },
    { id: 'lab-table', sprite: 'labTable', x: 18, y: 10, size: 'medium' },
    { id: 'lab-chair', sprite: 'officeChair', x: 18, y: 11, size: 'small' },
    { id: 'lab-panel', sprite: 'wallPanel', x: 20, y: 9, size: 'wall' },
    { id: 'meeting-table', sprite: 'table', x: 14, y: 14, size: 'wide' },
    { id: 'meeting-chair-west', sprite: 'officeChair', x: 13, y: 14, size: 'small' },
    { id: 'meeting-chair-east', sprite: 'officeChair', x: 15, y: 14, size: 'small' },
    { id: 'meeting-chair-south', sprite: 'officeChair', x: 14, y: 15, size: 'small' },
    { id: 'coffee-machine', sprite: 'coffeeMachine', x: 9, y: 17, size: 'medium' },
    { id: 'coffee-table', sprite: 'coffeeTable', x: 11, y: 17, size: 'low' },
    { id: 'sofa', sprite: 'sofa', x: 12, y: 18, size: 'wide' },
    { id: 'lounge-plant', sprite: 'plant', x: 8, y: 18, size: 'tall' },
    { id: 'lounge-lamp', sprite: 'floorLamp', x: 13, y: 17, size: 'tall' },
    { id: 'vault-door', sprite: 'vaultDoor', x: 20, y: 16, size: 'medium' },
    { id: 'vault-table', sprite: 'table', x: 18, y: 16, size: 'medium' },
    { id: 'north-plant', sprite: 'plant', x: 8, y: 8, size: 'tall' },
    { id: 'east-lamp', sprite: 'floorLamp', x: 20, y: 13, size: 'tall' }
  ]
};

const backlogItems = [
  { id: 's1', text: 'Class ID login before saving a report', note: 'Persistence and privacy gate' },
  { id: 's2', text: 'Portal Room opens after balanced resources', note: 'Core win condition' },
  { id: 's3', text: 'Animated desk plant skins', note: 'Cosmetic polish' },
  { id: 's4', text: 'Final reflection export for facilitator review', note: 'Assessment artifact' },
  { id: 's5', text: 'Optional neon nameplates for departments', note: 'Cosmetic polish' },
  { id: 's6', text: 'Pause state keeps the office visible', note: 'Classroom facilitation' }
];

const bugCards = [
  { id: 'b1', title: 'Report export deletes the latest choice', severity: 'serious' },
  { id: 'b2', title: 'Budget text wraps on one laptop size', severity: 'minor' },
  { id: 'b3', title: 'Portal opens with Quality below 50', severity: 'serious' },
  { id: 'b4', title: 'Department hover color feels too quiet', severity: 'minor' },
  { id: 'b5', title: 'Paused students can still buy upgrades', severity: 'serious' },
  { id: 'b6', title: 'Reflection prompt has a typo', severity: 'minor' }
];

const budgetChoices = [
  {
    id: 'budget_patch',
    title: 'Stabilize procurement',
    text: 'Protect Budget while accepting a small Team cost.',
    delta: { budget: 15, team: -4, quality: 0 }
  },
  {
    id: 'team_sync',
    title: 'Protect the team',
    text: 'Recover Team confidence with a controlled budget spend.',
    delta: { budget: -6, team: 14, quality: 2 }
  },
  {
    id: 'quality_gate',
    title: 'Fund quality gates',
    text: 'Spend Budget now to prevent weaker releases later.',
    delta: { budget: -8, team: 0, quality: 16 }
  }
];

const minigames = [
  { id: 'scope_fog', title: 'Scope Fog', sourceId: 'SC-01' },
  { id: 'bug_rain', title: 'Bug Rain', sourceId: 'SC-02' },
  { id: 'budget_rift', title: 'Budget Rift', sourceId: 'SC-03' }
];

const game = {
  proposal: null,
  session: null,
  report: null,
  log: null,
  screen: 'loading',
  activeMinigame: 'scope_fog',
  error: '',
  notice: '',
  lastResult: null,
  lastEscape: null,
  minigameState: {},
  backlogOrder: [...START_BACKLOG_ORDER],
  draggedBacklogId: '',
  placement: { departmentId: '', rotation: 0, previewAnchor: null },
  fullscreen: {
    zoom: 1,
    hoverCell: null,
    hasAutoSnapped: false
  },
  debugOpen: false,
  showCorrectAnswers: false
};

async function boot() {
  try {
    const proposalResponse = await api.get('/api/proposal');
    game.proposal = proposalResponse.proposal;

    const savedSessionId = localStorage.getItem(STORAGE_KEY);
    if (savedSessionId) {
      try {
        const sessionResponse = await api.get(`/api/sessions/${savedSessionId}`);
        game.session = sessionResponse.session;
        game.screen = 'dashboard';
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        game.screen = 'start';
      }
    } else {
      game.screen = 'start';
    }
  } catch (error) {
    game.screen = 'start';
    game.error = `API unavailable: ${error.message}`;
  }

  resetMinigameState();
  render();
}

function proposalState() {
  return game.proposal?.state || {};
}

function activeScenario() {
  return minigames.find(item => item.id === game.activeMinigame) || minigames[0];
}

function resetMinigameState() {
  if (game.activeMinigame === 'bug_rain') {
    game.minigameState = { selected: [] };
  } else if (game.activeMinigame === 'budget_rift') {
    game.minigameState = { choiceId: '' };
  } else {
    game.minigameState = {};
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resourceLabel(key) {
  return {
    budget: 'Budget',
    team: 'Team',
    quality: 'Quality'
  }[key] || key;
}

function formatDelta(delta = {}) {
  const parts = Object.entries(delta)
    .filter(([, value]) => Number(value) !== 0)
    .map(([key, value]) => {
      const sign = value > 0 ? '+' : '';
      return `${resourceLabel(key)} ${sign}${value}`;
    });
  return parts.length ? parts.join(', ') : 'No resource change';
}

function canAct() {
  return game.session && !game.session.paused && !game.session.finalResult;
}

function isFullscreenRoute() {
  return window.location.pathname === FULLSCREEN_PATH;
}

function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  if (path === FULLSCREEN_PATH) {
    clearPlacement();
    game.fullscreen.hasAutoSnapped = false;
  }
  render();
}

function clampZoom(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, parsed));
}

function sortedDepartments() {
  const departments = Object.values(game.session?.departments || {});
  const order = [
    'scope_desk',
    'bug_lab',
    'sprint_floor',
    'risk_vault',
    'stakeholder_booth',
    'portal_room'
  ];
  return departments.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

function worldState() {
  return game.session?.world || {
    size: WORLD_TILE_SIZE,
    subcellsPerCell: SUBCELLS_PER_CELL,
    start: { x: 1, y: 16 },
    end: { x: 30, y: 16 },
    pathBuildCost: 2,
    blackholes: [],
    builtPath: ['1,16'],
    connectedToLight: false
  };
}

function coordKey(x, y) {
  return `${x},${y}`;
}

function coordDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function worldTileSize(world = worldState()) {
  const size = Number(world?.size) || WORLD_TILE_SIZE;
  return Math.max(1, Math.min(size, WORLD_TILE_SIZE));
}

function subcellsPerCell(world = worldState()) {
  return Number(world?.subcellsPerCell) || SUBCELLS_PER_CELL;
}

function boardDimensions(world = worldState()) {
  const size = worldTileSize(world);
  return {
    width: size * TILE_STEP_X * 2 + BOARD_LEFT_PADDING * 2,
    height: size * TILE_STEP_Y * 2 + BOARD_TOP_PADDING + 220
  };
}

function fineCellPosition(world, fineX, fineY) {
  const size = worldTileSize(world);
  return {
    left: (Number(fineX) - Number(fineY)) * TILE_STEP_X + size * TILE_STEP_X + BOARD_LEFT_PADDING,
    top: (Number(fineX) + Number(fineY)) * TILE_STEP_Y + BOARD_TOP_PADDING
  };
}

function isoCellPosition(world, x, y) {
  return fineCellPosition(world, x, y);
}

function fineCoordFromTile(x, y, offsetX = 0, offsetY = 0) {
  return {
    x: Number(x) + Number(offsetX),
    y: Number(y) + Number(offsetY)
  };
}

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function isSampleOfficeFloor(x, y) {
  const bounds = SAMPLE_OFFICE.bounds;
  return inRange(x, bounds.minX, bounds.maxX) && inRange(y, bounds.minY, bounds.maxY);
}

function sampleOfficeFloorZone(x, y) {
  return SAMPLE_OFFICE.floors.find(item => (
    inRange(x, item.minX, item.maxX) && inRange(y, item.minY, item.maxY)
  ));
}

function sampleOfficeFloorSprite(x, y) {
  const zone = sampleOfficeFloorZone(x, y);
  return sprites[zone?.sprite] || sprites.pathFloor;
}

function sampleOfficeFloorClass(x, y) {
  const zone = sampleOfficeFloorZone(x, y);
  if (zone?.sprite === 'actionTiles') return 'sample-floor-action';
  if (zone?.sprite === 'lightFloor') return 'sample-floor-light';
  return isSampleOfficeFloor(x, y) ? 'sample-floor-wood' : '';
}

function floorSpriteForCell(x, y, { isPath, isStart, isEnd, lightSide }) {
  if (isPath || isStart) return sprites.pathFloor;
  if (isSampleOfficeFloor(x, y)) return sampleOfficeFloorSprite(x, y);
  if (isEnd || lightSide) return sprites.lightFloor;
  return sprites.tileVoid;
}

function sampleOfficeWallEdges(x, y) {
  if (!isSampleOfficeFloor(x, y)) return [];
  const { minX, maxX, minY, maxY } = SAMPLE_OFFICE.bounds;
  const edges = [];

  if (y === minY) edges.push('north');
  if (y === maxY) edges.push('south');
  if (x === minX) edges.push('west');
  if (x === maxX) edges.push('east');

  return [...new Set(edges)];
}

function fineCoordForFurniture(item) {
  return fineCoordFromTile(
    Number(item.x),
    Number(item.y),
    Number(item.offsetX ?? 0),
    Number(item.offsetY ?? 0)
  );
}

function sampleOfficeWallSegments() {
  const segments = [];
  const bounds = SAMPLE_OFFICE.bounds;

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      for (const edge of sampleOfficeWallEdges(x, y)) {
        const nextX = x + 1;
        const nextY = y + 1;

        if (edge === 'north' || edge === 'south') {
          segments.push({
            direction: 'x',
            edge,
            fixed: edge === 'north' ? y : nextY,
            start: x,
            end: nextX
          });
        } else {
          segments.push({
            direction: 'y',
            edge,
            fixed: edge === 'west' ? x : nextX,
            start: y,
            end: nextY
          });
        }
      }
    }
  }

  return segments;
}

function mergeWallSegments(segments) {
  const groups = new Map();
  for (const segment of segments) {
    const key = `${segment.direction}:${segment.edge}:${segment.fixed}`;
    const group = groups.get(key) || { ...segment, intervals: [] };
    group.intervals.push({ start: segment.start, end: segment.end });
    groups.set(key, group);
  }

  const runs = [];
  for (const group of groups.values()) {
    const intervals = group.intervals.sort((a, b) => a.start - b.start);
    let current = null;

    for (const interval of intervals) {
      if (!current || interval.start > current.end) {
        if (current) runs.push({ ...group, ...current });
        current = { ...interval };
      } else {
        current.end = Math.max(current.end, interval.end);
      }
    }

    if (current) runs.push({ ...group, ...current });
  }

  return runs;
}

function wallRunPoint(world, run, value) {
  return run.direction === 'x'
    ? fineCellPosition(world, value, run.fixed)
    : fineCellPosition(world, run.fixed, value);
}

function renderWallRunLayer(world) {
  const runs = mergeWallSegments(sampleOfficeWallSegments());
  const { width: boardWidth, height: boardHeight } = boardDimensions(world);

  const faces = runs.map(run => {
    const wallHeight = run.edge === 'south' || run.edge === 'east' ? 18 : 24;
    const start = wallRunPoint(world, run, run.start);
    const end = wallRunPoint(world, run, run.end);
    const points = [
      `${start.left},${start.top}`,
      `${end.left},${end.top}`,
      `${end.left},${end.top - wallHeight}`,
      `${start.left},${start.top - wallHeight}`
    ].join(' ');
    const separators = [];
    for (let value = run.start + subcellsPerCell(world); value < run.end; value += subcellsPerCell(world)) {
      const point = wallRunPoint(world, run, value);
      separators.push(`<path class="wall-run-separator" d="M ${point.left} ${point.top} L ${point.left} ${point.top - wallHeight}" />`);
    }
    return `
      <g class="wall-run wall-run-${run.edge}">
        <polygon points="${points}" />
        ${separators.join('')}
      </g>
    `;
  }).join('');

  return `
    <svg class="wall-run-layer" width="${boardWidth}" height="${boardHeight}" viewBox="0 0 ${boardWidth} ${boardHeight}" aria-hidden="true">
      ${faces}
    </svg>
  `;
}

function renderFineGridLayer(world) {
  const fineSize = worldTileSize(world);
  const subcellCount = subcellsPerCell(world);
  const { width: boardWidth, height: boardHeight } = boardDimensions(world);
  const lines = [];

  for (let index = 0; index <= fineSize; index += 1) {
    const west = fineCellPosition(world, 0, index);
    const east = fineCellPosition(world, fineSize, index);
    const north = fineCellPosition(world, index, 0);
    const south = fineCellPosition(world, index, fineSize);
    const lineClass = [
      'fine-grid-line',
      index % subcellCount === 0 ? 'chunk-boundary' : '',
      index === 0 || index === fineSize ? 'world-boundary' : ''
    ].filter(Boolean).join(' ');

    lines.push(`<path class="${lineClass}" d="M ${west.left} ${west.top} L ${east.left} ${east.top}" />`);
    lines.push(`<path class="${lineClass}" d="M ${north.left} ${north.top} L ${south.left} ${south.top}" />`);
  }

  return `
    <svg class="fine-grid-layer" width="${boardWidth}" height="${boardHeight}" viewBox="0 0 ${boardWidth} ${boardHeight}" aria-hidden="true">
      ${lines.join('')}
    </svg>
  `;
}

function renderCellSubgrid(world) {
  const subcells = subcellsPerCell(world);
  const step = 48 / subcells;
  const lines = [];
  for (let index = 1; index < subcells; index += 1) {
    const position = Number((index * step).toFixed(3));
    lines.push(`<path d="M ${position} 0 L ${position} 48" />`);
    lines.push(`<path d="M 0 ${position} L 48 ${position}" />`);
  }
  return `
    <svg class="chunk-subgrid" viewBox="0 0 48 48" aria-hidden="true">
      <rect class="chunk-subgrid-fill" x="0" y="0" width="48" height="48" />
      <g class="chunk-subgrid-lines">${lines.join('')}</g>
    </svg>
  `;
}

function renderSampleOfficeOverlays(world) {
  const overlays = [];

  for (const item of SAMPLE_OFFICE.furniture) {
    const x = Number(item.x);
    const y = Number(item.y);
    const sprite = sprites[item.sprite];
    if (!sprite) continue;
    if (blackholeAt(x, y) || departmentAt(x, y) || departmentAnchorAt(x, y)) continue;
    if (world.end.x === x && world.end.y === y) continue;
    const fine = fineCoordForFurniture(item);
    const pos = fineCellPosition(world, fine.x, fine.y);
    overlays.push(`
      <span class="fine-block-overlay furniture-overlay" style="left: ${pos.left}px; top: ${pos.top}px; z-index: ${1100 + fine.x + fine.y};">
        <span class="world-furniture prop-${escapeHtml(item.size || 'medium')}">
          <img src="${sprite}" alt="" />
        </span>
      </span>
    `);
  }

  return `<div class="world-decoration-layer" aria-hidden="true">${renderWallRunLayer(world)}${overlays.join('')}</div>`;
}

function normalizeRotation(value) {
  const rotation = Number(value) || 0;
  return [0, 90, 180, 270].reduce((closest, item) => (
    Math.abs(item - rotation) < Math.abs(closest - rotation) ? item : closest
  ), 0);
}

function departmentFootprint(department) {
  return department?.footprint?.cells?.length
    ? department.footprint.cells
    : [{ x: 0, y: 0 }];
}

function rotatedOffsets(department, rotation) {
  const rotated = departmentFootprint(department).map(cell => {
    let x = Number(cell.x);
    let y = Number(cell.y);
    const normalized = normalizeRotation(rotation);
    if (normalized === 90) [x, y] = [y, -x];
    if (normalized === 180) [x, y] = [-x, -y];
    if (normalized === 270) [x, y] = [-y, x];
    return { x, y };
  });
  const minX = Math.min(...rotated.map(cell => cell.x));
  const minY = Math.min(...rotated.map(cell => cell.y));
  return rotated
    .map(cell => ({ x: cell.x - minX, y: cell.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function placementCells(department, anchor, rotation) {
  if (!department || !anchor) return [];
  return rotatedOffsets(department, rotation).map(offset => ({
    x: Number(anchor.x) + offset.x,
    y: Number(anchor.y) + offset.y,
    offsetX: offset.x,
    offsetY: offset.y
  }));
}

function cellTouchesBlackholeDanger(x, y) {
  return worldState().blackholes.find(hole => {
    const radius = Number(hole.dangerRadius ?? 2);
    const centerX = Number(hole.x) + 0.5;
    const centerY = Number(hole.y) + 0.5;
    const minDx = Math.max(Number(x) - centerX, 0, centerX - Number(x + 1));
    const minDy = Math.max(Number(y) - centerY, 0, centerY - Number(y + 1));
    return Math.max(minDx, minDy) <= radius;
  });
}

function pathSet() {
  return new Set(worldState().builtPath || []);
}

function isAdjacentToPath(x, y) {
  const path = pathSet();
  return [
    coordKey(x + 1, y),
    coordKey(x - 1, y),
    coordKey(x, y + 1),
    coordKey(x, y - 1)
  ].some(key => path.has(key));
}

function blackholeAt(x, y) {
  return worldState().blackholes.find(hole => hole.x === x && hole.y === y);
}

function blackholeDangerAt(x, y) {
  return cellTouchesBlackholeDanger(x, y);
}

function departmentAt(x, y) {
  return sortedDepartments().find(department => {
    const cells = department.placement?.occupiedCells || (department.worldCell ? [department.worldCell] : []);
    return department.built && cells.some(cell => Number(cell.x) === x && Number(cell.y) === y);
  });
}

function departmentAnchorAt(x, y) {
  return sortedDepartments().find(department => {
    const anchor = department.placement?.anchorCell || department.worldCell;
    return department.built && anchor && Number(anchor.x) === x && Number(anchor.y) === y;
  });
}

function placementModeDepartment() {
  if (!game.placement.departmentId) return null;
  return sortedDepartments().find(department => department.id === game.placement.departmentId) || null;
}

function occupiedByOtherDepartment(x, y, departmentId) {
  return sortedDepartments().some(department => (
    department.id !== departmentId &&
    department.built &&
    (department.placement?.occupiedCells || []).some(cell => Number(cell.x) === x && Number(cell.y) === y)
  ));
}

function cellsTouchPath(cells) {
  const path = pathSet();
  return cells.some(cell => [
    coordKey(cell.x + 1, cell.y),
    coordKey(cell.x - 1, cell.y),
    coordKey(cell.x, cell.y + 1),
    coordKey(cell.x, cell.y - 1)
  ].some(key => path.has(key)));
}

function placementPreview(anchor = game.placement.previewAnchor) {
  const department = placementModeDepartment();
  const world = worldState();
  if (!department || !anchor) return { cells: [], valid: false, reason: '' };
  const size = worldTileSize(world);
  const cells = placementCells(department, anchor, game.placement.rotation);
  const startKey = coordKey(world.start.x, world.start.y);
  const endKey = coordKey(world.end.x, world.end.y);
  const path = pathSet();
  const invalid = cells.find(cell => {
    const key = coordKey(cell.x, cell.y);
    return (
      cell.x < 0 ||
      cell.y < 0 ||
      cell.x >= size ||
      cell.y >= size ||
      key === startKey ||
      key === endKey ||
      path.has(key) ||
      cellTouchesBlackholeDanger(cell.x, cell.y) ||
      occupiedByOtherDepartment(cell.x, cell.y, department.id)
    );
  });
  if (invalid) return { cells, valid: false, reason: 'Blocked footprint' };
  if (!cellsTouchPath(cells)) return { cells, valid: false, reason: 'Must touch path' };
  return { cells, valid: true, reason: 'Valid placement' };
}

function placementPreviewForCell(x, y) {
  if (!game.placement.departmentId || !game.placement.previewAnchor) return null;
  const preview = placementPreview();
  const inFootprint = preview.cells.some(cell => cell.x === x && cell.y === y);
  return inFootprint ? preview : null;
}

function playerCell() {
  const world = worldState();
  const path = world.builtPath || [];
  const last = path[path.length - 1] || coordKey(world.start.x, world.start.y);
  const [x, y] = last.split(',').map(Number);
  return { x, y };
}

function playerBoardPosition(world = worldState()) {
  const player = playerCell();
  const pos = isoCellPosition(world, player.x, player.y);
  return {
    left: pos.left,
    top: pos.top + 24
  };
}

function snapMapToPlayer(behavior = 'smooth') {
  const scrollEl = document.querySelector('[data-fullscreen-scroll]');
  if (!scrollEl) return;
  const zoom = clampZoom(game.fullscreen.zoom);
  const pos = playerBoardPosition();
  scrollEl.scrollTo({
    left: Math.max(0, pos.left * zoom - scrollEl.clientWidth / 2),
    top: Math.max(0, pos.top * zoom - scrollEl.clientHeight / 2),
    behavior
  });
}

function fullscreenContentBounds(world = worldState()) {
  const path = pathSet();
  const player = playerCell();
  const keys = collectRenderableCellKeys(world, path, player);
  let minLeft = Infinity;
  let maxLeft = -Infinity;
  let minTop = Infinity;
  let maxTop = -Infinity;

  for (const key of keys) {
    const [x, y] = key.split(',').map(Number);
    const pos = isoCellPosition(world, x, y);
    minLeft = Math.min(minLeft, pos.left - 56);
    maxLeft = Math.max(maxLeft, pos.left + 56);
    minTop = Math.min(minTop, pos.top - 92);
    maxTop = Math.max(maxTop, pos.top + 72);
  }

  if (!Number.isFinite(minLeft)) {
    return { minLeft: 0, maxLeft: 0, minTop: 0, maxTop: 0, width: 1, height: 1 };
  }

  return {
    minLeft,
    maxLeft,
    minTop,
    maxTop,
    width: Math.max(1, maxLeft - minLeft),
    height: Math.max(1, maxTop - minTop)
  };
}

function centerFullscreenBounds(bounds = fullscreenContentBounds(), behavior = 'auto') {
  const scrollEl = document.querySelector('[data-fullscreen-scroll]');
  if (!scrollEl) return;
  const zoom = clampZoom(game.fullscreen.zoom);
  const centerX = (bounds.minLeft + bounds.maxLeft) / 2;
  const centerY = (bounds.minTop + bounds.maxTop) / 2;
  scrollEl.scrollTo({
    left: Math.max(0, centerX * zoom - scrollEl.clientWidth / 2),
    top: Math.max(0, centerY * zoom - scrollEl.clientHeight / 2 - 8),
    behavior
  });
}

function queueSnapMapToPlayer(force = false, behavior = 'auto') {
  if (!game.session || !isFullscreenRoute()) return;
  if (!force && game.fullscreen.hasAutoSnapped) return;
  requestAnimationFrame(() => {
    snapMapToPlayer(behavior);
    game.fullscreen.hasAutoSnapped = true;
  });
}

function queueCenterFullscreenContent(behavior = 'auto') {
  if (!game.session || !isFullscreenRoute()) return;
  requestAnimationFrame(() => centerFullscreenBounds(fullscreenContentBounds(), behavior));
}

function setFullscreenZoom(value, centerContent = false) {
  game.fullscreen.zoom = clampZoom(value);
  if (activeOfficeMap?.scene?.mode === 'fullscreen') {
    activeOfficeMap.scene.setZoomFromUi(game.fullscreen.zoom);
    if (centerContent) activeOfficeMap.scene.centerOnContent();
    return;
  }
  render();
}

function fitFullscreenMap(behavior = 'auto') {
  if (activeOfficeMap?.scene?.mode === 'fullscreen') {
    activeOfficeMap.scene.fitToContent();
    return;
  }
  game.fullscreen.hasAutoSnapped = false;
  render();
}

function queueFitFullscreenMap(force = false, behavior = 'auto') {
  if (!game.session || !isFullscreenRoute()) return;
  if (!force && game.fullscreen.hasAutoSnapped) return;
  requestAnimationFrame(() => fitFullscreenMap(behavior));
}

let activeOfficeMap = null;

function tileCenter(world, x, y) {
  const pos = isoCellPosition(world, x, y);
  return { x: pos.left, y: pos.top + 24 };
}

function spriteDisplaySize(size = 'medium') {
  return {
    small: { width: 38, height: 54, lift: 4 },
    low: { width: 48, height: 34, lift: 10 },
    medium: { width: 54, height: 68, lift: 3 },
    wide: { width: 86, height: 64, lift: 4 },
    tall: { width: 56, height: 82, lift: 0 },
    wall: { width: 58, height: 80, lift: 2 }
  }[size] || { width: 54, height: 68, lift: 3 };
}

function mapCellFromWorldPoint(world, worldX, worldY) {
  return cellFromBoardPoint(world, worldX, worldY - 24);
}

class OfficeMapScene extends Phaser.Scene {
  constructor(mode) {
    super('OfficeMapScene');
    this.mode = mode;
    this.dragStart = null;
    this.didDrag = false;
    this.hoverCell = null;
  }

  preload() {
    Object.entries(sprites).forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  create() {
    if (activeOfficeMap) activeOfficeMap.scene = this;
    this.cameras.main.setBackgroundColor('#02030a');
    this.renderMap();
    this.setupCamera();
    this.setupInput();
  }

  renderMap() {
    this.children.removeAll(true);
    const world = worldState();
    const dims = boardDimensions(world);
    this.cameras.main.setBounds(0, 0, dims.width, dims.height);
    this.drawBackground(dims);
    this.drawFineGrid(world);
    this.drawTiles(world);
    this.drawRoomWalls(world);
    this.drawSampleFurniture(world);
    this.drawWorldObjects(world);
    this.drawPlacementPreview(world);
  }

  drawBackground(dims) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x02030a, 0x0a1020, 0x111827, 0x2b3150, 1);
    bg.fillRect(0, 0, dims.width, dims.height);
  }

  drawFineGrid(world) {
    const size = worldTileSize(world);
    const subcellCount = subcellsPerCell(world);
    const alpha = this.mode === 'fullscreen' ? 0.16 : 0.12;
    const grid = this.add.graphics().setDepth(20);

    for (let index = 0; index <= size; index += 1) {
      const isChunk = index % subcellCount === 0;
      const isBoundary = index === 0 || index === size;
      const color = isBoundary ? 0xe6ecf6 : isChunk ? 0xb8cdf0 : 0xc5d6ee;
      const lineAlpha = isBoundary ? alpha * 2.2 : isChunk ? alpha * 1.85 : alpha;
      const lineWidth = isBoundary ? 1.2 : isChunk ? 0.9 : 0.45;
      grid.lineStyle(lineWidth, color, lineAlpha);

      const west = fineCellPosition(world, 0, index);
      const east = fineCellPosition(world, size, index);
      const north = fineCellPosition(world, index, 0);
      const south = fineCellPosition(world, index, size);
      grid.lineBetween(west.left, west.top + 24, east.left, east.top + 24);
      grid.lineBetween(north.left, north.top + 24, south.left, south.top + 24);
    }
  }

  drawTiles(world) {
    const path = pathSet();
    const player = playerCell();
    const preview = placementPreview();
    const keys = collectRenderableCellKeys(world, path, player);

    [...keys]
      .map(key => key.split(',').map(Number))
      .sort(([ax, ay], [bx, by]) => (ax + ay) - (bx + by) || ay - by || ax - bx)
      .forEach(([x, y]) => {
        const key = coordKey(x, y);
        const isPath = path.has(key);
        const isStart = world.start.x === x && world.start.y === y;
        const isEnd = world.end.x === x && world.end.y === y;
        const lightSide = x >= Math.floor(worldTileSize(world) * 0.68);
        const previewCell = preview.cells?.some(cell => Number(cell.x) === x && Number(cell.y) === y);
        const department = departmentAt(x, y);
        const shouldDrawVoid = isPath || isStart || isEnd || blackholeAt(x, y) || blackholeDangerAt(x, y) || department || previewCell;
        if (!isSampleOfficeFloor(x, y) && !shouldDrawVoid) return;

        const center = tileCenter(world, x, y);
        const spriteKey = spriteKeyForUrl(floorSpriteForCell(x, y, { isPath, isStart, isEnd, lightSide }));
        const tile = this.add.image(center.x, center.y, spriteKey)
          .setDisplaySize(48, 48)
          .setDepth(100 + x + y);
        tile.setAlpha(isSampleOfficeFloor(x, y) || isPath || isStart || isEnd ? 0.92 : 0.45);

        if (department) tile.setTint(0x8fb7d9);
        if (blackholeDangerAt(x, y)) tile.setTint(0x8b3940);
        if (previewCell) tile.setTint(preview.valid ? 0x7ccf83 : 0xe77764).setAlpha(0.8);
      });
  }

  drawRoomWalls(world) {
    const wall = this.add.graphics().setDepth(760);
    const runs = mergeWallSegments(sampleOfficeWallSegments());
    runs.forEach(run => {
      const height = run.edge === 'south' || run.edge === 'east' ? 18 : 24;
      const start = wallRunPoint(world, run, run.start);
      const end = wallRunPoint(world, run, run.end);
      const points = [
        new Phaser.Math.Vector2(start.left, start.top + 24),
        new Phaser.Math.Vector2(end.left, end.top + 24),
        new Phaser.Math.Vector2(end.left, end.top + 24 - height),
        new Phaser.Math.Vector2(start.left, start.top + 24 - height)
      ];
      const fill = run.edge === 'north' || run.edge === 'west' ? 0x516577 : 0x35485a;
      wall.fillStyle(fill, 0.94);
      wall.fillPoints(points, true);
      wall.lineStyle(1, 0xbcd0dc, 0.42);
      wall.strokePoints(points, true);
    });
  }

  drawSampleFurniture(world) {
    for (const item of SAMPLE_OFFICE.furniture) {
      const x = Number(item.x);
      const y = Number(item.y);
      if (blackholeAt(x, y) || departmentAt(x, y) || departmentAnchorAt(x, y)) continue;
      if (world.end.x === x && world.end.y === y) continue;

      const fine = fineCoordForFurniture(item);
      const pos = fineCellPosition(world, fine.x, fine.y);
      const size = spriteDisplaySize(item.size);
      const sprite = this.add.image(pos.left, pos.top + 48 - size.lift, item.sprite)
        .setOrigin(0.5, 1)
        .setDisplaySize(size.width, size.height)
        .setDepth(900 + fine.x + fine.y);
      sprite.setPipelineData?.('pixelArt', true);
    }
  }

  drawWorldObjects(world) {
    const path = pathSet();
    const player = playerCell();
    const keys = collectRenderableCellKeys(world, path, player);

    [...keys]
      .map(key => key.split(',').map(Number))
      .sort(([ax, ay], [bx, by]) => (ax + ay) - (bx + by) || ay - by || ax - bx)
      .forEach(([x, y]) => {
        const isStart = world.start.x === x && world.start.y === y;
        const isEnd = world.end.x === x && world.end.y === y;
        const blackhole = blackholeAt(x, y);
        const anchorDepartment = departmentAnchorAt(x, y);
        const objectSprite = getWorldObjectSprite({ isStart, isEnd, blackhole, department: anchorDepartment });
        const center = tileCenter(world, x, y);

        if (objectSprite) {
          const key = spriteKeyForUrl(objectSprite);
          const isPortal = isEnd;
          const isHole = Boolean(blackhole);
          const object = this.add.image(center.x, center.y + (isHole ? 18 : 30), key)
            .setOrigin(0.5, 1)
            .setDepth(1000 + x + y);
          object.setDisplaySize(isPortal ? 88 : isHole ? 70 : 64, isPortal ? 88 : isHole ? 70 : 82);
        }

        if (player.x === x && player.y === y && !game.session.finalResult) {
          this.add.image(center.x, center.y + 18, 'player')
            .setOrigin(0.5, 1)
            .setDisplaySize(44, 44)
            .setDepth(1200 + x + y);
        }
      });
  }

  drawPlacementPreview(world) {
    if (!game.placement.departmentId || !game.placement.previewAnchor) return;
    const preview = placementPreview();
    const graphics = this.add.graphics().setDepth(1350);
    graphics.lineStyle(2, preview.valid ? 0x7ccf83 : 0xe77764, 0.95);
    graphics.fillStyle(preview.valid ? 0x7ccf83 : 0xe77764, 0.16);
    preview.cells.forEach(cell => {
      const center = tileCenter(world, cell.x, cell.y);
      graphics.fillEllipse(center.x, center.y, 38, 22);
      graphics.strokeEllipse(center.x, center.y, 38, 22);
    });
  }

  setupCamera() {
    const bounds = fullscreenContentBounds();
    const cam = this.cameras.main;
    const usableWidth = Math.max(320, cam.width - (this.mode === 'fullscreen' ? 40 : 24));
    const usableHeight = Math.max(260, cam.height - (this.mode === 'fullscreen' ? 156 : 24));
    const fitZoom = Phaser.Math.Clamp(
      Math.min(usableWidth / bounds.width, usableHeight / bounds.height) * 0.92,
      MIN_MAP_ZOOM,
      MAX_MAP_ZOOM
    );
    const zoom = this.mode === 'fullscreen' && game.fullscreen.hasAutoSnapped
      ? clampZoom(game.fullscreen.zoom)
      : fitZoom;
    cam.setZoom(zoom);
    cam.centerOn((bounds.minLeft + bounds.maxLeft) / 2, (bounds.minTop + bounds.maxTop) / 2 + 16);
    if (this.mode === 'fullscreen') {
      game.fullscreen.zoom = zoom;
      game.fullscreen.hasAutoSnapped = true;
      this.updateZoomLabel();
    }
  }

  setupInput() {
    const cam = this.cameras.main;

    this.input.on('pointerdown', pointer => {
      this.dragStart = {
        x: pointer.x,
        y: pointer.y,
        scrollX: cam.scrollX,
        scrollY: cam.scrollY
      };
      this.didDrag = false;
    });

    this.input.on('pointermove', pointer => {
      if (this.dragStart && pointer.isDown) {
        const dx = pointer.x - this.dragStart.x;
        const dy = pointer.y - this.dragStart.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) this.didDrag = true;
        if (this.didDrag) {
          cam.scrollX = this.dragStart.scrollX - dx / cam.zoom;
          cam.scrollY = this.dragStart.scrollY - dy / cam.zoom;
          return;
        }
      }
      this.updateHover(pointer);
    });

    this.input.on('pointerup', pointer => {
      const wasDrag = this.didDrag;
      this.dragStart = null;
      this.didDrag = false;
      if (!wasDrag && this.mode !== 'fullscreen') this.handleClick(pointer);
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const nextZoom = Phaser.Math.Clamp(cam.zoom * (deltaY > 0 ? 0.88 : 1.12), MIN_MAP_ZOOM, MAX_MAP_ZOOM);
      const before = cam.getWorldPoint(pointer.x, pointer.y);
      cam.setZoom(nextZoom);
      const after = cam.getWorldPoint(pointer.x, pointer.y);
      cam.scrollX += before.x - after.x;
      cam.scrollY += before.y - after.y;
      if (this.mode === 'fullscreen') {
        game.fullscreen.zoom = nextZoom;
        this.updateZoomLabel();
      }
    });
  }

  updateHover(pointer) {
    const cell = mapCellFromWorldPoint(worldState(), pointer.worldX, pointer.worldY);
    if (!cell) return;
    if (this.hoverCell?.x === cell.x && this.hoverCell?.y === cell.y) return;
    this.hoverCell = cell;
    const title = worldCellTitle(cell.x, cell.y, cellInfo(cell.x, cell.y));
    this.game.canvas.title = title;

    if (this.mode === 'fullscreen') {
      game.fullscreen.hoverCell = cell;
      const label = document.querySelector('[data-fullscreen-hover]');
      if (label) label.textContent = `${cell.x},${cell.y}`;
      return;
    }

    if (game.placement.departmentId) {
      game.placement.previewAnchor = cell;
      this.renderMap();
    }
  }

  async handleClick(pointer) {
    const cell = mapCellFromWorldPoint(worldState(), pointer.worldX, pointer.worldY);
    if (!cell || !canAct()) return;
    if (game.placement.departmentId) {
      await placeDepartment(cell.x, cell.y);
      return;
    }
    if (!pathSet().has(coordKey(cell.x, cell.y))) {
      await buildWorldCell(cell.x, cell.y);
    }
  }

  updateZoomLabel() {
    const label = document.querySelector('[data-fullscreen-zoom]');
    if (label) label.textContent = `${Math.round(this.cameras.main.zoom * 100)}%`;
  }

  fitToContent() {
    this.setupCamera();
  }

  centerOnContent() {
    const bounds = fullscreenContentBounds();
    this.cameras.main.centerOn((bounds.minLeft + bounds.maxLeft) / 2, (bounds.minTop + bounds.maxTop) / 2 + 16);
  }

  setZoomFromUi(nextZoom) {
    this.cameras.main.setZoom(clampZoom(nextZoom));
    if (this.mode === 'fullscreen') {
      game.fullscreen.zoom = this.cameras.main.zoom;
      this.updateZoomLabel();
    }
  }
}

function destroyPhaserMap() {
  if (!activeOfficeMap) return;
  activeOfficeMap.game?.destroy(true);
  activeOfficeMap = null;
}

function mountPhaserMap() {
  const mapEl = document.querySelector('[data-phaser-map]');
  if (!mapEl) {
    destroyPhaserMap();
    return;
  }

  destroyPhaserMap();

  const mode = mapEl.dataset.mapMode || 'dashboard';
  const rect = mapEl.getBoundingClientRect();
  activeOfficeMap = { game: null, element: mapEl, mode, scene: null };
  const phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: mapEl,
    width: Math.max(320, Math.floor(rect.width || mapEl.clientWidth || 800)),
    height: Math.max(260, Math.floor(rect.height || mapEl.clientHeight || 520)),
    backgroundColor: '#02030a',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER
    },
    scene: new OfficeMapScene(mode)
  });

  activeOfficeMap.game = phaserGame;
}

function commitRender(html) {
  appEl.innerHTML = html;
  requestAnimationFrame(() => mountPhaserMap());
}

function lightProgress() {
  const world = worldState();
  const maxX = Math.max(
    world.start.x,
    ...(world.builtPath || []).map(item => Number(item.split(',')[0]))
  );
  const span = Math.max(1, world.end.x - world.start.x);
  return Math.round(((maxX - world.start.x) / span) * 100);
}

function render() {
  document.body.classList.toggle('fullscreen-active', Boolean(game.session && isFullscreenRoute()));

  if (game.screen === 'loading') {
    commitRender('<main class="loading-view">Loading Void Office Tycoon...</main>');
    return;
  }

  if (game.session && isFullscreenRoute()) {
    commitRender(renderFullscreenMap());
    return;
  }

  if (game.screen === 'start') {
    commitRender(renderStart());
    return;
  }

  if (game.screen === 'report') {
    commitRender(renderReport());
    return;
  }

  commitRender(renderDashboard());
}

function renderStart() {
  const state = proposalState();
  const savedSessionId = localStorage.getItem(STORAGE_KEY);
  return `
    <main class="start-screen">
      <section class="start-hero">
        <p class="eyebrow">${escapeHtml(state.courseCode || 'COM0463')}</p>
        <h1>${escapeHtml(state.projectTitle || 'Void Office Tycoon')}</h1>
        <p class="lede">${escapeHtml(state.gameOverview || '')}</p>
        ${game.error ? `<div class="alert error">${escapeHtml(game.error)}</div>` : ''}
        <form class="start-form" data-form="start">
          <label for="studentId">Class ID</label>
          <div class="start-row">
            <input id="studentId" name="studentId" maxlength="80" placeholder="COM0463-01" required />
            <button type="submit">Start Session</button>
          </div>
        </form>
        ${savedSessionId ? '<button class="ghost-button" data-action="resume-session">Resume Saved Session</button>' : ''}
      </section>
      <section class="start-details">
        <div>
          <h2>Mission</h2>
          <p>${escapeHtml(state.ideaBrief?.successVision || '')}</p>
        </div>
        <div>
          <h2>Resources</h2>
          <p>Balance Budget, Team, and Quality while building the office.</p>
        </div>
        <div>
          <h2>Goal</h2>
          <p>Build departments, connect a safe path to the nebula, and open the Portal Room.</p>
        </div>
      </section>
    </main>
  `;
}

function renderDashboard() {
  const state = proposalState();
  const session = game.session;
  return `
    <main class="game-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">${escapeHtml(state.courseCode || 'COM0463')}</p>
          <h1>${escapeHtml(state.projectTitle || 'Void Office Tycoon')}</h1>
        </div>
        <div class="topbar-actions">
          <button class="secondary-button" data-action="toggle-pause">
            ${session.paused ? 'Resume' : 'Pause'}
          </button>
          <button class="secondary-button" data-action="open-fullscreen">Fullscreen Map</button>
          <button class="secondary-button" data-action="open-report">Report</button>
          <button class="danger-button" data-action="reset-session">Reset</button>
        </div>
      </header>

      ${game.error ? `<div class="alert error">${escapeHtml(game.error)}</div>` : ''}
      ${game.notice ? `<div class="alert">${escapeHtml(game.notice)}</div>` : ''}
      ${session.paused ? '<div class="alert warning">Session paused. The office state is preserved.</div>' : ''}
      ${session.finalResult ? `<div class="alert final">${escapeHtml(session.finalResult.reason)}</div>` : ''}

      <section class="resource-strip">
        ${Object.entries(session.resources).map(([key, value]) => renderResource(key, value)).join('')}
        <div class="points-box">
          <span>Main Points</span>
          <strong>${session.points}</strong>
        </div>
      </section>

      <section class="sandbox-grid">
        <div class="office-panel">
          ${renderWorldPanel()}
        </div>
        <aside class="sandbox-panels">
          ${renderBacklogPanel()}
          ${renderMinigamePanel()}
          ${renderShopPanel()}
          ${renderEscapePanel()}
        </aside>
      </section>

      ${renderDebugDrawer()}
    </main>
  `;
}

function renderFullscreenMap() {
  const state = proposalState();
  const session = game.session;
  const world = worldState();
  const tileSize = worldTileSize(world);
  const subcellCount = subcellsPerCell(world);
  const player = playerCell();
  const zoom = clampZoom(game.fullscreen.zoom);
  const hover = game.fullscreen.hoverCell
    ? `${game.fullscreen.hoverCell.x},${game.fullscreen.hoverCell.y}`
    : `${player.x},${player.y}`;

  return `
    <main class="fullscreen-map-screen">
      <div class="fullscreen-map-toolbar">
        <div class="fullscreen-map-title">
          <strong>${escapeHtml(state.projectTitle || 'Void Office Tycoon')}</strong>
          <span>${tileSize}x${tileSize} cells / ${subcellCount}x${subcellCount} subcells</span>
        </div>
        <div class="fullscreen-map-controls">
          <button class="secondary-button" data-action="fullscreen-zoom" data-zoom-action="out" title="Zoom out">-</button>
          <button class="secondary-button" data-action="fullscreen-zoom" data-zoom-action="reset">100%</button>
          <button class="secondary-button" data-action="fullscreen-zoom" data-zoom-action="in" title="Zoom in">+</button>
          <button class="secondary-button" data-action="fullscreen-zoom" data-zoom-action="fit">Fit</button>
          <button class="secondary-button" data-action="fullscreen-zoom" data-zoom-action="player">Player</button>
          <button class="secondary-button" data-action="open-dashboard">Back</button>
        </div>
      </div>

      <div class="fullscreen-map-stats">
        <div><span>Budget</span><strong>${session.resources.budget}</strong></div>
        <div><span>Team</span><strong>${session.resources.team}</strong></div>
        <div><span>Quality</span><strong>${session.resources.quality}</strong></div>
        <div><span>Points</span><strong>${session.points}</strong></div>
        <div><span>Player</span><strong>${player.x},${player.y}</strong></div>
        <div><span>Hover</span><strong data-fullscreen-hover>${hover}</strong></div>
        <div><span>Zoom</span><strong data-fullscreen-zoom>${Math.round(zoom * 100)}%</strong></div>
        <div><span>Subcells</span><strong>${subcellCount}x${subcellCount}</strong></div>
      </div>

      <div class="phaser-map-shell fullscreen-phaser-map" aria-label="Fullscreen office map">
        <div class="phaser-map" data-phaser-map data-map-mode="fullscreen"></div>
      </div>
    </main>
  `;
}

function renderResource(key, value) {
  const status = value < 35 ? 'danger' : value < 50 ? 'warn' : 'good';
  return `
    <div class="resource ${status}">
      <div class="resource-line">
        <span>${resourceLabel(key)}</span>
        <strong>${value}</strong>
      </div>
      <div class="meter"><span style="width: ${value}%"></span></div>
    </div>
  `;
}

function builtCount() {
  return sortedDepartments()
    .filter(department => department.id !== 'portal_room' && department.built)
    .length;
}

function renderWorldPanel() {
  const world = worldState();
  const tileSize = worldTileSize(world);
  const subcellCount = subcellsPerCell(world);
  return `
    <div class="panel-heading">
      <div>
        <h2>Isometric Void Office</h2>
        <span>${builtCount()} / 5 departments</span>
      </div>
      <span>${lightProgress()}% to nebula</span>
    </div>
    <div class="world-status">
      <div><strong>${tileSize}x${tileSize}</strong><span>normal cells</span></div>
      <div><strong>${subcellCount}x${subcellCount}</strong><span>subcells per cell</span></div>
      <div><strong>${(world.builtPath || []).length}</strong><span>path cells</span></div>
      <div><strong>${world.blackholes.length}</strong><span>blackholes</span></div>
    </div>
    ${renderPlacementBanner()}
    <div class="phaser-map-shell dashboard-phaser-map" aria-label="Interactive ${tileSize} by ${tileSize} office map">
      <div class="phaser-map" data-phaser-map data-map-mode="dashboard"></div>
    </div>
    <div class="world-legend">
      <span><i class="legend-chip path"></i>built path</span>
      <span><i class="legend-chip danger"></i>gravity danger</span>
      <span><i class="legend-chip light"></i>nebula edge</span>
      <span><i class="legend-chip wall"></i>office wall</span>
      <span><img src="${sprites.player}" alt="" /> player marker</span>
    </div>
  `;
}

function renderPlacementBanner() {
  const department = placementModeDepartment();
  if (!department) return '';
  const preview = placementPreview();
  return `
    <div class="placement-banner ${preview.valid ? 'valid' : 'invalid'}">
      <div>
        <strong>Placing ${escapeHtml(department.name)}</strong>
        <span>${preview.reason || 'Choose an anchor cell next to your path'} - Rotation ${game.placement.rotation}deg</span>
      </div>
      <div class="button-row">
        <button class="secondary-button" data-action="rotate-placement">Rotate</button>
        <button class="danger-button" data-action="cancel-placement">Cancel</button>
      </div>
    </div>
  `;
}

function renderWorldCells(world, options = {}) {
  const path = pathSet();
  const player = playerCell();
  const keys = collectRenderableCellKeys(world, path, player);

  return [...keys]
    .map(key => key.split(',').map(Number))
    .sort(([ax, ay], [bx, by]) => (ay + ax) - (by + bx) || ay - by || ax - bx)
    .map(([x, y]) => renderWorldCell(world, x, y, path, player, options))
    .join('');
}

function addRenderableCell(keys, world, x, y) {
  const size = worldTileSize(world);
  if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size) {
    keys.add(coordKey(x, y));
  }
}

function collectRenderableCellKeys(world, path, player) {
  const keys = new Set();
  const bounds = SAMPLE_OFFICE.bounds;
  const preview = placementPreview();

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      addRenderableCell(keys, world, x, y);
    }
  }

  for (const key of path) {
    const [x, y] = key.split(',').map(Number);
    addRenderableCell(keys, world, x, y);
    addRenderableCell(keys, world, x + 1, y);
    addRenderableCell(keys, world, x - 1, y);
    addRenderableCell(keys, world, x, y + 1);
    addRenderableCell(keys, world, x, y - 1);
  }

  addRenderableCell(keys, world, world.start.x, world.start.y);
  addRenderableCell(keys, world, world.end.x, world.end.y);
  addRenderableCell(keys, world, player.x, player.y);

  for (const hole of world.blackholes || []) {
    const radius = Number(hole.dangerRadius ?? 2);
    for (let y = Number(hole.y) - radius - 1; y <= Number(hole.y) + radius + 1; y += 1) {
      for (let x = Number(hole.x) - radius - 1; x <= Number(hole.x) + radius + 1; x += 1) {
        addRenderableCell(keys, world, x, y);
      }
    }
  }

  for (const department of sortedDepartments()) {
    const cells = department.placement?.occupiedCells || (department.worldCell ? [department.worldCell] : []);
    for (const cell of cells) {
      addRenderableCell(keys, world, Number(cell.x), Number(cell.y));
    }
  }

  for (const cell of preview.cells || []) {
    addRenderableCell(keys, world, Number(cell.x), Number(cell.y));
  }

  return keys;
}

function renderWorldCell(world, x, y, path, player, options = {}) {
  const readOnly = Boolean(options.readOnly);
  const key = coordKey(x, y);
  const isPath = path.has(key);
  const isStart = world.start.x === x && world.start.y === y;
  const isEnd = world.end.x === x && world.end.y === y;
  const blackhole = blackholeAt(x, y);
  const danger = blackholeDangerAt(x, y);
  const department = departmentAt(x, y);
  const anchorDepartment = departmentAnchorAt(x, y);
  const preview = placementPreviewForCell(x, y);
  const hasPlayer = player.x === x && player.y === y && !game.session.finalResult;
  const adjacent = !isPath && isAdjacentToPath(x, y);
  const lightSide = x >= Math.floor(worldTileSize(world) * 0.68);
  const pos = isoCellPosition(world, x, y);
  const baseSprite = floorSpriteForCell(x, y, { isPath, isStart, isEnd, lightSide });
  const objectSprite = getWorldObjectSprite({ isStart, isEnd, blackhole, department: anchorDepartment });
  const classes = [
    'world-cell',
    isSampleOfficeFloor(x, y) ? 'sample-office-floor' : '',
    sampleOfficeFloorClass(x, y),
    isPath ? 'path' : '',
    adjacent ? 'candidate' : '',
    danger ? 'danger-zone' : '',
    blackhole ? 'blackhole' : '',
    isStart ? 'start-cell' : '',
    isEnd ? 'end-cell' : '',
    department ? 'department-cell' : '',
    anchorDepartment ? 'department-anchor' : '',
    preview ? 'placement-preview' : '',
    preview?.valid ? 'placement-valid' : '',
    preview && !preview.valid ? 'placement-invalid' : '',
    lightSide ? 'light-side' : ''
  ].filter(Boolean).join(' ');

  const tag = readOnly ? 'span' : 'button';
  const actionAttrs = readOnly
    ? 'aria-hidden="true"'
    : `data-action="build-world-cell" data-x="${x}" data-y="${y}" ${!canAct() || (!game.placement.departmentId && isPath) ? 'disabled' : ''}`;

  return `
    <${tag}
      class="${classes}${readOnly ? ' world-cell-readonly' : ''}"
      style="left: ${pos.left}px; top: ${pos.top}px; z-index: ${preview ? 1600 + x + y : 200 + x + y};"
      title="${worldCellTitle(x, y, { isPath, danger, blackhole, department, isEnd })}"
      ${actionAttrs}
    >
      <img class="tile-sprite" src="${baseSprite}" alt="" />
      ${renderCellSubgrid(world)}
      ${department ? renderSubcellLayers(department, x, y) : ''}
      ${objectSprite ? `<img class="object-sprite" src="${objectSprite}" alt="" />` : ''}
      ${hasPlayer ? `<img class="player-sprite" src="${sprites.player}" alt="Player marker" />` : ''}
    </${tag}>
  `;
}

function renderSubcellLayers(department, x, y) {
  const placement = department.placement || {};
  const stacks = [
    ...(placement.spriteStacks || []),
    ...(placement.walls || [])
  ].filter(stack => Number(stack.cell?.x) === x && Number(stack.cell?.y) === y);
  if (!stacks.length) return '';
  return `
    <span class="subcell-layer" aria-hidden="true">
      ${stacks.map(stack => {
        const sub = stack.subcell || { x: 0, y: 0 };
        const spritesInStack = stack.sprites || [];
        const edgeClass = stack.edge ? ` edge-${stack.edge}` : '';
        return `
          <span class="subcell-stack${edgeClass}" style="--sx: ${Number(sub.x) || 0}; --sy: ${Number(sub.y) || 0};">
            ${spritesInStack.map(sprite => `<i class="subcell-sprite layer-${escapeHtml(sprite.layer || 'object')}"></i>`).join('')}
          </span>
        `;
      }).join('')}
    </span>
  `;
}

function getWorldObjectSprite({ isStart, isEnd, blackhole, department }) {
  if (blackhole) return sprites.blackhole;
  if (department) return sprites[department.id];
  if (isStart) return sprites.officeCore;
  if (isEnd) return game.session?.departments?.portal_room?.built ? sprites.portal_room : sprites.nebulaGate;
  return '';
}

function worldCellTitle(x, y, info) {
  if (info.blackhole) return `Blackhole core at ${x},${y}`;
  if (info.danger) return `Blackhole gravity field at ${x},${y}. Building here loses.`;
  if (info.department) return `${info.department.name} at ${x},${y}`;
  if (info.isEnd) return `Nebula gate at ${x},${y}`;
  if (info.isPath) return `Built path at ${x},${y}`;
  return `Build path at ${x},${y}`;
}

function renderBacklogPanel() {
  const itemsById = Object.fromEntries(backlogItems.map(item => [item.id, item]));
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Backlog Order</h2>
        <span>Scope Fog</span>
      </div>
      <div class="backlog-list">
        ${game.backlogOrder.map((id, index) => {
          const item = itemsById[id];
          const correctIndex = CORRECT_BACKLOG_ORDER.indexOf(id);
          const isCorrect = correctIndex === index;
          return `
            <article class="backlog-card ${game.draggedBacklogId === id ? 'dragging' : ''} ${game.showCorrectAnswers && isCorrect ? 'correct' : ''}"
              draggable="true"
              data-backlog-id="${id}">
              <div>
                <strong>${index + 1}. ${escapeHtml(item.text)}</strong>
                <span>${escapeHtml(item.note)}</span>
                ${game.debugOpen && game.showCorrectAnswers ? `<em>Correct position: ${correctIndex + 1}</em>` : ''}
              </div>
              <div class="backlog-actions">
                <button class="icon-button" data-action="move-backlog" data-id="${id}" data-dir="-1" ${index === 0 ? 'disabled' : ''}>Up</button>
                <button class="icon-button" data-action="move-backlog" data-id="${id}" data-dir="1" ${index === game.backlogOrder.length - 1 ? 'disabled' : ''}>Down</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
      ${game.debugOpen && game.showCorrectAnswers ? renderCorrectBacklogOrder(itemsById) : ''}
      <button data-action="submit-minigame" data-minigame-id="scope_fog" ${!canAct() ? 'disabled' : ''}>Submit Backlog</button>
    </section>
  `;
}

function renderCorrectBacklogOrder(itemsById) {
  return `
    <div class="answer-box">
      <strong>Correct backlog</strong>
      <ol>
        ${CORRECT_BACKLOG_ORDER.map(id => `<li>${escapeHtml(itemsById[id].text)}</li>`).join('')}
      </ol>
    </div>
  `;
}

function renderMinigamePanel() {
  const active = activeScenario();
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Minigames</h2>
        <span>${escapeHtml(active.title)}</span>
      </div>
      <div class="minigame-tabs">
        ${minigames.map(item => `
          <button class="${game.activeMinigame === item.id ? 'selected' : ''}" data-action="select-minigame" data-minigame-id="${item.id}">
            ${escapeHtml(item.title)}
          </button>
        `).join('')}
      </div>
      ${renderMinigame(active)}
      ${game.lastResult ? `
        <div class="result-box compact">
          <strong>${escapeHtml(game.lastResult.title)}: ${game.lastResult.success ? 'success' : 'failed'}</strong>
          <p>${game.lastResult.pointsEarned} points. ${formatDelta(game.lastResult.resourceChange)}</p>
        </div>
      ` : ''}
    </section>
  `;
}

function renderMinigame(scenario) {
  if (scenario.id === 'scope_fog') {
    return '<p class="game-copy">Use the backlog panel, then submit the current order.</p>';
  }
  if (scenario.id === 'bug_rain') return renderBugRain();
  return renderBudgetRift();
}

function renderBugRain() {
  const selected = new Set(game.minigameState.selected || []);
  return `
    <div class="bug-grid">
      ${bugCards.map(card => `
        <button
          class="bug-card ${selected.has(card.id) ? 'selected' : ''} ${game.debugOpen && game.showCorrectAnswers && card.severity === 'serious' ? 'correct' : ''}"
          data-action="toggle-bug"
          data-bug-id="${card.id}"
          ${!canAct() ? 'disabled' : ''}
        >
          <strong>${escapeHtml(card.title)}</strong>
          <span>${selected.has(card.id) ? 'Selected' : 'Not selected'}</span>
          ${game.debugOpen && game.showCorrectAnswers ? `<em>${card.severity === 'serious' ? 'Correct: block release' : 'Correct: minor'}</em>` : ''}
        </button>
      `).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="bug_rain" ${!canAct() ? 'disabled' : ''}>Submit Triage</button>
  `;
}

function renderBudgetRift() {
  const choiceId = game.minigameState.choiceId;
  return `
    <div class="choice-list">
      ${budgetChoices.map(choice => {
        const projected = projectedResources(choice.delta);
        const passes = Object.values(projected).every(value => value >= 50);
        return `
          <button
            class="choice-card ${choiceId === choice.id ? 'selected' : ''} ${game.debugOpen && game.showCorrectAnswers && passes ? 'correct' : ''}"
            data-action="budget-choice"
            data-choice-id="${choice.id}"
            ${!canAct() ? 'disabled' : ''}
          >
            <strong>${escapeHtml(choice.title)}</strong>
            <span>${escapeHtml(choice.text)}</span>
            <em>${formatDelta(choice.delta)}</em>
            ${game.debugOpen && game.showCorrectAnswers ? `<em>${passes ? 'Passes' : 'Fails'} after choice: ${formatProjected(projected)}</em>` : ''}
          </button>
        `;
      }).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="budget_rift" ${!canAct() ? 'disabled' : ''}>Commit Trade-off</button>
  `;
}

function projectedResources(delta) {
  const base = game.session?.resources || { budget: 0, team: 0, quality: 0 };
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      Math.max(0, Math.min(100, Number(value) + Number(delta[key] || 0)))
    ])
  );
}

function formatProjected(projected) {
  return Object.entries(projected)
    .map(([key, value]) => `${resourceLabel(key)} ${value}`)
    .join(', ');
}

function renderShopPanel() {
  const departments = sortedDepartments().filter(department => department.id !== 'portal_room');
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Department Shop</h2>
        <span>${game.session.points} points</span>
      </div>
      <div class="shop-list">
        ${departments.map(department => {
          const built = department.built;
          const complete = built && department.level >= 2;
          const price = built ? department.upgradePrice : department.price;
          const placing = game.placement.departmentId === department.id;
          const label = complete ? 'Complete' : built ? `Upgrade ${price}` : placing ? 'Placing...' : `Place ${price}`;
          return `
            <article class="shop-item ${placing ? 'selected' : ''}">
              <div>
                <h3>${escapeHtml(department.name)}</h3>
                <p>${escapeHtml(department.meaning)}</p>
                <span>${formatDelta(built ? department.upgradeEffect : department.resourceEffect)}</span>
                <em>${escapeHtml(department.footprint?.label || '#')} footprint</em>
              </div>
              <button
                data-action="${built ? 'buy-department' : 'start-placement'}"
                data-department-id="${department.id}"
                ${!canAct() || complete || game.session.points < price ? 'disabled' : ''}
              >${label}</button>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderEscapePanel() {
  const missing = game.lastEscape?.missing || [];
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Escape</h2>
        <span>Portal Room</span>
      </div>
      ${game.lastEscape ? `
        <div class="result-box compact">
          <strong>${game.lastEscape.eligible ? 'Portal Room opened' : 'Portal Room locked'}</strong>
          ${missing.length ? `<ul>${missing.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>The office is complete and balanced.</p>'}
        </div>
      ` : '<p class="game-copy">Escape checks departments, resources, and the nebula path.</p>'}
      <div class="button-row">
        <button data-action="escape-check" ${!canAct() ? 'disabled' : ''}>Run Escape Check</button>
        <button class="secondary-button" data-action="open-report">Report</button>
      </div>
    </section>
  `;
}

function renderDebugDrawer() {
  if (!game.debugOpen || !game.session) return '';
  const world = worldState();
  return `
    <aside class="debug-drawer" aria-label="Debug tools">
      <div class="debug-header">
        <div>
          <p class="eyebrow">Debug</p>
          <h2>State Controls</h2>
        </div>
        <button class="secondary-button" data-action="toggle-debug">Close</button>
      </div>

      <label class="check-row">
        <input type="checkbox" data-action="toggle-correct-answers" ${game.showCorrectAnswers ? 'checked' : ''} />
        <span>Show correct answers</span>
      </label>

      <section class="debug-section">
        <h3>Variables</h3>
        <div class="debug-grid">
          <label>Points <input id="debug-points" type="number" value="${game.session.points}" /></label>
          <label>Budget <input id="debug-budget" type="number" min="0" max="100" value="${game.session.resources.budget}" /></label>
          <label>Team <input id="debug-team" type="number" min="0" max="100" value="${game.session.resources.team}" /></label>
          <label>Quality <input id="debug-quality" type="number" min="0" max="100" value="${game.session.resources.quality}" /></label>
          <label>Scenario <input id="debug-scenario" type="number" min="0" max="2" value="${game.session.currentScenarioIndex}" /></label>
        </div>
        <div class="button-row">
          <button data-action="debug-apply-vars">Apply Variables</button>
          <button class="secondary-button" data-action="debug-action" data-debug-action="set_paused" data-debug-value="${!game.session.paused}">
            ${game.session.paused ? 'Debug Resume' : 'Debug Pause'}
          </button>
        </div>
      </section>

      <section class="debug-section">
        <h3>Force Outcomes</h3>
        <div class="debug-button-grid">
          <button data-action="debug-force-minigame" data-minigame-id="${game.activeMinigame}" data-success="true">Force Minigame Win</button>
          <button data-action="debug-force-minigame" data-minigame-id="${game.activeMinigame}" data-success="false">Force Minigame Fail</button>
          <button data-action="debug-action" data-debug-action="build_all_departments">Build All Departments</button>
          <button data-action="debug-action" data-debug-action="upgrade_all_departments">Upgrade All Departments</button>
          <button data-action="debug-action" data-debug-action="connect_to_light">Connect To Nebula</button>
          <button data-action="debug-action" data-debug-action="force_escape">Force Escape</button>
          <button data-action="debug-action" data-debug-action="force_collapse">Force Collapse</button>
          <button data-action="debug-action" data-debug-action="force_blackhole_loss">Force Blackhole Loss</button>
          <button data-action="debug-action" data-debug-action="clear_final_result">Clear Final Result</button>
          <button data-action="debug-action" data-debug-action="reset_sandbox_world">Reset Sandbox World</button>
          <button data-action="debug-action" data-debug-action="regenerate_blackholes">Regenerate Blackholes</button>
        </div>
      </section>

      <section class="debug-section">
        <h3>Departments</h3>
        <div class="debug-list">
          ${sortedDepartments().filter(department => department.id !== 'portal_room').map(department => `
            <div class="debug-row">
              <span>${escapeHtml(department.name)}</span>
              <select id="debug-dept-${department.id}">
                <option value="0" ${department.level === 0 ? 'selected' : ''}>Locked</option>
                <option value="1" ${department.level === 1 ? 'selected' : ''}>Built</option>
                <option value="2" ${department.level === 2 ? 'selected' : ''}>Upgraded</option>
              </select>
            </div>
            ${department.placement ? `
              <code class="debug-placement">
                anchor ${department.placement.anchorCell.x},${department.placement.anchorCell.y} /
                rot ${department.placement.rotation} /
                cells ${department.placement.occupiedCells.length} /
                walls ${department.placement.walls.length} /
                stacks ${department.placement.spriteStacks.length}
              </code>
            ` : ''}
          `).join('')}
        </div>
        <button data-action="debug-apply-departments">Apply Departments</button>
      </section>

      <section class="debug-section">
        <h3>World Path</h3>
        <textarea id="debug-path" rows="4">${escapeHtml((world.builtPath || []).join('\n'))}</textarea>
        <button data-action="debug-set-path">Set Path</button>
      </section>

      <section class="debug-section">
        <h3>Blackholes</h3>
        <div class="debug-list">
          ${world.blackholes.map(hole => `
            <div class="debug-row blackhole-row" data-hole-id="${hole.id}">
              <span>${escapeHtml(hole.id)}</span>
              <input id="debug-hole-${hole.id}-x" type="number" min="0" max="31" value="${hole.x}" />
              <input id="debug-hole-${hole.id}-y" type="number" min="0" max="31" value="${hole.y}" />
              <input id="debug-hole-${hole.id}-r" type="number" min="0" max="8" value="${hole.dangerRadius}" />
            </div>
          `).join('')}
        </div>
        <button data-action="debug-apply-blackholes">Apply Blackholes</button>
      </section>
    </aside>
  `;
}

function renderReport() {
  const report = game.report;
  if (!report) {
    return `
      <main class="game-shell">
        <div class="alert">Loading report...</div>
      </main>
    `;
  }

  return `
    <main class="report-screen">
      <header class="topbar">
        <div>
          <p class="eyebrow">${escapeHtml(report.studentId)}</p>
          <h1>${escapeHtml(report.projectTitle)} Report</h1>
        </div>
        <div class="topbar-actions">
          <button class="secondary-button" data-action="back-dashboard">Dashboard</button>
          <button data-action="download-log">Download Log</button>
        </div>
      </header>

      <section class="report-grid">
        <div class="report-block">
          <h2>Final Result</h2>
          <p>${escapeHtml(report.finalResult.reason)}</p>
          <strong>${report.finalResult.escaped ? 'Escaped' : report.finalResult.status}</strong>
        </div>
        <div class="report-block">
          <h2>Resources</h2>
          ${Object.entries(report.resources).map(([key, value]) => renderResource(key, value)).join('')}
        </div>
        <div class="report-block">
          <h2>Built Departments</h2>
          <ul>
            ${report.builtDepartments.map(item => `<li>${escapeHtml(item.name)}: Level ${item.level}</li>`).join('') || '<li>No departments built yet.</li>'}
          </ul>
        </div>
        <div class="report-block">
          <h2>World Path</h2>
          <ul>
            <li>${report.world?.size || WORLD_TILE_SIZE}x${report.world?.size || WORLD_TILE_SIZE} normal-cell isometric grid</li>
            <li>${report.world?.subcellsPerCell || SUBCELLS_PER_CELL}x${report.world?.subcellsPerCell || SUBCELLS_PER_CELL} subcells inside each cell</li>
            <li>${report.world?.builtPath?.length || 0} path tiles built</li>
            <li>${report.world?.blackholes?.length || 0} blackhole parts generated</li>
            <li>${report.world?.connectedToLight ? 'Connected to the nebula' : 'Not connected to the nebula yet'}</li>
          </ul>
        </div>
        <div class="report-block">
          <h2>Minigame Results</h2>
          <ul>
            ${report.minigameResults.map(item => `
              <li>${escapeHtml(item.title)}: ${item.success ? 'success' : 'failed'}, ${item.pointsEarned} points</li>
            `).join('') || '<li>No minigames recorded yet.</li>'}
          </ul>
        </div>
      </section>

      <section class="reflection-panel">
        <h2>Reflection</h2>
        ${report.reflectionPrompts.map(prompt => `<p>${escapeHtml(prompt)}</p>`).join('')}
      </section>
    </main>
  `;
}

async function handleStart(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const studentId = String(form.get('studentId') || '').trim();
  if (!studentId) return;

  await withAction(async () => {
    const response = await api.post('/api/sessions', { studentId });
    game.session = response.session;
    localStorage.setItem(STORAGE_KEY, game.session.sessionId);
    game.screen = 'dashboard';
    game.notice = 'Session started.';
    game.backlogOrder = [...START_BACKLOG_ORDER];
    game.activeMinigame = 'scope_fog';
    game.fullscreen.hasAutoSnapped = false;
    clearPlacement();
    resetMinigameState();
  });
}

async function handleClick(event) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  if (action === 'toggle-bug') {
    toggleBug(actionEl.dataset.bugId);
    render();
    return;
  }
  if (action === 'budget-choice') {
    game.minigameState.choiceId = actionEl.dataset.choiceId;
    render();
    return;
  }
  if (action === 'select-minigame') {
    game.activeMinigame = actionEl.dataset.minigameId;
    resetMinigameState();
    render();
    return;
  }
  if (action === 'move-backlog') {
    moveBacklog(actionEl.dataset.id, Number(actionEl.dataset.dir));
    render();
    return;
  }
  if (action === 'toggle-correct-answers') {
    game.showCorrectAnswers = actionEl.checked;
    render();
    return;
  }
  if (action === 'toggle-debug') {
    game.debugOpen = !game.debugOpen;
    render();
    return;
  }
  if (action === 'open-fullscreen') {
    navigateTo(FULLSCREEN_PATH);
    return;
  }
  if (action === 'open-dashboard') {
    navigateTo('/');
    return;
  }
  if (action === 'fullscreen-zoom') {
    const zoomAction = actionEl.dataset.zoomAction;
    if (zoomAction === 'out') setFullscreenZoom(game.fullscreen.zoom - ZOOM_STEP, true);
    if (zoomAction === 'in') setFullscreenZoom(game.fullscreen.zoom + ZOOM_STEP, true);
    if (zoomAction === 'reset') setFullscreenZoom(1, true);
    if (zoomAction === 'fit') fitFullscreenMap('smooth');
    if (zoomAction === 'player') queueSnapMapToPlayer(true);
    return;
  }
  if (action === 'start-placement') {
    if (isFullscreenRoute()) return;
    startPlacement(actionEl.dataset.departmentId);
    render();
    return;
  }
  if (action === 'rotate-placement') {
    rotatePlacement();
    render();
    return;
  }
  if (action === 'cancel-placement') {
    clearPlacement();
    render();
    return;
  }

  if (action === 'world-board-hit') {
    if (isFullscreenRoute()) return;
    const cell = cellFromBoardEvent(event, actionEl);
    if (!cell) return;
    if (game.placement.departmentId) await placeDepartment(cell.x, cell.y);
    else if (!pathSet().has(coordKey(cell.x, cell.y))) await buildWorldCell(cell.x, cell.y);
    return;
  }

  if (action === 'build-world-cell') {
    if (isFullscreenRoute()) return;
    if (game.placement.departmentId) await placeDepartment(Number(actionEl.dataset.x), Number(actionEl.dataset.y));
    else await buildWorldCell(Number(actionEl.dataset.x), Number(actionEl.dataset.y));
  }
  if (action === 'submit-minigame') await submitMinigame(actionEl.dataset.minigameId || game.activeMinigame);
  if (action === 'buy-department') await buyDepartment(actionEl.dataset.departmentId);
  if (action === 'escape-check') await runEscapeCheck();
  if (action === 'toggle-pause') await togglePause();
  if (action === 'open-report') await openReport();
  if (action === 'back-dashboard') {
    game.screen = 'dashboard';
    render();
  }
  if (action === 'resume-session') await resumeSession();
  if (action === 'reset-session') resetSession();
  if (action === 'download-log') downloadLog();
  if (action === 'debug-action') await debugApply(actionEl.dataset.debugAction, parseDebugValue(actionEl.dataset.debugValue));
  if (action === 'debug-force-minigame') {
    await debugApply('force_minigame_result', {
      minigameId: actionEl.dataset.minigameId,
      success: actionEl.dataset.success === 'true'
    });
  }
  if (action === 'debug-apply-vars') await applyDebugVariables();
  if (action === 'debug-apply-departments') await applyDebugDepartments();
  if (action === 'debug-set-path') await debugApply('set_world_path', getInputValue('debug-path').split(/\s+/).filter(Boolean));
  if (action === 'debug-apply-blackholes') await applyDebugBlackholes();
}

function cellFromBoardEvent(event, boardEl) {
  const rect = boardEl.getBoundingClientRect();
  const zoom = clampZoom(boardEl.dataset.mapZoom || 1);
  return cellFromBoardPoint(worldState(), (event.clientX - rect.left) / zoom, (event.clientY - rect.top) / zoom);
}

function cellFromBoardPoint(world, left, top) {
  const size = worldTileSize(world);
  const isoX = (left - (size * TILE_STEP_X + BOARD_LEFT_PADDING)) / TILE_STEP_X;
  const isoY = (top - BOARD_TOP_PADDING) / TILE_STEP_Y;
  const x = Math.floor((isoX + isoY) / 2);
  const y = Math.floor((isoY - isoX) / 2);

  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= size || y >= size) {
    return null;
  }

  return { x, y };
}

function cellInfo(x, y) {
  return {
    isPath: pathSet().has(coordKey(x, y)),
    danger: blackholeDangerAt(x, y),
    blackhole: blackholeAt(x, y),
    department: departmentAt(x, y),
    isEnd: worldState().end.x === x && worldState().end.y === y
  };
}

function parseDebugValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === undefined) return undefined;
  return value;
}

function toggleBug(bugId) {
  const selected = new Set(game.minigameState.selected || []);
  if (selected.has(bugId)) selected.delete(bugId);
  else selected.add(bugId);
  game.minigameState.selected = [...selected];
}

function moveBacklog(id, direction) {
  const index = game.backlogOrder.indexOf(id);
  if (index < 0) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= game.backlogOrder.length) return;
  const next = [...game.backlogOrder];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  game.backlogOrder = next;
}

async function submitMinigame(minigameId) {
  const payload = buildMinigamePayload(minigameId);
  if (!payload) {
    game.error = 'Complete the current minigame before submitting.';
    render();
    return;
  }

  await withAction(async () => {
    const response = await api.post(
      `/api/sessions/${game.session.sessionId}/minigame-result`,
      payload
    );
    game.session = response.session;
    game.lastResult = response.result;
    game.notice = response.result.success ? 'Points added.' : 'No points earned this round.';
    if (game.session.finalResult) {
      await openReport();
    }
  });
}

function buildMinigamePayload(minigameId) {
  if (minigameId === 'scope_fog') {
    const score = game.backlogOrder.filter((id, index) => CORRECT_BACKLOG_ORDER[index] === id).length;
    return {
      minigameId: 'scope_fog',
      success: score === CORRECT_BACKLOG_ORDER.length,
      score,
      details: { order: [...game.backlogOrder] }
    };
  }

  if (minigameId === 'bug_rain') {
    const selected = [...(game.minigameState.selected || [])].sort();
    const serious = bugCards
      .filter(card => card.severity === 'serious')
      .map(card => card.id)
      .sort();
    if (selected.length === 0) return null;
    return {
      minigameId: 'bug_rain',
      success: JSON.stringify(selected) === JSON.stringify(serious),
      score: selected.filter(id => serious.includes(id)).length,
      details: { selected }
    };
  }

  if (!game.minigameState.choiceId) return null;
  return {
    minigameId: 'budget_rift',
    success: true,
    score: 1,
    details: { choiceId: game.minigameState.choiceId }
  };
}

function startPlacement(departmentId) {
  game.placement = {
    departmentId,
    rotation: 0,
    previewAnchor: null
  };
  game.notice = 'Choose a map cell next to your built path.';
}

function rotatePlacement() {
  if (!game.placement.departmentId) return;
  game.placement.rotation = (normalizeRotation(game.placement.rotation) + 90) % 360;
}

function clearPlacement() {
  game.placement = { departmentId: '', rotation: 0, previewAnchor: null };
}

async function placeDepartment(x, y) {
  const departmentId = game.placement.departmentId;
  if (!departmentId || !Number.isInteger(x) || !Number.isInteger(y)) return;
  const preview = placementPreview({ x, y });
  if (!preview.valid) {
    game.error = preview.reason || 'That department footprint cannot be placed there.';
    game.placement.previewAnchor = { x, y };
    render();
    return;
  }
  await buyDepartment(departmentId, { x, y }, game.placement.rotation);
}

async function buildWorldCell(x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return;
  await withAction(async () => {
    const response = await api.post(
      `/api/sessions/${game.session.sessionId}/build-world-cell`,
      { x, y }
    );
    game.session = response.session;
    if (response.action.lost) {
      game.notice = 'The office path touched a blackhole gravity field.';
      await openReport();
      return;
    }
    game.notice = response.action.connectedToLight
      ? 'The office path reached the nebula light.'
      : `Path tile built for ${response.action.cost} points.`;
  });
}

async function buyDepartment(departmentId, anchorCell = null, rotation = 0) {
  await withAction(async () => {
    const body = anchorCell
      ? { departmentId, anchorCell, rotation }
      : { departmentId };
    const response = await api.post(
      `/api/sessions/${game.session.sessionId}/buy-department`,
      body
    );
    game.session = response.session;
    if (anchorCell) clearPlacement();
    game.notice = `${response.action.departmentName}: ${response.action.action} complete.`;
    if (game.session.finalResult) {
      await openReport();
    }
  });
}

async function runEscapeCheck() {
  await withAction(async () => {
    const response = await api.post(`/api/sessions/${game.session.sessionId}/escape-check`);
    game.session = response.session;
    game.lastEscape = response.result;
    game.notice = response.result.eligible ? 'The Portal Room opened.' : 'The Portal Room is still locked.';
    if (game.session.finalResult?.status === 'escaped') {
      await openReport();
    }
  });
}

async function togglePause() {
  await withAction(async () => {
    const response = await api.post(`/api/sessions/${game.session.sessionId}/pause`, {
      paused: !game.session.paused
    });
    game.session = response.session;
    game.notice = game.session.paused ? 'Session paused.' : 'Session resumed.';
  });
}

async function debugApply(action, value) {
  if (!game.session) return;
  await withAction(async () => {
    const response = await api.post(`/api/sessions/${game.session.sessionId}/debug/apply`, {
      action,
      value
    });
    game.session = response.session;
    game.notice = response.debugResult?.message || `Debug action applied: ${action}`;
  });
}

async function applyDebugVariables() {
  const values = {
    points: Number(getInputValue('debug-points')),
    budget: Number(getInputValue('debug-budget')),
    team: Number(getInputValue('debug-team')),
    quality: Number(getInputValue('debug-quality')),
    scenario: Number(getInputValue('debug-scenario'))
  };
  await debugApply('set_points', values.points);
  await debugApply('set_resource', { key: 'budget', value: values.budget });
  await debugApply('set_resource', { key: 'team', value: values.team });
  await debugApply('set_resource', { key: 'quality', value: values.quality });
  await debugApply('set_current_scenario', values.scenario);
}

async function applyDebugDepartments() {
  const updates = sortedDepartments()
    .filter(item => item.id !== 'portal_room')
    .map(department => ({
      id: department.id,
      level: Number(getInputValue(`debug-dept-${department.id}`))
    }));
  for (const update of updates) {
    await debugApply('set_department', {
      departmentId: update.id,
      built: update.level > 0,
      level: update.level
    });
  }
}

async function applyDebugBlackholes() {
  const updates = worldState().blackholes.map(hole => ({
    id: hole.id,
    x: Number(getInputValue(`debug-hole-${hole.id}-x`)),
    y: Number(getInputValue(`debug-hole-${hole.id}-y`)),
    dangerRadius: Number(getInputValue(`debug-hole-${hole.id}-r`))
  }));
  for (const update of updates) {
    await debugApply('move_blackhole', {
      id: update.id,
      x: update.x,
      y: update.y
    });
    await debugApply('set_blackhole_radius', {
      id: update.id,
      dangerRadius: update.dangerRadius
    });
  }
}

function getInputValue(id) {
  return document.getElementById(id)?.value || '';
}

async function openReport() {
  await withAction(async () => {
    const response = await api.get(`/api/sessions/${game.session.sessionId}/report`);
    game.report = response.report;
    game.screen = 'report';
  });
}

async function resumeSession() {
  const sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) return;
  await withAction(async () => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    game.session = response.session;
    game.screen = 'dashboard';
    game.fullscreen.hasAutoSnapped = false;
    clearPlacement();
    resetMinigameState();
  });
}

function resetSession() {
  localStorage.removeItem(STORAGE_KEY);
  game.session = null;
  game.report = null;
  game.log = null;
  game.screen = 'start';
  game.notice = '';
  game.error = '';
  game.backlogOrder = [...START_BACKLOG_ORDER];
  clearPlacement();
  render();
}

async function downloadLog() {
  if (!game.session) return;
  await withAction(async () => {
    const response = await api.get(`/api/sessions/${game.session.sessionId}/log`);
    const blob = new Blob([JSON.stringify(response.log, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.session.sessionId}-log.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

async function withAction(callback) {
  game.error = '';
  try {
    await callback();
  } catch (error) {
    game.error = error.message;
  }
  render();
}

document.addEventListener('submit', event => {
  if (event.target.matches('[data-form="start"]')) {
    handleStart(event);
  }
});

document.addEventListener('click', event => {
  handleClick(event);
});

function updatePlacementPreview(nextAnchor) {
  if (!game.placement.departmentId || !nextAnchor) return;
  const current = game.placement.previewAnchor;
  if (current && current.x === nextAnchor.x && current.y === nextAnchor.y) return;
  game.placement.previewAnchor = nextAnchor;
  render();
}

document.addEventListener('mousemove', event => {
  const hoverLayer = event.target.closest('[data-fullscreen-hover-layer]');
  if (hoverLayer) {
    const cell = cellFromBoardEvent(event, hoverLayer);
    if (!cell) return;
    game.fullscreen.hoverCell = cell;
    hoverLayer.title = worldCellTitle(cell.x, cell.y, cellInfo(cell.x, cell.y));
    const label = document.querySelector('[data-fullscreen-hover]');
    if (label) label.textContent = `${cell.x},${cell.y}`;
    return;
  }

  const board = event.target.closest('[data-action="world-board-hit"]');
  if (!board) return;
  const cell = cellFromBoardEvent(event, board);
  if (!cell) return;
  board.title = worldCellTitle(cell.x, cell.y, cellInfo(cell.x, cell.y));
  updatePlacementPreview(cell);
});

document.addEventListener('mouseover', event => {
  if (!game.placement.departmentId) return;
  const cell = event.target.closest('[data-action="build-world-cell"]');
  if (!cell) return;
  updatePlacementPreview({ x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
});

document.addEventListener('dragstart', event => {
  const card = event.target.closest('[data-backlog-id]');
  if (!card) return;
  game.draggedBacklogId = card.dataset.backlogId;
  event.dataTransfer.effectAllowed = 'move';
});

document.addEventListener('dragover', event => {
  if (event.target.closest('[data-backlog-id]')) {
    event.preventDefault();
  }
});

document.addEventListener('drop', event => {
  const card = event.target.closest('[data-backlog-id]');
  if (!card || !game.draggedBacklogId) return;
  event.preventDefault();
  const targetId = card.dataset.backlogId;
  const next = game.backlogOrder.filter(id => id !== game.draggedBacklogId);
  const targetIndex = next.indexOf(targetId);
  next.splice(targetIndex, 0, game.draggedBacklogId);
  game.backlogOrder = next;
  game.draggedBacklogId = '';
  render();
});

document.addEventListener('dragend', () => {
  if (!game.draggedBacklogId) return;
  game.draggedBacklogId = '';
  render();
});

document.addEventListener('keydown', event => {
  const editingText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName);
  if (!editingText && isFullscreenRoute()) {
    const key = event.key.toLowerCase();
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setFullscreenZoom(game.fullscreen.zoom + ZOOM_STEP, true);
      return;
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      setFullscreenZoom(game.fullscreen.zoom - ZOOM_STEP, true);
      return;
    }
    if (key === '0') {
      event.preventDefault();
      setFullscreenZoom(1, true);
      return;
    }
    if (key === 'f') {
      event.preventDefault();
      fitFullscreenMap('smooth');
      return;
    }
    if (key === 'p') {
      event.preventDefault();
      queueSnapMapToPlayer(true);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      navigateTo('/');
      return;
    }
    return;
  }

  if (!editingText && game.placement.departmentId && event.key.toLowerCase() === 'r') {
    event.preventDefault();
    rotatePlacement();
    render();
    return;
  }

  const periodKey = event.code === 'Period' || event.key === '.' || event.key === '>';
  const togglePressed = periodKey && event.shiftKey && (event.ctrlKey || event.metaKey);
  if (!togglePressed) return;
  event.preventDefault();
  game.debugOpen = !game.debugOpen;
  render();
});

window.addEventListener('popstate', () => {
  if (isFullscreenRoute()) {
    clearPlacement();
    game.fullscreen.hasAutoSnapped = false;
  }
  render();
});

boot();
