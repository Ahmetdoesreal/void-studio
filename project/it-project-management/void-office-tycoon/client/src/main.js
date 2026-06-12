import './styles.css';
import Phaser from 'phaser';
import { localApi as api } from './localApi.js';
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

// Real isometric Habbo furniture extracted from the retro-hotel nitro bundles.
import furniDesk from './assets/sprites/furni/desk.png';
import furniWoodDesk from './assets/sprites/furni/woodDesk.png';
import furniMonitor from './assets/sprites/furni/monitor.png';
import furniImac from './assets/sprites/furni/imac.png';
import furniLaptop from './assets/sprites/furni/laptop.png';
import furniOfficeChair from './assets/sprites/furni/officeChair.png';
import furniOfficeChairBack from './assets/sprites/furni/officeChairBack.png';
import furniChair from './assets/sprites/furni/chair.png';
import furniTable from './assets/sprites/furni/table.png';
import furniCoffeeTable from './assets/sprites/furni/coffeeTable.png';
import furniPlant from './assets/sprites/furni/plant.png';
import furniPlantTall from './assets/sprites/furni/plantTall.png';
import furniLamp from './assets/sprites/furni/lamp.png';
import furniShelf from './assets/sprites/furni/shelf.png';
import furniBooks from './assets/sprites/furni/books.png';
import furniSofa from './assets/sprites/furni/sofa.png';
import furniRug from './assets/sprites/furni/rug.png';
import footprint1x1Sprite from './assets/sprites/furni_samples/footprint_1x1_64x64.svg';
import footprint2x1Sprite from './assets/sprites/furni_samples/footprint_2x1_128x64.svg';
import footprint2x1VerticalSprite from './assets/sprites/furni_samples/footprint_2x1_vertical.svg';
import footprintLCornerSprite from './assets/sprites/furni_samples/footprint_l_corner_128x128.svg';
import footprintLCorner90Sprite from './assets/sprites/furni_samples/footprint_l_corner_90.svg';
import footprintLCorner180Sprite from './assets/sprites/furni_samples/footprint_l_corner_180.svg';
import footprintLCorner270Sprite from './assets/sprites/furni_samples/footprint_l_corner_270.svg';

// Furniture sprite keys (match server OFFICE_FURNITURE palette). Loaded under a
// "furni_" prefix in Phaser; drawn at native aspect ratio.
const FURNI = {
  desk: furniDesk,
  woodDesk: furniWoodDesk,
  monitor: furniMonitor,
  imac: furniImac,
  laptop: furniLaptop,
  officeChair: furniOfficeChair,
  officeChairBack: furniOfficeChairBack,
  chair: furniChair,
  table: furniTable,
  coffeeTable: furniCoffeeTable,
  plant: furniPlant,
  plantTall: furniPlantTall,
  lamp: furniLamp,
  shelf: furniShelf,
  books: furniBooks,
  sofa: furniSofa,
  rug: furniRug,
  sampleFootprint1x1: footprint1x1Sprite,
  sampleFootprint2x1: footprint2x1Sprite,
  sampleFootprint2x1Vertical: footprint2x1VerticalSprite,
  sampleFootprintLCorner: footprintLCornerSprite,
  sampleFootprintLCorner90: footprintLCorner90Sprite,
  sampleFootprintLCorner180: footprintLCorner180Sprite,
  sampleFootprintLCorner270: footprintLCorner270Sprite
};

// UI currency icons lifted from the retro-hotel nitro wallet assets.
import iconCoin from './assets/ui/coin.png';
import iconDiamond from './assets/ui/diamond.png';
import iconHc from './assets/ui/hc.png';
import iconDucket from './assets/ui/ducket.png';

const RESOURCE_ICONS = {
  budget: iconCoin,
  team: iconHc,
  quality: iconDiamond
};
const POINTS_ICON = iconDucket;
const FOOTPRINT_SAMPLES = [
  {
    id: 'sample-1x1',
    label: '1x1',
    detail: 'single-tile prop',
    image: footprint1x1Sprite,
    spriteId: 'sampleFootprint1x1',
    shapeLabel: 'single tile',
    shape: [{ x: 0, y: 0 }],
    fillColor: 0x2f6a55,
    lineColor: 0x8be7b1
  },
  {
    id: 'sample-2x1',
    label: '2x1',
    detail: 'desk or table span',
    image: footprint2x1Sprite,
    spriteIdsByRotation: {
      0: 'sampleFootprint2x1',
      90: 'sampleFootprint2x1Vertical',
      180: 'sampleFootprint2x1',
      270: 'sampleFootprint2x1Vertical'
    },
    shapeLabel: 'bar',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    fillColor: 0x315877,
    lineColor: 0x92d3ff
  },
  {
    id: 'sample-l-corner',
    label: 'L-corner',
    detail: 'three-tile corner room',
    image: footprintLCornerSprite,
    spriteIdsByRotation: {
      0: 'sampleFootprintLCorner',
      90: 'sampleFootprintLCorner90',
      180: 'sampleFootprintLCorner180',
      270: 'sampleFootprintLCorner270'
    },
    shapeLabel: 'corner',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    fillColor: 0x6a442d,
    lineColor: 0xf4c897
  }
];
const FOOTPRINT_SAMPLES_BY_ID = Object.fromEntries(FOOTPRINT_SAMPLES.map(sample => [sample.id, sample]));

const appEl = document.querySelector('#app');


const STORAGE_KEY = 'voidOfficeTycoon.sessionId';
const FURNITURE_SCALE_STORAGE_KEY = 'voidOfficeTycoon.furnitureScaleMultiplier';
const FURNITURE_OFFSET_STORAGE_KEYS = {
  x: 'voidOfficeTycoon.furnitureOffsetX',
  y: 'voidOfficeTycoon.furnitureOffsetY',
  z: 'voidOfficeTycoon.furnitureOffsetZ'
};
const LEGACY_FURNITURE_OFFSET_STORAGE_KEY = 'voidOfficeTycoon.furnitureOffsetAdjustment';
const FULLSCREEN_PATH = '/fullscreen';
const BUILDER_PATH = '/builder';
const BUILDER_STORAGE_KEY = 'voidOfficeTycoon.builderState';
const VOID_OFFICE_DEBUG_FLAG = 'DEBUG_VOID_OFFICE';
const CHUNK_COUNT = 32;
const SUBCELLS_PER_CELL = 4;
const WORLD_TILE_SIZE = CHUNK_COUNT;
const TILE_STEP_X = 36;
const TILE_STEP_Y = 18;
const CHUNK_OFFSET_Y = TILE_STEP_Y * 2;
const BOARD_LEFT_PADDING = 64;
const BOARD_TOP_PADDING = 80;
const MIN_MAP_ZOOM = 0.12;
const MAX_MAP_ZOOM = 3.4;
const ZOOM_STEP = 0.2;
const CORRECT_BACKLOG_ORDER = ['s1', 's6', 's2', 's4', 's3', 's5'];
const START_BACKLOG_ORDER = ['s3', 's1', 's5', 's2', 's6', 's4'];
const DEFAULT_FURNITURE_SCALE_MULTIPLIER = 1;
const MIN_FURNITURE_SCALE_MULTIPLIER = 0.5;
const MAX_FURNITURE_SCALE_MULTIPLIER = 2;
const FURNITURE_SCALE_STEP = 0.05;
const DEFAULT_FURNITURE_OFFSET_AXIS = 0;
const MIN_FURNITURE_OFFSET_AXIS = -0.5;
const MAX_FURNITURE_OFFSET_AXIS = 0.5;
const FURNITURE_OFFSET_STEP = 0.05;
const FURNITURE_ANCHOR_BIAS = {
  north: { x: 0, y: -0.18 },
  south: { x: 0, y: 0.08 },
  west: { x: -0.3, y: -0.04 },
  east: { x: 0.3, y: -0.04 },
  nw: { x: -0.3, y: -0.18 },
  ne: { x: 0.3, y: -0.18 },
  sw: { x: -0.3, y: 0.08 },
  se: { x: 0.3, y: 0.08 }
};

const FURNI_RENDER_CONFIG = {
  desk: {
    fit: 'width',
    target: TILE_STEP_X * 2.85,
    groundOffset: TILE_STEP_Y * 0.74,
    originY: 1,
    baseOffsetX: TILE_STEP_X * 0.5,
    baseOffsetY: TILE_STEP_Y * 0.5,
    mirrorOffsetX: true
  },
  woodDesk: {
    fit: 'width',
    target: TILE_STEP_X * 2.85,
    groundOffset: TILE_STEP_Y * 0.74,
    originY: 1,
    baseOffsetX: TILE_STEP_X * 0.5,
    baseOffsetY: TILE_STEP_Y * 0.5,
    mirrorOffsetX: true
  },
  table: { fit: 'width', target: TILE_STEP_X * 2.22, groundOffset: TILE_STEP_Y * 0.74, originY: 1 },
  coffeeTable: { fit: 'width', target: TILE_STEP_X * 1.86, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  officeChair: { fit: 'height', target: TILE_STEP_Y * 3.7, groundOffset: TILE_STEP_Y * 0.74, originY: 1 },
  officeChairBack: { fit: 'height', target: TILE_STEP_Y * 3.7, groundOffset: TILE_STEP_Y * 0.74, originY: 1 },
  chair: { fit: 'height', target: TILE_STEP_Y * 2.9, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  monitor: {
    fit: 'width',
    target: TILE_STEP_X * 0.84,
    groundOffset: TILE_STEP_Y * 0.74,
    originY: 0.98,
    baseOffsetX: TILE_STEP_X * 0.5,
    baseOffsetY: TILE_STEP_Y * 0.5,
    mirrorOffsetX: true
  },
  imac: {
    fit: 'width',
    target: TILE_STEP_X * 0.9,
    groundOffset: TILE_STEP_Y * 0.74,
    originY: 0.98,
    baseOffsetX: TILE_STEP_X * 0.5,
    baseOffsetY: TILE_STEP_Y * 0.5,
    mirrorOffsetX: true
  },
  laptop: {
    fit: 'width',
    target: TILE_STEP_X * 0.78,
    groundOffset: TILE_STEP_Y * 0.74,
    originY: 0.98,
    baseOffsetX: TILE_STEP_X * 0.5,
    baseOffsetY: TILE_STEP_Y * 0.5,
    mirrorOffsetX: true
  },
  plant: { fit: 'height', target: TILE_STEP_Y * 1.95, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  plantTall: { fit: 'height', target: TILE_STEP_Y * 2.45, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  lamp: { fit: 'height', target: TILE_STEP_Y * 3.05, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  shelf: { fit: 'height', target: TILE_STEP_Y * 4.15, groundOffset: TILE_STEP_Y * 0.74, originY: 1 },
  books: { fit: 'width', target: TILE_STEP_X * 0.58, groundOffset: TILE_STEP_Y * 0.75, originY: 1 },
  sofa: { fit: 'width', target: TILE_STEP_X * 2.1, groundOffset: TILE_STEP_Y * 0.76, originY: 1 },
  rug: { fit: 'width', target: TILE_STEP_X * 2.8, groundOffset: TILE_STEP_Y * 0.76, originY: 1 },
  sampleFootprint1x1: { fit: 'width', target: TILE_STEP_X * 2, groundOffset: TILE_STEP_Y, originY: 37 / 38 },
  sampleFootprint2x1: { fit: 'width', target: TILE_STEP_X * 3, groundOffset: TILE_STEP_Y, originY: 55 / 56 },
  sampleFootprint2x1Vertical: { fit: 'width', target: TILE_STEP_X * 3, groundOffset: TILE_STEP_Y, originY: 55 / 56 },
  sampleFootprintLCorner: { fit: 'width', target: TILE_STEP_X * 4, groundOffset: TILE_STEP_Y, originY: 55 / 56 },
  sampleFootprintLCorner90: { fit: 'width', target: TILE_STEP_X * 3, groundOffset: TILE_STEP_Y, originY: 73 / 74 },
  sampleFootprintLCorner180: { fit: 'width', target: TILE_STEP_X * 4, groundOffset: TILE_STEP_Y, originY: 55 / 56 },
  sampleFootprintLCorner270: { fit: 'width', target: TILE_STEP_X * 3, groundOffset: TILE_STEP_Y, originY: 73 / 74 }
};

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

// A room (subcell) is ROOM_SIZE x ROOM_SIZE normal cells.
const ROOM_SIZE = 4;

// The three office building types (mirror of the server). Each ties to a
// resource, has a FIXED rotatable shape (in ROOM offsets) and a theme. Buyable
// repeatedly to expand the office. Image colours: budget=black, team=blue,
// quality=green.
const BUILDING_TYPES = [
  {
    id: 'budget', name: 'Budget Office', resource: 'budget', cost: 55, shapeLabel: 'L-corner',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    resourceEffect: { budget: 20, team: -2, quality: 0 },
    meaning: 'Finance wing that protects and grows the project budget.',
    theme: { floor: 0x2c2f3b, top: 0xe5bd57, left: 0x24262f, right: 0x3a3d49, label: 'BUDGET' }
  },
  {
    id: 'team', name: 'Team Office', resource: 'team', cost: 80, shapeLabel: 'L',
    shape: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    resourceEffect: { budget: -4, team: 22, quality: 2 },
    meaning: 'Collaboration space that keeps the team healthy and fast.',
    theme: { floor: 0x2f3c57, top: 0x7fb5e6, left: 0x2a3450, right: 0x41557d, label: 'TEAM' }
  },
  {
    id: 'quality', name: 'Quality Office', resource: 'quality', cost: 45, shapeLabel: 'bar',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    resourceEffect: { budget: 0, team: 2, quality: 18 },
    meaning: 'Dev/QA lab that turns effort into protected quality.',
    theme: { floor: 0x2c4636, top: 0x6fe0a8, left: 0x224031, right: 0x356048, label: 'QUALITY' }
  }
];
const BUILDING_TYPES_BY_ID = Object.fromEntries(BUILDING_TYPES.map(b => [b.id, b]));
const BUILDING_SHAPES = Object.fromEntries(BUILDING_TYPES.map(b => [b.id, b.shape]));

// Isometric building theme per building TYPE (keyed by typeId).
const DEPARTMENT_THEME = {
  budget: BUILDING_TYPES_BY_ID.budget.theme,
  team: BUILDING_TYPES_BY_ID.team.theme,
  quality: BUILDING_TYPES_BY_ID.quality.theme,
  default: { floor: 0x3a3f4d, top: 0x9fc0ec, left: 0x3a4a63, right: 0x4f607f, label: 'OFFICE' }
};

// Furniture sprite keys usable inside office chunks (matches server palette).
const OFFICE_FURNITURE_SPRITES = {
  table: tableSprite,
  laptopDesk: laptopDeskSprite,
  officeChair: officeChairSprite,
  labTable: labTableSprite,
  coffeeMachine: coffeeMachineSprite,
  coffeeTable: coffeeTableSprite,
  sofa: sofaSprite,
  plant: plantSprite,
  floorLamp: floorLampSprite
};

function rotateOffsets(cells, rotation) {
  const r = normalizeRotation(rotation);
  const rotated = cells.map(cell => {
    let x = Number(cell.x);
    let y = Number(cell.y);
    if (r === 90) [x, y] = [y, -x];
    if (r === 180) [x, y] = [-x, -y];
    if (r === 270) [x, y] = [-y, x];
    return { x, y };
  });
  const minX = Math.min(...rotated.map(cell => cell.x));
  const minY = Math.min(...rotated.map(cell => cell.y));
  return rotated.map(cell => ({ x: cell.x - minX, y: cell.y - minY }));
}

function isPlacementMode() {
  if (game.placement.kind === 'sample') return Boolean(game.placement.sampleId);
  return Boolean(game.placement.departmentId);
}

function placementSample() {
  return FOOTPRINT_SAMPLES_BY_ID[game.placement.sampleId] || null;
}

function sampleSpriteIdForRotation(sample, rotation = 0) {
  if (!sample) return '';
  const normalized = normalizeRotation(rotation);
  if (sample.spriteIdsByRotation) {
    return sample.spriteIdsByRotation[normalized] || sample.spriteIdsByRotation[0] || '';
  }
  return sample.spriteId || '';
}

function activePlacementShape() {
  if (game.placement.kind === 'sample') {
    return placementSample()?.shape || [{ x: 0, y: 0 }];
  }
  return BUILDING_SHAPES[game.placement.departmentId] || [{ x: 0, y: 0 }];
}

function placementType() {
  if (game.placement.kind === 'sample') return null;
  return BUILDING_TYPES_BY_ID[game.placement.departmentId] || null;
}

function placementChunkCount() {
  return activePlacementShape().length;
}

function placementCost() {
  return placementType()?.cost || 0;
}

const spriteKeyByUrl = new Map(Object.entries(sprites).map(([key, value]) => [value, key]));

function spriteKeyForUrl(url) {
  return spriteKeyByUrl.get(url) || 'tileVoid';
}

function clampFurnitureScaleMultiplier(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_FURNITURE_SCALE_MULTIPLIER;
  return Math.max(MIN_FURNITURE_SCALE_MULTIPLIER, Math.min(MAX_FURNITURE_SCALE_MULTIPLIER, parsed));
}

function loadFurnitureScaleMultiplier() {
  try {
    return clampFurnitureScaleMultiplier(localStorage.getItem(FURNITURE_SCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_FURNITURE_SCALE_MULTIPLIER;
  }
}

function saveFurnitureScaleMultiplier(value) {
  try {
    localStorage.setItem(FURNITURE_SCALE_STORAGE_KEY, String(value));
  } catch {
    // Ignore storage failures; live tuning still works for this session.
  }
}

function clampFurnitureOffsetAxis(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_FURNITURE_OFFSET_AXIS;
  return Math.max(MIN_FURNITURE_OFFSET_AXIS, Math.min(MAX_FURNITURE_OFFSET_AXIS, parsed));
}

function loadFurnitureOffsetAxis(axis) {
  try {
    const next = localStorage.getItem(FURNITURE_OFFSET_STORAGE_KEYS[axis]);
    if (next !== null) return clampFurnitureOffsetAxis(next);
    if (axis === 'x' || axis === 'y') {
      return clampFurnitureOffsetAxis(localStorage.getItem(LEGACY_FURNITURE_OFFSET_STORAGE_KEY));
    }
    return DEFAULT_FURNITURE_OFFSET_AXIS;
  } catch {
    return DEFAULT_FURNITURE_OFFSET_AXIS;
  }
}

function saveFurnitureOffsetAxis(axis, value) {
  try {
    localStorage.setItem(FURNITURE_OFFSET_STORAGE_KEYS[axis], String(value));
  } catch {
    // Ignore storage failures; live tuning still works for this session.
  }
}

function furnitureScaleLabel(value = game.furnitureScaleMultiplier) {
  return `${clampFurnitureScaleMultiplier(value).toFixed(2)}x`;
}

function furnitureOffsetAxisLabel(axis, value = game.furnitureOffsetAxes[axis]) {
  const next = clampFurnitureOffsetAxis(value);
  return `${next >= 0 ? '+' : ''}${next.toFixed(2)}`;
}

function furnitureAnchorBias(anchor) {
  return FURNITURE_ANCHOR_BIAS[String(anchor || '').toLowerCase()] || { x: 0, y: 0 };
}

function furnitureRenderMetrics(spriteId, sourceImage) {
  const cfg = FURNI_RENDER_CONFIG[spriteId] || {};
  let scale;
  if (cfg.fit === 'width') {
    scale = (cfg.target || TILE_STEP_X * 1.6) / Math.max(1, sourceImage.width);
  } else if (cfg.fit === 'height') {
    scale = (cfg.target || TILE_STEP_Y * 3.4) / Math.max(1, sourceImage.height);
  } else {
    scale = Math.min(0.95, (TILE_STEP_X * 1.7) / Math.max(sourceImage.width, sourceImage.height));
  }
  return {
    scale: scale * clampFurnitureScaleMultiplier(game.furnitureScaleMultiplier),
    groundOffset: cfg.groundOffset ?? TILE_STEP_Y * 0.68,
    originY: cfg.originY ?? 0.98,
    baseOffsetX: cfg.baseOffsetX ?? 0,
    baseOffsetY: cfg.baseOffsetY ?? 0,
    mirrorOffsetX: Boolean(cfg.mirrorOffsetX)
  };
}

function furnitureSpriteTransform({
  spriteId,
  sourceImage,
  baseX,
  baseY,
  flipX = false,
  offsetX = 0,
  offsetY = 0,
  lift = 0,
  anchor = '',
  depth = 1000
}) {
  const metrics = furnitureRenderMetrics(spriteId, sourceImage);
  const offsetAxes = game.furnitureOffsetAxes;
  const anchorBias = furnitureAnchorBias(anchor);
  const totalLift = (Number(lift || 0) + clampFurnitureOffsetAxis(offsetAxes.z)) * TILE_STEP_Y;
  const resolvedBaseOffsetX = metrics.mirrorOffsetX && Boolean(flipX)
    ? -metrics.baseOffsetX
    : metrics.baseOffsetX;
  const resolvedOffsetX = resolvedBaseOffsetX
    + anchorBias.x * TILE_STEP_X
    + clampFurnitureOffsetAxis(offsetAxes.x) * TILE_STEP_X
    + Number(offsetX || 0) * TILE_STEP_X;
  const resolvedOffsetY = metrics.baseOffsetY
    + anchorBias.y * TILE_STEP_Y
    + clampFurnitureOffsetAxis(offsetAxes.y) * TILE_STEP_Y
    + Number(offsetY || 0) * TILE_STEP_Y;
  return {
    metrics,
    x: Number(baseX) + resolvedOffsetX,
    y: Number(baseY) + metrics.groundOffset + resolvedOffsetY - totalLift,
    depth: Number(depth) + (totalLift > 0 ? 2 : 0),
    flipX: Boolean(flipX)
  };
}

function placementSpriteAnchor(world, cells) {
  if (!cells?.length) return null;
  const centers = cells.map(cell => tileCenter(world, Number(cell.x), Number(cell.y)));
  const minX = Math.min(...centers.map(center => center.x));
  const maxX = Math.max(...centers.map(center => center.x));
  const maxY = Math.max(...centers.map(center => center.y));
  const maxDepth = Math.max(...cells.map(cell => Number(cell.x) + Number(cell.y)));
  return {
    x: (minX + maxX) / 2,
    y: maxY,
    depth: 1000 + maxDepth * 4 + 1
  };
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

function pickVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
}

const backlogItems = [
  { id: 's1', ...pickVariant([{ text: 'Project Initiation & Charter', note: 'Project scope and objectives defined' }]) },
  { id: 's2', ...pickVariant([{ text: 'Architecture & Sprint Planning', note: 'Technical design and task breakdown' }]) },
  { id: 's3', ...pickVariant([{ text: 'QA Testing & User Acceptance', note: 'System validation by QA and client' }]) },
  { id: 's4', ...pickVariant([{ text: 'Development & Implementation', note: 'Core coding and feature build' }]) },
  { id: 's5', ...pickVariant([{ text: 'Production Deployment & Retrospective', note: 'Release to live and team review' }]) },
  { id: 's6', ...pickVariant([{ text: 'Requirements Analysis & Scoping', note: 'Gathering detailed business needs' }]) }
];

const bugCards = [
  { id: 'b1', severity: 'serious', ...pickVariant([{ title: 'Payment gateway fails silently during checkout' }]) },
  { id: 'b2', severity: 'minor', ...pickVariant([{ title: 'Button alignment is 2px off on mobile Safari' }]) },
  { id: 'b3', severity: 'serious', ...pickVariant([{ title: 'Production database credentials leaked in client logs' }]) },
  { id: 'b4', severity: 'minor', ...pickVariant([{ title: 'Placeholder text typo on the About Us page' }]) },
  { id: 'b5', severity: 'serious', ...pickVariant([{ title: 'User sessions cross-contaminate under high server load' }]) },
  { id: 'b6', severity: 'minor', ...pickVariant([{ title: 'Console warning Deprecation during local build' }]) }
];

const riskCards = [
  { id: 'r1', severity: 'serious', ...pickVariant([{ title: 'Key cloud provider API deprecation announced for next week', note: 'External dependency' }]) },
  { id: 'r2', severity: 'minor', ...pickVariant([{ title: 'Team lunch delivery delayed by 15 minutes', note: 'Low-impact nuisance' }]) },
  { id: 'r3', severity: 'serious', ...pickVariant([{ title: 'Only one senior backend developer knows the core architecture', note: 'Bus Factor' }]) },
  { id: 'r4', severity: 'minor', ...pickVariant([{ title: 'Jira server needs a routine restart over the weekend', note: 'Routine maintenance' }]) },
  { id: 'r5', severity: 'serious', ...pickVariant([{ title: 'Client changes core business requirements mid-sprint', note: 'Scope creep' }]) },
  { id: 'r6', severity: 'minor', ...pickVariant([{ title: 'Office coffee machine needs descaling', note: 'Facility issue' }]) }
];

const budgetChoices = [
  { id: 'budget_patch', delta: { budget: 15, team: -4, quality: 0 }, ...pickVariant([{ title: 'Downgrade environments', text: 'Reduce cloud infrastructure costs by downgrading staging environments.' }]) },
  { id: 'team_sync', delta: { budget: -6, team: 14, quality: 2 }, ...pickVariant([{ title: 'Approve team event', text: 'Approve overtime pay and weekend catering to boost team morale for the deadline.' }]) },
  { id: 'quality_gate', delta: { budget: -8, team: 0, quality: 16 }, ...pickVariant([{ title: 'Hire pen-testers', text: 'Purchase automated security scanning tools and hire an external penetration tester.' }]) }
];

const stakeholderChoices = [
  { id: 'reply_with_decision', ...pickVariant([{ title: 'Present workarounds', text: 'Present the current blocker, offer two viable workarounds, and ask for their final decision.', note: 'Best practice' }]) },
  { id: 'promise_later', ...pickVariant([{ title: 'Promise an update later', text: 'Tell them you are busy and will send an update sometime next week without details.', note: 'Delays alignment' }]) },
  { id: 'send_metrics_only', ...pickVariant([{ title: 'Send metrics only', text: 'Send a complex technical Jira burn-down chart without any explanation.', note: 'Leaves the stakeholder guessing' }]) }
];

const minigames = [
  { id: 'scope_fog', title: 'Scope Fog', sourceId: 'SC-01' },
  { id: 'bug_rain', title: 'Bug Rain', sourceId: 'SC-02' },
  { id: 'budget_rift', title: 'Budget Rift', sourceId: 'SC-03' },
  { id: 'risk_vault', title: 'Risk Vault', sourceId: 'SC-04' },
  { id: 'stakeholder_booth', title: 'Stakeholder Booth', sourceId: 'SC-05' }
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
  placement: {
    kind: '',
    departmentId: '',
    sampleId: '',
    presetId: '',
    rotation: 0,
    previewAnchor: null
  },
  samplePlacements: [],
  fullscreen: {
    zoom: 1,
    hoverCell: null,
    hasAutoSnapped: false
  },
  furnitureScaleMultiplier: loadFurnitureScaleMultiplier(),
  furnitureOffsetAxes: {
    x: loadFurnitureOffsetAxis('x'),
    y: loadFurnitureOffsetAxis('y'),
    z: loadFurnitureOffsetAxis('z')
  },
  voidOfficeDebugEnabled: false,
  debugOpen: false,
  showCorrectAnswers: false,
  showTutorial: false,
  builder: loadBuilderState()
};

function defaultBuilderState() {
  return {
    selectedTypeId: 'budget',
    rotation: 0,
    furniture: [],
    selectedFurnitureIdx: -1,
    selectedSpriteId: 'desk',
    mode: 'place',
    exportText: ''
  };
}

function loadBuilderState() {
  try {
    const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultBuilderState(), ...parsed, selectedFurnitureIdx: -1, exportText: '' };
    }
  } catch { /* ignore */ }
  return defaultBuilderState();
}

function saveBuilderState() {
  try {
    const { selectedFurnitureIdx, exportText, ...persist } = game.builder;
    localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(persist));
  } catch { /* ignore */ }
}

function isBuilderRoute() {
  return window.location.pathname === BUILDER_PATH;
}

// --- Ported server furniture generation (mirrors game_rules.py) ---

const BUILDER_ROOM_SIZE = 4;
const BUILDER_FURNITURE_LAYOUT_VERSION = 4;
const BUILDER_DESK_SURFACE = 'desk';
const BUILDER_COMPUTER_LIFT = 1.65;
const BUILDER_COMPUTER_OFFSET_X = -0.18;
const BUILDER_COMPUTER_OFFSET_Y = -0.24;
const BUILDER_WORKSTATION_CHAIR = 'officeChair';
const BUILDER_WORKSTATION_CHAIR_OFFSET_X = 0.2;
const BUILDER_WORKSTATION_CHAIR_OFFSET_Y = -0.16;
const BUILDER_MEETING_CHAIR = 'chair';
const BUILDER_MEETING_CHAIR_OFFSET_X = 0.14;
const BUILDER_MEETING_CHAIR_OFFSET_Y = -0.12;

const BUILDER_COMPUTER_CHOICES = {
  budget: ['monitor', 'imac', 'monitor'],
  team: ['laptop', 'monitor', 'laptop'],
  quality: ['laptop', 'monitor', 'imac'],
  spawn: ['monitor', 'laptop', 'imac']
};

function builderRoomPiece(x, y, spriteId, opts = {}) {
  const piece = { x, y, spriteId, mirrorSprite: Boolean(opts.mirrorSprite) };
  if (opts.lift) piece.lift = opts.lift;
  if (opts.offsetX) piece.offsetX = opts.offsetX;
  if (opts.offsetY) piece.offsetY = opts.offsetY;
  if (opts.anchor) piece.anchor = opts.anchor;
  return piece;
}

function builderMirrorAnchor(anchor) {
  return { nw: 'ne', ne: 'nw', sw: 'se', se: 'sw', west: 'east', east: 'west' }[anchor] || anchor;
}

function builderMirrorRoomPieces(pieces) {
  return pieces.map(piece => {
    const item = { ...piece };
    item.x = (BUILDER_ROOM_SIZE - 1) - item.x;
    if (item.offsetX) item.offsetX = -item.offsetX;
    if (item.anchor) item.anchor = builderMirrorAnchor(item.anchor);
    if (item.mirrorSprite) {
      delete item.mirrorSprite;
      item.flipX = !item.flipX;
    }
    return item;
  });
}

function builderSeededRandom(seed) {
  // Simple seeded pseudo-random (xorshift32-like).
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  return function() {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
}

function builderPickRandom(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function builderWorkstationLayout(rng, typeId, mirrored) {
  const computer = builderPickRandom(rng, BUILDER_COMPUTER_CHOICES[typeId] || BUILDER_COMPUTER_CHOICES.spawn);
  const pieces = [
    builderRoomPiece(2, 1, BUILDER_DESK_SURFACE, { mirrorSprite: true }),
    builderRoomPiece(2, 1, computer, { lift: BUILDER_COMPUTER_LIFT, offsetX: BUILDER_COMPUTER_OFFSET_X, offsetY: BUILDER_COMPUTER_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(1, 2, BUILDER_WORKSTATION_CHAIR, { offsetX: BUILDER_WORKSTATION_CHAIR_OFFSET_X, offsetY: BUILDER_WORKSTATION_CHAIR_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(0, 0, 'plantTall', { offsetY: -0.08, anchor: 'nw' }),
    builderRoomPiece(3, 1, 'books', { offsetY: -0.06, anchor: 'east' })
  ];
  return mirrored ? builderMirrorRoomPieces(pieces) : pieces;
}

function builderLabLayout(rng, typeId, mirrored) {
  const computer = builderPickRandom(rng, BUILDER_COMPUTER_CHOICES[typeId] || BUILDER_COMPUTER_CHOICES.spawn);
  const pieces = [
    builderRoomPiece(2, 1, BUILDER_DESK_SURFACE, { mirrorSprite: true }),
    builderRoomPiece(2, 1, computer, { lift: BUILDER_COMPUTER_LIFT, offsetX: BUILDER_COMPUTER_OFFSET_X, offsetY: BUILDER_COMPUTER_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(1, 2, BUILDER_WORKSTATION_CHAIR, { offsetX: BUILDER_WORKSTATION_CHAIR_OFFSET_X, offsetY: BUILDER_WORKSTATION_CHAIR_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(0, 0, 'shelf', { anchor: 'nw', mirrorSprite: true }),
    builderRoomPiece(0, 1, 'books', { offsetX: 0.06, offsetY: -0.06, anchor: 'west' })
  ];
  return mirrored ? builderMirrorRoomPieces(pieces) : pieces;
}

function builderArchiveLayout(mirrored) {
  const pieces = [
    builderRoomPiece(1, 0, 'shelf', { anchor: 'north', mirrorSprite: true }),
    builderRoomPiece(2, 1, 'books', { offsetY: -0.06, anchor: 'east' }),
    builderRoomPiece(0, 2, 'lamp', { offsetY: -0.08, anchor: 'sw' }),
    builderRoomPiece(3, 2, 'plant', { offsetY: -0.06, anchor: 'se' })
  ];
  return mirrored ? builderMirrorRoomPieces(pieces) : pieces;
}

function builderMeetingLayout(mirrored) {
  const pieces = [
    builderRoomPiece(2, 1, 'table', { mirrorSprite: true }),
    builderRoomPiece(1, 2, BUILDER_MEETING_CHAIR, { offsetX: BUILDER_MEETING_CHAIR_OFFSET_X, offsetY: BUILDER_MEETING_CHAIR_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(3, 2, BUILDER_MEETING_CHAIR, { offsetX: -BUILDER_MEETING_CHAIR_OFFSET_X, offsetY: BUILDER_MEETING_CHAIR_OFFSET_Y, mirrorSprite: true }),
    builderRoomPiece(0, 0, 'plant', { offsetY: -0.06, anchor: 'nw' })
  ];
  return mirrored ? builderMirrorRoomPieces(pieces) : pieces;
}

function builderLoungeLayout(mirrored) {
  const pieces = [
    builderRoomPiece(2, 1, 'sofa', { mirrorSprite: true }),
    builderRoomPiece(1, 2, 'coffeeTable', { mirrorSprite: true }),
    builderRoomPiece(0, 0, 'plantTall', { offsetY: -0.08, anchor: 'nw' }),
    builderRoomPiece(3, 1, 'lamp', { offsetY: -0.08, anchor: 'east' })
  ];
  return mirrored ? builderMirrorRoomPieces(pieces) : pieces;
}

function builderRoomProgram(typeId, roomIndex) {
  const programs = {
    budget: ['workstation', 'archive', 'meeting'],
    team: ['lounge', 'workstation', 'meeting', 'lounge'],
    quality: ['lab', 'lab'],
    spawn: ['workstation']
  };
  const list = programs[typeId] || ['workstation'];
  return list[roomIndex % list.length];
}

function builderRoomShouldMirror(rotation, roomIndex) {
  const norm = normalizeRotation(rotation);
  const startMirrored = norm === 90 || norm === 270;
  return Boolean((roomIndex + (startMirrored ? 1 : 0)) % 2);
}

function builderLayoutForProgram(program, rng, typeId, mirrored) {
  if (program === 'archive') return builderArchiveLayout(mirrored);
  if (program === 'meeting') return builderMeetingLayout(mirrored);
  if (program === 'lounge') return builderLoungeLayout(mirrored);
  if (program === 'lab') return builderLabLayout(rng, typeId, mirrored);
  return builderWorkstationLayout(rng, typeId, mirrored);
}

function builderGenerateFurniture(roomBases, rng, typeId, rotation) {
  const items = [];
  roomBases.forEach((base, roomIndex) => {
    const [bx, by] = base;
    const program = builderRoomProgram(typeId, roomIndex);
    const mirrored = builderRoomShouldMirror(rotation, roomIndex);
    const layout = builderLayoutForProgram(program, rng, typeId, mirrored);
    layout.forEach(piece => {
      const cx = bx + piece.x;
      const cy = by + piece.y;
      const item = {
        id: `furni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        spriteId: piece.spriteId,
        cell: { x: cx, y: cy },
        offsetX: piece.offsetX || 0,
        offsetY: piece.offsetY || 0,
        lift: piece.lift || 0,
        anchor: piece.anchor || '',
        flipX: Boolean(piece.flipX)
      };
      items.push(item);
    });
  });
  return items;
}

function builderOccupiedCells(typeId, anchorCell, rotation) {
  const shape = BUILDING_SHAPES[typeId] || [{ x: 0, y: 0 }];
  const rotated = rotateOffsets(shape, rotation);
  const ax = anchorCell.x;
  const ay = anchorCell.y;
  const cells = [];
  rotated.forEach(room => {
    const baseX = ax + room.x * BUILDER_ROOM_SIZE;
    const baseY = ay + room.y * BUILDER_ROOM_SIZE;
    for (let dy = 0; dy < BUILDER_ROOM_SIZE; dy++) {
      for (let dx = 0; dx < BUILDER_ROOM_SIZE; dx++) {
        cells.push({ x: baseX + dx, y: baseY + dy });
      }
    }
  });
  return cells;
}

function builderRoomBases(typeId, anchorCell, rotation) {
  const shape = BUILDING_SHAPES[typeId] || [{ x: 0, y: 0 }];
  const rotated = rotateOffsets(shape, rotation);
  const ax = anchorCell.x;
  const ay = anchorCell.y;
  return rotated.map(room => [ax + room.x * BUILDER_ROOM_SIZE, ay + room.y * BUILDER_ROOM_SIZE]);
}

function builderPerimeterWalls(occupiedCells) {
  const occupied = new Set(occupiedCells.map(c => coordKey(c.x, c.y)));
  const walls = [];
  occupiedCells.forEach(cell => {
    if (!occupied.has(coordKey(cell.x, cell.y - 1))) {
      walls.push({ cell: { x: cell.x, y: cell.y }, edge: 'north' });
    }
    if (!occupied.has(coordKey(cell.x - 1, cell.y))) {
      walls.push({ cell: { x: cell.x, y: cell.y }, edge: 'west' });
    }
  });
  return walls;
}

function builderAutoFillFurniture() {
  const b = game.builder;
  const anchor = { x: 2, y: 2 };
  const rotation = normalizeRotation(b.rotation);
  const bases = builderRoomBases(b.selectedTypeId, anchor, rotation);
  const seed = `builder:${b.selectedTypeId}:${rotation}`;
  const rng = builderSeededRandom(seed);
  return builderGenerateFurniture(bases, rng, b.selectedTypeId, rotation);
}

function builderCreatePlacement() {
  const b = game.builder;
  const anchor = { x: 2, y: 2 };
  const rotation = normalizeRotation(b.rotation);
  const cells = builderOccupiedCells(b.selectedTypeId, anchor, rotation);
  const walls = builderPerimeterWalls(cells);
  return { typeId: b.selectedTypeId, rotation, anchorCell: anchor, occupiedCells: cells, furniture: b.furniture, walls, subcellsPerCell: SUBCELLS_PER_CELL, furnitureVersion: BUILDER_FURNITURE_LAYOUT_VERSION };
}

let voidOfficeDebugFlagValue = false;

function isVoidOfficeDebugEnabled() {
  return game.voidOfficeDebugEnabled;
}

function setVoidOfficeDebugEnabled(value) {
  const next = value === true;
  voidOfficeDebugFlagValue = next;
  if (game.voidOfficeDebugEnabled === next) return;
  game.voidOfficeDebugEnabled = next;
  if (!next && game.placement.kind === 'sample') clearPlacement();
  render();
}

function installVoidOfficeDebugFlag() {
  const existing = globalThis[VOID_OFFICE_DEBUG_FLAG];
  voidOfficeDebugFlagValue = existing === true;
  game.voidOfficeDebugEnabled = voidOfficeDebugFlagValue;
  try {
    Object.defineProperty(globalThis, VOID_OFFICE_DEBUG_FLAG, {
      configurable: true,
      enumerable: true,
      get() {
        return voidOfficeDebugFlagValue;
      },
      set(value) {
        setVoidOfficeDebugEnabled(value);
      }
    });
  } catch {
    // If the global cannot be redefined, fall back to reading its current value.
    game.voidOfficeDebugEnabled = globalThis[VOID_OFFICE_DEBUG_FLAG] === true;
  }
}

const MAX_PLAYS_PER_MINIGAME = 2;

function minigamePlaysRemaining(minigameId) {
  const history = game.session?.minigameHistory || [];
  const played = history.filter(entry => entry.minigameId === minigameId).length;
  return Math.max(0, MAX_PLAYS_PER_MINIGAME - played);
}

function allMinigamesExhausted() {
  return minigames.every(m => minigamePlaysRemaining(m.id) <= 0);
}

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
    if (!isBuilderRoute()) {
      game.error = `API unavailable: ${error.message}`;
    }
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
  if (['bug_rain', 'risk_vault'].includes(game.activeMinigame)) {
    game.minigameState = { selected: [] };
  } else if (['budget_rift', 'stakeholder_booth'].includes(game.activeMinigame)) {
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

function renderDeltaChips(delta = {}) {
  const chips = Object.entries(delta)
    .filter(([, value]) => Number(value) !== 0)
    .map(([key, value]) => {
      const sign = value > 0 ? '+' : '';
      const tone = value > 0 ? 'up' : 'down';
      return `<span class="delta-chip ${tone}">${resourceLabel(key)} ${sign}${value}</span>`;
    });
  return chips.length
    ? `<span class="delta-chips">${chips.join('')}</span>`
    : '<span class="delta-chips"><span class="delta-chip flat">No change</span></span>';
}

function canAct() {
  return game.session && !game.session.paused && !game.session.finalResult;
}

function formatPlayTime(ms) {
  const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function currentPlayTimeMs() {
  const session = game.session;
  if (!session) return 0;
  let playTime = session.playTimeMs || 0;
  if (!session.paused && !session.finalResult && session.lastResumedAt) {
    const resumed = new Date(session.lastResumedAt).getTime();
    if (!isNaN(resumed)) {
      playTime += (Date.now() - resumed);
    }
  }
  return playTime;
}

setInterval(() => {
  const el = document.getElementById('live-timer');
  if (el && game.session) {
    el.textContent = formatPlayTime(currentPlayTimeMs());
  }
}, 1000);

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
  if (path === BUILDER_PATH) {
    clearPlacement();
  }
  render();
}

function clampZoom(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, parsed));
}

function sortedDepartments() {
  // Placed building instances (and the portal), oldest first.
  return Object.values(game.session?.departments || {})
    .sort((a, b) => String(a.builtAt || '').localeCompare(String(b.builtAt || '')));
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
  if ((!department && !placementSample()) || !anchor) return [];
  if (game.placement.kind === 'sample') {
    return rotateOffsets(activePlacementShape(), rotation).map(cell => ({
      x: Number(anchor.x) + Number(cell.x),
      y: Number(anchor.y) + Number(cell.y),
      offsetX: Number(cell.x),
      offsetY: Number(cell.y)
    }));
  }
  // Each preset offset is a ROOM; expand it to the 4x4 block of normal cells.
  const cells = [];
  for (const room of rotateOffsets(activePlacementShape(), rotation)) {
    const bx = Number(anchor.x) + room.x * ROOM_SIZE;
    const by = Number(anchor.y) + room.y * ROOM_SIZE;
    for (let dy = 0; dy < ROOM_SIZE; dy += 1) {
      for (let dx = 0; dx < ROOM_SIZE; dx += 1) {
        cells.push({ x: bx + dx, y: by + dy, offsetX: room.x * ROOM_SIZE + dx, offsetY: room.y * ROOM_SIZE + dy });
      }
    }
  }
  return cells;
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

function officeCellKeys() {
  const world = worldState();
  const keys = new Set();
  for (const cell of world.spawnOffice?.cells || []) keys.add(coordKey(Number(cell.x), Number(cell.y)));
  for (const department of sortedDepartments()) {
    if (!department.built) continue;
    for (const cell of department.placement?.occupiedCells || []) {
      keys.add(coordKey(Number(cell.x), Number(cell.y)));
    }
  }
  return keys;
}

// Cells you can extend a corridor from: built path plus any office floor.
function buildableSet() {
  const set = pathSet();
  for (const key of officeCellKeys()) set.add(key);
  return set;
}

function isAdjacentToPath(x, y) {
  const buildable = buildableSet();
  return [
    coordKey(x + 1, y),
    coordKey(x - 1, y),
    coordKey(x, y + 1),
    coordKey(x, y - 1)
  ].some(key => buildable.has(key));
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
  // When placing, the "department" is the building TYPE being placed.
  return placementType();
}

function samplePlacementOverlaps(cells) {
  const keys = new Set(cells.map(cell => coordKey(Number(cell.x), Number(cell.y))));
  return game.samplePlacements.some(placement => (
    (placement.cells || []).some(cell => keys.has(coordKey(Number(cell.x), Number(cell.y))))
  ));
}

function occupiedByOtherDepartment(x, y, departmentId) {
  return sortedDepartments().some(department => (
    department.id !== departmentId &&
    department.built &&
    (department.placement?.occupiedCells || []).some(cell => Number(cell.x) === x && Number(cell.y) === y)
  ));
}

// A building can expand from the corridor, the spawn office, another building,
// or a map border — mirrors the server's validate_department_placement.
function cellsTouchBuildable(cells) {
  const buildable = buildableSet();
  const own = new Set(cells.map(c => coordKey(c.x, c.y)));
  return cells.some(cell => [
    coordKey(cell.x + 1, cell.y),
    coordKey(cell.x - 1, cell.y),
    coordKey(cell.x, cell.y + 1),
    coordKey(cell.x, cell.y - 1)
  ].some(key => buildable.has(key) && !own.has(key)));
}

function cellsOnBorder(cells, size) {
  return cells.some(c => c.x === 0 || c.y === 0 || c.x === size - 1 || c.y === size - 1);
}

function placementPreview(anchor = game.placement.previewAnchor) {
  const department = placementModeDepartment();
  const sample = placementSample();
  const world = worldState();
  if ((!department && !sample) || !anchor) return { cells: [], valid: false, reason: '' };
  const size = worldTileSize(world);
  const cells = placementCells(department || sample, anchor, game.placement.rotation);
  const endKey = coordKey(world.end.x, world.end.y);
  const path = pathSet();
  const offices = officeCellKeys();
  const invalid = cells.find(cell => {
    const key = coordKey(cell.x, cell.y);
    return (
      cell.x < 0 ||
      cell.y < 0 ||
      cell.x >= size ||
      cell.y >= size ||
      key === endKey ||
      (game.placement.kind !== 'sample' && path.has(key)) ||
      (game.placement.kind !== 'sample' && offices.has(key)) ||
      cellTouchesBlackholeDanger(cell.x, cell.y)
    );
  });
  if (invalid) {
    return {
      cells,
      valid: false,
      reason: game.placement.kind === 'sample'
        ? 'Blocked — outside the map, on the gate, or inside blackhole danger'
        : 'Blocked — overlaps a corridor, office, gate or blackhole'
    };
  }
  if (game.placement.kind === 'sample' && samplePlacementOverlaps(cells)) {
    return { cells, valid: false, reason: 'Blocked — overlaps another footprint sample' };
  }
  if (game.placement.kind === 'sample') {
    return { cells, valid: true, reason: 'Stamp anywhere safe on the grid to compare footprint size' };
  }
  if (!cellsOnBorder(cells, size) && !cellsTouchBuildable(cells)) {
    return { cells, valid: false, reason: 'Touch your office, corridor or a map border' };
  }
  return { cells, valid: true, reason: 'Valid placement' };
}

function placementPreviewForCell(x, y) {
  if (!isPlacementMode() || !game.placement.previewAnchor) return null;
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
    top: pos.top + CHUNK_OFFSET_Y
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
  return { x: pos.left, y: pos.top + CHUNK_OFFSET_Y };
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
  return cellFromBoardPoint(world, worldX, worldY - CHUNK_OFFSET_Y);
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
    Object.entries(FURNI).forEach(([key, url]) => {
      this.load.image(`furni_${key}`, url);
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
    this.drawOffices(world);
    this.drawSamplePlacements(world);
    this.drawWorldObjects(world);
    this.drawPlacementPreview(world);
  }

  officeCellSet(world) {
    const set = new Set();
    for (const cell of world.spawnOffice?.cells || []) set.add(coordKey(Number(cell.x), Number(cell.y)));
    for (const department of sortedDepartments()) {
      if (!department.built) continue;
      for (const cell of department.placement?.occupiedCells || []) {
        set.add(coordKey(Number(cell.x), Number(cell.y)));
      }
    }
    return set;
  }

  // Draw a furnished, walled office: room floor + 4x4 subtile grid, north/west
  // back walls, and randomised furniture sprites.
  drawFurnishedOffice(world, cells, furniture, options = {}) {
    const SUB = subcellsPerCell(world);
    const floor = this.add.graphics().setDepth(120);
    const cellKeys = new Set(cells.map(c => coordKey(Number(c.x), Number(c.y))));

    cells.forEach(cell => {
      const x = Number(cell.x);
      const y = Number(cell.y);
      const center = tileCenter(world, x, y);
      const diamond = this.tileDiamond(center, 1);
      floor.fillStyle(options.floorColor ?? 0x6c5f3c, 0.96);
      floor.fillPoints(diamond, true);
      floor.lineStyle(1, options.edgeColor ?? 0xcdbb83, 0.35);
      floor.strokePoints(diamond, true);
    });

    // North/west back walls on the office perimeter.
    const walls = this.add.graphics().setDepth(500);
    cells.forEach(cell => {
      const x = Number(cell.x);
      const y = Number(cell.y);
      const c = tileCenter(world, x, y);
      const H = Math.round(TILE_STEP_Y * 2.4);
      const hasNorth = cellKeys.has(coordKey(x, y - 1));
      const hasWest = cellKeys.has(coordKey(x - 1, y));
      if (!hasNorth) {
        walls.fillStyle(0x5a6b86, 0.96);
        walls.fillPoints([
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y),
          new Phaser.Math.Vector2(c.x + TILE_STEP_X, c.y),
          new Phaser.Math.Vector2(c.x + TILE_STEP_X, c.y - H),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y - H)
        ], true);
      }
      if (!hasWest) {
        walls.fillStyle(0x44546b, 0.96);
        walls.fillPoints([
          new Phaser.Math.Vector2(c.x - TILE_STEP_X, c.y),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y - H),
          new Phaser.Math.Vector2(c.x - TILE_STEP_X, c.y - H)
        ], true);
      }
    });

    // Real Habbo furniture, one piece per cell, drawn at native aspect ratio
    // and sized to roughly fill a tile (it is its own cell now).
    (furniture || []).forEach(item => {
      const texKey = `furni_${item.spriteId}`;
      if (!this.textures.exists(texKey)) return;
      const cx = Number(item.cell?.x);
      const cy = Number(item.cell?.y);
      const center = tileCenter(world, cx, cy);
      const src = this.textures.get(texKey).getSourceImage();
      const transform = furnitureSpriteTransform({
        spriteId: item.spriteId,
        sourceImage: src,
        baseX: center.x,
        baseY: center.y,
        flipX: item.flipX,
        offsetX: item.offsetX,
        offsetY: item.offsetY,
        lift: item.lift,
        anchor: item.anchor,
        depth: 1000 + (cx + cy) * 4
      });
      // Items with a lift (e.g. a computer) sit on top of the desk on the same
      // cell, so raise them and draw them above the desk. offsetX nudges them
      // horizontally so they sit centred on the desk surface.
      this.add.image(transform.x, transform.y, texKey)
        .setOrigin(0.5, transform.metrics.originY)
        .setDisplaySize(src.width * transform.metrics.scale, src.height * transform.metrics.scale)
        .setFlipX(transform.flipX)
        .setDepth(transform.depth);
    });

    if (options.label) {
      const anchor = cells[0];
      const c = tileCenter(world, Number(anchor.x), Number(anchor.y));
      this.add.text(c.x, c.y - (Math.round(TILE_STEP_Y * 2.4) + 14), options.label, {
        fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#f4efe2', fontStyle: 'bold'
      }).setOrigin(0.5, 1).setDepth(1600);
    }
  }

  drawOffices(world) {
    // Spawn office room.
    if (world.spawnOffice?.cells?.length) {
      this.drawFurnishedOffice(world, world.spawnOffice.cells, world.spawnOffice.furniture, {
        floorColor: 0x7a6a44,
        edgeColor: 0xe0cf94,
        label: 'HQ'
      });
    }
    // Department expansion rooms.
    for (const department of sortedDepartments()) {
      if (!department.built || department.typeId === 'portal_room') continue;
      const placement = department.placement;
      if (!placement?.occupiedCells?.length) continue;
      const theme = DEPARTMENT_THEME[department.typeId] || DEPARTMENT_THEME.default;
      this.drawFurnishedOffice(world, placement.occupiedCells, placement.furniture, {
        floorColor: theme.floor ?? 0x4a4f63,
        edgeColor: theme.top,
        label: theme.label
      });
    }
  }

  drawBackground(dims) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x02030a, 0x0a1020, 0x111827, 0x2b3150, 1);
    bg.fillRect(0, 0, dims.width, dims.height);
  }

  drawFineGrid(world) {
    const size = worldTileSize(world);
    const alpha = this.mode === 'fullscreen' ? 0.16 : 0.12;
    const grid = this.add.graphics().setDepth(20);

    // Grid lines run along tile EDGES (half-integer coords) so each diamond
    // tile sits exactly inside one grid cell. Tile centers are integer coords,
    // so the edges are at index - 0.5.
    for (let index = 0; index <= size; index += 1) {
      const v = index - 0.5;
      const isBoundary = index === 0 || index === size;
      const color = isBoundary ? 0xe6ecf6 : 0xc5d6ee;
      const lineAlpha = isBoundary ? alpha * 2.0 : alpha;
      const lineWidth = isBoundary ? 1.1 : 0.5;
      grid.lineStyle(lineWidth, color, lineAlpha);

      const west = fineCellPosition(world, -0.5, v);
      const east = fineCellPosition(world, size - 0.5, v);
      const north = fineCellPosition(world, v, -0.5);
      const south = fineCellPosition(world, v, size - 0.5);
      grid.lineBetween(west.left, west.top + CHUNK_OFFSET_Y, east.left, east.top + CHUNK_OFFSET_Y);
      grid.lineBetween(north.left, north.top + CHUNK_OFFSET_Y, south.left, south.top + CHUNK_OFFSET_Y);
    }
  }

  drawTiles(world) {
    const path = pathSet();
    const player = playerCell();
    const preview = placementPreview();
    const sample = placementSample();
    const keys = collectRenderableCellKeys(world, path, player);
    // One graphics object batches every floor diamond for performance.
    const floor = this.add.graphics().setDepth(40);
    const placing = isPlacementMode();
    const lightStart = Math.floor(worldTileSize(world) * 0.7);
    const officeKeys = this.officeCellSet(world);

    [...keys]
      .map(key => key.split(',').map(Number))
      .sort(([ax, ay], [bx, by]) => (ax + ay) - (bx + by) || ay - by || ax - bx)
      .forEach(([x, y]) => {
        const key = coordKey(x, y);
        const isPath = path.has(key);
        const isStart = world.start.x === x && world.start.y === y;
        const isEnd = world.end.x === x && world.end.y === y;
        const lightSide = x >= lightStart;
        const previewCell = preview.cells?.some(cell => Number(cell.x) === x && Number(cell.y) === y);
        const department = departmentAt(x, y);
        const danger = blackholeDangerAt(x, y);
        const candidate = !isPath && !isEnd && !department && !danger && !officeKeys.has(key) && isAdjacentToPath(x, y);
        const center = tileCenter(world, x, y);
        const diamond = this.tileDiamond(center, 1);

        // Pick a flat-color isometric floor by tile role.
        let fill = null;
        let line = 0x000000;
        let lineAlpha = 0;
        if (isEnd) { fill = 0x2f6f6b; line = 0x8ff0e6; lineAlpha = 0.9; }
        else if (department) { fill = 0x33405c; line = 0x9fc0ec; lineAlpha = 0.8; }
        else if (danger) { fill = 0x5e2330; line = 0xe2616f; lineAlpha = 0.85; }
        else if (isPath || isStart) { fill = isStart ? 0x6a5a36 : 0x4a4330; line = 0xd8c98c; lineAlpha = 0.55; }
        else if (lightSide) { fill = 0x223a45; line = 0x4f8fa0; lineAlpha = 0.35; }

        if (previewCell) {
          fill = preview.valid ? sample?.fillColor ?? 0x2f6a3a : 0x6a2f2c;
          line = preview.valid ? sample?.lineColor ?? 0x7ccf83 : 0xe77764;
          lineAlpha = 0.95;
        }

        if (fill !== null) {
          floor.fillStyle(fill, 0.95);
          floor.fillPoints(diamond, true);
          floor.lineStyle(1, line, lineAlpha);
          floor.strokePoints(diamond, true);
        }

        // Buildable hints: a glowing green diamond on safe cells next to the path.
        if (candidate && !placing) {
          const hint = this.tileDiamond(center, 0.82);
          floor.fillStyle(0x7ccf83, 0.14);
          floor.fillPoints(hint, true);
          floor.lineStyle(1.4, 0x7ccf83, 0.7);
          floor.strokePoints(hint, true);
        }
      });
  }

  drawSamplePlacements(world) {
    for (const placement of game.samplePlacements) {
      const sample = FOOTPRINT_SAMPLES_BY_ID[placement.sampleId];
      if (!sample) continue;
      const graphics = this.add.graphics().setDepth(130);
      graphics.fillStyle(sample.fillColor, 0.08);
      graphics.lineStyle(1.2, sample.lineColor, 0.28);
      for (const cell of placement.cells || []) {
        const center = tileCenter(world, Number(cell.x), Number(cell.y));
        const diamond = this.tileDiamond(center, 0.88);
        graphics.fillPoints(diamond, true);
        graphics.strokePoints(diamond, true);
      }
      this.drawSamplePlacementTexture(world, sample, placement.cells, placement.rotation, 0.96, 132);
      const anchor = placement.anchorCell || placement.cells?.[0];
      if (!anchor) continue;
      const center = tileCenter(world, Number(anchor.x), Number(anchor.y));
      this.add.text(center.x, center.y - TILE_STEP_Y * 1.65, sample.label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        color: `#${sample.lineColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold'
      }).setOrigin(0.5, 1).setDepth(136);
    }
  }

  drawSamplePlacementTexture(world, sample, cells, rotation = 0, alpha = 1, depth = 132) {
    const spriteId = sampleSpriteIdForRotation(sample, rotation);
    if (!spriteId) return;
    const texKey = `furni_${spriteId}`;
    if (!this.textures.exists(texKey)) return;
    const anchor = placementSpriteAnchor(world, cells);
    if (!anchor) return;
    const src = this.textures.get(texKey).getSourceImage();
    const transform = furnitureSpriteTransform({
      spriteId,
      sourceImage: src,
      baseX: anchor.x,
      baseY: anchor.y,
      flipX: sample.flipX,
      offsetX: sample.offsetX,
      offsetY: sample.offsetY,
      lift: sample.lift,
      anchor: sample.anchor,
      depth: Math.max(depth, anchor.depth)
    });
    this.add.image(transform.x, transform.y, texKey)
      .setOrigin(0.5, transform.metrics.originY)
      .setDisplaySize(src.width * transform.metrics.scale, src.height * transform.metrics.scale)
      .setAlpha(alpha)
      .setFlipX(transform.flipX)
      .setDepth(transform.depth);
  }

  tileDiamond(center, scale = 1) {
    const hw = TILE_STEP_X * scale;
    const hh = TILE_STEP_Y * scale;
    return [
      new Phaser.Math.Vector2(center.x, center.y - hh),
      new Phaser.Math.Vector2(center.x + hw, center.y),
      new Phaser.Math.Vector2(center.x, center.y + hh),
      new Phaser.Math.Vector2(center.x - hw, center.y)
    ];
  }

  // Extruded isometric block (a "building") sitting on a tile.
  drawIsoPrism(center, height, topColor, leftColor, rightColor, depth) {
    const hw = TILE_STEP_X;
    const hh = TILE_STEP_Y;
    const g = this.add.graphics().setDepth(depth);
    const top = center.y - height;
    // Left face
    g.fillStyle(leftColor, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(center.x - hw, center.y),
      new Phaser.Math.Vector2(center.x, center.y + hh),
      new Phaser.Math.Vector2(center.x, center.y + hh - height),
      new Phaser.Math.Vector2(center.x - hw, top)
    ], true);
    // Right face
    g.fillStyle(rightColor, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(center.x + hw, center.y),
      new Phaser.Math.Vector2(center.x, center.y + hh),
      new Phaser.Math.Vector2(center.x, center.y + hh - height),
      new Phaser.Math.Vector2(center.x + hw, top)
    ], true);
    // Top diamond
    g.fillStyle(topColor, 1);
    g.lineStyle(1, 0xffffff, 0.18);
    const topDiamond = [
      new Phaser.Math.Vector2(center.x, top - hh),
      new Phaser.Math.Vector2(center.x + hw, top),
      new Phaser.Math.Vector2(center.x, top + hh),
      new Phaser.Math.Vector2(center.x - hw, top)
    ];
    g.fillPoints(topDiamond, true);
    g.strokePoints(topDiamond, true);
    return { top };
  }

  // Glowing portal/vortex rendered from concentric ellipses.
  drawGlowDisc(center, radii) {
    const g = this.add.graphics().setDepth(1000 + center.x + center.y);
    radii.forEach(({ rx, ry, color, alpha }) => {
      g.fillStyle(color, alpha);
      g.fillEllipse(center.x, center.y, rx * 2, ry * 2);
    });
    return g;
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
        const center = tileCenter(world, x, y);
        const depth = 1000 + x + y;

        if (blackhole) {
          this.drawGlowDisc(center, [
            { rx: 50, ry: 26, color: 0x6c3ff2, alpha: 0.18 },
            { rx: 36, ry: 19, color: 0x3a2a6e, alpha: 0.55 },
            { rx: 21, ry: 12, color: 0x100820, alpha: 0.95 },
            { rx: 9, ry: 5, color: 0x000000, alpha: 1 }
          ]);
        }

        if (isEnd) {
          const portalRoom = game.session?.departments?.portal_room?.built;
          // Goal marker: always-visible glowing nebula gate so players can orient.
          this.drawGlowDisc(center, [
            { rx: 58, ry: 30, color: 0x55c7b2, alpha: 0.16 },
            { rx: 44, ry: 23, color: 0x3aa0b8, alpha: 0.3 }
          ]);
          this.drawIsoPrism(
            center,
            portalRoom ? 44 : 32,
            portalRoom ? 0xe5bd57 : 0x6fe0d4,
            portalRoom ? 0x9b7e2c : 0x2f7f78,
            portalRoom ? 0xb8962f : 0x3a9b91,
            depth
          );
          this.add.text(center.x, center.y - 56, portalRoom ? 'PORTAL' : 'NEBULA', {
            fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#dffaf4', fontStyle: 'bold'
          }).setOrigin(0.5, 1).setDepth(depth + 5);
        }

        if (player.x === x && player.y === y && !game.session.finalResult) {
          this.add.image(center.x, center.y, 'player')
            .setOrigin(0.5, 1)
            .setDisplaySize(40, 40)
            .setDepth(1300 + x + y);
        }
      });
  }

  drawPlacementPreview(world) {
    if (!isPlacementMode() || !game.placement.previewAnchor) return;
    const preview = placementPreview();
    const sample = placementSample();
    const lineColor = preview.valid ? sample?.lineColor ?? 0x7ccf83 : 0xe77764;
    const fillColor = preview.valid ? sample?.fillColor ?? 0x7ccf83 : 0xe77764;
    const graphics = this.add.graphics().setDepth(1350);
    graphics.lineStyle(2, lineColor, 0.95);
    graphics.fillStyle(fillColor, preview.valid ? 0.2 : 0.16);
    preview.cells.forEach(cell => {
      const center = tileCenter(world, cell.x, cell.y);
      const diamond = this.tileDiamond(center, 0.9);
      graphics.fillPoints(diamond, true);
      graphics.strokePoints(diamond, true);
    });
    if (sample && game.placement.previewAnchor) {
      if (preview.valid) this.drawSamplePlacementTexture(world, sample, preview.cells, game.placement.rotation, 0.72, 1351);
      const anchor = tileCenter(world, game.placement.previewAnchor.x, game.placement.previewAnchor.y);
      this.add.text(anchor.x, anchor.y - TILE_STEP_Y * 1.7, sample.label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        color: `#${lineColor.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold'
      }).setOrigin(0.5, 1).setDepth(1352);
    }
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
    if (!cell) {
      this.game.canvas.style.cursor = '';
      return;
    }
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

    // Dynamic cursor based on cell type
    if (canAct()) {
      const info = cellInfo(cell.x, cell.y);
      if (isPlacementMode()) {
        const preview = placementPreview({ x: cell.x, y: cell.y });
        this.game.canvas.style.cursor = preview.valid ? 'copy' : 'not-allowed';
      } else if (info.blackhole || info.danger) {
        this.game.canvas.style.cursor = 'not-allowed';
      } else if (info.isPath || info.department) {
        this.game.canvas.style.cursor = 'grab';
      } else if (isAdjacentToPath(cell.x, cell.y)) {
        this.game.canvas.style.cursor = 'cell';
      } else {
        this.game.canvas.style.cursor = 'default';
      }
    } else {
      this.game.canvas.style.cursor = 'default';
    }

    if (isPlacementMode()) {
      game.placement.previewAnchor = cell;
      this.renderMap();
    }
  }

  async handleClick(pointer) {
    const cell = mapCellFromWorldPoint(worldState(), pointer.worldX, pointer.worldY);
    if (!cell || !canAct()) return;
    if (isPlacementMode()) {
      await placeActivePlacement(cell.x, cell.y);
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
    const bounds = fullscreenContentBounds();
    const cam = this.cameras.main;
    const usableWidth = Math.max(320, cam.width - (this.mode === 'fullscreen' ? 40 : 24));
    const usableHeight = Math.max(260, cam.height - (this.mode === 'fullscreen' ? 156 : 24));
    const fitZoom = Phaser.Math.Clamp(
      Math.min(usableWidth / bounds.width, usableHeight / bounds.height) * 0.92,
      MIN_MAP_ZOOM,
      MAX_MAP_ZOOM
    );
    cam.setZoom(fitZoom);
    cam.centerOn((bounds.minLeft + bounds.maxLeft) / 2, (bounds.minTop + bounds.maxTop) / 2 + 16);
    if (this.mode === 'fullscreen') {
      game.fullscreen.zoom = fitZoom;
      this.updateZoomLabel();
    }
  }

  centerOnContent() {
    const bounds = fullscreenContentBounds();
    this.cameras.main.centerOn((bounds.minLeft + bounds.maxLeft) / 2, (bounds.minTop + bounds.maxTop) / 2 + 16);
  }

  centerOnPlayer() {
    const cell = playerCell();
    const c = tileCenter(worldState(), cell.x, cell.y);
    this.cameras.main.centerOn(c.x, c.y);
  }

  setZoomFromUi(nextZoom) {
    const cam = this.cameras.main;
    // Zoom about the current view center instead of the world origin so the
    // content the player is looking at stays put.
    const cx = cam.midPoint.x;
    const cy = cam.midPoint.y;
    cam.setZoom(clampZoom(nextZoom));
    cam.centerOn(cx, cy);
    if (this.mode === 'fullscreen') {
      game.fullscreen.zoom = cam.zoom;
      this.updateZoomLabel();
    }
  }
}

// Persistent parent node for the Phaser canvas. Keeping a single host element
// alive across full re-renders lets us move the live WebGL context to the new
// placeholder instead of destroying and recreating it on every state change.
let mapHost = null;

function ensureMapHost() {
  if (!mapHost) {
    mapHost = document.createElement('div');
    mapHost.className = 'phaser-host';
  }
  return mapHost;
}

function destroyPhaserMap() {
  if (!activeOfficeMap) return;
  activeOfficeMap.game?.destroy(true);
  activeOfficeMap = null;
}

function mountPhaserMap() {
  const placeholder = document.querySelector('[data-phaser-map]');
  if (!placeholder) {
    // No map on this screen (start/report). Park the host off-DOM; keep the
    // game alive so returning to the board is instant.
    if (mapHost?.parentNode) mapHost.parentNode.removeChild(mapHost);
    return;
  }

  const mode = placeholder.dataset.mapMode || 'dashboard';
  const host = ensureMapHost();
  if (host.parentNode !== placeholder) placeholder.appendChild(host);

  // Reuse the existing game when the mode is unchanged: just resize to the new
  // container and redraw the scene, preserving camera zoom/pan.
  if (activeOfficeMap?.game && activeOfficeMap.mode === mode) {
    activeOfficeMap.game.scale.refresh();
    activeOfficeMap.scene?.renderMap();
    return;
  }

  // First mount, or the map mode changed (dashboard <-> fullscreen): recreate.
  destroyPhaserMap();
  const rect = host.getBoundingClientRect();
  activeOfficeMap = { game: null, element: host, mode, scene: null };
  const phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    width: Math.max(320, Math.floor(rect.width || host.clientWidth || 800)),
    height: Math.max(260, Math.floor(rect.height || host.clientHeight || 520)),
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
  // Detach BOTH live map hosts before wiping the DOM so canvas/WebGL contexts
  // survive the innerHTML replace, then re-attach the appropriate one.
  if (mapHost?.parentNode) mapHost.parentNode.removeChild(mapHost);
  if (builderMapHost?.parentNode) builderMapHost.parentNode.removeChild(builderMapHost);
  appEl.innerHTML = html;
  requestAnimationFrame(() => {
    if (isBuilderRoute()) {
      mountBuilderMap();
    } else {
      if (activeBuilderMap) destroyBuilderMap();
      mountPhaserMap();
    }
  });
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
  document.body.classList.toggle('builder-active', isBuilderRoute());

  if (game.screen === 'loading') {
    commitRender('<main class="loading-view">Loading Void Office Tycoon...</main>');
    return;
  }

  if (isBuilderRoute()) {
    commitRender(renderBuilder());
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

  if (game.showTutorial) {
    commitRender(renderDashboard() + renderTutorial());
    return;
  }

  commitRender(renderDashboard());
}

function renderTutorial() {
  return `
    <div class="tutorial-overlay">
      <div class="tutorial-card">
        <div class="tutorial-header">
          <span class="tutorial-badge">HOW TO PLAY</span>
          <h2>Void Office Tycoon</h2>
          <p class="tutorial-subtitle">Build your IT office, escape the void!</p>
        </div>
        <div class="tutorial-steps">
          <div class="tutorial-step">
            <div class="tutorial-step-icon">🎮</div>
            <div class="tutorial-step-content">
              <h3>Step 1 — Play Minigames</h3>
              <p>Play <strong>Scope Fog</strong>, <strong>Bug Rain</strong>, <strong>Budget Rift</strong>, <strong>Risk Vault</strong>, and <strong>Stakeholder Booth</strong> to earn points. Each minigame can be played up to <strong>2 times</strong>.</p>
            </div>
          </div>
          <div class="tutorial-step">
            <div class="tutorial-step-icon">🛤️</div>
            <div class="tutorial-step-content">
              <h3>Step 2 — Build Paths</h3>
              <p>Click on the <strong>glowing green cells</strong> next to your path to extend your office corridor. Each tile costs <strong>1 point</strong>. Start from position (1,16).</p>
            </div>
          </div>
          <div class="tutorial-step">
            <div class="tutorial-step-icon">🏢</div>
            <div class="tutorial-step-content">
              <h3>Step 3 — Build Office Wings</h3>
              <p>Buy <strong>Budget</strong>, <strong>Team</strong> and <strong>Quality</strong> offices. Each has its own shape — <strong>rotate</strong> it, then place it next to your office, corridor, or a map border. Buy as many as you like to expand.</p>
            </div>
          </div>
          <div class="tutorial-step">
            <div class="tutorial-step-icon">⚖️</div>
            <div class="tutorial-step-content">
              <h3>Step 4 — Balance Resources</h3>
              <p>Keep <strong>Budget</strong>, <strong>Team</strong>, and <strong>Quality</strong> above 0. If any reaches 0, the office collapses!</p>
            </div>
          </div>
          <div class="tutorial-step">
            <div class="tutorial-step-icon">🌀</div>
            <div class="tutorial-step-content">
              <h3>Step 5 — Escape the Void</h3>
              <p>Build at least one of each office type, connect the corridor to the <strong>nebula light</strong>, and open the <strong>Portal Room</strong> to win!</p>
            </div>
          </div>
        </div>
        <div class="tutorial-warnings">
          <div class="tutorial-warning">⚠️ Avoid <strong>blackholes</strong> — they destroy your path!</div>
          <div class="tutorial-warning">💡 Use the <strong>cell cursor</strong> to find buildable tiles on the map</div>
        </div>
        <button class="tutorial-start-btn" data-action="dismiss-tutorial">
          Got it, let's build! 🚀
        </button>
      </div>
    </div>
  `;
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
          <p class="eyebrow">${escapeHtml(state.courseCode || 'COM0463')} <span class="timer-separator">•</span> Time: <span id="live-timer">${formatPlayTime(currentPlayTimeMs())}</span></p>
          <h1>${escapeHtml(state.projectTitle || 'Void Office Tycoon')}</h1>
        </div>
        <div class="topbar-actions">
          ${game.voidOfficeDebugEnabled ? '<button class="secondary-button" data-action="open-builder">Builder</button>' : ''}
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
      ${session.finalResult ? `<div class="alert final">${escapeHtml(session.finalResult.reason)}${session.finalResult.escaped ? ` <strong>Final Score: ${session.finalScore ?? session.points}</strong>` : ' <strong>Score: 0</strong>'}</div>` : ''}

      <section class="resource-strip">
        ${Object.entries(session.resources).map(([key, value]) => renderResource(key, value)).join('')}
        <div class="points-box">
          <span><img class="ui-icon" src="${POINTS_ICON}" alt="" />Main Points</span>
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
  const icon = RESOURCE_ICONS[key];
  return `
    <div class="resource ${status}">
      <div class="resource-line">
        <span>${icon ? `<img class="ui-icon" src="${icon}" alt="" />` : ''}${resourceLabel(key)}</span>
        <strong>${value}</strong>
      </div>
      <div class="meter"><span style="width: ${value}%"></span></div>
    </div>
  `;
}

function builtBuildings() {
  return sortedDepartments().filter(d => d.built && d.typeId !== 'portal_room');
}

// How many of the 3 resource building types have at least one instance built.
function builtTypeCount() {
  const types = new Set(builtBuildings().map(d => d.typeId));
  return BUILDING_TYPES.filter(t => types.has(t.id)).length;
}

function renderWorldTuningPanel() {
  if (!isVoidOfficeDebugEnabled()) return '';
  return `
    <div class="world-tuning">
      <div class="world-tuning-group">
        <div class="world-tuning-heading">
          <strong>Furniture Scale</strong>
          <span data-furniture-scale-readout>${furnitureScaleLabel()}</span>
        </div>
        <input
          id="furniture-scale-slider"
          type="range"
          min="${MIN_FURNITURE_SCALE_MULTIPLIER}"
          max="${MAX_FURNITURE_SCALE_MULTIPLIER}"
          step="${FURNITURE_SCALE_STEP}"
          value="${clampFurnitureScaleMultiplier(game.furnitureScaleMultiplier)}"
          data-input-action="set-furniture-scale"
        />
        <div class="world-tuning-meta">
          <span>${MIN_FURNITURE_SCALE_MULTIPLIER.toFixed(2)}x</span>
          <strong data-furniture-scale-percent>${Math.round(clampFurnitureScaleMultiplier(game.furnitureScaleMultiplier) * 100)}%</strong>
          <span>${MAX_FURNITURE_SCALE_MULTIPLIER.toFixed(2)}x</span>
        </div>
      </div>
      <div class="world-tuning-group">
        <div class="world-tuning-heading">
          <strong>Furniture Offset X</strong>
          <span data-furniture-offset-x-readout>${furnitureOffsetAxisLabel('x')}</span>
        </div>
        <input
          id="furniture-offset-x-slider"
          type="range"
          min="${MIN_FURNITURE_OFFSET_AXIS}"
          max="${MAX_FURNITURE_OFFSET_AXIS}"
          step="${FURNITURE_OFFSET_STEP}"
          value="${clampFurnitureOffsetAxis(game.furnitureOffsetAxes.x)}"
          data-input-action="set-furniture-offset-x"
        />
        <div class="world-tuning-meta">
          <span>${MIN_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
          <strong data-furniture-offset-x-center>${furnitureOffsetAxisLabel('x')}</strong>
          <span>${MAX_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
        </div>
      </div>
      <div class="world-tuning-group">
        <div class="world-tuning-heading">
          <strong>Furniture Offset Y</strong>
          <span data-furniture-offset-y-readout>${furnitureOffsetAxisLabel('y')}</span>
        </div>
        <input
          id="furniture-offset-y-slider"
          type="range"
          min="${MIN_FURNITURE_OFFSET_AXIS}"
          max="${MAX_FURNITURE_OFFSET_AXIS}"
          step="${FURNITURE_OFFSET_STEP}"
          value="${clampFurnitureOffsetAxis(game.furnitureOffsetAxes.y)}"
          data-input-action="set-furniture-offset-y"
        />
        <div class="world-tuning-meta">
          <span>${MIN_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
          <strong data-furniture-offset-y-center>${furnitureOffsetAxisLabel('y')}</strong>
          <span>${MAX_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
        </div>
      </div>
      <div class="world-tuning-group">
        <div class="world-tuning-heading">
          <strong>Furniture Offset Z</strong>
          <span data-furniture-offset-z-readout>${furnitureOffsetAxisLabel('z')}</span>
        </div>
        <input
          id="furniture-offset-z-slider"
          type="range"
          min="${MIN_FURNITURE_OFFSET_AXIS}"
          max="${MAX_FURNITURE_OFFSET_AXIS}"
          step="${FURNITURE_OFFSET_STEP}"
          value="${clampFurnitureOffsetAxis(game.furnitureOffsetAxes.z)}"
          data-input-action="set-furniture-offset-z"
        />
        <div class="world-tuning-meta">
          <span>${MIN_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
          <strong data-furniture-offset-z-center>${furnitureOffsetAxisLabel('z')}</strong>
          <span>${MAX_FURNITURE_OFFSET_AXIS.toFixed(2)}</span>
        </div>
      </div>
      <div class="world-tuning-group">
        <div class="world-tuning-heading">
          <strong>Footprint Samples</strong>
          <span>${game.samplePlacements.length} placed</span>
        </div>
        <div class="texture-sample-strip">
          ${FOOTPRINT_SAMPLES.map(sample => `
            <figure class="texture-sample-card ${game.placement.kind === 'sample' && game.placement.sampleId === sample.id ? 'selected' : ''}">
              <img src="${sample.image}" alt="${sample.label} footprint sample texture" />
              <figcaption>
                <strong>${sample.label}</strong>
                <span>${sample.detail}</span>
              </figcaption>
              <button
                class="secondary-button"
                data-action="start-sample-placement"
                data-sample-id="${sample.id}"
                ${!game.session || !canAct() ? 'disabled' : ''}
              >${game.placement.kind === 'sample' && game.placement.sampleId === sample.id ? 'Placing...' : 'Place sample'}</button>
            </figure>
          `).join('')}
        </div>
        <div class="button-row">
          <button
            class="secondary-button"
            data-action="clear-sample-placements"
            ${!game.samplePlacements.length ? 'disabled' : ''}
          >Clear Samples</button>
        </div>
        <p class="world-tuning-note">Sample cards now render through the same furni scale and X/Y/Z offset slider path as room props, while corner-tagged props still bias toward room edges instead of sitting dead-center in their cells.</p>
      </div>
    </div>
  `;
}

function renderWorldPanel() {
  const world = worldState();
  const tileSize = worldTileSize(world);
  const subcellCount = subcellsPerCell(world);
  return `
    <div class="panel-heading">
      <div>
        <h2>Isometric Void Office</h2>
        <span>${builtTypeCount()} / 3 office types · ${builtBuildings().length} buildings</span>
      </div>
      <span>${lightProgress()}% to nebula</span>
    </div>
    <div class="world-status">
      <div><strong>${tileSize}x${tileSize}</strong><span>normal cells</span></div>
      <div><strong>${subcellCount}x${subcellCount}</strong><span>subcells per cell</span></div>
      <div><strong>${(world.builtPath || []).length}</strong><span>path cells</span></div>
      <div><strong>${world.blackholes.length}</strong><span>blackholes</span></div>
    </div>
    ${renderWorldTuningPanel()}
    ${renderPlacementBanner()}
    <div class="phaser-map-shell dashboard-phaser-map" aria-label="Interactive ${tileSize} by ${tileSize} office map">
      <div class="phaser-map" data-phaser-map data-map-mode="dashboard"></div>
    </div>
    <div class="world-legend">
      <span><i class="legend-chip path"></i>built path</span>
      <span><i class="legend-chip buildable"></i>buildable here</span>
      <span><i class="legend-chip danger"></i>blackhole danger</span>
      <span><i class="legend-chip nebula"></i>nebula gate</span>
      <span><img src="${sprites.player}" alt="" /> player marker</span>
    </div>
  `;
}

function renderPlacementBanner() {
  const department = placementModeDepartment();
  const sample = placementSample();
  if (!department && !sample) return '';
  const preview = placementPreview();
  const rooms = placementChunkCount();
  const title = sample
    ? `Placing ${sample.label} Footprint Sample - ${rooms} cells ${escapeHtml(sample.shapeLabel || '')} (0 pts)`
    : `Placing ${escapeHtml(department.name)} - ${rooms}-room ${escapeHtml(department.shapeLabel || '')} (${placementCost()} pts)`;
  const help = sample
    ? `${preview.reason || 'Stamp anywhere safe on the grid to compare footprint size'} · Rotation ${game.placement.rotation}°`
    : `${preview.reason || 'Choose a spot next to your office, corridor or a map border'} · Rotation ${game.placement.rotation}°`;
  return `
    <div class="placement-banner ${preview.valid ? 'valid' : 'invalid'}">
      <div>
        <strong>${title}</strong>
        <span>${help}</span>
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
  const preview = placementPreview();

  for (const key of path) {
    const [x, y] = key.split(',').map(Number);
    addRenderableCell(keys, world, x, y);
    addRenderableCell(keys, world, x + 1, y);
    addRenderableCell(keys, world, x - 1, y);
    addRenderableCell(keys, world, x, y + 1);
    addRenderableCell(keys, world, x, y - 1);
  }

  // Office floors (spawn + departments) and the buildable ring around them.
  for (const key of officeCellKeys()) {
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

  for (const placement of game.samplePlacements) {
    for (const cell of placement.cells || []) {
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
    : `data-action="build-world-cell" data-x="${x}" data-y="${y}" ${!canAct() || (!isPlacementMode() && isPath) ? 'disabled' : ''}`;

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
  if (department) return sprites[department.typeId] || sprites.officeCore;
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
      <button data-action="submit-minigame" data-minigame-id="scope_fog" ${!canAct() || minigamePlaysRemaining('scope_fog') <= 0 ? 'disabled' : ''}>Submit Backlog</button>
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
  const remaining = minigamePlaysRemaining(active.id);
  const exhausted = remaining <= 0;
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Minigames</h2>
        <span>${escapeHtml(active.title)} — ${remaining > 0 ? `${remaining} play${remaining > 1 ? 's' : ''} left` : 'Completed ✓'}</span>
      </div>
      <div class="minigame-tabs">
        ${minigames.map(item => {
          const rem = minigamePlaysRemaining(item.id);
          return `
          <button class="${game.activeMinigame === item.id ? 'selected' : ''} ${rem <= 0 ? 'minigame-completed' : ''}" data-action="select-minigame" data-minigame-id="${item.id}">
            ${escapeHtml(item.title)}
            <small class="minigame-plays-badge">${rem > 0 ? `${rem}` : '✓'}</small>
          </button>
        `;
        }).join('')}
      </div>
      ${exhausted ? '<div class="minigame-exhausted">This minigame has been completed. Try another one or build your office!</div>' : renderMinigame(active)}
      ${game.lastResult ? `
        <div class="result-box compact">
          <strong>${escapeHtml(game.lastResult.title)}: ${game.lastResult.success ? 'success' : 'failed'}</strong>
          <p>${game.lastResult.pointsEarned} points. ${formatDelta(game.lastResult.resourceChange)}</p>
        </div>
      ` : ''}
      ${allMinigamesExhausted() ? '<div class="minigame-exhausted all-done">All minigames completed! Focus on building paths and departments.</div>' : ''}
    </section>
  `;
}

function renderMinigame(scenario) {
  if (scenario.id === 'scope_fog') {
    return '<p class="game-copy">Use the backlog panel, then submit the current order.</p>';
  }
  if (scenario.id === 'bug_rain') return renderBugRain();
  if (scenario.id === 'budget_rift') return renderBudgetRift();
  if (scenario.id === 'risk_vault') return renderRiskVault();
  return renderStakeholderBooth();
}

function renderBugRain() {
  const selected = new Set(game.minigameState.selected || []);
  return `
    <div class="bug-grid">
      ${bugCards.map(card => `
        <button
          class="bug-card sev-${card.severity} ${selected.has(card.id) ? 'selected' : ''} ${game.debugOpen && game.showCorrectAnswers && card.severity === 'serious' ? 'correct' : ''}"
          data-action="toggle-bug"
          data-bug-id="${card.id}"
          ${!canAct() ? 'disabled' : ''}
        >
          <span class="severity-tag sev-${card.severity}">${card.severity === 'serious' ? '🔴 Serious' : '🟡 Minor'}</span>
          <strong>${escapeHtml(card.title)}</strong>
          <span class="bug-state">${selected.has(card.id) ? '✓ Marked to block' : 'Tap to triage'}</span>
          ${game.debugOpen && game.showCorrectAnswers ? `<em>${card.severity === 'serious' ? 'Correct: block release' : 'Correct: minor'}</em>` : ''}
        </button>
      `).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="bug_rain" ${!canAct() || minigamePlaysRemaining('bug_rain') <= 0 ? 'disabled' : ''}>Submit Triage</button>
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
            ${renderDeltaChips(choice.delta)}
            ${game.debugOpen && game.showCorrectAnswers ? `<em>${passes ? 'Passes' : 'Fails'} after choice: ${formatProjected(projected)}</em>` : ''}
          </button>
        `;
      }).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="budget_rift" ${!canAct() || minigamePlaysRemaining('budget_rift') <= 0 ? 'disabled' : ''}>Commit Trade-off</button>
  `;
}

function renderRiskVault() {
  const selected = new Set(game.minigameState.selected || []);
  return `
    <div class="bug-grid">
      ${riskCards.map(card => `
        <button
          class="bug-card sev-${card.severity} ${selected.has(card.id) ? 'selected' : ''} ${game.debugOpen && game.showCorrectAnswers && card.severity === 'serious' ? 'correct' : ''}"
          data-action="toggle-risk"
          data-risk-id="${card.id}"
          ${!canAct() ? 'disabled' : ''}
        >
          <span class="severity-tag sev-${card.severity}">${card.severity === 'serious' ? 'Mitigate now' : 'Monitor'}</span>
          <strong>${escapeHtml(card.title)}</strong>
          <span class="bug-state">${selected.has(card.id) ? '✓ Added to register' : 'Tap to evaluate'}</span>
          <em>${escapeHtml(card.note)}</em>
        </button>
      `).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="risk_vault" ${!canAct() || minigamePlaysRemaining('risk_vault') <= 0 ? 'disabled' : ''}>Lock Risk Register</button>
  `;
}

function renderStakeholderBooth() {
  const choiceId = game.minigameState.choiceId;
  return `
    <div class="choice-list">
      ${stakeholderChoices.map(choice => `
        <button
          class="choice-card ${choiceId === choice.id ? 'selected' : ''} ${game.debugOpen && game.showCorrectAnswers && choice.id === 'reply_with_decision' ? 'correct' : ''}"
          data-action="stakeholder-choice"
          data-choice-id="${choice.id}"
          ${!canAct() ? 'disabled' : ''}
        >
          <strong>${escapeHtml(choice.title)}</strong>
          <span>${escapeHtml(choice.text)}</span>
          <em>${escapeHtml(choice.note)}</em>
        </button>
      `).join('')}
    </div>
    <button data-action="submit-minigame" data-minigame-id="stakeholder_booth" ${!canAct() || minigamePlaysRemaining('stakeholder_booth') <= 0 ? 'disabled' : ''}>Send Update</button>
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

function builtCountForType(typeId) {
  return sortedDepartments().filter(d => d.built && d.typeId === typeId).length;
}

function renderShopPanel() {
  return `
    <section class="sandbox-panel">
      <div class="panel-heading">
        <h2>Department Shop</h2>
        <span>${game.session.points} points</span>
      </div>
      <div class="shop-list">
        ${BUILDING_TYPES.map(type => {
          const placing = game.placement.departmentId === type.id;
          const owned = builtCountForType(type.id);
          const rooms = type.shape.length;
          const label = placing ? 'Placing...' : `Place (${type.cost})`;
          return `
            <article class="shop-item ${placing ? 'selected' : ''} shop-${type.id}">
              <div>
                <h3>${escapeHtml(type.name)}${owned ? ` ×${owned}` : ''}</h3>
                <p>${escapeHtml(type.meaning)}</p>
                ${renderDeltaChips(type.resourceEffect)}
                <em>${escapeHtml(type.shapeLabel)} · ${rooms} rooms · rotatable</em>
              </div>
              <button
                data-action="start-placement"
                data-department-id="${type.id}"
                ${!canAct() || game.session.points < type.cost ? 'disabled' : ''}
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
          <label>Scenario <input id="debug-scenario" type="number" min="0" max="${Math.max(0, minigames.length - 1)}" value="${game.session.currentScenarioIndex}" /></label>
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

// --- Builder: Furniture palette keys (real furni only, no samples) ---
const BUILDER_FURNI_PALETTE = [
  'desk', 'woodDesk', 'monitor', 'imac', 'laptop',
  'officeChair', 'officeChairBack', 'chair',
  'table', 'coffeeTable',
  'plant', 'plantTall', 'lamp', 'shelf', 'books',
  'sofa', 'rug'
];

const BUILDER_ANCHOR_OPTIONS = ['', 'north', 'south', 'east', 'west', 'nw', 'ne', 'sw', 'se'];

function renderBuilder() {
  const b = game.builder;
  const selectedFurni = b.selectedFurnitureIdx >= 0 ? b.furniture[b.selectedFurnitureIdx] : null;

  return `
    <main class="builder-screen">
      <header class="builder-toolbar">
        <div class="builder-toolbar-left">
          <button class="secondary-button" data-action="builder-back">← Dashboard</button>
          <div>
            <p class="eyebrow">Builder</p>
            <h1>Office Structure Builder</h1>
          </div>
        </div>
        <div class="builder-toolbar-right">
          <button class="secondary-button" data-action="builder-export">Export JSON</button>
          <button class="secondary-button" data-action="builder-import">Import JSON</button>
        </div>
      </header>

      <section class="builder-layout">
        <aside class="builder-left-panel">
          <div class="builder-section">
            <h3>Office Type</h3>
            <div class="builder-type-cards">
              ${BUILDING_TYPES.map(type => `
                <button
                  class="builder-type-card ${b.selectedTypeId === type.id ? 'active' : ''}"
                  data-action="builder-select-type"
                  data-type-id="${type.id}"
                >
                  <strong>${escapeHtml(type.name)}</strong>
                  <span class="builder-type-shape">${escapeHtml(type.shapeLabel)}</span>
                  <span class="builder-type-meta">${escapeHtml(type.meaning)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="builder-section">
            <h3>Rotation</h3>
            <div class="builder-rotation-buttons">
              ${[0, 90, 180, 270].map(deg => `
                <button
                  class="${b.rotation === deg ? 'active' : ''} secondary-button"
                  data-action="builder-set-rotation"
                  data-rotation="${deg}"
                >${deg}°</button>
              `).join('')}
            </div>
          </div>

          <div class="builder-section">
            <h3>Mode</h3>
            <div class="builder-mode-toggle">
              <button class="${b.mode === 'place' ? 'active' : ''} secondary-button" data-action="builder-set-mode" data-mode="place">Place</button>
              <button class="${b.mode === 'select' ? 'active' : ''} secondary-button" data-action="builder-set-mode" data-mode="select">Select</button>
            </div>
          </div>

          ${b.mode === 'place' ? `
            <div class="builder-section">
              <h3>Furniture Palette</h3>
              <div class="builder-palette">
                ${BUILDER_FURNI_PALETTE.map(spriteId => `
                  <button
                    class="builder-palette-item ${b.selectedSpriteId === spriteId ? 'active' : ''}"
                    data-action="builder-select-sprite"
                    data-sprite-id="${spriteId}"
                    title="${spriteId}"
                  >
                    <img src="${FURNI[spriteId]}" alt="${spriteId}" />
                    <span>${spriteId}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="builder-section">
            <button data-action="builder-auto-fill">Auto-fill Preset</button>
            <button class="danger-button" data-action="builder-clear-furniture" style="margin-top:8px">Clear All Furniture</button>
          </div>
        </aside>

        <div class="builder-canvas-panel">
          <div class="phaser-map-shell builder-phaser-map" data-phaser-map data-map-mode="builder"></div>
        </div>

        <aside class="builder-right-panel">
          ${selectedFurni ? `
            <div class="builder-section">
              <h3>Inspector</h3>
              <div class="builder-inspector">
                <div class="builder-inspector-row">
                  <label>Sprite</label>
                  <strong>${escapeHtml(selectedFurni.spriteId)}</strong>
                </div>
                <div class="builder-inspector-row">
                  <label>Cell</label>
                  <span>${selectedFurni.cell.x}, ${selectedFurni.cell.y}</span>
                </div>
                <div class="builder-inspector-row">
                  <label>offsetX</label>
                  <input type="range" min="-0.5" max="0.5" step="0.05" value="${selectedFurni.offsetX}"
                    data-input-action="builder-set-offset-x" />
                  <span class="builder-readout">${selectedFurni.offsetX.toFixed(2)}</span>
                </div>
                <div class="builder-inspector-row">
                  <label>offsetY</label>
                  <input type="range" min="-0.5" max="0.5" step="0.05" value="${selectedFurni.offsetY}"
                    data-input-action="builder-set-offset-y" />
                  <span class="builder-readout">${selectedFurni.offsetY.toFixed(2)}</span>
                </div>
                <div class="builder-inspector-row">
                  <label>lift</label>
                  <input type="range" min="0" max="3" step="0.05" value="${selectedFurni.lift}"
                    data-input-action="builder-set-lift" />
                  <span class="builder-readout">${selectedFurni.lift.toFixed(2)}</span>
                </div>
                <div class="builder-inspector-row">
                  <label>anchor</label>
                  <select data-input-action="builder-set-anchor">
                    ${BUILDER_ANCHOR_OPTIONS.map(a => `
                      <option value="${a}" ${selectedFurni.anchor === a ? 'selected' : ''}>${a || '(none)'}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="builder-inspector-row">
                  <label>flipX</label>
                  <input type="checkbox" ${selectedFurni.flipX ? 'checked' : ''}
                    data-input-action="builder-set-flip" />
                </div>
                <button class="danger-button" data-action="builder-delete-furniture" style="margin-top:12px">Delete</button>
              </div>
            </div>
          ` : `
            <div class="builder-section">
              <h3>Inspector</h3>
              <p class="builder-hint">${b.mode === 'select' ? 'Click a furniture item on the canvas to select it.' : 'Click a cell on the canvas to place furniture.'}</p>
              <p class="builder-hint builder-count">Furniture: ${b.furniture.length} items</p>
            </div>
          `}
        </aside>
      </section>

      ${b.exportText ? `
        <section class="builder-export-panel">
          <h3>Export / Import</h3>
          <textarea id="builder-export-text" rows="8" readonly>${escapeHtml(b.exportText)}</textarea>
          <div class="builder-export-actions">
            <button class="secondary-button" data-action="builder-copy-export">Copy</button>
            <button class="secondary-button" data-action="builder-close-export">Close</button>
          </div>
        </section>
      ` : ''}
    </main>
  `;
}

// --- Builder Phaser Scene ---

let activeBuilderMap = null;
let builderMapHost = null;

function ensureBuilderMapHost() {
  if (!builderMapHost) {
    builderMapHost = document.createElement('div');
    builderMapHost.className = 'phaser-host';
  }
  return builderMapHost;
}

function destroyBuilderMap() {
  if (!activeBuilderMap) return;
  activeBuilderMap.game?.destroy(true);
  activeBuilderMap = null;
}

function builderWorld() {
  // A minimal "world" object for the builder's coordinate math.
  // Size 24 gives plenty of room for the largest shape (team L = 4 rooms).
  return {
    size: 24,
    subcellsPerCell: SUBCELLS_PER_CELL,
    start: { x: 0, y: 0 },
    end: { x: 23, y: 23 },
    builtPath: [],
    blackholes: [],
    spawnOffice: null,
    connectedToLight: false
  };
}

class BuilderScene extends Phaser.Scene {
  constructor() {
    super('BuilderScene');
    this.dragStart = null;
    this.didDrag = false;
  }

  preload() {
    Object.entries(sprites).forEach(([key, url]) => {
      this.load.image(key, url);
    });
    Object.entries(FURNI).forEach(([key, url]) => {
      this.load.image(`furni_${key}`, url);
    });
  }

  create() {
    if (activeBuilderMap) activeBuilderMap.scene = this;
    this.cameras.main.setBackgroundColor('#02030a');
    this.renderMap();
    this.setupCamera();
    this.setupInput();
  }

  renderMap() {
    this.children.removeAll(true);
    const world = builderWorld();
    const b = game.builder;
    const anchor = { x: 2, y: 2 };
    const rotation = normalizeRotation(b.rotation);
    const cells = builderOccupiedCells(b.selectedTypeId, anchor, rotation);
    const type = BUILDING_TYPES_BY_ID[b.selectedTypeId];
    const theme = DEPARTMENT_THEME[b.selectedTypeId] || DEPARTMENT_THEME.default;
    const dims = boardDimensions(world);

    this.cameras.main.setBounds(0, 0, dims.width, dims.height);

    // Background
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x02030a, 0x0a1020, 0x111827, 0x2b3150, 1);
    bg.fillRect(0, 0, dims.width, dims.height);

    // Draw office floor
    const floor = this.add.graphics().setDepth(120);
    const cellKeys = new Set(cells.map(c => coordKey(c.x, c.y)));

    cells.forEach(cell => {
      const center = tileCenter(world, cell.x, cell.y);
      const diamond = this.tileDiamond(center, 1);
      floor.fillStyle(theme.floor ?? 0x4a4f63, 0.96);
      floor.fillPoints(diamond, true);
      floor.lineStyle(1, theme.top ?? 0x9fc0ec, 0.35);
      floor.strokePoints(diamond, true);
    });

    // Draw walls
    const walls = this.add.graphics().setDepth(500);
    cells.forEach(cell => {
      const c = tileCenter(world, cell.x, cell.y);
      const H = Math.round(TILE_STEP_Y * 2.4);
      if (!cellKeys.has(coordKey(cell.x, cell.y - 1))) {
        walls.fillStyle(0x5a6b86, 0.96);
        walls.fillPoints([
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y),
          new Phaser.Math.Vector2(c.x + TILE_STEP_X, c.y),
          new Phaser.Math.Vector2(c.x + TILE_STEP_X, c.y - H),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y - H)
        ], true);
      }
      if (!cellKeys.has(coordKey(cell.x - 1, cell.y))) {
        walls.fillStyle(0x44546b, 0.96);
        walls.fillPoints([
          new Phaser.Math.Vector2(c.x - TILE_STEP_X, c.y),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y),
          new Phaser.Math.Vector2(c.x, c.y - TILE_STEP_Y - H),
          new Phaser.Math.Vector2(c.x - TILE_STEP_X, c.y - H)
        ], true);
      }
    });

    // Label
    if (cells.length > 0) {
      const labelCell = cells[0];
      const lc = tileCenter(world, labelCell.x, labelCell.y);
      this.add.text(lc.x, lc.y - (Math.round(TILE_STEP_Y * 2.4) + 14), theme.label || type?.name || '', {
        fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#f4efe2', fontStyle: 'bold'
      }).setOrigin(0.5, 1).setDepth(1600);
    }

    // Draw furniture
    const selectedIdx = b.selectedFurnitureIdx;
    (b.furniture || []).forEach((item, idx) => {
      const texKey = `furni_${item.spriteId}`;
      if (!this.textures.exists(texKey)) return;
      const cx = Number(item.cell?.x);
      const cy = Number(item.cell?.y);
      const center = tileCenter(world, cx, cy);
      const src = this.textures.get(texKey).getSourceImage();
      const transform = furnitureSpriteTransform({
        spriteId: item.spriteId,
        sourceImage: src,
        baseX: center.x,
        baseY: center.y,
        flipX: item.flipX,
        offsetX: item.offsetX,
        offsetY: item.offsetY,
        lift: item.lift,
        anchor: item.anchor,
        depth: 1000 + (cx + cy) * 4
      });
      const sprite = this.add.image(transform.x, transform.y, texKey)
        .setOrigin(0.5, transform.metrics.originY)
        .setDisplaySize(src.width * transform.metrics.scale, src.height * transform.metrics.scale)
        .setFlipX(transform.flipX)
        .setDepth(transform.depth);

      // Highlight selected
      if (idx === selectedIdx) {
        sprite.setTint(0x88ccff);
        // Draw selection outline on the cell
        const selGfx = this.add.graphics().setDepth(transform.depth - 1);
        const selDiamond = this.tileDiamond(center, 0.9);
        selGfx.lineStyle(2, 0x88ccff, 0.8);
        selGfx.strokePoints(selDiamond, true);
      }
    });
  }

  setupCamera() {
    const world = builderWorld();
    const b = game.builder;
    const anchor = { x: 2, y: 2 };
    const rotation = normalizeRotation(b.rotation);
    const cells = builderOccupiedCells(b.selectedTypeId, anchor, rotation);

    if (cells.length === 0) return;

    let minLeft = Infinity, maxLeft = -Infinity, minTop = Infinity, maxTop = -Infinity;
    cells.forEach(cell => {
      const pos = isoCellPosition(world, cell.x, cell.y);
      minLeft = Math.min(minLeft, pos.left - 60);
      maxLeft = Math.max(maxLeft, pos.left + 60);
      minTop = Math.min(minTop, pos.top - 100);
      maxTop = Math.max(maxTop, pos.top + 80);
    });

    const cam = this.cameras.main;
    const usableWidth = Math.max(320, cam.width - 40);
    const usableHeight = Math.max(260, cam.height - 40);
    const contentWidth = Math.max(1, maxLeft - minLeft);
    const contentHeight = Math.max(1, maxTop - minTop);
    const fitZoom = Phaser.Math.Clamp(
      Math.min(usableWidth / contentWidth, usableHeight / contentHeight) * 0.88,
      MIN_MAP_ZOOM, MAX_MAP_ZOOM
    );
    cam.setZoom(fitZoom);
    cam.centerOn((minLeft + maxLeft) / 2, (minTop + maxTop) / 2 + CHUNK_OFFSET_Y);
  }

  setupInput() {
    const cam = this.cameras.main;

    this.input.on('pointerdown', pointer => {
      this.dragStart = { x: pointer.x, y: pointer.y, scrollX: cam.scrollX, scrollY: cam.scrollY };
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
      // Update cursor
      const world = builderWorld();
      const cell = mapCellFromWorldPoint(world, pointer.worldX, pointer.worldY);
      if (cell) {
        const anchor = { x: 2, y: 2 };
        const rotation = normalizeRotation(game.builder.rotation);
        const occupied = builderOccupiedCells(game.builder.selectedTypeId, anchor, rotation);
        const isInOffice = occupied.some(c => c.x === cell.x && c.y === cell.y);
        this.game.canvas.style.cursor = isInOffice
          ? (game.builder.mode === 'place' ? 'cell' : 'pointer')
          : 'default';
      }
    });

    this.input.on('pointerup', pointer => {
      const wasDrag = this.didDrag;
      this.dragStart = null;
      this.didDrag = false;
      if (!wasDrag) this.handleBuilderClick(pointer);
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const nextZoom = Phaser.Math.Clamp(cam.zoom * (deltaY > 0 ? 0.88 : 1.12), MIN_MAP_ZOOM, MAX_MAP_ZOOM);
      const before = cam.getWorldPoint(pointer.x, pointer.y);
      cam.setZoom(nextZoom);
      const after = cam.getWorldPoint(pointer.x, pointer.y);
      cam.scrollX += before.x - after.x;
      cam.scrollY += before.y - after.y;
    });
  }

  handleBuilderClick(pointer) {
    const world = builderWorld();
    const cell = mapCellFromWorldPoint(world, pointer.worldX, pointer.worldY);
    if (!cell) return;

    const b = game.builder;
    const anchor = { x: 2, y: 2 };
    const rotation = normalizeRotation(b.rotation);
    const occupied = builderOccupiedCells(b.selectedTypeId, anchor, rotation);
    const isInOffice = occupied.some(c => c.x === cell.x && c.y === cell.y);

    if (b.mode === 'place' && isInOffice) {
      // Place furniture
      const newItem = {
        id: `furni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        spriteId: b.selectedSpriteId,
        cell: { x: cell.x, y: cell.y },
        offsetX: 0, offsetY: 0, lift: 0, anchor: '', flipX: false
      };
      b.furniture.push(newItem);
      b.selectedFurnitureIdx = b.furniture.length - 1;
      b.mode = 'select';
      saveBuilderState();
      render();
      return;
    }

    if (b.mode === 'select') {
      // Try to find a furniture item at this cell
      const idx = b.furniture.findIndex(f => f.cell.x === cell.x && f.cell.y === cell.y);
      if (idx >= 0) {
        // If multiple items on same cell, cycle through them
        if (b.selectedFurnitureIdx >= 0 && b.furniture[b.selectedFurnitureIdx]?.cell.x === cell.x && b.furniture[b.selectedFurnitureIdx]?.cell.y === cell.y) {
          // Find next item on same cell
          const sameCell = b.furniture
            .map((f, i) => ({ f, i }))
            .filter(({ f }) => f.cell.x === cell.x && f.cell.y === cell.y);
          const currentInList = sameCell.findIndex(({ i }) => i === b.selectedFurnitureIdx);
          const nextInList = (currentInList + 1) % sameCell.length;
          b.selectedFurnitureIdx = sameCell[nextInList].i;
        } else {
          b.selectedFurnitureIdx = idx;
        }
      } else {
        b.selectedFurnitureIdx = -1;
      }
      render();
      return;
    }
  }

  tileDiamond(center, scale = 1) {
    const hw = TILE_STEP_X * scale;
    const hh = TILE_STEP_Y * scale;
    return [
      new Phaser.Math.Vector2(center.x, center.y - hh),
      new Phaser.Math.Vector2(center.x + hw, center.y),
      new Phaser.Math.Vector2(center.x, center.y + hh),
      new Phaser.Math.Vector2(center.x - hw, center.y)
    ];
  }
}

function mountBuilderMap() {
  const placeholder = document.querySelector('[data-phaser-map][data-map-mode="builder"]');
  if (!placeholder) {
    if (builderMapHost?.parentNode) builderMapHost.parentNode.removeChild(builderMapHost);
    return;
  }

  const host = ensureBuilderMapHost();
  if (host.parentNode !== placeholder) placeholder.appendChild(host);

  if (activeBuilderMap?.game) {
    activeBuilderMap.game.scale.refresh();
    activeBuilderMap.scene?.renderMap();
    return;
  }

  destroyBuilderMap();
  const rect = host.getBoundingClientRect();
  activeBuilderMap = { game: null, element: host, scene: null };
  const phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    width: Math.max(320, Math.floor(rect.width || host.clientWidth || 800)),
    height: Math.max(260, Math.floor(rect.height || host.clientHeight || 600)),
    backgroundColor: '#02030a',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER
    },
    scene: new BuilderScene()
  });
  activeBuilderMap.game = phaserGame;
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
          <strong>${report.finalResult.escaped ? 'Escaped' : report.finalResult.status === 'game_over' ? 'Game Over' : report.finalResult.status}</strong>
        </div>
        <div class="report-block">
          <h2>Final Score</h2>
          <strong style="font-size:2em;color:${report.finalScore > 0 ? '#4ade80' : '#f87171'}">${report.finalScore ?? 0}</strong>
          <p style="margin-top:0.5em;font-size:0.85em;opacity:0.7">Earned: ${report.totalEarned ?? 0} · Spent: ${report.totalSpent ?? 0}</p>
        </div>
        <div class="report-block">
          <h2>Time Played</h2>
          <strong>${formatPlayTime(report.playTimeMs)}</strong>
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
    game.showTutorial = true;
    game.notice = '';
    game.backlogOrder = [...START_BACKLOG_ORDER];
    game.activeMinigame = 'scope_fog';
    game.samplePlacements = [];
    game.fullscreen.hasAutoSnapped = false;
    clearPlacement();
    resetMinigameState();
  });
}

async function handleClick(event) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  if (action === 'dismiss-tutorial') {
    game.showTutorial = false;
    game.notice = 'Session started. Good luck!';
    render();
    return;
  }
  if (action === 'toggle-bug') {
    toggleMinigameSelection(actionEl.dataset.bugId);
    render();
    return;
  }
  if (action === 'toggle-risk') {
    toggleMinigameSelection(actionEl.dataset.riskId);
    render();
    return;
  }
  if (action === 'budget-choice') {
    game.minigameState.choiceId = actionEl.dataset.choiceId;
    render();
    return;
  }
  if (action === 'stakeholder-choice') {
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
  if (action === 'open-builder') {
    navigateTo(BUILDER_PATH);
    return;
  }
  // --- Builder actions ---
  if (action === 'builder-back') {
    navigateTo('/');
    return;
  }
  if (action === 'builder-select-type') {
    game.builder.selectedTypeId = actionEl.dataset.typeId;
    game.builder.furniture = [];
    game.builder.selectedFurnitureIdx = -1;
    saveBuilderState();
    destroyBuilderMap();
    render();
    return;
  }
  if (action === 'builder-set-rotation') {
    game.builder.rotation = Number(actionEl.dataset.rotation);
    game.builder.furniture = [];
    game.builder.selectedFurnitureIdx = -1;
    saveBuilderState();
    destroyBuilderMap();
    render();
    return;
  }
  if (action === 'builder-set-mode') {
    game.builder.mode = actionEl.dataset.mode;
    if (game.builder.mode === 'place') game.builder.selectedFurnitureIdx = -1;
    render();
    return;
  }
  if (action === 'builder-select-sprite') {
    game.builder.selectedSpriteId = actionEl.dataset.spriteId;
    render();
    return;
  }
  if (action === 'builder-auto-fill') {
    game.builder.furniture = builderAutoFillFurniture();
    game.builder.selectedFurnitureIdx = -1;
    saveBuilderState();
    destroyBuilderMap();
    render();
    return;
  }
  if (action === 'builder-clear-furniture') {
    game.builder.furniture = [];
    game.builder.selectedFurnitureIdx = -1;
    saveBuilderState();
    destroyBuilderMap();
    render();
    return;
  }
  if (action === 'builder-delete-furniture') {
    if (game.builder.selectedFurnitureIdx >= 0) {
      game.builder.furniture.splice(game.builder.selectedFurnitureIdx, 1);
      game.builder.selectedFurnitureIdx = -1;
      saveBuilderState();
      destroyBuilderMap();
      render();
    }
    return;
  }
  if (action === 'builder-export') {
    const placement = builderCreatePlacement();
    game.builder.exportText = JSON.stringify(placement, null, 2);
    render();
    return;
  }
  if (action === 'builder-import') {
    const input = prompt('Paste builder JSON:');
    if (!input) return;
    try {
      const data = JSON.parse(input);
      if (data.typeId && BUILDING_TYPES_BY_ID[data.typeId]) {
        game.builder.selectedTypeId = data.typeId;
      }
      if (typeof data.rotation === 'number') {
        game.builder.rotation = normalizeRotation(data.rotation);
      }
      if (Array.isArray(data.furniture)) {
        game.builder.furniture = data.furniture.map(f => ({
          id: f.id || `furni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          spriteId: f.spriteId || 'desk',
          cell: f.cell || { x: 0, y: 0 },
          offsetX: Number(f.offsetX) || 0,
          offsetY: Number(f.offsetY) || 0,
          lift: Number(f.lift) || 0,
          anchor: f.anchor || '',
          flipX: Boolean(f.flipX)
        }));
      }
      game.builder.selectedFurnitureIdx = -1;
      saveBuilderState();
      destroyBuilderMap();
      render();
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
    return;
  }
  if (action === 'builder-copy-export') {
    const ta = document.getElementById('builder-export-text');
    if (ta) {
      navigator.clipboard?.writeText(ta.value).catch(() => {
        ta.select();
        document.execCommand('copy');
      });
    }
    return;
  }
  if (action === 'builder-close-export') {
    game.builder.exportText = '';
    render();
    return;
  }
  if (action === 'fullscreen-zoom') {
    const zoomAction = actionEl.dataset.zoomAction;
    if (zoomAction === 'out') setFullscreenZoom(game.fullscreen.zoom - ZOOM_STEP, true);
    if (zoomAction === 'in') setFullscreenZoom(game.fullscreen.zoom + ZOOM_STEP, true);
    if (zoomAction === 'reset') setFullscreenZoom(1, true);
    if (zoomAction === 'fit') fitFullscreenMap('smooth');
    if (zoomAction === 'player') {
      if (activeOfficeMap?.scene?.mode === 'fullscreen') activeOfficeMap.scene.centerOnPlayer();
      else queueSnapMapToPlayer(true);
    }
    return;
  }
  if (action === 'start-placement') {
    if (isFullscreenRoute()) return;
    startPlacement(actionEl.dataset.departmentId);
    render();
    return;
  }
  if (action === 'start-sample-placement') {
    if (isFullscreenRoute()) return;
    startSamplePlacement(actionEl.dataset.sampleId);
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
  if (action === 'clear-sample-placements') {
    clearSamplePlacements();
    render();
    return;
  }

  if (action === 'world-board-hit') {
    if (isFullscreenRoute()) return;
    const cell = cellFromBoardEvent(event, actionEl);
    if (!cell) return;
    if (isPlacementMode()) await placeActivePlacement(cell.x, cell.y);
    else if (!pathSet().has(coordKey(cell.x, cell.y))) await buildWorldCell(cell.x, cell.y);
    return;
  }

  if (action === 'build-world-cell') {
    if (isFullscreenRoute()) return;
    if (isPlacementMode()) await placeActivePlacement(Number(actionEl.dataset.x), Number(actionEl.dataset.y));
    else await buildWorldCell(Number(actionEl.dataset.x), Number(actionEl.dataset.y));
  }
  if (action === 'submit-minigame') await submitMinigame(actionEl.dataset.minigameId || game.activeMinigame);
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

function toggleMinigameSelection(itemId) {
  const selected = new Set(game.minigameState.selected || []);
  if (selected.has(itemId)) selected.delete(itemId);
  else selected.add(itemId);
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

  if (minigameId === 'risk_vault') {
    const selected = [...(game.minigameState.selected || [])].sort();
    const serious = riskCards
      .filter(card => card.severity === 'serious')
      .map(card => card.id)
      .sort();
    if (selected.length === 0) return null;
    return {
      minigameId: 'risk_vault',
      success: JSON.stringify(selected) === JSON.stringify(serious),
      score: selected.filter(id => serious.includes(id)).length,
      details: { selected }
    };
  }

  if (minigameId === 'stakeholder_booth') {
    if (!game.minigameState.choiceId) return null;
    return {
      minigameId: 'stakeholder_booth',
      success: game.minigameState.choiceId === 'reply_with_decision',
      score: game.minigameState.choiceId === 'reply_with_decision' ? 1 : 0,
      details: { choiceId: game.minigameState.choiceId }
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
  // Each building type has a fixed, rotatable shape.
  const type = BUILDING_TYPES_BY_ID[departmentId];
  if (!type) return;
  game.placement = {
    kind: 'department',
    departmentId,
    sampleId: '',
    presetId: departmentId,
    rotation: 0,
    previewAnchor: null
  };
  game.notice = `Placing ${type.name} (${type.cost} pts). Rotate it, then click a spot next to your office, corridor or a map border.`;
}

function startSamplePlacement(sampleId) {
  const sample = FOOTPRINT_SAMPLES_BY_ID[sampleId];
  if (!sample) return;
  game.placement = {
    kind: 'sample',
    departmentId: '',
    sampleId,
    presetId: sampleId,
    rotation: 0,
    previewAnchor: null
  };
  game.notice = `Placing ${sample.label} footprint sample. Click any safe grid cells to stamp the size reference.`;
}

function rotatePlacement() {
  if (!isPlacementMode()) return;
  game.placement.rotation = (normalizeRotation(game.placement.rotation) + 90) % 360;
}

function clearPlacement() {
  game.placement = { kind: '', departmentId: '', sampleId: '', presetId: '', rotation: 0, previewAnchor: null };
}

function clearSamplePlacements() {
  game.samplePlacements = [];
  game.notice = 'Footprint samples cleared.';
}

async function placeActivePlacement(x, y) {
  if (game.placement.kind === 'sample') {
    placeSamplePlacement(x, y);
    return;
  }
  await placeDepartment(x, y);
}

function placeSamplePlacement(x, y) {
  const sample = placementSample();
  if (!sample || !Number.isInteger(x) || !Number.isInteger(y)) return;
  const preview = placementPreview({ x, y });
  if (!preview.valid) {
    game.error = preview.reason || 'That footprint sample cannot be placed there.';
    game.placement.previewAnchor = { x, y };
    render();
    return;
  }
  game.samplePlacements.push({
    id: `${sample.id}:${x},${y}:${game.placement.rotation}:${Date.now()}`,
    sampleId: sample.id,
    anchorCell: { x, y },
    rotation: normalizeRotation(game.placement.rotation),
    cells: preview.cells.map(cell => ({ x: Number(cell.x), y: Number(cell.y) }))
  });
  clearPlacement();
  game.notice = `${sample.label} footprint sample placed.`;
  render();
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
  game.samplePlacements = [];
  clearPlacement();
  render();
}

async function downloadLog() {
  if (!game.session) return;
  await withAction(async () => {
    const response = await api.get(`/api/sessions/${game.session.sessionId}/log`);
    const entries = response.log || [];
    const lines = [];
    
    entries.forEach(entry => {
      const ts = entry.timestamp || new Date().toISOString();
      const base = {
        playerPseudoId: entry.studentId || game.session.studentId,
        gameId: 'GM-9F51EF0C0810',
        sessionId: game.session.sessionId,
        ts: ts,
        payload: { ...entry }
      };
      
      lines.push(JSON.stringify({ ...base, eventType: entry.eventType || 'unknown' }));

      if (entry.points !== undefined) {
        lines.push(JSON.stringify({ ...base, eventType: 'score_update', payload: { ...base.payload, score: entry.points } }));
      }

      if (entry.eventType === 'escape_check') {
        lines.push(JSON.stringify({ ...base, eventType: 'session_end' }));
      }
    });

    const jsonlContent = lines.join('\n') + (lines.length ? '\n' : '');
    const blob = new Blob([jsonlContent], {
      type: 'application/x-ndjson'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const studentStr = (game.session.studentId || 'log').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${studentStr}-log.jsonl`;
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

function applyFurnitureScaleMultiplier(value) {
  const next = clampFurnitureScaleMultiplier(value);
  if (next === game.furnitureScaleMultiplier) return;
  game.furnitureScaleMultiplier = next;
  saveFurnitureScaleMultiplier(next);
  const readout = document.querySelector('[data-furniture-scale-readout]');
  if (readout) readout.textContent = furnitureScaleLabel(next);
  const percent = document.querySelector('[data-furniture-scale-percent]');
  if (percent) percent.textContent = `${Math.round(next * 100)}%`;
  activeOfficeMap?.scene?.renderMap?.();
}

function applyFurnitureOffsetAxis(axis, value) {
  const next = clampFurnitureOffsetAxis(value);
  if (next === game.furnitureOffsetAxes[axis]) return;
  game.furnitureOffsetAxes[axis] = next;
  saveFurnitureOffsetAxis(axis, next);
  const readout = document.querySelector(`[data-furniture-offset-${axis}-readout]`);
  if (readout) readout.textContent = furnitureOffsetAxisLabel(axis, next);
  const center = document.querySelector(`[data-furniture-offset-${axis}-center]`);
  if (center) center.textContent = furnitureOffsetAxisLabel(axis, next);
  activeOfficeMap?.scene?.renderMap?.();
}

document.addEventListener('submit', event => {
  if (event.target.matches('[data-form="start"]')) {
    handleStart(event);
  }
});

document.addEventListener('click', event => {
  handleClick(event);
});

document.addEventListener('input', event => {
  const slider = event.target.closest('[data-input-action="set-furniture-scale"]');
  if (slider) {
    applyFurnitureScaleMultiplier(slider.value);
    return;
  }
  const offsetXAxisSlider = event.target.closest('[data-input-action="set-furniture-offset-x"]');
  if (offsetXAxisSlider) {
    applyFurnitureOffsetAxis('x', offsetXAxisSlider.value);
    return;
  }
  const offsetYAxisSlider = event.target.closest('[data-input-action="set-furniture-offset-y"]');
  if (offsetYAxisSlider) {
    applyFurnitureOffsetAxis('y', offsetYAxisSlider.value);
    return;
  }
  const offsetZAxisSlider = event.target.closest('[data-input-action="set-furniture-offset-z"]');
  if (offsetZAxisSlider) {
    applyFurnitureOffsetAxis('z', offsetZAxisSlider.value);
    return;
  }

  // --- Builder inspector inputs ---
  const bIdx = game.builder.selectedFurnitureIdx;
  const bFurni = bIdx >= 0 ? game.builder.furniture[bIdx] : null;
  if (!bFurni) return;

  const bOffsetX = event.target.closest('[data-input-action="builder-set-offset-x"]');
  if (bOffsetX) {
    bFurni.offsetX = Number(bOffsetX.value);
    const readout = bOffsetX.parentElement?.querySelector('.builder-readout');
    if (readout) readout.textContent = bFurni.offsetX.toFixed(2);
    saveBuilderState();
    activeBuilderMap?.scene?.renderMap?.();
    return;
  }
  const bOffsetY = event.target.closest('[data-input-action="builder-set-offset-y"]');
  if (bOffsetY) {
    bFurni.offsetY = Number(bOffsetY.value);
    const readout = bOffsetY.parentElement?.querySelector('.builder-readout');
    if (readout) readout.textContent = bFurni.offsetY.toFixed(2);
    saveBuilderState();
    activeBuilderMap?.scene?.renderMap?.();
    return;
  }
  const bLift = event.target.closest('[data-input-action="builder-set-lift"]');
  if (bLift) {
    bFurni.lift = Number(bLift.value);
    const readout = bLift.parentElement?.querySelector('.builder-readout');
    if (readout) readout.textContent = bFurni.lift.toFixed(2);
    saveBuilderState();
    activeBuilderMap?.scene?.renderMap?.();
    return;
  }
  const bAnchor = event.target.closest('[data-input-action="builder-set-anchor"]');
  if (bAnchor) {
    bFurni.anchor = bAnchor.value;
    saveBuilderState();
    activeBuilderMap?.scene?.renderMap?.();
    return;
  }
  const bFlip = event.target.closest('[data-input-action="builder-set-flip"]');
  if (bFlip) {
    bFurni.flipX = bFlip.checked;
    saveBuilderState();
    activeBuilderMap?.scene?.renderMap?.();
    return;
  }
});

function updatePlacementPreview(nextAnchor) {
  if (!isPlacementMode() || !nextAnchor) return;
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
  if (!isPlacementMode()) return;
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
  if (!editingText && isBuilderRoute()) {
    if (event.key === 'Escape') {
      event.preventDefault();
      navigateTo('/');
      return;
    }
    return;
  }
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
      if (activeOfficeMap?.scene?.mode === 'fullscreen') activeOfficeMap.scene.centerOnPlayer();
      else queueSnapMapToPlayer(true);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      navigateTo('/');
      return;
    }
    return;
  }

  if (!editingText && isPlacementMode() && event.key.toLowerCase() === 'r') {
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
  if (isBuilderRoute()) {
    clearPlacement();
  }
  render();
});

installVoidOfficeDebugFlag();
boot();
