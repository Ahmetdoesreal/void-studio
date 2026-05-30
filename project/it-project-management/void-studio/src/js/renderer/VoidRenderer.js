/**
 * VoidRenderer.js
 * Three.js orthographic isometric renderer for the growing office scene.
 */

import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const FLOOR_HEIGHT = 0.16;
const FURNITURE_Y = FLOOR_HEIGHT + 0.02;
const MATERIALIZE_DURATION = 1.15;

const PALETTE = {
  void: 0x07080d,
  voidFog: 0x080914,
  floorA: 0x242738,
  floorB: 0x1c2030,
  floorEdge: 0x52d6c6,
  violet: 0x8b5cf6,
  cyan: 0x22d3ee,
  green: 0x22c55e,
  amber: 0xf59e0b,
  red: 0xef4444,
  white: 0xf5f7fb,
  ink: 0x10131e,
  metal: 0x6b7280,
  wood: 0x6f5135,
  glass: 0x7dd3fc
};

const FLOOR_PALETTES = [
  { base: 0x25283d, alt: 0x202337, edge: 0x8b5cf6 },
  { base: 0x253047, alt: 0x1d273b, edge: 0x38bdf8 },
  { base: 0x26323a, alt: 0x202a31, edge: 0x22c55e },
  { base: 0x332d22, alt: 0x2a251d, edge: 0xf59e0b },
  { base: 0x233134, alt: 0x1d292c, edge: 0x2dd4bf }
];

export class VoidRenderer {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    this.officeGroup = null;
    this.floorGroup = null;
    this.furnitureGroup = null;
    this.particles = null;
    this.ambientParticles = null;
    this.voidGrid = null;
    this.voidIntensity = 1.0;
    this.targetVoidIntensity = 1.0;
    this.lights = {};
    this.animationCallbacks = [];
    this.materializedObjects = [];
    this.pulseMaterials = [];
    this.createdFloorCount = 0;
    this.cameraViewSize = 16;
    this.cameraDistance = 30;
    this.cameraTarget = new THREE.Vector3(3.5, 0, 4.5);
    this.isoOffset = new THREE.Vector3(1, 0.88, 1).normalize().multiplyScalar(this.cameraDistance);
    this.isFallback = false;

    this.init();
  }

  init() {
    const { width, height } = this.getViewportSize();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.void);
    this.scene.fog = new THREE.FogExp2(PALETTE.voidFog, 0.018);

    this.setupCamera(width, height);

    if (!this.createRenderer(width, height)) {
      this.createCanvasFallback(width, height);
      return;
    }

    this.container.appendChild(this.renderer.domElement);
    this.setupControls();

    this.officeGroup = new THREE.Group();
    this.floorGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.officeGroup.add(this.floorGroup, this.furnitureGroup);
    this.scene.add(this.officeGroup);

    this.setupLighting();
    this.setupVoidParticles();
    this.setupVoidGrid();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  getViewportSize() {
    return {
      width: this.container?.clientWidth || window.innerWidth || 1280,
      height: this.container?.clientHeight || window.innerHeight || 720
    };
  }

  setupCamera(width, height) {
    const aspect = width / Math.max(height, 1);
    this.cameraViewSize = width < 760 ? 18 : 16;
    this.camera = new THREE.OrthographicCamera(
      -this.cameraViewSize * aspect / 2,
      this.cameraViewSize * aspect / 2,
      this.cameraViewSize / 2,
      -this.cameraViewSize / 2,
      0.1,
      200
    );
    this.camera.zoom = width < 760 ? 0.76 : 1.0;
    this.syncCameraToTarget(this.cameraTarget);
  }

  createRenderer(width, height) {
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      });

      if (!this.renderer.getContext()) {
        throw new Error('No WebGL context');
      }

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      return true;
    } catch (err) {
      console.warn('WebGL unavailable, falling back to static canvas:', err.message);
      this.renderer = null;
      this.isFallback = true;
      return false;
    }
  }

  createCanvasFallback(width, height) {
    const canvas = document.createElement('canvas');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#07080d');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 260; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.4 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 211, 252, ${0.2 + Math.random() * 0.55})`;
        ctx.fill();
      }
    }

    this.container.appendChild(canvas);
  }

  setupControls() {
    this.controls = new MapControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.zoomToCursor = true;
    this.controls.minZoom = 0.58;
    this.controls.maxZoom = 2.4;
    this.controls.target.copy(this.cameraTarget);
    this.controls.update();
  }

  syncCameraToTarget(target) {
    this.cameraTarget.copy(target);
    this.camera.position.copy(target).add(this.isoOffset);
    this.camera.lookAt(target);
  }

  setupLighting() {
    this.lights.hemi = new THREE.HemisphereLight(0xbdefff, 0x161821, 0.65);
    this.scene.add(this.lights.hemi);

    this.lights.ambient = new THREE.AmbientLight(0x8ba0c7, 0.32);
    this.scene.add(this.lights.ambient);

    this.lights.main = new THREE.DirectionalLight(0xf4fbff, 1.15);
    this.lights.main.position.set(8, 16, 8);
    this.lights.main.castShadow = true;
    this.lights.main.shadow.mapSize.set(2048, 2048);
    this.lights.main.shadow.camera.near = 1;
    this.lights.main.shadow.camera.far = 55;
    this.lights.main.shadow.camera.left = -14;
    this.lights.main.shadow.camera.right = 14;
    this.lights.main.shadow.camera.top = 14;
    this.lights.main.shadow.camera.bottom = -14;
    this.scene.add(this.lights.main);

    this.lights.rim = new THREE.DirectionalLight(PALETTE.cyan, 0.45);
    this.lights.rim.position.set(-8, 7, 10);
    this.scene.add(this.lights.rim);

    this.lights.office = new THREE.PointLight(0xfff4d6, 0, 24);
    this.lights.office.position.set(4, 5, 7);
    this.scene.add(this.lights.office);
  }

  setupVoidParticles() {
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 24 + Math.random() * 72;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 6;
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = new THREE.Color(
        Math.random() < 0.55 ? PALETTE.cyan : Math.random() < 0.5 ? PALETTE.violet : 0xffffff
      );
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    const ambientCount = 240;
    const ambientPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      const i3 = i * 3;
      ambientPositions[i3] = (Math.random() - 0.5) * 20 + 4;
      ambientPositions[i3 + 1] = Math.random() * 5;
      ambientPositions[i3 + 2] = (Math.random() - 0.5) * 24 + 6;
    }

    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    const ambientMaterial = new THREE.PointsMaterial({
      size: 0.055,
      color: PALETTE.cyan,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
    this.scene.add(this.ambientParticles);
  }

  setupVoidGrid() {
    this.voidGrid = new THREE.GridHelper(28, 28, 0x16313a, 0x101b25);
    this.voidGrid.position.set(3.5, -0.015, 6.5);
    this.voidGrid.material.transparent = true;
    this.voidGrid.material.opacity = 0.32;
    this.scene.add(this.voidGrid);
  }

  createFloorPlatform(gridX, gridZ, width, depth, item = null) {
    const palette = FLOOR_PALETTES[this.createdFloorCount % FLOOR_PALETTES.length];
    this.createdFloorCount += 1;

    const group = new THREE.Group();
    group.position.set(
      gridX + (width - 1) / 2,
      0,
      gridZ + (depth - 1) / 2
    );

    const centerX = (width - 1) / 2;
    const centerZ = (depth - 1) / 2;
    const tileGeometry = new RoundedBoxGeometry(0.94, FLOOR_HEIGHT, 0.94, 3, 0.035);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: palette.edge,
      transparent: true,
      opacity: 0.22
    });

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const color = (x + z) % 2 === 0 ? palette.base : palette.alt;
        const tile = new THREE.Mesh(
          tileGeometry.clone(),
          this.standardMaterial(color, { roughness: 0.68, metalness: 0.12 })
        );
        tile.position.set(x - centerX, FLOOR_HEIGHT / 2, z - centerZ);
        tile.receiveShadow = true;

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(tile.geometry),
          edgeMaterial.clone()
        );
        tile.add(edges);
        group.add(tile);
      }
    }

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 0.24, depth + 0.24),
      new THREE.MeshBasicMaterial({
        color: palette.edge,
        transparent: true,
        opacity: 0.08,
        depthWrite: false
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.012;
    group.add(glow);

    group.userData.name = item?.name || 'Floor Platform';
    this.floorGroup.add(group);
    this.materializeObject(group);
    return group;
  }

  createWall(item) {
    const length = item.length || 1;
    const orientation = item.orientation || 'horizontal';
    const isVertical = orientation === 'vertical';
    const height = 1.55;
    const thickness = 0.08;
    const width = isVertical ? thickness : length;
    const depth = isVertical ? length : thickness;

    const group = new THREE.Group();
    group.position.set(
      item.gridPos.x + (isVertical ? -0.5 : (length - 1) / 2),
      FURNITURE_Y,
      item.gridPos.z + (isVertical ? (length - 1) / 2 : -0.5)
    );

    const panel = this.roundedBox(
      width,
      height,
      depth,
      this.standardMaterial(PALETTE.glass, {
        roughness: 0.18,
        metalness: 0.05,
        opacity: 0.28,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.12
      }),
      0.02
    );
    panel.position.y = height / 2;
    group.add(panel);

    const postMaterial = this.standardMaterial(PALETTE.metal, { roughness: 0.4, metalness: 0.65 });
    const postOffsets = isVertical
      ? [[0, -depth / 2], [0, depth / 2]]
      : [[-width / 2, 0], [width / 2, 0]];

    postOffsets.forEach(([x, z]) => {
      const post = this.roundedBox(0.08, height + 0.18, 0.08, postMaterial.clone(), 0.02);
      post.position.set(x, (height + 0.18) / 2, z);
      group.add(post);
    });

    this.prepareObject(group);
    this.furnitureGroup.add(group);
    this.materializeObject(group);
    return group;
  }

  createFurniture(type, gridX, gridZ, item = null) {
    let object;

    switch (type) {
      case 'desk_reception':
        object = this.buildReceptionDesk();
        break;
      case 'desk_dev':
        object = this.buildDeskWithMonitor(0x2f3a63, PALETTE.cyan);
        break;
      case 'desk_qa':
        object = this.buildDeskWithMonitor(0x244f3b, PALETTE.green);
        break;
      case 'desk_ops':
        object = this.buildDeskWithMonitor(0x5a431f, PALETTE.amber);
        break;
      case 'whiteboard':
        object = this.buildWhiteboard();
        break;
      case 'table_meeting':
        object = this.buildMeetingTable();
        break;
      case 'chairs_set':
        object = this.buildChairSet();
        break;
      case 'screen_large':
        object = this.buildLargeScreen();
        break;
      case 'server_rack':
        object = this.buildServerRack(PALETTE.cyan);
        break;
      case 'coffee_machine':
        object = this.buildCoffeeMachine();
        break;
      case 'board_bug':
        object = this.buildBugBoard();
        break;
      case 'shelf_devices':
        object = this.buildDeviceShelf();
        break;
      case 'monitor_wall':
        object = this.buildMonitorWall();
        break;
      case 'network_cabinet':
        object = this.buildServerRack(PALETTE.amber);
        break;
      case 'status_lights':
        object = this.buildStatusLights();
        break;
      case 'couch':
        object = this.buildCouch();
        break;
      case 'table_coffee':
        object = this.buildCoffeeTable();
        break;
      case 'plants_cluster':
        object = this.buildPlantCluster();
        break;
      case 'plant':
        object = this.buildPlant();
        break;
      case 'logo_wall':
        object = this.buildLogoWall();
        break;
      case 'trophy_case':
        object = this.buildTrophyCase();
        break;
      case 'window_void':
        object = this.buildVoidWindow();
        break;
      default:
        object = this.buildGenericBox();
        break;
    }

    object.position.set(gridX, FURNITURE_Y, gridZ);
    object.userData.name = item?.name || type || 'Office Object';
    this.prepareObject(object);
    this.furnitureGroup.add(object);
    this.materializeObject(object);
    return object;
  }

  buildReceptionDesk() {
    const group = new THREE.Group();
    const baseMat = this.standardMaterial(0x343c66, { roughness: 0.56, metalness: 0.18 });
    const trimMat = this.standardMaterial(PALETTE.cyan, {
      roughness: 0.35,
      metalness: 0.2,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.18
    });

    const base = this.roundedBox(1.55, 0.55, 0.72, baseMat, 0.06);
    base.position.y = 0.3;
    group.add(base);

    const counter = this.roundedBox(1.75, 0.12, 0.86, this.standardMaterial(0x485074), 0.05);
    counter.position.y = 0.63;
    group.add(counter);

    const frontGlow = this.roundedBox(1.2, 0.06, 0.035, trimMat, 0.015);
    frontGlow.position.set(0, 0.45, 0.38);
    group.add(frontGlow);

    return group;
  }

  buildDeskWithMonitor(color = 0x2f3a63, screenColor = PALETTE.cyan) {
    const group = this.buildDesk(color);

    const monitor = this.roundedBox(
      0.62,
      0.42,
      0.035,
      this.standardMaterial(0x070b12, {
        roughness: 0.35,
        metalness: 0.2,
        emissive: screenColor,
        emissiveIntensity: 0.42
      }),
      0.02
    );
    monitor.position.set(0, 0.98, -0.18);
    group.add(monitor);

    const stand = this.roundedBox(0.08, 0.2, 0.08, this.standardMaterial(PALETTE.metal), 0.025);
    stand.position.set(0, 0.79, -0.18);
    group.add(stand);

    const keyboard = this.roundedBox(0.42, 0.025, 0.16, this.standardMaterial(0x111827), 0.02);
    keyboard.position.set(0, 0.725, 0.08);
    group.add(keyboard);

    const mouse = this.roundedBox(0.1, 0.025, 0.14, this.standardMaterial(0x111827), 0.03);
    mouse.position.set(0.32, 0.725, 0.08);
    group.add(mouse);

    return group;
  }

  buildDesk(color = 0x334155) {
    const group = new THREE.Group();
    const top = this.roundedBox(1.25, 0.08, 0.68, this.standardMaterial(color), 0.045);
    top.position.y = 0.7;
    group.add(top);

    const legMat = this.standardMaterial(PALETTE.metal, { roughness: 0.36, metalness: 0.62 });
    [
      [-0.52, -0.26], [0.52, -0.26],
      [-0.52, 0.26], [0.52, 0.26]
    ].forEach(([x, z]) => {
      const leg = this.roundedBox(0.06, 0.66, 0.06, legMat.clone(), 0.02);
      leg.position.set(x, 0.36, z);
      group.add(leg);
    });

    return group;
  }

  buildWhiteboard() {
    const group = new THREE.Group();
    const board = this.roundedBox(
      1.55,
      0.9,
      0.045,
      this.standardMaterial(0xf8fafc, { roughness: 0.8, metalness: 0 }),
      0.025
    );
    board.position.y = 1.18;
    group.add(board);

    const frame = this.roundedBox(1.72, 1.06, 0.035, this.standardMaterial(PALETTE.metal), 0.03);
    frame.position.set(0, 1.18, -0.032);
    group.add(frame);

    const marker = this.roundedBox(0.36, 0.025, 0.035, this.standardMaterial(PALETTE.red), 0.012);
    marker.position.set(0.38, 0.78, 0.04);
    group.add(marker);

    const standMat = this.standardMaterial(PALETTE.metal, { metalness: 0.55, roughness: 0.35 });
    [-0.65, 0.65].forEach(x => {
      const stand = this.roundedBox(0.055, 1.55, 0.055, standMat.clone(), 0.018);
      stand.position.set(x, 0.76, -0.03);
      group.add(stand);
    });

    return group;
  }

  buildMeetingTable() {
    const group = new THREE.Group();
    const top = this.roundedBox(
      2.05,
      0.1,
      1.05,
      this.standardMaterial(PALETTE.wood, { roughness: 0.38, metalness: 0.05 }),
      0.08
    );
    top.position.y = 0.7;
    group.add(top);

    const inset = this.roundedBox(
      1.65,
      0.025,
      0.72,
      this.standardMaterial(0x1f2937, {
        opacity: 0.55,
        roughness: 0.2,
        emissive: PALETTE.violet,
        emissiveIntensity: 0.06
      }),
      0.04
    );
    inset.position.y = 0.764;
    group.add(inset);

    const base = this.roundedBox(0.36, 0.64, 0.36, this.standardMaterial(PALETTE.metal), 0.05);
    base.position.y = 0.35;
    group.add(base);

    return group;
  }

  buildChairSet() {
    const group = new THREE.Group();
    const positions = [
      [-0.72, 0, -0.72, 0],
      [0.72, 0, -0.72, 0],
      [-0.72, 0, 0.72, Math.PI],
      [0.72, 0, 0.72, Math.PI]
    ];

    positions.forEach(([x, y, z, rotation]) => {
      const chair = this.buildChair();
      chair.position.set(x, y, z);
      chair.rotation.y = rotation;
      group.add(chair);
    });

    return group;
  }

  buildChair() {
    const group = new THREE.Group();
    const fabric = this.standardMaterial(0x334155, { roughness: 0.75 });
    const seat = this.roundedBox(0.42, 0.09, 0.42, fabric.clone(), 0.06);
    seat.position.y = 0.44;
    group.add(seat);

    const back = this.roundedBox(0.42, 0.48, 0.08, fabric.clone(), 0.06);
    back.position.set(0, 0.72, -0.2);
    group.add(back);

    const stem = this.roundedBox(0.07, 0.38, 0.07, this.standardMaterial(PALETTE.metal), 0.025);
    stem.position.y = 0.22;
    group.add(stem);

    return group;
  }

  buildLargeScreen() {
    const group = new THREE.Group();
    const frame = this.roundedBox(1.9, 1.08, 0.08, this.standardMaterial(0x111827), 0.04);
    frame.position.y = 1.16;
    group.add(frame);

    const screen = this.roundedBox(
      1.72,
      0.9,
      0.03,
      this.standardMaterial(0x07111f, {
        roughness: 0.28,
        metalness: 0.1,
        emissive: PALETTE.violet,
        emissiveIntensity: 0.5
      }),
      0.025
    );
    screen.position.set(0, 1.16, 0.055);
    group.add(screen);

    this.registerPulse(screen.material, 0.25, 0.55, 0.9);
    return group;
  }

  buildServerRack(accent = PALETTE.cyan) {
    const group = new THREE.Group();
    const rack = this.roundedBox(
      0.68,
      1.72,
      0.64,
      this.standardMaterial(0x141821, { roughness: 0.32, metalness: 0.55 }),
      0.045
    );
    rack.position.y = 0.86;
    group.add(rack);

    const railMat = this.standardMaterial(0x384152, { roughness: 0.35, metalness: 0.65 });
    [-0.28, 0.28].forEach(x => {
      const rail = this.roundedBox(0.04, 1.55, 0.035, railMat.clone(), 0.01);
      rail.position.set(x, 0.86, 0.33);
      group.add(rail);
    });

    for (let i = 0; i < 7; i++) {
      const unit = this.roundedBox(0.48, 0.12, 0.025, this.standardMaterial(0x202735), 0.012);
      unit.position.set(0, 0.22 + i * 0.2, 0.35);
      group.add(unit);

      const lightMat = this.standardMaterial(i % 3 === 0 ? PALETTE.green : accent, {
        emissive: i % 3 === 0 ? PALETTE.green : accent,
        emissiveIntensity: 0.8
      });
      const light = this.roundedBox(0.045, 0.045, 0.018, lightMat, 0.012);
      light.position.set(-0.18 + (i % 2) * 0.09, 0.22 + i * 0.2, 0.372);
      group.add(light);
      this.registerPulse(lightMat, 0.35, 1.1, 0.7 + i * 0.17);
    }

    return group;
  }

  buildCoffeeMachine() {
    const group = new THREE.Group();
    const table = this.roundedBox(0.64, 0.08, 0.46, this.standardMaterial(PALETTE.wood), 0.035);
    table.position.y = 0.58;
    group.add(table);

    const body = this.roundedBox(
      0.34,
      0.44,
      0.34,
      this.standardMaterial(0x1f2937, { roughness: 0.35, metalness: 0.45 }),
      0.05
    );
    body.position.y = 0.84;
    group.add(body);

    const panel = this.roundedBox(
      0.18,
      0.08,
      0.025,
      this.standardMaterial(PALETTE.cyan, { emissive: PALETTE.cyan, emissiveIntensity: 0.32 }),
      0.012
    );
    panel.position.set(0, 0.91, 0.18);
    group.add(panel);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.045, 0.1, 16),
      this.standardMaterial(0xf8fafc, { roughness: 0.5 })
    );
    cup.position.set(0.18, 0.67, 0.06);
    group.add(cup);

    return group;
  }

  buildBugBoard() {
    const group = new THREE.Group();
    const board = this.roundedBox(
      1.25,
      0.82,
      0.045,
      this.standardMaterial(0xf8f2d9, { roughness: 0.85 }),
      0.025
    );
    board.position.y = 1.12;
    group.add(board);

    const noteColors = [PALETTE.red, PALETTE.amber, PALETTE.green, PALETTE.cyan, PALETTE.violet, PALETTE.red];
    noteColors.forEach((color, i) => {
      const note = this.roundedBox(
        0.16,
        0.12,
        0.012,
        this.standardMaterial(color, { roughness: 0.7, emissive: color, emissiveIntensity: 0.04 }),
        0.01
      );
      note.position.set(-0.42 + (i % 3) * 0.32, 1.01 + Math.floor(i / 3) * 0.24, 0.038);
      group.add(note);
    });

    return group;
  }

  buildDeviceShelf() {
    const group = new THREE.Group();
    const wood = this.standardMaterial(PALETTE.wood);
    for (let i = 0; i < 3; i++) {
      const shelf = this.roundedBox(0.92, 0.055, 0.34, wood.clone(), 0.025);
      shelf.position.y = 0.42 + i * 0.43;
      group.add(shelf);
    }

    const deviceColors = [0x111827, 0x334155, 0x475569, 0x0f172a];
    deviceColors.forEach((color, i) => {
      const device = this.roundedBox(0.18, 0.12, 0.24, this.standardMaterial(color), 0.025);
      device.position.set(-0.3 + (i % 2) * 0.32, 0.53 + Math.floor(i / 2) * 0.43, 0);
      group.add(device);
    });

    return group;
  }

  buildMonitorWall() {
    const group = new THREE.Group();
    const colors = [PALETTE.green, PALETTE.cyan, PALETTE.amber, PALETTE.violet, PALETTE.cyan, PALETTE.green];

    colors.forEach((color, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const monitor = this.roundedBox(
        0.76,
        0.46,
        0.035,
        this.standardMaterial(0x07111f, {
          roughness: 0.3,
          metalness: 0.15,
          emissive: color,
          emissiveIntensity: 0.36
        }),
        0.025
      );
      monitor.position.set(-0.84 + col * 0.84, 0.88 + row * 0.52, 0);
      group.add(monitor);
      this.registerPulse(monitor.material, 0.2, 0.5, 0.45 + i * 0.12);
    });

    const mount = this.roundedBox(2.72, 1.16, 0.045, this.standardMaterial(0x111827), 0.035);
    mount.position.set(0, 1.14, -0.04);
    group.add(mount);

    return group;
  }

  buildStatusLights() {
    const group = new THREE.Group();
    const colors = [PALETTE.green, PALETTE.green, PALETTE.amber, PALETTE.green, PALETTE.red];
    colors.forEach((color, i) => {
      const mat = this.standardMaterial(color, { emissive: color, emissiveIntensity: 1.0 });
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 12), mat);
      light.position.set(0, 0.38 + i * 0.18, 0);
      group.add(light);
      this.registerPulse(mat, 0.55, 1.2, 0.6 + i * 0.2);
    });

    const mast = this.roundedBox(0.055, 1.08, 0.055, this.standardMaterial(PALETTE.metal), 0.02);
    mast.position.y = 0.68;
    group.add(mast);

    return group;
  }

  buildCouch() {
    const group = new THREE.Group();
    const fabric = this.standardMaterial(0x3b4268, { roughness: 0.82 });
    const seat = this.roundedBox(1.55, 0.26, 0.68, fabric.clone(), 0.09);
    seat.position.y = 0.28;
    group.add(seat);

    const back = this.roundedBox(1.55, 0.48, 0.16, fabric.clone(), 0.08);
    back.position.set(0, 0.52, -0.28);
    group.add(back);

    [-0.78, 0.78].forEach(x => {
      const arm = this.roundedBox(0.16, 0.34, 0.68, fabric.clone(), 0.08);
      arm.position.set(x, 0.38, 0);
      group.add(arm);
    });

    return group;
  }

  buildCoffeeTable() {
    const group = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32),
      this.standardMaterial(PALETTE.wood, { roughness: 0.4, metalness: 0.08 })
    );
    top.position.y = 0.38;
    group.add(top);

    const leg = this.roundedBox(0.12, 0.34, 0.12, this.standardMaterial(PALETTE.metal), 0.04);
    leg.position.y = 0.19;
    group.add(leg);

    return group;
  }

  buildPlantCluster() {
    const group = new THREE.Group();
    [
      [-0.35, 0, 0.05, 0.9],
      [0.0, 0, -0.08, 1.15],
      [0.36, 0, 0.08, 0.82]
    ].forEach(([x, y, z, scale]) => {
      const plant = this.buildPlant();
      plant.position.set(x, y, z);
      plant.scale.setScalar(scale);
      group.add(plant);
    });
    return group;
  }

  buildPlant() {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.1, 0.18, 18),
      this.standardMaterial(0x9a5b2f, { roughness: 0.72 })
    );
    pot.position.y = 0.09;
    group.add(pot);

    const leafMat = this.standardMaterial(0x2f8f4e, { roughness: 0.78 });
    const leafPositions = [
      [0, 0.28, 0],
      [0.11, 0.36, 0.02],
      [-0.1, 0.34, 0.03],
      [0.03, 0.44, -0.08]
    ];
    leafPositions.forEach(([x, y, z], i) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.16 : 0.11, 14, 10), leafMat.clone());
      leaf.scale.set(1, 0.72, 1);
      leaf.position.set(x, y, z);
      group.add(leaf);
    });

    return group;
  }

  buildLogoWall() {
    const group = new THREE.Group();
    const wall = this.roundedBox(1.55, 1.35, 0.1, this.standardMaterial(0x161a2b), 0.035);
    wall.position.y = 0.9;
    group.add(wall);

    const logoMat = this.standardMaterial(PALETTE.cyan, {
      roughness: 0.35,
      metalness: 0.2,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.82
    });

    const mark = this.roundedBox(0.82, 0.18, 0.035, logoMat, 0.025);
    mark.position.set(0, 1.02, 0.07);
    group.add(mark);

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 12), logoMat.clone());
    dot.position.set(-0.52, 1.02, 0.08);
    group.add(dot);

    return group;
  }

  buildTrophyCase() {
    const group = new THREE.Group();
    const base = this.roundedBox(0.72, 0.18, 0.5, this.standardMaterial(PALETTE.wood), 0.04);
    base.position.y = 0.1;
    group.add(base);

    const glass = this.roundedBox(
      0.66,
      0.9,
      0.46,
      this.standardMaterial(0xc7e8ff, { roughness: 0.08, metalness: 0.04, opacity: 0.22 }),
      0.04
    );
    glass.position.y = 0.62;
    group.add(glass);

    const trophyMat = this.standardMaterial(0xffd166, {
      roughness: 0.18,
      metalness: 0.78,
      emissive: 0xffc857,
      emissiveIntensity: 0.28
    });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.08, 0.22, 24), trophyMat);
    cup.position.y = 0.66;
    group.add(cup);

    const stem = this.roundedBox(0.06, 0.26, 0.06, trophyMat.clone(), 0.018);
    stem.position.y = 0.45;
    group.add(stem);

    return group;
  }

  buildVoidWindow() {
    const group = new THREE.Group();
    const frame = this.roundedBox(2.05, 1.35, 0.1, this.standardMaterial(0x263044), 0.045);
    frame.position.y = 1.02;
    group.add(frame);

    const glass = this.roundedBox(
      1.82,
      1.12,
      0.035,
      this.standardMaterial(0x07111f, {
        roughness: 0.12,
        metalness: 0.1,
        opacity: 0.72,
        emissive: PALETTE.violet,
        emissiveIntensity: 0.22
      }),
      0.035
    );
    glass.position.set(0, 1.02, 0.07);
    group.add(glass);

    const crossMat = this.standardMaterial(0x334155, { metalness: 0.45, roughness: 0.38 });
    const vertical = this.roundedBox(0.045, 1.16, 0.05, crossMat.clone(), 0.01);
    vertical.position.set(0, 1.02, 0.09);
    group.add(vertical);

    const horizontal = this.roundedBox(1.82, 0.045, 0.05, crossMat.clone(), 0.01);
    horizontal.position.set(0, 1.02, 0.09);
    group.add(horizontal);

    return group;
  }

  buildGenericBox() {
    const group = new THREE.Group();
    const box = this.roundedBox(0.56, 0.56, 0.56, this.standardMaterial(0x3b4268), 0.05);
    box.position.y = 0.28;
    group.add(box);
    return group;
  }

  roundedBox(width, height, depth, material, radius = 0.03) {
    const geometry = radius > 0
      ? new RoundedBoxGeometry(width, height, depth, 3, radius)
      : new THREE.BoxGeometry(width, height, depth);
    return new THREE.Mesh(geometry, material);
  }

  standardMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.58,
      metalness: options.metalness ?? 0.16,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
      transparent: options.opacity !== undefined && options.opacity < 1,
      opacity: options.opacity ?? 1
    });
  }

  prepareObject(object) {
    object.traverse(child => {
      if (!child.isMesh && !child.isLineSegments) return;
      child.castShadow = child.isMesh;
      child.receiveShadow = child.isMesh;
    });
  }

  registerPulse(material, min, max, speed) {
    this.pulseMaterials.push({
      material,
      min,
      max,
      speed,
      phase: Math.random() * Math.PI * 2
    });
  }

  materializeObject(object) {
    const materials = this.collectMaterials(object).map(material => ({
      material,
      opacity: material.opacity,
      transparent: material.transparent,
      depthWrite: material.depthWrite
    }));

    materials.forEach(({ material }) => {
      material.transparent = true;
      material.opacity = 0;
      material.depthWrite = false;
    });

    this.materializedObjects.push({
      object,
      materials,
      startTime: this.clock.getElapsedTime(),
      duration: MATERIALIZE_DURATION,
      baseScale: object.scale.clone(),
      baseY: object.position.y,
      completed: false
    });
  }

  collectMaterials(object) {
    const materials = new Set();
    object.traverse(child => {
      if (!child.material) return;
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.forEach(material => materials.add(material));
    });
    return [...materials];
  }

  updateMaterializations(elapsed) {
    this.materializedObjects.forEach(entry => {
      if (entry.completed) return;

      const progress = Math.min((elapsed - entry.startTime) / entry.duration, 1);
      const eased = this.easeOutCubic(progress);

      entry.materials.forEach(({ material, opacity }) => {
        material.opacity = opacity * eased;
      });

      const scale = 0.72 + eased * 0.28;
      entry.object.scale.copy(entry.baseScale).multiplyScalar(scale);
      entry.object.position.y = entry.baseY + (1 - eased) * 0.18;

      if (progress >= 1) {
        entry.completed = true;
        entry.object.scale.copy(entry.baseScale);
        entry.object.position.y = entry.baseY;
        entry.materials.forEach(({ material, opacity, transparent, depthWrite }) => {
          material.opacity = opacity;
          material.transparent = transparent;
          material.depthWrite = depthWrite;
        });
      }
    });
  }

  setVoidIntensity(intensity) {
    this.targetVoidIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  updateVoidIntensity() {
    this.voidIntensity += (this.targetVoidIntensity - this.voidIntensity) * 0.025;
    const officeFactor = 1 - this.voidIntensity;

    this.scene.fog.density = 0.018 * this.voidIntensity + 0.004;
    this.lights.ambient.intensity = 0.28 + officeFactor * 0.36;
    this.lights.hemi.intensity = 0.55 + officeFactor * 0.28;
    this.lights.main.intensity = 0.88 + officeFactor * 0.5;
    this.lights.office.intensity = officeFactor * 1.8;

    const bg = new THREE.Color().lerpColors(
      new THREE.Color(PALETTE.void),
      new THREE.Color(0x101827),
      officeFactor
    );
    this.scene.background = bg;

    if (this.voidGrid?.material) {
      this.voidGrid.material.opacity = 0.34 * this.voidIntensity + 0.08;
    }
  }

  unlockItems(items) {
    if (!this.renderer) return;

    const center = this.getItemsCenter(items);
    if (center) {
      this.focusOn(center.x, center.z);
    }

    items.forEach((item, i) => {
      setTimeout(() => {
        if (item.type === 'floor') {
          this.createFloorPlatform(item.gridPos.x, item.gridPos.z, item.size.w, item.size.d, item);
        } else if (item.type === 'wall') {
          this.createWall(item);
        } else {
          this.createFurniture(item.model, item.gridPos.x, item.gridPos.z, item);
        }
      }, i * 240);
    });

    this.setVoidIntensity(this.targetVoidIntensity - 0.15);
  }

  getItemsCenter(items) {
    if (!items?.length) return null;

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    items.forEach(item => {
      const x = item.gridPos?.x ?? 0;
      const z = item.gridPos?.z ?? 0;
      const width = item.size?.w ?? (item.length && item.orientation !== 'vertical' ? item.length : 1);
      const depth = item.size?.d ?? (item.length && item.orientation === 'vertical' ? item.length : 1);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + width - 1);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z + depth - 1);
    });

    return {
      x: (minX + maxX) / 2,
      z: (minZ + maxZ) / 2
    };
  }

  animate() {
    if (!this.renderer) return;

    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    if (this.particles) {
      this.particles.rotation.y += delta * 0.016;
      this.particles.rotation.x += delta * 0.006;
    }

    if (this.ambientParticles) {
      const positions = this.ambientParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed * 0.65 + i) * 0.0018;
        if (positions[i + 1] > 6.5) positions[i + 1] = 0;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.pulseMaterials.forEach(entry => {
      entry.material.emissiveIntensity = THREE.MathUtils.lerp(
        entry.min,
        entry.max,
        (Math.sin(elapsed * entry.speed + entry.phase) + 1) / 2
      );
    });

    this.updateMaterializations(elapsed);
    this.updateVoidIntensity();
    this.animationCallbacks.forEach(callback => callback(elapsed, delta));
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;

    const { width, height } = this.getViewportSize();
    const aspect = width / Math.max(height, 1);
    this.cameraViewSize = width < 760 ? 18 : 16;
    this.camera.left = -this.cameraViewSize * aspect / 2;
    this.camera.right = this.cameraViewSize * aspect / 2;
    this.camera.top = this.cameraViewSize / 2;
    this.camera.bottom = -this.cameraViewSize / 2;
    this.camera.zoom = width < 760 ? Math.min(this.camera.zoom, 0.92) : this.camera.zoom;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  addAnimationCallback(callback) {
    this.animationCallbacks.push(callback);
  }

  focusOn(x, z, animate = true) {
    if (!this.renderer || !this.camera) return;

    const target = new THREE.Vector3(x, 0, z);
    const endPosition = target.clone().add(this.isoOffset);

    if (!animate) {
      this.camera.position.copy(endPosition);
      this.camera.lookAt(target);
      this.cameraTarget.copy(target);
      if (this.controls) {
        this.controls.target.copy(target);
        this.controls.update();
      }
      return;
    }

    const startPosition = this.camera.position.clone();
    const startTarget = this.controls?.target.clone() || this.cameraTarget.clone();
    const duration = 1.1;
    let time = 0;

    const moveCamera = (elapsed, delta) => {
      time += delta;
      const progress = Math.min(time / duration, 1);
      const eased = this.easeOutCubic(progress);
      const currentTarget = startTarget.clone().lerp(target, eased);

      this.camera.position.lerpVectors(startPosition, endPosition, eased);
      this.camera.lookAt(currentTarget);
      this.cameraTarget.copy(currentTarget);

      if (this.controls) {
        this.controls.target.copy(currentTarget);
      }

      if (progress >= 1) {
        this.camera.position.copy(endPosition);
        this.camera.lookAt(target);
        this.cameraTarget.copy(target);
        if (this.controls) {
          this.controls.target.copy(target);
        }
        this.animationCallbacks = this.animationCallbacks.filter(callback => callback !== moveCamera);
      }
    };

    this.addAnimationCallback(moveCamera);
  }
}
