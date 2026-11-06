'use strict';
/* Cooperativo de dos jugadores en red.
   - El anfitrión abre su partida desde la pausa (Esc > Cooperativo). El juego levanta un servidor en el puerto 27015.
   - El otro entra desde el menú principal (Cooperativo > Unirse) poniendo la IP del anfitrión.
   - El mundo lo manda el anfitrión: los bichos, la hora, el día y el clima. Cada uno tiene su mochila, su plata y su vida.
   - Los bichos persiguen y atacan al jugador que tengan más cerca. Los tiros del invitado lastiman a los bichos del anfitrión.
   - Mientras haya alguien conectado, el mundo no se frena al abrir el inventario o la pausa. */

const COOP_PORT=27015,GKEY='ultimo-almacen-coop-invitado';
const CO={role:null,ws:null,ready:false,peer:null,nid:0,mir:new Map(),sendT:0,wT:0,spT:3,swap:false,fromNet:false,inMir:false,
  angry:[],av:null,lbl:null,ips:[],status:'',started:false,pendingWelcome:null,pingT:0};
const coopOn=()=>!!(CO.role&&CO.ws&&CO.ws.readyState===1);
const peerOk=()=>coopOn()&&CO.peer&&performance.now()-CO.peer.at<6000;
function coopSend(m){if(coopOn())try{CO.ws.send(JSON.stringify(m))}catch(e){}}
function coopName(){return CO.role==='host'?L('Invitado'):L('Anfitrión')}

// ---------- Conexión ----------
function coopConnect(url,role){coopClose(true);CO.status=L('Conectando…');renderCoop35();
  let ws;try{ws=new WebSocket(url)}catch(e){CO.status=L('No se pudo conectar: revisá la IP.');renderCoop35();return}
  CO.ws=ws;CO.role=role;
  ws.onopen=()=>{if(role==='guest'){CO.status=L('Conectado. Esperando al anfitrión…');coopSend({t:'hello',v:GAME_V29})}else CO.status=L('Esperando a que se una tu amigo…');renderCoop35()};
  ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}try{coopMsg(m)}catch(e){console.error('coop',m&&m.t,e)}};
  ws.onclose=()=>{if(CO.ws!==ws)return;const was=CO.role;coopClose(true);if(was)toast(was==='guest'?L('Se cortó la conexión con el anfitrión. Seguís jugando solo.'):L('Se cerró la partida cooperativa.'),'#e0a040',6);CO.status=L('Sin conexión.');renderCoop35()};
  ws.onerror=()=>{CO.status=L('No se pudo conectar. Fijate la IP, que el anfitrión haya abierto la partida y que el firewall deje pasar el juego.');renderCoop35()}}
function coopClose(silent){const ws=CO.ws;CO.ws=null;const wasGuest=CO.role==='guest';CO.role=null;CO.peer=null;CO.ready=false;
  if(ws)try{ws.onclose=null;ws.close()}catch(e){}
  // los bichos copiados del anfitrión vuelven a ser bichos comunes
  for(const e of CO.mir.values()){delete e.mir;delete e.net}CO.mir.clear();
  if(CO.av){scene.remove(CO.av);CO.av=null}if(CO.lbl)CO.lbl.hidden=true;
  if(wasGuest&&!silent)toast(L('Te desconectaste.'),'#dedcc9',3)}
async function coopHost(){if(!window.coopNet){CO.status=L('El cooperativo funciona en el juego de escritorio (Windows).');renderCoop35();return}
  CO.status=L('Abriendo la partida…');renderCoop35();
  const r=await window.coopNet.host();if(!r||r.error){CO.status=L('No se pudo abrir la partida: {e}',{e:r&&r.error||'?'});renderCoop35();return}
  CO.ips=r.ips||[];coopConnect(`ws://127.0.0.1:${r.port||COOP_PORT}`,'host')}
function coopStopHost(){coopClose(true);try{window.coopNet&&window.coopNet.stop()}catch(e){}CO.status='';renderCoop35()}

// ---------- Mensajes ----------
function coopMsg(m){const now=performance.now();
  if(m.t==='bye'){if(CO.role==='host'){toast(L('Tu amigo salió de la partida.'),'#e0a040',5);CO.peer=null;CO.ready=false;if(CO.av){scene.remove(CO.av);CO.av=null}CO.status=L('Esperando a que se una tu amigo…')}
    else{const ws=CO.ws;coopClose(true);try{ws&&ws.close()}catch(e){}toast(L('El anfitrión cerró la partida. Seguís jugando solo.'),'#e0a040',6);CO.status=L('Sin conexión.')}renderCoop35();return}
  if(CO.role==='host'){
    if(m.t==='hello'){if(!S||['menu','loading','newgame','options'].includes(gstate)){coopSend({t:'wait'});return}
      coopSend({t:'welcome',ws:worldSeed(),sb:S.sb,d:S.day,tt:S.t,x:P.x,z:P.z,w:S.weather||null,v:GAME_V29});CO.ready=true;CO.status=L('Tu amigo está conectado.');toast(L('Se unió tu amigo a la partida.'),'#8fbb62',5);renderCoop35();return}
    if(m.t==='p'){CO.peer=Object.assign(CO.peer||{},m,{at:now});if(CO.peer.ix==null){CO.peer.ix=m.x;CO.peer.iz=m.z;CO.peer.iy=m.y}return}
    if(m.t==='hit'){const e=enemies.find(x=>x.nid===m.id);if(e&&!e.dead&&!(e.dying>0))hurtEnemy(e,m.dmg,!!m.head,'c',L('Tu amigo'),true);return}
    if(m.t==='fx'){coopFx(m);return}
    return}
  if(CO.role==='guest'){
    if(m.t==='wait'){CO.status=L('El anfitrión todavía no entró a su partida. Probá de nuevo en un rato.');renderCoop35();setTimeout(()=>{if(CO.role==='guest'&&!CO.started)coopSend({t:'hello',v:GAME_V29})},3000);return}
    if(m.t==='welcome'){CO.peer={x:m.x,y:0,z:m.z,yaw:0,at:now,ix:m.x,iz:m.z,iy:0};guestStart35(m);return}
    if(m.t==='s'){if(!CO.started||!S)return;guestSnap35(m,now);return}
    if(m.t==='hurt'){if(gstate==='dead')return;CO.fromNet=true;try{hurtPlayer(m.dmg,m.ty?{type:m.ty}:undefined)}finally{CO.fromNet=false}return}
    if(m.t==='fx'){coopFx(m);return}}}
function guestStart35(m){if(CO.started)return;CO.started=true;CO.ready=true;
  let st=null;try{const raw=lsGet(GKEY);st=raw?migrate(JSON.parse(raw)):null}catch(e){st=null}
  if(!st||st.wseed!==m.ws){st=newState((Math.random()*2**31)|0,m.sb);st.wseed=m.ws}
  st.sb=Object.assign({},m.sb);st.day=m.d;st.t=m.tt;if(m.w)st.weather=m.w;
  CO.status=L('Conectado con el anfitrión.');
  loadingThen(()=>{startGame(st);const a=Math.random()*6.28;P.x=m.x+Math.cos(a)*2.5;P.z=m.z+Math.sin(a)*2.5;P.y=groundY(P.x,P.z);
    toast(L('Entraste a la partida de tu amigo. Los bichos, la hora y el clima son los de su mundo; tu mochila y tu plata son tuyas.'),'#8fbb62',8)})}
// el invitado aplica lo que manda el anfitrión
function guestSnap35(m,now){
  S.day=m.d;const C=CYCLE();let dt=m.tt-S.t;if(dt>C/2)dt-=C;if(dt<-C/2)dt+=C;if(Math.abs(dt)>3)S.t=m.tt;else S.t+=dt*.2;
  if(m.w)S.weather=m.w;
  if(m.h){CO.peer=Object.assign(CO.peer||{},{x:m.h[0],y:m.h[1],z:m.h[2],yaw:m.h[3],w:m.h[4],cr:m.h[5],run:m.h[6],car:m.h[7],at:now});if(CO.peer.ix==null){CO.peer.ix=CO.peer.x;CO.peer.iz=CO.peer.z;CO.peer.iy=CO.peer.y}}
  const seen=new Set();
  for(const a of m.e){const [id,type,x,y,z,yaw,hp,mx,f]=a;seen.add(id);let e=CO.mir.get(id);
    if(e&&e.dead){CO.mir.delete(id);e=null}
    if(!e){if(f&2||!EDEF[type])continue;CO.creating=true;try{e=spawnEnemy(type,x,z)}finally{CO.creating=false}e.nid=id;e.mir=true;e.x=x;e.z=z;e.y=y;e.yaw=yaw;CO.mir.set(id,e)}
    e.net={x,y,z,yaw};e.maxHp=mx;if(!(e.dying>0)){e.hp=hp;e.aggro=!!(f&1);if(f&2){e.dying=.01;e.side=R()<.5?1:-1}}}
  for(const [id,e] of CO.mir)if(!seen.has(id)){if(!(e.dying>0)&&!e.dead){scene.remove(e.mesh);e.dead=true}CO.mir.delete(id)}}

// ---------- Efectos del otro jugador ----------
function coopFx(m){if(!S)return;
  if(m.k==='shot'){const w=WEAP[m.w];sfx(w&&w.snd||m.w,m.x,m.z);burst(m.x,m.y+1.4,m.z,'#ffcf6a',4,1.5,.06,2)}
  else if(m.k==='boom'){sfx('boom',m.x,m.z);burst(m.x,m.y,m.z,'#f0a030',14,6,.16,6);burst(m.x,m.y,m.z,'#4a4a44',10,4,.2,3)}
  else if(m.k==='swing')sfx('swing',m.x,m.z)}
const _shoot35=shoot;shoot=function(){const k=S&&S.cur,m0=k&&S.mags?S.mags[k]:null;const r=_shoot35.apply(this,arguments);
  try{if(coopOn()&&k&&S.mags&&S.mags[k]<m0)coopSend({t:'fx',k:'shot',w:k,x:+P.x.toFixed(1),y:+P.y.toFixed(1),z:+P.z.toFixed(1)})}catch(e){}return r};
const _explode35=explode;explode=function(x,y,z,r,dmg,src,toxic){const out=_explode35.apply(this,arguments);try{if(coopOn()&&!CO.fromNet&&src==='p')coopSend({t:'fx',k:'boom',x:+x.toFixed(1),y:+y.toFixed(1),z:+z.toFixed(1)})}catch(e){}return out};

// ---------- Bichos ----------
const _spawnEnemy35=spawnEnemy;spawnEnemy=function(){const e=_spawnEnemy35.apply(this,arguments);if(e&&CO.role==='host')e.nid=++CO.nid;return e};
const _hurtEnemy35=hurtEnemy;hurtEnemy=function(e,dmg,head,src,by,ap){
  if(CO.role==='guest'&&coopOn()&&e&&e.mir&&!e.dead&&!(e.dying>0)){const h0=e.hp;const r=_hurtEnemy35.apply(this,arguments);const d=h0-e.hp;
    if(d>0)coopSend({t:'hit',id:e.nid,dmg:+d.toFixed(1),head:head?1:0});return r}
  return _hurtEnemy35.apply(this,arguments)};
const _hurtPlayer35=hurtPlayer;hurtPlayer=function(dmg,src){
  if(CO.role==='host'&&CO.swap){coopSend({t:'hurt',dmg:+dmg.toFixed(1),ty:src&&src.type||null});return}
  if(CO.role==='guest'&&coopOn()&&!CO.fromNet&&(CO.inMir||(src&&src.type&&EDEF[src.type])))return;// lo decide el anfitrión
  return _hurtPlayer35.apply(this,arguments)};
const _damageWall35=damageWall;damageWall=function(){if(CO.inMir)return;return _damageWall35.apply(this,arguments)};
const _damageBuild35=damageBuild;damageBuild=function(){if(CO.inMir)return;return _damageBuild35.apply(this,arguments)};
function angLerp35(a,b,k){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*k}
const _updateEnemy35=updateEnemy;updateEnemy=function(e,dt){
  if(CO.role==='guest'&&e.mir){if(e.dying>0)return _updateEnemy35.call(this,e,dt);
    CO.inMir=true;try{_updateEnemy35.call(this,e,dt)}finally{CO.inMir=false}
    const n=e.net;if(n&&!(e.dying>0)&&!e.dead){const far=Math.hypot(n.x-e.x,n.z-e.z)>6,k=far?1:Math.min(1,dt*12);
      e.x+=(n.x-e.x)*k;e.z+=(n.z-e.z)*k;e.y+=(n.y-e.y)*k;e.yaw=angLerp35(e.yaw,n.yaw,k);if(e.mesh&&!(e.stun>0)){e.mesh.position.set(e.x,e.y,e.z);e.mesh.rotation.y=e.yaw}}
    return}
  if(CO.role==='host'&&peerOk()&&!CO.peer.dead){const g=CO.peer,tx=P.inTruck?truck.x:P.x,tz=P.inTruck?truck.z:P.z;
    const dH=Math.hypot(e.x-tx,e.z-tz),dG=Math.hypot(e.x-g.x,e.z-g.z);
    // que no desaparezcan los que están cerca del invitado
    if(dG<200&&dH>230&&!EDEF[e.type].neutral&&!e.angry){e.angry=true;CO.angry.push(e)}
    if(dG<dH){const s={x:P.x,y:P.y,z:P.z,t:P.inTruck,c:P.crouch};P.x=g.x;P.y=g.y;P.z=g.z;P.inTruck=false;P.crouch=!!g.cr;CO.swap=true;
      try{return _updateEnemy35.call(this,e,dt)}finally{CO.swap=false;P.x=s.x;P.y=s.y;P.z=s.z;P.inTruck=s.t;P.crouch=s.c}}}
  return _updateEnemy35.call(this,e,dt)};

// ---------- Cada cuadro ----------
const IDLE35=['ev39','inv','loot','panel','npc','bigmap','map','pause','diario','altar','wait'];
const _update35=update;update=function(dt){
  if(CO.role==='guest'&&coopOn()&&CO.started){// el invitado no genera bichos propios
    for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e.mir&&!e.dying){scene.remove(e.mesh);enemies.splice(i,1)}}
    hordeLeft=0}
  _update35.apply(this,arguments);
  for(const e of CO.angry)e.angry=false;CO.angry.length=0;
  try{coopTick35(dt)}catch(e){console.error('coop tick',e)}};
// con alguien conectado el mundo no se frena en los menús
const _updateHUD35=updateHUD;updateHUD=function(dt){
  if(coopOn()&&CO.ready&&S&&IDLE35.includes(gstate)){const g0=gstate;gstate='play';try{update(dt)}catch(e){console.error(e)}finally{if(gstate==='play')gstate=g0}}
  return _updateHUD35.apply(this,arguments)};
function coopTick35(dt){if(!coopOn()||!S)return;
  CO.sendT-=dt;CO.wT-=dt;
  if(CO.sendT<=0){CO.sendT=1/15;
    const me=[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2),+P.yaw.toFixed(2),S.cur||'',P.crouch||keys['control']?1:0,keys['shift']&&(keys['w']||keys['a']||keys['s']||keys['d'])?1:0,P.inTruck?1:0];
    if(P.inTruck){me[0]=+truck.x.toFixed(2);me[2]=+truck.z.toFixed(2);me[1]=+(truck.y||P.y).toFixed(2)}
    if(CO.role==='guest'&&CO.started)coopSend({t:'p',x:me[0],y:me[1],z:me[2],yaw:me[3],w:me[4],cr:me[5],run:me[6],car:me[7],dead:gstate==='dead'?1:0});
    if(CO.role==='host'&&CO.ready&&peerOk()){const g=CO.peer,E=[];
      for(const e of enemies){if(e.dead||Math.hypot(e.x-g.x,e.z-g.z)>230)continue;if(e.nid==null)e.nid=++CO.nid;
        E.push([e.nid,e.type,+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2),+e.yaw.toFixed(2),Math.round(e.hp*10)/10,Math.round(e.maxHp),(e.aggro||e.angry&&EDEF[e.type].neutral?1:0)|(e.dying>0?2:0)])}
      const msg={t:'s',d:S.day,tt:+S.t.toFixed(2),h:me,e:E};if(CO.wT<=0){CO.wT=2;msg.w=S.weather||null}coopSend(msg)}}
  // el anfitrión también genera bichos alrededor del invitado si está lejos
  if(CO.role==='host'&&CO.ready&&peerOk()&&!CO.peer.dead){CO.spT-=dt;if(CO.spT<=0){CO.spT=3;const g=CO.peer;
    if(Math.hypot(g.x-P.x,g.z-P.z)>200){const pop=enemies.filter(e=>!e.dying&&!e.dead&&Math.hypot(e.x-g.x,e.z-g.z)<170).length;
      const target=(10+Math.min(16,S.day*2)+(isNight()?6:0))*SB('zpop');
      if(pop<target){const s={x:P.x,z:P.z};P.x=g.x;P.z=g.z;try{spawnDay(false)}finally{P.x=s.x;P.z=s.z}}}}}
  avatar35(dt)}

// ---------- El otro jugador en el mundo ----------
function avatar35(dt){const g=CO.peer;const ok=peerOk()&&CO.ready&&g&&g.x!=null;
  if(!ok){if(CO.av)CO.av.visible=false;if(CO.lbl)CO.lbl.hidden=true;return}
  if(!CO.av){const m=typeof glbHuman24==='function'?glbHuman24('#6a7a4a','#c9a07a','#3a3a30'):null;if(!m)return;CO.av=m;scene.add(m)}
  const k=Math.min(1,dt*10);const px=g.ix,pz=g.iz;g.ix+=(g.x-g.ix)*k;g.iz+=(g.z-g.iz)*k;g.iy+=(g.y-g.iy)*k;if(Math.hypot(g.x-g.ix,g.z-g.iz)>8){g.ix=g.x;g.iz=g.z;g.iy=g.y}
  const av=CO.av;av.visible=!g.dead;av.position.set(g.ix,g.iy,g.iz);av.rotation.y=(g.yaw||0)+Math.PI;
  const sp=Math.hypot(g.ix-px,g.iz-pz)/Math.max(dt,1e-3),u=av.userData;
  if(u&&u.mixer){play15(u,sp>.4?(sp>4.5?'run':'walk'):'idle',.25,1);u.mixer.update(dt)}
  if(!CO.lbl){CO.lbl=document.createElement('div');CO.lbl.id='co35lbl';$('hud').appendChild(CO.lbl)}
  const v=new THREE.Vector3(g.ix,g.iy+2.1,g.iz).project(camera),d=Math.hypot(g.ix-P.x,g.iz-P.z);
  const vis=v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1;CO.lbl.hidden=!vis||gstate!=='play';
  if(vis){CO.lbl.style.left=((v.x+1)/2*innerWidth)+'px';CO.lbl.style.top=((1-v.y)/2*innerHeight)+'px';CO.lbl.textContent=`${coopName()} · ${Math.round(d)} m`}}

// ---------- Guardado del invitado aparte ----------
const _saveGame35=saveGame;saveGame=function(quiet){if(CO.role==='guest'&&CO.started){lsSet(GKEY,serialize());if(!quiet)toast(L('Partida guardada'),'#8fbb62');return}return _saveGame35.apply(this,arguments)};
const _toMenu35=toMenu;toMenu=function(){if(CO.role==='guest'){coopClose(true);CO.started=false}return _toMenu35.apply(this,arguments)};

// ---------- Pantalla ----------
(function(){const ov=document.createElement('div');ov.id='coop';ov.className='overlay';ov.hidden=true;
  ov.innerHTML='<div class="card small-card coop35"><div class="eyebrow" id="coopEb"></div><h2 id="coopH"></h2><div id="coopBody"></div></div>';document.body.appendChild(ov);OVS.push('coop');
  const nav=document.querySelector('#menu nav'),bq=$('btnQuit');const b=document.createElement('button');b.id='btnCoop';b.innerHTML='<span></span><small></small>';nav.insertBefore(b,bq);
  b.addEventListener('click',()=>{initAudio();openCoop35('menu')});
  const pb=document.querySelector('#pause .btns'),po=pb.querySelector('[data-a="opts"]');const b2=document.createElement('button');b2.dataset.a='coop35';pb.insertBefore(b2,po);
  b2.addEventListener('click',e=>{e.stopPropagation();openCoop35('pause')});
  ov.addEventListener('click',e=>{const x=e.target.closest('[data-c]');if(!x)return;const a=x.dataset.c;
    if(a==='back'){if(coopBack35==='pause')openPause();else toMenu()}
    if(a==='host')coopHost();if(a==='stop')coopStopHost();
    if(a==='join'){const ip=($('coopIp').value||'').trim().replace(/^ws:\/\//,'');if(!ip){CO.status=L('Escribí la IP del anfitrión.');renderCoop35();return}
      try{localStorage.setItem('ua-coop-ip',ip)}catch(_){}CO.started=false;if(camMode==='fp')requestLock();coopConnect(`ws://${ip.includes(':')?ip:ip+':'+COOP_PORT}`,'guest')}
    if(a==='leave'){coopClose(false);CO.started=false;CO.status='';renderCoop35()}});
  labels35()})();
function labels35(){const b=$('btnCoop');if(b){b.querySelector('span').textContent=L('Cooperativo');b.querySelector('small').textContent=L('Jugá con un amigo, cada uno en su PC')}
  const b2=document.querySelector('[data-a="coop35"]');if(b2)b2.textContent=L('Cooperativo')}
let coopBack35='menu';
function openCoop35(back){coopBack35=back;if(back==='menu')gstate='newgame';renderCoop35();show('coop')}
function renderCoop35(){const ov=$('coop');if(!ov)return;labels35();
  $('coopEb').textContent=L('Dos jugadores en red');$('coopH').textContent=L('Cooperativo');let h='';
  const st=CO.status?`<p class="note coopst">${esc(CO.status)}</p>`:'';
  if(coopBack35==='pause'){
    if(CO.role==='host'){h+=`<p>${esc(L('Tu partida está abierta. Pasale a tu amigo esta dirección para que entre desde su menú (Cooperativo > Unirse):'))}</p>`;
      h+=`<div class="coopips">${(CO.ips.length?CO.ips:['?']).map(ip=>`<kbd>${esc(ip)}</kbd>`).join(' ')}</div>`;
      h+=`<p class="note">${esc(L('Si están en la misma casa usen esa IP. Por internet, instalen los dos Radmin VPN o ZeroTier y usen la IP que les da el programa, o abran el puerto {p} en el router.',{p:COOP_PORT}))}</p>`;
      h+=st+`<div class="btns"><button data-c="stop" class="danger">${esc(L('Cerrar la partida cooperativa'))}</button><button data-c="back">${esc(L('Volver'))}</button></div>`}
    else if(CO.role==='guest'){h+=`<p>${esc(L('Estás jugando en la partida de tu amigo.'))}</p>`+st+`<div class="btns"><button data-c="leave" class="danger">${esc(L('Desconectarme'))}</button><button data-c="back">${esc(L('Volver'))}</button></div>`}
    else{h+=`<p>${esc(L('Abrí tu partida para que un amigo se una desde su PC. El mundo, los bichos, la hora y el clima son los tuyos; cada uno tiene su mochila, su plata y su vida.'))}</p>`+
      `<p class="note">${esc(L('Mientras esté conectado, el mundo no se frena cuando abrís el inventario o la pausa.'))}</p>`+st+
      `<div class="btns"><button data-c="host" class="primary">${esc(L('Abrir mi partida'))}</button><button data-c="back">${esc(L('Volver'))}</button></div>`}}
  else{let ip='';try{ip=localStorage.getItem('ua-coop-ip')||''}catch(_){}
    h+=`<h4>${esc(L('Unirse a la partida de un amigo'))}</h4><p class="note">${esc(L('Tu amigo abre su partida desde la pausa (Esc > Cooperativo) y te pasa su IP.'))}</p>`+
      `<div class="coopjoin"><input id="coopIp" type="text" spellcheck="false" placeholder="192.168.0.10" value="${esc(ip)}"><button data-c="join" class="primary">${esc(L('Unirse'))}</button></div>`+st+
      `<h4>${esc(L('Ser el anfitrión'))}</h4><p class="note">${esc(L('Entrá a tu partida (Continuar o Nueva partida) y abrila desde la pausa: Esc > Cooperativo > Abrir mi partida.'))}</p>`+
      `<div class="btns">${CO.role==='guest'?`<button data-c="leave">${esc(L('Desconectarme'))}</button>`:''}<button data-c="back">${esc(L('Volver'))}</button></div>`}
  $('coopBody').innerHTML=h}
const _applyStatic35=typeof applyStatic==='function'?applyStatic:null;if(_applyStatic35)applyStatic=function(){const r=_applyStatic35.apply(this,arguments);try{labels35()}catch(e){}return r};

(function(){const css=`
.coop35{max-width:620px}.coop35 p{margin:0 0 12px}.coop35 h4{margin:18px 0 6px}
.coopips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.coopips kbd{font-size:18px;padding:6px 10px}
.coopjoin{display:flex;gap:8px;margin:8px 0 12px}.coopjoin input{flex:1;font:500 16px var(--f-mono);padding:8px 10px;background:var(--panel2);color:var(--fg);border:1px solid var(--line)}
.coopst{color:#e0c070}
#co35lbl{position:absolute;transform:translate(-50%,-100%);font:600 12px var(--f-mono);color:#cfe8b0;background:rgba(12,16,13,.6);padding:2px 7px;border-radius:2px;pointer-events:none;white-space:nowrap}
`;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})();
