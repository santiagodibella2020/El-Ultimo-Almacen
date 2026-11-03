'use strict';
// ================= v0.4: FIXED WORLD, TEXTURES, STATIC BATCHING, SOUND =================
const worldSeed=()=>S&&S.wseed!=null?S.wseed:(S?S.seed:WORLD_SEED);

// ---------- Procedural textures (drawn once on canvases, no image files) ----------
function canvasTex(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');draw(x,size);const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
function speckle(x,s,n,lo,hi,sz=1){for(let i=0;i<n;i++){const v=lo+R()*(hi-lo)|0;x.fillStyle=`rgb(${v},${v},${v})`;const w=sz*(.5+R());x.fillRect(R()*s,R()*s,w,w)}}
function blotch(x,s,n,col,rmin,rmax){for(let i=0;i<n;i++){const r=rmin+R()*(rmax-rmin),cx=R()*s,cy=R()*s;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;
  for(const ox of [-s,0,s])for(const oy of [-s,0,s])x.fillRect(cx+ox-r,cy+oy-r,r*2,r*2)}}
const TEX={};
function buildTextures(){
  if(TEX.grass)return;
  TEX.grass=canvasTex((x,s)=>{x.fillStyle='#e2e2e2';x.fillRect(0,0,s,s);blotch(x,s,26,'rgba(120,120,120,.18)',10,40);blotch(x,s,18,'rgba(255,255,255,.14)',8,30);
    for(let i=0;i<2600;i++){const v=150+R()*105|0;x.strokeStyle=`rgba(${v},${v},${v},.55)`;x.lineWidth=1;const px=R()*s,py=R()*s;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*3,py-2-R()*5);x.stroke()}speckle(x,s,500,90,140)});
  TEX.concrete=canvasTex((x,s)=>{x.fillStyle='#e6e6e6';x.fillRect(0,0,s,s);blotch(x,s,30,'rgba(90,90,90,.16)',8,46);speckle(x,s,3000,170,255);speckle(x,s,700,100,160);
    for(let i=0;i<14;i++){x.fillStyle='rgba(70,60,50,.12)';const px=R()*s;x.fillRect(px,R()*s*.5,1+R()*3,40+R()*120)}
    x.strokeStyle='rgba(60,60,60,.35)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();let px=R()*s,py=R()*s;x.moveTo(px,py);for(let k=0;k<6;k++){px+=(R()-.5)*30;py+=R()*20;x.lineTo(px,py)}x.stroke()}});
  TEX.wood=canvasTex((x,s)=>{const ph=s/6;for(let p=0;p<6;p++){const v=205+R()*40|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(0,p*ph,s,ph);
      for(let k=0;k<26;k++){const gv=150+R()*60|0;x.strokeStyle=`rgba(${gv},${gv},${gv},.5)`;x.lineWidth=.6+R();const y=p*ph+R()*ph;x.beginPath();x.moveTo(0,y);for(let xx=0;xx<=s;xx+=16)x.lineTo(xx,y+Math.sin(xx*.05+k)*1.6);x.stroke()}
      x.fillStyle='rgba(40,30,20,.55)';x.fillRect(0,p*ph,s,1.6);const off=R()*s;x.fillRect(off,p*ph,1.6,ph);
      for(let k=0;k<2;k++){x.fillStyle='rgba(60,45,30,.45)';x.beginPath();x.ellipse(R()*s,p*ph+ph/2,3+R()*4,2+R()*2,0,0,6.3);x.fill()}}
    blotch(x,s,10,'rgba(40,40,40,.15)',10,40)});
  TEX.brick=canvasTex((x,s)=>{x.fillStyle='#b8b0a6';x.fillRect(0,0,s,s);const bh=s/12,bw=s/4;for(let r=0;r<12;r++)for(let c=-1;c<5;c++){const v=200+R()*55|0;x.fillStyle=`rgb(${v},${v*.97|0},${v*.95|0})`;x.fillRect(c*bw+(r%2?bw/2:0)+1.5,r*bh+1.5,bw-3,bh-3)}speckle(x,s,1500,120,200);blotch(x,s,12,'rgba(50,50,50,.18)',10,40)});
  TEX.metal=canvasTex((x,s)=>{x.fillStyle='#d8d8d8';x.fillRect(0,0,s,s);for(let i=0;i<400;i++){const v=170+R()*80|0;x.fillStyle=`rgba(${v},${v},${v},.5)`;x.fillRect(0,R()*s,s,1)}
    blotch(x,s,16,'rgba(150,80,30,.28)',4,26);blotch(x,s,8,'rgba(60,40,20,.25)',6,18);x.fillStyle='rgba(60,60,60,.5)';for(let i=0;i<4;i++)x.fillRect(0,i*s/4,s,1.5)});
  TEX.leaf=canvasTex((x,s)=>{x.fillStyle='#d0d0d0';x.fillRect(0,0,s,s);for(let i=0;i<900;i++){const v=140+R()*115|0;x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();x.ellipse(R()*s,R()*s,2+R()*4,1+R()*2,R()*3,0,6.3);x.fill()}},128);
}
function texKind(m){const hsl={};m.color.getHSL(hsl);const {h,s,l}=hsl;
  if(s<.1)return 'concrete';if(h>.02&&h<.14&&l<.5)return s>.25?'wood':'concrete';if((h<.03||h>.96)&&s>.3&&l<.55)return 'brick';if(h>.5&&h<.7&&s<.25)return 'metal';if(h>.18&&h<.45)return 'leaf';return 'concrete'}
const TMATS=new Map();
function texturedMat(m){if(TMATS.has(m))return TMATS.get(m);let out=m;
  if(m.isMeshLambertMaterial&&!m.map&&!m.transparent&&!(m.emissive&&m.emissive.getHex())&&!m.vertexColors){out=m.clone();out.map=TEX[texKind(m)];out.color.multiplyScalar(1.08)}
  TMATS.set(m,out);return out}

// ---------- Static batching: thousands of world boxes become a few dozen meshes ----------
let batched=[];
function mergeStatic(){
  buildTextures();batched=[];world.updateMatrixWorld(true);
  const dyn=new Set(),addD=o=>{if(o)dyn.add(o)};
  conts.forEach(c=>addD(c.mesh));fossils.forEach(f=>addD(f.mesh));roofs.forEach(r=>addD(r.g));walls.forEach(w=>addD(w.mesh));
  (shelfUnits||[]).forEach(u=>addD(u.group));(turrets||[]).forEach(t=>addD(t.group));[fogonG,bancoG,heladeraG,fireMesh,water,terrainMesh].forEach(addD);
  vehicles.forEach(v=>addD(v.group));if(altar)addD(altar.stone);
  const skip=o=>{for(let p=o;p&&p!==world;p=p.parent){if(dyn.has(p)||!p.visible)return true}return false};
  const CELL=125,buckets=new Map(),victims=[];
  world.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||skip(o))return;const m=o.material;if(Array.isArray(m)||m.transparent)return;
    const g=o.geometry;if(!g||!g.attributes.position||!g.attributes.normal)return;
    const p=new T3.Vector3().setFromMatrixPosition(o.matrixWorld);const key=Math.floor((p.x+HALF)/CELL)+','+Math.floor((p.z+HALF)/CELL);
    let byMat=buckets.get(key);if(!byMat)buckets.set(key,byMat=new Map());let arr=byMat.get(m);if(!arr)byMat.set(m,arr=[]);arr.push(o);victims.push(o)});
  const v=new T3.Vector3(),n=new T3.Vector3(),nm3=new T3.Matrix3();
  for(const byMat of buckets.values())for(const [m,list] of byMat){
    if(list.length<2){continue}
    let vc=0,ic=0;for(const o of list){const g=o.geometry;vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count}
    const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),uv=new Float32Array(vc*2),idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic);
    let vo=0,io=0,cast=false;
    for(const o of list){const g=o.geometry,P=g.attributes.position,N=g.attributes.normal;nm3.getNormalMatrix(o.matrixWorld);cast=cast||o.castShadow;
      for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);n.fromBufferAttribute(N,i).applyMatrix3(nm3).normalize();
        const k=(vo+i);pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;nor[k*3]=n.x;nor[k*3+1]=n.y;nor[k*3+2]=n.z;
        const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);let u,w;if(ay>=ax&&ay>=az){u=v.x;w=v.z}else if(ax>=az){u=v.z;w=v.y}else{u=v.x;w=v.y}uv[k*2]=u/2.4;uv[k*2+1]=w/2.4}
      if(g.index){for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo}else for(let i=0;i<P.count;i++)idx[io++]=vo+i;
      vo+=P.count}
    const bg=new T3.BufferGeometry();bg.setAttribute('position',new T3.BufferAttribute(pos,3));bg.setAttribute('normal',new T3.BufferAttribute(nor,3));bg.setAttribute('uv',new T3.BufferAttribute(uv,2));bg.setIndex(new T3.BufferAttribute(idx,1));bg.computeBoundingSphere();bg.computeBoundingBox();
    const mesh=new T3.Mesh(bg,texturedMat(m));mesh.castShadow=cast;mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;world.add(mesh);batched.push(mesh);
    for(const o of list)o.userData.merged=true}
  for(const o of victims)if(o.userData.merged&&o.parent)o.parent.remove(o);
  // terrain detail: grass/dirt pattern on top of the vertex colors
  const tuv=terrainMesh.geometry.attributes.uv;for(let i=0;i<tuv.count;i++){tuv.setXY(i,tuv.getX(i)*SIZE/5,tuv.getY(i)*SIZE/5)}tuv.needsUpdate=true;
  terrainMesh.material.map=TEX.grass;terrainMesh.material.needsUpdate=true;
  if(pineMat&&!pineMat.map){pineMat.map=TEX.leaf;pineMat.needsUpdate=true}if(broadMat&&!broadMat.map){broadMat.map=TEX.leaf;broadMat.needsUpdate=true}
  // the dynamic store pieces and containers still get texture detail on their own materials
  for(const c of conts){const ms=c.mesh;if(ms&&ms.isMesh&&!c.car)ms.material=texturedMat(ms.material)}
}
const _genWorld=genWorld;genWorld=function(seed){_genWorld(seed);try{mergeStatic();mergeWorldGroups()}catch(e){console.error('mergeStatic',e)}};
// markLooted swaps to a dark material; keep its texture detail
const _markLooted=markLooted;markLooted=function(c){_markLooted(c);if(c.mesh&&c.mesh.isMesh&&!c.car)c.mesh.material=texturedMat(c.mesh.material)};

// ---------- Sound: stereo position, outdoor echo, layered gunshots, ambience, footsteps ----------
let REVIN=null,ECHO=null,curPan=0,curRev=0,curEcho=0;
function makeImpulse(sec,decay){const len=AC.sampleRate*sec|0,b=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(R()*2-1)*Math.pow(1-i/len,decay)}return b}
const _initAudio=initAudio;initAudio=function(){_initAudio();if(!AC||REVIN)return;try{
  const conv=AC.createConvolver();conv.buffer=makeImpulse(2.4,3.2);const rg=AC.createGain();rg.gain.value=.55;conv.connect(rg);rg.connect(SFXG);REVIN=conv;
  const dl=AC.createDelay(1.5);dl.delayTime.value=.38;const fb=AC.createGain();fb.gain.value=.32;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1400;dl.connect(lp);lp.connect(fb);fb.connect(dl);const eg=AC.createGain();eg.gain.value=.5;lp.connect(eg);eg.connect(SFXG);ECHO=dl;
  startAmbience()}catch(e){REVIN=null}};
function route(g){let out=g;if(curPan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=curPan;g.connect(p);out=p}out.connect(SFXG);
  if(REVIN&&curRev>0){const s=AC.createGain();s.gain.value=curRev;out.connect(s);s.connect(REVIN)}if(ECHO&&curEcho>0){const s=AC.createGain();s.gain.value=curEcho;out.connect(s);s.connect(ECHO)}}
nz=function(dur,freq,vol,delay=0,type='lowpass',q){const t=AC.currentTime+delay;const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;const g=AC.createGain();g.gain.setValueAtTime(Math.max(vol,.0011),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);route(g);s.start(t,R()*1.5);s.stop(t+dur+.05)};
tn=function(f0,f1,dur,type,vol,delay=0){const t=AC.currentTime+delay;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(f1,20),t+dur);const g=AC.createGain();g.gain.setValueAtTime(Math.max(vol,.0011),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);route(g);o.start(t);o.stop(t+dur+.05)};
// gun voices: [crack freq, body freq, thump Hz, length, loudness]
const GUNS={pistola:[3200,900,150,.16,.8],revolver:[2600,700,110,.26,1],escopeta:[2000,450,80,.36,1.15],escopetac:[2200,500,85,.3,1.05],rifle:[3600,800,95,.34,1.1],fusil:[3000,850,130,.12,.75],
  francotirador:[4200,600,70,.5,1.3],ametralladora:[2800,700,110,.14,.85],turret:[3000,900,140,.1,.45],ballesta:null,lanzagranadas:null};
function gunSound(k,v){const g=GUNS[k];if(!g)return false;const [cr,bd,th,len,lv]=g;
  nz(.035,cr,.9*lv*v,0,'highpass');nz(len,bd,.9*lv*v,0,'bandpass',.8);nz(len*1.6,bd*.45,.5*lv*v,.01);tn(th*1.6,th*.6,len*.8,'sine',.55*lv*v);
  if(k==='escopeta'||k==='escopetac')nz(.06,6000,.25*v,.02,'highpass');
  if(k==='rifle'||k==='escopeta')tn(1800,1800,.025,'square',.05,len+.35);return true}
const AMB_FIRE=new Set(['boom','roar','thunder','scream']);
function surfaceAt(x,z){if(S&&S.snow>.4)return 'snow';if(insideBuilding(x,z)||(Math.max(Math.abs(x),Math.abs(z))<PAL+1))return 'wood';if(Math.abs(x-roadX(z))<4.2||townW(x,z)>.5)return 'road';if(groundY(x,z)<WATER_Y+.3)return 'water';return 'grass'}
function stepSound(){const s=surfaceAt(P.x,P.z),r=.85+R()*.3;
  if(s==='wood'){nz(.07,420*r,.16);tn(110*r,70,.06,'sine',.08)}else if(s==='road'){nz(.09,2400*r,.07,0,'bandpass',1.2);nz(.05,900,.05,.03)}
  else if(s==='snow'){nz(.16,1300*r,.07,0,'bandpass',.7);nz(.1,3000,.03,.05,'highpass')}else if(s==='water'){nz(.2,700*r,.12,0,'bandpass',.6);tn(400*r,180,.12,'sine',.03)}
  else{nz(.08,1700*r,.05,0,'bandpass',.9);nz(.06,4200,.02,.02,'highpass')}}
const _sfx=sfx;sfx=function(k,x,z){if(!AC)return;let v=1;curPan=0;curRev=0;curEcho=0;
  if(x!==undefined){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);v=Math.max(0,1-d/110);if(v<.03)return;
    const yaw=P.inTruck?truck.yaw+Math.PI:P.yaw;const rx=dx*Math.cos(yaw)-dz*Math.sin(yaw);curPan=clamp(rx/Math.max(6,d),-1,1)*.85;curRev=clamp(d/80,0,.6)}
  const inside=insideBuilding(P.x,P.z);
  try{
    if(k==='step'){stepSound();return}
    if(GUNS[k]!==undefined&&GUNS[k]){curEcho=inside?0:.55;curRev=Math.max(curRev,inside?.5:.25);gunSound(k,v);return}
    if(AMB_FIRE.has(k)){curEcho=inside?0:.4;curRev=Math.max(curRev,.35)}
    _sfx(k,x,z)}finally{curPan=0;curRev=0;curEcho=0}};
// ambience: birds by day, crickets and distant howls at night, wind by weather, drips in the rain
let ambT=0,birdT=3,critT=1,howlT=30,cricket=null;
function startAmbience(){try{const o=AC.createOscillator();o.type='sine';o.frequency.value=4300;const am=AC.createGain();am.gain.value=0;const lfo=AC.createOscillator();lfo.frequency.value=34;const lg=AC.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
  const env=AC.createGain();env.gain.value=0;o.connect(am);am.connect(env);env.connect(AMBG);o.start();lfo.start();cricket=env}catch(e){}}
function chirp(){const base=2200+R()*2200,n=2+R()*4|0;curPan=(R()-.5)*1.6;curRev=.3;for(let i=0;i<n;i++)tn(base*(1+R()*.3),base*(.7+R()*.6),.06+R()*.06,'sine',.035,i*(.09+R()*.05));curPan=0;curRev=0}
function updateAmbience(dt){if(!AC||!S)return;ambT-=dt;const night=isNight(),w=weatherFx(),inside=insideBuilding(P.x,P.z);
  if(cricket){const want=night&&!w.rain&&season()!=='invierno'&&!inside?.025:0;cricket.gain.setTargetAtTime(want,AC.currentTime,1.2)}
  birdT-=dt;if(birdT<=0){birdT=2+R()*7;const h=hourOf(S.t);if(!night&&!w.rain&&h>5.5&&h<19&&season()!=='invierno'&&!inside)chirp()}
  howlT-=dt;if(howlT<=0){howlT=25+R()*50;if(night){const a=R()*6.28,d=70+R()*40;R()<.5?_sfx('shriek',P.x+Math.cos(a)*d,P.z+Math.sin(a)*d):_sfx('groan',P.x+Math.cos(a)*d*.6,P.z+Math.sin(a)*d*.6)}}}
const _update=update;update=function(dt){_update(dt);try{updateAmbience(dt)}catch(e){}};

// ---------- Merge sibling boxes that share a material (enemies, palisade, roofs, vehicles) ----------
function protectSet(root,extra){const s=new Set(extra||[]);const add=v=>{if(!v)return;if(Array.isArray(v))v.forEach(add);else if(v.isObject3D)s.add(v)};Object.values(root.userData||{}).forEach(add);return s}
function mergeSiblings(root,protect){
  const parents=[];root.traverse(o=>parents.push(o));
  for(const o of parents){const by=new Map();
    for(const c of o.children){if(!c.isMesh||c.isInstancedMesh||c.children.length||protect.has(c)||!c.visible||Array.isArray(c.material)||c.material.transparent)continue;const g=c.geometry;if(!g.attributes.normal)continue;
      let a=by.get(c.material);if(!a)by.set(c.material,a=[]);a.push(c)}
    for(const [m,list] of by){if(list.length<2)continue;let vc=0,ic=0;for(const c of list){const g=c.geometry;vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count}
      const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic);const v=new T3.Vector3(),n=new T3.Vector3(),nm=new T3.Matrix3();let vo=0,io=0,cast=false;
      for(const c of list){c.updateMatrix();nm.getNormalMatrix(c.matrix);const g=c.geometry,P=g.attributes.position,N=g.attributes.normal;cast=cast||c.castShadow;
        for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(c.matrix);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();const k=vo+i;pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;nor[k*3]=n.x;nor[k*3+1]=n.y;nor[k*3+2]=n.z}
        if(g.index)for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo;else for(let i=0;i<P.count;i++)idx[io++]=vo+i;vo+=P.count;o.remove(c)}
      const bg=new T3.BufferGeometry();bg.setAttribute('position',new T3.BufferAttribute(pos,3));bg.setAttribute('normal',new T3.BufferAttribute(nor,3));bg.setIndex(new T3.BufferAttribute(idx,1));bg.computeBoundingSphere();
      const mm=new T3.Mesh(bg,m);mm.castShadow=cast;mm.receiveShadow=true;o.add(mm)}}}
const _makeEnemyMesh=makeEnemyMesh;makeEnemyMesh=function(type){const m=_makeEnemyMesh(type);try{mergeSiblings(m,protectSet(m));const meshes=[];m.traverse(o=>{if(o.isMesh){o.userData.base=o.material;meshes.push(o)}});m.userData.meshes=meshes}catch(e){console.error(e)}return m};
function mergeWorldGroups(){
  const P0=new Set();walls.forEach(w=>mergeSiblings(w.mesh,P0));roofs.forEach(r=>mergeSiblings(r.g,P0));fossils.forEach(f=>mergeSiblings(f.mesh,P0));(turrets||[]).forEach(t=>mergeSiblings(t.group,P0));
  vehicles.forEach(v=>mergeSiblings(v.group,new Set([...v.cabin,v.dash,v.body,...v.wheels,...v.cargoBoxes].filter(Boolean))))}
