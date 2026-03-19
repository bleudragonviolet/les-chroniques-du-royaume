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

/* ══════════════════════════════════════════ CONFIG */
let CFG = {
    mode:'solo', world:'city', p1Car:0, p2Car:1, multiCar:0,
    viewMode:'third', p1Name:'Joueur 1', p2Name:'Joueur 2',
    keyLayout:'azerty', quality:'normal',
    maxPlayers:4, lobbyName:'Course Royale', lobbyPass:'',
    multiWorld:'city', multiName:'Pilote',
};

/* ── KEYBOARD LAYOUTS ── */
const KEYMAPS = {
    azerty: { fwd:'KeyZ', back:'KeyS', left:'KeyQ', right:'KeyD' },
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
};

/* ══════════════════════════════════════════ PLAYER STATE */
function makePlayer(color, sx, sz, carIdx, name) {
    const ct = {...CAR_TYPES[carIdx]};
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
    addMesh(new THREE.PlaneGeometry(WORLD+80,WORLD+80), MAT.asphalt, 0,0,0, -Math.PI/2,0,0, false);
    addRoadMarkings();

    const BLDG = th.night?[0x112244,0x0a1a33,0x1a2255,0x152266]
               : th.fogD<0.002?[0xc8a855,0xd4b060,0xb89040,0xe0c070]
               : th.fog>0xc00000?[0x889aaa,0x7a8899,0x9aacbb,0x6688aa]
               : [0x8c7a5c,0x6a7a5c,0x5c6a7a,0x9a8a6c,0x7a6a8a,0x8a7a68];

    for (let bx=0;bx<N_BLOCK;bx++) {
        for (let bz=0;bz<N_BLOCK;bz++) {
            const cx=-HALF+BLOCK*bx+BLOCK/2, cz=-HALF+BLOCK*bz+BLOCK/2;
            const inner=BLOCK-ROAD_W;
            addMesh(new THREE.PlaneGeometry(inner,inner), MAT.grass, cx,0.01,cz, -Math.PI/2,0,0, false);
            const isCenter=(bx===Math.floor(N_BLOCK/2)-1&&bz===Math.floor(N_BLOCK/2)-1);
            if (isCenter) { addPlaza(cx+BLOCK/2,cz+BLOCK/2); continue; }
            const num=1+Math.floor(Math.random()*2), hw=inner/2-3, placed=[];
            for (let i=0;i<num;i++) {
                const bw=10+Math.random()*16,bd=10+Math.random()*16,bh=8+Math.random()*28;
                let ox,oz,ok=false;
                for (let t=0;t<8;t++){ox=(Math.random()*2-1)*(hw-bw/2);oz=(Math.random()*2-1)*(hw-bd/2);
                    const r={minX:cx+ox-bw/2,maxX:cx+ox+bw/2,minZ:cz+oz-bd/2,maxZ:cz+oz+bd/2};
                    ok=placed.every(p=>r.minX>p.maxX+1||r.maxX<p.minX-1||r.minZ>p.maxZ+1||r.maxZ<p.minZ-1);
                    if(ok){placed.push(r);colliders.push({minX:r.minX-0.5,maxX:r.maxX+0.5,minZ:r.minZ-0.5,maxZ:r.maxZ+0.5});break;}}
                if(!ok)continue;
                const col=BLDG[Math.floor(Math.random()*BLDG.length)];
                const mat=new THREE.MeshLambertMaterial({color:col});
                addMesh(new THREE.BoxGeometry(bw,bh,bd),mat,cx+ox,bh/2,cz+oz,0,0,0,true);
                if(Math.random()>0.5){const rh=1.5+Math.random()*3;addMesh(new THREE.BoxGeometry(bw*0.5,rh,bd*0.5),mat,cx+ox,bh+rh/2,cz+oz,0,0,0,true);}
                if(th.night&&bh>12){const wm=new THREE.MeshLambertMaterial({color:0xffee88,emissive:0xffee88,emissiveIntensity:0.3});addMesh(new THREE.BoxGeometry(bw+0.05,0.5,bd+0.05),wm,cx+ox,bh*0.5,cz+oz,0,0,0,false);}
            }
            if (th.trees&&Math.random()>0.5) addTree(cx+(Math.random()*2-1)*(inner/2-5),cz+(Math.random()*2-1)*(inner/2-5));
            if (th.night&&Math.random()>0.6) addLamppost(cx+inner/2,cz+inner/2);
        }
    }

    addRamps();
    if(th.mountain) addMountains();
    if(th.plains) addPlainsFeatures();
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
    colliders.push({minX:cx-5.5,maxX:cx+5.5,minZ:cz-5.5,maxZ:cz+5.5});
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

function addMountains(){
    const peaks=[{x:220,z:220},{x:-220,z:220},{x:220,z:-220},{x:-220,z:-220},{x:0,z:250},{x:250,z:0}];
    peaks.forEach(p=>{
        const h=25+Math.random()*35,r=18+Math.random()*14;
        const mat=new THREE.MeshLambertMaterial({color:0x6a7a5a});
        addMesh(new THREE.ConeGeometry(r,h,8),mat,p.x,h/2,p.z,0,0,0,true);
        // Snow cap
        addMesh(new THREE.ConeGeometry(r*0.35,h*0.28,8),new THREE.MeshLambertMaterial({color:0xeef4ff}),p.x,h*0.88,p.z,0,0,0,true);
        colliders.push({minX:p.x-r*0.5,maxX:p.x+r*0.5,minZ:p.z-r*0.5,maxZ:p.z+r*0.5});
    });
    // Extra boulders scattered
    for(let i=0;i<20;i++){
        const bx=(Math.random()-0.5)*400,bz=(Math.random()-0.5)*400,bs=2+Math.random()*5;
        addMesh(new THREE.DodecahedronGeometry(bs,0),new THREE.MeshLambertMaterial({color:0x7a7060}),bx,bs*0.4,bz,0,Math.random()*Math.PI,0,true);
    }
}

function addPlainsFeatures(){
    // Wind turbines
    const turbSpots=[{x:150,z:80},{x:-150,z:80},{x:150,z:-80},{x:-150,z:-80}];
    turbSpots.forEach(t=>{
        const mat=new THREE.MeshLambertMaterial({color:0xddddcc});
        addMesh(new THREE.CylinderGeometry(0.5,0.9,22,8),mat,t.x,11,t.z,0,0,0,true);
        // 3 blades
        for(let b=0;b<3;b++){const ba=(b/3)*Math.PI*2;addMesh(new THREE.BoxGeometry(0.4,8,0.18),mat,t.x+Math.cos(ba)*4,22.5,t.z+Math.sin(ba)*4,0,ba,0,true);}
        colliders.push({minX:t.x-1.5,maxX:t.x+1.5,minZ:t.z-1.5,maxZ:t.z+1.5});
    });
    // Haystacks
    for(let i=0;i<12;i++){
        const hx=(Math.random()-0.5)*350,hz=(Math.random()-0.5)*350;
        addMesh(new THREE.CylinderGeometry(2.2,2.8,2.2,12),new THREE.MeshLambertMaterial({color:0xc8a840}),hx,1.1,hz,0,0,0,true);
    }
    // Sunflower patches (simple cones)
    for(let i=0;i<30;i++){
        const fx=(Math.random()-0.5)*400,fz=(Math.random()-0.5)*400;
        addMesh(new THREE.CylinderGeometry(0.08,0.12,2.2,5),new THREE.MeshLambertMaterial({color:0x3a8a2a}),fx,1.1,fz,0,0,0,true);
        addMesh(new THREE.SphereGeometry(0.32,6,4),new THREE.MeshLambertMaterial({color:0xffcc00}),fx,2.4,fz,0,0,0,true);
    }
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

/* ══════════════════════════════════════════ CAR MESH */
function createCarMesh(pl){
    const ct=pl.ct,col=pl.color;
    const g=new THREE.Group();
    const mBody=new THREE.MeshPhongMaterial({color:col,shininess:90});
    const mDark=new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:30});
    const mGold=new THREE.MeshPhongMaterial({color:0xc6a84a,shininess:120});
    const mGlass=new THREE.MeshPhongMaterial({color:0x6688aa,transparent:true,opacity:0.5,shininess:150});
    const mLight=new THREE.MeshPhongMaterial({color:0xffffcc,emissive:0xffffcc,emissiveIntensity:0.8});
    const mTail=new THREE.MeshPhongMaterial({color:0xff4444,emissive:0xff2222,emissiveIntensity:0.7});

    const body=new THREE.Mesh(new THREE.BoxGeometry(ct.bW,ct.bH,ct.bD),mBody);
    body.position.y=ct.bH/2+0.3;body.castShadow=true;g.add(body);
    if(ct.id==='truck'){
        // Cab (front)
        const cab=new THREE.Mesh(new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD),mBody);
        cab.position.set(0,ct.bH+ct.cH/2+0.08,ct.bD/2-ct.cD/2);cab.castShadow=true;g.add(cab);
        // Windscreen
        const twf=new THREE.Mesh(new THREE.PlaneGeometry(ct.cW-0.3,ct.cH*0.5),mGlass);
        twf.position.set(0,ct.bH+ct.cH*0.62,ct.bD/2-ct.cD/2+ct.cD/2-0.05);twf.rotation.x=0.32;g.add(twf);
        // Exhaust pipes
        ['left','right'].forEach((s,si)=>{
            const ex=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,2.2,6),new THREE.MeshLambertMaterial({color:0x444444}));
            ex.position.set((si===0?-1:1)*(ct.bW/2-0.2),ct.bH+ct.cH*0.9,ct.bD/2-ct.cD+0.1);g.add(ex);
        });
        // Trailer connector
        const hitch=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.3,0.5),mDark);
        hitch.position.set(0,ct.bH*0.5,-ct.bD/2-0.25);g.add(hitch);
    } else {
        const cab=new THREE.Mesh(new THREE.BoxGeometry(ct.cW,ct.cH,ct.cD),mBody);
        cab.position.set(0,ct.bH+ct.cH/2+0.18,-0.1);cab.castShadow=true;g.add(cab);
        const wf=new THREE.Mesh(new THREE.PlaneGeometry(ct.cW-0.3,0.55),mGlass);
        wf.position.set(0,ct.bH+ct.cH*0.6,ct.cD/2-0.08);wf.rotation.x=Math.PI/2+0.38;g.add(wf);
    }
    [[ct.bD/2+0.14],[-(ct.bD/2+0.14)]].forEach(([z])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(ct.bW,0.22,0.28),mDark);b.position.set(0,0.42,z);g.add(b);});
    [[-ct.bW/2+0.3,ct.bH*0.7,ct.bD/2+0.05],[ct.bW/2-0.3,ct.bH*0.7,ct.bD/2+0.05]].forEach(([x,y,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.18,0.08),mLight);m.position.set(x,y,z);g.add(m);});
    [[-ct.bW/2+0.3,ct.bH*0.7,-(ct.bD/2+0.05)],[ct.bW/2-0.3,ct.bH*0.7,-(ct.bD/2+0.05)]].forEach(([x,y,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.18,0.08),mTail);m.position.set(x,y,z);g.add(m);});
    if(['sport','drift','rally'].includes(ct.id)){const sp=new THREE.Mesh(new THREE.BoxGeometry(ct.bW+0.2,0.08,0.5),mDark);sp.position.set(0,ct.bH+ct.cH+0.32,-ct.bD/2+0.28);g.add(sp);}
    const wR=0.35+(ct.id==='truck'?0.12:0),wW=0.26+(ct.id==='truck'?0.15:0),wox=ct.bW/2+0.04;
    pl.wheels=[];
    [[-wox,wR,ct.bD/2-0.9],[wox,wR,ct.bD/2-0.9],[-wox,wR,-ct.bD/2+0.9],[wox,wR,-ct.bD/2+0.9]]
    .forEach(([wx,wy,wz])=>{
        const wg=new THREE.Group();wg.position.set(wx,wy,wz);wg.rotation.z=Math.PI/2;
        const tire=new THREE.Mesh(new THREE.CylinderGeometry(wR,wR,wW,16),mDark);tire.castShadow=true;wg.add(tire);
        const rim=new THREE.Mesh(new THREE.CylinderGeometry(wR*0.56,wR*0.56,wW+0.01,8),mGold);wg.add(rim);
        g.add(wg);pl.wheels.push(wg);
    });
    // Name label sprite
    if(pl.name && pl.name!=='?'){
        const canvas2d=document.createElement('canvas');canvas2d.width=256;canvas2d.height=64;
        const ctx2=canvas2d.getContext('2d');
        ctx2.clearRect(0,0,256,64);
        ctx2.fillStyle='rgba(0,0,0,0.6)';
        ctx2.roundRect?ctx2.roundRect(4,8,248,48,8):ctx2.fillRect(4,8,248,48);
        ctx2.fill();
        ctx2.fillStyle='#e8d080';ctx2.font='bold 28px Arial';ctx2.textAlign='center';
        ctx2.fillText(pl.name.substring(0,12),128,42);
        const tex=new THREE.CanvasTexture(canvas2d);
        const spriteMat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
        const sprite=new THREE.Sprite(spriteMat);
        sprite.scale.set(3.2,0.8,1);
        sprite.position.set(0,pl.ct.bH+pl.ct.cH+1.1,0);
        g.add(sprite);pl.nameSprite=sprite;
    }
    g.castShadow=true;scene.add(g);pl.mesh=g;
    g.position.copy(pl.pos);
    return g;
}

/* ══════════════════════════════════════════ BOTS */
const BOT_COLORS=[0x33cc44,0xff8800,0xcc33ff,0x00ccff,0xffee00];
function spawnBots(){
    bots=[];
    const rampSpots=rampMeshes.slice(0,3);
    rampSpots.forEach((rm,i)=>{
        const carIdx=Math.floor(Math.random()*CAR_TYPES.length);
        const b=makePlayer(BOT_COLORS[i%BOT_COLORS.length], rm.x+8, rm.z+8, carIdx, 'Bot '+(i+1));
        b.isBot=true;
        b.botWaypointIdx=0;
        b.botWaypoints=generateBotWaypoints(rm.x, rm.z);
        b.botAggression=0.5+Math.random()*0.5;
        createCarMesh(b);
        bots.push(b);
    });
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

function initPeer(cb){if(peer){peer.destroy();peer=null;}peer=new Peer(undefined,{debug:0});peer.on('open',id=>{myPeerId=id;if(cb)cb(id);});peer.on('error',err=>{showToast('Erreur réseau: '+err.type);});}
function getOrCreateRemote(peerId,info){
    if(!remotePlayers[peerId]){const color=REMOTE_COLORS[remoteColorIdx++%REMOTE_COLORS.length];const rp={pos:new THREE.Vector3(20,0,20),rot:0,speed:0,nitroOn:false,mesh:null,wheels:[],name:info.name||'?',carIdx:info.carIdx||0,color};const fake=makePlayer(color,20,20,info.carIdx||0,info.name||'?');createCarMesh(fake);rp.mesh=fake.mesh;rp.wheels=fake.wheels;remotePlayers[peerId]=rp;updateLobbyPlayerList();}return remotePlayers[peerId];
}
function removeRemote(peerId){if(remotePlayers[peerId]){if(remotePlayers[peerId].mesh)scene.remove(remotePlayers[peerId].mesh);delete remotePlayers[peerId];updateLobbyPlayerList();}}
function updateRemoteMesh(peerId,data){const rp=remotePlayers[peerId];if(!rp||!rp.mesh)return;const ry=data.y!==undefined?data.y:getRampY(data.x,data.z,data.rot);rp.pos.set(data.x,ry,data.z);rp.rot=data.rot;rp.speed=data.speed;rp.mesh.position.set(data.x,ry,data.z);rp.mesh.rotation.y=data.rot;rp.wheelAngle=(rp.wheelAngle||0)+data.speed*0.016/0.36;rp.wheels.forEach(w=>w.rotation.y=rp.wheelAngle);}
function hostGame(){CFG.lobbyName=document.getElementById('lobby-name').value.trim()||'Course Royale';CFG.lobbyPass=document.getElementById('lobby-pass').value;CFG.multiName=document.getElementById('multi-name').value.trim()||'Hôte';document.getElementById('host-btn').textContent='⏳...';document.getElementById('host-btn').disabled=true;initPeer(id=>{isHost=true;myPeerId=id;lobbyInfo={name:CFG.lobbyName,pass:CFG.lobbyPass,world:CFG.multiWorld,maxPlayers:CFG.maxPlayers,hostName:CFG.multiName,hostCar:CFG.multiCar,hostId:id};peer.on('connection',conn=>{conn.on('open',()=>{conn.send({type:'lobby_info',lobby:lobbyInfo,players:buildPlayerListForSync()});clientConns.push(conn);updateLobbyPlayerList();broadcastExcept(conn.peer,{type:'player_joined',peerId:conn.peer,info:conn.metadata});});conn.on('data',data=>handleHostData(conn,data));conn.on('close',()=>{clientConns=clientConns.filter(c=>c!==conn);removeRemote(conn.peer);broadcastAll({type:'player_left',peerId:conn.peer});updateLobbyPlayerList();});conn.on('error',()=>{});});showLobbyScreen();document.getElementById('host-btn').textContent='🏠 CRÉER LA PARTIE';document.getElementById('host-btn').disabled=false;});}
function handleHostData(conn,data){if(data.type==='join_request'){if(lobbyInfo.pass&&data.pass!==lobbyInfo.pass){conn.send({type:'join_rejected',reason:'Mot de passe incorrect'});conn.close();return;}if(clientConns.length+1>=lobbyInfo.maxPlayers){conn.send({type:'join_rejected',reason:'Lobby plein'});conn.close();return;}conn.metadata={name:data.name,carIdx:data.carIdx};getOrCreateRemote(conn.peer,conn.metadata);// Send ALL existing players to new joiner
const allStates=[];Object.entries(remotePlayers).forEach(([id,rp])=>{if(id!==conn.peer)allStates.push({peerId:id,info:{name:rp.name,carIdx:rp.carIdx}});});conn.send({type:'join_accepted'});conn.send({type:'all_players',players:allStates,hostInfo:{name:CFG.multiName,carIdx:CFG.multiCar,peerId:myPeerId}});broadcastExcept(conn.peer,{type:'player_joined',peerId:conn.peer,info:conn.metadata});}if(data.type==='state'){updateRemoteMesh(conn.peer,data);broadcastExcept(conn.peer,{type:'remote_state',peerId:conn.peer,state:data});}}
function buildPlayerListForSync(){const list=[{peerId:myPeerId,name:CFG.multiName,carIdx:CFG.multiCar,isHost:true}];clientConns.forEach(c=>{if(c.metadata)list.push({peerId:c.peer,...c.metadata});});return list;}
function broadcastAll(msg){clientConns.forEach(c=>{try{c.send(msg);}catch(e){}});}
function broadcastExcept(xId,msg){clientConns.filter(c=>c.peer!==xId).forEach(c=>{try{c.send(msg);}catch(e){}});}
function startMultiGame(){if(clientConns.length===0&&!confirm('Démarrer seul ?'))return;broadcastAll({type:'game_start',world:CFG.multiWorld});CFG.mode='multi';CFG.world=CFG.multiWorld;launchGame();}
function cancelLobby(){broadcastAll({type:'host_cancelled'});if(peer){peer.destroy();peer=null;}isHost=false;clientConns=[];document.getElementById('lobby-screen').classList.add('hidden');document.getElementById('setup-screen').classList.remove('hidden');}
function joinGame(){const code=document.getElementById('join-code').value.trim(),pass=document.getElementById('join-pass').value,name=document.getElementById('multi-name').value.trim()||'Pilote';CFG.multiName=name;if(!code){showToast('Entrez un code de session');return;}document.getElementById('join-btn').textContent='⏳...';document.getElementById('join-btn').disabled=true;initPeer(()=>{hostConn=peer.connect(code,{reliable:true});hostConn.on('open',()=>hostConn.send({type:'join_request',name,carIdx:CFG.multiCar,pass}));hostConn.on('data',data=>handleClientData(data));hostConn.on('close',()=>{showToast('Déconnecté');showSetupScreen();});hostConn.on('error',()=>{showToast('Impossible de se connecter');showSetupScreen();});setTimeout(()=>{if(!document.getElementById('join-waiting').classList.contains('hidden'))return;showToast('Code introuvable');showSetupScreen();},8000);});}
function handleClientData(data){if(data.type==='join_rejected'){showToast('Refusé: '+data.reason);showSetupScreen();return;}if(data.type==='join_accepted'){document.getElementById('join-waiting').classList.remove('hidden');document.getElementById('setup-screen').classList.add('hidden');document.getElementById('join-btn').textContent='🔗 REJOINDRE';document.getElementById('join-btn').disabled=false;}if(data.type==='all_players'){// Create meshes for all existing players including host
data.players.forEach(p=>getOrCreateRemote(p.peerId,p.info));
if(data.hostInfo)getOrCreateRemote(data.hostInfo.peerId,{name:data.hostInfo.name,carIdx:data.hostInfo.carIdx});}if(data.type==='lobby_info'){lobbyInfo=data.lobby;document.getElementById('join-lobby-title').textContent=lobbyInfo.name;document.getElementById('join-lobby-sub').textContent='Connecté !';document.getElementById('join-world-disp').textContent=worldName(lobbyInfo.world);updateJoinPlayerList(data.players);}if(data.type==='player_joined'){getOrCreateRemote(data.peerId,data.info);updateJoinPlayerList(null);}if(data.type==='player_left'){removeRemote(data.peerId);updateJoinPlayerList(null);}if(data.type==='remote_state'){updateRemoteMesh(data.peerId,data.state);}if(data.type==='host_cancelled'){showToast("L'hôte a annulé");showSetupScreen();}if(data.type==='game_start'){CFG.mode='multi';CFG.world=data.world;launchGame();}}
function cancelJoin(){if(hostConn){hostConn.close();hostConn=null;}if(peer){peer.destroy();peer=null;}document.getElementById('join-waiting').classList.add('hidden');showSetupScreen();}
function showLobbyScreen(){document.getElementById('setup-screen').classList.add('hidden');document.getElementById('lobby-screen').classList.remove('hidden');document.getElementById('lobby-display-name').textContent=CFG.lobbyName;document.getElementById('lobby-code-display').textContent=myPeerId;document.getElementById('lob-world-name').textContent=worldName(CFG.multiWorld);document.getElementById('lob-max').textContent=CFG.maxPlayers;document.getElementById('lob-max2').textContent=CFG.maxPlayers;document.getElementById('lob-pass-tag').style.display=CFG.lobbyPass?'inline':'none';updateLobbyPlayerList();}
function updateLobbyPlayerList(){const list=document.getElementById('lobby-players-list');if(!list)return;const players=[{name:CFG.multiName,carIdx:CFG.multiCar,color:'#c6a84a',isHost:true}];Object.values(remotePlayers).forEach(rp=>players.push({name:rp.name,carIdx:rp.carIdx,color:'#'+rp.color.toString(16).padStart(6,'0')}));document.getElementById('lob-count').textContent=players.length;list.innerHTML=players.map(p=>`<div class="player-row ${p.isHost?'host-row':''}"><div class="player-dot" style="background:${p.color}"></div><span class="player-row-name">${p.isHost?'👑 ':''}${p.name}</span><span class="player-row-car">${CAR_TYPES[p.carIdx]?.emoji||'🚗'} ${CAR_TYPES[p.carIdx]?.name||''}</span></div>`).join('');}
function updateJoinPlayerList(players){const list=document.getElementById('join-players-list');if(!list)return;if(players)list.innerHTML=players.map(p=>`<div class="player-row ${p.isHost?'host-row':''}"><div class="player-dot" style="background:${p.isHost?'#c6a84a':'#aaaaff'}"></div><span class="player-row-name">${p.isHost?'👑 ':''}${p.name}</span><span class="player-row-car">${CAR_TYPES[p.carIdx]?.emoji||'🚗'}</span></div>`).join('');}
function copyCode(){const code=document.getElementById('lobby-code-display').textContent;navigator.clipboard.writeText(code).then(()=>showToast('Code copié !')).catch(()=>{const ta=document.createElement('textarea');ta.value=code;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('Code copié !');});}
function worldName(w){return{city:'Cité Royale',desert:'Désert Ardent',snow:'Toundra Glacée',night:'Nuit Noire'}[w]||w;}

/* ══════════════════════════════════════════ NET STATE */
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
function updatePlayer(pl, dt, fwd, back, left, right, nitroKey, handbrake) {
    const ct=pl.ct;
    // Apply console overrides
    const maxSpd = (pl.cons?.maxSpd ?? ct.maxSpd) * (pl.nitroOn?1.9:1);
    const accel  = pl.cons?.accel  ?? ct.accel;
    const driftF = pl.cons?.drift  ?? ct.driftF;

    if(fwd){pl.speed+=accel*dt;if(pl.nitroOn)pl.speed+=44*dt;}
    else if(back){if(pl.speed>1)pl.speed-=ct.brake*dt;else pl.speed-=accel*0.5*dt;}
    else{const f=ct.friction*dt;if(Math.abs(pl.speed)<f)pl.speed=0;else pl.speed-=Math.sign(pl.speed)*f;}
    pl.speed=Math.max(-(pl.cons?.maxSpd??ct.maxSpd)*0.45, Math.min(maxSpd, pl.speed));

    const wantNitro=nitroKey&&fwd;
    pl.nitroOn=wantNitro&&(pl.cons?.nitro??pl.nitro)>0;
    if(pl.nitroOn)pl.nitro=Math.max(0,pl.nitro-ct.nDrain*dt);
    else pl.nitro=Math.min(100,pl.nitro+ct.nRegen*dt);

    const sp=Math.min(Math.abs(pl.speed)/6,1)*ct.steer*dt;
    const sd=pl.speed>=0?1:-1;
    let steer=0;
    if(left)steer=sp*sd;
    if(right)steer=-sp*sd;

    // Handbrake drift (Space / .)
    pl.handbraking=!!handbrake;
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
    pl.pos.x=Math.max(-HALF+5,Math.min(HALF-5,pl.pos.x));
    pl.pos.z=Math.max(-HALF+5,Math.min(HALF-5,pl.pos.z));

    // AABB collisions
    const rad=ct.bW/2+0.2;
    for(const c of colliders){
        if(c.isRamp) continue; // ramp handled via Y
        const cx=Math.max(c.minX,Math.min(c.maxX,pl.pos.x));
        const cz=Math.max(c.minZ,Math.min(c.maxZ,pl.pos.z));
        const dx=pl.pos.x-cx,dz=pl.pos.z-cz;
        if(dx*dx+dz*dz<rad*rad){
            // Crash effect!
            pl.crashVel=Math.abs(pl.speed);
            pl.crashTimer=0.4;
            pl.pos.x=prevX;pl.pos.z=prevZ;
            pl.speed*=-0.35 + (Math.random()-0.5)*0.1;
            pl.rot+=(Math.random()-0.5)*0.4; // slight chaos
            break;
        }
    }

    // Gravity & ramp Y
    pl.velY -= worldGravity * dt;
    const groundY = getRampY(pl.pos.x, pl.pos.z, pl.rot);
    pl.pos.y += pl.velY * dt;
    if(pl.pos.y <= groundY){
        pl.pos.y = groundY;
        if(pl.velY < -5) { // hard landing
            pl.crashTimer=0.2;
            pl.crashVel=Math.abs(pl.velY)*0.5;
        }
        pl.velY = 0;
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
    let maxY=0;
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
    updatePlayer(p1,dt,
        keys[km.fwd]||touchKeys.fwd,
        keys[km.back]||touchKeys.back,
        keys[km.left]||touchKeys.left,
        keys[km.right]||touchKeys.right,
        keys['ShiftLeft']||keys['ShiftRight']||touchKeys.nitro,
        keys['Space']||touchKeys.handbrake);
    if(CFG.mode==='split')
        updatePlayer(p2,dt,
            keys['ArrowUp'],keys['ArrowDown'],keys['ArrowLeft'],keys['ArrowRight'],
            keys['ControlLeft']||keys['ControlRight'],
            keys['Period']);
    if(CFG.mode==='multi') sendNetState();
    updateBots(dt);
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
    if(p1){p1.pos.set(8,0,0);p1.speed=0;p1.velY=0;p1.rot=0;p1.driftAngle=0;p1.stuckTimer=0;if(p1.mesh)p1.mesh.position.copy(p1.pos);}
    document.getElementById('pause-menu').classList.add('hidden');
    paused=false;
    showToast('🔄 Respawn !');
}

/* ══════════════════════════════════════════ CAMERA */
const _ct1=new THREE.Vector3(),_ct2=new THREE.Vector3();
function updateCamFor(pl,cam,ct,dt){
    const spd=Math.abs(pl.speed),vm=CFG.viewMode;
    let tx,ty,tz;
    if(vm==='third'){const d=10+spd*0.1,h=4.5+Math.max(pl.pos.y,0)+spd*0.04;tx=pl.pos.x-Math.sin(pl.rot)*d;ty=pl.pos.y+h;tz=pl.pos.z-Math.cos(pl.rot)*d;}
    else if(vm==='first'){tx=pl.pos.x+Math.sin(pl.rot)*0.2;ty=pl.pos.y+pl.ct.bH+pl.ct.cH+0.3;tz=pl.pos.z+Math.cos(pl.rot)*0.2;}
    else if(vm==='top'){tx=pl.pos.x;ty=pl.pos.y+20;tz=pl.pos.z;}
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
function prerenderMinimap(){
    const off=document.createElement('canvas');off.width=MM;off.height=MM;const c=off.getContext('2d');
    const w=CFG.mode==='multi'?CFG.multiWorld:CFG.world;
    const bgCol=w==='desert'?'#b89040':w==='snow'?'#9ab8cc':w==='night'?'#0a1a0a':'#3a6b2a';
    c.fillStyle=bgCol;c.fillRect(0,0,MM,MM);
    c.fillStyle=w==='night'?'#1a1a33':'#555555';
    for(let i=0;i<=N_BLOCK;i++){const t=i/N_BLOCK,pw=t*MM,rw=Math.ceil((ROAD_W/WORLD)*MM);c.fillRect(pw-rw/2,0,rw,MM);c.fillRect(0,pw-rw/2,MM,rw);}
    c.fillStyle='#1a1a1a';
    colliders.forEach(col=>{const sw=col.maxX-col.minX,sd=col.maxZ-col.minZ;if(sw>80||sd>80)return;c.fillRect(((col.minX+HALF)/WORLD)*MM,((col.minZ+HALF)/WORLD)*MM,(sw/WORLD)*MM,(sd/WORLD)*MM);});
    // Ramp markers
    c.fillStyle='#ffee00';
    rampMeshes.forEach(rm=>{const px=((rm.x+HALF)/WORLD)*MM,pz=((rm.z+HALF)/WORLD)*MM;c.fillRect(px-3,pz-3,6,6);});
    minimapBase=off;
}
function drawMinimap(){
    if(!minimapBase)return;mmCtx.clearRect(0,0,MM,MM);mmCtx.drawImage(minimapBase,0,0);
    if(!p1)return;
    drawMapArrow(mmCtx,((p1.pos.x+HALF)/WORLD)*MM,((p1.pos.z+HALF)/WORLD)*MM,p1.rot,'#ff3333','#ffaaaa');
    if(CFG.mode==='split'&&p2)drawMapArrow(mmCtx,((p2.pos.x+HALF)/WORLD)*MM,((p2.pos.z+HALF)/WORLD)*MM,p2.rot,'#3366ff','#aaccff');
    bots.forEach(b=>{if(!b.mesh)return;drawMapArrow(mmCtx,((b.pos.x+HALF)/WORLD)*MM,((b.pos.z+HALF)/WORLD)*MM,b.rot,'#'+b.color.toString(16).padStart(6,'0'),'#ffffff');});
    Object.values(remotePlayers).forEach(rp=>{drawMapArrow(mmCtx,((rp.pos.x+HALF)/WORLD)*MM,((rp.pos.z+HALF)/WORLD)*MM,rp.rot,'#'+rp.color.toString(16).padStart(6,'0'),'#ffffff');});
    mmCtx.fillStyle='rgba(198,168,74,.6)';mmCtx.font='8px Cinzel,serif';mmCtx.textAlign='center';mmCtx.fillText('N',MM/2,9);
}
function drawMapArrow(ctx,px,pz,rot,fill,stroke){ctx.save();ctx.translate(px,pz);ctx.rotate(rot);ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(3.5,4);ctx.lineTo(0,2);ctx.lineTo(-3.5,4);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=0.5;ctx.stroke();ctx.restore();}

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
    CAR_TYPES.forEach((ct,i)=>{
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
        showToast('Voiture changée : '+CAR_TYPES[CFG.p1Car].name);
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
    {cmd:'teleport=',    desc:'Téléporter J1 (ex: teleport=0,0)',      scope:'action'},
    {cmd:'nitro.regen=', desc:'Regen nitro (ex: nitro.regen=30)',      scope:'world'},
    {cmd:'world=',       desc:'Changer monde (city/desert/snow/night/mountain/plains)',scope:'world'},
    {cmd:'bots.count=',  desc:'Nombre de bots (ex: bots.count=5)',     scope:'world'},
    {cmd:'crash=',       desc:'Forcer crash J1 (crash=1)',             scope:'action'},
    {cmd:'invincible=',  desc:'Mode invincible 0/1',                   scope:'player'},
    {cmd:'lowgrav',      desc:'Gravité lunaire temporaire',             scope:'world'},
    {cmd:'boost',        desc:'Boost instantané J1',                   scope:'action'},
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
        if(key==='gravity'){worldGravity=val;consoleLog(`✓ gravity = ${val}  (affecte tout le monde)`,'ok');return;}
        if(key==='fog'){scene.fog.density=val;consoleLog(`✓ fog = ${val}`,'ok');return;}
        if(key==='sun'){sun.intensity=val;consoleLog(`✓ sun = ${val}`,'ok');return;}
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

        if(key==='teleport'){const parts=rawVal.split(',');if(parts.length===2&&p1){p1.pos.x=parseFloat(parts[0]);p1.pos.z=parseFloat(parts[1]);p1.pos.y=0;p1.speed=0;consoleLog(`✓ Téléporté à ${parts[0]},${parts[1]}`,'ok');}return;}
        if(key==='nitro.regen'){if(p1)p1.ct.nRegen=val;consoleLog(`✓ nitro.regen = ${val}`,'ok');return;}
        if(key==='world'){const w=['city','desert','snow','night','mountain','plains'];if(w.includes(rawVal)){CFG.world=rawVal;CFG.multiWorld=rawVal;launchGame();consoleLog(`✓ Monde changé : ${rawVal}`,'ok');}else consoleLog('✗ Monde invalide','err');return;}
        if(key==='bots.count'){bots.forEach(b=>{if(b.mesh)scene.remove(b.mesh);});bots=[];const nb=Math.max(0,Math.min(10,Math.round(val)));for(let i=0;i<nb;i++){const carIdx=Math.floor(Math.random()*CAR_TYPES.length);const b=makePlayer(BOT_COLORS[i%BOT_COLORS.length],(Math.random()-0.5)*200,(Math.random()-0.5)*200,carIdx,'Bot '+(i+1));b.isBot=true;b.botWaypointIdx=0;b.botWaypoints=generateBotWaypoints(0,0);b.botAggression=0.5+Math.random()*0.5;createCarMesh(b);bots.push(b);}consoleLog(`✓ ${nb} bots spawned`,'ok');return;}
        if(key==='invincible'){if(p1){p1._invincible=val>0;consoleLog(`✓ Invincible = ${val>0}`,'ok');}return;}
        if(cmd==='lowgrav'){worldGravity=3;setTimeout(()=>{worldGravity=18;},10000);consoleLog('✓ Gravité lunaire 10s !','ok');return;}
        if(cmd==='boost'){if(p1){p1.nitro=100;p1.speed=p1.ct.maxSpd*1.5;consoleLog('✓ Boost !','ok');}return;}
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
function setMode(m){CFG.mode=m;['solo','split'].forEach(id=>document.getElementById('mode-'+id).classList.toggle('active',id===m));document.getElementById('p2-section').style.display=m==='split'?'block':'none';}
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
    CAR_TYPES.forEach((ct,i)=>{
        const btn=document.createElement('button');btn.className='car-btn';
        const sc=player===1?'sel-p1':player===2?'sel-p2':'sel-multi';
        const ci=player===1?CFG.p1Car:player===2?CFG.p2Car:CFG.multiCar;
        if(i===ci)btn.classList.add(sc);
        btn.innerHTML=`<span class="car-emoji">${ct.emoji}</span><span class="car-name">${ct.name}</span><span class="car-stat">${ct.stat}</span>`;
        btn.onclick=()=>{grid.querySelectorAll('.car-btn').forEach(b=>b.classList.remove(sc));btn.classList.add(sc);if(player===1)CFG.p1Car=i;else if(player===2)CFG.p2Car=i;else CFG.multiCar=i;};
        grid.appendChild(btn);
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
    p1=makePlayer(0xff3333,8,0,p1ci,p1nm);createCarMesh(p1);
    camera.position.set(p1.pos.x,7,p1.pos.z-12);
    if(CFG.mode==='split'){p2=makePlayer(0x3366ff,-8,0,CFG.p2Car,CFG.p2Name);createCarMesh(p2);camera2.position.set(p2.pos.x,7,p2.pos.z-12);}
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
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();camera2.aspect=window.innerWidth/window.innerHeight;camera2.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

/* ══════════════════════════════════════════ MAIN LOOP */
let lastTime=0;
function animate(time){
    requestAnimationFrame(animate);
    const dt=Math.min((time-lastTime)/1000,0.05);lastTime=time;
    if(gameStarted&&!paused){updatePhysics(dt);updateCamera(dt);updateHUD();updateSound();}
    else if(!gameStarted&&p1)updateCamera(dt);
    renderFrame();
}

/* ══════════════════════════════════════════ BOOT */

/* ══════════════════════════════════════════ MOBILE TOUCH CONTROLS */
const touchKeys={fwd:false,back:false,left:false,right:false,nitro:false,handbrake:false};
let joystickActive=false,joystickId=null;
let joystickBaseX=0,joystickBaseY=0;

function initMobileControls(){
    if(!('ontouchstart' in window)&&navigator.maxTouchPoints===0) return;
    const hud=document.getElementById('hud');
    // Create touch overlay
    const overlay=document.createElement('div');
    overlay.id='touch-overlay';
    overlay.innerHTML=`
    <div id="joystick-zone">
        <div id="joystick-base"><div id="joystick-knob"></div></div>
    </div>
    <div id="touch-btns">
        <button id="btn-nitro" class="touch-btn nitro-btn">⚡<span>NITRO</span></button>
        <button id="btn-brake" class="touch-btn brake-btn">🔴<span>DRIFT</span></button>
    </div>`;
    document.body.appendChild(overlay);

    const zone=document.getElementById('joystick-zone');
    const base=document.getElementById('joystick-base');
    const knob=document.getElementById('joystick-knob');

    zone.addEventListener('touchstart',e=>{
        e.preventDefault();
        const t=e.changedTouches[0];
        joystickActive=true;joystickId=t.identifier;
        joystickBaseX=t.clientX;joystickBaseY=t.clientY;
        base.style.left=(t.clientX-zone.getBoundingClientRect().left-40)+'px';
        base.style.top=(t.clientY-zone.getBoundingClientRect().top-40)+'px';
        base.classList.add('active');
    },{passive:false});

    zone.addEventListener('touchmove',e=>{
        e.preventDefault();
        for(let t of e.changedTouches){
            if(t.identifier!==joystickId)continue;
            const dx=t.clientX-joystickBaseX,dy=t.clientY-joystickBaseY;
            const dist=Math.min(Math.sqrt(dx*dx+dy*dy),50);
            const ang=Math.atan2(dy,dx);
            const kx=Math.cos(ang)*dist,ky=Math.sin(ang)*dist;
            knob.style.transform=`translate(${kx}px,${ky}px)`;
            const deadzone=8;
            touchKeys.fwd=dy<-deadzone;
            touchKeys.back=dy>deadzone;
            touchKeys.left=dx<-deadzone;
            touchKeys.right=dx>deadzone;
        }
    },{passive:false});

    const resetJoy=e=>{
        e.preventDefault();
        joystickActive=false;joystickId=null;
        knob.style.transform='translate(0,0)';
        base.classList.remove('active');
        touchKeys.fwd=false;touchKeys.back=false;touchKeys.left=false;touchKeys.right=false;
    };
    zone.addEventListener('touchend',resetJoy,{passive:false});
    zone.addEventListener('touchcancel',resetJoy,{passive:false});

    // Nitro & drift buttons
    const btnNitro=document.getElementById('btn-nitro');
    const btnBrake=document.getElementById('btn-brake');
    btnNitro.addEventListener('touchstart',e=>{e.preventDefault();touchKeys.nitro=true;},{passive:false});
    btnNitro.addEventListener('touchend',e=>{e.preventDefault();touchKeys.nitro=false;},{passive:false});
    btnBrake.addEventListener('touchstart',e=>{e.preventDefault();touchKeys.handbrake=true;},{passive:false});
    btnBrake.addEventListener('touchend',e=>{e.preventDefault();touchKeys.handbrake=false;},{passive:false});
}

function boot(){
    buildCarGrid('car-grid-p1',1);buildCarGrid('car-grid-p2',2);buildCarGrid('car-grid-multi',0);
    document.getElementById('loading').style.display='none';
    document.getElementById('setup-screen').classList.remove('hidden');
    renderer.render(scene,camera);
    initMobileControls();
}
requestAnimationFrame(animate);
boot();
