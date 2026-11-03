'use strict';
// ================= STATE =================
const SB=k=>SANDBOX[k].v[(S&&S.sb&&S.sb[k]!=null)?S.sb[k]:SANDBOX[k].d];
const CYCLE=()=>SB('daylen');
const nm=k=>L(ITEMS[k].n), wn=k=>L(WEAP[k].n), an=k=>L(AMMO_N[k]);
function newState(seed,sb){return{v:SAVE_V,seed,sb:Object.assign({},PRESETS.normal.sb,sb||{}),day:1,t:0,money:100,rep:2,level:1,xp:0,perks:{},hp:100,food:90,water:85,fat:10,panic:0,infect:0,wet:0,sick:0,pk:0,wounds:[],sk:{},bag:'mochila_e',battery:100,
  inv:{venda:2,lata:1,agua:1,encendedor:1},stash:{lata:4,agua:3,chatarra:4,madera:4,clavos:10},ammo:{balas:48,revolver:0,cartuchos:0,rifle:0,fusil:0,virotes:0,p50:0,granadas:0},weapons:['pistola','cuchillo'],dur:{cuchillo:WEAP.cuchillo.dur},wstash:[],cur:'pistola',mags:{pistola:12},
  upg:{estante:0,muros:0,torreta:0,fogon:0,banco:0,heladera:0,mochila:0,caja:0,linterna:0,neon:0},
  shelves:[{item:'lata',mult:1},{item:'agua',mult:1},{item:null,mult:1}],demand:null,hot:null,
  px:0,pz:4,yaw:0,stats:{kills:0,sold:0,earned:0,nights:0,rex:0,hs:0,built:0,runover:0,contracts:0,looted:0,minis:0,coloso:0},walls:null,cont:{},fossils:'',explored:'',chopped:[],builds:[],
  veh:{pickup:{x:TRUCK_HOME.x,z:TRUCK_HOME.z,yaw:Math.PI,fuel:70,cargo:{},broken:false}},drive:'pickup',lairs:{},cold:0,snow:0,boss:null,pet:null,contracts:[],goals:[],log:[],today:0,yesterday:0,tutorial:0,weather:{k:'despejado',t:400}}}
function migrate(st){
  if(!st)return null;
  if(st.v===2){const fresh=newState(st.seed,PRESETS.normal.sb);
    for(const k of Object.keys(fresh))if(st[k]===undefined)st[k]=fresh[k];
    st.sb=Object.assign({},PRESETS.normal.sb,{daylen:0});st.cont={};st.v=SAVE_V;st.dur=st.dur||{};
    st.weapons.forEach(w=>{if(WEAP[w]&&WEAP[w].melee&&st.dur[w]==null)st.dur[w]=WEAP[w].dur});
    Object.assign(st.upg,Object.assign({},fresh.upg,st.upg));Object.assign(st.ammo,Object.assign({},fresh.ammo,st.ammo));st.stats=Object.assign({},fresh.stats,st.stats);st.v=3}
  if(st.v===3){const fresh=newState(st.seed,st.sb);
    st.veh={pickup:Object.assign({broken:false},st.truck||fresh.veh.pickup)};delete st.truck;
    for(const k of ['drive','lairs','cold','snow','boss'])if(st[k]===undefined)st[k]=fresh[k];
    st.ammo=Object.assign({},fresh.ammo,st.ammo);st.stats=Object.assign({},fresh.stats,st.stats);st.v=SAVE_V}
  return st.v===SAVE_V?st:null}
const PK=k=>S.perks[k]||0;
const skLv=k=>Math.min(10,Math.floor(Math.sqrt(((S&&S.sk[k])||0)/30)));
const maxHp=()=>100+25*PK('piel');
const bagCap=()=>S.bag?ITEMS[S.bag].cap:0;
const capKg=()=>12+bagCap()+(S.bag?4*S.upg.mochila:0)+5*PK('mula');
const vehCap=(v=truck)=>v.k==='pickup'?40+40*S.upg.caja:VEH[v.k].cap;
const kgOf=o=>{let s=0;for(const k in o)if(ITEMS[k])s+=(o[k]||0)*ITEMS[k].w;return s};
const invKg=()=>kgOf(S.inv)+S.weapons.reduce((s,w)=>s+WEAP[w].w,0)+Object.keys(AMMO_W).reduce((s,a)=>s+S.ammo[a]*AMMO_W[a],0);
const overW=()=>invKg()>capKg();
const wallMax=()=>[300,450,650][S.upg.muros];
function rollDemand(){const d={};IK.forEach(k=>d[k]=+(.75+R()*.6).toFixed(2));const pool=IK.filter(k=>!['madera','podrida','clavos','tela'].includes(k)&&ITEMS[k].cat!=='bag');const hot=pool[R()*pool.length|0];d[hot]=+(1.7+R()*.4).toFixed(2);S.demand=d;S.hot=hot}
function genContracts(){
  S.contracts=S.contracts.filter(c=>!c.done&&!c.failed);
  const want=2+(S.day>3?1:0);const pool=['lata','agua','venda','medicina','carne','asada','cuero','hueso','colmillo','combustible','madera','chatarra','ambar','tablas','galletitas','desinfectante','antibioticos','joyas','cinta','pilas'];
  let guard=0;while(S.contracts.length<want&&guard++<50){const item=pool[R()*pool.length|0];if(S.contracts.some(c=>c.item===item))continue;const v=ITEMS[item].v;const qty=v>=40?rint(1,2):v>=15?rint(2,4):rint(4,8);
    S.contracts.push({who:CLIENTS[R()*CLIENTS.length|0],item,qty,reward:Math.round(v*qty*(1.7+R()*.6)+20),dl:S.day+(R()<.5?0:1)})}}

// ================= RUNTIME =================
let gstate='loading',locked=false,debugNoLock=false,camMode=settings.cam==='iso'?'iso':'fp';
const P={x:0,y:2,z:0,vy:0,yaw:0,pitch:0,onGround:true,bob:0,inTruck:false,aim:null};
let fireCd=0,reloadT=0,reloadMax=1,swingT=0,healCd=0,stamina=100,invuln=0,lastHitT=99,recoil=0,recoilYaw=0,adsT=0,shake=0,hurtFx=0,flashOn=true,stepT=0;
let pendingLevels=0,time=0,spawnT=0,custT=8,exploreT=0,hordeLeft=0,hordeT=0,rexPending=false,lootMsgT=0,fullMsgT=0,groanT=3,hudT=0,holdT=0,holdKey=null,buildMode=false,buildSel=0,buildRot=0,ghost=null,lastWeapon='pistola',thunderT=0,lightning=0;
const keys={};let pressed={};const mouse={down:false,right:false,clicked:false,sx:innerWidth/2,sy:innerHeight/2};
let parts=[],tracers=[],toastEls=[],feedEls=[];
const noLock=()=>debugNoLock||camMode==='iso';
const nearStore=()=>Math.hypot(P.x,P.z)<PAL+2;

function toast(text,color='#dedcc9',life=4.5){const d=document.createElement('div');d.textContent=text;d.style.color=color;$('toasts').appendChild(d);toastEls.push({el:d,life});while(toastEls.length>4){const o=toastEls.shift();o.el.remove()}}
function hint(text,delay){if(!settings.hints)return;setTimeout(()=>{if(gstate!=='menu')toast(text,'#e3a33b',8)},delay)}
function feed(html,hs){const d=document.createElement('div');d.innerHTML=html;if(hs)d.className='hs';$('feed').prepend(d);feedEls.push({el:d,life:4});while(feedEls.length>5){const o=feedEls.shift();o.el.remove()}}
let hitT=0;function hitmark(head){const h=$('hit');h.className=head?'head':'';h.style.opacity=1;hitT=.18}
const PART_POOL=[];for(let i=0;i<180;i++){const m=new T3.Mesh(BOX,mat('#888'));m.visible=false;m.scale.setScalar(.09);scene.add(m);PART_POOL.push(m)}
let partIdx=0;
function burst(x,y,z,color,n=8,sp=3,size=.09,grav=9){for(let i=0;i<n;i++){const m=PART_POOL[partIdx++%PART_POOL.length];m.material=mat(color);m.visible=true;m.position.set(x,y,z);m.scale.setScalar(size*(.6+R()*.8));parts.push({m,vx:(R()-.5)*sp*2,vy:R()*sp*1.2,vz:(R()-.5)*sp*2,life:.4+R()*.5,g:grav})}}
const TR_MAT=new T3.LineBasicMaterial({color:0xffe6a0,transparent:true,opacity:.8});
function tracer(a,b){const g=new T3.BufferGeometry().setFromPoints([a,b]);const l=new T3.Line(g,TR_MAT);scene.add(l);tracers.push({l,life:.05})}

// ================= SKILLS =================
function addSk(k,n){const before=skLv(k);S.sk[k]=(S.sk[k]||0)+n;const after=skLv(k);if(after>before){sfx('skill');toast(L('{s} subió a nivel {n}.',{s:L(SKILLS[k].n),n:after}),'#8fbb62',4)}}

// ================= SAVE =================
function serialize(){
  S.px=P.x;S.pz=P.z;S.yaw=P.yaw;
  S.fossils=fossils.map(f=>f.uses).join('');
  const bytes=new Uint8Array(explored.length/8);for(let i=0;i<explored.length;i++)if(explored[i])bytes[i>>3]|=1<<(i&7);let s='';for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);S.explored=btoa(s);
  S.builds=builds.map(b=>({t:b.t,x:b.x,z:b.z,rot:b.rot,hp:b.hp}));
  vehicles.forEach(v=>{v.st.x=v.x;v.st.z=v.z;v.st.yaw=v.yaw});
  if(pet&&S.pet){S.pet.hp=pet.hp}
  return JSON.stringify(S)}
function saveGame(quiet){const ok=lsSet(SAVE_KEY,serialize());if(!quiet)toast(ok?L('Partida guardada'):L('No se pudo guardar. Usá el código de partida de la pausa.'),ok?'#8fbb62':'#cc4b30');return ok}
function clearRuntime(){
  (enemies||[]).forEach(e=>scene.remove(e.mesh));(customers||[]).forEach(c=>scene.remove(c.mesh));(pickups||[]).forEach(p=>scene.remove(p.mesh));(builds||[]).forEach(b=>world&&world.remove(b.mesh));if(pet)scene.remove(pet.mesh);
  enemies=[];customers=[];pickups=[];builds=[];pet=null;parts.forEach(p=>p.m.visible=false);parts=[];tracers.forEach(t=>scene.remove(t.l));tracers=[];
}
function startGame(state){
  clearRuntime();S=state;
  genWorld(worldSeed());
  if(!S.walls||S.walls.length!==walls.length)S.walls=walls.map(()=>wallMax());
  walls.forEach((w,i)=>setWallAlive(i,S.walls[i]>0));
  conts.forEach(c=>{if(S.cont[c.i])markLooted(c)});
  if(S.fossils&&S.fossils.length===fossils.length)fossils.forEach((f,k)=>{f.uses=+S.fossils[k];if(f.uses<=0)f.mesh.visible=false});
  if(S.explored){try{const b=atob(S.explored);for(let i=0;i<explored.length;i++)explored[i]=(b.charCodeAt(i>>3)>>(i&7))&1}catch(e){}}
  (S.chopped||[]).forEach(i=>{const t=trees[i];if(t&&t.alive){t.alive=false;setTreeVisible(t,false)}});
  (S.builds||[]).forEach(b=>placeBuild(b.t,b.x,b.z,b.rot,b.hp,true));
  if(!S.demand)rollDemand();if(!S.contracts||!S.contracts.length)genContracts();
  initVehicles();lairRT={};projs.forEach(p=>scene.remove(p.mesh));projs=[];S.boss=null;
  if(S.pet&&!S.pet.down)spawnPet(S.pet.hp);
  P.x=S.px;P.z=S.pz;P.y=groundY(P.x,P.z);P.yaw=S.yaw||0;P.pitch=0;P.vy=0;P.inTruck=false;
  if(!S.weapons.includes(S.cur))S.cur=S.weapons[0]||null;
  S.hp=Math.min(S.hp,maxHp());stamina=100;invuln=2;hordeLeft=0;rexPending=false;fireCd=0;reloadT=0;buildMode=false;
  updateUpgradeVisuals();refreshShelves();applySeason(true);
  for(let i=0;i<14;i++)spawnDay(true);
  for(let i=0;i<Math.round(14*SB('zpop'));i++)spawnTown(true);
  equip();
  $('loading').hidden=true;$('hud').hidden=false;
  if(S.tutorial<1){S.tutorial=1;hint(L('Explorá, juntá mercadería y volvé al almacén antes de las 20:00.'),800);hint(L('El pueblo está al sur por la ruta: casas y negocios para revisar mueble por mueble.'),9000);hint(L('V cambia entre primera persona y vista de arriba.'),17000);hint(L('Disparar hace ruido y atrae a todo lo que ande cerca.'),25000)}
  resume();
}
function setWallAlive(i,alive){const w=walls[i];w.mesh.visible=alive;w.box.dead=!alive}
function updateUpgradeVisuals(){turrets.forEach((t,i)=>t.group.visible=i<S.upg.torreta);fogonG.visible=!!S.upg.fogon;bancoG.visible=!!S.upg.banco;heladeraG.visible=!!S.upg.heladera;shelfUnits.forEach((u,i)=>u.group.visible=i<S.shelves.length)}
function refreshShelves(){shelfUnits.forEach((u,i)=>{const sh=S.shelves[i];const n=sh&&sh.item?Math.min(9,S.stash[sh.item]||0):0;u.prods.forEach((m,j)=>{m.visible=j<n;if(sh&&sh.item)m.material=mat(ITEMS[sh.item].c)})})}

// ================= ITEMS, WEAPONS & LOOT =================
function addTo(o,cap,item,qty){const w=ITEMS[item].w;const cur=o===S.inv?invKg():kgOf(o);const room=w>0?Math.floor((cap-cur+1e-6)/w):qty;const take=Math.max(0,Math.min(qty,room));if(take>0)o[item]=(o[item]||0)+take;return qty-take}
const addInv=(item,qty)=>addTo(S.inv,capKg()*1.5,item,qty);
function giveWeapon(k,quiet){
  if(!S.weapons.includes(k)){S.weapons.push(k);if(WEAP[k].melee)S.dur[k]=WEAP[k].dur;else if(S.mags[k]==null)S.mags[k]=0;if(!quiet)toast(L('Conseguiste: {w}. Tecla {n}.',{w:wn(k),n:hotbar().indexOf(k)+1}),'#e3a33b',3);if(!S.cur){S.cur=k;equip()}return}
  if(WEAP[k].melee){S.dur[k]=WEAP[k].dur;if(!quiet)toast(L('{w} en mejor estado: lo cambiaste.',{w:wn(k)}),'#dedcc9',2.5)}
  else{const a=WEAP[k].ammo;const q=Math.ceil(WEAP[k].mag/2);S.ammo[a]+=q;if(!quiet)toast(`+${q} ${an(a)}`,'#d9c38a',2)}}
const hotbar=()=>WORDER.filter(w=>S.weapons.includes(w));
const PICK_GEO=new T3.BoxGeometry(.32,.32,.32);
function spawnPickup(x,z,item,qty){const a=R()*6.28,d=R()*.8;x+=Math.cos(a)*d;z+=Math.sin(a)*d;const y=groundY(x,z);const ammo=item.startsWith('ammo:'),wp=item.startsWith('w:');const m=new T3.Mesh(PICK_GEO,ammo?mat('#c9a24a',{emissive:0x332200}):wp?mat('#9aa0a4',{emissive:0x222222}):mat(ITEMS[item].c,{emissive:0x111111}));m.position.set(x,y+.35,z);m.castShadow=true;scene.add(m);pickups.push({x,z,y,item,qty,mesh:m,age:0,bob:R()*6})}
function rollTable(table,rng,mult){const out={it:{},am:{},wp:[]};for(const [k,ch,a,b] of table){if(rng()<Math.min(.95,ch*mult)){const q=a+Math.floor(rng()*(b-a+1));if(k.startsWith('ammo:'))out.am[k.slice(5)]=(out.am[k.slice(5)]||0)+q;else if(k.startsWith('w:'))out.wp.push(k.slice(2));else out.it[k]=(out.it[k]||0)+q}}return out}
function contItems(c){if(!S.cont[c.i]){const rng=mulberry32((S.seed^Math.imul(c.i+1,2654435761)^Math.imul(S.day,40503))>>>0);S.cont[c.i]=rollTable(CONT[c.type].loot,rng,SB('loot')*(1+.25*PK('carronero')))}return S.cont[c.i]}
const contEmpty=ct=>!Object.values(ct.it).some(q=>q>0)&&!Object.values(ct.am).some(q=>q>0)&&!ct.wp.length;
function markLooted(c){c.seen=true;if(c.mesh&&!c.car&&c.type!=='tacho'&&c.type!=='surtidor'){if(!c.mesh.userData.orig)c.mesh.userData.orig=c.mesh.material;c.mesh.material=mat('#3f2e1b')}}

// ================= BUILD =================
function placeBuild(t,x,z,rot,hp,silent){
  const y=groundY(x,z);const g=grp(x,y,z,world);g.rotation.y=rot;const def=BUILDS[t];const b={t,x,z,rot,hp:hp??(def.hp?Math.round(def.hp*(1+.1*skLv('carpinteria'))):0),mesh:g,y};
  const wallBox=(len,h)=>{const hw=Math.abs(Math.cos(rot))*len/2+Math.abs(Math.sin(rot))*.25,hd=Math.abs(Math.sin(rot))*len/2+Math.abs(Math.cos(rot))*.25;b.box=addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y-1,y1:y+h,kind:'barr',build:b})};
  if(t==='barricada'){for(let i=0;i<4;i++){const l=bx(.32,3,.32,'#7a5c3a',0,.25+i*.27,0,g,CYL);l.rotation.z=Math.PI/2}for(let i=-1;i<=1;i+=2){const s=bx(.2,1.4,.2,'#5a432a',i*1.2,.6,.15,g);s.rotation.x=-.4}wallBox(3,1.2)}
  else if(t==='muro'){for(let i=0;i<6;i++)bx(3.2,.32,.1,i%2?'#a07c50':'#8f6e46',0,.2+i*.34,0,g);for(let i=-1;i<=1;i++)bx(.14,2.1,.16,'#5a432a',i*1.4,1.05,-.1,g);wallBox(3.2,2.1)}
  else if(t==='chapon'){for(let i=0;i<3;i++)bx(1.1,2.3,.06,i%2?'#7d8a90':'#6a767c',-1.1+i*1.1,1.15,0,g);bx(3.4,.12,.14,'#4a4f52',0,2.2,-.05,g);bx(3.4,.12,.14,'#4a4f52',0,.4,-.05,g);wallBox(3.3,2.3)}
  else if(t==='pinchos'){bx(2,.08,2,'#4a3a28',0,.04,0,g);for(let i=0;i<9;i++){const s=bx(.1,.6,.1,'#9a9a92',-.7+(i%3)*.7,.3,-.7+Math.floor(i/3)*.7,g,CONE);s.rotation.x=(R()-.5)*.4}}
  else if(t==='fogata'){for(let i=0;i<6;i++){const a=i/6*6.283;bx(.25,.2,.25,'#5a5550',Math.cos(a)*.45,.1,Math.sin(a)*.45,g)}for(let i=0;i<3;i++){const l=bx(.12,.9,.12,'#5a432a',0,.2,0,g,CYL);l.rotation.z=1.2;l.rotation.y=i*2.1}b.fire=bx(.4,.5,.4,new T3.MeshBasicMaterial({color:0xf08a28}),0,.35,0,g,CONE);b.light=new T3.PointLight(0xff8a30,0,16,2);b.light.position.y=1;g.add(b.light)}
  builds.push(b);if(!silent){S.stats.built++;sfx('build');addSk('carpinteria',8)}return b}
function removeBuild(b){world.remove(b.mesh);if(b.box)b.box.dead=true;builds=builds.filter(x=>x!==b)}
function canAfford(cost){return Object.entries(cost).every(([k,q])=>(S.inv[k]||0)+(S.stash[k]||0)>=q)}
function payCost(cost){for(const [k,q] of Object.entries(cost)){let left=q;const a=Math.min(left,S.inv[k]||0);S.inv[k]=(S.inv[k]||0)-a;left-=a;S.stash[k]=(S.stash[k]||0)-left}}
function buildBlockReason(t){const d=BUILDS[t];if(d.skill&&skLv('carpinteria')<d.skill)return L('Necesitás carpintería {n}.',{n:d.skill});if(d.skill&&!S.weapons.includes('martillo'))return L('Necesitás un martillo.');if(!canAfford(d.cost))return L('Te faltan materiales.');return null}
function updateGhost(){
  const t=BORDER[buildSel];if(!ghost||ghost.userData.t!==t){if(ghost)scene.remove(ghost);const long=t==='barricada'||t==='muro'||t==='chapon';ghost=new T3.Mesh(long?new T3.BoxGeometry(3.2,t==='barricada'?1.2:2.2,.5):t==='pinchos'?new T3.BoxGeometry(2,.3,2):new T3.CylinderGeometry(.6,.6,.5,8),new T3.MeshBasicMaterial({color:0x8fbb62,transparent:true,opacity:.45,depthWrite:false}));ghost.userData.t=t;ghost.userData.h=long?(t==='barricada'?.6:1.1):t==='pinchos'?.15:.25;scene.add(ghost)}
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);const x=Math.round((P.x+fx*3.5)*2)/2,z=Math.round((P.z+fz*3.5)*2)/2;const y=groundY(x,z);
  ghost.position.set(x,y+ghost.userData.h,z);ghost.rotation.y=buildRot;
  const ok=!buildBlockReason(t)&&!circleBlocked(x,z,.8,'b')&&y>WATER_Y+.3&&!(x>-6.5&&x<6.5&&z>-16.5&&z<-7.5);
  ghost.material.color.set(ok?0x8fbb62:0xcc4b30);ghost.userData.ok=ok;ghost.userData.x=x;ghost.userData.z=z}

// ================= COLLISION =================
function circleBlocked(x,z,r,who){
  if(Math.abs(x)>488||Math.abs(z)>488)return{edge:true};
  for(const b of qAABB(x,z)){if(b.dead||b.kind==='floor')continue;if(b.kind==='gate'&&(who==='p'||who==='t'||who==='c'||who==='pet'))continue;
    const cx=clamp(x,b.x0,b.x1),cz=clamp(z,b.z0,b.z1);if((x-cx)**2+(z-cz)**2<r*r)return b}
  const t=qTrees(x,z,t=>(t.x-x)**2+(t.z-z)**2<(t.r+r)**2);if(t)return t;
  if(who!=='b'&&terrainY(x,z)<WATER_Y-.7)return{water:true};
  return null}
function moveCircle(e,dx,dz,r,who){let hit=null;if(dx){const h=circleBlocked(e.x+dx,e.z,r,who);if(!h)e.x+=dx;else hit=h}if(dz){const h=circleBlocked(e.x,e.z+dz,r,who);if(!h)e.z+=dz;else hit=hit||h}return hit}
function rayObstacle(o,d,maxT){
  const step=.4;let t=.2;const p=new T3.Vector3();
  while(t<maxT){p.copy(o).addScaledVector(d,t);
    if(p.y<terrainY(p.x,p.z))return t;
    for(const b of qAABB(p.x,p.z)){if(b.dead)continue;if(p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1&&p.y>b.y0&&p.y<b.y1)return t}
    const tr=qTrees(p.x,p.z,tt=>(tt.x-p.x)**2+(tt.z-p.z)**2<tt.r*tt.r&&p.y<tt.y+tt.h);if(tr)return t;
    t+=step}
  return maxT}
function raySphere(o,d,cx,cy,cz,r){const ox=o.x-cx,oy=o.y-cy,oz=o.z-cz;const b=ox*d.x+oy*d.y+oz*d.z;const c=ox*ox+oy*oy+oz*oz-r*r;const h=b*b-c;if(h<0)return -1;const t=-b-Math.sqrt(h);return t>0?t:-1}
function hitSpheres(e){const H=HIT[hitKey(e.type)],c=Math.cos(e.yaw),s=Math.sin(e.yaw),sc=e.scale||1;const tf=([lx,ly,lz,r])=>[e.x+(lx*c+lz*s)*sc,e.y+ly*sc,e.z+(-lx*s+lz*c)*sc,r*sc];
  if(e.dying||e.stun>0&&e.type==='raptor'){return{head:tf([0,.6,1.0,.3]),body:[tf([0,.4,0,.6])]}}
  return{head:tf(H.head),body:H.body.map(tf)}}

// ================= ENEMIES =================
function spawnEnemy(type,x,z,horde=false){const d=EDEF[type];const sc=(d.mini||d.boss)?1+(S.day-1)*.02:1+(S.day-1)*.07;const mesh=makeEnemyMesh(type);const y=groundY(x,z);mesh.position.set(x,y,z);scene.add(mesh);
  const e={type,x,z,y,r:d.r,hp:d.hp*sc,maxHp:d.hp*sc,speed:d.speed*(.88+R()*.24)*(season()==='invierno'&&d.kind!=='d'?.9:1),scale:d.scale||1,scrT:2+R()*3,spitCd:1+R()*2,slamCd:3,fuse:0,dmg:d.dmg*(1+(S.day-1)*.04),atk:0,wallAtk:0,yaw:R()*6.28,wander:0,wdir:null,aggro:false,horde,flash:0,anim:R()*10,lunge:0,lungeCd:0,charge:0,chargeCd:0,angry:false,loot:1,dead:false,dying:0,mesh,stun:0,stuck:0,target:null};
  enemies.push(e);return e}
function findSpawn(cx,cz,minD,maxD,awayOutpost){for(let k=0;k<40;k++){const a=R()*6.283,d=minD+R()*(maxD-minD),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;if(Math.abs(x)>470||Math.abs(z)>470)continue;const y=terrainY(x,z);if(y<WATER_Y+.4||y>30)continue;if(awayOutpost&&Math.hypot(x,z)<awayOutpost)continue;if(Math.hypot(x-P.x,z-P.z)<minD*.8)continue;if(circleBlocked(x,z,1,'e'))continue;return{x,z,m:moist(x,z)}}return null}
function spawnTown(initial){
  for(let k=0;k<30;k++){let x,z;if(R()<.35&&buildings.length){const b=buildings[R()*buildings.length|0];x=b.x0+1+R()*(b.w-2);z=b.z0+1+R()*(b.d-2)}else{z=TOWN_Z-70+R()*140;x=roadX(z)+(R()-.5)*90}
    if(Math.hypot(x-P.x,z-P.z)<(initial?40:28))continue;if(circleBlocked(x,z,.6,'e'))continue;
    const n=R()<.3?rint(2,3):1;for(let i=0;i<n;i++)spawnEnemy(townType(),x+(R()-.5)*1.5,z+(R()-.5)*1.5);return}}
function townType(){const d=S.day,r=R();if(d>1&&r<.07)return 'griton';if(d>1&&r<.15)return 'hinchado';if(d>2&&r<.2)return 'soldado';if(d>1&&r<.32)return 'corredor';if(d>2&&r<.38)return 'bruto';return 'caminante'}
function wildZ(){const d=S.day,r=R();if(d>2&&r<.06)return 'soldado';if(d>1&&r<.13)return 'hinchado';if(d>1&&r<.18)return 'griton';if(d>2&&r<.3)return 'bruto';if(d>1&&r<.5)return 'corredor';return 'caminante'}
function spawnDay(initial){
  const p=initial?findSpawn(0,0,90,380,80):findSpawn(P.x,P.z,95,170,80);if(!p)return;const r=R(),dn=SB('dinos')*SEASON_FX[season()].dinos;const r2=R();
  const pack=(t,a,b,sp)=>{const n=rint(a,b);for(let i=0;i<n;i++)spawnEnemy(t,p.x+(R()-.5)*sp,p.z+(R()-.5)*sp)};
  if(p.m>.56){if(r<.5*dn){if(S.day>1&&r2<.4)pack('saltador',4,6,6);else pack('raptor',2,3+(S.day>3?1:0),5)}else spawnEnemy(wildZ(),p.x,p.z)}
  else if(p.m<.4){if(r<.4*dn&&S.day>1){if(S.day>3&&r2<.2)spawnEnemy('acorazado',p.x,p.z);else if(S.day>2&&r2<.55)pack('escupidor',1,2,4);else spawnEnemy('raptorp',p.x,p.z)}else pack(wildZ(),1,2,3)}
  else{if(r<.28*dn){if(S.day>1&&r2<.3)pack('saltador',3,5,6);else pack('cornudo',1,3,8)}else{const n=rint(2,4);for(let i=0;i<n;i++)spawnEnemy(wildZ(),p.x+(R()-.5)*6,p.z+(R()-.5)*6)}}
}
function hordeType(){const d=S.day,pool=[['caminante',5]];if(d>=2)pool.push(['corredor',3],['raptorp',1.5*SB('dinos')],['griton',.8]);if(d>=3)pool.push(['bruto',1+d/5],['hinchado',1.2]);if(d>=5)pool.push(['soldado',1+d/8]);if(d>=6)pool.push(['acorazado',.4+d/20]);const tot=pool.reduce((s,p)=>s+p[1],0);let r=R()*tot;for(const [k,w] of pool)if((r-=w)<=0)return k;return 'caminante'}
function spawnHordeGroup(type){const p=findSpawn(0,0,120,150,0);if(!p)return;if(type){spawnEnemy(type,p.x,p.z,true);return}const n=Math.min(hordeLeft,rint(2,4));for(let i=0;i<n;i++)spawnEnemy(hordeType(),p.x+(R()-.5)*6,p.z+(R()-.5)*6,true);hordeLeft-=n}

function updateEnemy(e,dt){
  const d=EDEF[e.type];
  if(e.dying>0){e.dying+=dt;const m=e.mesh;m.rotation.z=Math.min(1.5,e.dying*4)*(e.side||1);m.position.y=e.y-Math.max(0,e.dying-2)*.6;if(e.dying>3.2){scene.remove(m);e.dead=true}return}
  e.atk-=dt;e.wallAtk-=dt;e.lungeCd-=dt;e.chargeCd-=dt;e.scrT-=dt;e.spitCd-=dt;e.slamCd-=dt;
  if(e.flash>0){e.flash-=dt;if(e.flash<=0)e.mesh.userData.meshes.forEach(o=>o.material=o.userData.base)}
  if(e.stun>0){e.stun-=dt;e.mesh.userData.root.rotation.z=1.3;e.mesh.position.set(e.x,e.y-.2,e.z);if(e.stun<=0){e.mesh.userData.root.rotation.z=0;e.aggro=false;e.wander=0;e.wdir=Math.atan2(e.x-P.x,e.z-P.z)}return}
  if(e.knock>0){e.knock-=dt;moveCircle(e,e.kx*dt,e.kz*dt,e.r,'e');e.y=groundY(e.x,e.z);animateEnemy(e,dt,0);return}
  // swollen ones about to burst
  if(e.fuse>0){e.fuse-=dt;e.mesh.scale.setScalar((e.scale||1)*(1+(.8-e.fuse)*.4));if(e.fuse<=0){killEnemy(e,L(d.n),false)}return}
  const tx0=P.inTruck?truck.x:P.x,tz0=P.inTruck?truck.z:P.z;
  const dx=tx0-e.x,dz=tz0-e.z,dP=Math.hypot(dx,dz),night=isNight();
  let dir=null,sp=e.speed,tgt=null;
  let petD=1e9;if(pet&&!d.neutral){petD=Math.hypot(pet.x-e.x,pet.z-e.z)}
  const charging=()=>{if(e.charge>0){e.charge-=dt;sp=e.speed*3.6;dir=e.yaw;return true}if(e.chargeCd<=0&&dP<28&&dP>4){e.charge=1.4;e.chargeCd=d.mini?2.4:3;e.yaw=Math.atan2(dx,dz);dir=e.yaw;sp=e.speed*3.6;sfx('bellow',e.x,e.z);return true}return false};
  if(d.neutral&&!e.lair){
    if(e.angry&&dP>80)e.angry=false;
    if(e.angry){if(!charging()){dir=Math.atan2(dx,dz);sp=e.speed*1.2}}
    else{dir=wander(e,dt);sp=e.speed*.5}
  }else{
    const sneak=(keys['control']||P.crouch)&&!P.inTruck?.55:1;
    const ar=d.aggro*(night?1.4:1)*(keys['shift']&&!P.inTruck?1.15:1)*sneak*(weatherFx().rain>.5||weatherFx().snow>.5?.8:1);
    if(!e.aggro&&dP<ar&&gstate!=='dead')e.aggro=true;
    if(e.aggro&&dP>Math.max(ar*2.6,65))e.aggro=false;
    if(e.home){const hd=Math.hypot(e.home.x-e.x,e.home.z-e.z);if(hd>(d.boss?120:60)&&(e.aggro||e.angry)){e.aggro=false;e.angry=false;e.returning=true}if(e.returning&&hd<8)e.returning=false}
    if(e.returning){dir=Math.atan2(e.home.x-e.x,e.home.z-e.z);sp=e.speed*1.3;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*dt)}
    else if(petD<8&&petD<dP){tgt='pet';dir=Math.atan2(pet.x-e.x,pet.z-e.z)}
    else if(e.aggro){tgt='p';dir=Math.atan2(dx,dz);
      if(d.lunge&&dP<11&&e.lungeCd<=0){e.lunge=.4;e.lungeCd=2;sfx('shriek',e.x,e.z)}
      if(e.lunge>0){e.lunge-=dt;sp*=1.8}
      if(d.charger)charging();
      if(d.scream&&e.scrT<=0){e.scrT=d.boss?12:d.mini?9:7;screamAt(e)}
      if(d.spit&&dP>5&&dP<24){if(dP<15&&!d.mini)dir=null;if(e.spitCd<=0){e.spitCd=d.mini?2:2.8;spitAt(e)}}
      if(d.explode&&dP<e.r+1.3){e.fuse=.8;sfx('fuse',e.x,e.z);return}
      if(d.slam&&dP<7&&e.slamCd<=0){e.slamCd=4.5;e.slamT=.7}}
    else if(e.horde){const cdx=CUST_SPOT.x-e.x,cdz=CUST_SPOT.z+3-e.z,dc=Math.hypot(cdx,cdz);if(dc<3){dir=null;e.loot-=dt;if(e.loot<=0){e.loot=2.5;lootStash()}}else dir=Math.atan2(cdx,cdz)}
    else if(e.home){const hd=Math.hypot(e.home.x-e.x,e.home.z-e.z);if(hd>14){dir=Math.atan2(e.home.x-e.x,e.home.z-e.z);sp=e.speed*.5}else{dir=wander(e,dt);sp=e.speed*.35}}
    else{dir=wander(e,dt);sp=e.speed*.4}
  }
  if(e.slamT>0){e.slamT-=dt;dir=null;if(e.slamT<=0)slam(e)}
  if(dir!=null){
    if(e.stuck>0){e.stuck-=dt;dir+=e.stuckDir}
    const turn=(e.charge>0)?1.2:(e.aggro?8:3);e.yaw+=clamp(angDiff(e.yaw,dir),-turn*dt,turn*dt);
    const hit=moveCircle(e,Math.sin(e.yaw)*sp*dt,Math.cos(e.yaw)*sp*dt,e.r,'e');
    e.anim+=dt*sp*2.2/(e.scale||1);
    if(hit){
      if((hit.kind==='wall'||hit.kind==='gate')&&(e.aggro||e.horde||e.angry)){if(e.wallAtk<=0){damageWall(hit.wi,d.wall*(1+(S.day-1)*.05),e);e.wallAtk=1}}
      else if(hit.kind==='barr'&&(e.aggro||e.horde||e.angry)){if(e.wallAtk<=0){damageBuild(hit.build,d.wall);e.wallAtk=1}}
      else if(!e.aggro&&!e.horde){e.wander=0}
      else if(e.stuck<=0){e.stuck=.6+R()*.6;e.stuckDir=(R()<.5?-1:1)*1.2}
      if(e.charge>0){e.charge=0}
    }
  }else e.anim+=dt*.5;
  e.y=groundY(e.x,e.z);
  for(const b of builds){if(b.t!=='pinchos')continue;if(Math.abs(b.x-e.x)<1.1&&Math.abs(b.z-e.z)<1.1&&!d.neutral){e.hp-=18*dt;if(e.hp<=0){killEnemy(e,L('Pinchos'),false);return}e.x-=Math.sin(e.yaw)*sp*dt*.6;e.z-=Math.cos(e.yaw)*sp*dt*.6;if(R()<dt*4)burst(e.x,e.y+.5,e.z,'#55733a',2,1.5)}}
  const hostile=!(d.neutral&&!e.angry&&!e.lair)&&!e.returning;
  if(hostile&&gstate==='play'){
    if(tgt==='pet'&&petD<e.r+.8&&e.atk<=0){pet.hp-=e.dmg*.8;e.atk=.9;burst(pet.x,pet.y+.9,pet.z,'#8a2f24',4,2)}
    else{const reach=e.r+(P.inTruck?2:.55)+(e.type==='rex'?1.8:d.heavy?.6:0);if(dP<reach+.3&&e.atk<=0&&Math.abs((P.inTruck?truck.y:P.y)-e.y)<2.5+(e.scale||1)){hurtPlayer(e.dmg*(e.charge>0?1.5:1)*(P.inTruck?.5:1),e);e.atk=d.heavy?1.3:.9;if(e.charge>0)e.charge=0}}
  }
  animateEnemy(e,dt,sp)
}
function animateEnemy(e,dt,sp){
  const m=e.mesh,u=m.userData;m.position.set(e.x,e.y,e.z);m.rotation.y=e.yaw;const s=Math.sin(e.anim);
  if(u.type==='h'){u.legs[0].rotation.x=s*.6;u.legs[1].rotation.x=-s*.6;u.arms[0].rotation.x=-1.35+Math.sin(e.anim*.5)*.15;u.arms[1].rotation.x=-1.5-Math.sin(e.anim*.5)*.15;u.root.rotation.z=Math.sin(e.anim*.5)*.06;if(e.atk>.6)u.arms.forEach(a=>a.rotation.x=-2)}
  else if(u.type==='r'||u.type==='x'){u.legs[0].rotation.x=s*.7;u.legs[1].rotation.x=-s*.7;u.tail.rotation.y=Math.sin(e.anim*.5)*.3;u.tail2.rotation.y=Math.sin(e.anim*.5-1)*.4;u.head.rotation.x=e.atk>.5?-.4:Math.sin(e.anim*.3)*.08;if(u.jaw)u.jaw.rotation.x=e.atk>.5?.5:.08}
  else if(u.type==='c'){u.legs.forEach((l,i)=>l.rotation.x=(i%2?s:-s)*.4);u.tail.rotation.y=Math.sin(e.anim*.4)*.25;u.head.rotation.x=e.charge>0?.3:0}
}
function wander(e,dt){e.wander-=dt;if(e.wander<=0){e.wander=2+R()*4;e.wdir=R()<.35?null:R()*6.283}return e.wdir}
function hurtEnemy(e,dmg,head,src,by,ap){
  if(e.dead||e.dying)return;const ed=EDEF[e.type];
  if(ed.armor&&!head&&!ap)dmg*=ed.armor;
  e.hp-=dmg;if(e.fuse>0)e.fuse=Math.min(e.fuse,.15);e.flash=.08;e.mesh.userData.meshes.forEach(o=>o.material=WHITE);
  if(!EDEF[e.type].neutral)e.aggro=true;else e.angry=true;e.returning=false;
  burst(e.x,e.y+(head?HIT[hitKey(e.type)].head[1]*(e.scale||1):1),e.z,EDEF[e.type].kind==='d'?'#8a2f24':'#4f6b33',head?8:4,2.5);
  if(src==='p')hitmark(head);
  if(e.type==='raptor'&&e.hp>0&&e.hp<e.maxHp*.3&&!e.horde&&!S.pet&&R()<.45&&e.stun<=0){e.stun=18;e.aggro=false;toast(L('El raptor quedó tirado y débil. Con carne en la mochila podés domesticarlo (mantené E).'),'#8fbb62',6)}
  if(e.hp<=0)killEnemy(e,by||(src==='t'?L('Torreta'):src==='pet'?(S.pet?S.pet.name:L('Raptor')):src==='truck'?L('Camioneta'):L('Pinchos')),head);
}
function killEnemy(e,by,head){
  if(e.dying)return;e.dying=.01;e.side=R()<.5?1:-1;const d=EDEF[e.type];S.stats.kills++;if(e.type==='rex'){S.stats.rex++;toast(L('¡Cayó el Rex Podrido! Juntá el ámbar.'),'#e3a33b',6)}
  if(d.explode){e.mesh.visible=false;e.dying=3;explode(e.x,e.y+1,e.z,4.5,40,'e',true)}
  if(d.mini){S.stats.minis=(S.stats.minis||0)+1;if(e.lair)S.lairs[e.lair]=S.day;sfx('goal');toast(L('Derrotaste a {n}. Su zona queda tranquila unos días.',{n:L(d.n)}),'#e3a33b',7)}
  if(e.type==='coloso'){S.stats.coloso=(S.stats.coloso||0)+1;toast(L('¡Cayó el Coloso de la Bruma!'),'#e3a33b',7)}
  if(d.boss){S.boss=null;shake=Math.max(shake,.6)}
  e.mesh.userData.meshes.forEach(o=>o.material=o.userData.base);
  sfx('kill',e.x,e.z);
  for(const [k,ch,a,b] of DROPS[e.type]){if(R()<ch*(k.startsWith('w:')?1:SB('loot'))){let q=rint(a,b);if(k==='carne')q+=PK('carnicero');spawnPickup(e.x,e.z,k,q)}}
  gainXp(d.xp);
  feed(`${esc(by)} ▸ <b>${esc(L(d.n))}</b>${head?' ('+esc(L('cabeza'))+')':''}`,head);
}
function gainXp(n){S.xp+=n;let need=xpNeed();while(S.xp>=need){S.xp-=need;S.level++;pendingLevels++;need=xpNeed()}}
const xpNeed=()=>Math.round(40*Math.pow(S.level,1.45));
function damageWall(i,dmg,e){S.walls[i]-=dmg;const w=walls[i];sfx('wall',w.x,w.z);burst(w.x,2.8,w.z,'#6b5638',4,2);if(S.walls[i]<=0){S.walls[i]=0;setWallAlive(i,false);shake=Math.max(shake,.15);if(lootMsgT<=0){toast(L('¡Rompieron un tramo de la empalizada!'),'#cc4b30');lootMsgT=4}}}
function damageBuild(b,dmg){b.hp-=dmg;sfx('wall',b.x,b.z);burst(b.x,b.y+.8,b.z,'#7a5c3a',4,2);if(b.hp<=0){removeBuild(b);toast(L('Rompieron una defensa.'),'#e3a33b')}}
function lootStash(){const have=IK.filter(k=>S.stash[k]>0);if(!have.length)return;const k=have[R()*have.length|0];S.stash[k]--;refreshShelves();if(lootMsgT<=0){toast(L('¡Están saqueando tu almacén!'),'#cc4b30');lootMsgT=5}}

// ================= HEALTH =================
const WOUND={rasguno:{n:'Rasguño',bleed:.1,heal:.5,pain:8,stop:40},corte:{n:'Corte profundo',bleed:.28,heal:1,pain:18},mordida:{n:'Mordida',bleed:.38,heal:1.5,pain:28}};
function hurtPlayer(dmg,src){
  if(invuln>0||gstate!=='play')return;if(src&&src.type&&EDEF[src.type].infects&&SB('infect')&&!(S.infect>0))S.infect=.1;S.hp-=dmg;lastHitT=0;hurtFx=1;shake=Math.max(shake,.35);sfx('hurt');
  if(src&&src.type&&!P.inTruck&&R()<.5){const k=EDEF[src.type].kind;const r=R();const t=k==='z'?(r<.55?'rasguno':r<.8?'corte':'mordida'):k==='zd'?(r<.3?'rasguno':r<.7?'corte':'mordida'):(r<.35?'rasguno':'corte');
    S.wounds.push({t,band:false,dis:false,heal:0,age:0});
    toast(L('Herida: {w}. Vendala con H.',{w:L(WOUND[t].n)}),'#cc4b30',3.5);
    if(SB('infect')&&k!=='d'&&!(S.infect>0)){const ch={rasguno:.05,corte:.12,mordida:.45}[t]*(PK('inmune')?.25:1);if(R()<ch){S.infect=.1}}}
  if(S.hp<=0){S.hp=0;die()}}
const bleeding=()=>S.wounds.filter(w=>!w.band&&!(w.t==='rasguno'&&w.age>WOUND.rasguno.stop));
const pain=()=>Math.max(0,S.wounds.reduce((s,w)=>s+WOUND[w.t].pain*(w.band?.6:1),0)-(S.pk>0?60:0));
function treat(){ // H: bandage the worst open wound first, otherwise heal
  if(healCd>0)return;healCd=.8;const aux=1+.1*skLv('auxilios');
  const open=bleeding().sort((a,b)=>WOUND[b.t].bleed-WOUND[a.t].bleed);
  if(open.length){const k=S.inv.venda?'venda':S.inv.medicina?'medicina':S.inv.tela>=2?'tela':null;if(!k){toast(L('Estás sangrando y no tenés vendas, botiquín ni tela.'),'#cc4b30');return}
    if(k==='tela')S.inv.tela-=2;else S.inv[k]--;const w=open[0];w.band=true;if(k==='medicina'){w.dis=true;S.hp=Math.min(maxHp(),S.hp+ITEMS.medicina.heal*aux)}else if(k==='venda')S.hp=Math.min(maxHp(),S.hp+ITEMS.venda.heal*aux);
    if(S.inv.desinfectante>0&&!w.dis){S.inv.desinfectante--;S.wounds.forEach(x=>x.dis=true)}
    addSk('auxilios',6);sfx('pickup');toast(L('Vendaste: {w}.',{w:L(WOUND[w.t].n)}),'#8fbb62',2.5);return}
  if(S.hp>=maxHp()){toast(L('No tenés heridas abiertas y la vida está completa.'));return}
  const k=S.inv.medicina?'medicina':S.inv.venda?'venda':null;if(!k){toast(L('No tenés vendas ni botiquín en la mochila.'),'#cc4b30');return}
  S.inv[k]--;S.hp=Math.min(maxHp(),S.hp+ITEMS[k].heal*aux*(k==='venda'?1.5:1));addSk('auxilios',3);toast(L('Usaste: {i}.',{i:nm(k)}),'#8fbb62',2);sfx('pickup')}
function useItem(k){ // from the inventory
  const it=ITEMS[k];if(!(S.inv[k]>0))return;
  if(it.cat==='bag'){const old=S.bag;S.inv[k]--;S.bag=k;if(old)S.inv[old]=(S.inv[old]||0)+1;toast(L('Te pusiste: {i}.',{i:nm(k)}),'#8fbb62',2);sfx('pickup');return}
  if(k==='desinfectante'){if(!S.wounds.length){toast(L('No tenés heridas para desinfectar.'));return}S.inv[k]--;S.wounds.forEach(w=>w.dis=true);addSk('auxilios',3);toast(L('Desinfectaste las heridas.'),'#8fbb62');return}
  if(k==='analgesicos'){S.inv[k]--;S.pk=CYCLE()/6;toast(L('Tomaste analgésicos. El dolor baja por unas horas.'),'#8fbb62');return}
  if(k==='antibioticos'){S.inv[k]--;if(S.infect>0){S.infect=0;toast(L('Los antibióticos frenaron la infección.'),'#8fbb62',5)}else toast(L('Tomaste antibióticos, pero no estabas infectado.'));return}
  if(k==='venda'||k==='medicina'){treat();return}
  if(k==='pilas'){if(S.battery>=95){toast(L('La linterna ya tiene pilas cargadas.'));return}S.inv[k]--;S.battery=100;toast(L('Cambiaste las pilas de la linterna.'),'#8fbb62');return}
  if(it.food||it.drink)consume(k)}
function consume(item){const it=ITEMS[item];if(!(S.inv[item]>0))return false;S.inv[item]--;
  if(it.food)S.food=Math.min(100,S.food+it.food*(1+.04*skLv('supervivencia')));if(it.drink)S.water=Math.min(100,S.water+it.drink);if(it.calm)S.panic=Math.max(0,S.panic-it.calm);
  if(it.sick||(it.raw&&R()<.4)){S.sick=Math.min(100,S.sick+(it.sick?40:25));toast(it.sick?L('Eso estaba podrido. Te cayó mal.'):L('La carne cruda te cayó mal. Mejor cocinala en una fogata.'),'#e3a33b')}
  sfx('eat');return true}
function autoConsume(){const needW=100-S.water,needF=100-S.food;
  const drink=['agua','gaseosa','leche'].find(k=>S.inv[k]>0);
  if(needW>=needF&&needW>10&&drink){consume(drink);toast(L('Tomaste: {i}.',{i:nm(drink)}),'#6fa3c4',2);return}
  const food=['asada','pan','fruta','galletitas','lata','chocolate','leche','carne'].find(k=>S.inv[k]>0);if(needF>10&&food){consume(food);toast(L('Comiste: {i}.',{i:nm(food)}),'#c9a24a',2);return}
  if(needW>10&&drink){consume(drink);toast(L('Tomaste: {i}.',{i:nm(drink)}),'#6fa3c4',2);return}
  toast(needF<=10&&needW<=10?L('No tenés hambre ni sed.'):L('No tenés comida ni bebida en la mochila.'),'#e3a33b',2.5)}
function updateBody(dt){
  const C=CYCLE(),drain=(PK('estomago')?.7:1)*SB('needs')*(1-.04*skLv('supervivencia'))*(S.infect>30?1.3:1)*(720/C);
  updateTemp(dt);
  S.food=Math.max(0,S.food-.065*drain*dt*(S.cold>40?1.3:1));S.water=Math.max(0,S.water-.095*drain*dt*(heatOn?1.6:1));
  if(S.food<=0||S.water<=0)S.hp-=.6*dt;
  // wounds
  let bleed=0;for(const w of S.wounds){w.age+=dt;const def=WOUND[w.t];if(!w.band){if(!(w.t==='rasguno'&&w.age>def.stop))bleed+=def.bleed}else w.heal+=dt*(w.dis?2:1)*(1+.08*skLv('auxilios'))}
  S.wounds=S.wounds.filter(w=>{if(w.band&&w.heal>=WOUND[w.t].heal*C){toast(L('Se cerró la herida: {w}.',{w:L(WOUND[w.t].n)}),'#8fbb62',2.5);return false}return true});
  S.hp-=bleed*dt;if(bleed>0&&R()<dt*2)burst(P.x,P.y+.2,P.z,'#7a1e16',1,.5,.05);
  // infection: about two days from bite to the worst stage
  if(S.infect>0){S.infect=Math.min(100,S.infect+dt*100/(C*2));if(S.infect>=100)S.hp-=.5*dt}
  if(S.sick>0){S.sick=Math.max(0,S.sick-dt*.4);if(S.sick>20)S.hp-=.12*dt}
  if(S.pk>0)S.pk-=dt;
  // fatigue
  S.fat=Math.min(100,S.fat+dt*100/(C*1.6)*(S.wet>40?1.3:1)*(S.cold>45?1.3:1)*(overW()?1.3:1));if(S.fat>=100)S.hp-=.15*dt;
  // panic from nearby hostiles
  let n=0;for(const e of enemies){if(e.dying||e.dead||(EDEF[e.type].neutral&&!e.angry)||e.stun>0)continue;if(Math.abs(e.x-P.x)<14&&Math.abs(e.z-P.z)<14)n+=EDEF[e.type].boss?5:1}
  const target=Math.min(100,n*16*Math.max(.3,1-S.level*.04));S.panic+=(target-S.panic)*Math.min(1,dt*(target>S.panic?1.2:.25));
  // wet
  const wf=weatherFx();const sheltered=P.inTruck||insideBuilding(P.x,P.z)||(P.x>-6&&P.x<6&&P.z>-16&&P.z<-8);
  if(wf.rain>.3&&!sheltered)S.wet=Math.min(100,S.wet+dt*2.5*wf.rain);else S.wet=Math.max(0,S.wet-dt*(nearFire()?3:.6));
  if(PK('regen')&&lastHitT>5&&S.hp<maxHp()&&!bleed)S.hp=Math.min(maxHp(),S.hp+1.2*PK('regen')*dt);
  if(S.hp<=0&&gstate==='play'){S.hp=0;die()}}
function nearFire(){if(Math.hypot(P.x+9,P.z+4)<4&&S.upg.fogon)return true;return builds.some(b=>b.t==='fogata'&&Math.hypot(b.x-P.x,b.z-P.z)<4)}
function statuses(){ // status list for the HUD (Spanish source labels, translated at render)
  const o=[],add=(n,lv,c)=>o.push({n,lv,c});
  if(S.food<35)add('Hambre',S.food<10?3:S.food<20?2:1,'#c9a24a');
  if(S.water<35)add('Sed',S.water<10?3:S.water<20?2:1,'#6fa3c4');
  if(S.fat>60)add(S.fat>85?'Agotado':'Cansado',S.fat>95?3:S.fat>85?2:1,'#9a8ac0');
  const b=bleeding().length;if(b)add('Sangrando',Math.min(3,b),'#cc4b30');
  const p=pain();if(p>10)add('Dolor',p>45?3:p>25?2:1,'#d07a5a');
  if(S.infect>0)add('Infectado',S.infect>66?3:S.infect>33?2:1,'#9acd5a');
  if(S.sick>20)add('Intoxicado',S.sick>60?2:1,'#8a9a3a');
  if(S.panic>25)add('Pánico',S.panic>70?3:S.panic>45?2:1,'#e0a040');
  if(S.wet>40)add('Mojado',S.wet>80?2:1,'#6f9ac4');
  if(S.cold>20)add('Frío',S.cold>70?3:S.cold>45?2:1,'#9ac4e0');
  if(heatOn)add('Calor',1,'#e0884a');
  if(overW())add('Sobrecarga',invKg()>capKg()*1.25?2:1,'#b08a5a');
  return o}
// Aim penalty from pain, panic, fatigue and skill
const aimMult=()=>(1-.04*skLv('punteria'))*(1+pain()/120)*(1+S.panic/160)*(S.fat>85?1.3:1);

// ================= PET =================
function spawnPet(hp){const m=raptorModel(false);m.traverse(o=>{if(o.isMesh&&o.material.color&&o.material.color.getHexString()==='7d6a3c')o.material=mat('#8a7a3c')});bx(.3,.08,.3,'#cc4b30',0,1.2,.75,m.userData.root);
  const x=S.pet&&S.pet.mode==='guard'?2:P.x+2,z=S.pet&&S.pet.mode==='guard'?-4:P.z+2;
  pet={x,z,y:groundY(x,z),yaw:0,hp:hp??120,maxHp:120,mesh:m,anim:0,atk:0,target:null};scene.add(m)}
function updatePet(dt){
  if(!pet)return;const sp=S.pet;pet.atk-=dt;
  if(pet.hp<=0){sp.down=true;scene.remove(pet.mesh);burst(pet.x,pet.y+.8,pet.z,'#8a2f24',10,3);toast(L('{n} quedó mal herida y escapó. Vuelve al almacén al amanecer.',{n:sp.name}),'#cc4b30',6);pet=null;return}
  if(!pet.target||pet.target.dying||pet.target.dead||pet.target.stun>0)pet.target=null;
  const home=sp.mode==='guard'?{x:0,z:-3}:{x:P.inTruck?truck.x:P.x,z:P.inTruck?truck.z:P.z};
  if(!pet.target){let best=null,bd=sp.mode==='guard'?28:20;for(const e of enemies){if(e.dying||e.dead||e.stun>0||(EDEF[e.type].neutral&&!e.angry))continue;const d=Math.hypot(e.x-home.x,e.z-home.z);if(d<bd){bd=d;best=e}}pet.target=best}
  let tx,tz,speed;
  if(pet.target){tx=pet.target.x;tz=pet.target.z;speed=8;const d=Math.hypot(tx-pet.x,tz-pet.z);if(d<pet.target.r+1.1){speed=0;if(pet.atk<=0){pet.atk=.75;const dmg=15*(1+.5*PK('domador'))*(1+(S.level-1)*.04);hurtEnemy(pet.target,dmg,false,'pet');sfx('shriek',pet.x,pet.z)}}}
  else{const d=Math.hypot(home.x-pet.x,home.z-pet.z);if(d>(sp.mode==='guard'?3:4)){tx=home.x;tz=home.z;speed=d>14?(P.inTruck?16:8.5):5}else speed=0;if(d>70){pet.x=home.x+2;pet.z=home.z+2}}
  if(speed>0){const a=Math.atan2(tx-pet.x,tz-pet.z);pet.yaw+=clamp(angDiff(pet.yaw,a),-8*dt,8*dt);moveCircle(pet,Math.sin(pet.yaw)*speed*dt,Math.cos(pet.yaw)*speed*dt,.5,'pet');pet.anim+=dt*speed*2.2}
  if(!pet.target&&lastHitT>3)pet.hp=Math.min(pet.maxHp,pet.hp+2*dt);
  pet.y=groundY(pet.x,pet.z);const m=pet.mesh,u=m.userData;m.position.set(pet.x,pet.y,pet.z);m.rotation.y=pet.yaw;const s=Math.sin(pet.anim);u.legs[0].rotation.x=s*.7;u.legs[1].rotation.x=-s*.7;u.tail.rotation.y=Math.sin(time*3)*.3;u.head.rotation.x=pet.atk>.5?-.4:0}
function tame(e){const k=(S.inv.asada||0)>0?'asada':'carne';S.inv[k]--;e.dead=true;scene.remove(e.mesh);S.pet={name:'Chispa',hp:120,mode:'follow',down:false};spawnPet(120);pet.x=e.x;pet.z=e.z;sfx('tame');toast(L('¡Domesticaste un raptor! Se llama Chispa. T para que te siga o cuide el almacén.'),'#8fbb62',8)}

// ================= TIME & WEATHER =================
const hourOf=t=>(6+t/CYCLE()*24)%24;
const isNight=()=>{const h=hourOf(S.t);return h>=20||h<5};
const WEATHERS={despejado:{n:'Despejado',rain:0,fog:0,dim:0,w:.42},nublado:{n:'Nublado',rain:0,fog:.004,dim:.18,w:.25},lluvia:{n:'Lluvia',rain:.8,fog:.008,dim:.3,w:.18},tormenta:{n:'Tormenta',rain:1,fog:.012,dim:.45,w:.06},niebla:{n:'Niebla',rain:0,fog:.03,dim:.2,w:.09},nieve:{n:'Nieve',rain:0,snow:1,fog:.014,dim:.28,w:0}};
let wfx={rain:0,fog:0,dim:0,snow:0};
const weatherFx=()=>wfx;
function updateWeather(dt){
  const w=S.weather;w.t-=dt;if(w.t<=0){const ws=Object.entries(WEATHERS).map(([kk,v])=>[kk,v.w*(SEASON_FX[season()].wx[kk]??1)]);let r=R()*ws.reduce((a,b)=>a+b[1],0),k='despejado';for(const [kk,v] of ws){if((r-=v)<=0){k=kk;break}}if(k==='lluvia'&&baseTemp()<1)k='nieve';if(k!==w.k){w.k=k;if(k!=='despejado')toast(L('El tiempo cambia: {w}.',{w:L(WEATHERS[k].n)}),'#9fb0aa',3)}w.t=CYCLE()*(.12+R()*.25)}
  const tg=WEATHERS[w.k];const f=Math.min(1,dt*.15);wfx.rain+=(tg.rain-wfx.rain)*f;wfx.fog+=(tg.fog-wfx.fog)*f;wfx.dim+=(tg.dim-wfx.dim)*f;wfx.snow+=((tg.snow||0)-wfx.snow)*f;updateSnow(dt);
  if(w.k==='tormenta'){thunderT-=dt;if(thunderT<=0){thunderT=8+R()*20;lightning=1;setTimeout(()=>sfx('thunder'),400+R()*1500)}}
  lightning=Math.max(0,lightning-dt*4);ambient(wfx.rain,.3+wfx.rain*.6+wfx.snow*.4)}
function darkness(){const h=hourOf(S.t);if(h>=7&&h<18)return 0;if(h>=18&&h<20.5)return smooth(18,20.5,h)*.94;if(h>=20.5||h<4)return .94;return .94*(1-smooth(4,7,h))}
function onHour(prev,now){
  const cross=v=>prev<v&&now>=v;
  if(cross(18.5)){toast(L('Está oscureciendo. Volvé al almacén antes de las 20:00.'),'#e3a33b',6)}
  if(cross(19)){customers.forEach(c=>c.state='out')}
  if(cross(20)){hordeLeft=Math.round((6+S.day*4)*SB('horde'));hordeT=3;rexPending=false;sfx('night');toast(L('Noche {d}: la bruma trae {n} podridos.',{d:S.day,n:hordeLeft})+(rexPending?' '+L('Algo enorme se mueve en el desierto.'):''),'#cc4b30',7)}
  if(rexPending&&cross(23)){rexPending=false;spawnHordeGroup('rex');sfx('roar');shake=.6;toast(L('¡El Rex Podrido viene hacia el almacén!'),'#cc4b30',7)}
  if(cross(5)){dissolveHorde();hordeLeft=0}
  if(cross(19)){S.contracts.forEach(c=>{if(!c.done&&!c.failed&&c.dl<=S.day){c.failed=true;S.rep=Math.max(0,S.rep-.4);toast(L('Se venció el encargo de {who}. Bajó tu reputación.',{who:c.who}),'#cc4b30')}})}
}
function dissolveHorde(){let n=0;enemies.forEach(e=>{if(e.horde&&!e.dying&&!e.dead){e.dying=.01;e.side=1;n++;burst(e.x,e.y+1,e.z,'#8fbb62',8,2)}});if(n)toast(L('Amanece. La bruma se retira y {n} podridos se desploman.',{n}),'#8fbb62',6)}
function spoil(){if(!SB('rot'))return 0;let n=0;const sm=SEASON_FX[season()].rot;const go=(o,mult)=>{mult*=sm;for(const k of Object.keys(o)){const r=ITEMS[k]&&ITEMS[k].rot;if(!r||!(o[k]>0))continue;let q=0;for(let i=0;i<o[k];i++)if(R()<mult/r)q++;if(q){o[k]-=q;o.podrida=(o.podrida||0)+q;n+=q}}};go(S.inv,1);Object.values(S.veh).forEach(v=>go(v.cargo,1));go(S.stash,S.upg.heladera?.25:1);return n}
function newDay(){
  const oldSeason=season();S.day++;S.stats.nights++;if(season()!==oldSeason){applySeason();sfx('goal');toast(L(SEASONS[season()].msg),'#9fd27a',7)}
  for(const c of conts){if(S.cont[c.i]&&R()<.08){delete S.cont[c.i];c.seen=false;if(c.mesh&&c.mesh.userData.orig)c.mesh.material=c.mesh.userData.orig}}
  fossils.forEach(f=>{if(f.uses<3&&R()<.3){f.uses++;f.mesh.visible=true}});
  rollDemand();genContracts();S.yesterday=S.today;S.today=0;
  const rot=spoil();
  if(S.pet&&S.pet.down){S.pet.down=false;spawnPet(60);pet.x=0;pet.z=-3;toast(L('{n} volvió al almacén.',{n:S.pet.name}),'#8fbb62')}
  sfx('dawn');toast(L('Día {d}. Ayer vendiste ${m}. Hoy buscan: {i}.',{d:S.day,m:fmt(S.yesterday),i:nm(S.hot)})+(rot?' '+L('Se pudrieron {n} alimentos.',{n:rot}):''),'#e3a33b',8);
  saveGame(true)}
// Sleep in the store bed: skips hours, heals a bit, sells a little while you sleep.
function sleepReason(){const h=hourOf(S.t);if(h>=19.5||h<5)return L('La bruma no te deja dormir de noche.');if(S.fat<25)return L('No tenés sueño.');if(enemies.some(e=>!e.dying&&!e.dead&&!(EDEF[e.type].neutral&&!e.angry)&&Math.hypot(e.x,e.z)<40))return L('Hay peligro cerca: no podés dormir.');if(bleeding().length)return L('Estás sangrando: vendate primero.');return null}
function sleep(){
  const why=sleepReason();if(why){toast(why,'#e3a33b');return}
  const h0=hourOf(S.t);let hours=Math.min(9,S.fat/11+1);hours=Math.min(hours,19.4-h0);if(hours<.5){toast(L('Ya es tarde para dormir.'),'#e3a33b');return}
  const C=CYCLE(),dtS=hours/24*C;
  const prevH=h0;S.t+=dtS;if(S.t>=C){S.t-=C;newDay()}onHour(prevH,hourOf(S.t));
  S.fat=Math.max(0,S.fat-hours*11);S.hp=Math.min(maxHp(),S.hp+hours*4);S.food=Math.max(0,S.food-hours*1.6*SB('needs'));S.water=Math.max(0,S.water-hours*2.4*SB('needs'));
  S.wounds.forEach(w=>{if(w.band)w.heal+=dtS*(w.dis?2:1)});if(S.infect>0)S.infect=Math.min(100,S.infect+dtS*100/(C*2));
  let sales=0;const shopH=Math.max(0,Math.min(19,h0+hours)-Math.max(7,h0));for(let i=0;i<Math.round(shopH*1.6);i++){const before=S.money;customerBuy(null);sales+=S.money-before}
  enemies.forEach(e=>{if(!e.horde&&!e.aggro&&Math.hypot(e.x-P.x,e.z-P.z)<120){e.dead=true;scene.remove(e.mesh)}});
  $('sleepFx').hidden=false;$('sleepFx').textContent=L('Dormiste {h} horas.',{h:Math.round(hours)})+(sales?' '+L('Mientras tanto vendiste ${m}.',{m:fmt(sales)}):'');setTimeout(()=>$('sleepFx').hidden=true,2600);
  saveGame(true)}

// ================= COMBAT =================
const W=()=>S.cur?WEAP[S.cur]:null;
function equip(){Object.keys(vm).forEach(n=>vm[n].visible=false);if(buildMode)vm.build.visible=true;else if(S.cur)vm[S.cur].visible=true;if(body)Object.entries(body.userData.props).forEach(([k,g])=>g.visible=!buildMode&&k===S.cur)}
function switchWeapon(k){if(!k||!S.weapons.includes(k)||S.cur===k)return;lastWeapon=S.cur;S.cur=k;reloadT=0;fireCd=.25;buildMode=false;$('buildBar').hidden=true;if(ghost){scene.remove(ghost);ghost=null}equip()}
// Shot origin and direction for the current camera mode.
function aimRay(){
  if(camMode==='fp'){const o=new T3.Vector3();camera.getWorldPosition(o);const fwd=new T3.Vector3(0,0,-1).applyQuaternion(camera.quaternion);return{o,fwd}}
  const o=new T3.Vector3(P.x,P.y+1.35,P.z);let tgt=P.aim?P.aim.clone():new T3.Vector3(P.x-Math.sin(P.yaw)*10,P.y+1.2,P.z-Math.cos(P.yaw)*10);
  const fwd=tgt.sub(o);if(fwd.lengthSq()<.01)fwd.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));fwd.normalize();return{o,fwd}}
function shoot(){
  const w=W();if(!w||fireCd>0||reloadT>0)return;
  if(w.melee){swing();return}
  if(!(S.mags[S.cur]>0)){if(S.ammo[w.ammo]>0)startReload();else{sfx('empty');fireCd=.25;if(fullMsgT<=0){toast(L('Sin {a}. Usá un arma cuerpo a cuerpo o comprá en el almacén.',{a:an(w.ammo)}),'#cc4b30');fullMsgT=3}}return}
  S.mags[S.cur]--;fireCd=w.rate;
  const ads=adsT>.6,moving=keys['w']||keys['a']||keys['s']||keys['d'];
  const spread=(ads?w.ads:w.hip)*(moving?1.6:1)*(P.onGround?1:2.2)*aimMult()*(camMode==='iso'?1.3:1);
  const {o,fwd}=aimRay();
  const up=Math.abs(fwd.y)>.99?new T3.Vector3(1,0,0):new T3.Vector3(0,1,0);const rt=new T3.Vector3().crossVectors(fwd,up).normalize();up.crossVectors(rt,fwd).normalize();
  const dm=(1+.15*PK('pulso'));
  if(w.grenade){const d=fwd.clone().addScaledVector(rt,(R()-.5)*2*spread).addScaledVector(up,(R()-.5)*2*spread+.06).normalize();launchGrenade(o.clone().addScaledVector(fwd,.8),d,w.dmg*dm);recoil+=w.recoil;vmKick=1;muzzleLight.intensity=3;sfx(w.snd);for(const e of enemies){if(!EDEF[e.type].neutral&&!e.dying&&Math.hypot(e.x-P.x,e.z-P.z)<w.noise)e.aggro=true}if(S.mags[S.cur]===0&&S.ammo[w.ammo]>0)setTimeout(()=>{if(S&&S.mags[S.cur]===0)startReload()},250);return}
  for(let i=0;i<w.pellets;i++){
    const d=fwd.clone().addScaledVector(rt,(R()-.5)*2*spread).addScaledVector(up,(R()-.5)*2*spread).normalize();
    const wall=rayObstacle(o,d,w.range);
    const hits=[];for(const e of enemies){if(e.dead||e.dying)continue;if(Math.hypot(e.x-o.x,e.z-o.z)>w.range+5)continue;const hs=hitSpheres(e);let best=-1,head=false;const th=raySphere(o,d,...hs.head);if(th>0){best=th;head=true}for(const b of hs.body){const tb=raySphere(o,d,...b);if(tb>0&&(best<0||tb<best-.05)){best=tb;head=false}}if(best>0&&best<wall)hits.push({e,t:best,head})}
    hits.sort((a,b)=>a.t-b.t);let pierce=w.pierce,endT=wall;
    for(const h of hits){let dmg=w.dmg*dm;if(h.head){dmg*=(w.scope?3:2.5)*(1+.3*PK('ojo'));S.stats.hs++;sfx('head');addSk('punteria',3)}else{sfx('hit',h.e.x,h.e.z);addSk('punteria',1.5)}if(w.pellets>1){dmg*=clamp(1.3-h.t/w.range,.35,1.3)}hurtEnemy(h.e,dmg,h.head,'p',wn(S.cur),w.ap);if(--pierce<=0){endT=h.t;break}}
    const end=o.clone().addScaledVector(d,Math.min(endT,w.range));if(endT<w.range&&!hits.length)burst(end.x,end.y,end.z,'#b8ac8a',3,1.5,.06);
    const start=camMode==='fp'?o.clone().addScaledVector(fwd,.6).addScaledVector(rt,.18).addScaledVector(up,-.15):o.clone().addScaledVector(fwd,.7);if(i<3)tracer(start,end);if(i===0)muzzleLight.position.copy(start)}
  recoil+=w.recoil*(ads?.6:1);recoilYaw+=(R()-.5)*w.recoil*.6;vmKick=1;muzzleLight.intensity=3;vmFlash.material.opacity=1;
  sfx(w.snd||S.cur);
  for(const e of enemies){if(!EDEF[e.type].neutral&&!e.dying&&Math.hypot(e.x-P.x,e.z-P.z)<w.noise)e.aggro=true}
  if(S.mags[S.cur]===0&&S.ammo[w.ammo]>0)setTimeout(()=>{if(S&&S.mags[S.cur]===0)startReload()},250);
}
let vmKick=0;
function startReload(){const w=W();if(!w||w.melee||reloadT>0||S.mags[S.cur]>=w.mag||S.ammo[w.ammo]<=0)return;reloadMax=w.reload*Math.pow(.8,PK('recarga'))*(1-.03*skLv('punteria'));reloadT=reloadMax;sfx('reload')}
function finishReload(){const w=W();if(!w||w.melee)return;const need=w.mag-(S.mags[S.cur]||0);const take=Math.min(need,S.ammo[w.ammo]);S.mags[S.cur]=(S.mags[S.cur]||0)+take;S.ammo[w.ammo]-=take}
function swing(){
  const k=S.cur,w=WEAP[k];fireCd=w.rate*(stamina<10?1.5:1);swingT=.3;sfx('swing');stamina=Math.max(0,stamina-4);
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);let hit=false;
  const dmg=w.dmg*(1+.3*PK('filo'))*(1+.06*skLv('melee'));
  for(const e of enemies){if(e.dead||e.dying)continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d>w.reach+e.r)continue;if((dx*fx+dz*fz)/d<.45)continue;
    const head=(camMode==='iso'||P.pitch>-.1)&&!EDEF[e.type].heavy&&R()<.22+(w.head||0)+.02*skLv('melee');hurtEnemy(e,dmg*(head?1.6:1),head,'p',wn(k),w.ap);if(head)S.stats.hs++;
    if(w.knock&&!EDEF[e.type].boss&&(!EDEF[e.type].heavy||w.ap)&&!EDEF[e.type].mini){e.knock=.25;e.kx=dx/d*w.knock*4;e.kz=dz/d*w.knock*4}else{e.x+=dx/d*.4;e.z+=dz/d*.4}
    sfx(w.knock?'blunt':'hit',e.x,e.z);hit=true;addSk('melee',2)}
  if(hit){wearWeapon(k,1);return}
  if(w.chop){const t=qTrees(P.x+fx*1.2,P.z+fz*1.2,t=>!t.rock&&Math.hypot(t.x-P.x,t.z-P.z)<2.6+t.r);if(t){t.hp-=w.chop*(1+.08*skLv('supervivencia'));sfx('chop');burst(t.x-fx*.3,P.y+1.2,t.z-fz*.3,'#8a6b45',5,2,.07);wearWeapon(k,.5);if(t.hp<=0){t.alive=false;setTreeVisible(t,false);S.chopped.push(trees.indexOf(t));sfx('tree');spawnPickup(t.x,t.z,'madera',rint(2,4));gainXp(3);addSk('supervivencia',4)}}}
}
function wearWeapon(k,n){if(S.dur[k]==null)return;S.dur[k]-=n*(1-.05*skLv('melee'))*(PK('filo')?.75:1);if(S.dur[k]<=0){S.weapons=S.weapons.filter(x=>x!==k);delete S.dur[k];sfx('break');toast(L('¡Se rompió: {w}!',{w:wn(k)}),'#cc4b30',4);S.cur=hotbar()[0]||null;equip()}}
function repairWeapon(k){if(!(S.inv.cinta>0)||S.dur[k]==null)return;S.inv.cinta--;S.dur[k]=Math.min(WEAP[k].dur,S.dur[k]+WEAP[k].dur*.35);sfx('build');toast(L('Reparaste: {w}.',{w:wn(k)}),'#8fbb62',2)}
function die(){
  gstate='dead';if(P.inTruck)exitTruck(true);document.exitPointerLock&&document.exitPointerLock();
  const lost=IK.filter(k=>S.inv[k]).map(k=>`${nm(k)} ×${S.inv[k]}`);const lostMoney=Math.round(S.money*.15);S.money-=lostMoney;S.inv={};S.wounds=[];S.sick=0;
  const infected=S.infect>=100;S.infect=0;
  $('deadEyebrow').textContent=L('Día {d}',{d:S.day})+` · ${pad(Math.floor(hourOf(S.t)))}:00`;
  $('deadText').textContent=(infected?L('La infección te ganó. Los caravaneros te encontraron y te curaron a medias.')+' ':'')+(lost.length?L('Perdiste lo que llevabas: {l}.',{l:lost.join(', ')}):L('No llevabas nada en la mochila.'))+(lostMoney?' '+L('Mientras estabas inconsciente te robaron ${m}.',{m:fmt(lostMoney)}):'');show('dead')}
function respawn(){S.hp=Math.round(maxHp()*.6);S.food=Math.max(S.food,40);S.water=Math.max(S.water,40);S.fat=Math.min(S.fat,50);P.x=0;P.z=-5;P.y=groundY(0,-5);invuln=3;
  enemies.forEach(e=>{if(!e.horde&&Math.hypot(e.x,e.z)<120){e.dead=true;scene.remove(e.mesh)}});
  enemies.forEach(e=>{if(e.horde&&Math.hypot(e.x,e.z)<30){e.x*=3;e.z*=3}});resume()}

// ================= VEHICLES =================
function enterTruck(v){if(v)truck=v;S.drive=truck.k;P.inTruck=true;truck.cabin.forEach(m=>m.visible=camMode==='iso');truck.dash.visible=camMode==='fp';truck.lookYaw=0;truck.lookPitch=-.05;truck.group.add(truckLight);engineSound(true,0);toast(L('W acelerar · S frenar o reversa · A/D doblar · E bajar'),'#dedcc9',4)}
function exitTruck(force){truckLight.intensity=0;
  const hw=truck.def.wid/2+1.2,hl=truck.def.len/2+1.2;
  const side=[[-hw,truck.def.cabZ-.6],[hw,truck.def.cabZ-.6],[0,-hl],[0,hl]];for(const [lx,lz] of side){const c=Math.cos(truck.yaw),s=Math.sin(truck.yaw);const x=truck.x+lx*c+lz*s,z=truck.z-lx*s+lz*c;if(force||!circleBlocked(x,z,.4,'p')){P.x=x;P.z=z;P.y=groundY(x,z);P.inTruck=false;truck.cabin.forEach(m=>m.visible=true);truck.dash.visible=false;P.yaw=truck.yaw+Math.PI;engineSound(false);truck.speed=0;return}}
  toast(L('No hay lugar para bajar acá.'),'#e3a33b')}
// Long vehicles collide with a circle at the front and one at the back.
function vehBlocked(v,x,z,yaw){const r=v.def.wid*.62,off=Math.max(0,v.def.len/2-r);const s=Math.sin(yaw),c=Math.cos(yaw);return circleBlocked(x+s*off,z+c*off,r,'t')||(off>.3&&circleBlocked(x-s*off,z-c*off,r,'t'))}
function updateTruck(dt){for(const v of vehicles)updateVehicle(v,dt)}
function updateVehicle(tr,dt){
  const def=tr.def,st=tr.st,driven=P.inTruck&&tr===truck;
  if(driven){
    const thr=(keys['w']?1:0)-(keys['s']?1:0),brake=keys[' '];
    if(st.fuel<=0&&thr!==0){if(fullMsgT<=0){toast(L('Sin nafta. Cargá combustible con G o desde el taller.'),'#cc4b30');fullMsgT=4}}
    else{const load=1-Math.min(.35,kgOf(st.cargo)/vehCap(tr)*.35);if(thr>0)tr.speed+=(tr.speed<0?18:def.acc*load)*dt;else if(thr<0)tr.speed-=(tr.speed>0?16:6)*dt}
    if(brake)tr.speed*=Math.pow(.05,dt);
    tr.speed*=Math.pow(.7,dt);if(!thr&&Math.abs(tr.speed)<.3)tr.speed=0;tr.speed=clamp(tr.speed,-7,def.max*(snowCover>.5&&def.bed!=='trailer'?.8:1));
    const st2=(keys['a']?1:0)-(keys['d']?1:0);tr.steer=lerp(tr.steer,st2*.55,Math.min(1,dt*6));
    st.fuel=Math.max(0,st.fuel-Math.abs(tr.speed)*dt*.012*def.fuel*(PK('conductor')?.6:1)*(720/CYCLE()*.5+.5));
    engineSound(true,tr.speed*26/def.max);
  }else if(tr.speed!==0){tr.speed*=Math.pow(.2,dt);if(Math.abs(tr.speed)<.2)tr.speed=0;tr.steer*=.9}
  if(tr.speed!==0){
    const wb=def.len*.6;const ny=tr.yaw+tr.speed*Math.tan(tr.steer)/wb*dt;
    const nx=tr.x+Math.sin(ny)*tr.speed*dt,nz=tr.z+Math.cos(ny)*tr.speed*dt;
    const hit=vehBlocked(tr,nx,nz,ny);
    if(hit){if(Math.abs(tr.speed)>6){sfx('crash',tr.x,tr.z);shake=Math.max(shake,.3)}tr.speed*=-.25}else{tr.x=nx;tr.z=nz;tr.yaw=ny}
    if(Math.abs(tr.speed)>3.5){const off=def.len/2-1;const fx=tr.x+Math.sin(tr.yaw)*off*Math.sign(tr.speed),fz=tr.z+Math.cos(tr.yaw)*off*Math.sign(tr.speed);
      for(const e of enemies){if(e.dead||e.dying)continue;const d=Math.hypot(e.x-fx,e.z-fz);if(d<def.wid*.85+e.r){const mass=def.cap>200?1.6:1;const dmg=Math.abs(tr.speed)*7*mass*(PK('conductor')?1.4:1);if(EDEF[e.type].heavy&&e.hp>dmg){tr.speed*=.3}else tr.speed*=.88;const wasAlive=!e.dying;hurtEnemy(e,dmg,false,'truck');if(wasAlive&&e.dying&&driven)S.stats.runover++;const a=Math.atan2(e.x-tr.x,e.z-tr.z);e.x+=Math.sin(a)*1.2;e.z+=Math.cos(a)*1.2;sfx('thud',e.x,e.z)}}}
  }
  if(!tr.placed||tr.speed!==0||driven){tr.placed=true;
    const c=Math.cos(tr.yaw),s=Math.sin(tr.yaw),hl=def.len/3,hw=def.wid/2;const hF=groundY(tr.x+s*hl,tr.z+c*hl),hB=groundY(tr.x-s*hl,tr.z-c*hl),hL=groundY(tr.x+c*hw,tr.z-s*hw),hR=groundY(tr.x-c*hw,tr.z+s*hw);
    tr.y=(hF+hB+hL+hR)/4;const g=tr.group;g.position.set(tr.x,tr.y,tr.z);g.rotation.set(0,0,0);g.rotateY(tr.yaw);g.rotateX(-Math.atan2(hF-hB,hl*2));g.rotateZ(Math.atan2(hL-hR,hw*2));
    tr.wheels.forEach((w,i)=>{w.children[0].rotation.x+=tr.speed*dt/.45;if(i<2)w.rotation.y=tr.steer})}
  const k=kgOf(st.cargo),cap=vehCap(tr);tr.cargoBoxes.forEach((b,i)=>b.visible=k>i*cap/tr.cargoBoxes.length*.9);
  if(driven)truckLight.intensity=darkness()>.3?2.2:0;
}
// ================= SHOP / CUSTOMERS =================
const PATH_IN=[{x:0,z:28},{x:0,z:-6.5},{x:0,z:-9.3},{x:CUST_SPOT.x,z:CUST_SPOT.z}];
const PATH_OUT=()=>[{x:0,z:-9.3},{x:0,z:-6.5},{x:0,z:40}];
function spawnCustomer(){const m=humanoid(['#4d6a7a','#7a5a4d','#5b6b45','#6a4d6a','#8a7a4a'][R()*5|0],'#c9a888',['#2f3a48','#3a3028','#2a2a2a'][R()*3|0],false);m.position.set(0,2,28);scene.add(m);customers.push({x:(R()-.5)*1.5,z:28,path:PATH_IN.slice(1),state:'in',t:0,mesh:m,anim:0,yaw:Math.PI})}
function updateCustomers(dt,h,threat){
  custT-=dt;if(custT<=0){custT=26/(1+S.rep*.07+S.upg.neon*.6)*(.6+R()*.8)*(CYCLE()/720*.6+.4);if(h>=7&&h<19&&!threat&&customers.length<4)spawnCustomer()}
  for(let i=customers.length-1;i>=0;i--){const c=customers[i];
    if(threat&&c.state!=='out'){c.state='out';c.path=PATH_OUT()}
    if(c.state==='buy'){c.t-=dt;if(c.t<=0){customerBuy(c);c.state='out';c.path=PATH_OUT()}}
    else{const tg=c.path[0];if(!tg){scene.remove(c.mesh);customers.splice(i,1);continue}const dx=tg.x-c.x,dz=tg.z-c.z,d=Math.hypot(dx,dz),sp=threat?4:1.6;
      if(d<.2){c.path.shift();if(!c.path.length){if(c.state==='in'){c.state='buy';c.t=2;c.yaw=Math.PI}else{scene.remove(c.mesh);customers.splice(i,1)}}continue}
      c.x+=dx/d*sp*dt;c.z+=dz/d*sp*dt;c.yaw=Math.atan2(dx,dz);c.anim+=dt*sp*3}
    const u=c.mesh.userData,s=Math.sin(c.anim);c.mesh.position.set(c.x,groundY(c.x,c.z),c.z);c.mesh.rotation.y=c.yaw;u.legs[0].rotation.x=s*.5;u.legs[1].rotation.x=-s*.5;u.arms[0].rotation.x=-s*.4;u.arms[1].rotation.x=s*.4}
}
function customerBuy(c){
  const stocked=S.shelves.filter(s=>s.item&&(S.stash[s.item]||0)>0);
  if(!stocked.length){S.rep=Math.max(0,S.rep-.15);logSale(L('Un cliente se fue sin nada: los estantes están vacíos.'),true);return}
  let tot=stocked.reduce((s,x)=>s+S.demand[x.item],0),r=R()*tot,sh=stocked[0];for(const x of stocked){if((r-=S.demand[x.item])<=0){sh=x;break}}
  const it=ITEMS[sh.item],price=Math.max(1,Math.round(it.v*sh.mult)),worth=it.v*S.demand[sh.item],tol=(.75+R()*.7)*(1+S.rep*.02)*(1+.08*PK('labia'));
  if(sh.item==='podrida'){S.rep=Math.max(0,S.rep-.4);logSale(L('Un cliente vio comida podrida en el estante y se fue enojado.'),true);return}
  if(price<=worth*tol){let q=1+(R()<.4?1:0)+(R()<.15?1:0);q=Math.min(q,S.stash[sh.item]);S.stash[sh.item]-=q;const total=price*q;S.money+=total;S.today+=total;S.stats.sold+=q;S.stats.earned+=total;S.rep=Math.min(20,S.rep+.03+.06*clamp(1.4-sh.mult,0,1));gainXp(Math.max(1,Math.round(total/10)));if(c)sfx('coin',CUST_SPOT.x,CUST_SPOT.z);logSale(L('Vendiste {i} ×{q} a ${p} c/u (total ${t}).',{i:nm(sh.item),q,p:price,t:total}));if(c&&Math.hypot(P.x,P.z)>60&&R()<.5)toast(L('Venta en el almacén: +${t}',{t:total}),'#e3a33b',2.5);refreshShelves()}
  else{S.rep=Math.max(0,S.rep-.06);logSale(L('Le pareció caro: {i} a ${p}. Se fue sin comprar.',{i:nm(sh.item),p:price}),true)}}
function logSale(t,bad){const h=hourOf(S.t);S.log.unshift({d:S.day,h:`${pad(Math.floor(h))}:${pad(Math.floor(h%1*6)*10)}`,t,bad:!!bad});if(S.log.length>40)S.log.pop()}
