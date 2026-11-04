'use strict';
/* v0.21: encargos de los NPC. Cada personaje ofrece un encargo por vez (cacería, limpieza de una zona,
   rescate de un sobreviviente, recuperar una carga o llevar un paquete a otro personaje).
   Solo puede haber un encargo en curso. El objetivo se marca en la brújula, en el mapa y con una columna de luz. */
const Q21NPC={elvira:['rescate','entrega','recuperar'],ines:['rescate','limpieza','entrega'],tano:['recuperar','limpieza','entrega'],
  lucho:['recuperar','entrega','caza'],rufino:['caza','limpieza','caza'],benito:['caza','rescate','limpieza'],marta:['recuperar','entrega','limpieza']};
const Q21DINO={rufino:1,benito:1};
const Q21COL='#5ad0e0';
let q21fx={beacon:null,item:null,surv:null,t:0};

function q21(){if(!S.q21)S.q21={active:null,offers:{},cd:{},done:0};return S.q21}
function q21title(t){return t==='caza'?L('Cacería'):t==='limpieza'?L('Limpieza'):t==='rescate'?L('Rescate'):t==='recuperar'?L('Recuperar carga'):L('Entrega')}
function q21dir(fx,fz,tx,tz){const b=((Math.atan2(tx-fx,-(tz-fz))*180/Math.PI)+360)%360;const i=Math.round(b/45)%8;
  return [L('norte'),L('noreste'),L('este'),L('sureste'),L('sur'),L('suroeste'),L('oeste'),L('noroeste')][i]}
const q21place=id=>(sites6||[]).find(p=>p.id===id);
const q21npcPos=id=>{const n=npcs6.find(n=>n.id===id);if(n)return n;const p=q21place(NPC6[id].place);return p||{x:0,z:0}};
const q21kind=t=>{const k=(EDEF[baseOf15(t)]||EDEF[t]||{}).kind||'';return k.includes('d')?'d':'z'};

// Lugar del objetivo: una ruina o un punto de tierra firme lejos de los lugares seguros.
function q21spot(from){
  const rs=(typeof ruins!=='undefined'?ruins:[]).filter(r=>{const d=Math.hypot(r.cx-from.x,r.cz-from.z);return d>120&&d<420});
  if(rs.length&&Math.random()<.6){const r=rs[Math.random()*rs.length|0];return{x:r.cx,z:r.cz}}
  for(let a=0;a<300;a++){const ang=Math.random()*6.283,rad=130+Math.random()*260;const x=from.x+Math.cos(ang)*rad,z=from.z+Math.sin(ang)*rad;
    if(Math.abs(x)>430||Math.abs(z)>430)continue;const y=terrainY(x,z);if(y<WATER_Y+1||y>30)continue;
    if(inSafe6(x,z,20)||insideBuilding(x,z)||townW(x,z)>.05||Math.hypot(x,z)<70)continue;return{x,z}}
  return{x:from.x+150,z:from.z}}

function q21make(id){const types=Q21NPC[id]||['caza'];const S1=q21();const t=types[(S1.done+Object.keys(S1.cd).length+(id.length*7))%types.length];
  const from=q21npcPos(id),dino=!!Q21DINO[id],q={npc:id,type:t,state:'offer',got:0,dl:S.day+3};
  if(t==='caza'){q.kind=dino?'d':'z';q.need=dino?4+(Math.random()*3|0):6+(Math.random()*5|0);q.pay=90+q.need*18}
  else if(t==='entrega'){const others=Object.keys(NPC6).filter(k=>k!==id&&q21place(NPC6[k].place));const to=others[Math.random()*others.length|0]||id;
    q.to=to;const p=q21npcPos(to);q.x=p.x;q.z=p.z;q.dl=S.day+2;q.pay=Math.round(80+Math.hypot(p.x-from.x,p.z-from.z)*.45)}
  else{const s=q21spot(from);q.x=s.x;q.z=s.z;const dist=Math.hypot(s.x-from.x,s.z-from.z);
    if(t==='limpieza'){q.kind=dino?'d':(Math.random()<.25?'d':'z');q.need=q.kind==='d'?3+(Math.random()*2|0):5+(Math.random()*4|0);q.pay=Math.round(120+dist*.35+q.need*15)}
    else if(t==='rescate'){q.need=1;q.pay=Math.round(160+dist*.5);q.look=[['#4a5a6a','#7a5a3a','#5a3a3a','#3a4a3a'][Math.random()*4|0],['#c9a888','#a8805e','#e0b898'][Math.random()*3|0],'#3a3a40'];q.guard=2+(Math.random()*2|0)}
    else{q.need=1;q.pay=Math.round(130+dist*.4);q.guard=3+(Math.random()*3|0);q.kind=dino?'d':'z'}}
  const sell=(NPC6[id].sell||[]).filter(([k])=>!/^(svc|w|a):/.test(k));
  if(sell.length&&Math.random()<.55){const [k]=sell[Math.random()*sell.length|0];q.item={[k]:1+(Math.random()<.4?1:0)}}
  return q}

function q21ask(q){const n=NPC6[q.npc],from=q21npcPos(q.npc),d=q.x!=null?Math.round(Math.hypot(q.x-from.x,q.z-from.z)/10)*10:0,dir=q.x!=null?q21dir(from.x,from.z,q.x,q.z):'';
  if(q.type==='caza')return q.kind==='d'?L('Hay dinosaurios rondando la zona. Cazá {q} y te pago bien.',{q:q.need}):L('Los zombis no nos dejan trabajar. Bajá {q} y volvé a contarme.',{q:q.need});
  if(q.type==='limpieza')return q.kind==='d'?L('Una manada de raptores se instaló al {dir}, a unos {d} m. Sacalos de ahí.',{dir,d}):L('Se juntaron zombis al {dir}, a unos {d} m de acá. Limpiá esa zona, por favor.',{dir,d});
  if(q.type==='rescate')return L('Un muchacho salió a buscar remedios y no volvió. Lo vieron al {dir}, a unos {d} m. Traelo de vuelta.',{dir,d});
  if(q.type==='recuperar')return L('Perdimos una caja con provisiones al {dir}, a unos {d} m. Hay bichos cerca. ¿Me la traés?',{dir,d});
  const to=NPC6[q.to];return L('Tengo un paquete para {n}, en {p}. Tiene que llegar en dos días. ¿Lo llevás?',{n:L(to.n),p:L(PLACES6[to.place].n)})}

// ---------- Estado del encargo en curso ----------
function q21where(q){if(!q)return null;
  if(q.state==='back'){const p=q21npcPos(q.npc);return{x:p.x,z:p.z}}
  if(q.type==='caza')return null;
  if(q.type==='rescate'&&q.state==='escort'){const p=q21npcPos(q.npc);return{x:p.x,z:p.z}}
  return{x:q.x,z:q.z}}
function q21hud(q){const w=q21where(q),d=w?Math.round(Math.hypot(w.x-P.x,w.z-P.z)):0,nn=L(NPC6[q.npc].n);
  if(q.state==='back')return L('Volvé con {n} a cobrar ({d} m)',{n:nn,d});
  if(q.type==='caza')return L('Cazá {e}: {a}/{b}',{e:q.kind==='d'?L('dinosaurios'):L('zombis'),a:q.got,b:q.need});
  if(q.type==='limpieza')return q.state==='fight'?L('Limpiá la zona: quedan {n}',{n:Math.max(0,q.need-q.got)}):L('Andá a la zona marcada ({d} m)',{d});
  if(q.type==='rescate')return q.state==='escort'?L('Llevalo a {p} ({d} m)',{p:L(PLACES6[NPC6[q.npc].place].n),d}):L('Encontrá al sobreviviente ({d} m)',{d});
  if(q.type==='recuperar')return L('Buscá la carga ({d} m)',{d});
  return L('Llevá el paquete a {n} ({d} m)',{n:L(NPC6[q.to].n),d})}

function q21clearFx(){for(const k of ['beacon','item','surv']){const o=q21fx[k];if(o&&o.parent)o.parent.remove(o);q21fx[k]=null}}
function q21beacon(x,z){if(!q21fx.beacon){const m=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,60,10,1,true),new THREE.MeshBasicMaterial({color:0x5ad0e0,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.renderOrder=5;scene.add(m);q21fx.beacon=m}q21fx.beacon.position.set(x,terrainY(x,z)+30,z);q21fx.beacon.visible=true}
function q21crate(x,z){const g=new THREE.Group();bx(.7,.42,.5,'#6a4a2a',0,.21,0,g);bx(.72,.06,.52,'#3a2a1a',0,.44,0,g);bx(.08,.44,.52,'#2a2a28',-.22,.22,0,g);bx(.08,.44,.52,'#2a2a28',.22,.22,0,g);
  g.position.set(x,groundY(x,z),z);scene.add(g);return g}
function q21survivor(q,x,z){let g=null;
  try{if(GLB15T.ready&&GLB15T.tpl.human){const tpl=GLB15T.tpl.human,inner=THREE.SkeletonUtils.clone(tpl.scene),mats=[];
    inner.traverse(o=>{if(o.isMesh){o.material=o.material.clone();mats.push(o.material);const n=o.material.name;if(n==='cloth')o.material.color.set(q.look[0]);else if(n==='skin')o.material.color.set(q.look[1]);else if(n==='pants')o.material.color.set(q.look[2]);o.material.emissive=new THREE.Color(0);o.castShadow=true}});
    g=new THREE.Group();g.add(inner);const mixer=new THREE.AnimationMixer(inner),acts={};for(const c of tpl.animations)acts[c.name]=mixer.clipAction(c);acts.idle.play();
    g.userData={glb:'human',mixer,acts,cur:'idle',mats,root:inner}}}catch(e){console.error('q21 surv',e);g=null}
  if(!g)g=humanoid(q.look[0],q.look[1],q.look[2],false);
  g.position.set(x,groundY(x,z),z);scene.add(g);return g}

function q21spawn(q,n){const kinds=q.kind==='d'?['raptor','raptor','raptorp']:['caminante','caminante','corredor'];
  for(let i=0;i<n;i++){const a=Math.random()*6.283,r=4+Math.random()*9;const x=q.x+Math.cos(a)*r,z=q.z+Math.sin(a)*r;
    if(terrainY(x,z)<WATER_Y+.3)continue;const e=spawnEnemy(kinds[Math.random()*kinds.length|0],x,z);e.q21=true}}

function q21fail(why){const S1=q21(),q=S1.active;if(!q)return;q21clearFx();S1.active=null;S1.cd[q.npc]=S.day+1;delete S1.offers[q.npc];S.rep=Math.max(0,S.rep-.3);
  sfx('hurt');toast(L('Misión fallida: {t}',{t:why}),'#cc6a4a',6)}

function q21tick(dt){const S1=q21(),q=S1.active;if(!q){if(q21fx.beacon)q21clearFx();return}
  if(S.day>q.dl){q21fail(L('Se venció el plazo.'));return}
  const w=q21where(q);if(w&&!(q.type==='rescate'&&q.state==='go'&&q21fx.surv&&Math.hypot(q.x-P.x,q.z-P.z)<12))q21beacon(w.x,w.z);else if(q21fx.beacon)q21fx.beacon.visible=false;
  const dT=q.x!=null?Math.hypot(q.x-P.x,q.z-P.z):1e9;
  // limpieza: al llegar aparecen; si se alejaron o desaparecieron, vuelven a aparecer los que faltan
  if(q.type==='limpieza'&&q.state!=='back'){
    if(dT<80){const alive=enemies.filter(e=>e.q21&&!e.dying&&!e.dead).length;if(alive===0&&q.got<q.need){q21spawn(q,q.need-q.got);q.state='fight'}}}
  if((q.type==='recuperar'||q.type==='rescate')&&q.state==='go'){
    if(dT<90&&!q.spawned){q.spawned=1;q21spawn(q,q.guard||3)}
    if(q.type==='recuperar'&&!q21fx.item&&dT<160)q21fx.item=q21crate(q.x,q.z);
    if(q.type==='rescate'&&!q21fx.surv&&dT<160){q21fx.surv=q21survivor(q,q.x,q.z);q.hp=q.hp||100}}
  if(q.type==='rescate'&&q.state==='escort'){
    if(!q21fx.surv){q21fx.surv=q21survivor(q,P.x+1.5,P.z+1.5);q.hp=q.hp||100}
    const g=q21fx.surv,u=g.userData;
    if(P.inTruck){if(Math.hypot(g.position.x-P.x,g.position.z-P.z)<9||q.ride){q.ride=1;g.visible=false;g.position.set(P.x,P.y,P.z)}}
    else{if(q.ride){q.ride=0;g.visible=true;g.position.set(P.x+1.4,groundY(P.x+1.4,P.z+1.4),P.z+1.4)}
      const dx=P.x-g.position.x,dz=P.z-g.position.z,d=Math.hypot(dx,dz);let moving=false;
      if(d>2.4){const sp=Math.min(d>8?6:3.2,d*2);g.position.x+=dx/d*sp*dt;g.position.z+=dz/d*sp*dt;moving=true}
      if(d>60){g.position.set(P.x+1.4,0,P.z+1.4)}
      g.position.y=groundY(g.position.x,g.position.z);g.rotation.y=Math.atan2(dx,dz);
      if(u&&u.acts){play15(u,moving?(d>8?'run':'walk'):'idle',.3,1);u.mixer.update(dt)}
      for(const e of enemies){if(e.dying||e.dead)continue;if(Math.hypot(e.x-g.position.x,e.z-g.position.z)<1.6)q.hp-=12*dt}
      if(q.hp<=0){q21fail(L('El sobreviviente no lo logró.'));return}}
    const p=q21place(NPC6[q.npc].place);if(p&&Math.hypot(g.position.x-p.x,g.position.z-p.z)<p.r+4&&!P.inTruck){q.state='back';sfx('goal');toast(L('Llegaron a salvo. Hablá con {n} para cobrar.',{n:L(NPC6[q.npc].n)}),Q21COL,6)}}
  else if(q21fx.surv&&q21fx.surv.userData&&q21fx.surv.userData.mixer){q21fx.surv.userData.mixer.update(dt)}}

// Muertes: cacería (cualquiera del tipo pedido) y limpieza (los de la zona).
const _killEnemy21=killEnemy;killEnemy=function(e,by,head){const was=e.dying;_killEnemy21(e,by,head);if(was||!e.dying)return;try{
  const q=q21().active;if(!q||q.state==='back')return;
  if(q.type==='caza'&&q21kind(e.type)===q.kind){q.got++;if(q.got>=q.need){q.state='back';sfx('goal');toast(L('Misión cumplida: volvé con {n}.',{n:L(NPC6[q.npc].n)}),Q21COL,6)}}
  if(q.type==='limpieza'&&e.q21){q.got++;if(q.got>=q.need){q.state='back';sfx('goal');toast(L('Zona limpia. Volvé con {n}.',{n:L(NPC6[q.npc].n)}),Q21COL,6)}}}catch(err){console.error('q21 kill',err)}};

// Interacción: el sobreviviente y la carga.
const _findInteract21=findInteract;findInteract=function(){const q=S&&S.q21&&S.q21.active;
  if(q&&!P.inTruck&&q.state==='go'){const near=(o,r)=>o&&Math.hypot(o.position.x-P.x,o.position.z-P.z)<r;
    if(q.type==='rescate'&&near(q21fx.surv,2.6))return{label:L('E · Ayudar al sobreviviente'),sub:q21title(q.type)+' · '+L(NPC6[q.npc].n),act:()=>{q.state='escort';sfx('pickup');toast(L('Gracias… pensé que no salía de esta. Te sigo.'),Q21COL,5)}};
    if(q.type==='recuperar'&&near(q21fx.item,2.4))return{label:L('Mantené E · Agarrar la caja'),sub:q21title(q.type)+' · '+L(NPC6[q.npc].n),hold:1.5,key:'q21',type:'cook',act:()=>{
      if(q21fx.item&&q21fx.item.parent)q21fx.item.parent.remove(q21fx.item);q21fx.item=null;q.state='back';sfx('crate');toast(L('Agarraste la carga. Volvé con {n}.',{n:L(NPC6[q.npc].n)}),Q21COL,6)}}}
  return _findInteract21()};

// ---------- Pestaña "Encargos" del diálogo ----------
function q21pay(q,payer){const S1=q21();S.money+=q.pay;S.rep=Math.min(20,S.rep+.4);gainXp(40);if(q.item)for(const [k,n] of Object.entries(q.item))give6(k,n);
  S1.done++;S1.cd[q.npc]=S.day+1;delete S1.offers[q.npc];S1.active=null;q21clearFx();sfx('goal');
  return L('Misión cumplida.')+' +$'+fmt(q.pay)+(q.item?' + '+Object.entries(q.item).map(([k,n])=>nm(k)+' ×'+n).join(', '):'')}
function q21reward(q){return '$'+fmt(q.pay)+(q.item?' + '+Object.entries(q.item).map(([k,n])=>nm(k)+' ×'+n).join(', '):'')}
function q21body(n){const S1=q21(),q=S1.active,id=n.id;let h='';const msg=npcMsg6?`<div class="banner">${esc(npcMsg6)}</div>`:'';
  // entrega para este personaje
  if(q&&q.type==='entrega'&&q.to===id&&q.state!=='back'){return msg+`<div class="item"><h3>${esc(q21title(q.type))} · ${esc(L(NPC6[q.npc].n))}</h3><p class="say6">${esc(L('¿Eso es para mí? Gracias por traerlo hasta acá.'))}</p><div class="meta"><span>${esc(L('Te da'))}: ${esc(q21reward(q))}</span>${btn(L('Entregar el paquete'),'q21del','','primary')}</div></div>`}
  if(q&&q.npc===id){const ready=q.state==='back';
    return msg+`<div class="item"><h3>${esc(q21title(q.type))} · ${esc(ready?L('Listo para cobrar'):L('En curso'))}</h3><p class="say6">${esc(ready?L('Gracias. Esto no me lo olvido.'):q21ask(q))}</p><p class="note">${esc(q21hud(q))}</p>
      <div class="meta"><span>${esc(L('Te da'))}: ${esc(q21reward(q))}</span>${ready?btn(L('Cobrar'),'q21col','','primary'):btn(L('Abandonar'),'q21ab')}</div></div>`}
  if((S1.cd[id]||0)>S.day)return msg+`<div class="item"><p class="say6">${esc(L('Hoy no tengo nada para vos. Volvé mañana.'))}</p></div>`;
  if(!S1.offers[id])S1.offers[id]=q21make(id);const o=S1.offers[id];
  const busy=!!q;return msg+`<div class="item"><h3>${esc(q21title(o.type))}</h3><p class="say6">${esc(q21ask(o))}</p><p class="note">${esc(L('Plazo: {n} días',{n:o.dl-S.day}))}</p>
    <div class="meta"><span>${esc(L('Te da'))}: ${esc(q21reward(o))}</span>${btn(L('Aceptar'),'q21acc','',busy?'small':'primary')}</div></div>`+(busy?`<p class="note">${esc(L('Ya tenés una misión en curso. Terminala o abandonala primero.'))}</p>`:'')}
const _renderNpc21=renderNpc6;renderNpc6=function(){
  if(npcTab6!=='misiones'){_renderNpc21();q21badge();return}
  const n=npcCur6,d=NPC6[n.id];$('npcRole').textContent=L(d.role)+' · '+L(PLACES6[d.place].n);$('npcName').textContent=L(d.n);$('npcMoney').textContent=`${L('Plata')} $${fmt(S.money)}`;
  document.querySelectorAll('#npcTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===npcTab6));
  $('npcBody').innerHTML=q21body(n);npcMsg6='';q21badge()};
function q21badge(){const n=npcCur6;if(!n)return;const S1=q21(),q=S1.active,b=document.querySelector('#npcTabs button[data-tab="misiones"]');if(!b)return;
  const hot=(q&&((q.npc===n.id&&q.state==='back')||(q.type==='entrega'&&q.to===n.id)))||(!q&&(S1.cd[n.id]||0)<=S.day);
  b.innerHTML=esc(L('Misiones'))+(hot?'<span class="badge">1</span>':'')}
$('npc').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!npcCur6)return;const a=b.dataset.a;if(!/^q21/.test(a))return;
  const S1=q21(),n=npcCur6;
  if(a==='q21acc'){if(S1.active){npcMsg6=L('Ya tenés una misión en curso. Terminala o abandonala primero.')}else{const o=S1.offers[n.id];if(o){o.state=o.type==='caza'?'hunt':'go';o.dl=S.day+(o.type==='entrega'?2:3);S1.active=o;delete S1.offers[n.id];
      if(o.type==='entrega'){reveal6(NPC6[o.to].place)}npcMsg6=L('Misión aceptada. Está marcada en la brújula y el mapa.');sfx('pickup')}}}
  if(a==='q21ab'&&S1.active&&S1.active.npc===n.id){q21clearFx();S1.active=null;S1.cd[n.id]=S.day+1;npcMsg6=L('Misión abandonada.')}
  if(a==='q21col'&&S1.active&&S1.active.npc===n.id&&S1.active.state==='back')npcMsg6=q21pay(S1.active);
  if(a==='q21del'&&S1.active&&S1.active.type==='entrega'&&S1.active.to===n.id)npcMsg6=q21pay(S1.active);
  renderNpc6()});

// ---------- Brújula, mapa y HUD ----------
const _compassExtras21=compassExtras;compassExtras=function(mark){_compassExtras21(mark);const q=S&&S.q21&&S.q21.active;const w=q21where(q);if(w){const d=Math.hypot(w.x-P.x,w.z-P.z);if(d>6)mark(w.x,w.z,Q21COL,'! '+Math.round(d)+' m')}};
const _mapExtras21=mapExtras;mapExtras=function(m,X,Z,label){_mapExtras21(m,X,Z,label);const q=S&&S.q21&&S.q21.active;const w=q21where(q);if(!w)return;
  m.fillStyle=Q21COL;m.strokeStyle='#0a1a1c';m.lineWidth=2;m.beginPath();m.arc(X(w.x),Z(w.z),8,0,6.283);m.fill();m.stroke();label('! '+q21title(q.type),X(w.x),Z(w.z)-14)};
let q21el=null;
const _updateHUD21=updateHUD;updateHUD=function(dt){_updateHUD21(dt);try{
  if(!q21el){const hc=$('hContract');if(!hc)return;q21el=document.createElement('div');q21el.id='q21';q21el.style.cssText='color:'+Q21COL+';font:600 13px var(--f-mono);margin-top:4px;text-shadow:0 1px 2px #000';hc.insertAdjacentElement('afterend',q21el)}
  const q=S&&S.q21&&S.q21.active;q21fx.t-=dt;if(q21fx.t>0)return;q21fx.t=.25;
  q21el.innerHTML=q?'◆ '+esc(q21title(q.type)+' · '+L(NPC6[q.npc].n))+'<br>'+esc(q21hud(q))+(q.type==='rescate'&&q.state==='escort'?' · '+esc(L('Salud {n}%',{n:Math.max(0,Math.round(q.hp))})):''):''}catch(e){}};
const _update21=update;update=function(dt){_update21(dt);try{if(gstate==='play'&&S&&S.q21)q21tick(dt)}catch(e){console.error('q21',e)}};
const _genWorld21=genWorld;genWorld=function(seed){q21clearFx();_genWorld21(seed);if(S&&S.q21&&S.q21.active){const q=S.q21.active;q.spawned=0;if(q.state==='fight')q.state='go';q.ride=0}};
