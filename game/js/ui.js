'use strict';
// ================= INPUT =================
const ISO_A=Math.PI/4,ISO_EL=.95;let isoDist=24;
function typing(e){const t=e.target;return t&&(t.tagName==='TEXTAREA'||t.tagName==='INPUT'||t.tagName==='SELECT')}
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();if(typing(e)&&k!=='escape')return;
  if(k===' '||k==='tab'||k==='/'||k==="'"||(k==='f'&&e.ctrlKey))e.preventDefault();
  if(!keys[k])pressed[k]=true;keys[k]=true;
  if(k==='escape'){if(gstate==='panel')closePanel();else if(['inv','map','loot','altar'].includes(gstate))resume();else if(gstate==='pause')resume();else if(gstate==='options')closeOptions();else if(gstate==='newgame')toMenu();else if(gstate==='play'&&noLock())openPause()}
  else if(k==='e'&&gstate==='panel'){closePanel();pressed={}}
  else if(k==='e'&&(gstate==='loot'||gstate==='altar')){resume();pressed={}}
  else if(k==='tab'){if(gstate==='play')openInv('items');else if(gstate==='inv'||gstate==='loot')resume()}
  else if(k==='m'){if(gstate==='play')openMap();else if(gstate==='map')resume()}
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;mouse.right=false});
document.addEventListener('mousemove',e=>{mouse.sx=e.clientX;mouse.sy=e.clientY;if(!locked||gstate!=='play'||camMode!=='fp')return;const s=.0022*settings.sens*(adsT>.6?((W()&&W().fov)||60)/72*settings.sensAds:1);const my=e.movementY*(settings.invertY?-1:1);
  if(P.inTruck){truck.lookYaw=clamp(truck.lookYaw-e.movementX*s,-2,2);truck.lookPitch=clamp(truck.lookPitch-my*s,-.8,.6)}
  else{P.yaw-=e.movementX*s;P.pitch=clamp(P.pitch-my*s,-1.5,1.5)}});
cv.addEventListener('mousedown',e=>{initAudio();if(gstate!=='play')return;if(e.button===0){mouse.down=true;mouse.clicked=true}if(e.button===2)mouse.right=true});
addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;if(e.button===2)mouse.right=false});
addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{if(gstate!=='play')return;if(buildMode){buildSel=(buildSel+(e.deltaY>0?1:-1)+BORDER.length)%BORDER.length;renderBuildBar();return}
  if(camMode==='iso'){isoDist=clamp(isoDist+(e.deltaY>0?2:-2),12,44);return}if(P.inTruck)return;
  const own=hotbar();if(!own.length)return;const i=own.indexOf(S.cur);switchWeapon(own[(i+(e.deltaY>0?1:-1)+own.length)%own.length])},{passive:true});
function requestLock(){try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;if(locked){if(gstate==='wait'){gstate='play';$('wait').hidden=true}}else{if(gstate==='play'&&!noLock())openPause()}});
document.addEventListener('pointerlockerror',()=>{if(gstate==='wait')$('wait').hidden=false});
$('wait').addEventListener('click',()=>{initAudio();requestLock()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&!['menu','loading','newgame','options'].includes(gstate)){if(gstate==='play')openPause();saveGame(true)}});
function toggleCam(){camMode=camMode==='fp'?'iso':'fp';settings.cam=camMode;saveSettings();
  if(P.inTruck){truck.cabin.forEach(m=>m.visible=camMode==='iso');truck.dash.visible=camMode==='fp'}
  document.body.classList.toggle('iso',camMode==='iso');
  if(camMode==='iso'){unlock();gstate='play';toast(L('Vista de arriba: apuntás con el mouse. Rueda para acercar.'),'#dedcc9',3)}else{P.pitch=0;resume()}}

// ================= UPDATE =================
let goalCheck=0;
function update(dt){
  time+=dt;
  const C=CYCLE();const prevH=hourOf(S.t);S.t+=dt;if(S.t>=C){S.t-=C;newDay()}onHour(prevH,hourOf(S.t));
  fireCd-=dt;swingT-=dt;healCd-=dt;invuln-=dt;lastHitT+=dt;fullMsgT-=dt;lootMsgT-=dt;
  if(reloadT>0){reloadT-=dt;if(reloadT<=0){reloadT=0;finishReload()}}
  updateWeather(dt);
  updateBody(dt);if(gstate!=='play')return;
  if(P.inTruck){updateTruck(dt);P.x=truck.x;P.z=truck.z}
  else{
    let mx=(keys['d']?1:0)-(keys['a']?1:0),mz=(keys['s']?1:0)-(keys['w']?1:0);const moving=mx||mz;if(moving){const l=Math.hypot(mx,mz);mx/=l;mz/=l}
    if(pressed['c']){P.crouch=!P.crouch;toast(P.crouch?L('Agachado: hacés menos ruido.'):L('De pie.'),'#dedcc9',1.5)}
    const stamMax=100*(1+.3*PK('pulmon'))*(1+.05*skLv('atletismo'));const tired=S.fat>60?.7:1;
    const sprint=keys['shift']&&moving&&stamina>1&&adsT<.3&&!overW()&&(camMode==='iso'||mz<0);if(sprint)P.crouch=false;
    if(sprint){stamina=Math.max(0,stamina-22*dt);addSk('atletismo',dt*.5)}else stamina=Math.min(stamMax,stamina+(moving?12:20)*dt*tired);
    let sp=4.6*(1+.08*PK('piernas'))*(1+.01*skLv('atletismo'))*(sprint?1.65:1)*(adsT>.5?.55:1)*(reloadT>0?.85:1)*(S.food<=0||S.water<=0?.8:1)*(overW()?.75:1)*(S.fat>85?.85:1)*(P.crouch?.55:1);
    let wx,wz;
    if(camMode==='iso'){const fx=-Math.sin(ISO_A),fz=-Math.cos(ISO_A),rx=Math.cos(ISO_A),rz=-Math.sin(ISO_A);wx=(fx*-mz+rx*mx)*sp*dt;wz=(fz*-mz+rz*mx)*sp*dt;updateIsoAim()}
    else{const c=Math.cos(P.yaw),s=Math.sin(P.yaw);wx=(mx*c+mz*s)*sp*dt;wz=(-mx*s+mz*c)*sp*dt}
    if(moving){moveCircle(P,wx,wz,.4,'p');P.bob+=dt*sp*1.8;stepT-=dt*sp;if(stepT<=0&&P.onGround){stepT=2.2;if(!P.crouch)sfx('step')}}
    const gy=groundY(P.x,P.z);
    if(pressed[' ']&&P.onGround){P.vy=6;P.onGround=false;P.crouch=false;sfx('jump')}
    P.vy-=18*dt;P.y+=P.vy*dt;if(P.y<=gy){if(!P.onGround&&P.vy<-12){hurtPlayer((-P.vy-12)*4)}P.y=gy;P.vy=0;P.onGround=true}else if(P.y-gy>.35&&P.vy<=0)P.onGround=false;
    if(P.onGround&&P.y-gy<.4)P.y=gy;
    updateTruck(dt);
    const w=W();
    adsT=clamp(adsT+(mouse.right&&w&&!w.melee&&!buildMode&&reloadT<=0?dt*6:-dt*8),0,1);
    if(buildMode){updateGhost();const t=BORDER[buildSel];if(mouse.clicked&&ghost.userData.ok){payCost(BUILDS[t].cost);placeBuild(t,ghost.userData.x,ghost.userData.z,buildRot);toast(L('Construiste: {b}.',{b:L(BUILDS[t].n)}),'#8fbb62',2)}else if(mouse.clicked)toast(buildBlockReason(t)||L('No se puede construir ahí.'),'#e3a33b',2);if(pressed['r'])buildRot+=Math.PI/2;BORDER.forEach((k,i)=>{if(pressed[String(i+1)]){buildSel=i;renderBuildBar()}})}
    else{
      if(w&&((w.melee||w.auto)?mouse.down:mouse.clicked))shoot();
      if(pressed['r'])startReload();
      const hb=hotbar();for(let i=0;i<9;i++)if(pressed[String(i+1)]&&hb[i])switchWeapon(hb[i]);
      if(pressed['q'])switchWeapon(S.weapons.includes(lastWeapon)?lastWeapon:hb[0]);
    }
    if(pressed['b']){buildMode=!buildMode;$('buildBar').hidden=!buildMode;if(buildMode)renderBuildBar();else if(ghost){scene.remove(ghost);ghost=null}equip()}
    if(pressed['h'])treat();
    if(pressed['x'])autoConsume();
    if(pressed['l']){if(S.battery<=0&&S.inv.pilas>0){S.inv.pilas--;S.battery=100;flashOn=true;toast(L('Cambiaste las pilas de la linterna.'),'#8fbb62',2)}else if(S.battery<=0)toast(L('La linterna no tiene pilas.'),'#cc4b30',2);else{flashOn=!flashOn;toast(flashOn?L('Linterna prendida'):L('Linterna apagada'),'#dedcc9',1.5)}}
    if(pressed['t']&&S.pet){S.pet.mode=S.pet.mode==='follow'?'guard':'follow';toast(S.pet.mode==='follow'?L('{n} te sigue.',{n:S.pet.name}):L('{n} se queda cuidando el almacén.',{n:S.pet.name}),'#8fbb62',3)}
  }
  // flashlight battery
  if(flashOn&&darkness()>.3&&!P.inTruck){S.battery=Math.max(0,S.battery-dt*100/(CYCLE()*.9)*(S.upg.linterna?.6:1));if(S.battery<=0&&fullMsgT<=0){toast(L('Se agotaron las pilas de la linterna. Con L cambiás si tenés repuesto.'),'#e3a33b',4);fullMsgT=4}}
  handleInteract(dt);
  for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.age+=dt;const px=P.inTruck?truck.x:P.x,pz=P.inTruck?truck.z:P.z;const d=Math.hypot(p.x-px,p.z-pz);
    p.mesh.rotation.y+=dt*2;p.mesh.position.y=p.y+.35+Math.sin(time*3+p.bob)*.08;
    const reach=P.inTruck?3.6:1.5;
    if(d<4.5&&p.age>.4&&!p.blocked&&!P.inTruck){p.x+=(px-p.x)*Math.min(1,dt*5);p.z+=(pz-p.z)*Math.min(1,dt*5);p.mesh.position.x=p.x;p.mesh.position.z=p.z}
    if(d<reach&&p.age>.4){
      if(p.item.startsWith('ammo:')){const a=p.item.slice(5);S.ammo[a]+=p.qty;toast(`+${p.qty} ${an(a)}`,'#d9c38a',1.6);sfx('pickup');scene.remove(p.mesh);pickups.splice(i,1)}
      else if(p.item.startsWith('w:')){giveWeapon(p.item.slice(2));sfx('pickup');scene.remove(p.mesh);pickups.splice(i,1)}
      else{const left=P.inTruck?addTo(truck.st.cargo,vehCap(truck),p.item,p.qty):addInv(p.item,p.qty);const got=p.qty-left;if(got>0){toast(`+${got} ${nm(p.item)}${P.inTruck?' ('+L('a la caja')+')':''}`,ITEMS[p.item].c,1.6);sfx('pickup')}
        if(left>0){p.qty=left;p.blocked=true;if(fullMsgT<=0){toast(P.inTruck?L('La caja de la camioneta está llena.'):L('Llevás demasiado peso. Dejá cosas o cargalas en la camioneta.'),'#e3a33b');fullMsgT=4}}else{scene.remove(p.mesh);pickups.splice(i,1)}}
    }else if(d>=5)p.blocked=false;
    if(p.age>300){scene.remove(p.mesh);pickups.splice(i,1)}}
  // spawning
  spawnT-=dt;if(spawnT<=0){spawnT=2.5;const near=Math.abs(P.z-TOWN_Z)<160&&Math.abs(P.x-roadX(P.z))<160;const pop=enemies.filter(e=>!e.horde&&!e.dying).length;const target=(16+Math.min(22,S.day*2)+(isNight()?6:0)+(near?14:0))*SB('zpop');if(pop<target){if(near&&R()<.6)spawnTown(false);else spawnDay(false)}}
  if(hordeLeft>0){hordeT-=dt;if(hordeT<=0){hordeT=Math.max(2,180/(6+S.day*4))*2.6*(.6+R()*.8)*(CYCLE()/720*.5+.5);spawnHordeGroup()}}
  for(const e of enemies)if(!e.dead)updateEnemy(e,dt);
  for(let i=0;i<enemies.length;i++){const a=enemies[i];if(a.dying||a.dead)continue;for(let j=i+1;j<enemies.length;j++){const b=enemies[j];if(b.dying||b.dead)continue;const dx=b.x-a.x,dz=b.z-a.z,rr=a.r+b.r;if(Math.abs(dx)>rr||Math.abs(dz)>rr)continue;const d=Math.hypot(dx,dz)||1;if(d<rr){const push=(rr-d)/2,nx=dx/d,nz=dz/d;moveCircle(a,-nx*push,-nz*push,a.r,'e');moveCircle(b,nx*push,nz*push,b.r,'e')}}}
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.dead){enemies.splice(i,1);continue}if(!e.horde&&!e.aggro&&!e.angry&&!e.dying&&Math.hypot(e.x-P.x,e.z-P.z)>260){scene.remove(e.mesh);enemies.splice(i,1)}}
  groanT-=dt;if(groanT<=0){groanT=2+R()*4;const near=enemies.filter(e=>!e.dying&&EDEF[e.type].kind!=='d'&&Math.hypot(e.x-P.x,e.z-P.z)<45);if(near.length){const e=near[R()*near.length|0];sfx(e.type.startsWith('raptor')?'shriek':e.type==='rex'?'roar':'groan',e.x,e.z)}}
  updateProjectiles(dt);updateLairs(dt);
  updatePet(dt);
  for(let i=0;i<S.upg.torreta;i++){const tu=turrets[i];tu.cd-=dt;let best=null,bd=40;for(const e of enemies){if(e.dying||e.dead||(EDEF[e.type].neutral&&!e.angry)||e.stun>0)continue;const d=Math.hypot(e.x-tu.x,e.z-tu.z);if(d<bd){bd=d;best=e}}
    if(best){const a=Math.atan2(best.x-tu.x,best.z-tu.z);tu.yaw+=clamp(angDiff(tu.yaw,a),-6*dt,6*dt);tu.head.rotation.y=tu.yaw;if(tu.cd<=0&&Math.abs(angDiff(tu.yaw,a))<.15){tu.cd=.55;hurtEnemy(best,14+S.day*1.5,false,'t');tracer(new T3.Vector3(tu.x+Math.sin(tu.yaw)*1.1,tu.y,tu.z+Math.cos(tu.yaw)*1.1),new T3.Vector3(best.x,best.y+1,best.z));sfx('turret',tu.x,tu.z)}}}
  const h=hourOf(S.t);const threat=enemies.some(e=>!e.dying&&!(EDEF[e.type].neutral&&!e.angry)&&Math.hypot(e.x,e.z)<45);updateCustomers(dt,h,threat);
  goalCheck-=dt;if(goalCheck<=0){goalCheck=2;GOALS.forEach(g=>{if(!S.goals.includes(g.id)&&g.test()){S.goals.push(g.id);S.money+=g.r;sfx('goal');toast(L('Meta cumplida: {g}. Premio ${r}.',{g:L(g.n),r:g.r}),'#e3a33b',6)}})}
  exploreT-=dt;if(exploreT<=0){exploreT=.5;const rad=isNight()?3:6;const cx=Math.floor((P.x+HALF)/10),cz=Math.floor((P.z+HALF)/10);for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){if(i*i+j*j>rad*rad)continue;const x=cx+i,z=cz+j;if(x>=0&&z>=0&&x<EXW&&z<EXW)explored[z*EXW+x]=1}}
  for(const b of builds){if(b.t==='fogata'){b.light.intensity=1.6*(.85+Math.sin(time*13+b.x)*.15);b.fire.scale.y=.5*(.85+Math.sin(time*11+b.z)*.2)}}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.life-=dt;if(p.life<=0){p.m.visible=false;parts.splice(i,1)}}
  for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.life-=dt;if(t.life<=0){scene.remove(t.l);t.l.geometry.dispose();tracers.splice(i,1)}}
  shake*=Math.pow(.02,dt);hurtFx=Math.max(0,hurtFx-dt*1.5);
  if(pendingLevels>0&&gstate==='play')openLevelUp();
}
// Isometric aim: what is under the cursor (an enemy first, otherwise the ground at chest height).
const rc=new T3.Raycaster(),ndc=new T3.Vector2();
function updateIsoAim(){
  ndc.set(mouse.sx/innerWidth*2-1,-(mouse.sy/innerHeight)*2+1);rc.setFromCamera(ndc,camera);const o=rc.ray.origin,d=rc.ray.direction;
  let best=null,bt=1e9;for(const e of enemies){if(e.dead||e.dying)continue;if(Math.abs(e.x-P.x)>60||Math.abs(e.z-P.z)>60)continue;const hs=hitSpheres(e);for(const s of [hs.head,...hs.body]){const t=raySphere(o,d,s[0],s[1],s[2],s[3]*1.3);if(t>0&&t<bt){bt=t;best=s}}}
  if(best)P.aim=new T3.Vector3(best[0],best[1],best[2]);
  else{const y=P.y+1.2;const t=Math.abs(d.y)>1e-4?(y-o.y)/d.y:0;P.aim=t>0?o.clone().addScaledVector(d,t):null}
  if(P.aim){const dx=P.aim.x-P.x,dz=P.aim.z-P.z;if(dx*dx+dz*dz>.04)P.yaw=Math.atan2(-dx,-dz)}}

let interact=null;
function handleInteract(dt){
  interact=findInteract();const pr=$('prompt'),hb=$('holdbar');
  if(interact){pr.hidden=false;pr.innerHTML=esc(interact.label)+(interact.sub?`<span class="p2">${esc(interact.sub)}</span>`:'')}else pr.hidden=true;
  if(interact&&interact.hold){if(keys['e']){if(holdKey!==interact.key){holdKey=interact.key;holdT=0}holdT+=dt;if(R()<dt*5)sfx(interact.type==='fossil'||interact.type==='fix'?'dig':'eat');hb.hidden=false;hb.firstChild.style.width=(holdT/interact.hold*100)+'%';if(holdT>=interact.hold){interact.act();holdT=0;holdKey=null}}else{holdT=0;holdKey=null;hb.hidden=true}}else{hb.hidden=true;holdKey=null}
  if(interact&&!interact.hold&&pressed['e'])interact.act();
  if(interact&&interact.alt&&pressed['g'])interact.alt();
}
function findInteract(){
  if(P.inTruck)return{label:L('E · Bajarse'),act:()=>exitTruck()};
  const px=P.x,pz=P.z;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  const look=(x,z,maxD)=>{const dx=x-px,dz=z-pz,d=Math.hypot(dx,dz);if(d>maxD)return false;if(d<1.2)return true;return (dx*fx+dz*fz)/d>.55};
  if(look(COUNTER.x,COUNTER.z,2.6))return{label:L('E · Atender el almacén'),act:()=>openPanel('deposito')};
  if(look(BED.x,BED.z,2))return{label:L('E · Dormir'),sub:sleepReason()||L('Cansancio {n}%',{n:Math.round(S.fat)}),act:sleep};
  for(let i=0;i<S.shelves.length;i++){const u=shelfUnits[i];if(look(u.x,u.z+.6,2.2)){const sh=S.shelves[i];return{label:L('E · Estante {n}',{n:i+1}),sub:sh.item?`${nm(sh.item)} · $${Math.max(1,Math.round(ITEMS[sh.item].v*sh.mult))} · ${L('{n} en depósito',{n:S.stash[sh.item]||0})}`:L('Vacío'),act:()=>openPanel('estantes')}}}
  {const vi=vehInteract(look);if(vi)return vi}
  {const ai=altarInteract(look);if(ai)return ai}
  for(const b of builds){if(b.t==='fogata'&&look(b.x,b.z,2.4)){const raw=S.inv.carne||0;return raw?{label:L('Mantené E · Cocinar {n} carne',{n:raw}),hold:2.5,key:'cook',type:'cook',act:()=>{const n=S.inv.carne;S.inv.carne=0;S.inv.asada=(S.inv.asada||0)+n;addSk('supervivencia',3*n);toast(L('Cocinaste {n} carne asada.',{n}),'#c9a24a');sfx('pickup')}}:{label:L('Fogata'),sub:L('Traé carne cruda para cocinarla')}}}
  for(const e of enemies){if(e.type==='raptor'&&e.stun>0&&look(e.x,e.z,3)){if(S.pet)return{label:L('Raptor debilitado'),sub:L('Ya tenés un raptor')};const food=(S.inv.carne||0)+(S.inv.asada||0);return food?{label:L('Mantené E · Domesticar raptor'),sub:L('Le das 1 carne'),hold:3,key:'tame',type:'tame',act:()=>tame(e)}:{label:L('Raptor debilitado'),sub:L('Necesitás carne en la mochila para domesticarlo')}}}
  let bc=null,bd=1e9;for(const c of conts){const dx=c.x-px,dz=c.z-pz;if(Math.abs(dx)>2.6||Math.abs(dz)>2.6||Math.abs(c.y-P.y)>2)continue;if(!look(c.x,c.z,2.3))continue;const d=dx*dx+dz*dz;if(d<bd){bd=d;bc=c}}
  if(bc){const st=S.cont[bc.i];return{label:L('E · Revisar: {c}',{c:L(CONT[bc.type].n)}),sub:st?(contEmpty(st)?L('Vacío'):L('Ya revisado')):'',act:()=>openLoot(bc)}}
  for(const f of fossils){if(f.uses<=0)continue;if(look(f.x,f.z,2.8))return{label:L('Mantené E · Excavar fósiles'),sub:L('Quedan {n}',{n:f.uses}),hold:2.4,key:f,type:'fossil',act:()=>digFossil(f)}}
  return null}
function digFossil(f){f.uses--;sfx('crate');burst(f.x,f.y+.4,f.z,'#cdbb92',10,2.5);spawnPickup(f.x,f.z,'hueso',rint(1,2));if(R()<.25)spawnPickup(f.x,f.z,'ambar',1);if(R()<.3)spawnPickup(f.x,f.z,'colmillo',1);if(f.uses<=0)f.mesh.visible=false;
  if(R()<.35*SB('dinos')){const e=spawnEnemy('raptorp',f.x+4,f.z+4);e.aggro=true;toast(L('Algo se movió bajo la arena…'),'#cc4b30')}gainXp(4);addSk('supervivencia',2)}

// ================= RENDER =================
const skyDay=new T3.Color(0xa3aea8),skyDusk=new T3.Color(0xb88a66),skyNight=new T3.Color(0x0a1210),skyRain=new T3.Color(0x6e7a7a),tmpC=new T3.Color();
function applyLighting(){
  const h=hourOf(S.t),dk=darkness(),wf=weatherFx();
  const el=Math.sin(clamp((h-6)/12,0,1)*Math.PI);const az=(h-6)/12*Math.PI;
  const dusk=Math.max(smooth(16.5,19,h)*(1-smooth(19.5,20.5,h)),smooth(4.5,6,h)*(1-smooth(6.5,8,h)));
  tmpC.copy(skyDay).lerp(skyRain,wf.dim*1.6).lerp(skyDusk,dusk*.6).lerp(skyNight,dk);if(lightning>0)tmpC.lerp(new T3.Color(0xdde4ff),lightning*.7);
  scene.fog.color.copy(tmpC);renderer.setClearColor(tmpC);
  scene.fog.density=.0055+dk*.022+wf.fog;
  sun.position.set(P.x+Math.cos(az)*90,Math.max(12,el*130),P.z+Math.sin(az)*50+30);sun.target.position.set(P.x,P.y,P.z);
  sun.intensity=(dk>.5?.1:Math.max(.08,el*.95)*(1-dk))*(1-wf.dim)+lightning*1.5;sun.color.set(dk>.5?0x7f9cc0:dusk>.3?0xffb070:0xfff0d0);
  hemi.intensity=(.62-.5*dk)*(1-wf.dim*.5);hemi.color.set(dk>.5?0x4a6a60:0xc8d4c0);
  const lamp=dk>.25;shopLight.intensity=lamp?1.4:0;yardLight.intensity=lamp?(S.upg.neon?2:1.2):0;lampMats.forEach(m=>m.color.set(lamp?0xffd27a:0x3a3020));signMat.color.set(lamp&&S.upg.neon?0xffffff:lamp?0xd8b07a:0x9a7a4a);
  fogonLight.intensity=S.upg.fogon&&lamp?1.4*(.85+Math.sin(time*12)*.15):0;if(S.upg.fogon)fireMesh.scale.y=.6*(.85+Math.sin(time*11)*.2);
  const fl=dk>.3&&flashOn&&S.battery>0&&!P.inTruck;flash.intensity=fl?(S.upg.linterna?2.4:1.6)*(S.battery<10?.5+R()*.5:1):0;flash.distance=S.upg.linterna?75:48;
  starPts.material.opacity=Math.max(0,dk-.5)*1.6*(1-wf.dim*2);starPts.position.set(P.x,0,P.z);
  mistPts.material.opacity=dk*.32;mistPts.position.set(P.x,P.y-1,P.z);mistPts.rotation.y=time*.02;
  wAmb.intensity=.25+.4*(1-dk);wDir.intensity=.2+.5*(1-dk);
  muzzleLight.intensity=Math.max(0,muzzleLight.intensity-.5);vmFlash.material.opacity=Math.max(0,vmFlash.material.opacity-.34);
}
function updateCamera(dt){
  const iso=camMode==='iso'&&!['menu','newgame','options'].includes(gstate);
  if(iso){const tx=P.inTruck?truck.x:P.x,tz=P.inTruck?truck.z:P.z,ty=(P.inTruck?truck.y:P.y)+1;const d=isoDist*(P.inTruck?1.3:1);
    camera.position.set(tx+Math.sin(ISO_A)*Math.cos(ISO_EL)*d,ty+Math.sin(ISO_EL)*d,tz+Math.cos(ISO_A)*Math.cos(ISO_EL)*d);camera.lookAt(tx,ty,tz);
    if(shake>.01){camera.position.x+=(R()-.5)*shake*.4;camera.position.z+=(R()-.5)*shake*.4}
    const tf=38;if(Math.abs(camera.fov-tf)>.1){camera.fov=tf;camera.updateProjectionMatrix()}
    flashRig.position.set(P.x,P.y+1.3,P.z);flashRig.rotation.set(-.25,P.yaw,0,'YXZ');
  }else{
    if(P.inTruck){const c=Math.cos(truck.yaw),s=Math.sin(truck.yaw);const lx=-.42,ly=2.1,lz=.6;camera.position.set(truck.x+lx*c+lz*s,truck.y+ly,truck.z-lx*s+lz*c);camera.rotation.set(truck.lookPitch,truck.yaw+Math.PI+truck.lookYaw,0)}
    else{recoil*=Math.pow(.004,dt);recoilYaw*=Math.pow(.004,dt);
      const bob=Math.sin(P.bob)*.045*(P.onGround?1:0);
      camera.position.set(P.x,P.y+(P.crouch?1.1:1.62)+bob,P.z);camera.rotation.set(clamp(P.pitch+recoil,-1.55,1.55),P.yaw+recoilYaw,0)}
    if(shake>.01){camera.rotation.x+=(R()-.5)*shake*.08;camera.rotation.y+=(R()-.5)*shake*.08}
    const w=W();const base=settings.fov;const tf=P.inTruck?base:lerp(base,(w&&w.fov)||base*.83,adsT);if(Math.abs(camera.fov-tf)>.1){camera.fov=tf;camera.updateProjectionMatrix()}
    flashRig.position.copy(camera.position);flashRig.quaternion.copy(camera.quaternion);
  }
  if(iso)recoil*=Math.pow(.004,dt);
  // roofs: hide the one over you in isometric view
  const inB=iso?insideBuilding(P.x,P.z):null;const inStore=iso&&P.x>-6&&P.x<6&&P.z>-16&&P.z<-8;
  for(const r of roofs)r.g.visible=!(r.b===inB||(inStore&&r.b.x0===-6));
  // body
  if(body){body.visible=iso&&!P.inTruck;if(body.visible){body.position.set(P.x,P.y-(P.crouch?.25:0),P.z);body.rotation.y=P.yaw+Math.PI;const u=body.userData,s=Math.sin(P.bob*.9);u.legs[0].rotation.x=s*.6;u.legs[1].rotation.x=-s*.6;
    const w=W();const gun=w&&!w.melee&&!buildMode;const sw=swingT>0?Math.sin((1-swingT/.3)*Math.PI):0;u.arms[1].rotation.x=gun?-Math.PI/2:-.3-sw*1.6;u.arms[1].rotation.z=gun?0:sw*.4;u.arms[0].rotation.x=gun&&!['pistola','revolver'].includes(S.cur)?-1.3:-s*.4;u.bag.visible=!!S.bag}}
  // viewmodel
  vmKick=Math.max(0,vmKick-dt*8);
  const key=buildMode?'build':S.cur;const g=key&&vm[key];const mv=(keys['w']||keys['a']||keys['s']||keys['d'])&&!P.inTruck;
  const bx_=Math.sin(P.bob*.5)*.012*(mv?1:0),by_=Math.abs(Math.cos(P.bob*.5))*.012*(mv?1:0);
  const hip=new T3.Vector3(.2,-.19,-.55),ads=new T3.Vector3(0,-.115,-.4);const p=hip.clone().lerp(ads,adsT);
  vmRoot.position.set(p.x+bx_,p.y-by_-(reloadT>0?.12*Math.sin(reloadT/reloadMax*Math.PI):0),p.z+vmKick*.06);
  vmRoot.rotation.set(vmKick*.15+(reloadT>0?-.6*Math.sin(reloadT/reloadMax*Math.PI):0),0,(reloadT>0?.3*Math.sin(reloadT/reloadMax*Math.PI):0));
  const w=W();if(w&&w.melee&&!buildMode&&g){const sw=swingT>0?Math.sin((1-swingT/.3)*Math.PI):0;g.rotation.set(-.3-sw*1.2,sw*.9,sw*.6)}
  vmFlash.position.set(vmRoot.position.x,vmRoot.position.y+.02,vmRoot.position.z-(['pistola','revolver'].includes(S.cur)?.24:.72));vmFlash.rotation.z=R()*3;
  const scoped=w&&w.scope&&adsT>.85&&!P.inTruck&&!buildMode&&!iso;vmRoot.visible=!P.inTruck&&!scoped&&!iso&&!!g;$('scope').hidden=!scoped;
}
function render(dt){
  if(S){applyLighting();updateCamera(dt);updateRain(dt,weatherFx().rain,camera.position.x,camera.position.y,camera.position.z)}
  renderer.clear();renderer.render(scene,camera);renderer.clearDepth();if(S&&!P.inTruck&&camMode==='fp'&&!['menu','newgame','options','cine'].includes(gstate))renderer.render(wScene,wCam);
}

// ================= HUD =================
const cc=$('compassC'),cx2=cc.getContext('2d');
const DIRS={0:'N',45:'NE',90:'E',135:'SE',180:'S',225:'SO',270:'O',315:'NO'};
function drawCompass(){const w=cc.width,h=cc.height;cx2.clearRect(0,0,w,h);cx2.fillStyle='rgba(10,14,12,.72)';cx2.fillRect(0,14,w,h-14);
  const fwdYaw=camMode==='iso'?-ISO_A+Math.PI*0:(P.inTruck?truck.yaw+Math.PI+truck.lookYaw:P.yaw);const head=((-(camMode==='iso'?ISO_A:fwdYaw)*180/Math.PI)%360+360)%360;const ppd=w/120;
  cx2.textAlign='center';for(let a=-60;a<=60;a++){const deg=Math.round(head+a);if(((deg%15)+15)%15!==0)continue;const x=w/2+(deg-head)*ppd;const dn=((deg%360)+360)%360;const lab=DIRS[dn];
    cx2.fillStyle=lab?'#dedcc9':'#5f6b62';cx2.fillRect(x-1,lab?18:22,2,lab?12:8);if(lab){cx2.font='700 26px "Saira Condensed",sans-serif';cx2.fillText(L(lab),x,58)}}
  const mark=(x,z,color,label)=>{const b=Math.atan2(x-P.x,-(z-P.z))*180/Math.PI;let d=((b-head+540)%360)-180;if(Math.abs(d)>60){d=Math.sign(d)*60}const X=w/2+d*ppd;cx2.fillStyle=color;cx2.beginPath();cx2.moveTo(X,16);cx2.lineTo(X-9,4);cx2.lineTo(X+9,4);cx2.fill();if(label){cx2.font='600 18px "IBM Plex Mono",monospace';cx2.fillText(label,X,76)}};
  const dA=Math.hypot(P.x,P.z);if(dA>20)mark(0,-8,'#e3a33b',Math.round(dA)+' m');
  const dT=Math.hypot(roadX(TOWN_Z)-P.x,TOWN_Z-P.z);if(dT>90)mark(roadX(TOWN_Z),TOWN_Z,'#9fb0aa',L('Pueblo'));
  if(pet&&Math.hypot(pet.x-P.x,pet.z-P.z)>15)mark(pet.x,pet.z,'#8fbb62');
  compassExtras(mark);
  cx2.fillStyle='#e3a33b';cx2.fillRect(w/2-1,14,2,8)}
function updateHUD(dt){
  hudT-=dt;
  const setBar=(id,v,max,low)=>{const el=$(id);el.querySelector('i').style.width=clamp(v/max*100,0,100)+'%';el.lastElementChild.textContent=Math.round(v);el.classList.toggle('low',!!low)};
  setBar('bHp',Math.max(0,S.hp),maxHp(),S.hp/maxHp()<.3);setBar('bFood',S.food,100,S.food<15);setBar('bWater',S.water,100,S.water<15);
  const sm=100*(1+.3*PK('pulmon'))*(1+.05*skLv('atletismo'));$('bStam').querySelector('i').style.width=(stamina/sm*100)+'%';
  const w=W();
  $('wReload').style.width=reloadT>0?((1-reloadT/reloadMax)*100)+'%':'0';
  const moving=keys['w']||keys['a']||keys['s']||keys['d'];const spr=!w||w.melee?4:(adsT>.6?w.ads:w.hip)*(moving?1.6:1)*(P.onGround?1:2.2)*aimMult()*260+4+recoil*80;const cr=$('cross');cr.style.setProperty('--s',Math.min(60,spr)+'px');
  cr.style.display=(P.inTruck||(w&&w.scope&&adsT>.85&&camMode==='fp'))?'none':'';
  if(camMode==='iso'){cr.style.left=mouse.sx+'px';cr.style.top=mouse.sy+'px'}else{cr.style.left='';cr.style.top=''}
  if(hitT>0){hitT-=dt;if(hitT<=0)$('hit').style.opacity=0}
  $('vign').style.opacity=Math.max(hurtFx*.7,S.hp/maxHp()<.3?.35+Math.sin(time*5)*.1:0,bleeding().length?.15:0);
  toastEls=toastEls.filter(t=>{t.life-=dt;if(t.life<=0){t.el.remove();return false}if(t.life<.5)t.el.style.opacity=t.life*2;return true});
  feedEls=feedEls.filter(t=>{t.life-=dt;if(t.life<=0){t.el.remove();return false}return true});
  drawCompass();
  $('truckHud').hidden=!P.inTruck;if(P.inTruck){$('tSpeed').textContent=Math.round(Math.abs(truck.speed)*3.6);$('tFuel').textContent=L('Nafta {n}%',{n:Math.round(truck.st.fuel)});$('tFuel').style.color=truck.st.fuel<15?'#cc4b30':'';$('tCargo').textContent=L('Caja {a}/{b} kg',{a:kg(kgOf(truck.st.cargo)),b:vehCap(truck)})}
  updateBossBar();
  if(hudT>0)return;hudT=.15;
  const h=hourOf(S.t),night=isNight();
  $('hTL').classList.toggle('night',night);$('hDay').textContent=L('Día {d}',{d:S.day});$('hTime').textContent=`${pad(Math.floor(h))}:${pad(Math.floor(h%1*6)*10)}`;$('hPhase').textContent=night?L('NOCHE · BRUMA'):h>=18?L('ATARDECER'):h<7?L('AMANECER'):L('DÍA');
  $('hMoney').textContent='$'+fmt(S.money);$('hRep').textContent=L('Reputación')+' '+stars();$('hLvl').textContent=L('Nivel {n}',{n:S.level});$('hXp').style.width=clamp(S.xp/xpNeed()*100,0,100)+'%';
  $('hWeather').textContent=weatherLine()+(darkness()>.3?' · '+L('Pilas {n}%',{n:Math.round(S.battery)}):'');
  const ac=S.contracts.filter(c=>!c.done&&!c.failed);$('hContract').innerHTML=ac.length?ac.slice(0,2).map(c=>'▸ '+esc(L('{i} ×{q} para {who} · ${r}',{i:nm(c.item),q:c.qty,who:c.who,r:c.reward}))+(c.dl===S.day?' · '+esc(L('hoy 19:00')):'')).join('<br>'):'';
  const ow=overW();$('hBag').textContent=`${S.bag?nm(S.bag):L('Sin mochila')} ${kg(invKg())}/${capKg()} kg`+(S.pet?` · ${S.pet.name} ${S.pet.down?L('herida'):pet?Math.round(pet.hp)+'/120':''}`:'');$('hBag').style.color=ow?'#e09a5a':'';
  if(w){$('wName').textContent=wn(S.cur);$('wAmmo').innerHTML=w.melee?`<small>${esc(L('Estado'))} ${Math.round(S.dur[S.cur]/w.dur*100)}%</small>`:`${S.mags[S.cur]||0} <small>/ ${S.ammo[w.ammo]}</small>`;$('wAmmo').style.color=!w.melee&&!(S.mags[S.cur]>0)?'#cc4b30':''}
  else{$('wName').textContent=L('Manos vacías');$('wAmmo').innerHTML=''}
  {const hb=hotbar(),ci=Math.max(0,hb.indexOf(S.cur)),st=Math.max(0,Math.min(ci-3,hb.length-7));$('wSlots').innerHTML=(st>0?'<span class="own">…</span>':'')+hb.slice(st,st+7).map((k,j)=>{const i=st+j;return `<span class="${k===S.cur?'on':'own'}">${i<9?(i+1)+' ':''}${ico('w:'+k)}${esc(wn(k))}</span>`}).join('')+(st+7<hb.length?'<span class="own">…</span>':'')}
  $('moods').innerHTML=statuses().map(s=>`<div style="--c:${s.c}"><b>${esc(L(s.n))}</b><span>${'●'.repeat(s.lv)}${'○'.repeat(3-s.lv)}</span></div>`).join('');
}
function renderBuildBar(){$('buildBar').innerHTML=BORDER.map((k,i)=>{const b=BUILDS[k];const r=buildBlockReason(k);return `<div class="${i===buildSel?'on':''} ${r?'no':''}"><b>${i+1} ${esc(L(b.n))}</b>${Object.entries(b.cost).map(([kk,q])=>`${q} ${esc(nm(kk))}`).join(' + ')}</div>`}).join('')+`<div><b>${esc(L('R girar'))}</b>${esc(L('Clic construir · B salir'))}</div>`}
function stars(){const s=S.rep/4;let o='';for(let i=0;i<5;i++)o+=i<Math.floor(s)?'★':'☆';return o}
