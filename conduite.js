'use strict';
/* ══════════════════════════════════════════════════════════
   ROUTE ROYALE v4 — AZERTY/QWERTY · Bots · Console Dev
   Drift Space/. · Stuck Arrow · Quality · Ramps fixes
══════════════════════════════════════════════════════════ */

/* ─── RENDERER ─── */
const canvasEl = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas:canvasEl, antialias:false, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene   = new THREE.Scene();
scene.background = new THREE.Color(0x7ac0e8);
scene.fog = new THREE.FogExp2(0x9acce8, 0.0025);

const camera  = new THREE.PerspectiveCamera(68, window.innerWidth/window.innerHeight, 0.1, 500);
const camera2 = new THREE.PerspectiveCamera(68, window.innerWidth/window.innerHeight, 0.1, 500);

const hemi = new THREE.HemisphereLight(0xbbd8ff, 0x3d5c1a, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff8e0, 1.3);
sun.position.set(100,200,60);
sun.castShadow = true;
sun.shadow.mapSize.width = sun.shadow.mapSize.height = 512;
sun.shadow.camera.left = sun.shadow.camera.bottom = -100;
sun.shadow.camera.right = sun.shadow.camera.top = 100;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 300;
sun.shadow.bias = -0.002;
scene.add(sun); scene.add(sun.target);

/* ══════════════════════════════════════════ WORLD CONSTANTS */
const WORLD=600, HALF=300, BLOCK=100, ROAD_W=16, N_BLOCK=6;

/* ══════════════════════════════════════════ CAR TYPES */
const CAR_TYPES = [
    {id:'sport',  name:'Sportive',    emoji:'🏎️', stat:'Vitesse ★★★★★  Drift ★★★',    maxSpd:40,accel:28,brake:35,steer:2.4,friction:9, driftF:0.18,nDrain:28,nRegen:10,bW:2.0,bH:0.55,bD:4.6,cW:1.7, cH:0.50,cD:1.9},
    {id:'drift',  name:'Drift',       emoji:'🌀', stat:'Vitesse ★★★★   Drift ★★★★★',  maxSpd:36,accel:26,brake:28,steer:2.8,friction:5, driftF:0.44,nDrain:32,nRegen:14,bW:2.1,bH:0.60,bD:4.4,cW:1.75,cH:0.52,cD:1.8},
    {id:'rally',  name:'Rallye',      emoji:'🚙', stat:'Vitesse ★★★★   Tout-terrain ★★★★',maxSpd:38,accel:30,brake:33,steer:2.2,friction:8, driftF:0.14,nDrain:24,nRegen:12,bW:2.2,bH:0.72,bD:4.5,cW:1.9, cH:0.68,cD:2.2},
    {id:'classic',name:'Classique',   emoji:'🚗', stat:'Vitesse ★★★    Style ★★★★★',   maxSpd:30,accel:18,brake:28,steer:1.9,friction:11,driftF:0.10,nDrain:20,nRegen:8, bW:2.1,bH:0.70,bD:4.8,cW:1.8, cH:0.62,cD:2.1},
    {id:'mini',   name:'Mini',        emoji:'🚘', stat:'Vitesse ★★     Maniabilité ★★★★★',maxSpd:28,accel:22,brake:38,steer:3.0,friction:10,driftF:0.08,nDrain:22,nRegen:16,bW:1.6,bH:0.58,bD:3.2,cW:1.4, cH:0.54,cD:1.6},
    {id:'van',    name:'Camionnette', emoji:'🚐', stat:'Vitesse ★★     Robustesse ★★★★★',maxSpd:25,accel:15,brake:22,steer:1.6,friction:10,driftF:0.07,nDrain:18,nRegen:7, bW:2.5,bH:0.90,bD:5.2,cW:2.3, cH:0.85,cD:2.6},
    {id:'truck',  name:'Camion',      emoji:'🚛', stat:'Vitesse ★      Puissance ★★★★★',maxSpd:20,accel:10,brake:18,steer:1.3,friction:8, driftF:0.05,nDrain:15,nRegen:5, bW:2.8,bH:1.10,bD:7.0,cW:2.6, cH:1.40,cD:2.8},
    {id:'suv',    name:'SUV',         emoji:'🚙', stat:'Vitesse ★★★   Polyvalent ★★★★', maxSpd:32,accel:20,brake:26,steer:1.8,friction:9, driftF:0.09,nDrain:22,nRegen:9, bW:2.3,bH:0.85,bD:4.8,cW:2.1, cH:0.80,cD:2.4},
];

/* ══════════════════════════════════════════ FUN MODE CARS */
const FUN_CAR_TYPES = [
    {id:'kart',   name:'Kart',        emoji:'🏁', stat:'Vitesse ★★★★  Maniabilité ★★★★★', maxSpd:38,accel:35,brake:40,steer:3.5,friction:7, driftF:0.22,nDrain:30,nRegen:18,bW:1.4,bH:0.3,bD:2.8,cW:0.9,cH:0.55,cD:0.6},
    {id:'bumper', name:'Tamponneuse', emoji:'💥', stat:'Impact ★★★★★  Vitesse ★★',        maxSpd:22,accel:20,brake:50,steer:2.8,friction:8, driftF:0.12,nDrain:20,nRegen:25,bW:2.2,bH:0.7,bD:2.6,cW:1.8,cH:0.6,cD:1.0},
    {id:'mower',  name:'Tondeuse',    emoji:'🌿', stat:'Vitesse ★     Chaos ★★★★★',        maxSpd:14,accel:8, brake:30,steer:4.0,friction:6, driftF:0.35,nDrain:15,nRegen:30,bW:1.8,bH:0.55,bD:2.4,cW:1.4,cH:0.65,cD:1.2},
];

const AIR_VEHICLES = [
    {id:'plane',  name:'Avion',        emoji:'✈️',  stat:'Vitesse ★★★★★  Vol ★★★★★',     maxSpd:80,accel:18,brake:12,steer:1.2,friction:2, driftF:0.05,nDrain:25,nRegen:8, bW:8.0,bH:0.5,bD:7.0,cW:2.0,cH:0.8,cD:2.5,canFly:true,flyAccel:12},
    {id:'heli',   name:'Hélicoptère',  emoji:'🚁',  stat:'Vol ★★★★★  Stabilité ★★★★',   maxSpd:45,accel:12,brake:20,steer:2.0,friction:1, driftF:0.08,nDrain:30,nRegen:6, bW:3.0,bH:1.2,bD:5.0,cW:2.2,cH:1.0,cD:2.0,canFly:true,flyAccel:18},
    {id:'tank',   name:'Tank',         emoji:'🪖',  stat:'Puissance ★★★★★  Vitesse ★',   maxSpd:12,accel:6, brake:25,steer:1.0,friction:15,driftF:0.02,nDrain:10,nRegen:4, bW:3.2,bH:1.0,bD:6.5,cW:2.8,cH:0.9,cD:2.4,canFly:false,flyAccel:0},
];
const MICRO_VEHICLES = [
    {id:'bike',   name:'Vélo',         emoji:'🚲',  stat:'Vitesse ★★  Maniabilité ★★★★★',maxSpd:24,accel:16,brake:28,steer:3.8,friction:8, driftF:0.20,nDrain:15,nRegen:20,bW:0.5,bH:0.9,bD:1.8,cW:0.4,cH:0.6,cD:0.6,canFly:false,flyAccel:0},
    {id:'scoot',  name:'Trottinette',  emoji:'🛴',  stat:'Vitesse ★★★  Fun ★★★★★',       maxSpd:30,accel:22,brake:32,steer:4.0,friction:6, driftF:0.18,nDrain:18,nRegen:22,bW:0.6,bH:0.9,bD:1.5,cW:0.5,cH:0.55,cD:0.5,canFly:false,flyAccel:0},
];
// Merge all car types into one list for universal selection
const ALL_CAR_TYPES = [...CAR_TYPES, ...FUN_CAR_TYPES, ...AIR_VEHICLES, ...MICRO_VEHICLES];

/* ══════════════════════════════════════════ CONFIG */
let CFG = {
    mode:'solo', world:'city', p1Car:0, p2Car:1, multiCar:0, funCar:0,
    viewMode:'third', p1Name:'Joueur 1', p2Name:'Joueur 2',
    keyLayout:'azerty', quality:'normal',
    maxPlayers:4, lobbyName:'Course Royale', lobbyPass:'',
    multiWorld:'city', multiName:'Pilote',
};

/* ── KEYBOARD LAYOUTS ── */
const KEYMAPS = {
    azerty: { fwd:'KeyW', back:'KeyS', left:'KeyA', right:'KeyD' }, // Z=KeyW, Q=KeyA on physical AZERTY
    qwerty: { fwd:'KeyW', back:'KeyS', left:'KeyA', right:'KeyD' },
};
function getKeys() { return KEYMAPS[CFG.keyLayout] || KEYMAPS.azerty; }

const VIEW_MODES = ['third','first','top','hood'];
let currentViewIdx = 0;

/* ══════════════════════════════════════════ WORLD THEMES */
const THEMES = {
    city:   {sky:0x7ac0e8,fog:0x9acce8,fogD:0.0025,ground:0x4a4a4a,grass:0x3d6b2a,aTop:0xbbd8ff,aBot:0x3d5c1a,sunC:0xfff8e0,sunI:1.3,trees:true, night:false},
    desert: {sky:0xe8c880,fog:0xddb860,fogD:0.002, ground:0xc8a855,grass:0xb89040,aTop:0xffe8a0,aBot:0x8b6020,sunC:0xffee80,sunI:1.8,trees:false,night:false},
    snow:   {sky:0xc8dcf0,fog:0xd8e8f8,fogD:0.003, ground:0xddeeff,grass:0xb8ccdd,aTop:0xd0e8ff,aBot:0x6688aa,sunC:0xeef8ff,sunI:0.9,trees:true, night:false},
    night:    {sky:0x060814,fog:0x0a0c18,fogD:0.003, ground:0x1a1a2a,grass:0x0d1a0d,aTop:0x2233aa,aBot:0x001100,sunC:0x2244ff,sunI:0.3,trees:true, night:true},
    mountain: {sky:0x5a8ab4,fog:0x8aaac0,fogD:0.004, ground:0x5a6a4a,grass:0x3a5a2a,aTop:0x88aacc,aBot:0x2a3a22,sunC:0xffeedd,sunI:1.1,trees:true, night:false},
    plains:   {sky:0x88c4f0,fog:0xaad8f4,fogD:0.001, ground:0x6a9a3a,grass:0x4a8a2a,aTop:0xaad4ff,aBot:0x2a6a0a,sunC:0xfff4cc,sunI:1.5,trees:true, night:false},
    skyworld: {sky:0x4488ff,fog:0x7ab4ff,fogD:0.006, ground:0xffffff,grass:0xffffff,aTop:0x88bbff,aBot:0x3366cc,sunC:0xffffff,sunI:1.6,trees:false,night:false},
    highway:  {sky:0x6a8ab4,fog:0x8aaac8,fogD:0.003, ground:0x303030,grass:0x2a4a1a,aTop:0x88aacc,aBot:0x1a2a0a,sunC:0xfff0d8,sunI:1.2,trees:true, night:false},
};

/* ══════════════════════════════════════════ PLAYER STATE */
function makePlayer(color, sx, sz, carIdx, name) {
    const ct = {...(ALL_CAR_TYPES[carIdx]||ALL_CAR_TYPES[0])};
    return {pos:new THREE.Vector3(sx,0,sz),rot:0,speed:0,velY:0,
            nitro:100,nitroOn:false,driftAngle:0,handbraking:false,
            color,ct,mesh:null,wheels:[],wheelAngle:0,name:name||'?',
            stuckTimer:0,stuckCountdown:5,stuckShowing:false,
            crashVel:0, crashTimer:0,
            // console overrides
            cons:{maxSpd:null,accel:null,drift:null,nitro:null}};
}

/* ── GRAVITY ── */
let worldGravity = 18; // units/s²

let p1=null, p2=null;
let gameStarted=false, paused=false;
let cockpitGroup=null; // 3D cockpit for first-person view
const colliders=[];
const rampMeshes=[]; // store ramp groups for Y-collision
let minimapBase=null;
let bots=[];

/* ══════════════════════════════════════════ MATERIALS */
let MAT={};
function buildMats(th) {
    MAT.asphalt  = new THREE.MeshLambertMaterial({color:th.ground});
    MAT.grass    = new THREE.MeshLambertMaterial({color:th.grass});
    MAT.sidewalk = new THREE.MeshLambertMaterial({color:th.night?0x1a2244:0x7a7a72});
    MAT.stone    = new THREE.MeshLambertMaterial({color:th.night?0x1a1a33:0x888870});
    MAT.trunk    = new THREE.MeshLambertMaterial({color:0x5c3d1e});
    MAT.foliage  = new THREE.MeshLambertMaterial({color:th.night?0x0d2a0d:th.fogD<0.002?0x8b7040:0x296929});
    MAT.water    = new THREE.MeshLambertMaterial({color:th.fogD<0.002?0xc8a020:0x2255aa});
    MAT.ramp     = new THREE.MeshPhongMaterial({color:th.night?0x334466:0x888888,shininess:40,specular:0x444444});
    MAT.rampStripe = new THREE.MeshLambertMaterial({color:th.night?0x00ffcc:0xffee00,emissive:th.night?0x00ffcc:0xffcc00,emissiveIntensity:0.5});
    MAT.line     = new THREE.MeshLambertMaterial({color:th.night?0x4466aa:0xddddcc});
}

/* ══════════════════════════════════════════ SCENE CLEAR */
function clearScene() {
    const keep=[hemi,sun,sun.target];
    scene.children.filter(c=>!keep.includes(c)).forEach(c=>scene.remove(c));
    colliders.length=0; rampMeshes.length=0; minimapBase=null; bots=[];
    cockpitGroup=null;
}

/* ══════════════════════════════════════════ WORLD GENERATION */
function generateWorld() {
    const w = CFG.mode==='multi' ? CFG.multiWorld : CFG.world;
    const th = THEMES[w]||THEMES.city;
    buildMats(th);

    scene.background.set(th.sky);
    scene.fog = new THREE.FogExp2(th.fog, th.fogD);
    hemi.color.set(th.aTop); hemi.groundColor.set(th.aBot);
    sun.color.set(th.sunC); sun.intensity=th.sunI;
    if (th.night) scene.add(new THREE.AmbientLight(0x112244, 0.8));

    // Apply quality
    applyQuality();

    // Ground
    const w_temp = CFG.mode==='multi' ? CFG.multiWorld : CFG.world;
    if(w_temp==='skyworld'){
        scene.fog = new THREE.FogExp2(0x88aaf0, 0.012);
    } else if(w_temp==='highway'){
        // Highway: large flat ground, no grid
        addMesh(new THREE.PlaneGeometry(WORLD*4,WORLD*4),MAT.grass,0,0,0,-Math.PI/2,0,0,false);
    } else {
        addMesh(new THREE.PlaneGeometry(WORLD+80,WORLD+80), MAT.asphalt, 0,0,0, -Math.PI/2,0,0, false);
        addRoadMarkings();
    }

    if(w!=='skyworld'&&w!=='highway')generateBlocks(w, th);
    if(w!=='skyworld'&&w!=='highway'){
        addRamps();
        if(w==='mountain') addMountains(th);
        if(w==='plains') addPlainsFeatures();
    } else if(w==='highway'){
        generateHighway();
    } else {
        generateSkyWorld();
    }
    // World borders
    const bw=WORLD+20;
    [{x:0,z:HALF+2,sx:bw,sz:4},{x:0,z:-HALF-2,sx:bw,sz:4},
     {x:HALF+2,z:0,sx:4,sz:bw},{x:-HALF-2,z:0,sx:4,sz:bw}]
    .forEach(b=>colliders.push({minX:b.x-b.sx/2,maxX:b.x+b.sx/2,minZ:b.z-b.sz/2,maxZ:b.z+b.sz/2}));
}

function applyQuality() {
    const q=CFG.quality;
    renderer.setPixelRatio(q==='pixel'?0.4:q==='high'?Math.min(window.devicePixelRatio,2):Math.min(window.devicePixelRatio,1.5));
    renderer.shadowMap.enabled = q!=='pixel';
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = q==='high'?1024:512;
    scene.fog.density = q==='high'?0.0018:0.0025;
}

function addMesh(geo,mat,x,y,z,rx,ry,rz,shadow){
    const m=new THREE.Mesh(geo,mat);
    m.position.set(x,y,z);
    if(rx||ry||rz)m.rotation.set(rx,ry,rz);
    if(shadow){m.castShadow=true;m.receiveShadow=true;}else m.receiveShadow=true;
    scene.add(m);return m;
}

function addTree(x,z){const h=2.5+Math.random()*1.5;addMesh(new THREE.CylinderGeometry(0.2,0.28,h,6),MAT.trunk,x,h/2,z,0,0,0,true);addMesh(new THREE.ConeGeometry(1.8,3,7),MAT.foliage,x,h+1.5,z,0,0,0,true);}
function addLamppost(x,z){
    addMesh(new THREE.CylinderGeometry(0.07,0.09,4.5,6),new THREE.MeshLambertMaterial({color:0x333322}),x,2.25,z,0,0,0,true);
    const col=0xffffaa; addMesh(new THREE.SphereGeometry(0.22,8,6),new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:0.6}),x,4.7,z,0,0,0,false);
    if(THEMES[CFG.mode==='multi'?CFG.multiWorld:CFG.world]?.night){const pl=new THREE.PointLight(0xffffaa,1.8,22);pl.position.set(x,4.5,z);scene.add(pl);}
}

function addPlaza(cx,cz){
    addMesh(new THREE.PlaneGeometry(110,110),MAT.stone,cx,0.02,cz,-Math.PI/2,0,0,false);
    addMesh(new THREE.BoxGeometry(10,0.8,10),MAT.stone,cx,0.4,cz,0,0,0,true);
    addMesh(new THREE.CylinderGeometry(0.35,1.5,20,4),new THREE.MeshLambertMaterial({color:0xaaa888}),cx,10,cz,0,Math.PI/4,0,true);
    addMesh(new THREE.ConeGeometry(0.4,1.2,4),new THREE.MeshLambertMaterial({color:0xc6a84a,emissive:0xc6a84a,emissiveIntensity:0.3}),cx,21,cz,0,0,0,true);
    addMesh(new THREE.CylinderGeometry(5,5,0.5,16),MAT.water,cx,0.3,cz,0,0,0,false);
    colliders.push({minX:cx-4.5,maxX:cx+4.5,minZ:cz-4.5,maxZ:cz+4.5});
    for(let a=0;a<6;a++){const ang=(a/6)*Math.PI*2;addTree(cx+Math.cos(ang)*25,cz+Math.sin(ang)*25);}
}

function addRoadMarkings(){
    const dashLen=5,dashGap=6,dashH=0.025;
    for(let i=1;i<N_BLOCK;i++){
        const rx=-HALF+BLOCK*i,rz=-HALF+BLOCK*i;
        for(let dz=-HALF;dz<HALF;dz+=dashLen+dashGap) addMesh(new THREE.BoxGeometry(0.25,dashH,dashLen),MAT.line,rx,0.03,dz+dashLen/2,0,0,0,false);
        for(let dx=-HALF;dx<HALF;dx+=dashLen+dashGap) addMesh(new THREE.BoxGeometry(dashLen,dashH,0.25),MAT.line,dx+dashLen/2,0.03,rz,0,0,0,false);
    }
}

/* ══════════════════════════════════════════ BLOCK GENERATION PER WORLD */
function generateBlocks(worldKey, th) {
    const w = worldKey;
    for (let bx=0;bx<N_BLOCK;bx++) {
        for (let bz=0;bz<N_BLOCK;bz++) {
            const cx=-HALF+BLOCK*bx+BLOCK/2, cz=-HALF+BLOCK*bz+BLOCK/2;
            const inner=BLOCK-ROAD_W;
            const isCenter=(bx===Math.floor(N_BLOCK/2)-1&&bz===Math.floor(N_BLOCK/2)-1);

            if (w==='city' || w==='night') {
                addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
                if (isCenter) { addPlaza(cx+BLOCK/2,cz+BLOCK/2); continue; }
                const BLDG = w==='night'?[0x112244,0x0a1a33,0x1a2255,0x152266,0x0d1133,0x1a0d33]
                    :[0x8c7a5c,0x6a7a5c,0x5c6a7a,0x9a8a6c,0x7a6a8a,0x8a7a68,0x6a5a8c,0x7a8c6a];
                const hw=inner/2-3;const placed=[];
                const numBldg=2+Math.floor(Math.random()*2);
                for (let i=0;i<numBldg;i++){
                    const bw=8+Math.random()*18,bd=8+Math.random()*18,bh=w==='night'?18+Math.random()*45:8+Math.random()*30;
                    let ox,oz,ok=false;
                    for(let t=0;t<10;t++){ox=(Math.random()*2-1)*(hw-bw/2);oz=(Math.random()*2-1)*(hw-bd/2);
                        const r={minX:cx+ox-bw/2,maxX:cx+ox+bw/2,minZ:cz+oz-bd/2,maxZ:cz+oz+bd/2};
                        ok=placed.every(p=>r.minX>p.maxX+1||r.maxX<p.minX-1||r.minZ>p.maxZ+1||r.maxZ<p.minZ-1);
                        if(ok){placed.push(r);colliders.push({minX:r.minX-0.5,maxX:r.maxX+0.5,minZ:r.minZ-0.5,maxZ:r.maxZ+0.5});break;}}
                    if(!ok)continue;
                    const col=BLDG[Math.floor(Math.random()*BLDG.length)];
                    const mat=new THREE.MeshLambertMaterial({color:col});
                    addMesh(new THREE.BoxGeometry(bw,bh,bd),mat,cx+ox,bh/2,cz+oz,0,0,0,true);
                    // Rooftop details
                    if(Math.random()>0.45){const rh=1.5+Math.random()*4;addMesh(new THREE.BoxGeometry(bw*0.45,rh,bd*0.45),mat,cx+ox,bh+rh/2,cz+oz,0,0,0,true);}
                    if(Math.random()>0.6){addMesh(new THREE.CylinderGeometry(0.4,0.4,bh*0.3,6),new THREE.MeshLambertMaterial({color:0x555555}),cx+ox+bw*0.3,bh+bh*0.15,cz+oz,0,0,0,true);}
                    // Night glow windows
                    if(w==='night'&&bh>10){
                        const wm=new THREE.MeshLambertMaterial({color:0xffee88,emissive:0xffee88,emissiveIntensity:0.35});
                        addMesh(new THREE.BoxGeometry(bw+0.05,0.5,bd+0.05),wm,cx+ox,bh*0.5,cz+oz,0,0,0,false);
                        addMesh(new THREE.BoxGeometry(bw+0.05,0.5,bd+0.05),wm,cx+ox,bh*0.25,cz+oz,0,0,0,false);
                        addMesh(new THREE.BoxGeometry(bw+0.05,0.5,bd+0.05),wm,cx+ox,bh*0.75,cz+oz,0,0,0,false);
                    }
                }
                if(th.trees&&Math.random()>0.55) addTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                if(w==='night'&&Math.random()>0.5) addLamppost(cx+(Math.random()*2-1)*(inner/2-8),cz+(Math.random()*2-1)*(inner/2-8));
                if(w==='city'&&Math.random()>0.75) addBench(cx+(Math.random()*2-1)*(inner/2-6),cz+(Math.random()*2-1)*(inner/2-6));

            } else if(w==='desert') {
                // Sandy ground, sandstone formations, cacti, ruins
                addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
                if(isCenter){addDesertOasis(cx+BLOCK/2,cz+BLOCK/2);continue;}
                // Sandstone rock formations
                if(Math.random()>0.4){
                    const rw=6+Math.random()*14,rh=4+Math.random()*16,rd=5+Math.random()*12;
                    const ox=(Math.random()*2-1)*(inner/2-rw/2-2),oz=(Math.random()*2-1)*(inner/2-rd/2-2);
                    const col=[0xc8a855,0xd4b060,0xb89040,0xe0c070,0xd4a040][Math.floor(Math.random()*5)];
                    addMesh(new THREE.BoxGeometry(rw,rh,rd),new THREE.MeshLambertMaterial({color:col}),cx+ox,rh/2,cz+oz,0,Math.random()*0.2,0,true);
                    if(Math.random()>0.5)addMesh(new THREE.BoxGeometry(rw*0.6,rh*0.5,rd*0.6),new THREE.MeshLambertMaterial({color:col}),cx+ox,rh+rh*0.25,cz+oz,0,0.4,0,true);
                    colliders.push({minX:cx+ox-rw/2-0.3,maxX:cx+ox+rw/2+0.3,minZ:cz+oz-rd/2-0.3,maxZ:cz+oz+rd/2+0.3});
                }
                // Cactus
                if(Math.random()>0.5) addCactus(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                if(Math.random()>0.7) addCactus(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                // Desert ruins
                if(Math.random()>0.7) addDesertRuin(cx+(Math.random()*2-1)*(inner/2-8),cz+(Math.random()*2-1)*(inner/2-8));

            } else if(w==='snow') {
                addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
                if(isCenter){addSnowVillageCenter(cx+BLOCK/2,cz+BLOCK/2);continue;}
                // Snow-covered cabins
                if(Math.random()>0.35){
                    const hw2=inner/2-4,bw=8+Math.random()*10,bd=7+Math.random()*9,bh=4+Math.random()*6;
                    const ox=(Math.random()*2-1)*(hw2-bw/2),oz=(Math.random()*2-1)*(hw2-bd/2);
                    const col=[0x889aaa,0x7a8899,0x9aacbb,0x6688aa,0xaabbc8][Math.floor(Math.random()*5)];
                    addMesh(new THREE.BoxGeometry(bw,bh,bd),new THREE.MeshLambertMaterial({color:col}),cx+ox,bh/2,cz+oz,0,0,0,true);
                    // Snow on roof
                    addMesh(new THREE.BoxGeometry(bw+0.5,0.4,bd+0.5),new THREE.MeshLambertMaterial({color:0xeef4ff}),cx+ox,bh+0.2,cz+oz,0,0,0,false);
                    // Pitched roof
                    addMesh(new THREE.CylinderGeometry(0.1,bw*0.7,bh*0.5,4),new THREE.MeshLambertMaterial({color:0x664422}),cx+ox,bh+bh*0.25,cz+oz,0,Math.PI/4,0,true);
                    addMesh(new THREE.CylinderGeometry(0.1,bw*0.72,0.35,4),new THREE.MeshLambertMaterial({color:0xeef4ff}),cx+ox,bh+bh*0.25,cz+oz,0,Math.PI/4,0,false);
                    colliders.push({minX:cx+ox-bw/2-0.3,maxX:cx+ox+bw/2+0.3,minZ:cz+oz-bd/2-0.3,maxZ:cz+oz+bd/2+0.3});
                }
                if(th.trees&&Math.random()>0.4) addSnowTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                if(Math.random()>0.6) addSnowman(cx+(Math.random()*2-1)*(inner/2-6),cz+(Math.random()*2-1)*(inner/2-6));

            } else if(w==='mountain') {
                addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
                if(isCenter){addMountainCamp(cx+BLOCK/2,cz+BLOCK/2);continue;}
                // Rocky terrain features
                if(Math.random()>0.35){
                    const rw=7+Math.random()*18,rh=5+Math.random()*20,rd=6+Math.random()*14;
                    const ox=(Math.random()*2-1)*(inner/2-rw/2-3),oz=(Math.random()*2-1)*(inner/2-rd/2-3);
                    const col=[0x6a7a5a,0x5a6a4a,0x7a6a5a,0x8a7a6a,0x4a5a3a][Math.floor(Math.random()*5)];
                    addMesh(new THREE.BoxGeometry(rw,rh,rd),new THREE.MeshLambertMaterial({color:col}),cx+ox,rh/2,cz+oz,0,Math.random()*0.3,Math.random()*0.15,true);
                    if(rh>12) addMesh(new THREE.BoxGeometry(rw*0.5,rh*0.25,rd*0.5),new THREE.MeshLambertMaterial({color:0xeef4ff}),cx+ox,rh+rh*0.12,cz+oz,0,0,0,false);
                    colliders.push({minX:cx+ox-rw/2-0.4,maxX:cx+ox+rw/2+0.4,minZ:cz+oz-rd/2-0.4,maxZ:cz+oz+rd/2+0.4});
                }
                if(th.trees&&Math.random()>0.45) addTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                if(th.trees&&Math.random()>0.6) addTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
                // Boulders scattered
                for(let i=0;i<Math.floor(Math.random()*3);i++){
                    const bx2=(Math.random()*2-1)*(inner/2-3),bz2=(Math.random()*2-1)*(inner/2-3),bs=1.2+Math.random()*3;
                    addMesh(new THREE.DodecahedronGeometry(bs,0),new THREE.MeshLambertMaterial({color:0x7a7060}),cx+bx2,bs*0.45,cz+bz2,0,Math.random()*Math.PI,Math.random()*0.4,true);
                }

            } else if(w==='plains') {
                addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
                if(isCenter){addFarm(cx+BLOCK/2,cz+BLOCK/2);continue;}
                // Farms, barns, windmills
                if(Math.random()>0.5) addBarn(cx+(Math.random()*2-1)*(inner/2-8),cz+(Math.random()*2-1)*(inner/2-8));
                if(Math.random()>0.65) addWindmill(cx+(Math.random()*2-1)*(inner/2-6),cz+(Math.random()*2-1)*(inner/2-6));
                // Sunflowers
                for(let i=0;i<Math.floor(Math.random()*6)+2;i++){
                    const fx=(Math.random()*2-1)*(inner/2-3),fz=(Math.random()*2-1)*(inner/2-3);
                    addMesh(new THREE.CylinderGeometry(0.06,0.1,1.8,5),new THREE.MeshLambertMaterial({color:0x3a8a2a}),cx+fx,0.9,cz+fz,0,0,0,false);
                    addMesh(new THREE.SphereGeometry(0.25,6,4),new THREE.MeshLambertMaterial({color:0xffcc00}),cx+fx,1.9,cz+fz,0,0,0,false);
                }
                if(th.trees&&Math.random()>0.55) addTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
            }
        }
    }
}

/* ─── World-specific decorations ─── */
function addBench(x,z){
    addMesh(new THREE.BoxGeometry(1.8,0.1,0.5),new THREE.MeshLambertMaterial({color:0x8b6020}),x,0.45,z,0,0,0,false);
    [x-0.7,x+0.7].forEach(lx=>addMesh(new THREE.BoxGeometry(0.1,0.45,0.5),new THREE.MeshLambertMaterial({color:0x6b4010}),lx,0.22,z,0,0,0,false));
}
function addCactus(x,z){
    const h=2+Math.random()*2.5,col=new THREE.MeshLambertMaterial({color:0x4a7a3a});
    addMesh(new THREE.CylinderGeometry(0.18,0.22,h,7),col,x,h/2,z,0,0,0,true);
    if(Math.random()>0.4){addMesh(new THREE.CylinderGeometry(0.12,0.15,h*0.5,6),col,x+0.4,h*0.5,z,0,0,-0.7,true);addMesh(new THREE.CylinderGeometry(0.1,0.12,h*0.3,6),col,x+0.7,h*0.65,z,0,0,0,true);}
    if(Math.random()>0.5){addMesh(new THREE.CylinderGeometry(0.12,0.15,h*0.5,6),col,x-0.4,h*0.45,z,0,0,0.7,true);addMesh(new THREE.CylinderGeometry(0.1,0.12,h*0.3,6),col,x-0.7,h*0.6,z,0,0,0,true);}
}
function addDesertRuin(x,z){
    const h=3+Math.random()*5,mat=new THREE.MeshLambertMaterial({color:0xb89040});
    addMesh(new THREE.BoxGeometry(8,h*0.4,0.6),mat,x,h*0.2,z,0,0,0,true);
    addMesh(new THREE.BoxGeometry(0.6,h,0.6),mat,x-3.5,h/2,z,0,0,0,true);
    addMesh(new THREE.BoxGeometry(0.6,h*0.55,0.6),mat,x+3.5,h*0.27,z,0,0,0,true);
    addMesh(new THREE.BoxGeometry(0.6,h*0.8,0.6),mat,x,h*0.4,z,0,0,0,true);
}
function addDesertOasis(cx,cz){
    addMesh(new THREE.PlaneGeometry(110,110),MAT.stone,cx,0.02,cz,-Math.PI/2,0,0,false);
    addMesh(new THREE.CylinderGeometry(9,9,0.28,20),MAT.water,cx,0.14,cz,0,0,0,false);
    for(let a=0;a<5;a++){const ang=(a/5)*Math.PI*2,r=15;addPalmTree(cx+Math.cos(ang)*r,cz+Math.sin(ang)*r);}
    // Small collider — don't block the roads that cross through center
    colliders.push({minX:cx-7,maxX:cx+7,minZ:cz-7,maxZ:cz+7});
}
function addPalmTree(x,z){
    const h=5+Math.random()*3;
    addMesh(new THREE.CylinderGeometry(0.18,0.28,h,6),new THREE.MeshLambertMaterial({color:0x8b5e3c}),x,h/2,z,0.12,0,Math.random()*Math.PI,true);
    addMesh(new THREE.SphereGeometry(2.2,7,5),new THREE.MeshLambertMaterial({color:0x2a7a2a}),x+Math.sin(0.12)*h*0.5,h+1,z,0,0,0,true);
}
function addSnowTree(x,z){
    const h=3+Math.random()*2;
    addMesh(new THREE.CylinderGeometry(0.18,0.25,h,6),MAT.trunk,x,h/2,z,0,0,0,true);
    addMesh(new THREE.ConeGeometry(2,3.5,7),new THREE.MeshLambertMaterial({color:0x2a5a2a}),x,h+1.75,z,0,0,0,true);
    addMesh(new THREE.ConeGeometry(2.1,0.5,7),new THREE.MeshLambertMaterial({color:0xeef4ff}),x,h+3.2,z,0,0,0,false);
}
function addSnowman(x,z){
    addMesh(new THREE.SphereGeometry(0.55,8,6),new THREE.MeshLambertMaterial({color:0xeef4ff}),x,0.55,z,0,0,0,true);
    addMesh(new THREE.SphereGeometry(0.4,8,6),new THREE.MeshLambertMaterial({color:0xeef4ff}),x,1.5,z,0,0,0,true);
    addMesh(new THREE.SphereGeometry(0.28,8,6),new THREE.MeshLambertMaterial({color:0xeef4ff}),x,2.12,z,0,0,0,true);
    addMesh(new THREE.CylinderGeometry(0.28,0.28,0.42,8),new THREE.MeshLambertMaterial({color:0x222222}),x,2.6,z,0,0,0,false);
    addMesh(new THREE.CylinderGeometry(0.06,0.06,0.45,6),new THREE.MeshLambertMaterial({color:0xff6600}),x+0.22,2.12,z,0,0,Math.PI/2+0.3,false);
}
function addSnowVillageCenter(cx,cz){
    addMesh(new THREE.PlaneGeometry(110,110),MAT.grass,cx,0.02,cz,-Math.PI/2,0,0,false);
    addMesh(new THREE.PlaneGeometry(110,110),new THREE.MeshLambertMaterial({color:0xd0e8f4}),cx,0.03,cz,-Math.PI/2,0,0,false);
    addMesh(new THREE.CylinderGeometry(8,8,0.4,16),new THREE.MeshLambertMaterial({color:0x88aacc}),cx,0.3,cz,0,0,0,false);
    for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;addSnowTree(cx+Math.cos(a)*20,cz+Math.sin(a)*20);}
    colliders.push({minX:cx-8.5,maxX:cx+8.5,minZ:cz-8.5,maxZ:cz+8.5});
}
function addMountainCamp(cx,cz){
    addMesh(new THREE.PlaneGeometry(80,80),MAT.grass,cx,0.02,cz,-Math.PI/2,0,0,false);
    addMesh(new THREE.CylinderGeometry(6,6,0.3,12),new THREE.MeshLambertMaterial({color:0x5a7060}),cx,0.15,cz,0,0,0,false);
    // Campfire
    addMesh(new THREE.ConeGeometry(0.8,0.6,6),new THREE.MeshLambertMaterial({color:0x8b4513}),cx,0.3,cz,0,0,0,false);
    addMesh(new THREE.ConeGeometry(0.35,0.8,5),new THREE.MeshLambertMaterial({color:0xff6600,emissive:0xff3300,emissiveIntensity:0.6}),cx,0.9,cz,0,0,0,false);
    for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;addTree(cx+Math.cos(a)*22,cz+Math.sin(a)*22);}
    colliders.push({minX:cx-7,maxX:cx+7,minZ:cz-7,maxZ:cz+7});
}
function addMountains(th){
    const peaks=[{x:220,z:220},{x:-220,z:220},{x:220,z:-220},{x:-220,z:-220},{x:0,z:260},{x:260,z:0},{x:-260,z:0},{x:0,z:-260}];
    peaks.forEach(p=>{
        const h=28+Math.random()*38,r=20+Math.random()*16;
        addMesh(new THREE.ConeGeometry(r,h,8),new THREE.MeshLambertMaterial({color:0x6a7a5a}),p.x,h/2,p.z,0,Math.random()*Math.PI,0,true);
        addMesh(new THREE.ConeGeometry(r*0.32,h*0.28,8),new THREE.MeshLambertMaterial({color:0xeef4ff}),p.x,h*0.9,p.z,0,0,0,true);
        colliders.push({minX:p.x-r*0.55,maxX:p.x+r*0.55,minZ:p.z-r*0.55,maxZ:p.z+r*0.55});
    });
}
function addBarn(x,z){
    const w=10,h=6,d=14,mat=new THREE.MeshLambertMaterial({color:0x8b2020});
    addMesh(new THREE.BoxGeometry(w,h,d),mat,x,h/2,z,0,0,0,true);
    addMesh(new THREE.CylinderGeometry(0.2,w*0.7,h*0.6,4),new THREE.MeshLambertMaterial({color:0x5a1010}),x,h+h*0.3,z,0,Math.PI/4,0,true);
    addMesh(new THREE.BoxGeometry(w+0.4,0.5,d+0.4),new THREE.MeshLambertMaterial({color:0x5a1010}),x,h-0.25,z,0,0,0,false);
    addMesh(new THREE.BoxGeometry(3,4,0.15),new THREE.MeshLambertMaterial({color:0x4a1010}),x,h*0.38,z+d/2+0.08,0,0,0,false);
    colliders.push({minX:x-w/2-0.3,maxX:x+w/2+0.3,minZ:z-d/2-0.3,maxZ:z+d/2+0.3});
}
function addWindmill(x,z){
    addMesh(new THREE.CylinderGeometry(0.6,1.0,14,8),new THREE.MeshLambertMaterial({color:0xddddcc}),x,7,z,0,0,0,true);
    for(let b=0;b<4;b++){const ba=(b/4)*Math.PI*2;
        const blade=new THREE.Mesh(new THREE.BoxGeometry(0.35,7,0.16),new THREE.MeshLambertMaterial({color:0xddddcc}));
        blade.position.set(x+Math.cos(ba)*3.5,14.5,z+Math.sin(ba)*3.5);blade.rotation.z=ba;scene.add(blade);}
    colliders.push({minX:x-1.5,maxX:x+1.5,minZ:z-1.5,maxZ:z+1.5});
}
function addFarm(cx,cz){
    addMesh(new THREE.PlaneGeometry(110,110),MAT.grass,cx,0.02,cz,-Math.PI/2,0,0,false);
    // Crop fields
    for(let fi=0;fi<3;fi++){for(let fj=0;fj<3;fj++){
        const fx=cx-30+fi*30,fz=cz-30+fj*30;
        const col=fi*3+fj;
        const cropColors=[0x4a8a2a,0xd4a040,0x3a7a1a,0x8a8a20,0x5a9a3a,0xa0702a,0x4a9a4a,0xc8a830,0x6aaa4a];
        addMesh(new THREE.PlaneGeometry(18,18),new THREE.MeshLambertMaterial({color:cropColors[col%9]}),fx,0.04,fz,-Math.PI/2,0,0,false);
    }}
    addBarn(cx+25,cz+15);
    addWindmill(cx-25,cz-15);
    colliders.push({minX:cx+20,maxX:cx+30,minZ:cz+10,maxZ:cz+20});
}
function addPlainsFeatures(){
    // Extra scattered features in open areas
    for(let i=0;i<8;i++){
        const px=(Math.random()-0.5)*380,pz=(Math.random()-0.5)*380;
        if(Math.abs(px)<20&&Math.abs(pz)<20)continue;
        addMesh(new THREE.CylinderGeometry(2.0,2.6,2.0,10),new THREE.MeshLambertMaterial({color:0xc8a840}),(Math.random()-0.5)*400,(Math.random()-0.5)*400+1,(Math.random()-0.5)*400,0,0,0,true);
    }
}


/* ── RAMPS — proper geometry with correct angles ── */
function addRamps(){
    const spots=[
        {x:100,z:60,  ry:0},         {x:-100,z:-60,   ry:Math.PI},
        {x:60, z:-140,ry:Math.PI/2}, {x:-160,z:100,   ry:-Math.PI/2},
        {x:180,z:180, ry:Math.PI/4}, {x:-180,z:-180,  ry:-Math.PI/4},
        {x:240,z:-80, ry:0},         {x:-240,z:80,    ry:Math.PI},
    ];
    spots.forEach(s=>addRamp(s.x,s.z,s.ry));
}

function addRamp(x,z,ry){
    const g=new THREE.Group();
    g.position.set(x,0,z);
    g.rotation.y=ry;

    // Ramp inclined panel (properly angled)
    const rampAngle = Math.PI/7; // ~25.7 degrees
    const rampLen   = 14;
    const rampH     = Math.sin(rampAngle)*rampLen;
    const rampW     = 9;

    // Ground approach flat
    const baseGeo = new THREE.BoxGeometry(rampW, 0.3, 3);
    const base = new THREE.Mesh(baseGeo, MAT.ramp);
    base.position.set(0, 0.15, rampLen/2+1.5);
    base.receiveShadow=true; g.add(base);

    // Ramp slope
    const slopeGeo = new THREE.BoxGeometry(rampW, 0.3, rampLen);
    const slope = new THREE.Mesh(slopeGeo, MAT.ramp);
    slope.rotation.x = -rampAngle;
    slope.position.set(0, rampH/2, 0);
    slope.castShadow=true; slope.receiveShadow=true; g.add(slope);

    // Top platform
    const topH = rampH + 0.15;
    const topGeo = new THREE.BoxGeometry(rampW, 0.3, 4);
    const top = new THREE.Mesh(topGeo, MAT.ramp);
    top.position.set(0, topH, -rampLen/2-2);
    top.castShadow=true; g.add(top);

    // Side walls for guidance
    [-rampW/2+0.2, rampW/2-0.2].forEach(sx=>{
        const wg=new THREE.BoxGeometry(0.3, rampH+0.5, rampLen+2);
        const wall=new THREE.Mesh(wg, MAT.ramp);
        wall.rotation.x=-rampAngle*0.5;
        wall.position.set(sx, rampH/2, 0);
        g.add(wall);
    });

    // Decorative stripes (yellow/teal)
    const stripeGeo = new THREE.BoxGeometry(rampW+0.1, 0.05, 0.4);
    [-rampLen/2+1, 0, rampLen/2-1].forEach(sz=>{
        const stripe=new THREE.Mesh(stripeGeo, MAT.rampStripe);
        stripe.rotation.x=-rampAngle;
        stripe.position.set(0, rampH/2+0.2, sz);
        g.add(stripe);
    });

    // Pillar support under ramp
    const pillarMat = new THREE.MeshLambertMaterial({color:0x555555});
    for (let t=0.2;t<0.8;t+=0.3){
        const ph=Math.sin(rampAngle)*rampLen*t;
        const pz=(t-0.5)*rampLen;
        const pillar=new THREE.Mesh(new THREE.BoxGeometry(0.4,ph,0.4),pillarMat);
        pillar.position.set(0,ph/2,pz); g.add(pillar);
    }

    scene.add(g);
    rampMeshes.push({group:g, x, z, ry, rampAngle, rampLen, rampW, rampH});

    // Flat collider for the footprint
    colliders.push({minX:x-rampW/2-1,maxX:x+rampW/2+1,minZ:z-rampLen/2-3,maxZ:z+rampLen/2+3, isRamp:true});
}

/* ══════════════════════════════════════════ HIGHWAY WORLD */
function generateHighway(){
    window._hwChunks=new Map();
    window._hwMeshes=new Map();
    window._hwRoads=[];
    for(let c=-3;c<=3;c++) spawnHighwayChunk(c);
}
const HW_CHUNK=400,HW_LW=4.2,HW_NL=3;
const HW_W=HW_LW*HW_NL;

function hwRand(ci,salt){let h=(ci*73856093^salt*83492791)>>>0;h=((h>>16)^h)*0x45d9f3b;h=((h>>16)^h)*0x45d9f3b;h=(h>>16)^h;return(h>>>0)/4294967296;}

function spawnHighwayChunk(ci){
    if(window._hwChunks.has(ci))return;
    window._hwChunks.set(ci,true);
    const meshes=[];
    const z1=ci*HW_CHUNK, z2=z1+HW_CHUNK, len=HW_CHUNK, cz=z1+len/2, cx=0;
    const totalW=HW_W*2+1.5;
    const mRoad=new THREE.MeshLambertMaterial({color:0x282828});
    const mLine=new THREE.MeshLambertMaterial({color:0xeeeecc});
    const mYL  =new THREE.MeshLambertMaterial({color:0xffcc00});
    const mBar =new THREE.MeshPhongMaterial({color:0xbbbbbb,shininess:50});
    const mBStr=new THREE.MeshLambertMaterial({color:0xff3300,emissive:0xcc1100,emissiveIntensity:0.3});
    const mGrs =new THREE.MeshLambertMaterial({color:0x2a5a10});
    const mSign=new THREE.MeshLambertMaterial({color:0x1a5a1a});
    const mSgnW=new THREE.MeshLambertMaterial({color:0xffffff});
    function add(m){scene.add(m);meshes.push(m);return m;}
    function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);return add(m);}

    // Road surface
    mesh(new THREE.BoxGeometry(totalW,0.18,len),mRoad,cx,0.09,cz).receiveShadow=true;
    // Median strip
    mesh(new THREE.BoxGeometry(1.2,0.02,len),new THREE.MeshLambertMaterial({color:0x1a1a1a}),cx,0.19,cz);
    // Yellow median lines
    for(const yo of[-0.4,0.4]) mesh(new THREE.BoxGeometry(0.22,0.01,len),mYL,yo,0.20,cz);
    // White edge lines
    for(const sx of[-(totalW/2-0.25),totalW/2-0.25]) mesh(new THREE.BoxGeometry(0.22,0.01,len),mLine,sx,0.20,cz);
    // Dashed lane lines
    for(const side of[-1,1]){
        for(let lane=1;lane<HW_NL;lane++){
            const lx=(lane*HW_LW-HW_W+HW_LW/2)*side;
            const dashN=Math.floor(len/11);
            for(let d=0;d<dashN;d++){
                const dz2=z1+(d+0.5)/dashN*len;
                mesh(new THREE.BoxGeometry(0.18,0.01,4.8),mLine,lx,0.20,dz2);
            }
        }
    }
    // Concrete barriers
    const bOff=totalW/2+0.42;
    for(const side of[-1,1]){
        const bx=bOff*side;
        mesh(new THREE.BoxGeometry(0.52,0.92,len-4),mBar,bx,0.46,cz).castShadow=true;
        const sc=Math.floor((len-4)/9);
        for(let i=0;i<sc;i++){
            const sz2=z1+2+(i+0.5)/sc*(len-4);
            mesh(new THREE.BoxGeometry(0.53,0.3,0.82),i%2===0?mBStr:mBar,bx,0.56,sz2);
        }
        // Colliders (thin per 10m)
        const nC=Math.ceil(len/10);
        for(let k=0;k<nC;k++){
            const pz2=z1+2+(k+0.5)/nC*(len-4);
            const cH=(len-4)/(nC*2)+0.3;
            colliders.push({minX:bx-0.4,maxX:bx+0.4,minZ:pz2-cH,maxZ:pz2+cH,_hw:ci});
        }
    }
    // Grass + trees
    const gOff=bOff+6;
    for(const side of[-1,1]){
        mesh(new THREE.BoxGeometry(11,0.1,len+4),mGrs,gOff*side,0.05,cz);
        const tN=Math.floor(len/30);
        for(let t=0;t<tN;t++){
            const tz2=z1+(t+0.5)/tN*len+(hwRand(ci,t+10)-0.5)*8;
            addTree(gOff*side+(hwRand(ci,t+50)-0.5)*3,tz2);
        }
    }
    // Signs
    const sN=Math.floor(len/150);
    for(let si=0;si<sN;si++){
        const sz2=z1+(si+0.5)/sN*len;
        for(const side of[-1,1]){
            const px2=(bOff+2.8)*side;
            mesh(new THREE.CylinderGeometry(0.07,0.07,5.5,6),mBar,px2,2.75,sz2);
            mesh(new THREE.BoxGeometry(3.4,1.4,0.06),mSgnW,px2,5.4,sz2).rotation.y=Math.PI/2;
            mesh(new THREE.BoxGeometry(3.2,1.2,0.1),mSign,px2,5.4,sz2).rotation.y=Math.PI/2;
        }
    }

    // Special features
    const feat=hwRand(ci,2);
    if(feat<0.28){
        // Overhead bridge
        const bz2=z1+len*0.5;
        const mConc=new THREE.MeshLambertMaterial({color:0x999988});
        mesh(new THREE.BoxGeometry(totalW+30,0.55,9),mConc,cx,7.5,bz2);
        for(const px2 of[-(totalW/2+8),totalW/2+8]) mesh(new THREE.BoxGeometry(2.5,7.5,3.5),mConc,px2,3.75,bz2).castShadow=true;
        for(const sz2 of[bz2-4.2,bz2+4.2]) mesh(new THREE.BoxGeometry(totalW+32,0.6,0.25),mBar,cx,8.1,sz2);
    } else if(feat<0.55){
        // Rest stop — right side
        const rsZ=z1+len*0.5, rsX=totalW/2+bOff+22;
        const mPk =new THREE.MeshLambertMaterial({color:0x404040});
        const mBld=new THREE.MeshLambertMaterial({color:0xddcebb});
        const mRf =new THREE.MeshLambertMaterial({color:0x884422});
        const mGl =new THREE.MeshPhongMaterial({color:0x6699bb,transparent:true,opacity:0.5,shininess:100});
        const mCnp=new THREE.MeshLambertMaterial({color:0xdddd00});
        // Exit ramp road (replaces barrier gap at rsZ-30 to rsZ+30 area)
        mesh(new THREE.BoxGeometry(22,0.18,10),mRoad,totalW/2+bOff+5,0.09,rsZ-30);
        mesh(new THREE.BoxGeometry(22,0.18,10),mRoad,totalW/2+bOff+5,0.09,rsZ+30);
        mesh(new THREE.BoxGeometry(9,0.18,70),mRoad,totalW/2+bOff+1.5,0.09,rsZ);
        // Parking lot
        mesh(new THREE.BoxGeometry(65,0.1,80),mPk,rsX+10,0.05,rsZ);
        for(let pl=0;pl<7;pl++) for(const pside of[-1,1]) mesh(new THREE.BoxGeometry(0.12,0.01,6),mLine,rsX-20+pl*8,0.11,rsZ+pside*14);
        // Building
        mesh(new THREE.BoxGeometry(32,5,18),mBld,rsX+12,2.5,rsZ-25).castShadow=true;
        mesh(new THREE.BoxGeometry(34,0.4,20),mRf,rsX+12,5.2,rsZ-25);
        for(let w2=0;w2<3;w2++) mesh(new THREE.BoxGeometry(5,2.8,0.18),mGl,rsX+w2*9,2.8,rsZ-16);
        mesh(new THREE.BoxGeometry(3.5,3.5,0.18),mGl,rsX+12,1.75,rsZ-16);
        mesh(new THREE.BoxGeometry(18,0.3,6),mCnp,rsX+12,4.6,rsZ-20);
        colliders.push({minX:rsX-4,maxX:rsX+28,minZ:rsZ-34,maxZ:rsZ-16,_hw:ci});
    } else if(feat<0.78){
        // Petrol station — left side
        const psZ=z1+len*0.5, psX=-(totalW/2+bOff+22);
        const mPmp=new THREE.MeshLambertMaterial({color:0xee2200});
        const mCnp=new THREE.MeshLambertMaterial({color:0xffdd00});
        const mBld=new THREE.MeshLambertMaterial({color:0xddcebb});
        mesh(new THREE.BoxGeometry(22,0.18,10),mRoad,-(totalW/2+bOff+5),0.09,psZ-25);
        mesh(new THREE.BoxGeometry(22,0.18,10),mRoad,-(totalW/2+bOff+5),0.09,psZ+25);
        mesh(new THREE.BoxGeometry(9,0.18,60),mRoad,-(totalW/2+bOff+1.5),0.09,psZ);
        mesh(new THREE.BoxGeometry(50,0.1,55),new THREE.MeshLambertMaterial({color:0x444444}),psX,0.05,psZ);
        for(const px2 of[psX-10,psX-4,psX+4,psX+10]){
            mesh(new THREE.BoxGeometry(0.7,1.5,0.5),mPmp,px2,0.75,psZ).castShadow=true;
            mesh(new THREE.CylinderGeometry(0.06,0.06,0.6,6),new THREE.MeshLambertMaterial({color:0x111111}),px2-0.45,0.9,psZ+0.4).rotation.z=0.7;
        }
        mesh(new THREE.BoxGeometry(32,0.35,12),mCnp,psX,5.2,psZ);
        for(const cx2 of[psX-12,psX,psX+12]) mesh(new THREE.CylinderGeometry(0.2,0.2,5.2,8),mBar,cx2,2.6,psZ);
        mesh(new THREE.BoxGeometry(14,4,10),mBld,psX,2,psZ+14).castShadow=true;
        mesh(new THREE.BoxGeometry(15,0.3,11),mCnp,psX,4.15,psZ+14);
        mesh(new THREE.BoxGeometry(9,3,0.2),new THREE.MeshPhongMaterial({color:0x6699bb,transparent:true,opacity:0.5}),psX,1.5,psZ+9);
        colliders.push({minX:psX-10,maxX:psX+10,minZ:psZ+9,maxZ:psZ+19,_hw:ci});
    }
    window._hwMeshes.set(ci,meshes);
}

function removeHighwayChunk(ci){
    if(!window._hwChunks.has(ci))return;
    window._hwChunks.delete(ci);
    for(let i=colliders.length-1;i>=0;i--) if(colliders[i]._hw===ci)colliders.splice(i,1);
    (window._hwMeshes.get(ci)||[]).forEach(m=>{scene.remove(m);m.geometry?.dispose();m.material?.dispose();});
    window._hwMeshes.delete(ci);
}

function updateHighway(){
    if(!p1||(CFG.mode==='multi'?CFG.multiWorld:CFG.world)!=='highway')return;
    const pci=Math.floor(p1.pos.z/HW_CHUNK);
    const VIEW=5;
    for(let dc=-VIEW;dc<=VIEW;dc++) spawnHighwayChunk(pci+dc);
    for(const ci of window._hwChunks.keys()) if(Math.abs(ci-pci)>VIEW+2)removeHighwayChunk(ci);
    // X bounds — push back gently
    const maxX=HW_W+1.5;
    if(Math.abs(p1.pos.x)>maxX){p1.pos.x=Math.sign(p1.pos.x)*maxX;p1.speed*=0.35;}
}


/* ══════════════════════════════════════════ SKY WORLD */
// Dynamically generated sky platforms — stored for dynamic expansion
const skyChunks=new Map(); // key="cx,cz" -> true
const SKY_CHUNK=80, SKY_RADIUS=3; // chunks visible around player

function generateSkyWorld(){
    skyChunks.clear();
    // Start platform around spawn
    for(let cx=-2;cx<=2;cx++)for(let cz=-2;cz<=2;cz++) spawnSkyChunk(cx,cz);
}

function skyRand(cx,cz,salt){
    // Deterministic pseudo-random from chunk coords
    let h=(cx*73856093^cz*19349663^salt*83492791)>>>0;
    h=((h>>16)^h)*0x45d9f3b; h=((h>>16)^h)*0x45d9f3b; h=(h>>16)^h;
    return (h>>>0)/4294967296;
}
function spawnSkyChunk(cx,cz){
    const key=cx+','+cz;
    if(skyChunks.has(key))return;
    skyChunks.set(key,true);
    const wx=cx*SKY_CHUNK, wz=cz*SKY_CHUNK;
    const r=skyRand(cx,cz,1);
    // Never void at spawn chunk (0,0) and immediate neighbors
    const isSpawnArea=(Math.abs(cx)<=1&&Math.abs(cz)<=1);
    if(r<0.10&&!isSpawnArea)return; // ~10% void gap, but not near spawn
    // Island dimensions — seeded
    const islandW=22+skyRand(cx,cz,2)*28;
    const islandD=22+skyRand(cx,cz,3)*28;
    const islandH=3+skyRand(cx,cz,4)*5;
    // ALL islands at y=0 surface — NO height variation that would cause stairs
    const yBase=0;
    // Style
    const style=skyRand(cx,cz,5);
    const topCol=style<0.45?0x6ab84a:style<0.7?0xd4b040:style<0.85?0xaac8dd:0xeeeeee;
    const sideCol=style<0.45?0x7a5c28:style<0.7?0xb89040:0x8888aa;
    const matTop=new THREE.MeshLambertMaterial({color:topCol});
    const matSide=new THREE.MeshLambertMaterial({color:sideCol});
    // Island body — tall block hanging in the sky
    addMesh(new THREE.BoxGeometry(islandW,islandH+6,islandD),matSide,wx,-islandH/2-2,wz,0,0,0,true);
    // Flat top surface
    addMesh(new THREE.PlaneGeometry(islandW,islandD),matTop,wx,0.5,wz,-Math.PI/2,0,0,false);
    // Bottom taper (narrower box for floating-island look)
    addMesh(new THREE.BoxGeometry(islandW*0.55,3,islandD*0.55),matSide,wx,-islandH-3,wz,0,0,0,false);
    // Decorations (seeded)
    if(style>0.55&&style<0.82){
        // Trees
        const nt=1+Math.floor(skyRand(cx,cz,6)*4);
        for(let t=0;t<nt;t++){
            const tx=wx+(skyRand(cx,cz,10+t)*2-1)*islandW*0.35;
            const tz=wz+(skyRand(cx,cz,20+t)*2-1)*islandD*0.35;
            addTree(tx,tz);
        }
    }
    if(style>0.82){
        // Cloud puffs floating above
        const nc=2+Math.floor(skyRand(cx,cz,7)*4);
        for(let c=0;c<nc;c++){
            const cr=3+skyRand(cx,cz,30+c)*4;
            const cof=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.88});
            addMesh(new THREE.SphereGeometry(cr,7,5),cof,
                wx+(skyRand(cx,cz,40+c)*2-1)*24,
                8+skyRand(cx,cz,50+c)*10,
                wz+(skyRand(cx,cz,60+c)*2-1)*24,0,0,0,false);
        }
    }
    // Special: rainbow bridge between this and next island
    if(skyRand(cx,cz,8)>0.78){
        const bm=new THREE.MeshLambertMaterial({color:0xffdd44,transparent:true,opacity:0.7});
        addMesh(new THREE.BoxGeometry(SKY_CHUNK*0.65,0.35,4),bm,wx+SKY_CHUNK*0.35,0.4,wz,0,0,0,false);
    }
    // Collider — exact island bounds, surface at y=0.5
    colliders.push({minX:wx-islandW/2,maxX:wx+islandW/2,minZ:wz-islandD/2,maxZ:wz+islandD/2,skyY:0.5});
}

function updateSkyWorld(){
    if(!p1||(CFG.mode==='multi'?CFG.multiWorld:CFG.world)!=='skyworld')return;
    const pcx=Math.round(p1.pos.x/SKY_CHUNK), pcz=Math.round(p1.pos.z/SKY_CHUNK);
    for(let dx=-SKY_RADIUS;dx<=SKY_RADIUS;dx++)
        for(let dz=-SKY_RADIUS;dz<=SKY_RADIUS;dz++)
            spawnSkyChunk(pcx+dx,pcz+dz);
    // Sky world: no fall death — respawn if too low
    if(p1.pos.y<-15){p1.pos.set(0,4,0);p1.velY=0;showToast('🌤️ Retour sur l\'île !');}
}

/* ══════════════════════════════════════════ CAR MESH */
function addPart(g,geo,mat,x,y,z,rx,ry,rz,shadow){
    const m=new THREE.Mesh(geo,mat);
    m.position.set(x,y,z);
    if(rx||ry||rz)m.rotation.set(rx,ry,rz);
    if(shadow){m.castShadow=true;m.receiveShadow=true;}
    g.add(m);return m;
}

function addWheels(g,pl,wR,wW,wox,frontZ,rearZ,extraWheels){
    const mDark=new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:30});
    const mGold=new THREE.MeshPhongMaterial({color:0xc6a84a,shininess:120});
    const mSilver=new THREE.MeshPhongMaterial({color:0x999999,shininess:80});
    const rim=pl.ct.id==='truck'?mSilver:mGold;
    pl.wheels=[];
    const positions=[[-wox,wR,frontZ],[wox,wR,frontZ],[-wox,wR,rearZ],[wox,wR,rearZ]];
    if(extraWheels)extraWheels.forEach(p=>positions.push(p));
    positions.forEach(([wx,wy,wz])=>{
        const wg=new THREE.Group();wg.position.set(wx,wy,wz);wg.rotation.z=Math.PI/2;
        const tire=new THREE.Mesh(new THREE.CylinderGeometry(wR,wR,wW,16),mDark);tire.castShadow=true;wg.add(tire);
        // Rim with spokes look
        wg.add(new THREE.Mesh(new THREE.CylinderGeometry(wR*0.58,wR*0.58,wW+0.01,6),rim));
        wg.add(new THREE.Mesh(new THREE.CylinderGeometry(wR*0.12,wR*0.12,wW+0.02,8),mDark));
        g.add(wg);pl.wheels.push(wg);
    });
}

function createCarMesh(pl){
    const ct=pl.ct,col=pl.color;
    const g=new THREE.Group();
    const mBody  =new THREE.MeshPhongMaterial({color:col,shininess:100});
    const mBody2 =new THREE.MeshPhongMaterial({color:col,shininess:80});  // slightly less shiny for panels
    const mDark  =new THREE.MeshPhongMaterial({color:0x111111,shininess:20});
    const mBlack =new THREE.MeshPhongMaterial({color:0x0a0a0a,shininess:10});
    const mGlass =new THREE.MeshPhongMaterial({color:0x4477aa,transparent:true,opacity:0.55,shininess:200});
    const mGlassDk=new THREE.MeshPhongMaterial({color:0x223344,transparent:true,opacity:0.7,shininess:200});
    const mLight =new THREE.MeshPhongMaterial({color:0xffffdd,emissive:0xffffcc,emissiveIntensity:0.9});
    const mTail  =new THREE.MeshPhongMaterial({color:0xff3333,emissive:0xff2200,emissiveIntensity:0.8});
    const mChrome=new THREE.MeshPhongMaterial({color:0xcccccc,shininess:200,specular:0xffffff});
    const mRust  =new THREE.MeshPhongMaterial({color:0x8b4513,shininess:5});
    const mGold  =new THREE.MeshPhongMaterial({color:0xc6a84a,shininess:120});

    const GY=0.32; // ground offset so wheels touch ground

    if(ct.id==='sport'){
        // ─── Low slung racing car ───
        // Flat wide body
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        // Sloped nose (wedge look)
        const noseGeo=new THREE.BoxGeometry(ct.bW-0.2,ct.bH*0.6,1.4);
        addPart(g,noseGeo,mBody,0,ct.bH*0.3+GY,ct.bD/2+0.7,0.22,0,0,true);
        // Low cabin — narrow
        addPart(g,new THREE.BoxGeometry(ct.cW*0.9,ct.cH,ct.cD*1.1),mBody,0,ct.bH+ct.cH/2+GY,0,0,0,0,true);
        // Windscreen angled
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.85,ct.cH*1.0),mGlass,0,ct.bH+ct.cH*0.55+GY,ct.cD/2-0.05,Math.PI/2+0.55,0,0,false);
        // Rear windscreen
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.75,ct.cH*0.8),mGlassDk,0,ct.bH+ct.cH*0.5+GY,-ct.cD/2+0.05,Math.PI/2-0.5,0,0,false);
        // Side skirts
        [-ct.bW/2+0.05,ct.bW/2-0.05].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.12,0.18,ct.bD),mDark,sx,0.28+GY,0,0,0,0,false);
        });
        // Big rear wing
        addPart(g,new THREE.BoxGeometry(ct.bW+0.6,0.07,0.55),mDark,0,ct.bH+ct.cH+0.4+GY,-ct.bD/2+0.3,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.1,0.5,0.4),mDark,-ct.bW/2+0.1,ct.bH+ct.cH+0.18+GY,-ct.bD/2+0.3,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.1,0.5,0.4),mDark,ct.bW/2-0.1,ct.bH+ct.cH+0.18+GY,-ct.bD/2+0.3,0,0,0,false);
        // Diffuser
        addPart(g,new THREE.BoxGeometry(ct.bW,0.1,0.7),mDark,0,0.35+GY,-ct.bD/2+0.3,0.3,0,0,false);
        // Air intakes on hood
        addPart(g,new THREE.BoxGeometry(0.5,0.08,0.6),mDark,0,ct.bH+0.06+GY,ct.bD/2-0.4,0,0,0,false);
        // Lights front
        [[-ct.bW/2+0.25,ct.bH*0.65+GY,ct.bD/2+0.05],[ct.bW/2-0.25,ct.bH*0.65+GY,ct.bD/2+0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.5,0.12,0.06),mLight,x,y,z,0,0,0,false);
        });
        // Taillights
        [[-ct.bW/2+0.25,ct.bH*0.65+GY,-ct.bD/2-0.05],[ct.bW/2-0.25,ct.bH*0.65+GY,-ct.bD/2-0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.5,0.12,0.06),mTail,x,y,z,0,0,0,false);
        });
        addWheels(g,pl,0.33,0.24,ct.bW/2+0.05,ct.bD/2-0.75,-ct.bD/2+0.75);

    } else if(ct.id==='drift'){
        // ─── Drift car — wide, aggressive, muscle car look ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        // Bulging hood
        addPart(g,new THREE.BoxGeometry(ct.bW*0.7,ct.bH*0.22,ct.bD*0.4),mBody,0,ct.bH+0.11+GY,ct.bD*0.12,0,0,0,false);
        // Muscle cab
        addPart(g,new THREE.BoxGeometry(ct.cW,ct.cH*0.9,ct.cD),mBody,0,ct.bH+ct.cH*0.45+GY,0,0,0,0,true);
        // Wide windscreen
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.2,ct.cH*0.85),mGlass,0,ct.bH+ct.cH*0.52+GY,ct.cD/2-0.05,Math.PI/2+0.42,0,0,false);
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.3,ct.cH*0.75),mGlassDk,0,ct.bH+ct.cH*0.5+GY,-ct.cD/2+0.05,Math.PI/2-0.38,0,0,false);
        // Wide body fenders
        [-ct.bW/2-0.04,ct.bW/2+0.04].forEach((sx,si)=>{
            addPart(g,new THREE.BoxGeometry(0.22,ct.bH*0.55,ct.bD*0.3),mBody,sx,ct.bH*0.45+GY,ct.bD*0.15,0,0,0,false);
            addPart(g,new THREE.BoxGeometry(0.22,ct.bH*0.55,ct.bD*0.3),mBody,sx,ct.bH*0.45+GY,-ct.bD*0.15,0,0,0,false);
        });
        // Huge rear spoiler
        addPart(g,new THREE.BoxGeometry(ct.bW+0.8,0.08,0.7),mDark,0,ct.bH+ct.cH+0.55+GY,-ct.bD/2+0.3,0,0,0,false);
        addPart(g,new THREE.CylinderGeometry(0.07,0.07,0.55,6),mDark,-ct.bW/2-0.1,ct.bH+ct.cH+0.25+GY,-ct.bD/2+0.3,0,0,0,false);
        addPart(g,new THREE.CylinderGeometry(0.07,0.07,0.55,6),mDark,ct.bW/2+0.1,ct.bH+ct.cH+0.25+GY,-ct.bD/2+0.3,0,0,0,false);
        // Front splitter
        addPart(g,new THREE.BoxGeometry(ct.bW+0.3,0.07,0.4),mDark,0,0.38+GY,ct.bD/2+0.18,0,0,0,false);
        // Exhaust (side)
        addPart(g,new THREE.CylinderGeometry(0.1,0.12,1.2,8),mChrome,ct.bW/2+0.08,0.38+GY,-ct.bD/2+1.0,0,0,Math.PI/2,false);
        // Lights
        [[-ct.bW/2+0.28,ct.bH*0.72+GY,ct.bD/2+0.05],[ct.bW/2-0.28,ct.bH*0.72+GY,ct.bD/2+0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.4,0.18,0.07),mLight,x,y,z,0,0,0,false);
        });
        [[-ct.bW/2+0.28,ct.bH*0.72+GY,-ct.bD/2-0.05],[ct.bW/2-0.28,ct.bH*0.72+GY,-ct.bD/2-0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.4,0.18,0.07),mTail,x,y,z,0,0,0,false);
        });
        addWheels(g,pl,0.35,0.28,ct.bW/2+0.06,ct.bD/2-0.8,-ct.bD/2+0.8);

    } else if(ct.id==='rally'){
        // ─── Rally car — high clearance, boxy, roof rack ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY+0.15,0,0,0,0,true);
        // Boxy tall cab
        addPart(g,new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD),mBody,0,ct.bH+ct.cH/2+GY+0.15,0,0,0,0,true);
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.15,ct.cH*0.9),mGlass,0,ct.bH+ct.cH*0.55+GY+0.15,ct.cD/2-0.06,Math.PI/2+0.28,0,0,false);
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.2,ct.cH*0.85),mGlassDk,0,ct.bH+ct.cH*0.52+GY+0.15,-ct.cD/2+0.06,Math.PI/2-0.25,0,0,false);
        // Side windows
        [-ct.cW/2+0.02,ct.cW/2-0.02].forEach(sx=>{
            addPart(g,new THREE.PlaneGeometry(ct.cD*0.6,ct.cH*0.65),mGlass,sx,ct.bH+ct.cH*0.55+GY+0.15,0,0,sx>0?Math.PI/2:-Math.PI/2,0,false);
        });
        // Roof rack
        addPart(g,new THREE.BoxGeometry(ct.cW-0.2,0.07,ct.cD-0.2),mDark,0,ct.bH+ct.cH+0.1+GY+0.15,0,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.06,0.18,ct.cD-0.3),mDark,-ct.cW/2+0.22,ct.bH+ct.cH+0.12+GY+0.15,0,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.06,0.18,ct.cD-0.3),mDark,ct.cW/2-0.22,ct.bH+ct.cH+0.12+GY+0.15,0,0,0,0,false);
        // Rally light bar on front bumper
        addPart(g,new THREE.BoxGeometry(ct.bW-0.3,0.22,0.18),mDark,0,ct.bH*0.75+GY+0.15,ct.bD/2+0.09,0,0,0,false);
        for(let lx=-ct.bW/2+0.4;lx<=ct.bW/2-0.4;lx+=0.5)addPart(g,new THREE.SphereGeometry(0.1,6,4),mLight,lx,ct.bH*0.75+GY+0.15,ct.bD/2+0.17,0,0,0,false);
        // Regular lights
        [[-ct.bW/2+0.28,ct.bH*0.65+GY+0.15,ct.bD/2+0.05],[ct.bW/2-0.28,ct.bH*0.65+GY+0.15,ct.bD/2+0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.4,0.2,0.07),mLight,x,y,z,0,0,0,false);
        });
        [[-ct.bW/2+0.28,ct.bH*0.65+GY+0.15,-ct.bD/2-0.05],[ct.bW/2-0.28,ct.bH*0.65+GY+0.15,-ct.bD/2-0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.4,0.2,0.07),mTail,x,y,z,0,0,0,false);
        });
        // High clearance wheels (bigger)
        addWheels(g,pl,0.42,0.3,ct.bW/2+0.08,ct.bD/2-0.85,-ct.bD/2+0.85);

    } else if(ct.id==='classic'){
        // ─── Classic vintage car — long hood, chrome bumpers, round fenders ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        // Long rounded hood
        addPart(g,new THREE.BoxGeometry(ct.bW-0.3,ct.bH*0.5,ct.bD*0.32),mBody,0,ct.bH*0.85+GY,ct.bD*0.23,0.08,0,0,false);
        // Tall narrow cab
        addPart(g,new THREE.BoxGeometry(ct.cW*0.85,ct.cH*1.1,ct.cD*0.85),mBody,0,ct.bH+ct.cH*0.55+GY,-0.15,0,0,0,true);
        // Rounded windscreen
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.78,ct.cH*0.9),mGlass,0,ct.bH+ct.cH*0.6+GY,ct.cD*0.42-0.1,Math.PI/2+0.32,0,0,false);
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.72,ct.cH*0.82),mGlassDk,0,ct.bH+ct.cH*0.55+GY,-ct.cD*0.42+0.1,Math.PI/2-0.28,0,0,false);
        // Chrome front bumper
        addPart(g,new THREE.BoxGeometry(ct.bW+0.3,0.2,0.22),mChrome,0,0.5+GY,ct.bD/2+0.11,0,0,0,false);
        // Chrome rear bumper
        addPart(g,new THREE.BoxGeometry(ct.bW+0.3,0.2,0.22),mChrome,0,0.5+GY,-ct.bD/2-0.11,0,0,0,false);
        // Running boards (side steps)
        [-ct.bW/2-0.05,ct.bW/2+0.05].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.2,0.12,ct.bD*0.65),mChrome,sx,0.32+GY,0,0,0,0,false);
        });
        // Round fender arches
        [-ct.bW/2,ct.bW/2].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.28,0.35,0.9),mBody,sx,ct.bH*0.52+GY,ct.bD/2-0.75,0,0,0,false);
            addPart(g,new THREE.BoxGeometry(0.28,0.35,0.9),mBody,sx,ct.bH*0.52+GY,-ct.bD/2+0.75,0,0,0,false);
        });
        // Hood ornament
        addPart(g,new THREE.SphereGeometry(0.08,6,4),mChrome,0,ct.bH+0.18+GY,ct.bD*0.3,0,0,0,false);
        // Round headlights
        [[-ct.bW/2+0.38,ct.bH*0.72+GY,ct.bD/2+0.05],[ct.bW/2-0.38,ct.bH*0.72+GY,ct.bD/2+0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.CylinderGeometry(0.2,0.2,0.1,12),mLight,x,y,z,Math.PI/2,0,0,false);
        });
        [[-ct.bW/2+0.35,ct.bH*0.65+GY,-ct.bD/2-0.05],[ct.bW/2-0.35,ct.bH*0.65+GY,-ct.bD/2-0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.CylinderGeometry(0.16,0.16,0.1,10),mTail,x,y,z,Math.PI/2,0,0,false);
        });
        addWheels(g,pl,0.37,0.26,ct.bW/2+0.04,ct.bD/2-0.82,-ct.bD/2+0.82);

    } else if(ct.id==='mini'){
        // ─── Mini — tiny, round, cute, tall for its length ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        // Tall rounded cab takes most of the car
        addPart(g,new THREE.BoxGeometry(ct.cW*0.98,ct.cH*1.15,ct.cD*1.05),mBody,0,ct.bH+ct.cH*0.58+GY,0,0,0,0,true);
        // Big windscreen
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.88,ct.cH*1.0),mGlass,0,ct.bH+ct.cH*0.6+GY,ct.cD/2-0.04,Math.PI/2+0.25,0,0,false);
        addPart(g,new THREE.PlaneGeometry(ct.cW*0.85,ct.cH*0.92),mGlass,0,ct.bH+ct.cH*0.58+GY,-ct.cD/2+0.04,Math.PI/2-0.22,0,0,false);
        // Cute round headlights
        [[-ct.bW/2+0.3,ct.bH*0.72+GY,ct.bD/2+0.05],[ct.bW/2-0.3,ct.bH*0.72+GY,ct.bD/2+0.05]].forEach(([x,y,z])=>{
            addPart(g,new THREE.CylinderGeometry(0.15,0.15,0.08,10),mLight,x,y,z,Math.PI/2,0,0,false);
        });
        [[-ct.bW/2+0.3,ct.bH*0.65+GY,-ct.bD/2-0.04],[ct.bW/2-0.3,ct.bH*0.65+GY,-ct.bD/2-0.04]].forEach(([x,y,z])=>{
            addPart(g,new THREE.CylinderGeometry(0.13,0.13,0.08,10),mTail,x,y,z,Math.PI/2,0,0,false);
        });
        // Small chrome bumpers
        addPart(g,new THREE.BoxGeometry(ct.bW+0.15,0.16,0.16),mChrome,0,0.48+GY,ct.bD/2+0.08,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(ct.bW+0.15,0.16,0.16),mChrome,0,0.48+GY,-ct.bD/2-0.08,0,0,0,false);
        addWheels(g,pl,0.3,0.22,ct.bW/2+0.03,ct.bD/2-0.58,-ct.bD/2+0.58);

    } else if(ct.id==='van'){
        // ─── VAN — tall, long boxy body, sliding door, distinctive front ───
        const vanH=ct.bH*1.35;
        addPart(g,new THREE.BoxGeometry(ct.bW,vanH,ct.bD),mBody,0,vanH/2+GY,0,0,0,0,true);
        // Distinct cab front — shorter than body
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH*0.65,ct.cD*1.2),mBody,0,vanH-ct.bH*0.32+GY,ct.bD/2-ct.cD*0.6,-0.18,0,0,true);
        // Big flat windscreen
        addPart(g,new THREE.PlaneGeometry(ct.bW-0.22,ct.bH*0.6),mGlass,0,vanH-0.12+GY,ct.bD/2-ct.cD*0.1,Math.PI/2+0.52,0,0,false);
        // Side windows (long passenger strip)
        [-ct.bW/2+0.02,ct.bW/2-0.02].forEach((sx,si)=>{
            // Front small cab window
            addPart(g,new THREE.PlaneGeometry(0.55,ct.bH*0.4),mGlass,sx,vanH-0.28+GY,ct.bD/2-ct.cD*0.3,0,sx>0?Math.PI/2:-Math.PI/2,0,false);
            // Rear long passenger windows
            addPart(g,new THREE.PlaneGeometry(ct.bD*0.48,vanH*0.35),mGlassDk,sx,vanH*0.62+GY,-ct.bD*0.1,0,sx>0?Math.PI/2:-Math.PI/2,0,false);
        });
        // Sliding door line
        addPart(g,new THREE.BoxGeometry(0.04,vanH*0.7,ct.bD*0.42),mDark,ct.bW/2+0.01,vanH*0.48+GY,-ct.bD*0.1,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.04,vanH*0.7,ct.bD*0.42),mDark,-ct.bW/2-0.01,vanH*0.48+GY,-ct.bD*0.1,0,0,0,false);
        // Roof vent
        addPart(g,new THREE.BoxGeometry(ct.bW*0.35,0.12,0.7),mDark,0,vanH+0.06+GY,-0.2,0,0,0,false);
        // Front grille
        addPart(g,new THREE.BoxGeometry(ct.bW-0.3,ct.bH*0.35,0.12),mDark,0,ct.bH*0.38+GY,ct.bD/2+0.06,0,0,0,false);
        // Big square headlights
        [[-ct.bW/2+0.35,ct.bH*0.62+GY,ct.bD/2+0.06],[ct.bW/2-0.35,ct.bH*0.62+GY,ct.bD/2+0.06]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.5,0.28,0.09),mLight,x,y,z,0,0,0,false);
        });
        [[-ct.bW/2+0.35,ct.bH*0.55+GY,-ct.bD/2-0.06],[ct.bW/2-0.35,ct.bH*0.55+GY,-ct.bD/2-0.06]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.5,0.22,0.09),mTail,x,y,z,0,0,0,false);
        });
        addWheels(g,pl,0.4,0.3,ct.bW/2+0.06,ct.bD/2-1.0,-ct.bD/2+1.0);

    } else if(ct.id==='truck'){
        // ─── BIG RIG TRUCK — separate cab + huge trailer ───
        const cabH=ct.cH, cabD=ct.cD, trailerH=ct.bH*0.85, trailerD=ct.bD-ct.cD-0.5;
        const trailerZ=-(trailerD/2+ct.cD/2+0.2);
        // Trailer (main body)
        addPart(g,new THREE.BoxGeometry(ct.bW,trailerH,trailerD),mBody,0,trailerH/2+GY+0.2,trailerZ,0,0,0,true);
        // Trailer roof bar / logo strip
        addPart(g,new THREE.BoxGeometry(ct.bW+0.1,0.12,trailerD+0.1),mDark,0,trailerH+0.12+GY+0.2,trailerZ,0,0,0,false);
        // Trailer rear doors  
        addPart(g,new THREE.BoxGeometry(ct.bW-0.15,trailerH-0.2,0.12),mDark,0,trailerH/2+GY+0.2,trailerZ-trailerD/2-0.06,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.08,trailerH-0.2,0.14),mChrome,0,trailerH/2+GY+0.2,trailerZ-trailerD/2-0.07,0,0,0,false); // door line
        // Trailer corner protectors
        for(let sx of[-ct.bW/2,ct.bW/2])for(let sz of[trailerD/2,-trailerD/2]){
            addPart(g,new THREE.BoxGeometry(0.18,trailerH,0.18),mChrome,sx,trailerH/2+GY+0.2,trailerZ+sz,0,0,0,false);
        }
        // Cab (front)
        addPart(g,new THREE.BoxGeometry(ct.bW-0.1,cabH,cabD),mBody,0,cabH/2+GY+0.2,ct.bD/2-cabD/2,0,0,0,true);
        // Cab roof extension (sleeper)
        addPart(g,new THREE.BoxGeometry(ct.bW-0.2,cabH*0.45,cabD*0.6),mBody,0,cabH+cabH*0.225+GY+0.2,ct.bD/2-cabD*0.55,0,0,0,false);
        // Big windscreen
        addPart(g,new THREE.PlaneGeometry(ct.bW-0.35,cabH*0.65),mGlass,0,cabH*0.6+GY+0.2,ct.bD/2-0.09,Math.PI/2+0.35,0,0,false);
        // Cab grille
        addPart(g,new THREE.BoxGeometry(ct.bW-0.2,cabH*0.5,0.14),mDark,0,cabH*0.3+GY+0.2,ct.bD/2+0.07,0,0,0,false);
        // Chrome grille bars
        for(let gy=0;gy<3;gy++) addPart(g,new THREE.BoxGeometry(ct.bW-0.25,0.08,0.1),mChrome,0,cabH*(0.18+gy*0.12)+GY+0.2,ct.bD/2+0.06,0,0,0,false);
        // Exhaust stacks (two tall pipes)
        for(let sx of[-ct.bW/2+0.18,ct.bW/2-0.18]){
            addPart(g,new THREE.CylinderGeometry(0.12,0.14,cabH*1.1,8),mChrome,sx,cabH*0.75+GY+0.2,ct.bD/2-cabD+0.25,0,0,0,false);
            // Cap
            addPart(g,new THREE.ConeGeometry(0.18,0.2,8),mChrome,sx,cabH*1.3+GY+0.2,ct.bD/2-cabD+0.25,Math.PI,0,0,false);
        }
        // Fuel tanks (side of cab)
        for(let sx of[-ct.bW/2-0.04,ct.bW/2+0.04]){
            addPart(g,new THREE.CylinderGeometry(0.35,0.35,1.4,12),mChrome,sx,0.55+GY+0.2,ct.bD/2-cabD+0.6,0,0,Math.PI/2,false);
        }
        // Steps
        for(let sx of[-ct.bW/2,ct.bW/2]){
            addPart(g,new THREE.BoxGeometry(0.38,0.12,0.45),mDark,sx,0.42+GY+0.2,ct.bD/2-0.5,0,0,0,false);
            addPart(g,new THREE.BoxGeometry(0.38,0.12,0.45),mDark,sx,0.78+GY+0.2,ct.bD/2-0.5,0,0,0,false);
        }
        // Big square headlights
        [[-ct.bW/2+0.38,cabH*0.55+GY+0.2,ct.bD/2+0.07],[ct.bW/2-0.38,cabH*0.55+GY+0.2,ct.bD/2+0.07]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.55,0.35,0.1),mLight,x,y,z,0,0,0,false);
        });
        [[-ct.bW/2+0.35,trailerH*0.82+GY+0.2,trailerZ-trailerD/2-0.07],[ct.bW/2-0.35,trailerH*0.82+GY+0.2,trailerZ-trailerD/2-0.07]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.45,0.22,0.08),mTail,x,y,z,0,0,0,false);
        });
        // Hitch connector
        addPart(g,new THREE.BoxGeometry(0.8,0.25,0.8),mChrome,0,GY+0.45,ct.bD/2-cabD-0.1,0,0,0,false);
        // Trailer wheels (dual rear axles)
        addWheels(g,pl,0.48,0.22,ct.bW/2+0.05,ct.bD/2-1.0,trailerZ+0.6,
            [[-ct.bW/2-0.05,0.48,trailerZ-0.6],[ct.bW/2+0.05,0.48,trailerZ-0.6],
             [-ct.bW/2-0.05,0.48,trailerZ+0.6],[ct.bW/2+0.05,0.48,trailerZ+0.6]]);

    } else if(ct.id==='suv'){
        // ─── SUV — tall, wide, modern, aggressive look ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY+0.12,0,0,0,0,true);
        // Tall squared cab
        addPart(g,new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD*1.1),mBody,0,ct.bH+ct.cH/2+GY+0.12,0,0,0,0,true);
        // Windscreen - more vertical
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.18,ct.cH*0.92),mGlass,0,ct.bH+ct.cH*0.56+GY+0.12,ct.cD/2-0.05,Math.PI/2+0.32,0,0,false);
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.22,ct.cH*0.85),mGlassDk,0,ct.bH+ct.cH*0.52+GY+0.12,-ct.cD/2+0.05,Math.PI/2-0.28,0,0,false);
        // Side windows
        [-ct.cW/2+0.02,ct.cW/2-0.02].forEach(sx=>{
            addPart(g,new THREE.PlaneGeometry(ct.cD*0.55,ct.cH*0.72),mGlassDk,sx,ct.bH+ct.cH*0.55+GY+0.12,0,0,sx>0?Math.PI/2:-Math.PI/2,0,false);
        });
        // Roof rack
        addPart(g,new THREE.BoxGeometry(ct.cW-0.25,0.06,ct.cD-0.3),mDark,0,ct.bH+ct.cH+0.06+GY+0.12,0,0,0,0,false);
        // Bull bar
        addPart(g,new THREE.BoxGeometry(ct.bW-0.1,ct.bH*0.65,0.14),mDark,0,ct.bH*0.35+GY+0.12,ct.bD/2+0.07,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(ct.bW+0.2,0.14,0.2),mChrome,0,ct.bH*0.55+GY+0.12,ct.bD/2+0.1,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(ct.bW+0.2,0.14,0.2),mChrome,0,ct.bH*0.24+GY+0.12,ct.bD/2+0.1,0,0,0,false);
        // Side steps
        [-ct.bW/2-0.06,ct.bW/2+0.06].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.2,0.1,ct.bD*0.6),mDark,sx,0.35+GY+0.12,0,0,0,0,false);
        });
        // Wide headlights
        [[-ct.bW/2+0.3,ct.bH*0.75+GY+0.12,ct.bD/2+0.07],[ct.bW/2-0.3,ct.bH*0.75+GY+0.12,ct.bD/2+0.07]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.6,0.2,0.09),mLight,x,y,z,0,0,0,false);
        });
        [[-ct.bW/2+0.3,ct.bH*0.72+GY+0.12,-ct.bD/2-0.07],[ct.bW/2-0.3,ct.bH*0.72+GY+0.12,-ct.bD/2-0.07]].forEach(([x,y,z])=>{
            addPart(g,new THREE.BoxGeometry(0.6,0.2,0.09),mTail,x,y,z,0,0,0,false);
        });
        addWheels(g,pl,0.42,0.3,ct.bW/2+0.07,ct.bD/2-0.9,-ct.bD/2+0.9);

    } else if(ct.id==='kart'){
        // ─── KART — tiny low open wheel racer ───
        const mKart=new THREE.MeshPhongMaterial({color:col,shininess:120});
        // Flat chassis
        addPart(g,new THREE.BoxGeometry(ct.bW,0.14,ct.bD),mKart,0,0.14+GY,0,0,0,0,true);
        // Nose cone
        addPart(g,new THREE.BoxGeometry(ct.bW*0.6,0.1,0.7),mKart,0,0.18+GY,ct.bD/2+0.35,-0.22,0,0,false);
        // Seat (bucket seat)
        addPart(g,new THREE.BoxGeometry(0.7,0.42,0.5),mDark,0,0.38+GY,-ct.bD/2+0.7,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.7,0.55,0.12),mDark,0,0.6+GY,-ct.bD/2+0.45,-0.28,0,0,false);
        // Steering wheel (open kart style)
        const kwg=new THREE.Group();kwg.position.set(0,0.55+GY,ct.bD/2-0.55);kwg.rotation.x=0.5;
        kwg.add(new THREE.Mesh(new THREE.TorusGeometry(0.14,0.018,8,20),mDark));
        [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{const sp=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.12,0.02),mDark);sp.position.set(Math.cos(a)*0.07,Math.sin(a)*0.07,0);sp.rotation.z=a;kwg.add(sp);});
        g.add(kwg);
        // Engine block at rear
        addPart(g,new THREE.BoxGeometry(0.55,0.35,0.4),mDark,-0.22,0.33+GY,-ct.bD/2+0.25,0,0,0,false);
        addPart(g,new THREE.CylinderGeometry(0.06,0.06,0.5,6),mChrome,0.22,0.45+GY,-ct.bD/2+0.12,0,0,Math.PI/2,false); // exhaust
        // Open wheels (bigger, no fenders)
        addWheels(g,pl,0.28,0.2,ct.bW/2+0.12,ct.bD/2-0.35,-ct.bD/2+0.38);
        // Front bumper bar
        addPart(g,new THREE.CylinderGeometry(0.025,0.025,ct.bW+0.5,8),mChrome,0,0.22+GY,ct.bD/2+0.06,0,0,Math.PI/2,false);
        // Number plate
        addPart(g,new THREE.BoxGeometry(0.45,0.22,0.04),new THREE.MeshLambertMaterial({color:0xffffff}),0,0.3+GY,ct.bD/2+0.02,0,0,0,false);
        // Lights
        [[-ct.bW/2+0.25,0.22+GY,ct.bD/2+0.08],[ct.bW/2-0.25,0.22+GY,ct.bD/2+0.08]].forEach(([x,y,z])=>addPart(g,new THREE.SphereGeometry(0.06,6,4),mLight,x,y,z,0,0,0,false));

    } else if(ct.id==='bumper'){
        // ─── BUMPER CAR — round chunky fairground car ───
        // Round oval body
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH*0.7,ct.bD),mBody,0,ct.bH*0.35+GY,0,0,0,0,true);
        // Front and rear thick rubber bumpers
        addPart(g,new THREE.BoxGeometry(ct.bW+0.5,ct.bH*0.55,0.35),new THREE.MeshPhongMaterial({color:0x111111,shininess:5}),0,ct.bH*0.3+GY,ct.bD/2+0.17,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(ct.bW+0.5,ct.bH*0.55,0.35),new THREE.MeshPhongMaterial({color:0x111111,shininess:5}),0,ct.bH*0.3+GY,-ct.bD/2-0.17,0,0,0,false);
        // Side bumpers
        [-ct.bW/2-0.17,ct.bW/2+0.17].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.35,ct.bH*0.55,ct.bD+0.2),new THREE.MeshPhongMaterial({color:0x111111,shininess:5}),sx,ct.bH*0.3+GY,0,0,0,0,false);
        });
        // Cab — dome shape (box approximation)
        addPart(g,new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD),mBody,0,ct.bH*0.7+ct.cH/2+GY,0,0,0,0,true);
        addPart(g,new THREE.BoxGeometry(ct.cW-0.1,ct.cH*0.5,ct.cD*0.8),new THREE.MeshPhongMaterial({color:col,shininess:130}),0,ct.bH*0.7+ct.cH+ct.cH*0.25+GY,0,0,0,0,false); // dome top
        // Big windscreen wrap
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.15,ct.cH*0.88),mGlass,0,ct.bH*0.7+ct.cH*0.56+GY,ct.cD/2-0.04,Math.PI/2+0.22,0,0,false);
        // Pole (ceiling electric pole)
        addPart(g,new THREE.CylinderGeometry(0.04,0.04,1.8,8),mChrome,0.2,ct.bH*0.7+ct.cH+0.9+GY,0,0,0,0.18,false);
        addPart(g,new THREE.SphereGeometry(0.08,8,6),new THREE.MeshPhongMaterial({color:0xffcc00,emissive:0xffaa00,emissiveIntensity:0.6}),0.2+Math.sin(0.18)*0.9,ct.bH*0.7+ct.cH+1.85+GY,0.18*0.9,0,0,0,false);
        // Colorful stripe
        addPart(g,new THREE.BoxGeometry(ct.bW+0.01,0.12,ct.bD+0.01),new THREE.MeshLambertMaterial({color:0xffdd00}),0,ct.bH*0.72+GY,0,0,0,0,false);
        // Headlights (round)
        [[-ct.bW/2+0.38,ct.bH*0.55+GY,ct.bD/2+0.18],[ct.bW/2-0.38,ct.bH*0.55+GY,ct.bD/2+0.18]].forEach(([x,y,z])=>addPart(g,new THREE.CylinderGeometry(0.12,0.12,0.08,10),mLight,x,y,z,Math.PI/2,0,0,false));
        // No conventional wheels — use small flat ones
        addWheels(g,pl,0.26,0.22,ct.bW/2,ct.bD/2-0.45,-ct.bD/2+0.45);

    } else if(ct.id==='mower'){
        // ─── RIDE-ON MOWER — boxy garden tractor ───
        // Main body (tractor body)
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        // Mower deck at front (flat wide blades housing)
        addPart(g,new THREE.BoxGeometry(ct.bW+0.55,0.18,ct.bD*0.55),new THREE.MeshLambertMaterial({color:0x2a6a0a}),0,0.2+GY,ct.bD/2+ct.bD*0.27+0.1,0,0,0,false);
        // Mower blade spindle covers
        [-0.35,0,0.35].forEach(ox=>{addPart(g,new THREE.CylinderGeometry(0.16,0.16,0.1,10),new THREE.MeshLambertMaterial({color:0x1a5a0a}),ox,0.32+GY,ct.bD/2+ct.bD*0.27+0.12,0,0,0,false);});
        // Hood over engine
        addPart(g,new THREE.BoxGeometry(ct.bW-0.1,ct.bH*0.55,ct.bD*0.42),mBody,0,ct.bH+ct.bH*0.28+GY,ct.bD*0.16,0,0,0,false);
        // Seat  
        addPart(g,new THREE.BoxGeometry(0.75,0.12,0.6),new THREE.MeshLambertMaterial({color:0x222222}),0,ct.bH+0.18+GY,-ct.bD*0.12,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.7,0.55,0.12),new THREE.MeshLambertMaterial({color:0x222222}),0,ct.bH+0.44+GY,-ct.bD*0.3,-0.25,0,0,false);
        // Steering wheel
        const mwg=new THREE.Group();mwg.position.set(0,ct.bH+0.52+GY,ct.bD*0.08);mwg.rotation.x=0.4;
        mwg.add(new THREE.Mesh(new THREE.TorusGeometry(0.16,0.022,8,18),mDark));
        mwg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.22,6),mDark));
        g.add(mwg);
        // Exhaust pipe
        addPart(g,new THREE.CylinderGeometry(0.055,0.065,0.7,8),mChrome,ct.bW/2-0.3,ct.bH+0.35+GY,ct.bD*0.22,0,0,0,false);
        addPart(g,new THREE.ConeGeometry(0.08,0.12,8),new THREE.MeshLambertMaterial({color:0x333333}),ct.bW/2-0.3,ct.bH+0.73+GY,ct.bD*0.22,0,0,0,false);
        // Big rear wheels, small front
        const mDarkW=new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:30});
        const mGoldW=new THREE.MeshPhongMaterial({color:0x888820,shininess:60});
        pl.wheels=[];
        // Big rear
        [[ct.bW/2+0.08,0.42+GY,-ct.bD/2+0.55],[-ct.bW/2-0.08,0.42+GY,-ct.bD/2+0.55]].forEach(([wx,wy,wz])=>{
            const wg2=new THREE.Group();wg2.position.set(wx,wy,wz);wg2.rotation.z=Math.PI/2;
            wg2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.28,14),mDarkW));
            wg2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.3,8),mGoldW));
            g.add(wg2);pl.wheels.push(wg2);
        });
        // Small front
        [[ct.bW/2-0.1,0.24+GY,ct.bD/2-0.35],[-ct.bW/2+0.1,0.24+GY,ct.bD/2-0.35]].forEach(([wx,wy,wz])=>{
            const wg2=new THREE.Group();wg2.position.set(wx,wy,wz);wg2.rotation.z=Math.PI/2;
            wg2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.2,12),mDarkW));
            wg2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.22,8),mGoldW));
            g.add(wg2);pl.wheels.push(wg2);
        });
        // Lights
        [[-ct.bW/2+0.3,ct.bH*0.62+GY,ct.bD/2+0.06],[ct.bW/2-0.3,ct.bH*0.62+GY,ct.bD/2+0.06]].forEach(([x,y,z])=>addPart(g,new THREE.CylinderGeometry(0.1,0.1,0.07,8),mLight,x,y,z,Math.PI/2,0,0,false));

    } else if(ct.id==='plane'){
        // ─── AVION — fuselage Z-axis, ailes X-axis ───
        // Forward = +Z, wingspan = X
        const WS=ct.bW;   // wingspan = 8
        const FL=ct.bD;   // fuselage length = 7
        const mWing=new THREE.MeshPhongMaterial({color:col,shininess:120});
        const mEng=new THREE.MeshPhongMaterial({color:0x222222,shininess:60});
        const mExh=new THREE.MeshPhongMaterial({color:0x555555,shininess:30});
        // ── Fuselage (cylinder-like with boxes) ──
        addPart(g,new THREE.BoxGeometry(1.6,1.2,FL*0.55),mBody,0,1.4+GY,0,0,0,0,true);        // main body
        addPart(g,new THREE.BoxGeometry(1.2,1.0,FL*0.3),mBody,0,1.3+GY,FL*0.42,0,0,0,false);  // nose section
        addPart(g,new THREE.BoxGeometry(0.9,0.8,FL*0.12),mBody,0,1.25+GY,FL*0.55,-0.15,0,0,false); // nose tip
        addPart(g,new THREE.BoxGeometry(1.0,0.85,FL*0.2),mBody,0,1.3+GY,-FL*0.36,0.1,0,0,false); // tail section
        // ── Cockpit canopy (bulge on top-front) ──
        addPart(g,new THREE.BoxGeometry(1.1,0.65,1.8),mGlass,0,2.08+GY,FL*0.22,0,0,0,false);
        // ── Main wings — swept back, span X axis ──
        // Root (thick, short, near fuselage)
        addPart(g,new THREE.BoxGeometry(WS*0.38,0.28,2.8),mWing,-WS*0.19,1.1+GY,0.1,0,0,0.05,true);
        addPart(g,new THREE.BoxGeometry(WS*0.38,0.28,2.8),mWing, WS*0.19,1.1+GY,0.1,0,0,-0.05,true);
        // Mid section (thinner, swept)
        addPart(g,new THREE.BoxGeometry(WS*0.28,0.18,2.0),mWing,-WS*0.49,1.0+GY,0.25,0,0,0.06,false);
        addPart(g,new THREE.BoxGeometry(WS*0.28,0.18,2.0),mWing, WS*0.49,1.0+GY,0.25,0,0,-0.06,false);
        // Tip (thin)
        addPart(g,new THREE.BoxGeometry(WS*0.16,0.12,1.1),mWing,-WS*0.44*1.5,0.9+GY,0.35,0,0,0.08,false);
        addPart(g,new THREE.BoxGeometry(WS*0.16,0.12,1.1),mWing, WS*0.44*1.5,0.9+GY,0.35,0,0,-0.08,false);
        // Winglet tips (upturned)
        addPart(g,new THREE.BoxGeometry(0.18,0.55,0.9),mWing,-WS/2,1.18+GY,0.35,0,0,0.25,false);
        addPart(g,new THREE.BoxGeometry(0.18,0.55,0.9),mWing, WS/2,1.18+GY,0.35,0,0,-0.25,false);
        // ── Tail fins ──
        addPart(g,new THREE.BoxGeometry(0.22,1.6,1.4),mWing,0,2.1+GY,-FL*0.38,0,0,0,true);    // vertical fin
        addPart(g,new THREE.BoxGeometry(3.0,0.15,1.0),mWing,0,1.6+GY,-FL*0.4,0,0,0,false);   // horiz stabilizer
        // ── Engines — 2 under wings, cylinders along Z ──
        for(const ex of[-WS*0.28, WS*0.28]){
            addPart(g,new THREE.CylinderGeometry(0.5,0.42,2.8,12),mEng,ex,0.68+GY,0.3,Math.PI/2,0,0,true);   // nacelle
            addPart(g,new THREE.CylinderGeometry(0.54,0.5,0.22,12),mChrome,ex,0.68+GY,1.72,Math.PI/2,0,0,false); // inlet ring
            addPart(g,new THREE.CylinderGeometry(0.32,0.42,0.18,12),mExh,ex,0.68+GY,-1.1,Math.PI/2,0,0,false); // exhaust
            // Pylon connecting engine to wing
            addPart(g,new THREE.BoxGeometry(0.28,0.5,0.6),mBody,ex,0.88+GY,0.3,0,0,0,false);
        }
        // ── Landing gear struts (down position) ──
        for(const gx of[-WS*0.22, WS*0.22]){
            addPart(g,new THREE.CylinderGeometry(0.08,0.08,0.65,6),mDark,gx,0.6+GY,FL*0.1,0,0,0,false);
            addPart(g,new THREE.CylinderGeometry(0.14,0.14,0.22,10),mDark,gx,0.28+GY,FL*0.1,Math.PI/2,0,0,false);
        }
        addPart(g,new THREE.CylinderGeometry(0.08,0.08,0.45,6),mDark,0,0.55+GY,FL*0.42,0,0,0,false); // nose gear
        addPart(g,new THREE.CylinderGeometry(0.12,0.12,0.18,10),mDark,0,0.28+GY,FL*0.42,Math.PI/2,0,0,false);
        // ── Lights ──
        addPart(g,new THREE.SphereGeometry(0.12,6,4),mLight,0,1.28+GY,FL*0.56,0,0,0,false); // nose light
        addPart(g,new THREE.SphereGeometry(0.09,6,4),new THREE.MeshPhongMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:0.8}),-WS/2,0.95+GY,0.3,0,0,0,false); // left nav
        addPart(g,new THREE.SphereGeometry(0.09,6,4),new THREE.MeshPhongMaterial({color:0x00ff00,emissive:0x00ff00,emissiveIntensity:0.8}), WS/2,0.95+GY,0.3,0,0,0,false); // right nav
        pl.wheels=[];

    } else if(ct.id==='heli'){
        // ─── HÉLICOPTÈRE ───
        const mRotor=new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:20});
        const mMetal=new THREE.MeshPhongMaterial({color:0x888888,shininess:80});
        const BH=ct.bH, BW=ct.bW, BD=ct.bD;
        const bodyY=BH/2+GY+0.5;
        // ── Fuselage main ──
        addPart(g,new THREE.BoxGeometry(BW,BH,BD*0.5),mBody,0,bodyY,BD*0.08,0,0,0,true);
        // Nose (glass bubble)
        addPart(g,new THREE.BoxGeometry(BW*0.9,BH*0.85,BD*0.28),mGlass,0,bodyY-0.1,BD*0.35,0.15,0,0,false);
        // Rear body
        addPart(g,new THREE.BoxGeometry(BW*0.75,BH*0.7,BD*0.2),mBody,0,bodyY-0.1,-BD*0.28,0,0,0,false);
        // Tail boom (long, narrowing)
        addPart(g,new THREE.BoxGeometry(0.7,0.6,BD*0.8),mBody,0,bodyY-0.25,-BD*0.65,0.06,0,0,true);
        addPart(g,new THREE.BoxGeometry(0.5,0.45,BD*0.3),mBody,0,bodyY-0.32,-BD*1.05,0.04,0,0,false);
        // Tail vertical fin
        addPart(g,new THREE.BoxGeometry(0.18,1.1,0.7),mBody,0,bodyY+0.22,-BD*1.1,0,0,0,false);
        // ── Tail rotor (spins on Z axis — horizontal plane) ──
        const tRotorHub=new THREE.Group();
        tRotorHub.position.set(BW*0.38,bodyY+0.28,-BD*1.1);
        const trBlade1=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.4,0.14),mRotor);
        const trBlade2=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.4,0.14),mRotor);
        trBlade2.rotation.z=Math.PI/2;
        tRotorHub.add(trBlade1);tRotorHub.add(trBlade2);
        g.add(tRotorHub);
        if(!pl._tailRotor)pl._tailRotor=tRotorHub;
        // ── Main rotor assembly — use a GROUP so whole thing rotates ──
        const rotorGroup=new THREE.Group();
        rotorGroup.position.set(0,BH+GY+0.5+0.6,BD*0.04);
        // Hub cylinder
        rotorGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.35,8),mMetal));
        // 4 blades extending in X/Z from hub
        const bladeSpan=BW*1.0+2;
        for(let b=0;b<4;b++){
            const ba=(b/4)*Math.PI*2;
            const blade=new THREE.Mesh(new THREE.BoxGeometry(bladeSpan*0.5,0.07,0.55),mRotor);
            blade.position.set(Math.cos(ba)*bladeSpan*0.25,0.25,Math.sin(ba)*bladeSpan*0.25);
            blade.rotation.y=ba;
            rotorGroup.add(blade);
        }
        g.add(rotorGroup);
        pl._rotorGroup=rotorGroup; // for animation
        // ── Skids ──
        for(const sk of[-BW*0.38, BW*0.38]){
            addPart(g,new THREE.BoxGeometry(0.14,0.14,BD*0.75),mMetal,sk,GY+0.08,0,0,0,0,false);
            addPart(g,new THREE.CylinderGeometry(0.07,0.07,0.42,6),mMetal,sk,GY+0.25,BD*0.28,0,0,0,false);
            addPart(g,new THREE.CylinderGeometry(0.07,0.07,0.42,6),mMetal,sk,GY+0.25,-BD*0.28,0,0,0,false);
        }
        // Lights
        addPart(g,new THREE.SphereGeometry(0.12,6,4),mLight,0,bodyY-0.1,BD*0.5,0,0,0,false);
        addPart(g,new THREE.SphereGeometry(0.1,6,4),new THREE.MeshPhongMaterial({color:0xff2200,emissive:0xff0000,emissiveIntensity:0.7}),-BW/2+0.15,bodyY,0,0,0,0,false);
        addPart(g,new THREE.SphereGeometry(0.1,6,4),new THREE.MeshPhongMaterial({color:0x00ee22,emissive:0x00cc00,emissiveIntensity:0.7}), BW/2-0.15,bodyY,0,0,0,0,false);
        pl.wheels=[];

    } else if(ct.id==='tank'){
        // ─── TANK — châssis large, tourelle, canon ───
        const mSteel=new THREE.MeshPhongMaterial({color:0x4a5a30,shininess:15});
        const mTurret=new THREE.MeshPhongMaterial({color:0x3a4a22,shininess:10});
        const mTrack=new THREE.MeshPhongMaterial({color:0x222222,shininess:5});
        // Main hull (very wide, low)
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mSteel,0,ct.bH/2+GY,0,0,0,0,true);
        // Hull sloped front
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH*0.55,ct.bD*0.3),mSteel,0,ct.bH*0.7+GY,ct.bD/2-ct.bD*0.15,-0.42,0,0,false);
        // Turret ring
        addPart(g,new THREE.CylinderGeometry(ct.bW*0.32,ct.bW*0.35,0.25,12),mTurret,0,ct.bH+0.12+GY,0,0,0,0,true);
        // Turret dome
        addPart(g,new THREE.BoxGeometry(ct.bW*0.6,ct.bH*0.75,ct.bD*0.55),mTurret,0,ct.bH+0.5+GY,-0.1,0,0,0,true);
        // Commander cupola
        addPart(g,new THREE.CylinderGeometry(0.35,0.38,0.4,8),mTurret,-0.4,ct.bH+0.95+GY,-0.15,0,0,0,false);
        // Cannon barrel (long)
        addPart(g,new THREE.CylinderGeometry(0.14,0.18,ct.bD*0.85,8),mDark,0,ct.bH+0.48+GY,ct.bD*0.42,Math.PI/2,0,0,true);
        // Muzzle brake
        addPart(g,new THREE.CylinderGeometry(0.22,0.22,0.3,8),mDark,0,ct.bH+0.48+GY,ct.bD*0.42+ct.bD*0.42,Math.PI/2,0,0,false);
        // Side track guards
        [-ct.bW/2-0.08,ct.bW/2+0.08].forEach(sx=>{
            addPart(g,new THREE.BoxGeometry(0.22,ct.bH*0.55,ct.bD+0.4),mSteel,sx,ct.bH*0.35+GY,0,0,0,0,false);
        });
        // Tracks (rubber texture simulated)
        [-ct.bW/2,ct.bW/2].forEach(sx=>{
            for(let t=-ct.bD/2+0.5;t<ct.bD/2;t+=0.7){
                addPart(g,new THREE.BoxGeometry(ct.bW*0.08,0.45,0.55),mTrack,sx,0.22+GY,t,0,0,0,false);
            }
        });
        // Rear exhaust
        addPart(g,new THREE.BoxGeometry(0.7,0.35,0.18),new THREE.MeshLambertMaterial({color:0x333333}),0,ct.bH*0.4+GY,-ct.bD/2-0.09,0,0,0,false);
        pl.wheels=[];

    } else if(ct.id==='bike'){
        // ─── VÉLO — roues dans XZ, axe = X, tourne sur Y ───
        // Bike forward=+Z. Wheels roll along Z → axis = X → rotation.x for spin
        const mFrame=new THREE.MeshPhongMaterial({color:col,shininess:90});
        const mTire=new THREE.MeshPhongMaterial({color:0x111111,shininess:5});
        const mSpoke=new THREE.MeshPhongMaterial({color:0x999999,shininess:60});
        const mGrip=new THREE.MeshLambertMaterial({color:0x222222});
        const wR=0.46; // wheel radius
        // ── Helper: build a spoked wheel group ──
        function makeWheel(wr){
            const wg=new THREE.Group();
            // Tyre (torus in XZ plane — ring around Y axis)
            wg.add(new THREE.Mesh(new THREE.TorusGeometry(wr,0.055,8,22),mTire));
            // Hub
            wg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.065,0.09,8),mChrome));
            // Spokes (radiate in XZ plane from hub to rim)
            for(let s=0;s<8;s++){
                const sa=(s/8)*Math.PI*2;
                const spk=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,wr*0.92,4),mSpoke);
                // Position: halfway between hub and rim, rotate around Y
                spk.position.set(Math.sin(sa)*wr*0.46,0,Math.cos(sa)*wr*0.46);
                spk.rotation.set(sa,0,0); // tilt toward rim
                wg.add(spk);
            }
            return wg;
        }
        // Front wheel at +Z, rear at -Z
        const fwg=makeWheel(wR); fwg.position.set(0,wR+GY, ct.bD*0.42);
        const rwg=makeWheel(wR); rwg.position.set(0,wR+GY,-ct.bD*0.38);
        g.add(fwg); g.add(rwg);
        pl.wheels=[fwg,rwg];
        // ── Frame diamond: BB at centre bottom, head tube at front top ──
        const bbX=0, bbY=wR*0.85+GY, bbZ=-ct.bD*0.02; // bottom bracket (crank)
        const htX=0, htY=wR*1.78+GY, htZ=ct.bD*0.32;  // head tube top
        const stX=0, stY=wR*1.9+GY,  stZ=-ct.bD*0.12; // seat tube top
        function addTube(x1,y1,z1,x2,y2,z2,r,mat){
            const dx=x2-x1,dy=y2-y1,dz=z2-z1;
            const len=Math.sqrt(dx*dx+dy*dy+dz*dz);
            const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,7),mat);
            m.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/len,dy/len,dz/len));
            g.add(m);
        }
        addTube(bbX,bbY,bbZ, stX,stY,stZ, 0.042,mFrame); // seat tube
        addTube(stX,stY,stZ, htX,htY,htZ, 0.040,mFrame); // top tube
        addTube(bbX,bbY,bbZ, htX,htY,htZ, 0.048,mFrame); // down tube
        addTube(bbX,bbY,bbZ, -ct.bD*0.01,wR+GY+0.08,-ct.bD*0.38, 0.038,mFrame); // chain stay
        // Fork
        addTube(htX,htY,htZ, 0,wR+GY+0.1,ct.bD*0.42, 0.038,mFrame);
        // ── Seat ──
        addPart(g,new THREE.BoxGeometry(0.14,0.06,0.52),mGrip,stX,stY+0.18+GY*0,stZ+0.04,0,0,0,false);
        // Seat post
        addTube(stX,stY+GY*0,stZ, stX,stY+0.16+GY*0,stZ, 0.025,mChrome);
        // ── Handlebar stem + bars ──
        addTube(htX,htY,htZ, 0,htY+0.22,htZ-0.06, 0.03,mChrome); // stem
        addPart(g,new THREE.CylinderGeometry(0.025,0.025,0.56,7),mChrome,0,htY+0.25,htZ-0.06,0,0,Math.PI/2,false); // bar
        addPart(g,new THREE.CylinderGeometry(0.035,0.035,0.12,8),mGrip,-0.28,htY+0.25,htZ-0.06,0,0,Math.PI/2,false); // grip L
        addPart(g,new THREE.CylinderGeometry(0.035,0.035,0.12,8),mGrip, 0.28,htY+0.25,htZ-0.06,0,0,Math.PI/2,false); // grip R
        // ── Pedals (crank arms) ──
        addPart(g,new THREE.BoxGeometry(0.4,0.055,0.055),mDark, 0.22,bbY-0.04,bbZ,0,0,0,false);
        addPart(g,new THREE.BoxGeometry(0.4,0.055,0.055),mDark,-0.22,bbY-0.04,bbZ,0,0,0,false);
        // Chain ring (circle)
        addPart(g,new THREE.TorusGeometry(0.18,0.03,6,16),new THREE.MeshLambertMaterial({color:0xc6a84a}),0,bbY,bbZ,Math.PI/2,0,0,false);

    } else if(ct.id==='scoot'){
        // ─── TROTTINETTE — deck long, tube pliant, guidon, 2 roues ───
        const mDeck=new THREE.MeshPhongMaterial({color:col,shininess:120});
        const mTire2=new THREE.MeshPhongMaterial({color:0x111111,shininess:5});
        const mGrip2=new THREE.MeshLambertMaterial({color:0x222222});
        const swR=0.2; // small wheel radius
        // ── Deck — thin long board ──
        addPart(g,new THREE.BoxGeometry(0.42,0.07,ct.bD*0.85),mDeck,0,swR+0.04+GY,0,0,0,0,true);
        // Deck grip tape (dark top)
        addPart(g,new THREE.BoxGeometry(0.38,0.02,ct.bD*0.65),new THREE.MeshLambertMaterial({color:0x111111}),0,swR+0.09+GY,0.04,0,0,0,false);
        // Rear fender arch (goes over rear wheel)
        addPart(g,new THREE.BoxGeometry(0.38,0.14,0.32),mDeck,0,swR+0.2+GY,-ct.bD*0.35,-0.55,0,0,false);
        // ── Front fork + stem ──
        const forkZ=ct.bD*0.36;
        addPart(g,new THREE.BoxGeometry(0.44,0.16,0.12),mDeck,0,swR+0.16+GY,forkZ,0,0,0,false); // fork crown
        // Fork legs
        addPart(g,new THREE.CylinderGeometry(0.035,0.04,0.32,8),mChrome,-0.14,swR+0.16+GY,forkZ,0,0,0,false);
        addPart(g,new THREE.CylinderGeometry(0.035,0.04,0.32,8),mChrome, 0.14,swR+0.16+GY,forkZ,0,0,0,false);
        // Stem (angled back slightly)
        addPart(g,new THREE.CylinderGeometry(0.04,0.045,0.72,8),mChrome,0,swR+0.52+GY,forkZ+0.04,-0.14,0,0,false);
        // Folding hinge
        addPart(g,new THREE.BoxGeometry(0.18,0.14,0.14),mDeck,0,swR+0.18+GY,forkZ+0.02,0,0,0,false);
        // ── Handlebar ──
        const hbY=swR+1.08+GY, hbZ=forkZ-0.05;
        addPart(g,new THREE.CylinderGeometry(0.028,0.028,0.72,8),mChrome,0,hbY,hbZ,0,0,Math.PI/2,false); // bar
        // Clamp in centre
        addPart(g,new THREE.CylinderGeometry(0.055,0.055,0.1,8),mDeck,0,hbY,hbZ,0,0,Math.PI/2,false);
        // Grips
        addPart(g,new THREE.CylinderGeometry(0.042,0.042,0.15,8),mGrip2,-0.36,hbY,hbZ,0,0,Math.PI/2,false);
        addPart(g,new THREE.CylinderGeometry(0.042,0.042,0.15,8),mGrip2, 0.36,hbY,hbZ,0,0,Math.PI/2,false);
        // Brake lever (right side)
        addPart(g,new THREE.BoxGeometry(0.05,0.08,0.22),mDark,0.28,hbY-0.06,hbZ+0.08,-0.4,0,0,false);
        // ── Wheels (torus in XZ plane, axis = X) ──
        function makeScootWheel(r){
            const wg=new THREE.Group();
            wg.add(new THREE.Mesh(new THREE.TorusGeometry(r,0.055,8,18),mTire2));
            wg.add(new THREE.Mesh(new THREE.CylinderGeometry(r*0.32,r*0.32,0.09,8),mChrome));
            return wg;
        }
        const sfwg=makeScootWheel(swR); sfwg.position.set(0,swR+GY, forkZ);
        const srwg=makeScootWheel(swR); srwg.position.set(0,swR+GY,-ct.bD*0.38);
        g.add(sfwg); g.add(srwg);
        pl.wheels=[sfwg,srwg];
        // ── LED underglow strip (coloured) ──
        addPart(g,new THREE.BoxGeometry(0.44,0.04,ct.bD*0.7),new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:0.35}),0,swR-0.02+GY,0,0,0,0,false);

    } else {
        // ─── Fallback generic ───
        addPart(g,new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody,0,ct.bH/2+GY,0,0,0,0,true);
        addPart(g,new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD),mBody,0,ct.bH+ct.cH/2+GY,0,0,0,0,true);
        addPart(g,new THREE.PlaneGeometry(ct.cW-0.2,ct.cH*0.85),mGlass,0,ct.bH+ct.cH*0.55+GY,ct.cD/2-0.05,Math.PI/2+0.35,0,0,false);
        [[-ct.bW/2+0.28,ct.bH*0.7+GY,ct.bD/2+0.05],[ct.bW/2-0.28,ct.bH*0.7+GY,ct.bD/2+0.05]].forEach(([x,y,z])=>addPart(g,new THREE.BoxGeometry(0.38,0.18,0.08),mLight,x,y,z,0,0,0,false));
        [[-ct.bW/2+0.28,ct.bH*0.7+GY,-ct.bD/2-0.05],[ct.bW/2-0.28,ct.bH*0.7+GY,-ct.bD/2-0.05]].forEach(([x,y,z])=>addPart(g,new THREE.BoxGeometry(0.38,0.18,0.08),mTail,x,y,z,0,0,0,false));
        addWheels(g,pl,0.36,0.26,ct.bW/2+0.04,ct.bD/2-0.85,-ct.bD/2+0.85);
    }

    // Name label sprite above car
    if(pl.name && pl.name!=='?'){
        const c2=document.createElement('canvas');c2.width=256;c2.height=64;
        const cx2=c2.getContext('2d');
        cx2.fillStyle='rgba(0,0,0,0.62)';
        if(cx2.roundRect){cx2.beginPath();cx2.roundRect(4,10,248,46,8);cx2.fill();}
        else{cx2.fillRect(4,10,248,46);}
        cx2.fillStyle='#e8d080';cx2.font='bold 26px Arial';cx2.textAlign='center';
        cx2.fillText(pl.name.substring(0,12),128,43);
        const tex=new THREE.CanvasTexture(c2);
        const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
        spr.scale.set(3.5,0.88,1);
        // Height above car depends on type
        const labelH = ct.id==='truck'?ct.cH*1.8:(ct.id==='van'?ct.bH*1.35+ct.cH+0.6:ct.bH+ct.cH+0.9);
        spr.position.set(0,labelH,0);
        g.add(spr);pl.nameSprite=spr;
    }

    scene.add(g);pl.mesh=g;
    g.position.copy(pl.pos);
    return g;
}

/* ══════════════════════════════════════════ COCKPIT */
function buildCockpit(pl){
    if(cockpitGroup){scene.remove(cockpitGroup);}
    const g=new THREE.Group();
    const mDash=new THREE.MeshPhongMaterial({color:0x111111,shininess:20});
    const mDashTop=new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:30});
    const mRim=new THREE.MeshPhongMaterial({color:0x222222,shininess:60});
    const mHub=new THREE.MeshPhongMaterial({color:pl.color,shininess:80});
    const mChrome=new THREE.MeshPhongMaterial({color:0x888888,shininess:180,specular:0xffffff});
    const mGauge=new THREE.MeshPhongMaterial({color:0x0a0a0a,emissive:0x001100,emissiveIntensity:0.3});
    const mLight=new THREE.MeshPhongMaterial({color:0xffffaa,emissive:0xffffaa,emissiveIntensity:0.5});
    const mRed=new THREE.MeshPhongMaterial({color:0xff2200,emissive:0xff1100,emissiveIntensity:0.4});

    // Dashboard main body — curved slab
    const dash=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.55,0.6),mDash);
    dash.position.set(0,-0.18,0.7);dash.rotation.x=-0.22;g.add(dash);
    // Dashboard top
    const top=new THREE.Mesh(new THREE.BoxGeometry(2.44,0.08,0.7),mDashTop);
    top.position.set(0,0.1,0.68);top.rotation.x=-0.18;g.add(top);
    // Left A-pillar
    const pillarL=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,0.5),mDash);
    pillarL.position.set(-1.1,0.22,0.35);pillarL.rotation.z=0.18;g.add(pillarL);
    // Right A-pillar  
    const pillarR=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,0.5),mDash);
    pillarR.position.set(1.1,0.22,0.35);pillarR.rotation.z=-0.18;g.add(pillarR);
    // Windshield frame (top bar)
    const winTop=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.06,0.12),mDash);
    winTop.position.set(0,0.65,0.15);g.add(winTop);

    // Instrument cluster / gauges
    const cluster=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.22,0.08),mGauge);
    cluster.position.set(0,-0.01,0.41);g.add(cluster);
    // Speedo circle
    const spd=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.04,16),mChrome);
    spd.position.set(-0.24,-0.01,0.44);spd.rotation.x=Math.PI/2;g.add(spd);
    const spdFace=new THREE.Mesh(new THREE.CircleGeometry(0.085,16),mGauge);
    spdFace.position.set(-0.24,-0.01,0.46);g.add(spdFace);
    // Rev counter circle
    const rev=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.04,16),mChrome);
    rev.position.set(0.24,-0.01,0.44);rev.rotation.x=Math.PI/2;g.add(rev);
    const revFace=new THREE.Mesh(new THREE.CircleGeometry(0.085,16),mGauge);
    revFace.position.set(0.24,-0.01,0.46);g.add(revFace);
    // Warning lights row
    [[-0.12,0],[0,0],[0.12,0]].forEach(([ox,oz])=>{
        const wl=new THREE.Mesh(new THREE.CircleGeometry(0.022,8),mRed);
        wl.position.set(ox,-0.01,0.44+oz);g.add(wl);
    });
    // Ventilation slits
    for(let v=-3;v<=3;v++){
        const vent=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.025,0.06),mDashTop);
        vent.position.set(0.55,0.06+v*0.04,0.41);g.add(vent);
        const vent2=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.025,0.06),mDashTop);
        vent2.position.set(-0.55,0.06+v*0.04,0.41);g.add(vent2);
    }

    // ── STEERING WHEEL ──
    const wheelGroup=new THREE.Group();
    wheelGroup.position.set(0,-0.12,0.32);
    // Rim ring
    const rimGeo=new THREE.TorusGeometry(0.21,0.026,10,32);
    wheelGroup.add(new THREE.Mesh(rimGeo,mRim));
    // 3 spokes
    for(let s=0;s<3;s++){
        const ang=(s/3)*Math.PI*2+Math.PI/6;
        const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.032,0.18,0.025),mRim);
        spoke.position.set(Math.cos(ang)*0.1,Math.sin(ang)*0.1,0);
        spoke.rotation.z=ang-Math.PI/2;wheelGroup.add(spoke);
    }
    // Hub
    wheelGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.06,10),mHub).rotateX(Math.PI/2));
    // Horn button
    const horn=new THREE.Mesh(new THREE.CircleGeometry(0.035,8),mChrome);
    horn.position.z=0.035;wheelGroup.add(horn);
    // Wheel tilt
    wheelGroup.rotation.x=0.45;
    g.add(wheelGroup);
    g._wheel=wheelGroup; // reference for animation

    // Column behind wheel
    const col2=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.032,0.35,8),mDash);
    col2.position.set(0,-0.33,0.45);col2.rotation.x=0.45;g.add(col2);

    // Gear lever
    const gearBase=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.025,0.22,8),mDash);
    gearBase.position.set(0.4,-0.2,0.52);gearBase.rotation.z=-0.15;g.add(gearBase);
    gearBase.add(new THREE.Mesh(new THREE.SphereGeometry(0.04,8,6),mChrome));
    gearBase.children[0].position.y=0.13;

    // Door panels hint (left/right)
    [-1.05,1.05].forEach((sx,si)=>{
        const door=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.55,0.75),mDash);
        door.position.set(sx,-0.1,0.45);g.add(door);
        // Window frame
        const win=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.35,0.55),new THREE.MeshPhongMaterial({color:0x4477aa,transparent:true,opacity:0.35}));
        win.position.set(sx+(si===0?-0.02:0.02),-0.02,0.35);g.add(win);
    });

    // Rearview mirror
    const mirrorBracket=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.06,0.12),mDash);
    mirrorBracket.position.set(0,0.72,0.38);g.add(mirrorBracket);
    const mirror=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.09,0.03),mChrome);
    mirror.position.set(0,0.76,0.32);g.add(mirror);
    const mirrorGlass=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.075,0.01),new THREE.MeshPhongMaterial({color:0x8899aa,shininess:200,specular:0xffffff}));
    mirrorGlass.position.set(0,0.76,0.31);g.add(mirrorGlass);

    // Don't add to scene yet — only shown in cockpit view
    cockpitGroup=g;
    cockpitGroup._wheelRef=wheelGroup;
    cockpitGroup.visible=false;
    scene.add(cockpitGroup);
}

/* ══════════════════════════════════════════ BOTS */
const BOT_COLORS=[0x33cc44,0xff8800,0xcc33ff,0x00ccff,0xffee00];
function getRoadSpawnPoints(){
    // Road intersections are at x=-300+100*i, z=-300+100*j
    const pts=[];
    for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){
        const x=-HALF+BLOCK*i, z=-HALF+BLOCK*j;
        pts.push({x,z});
    }
    // Shuffle
    for(let i=pts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pts[i],pts[j]]=[pts[j],pts[i]];}
    return pts;
}
function spawnBots(){
    bots=[];
    const roadPts=getRoadSpawnPoints();
    const numBots=Math.min(5,roadPts.length);
    for(let i=0;i<numBots;i++){
        const pt=roadPts[i+2]; // skip first 2 (player area)
        const carIdx=i%CAR_TYPES.length;
        const allTypes=CFG.mode==='fun'?FUN_CAR_TYPES:CAR_TYPES;
        const ci=Math.floor(Math.random()*allTypes.length);
        const b=makePlayer(BOT_COLORS[i%BOT_COLORS.length], pt.x+(Math.random()*6-3), pt.z+(Math.random()*6-3), ci, 'Bot '+(i+1));
        b.isBot=true;
        b.botWaypointIdx=0;
        b.botWaypoints=generateBotWaypoints(pt.x, pt.z);
        b.botAggression=0.4+Math.random()*0.6;
        createCarMesh(b);
        bots.push(b);
    }
}

function generateBotWaypoints(sx, sz){
    // Simple loop around the world
    const pts=[];
    const r=80+Math.random()*80;
    for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2;
        pts.push({x:Math.cos(a)*r+sx*0.2, z:Math.sin(a)*r+sz*0.2});
    }
    return pts;
}

function updateBots(dt){
    bots.forEach(b=>{
        if(!b.mesh) return;
        const wp=b.botWaypoints[b.botWaypointIdx];
        const dx=wp.x-b.pos.x, dz=wp.z-b.pos.z;
        const dist=Math.sqrt(dx*dx+dz*dz);
        if(dist<8) b.botWaypointIdx=(b.botWaypointIdx+1)%b.botWaypoints.length;

        const targetRot=Math.atan2(dx,dz);
        let rotDiff=targetRot-b.rot;
        while(rotDiff>Math.PI)rotDiff-=Math.PI*2;
        while(rotDiff<-Math.PI)rotDiff+=Math.PI*2;

        const fwd=dist>3;
        const left=rotDiff<-0.05, right=rotDiff>0.05;
        const nitroKey=b.botAggression>0.7&&Math.random()>0.8;
        updatePlayer(b,dt,fwd,false,left,right,nitroKey,false);
    });
}

/* ══════════════════════════════════════════ PEER JS */
const remotePlayers={};
const REMOTE_COLORS=[0x33cc44,0xff8800,0xcc33ff,0x00ccff,0xffee00,0xff3399];
let remoteColorIdx=0;
let peer=null,hostConn=null,clientConns=[],isHost=false,lobbyInfo=null,myPeerId=null;

function initPeer(cb){if(peer){try{peer.destroy();}catch(e){}peer=null;}peer=new Peer(undefined,{debug:0});peer.on('open',id=>{myPeerId=id;if(cb)cb(id);});peer.on('error',err=>{showToast('Erreur réseau: '+err.type);document.getElementById('host-btn').textContent='🏠 CRÉER LA PARTIE';document.getElementById('host-btn').disabled=false;});}
function getOrCreateRemote(peerId,info){
    if(!remotePlayers[peerId]){const color=REMOTE_COLORS[remoteColorIdx++%REMOTE_COLORS.length];const rp={pos:new THREE.Vector3(20,0,20),rot:0,speed:0,nitroOn:false,mesh:null,wheels:[],name:info.name||'?',carIdx:info.carIdx||0,color};const fake=makePlayer(color,20,20,info.carIdx||0,info.name||'?');createCarMesh(fake);rp.mesh=fake.mesh;rp.wheels=fake.wheels;remotePlayers[peerId]=rp;updateLobbyPlayerList();}return remotePlayers[peerId];
}
function removeRemote(peerId){if(remotePlayers[peerId]){if(remotePlayers[peerId].mesh)scene.remove(remotePlayers[peerId].mesh);delete remotePlayers[peerId];updateLobbyPlayerList();}}
function updateRemoteMesh(peerId,data){const rp=remotePlayers[peerId];if(!rp||!rp.mesh)return;const ry=data.y||getRampY(data.x,data.z,data.rot);rp.pos.set(data.x,ry,data.z);rp.rot=data.rot;rp.speed=data.speed;rp.mesh.position.set(data.x,ry,data.z);rp.mesh.rotation.y=data.rot;rp.wheelAngle=(rp.wheelAngle||0)+data.speed*0.016/0.36;rp.wheels.forEach(w=>w.rotation.y=rp.wheelAngle);}
function hostGame(){CFG.lobbyName=document.getElementById('lobby-name').value.trim()||'Course Royale';CFG.lobbyPass=document.getElementById('lobby-pass').value;CFG.multiName=document.getElementById('multi-name').value.trim()||'Hôte';document.getElementById('host-btn').textContent='⏳...';document.getElementById('host-btn').disabled=true;initPeer(id=>{isHost=true;myPeerId=id;lobbyInfo={name:CFG.lobbyName,pass:CFG.lobbyPass,world:CFG.multiWorld,maxPlayers:CFG.maxPlayers,hostName:CFG.multiName,hostCar:CFG.multiCar,hostId:id};peer.on('connection',conn=>{
            // Force JSON serialization for cross-browser compat
            if(conn.serialization!=='json')conn.serialization='json';conn.on('open',()=>{conn.send({type:'lobby_info',lobby:lobbyInfo,players:buildPlayerListForSync()});clientConns.push(conn);updateLobbyPlayerList();broadcastExcept(conn.peer,{type:'player_joined',peerId:conn.peer,info:conn.metadata});});conn.on('data',data=>handleHostData(conn,data));conn.on('close',()=>{clientConns=clientConns.filter(c=>c!==conn);removeRemote(conn.peer);broadcastAll({type:'player_left',peerId:conn.peer});updateLobbyPlayerList();});conn.on('error',()=>{});});showLobbyScreen();document.getElementById('host-btn').textContent='🏠 CRÉER LA PARTIE';document.getElementById('host-btn').disabled=false;});}
function handleHostData(conn,data){if(data.type==='join_request'){if(lobbyInfo.pass&&data.pass!==lobbyInfo.pass){conn.send({type:'join_rejected',reason:'Mot de passe incorrect'});conn.close();return;}if(clientConns.length+1>=lobbyInfo.maxPlayers){conn.send({type:'join_rejected',reason:'Lobby plein'});conn.close();return;}conn.metadata={name:data.name,carIdx:data.carIdx};getOrCreateRemote(conn.peer,conn.metadata);conn.send({type:'join_accepted'});// Tell new joiner about ALL existing players (including host)
const existing=Object.entries(remotePlayers).filter(([id])=>id!==conn.peer).map(([id,rp])=>({peerId:id,info:{name:rp.name,carIdx:rp.carIdx}}));conn.send({type:'all_players',players:existing,hostInfo:{name:CFG.multiName,carIdx:CFG.multiCar,peerId:myPeerId}});broadcastExcept(conn.peer,{type:'player_joined',peerId:conn.peer,info:conn.metadata});}if(data.type==='state'){updateRemoteMesh(conn.peer,data);broadcastExcept(conn.peer,{type:'remote_state',peerId:conn.peer,state:data});}if(data.type==='world_mod'){applyWorldMod(data);broadcastExcept(conn.peer,data);}}
function buildPlayerListForSync(){const list=[{peerId:myPeerId,name:CFG.multiName,carIdx:CFG.multiCar,isHost:true}];clientConns.forEach(c=>{if(c.metadata)list.push({peerId:c.peer,...c.metadata});});return list;}
function broadcastAll(msg){clientConns.forEach(c=>{try{c.send(msg);}catch(e){}});}
function broadcastExcept(xId,msg){clientConns.filter(c=>c.peer!==xId).forEach(c=>{try{c.send(msg);}catch(e){}});}
function startMultiGame(){if(clientConns.length===0&&!confirm('Démarrer seul ?'))return;const w=CFG.multiWorld;broadcastAll({type:'game_start',world:w,hostCar:CFG.multiCar,hostName:CFG.multiName});CFG.mode='multi';CFG.world=w;CFG.multiWorld=w;launchGame();}
function cancelLobby(){broadcastAll({type:'host_cancelled'});if(peer){peer.destroy();peer=null;}isHost=false;clientConns=[];document.getElementById('lobby-screen').classList.add('hidden');document.getElementById('setup-screen').classList.remove('hidden');}
function joinGame(){
    const code=document.getElementById('join-code').value.trim().replace(/\s/g,'');
    const pass=document.getElementById('join-pass').value;
    const name=document.getElementById('multi-name').value.trim()||'Pilote';
    CFG.multiName=name;
    if(!code){showToast('Entrez un code de session');return;}
    const btn=document.getElementById('join-btn');
    btn.textContent='⏳ Connexion...';btn.disabled=true;
    // Destroy any old peer cleanly first
    if(peer){try{peer.destroy();}catch(e){}peer=null;}
    let joinTimeout=null;
    let connected=false;
    peer=new Peer(undefined,{debug:0});
    peer.on('error',err=>{
        clearTimeout(joinTimeout);
        if(!connected){showToast('Erreur: '+err.type);btn.textContent='🔗 REJOINDRE';btn.disabled=false;}
    });
    peer.on('open',()=>{
        myPeerId=peer.id;
        hostConn=peer.connect(code,{reliable:true,serialization:'json'});
        // Start timeout only after peer is open
        joinTimeout=setTimeout(()=>{
            if(!connected){
                showToast('Hôte introuvable — vérifie le code');
                btn.textContent='🔗 REJOINDRE';btn.disabled=false;
                if(hostConn)hostConn.close();
            }
        },15000);
        hostConn.on('open',()=>{
            clearTimeout(joinTimeout);
            connected=true;
            hostConn.send({type:'join_request',name,carIdx:CFG.multiCar,pass});
        });
        hostConn.on('data',data=>handleClientData(data));
        hostConn.on('close',()=>{
            if(gameStarted)return; // normal during game
            showToast('Déconnecté du lobby');
            showSetupScreen();
        });
        hostConn.on('error',e=>{
            clearTimeout(joinTimeout);
            showToast('Connexion échouée');
            btn.textContent='🔗 REJOINDRE';btn.disabled=false;
        });
    });
}
function handleClientData(data){if(data.type==='join_rejected'){showToast('Refusé: '+data.reason);showSetupScreen();return;}if(data.type==='join_accepted'){document.getElementById('join-waiting').classList.remove('hidden');document.getElementById('setup-screen').classList.add('hidden');document.getElementById('join-btn').textContent='🔗 REJOINDRE';document.getElementById('join-btn').disabled=false;}if(data.type==='all_players'){data.players.forEach(p=>getOrCreateRemote(p.peerId,p.info));if(data.hostInfo)getOrCreateRemote(data.hostInfo.peerId,{name:data.hostInfo.name,carIdx:data.hostInfo.carIdx});}if(data.type==='lobby_info'){lobbyInfo=data.lobby;CFG.multiWorld=lobbyInfo.world;document.getElementById('join-lobby-title').textContent=lobbyInfo.name;document.getElementById('join-lobby-sub').textContent='Connecté !';document.getElementById('join-world-disp').textContent=worldName(lobbyInfo.world);updateJoinPlayerList(data.players);}if(data.type==='player_joined'){getOrCreateRemote(data.peerId,data.info);updateJoinPlayerList(null);}if(data.type==='player_left'){removeRemote(data.peerId);updateJoinPlayerList(null);}if(data.type==='remote_state'){updateRemoteMesh(data.peerId,data.state);}if(data.type==='host_cancelled'){showToast("L'hôte a annulé");showSetupScreen();}if(data.type==='game_start'){CFG.mode='multi';CFG.world=data.world;CFG.multiWorld=data.world;launchGame();}if(data.type==='world_mod'){applyWorldMod(data);}}
function cancelJoin(){if(hostConn){hostConn.close();hostConn=null;}if(peer){peer.destroy();peer=null;}document.getElementById('join-waiting').classList.add('hidden');showSetupScreen();}
function showLobbyScreen(){document.getElementById('setup-screen').classList.add('hidden');document.getElementById('lobby-screen').classList.remove('hidden');document.getElementById('lobby-display-name').textContent=CFG.lobbyName;document.getElementById('lobby-code-display').textContent=myPeerId;document.getElementById('lob-world-name').textContent=worldName(CFG.multiWorld);document.getElementById('lob-max').textContent=CFG.maxPlayers;document.getElementById('lob-max2').textContent=CFG.maxPlayers;document.getElementById('lob-pass-tag').style.display=CFG.lobbyPass?'inline':'none';updateLobbyPlayerList();}
function updateLobbyPlayerList(){const list=document.getElementById('lobby-players-list');if(!list)return;const players=[{name:CFG.multiName,carIdx:CFG.multiCar,color:'#c6a84a',isHost:true}];Object.values(remotePlayers).forEach(rp=>players.push({name:rp.name,carIdx:rp.carIdx,color:'#'+rp.color.toString(16).padStart(6,'0')}));document.getElementById('lob-count').textContent=players.length;list.innerHTML=players.map(p=>`<div class="player-row ${p.isHost?'host-row':''}"><div class="player-dot" style="background:${p.color}"></div><span class="player-row-name">${p.isHost?'👑 ':''}${p.name}</span><span class="player-row-car">${ALL_CAR_TYPES[p.carIdx]?.emoji||'🚗'} ${ALL_CAR_TYPES[p.carIdx]?.name||''}</span></div>`).join('');}
function updateJoinPlayerList(players){const list=document.getElementById('join-players-list');if(!list)return;if(players)list.innerHTML=players.map(p=>`<div class="player-row ${p.isHost?'host-row':''}"><div class="player-dot" style="background:${p.isHost?'#c6a84a':'#aaaaff'}"></div><span class="player-row-name">${p.isHost?'👑 ':''}${p.name}</span><span class="player-row-car">${CAR_TYPES[p.carIdx]?.emoji||'🚗'}</span></div>`).join('');}
function copyCode(){const code=document.getElementById('lobby-code-display').textContent;navigator.clipboard.writeText(code).then(()=>showToast('Code copié !')).catch(()=>{const ta=document.createElement('textarea');ta.value=code;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('Code copié !');});}
function worldName(w){return{city:'Cité Royale',desert:'Désert Ardent',snow:'Toundra Glacée',night:'Nuit Noire',mountain:'Haute Montagne',plains:'Grande Plaine',skyworld:'Monde des Nuages',highway:'Autoroute'}[w]||w;}

/* ══════════════════════════════════════════ NET STATE */
function applyWorldMod(data){
    if(data.key==='gravity')worldGravity=data.val;
    else if(data.key==='fog')scene.fog.density=data.val;
    else if(data.key==='sun')sun.intensity=data.val;
}

let netTick=0;
function sendNetState(){netTick++;if(netTick%3!==0)return;const state={type:'state',x:p1.pos.x,y:p1.pos.y,z:p1.pos.z,rot:p1.rot,speed:p1.speed,nitroOn:p1.nitroOn};if(isHost)broadcastAll({type:'remote_state',peerId:myPeerId,state});else if(hostConn){try{hostConn.send(state);}catch(e){}}}

/* ══════════════════════════════════════════ INPUT */
const keys={};
document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT') return; // don't eat console input
    keys[e.code]=true;
    if(e.code==='KeyF') toggleFullscreen();
    if(e.code==='KeyM') toggleMute();
    if(e.code==='Escape'){if(gameStarted) togglePause();}
    if(e.code==='KeyV'&&gameStarted) cycleView();
    if(e.code==='F2'&&gameStarted){e.preventDefault();toggleConsole();}
    const km=getKeys();
    const prevent=[km.fwd,km.back,km.left,km.right,'ShiftLeft','ShiftRight','Space',
                   'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ControlLeft','ControlRight','Period'];
    if(prevent.includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup',e=>{keys[e.code]=false;});

/* ══════════════════════════════════════════ PHYSICS */
function updatePlayer(pl, dt, fwd, back, left, right, nitroKey, handbrake, flyDown) {
    const ct=pl.ct;
    // Apply console overrides
    const maxSpd = (pl.cons?.maxSpd ?? ct.maxSpd) * (pl.nitroOn?1.9:1);
    const accel  = pl.cons?.accel  ?? ct.accel;
    const driftF = pl.cons?.drift  ?? ct.driftF;

    // Flying vehicles — nitro = fly up, handbrake = fly down
    if(ct.canFly){
        if(fwd){pl.speed+=accel*dt;}
        else if(back){pl.speed-=accel*0.6*dt;}
        else{const f=2*dt;if(Math.abs(pl.speed)<f)pl.speed=0;else pl.speed-=Math.sign(pl.speed)*f;}
        pl.speed=Math.max(-maxSpd*0.3,Math.min(maxSpd,pl.speed));
        // Vertical: nitroKey=up (Shift), flyDown=down (Ctrl)
        if(nitroKey)pl.velY+=ct.flyAccel*dt;
        else if(flyDown)pl.velY-=ct.flyAccel*dt;
        else{pl.velY*=Math.pow(0.85,dt*10);} // auto-hover damping
        pl.velY=Math.max(-ct.flyAccel*1.5,Math.min(ct.flyAccel*1.5,pl.velY));
        pl.nitro=Math.min(100,pl.nitro+ct.nRegen*dt); // no nitro drain for flying
    } else {
        if(fwd){pl.speed+=accel*dt;if(pl.nitroOn)pl.speed+=44*dt;}
        else if(back){if(pl.speed>1)pl.speed-=ct.brake*dt;else pl.speed-=accel*0.5*dt;}
        else{const f=ct.friction*dt;if(Math.abs(pl.speed)<f)pl.speed=0;else pl.speed-=Math.sign(pl.speed)*f;}
        pl.speed=Math.max(-(pl.cons?.maxSpd??ct.maxSpd)*0.45, Math.min(maxSpd, pl.speed));
    }

    const wantNitro=!ct.canFly&&nitroKey&&fwd;
    pl.nitroOn=wantNitro&&(pl.cons?.nitro??pl.nitro)>0;
    if(pl.nitroOn)pl.nitro=Math.max(0,pl.nitro-ct.nDrain*dt);
    else if(!ct.canFly)pl.nitro=Math.min(100,pl.nitro+ct.nRegen*dt);

    const sp=Math.min(Math.abs(pl.speed)/6,1)*ct.steer*dt;
    const sd=pl.speed>=0?1:-1;
    let steer=0;
    if(left)steer=sp*sd;
    if(right)steer=-sp*sd;

    // Handbrake drift (Space / .)
    pl.handbraking=!!handbrake&&!ct.canFly; // no drift for flying vehicles
    const driftActive=(driftF>0.1&&(left||right)&&Math.abs(pl.speed)>ct.maxSpd*0.3)||pl.handbraking;
    if(driftActive){
        const ds=pl.handbraking?driftF*2:driftF*Math.abs(pl.speed)/ct.maxSpd;
        pl.driftAngle+=(steer*(1+ds)-pl.driftAngle*2)*dt*5;
        if(pl.handbraking) pl.speed*=Math.pow(0.3,dt);
    } else pl.driftAngle*=(1-dt*6);

    pl.rot+=steer+pl.driftAngle*dt*0.3;

    const prevX=pl.pos.x,prevZ=pl.pos.z,prevY=pl.pos.y;

    // Horizontal movement
    pl.pos.x+=Math.sin(pl.rot+pl.driftAngle*0.5)*pl.speed*dt;
    pl.pos.z+=Math.cos(pl.rot+pl.driftAngle*0.5)*pl.speed*dt;
    // Flying: no borders. Ground: clamp to world
    if(!ct.canFly){
        pl.pos.x=Math.max(-HALF+5,Math.min(HALF-5,pl.pos.x));
        pl.pos.z=Math.max(-HALF+5,Math.min(HALF-5,pl.pos.z));
    }

    // AABB collisions — skip entirely for flying vehicles (they fly over buildings)
    if(!ct.canFly){
        const rad=ct.bW/2+0.2;
        for(const c of colliders){
            if(c.isRamp||c.skyY!==undefined) continue;
            const cx2=Math.max(c.minX,Math.min(c.maxX,pl.pos.x));
            const cz2=Math.max(c.minZ,Math.min(c.maxZ,pl.pos.z));
            const dx=pl.pos.x-cx2,dz=pl.pos.z-cz2;
            if(dx*dx+dz*dz<rad*rad){
                pl.crashVel=Math.abs(pl.speed);
                pl.crashTimer=0.4;
                pl.pos.x=prevX;pl.pos.z=prevZ;
                pl.speed*=-0.35+(Math.random()-0.5)*0.1;
                pl.rot+=(Math.random()-0.5)*0.4;
                break;
            }
        }
    }

    // Gravity & ramp Y
    if(!ct.canFly){
        pl.velY -= worldGravity * dt;
        const groundY = getRampY(pl.pos.x, pl.pos.z, pl.rot);
        pl.pos.y += pl.velY * dt;
        if(groundY > -999 && pl.pos.y <= groundY){
            pl.pos.y = groundY;
            if(pl.velY < -5){pl.crashTimer=0.2;pl.crashVel=Math.abs(pl.velY)*0.5;}
            pl.velY = 0;
        }
    } else {
        // Flying — apply velY, allow high altitude
        pl.pos.y += pl.velY * dt;
        // Min flying height above ground (use ground Y so we clear terrain)
        const terrainY = getRampY(pl.pos.x, pl.pos.z, pl.rot);
        const minFlyH = (terrainY > -900 ? terrainY : 0) + 1.5;
        if(pl.pos.y < minFlyH){pl.pos.y=minFlyH;pl.velY=Math.max(0,pl.velY);}
        if(pl.pos.y > 400){pl.pos.y=400;}
    }

    // Crash wobble timer
    if(pl.crashTimer > 0) pl.crashTimer -= dt;

    // Stuck detection
    const moving=Math.abs(pl.speed)>0.5;
    if(!moving&&fwd){ pl.stuckTimer+=dt; } else pl.stuckTimer=0;

    if(pl.mesh){
        pl.mesh.position.set(pl.pos.x,pl.pos.y,pl.pos.z);
        pl.mesh.rotation.y=pl.rot;
        // Drift tilt + crash wobble
        const wobble=pl.crashTimer>0?Math.sin(pl.crashTimer*40)*0.15*(pl.crashTimer/0.4):0;
        pl.mesh.rotation.z=pl.driftAngle*-0.12+wobble;
        pl.mesh.rotation.x=wobble*0.5;
    }
    pl.wheelAngle+=(pl.speed*dt)/0.36;
    pl.wheels.forEach(w=>w.rotation.y=pl.wheelAngle);
}

/* ── RAMP Y CALCULATION ── */
function getRampY(px, pz, prot){
    const _curWorld=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    const isSky=_curWorld==='skyworld';
    const isHighway=_curWorld==='highway';
    // Sky world: default very low so gravity doesn't snap to ground when off island
    let maxY=isSky?-999:0;
    // Sky world island surface height
    for(const c of colliders){
        if(c.skyY!==undefined){
            if(px>=c.minX&&px<=c.maxX&&pz>=c.minZ&&pz<=c.maxZ)
                if(c.skyY>maxY)maxY=c.skyY;
        }
    }
    for(const rm of rampMeshes){
        // Transform point to ramp local space
        const cosR=Math.cos(-rm.ry), sinR=Math.sin(-rm.ry);
        const dx=px-rm.x, dz=pz-rm.z;
        const lx=dx*cosR-dz*sinR;
        const lz=dx*sinR+dz*cosR;
        const hw=rm.rampW/2+0.5;
        if(Math.abs(lx)>hw) continue;
        // Within ramp Z range?
        const halfL=rm.rampLen/2+2;
        if(lz<-halfL-3||lz>halfL) continue;
        // Compute Y on slope
        const t=(-lz+halfL)/(rm.rampLen); // 0 at top, 1 at bottom
        if(t>=0&&t<=1){
            const y=Math.max(0, Math.sin(rm.rampAngle)*rm.rampLen*(1-t));
            if(y>maxY) maxY=y;
        }
        // Top platform
        if(lz<-rm.rampLen/2-1&&lz>-rm.rampLen/2-4){
            if(rm.rampH>maxY) maxY=rm.rampH;
        }
    }
    return maxY;
}

function updatePhysics(dt){
    if(!gameStarted||paused) return;
    const km=getKeys();
    const p1FlyUp  = keys['ShiftLeft']||keys['ShiftRight']||touchInput.nitro;
    const p1FlyDown= keys['ControlLeft']||keys['ControlRight'];
    const p1Drift  = keys['Space']||touchInput.drift;
    updatePlayer(p1,dt,
        keys[km.fwd]||touchInput.fwd,
        keys[km.back]||touchInput.back,
        keys[km.left]||touchInput.left,
        keys[km.right]||touchInput.right,
        p1FlyUp, p1Drift, p1FlyDown);
    if(CFG.mode==='split'){
        // P2: arrows + Num0=flyUp, Period=drift, Numpad1/End=flyDown  
        const p2FlyUp  = keys['Numpad0']||keys['Insert'];
        const p2FlyDown= keys['Numpad1']||keys['End'];
        const p2Drift  = keys['Period'];
        updatePlayer(p2,dt,
            keys['ArrowUp'],keys['ArrowDown'],keys['ArrowLeft'],keys['ArrowRight'],
            p2FlyUp, p2Drift, p2FlyDown);
    }
    if(CFG.mode==='multi') sendNetState();
    updateBots(dt);
    // Animate heli rotors
    if(p1&&p1._rotorGroup){const rs=8+Math.abs(p1.speed)*0.5+((p1.ct.canFly&&p1.velY>0)?4:0);p1._rotorGroup.rotation.y+=rs*dt;}
    if(p1&&p1._tailRotor){p1._tailRotor.rotation.x+=22*dt;}
    bots.forEach(b=>{if(b._rotorGroup)b._rotorGroup.rotation.y+=(8+Math.abs(b.speed)*0.5)*dt;if(b._tailRotor)b._tailRotor.rotation.x+=22*dt;});
    updateStuckArrow(dt);
}

/* ── STUCK ARROW ── */
function updateStuckArrow(dt){
    if(!p1) return;
    const el=document.getElementById('stuck-arrow');
    const cdEl=document.getElementById('stuck-countdown');
    if(p1.stuckTimer>2&&!consoleOpen){
        el.classList.add('show');
        const remaining=Math.max(0,5-Math.floor(p1.stuckTimer-2));
        cdEl.textContent=remaining;
        if(p1.stuckTimer>7){ respawnPlayer(); p1.stuckTimer=0; }
    } else el.classList.remove('show');
}

function respawnPlayer(){
    const _curWorld=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    const isSky=_curWorld==='skyworld';
    const isHighway=_curWorld==='highway';
    if(p1){
        const isHW=w==='highway';
    if(isSky||isHW){p1.pos.set(0,2,0);}
        else if((CFG.mode==='multi'?CFG.multiWorld:CFG.world)==='highway'){p1.pos.set(HW_W*0.5,0,20);}
        else{p1.pos.set(-100,0,-100);}
        p1.speed=0;p1.velY=0;p1.rot=0;p1.driftAngle=0;p1.stuckTimer=0;
        if(p1.mesh)p1.mesh.position.copy(p1.pos);
    }
    document.getElementById('pause-menu').classList.add('hidden');
    paused=false;
    showToast('🔄 Respawn !');
}

/* ══════════════════════════════════════════ CAMERA */
const _ct1=new THREE.Vector3(),_ct2=new THREE.Vector3();
function updateCamFor(pl,cam,ct,dt){
    const spd=Math.abs(pl.speed),vm=CFG.viewMode;
    const isFlying=pl.ct.canFly;
    let tx,ty,tz;
    if(vm==='third'){
        // Flying: pull back more and track altitude properly
        const d=isFlying?16+spd*0.12:10+spd*0.1;
        const h=isFlying?5+spd*0.05:4.5+spd*0.04;
        tx=pl.pos.x-Math.sin(pl.rot)*d;
        ty=pl.pos.y+h;
        tz=pl.pos.z-Math.cos(pl.rot)*d;
    }
    else if(vm==='first'){tx=pl.pos.x+Math.sin(pl.rot)*0.2;ty=pl.pos.y+pl.ct.bH+(pl.ct.cH||0)+0.3;tz=pl.pos.z+Math.cos(pl.rot)*0.2;}
    else if(vm==='top'){const topH=isFlying?35+pl.pos.y*0.5:20;tx=pl.pos.x;ty=pl.pos.y+topH;tz=pl.pos.z;}
    else{tx=pl.pos.x+Math.sin(pl.rot)*(pl.ct.bD/2-0.4);ty=pl.pos.y+pl.ct.bH+0.25;tz=pl.pos.z+Math.cos(pl.rot)*(pl.ct.bD/2-0.4);}
    cam.position.x+=(tx-cam.position.x)*7*dt;
    cam.position.y+=(ty-cam.position.y)*5*dt;
    cam.position.z+=(tz-cam.position.z)*7*dt;
    const la=vm==='top'?0:3;
    ct.set(pl.pos.x+Math.sin(pl.rot)*la,pl.pos.y+(vm==='top'?0:1.4),pl.pos.z+Math.cos(pl.rot)*la);
    cam.lookAt(ct);
    const tFOV=vm==='top'?80:68+spd*0.32+(pl.nitroOn?8:0);
    cam.fov+=(tFOV-cam.fov)*5*dt;cam.updateProjectionMatrix();
}
function updateCamera(dt){
    if(!p1)return;
    updateCamFor(p1,camera,_ct1,dt);
    if(CFG.mode==='split'&&p2)updateCamFor(p2,camera2,_ct2,dt);
    sun.position.set(p1.pos.x+100,200,p1.pos.z+60);
    sun.target.position.set(p1.pos.x,0,p1.pos.z);sun.target.updateMatrixWorld();
    // Cockpit visibility
    if(cockpitGroup){
        const isCockpit=(CFG.viewMode==='first');
        cockpitGroup.visible=isCockpit;
        if(isCockpit){
            // Position cockpit relative to car
            cockpitGroup.position.copy(p1.pos);
            cockpitGroup.position.y+=p1.ct.bH*0.5+0.28;
            cockpitGroup.rotation.y=p1.rot;
            // Animate steering wheel based on drift angle
            if(cockpitGroup._wheelRef){
                const targetSteer=p1.driftAngle*0.8+(p1.speed>0?1:-1)*(
                    (keys[getKeys().left]||touchInput.left)?0.6:
                    (keys[getKeys().right]||touchInput.right)?-0.6:0
                );
                cockpitGroup._wheelRef.rotation.z+=(targetSteer-cockpitGroup._wheelRef.rotation.z)*8*dt;
            }
        }
    }
}

/* ══════════════════════════════════════════ RENDER */
function renderFrame(){
    if(CFG.mode==='split'){
        const W=window.innerWidth,H=window.innerHeight;
        renderer.setScissorTest(true);
        renderer.setScissor(0,H/2,W,H/2);renderer.setViewport(0,H/2,W,H/2);
        camera.aspect=W/(H/2);camera.updateProjectionMatrix();renderer.render(scene,camera);
        renderer.setScissor(0,0,W,H/2);renderer.setViewport(0,0,W,H/2);
        camera2.aspect=W/(H/2);camera2.updateProjectionMatrix();renderer.render(scene,camera2);
        renderer.setScissorTest(false);
    } else {
        renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
        renderer.render(scene,camera);
    }
}

/* ══════════════════════════════════════════ SPEEDO */
function drawSpeedo(ctx,cvs,kmh){
    const w=cvs.width,h=cvs.height,cx=w/2,cy=h/2+8,R=w<130?50:70;
    const startA=Math.PI*0.72,endA=Math.PI*2.28,pct=Math.min(kmh/250,1);
    ctx.clearRect(0,0,w,h);
    const grd=ctx.createRadialGradient(cx,cy,R-8,cx,cy,R+10);grd.addColorStop(0,'rgba(198,168,74,.15)');grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(cx,cy,R+4,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,R,startA,endA);ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=7;ctx.stroke();
    const col=kmh>200?'#ff3333':kmh>130?'#ff9900':'#c6a84a';
    ctx.beginPath();ctx.arc(cx,cy,R,startA,startA+pct*(endA-startA));ctx.strokeStyle=col;ctx.lineWidth=7;ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';
    for(let i=0;i<=10;i++){const a=startA+(i/10)*(endA-startA),major=i%2===0,r1=R-(major?12:6),r2=R-2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);ctx.strokeStyle=major?'rgba(198,168,74,.9)':'rgba(198,168,74,.4)';ctx.lineWidth=major?2.5:1;ctx.stroke();}
    const nA=startA+pct*(endA-startA);ctx.beginPath();ctx.moveTo(cx-Math.cos(nA)*10,cy-Math.sin(nA)*10);ctx.lineTo(cx+Math.cos(nA)*(R-16),cy+Math.sin(nA)*(R-16));ctx.strokeStyle='#ff3333';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';
    ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle='#c6a84a';ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle='#e8c96a';ctx.fill();
}

/* ══════════════════════════════════════════ MINIMAP */
const mmCvs=document.getElementById('minimap-canvas'),mmCtx=mmCvs.getContext('2d'),MM=150;
// Minimap config per world
const MINIMAP_THEMES = {
    city:     {bg:'#2a4a1a',road:'#555555',block:'#1a1a1a',ramp:'#ffee00'},
    desert:   {bg:'#b89040',road:'#d4a828',block:'#7a5010',ramp:'#ff8800'},
    snow:     {bg:'#8ab8d0',road:'#ddeeff',block:'#557788',ramp:'#aaddff'},
    night:    {bg:'#030810',road:'#1a1a33',block:'#050a22',ramp:'#00ccff'},
    mountain: {bg:'#3a4a2a',road:'#7a7a6a',block:'#2a2a18',ramp:'#ffee00'},
    plains:   {bg:'#4a8a2a',road:'#8a7a4a',block:'#2a4a10',ramp:'#ffdd00'},
    skyworld: {bg:'#2255cc',road:'#4488ff',block:'#1133aa',ramp:'#ffffff'},
    highway:  {bg:'#1a1a1a',road:'#444444',block:'#333333',ramp:'#ff8800'},
};
function prerenderMinimap(){
    const w=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    // Sky world uses dynamic tracking minimap — no static base needed
    if(w==='skyworld'){minimapBase=null;return;}
    const th=MINIMAP_THEMES[w]||MINIMAP_THEMES.city;
    const off=document.createElement('canvas');off.width=MM;off.height=MM;
    const c=off.getContext('2d');
    c.fillStyle=th.bg;c.fillRect(0,0,MM,MM);
    // For highway world: draw the actual road path
    if(w==='highway'){minimapBase=null;return;} else {
        // Grid roads
        c.fillStyle=th.road;
        for(let i=0;i<=N_BLOCK;i++){
            const t=i/N_BLOCK,pw=t*MM,rw=Math.ceil((ROAD_W/WORLD)*MM);
            c.fillRect(pw-rw/2,0,rw,MM);
            c.fillRect(0,pw-rw/2,MM,rw);
        }
        // Buildings/obstacles
        c.fillStyle=th.block;
        colliders.forEach(col=>{
            const sw=col.maxX-col.minX,sd=col.maxZ-col.minZ;
            if(sw>80||sd>80||col.skyY!==undefined)return;
            c.fillRect(((col.minX+HALF)/WORLD)*MM,((col.minZ+HALF)/WORLD)*MM,(sw/WORLD)*MM,(sd/WORLD)*MM);
        });
    }
    // Ramp markers
    c.fillStyle=th.ramp;
    rampMeshes.forEach(rm=>{
        const px=((rm.x+HALF)/WORLD)*MM,pz=((rm.z+HALF)/WORLD)*MM;
        c.beginPath();c.arc(px,pz,3.5,0,Math.PI*2);c.fill();
    });
    minimapBase=off;
}
function drawMinimap(){
    if(!p1)return;
    const w=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    const isSky=w==='skyworld';
    mmCtx.clearRect(0,0,MM,MM);

    if(isSky){
        // ── SKY: tracking minimap centred on player ──
        const VIEW=isSky?240:300; // world units visible
        const scale=MM/VIEW;
        const ox=p1.pos.x-VIEW/2, oz=p1.pos.z-VIEW/2;
        const th=MINIMAP_THEMES.skyworld;
        // Background
        mmCtx.fillStyle=th.bg;mmCtx.fillRect(0,0,MM,MM);
        // Draw known islands
        mmCtx.fillStyle='rgba(100,200,80,0.7)';
        colliders.forEach(c=>{
            if(c.skyY===undefined)return;
            const sx=(c.minX-ox)*scale, sz=(c.minZ-oz)*scale;
            const sw=(c.maxX-c.minX)*scale, sd=(c.maxZ-c.minZ)*scale;
            mmCtx.fillRect(sx,sz,sw,sd);
        });
        // Player always centre
        drawMapArrow(mmCtx,MM/2,MM/2,p1.rot,'#ff3333','#ffaaaa');
        // Other players relative to p1
        if(CFG.mode==='split'&&p2){
            const rx=(p2.pos.x-p1.pos.x)*scale+MM/2;
            const rz=(p2.pos.z-p1.pos.z)*scale+MM/2;
            drawMapArrow(mmCtx,rx,rz,p2.rot,'#3366ff','#aaccff');
        }
        bots.forEach(b=>{if(!b.mesh)return;
            const rx=(b.pos.x-p1.pos.x)*scale+MM/2;
            const rz=(b.pos.z-p1.pos.z)*scale+MM/2;
            drawMapArrow(mmCtx,rx,rz,b.rot,'#'+b.color.toString(16).padStart(6,'0'),'#ffffff',true);
        });
        Object.values(remotePlayers).forEach(rp=>{
            const rx=(rp.pos.x-p1.pos.x)*scale+MM/2;
            const rz=(rp.pos.z-p1.pos.z)*scale+MM/2;
            drawMapArrow(mmCtx,rx,rz,rp.rot,'#'+rp.color.toString(16).padStart(6,'0'),'#ffffff');
        });
    } else {
        // ── STATIC minimap (all other worlds) ──
        if(minimapBase)mmCtx.drawImage(minimapBase,0,0);
        const toMM=v=>((v+HALF)/WORLD)*MM;
        drawMapArrow(mmCtx,toMM(p1.pos.x),toMM(p1.pos.z),p1.rot,'#ff3333','#ffaaaa');
        if(CFG.mode==='split'&&p2)drawMapArrow(mmCtx,toMM(p2.pos.x),toMM(p2.pos.z),p2.rot,'#3366ff','#aaccff');
        bots.forEach(b=>{if(!b.mesh)return;drawMapArrow(mmCtx,toMM(b.pos.x),toMM(b.pos.z),b.rot,'#'+b.color.toString(16).padStart(6,'0'),'#ffffff',true);});
        Object.values(remotePlayers).forEach(rp=>{drawMapArrow(mmCtx,toMM(rp.pos.x),toMM(rp.pos.z),rp.rot,'#'+rp.color.toString(16).padStart(6,'0'),'#ffffff');});
    }
    mmCtx.fillStyle='rgba(198,168,74,.6)';mmCtx.font='8px Cinzel,serif';mmCtx.textAlign='center';
    mmCtx.fillText(isSky?'✦':'N',MM/2,9);
}
function drawMapArrow(ctx,px,pz,rot,fill,stroke,isBot){
    ctx.save();ctx.translate(px,pz);
    if(isBot){
        // Bots = small circle with a direction dot
        ctx.beginPath();ctx.arc(0,0,4.5,0,Math.PI*2);
        ctx.fillStyle=fill;ctx.fill();
        ctx.strokeStyle=stroke;ctx.lineWidth=0.8;ctx.stroke();
        // direction pip
        ctx.rotate(rot+Math.PI);
        ctx.beginPath();ctx.arc(0,-3,1.5,0,Math.PI*2);
        ctx.fillStyle=stroke;ctx.fill();
    } else {
        // Players = solid arrow pointing in direction of travel
        // +PI because in Three.js rot=0 faces +Z which is DOWN on minimap
        ctx.rotate(rot+Math.PI);
        ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(4,5);ctx.lineTo(0,3);ctx.lineTo(-4,5);ctx.closePath();
        ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=0.8;ctx.stroke();
    }
    ctx.restore();
}

/* ══════════════════════════════════════════ HUD */
const speedoCvs=document.getElementById('speedo-canvas'),speedoCtx=speedoCvs.getContext('2d');
const p2SpeedoCvs=document.getElementById('p2-speedo-canvas'),p2SpeedoCtx=p2SpeedoCvs?p2SpeedoCvs.getContext('2d'):null;
function updateHUD(){
    if(!p1)return;
    const kmh1=Math.abs(p1.speed)*3.6;
    document.getElementById('speed-num').textContent=Math.round(kmh1);
    drawSpeedo(speedoCtx,speedoCvs,kmh1);
    const f1=document.getElementById('nitro-fill');f1.style.width=p1.nitro+'%';f1.classList.toggle('low',p1.nitro<20);
    document.getElementById('nitro-icon').classList.toggle('active',p1.nitroOn);
    document.getElementById('nitro-flash').classList.toggle('hidden',!p1.nitroOn);
    document.getElementById('nitro-vignette').classList.toggle('active',p1.nitroOn);
    document.getElementById('speed-lines').classList.toggle('active',Math.abs(p1.speed)>p1.ct.maxSpd*0.7);
    if(CFG.mode==='split'&&p2&&p2SpeedoCtx){
        document.getElementById('p2-speed-num').textContent=Math.round(Math.abs(p2.speed)*3.6);
        drawSpeedo(p2SpeedoCtx,p2SpeedoCvs,Math.abs(p2.speed)*3.6);
        const f2=document.getElementById('p2-nitro-fill');if(f2){f2.style.width=p2.nitro+'%';f2.classList.toggle('low',p2.nitro<20);}
        const i2=document.getElementById('p2-nitro-icon');if(i2)i2.classList.toggle('active',p2.nitroOn);
    }
    // Update key labels
    const km=getKeys();
    const fwdEl=document.getElementById('ctrl-fwd');
    if(fwdEl){const lbl={KeyZ:'Z',KeyW:'W'};fwdEl.textContent=lbl[km.fwd]||'Z';}
    drawMinimap();
}

/* ══════════════════════════════════════════ SOUND */
let audioCtx=null,engineOsc=null,engineGain=null,muted=false;
function initSound(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();engineOsc=audioCtx.createOscillator();engineOsc.type='sawtooth';engineOsc.frequency.value=70;const sh=audioCtx.createWaveShaper();const cv=new Float32Array(256);for(let i=0;i<256;i++){const x=(i*2)/256-1;cv[i]=(Math.PI+300)*x/(Math.PI+300*Math.abs(x));}sh.curve=cv;const lpf=audioCtx.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=900;lpf.Q.value=0.8;engineGain=audioCtx.createGain();engineGain.gain.value=0;engineOsc.connect(sh);sh.connect(lpf);lpf.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start();engineGain.gain.setTargetAtTime(0.06,audioCtx.currentTime,0.5);}catch(e){}}
function updateSound(){if(!audioCtx||muted||!p1)return;const t=Math.min(Math.abs(p1.speed)/(p1.ct.maxSpd*1.9),1);engineOsc.frequency.setTargetAtTime(55+t*200+(p1.nitroOn?40:0),audioCtx.currentTime,0.06);engineGain.gain.setTargetAtTime(0.04+t*0.10,audioCtx.currentTime,0.1);}
function toggleMute(){muted=!muted;if(engineGain)engineGain.gain.setTargetAtTime(muted?0:0.06,audioCtx?.currentTime||0,0.1);const l=muted?'🔇':'🔊';document.getElementById('sound-btn').textContent=l;const pb=document.getElementById('mute-btn-pause');if(pb)pb.textContent=l+(muted?' Son coupé':' Son activé');}

/* ══════════════════════════════════════════ CAR CHANGE (pause) */
let pendingCarChange=-1;
function openCarChange(){
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('car-change-menu').classList.remove('hidden');
    const grid=document.getElementById('car-change-grid');
    grid.innerHTML='';
    ALL_CAR_TYPES.forEach((ct,i)=>{
        const btn=document.createElement('button');
        btn.className='car-btn'+(i===CFG.p1Car?' sel-change':'');
        btn.innerHTML=`<span class="car-emoji">${ct.emoji}</span><span class="car-name">${ct.name}</span><span class="car-stat">${ct.stat}</span>`;
        btn.onclick=()=>{pendingCarChange=i;grid.querySelectorAll('.car-btn').forEach(b=>b.classList.remove('sel-change'));btn.classList.add('sel-change');};
        grid.appendChild(btn);
    });
}
function confirmCarChange(){
    if(pendingCarChange>=0&&p1){
        CFG.p1Car=pendingCarChange;
        scene.remove(p1.mesh);
        const oldPos=p1.pos.clone(),oldRot=p1.rot;
        p1=makePlayer(0xff3333,oldPos.x,oldPos.z,CFG.p1Car,CFG.p1Name);
        p1.pos.y=oldPos.y; p1.rot=oldRot;
        createCarMesh(p1);
        if(p1.ct.id!=='kart')buildCockpit(p1);
        showToast('Voiture changée : '+(ALL_CAR_TYPES[CFG.p1Car]?.name||''));
    }
    closeCarChange();
}
function closeCarChange(){document.getElementById('car-change-menu').classList.add('hidden');paused=false;}

/* ══════════════════════════════════════════ DEV CONSOLE */
let consoleOpen=false;
const CONSOLE_COMMANDS=[
    {cmd:'max_speed=',   desc:'Vitesse max (ex: max_speed=60)',        scope:'player'},
    {cmd:'accel=',       desc:'Accélération (ex: accel=50)',           scope:'player'},
    {cmd:'drift=',       desc:'Facteur drift (ex: drift=0.8)',         scope:'player'},
    {cmd:'nitro=',       desc:'Nitro 0-100 (ex: nitro=100)',           scope:'player'},
    {cmd:'gravity=',     desc:'Gravité mondiale (ex: gravity=5)',       scope:'world'},
    {cmd:'fog=',         desc:'Densité brouillard (ex: fog=0.01)',      scope:'world'},
    {cmd:'sun=',         desc:'Intensité soleil (ex: sun=3)',           scope:'world'},
    {cmd:'respawn',      desc:'Respawn J1',                             scope:'action'},
    {cmd:'reset',        desc:'Reset toutes les valeurs J1',            scope:'player'},
    {cmd:'help',         desc:'Afficher toutes les commandes',          scope:'info'},
    {cmd:'p2.max_speed=',desc:'Vitesse max J2',                        scope:'player2'},
    {cmd:'p2.accel=',    desc:'Accélération J2',                       scope:'player2'},
    {cmd:'p2.drift=',    desc:'Drift J2',                              scope:'player2'},
    {cmd:'p2.nitro=',    desc:'Nitro J2',                              scope:'player2'},
    {cmd:'p2.reset',     desc:'Reset J2',                              scope:'player2'},
    {cmd:'bots.speed=',  desc:'Vitesse des bots (ex: bots.speed=2)',   scope:'world'},
    {cmd:'time=',        desc:'Cycle jour/nuit (day/night)',           scope:'world'},
    {cmd:'teleport=',    desc:'Téléporter (ex: teleport=100,50)',      scope:'action'},
    {cmd:'world=',       desc:'Changer monde (city/desert/snow/night/mountain/plains)',scope:'world'},
    {cmd:'bots.count=',  desc:'Nombre de bots (ex: bots.count=6)',     scope:'world'},
    {cmd:'invincible=',  desc:'Invincible 0 ou 1',                     scope:'player'},
    {cmd:'lowgrav',      desc:'Gravité lunaire 10s',                   scope:'world'},
    {cmd:'boost',        desc:'Boost instantané J1',                   scope:'action'},
    {cmd:'nitro.regen=', desc:'Vitesse de regen nitro',                scope:'world'},
    {cmd:'scale=',       desc:'Taille voiture J1 (ex: scale=2)',       scope:'player'},
];

function toggleConsole(){
    consoleOpen=!consoleOpen;
    const el=document.getElementById('dev-console');
    if(consoleOpen){el.classList.remove('hidden');document.getElementById('console-input').focus();}
    else{el.classList.add('hidden');document.getElementById('console-autocomplete').innerHTML='';}
}
function closeConsole(){consoleOpen=false;document.getElementById('dev-console').classList.add('hidden');}
function fillConsole(txt){document.getElementById('console-input').value=txt;document.getElementById('console-input').focus();updateAutocomplete(txt);}

function consoleLog(msg,type=''){
    const log=document.getElementById('console-log');
    const line=document.createElement('div');
    line.className='log-line'+(type?' '+type:'');
    line.textContent=msg;
    log.appendChild(line);
    log.scrollTop=log.scrollHeight;
}

function updateAutocomplete(val){
    const ac=document.getElementById('console-autocomplete');
    if(!val){ac.innerHTML='';return;}
    const matches=CONSOLE_COMMANDS.filter(c=>c.cmd.startsWith(val)&&c.cmd!==val);
    if(matches.length===0){ac.innerHTML='';return;}
    ac.innerHTML=matches.map((c,i)=>`<div class="ac-item" onclick="fillConsole('${c.cmd}')" data-idx="${i}"><span>${c.cmd}</span><span class="ac-desc">${c.desc}</span></div>`).join('');
}

function executeConsoleCmd(raw){
    const cmd=raw.trim();
    if(!cmd)return;
    consoleLog('$ '+cmd);
    // Parse
    try{
        if(cmd==='help'){
            CONSOLE_COMMANDS.forEach(c=>consoleLog(`  ${c.cmd.padEnd(20,' ')} — ${c.desc}`,'info'));
            return;
        }
        if(cmd==='respawn'){respawnPlayer();consoleLog('✓ Respawn !','ok');return;}
        if(cmd==='reset'){if(p1){p1.cons={maxSpd:null,accel:null,drift:null,nitro:null};}consoleLog('✓ J1 reset','ok');return;}
        if(cmd==='p2.reset'){if(p2){p2.cons={maxSpd:null,accel:null,drift:null,nitro:null};}consoleLog('✓ J2 reset','ok');return;}

        const kv=cmd.match(/^(.+)=(.+)$/);
        if(!kv){consoleLog('✗ Commande inconnue. Tapez help.','err');return;}
        const[,key,rawVal]=kv;
        const val=parseFloat(rawVal);

        // World commands
        if(key==='gravity'){worldGravity=val;consoleLog(`✓ gravity = ${val}`,'ok');if(CFG.mode==='multi'){const m={type:'world_mod',key:'gravity',val};isHost?broadcastAll(m):hostConn&&hostConn.send(m);}return;}
        if(key==='fog'){scene.fog.density=val;consoleLog(`✓ fog = ${val}`,'ok');if(CFG.mode==='multi'){const m={type:'world_mod',key:'fog',val};isHost?broadcastAll(m):hostConn&&hostConn.send(m);}return;}
        if(key==='sun'){sun.intensity=val;consoleLog(`✓ sun = ${val}`,'ok');if(CFG.mode==='multi'){const m={type:'world_mod',key:'sun',val};isHost?broadcastAll(m):hostConn&&hostConn.send(m);}return;}
        if(key==='time'){if(rawVal==='night'){scene.background.set(0x060814);}else{scene.background.set(0x7ac0e8);}consoleLog(`✓ time = ${rawVal}`,'ok');return;}
        if(key==='bots.speed'){bots.forEach(b=>b.ct.maxSpd=val);consoleLog(`✓ bots.speed = ${val}`,'ok');return;}

        // Player 1
        if(key==='max_speed'){if(p1)p1.cons.maxSpd=val;consoleLog(`✓ J1 max_speed = ${val}`,'ok');return;}
        if(key==='accel'){if(p1)p1.cons.accel=val;consoleLog(`✓ J1 accel = ${val}`,'ok');return;}
        if(key==='drift'){if(p1)p1.cons.drift=val;consoleLog(`✓ J1 drift = ${val}`,'ok');return;}
        if(key==='nitro'){if(p1)p1.nitro=Math.max(0,Math.min(100,val));consoleLog(`✓ J1 nitro = ${val}`,'ok');return;}

        // Player 2
        if(key==='p2.max_speed'){if(p2)p2.cons.maxSpd=val;consoleLog(`✓ J2 max_speed = ${val}`,'ok');return;}
        if(key==='p2.accel'){if(p2)p2.cons.accel=val;consoleLog(`✓ J2 accel = ${val}`,'ok');return;}
        if(key==='p2.drift'){if(p2)p2.cons.drift=val;consoleLog(`✓ J2 drift = ${val}`,'ok');return;}
        if(key==='p2.nitro'){if(p2)p2.nitro=Math.max(0,Math.min(100,val));consoleLog(`✓ J2 nitro = ${val}`,'ok');return;}

        if(key==='teleport'){const parts=rawVal.split(',');if(parts.length===2&&p1){p1.pos.x=parseFloat(parts[0]);p1.pos.z=parseFloat(parts[1]);p1.pos.y=0;p1.speed=0;if(p1.mesh)p1.mesh.position.copy(p1.pos);consoleLog('✓ Téléporté à '+rawVal,'ok');}return;}
        if(key==='world'){const valid=['city','desert','snow','night','mountain','plains'];if(valid.includes(rawVal)){CFG.world=rawVal;CFG.multiWorld=rawVal;launchGame();}else consoleLog('✗ Monde invalide: '+rawVal,'err');return;}
        if(key==='bots.count'){bots.forEach(b=>{if(b.mesh)scene.remove(b.mesh);});bots=[];const nb=Math.max(0,Math.min(10,Math.round(val)));for(let i=0;i<nb;i++){const ci2=Math.floor(Math.random()*CAR_TYPES.length);const b=makePlayer(BOT_COLORS[i%BOT_COLORS.length],(Math.random()-0.5)*160,(Math.random()-0.5)*160,ci2,'Bot'+(i+1));b.isBot=true;b.botWaypointIdx=0;b.botWaypoints=generateBotWaypoints(0,0);b.botAggression=0.5+Math.random()*0.5;createCarMesh(b);bots.push(b);}consoleLog('✓ '+nb+' bots','ok');return;}
        if(key==='invincible'){if(p1)p1._invincible=(val>0);consoleLog('✓ invincible='+(val>0),'ok');return;}
        if(cmd==='lowgrav'){worldGravity=2.5;setTimeout(()=>{worldGravity=18;showToast('Gravité normale');},10000);consoleLog('✓ Gravité lunaire 10s !','ok');return;}
        if(cmd==='boost'){if(p1){p1.nitro=100;p1.speed=p1.ct.maxSpd*1.6;consoleLog('✓ BOOST !','ok');}return;}
        if(key==='nitro.regen'){if(p1)p1.ct.nRegen=val;consoleLog('✓ nitro.regen='+val,'ok');return;}
        if(key==='scale'){if(p1&&p1.mesh)p1.mesh.scale.setScalar(Math.max(0.3,Math.min(4,val)));consoleLog('✓ scale='+val,'ok');return;}
        consoleLog('✗ Clé inconnue. Tapez help.','err');
    } catch(e){ consoleLog('✗ Erreur: '+e.message,'err'); }
}

// Console input listeners
document.getElementById('console-input').addEventListener('input',e=>updateAutocomplete(e.target.value));
document.getElementById('console-input').addEventListener('keydown',e=>{
    if(e.key==='Enter'){const v=e.target.value;executeConsoleCmd(v);e.target.value='';document.getElementById('console-autocomplete').innerHTML='';}
    if(e.key==='Escape'){closeConsole();}
    if(e.key==='Tab'){e.preventDefault();const first=document.querySelector('.ac-item');if(first)fillConsole(first.children[0].textContent);}
});

/* ══════════════════════════════════════════ SETUP UI */
function showTab(tab){document.getElementById('tab-local').classList.toggle('hidden',tab!=='local');document.getElementById('tab-multi').classList.toggle('hidden',tab!=='multi');document.getElementById('tab-local-btn').classList.toggle('active',tab==='local');document.getElementById('tab-multi-btn').classList.toggle('active',tab==='multi');}
function setMode(m){const realMode=m==='fun'?'solo':m;CFG.mode=realMode;['solo','split','fun'].forEach(id=>{const el=document.getElementById('mode-'+id);if(el)el.classList.toggle('active',id===m);});document.getElementById('p2-section').style.display=m==='split'?'block':'none';buildCarGrid('car-grid-p2',2);}
function setWorld(w){CFG.world=w;document.querySelectorAll('[data-world]').forEach(b=>b.classList.toggle('active',b.dataset.world===w));}
function setWorldMulti(w){CFG.multiWorld=w;document.querySelectorAll('[data-wm]').forEach(b=>b.classList.toggle('active',b.dataset.wm===w));}
function setView(v){CFG.viewMode=v;currentViewIdx=VIEW_MODES.indexOf(v);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));}
function cycleView(){currentViewIdx=(currentViewIdx+1)%VIEW_MODES.length;CFG.viewMode=VIEW_MODES[currentViewIdx];showViewLabel(CFG.viewMode);}
function showViewLabel(v){const n={third:'3e Personne',first:'Cockpit',top:'Vue du Ciel',hood:'Capot'}[v]||v;const el=document.getElementById('view-label');if(!el)return;el.textContent='🎥 '+n;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2000);}
function changeMaxPlayers(d){CFG.maxPlayers=Math.max(2,Math.min(8,CFG.maxPlayers+d));document.getElementById('max-players-val').textContent=CFG.maxPlayers;}
function setKeyLayout(kl){CFG.keyLayout=kl;document.querySelectorAll('[data-kl]').forEach(b=>b.classList.toggle('active',b.dataset.kl===kl));}
function setQuality(q){CFG.quality=q;document.querySelectorAll('[data-q]').forEach(b=>b.classList.toggle('active',b.dataset.q===q));}

function buildCarGrid(gridId,player){
    const grid=document.getElementById(gridId);if(!grid)return;grid.innerHTML='';
    // P2 in split: exclude flying vehicles (can't control two flying at once on keyboard)
    const isP2Split=(player===2&&CFG.mode==='split');
    let separatorAdded=false;
    let displayIdx=0; // visual index (skips hidden cars)
    ALL_CAR_TYPES.forEach((ct,i)=>{
        // Skip flying for P2 in split mode
        if(isP2Split&&ct.canFly)return;
        // Add section label before fun cars
        if(i===CAR_TYPES.length && !separatorAdded){
            const sep=document.createElement('div');
            sep.className='car-grid-sep';sep.textContent='— MODE FUN —';
            grid.appendChild(sep);separatorAdded=true;
        }
        const btn=document.createElement('button');btn.className='car-btn';
        const sc=player===1?'sel-p1':player===2?'sel-p2':'sel-multi';
        const ci=player===1?CFG.p1Car:player===2?CFG.p2Car:CFG.multiCar;
        if(i===ci)btn.classList.add(sc);
        btn.innerHTML=`<span class="car-emoji">${ct.emoji}</span><span class="car-name">${ct.name}</span><span class="car-stat">${ct.stat}</span>`;
        btn.onclick=()=>{grid.querySelectorAll('.car-btn').forEach(b=>b.classList.remove(sc));btn.classList.add(sc);if(player===1)CFG.p1Car=i;else if(player===2)CFG.p2Car=i;else CFG.multiCar=i;};
        grid.appendChild(btn);
        displayIdx++;
    });
}

/* ══════════════════════════════════════════ PAUSE */
function togglePause(){paused=!paused;document.getElementById('pause-menu').classList.toggle('hidden',!paused);if(!paused&&audioCtx?.state==='suspended')audioCtx.resume();}
function resumeGame(){paused=false;document.getElementById('pause-menu').classList.add('hidden');audioCtx?.resume?.();}
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}

/* ══════════════════════════════════════════ NAVIGATION */
function showSetupScreen(){
    gameStarted=false;paused=false;consoleOpen=false;
    ['pause-menu','hud','lobby-screen','join-waiting','dev-console'].forEach(id=>document.getElementById(id).classList.add('hidden'));
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('split-line').style.display='none';
    document.getElementById('p2-hud-bar').classList.add('hidden');
    document.getElementById('stuck-arrow').classList.remove('show');
    const jb=document.getElementById('join-btn');if(jb){jb.textContent='🔗 REJOINDRE';jb.disabled=false;}
    Object.keys(remotePlayers).forEach(id=>removeRemote(id));
}
function backToSetup(){
    if(CFG.mode==='multi'){if(isHost)broadcastAll({type:'host_cancelled'});else if(hostConn){hostConn.close();}if(peer){peer.destroy();peer=null;}isHost=false;clientConns=[];}
    clearScene();showSetupScreen();
}

/* ══════════════════════════════════════════ LAUNCH */
function startLocalGame(){CFG.p1Name=document.getElementById('p1-name')?.value.trim()||'Joueur 1';CFG.p2Name=document.getElementById('p2-name')?.value.trim()||'Joueur 2';launchGame();}
function launchGame(){
    ['setup-screen','lobby-screen','join-waiting'].forEach(id=>document.getElementById(id).classList.add('hidden'));
    const ld=document.getElementById('loading');ld.style.display='flex';ld.style.opacity='1';
    clearScene();p1=null;p2=null;gameStarted=false;doLoad();
}
function setLoad(pct,msg){document.getElementById('load-bar').style.width=pct+'%';document.getElementById('load-status').textContent=msg;}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function doLoad(){
    setLoad(5,'Initialisation...');await sleep(40);
    setLoad(20,'Construction du monde...');await sleep(40);
    generateWorld();
    setLoad(55,'Véhicules...');await sleep(40);
    const p1ci=CFG.mode==='multi'?CFG.multiCar:CFG.p1Car;
    const p1nm=CFG.mode==='multi'?CFG.multiName:CFG.p1Name;
    // Spawn on road intersection at (-100,-100) — clear of center feature (0,0)
    const _curWorld=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    const isSky=_curWorld==='skyworld';
    const isHighway=_curWorld==='highway';
    const spawnRoadX=-100, spawnRoadZ=-100;
    p1=makePlayer(0xff3333,isHighway?HW_W*0.5:isSky?0:spawnRoadX+3,isHighway?20:isSky?0:spawnRoadZ,p1ci,p1nm);if(isSky){p1.pos.y=2;p1.velY=0;}createCarMesh(p1);
    camera.position.set(p1.pos.x,7,p1.pos.z-12);
    if(p1.ct.id!=='kart')buildCockpit(p1);
    if(CFG.mode==='split'){p2=makePlayer(0x3366ff,isHighway?-HW_W*0.5:spawnRoadX-3,isHighway?20:spawnRoadZ,CFG.p2Car,CFG.p2Name);createCarMesh(p2);camera2.position.set(p2.pos.x,7,p2.pos.z-12);}
    if(CFG.mode==='multi'){Object.entries(remotePlayers).forEach(([id,rp])=>{if(rp.mesh)scene.remove(rp.mesh);rp.mesh=null;rp.wheels=[];const fake=makePlayer(rp.color,20,20,rp.carIdx,rp.name);createCarMesh(fake);rp.mesh=fake.mesh;rp.wheels=fake.wheels;});}
    setLoad(68,'Bots IA...');await sleep(30);
    spawnBots();
    setLoad(78,'Minimap...');await sleep(30);
    prerenderMinimap();
    setLoad(90,'Son...');await sleep(60);
    initSound();
    setLoad(100,"C'est parti !");await sleep(350);
    const ld=document.getElementById('loading');ld.style.opacity='0';await sleep(550);ld.style.display='none';
    document.getElementById('hud').classList.remove('hidden');
    if(CFG.mode==='split'){document.getElementById('split-line').style.display='block';document.getElementById('split-line').style.top='50%';document.getElementById('p2-hud-bar').classList.remove('hidden');}
    gameStarted=true;
    consoleLog('🏎 Route Royale v4 démarré. F2=console. Tapez help.','info');
}

/* ══════════════════════════════════════════ TOAST */
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2800);}

/* ══════════════════════════════════════════ RESIZE */
window.addEventListener('resize',()=>{
    const W=window.innerWidth,H=window.innerHeight;
    renderer.setSize(W,H);
    if(CFG.mode==='split'){
        camera.aspect=W/(H/2);camera.updateProjectionMatrix();
        camera2.aspect=W/(H/2);camera2.updateProjectionMatrix();
    } else {
        camera.aspect=W/H;camera.updateProjectionMatrix();
        camera2.aspect=W/H;camera2.updateProjectionMatrix();
    }
});

/* ══════════════════════════════════════════ MAIN LOOP */
let lastTime=0;
function animate(time){
    requestAnimationFrame(animate);
    const dt=Math.min((time-lastTime)/1000,0.05);lastTime=time;
    if(gameStarted&&!paused){updatePhysics(dt);updateCamera(dt);updateHUD();updateSound();updateSkyWorld();updateHighway();}
    else if(!gameStarted&&p1)updateCamera(dt);
    renderFrame();
}

/* ══════════════════════════════════════════ BOOT */

/* ══════════════════════════════════════════ MOBILE TOUCH CONTROLS */
const touchInput={fwd:false,back:false,left:false,right:false,nitro:false,drift:false};
let joyId=null,joyBaseX=0,joyBaseY=0;

function initMobileControls(){
    const container=document.createElement('div');
    container.id='touch-overlay';
    container.innerHTML=`
<div id="joy-zone">
  <div id="joy-base"><div id="joy-knob"></div></div>
  <div id="joy-arrows">
    <div id="joy-arrow-up">▲</div>
    <div id="joy-arrow-left">◀</div>
    <div id="joy-arrow-right">▶</div>
    <div id="joy-arrow-down">▼</div>
  </div>
</div>
<div id="touch-btns">
  <button id="tbtn-nitro" class="tbtn tbtn-nitro"><span class="tbtn-icon">⚡</span><span class="tbtn-label">NITRO</span></button>
  <button id="tbtn-drift" class="tbtn tbtn-drift"><span class="tbtn-icon">🌀</span><span class="tbtn-label">DRIFT</span></button>
</div>`;
    document.body.appendChild(container);

    const zone=document.getElementById('joy-zone');
    const knob=document.getElementById('joy-knob');
    const DEAD=12,MAX=52;

    function updateArrows(dx,dy){
        document.getElementById('joy-arrow-up').classList.toggle('active',dy<-DEAD);
        document.getElementById('joy-arrow-down').classList.toggle('active',dy>DEAD);
        document.getElementById('joy-arrow-left').classList.toggle('active',dx<-DEAD);
        document.getElementById('joy-arrow-right').classList.toggle('active',dx>DEAD);
    }

    zone.addEventListener('touchstart',e=>{
        e.preventDefault();
        const t=e.changedTouches[0];
        joyId=t.identifier;joyBaseX=t.clientX;joyBaseY=t.clientY;
        document.getElementById('joy-base').style.opacity='1';
    },{passive:false});

    zone.addEventListener('touchmove',e=>{
        e.preventDefault();
        for(const t of e.changedTouches){
            if(t.identifier!==joyId)continue;
            const dx=t.clientX-joyBaseX,dy=t.clientY-joyBaseY;
            const dist=Math.min(Math.sqrt(dx*dx+dy*dy),MAX);
            const ang=Math.atan2(dy,dx);
            knob.style.transform=`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px)`;
            touchInput.fwd=dy<-DEAD;touchInput.back=dy>DEAD;
            touchInput.left=dx<-DEAD;touchInput.right=dx>DEAD;
            updateArrows(dx,dy);
        }
    },{passive:false});

    function resetJoy(e){
        e.preventDefault();
        joyId=null;
        knob.style.transform='translate(0,0)';
        document.getElementById('joy-base').style.opacity='0.5';
        touchInput.fwd=touchInput.back=touchInput.left=touchInput.right=false;
        updateArrows(0,0);
    }
    zone.addEventListener('touchend',resetJoy,{passive:false});
    zone.addEventListener('touchcancel',resetJoy,{passive:false});

    function bindBtn(id,key){
        const el=document.getElementById(id);
        el.addEventListener('touchstart',e=>{e.preventDefault();touchInput[key]=true;el.classList.add('pressed');},{passive:false});
        el.addEventListener('touchend',e=>{e.preventDefault();touchInput[key]=false;el.classList.remove('pressed');},{passive:false});
        el.addEventListener('touchcancel',e=>{e.preventDefault();touchInput[key]=false;el.classList.remove('pressed');},{passive:false});
    }
    bindBtn('tbtn-nitro','nitro');
    bindBtn('tbtn-drift','drift');
}

function boot(){
    buildCarGrid('car-grid-p1',1);buildCarGrid('car-grid-p2',2);buildCarGrid('car-grid-multi',0);
    document.getElementById('car-grid-p1').style.gridTemplateColumns='repeat(3,1fr)';
    document.getElementById('car-grid-p2').style.gridTemplateColumns='repeat(3,1fr)';
    document.getElementById('car-grid-multi').style.gridTemplateColumns='repeat(3,1fr)';
    document.getElementById('loading').style.display='none';
    document.getElementById('setup-screen').classList.remove('hidden');
    renderer.render(scene,camera);
    initMobileControls();
}
requestAnimationFrame(animate);
boot();