'use strict';
/* ══════════════════════════════════════════════════════════
   ROUTE ROYALE v2 — Open World 3D
   2 joueurs | Choix voiture | Mondes | Vues | Rampes | Drift
══════════════════════════════════════════════════════════ */

const WORLD  = 800;
const HALF   = 400;
const BLOCK  = 80;
const ROAD_W = 14;
const N_BLOCK = 10;

/* ── RENDERER ── */
const canvasEl = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ac0e8);
scene.fog = new THREE.FogExp2(0x9acce8, 0.0022);

const camera  = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 600);
const camera2 = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 600);
camera.position.set(0, 7, -12);
camera2.position.set(0, 7, -12);

/* ── LIGHTS ── */
const hemi = new THREE.HemisphereLight(0xbbd8ff, 0x3d5c1a, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff8e0, 1.3);
sun.position.set(150, 260, 80);
sun.castShadow = true;
sun.shadow.mapSize.width = sun.shadow.mapSize.height = 1024;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 350;
sun.shadow.camera.left = sun.shadow.camera.bottom = -120;
sun.shadow.camera.right = sun.shadow.camera.top = 120;
sun.shadow.bias = -0.002;
scene.add(sun); scene.add(sun.target);

/* ══════════════════════════════════════════
   CAR DEFINITIONS
══════════════════════════════════════════ */
const CAR_TYPES = [
    {
        id: 'sport', name: 'Sportive', emoji: '🏎️',
        stat: 'Vitesse ★★★★★ Drift ★★★',
        maxSpd: 40, accel: 28, brake: 35, steer: 2.4, mass: 1.0,
        friction: 9, driftFactor: 0.18, nitroDrain: 28, nitroRegen: 10,
        bodyW: 2.0, bodyH: 0.55, bodyD: 4.6, cabW: 1.7, cabH: 0.5, cabD: 1.9,
        color: null // set from player color
    },
    {
        id: 'drift', name: 'Drift', emoji: '🌀',
        stat: 'Vitesse ★★★★ Drift ★★★★★',
        maxSpd: 36, accel: 26, brake: 28, steer: 2.8, mass: 0.85,
        friction: 5, driftFactor: 0.42, nitroDrain: 32, nitroRegen: 14,
        bodyW: 2.1, bodyH: 0.6, bodyD: 4.4, cabW: 1.75, cabH: 0.52, cabD: 1.8,
        color: null
    },
    {
        id: 'rally', name: 'Rallye', emoji: '🚙',
        stat: 'Vitesse ★★★★ Tout-terrain ★★★★',
        maxSpd: 38, accel: 30, brake: 33, steer: 2.2, mass: 1.1,
        friction: 8, driftFactor: 0.14, nitroDrain: 24, nitroRegen: 12,
        bodyW: 2.2, bodyH: 0.72, bodyD: 4.5, cabW: 1.9, cabH: 0.68, cabD: 2.2,
        color: null
    },
    {
        id: 'classic', name: 'Classique', emoji: '🚗',
        stat: 'Vitesse ★★★ Style ★★★★★',
        maxSpd: 30, accel: 18, brake: 28, steer: 1.9, mass: 1.3,
        friction: 11, driftFactor: 0.1, nitroDrain: 20, nitroRegen: 8,
        bodyW: 2.1, bodyH: 0.7, bodyD: 4.8, cabW: 1.8, cabH: 0.62, cabD: 2.1,
        color: null
    },
    {
        id: 'mini', name: 'Mini', emoji: '🚘',
        stat: 'Vitesse ★★ Maniabilité ★★★★★',
        maxSpd: 28, accel: 22, brake: 38, steer: 3.0, mass: 0.75,
        friction: 10, driftFactor: 0.08, nitroDrain: 22, nitroRegen: 16,
        bodyW: 1.6, bodyH: 0.58, bodyD: 3.2, cabW: 1.4, cabH: 0.54, cabD: 1.6,
        color: null
    },
    {
        id: 'van', name: 'Camionnette', emoji: '🚐',
        stat: 'Vitesse ★★ Robustesse ★★★★★',
        maxSpd: 25, accel: 15, brake: 22, steer: 1.6, mass: 2.0,
        friction: 10, driftFactor: 0.07, nitroDrain: 18, nitroRegen: 7,
        bodyW: 2.5, bodyH: 0.9, bodyD: 5.2, cabW: 2.3, cabH: 0.85, cabD: 2.6,
        color: null
    },
    {
        id: 'truck', name: 'Camion', emoji: '🚛',
        stat: 'Vitesse ★ Puissance ★★★★★',
        maxSpd: 20, accel: 10, brake: 18, steer: 1.3, mass: 3.0,
        friction: 8, driftFactor: 0.05, nitroDrain: 15, nitroRegen: 5,
        bodyW: 2.8, bodyH: 1.1, bodyD: 7.0, cabW: 2.6, cabH: 1.4, cabD: 2.8,
        color: null
    },
    {
        id: 'suv', name: 'SUV', emoji: '🚙',
        stat: 'Vitesse ★★★ Polyvalent ★★★★',
        maxSpd: 32, accel: 20, brake: 26, steer: 1.8, mass: 1.5,
        friction: 9, driftFactor: 0.09, nitroDrain: 22, nitroRegen: 9,
        bodyW: 2.3, bodyH: 0.85, bodyD: 4.8, cabW: 2.1, cabH: 0.8, cabD: 2.4,
        color: null
    }
];

/* ══════════════════════════════════════════
   GAME CONFIG (filled by setup screen)
══════════════════════════════════════════ */
let gameConfig = {
    mode: 'solo',       // 'solo' | 'multi'
    world: 'city',      // 'city' | 'desert' | 'snow' | 'night'
    p1Car: 0,           // index in CAR_TYPES
    p2Car: 1,
    viewMode: 'third',  // 'third' | 'first' | 'top' | 'hood'
};

/* ══════════════════════════════════════════
   SETUP SCREEN LOGIC
══════════════════════════════════════════ */
const VIEW_MODES = ['third','first','top','hood'];
let currentViewIdx = 0;

function buildCarGrid(gridId, player) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    CAR_TYPES.forEach((car, i) => {
        const btn = document.createElement('button');
        btn.className = 'car-btn';
        if ((player === 1 && i === gameConfig.p1Car) || (player === 2 && i === gameConfig.p2Car)) {
            btn.classList.add(player === 1 ? 'selected-p1' : 'selected-p2');
        }
        btn.innerHTML = `<span class="car-emoji">${car.emoji}</span><span class="car-name">${car.name}</span><span class="car-stat">${car.stat}</span>`;
        btn.onclick = () => {
            if (player === 1) {
                gameConfig.p1Car = i;
                document.querySelectorAll('#car-grid-p1 .car-btn').forEach(b => b.classList.remove('selected-p1'));
            } else {
                gameConfig.p2Car = i;
                document.querySelectorAll('#car-grid-p2 .car-btn').forEach(b => b.classList.remove('selected-p2'));
            }
            btn.classList.add(player === 1 ? 'selected-p1' : 'selected-p2');
        };
        grid.appendChild(btn);
    });
}

function setMode(mode) {
    gameConfig.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    document.getElementById('p2-config').classList.toggle('hidden', mode === 'solo');
}

function setWorld(world) {
    gameConfig.world = world;
    document.querySelectorAll('.world-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-world="${world}"]`).classList.add('active');
}

function setView(view) {
    gameConfig.viewMode = view;
    currentViewIdx = VIEW_MODES.indexOf(view);
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
}

function cycleView() {
    currentViewIdx = (currentViewIdx + 1) % VIEW_MODES.length;
    gameConfig.viewMode = VIEW_MODES[currentViewIdx];
    showViewLabel(gameConfig.viewMode);
}

function showViewLabel(v) {
    const labels = { third:'3e Personne', first:'1re Personne', top:'Vue du Ciel', hood:'Capot' };
    const el = document.getElementById('view-label');
    if (el) {
        el.textContent = '🎥 ' + (labels[v] || v);
        el.classList.add('show');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('show'), 2000);
    }
}

function showSetup() {
    // Reset game state
    gameStarted = false;
    paused = false;
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('split-line').style.display = 'none';
}

function startGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('loading').style.opacity = '1';
    // Clear old scene
    clearScene();
    // Reset players
    resetPlayers();
    // Load
    loadGame();
}

/* ══════════════════════════════════════════
   WORLD THEMES
══════════════════════════════════════════ */
const WORLD_THEMES = {
    city: {
        sky: 0x7ac0e8, fog: 0x9acce8, fogDensity: 0.0022,
        ground: 0x4a4a4a, grass: 0x3d6b2a,
        ambientTop: 0xbbd8ff, ambientBot: 0x3d5c1a,
        sunColor: 0xfff8e0, sunIntensity: 1.3,
        loadMsg: 'Construction de la Cité Royale...'
    },
    desert: {
        sky: 0xe8c880, fog: 0xddb860, fogDensity: 0.0018,
        ground: 0xc8a855, grass: 0xb89040,
        ambientTop: 0xffe8a0, ambientBot: 0x8b6020,
        sunColor: 0xffee80, sunIntensity: 1.8,
        loadMsg: 'Excavation du Désert Ardent...'
    },
    snow: {
        sky: 0xc8dcf0, fog: 0xd8e8f8, fogDensity: 0.003,
        ground: 0xddeeff, grass: 0xb8ccdd,
        ambientTop: 0xd0e8ff, ambientBot: 0x6688aa,
        sunColor: 0xeef8ff, sunIntensity: 0.9,
        loadMsg: 'Congélation de la Toundra...'
    },
    night: {
        sky: 0x060814, fog: 0x0a0c18, fogDensity: 0.003,
        ground: 0x1a1a2a, grass: 0x0d1a0d,
        ambientTop: 0x2233aa, ambientBot: 0x001100,
        sunColor: 0x2244ff, sunIntensity: 0.3,
        loadMsg: 'Allumage des néons nocturnes...'
    }
};

/* ══════════════════════════════════════════
   PLAYER STATE
══════════════════════════════════════════ */
function makePlayer(color, startX, startZ, carTypeIdx) {
    const ct = CAR_TYPES[carTypeIdx];
    return {
        pos: new THREE.Vector3(startX, 0, startZ),
        rot: 0,
        speed: 0,
        nitro: 100,
        nitroOn: false,
        driftAngle: 0,
        color,
        carType: {...ct, color},
        mesh: null,
        wheelMeshes: [],
        wheelAngle: 0,
        camPos: new THREE.Vector3(startX, 7, startZ - 12),
    };
}

let p1 = null, p2 = null;
let gameStarted = false, paused = false;
const colliders = [];
let minimapBase = null;
let nitroFlashTimer = 0;

function resetPlayers() {
    p1 = makePlayer(0xff3333, 8, 0, gameConfig.p1Car);
    p2 = makePlayer(0x3366ff, -8, 0, gameConfig.p2Car);
}

/* ══════════════════════════════════════════
   CLEAR SCENE
══════════════════════════════════════════ */
function clearScene() {
    while (scene.children.length > 0) scene.remove(scene.children[0]);
    colliders.length = 0;
    minimapBase = null;
    // Re-add lights
    scene.add(hemi);
    scene.add(sun);
    scene.add(sun.target);
}

/* ══════════════════════════════════════════
   MATERIALS (dynamic per theme)
══════════════════════════════════════════ */
let MAT_ASPHALT, MAT_GRASS, MAT_SIDEWALK, MAT_STONE, MAT_TRUNK, MAT_FOLIAGE, MAT_WATER, MAT_RAMP;

function buildMaterials(theme) {
    MAT_ASPHALT  = new THREE.MeshLambertMaterial({ color: theme.ground });
    MAT_GRASS    = new THREE.MeshLambertMaterial({ color: theme.grass });
    MAT_SIDEWALK = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'snow' ? 0xccddee : 0x7a7a72 });
    MAT_STONE    = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'snow' ? 0xaabbcc : 0x888870 });
    MAT_TRUNK    = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'snow' ? 0x4a3520 : 0x5c3d1e });
    MAT_FOLIAGE  = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'snow' ? 0xaabbcc : gameConfig.world === 'desert' ? 0x8b7040 : 0x296929 });
    MAT_WATER    = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'desert' ? 0xc8a020 : 0x2255aa });
    MAT_RAMP     = new THREE.MeshLambertMaterial({ color: gameConfig.world === 'night' ? 0x334466 : 0x8a8a88 });
}

/* ══════════════════════════════════════════
   WORLD GENERATION
══════════════════════════════════════════ */
const BLDG_COLORS_CITY   = [0x8c7a5c, 0x6a7a5c, 0x5c6a7a, 0x9a8a6c, 0x7a6a8a, 0x8a7a68, 0x6c7c8c, 0x4a5a6a, 0x9c8a70, 0x7c6c5c, 0x8a9a88, 0x6a8a88];
const BLDG_COLORS_DESERT = [0xc8a855, 0xd4b060, 0xb89040, 0xe0c070, 0xc09850, 0xa88040];
const BLDG_COLORS_SNOW   = [0x889aaa, 0x7a8899, 0x9aacbb, 0x6688aa, 0x8899aa, 0xaabbcc];
const BLDG_COLORS_NIGHT  = [0x112244, 0x0a1a33, 0x1a2255, 0x0d1a44, 0x152266, 0x0a1a44];

function getBldgColors() {
    switch (gameConfig.world) {
        case 'desert': return BLDG_COLORS_DESERT;
        case 'snow':   return BLDG_COLORS_SNOW;
        case 'night':  return BLDG_COLORS_NIGHT;
        default:       return BLDG_COLORS_CITY;
    }
}

function generateWorld() {
    const theme = WORLD_THEMES[gameConfig.world];
    buildMaterials(theme);

    // Sky / fog
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.FogExp2(theme.fog, theme.fogDensity);
    hemi.color.set(theme.ambientTop);
    hemi.groundColor.set(theme.ambientBot);
    sun.color.set(theme.sunColor);
    sun.intensity = theme.sunIntensity;

    // Night: add ambient glow + neon lights
    if (gameConfig.world === 'night') {
        const ambient = new THREE.AmbientLight(0x112244, 0.8);
        scene.add(ambient);
    }

    // Ground
    const gGeo = new THREE.PlaneGeometry(WORLD + 60, WORLD + 60);
    const ground = new THREE.Mesh(gGeo, MAT_ASPHALT);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Snow: add a white overlay
    if (gameConfig.world === 'snow') {
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.25 });
        const snowOverlay = new THREE.Mesh(new THREE.PlaneGeometry(WORLD + 60, WORLD + 60), snowMat);
        snowOverlay.rotation.x = -Math.PI / 2;
        snowOverlay.position.y = 0.01;
        scene.add(snowOverlay);
    }

    addRoadMarkings();

    for (let bx = 0; bx < N_BLOCK; bx++) {
        for (let bz = 0; bz < N_BLOCK; bz++) {
            const cx = -HALF + BLOCK * bx + BLOCK / 2;
            const cz = -HALF + BLOCK * bz + BLOCK / 2;
            const inner = BLOCK - ROAD_W;

            const gPatch = new THREE.Mesh(new THREE.PlaneGeometry(inner, inner), MAT_GRASS);
            gPatch.rotation.x = -Math.PI / 2;
            gPatch.position.set(cx, 0.01, cz);
            gPatch.receiveShadow = true;
            scene.add(gPatch);

            addSidewalk(cx, cz, inner);

            const isCenter = (bx === 4 || bx === 5) && (bz === 4 || bz === 5);
            if (isCenter) {
                if (bx === 4 && bz === 4) addPlaza(cx + BLOCK / 2, cz + BLOCK / 2);
                continue;
            }

            generateBuildings(cx, cz, inner);

            if (Math.random() > 0.35) {
                const hw = inner / 2 - 5;
                const places = [[-hw,-hw],[hw,-hw],[-hw,hw],[hw,hw]];
                const num = 1 + Math.floor(Math.random() * 3);
                shuffle(places).slice(0, num).forEach(([ox, oz]) => addTree(cx + ox, cz + oz));
            }
        }
    }

    // RAMPS — scatter around the world
    addRamps();

    // Night: neon road lines
    if (gameConfig.world === 'night') addNeonLights();

    // World borders
    const borderW = WORLD + 20;
    [{ x:0, z:HALF+2, sx:borderW, sz:4 }, { x:0, z:-HALF-2, sx:borderW, sz:4 },
     { x:HALF+2, z:0, sx:4, sz:borderW }, { x:-HALF-2, z:0, sx:4, sz:borderW }]
    .forEach(b => colliders.push({ minX:b.x-b.sx/2, maxX:b.x+b.sx/2, minZ:b.z-b.sz/2, maxZ:b.z+b.sz/2 }));
}

/* ─── RAMPS ── */
function addRamps() {
    const rampSpots = [
        { x: 120, z: 80,  rotY: 0,        type: 'jump'  },
        { x:-120, z:-80,  rotY: Math.PI,   type: 'jump'  },
        { x: 80,  z:-160, rotY: Math.PI/2, type: 'jump'  },
        { x:-200, z: 120, rotY:-Math.PI/2, type: 'jump'  },
        { x: 200, z: 200, rotY: Math.PI/4, type: 'kink'  },
        { x:-200, z:-200, rotY:-Math.PI/4, type: 'kink'  },
        { x: 0,   z: 240, rotY: Math.PI,   type: 'loop_start' },
        { x: 300, z:-100, rotY: 0,         type: 'jump'  },
        { x:-300, z: 60,  rotY: Math.PI,   type: 'jump'  },
        { x: 160, z:-280, rotY: Math.PI/3, type: 'kink'  },
    ];
    rampSpots.forEach(r => addRamp(r.x, r.z, r.rotY, r.type));
}

function addRamp(x, z, rotY, type) {
    const rampGroup = new THREE.Group();
    rampGroup.position.set(x, 0, z);
    rampGroup.rotation.y = rotY;

    if (type === 'jump') {
        // Approach wedge
        const rampGeo = new THREE.BoxGeometry(8, 2, 12);
        const ramp = new THREE.Mesh(rampGeo, MAT_RAMP);
        ramp.rotation.x = -Math.PI / 8;
        ramp.position.set(0, 1, 4);
        rampGroup.add(ramp);
        // Platform top
        const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 4), MAT_RAMP);
        plat.position.set(0, 2.1, -2);
        rampGroup.add(plat);
        // Sides
        [-3.8, 3.8].forEach(sx => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 14), MAT_RAMP);
            wall.position.set(sx, 1.2, 3);
            rampGroup.add(wall);
        });
        // Collider base
        colliders.push({
            minX: x - 5, maxX: x + 5,
            minZ: z - 2, maxZ: z + 10
        });

    } else if (type === 'kink') {
        // Double bump / S-curve ramp
        for (let i = 0; i < 2; i++) {
            const kink = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 6), MAT_RAMP);
            kink.rotation.x = (i % 2 === 0) ? -Math.PI / 10 : Math.PI / 10;
            kink.position.set(0, 0.75, i * 7 - 3.5);
            rampGroup.add(kink);
        }
        colliders.push({
            minX: x - 6, maxX: x + 6,
            minZ: z - 8, maxZ: z + 8
        });
    }

    // Night: neon stripe on ramp
    if (gameConfig.world === 'night') {
        const neonMat = new THREE.MeshLambertMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 0.8 });
        const neon = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.15), neonMat);
        neon.position.set(0, 2.2, -2);
        rampGroup.add(neon);
    }

    scene.add(rampGroup);
}

function addNeonLights() {
    const neonColors = [0xff0080, 0x00ffcc, 0xffaa00, 0x00aaff, 0xff4400];
    for (let i = 1; i < N_BLOCK; i++) {
        const rx = -HALF + BLOCK * i;
        const rz = -HALF + BLOCK * i;
        // Point lights along roads
        const col = neonColors[i % neonColors.length];
        const pl = new THREE.PointLight(col, 2.5, 40);
        pl.position.set(rx, 5, (Math.random() - 0.5) * WORLD);
        scene.add(pl);
        const pl2 = new THREE.PointLight(col, 2.5, 40);
        pl2.position.set((Math.random() - 0.5) * WORLD, 5, rz);
        scene.add(pl2);
    }
}

/* ─── SIDEWALK ── */
function addSidewalk(cx, cz, inner) {
    const sw = 1.5;
    [
        { x:cx, z:cz-(inner/2+sw/2), sx:inner+sw*2, sz:sw },
        { x:cx, z:cz+(inner/2+sw/2), sx:inner+sw*2, sz:sw },
        { x:cx-(inner/2+sw/2), z:cz, sx:sw, sz:inner },
        { x:cx+(inner/2+sw/2), z:cz, sx:sw, sz:inner },
    ].forEach(p => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(p.sx, p.sz), MAT_SIDEWALK);
        m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.015, p.z); m.receiveShadow = true;
        scene.add(m);
    });
}

/* ─── BUILDINGS ── */
function generateBuildings(cx, cz, inner) {
    const num = 2 + Math.floor(Math.random() * 3);
    const placed = [];
    const hw = inner / 2 - 2.5;
    const BLDG = getBldgColors();

    for (let i = 0; i < num; i++) {
        const bw = 8 + Math.random() * 18;
        const bd = 8 + Math.random() * 18;
        const bh = 7 + Math.random() * 32;
        let ox, oz, ok = false;
        for (let t = 0; t < 12; t++) {
            ox = (Math.random()*2-1)*(hw-bw/2);
            oz = (Math.random()*2-1)*(hw-bd/2);
            const minX=cx+ox-bw/2, maxX=cx+ox+bw/2, minZ=cz+oz-bd/2, maxZ=cz+oz+bd/2;
            ok = placed.every(p => minX>p.maxX+1||maxX<p.minX-1||minZ>p.maxZ+1||maxZ<p.minZ-1);
            if (ok) { placed.push({minX,maxX,minZ,maxZ}); colliders.push({minX:minX-0.5,maxX:maxX+0.5,minZ:minZ-0.5,maxZ:maxZ+0.5}); break; }
        }
        if (!ok) continue;
        const col = BLDG[Math.floor(Math.random() * BLDG.length)];
        const mat = new THREE.MeshLambertMaterial({ color: col });
        if (Math.random() < 0.15 && bw > 10 && bd > 10) addTower(cx+ox, cz+oz, Math.min(bw,bd)/2-1, bh, col);
        else addBoxBuilding(cx+ox, cz+oz, bw, bh, bd, mat);
    }
    const hw2 = inner/2+0.5;
    if (Math.random()>0.5) addLamppost(cx-hw2, cz-hw2);
    if (Math.random()>0.5) addLamppost(cx+hw2, cz+hw2);
}

function addBoxBuilding(x, y, bw, bh, bd, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
    mesh.position.set(x, bh/2, y); mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);

    // Night: glowing windows
    const winMat = gameConfig.world === 'night'
        ? new THREE.MeshLambertMaterial({ color: 0xffee88, emissive: 0xffee88, emissiveIntensity: 0.4 })
        : new THREE.MeshLambertMaterial({ color: 0x223344 });
    const winH = 0.6;
    const floors = Math.floor(bh / 3.5);
    const winRows = Math.min(floors, 8);
    for (let row = 1; row < winRows; row++) {
        const wy = (row/winRows)*bh - bh/2 + 0.5;
        const winGeo = new THREE.BoxGeometry(bw+0.02, winH, bd+0.02);
        scene.add(Object.assign(new THREE.Mesh(winGeo, winMat), { position: new THREE.Vector3(x, wy, y) }));
    }
    if (Math.random()>0.4) {
        const rh = 1.5+Math.random()*4;
        const roof = new THREE.Mesh(new THREE.BoxGeometry(bw*0.5, rh, bd*0.5), mat);
        roof.position.set(x, bh+rh/2, y); roof.castShadow = true; scene.add(roof);
    }
    if (bh>20 && Math.random()>0.5) {
        const merlonH=1.2, merlonW=1.4;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([ax,az]) => {
            const count = ax!==0?Math.floor(bw/3):Math.floor(bd/3);
            const total = ax!==0?bw:bd;
            for(let k=0;k<count;k++) {
                if(k%2===0){
                    const t=((k+0.5)/count)*total-total/2;
                    const mx=ax!==0?x+t:x+az*(bd/2+0.2), mz=az!==0?y+t:y+ax*(bw/2+0.2);
                    const merlon=new THREE.Mesh(new THREE.BoxGeometry(merlonW,merlonH,merlonW),mat);
                    merlon.position.set(mx,bh+merlonH/2,mz); merlon.castShadow=true; scene.add(merlon);
                }
            }
        });
    }
}

function addTower(x, z, radius, height, color) {
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius-0.5, radius, height, 12), mat);
    mesh.position.set(x, height/2, z); mesh.castShadow = true; scene.add(mesh);
    const roofMat = new THREE.MeshLambertMaterial({ color: gameConfig.world==='night'?0x220033:0x6a2222 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(radius, height*0.35, 12), roofMat);
    roof.position.set(x, height+(height*0.35)/2, z); roof.castShadow = true; scene.add(roof);
}

function addTree(x, z) {
    const h = 2.5 + Math.random() * 2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,h,7), MAT_TRUNK);
    trunk.position.set(x, h/2, z); trunk.castShadow = true; scene.add(trunk);
    [[2.0,2.5,h+1],[1.4,2.0,h+2.5],[0.8,1.4,h+3.8]].forEach(([r,fh,fy]) => {
        const f = new THREE.Mesh(new THREE.ConeGeometry(r,fh,7), MAT_FOLIAGE);
        f.position.set(x,fy,z); f.castShadow=true; scene.add(f);
    });
}

function addLamppost(x, z) {
    const postMat = new THREE.MeshLambertMaterial({ color: 0x333322 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,4.5,6), postMat);
    post.position.set(x,2.25,z); post.castShadow=true; scene.add(post);
    const col = gameConfig.world==='night' ? 0x88aaff : 0xffffaa;
    const lampMat = new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: gameConfig.world==='night'?1.2:0.6 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6), lampMat);
    lamp.position.set(x,4.7,z); scene.add(lamp);
    if (gameConfig.world==='night') {
        const pl = new THREE.PointLight(col, 1.8, 20);
        pl.position.set(x,4.5,z); scene.add(pl);
    }
}

function addPlaza(cx, cz) {
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(120,120), MAT_STONE);
    plaza.rotation.x=-Math.PI/2; plaza.position.set(cx,0.02,cz); plaza.receiveShadow=true; scene.add(plaza);
    const base = new THREE.Mesh(new THREE.BoxGeometry(10,0.8,10), MAT_STONE);
    base.position.set(cx,0.4,cz); base.castShadow=true; scene.add(base);
    const oblMat = new THREE.MeshLambertMaterial({ color: gameConfig.world==='night'?0x8888ff:0xaaa888 });
    const obl = new THREE.Mesh(new THREE.CylinderGeometry(0.35,1.5,22,4), oblMat);
    obl.position.set(cx,12,cz); obl.rotation.y=Math.PI/4; obl.castShadow=true; scene.add(obl);
    const tipMat = new THREE.MeshLambertMaterial({ color: 0xc6a84a, emissive: 0xc6a84a, emissiveIntensity: gameConfig.world==='night'?0.8:0 });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.4,1.2,4), tipMat);
    tip.position.set(cx,23.6,cz); tip.castShadow=true; scene.add(tip);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(6,6,0.6,20), MAT_WATER);
    pool.position.set(cx,0.3,cz); scene.add(pool);
    for (let a=0;a<4;a++) {
        const angle=(a/4)*Math.PI*2+Math.PI/4;
        const benchMat=new THREE.MeshLambertMaterial({color:0x7a5c3a});
        const bench=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.4,0.8),benchMat);
        bench.position.set(cx+Math.cos(angle)*14,0.5,cz+Math.sin(angle)*14);
        bench.rotation.y=angle+Math.PI/2; bench.castShadow=true; scene.add(bench);
    }
    for (let a=0;a<8;a++) {
        const angle=(a/8)*Math.PI*2;
        addTree(cx+Math.cos(angle)*30, cz+Math.sin(angle)*30);
    }
    colliders.push({minX:cx-5.5,maxX:cx+5.5,minZ:cz-5.5,maxZ:cz+5.5});
}

function addRoadMarkings() {
    const lineMat = new THREE.MeshLambertMaterial({ color: gameConfig.world==='night'?0x6699ff:0xddddcc });
    const dashLen=5, dashGap=7, dashW=0.25, dashH=0.025;
    for (let i=1;i<N_BLOCK;i++) {
        const rx=-HALF+BLOCK*i;
        for (let dz=-HALF;dz<HALF;dz+=dashLen+dashGap) {
            const m=new THREE.Mesh(new THREE.BoxGeometry(dashW,dashH,dashLen),lineMat);
            m.position.set(rx,0.03,dz+dashLen/2); scene.add(m);
        }
    }
    for (let i=1;i<N_BLOCK;i++) {
        const rz=-HALF+BLOCK*i;
        for (let dx=-HALF;dx<HALF;dx+=dashLen+dashGap) {
            const m=new THREE.Mesh(new THREE.BoxGeometry(dashLen,dashH,dashW),lineMat);
            m.position.set(dx+dashLen/2,0.03,rz); scene.add(m);
        }
    }
}

/* ══════════════════════════════════════════
   CAR MODEL BUILDER
══════════════════════════════════════════ */
function createCarMesh(player) {
    const ct = player.carType;
    const color = player.color;
    const group = new THREE.Group();

    const mBody  = new THREE.MeshPhongMaterial({ color, specular: new THREE.Color(color).multiplyScalar(0.3), shininess: 90 });
    const mDark  = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 30 });
    const mGold  = new THREE.MeshPhongMaterial({ color: 0xc6a84a, specular: 0xffee88, shininess: 120 });
    const mGlass = new THREE.MeshPhongMaterial({ color: 0x6688aa, transparent: true, opacity: 0.5, shininess: 150 });
    const mLight = new THREE.MeshPhongMaterial({ color: 0xffffcc, emissive: 0xffffcc, emissiveIntensity: 0.8 });
    const mTail  = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.7 });

    const { bodyW, bodyH, bodyD, cabW, cabH, cabD } = ct;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), mBody);
    body.position.y = bodyH / 2 + 0.3; body.castShadow = true; group.add(body);

    // Cabin (different for truck/van)
    if (ct.id === 'truck') {
        // Cab at front
        const cab = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), mBody);
        cab.position.set(0, bodyH + cabH/2 + 0.08, bodyD/2 - cabD/2);
        cab.castShadow = true; group.add(cab);
        // Wind
        const wf = new THREE.Mesh(new THREE.PlaneGeometry(cabW-0.3, cabH*0.7), mGlass);
        wf.position.set(0, bodyH + cabH*0.6, bodyD/2 - cabD + 0.05);
        wf.rotation.x = Math.PI/2 + 0.3; group.add(wf);
    } else if (ct.id === 'van') {
        const cab = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), mBody);
        cab.position.set(0, bodyH + cabH/2 + 0.08, 0);
        cab.castShadow = true; group.add(cab);
    } else {
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), mBody);
        cabin.position.set(0, bodyH + cabH/2 + 0.18, -0.1);
        cabin.castShadow = true; group.add(cabin);
        // Windshields
        const wf = new THREE.Mesh(new THREE.PlaneGeometry(cabW-0.3, 0.6), mGlass);
        wf.position.set(0, bodyH + cabH*0.6, cabD/2 - 0.1);
        wf.rotation.x = Math.PI/2+0.38; group.add(wf);
        const wr = new THREE.Mesh(new THREE.PlaneGeometry(cabW-0.3, 0.58), mGlass);
        wr.position.set(0, bodyH + cabH*0.6, -cabD/2 + 0.1);
        wr.rotation.x = Math.PI/2-0.38; group.add(wr);
        // Side windows
        [-cabW/2 - 0.02, cabW/2 + 0.02].forEach(sx => {
            const sw = new THREE.Mesh(new THREE.PlaneGeometry(cabD*0.8, 0.5), mGlass);
            sw.position.set(sx, bodyH + cabH*0.6, -0.1);
            sw.rotation.y = sx > 0 ? Math.PI/2 : -Math.PI/2; group.add(sw);
        });
    }

    // Bumpers
    const fBump = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 0.22, 0.28), mDark);
    fBump.position.set(0, 0.42, bodyD/2 + 0.14); group.add(fBump);
    const rBump = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 0.22, 0.28), mDark);
    rBump.position.set(0, 0.42, -bodyD/2 - 0.14); group.add(rBump);

    // Headlights
    [[-bodyW/2+0.3, bodyH*0.7, bodyD/2+0.05],[bodyW/2-0.3, bodyH*0.7, bodyD/2+0.05]].forEach(([x,y,z]) => {
        group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.38,0.2,0.08), mLight), {position: new THREE.Vector3(x,y,z)}));
    });
    // Tail lights
    [[-bodyW/2+0.3, bodyH*0.7, -bodyD/2-0.05],[bodyW/2-0.3, bodyH*0.7, -bodyD/2-0.05]].forEach(([x,y,z]) => {
        group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.38,0.2,0.08), mTail), {position: new THREE.Vector3(x,y,z)}));
    });

    // Exhaust
    const exGeo = new THREE.CylinderGeometry(0.07,0.05,0.45,8);
    const ex = new THREE.Mesh(exGeo, mDark);
    ex.rotation.x = Math.PI/2; ex.position.set(bodyW/2 - 0.3, 0.32, -bodyD/2 - 0.22); group.add(ex);

    // Spoiler for sport/drift
    if (ct.id === 'sport' || ct.id === 'drift' || ct.id === 'rally') {
        const spMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 60 });
        const sp = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.2, 0.08, 0.6), spMat);
        sp.position.set(0, bodyH + cabH + 0.36, -bodyD/2 + 0.3); group.add(sp);
        [-bodyW/2, bodyW/2].forEach(sx => {
            const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.1), spMat);
            stalk.position.set(sx, bodyH + cabH + 0.2, -bodyD/2 + 0.3); group.add(stalk);
        });
    }

    // Roof bars for rally
    if (ct.id === 'rally') {
        const barMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 40 });
        const bar = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.1, 0.1, 0.1), barMat);
        bar.position.set(0, bodyH + cabH + 0.36, 0); group.add(bar);
        const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, cabD + 0.1), barMat);
        bar2.position.set(0, bodyH + cabH + 0.36, 0); group.add(bar2);
    }

    // Wheels
    const wheelW = 0.28 + (ct.id === 'truck' ? 0.2 : ct.id === 'van' ? 0.1 : 0);
    const wheelR = 0.36 + (ct.id === 'truck' ? 0.15 : ct.id === 'van' ? 0.08 : 0);
    const wox = bodyW / 2 + 0.05;
    const wPositions = [[-wox, wheelR, bodyD/2-1],[wox, wheelR, bodyD/2-1],[-wox, wheelR, -bodyD/2+1],[wox, wheelR, -bodyD/2+1]];
    player.wheelMeshes = [];
    wPositions.forEach(([wx,wy,wz]) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx,wy,wz);
        wGroup.rotation.z = Math.PI/2;
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 18), mDark);
        tire.castShadow = true; wGroup.add(tire);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelR*0.58, wheelR*0.58, wheelW+0.01, 8), mGold);
        wGroup.add(rim);
        for (let s=0;s<5;s++) {
            const ang=(s/5)*Math.PI*2;
            const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.04, wheelR*0.47, 0.05), mGold);
            spoke.position.set(0, Math.sin(ang)*wheelR*0.28, Math.cos(ang)*wheelR*0.28);
            wGroup.add(spoke);
        }
        group.add(wGroup);
        player.wheelMeshes.push(wGroup);
    });

    group.castShadow = true;
    scene.add(group);
    player.mesh = group;
    player.pos.y = 0;
    group.position.copy(player.pos);
    return group;
}

/* ══════════════════════════════════════════
   INPUT
══════════════════════════════════════════ */
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyF') toggleFullscreen();
    if (e.code === 'KeyM') toggleMute();
    if (e.code === 'Escape') togglePause();
    if (e.code === 'KeyV') cycleView();
    if (e.code === 'Enter' && !gameStarted && document.getElementById('setup-screen').classList.contains('hidden') === false) startGame();
    const prevent = ['KeyZ','KeyQ','KeyS','KeyD','ShiftLeft','ShiftRight','Space',
                     'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ControlLeft','ControlRight'];
    if (prevent.includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

/* ══════════════════════════════════════════
   PHYSICS — per player
══════════════════════════════════════════ */
function updatePlayer(pl, dt, fwd, back, left, right, nitroKey) {
    if (!gameStarted || paused) return;
    const ct = pl.carType;
    const maxSpd = pl.nitroOn ? ct.maxSpd * 1.9 : ct.maxSpd;

    // Acceleration
    if (fwd) {
        pl.speed += ct.accel * dt;
        if (pl.nitroOn) pl.speed += 44 * dt;
    } else if (back) {
        if (pl.speed > 1) pl.speed -= ct.brake * dt;
        else pl.speed -= ct.accel * 0.5 * dt;
    } else {
        const fric = ct.friction * dt;
        if (Math.abs(pl.speed) < fric) pl.speed = 0;
        else pl.speed -= Math.sign(pl.speed) * fric;
    }

    // Nitro
    const wantNitro = nitroKey && fwd;
    pl.nitroOn = wantNitro && pl.nitro > 0;
    if (pl.nitroOn) pl.nitro = Math.max(0, pl.nitro - ct.nitroDrain * dt);
    else pl.nitro = Math.min(100, pl.nitro + ct.nitroRegen * dt);

    pl.speed = Math.max(-maxSpd * 0.45, Math.min(maxSpd, pl.speed));

    // Steering with drift
    const steerPower = Math.min(Math.abs(pl.speed) / 6, 1) * ct.steer * dt;
    const steerDir = pl.speed >= 0 ? 1 : -1;
    let steer = 0;
    if (left) steer = -steerPower * steerDir;
    if (right) steer = steerPower * steerDir;

    // Drift: lateral slide
    if (ct.driftFactor > 0.15 && (left || right) && Math.abs(pl.speed) > ct.maxSpd * 0.3) {
        const driftStrength = ct.driftFactor * Math.abs(pl.speed) / ct.maxSpd;
        pl.driftAngle += (steer * driftStrength - pl.driftAngle * 2) * dt * 5;
    } else {
        pl.driftAngle *= (1 - dt * 6);
    }

    pl.rot += steer + pl.driftAngle * dt * 0.3;

    const prevX = pl.pos.x, prevZ = pl.pos.z;
    pl.pos.x += Math.sin(pl.rot + pl.driftAngle) * pl.speed * dt;
    pl.pos.z += Math.cos(pl.rot + pl.driftAngle) * pl.speed * dt;

    pl.pos.x = Math.max(-HALF+5, Math.min(HALF-5, pl.pos.x));
    pl.pos.z = Math.max(-HALF+5, Math.min(HALF-5, pl.pos.z));

    // Collisions
    const radius = ct.bodyW / 2 + 0.2;
    for (const c of colliders) {
        const clampX = Math.max(c.minX, Math.min(c.maxX, pl.pos.x));
        const clampZ = Math.max(c.minZ, Math.min(c.maxZ, pl.pos.z));
        const dx = pl.pos.x - clampX, dz = pl.pos.z - clampZ;
        if (dx*dx + dz*dz < radius*radius) {
            pl.pos.x = prevX; pl.pos.z = prevZ;
            pl.speed *= -0.2; break;
        }
    }

    // Wheel roll
    pl.wheelAngle += (pl.speed * dt) / 0.36;
    pl.wheelMeshes.forEach(wg => { wg.rotation.y = pl.wheelAngle; });

    if (pl.mesh) {
        pl.mesh.position.set(pl.pos.x, 0, pl.pos.z);
        // Drift tilt
        pl.mesh.rotation.y = pl.rot;
        pl.mesh.rotation.z = pl.driftAngle * -0.12;
    }
}

function updatePhysics(dt) {
    // P1: ZQSD + Shift
    updatePlayer(p1, dt,
        keys['KeyZ'], keys['KeyS'], keys['KeyQ'], keys['KeyD'],
        keys['ShiftLeft'] || keys['ShiftRight']
    );
    // P2: Arrows + Ctrl
    if (gameConfig.mode === 'multi') {
        updatePlayer(p2, dt,
            keys['ArrowUp'], keys['ArrowDown'], keys['ArrowLeft'], keys['ArrowRight'],
            keys['ControlLeft'] || keys['ControlRight']
        );
    }
}

/* ══════════════════════════════════════════
   CAMERA
══════════════════════════════════════════ */
const _camTarget = new THREE.Vector3();
const _cam2Target = new THREE.Vector3();

function updateCameraForPlayer(pl, cam, targetVec, dt) {
    const speedAbs = Math.abs(pl.speed);
    const vm = gameConfig.viewMode;

    let tx, ty, tz;

    if (vm === 'third') {
        const dist = 10 + speedAbs * 0.12;
        const height = 4.5 + speedAbs * 0.04;
        tx = pl.pos.x - Math.sin(pl.rot) * dist;
        ty = pl.pos.y + height;
        tz = pl.pos.z - Math.cos(pl.rot) * dist;
    } else if (vm === 'first') {
        const h = pl.carType.bodyH + pl.carType.cabH + 0.4;
        tx = pl.pos.x + Math.sin(pl.rot) * 0.2;
        ty = pl.pos.y + h;
        tz = pl.pos.z + Math.cos(pl.rot) * 0.2;
    } else if (vm === 'top') {
        tx = pl.pos.x;
        ty = pl.pos.y + 18 + speedAbs * 0.05;
        tz = pl.pos.z;
    } else if (vm === 'hood') {
        const h = pl.carType.bodyH + 0.3;
        tx = pl.pos.x + Math.sin(pl.rot) * (pl.carType.bodyD / 2 - 0.5);
        ty = pl.pos.y + h;
        tz = pl.pos.z + Math.cos(pl.rot) * (pl.carType.bodyD / 2 - 0.5);
    }

    cam.position.x += (tx - cam.position.x) * 7 * dt;
    cam.position.y += (ty - cam.position.y) * 5 * dt;
    cam.position.z += (tz - cam.position.z) * 7 * dt;

    const lookAhead = vm === 'top' ? 0 : 3;
    targetVec.set(
        pl.pos.x + Math.sin(pl.rot) * lookAhead,
        pl.pos.y + (vm === 'top' ? 0 : 1.4),
        pl.pos.z + Math.cos(pl.rot) * lookAhead
    );
    cam.lookAt(targetVec);

    const targetFOV = vm === 'top' ? 80 : 68 + speedAbs * 0.35 + (pl.nitroOn ? 8 : 0);
    cam.fov += (targetFOV - cam.fov) * 5 * dt;
    cam.updateProjectionMatrix();
}

function updateCamera(dt) {
    if (!gameStarted) return;
    updateCameraForPlayer(p1, camera, _camTarget, dt);
    if (gameConfig.mode === 'multi') updateCameraForPlayer(p2, camera2, _cam2Target, dt);
    sun.position.set(p1.pos.x + 150, 260, p1.pos.z + 80);
    sun.target.position.set(p1.pos.x, 0, p1.pos.z);
    sun.target.updateMatrixWorld();
}

/* ══════════════════════════════════════════
   RENDER — splitscreen for multi
══════════════════════════════════════════ */
function renderFrame() {
    if (gameConfig.mode === 'multi') {
        const W = window.innerWidth, H = window.innerHeight;
        // Top half: P1
        renderer.setScissorTest(true);
        renderer.setScissor(0, H/2, W, H/2);
        renderer.setViewport(0, H/2, W, H/2);
        camera.aspect = W / (H/2);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        // Bottom half: P2
        renderer.setScissor(0, 0, W, H/2);
        renderer.setViewport(0, 0, W, H/2);
        camera2.aspect = W / (H/2);
        camera2.updateProjectionMatrix();
        renderer.render(scene, camera2);
        renderer.setScissorTest(false);
    } else {
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
}

/* ══════════════════════════════════════════
   SPEEDOMETER
══════════════════════════════════════════ */
function drawSpeedo(ctx, cvs, kmh, playerColor) {
    const w = cvs.width, h = cvs.height;
    const cx = w/2, cy = h/2 + 8;
    const R = cvs.width === 120 ? 52 : 72;
    const startA = Math.PI*0.72, endA = Math.PI*2.28;
    const maxKmh = 250, pct = Math.min(kmh/maxKmh, 1);

    ctx.clearRect(0,0,w,h);

    // Glow
    const grd = ctx.createRadialGradient(cx,cy,R-8,cx,cy,R+10);
    grd.addColorStop(0,'rgba(198,168,74,0.15)'); grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,R+4,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();

    // BG arc
    ctx.beginPath(); ctx.arc(cx,cy,R,startA,endA);
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=7; ctx.stroke();

    // Color arc (use player color)
    const col = kmh>200?'#ff3333':kmh>130?'#ff9900':'#c6a84a';
    ctx.beginPath(); ctx.arc(cx,cy,R,startA,startA+pct*(endA-startA));
    ctx.strokeStyle=col; ctx.lineWidth=7; ctx.lineCap='round'; ctx.stroke(); ctx.lineCap='butt';

    // Ticks
    const smallR = R < 60 ? 2 : 8;
    for (let i=0;i<=10;i++) {
        const a=startA+(i/10)*(endA-startA);
        const major=(i%2===0);
        const r1=R-(major?(R<60?8:13):(R<60?4:6)), r2=R-2;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a)*r1, cy+Math.sin(a)*r1);
        ctx.lineTo(cx+Math.cos(a)*r2, cy+Math.sin(a)*r2);
        ctx.strokeStyle=major?'rgba(198,168,74,0.9)':'rgba(198,168,74,0.4)';
        ctx.lineWidth=major?2.5:1; ctx.stroke();
        if (major && R > 60) {
            const lr=R-24;
            ctx.fillStyle='rgba(198,168,74,0.55)'; ctx.font='9px Cinzel,serif';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(Math.round((i/10)*maxKmh), cx+Math.cos(a)*lr, cy+Math.sin(a)*lr);
        }
    }

    // Needle
    const nA = startA + pct*(endA-startA);
    ctx.beginPath();
    ctx.moveTo(cx-Math.cos(nA)*12, cy-Math.sin(nA)*12);
    ctx.lineTo(cx+Math.cos(nA)*(R-18), cy+Math.sin(nA)*(R-18));
    ctx.strokeStyle='#ff3333'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.stroke(); ctx.lineCap='butt';

    // Center
    ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2); ctx.fillStyle='#c6a84a'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fillStyle='#e8c96a'; ctx.fill();
}

/* ══════════════════════════════════════════
   MINIMAP
══════════════════════════════════════════ */
const mmCvs = document.getElementById('minimap-canvas');
const mmCtx  = mmCvs.getContext('2d');
const MM = 160;

function prerenderMinimap() {
    const off = document.createElement('canvas');
    off.width = MM; off.height = MM;
    const c = off.getContext('2d');

    const grassCol = gameConfig.world==='desert'?'#b89040':gameConfig.world==='snow'?'#9ab8cc':gameConfig.world==='night'?'#0a1a0a':'#3a6b2a';
    c.fillStyle = grassCol; c.fillRect(0,0,MM,MM);

    c.fillStyle = gameConfig.world==='night'?'#1a1a33':'#555555';
    for (let i=0;i<=N_BLOCK;i++) {
        const t=i/N_BLOCK, pw=t*MM;
        const rw=Math.ceil((ROAD_W/WORLD)*MM);
        c.fillRect(pw-rw/2,0,rw,MM);
        c.fillRect(0,pw-rw/2,MM,rw);
    }

    c.fillStyle='#1a1a1a';
    colliders.forEach(col => {
        const sw=col.maxX-col.minX, sd=col.maxZ-col.minZ;
        if(sw>80||sd>80) return;
        const px=((col.minX+HALF)/WORLD)*MM, pz=((col.minZ+HALF)/WORLD)*MM;
        c.fillRect(px,pz,(sw/WORLD)*MM,(sd/WORLD)*MM);
    });

    minimapBase = off;
}

function drawMinimap() {
    if (!minimapBase) return;
    mmCtx.clearRect(0,0,MM,MM);
    mmCtx.drawImage(minimapBase,0,0);

    // P1 arrow
    const px1=((p1.pos.x+HALF)/WORLD)*MM, pz1=((p1.pos.z+HALF)/WORLD)*MM;
    drawMinimapArrow(mmCtx, px1, pz1, p1.rot, '#ff3333', '#ffaaaa');

    // P2 arrow
    if (gameConfig.mode === 'multi') {
        const px2=((p2.pos.x+HALF)/WORLD)*MM, pz2=((p2.pos.z+HALF)/WORLD)*MM;
        drawMinimapArrow(mmCtx, px2, pz2, p2.rot, '#3366ff', '#aaccff');
    }

    mmCtx.fillStyle='rgba(198,168,74,0.6)';
    mmCtx.font='8px Cinzel,serif'; mmCtx.textAlign='center';
    mmCtx.fillText('N',MM/2,9);
}

function drawMinimapArrow(ctx, px, pz, rot, fill, stroke) {
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0,-6); ctx.lineTo(3.5,4); ctx.lineTo(0,2); ctx.lineTo(-3.5,4);
    ctx.closePath();
    ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=0.5; ctx.stroke();
    ctx.restore();
}

/* ══════════════════════════════════════════
   HUD UPDATE
══════════════════════════════════════════ */
const speedoCvs = document.getElementById('speedo-canvas');
const speedoCtx  = speedoCvs.getContext('2d');
const p2SpeedoCvs = document.getElementById('p2-speedo-canvas');
const p2SpeedoCtx  = p2SpeedoCvs ? p2SpeedoCvs.getContext('2d') : null;

function updateHUD() {
    // P1
    const kmh1 = Math.abs(p1.speed) * 3.6;
    document.getElementById('speed-num').textContent = Math.round(kmh1);
    drawSpeedo(speedoCtx, speedoCvs, kmh1, p1.color);

    const fill1 = document.getElementById('nitro-fill');
    fill1.style.width = p1.nitro + '%';
    fill1.classList.toggle('low', p1.nitro < 20);

    document.getElementById('nitro-icon').classList.toggle('active', p1.nitroOn);
    document.getElementById('nitro-flash').classList.toggle('hidden', !p1.nitroOn);
    document.getElementById('nitro-vignette').classList.toggle('active', p1.nitroOn);
    document.getElementById('speed-lines').classList.toggle('active', Math.abs(p1.speed) > p1.carType.maxSpd * 0.7);

    // P2
    if (gameConfig.mode === 'multi' && p2SpeedoCtx) {
        const kmh2 = Math.abs(p2.speed) * 3.6;
        document.getElementById('p2-speed-num').textContent = Math.round(kmh2);
        drawSpeedo(p2SpeedoCtx, p2SpeedoCvs, kmh2, p2.color);
        const fill2 = document.getElementById('p2-nitro-fill');
        if (fill2) { fill2.style.width = p2.nitro + '%'; fill2.classList.toggle('low', p2.nitro < 20); }
        const icon2 = document.getElementById('p2-nitro-icon');
        if (icon2) icon2.classList.toggle('active', p2.nitroOn);
    }

    drawMinimap();
}

/* ══════════════════════════════════════════
   SOUND
══════════════════════════════════════════ */
let audioCtx=null, engineOsc=null, engineGain=null, muted=false;

function initSound() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        engineOsc = audioCtx.createOscillator();
        engineOsc.type = 'sawtooth'; engineOsc.frequency.value = 70;
        const shaper = audioCtx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i=0;i<256;i++) { const x=(i*2)/256-1; curve[i]=(Math.PI+300)*x/(Math.PI+300*Math.abs(x)); }
        shaper.curve = curve;
        const lpf = audioCtx.createBiquadFilter();
        lpf.type = 'lowpass'; lpf.frequency.value = 900; lpf.Q.value = 0.8;
        engineGain = audioCtx.createGain(); engineGain.gain.value = 0;
        engineOsc.connect(shaper); shaper.connect(lpf); lpf.connect(engineGain); engineGain.connect(audioCtx.destination);
        engineOsc.start();
        engineGain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.5);
    } catch(e) {}
}

function updateSound(speed, boost) {
    if (!audioCtx || muted) return;
    const t = Math.min(Math.abs(speed) / (p1.carType.maxSpd * 1.9), 1);
    engineOsc.frequency.setTargetAtTime(55+t*200+(boost?40:0), audioCtx.currentTime, 0.06);
    engineGain.gain.setTargetAtTime(0.04+t*0.10, audioCtx.currentTime, 0.1);
}

function toggleMute() {
    muted = !muted;
    if (engineGain) engineGain.gain.setTargetAtTime(muted?0:0.06, audioCtx.currentTime, 0.1);
    const label = muted ? '🔇' : '🔊';
    const btn = document.getElementById('sound-btn');
    const pauseBtn = document.getElementById('mute-btn-pause');
    if (btn) btn.textContent = label;
    if (pauseBtn) pauseBtn.textContent = label + (muted?' Son coupé':' Son activé');
}

/* ══════════════════════════════════════════
   PAUSE / FULLSCREEN
══════════════════════════════════════════ */
function togglePause() {
    if (!gameStarted) return;
    paused = !paused;
    document.getElementById('pause-menu').classList.toggle('hidden', !paused);
    if (!paused && audioCtx?.state === 'suspended') audioCtx.resume();
}
function resumeGame() {
    paused = false;
    document.getElementById('pause-menu').classList.add('hidden');
    if (audioCtx?.state === 'suspended') audioCtx.resume();
}
function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
}

/* ══════════════════════════════════════════
   LOADING
══════════════════════════════════════════ */
function setLoad(pct, msg) {
    document.getElementById('load-bar').style.width = pct + '%';
    document.getElementById('load-status').textContent = msg;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function loadGame() {
    setLoad(5, 'Initialisation du moteur...');
    await sleep(80);
    const theme = WORLD_THEMES[gameConfig.world];
    setLoad(15, theme.loadMsg);
    await sleep(60);
    generateWorld();
    setLoad(55, 'Fabrication des véhicules...');
    await sleep(60);
    createCarMesh(p1);
    if (gameConfig.mode === 'multi') createCarMesh(p2);
    setLoad(72, 'Cartographie du royaume...');
    await sleep(50);
    prerenderMinimap();
    setLoad(88, 'Démarrage du moteur...');
    await sleep(100);
    initSound();
    setLoad(98, 'C\'est parti !');
    await sleep(300);
    setLoad(100, '⚔ En route !');
    await sleep(400);

    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    await sleep(600);
    loading.style.display = 'none';

    document.getElementById('hud').classList.remove('hidden');

    // Splitscreen divider & P2 HUD
    const splitLine = document.getElementById('split-line');
    const p2HudBar = document.getElementById('p2-hud-bar');
    if (gameConfig.mode === 'multi') {
        splitLine.style.display = 'block';
        splitLine.style.top = '50%';
        if (p2HudBar) p2HudBar.classList.remove('hidden');
    } else {
        if (p2HudBar) p2HudBar.classList.add('hidden');
    }

    // View label
    const viewLabelEl = document.getElementById('view-label');
    if (!viewLabelEl) {
        const vl = document.createElement('div');
        vl.id = 'view-label'; document.getElementById('hud').appendChild(vl);
    }

    gameStarted = true;
}

/* ══════════════════════════════════════════
   RESIZE
══════════════════════════════════════════ */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ══════════════════════════════════════════
   MAIN LOOP
══════════════════════════════════════════ */
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (gameStarted && !paused) {
        updatePhysics(dt);
        updateCamera(dt);
        updateHUD();
        updateSound(p1.speed, p1.nitroOn);
    } else if (!gameStarted) {
        updateCamera(dt);
    }
    renderFrame();
}

function shuffle(arr) {
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
}

/* ══════════════════════════════════════════
   BOOT — Show setup screen first
══════════════════════════════════════════ */
function boot() {
    // Build car grids
    buildCarGrid('car-grid-p1', 1);
    buildCarGrid('car-grid-p2', 2);
    // Show setup screen
    document.getElementById('loading').style.display = 'none';
    document.getElementById('setup-screen').classList.remove('hidden');
    // Add split line element if missing
    if (!document.getElementById('split-line')) {
        const sl = document.createElement('div');
        sl.id = 'split-line'; document.body.appendChild(sl);
    }
}

requestAnimationFrame(animate);
boot();
