'use strict';
// ================= v0.3: CALENDAR, SEASONS, TEMPERATURE, SNOW =================
// Day 1 is November 9. Every game day moves the calendar one day; seasons follow the southern hemisphere.
const START_DOY=312,MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
const doy=(day=S.day)=>(START_DOY+day-1)%365;
function dateOf(n){let m=0;while(n>=MDAYS[m]){n-=MDAYS[m];m++}return{d:n+1,m}}
function seasonOf(n){if(n>=263&&n<354)return 'primavera';if(n>=354||n<79)return 'verano';if(n<171)return 'otono';return 'invierno'}
const season=()=>S?seasonOf(doy()):'primavera';
const dateText=()=>{const t=dateOf(doy());return L('{d} de {m}',{d:t.d,m:L(MONTHS[t.m])})};
const SEASON_FX={
  primavera:{dinos:1,rot:1,wx:{lluvia:1.3,tormenta:1.6,niebla:.8},tint:[1,1.06,1],pine:0x2a3a24,broad:0x45632f},
  verano:{dinos:1.3,rot:1.5,wx:{despejado:1.5,tormenta:1.4,lluvia:.6,niebla:.3},tint:[1.12,1.04,.86],pine:0x2e3a22,broad:0x4e5a2a},
  otono:{dinos:1,rot:.8,wx:{nublado:1.4,niebla:1.9,lluvia:1.2},tint:[1.15,.95,.78],pine:0x2a3622,broad:0x8a5a26},
  invierno:{dinos:.6,rot:.5,wx:{niebla:1.5,nublado:1.3,tormenta:.3,lluvia:.8,despejado:.9,nieve:1},tint:[1.05,1.08,1.12],pine:0x26332a,broad:0x5a5040},
};
WEATHERS.nieve.w=.2;
let tempNow=18,heatOn=false,snowCover=0,snowPts=null,snowPos=null;
const dayNoise=d=>{const r=mulberry32((S.seed^Math.imul(d,2246822519))>>>0);return r()-.5};
function baseTemp(){const n=doy(),h=hourOf(S.t);const mean=15+10*Math.cos(2*Math.PI*(n-15)/365);return mean+6*Math.sin(2*Math.PI*(h-9)/24)+dayNoise(S.day)*5}
function weatherTemp(){const w=weatherFx();return baseTemp()-w.rain*3.5-w.snow*5-w.dim*3}
function updateTemp(dt){
  tempNow=weatherTemp();
  const sheltered=P.inTruck||insideBuilding(P.x,P.z)||(P.x>-6&&P.x<6&&P.z>-16&&P.z<-8);
  const te=tempNow+((S.inv.campera||0)>0?ITEMS.campera.warm:0)+(nearFire()?14:0)+(sheltered?8:0)-(S.wet>40?5:0);
  if(te<6){S.cold=Math.min(100,S.cold+dt*(6-te)*.25)}else S.cold=Math.max(0,S.cold-dt*(nearFire()?4:1.2));
  if(S.cold>70)S.hp-=.12*dt;
  const h=hourOf(S.t);heatOn=tempNow>30&&h>10&&h<18&&!sheltered&&weatherFx().rain<.3}
function buildSnow(){if(snowPts)return;const n=1600;snowPos=new Float32Array(n*3);for(let i=0;i<n;i++){snowPos[i*3]=(R()-.5)*60;snowPos[i*3+1]=R()*26;snowPos[i*3+2]=(R()-.5)*60}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(snowPos,3));snowPts=new T3.Points(g,new T3.PointsMaterial({color:0xf2f4f6,size:.13,transparent:true,opacity:0,depthWrite:false}));snowPts.frustumCulled=false;scene.add(snowPts)}
function updateSnow(dt){
  buildSnow();const w=weatherFx();
  if(w.snow>.5)snowCover=Math.min(1,snowCover+dt/(CYCLE()*.08));else if(tempNow>2)snowCover=Math.max(0,snowCover-dt/(CYCLE()*.12));
  S.snow=snowCover;if(terrainMesh){const c=snowCover*.42;terrainMesh.material.emissive.setRGB(c,c*1.02,c*1.06)}
  snowPts.visible=w.snow>.02;if(!snowPts.visible)return;snowPts.material.opacity=.85*w.snow;
  const f=2.4*dt;for(let i=0;i<snowPos.length;i+=3){snowPos[i+1]-=f;snowPos[i]+=Math.sin(time*.7+i)*dt*.4;if(snowPos[i+1]<-2)snowPos[i+1]=24+R()*4}
  snowPts.geometry.attributes.position.needsUpdate=true;snowPts.position.set(camera.position.x,camera.position.y-6,camera.position.z)}
function applySeason(){if(!terrainMesh)return;const fx=SEASON_FX[season()];terrainMesh.material.color.setRGB(...fx.tint);pineMat.color.setHex(fx.pine);broadMat.color.setHex(fx.broad);snowCover=S.snow||0}

// ================= VEHICLES (state) =================
function initVehicles(){
  for(const v of vehicles){let st=S.veh[v.k];if(!st){st={x:v.spot[0],z:v.spot[1],yaw:v.spot[2],fuel:v.k==='pickup'?70:rint(6,22),cargo:{},broken:!!VEH[v.k].broken};S.veh[v.k]=st}
    v.st=st;v.x=st.x;v.z=st.z;v.yaw=st.yaw;v.speed=0;v.steer=0;v.placed=false;updateVehicle(v,0)}
  truck=vehicles.find(v=>v.k===S.drive)||vehicles[0];truck.group.add(truckLight);truckLight.intensity=0}
const vehNear=(x,z,r)=>vehicles.filter(v=>Math.hypot(v.x-x,v.z-z)<r);
const vName=v=>L(VEH[v.k].n);
function repairVehicle(v){S.inv.chatarra-=4;v.st.broken=false;sfx('build');addSk('carpinteria',10);gainXp(20);toast(L('Arreglaste: {v}. Ya podés manejarlo.',{v:vName(v)}),'#8fbb62',5)}
function vehInteract(look){
  let best=null;for(const v of vehicles){if(look(v.x,v.z,v.def.len/2+1.6)){best=v;break}}if(!best)return null;const v=best,st=v.st;
  if(st.broken){const ok=(S.inv.herramientas||0)>0&&(S.inv.chatarra||0)>=4;return ok?{label:L('Mantené E · Reparar: {v}',{v:vName(v)}),sub:L('Usa 4 chatarra'),hold:4,key:'fix'+v.k,type:'fix',act:()=>repairVehicle(v)}:{label:vName(v)+' · '+L('Roto'),sub:L('Para arreglarlo llevá una caja de herramientas y 4 chatarra en la mochila.')}}
  const hasFuel=(S.inv.combustible||0)>0;
  return{label:L('E · Subir: {v}',{v:vName(v)}),sub:L('Nafta {n}%',{n:Math.round(st.fuel)})+' · '+L('Carga {n} kg',{n:vehCap(v)})+(hasFuel&&st.fuel<99?' · '+L('G · Cargar 1 combustible'):''),act:()=>enterTruck(v),alt:hasFuel?()=>{S.inv.combustible--;st.fuel=Math.min(100,st.fuel+30);toast(L('Cargaste nafta: +30%.'),'#c98b2b',2)}:null}}

// ================= PROJECTILES & EXPLOSIONS =================
let projs=[];const SPIT_GEO=new T3.SphereGeometry(.18,6,5),GREN_GEO=new T3.SphereGeometry(.12,6,5);
const boomLight=new T3.PointLight(0xffa040,0,30,2);scene.add(boomLight);
function launchGrenade(o,d,dmg){const m=new T3.Mesh(GREN_GEO,mat('#3a4030'));m.position.copy(o);scene.add(m);projs.push({kind:'grenade',x:o.x,y:o.y,z:o.z,vx:d.x*34,vy:d.y*34+2,vz:d.z*34,life:4,mesh:m,dmg})}
function spitAt(e){const d=EDEF[e.type],hs=hitSpheres(e).head;const n=d.spit||1;sfx('spit',e.x,e.z);
  const tx=(P.inTruck?truck.x:P.x),tz=(P.inTruck?truck.z:P.z),ty=(P.inTruck?truck.y+1.5:P.y+1.3);
  for(let i=0;i<n;i++){const a=Math.atan2(tx-hs[0],tz-hs[2])+(i-(n-1)/2)*.18;const dist=Math.hypot(tx-hs[0],tz-hs[2]);const sp=18,t=dist/sp;
    const m=new T3.Mesh(SPIT_GEO,new T3.MeshBasicMaterial({color:0x9ad04a}));m.position.set(hs[0],hs[1],hs[2]);scene.add(m);
    projs.push({kind:'spit',x:hs[0],y:hs[1],z:hs[2],vx:Math.sin(a)*sp,vz:Math.cos(a)*sp,vy:(ty-hs[1])/t+3*t,life:3,mesh:m,dmg:e.dmg})}}
function updateProjectiles(dt){
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.life-=dt;p.vy-=(p.kind==='spit'?6:9.8)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.mesh.position.set(p.x,p.y,p.z);
    let hit=p.life<=0||p.y<terrainY(p.x,p.z);
    if(!hit&&p.kind==='spit'){const px=P.inTruck?truck.x:P.x,pz=P.inTruck?truck.z:P.z,py=(P.inTruck?truck.y+1.5:P.y+1);if(Math.hypot(p.x-px,p.z-pz)<(P.inTruck?2:.8)&&Math.abs(p.y-py)<1.2){hurtPlayer(p.dmg);S.sick=Math.min(100,S.sick+14);hurtFx=1;hit=true}}
    if(!hit&&p.kind==='grenade'){for(const e of enemies){if(e.dead||e.dying)continue;if(Math.abs(e.x-p.x)>6||Math.abs(e.z-p.z)>6)continue;const hs=hitSpheres(e);if([hs.head,...hs.body].some(s=>(s[0]-p.x)**2+(s[1]-p.y)**2+(s[2]-p.z)**2<(s[3]+.2)**2)){hit=true;break}}
      if(!hit)for(const b of qAABB(p.x,p.z)){if(!b.dead&&b.kind!=='floor'&&p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1&&p.y>b.y0&&p.y<b.y1){hit=true;break}}}
    if(hit){scene.remove(p.mesh);projs.splice(i,1);if(p.kind==='grenade')explode(p.x,Math.max(p.y,terrainY(p.x,p.z)+.3),p.z,5.5,p.dmg,'p');else burst(p.x,p.y,p.z,'#9ad04a',6,2)}}
  boomLight.intensity=Math.max(0,boomLight.intensity-dt*12)}
function explode(x,y,z,r,dmg,src,toxic){
  sfx('boom',x,z);boomLight.position.set(x,y+1,z);boomLight.intensity=6;
  burst(x,y,z,toxic?'#9ad04a':'#f0a030',14,6,.16,6);burst(x,y,z,'#4a4a44',10,4,.2,3);
  const dP=Math.hypot(P.x-x,P.z-z);shake=Math.max(shake,clamp(1-dP/40,0,.7));
  for(const e of enemies){if(e.dead||e.dying)continue;const d=Math.hypot(e.x-x,e.z-z)-e.r;if(d<r){hurtEnemy(e,dmg*clamp(1.15-d/r,.25,1),false,src==='p'?'p':'x',L('Explosión'),true)}}
  if(dP<r&&!P.inTruck&&gstate==='play'){hurtPlayer(dmg*(src==='p'?.35:.8)*clamp(1-dP/r,.15,1));if(toxic)S.sick=Math.min(100,S.sick+30)}
  for(const b of builds){if(b.hp&&Math.hypot(b.x-x,b.z-z)<r*.6)damageBuild(b,dmg*.5)}}
function screamAt(e){const d=EDEF[e.type];sfx('scream',e.x,e.z);
  for(const o of enemies){if(o===e||o.dying||EDEF[o.type].neutral)continue;if(Math.hypot(o.x-e.x,o.z-e.z)<55)o.aggro=true}
  if(Math.hypot(P.x-e.x,P.z-e.z)<30)S.panic=Math.min(100,S.panic+12);
  if(d.summon&&(e.summoned||0)<(d.boss?18:9)){const n=d.boss?3:2;e.summoned=(e.summoned||0)+n;for(let i=0;i<n;i++){const a=R()*6.28;const s=spawnEnemy(R()<.3?'corredor':'caminante',e.x+Math.cos(a)*6,e.z+Math.sin(a)*6);s.aggro=true;burst(s.x,s.y+.5,s.z,'#8fbb62',6,2)}}}
function slam(e){const sc=e.scale||1;sfx('boom',e.x,e.z);burst(e.x,e.y+.3,e.z,'#6b5638',18,7,.2,8);
  const fx=e.x+Math.sin(e.yaw)*2*sc,fz=e.z+Math.cos(e.yaw)*2*sc;const d=Math.hypot(P.x-fx,P.z-fz);shake=Math.max(shake,.5);
  if(d<8&&!P.inTruck){hurtPlayer(14+22*(1-d/8),e);P.vy=5;P.onGround=false}
  for(const b of builds){if(b.hp&&Math.hypot(b.x-fx,b.z-fz)<6)damageBuild(b,120)}}

// ================= MINIBOSS ZONES & SUMMONED BOSSES =================
let lairRT={},lairT=0,summon=null;
function updateLairs(dt){
  if(summon){summon.t-=dt;if(summon.t<=0){const k=summon.k;summon=null;const a=R()*6.28;const e=spawnEnemy(k,altar.x+Math.cos(a)*16,altar.z+Math.sin(a)*16);e.home={x:altar.x,z:altar.z};e.aggro=true;S.boss=k;sfx('roar');shake=.8;toast(L('¡{n} despertó!',{n:L(EDEF[k].n)}),'#cc4b30',7)}}
  lairT-=dt;if(lairT>0)return;lairT=1;
  for(const v of vehicles)if(!v.st.seen&&Math.hypot(v.x-P.x,v.z-P.z)<70)v.st.seen=true;
  for(const l of lairs){const dist=Math.hypot(l.x-P.x,l.z-P.z);let rt=lairRT[l.k];const last=S.lairs[l.k];const ready=last==null||S.day-last>=3;
    if(rt&&(rt.boss.dead||rt.boss.dying)){if(dist>230)delete lairRT[l.k];continue}
    if(!rt&&ready&&dist<110){const bk=LAIRS[l.k].boss,d=EDEF[bk];const boss=spawnEnemy(bk,l.x,l.z);boss.home={x:l.x,z:l.z};boss.lair=l.k;const list=[boss];
      if(d.esc)for(let i=0;i<d.esc[1];i++){const a=i/d.esc[1]*6.283;const e=spawnEnemy(d.esc[0],l.x+Math.cos(a)*7,l.z+Math.sin(a)*7);e.home={x:l.x,z:l.z};list.push(e)}
      lairRT[l.k]={boss,list};if(!l.warned){l.warned=true;toast(L('Zona peligrosa: {z}. Acá vive {n}.',{z:L(LAIRS[l.k].n),n:L(d.n)}),'#cc4b30',7)}}
    else if(rt&&dist>230){rt.list.forEach(e=>{if(!e.dying&&!e.dead){e.dead=true;scene.remove(e.mesh)}});delete lairRT[l.k];l.warned=false}}
  if(S.boss){const b=enemies.find(e=>e.type===S.boss&&!e.dead&&!e.dying);const far=Math.hypot(P.x-altar.x,P.z-altar.z)>320;
    if(!b||far||gstate==='dead'){if(b){b.dead=true;scene.remove(b.mesh)}toast(L('{n} volvió a dormir bajo la Piedra Verde. El tributo se perdió.',{n:L(EDEF[S.boss].n)}),'#e3a33b',6);S.boss=null}}}
const tributeHave=k=>(S.inv[k]||0)+vehNear(altar.x,altar.z,45).reduce((s,v)=>s+(v.st.cargo[k]||0),0);
function takeTribute(k,q){let left=q;const a=Math.min(left,S.inv[k]||0);S.inv[k]=(S.inv[k]||0)-a;left-=a;for(const v of vehNear(altar.x,altar.z,45)){const b=Math.min(left,v.st.cargo[k]||0);v.st.cargo[k]=(v.st.cargo[k]||0)-b;left-=b}}
function openAltar(msg){gstate='altar';mouse.down=false;unlock();
  $('altarBody').innerHTML=(msg?`<div class="banner">${esc(msg)}</div>`:'')+`<p class="note">${esc(L('Los trofeos de los minijefes y lo que sueltan los enemigos comunes despiertan a los jefes. Tienen que estar en tu mochila o en un vehículo estacionado cerca de la piedra.'))}</p><div class="list">`+Object.entries(SUMMONS).map(([k,s])=>{
    const ok=Object.entries(s.need).every(([i,q])=>tributeHave(i)>=q)&&!S.boss&&!summon;
    return `<div class="item"><h3>${esc(L(s.n))}</h3><p>${esc(L(s.d))}</p><p>${Object.entries(s.need).map(([i,q])=>{const h=tributeHave(i);return `<span style="color:${h>=q?'#8fbb62':'#cc4b30'}">${esc(nm(i))} ${Math.min(h,q)}/${q}</span>`}).join(' · ')}</p><div class="meta"><span>${S.boss===k?esc(L('Ya está despierto.')):''}</span>${btn(L('Invocar'),'summon',`data-k="${k}" ${ok?'':'disabled'}`,ok?'small primary':'small')}</div></div>`}).join('')+'</div>';
  show('altar')}
$('altar').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(b.dataset.a==='altarclose'){resume();return}
  if(b.dataset.a==='summon'){const k=b.dataset.k,s=SUMMONS[k];if(S.boss||summon)return;Object.entries(s.need).forEach(([i,q])=>takeTribute(i,q));summon={k,t:4};sfx('night');resume();toast(L('La Piedra Verde brilla. Algo despierta bajo la tierra…'),'#9fd27a',5)}});
function altarInteract(look){if(!altar||!look(altar.x,altar.z,5))return null;return{label:L('E · Piedra Verde'),sub:S.boss?L('Hay un jefe despierto.'):L('Invocá a un jefe con trofeos'),act:()=>openAltar()}}

// ================= HUD EXTRAS =================
function updateBossBar(){let best=null,bd=75;for(const e of enemies){const d=EDEF[e.type];if(!(d.mini||d.boss)||e.dying||e.dead)continue;const dist=Math.hypot(e.x-P.x,e.z-P.z);if(dist<bd&&(e.aggro||dist<45)){bd=dist;best=e}}
  const el=$('bossBar');el.hidden=!best;if(best){el.querySelector('b').textContent=L(EDEF[best.type].n);el.querySelector('i').style.width=clamp(best.hp/best.maxHp*100,0,100)+'%';el.classList.toggle('boss',!!EDEF[best.type].boss)}}
function compassExtras(mark){
  for(const l of lairs){if(!lairSeen(l))continue;const d=Math.hypot(l.x-P.x,l.z-P.z);if(d>40&&d<450)mark(l.x,l.z,'#b04a3a','☠')}
  if(altar&&altarSeen()){const d=Math.hypot(altar.x-P.x,altar.z-P.z);if(d>40)mark(altar.x,altar.z,'#7aff5a','◆')}
  for(const v of vehicles){if(v===truck&&P.inTruck)continue;if(!v.st.seen&&v.k!=='pickup')continue;const d=Math.hypot(v.x-P.x,v.z-P.z);if(d>15&&d<400)mark(v.x,v.z,v.k==='pickup'?'#c9614a':'#b08a5a')}
  for(const e of enemies)if(EDEF[e.type].boss&&!e.dying)mark(e.x,e.z,'#ff4a2a',e.type==='rex'?'REX':'☠')}
const seenAt=(x,z)=>{const i=Math.floor((z+HALF)/10)*EXW+Math.floor((x+HALF)/10);return explored&&explored[i]};
const lairSeen=l=>seenAt(l.x,l.z);const altarSeen=()=>seenAt(altar.x,altar.z);
function mapExtras(m,X,Z,label){
  for(const l of lairs){if(!lairSeen(l))continue;const last=S.lairs[l.k],calm=last!=null&&S.day-last<3;m.fillStyle=calm?'#6a6a60':'#b04a3a';m.beginPath();m.arc(X(l.x),Z(l.z),7,0,6.283);m.fill();label(L(LAIRS[l.k].n)+(calm?' · '+L('tranquila'):''),X(l.x),Z(l.z)-12)}
  if(altarSeen()){m.fillStyle='#7aff5a';m.fillRect(X(altar.x)-5,Z(altar.z)-5,10,10);label(L('Piedra Verde'),X(altar.x),Z(altar.z)-12)}
  for(const v of vehicles){if(!v.st.seen&&v.k!=='pickup')continue;m.fillStyle=v.k==='pickup'?'#c9614a':'#b08a5a';m.fillRect(X(v.x)-4,Z(v.z)-4,8,8)}}
function weatherLine(){return `${dateText()} · ${L(SEASONS[season()].n)} · ${Math.round(tempNow)} °C · ${L(WEATHERS[S.weather.k].n)}`}
