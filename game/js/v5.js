'use strict';
// ================= v0.5: FIRST-PERSON GRAPHICS PASS =================
// Detailed weapons and arms, shell casings, skyDome with cloudSky and skyStars, swaying grassInst, rockInst, town litter,
// and extra detail on every enemy. Loaded last; it only adds to what the other files build.

// ---------- Materials ----------
const VPH=(c,sh=40,sp=0x2a2a2a)=>new T3.MeshPhongMaterial({color:c,shininess:sh,specular:sp});
let VWM=null;
function weaponMats(){if(VWM)return VWM;buildTextures();
  const wood=new T3.MeshLambertMaterial({color:0x8a5c36,map:TEX.wood}),wood2=new T3.MeshLambertMaterial({color:0x6a4426,map:TEX.wood});
  VWM={blued:VPH(0x202327,70,0x555555),dark:VPH(0x17191b,50,0x3a3a3a),metal:VPH(0x45494d,60,0x606060),steel:VPH(0xc9cdd0,110,0xffffff),edge:VPH(0xe8ecee,140,0xffffff),
    poly:VPH(0x26282a,12,0x151515),olive:VPH(0x4a5236,15,0x111111),tan:VPH(0x8a7a55,12,0x111111),brass:VPH(0xc9a040,90,0xffe0a0),rust:new T3.MeshLambertMaterial({color:0x7a4a2a,map:TEX.metal}),
    wood,wood2,grip:VPH(0x2a1d14,10,0x111111),rubber:VPH(0x151515,6,0x080808),tape:new T3.MeshLambertMaterial({color:0x5a5a52,map:TEX.concrete}),
    lens:VPH(0x2a4a6a,160,0xaaccff),glove:new T3.MeshLambertMaterial({color:0x3a3326,map:TEX.concrete}),knuckle:new T3.MeshLambertMaterial({color:0x2c271d}),
    sleeve:new T3.MeshLambertMaterial({color:0x353a2c,map:TEX.concrete}),cuff:new T3.MeshLambertMaterial({color:0x3a3a2c}),red:VPH(0x8a1a12,30),gold:VPH(0xb8952a,90,0xffe080),
    string:new T3.MeshBasicMaterial({color:0xd8d0b8}),rope:new T3.MeshLambertMaterial({color:0x8a7a5a,map:TEX.wood}),glow:new T3.MeshBasicMaterial({color:0xffa030})};
  return VWM}
// shorthand: box / cylinder along z / cylinder along y
function VB(w,h,d,m,x,y,z,g,rx=0,ry=0,rz=0){const o=new T3.Mesh(BOX,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o}
function VCZ(r,len,m,x,y,z,g,seg=10){const o=new T3.Mesh(new T3.CylinderGeometry(r,r,len,seg),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o}
function VCY(r,len,m,x,y,z,g,seg=10){const o=new T3.Mesh(new T3.CylinderGeometry(r,r,len,seg),m);o.position.set(x,y,z);g.add(o);return o}

// ---------- Arms ----------
function rightHand(g,x,y,z,rx=.25){const M=VWM;const h=new T3.Group();h.position.set(x,y,z);h.rotation.x=rx;g.add(h);
  VB(.075,.1,.1,M.glove,0,0,0,h);for(let i=0;i<4;i++)VB(.022,.03,.05,M.knuckle,-.028+i*.019,.045,-.045,h);VB(.03,.06,.03,M.glove,-.045,.03,-.03,h,0,0,.4);
  VB(.08,.085,.2,M.sleeve,.015,-.06,.14,h,-.6);VB(.088,.092,.045,M.cuff,.01,-.035,.06,h,-.6);return h}
function leftHand(g,x,y,z){const M=VWM;const h=new T3.Group();h.position.set(x,y,z);g.add(h);
  VB(.08,.07,.11,M.glove,0,0,0,h);VB(.03,.05,.08,M.glove,.045,.02,-.01,h);for(let i=0;i<4;i++)VB(.02,.035,.025,M.knuckle,-.03,.025-i*.0,-.04+i*.025,h);
  VB(.08,.085,.34,M.sleeve,-.08,-.1,.13,h,-.7,.5,0);VB(.088,.092,.045,M.cuff,-.02,-.035,.04,h,-.7,.5,0);return h}

// ---------- Weapons (barrel points to -z, the right hand holds the grip) ----------
function weaponHD(k,g){const M=weaponMats();let muzzle=-.3,eject=null;
  switch(k){
  case 'pistola':{VB(.058,.06,.25,M.blued,0,.03,-.06,g);for(let i=0;i<5;i++){VB(.062,.035,.006,M.dark,0,.035,.04+i*.012-.02,g)}
    VB(.052,.035,.22,M.poly,0,-.015,-.05,g);VB(.012,.015,.012,M.dark,0,.067,-.17,g);VB(.04,.015,.012,M.dark,0,.067,.055,g);VB(.006,.006,.006,M.glow,0,.075,-.17,g);
    VCZ(.012,.02,M.dark,0,.025,-.185,g);VB(.012,.03,.06,M.poly,0,-.045,-.03,g);VB(.05,.006,.06,M.poly,0,-.06,-.03,g);VB(.008,.025,.008,M.dark,0,-.04,-.02,g);
    VB(.05,.14,.068,M.poly,0,-.1,.045,g,.22);VB(.052,.02,.07,M.dark,0,-.17,.06,g,.22);for(let i=0;i<4;i++)VB(.054,.006,.05,M.rubber,0,-.07-i*.025,.05+i*.006,g,.22);
    rightHand(g,0,-.1,.06,.22);leftHand(g,-.035,-.13,.03);muzzle=-.2;eject=[.035,.04,-.02];break}
  case 'revolver':{VCZ(.016,.2,M.steel,0,.035,-.15,g);VB(.02,.02,.2,M.steel,0,.055,-.15,g);VB(.01,.018,.01,M.steel,0,.07,-.24,g);
    const cyl=VCZ(.042,.065,M.steel,0,.015,-.025,g,12);for(let i=0;i<6;i++){const a=i/6*6.283;const f=VB(.012,.012,.07,M.metal,Math.cos(a)*.04,.015+Math.sin(a)*.04,-.025,g)}
    VCZ(.007,.12,M.steel,0,-.012,-.13,g);VB(.04,.07,.11,M.steel,0,.02,.04,g);VB(.015,.03,.025,M.metal,0,.065,.08,g,-.5);VB(.01,.03,.04,M.metal,0,-.03,.02,g);
    VB(.048,.13,.07,M.wood,0,-.08,.095,g,.32);VB(.05,.02,.072,M.gold,0,-.14,.115,g,.32);rightHand(g,0,-.08,.11,.32);leftHand(g,-.035,-.12,.08);muzzle=-.26;break}
  case 'escopeta':{VCZ(.022,.72,M.blued,0,.02,-.38,g);VCZ(.018,.58,M.dark,0,-.02,-.32,g);VB(.006,.006,.006,M.brass,0,.045,-.73,g);
    const pump=VB(.06,.05,.22,M.wood2,0,-.025,-.32,g);for(let i=0;i<6;i++)VB(.062,.006,.012,M.grip,0,-.025,-.41+i*.035,g);
    VB(.06,.08,.24,M.metal,0,.0,-.02,g);VB(.062,.015,.08,M.dark,0,.025,-.02,g);VB(.015,.03,.06,M.dark,0,-.055,.03,g);VB(.05,.006,.08,M.dark,0,-.07,.03,g);
    VB(.055,.11,.12,M.wood,0,-.055,.12,g,.35);VB(.06,.1,.32,M.wood,0,-.06,.3,g,.08);VB(.065,.11,.03,M.rubber,0,-.07,.46,g,.08);
    rightHand(g,0,-.08,.1,.35);leftHand(g,-.03,-.06,-.32);muzzle=-.76;eject=[.035,.02,-.04];break}
  case 'rifle':{VCZ(.016,.6,M.blued,0,.03,-.42,g);VB(.06,.06,.6,M.wood,0,-.005,-.2,g);VB(.065,.1,.36,M.wood,0,-.04,.2,g,.12);VB(.068,.11,.03,M.rubber,0,-.06,.38,g,.12);
    VB(.05,.05,.18,M.blued,0,.03,-.02,g);const bolt=VCY(.006,.06,M.steel,.04,.035,.02,g);bolt.rotation.z=1.2;VB(.016,.016,.016,M.steel,.065,.025,.02,g);
    VCZ(.026,.28,M.dark,0,.105,-.08,g,12);VCZ(.034,.06,M.dark,0,.105,-.24,g,12);VCZ(.031,.05,M.dark,0,.105,.07,g,12);VCZ(.028,.004,M.lens,0,.105,-.272,g,12);
    for(const z of [-.14,.0]){VB(.03,.05,.02,M.dark,0,.07,z,g)}VCY(.008,.03,M.dark,0,.14,-.08,g);
    VB(.015,.03,.06,M.dark,0,-.06,.03,g);VB(.05,.006,.08,M.dark,0,-.075,.03,g);for(let i=0;i<5;i++)VB(.068,.004,.04,M.grip,0,-.045,.1+i*.012,g,.4);
    rightHand(g,0,-.085,.11,.4);leftHand(g,-.035,-.06,-.28);muzzle=-.74;eject=[.04,.04,-.02];break}
  case 'fusil':{VB(.055,.08,.32,M.dark,0,0,-.08,g);VB(.06,.07,.28,M.poly,0,-.005,-.38,g);for(let i=0;i<7;i++){VB(.064,.012,.016,M.dark,0,.04,-.27-i*.035,g);VB(.012,.05,.016,M.dark,-.032,0,-.27-i*.035,g)}
    VCZ(.012,.18,M.blued,0,.0,-.6,g);VCZ(.018,.06,M.dark,0,0,-.71,g);VB(.01,.06,.01,M.dark,0,.05,-.5,g);VB(.04,.012,.02,M.dark,0,.025,-.5,g);
    VB(.03,.035,.14,M.dark,0,.06,-.06,g);VB(.012,.03,.01,M.dark,0,.09,.0,g);
    VB(.04,.14,.07,M.dark,0,-.1,-.18,g,.15);VB(.04,.1,.07,M.dark,0,-.2,-.2,g,.38);
    VB(.04,.12,.06,M.poly,0,-.09,.07,g,.3);for(let i=0;i<3;i++)VB(.042,.006,.05,M.rubber,0,-.07-i*.03,.075,g,.3);
    VB(.05,.07,.2,M.poly,0,-.02,.24,g);VB(.03,.03,.12,M.dark,0,.01,.12,g);VB(.055,.09,.03,M.rubber,0,-.03,.35,g);
    rightHand(g,0,-.09,.085,.3);leftHand(g,-.035,-.05,-.38);muzzle=-.75;eject=[.035,.02,-.06];break}
  case 'escopetac':{VB(.07,.09,.36,M.poly,0,.0,-.05,g);VCZ(.024,.38,M.blued,0,.02,-.42,g);VCZ(.03,.05,M.dark,0,.02,-.6,g);for(let i=0;i<4;i++)VCZ(.008,.04,M.dark,0,.02,-.55+i*.015,g);
    VB(.075,.012,.36,M.dark,0,.052,-.1,g);for(let i=0;i<9;i++)VB(.08,.008,.012,M.metal,0,.06,-.26+i*.035,g);VB(.03,.04,.02,M.dark,0,.08,.08,g);VB(.01,.035,.01,M.dark,0,.08,-.26,g);
    VB(.06,.14,.1,M.dark,0,-.11,-.12,g);VB(.062,.02,.11,M.metal,0,-.18,-.12,g);VB(.045,.12,.065,M.poly,0,-.1,.09,g,.3);
    VB(.06,.08,.22,M.poly,0,-.03,.24,g);VB(.065,.1,.03,M.rubber,0,-.04,.36,g);rightHand(g,0,-.1,.1,.3);leftHand(g,-.035,-.06,-.36);muzzle=-.64;eject=[.04,.03,-.04];break}
  case 'francotirador':{VB(.065,.085,.42,M.olive,0,0,-.1,g);VCZ(.02,.62,M.blued,0,.02,-.6,g);VB(.06,.04,.08,M.dark,0,.02,-.93,g);for(let i=0;i<3;i++)VB(.064,.012,.012,M.metal,0,.02,-.91-i*.02,g);
    VCZ(.036,.38,M.dark,0,.13,-.12,g,14);VCZ(.046,.09,M.dark,0,.13,-.34,g,14);VCZ(.04,.06,M.dark,0,.13,.1,g,14);VCZ(.042,.004,M.lens,0,.13,-.386,g,14);VCY(.012,.04,M.dark,0,.175,-.12,g);const tu=VCY(.012,.04,M.dark,.045,.13,-.12,g);tu.rotation.z=Math.PI/2;
    for(const z of [-.22,-.02])VB(.035,.07,.025,M.dark,0,.07,z,g);const bolt=VCY(.007,.07,M.steel,.05,.04,.06,g);bolt.rotation.z=1.3;VCZ(.016,.02,M.dark,.085,.025,.06,g);
    VB(.06,.14,.1,M.dark,0,-.11,-.04,g);VB(.045,.12,.065,M.poly,0,-.1,.12,g,.25);VB(.065,.11,.3,M.olive,0,-.03,.32,g);VB(.05,.03,.18,M.olive,0,.04,.32,g);VB(.07,.12,.03,M.rubber,0,-.04,.48,g);
    const bpL=VB(.012,.2,.012,M.metal,-.03,-.1,-.6,g,0,0,.3),bpR=VB(.012,.2,.012,M.metal,.03,-.1,-.6,g,0,0,-.3);
    rightHand(g,0,-.1,.13,.25);leftHand(g,-.04,-.07,-.38);muzzle=-.98;eject=[.045,.04,.0];break}
  case 'ametralladora':{VB(.09,.11,.42,M.dark,0,0,-.08,g);VB(.1,.07,.4,M.metal,0,.02,-.48,g);for(let i=0;i<8;i++){VCZ(.014,.004,M.dark,-.051,.02,-.33-i*.045,g,6)}
    VCZ(.022,.3,M.blued,0,.02,-.82,g);VCZ(.03,.07,M.dark,0,.02,-.98,g);VB(.14,.14,.2,M.olive,.1,-.08,-.12,g);VB(.04,.02,.12,M.brass,.04,.0,-.12,g);for(let i=0;i<6;i++)VB(.03,.012,.012,M.brass,.04,-.01-i*.006,-.07-i*.02,g);
    VB(.02,.05,.08,M.metal,0,.08,-.12,g);VB(.015,.18,.015,M.dark,0,-.12,-.7,g);VB(.015,.18,.015,M.dark,-.06,-.1,-.7,g,0,0,.3);VB(.015,.18,.015,M.dark,.06,-.1,-.7,g,0,0,-.3);
    VB(.05,.13,.07,M.poly,0,-.11,.08,g,.25);VB(.07,.1,.26,M.poly,0,-.03,.26,g);VB(.075,.11,.03,M.rubber,0,-.04,.4,g);VCY(.012,.08,M.dark,0,.1,-.3,g);
    rightHand(g,0,-.11,.1,.25);leftHand(g,-.05,-.04,-.4);muzzle=-1.0;eject=[-.02,-.07,-.1];break}
  case 'lanzagranadas':{VCZ(.045,.42,M.olive,0,.02,-.25,g,14);VCZ(.05,.03,M.dark,0,.02,-.46,g,14);VCZ(.035,.01,M.dark,0,.02,-.472,g,14);
    const drum=VCZ(.085,.16,M.dark,0,-.01,.0,g,12);for(let i=0;i<6;i++){const a=i/6*6.283;VCZ(.022,.17,M.metal,Math.cos(a)*.06,-.01+Math.sin(a)*.06,0,g,8)}
    VB(.04,.05,.14,M.dark,0,.09,-.05,g);VB(.008,.04,.008,M.glow,0,.13,-.1,g);VB(.05,.14,.07,M.poly,0,-.13,.12,g,.25);VB(.06,.08,.25,M.olive,0,-.04,.26,g);VB(.065,.1,.03,M.rubber,0,-.05,.39,g);
    VB(.04,.12,.05,M.poly,0,-.1,-.2,g);rightHand(g,0,-.13,.13,.25);leftHand(g,-.03,-.12,-.2);muzzle=-.5;break}
  case 'ballesta':{VB(.055,.06,.62,M.wood,0,0,-.16,g);VB(.06,.1,.24,M.wood,0,-.04,.24,g,.1);VB(.065,.11,.03,M.rubber,0,-.05,.37,g);
    const la=VB(.36,.03,.04,M.dark,-.18,.01,-.44,g,0,.35,0),lb=VB(.36,.03,.04,M.dark,.18,.01,-.44,g,0,-.35,0);VB(.07,.05,.06,M.metal,0,.01,-.46,g);
    VB(.004,.004,.42,M.string,-.17,.02,-.27,g,0,-.75,0);VB(.004,.004,.42,M.string,.17,.02,-.27,g,0,.75,0);
    VCZ(.006,.4,M.steel,0,.04,-.24,g,6);VB(.004,.03,.04,M.red,0,.05,-.04,g);VB(.004,.03,.04,M.red,.0,.04,-.04,g,0,0,1.57);VB(.01,.012,.03,M.steel,0,.04,-.45,g);
    VB(.05,.13,.07,M.grip,0,-.1,.06,g,.3);VB(.02,.025,.08,M.dark,0,-.045,.0,g);VB(.03,.03,.1,M.dark,0,.06,.06,g);rightHand(g,0,-.1,.07,.3);leftHand(g,-.035,-.045,-.28);muzzle=-.46;break}
  // melee: the blade or head points to -z
  case 'cuchillo':{VB(.012,.045,.2,M.steel,0,0,-.17,g);VB(.006,.012,.2,M.edge,0,-.026,-.17,g);VB(.012,.03,.04,M.steel,0,.01,-.28,g,.5);VB(.05,.02,.02,M.dark,0,0,-.065,g);
    VB(.03,.042,.11,M.grip,0,0,-.0,g);for(let i=0;i<3;i++)VCZ(.004,.032,M.steel,0,0,-.03+i*.035,g,6);rightHand(g,0,-.005,.0,0);break}
  case 'machete':{VB(.012,.07,.5,M.steel,0,0,-.33,g);VB(.006,.015,.5,M.edge,0,-.04,-.33,g);VB(.012,.05,.06,M.steel,0,-.01,-.6,g,.4);VB(.04,.012,.02,M.dark,0,0,-.075,g);
    VB(.032,.05,.15,M.grip,0,0,.0,g);VB(.034,.008,.15,M.dark,0,.02,.0,g);rightHand(g,0,-.005,.01,0);break}
  case 'hacha':{VB(.032,.032,.65,M.wood,0,0,-.2,g);VB(.018,.18,.12,M.metal,0,.04,-.5,g);VB(.02,.02,.12,M.edge,0,.13,-.5,g);VB(.03,.05,.05,M.metal,0,-.05,-.5,g);VB(.035,.035,.1,M.tape,0,0,.06,g);rightHand(g,0,-.005,.06,0);break}
  case 'bate':{const b=VCZ(.022,.7,M.wood,0,0,-.25,g,10);const tip=VCZ(.035,.35,M.wood,0,0,-.45,g,10);for(let i=0;i<5;i++){VCZ(.04,.012,M.rust,0,0,-.33-i*.06,g,8);VB(.006,.012,.006,M.steel,.03,.03,-.35-i*.06,g)}VCZ(.026,.14,M.tape,0,0,.04,g,8);rightHand(g,0,-.005,.05,0);break}
  case 'martillo':{VB(.028,.028,.36,M.wood,0,0,-.08,g);VB(.05,.12,.05,M.metal,0,.0,-.27,g);VB(.045,.045,.06,M.steel,0,-.07,-.27,g);VB(.012,.05,.03,M.metal,0,.08,-.27,g,.3);VB(.034,.034,.1,M.rubber,0,0,.05,g);rightHand(g,0,-.005,.05,0);break}
  case 'palanca':{VB(.026,.026,.62,M.red,0,0,-.22,g);VB(.026,.1,.026,M.red,0,.04,-.55,g,-.4);VB(.008,.03,.03,M.metal,0,.09,-.58,g);VB(.03,.03,.12,M.rubber,0,0,.04,g);rightHand(g,0,-.005,.05,0);break}
  case 'sarten':{VB(.026,.026,.24,M.dark,0,0,-.02,g);const p=VCY(.14,.04,M.dark,0,0,-.27,g,16);VCY(.12,.042,M.metal,0,.002,-.27,g,16);VB(.03,.03,.08,M.wood,0,0,.06,g);rightHand(g,0,-.005,.06,0);break}
  case 'lanza':{VCZ(.016,1.15,M.wood,0,0,-.4,g,8);VB(.012,.05,.2,M.steel,0,0,-1.06,g);VB(.004,.03,.2,M.edge,0,0,-1.06,g);for(let i=0;i<4;i++)VCZ(.02,.012,M.rope,0,0,-.94+i*.015,g,6);VCZ(.02,.14,M.tape,0,0,.02,g,8);rightHand(g,0,-.005,.03,0);break}
  case 'katana':{VB(.01,.035,.78,M.steel,0,0,-.5,g);VB(.004,.01,.78,M.edge,0,-.02,-.5,g);VB(.006,.012,.4,M.steel,0,.004,-.5,g);const ts=VCZ(.045,.012,M.gold,0,0,-.1,g,10);VB(.022,.04,.03,M.gold,0,0,-.115,g);
    VB(.028,.036,.24,M.dark,0,0,.03,g);for(let i=0;i<7;i++){VB(.031,.039,.012,M.tape,0,0,-.07+i*.032,g,0,0,.785)}VCZ(.02,.02,M.gold,0,0,.155,g,8);rightHand(g,0,-.005,-.04,0);break}
  case 'mazo':{VCZ(.02,.8,M.wood,0,0,-.28,g,8);VB(.14,.14,.26,M.metal,0,0,-.7,g);VB(.145,.145,.03,M.steel,0,0,-.58,g);VB(.145,.145,.03,M.steel,0,0,-.82,g);VCZ(.026,.16,M.rubber,0,0,.06,g,8);rightHand(g,0,-.005,.05,0);break}
  case 'build':{VCZ(.02,.26,M.wood,0,0,-.08,g,8);VB(.06,.1,.04,M.metal,0,.0,-.22,g);rightHand(g,0,-.005,.03,0);break}
  default:weaponShape(k,g);rightHand(g,0,-.06,.18,0)}
  g.userData.muzzle=-muzzle*.75+.02;g.userData.eject=eject;return g}
function rebuildViewmodels(){for(const k of Object.keys(vm)){const g=vm[k];const vis=g.visible;while(g.children.length)g.remove(g.children[0]);weaponHD(k,g);g.visible=vis}}
// lighting of the weapon follows the time of day and the flashlight
const wHemi=new T3.HemisphereLight(0xdfe8ff,0x3a3428,.35);wScene.add(wHemi);

// ---------- Shells and muzzle smoke in the weapon layer ----------
const SHELL_GEO=new T3.CylinderGeometry(.006,.006,.025,6);let shellList=[];
function ejectShell(){const g=vm[S.cur];if(!g||!g.userData.eject)return;const e=g.userData.eject,M=weaponMats();const m=new T3.Mesh(SHELL_GEO,S.cur==='escopeta'||S.cur==='escopetac'?M.red:M.brass);
  const p=new T3.Vector3(e[0],e[1],e[2]).multiplyScalar(.75).add(vmRoot.position);m.position.copy(p);m.rotation.set(R()*3,R()*3,R()*3);wScene.add(m);shellList.push({m,vx:1.1+R()*.5,vy:1.3+R()*.5,vz:.3+R()*.3,life:.7})}
const SMOKE_TEX=canvasTex((x,s)=>{const g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.5,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,s,s)},64);
let smokeList=[];
function muzzleSmoke(){const g=vm[S.cur];if(!g)return;const mt=new T3.SpriteMaterial({map:SMOKE_TEX,color:0xbfbcb4,transparent:true,opacity:.35,depthWrite:false});const s=new T3.Sprite(mt);
  s.position.set(vmRoot.position.x,vmRoot.position.y+.03,vmRoot.position.z-g.userData.muzzle);s.scale.setScalar(.06);wScene.add(s);smokeList.push({s,life:.9})}
function updateShells(dt){for(let i=shellList.length-1;i>=0;i--){const s=shellList[i];s.life-=dt;s.vy-=6*dt;s.m.position.x+=s.vx*dt;s.m.position.y+=s.vy*dt;s.m.position.z+=s.vz*dt;s.m.rotation.x+=dt*14;s.m.rotation.z+=dt*9;if(s.life<=0){wScene.remove(s.m);shellList.splice(i,1)}}
  for(let i=smokeList.length-1;i>=0;i--){const s=smokeList[i];s.life-=dt;s.s.position.y+=dt*.08;s.s.position.z+=dt*.05;s.s.scale.setScalar(.06+(.9-s.life)*.3);s.s.material.opacity=Math.max(0,s.life/.9*.35);if(s.life<=0){wScene.remove(s.s);s.s.material.dispose();smokeList.splice(i,1)}}}
const _shoot=shoot;shoot=function(){const k=S.cur,before=S.mags[k];const r=_shoot.apply(this,arguments);if(k&&S.mags[k]<before){try{ejectShell();muzzleSmoke()}catch(e){}}return r};

// ---------- Sky dome, cloudSky and skyStars ----------
let skyDome=null,cloudSky=null,skyStars=null;
function buildSkyDome(){if(skyDome)return;
  const sg=new T3.SphereGeometry(450,24,14);skyDome=new T3.Mesh(sg,new T3.ShaderMaterial({side:T3.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new T3.Color(0x5a7088)},bot:{value:new T3.Color(0x9fb0aa)},sunDir:{value:new T3.Vector3(0,1,0)},sunCol:{value:new T3.Color(0xfff0d0)},sunAmt:{value:1}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 top,bot,sunCol,sunDir;uniform float sunAmt;varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(bot,top,pow(h,.55));float d=max(dot(vP,normalize(sunDir)),0.);c+=sunCol*(pow(d,900.)*1.4+pow(d,12.)*.18)*sunAmt;gl_FragColor=vec4(c,1.);}'}));
  skyDome.renderOrder=-10;skyDome.frustumCulled=false;scene.add(skyDome);
  const ct=canvasTex((x,s)=>{x.clearRect(0,0,s,s);for(let i=0;i<70;i++){const r=20+R()*60,cx=R()*s,cy=R()*s;for(const ox of [-s,0,s])for(const oy of [-s,0,s]){const g=x.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx+ox-r,cy+oy-r,r*2,r*2)}}},512);
  cloudSky=new T3.Mesh(new T3.PlaneGeometry(1800,1800).rotateX(Math.PI/2),new T3.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:T3.DoubleSide,uniforms:{map:{value:ct},off:{value:new T3.Vector2()},col:{value:new T3.Color(0xffffff)},amt:{value:.6}},
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform sampler2D map;uniform vec2 off;uniform vec3 col;uniform float amt;varying vec2 vU;void main(){vec4 t=texture2D(map,vU*3.+off);float t2=texture2D(map,vU*1.7-off*.6+.3).a;float a=clamp(t.a*.8+t2*.6,0.,1.)*amt*(1.-smoothstep(.22,.5,length(vU-.5)));gl_FragColor=vec4(col*(.85+.15*t.a),a);}'}));
  cloudSky.renderOrder=-9;cloudSky.frustumCulled=false;scene.add(cloudSky);
  const n=1400,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const u=R()*2-1,a=R()*6.283,r=Math.sqrt(1-u*u);const y=Math.abs(u);pos[i*3]=Math.cos(a)*r*420;pos[i*3+1]=y*420+10;pos[i*3+2]=Math.sin(a)*r*420}
  const sg2=new T3.BufferGeometry();sg2.setAttribute('position',new T3.BufferAttribute(pos,3));skyStars=new T3.Points(sg2,new T3.PointsMaterial({color:0xdfe6ff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));skyStars.renderOrder=-9;skyStars.frustumCulled=false;scene.add(skyStars)}
const _applyLighting=applyLighting;applyLighting=function(){_applyLighting();try{buildSkyDome();const dk=darkness(),wf=weatherFx(),u=skyDome.material.uniforms;
  u.bot.value.copy(scene.fog.color);u.top.value.copy(scene.fog.color).lerp(new T3.Color(dk>.5?0x05080d:0x3d5a7a),.55*(1-wf.dim)).multiplyScalar(1-.35*dk);
  u.sunDir.value.copy(sun.position).sub(sun.target.position).normalize();u.sunCol.value.copy(sun.color);u.sunAmt.value=(1-dk)*(1-wf.dim*.9);
  const cp=camera.position;skyDome.position.copy(cp);skyStars.position.copy(cp);cloudSky.position.set(cp.x,cp.y+170,cp.z);
  const cu=cloudSky.material.uniforms;cu.off.value.set(time*.0016+cp.x/5400,time*.0007+cp.z/5400);cu.amt.value=.45+wf.dim*.55;cu.col.value.copy(scene.fog.color).lerp(new T3.Color(0xffffff),.35*(1-dk)).multiplyScalar(1-.6*dk);
  skyStars.material.opacity=Math.max(0,dk-.4)*1.6*(1-wf.dim);if(typeof starPts!=="undefined"&&starPts)starPts.visible=false;
  const fl=flash.intensity>0;wHemi.intensity=.12+.5*(1-dk)*(1-wf.dim*.4)+(fl?.25:0);wAmb.intensity=.18+.4*(1-dk)+(fl?.2:0);wDir.intensity=.15+.5*(1-dk);wDir.color.copy(sun.color);
  updateGrass()}catch(e){console.error(e)}};

// ---------- Grass that sways, around the player ----------
let grassInst=null,flowerInst=null,grassAt={x:1e9,z:1e9},grassU={value:0};
const GRASS_TEX=canvasTex((x,s)=>{x.clearRect(0,0,s,s);for(let i=0;i<46;i++){const bx0=s*.08+R()*s*.84,h=s*(.45+R()*.55),lean=(R()-.5)*s*.35,w=2+R()*3;const v=150+R()*105|0;x.strokeStyle=`rgb(${v},${v},${v})`;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(bx0,s);x.quadraticCurveTo(bx0+lean*.3,s-h*.6,bx0+lean,s-h);x.stroke()}},128);
GRASS_TEX.wrapS=GRASS_TEX.wrapT=T3.ClampToEdgeWrapping;
function grassGeo(){const g=new T3.BufferGeometry();const P=[],U=[],N=[],I=[];let v=0;
  for(let k=0;k<3;k++){const a=k/3*Math.PI,c=Math.cos(a)*.45,s=Math.sin(a)*.45;[[-c,0,-s,0,0],[c,0,s,1,0],[c,.55,s,1,1],[-c,.55,-s,0,1]].forEach(q=>{P.push(q[0],q[1],q[2]);U.push(q[3],q[4]);N.push(0,1,0)});I.push(v,v+1,v+2,v,v+2,v+3,v,v+2,v+1,v,v+3,v+2);v+=4}
  g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('uv',new T3.Float32BufferAttribute(U,2));g.setAttribute('normal',new T3.Float32BufferAttribute(N,3));g.setIndex(I);return g}
function swayMat(m){m.onBeforeCompile=sh=>{sh.uniforms.uTime=grassU;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*.31+instanceMatrix[3].z*.23;transformed.x+=sin(uTime*1.8+ph)*.09*uv.y;transformed.z+=cos(uTime*1.3+ph)*.06*uv.y;\n#endif')};return m}
const GRASS_N=7000,FLOWER_N=900,GCELL=1.25,GRAD=40;
function buildGrass(){if(grassInst)return;
  grassInst=new T3.InstancedMesh(grassGeo(),swayMat(new T3.MeshLambertMaterial({map:GRASS_TEX,alphaTest:.45,color:0xffffff})),GRASS_N);grassInst.instanceMatrix.setUsage(T3.DynamicDrawUsage);grassInst.frustumCulled=false;grassInst.receiveShadow=true;scene.add(grassInst);
  grassInst.setColorAt(0,new T3.Color());
  const fg=new T3.BoxGeometry(.07,.07,.07);fg.translate(0,.32,0);flowerInst=new T3.InstancedMesh(fg,new T3.MeshLambertMaterial({color:0xffffff}),FLOWER_N);flowerInst.frustumCulled=false;scene.add(flowerInst);flowerInst.setColorAt(0,new T3.Color())}
const vhash2=(x,z)=>{let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const GSEASON={primavera:[.4,.5,.28],verano:[.56,.54,.32],otono:[.54,.44,.26],invierno:[.46,.48,.38]};
const FCOL=[0xe8d24a,0xf2f0e8,0x9a6ad0,0xd8584a];
function grassBlocked(x,z){if(Math.abs(x-roadX(z))<5||townW(x,z)>.35||Math.max(Math.abs(x),Math.abs(z))<PAL+2)return true;const y=terrainY(x,z);if(y<WATER_Y+.4||y>16)return true;
  for(const r of ruins)if(x>r.x0-1&&x<r.x1+1&&z>r.z0-1&&z<r.z1+1)return true;return false}
function updateGrass(){if(!S||!terrainMesh)return;buildGrass();grassU.value=time;
  const snowy=(S.snow||0)>.5;grassInst.visible=!snowy;flowerInst.visible=!snowy&&(season()==='primavera'||season()==='verano');
  const px=P.x,pz=P.z;if(Math.hypot(px-grassAt.x,pz-grassAt.z)<6)return;grassAt={x:px,z:pz};
  const m=new T3.Matrix4(),q=new T3.Quaternion(),sc=new T3.Vector3(),ps=new T3.Vector3(),col=new T3.Color(),up=new T3.Vector3(0,1,0);const base=GSEASON[season()];
  let n=0,f=0;const c0x=Math.floor((px-GRAD)/GCELL),c1x=Math.floor((px+GRAD)/GCELL),c0z=Math.floor((pz-GRAD)/GCELL),c1z=Math.floor((pz+GRAD)/GCELL);
  for(let cz=c0z;cz<=c1z&&n<GRASS_N;cz++)for(let cx=c0x;cx<=c1x&&n<GRASS_N;cx++){const h=vhash2(cx,cz);const x=(cx+vhash2(cx+7,cz))*GCELL,z=(cz+vhash2(cx,cz+7))*GCELL;
    const d=Math.hypot(x-px,z-pz);if(d>GRAD)continue;const mo=moist(x,z);if(h>(.35+mo*.9)*(d<15?1:1-(d-15)/40))continue;if(grassBlocked(x,z))continue;
    const s=.7+vhash2(cx+3,cz+5)*.9;ps.set(x,terrainY(x,z)-.03,z);q.setFromAxisAngle(up,h*6.283);sc.set(s,s*(.45+mo*.4),s);m.compose(ps,q,sc);grassInst.setMatrixAt(n,m);
    const t=.75+vhash2(cx+11,cz)*.4;col.setRGB(base[0]*t*(1.1-mo*.2),base[1]*t,base[2]*t);grassInst.setColorAt(n,col);n++;
    if(f<FLOWER_N&&vhash2(cx+19,cz+23)<.06){const fx=x+.25,fz=z-.2;ps.set(fx,terrainY(fx,fz),fz);sc.setScalar(.8+h);m.compose(ps,q,sc);flowerInst.setMatrixAt(f,m);col.setHex(FCOL[(h*97|0)%4]);flowerInst.setColorAt(f,col);f++}}
  grassInst.count=n;flowerInst.count=f;grassInst.instanceMatrix.needsUpdate=true;if(grassInst.instanceColor)grassInst.instanceColor.needsUpdate=true;flowerInst.instanceMatrix.needsUpdate=true;if(flowerInst.instanceColor)flowerInst.instanceColor.needsUpdate=true}

// ---------- World details: rockInst, litter in town and along the road ----------
let rockInst=null;
function buildDetails(rng){
  if(rockInst){scene.remove(rockInst);rockInst.geometry.dispose()}
  const N=520;rockInst=new T3.InstancedMesh(new T3.DodecahedronGeometry(1,0),new T3.MeshLambertMaterial({color:0x8a877e,map:TEX.concrete||null}),N);rockInst.castShadow=true;rockInst.receiveShadow=true;
  const m=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler(),sc=new T3.Vector3(),ps=new T3.Vector3(),col=new T3.Color();let n=0;
  for(let a=0;a<4000&&n<N;a++){const x=(rng()-.5)*SIZE*.94,z=(rng()-.5)*SIZE*.94;if(grassBlocked(x,z)||insideBuilding(x,z))continue;const y=terrainY(x,z);const s=.25+Math.pow(rng(),3)*1.6;
    ps.set(x,y+s*.15,z);e.set(rng()*3,rng()*3,rng()*3);q.setFromEuler(e);sc.set(s*(.8+rng()*.6),s*(.5+rng()*.4),s*(.8+rng()*.6));m.compose(ps,q,sc);rockInst.setMatrixAt(n,m);const t=.75+rng()*.35;col.setRGB(t,t*.98,t*.93);rockInst.setColorAt(n,col);n++}
  rockInst.count=n;scene.add(rockInst);
  // litter: tires, barrels, crates, bags, cones and papers in town and along the road
  const M={tire:mat('#1c1c1c'),barrel:mat('#6a3a24'),barrel2:mat('#3a5a6a'),crate:mat('#7a5a34'),bag:mat('#22252a'),cone:mat('#c8602a'),paper:mat('#c8c4b4'),pole:mat('#4a4038')};
  const tireG=new T3.TorusGeometry(.32,.13,6,10),bagG=new T3.DodecahedronGeometry(.3,0);
  const put=(x,z)=>{const y=terrainY(x,z),k=rng();
    if(k<.2){const t=new T3.Mesh(tireG,M.tire);t.position.set(x,y+.12,z);t.rotation.set(Math.PI/2+(rng()-.5)*.3,0,rng()*3);t.castShadow=true;world.add(t)}
    else if(k<.38){const b=bx(.55,.85,.55,rng()<.6?M.barrel:M.barrel2,x,y+.42,z,world,CYL);if(rng()<.3){b.rotation.z=Math.PI/2;b.position.y=y+.28}}
    else if(k<.55){const c=bx(.7,.55,.7,M.crate,x,y+.27,z,world);c.rotation.y=rng()*3;if(rng()<.4)bx(.6,.45,.6,M.crate,x+(rng()-.5)*.2,y+.78,z+(rng()-.5)*.2,world).rotation.y=rng()*3}
    else if(k<.72){for(let i=0;i<1+rng()*3;i++){const b=bx(1,.8,1.1,M.bag,x+(rng()-.5)*.8,y+.2,z+(rng()-.5)*.8,world,bagG);b.rotation.y=rng()*3}}
    else if(k<.8){const c=bx(.36,.7,.36,M.cone,x,y+.35,z,world,CONE);if(rng()<.4){c.rotation.z=1.5;c.position.y=y+.18}}
    else if(k<.92){for(let i=0;i<4;i++){const p=bx(.3,.01,.22,M.paper,x+(rng()-.5)*2,y+.03,z+(rng()-.5)*2,world);p.rotation.y=rng()*3;p.castShadow=false}}
    else{const p=bx(.16,3.4,.16,M.pole,x,y+1.4,z,world,CYL);p.rotation.z=.5+rng()*.6;p.rotation.y=rng()*3}};
  for(let a=0,c=0;a<1600&&c<230;a++){const z=TOWN_Z+(rng()-.5)*170,x=roadX(z)+(rng()-.5)*120;if(insideBuilding(x,z)||Math.abs(x-roadX(z))<3.2)continue;if(townW(x,z)<.3)continue;put(x,z);c++}
  for(let a=0,c=0;a<800&&c<90;a++){const z=(rng()-.5)*SIZE*.9,x=roadX(z)+(rng()<.5?-1:1)*(4.6+rng()*3);if(Math.abs(z-TOWN_Z)<90||Math.abs(z)<PAL+10)continue;if(terrainY(x,z)<WATER_Y+.5)continue;put(x,z);c++}
  for(const r of ruins)for(let i=0;i<3;i++){const x=r.cx+(rng()-.5)*(r.w+8),z=r.cz+(rng()-.5)*(r.d+8);if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)continue;put(x,z)}}
const _buildVehicles=buildVehicles;buildVehicles=function(rng){_buildVehicles(rng);try{buildTextures();buildDetails(mulberry32((worldSeed()^0x5eed)>>>0))}catch(e){console.error('details',e)}};

// ---------- Enemy detail: mouths, teeth, torn clothes, wounds, claws, spines ----------
function vcolOf(m){return m&&m.material&&m.material.color?'#'+m.material.color.getHexString():'#888'}
function detailHumanoid(g){const u=g.userData,b=u.root;const meshes=b.children.filter(o=>o.isMesh);const torso=meshes[0],head=meshes[2];if(!torso||!head)return;
  const cloth=vcolOf(torso),skin=vcolOf(head),pants=vcolOf(meshes[1]);const dark=new T3.Color(skin).multiplyScalar(.55),blood='#4a120e',bone='#d8d0b4';
  const hz=head.position.z,hy=head.position.y;const nd=(o)=>{o.castShadow=false;return o};
  nd(bx(.16,.06,.03,'#1a0c0a',0,hy-.09,hz+.155,b));for(let i=0;i<5;i++)nd(bx(.022,.03,.012,bone,-.05+i*.025,hy-.075,hz+.168,b));
  nd(bx(.1,.035,.02,'#'+dark.getHexString(),-.07,hy+.06,hz+.155,b));nd(bx(.1,.035,.02,'#'+dark.getHexString(),.07,hy+.06,hz+.155,b));
  nd(bx(.05,.06,.04,skin,0,hy-.01,hz+.17,b));nd(bx(.04,.09,.07,skin,-.16,hy,hz,b));nd(bx(.04,.09,.07,skin,.16,hy,hz,b));
  if(R()<.75){const hair=['#2a2420','#4a3a2a','#6a6a62','#1a1a1a'][R()*4|0];nd(bx(.32,.08,.3,hair,0,hy+.17,hz-.02,b));if(R()<.5)nd(bx(.3,.18,.06,hair,0,hy+.06,hz-.16,b))}
  else{nd(bx(.1,.02,.08,blood,.06,hy+.16,hz,b));nd(bx(.08,.02,.06,bone,-.05,hy+.161,hz-.03,b))}
  for(let i=0;i<2+R()*3;i++){const w=.08+R()*.14,h=.06+R()*.16;nd(bx(w,h,.02,R()<.5?skin:'#'+new T3.Color(cloth).multiplyScalar(.6).getHexString(),(R()-.5)*.36,torso.position.y+(R()-.5)*.45,.145,b))}
  if(R()<.6)for(let i=0;i<3;i++)nd(bx(.16,.025,.02,bone,.04,torso.position.y+.08-i*.07,.15,b));
  for(let i=0;i<2+R()*3;i++){const s=.05+R()*.1;nd(bx(s,s*1.6,.02,blood,(R()-.5)*.4,torso.position.y+(R()-.3)*.5,.148,b))}
  nd(bx(.53,.05,.31,'#2a2218',0,.96,0,b));nd(bx(.06,.04,.02,'#8a8270',0,.96,.16,b));
  for(let i=0;i<3;i++){const t=nd(bx(.06,.12+R()*.1,.02,cloth,(R()-.5)*.44,torso.position.y-.36,.13+(R()-.5)*.1,b));t.rotation.z=(R()-.5)*.6}
  u.arms.forEach((a,i)=>{nd(bx(.12,.1,.12,skin,0,-.69,.0,a));for(let k=0;k<3;k++)nd(bx(.025,.07,.025,skin,-.035+k*.035,-.77,.03,a));nd(bx(.165,.2,.17,cloth,0,-.08,0,a));if(R()<.5)nd(bx(.15,.03,.16,blood,0,-.4,0,a))});
  u.legs.forEach(l=>{nd(bx(.21,.1,.3,R()<.3?skin:'#1e1a16',0,-.79,.04,l));if(R()<.5)nd(bx(.2,.12,.02,skin,0,-.45,.11,l))})}
function detailRaptor(g){const u=g.userData,h=u.head,b=u.root;const bone='#e8e0c8',dark='#1a1410';const nd=o=>{o.castShadow=false;return o};
  for(let i=0;i<6;i++){nd(bx(.025,.05,.025,bone,-.11,-.1,.15+i*.06,h));nd(bx(.025,.05,.025,bone,.11,-.1,.15+i*.06,h))}
  nd(bx(.04,.03,.02,dark,-.07,.1,.41,h));nd(bx(.04,.03,.02,dark,.07,.1,.41,h));nd(bx(.08,.05,.08,dark,-.15,.06,.2,h));nd(bx(.08,.05,.08,dark,.15,.06,.2,h));
  for(let i=0;i<7;i++){const q=nd(bx(.03,.14+R()*.06,.03,'#3a2e20',0,1.24+(i<3?.1:0),.75-i*.22,b));q.rotation.x=-.5}
  for(let i=0;i<5;i++){nd(bx(.06,.02,.2,'#2a2214',(i%2?-.24:.24),.95+(R()-.5)*.2,-.4+i*.2,b))}
  u.legs.forEach(l=>{const c=nd(bx(.035,.14,.035,bone,0,-.79,.36,l));c.rotation.x=-.9;for(let k=-1;k<=1;k++)nd(bx(.025,.03,.08,bone,k*.05,-.84,.36,l))});
  [-.2,.2].forEach(x=>{for(let k=0;k<3;k++)nd(bx(.02,.06,.02,bone,x+(k-1)*.025,.79,.6,b))})}
function detailQuad(g){const u=g.userData,b=u.root,h=u.head;const bone='#e8dcc0';const nd=o=>{o.castShadow=false;return o};const sz=b.children[0]?b.children[0].scale.x:1.5;
  u.legs.forEach(l=>{const leg=l.children[0];const ly=leg?leg.position.y-leg.scale.y/2:-1;for(let k=-1;k<=1;k++)nd(bx(.1,.08,.12,bone,k*.13,ly+.04,.2,l))});
  const hb=h&&h.children.find(o=>o.isMesh);if(hb){const fz=hb.position.z+hb.scale.z/2+.01,w=hb.scale.x/2;nd(bx(w*.25,.08,.04,'#1a1410',-w*.55,hb.position.y+.1,fz,h));nd(bx(w*.25,.08,.04,'#1a1410',w*.55,hb.position.y+.1,fz,h));nd(bx(.06,.06,.03,'#0a0806',-w*.2,hb.position.y-hb.scale.y*.3,fz,h));nd(bx(.06,.06,.03,'#0a0806',w*.2,hb.position.y-hb.scale.y*.3,fz,h))}
  const bd=b.children[0];if(bd){const top=bd.position.y+bd.scale.y/2,len=bd.scale.z;for(let i=0;i<8;i++){nd(bx(sz*.5,.04,.06,'#3e3428',0,top+.01,-len/2+.2+i*(len-.4)/7,b))}}}
function detailRex(g){const u=g.userData,b=u.root,h=u.head;const bone='#e8e0c8';const nd=o=>{o.castShadow=false;return o};
  for(let i=0;i<9;i++){const s=nd(bx(.2,.5+R()*.3,.5,'#2a3226',0,4.25,1.4-i*.55,b,CONE));s.rotation.x=-.3}
  if(u.tail)for(let i=0;i<4;i++)nd(bx(.14,.35,.35,'#2a3226',0,.55,-.4-i*.55,u.tail,CONE));
  for(let i=0;i<4;i++){nd(bx(.3,.06,.06,'#6a2a20',(R()-.5)*1.4,3.2+(R()-.5)*1.2,.9+R()*.6,b))}
  if(h){nd(bx(.12,.08,.08,'#0a0806',-.3,.25,1.6,h));nd(bx(.12,.08,.08,'#0a0806',.3,.25,1.6,h));nd(bx(.3,.12,.1,'#1a1410',-.6,.38,.9,h));nd(bx(.3,.12,.1,'#1a1410',.6,.38,.9,h))}
  u.legs.forEach(l=>{for(let k=-1;k<=1;k++){const c=nd(bx(.1,.12,.35,bone,k*.2,-2.55,.95,l,CONE));c.rotation.x=Math.PI/2}})}
const _baseMesh=baseMesh;baseMesh=function(type){const m=_baseMesh(type);try{const t=m.userData.type;
  if(t==='h')detailHumanoid(m);else if(t==='r')detailRaptor(m);else if(t==='c')detailQuad(m);else if(t==='x')detailRex(m)}catch(e){console.error('detail',e)}return m};

// ---------- Hook into frames ----------
const _update5=update;update=function(dt){_update5(dt);try{updateShells(dt)}catch(e){}};
(function boot5(){try{rebuildViewmodels()}catch(e){console.error('viewmodels',e)}})();
// update the muzzle flash position to each weapon's real barrel length
const _updateCamera=updateCamera;updateCamera=function(dt){_updateCamera(dt);const g=S&&vm[S.cur];if(g&&g.userData.muzzle!=null&&vmFlash){vmFlash.position.z=vmRoot.position.z-g.userData.muzzle;vmFlash.scale.setScalar(['pistola','revolver'].includes(S.cur)?.7:1.2)}};

// ---------- One draw call per body part: bake plain colors into the vertices ----------
const VC_MAT=new T3.MeshLambertMaterial({vertexColors:true});
const _mergeSiblings=mergeSiblings;
mergeSiblings=function(root,protect){
  const parents=[];root.traverse(o=>parents.push(o));
  for(const o of parents){const list=o.children.filter(c=>c.isMesh&&!c.isInstancedMesh&&!c.children.length&&!protect.has(c)&&c.visible&&!Array.isArray(c.material)&&c.material.isMeshLambertMaterial&&!c.material.map&&!c.material.transparent&&!c.material.vertexColors&&!(c.material.emissive&&c.material.emissive.getHex())&&c.geometry.attributes.normal);
    if(list.length<2)continue;let vc=0,ic=0;for(const c of list){const g=c.geometry;vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count}
    const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),col=new Float32Array(vc*3),idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic);const v=new T3.Vector3(),n=new T3.Vector3(),nm=new T3.Matrix3();let vo=0,io=0,cast=false;
    for(const c of list){c.updateMatrix();nm.getNormalMatrix(c.matrix);const g=c.geometry,P=g.attributes.position,N=g.attributes.normal,cc=c.material.color;cast=cast||c.castShadow;
      for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(c.matrix);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();const k=vo+i;pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;nor[k*3]=n.x;nor[k*3+1]=n.y;nor[k*3+2]=n.z;col[k*3]=cc.r;col[k*3+1]=cc.g;col[k*3+2]=cc.b}
      if(g.index)for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo;else for(let i=0;i<P.count;i++)idx[io++]=vo+i;vo+=P.count;o.remove(c)}
    const bg=new T3.BufferGeometry();bg.setAttribute('position',new T3.BufferAttribute(pos,3));bg.setAttribute('normal',new T3.BufferAttribute(nor,3));bg.setAttribute('color',new T3.BufferAttribute(col,3));bg.setIndex(new T3.BufferAttribute(idx,1));bg.computeBoundingSphere();
    const mm=new T3.Mesh(bg,VC_MAT);mm.castShadow=cast;mm.receiveShadow=true;o.add(mm)}
  _mergeSiblings(root,protect)};
// the list of meshes used for the hit flash is rebuilt after merging, so it must not block it
protectSet=function(root,extra){const s=new Set(extra||[]);const add=v=>{if(!v)return;if(Array.isArray(v))v.forEach(add);else if(v.isObject3D)s.add(v)};for(const [k,v] of Object.entries(root.userData||{}))if(k!=='meshes')add(v);return s};
