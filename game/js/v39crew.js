'use strict';
/* v0.39: la gente patrulla, se cura y pelea; eventos en la ruta con decisiones; más estilos de juego.
   - Guardias: patrullan el patio, se cubren dentro del almacén si están heridos y gastan balas del depósito (sin balas pegan flojo).
   - Todos devuelven los golpes de cerca; el enfermero cura a los heridos; el ánimo sube con el perk Líder nato.
   - Eventos en la ruta (viajero herido, caravana, emboscada, camión varado): te acercás, apretás E y elegís qué hacer.
   - Perks nuevos: Pies de gato, Líder nato, Pirómano y Don de gentes. */

// ---------- perks nuevos ----------
PERKS.push({id:'sigilo',n:'Pies de gato',d:'Los bichos te notan desde un 25% menos de distancia.'},
  {id:'lider',n:'Líder nato',d:'Tu gente rinde más: los guardias pegan un 25% más y el ánimo sube solo.'},
  {id:'piro',n:'Pirómano',d:'Granadas, molotov y minas pegan un 35% más fuerte y llegan más lejos.'},
  {id:'diplo',n:'Don de gentes',d:'En la ruta pagás un 30% menos y quien ayudás te da más.'});
const _sees39=ai27sees;ai27sees=function(e,dP,ar,dt){return _sees39.call(this,e,dP,PK('sigilo')?ar*.75:ar,dt)};
const _explode39=explode;explode=function(x,y,z,r,dmg,src,toxic){if(src==='p'&&PK('piro')){r*=1.15;dmg*=1.35}return _explode39.call(this,x,y,z,r,dmg,src,toxic)};

// ---------- guardias: patrullan, se cubren y gastan balas ----------
const PAT39=[[-12,30],[0,35],[12,30],[17,22],[0,26],[-15,19]];
const _home39=home28;
home28=function(w,i){const r=_home39.apply(this,arguments);
  try{if(w.cand||w.job!=='guardia'||(typeof tower37==='function'&&tower37(w)))return r;
    if(w.hp<35)return{x:-1+(i%3),z:-13};// herido: se mete a cubierto dentro del almacén
    if(threat28(0,30,40))return{x:(i%3-1)*3,z:36};
    const k=(Math.floor(time/11)+i*2)%PAT39.length;return{x:PAT39[k][0],z:PAT39[k][1]}}catch(e){}
  return r};
const _hurt39=hurtEnemy;
hurtEnemy=function(e,dmg,head,src,by,ap){
  try{if(src==='t'&&by===L('Guardia')){if(PK('lider'))dmg*=1.25;
    const A=S.ammo;if(A&&(A.balas||0)>=.25){A.balas-=.25}else dmg*=.35}}catch(err){}
  return _hurt39.call(this,e,dmg,head,src,by,ap)};

// ---------- vida de la gente: contraataque y curación ----------
let lifeT39=0,healT39=0,fightT39=0;
function crewLife39(dt){const C=crew28();if(!C.list.length)return;
  fightT39-=dt;if(fightT39<=0){fightT39=1.1;
    for(const w of C.list){const o=crewG28.get(w.id);if(!o||!o.g.visible)continue;
      let tgt=null;for(const e of enemies)if(hostile28(e)&&Math.abs(e.x-o.x)<2.4&&Math.abs(e.z-o.z)<2.4&&Math.hypot(e.x-o.x,e.z-o.z)<2.4){tgt=e;break}
      if(!tgt||w.hp<25)continue;
      const base={guardia:16,cazador:13,carpintero:12,mecanico:11,carronero:11}[w.job]||6,rank=(w.xp37||0)>=36?.3:(w.xp37||0)>=12?.15:0;
      o.g.rotation.y=Math.atan2(tgt.x-o.x,tgt.z-o.z);sfx('blunt',o.x,o.z);w.fight39=(w.fight39||0)+1;
      hurtEnemy(tgt,base*(.6+w.mor/250)*(1+rank)*(PK('lider')?1.25:1),false,'t',w.name)}}
  lifeT39-=dt;if(lifeT39<=0){lifeT39=1;
    for(const w of C.list){if(PK('lider'))w.mor=Math.min(100,w.mor+.02);
      const o=crewG28.get(w.id);if(w.hp<100&&o&&o.g.visible&&!threat28(o.x,o.z,18))w.hp=Math.min(100,w.hp+.08)}}
  healT39-=dt;if(healT39<=0){healT39=7;
    const nurse=C.list.find(w=>w.job==='enfermero'&&w.hp>30&&crewG28.get(w.id)&&crewG28.get(w.id).g.visible);
    if(nurse){const sick=C.list.filter(w=>w!==nurse&&w.hp<80).sort((a,b)=>a.hp-b.hp)[0];
      if(sick){sick.hp=Math.min(100,sick.hp+20+(has37('enferm')?10:0));const o=crewG28.get(sick.id);if(o)burst(o.x,groundY(o.x,o.z)+1.4,o.z,'#6fbf6f',5,1.5)}}}}
const _crewTick39=crewTick28;crewTick28=function(dt){_crewTick39.apply(this,arguments);try{crewLife39(dt)}catch(e){console.error('v39 gente',e)}};

// ---------- eventos en la ruta ----------
const EV39T={
 ayuda:{w:3,n:()=>L('Un viajero herido'),
  txt:()=>L('Está tirado al costado del camino, apretándose una pierna. «Por favor... no me dejes acá.»'),
  opts:[{t:()=>L('Vendarlo (1 venda)'),need:{venda:1},f:ev=>{take39({venda:1});karma39(1);const r=Math.random();
      if(r<.35){const c=makeCand37();return L('Se levanta, te agradece y te pide un lugar en el almacén. Pasó a la lista de los que buscan refugio: {n}.',{n:c.name})}
      if(r<.7){const k=[...Object.keys(PLACES6)].filter(p=>reveal6(p)).slice(0,2);return k.length?L('Te cuenta de lugares que no conocías. Los marcaste en el mapa.'):L('Te agradece de corazón. No sabe nada nuevo, pero se va más tranquilo.')}
      const m=Math.round((40+Math.random()*50)*(PK('diplo')?1.4:1));S.money+=m;return L('Te agradece y te da ${m} de lo poco que tiene.',{m})}},
   {t:()=>L('Darle una lata y agua'),need:{lata:1,agua:1},f:ev=>{take39({lata:1,agua:1});karma39(1);give6('pilas',PK('diplo')?3:2);return L('Come y bebe de a sorbos. Antes de irse te regala unas pilas.')}},
   {t:()=>L('Seguir de largo'),f:ev=>{karma39(-1);return L('Seguís. Te quedás con el peso de haberlo dejado.')}}]},
 caravana:{w:3,n:()=>L('Caravana de comerciantes'),
  txt:()=>L('Tres personas con un carro cargado de cosas. Te hacen señas desde lejos: «¡Tranqui! Solo vendemos.»'),
  opts:[{t:()=>L('Comprar 24 balas (${p})',{p:price39(70)}),cost:()=>price39(70),f:ev=>{S.money-=price39(70);S.ammo.balas=(S.ammo.balas||0)+24;return L('Compraste 24 balas.')}},
   {t:()=>L('Comprar carne y agua (${p})',{p:price39(45)}),cost:()=>price39(45),f:ev=>{S.money-=price39(45);give6('carne',3);give6('agua',2);return L('Compraste 3 de carne y 2 botellas de agua.')}},
   {t:()=>L('Escuchar las noticias de la ruta'),f:ev=>{const k=Object.keys(PLACES6).filter(p=>reveal6(p)).slice(0,2);return k.length?L('Te cuentan de lugares que no conocías. Los marcaste en el mapa.'):L('No tienen nada nuevo que contarte.')}},
   {t:()=>L('Seguir de largo'),f:ev=>L('Levantás una mano y seguís.')}]},
 emboscada:{w:2,n:()=>L('Autos abandonados'),
  txt:()=>L('Dos autos choqueados con un baúl entreabierto. Se oye algo moverse entre la chapa.'),
  opts:[{t:()=>L('Revisar el baúl rápido'),f:ev=>{loot39({ammo:12,medicina:.5,combustible:1,pilas:2});ambush39(4+(S.day>3?2:0),false);return L('Sacás lo que podés, pero algo sale de entre los autos. ¡Corré o peleá!')}},
   {t:()=>L('Hacer ruido para atraerlos'),f:ev=>{ambush39(2+(S.day>3?1:0),true);loot39({ammo:6,pilas:1});return L('Tirás una piedra contra la chapa. Salen de a poco y de a uno. Cuando terminan, revisás con calma.')}},
   {t:()=>L('Rodear sin acercarte'),f:ev=>L('Rodeás los autos agachado y seguís tu camino.')}]},
 varado:{w:2,n:()=>L('Camión varado'),
  txt:()=>L('Un camión de reparto tirado en la banquina, con el tanque a medias. Nadie a la vista.'),
  opts:[{t:()=>L('Sacar combustible (hace ruido)'),f:ev=>{give6('combustible',PK('diplo')?3:2);noise38(P.x,P.z,60);ambush39(2,true,true);return L('Llenás los bidones, pero el ruido se oye lejos. Vienen podridos.')}},
   {t:()=>L('Revisar la cabina'),f:ev=>{loot39({chatarra:3,pilas:2,lata:2});if(Math.random()<.3){ambush39(2,false);return L('Encontrás algo útil, pero había alguien durmiendo en el asiento de atrás.')}return L('Encontrás cosas útiles y nadie te molesta.')}},
   {t:()=>L('Seguir de largo'),f:ev=>L('Lo dejás atrás.')}]}};
const price39=p=>{const k=(S.story&&S.story.karma)||0;return Math.round(p*(PK('diplo')?.7:1)*(k>=3?.9:k<=-2?1.25:1))};
function karma39(n){const s=story6();s.karma=(s.karma||0)+n;if(n>0)s.helped=(s.helped||0)+1}
function take39(o){for(const k in o){let left=o[k];const a=Math.min(left,S.inv[k]||0);S.inv[k]=(S.inv[k]||0)-a;left-=a;if(left>0)S.stash[k]=Math.max(0,(S.stash[k]||0)-left)}}
const have39=k=>(S.inv[k]||0)+(S.stash[k]||0);
function loot39(o){for(const k in o){if(k==='ammo'){S.ammo.balas=(S.ammo.balas||0)+o[k];continue}const q=o[k]<1?(Math.random()<o[k]?1:0):o[k];if(q)give6(k,q)}}
function ring39(r0,r1){for(let k=0;k<30;k++){const a=Math.random()*6.283,r=r0+Math.random()*(r1-r0),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(terrainY(x,z)>WATER_Y+.5)return{x,z}}return{x:P.x+r0,z:P.z}}
function ambush39(n,slow,noisy){const types=S.day>3?['caminante','corredor','corredor','raptorp']:['caminante','caminante','corredor'];
  for(let i=0;i<n;i++){const p=ring39(18,26),t=types[Math.random()*types.length|0],e=spawnEnemy(t,p.x,p.z);
    if(noisy){e.inv27={x:P.x,z:P.z,t:20}}else if(slow){setTimeout(()=>{if(!e.dead&&!e.dying&&gstate!=='dead')ai27aggro(e)},800+i*2500)}else ai27aggro(e)}}
let ev39=null,evT39=120+Math.random()*100,evToast39=false;
function evMesh39(type,x,z){const g=new THREE.Group(),y=terrainY(x,z);g.position.set(x,y,z);
  const person=(c,ox,oz,ry)=>{let p=typeof glbHuman24==='function'?glbHuman24(c,SKINS28[Math.random()*4|0],'#2f3a48'):null;if(!p){p=new THREE.Group();bx(.5,.9,.3,c,0,1.2,0,p);bx(.3,.3,.3,'#c89a76',0,1.85,0,p);bx(.4,.75,.25,'#2f3a48',0,.38,0,p)}
    scene.remove(p);p.position.set(ox,0,oz);p.rotation.y=ry||0;g.add(p);return p};
  if(type==='ayuda'){const p=person('#7a6a4a',0,0,1);p.rotation.x=-1.25;p.position.y=.35;bx(.8,.3,.5,'#4a4030',1.1,.15,.2,g)}
  else if(type==='caravana'){person('#8a5a3a',-1.8,.8,.6);person('#4a6a7a',1.8,1,-.6);person('#6a4a6a',0,-2.4,0);
    bx(2.6,.2,1.5,'#6a5230',0,.65,0,g);bx(2.6,.9,.15,'#7a6038',0,1.1,.7,g);bx(2.6,.9,.15,'#7a6038',0,1.1,-.7,g);bx(2.4,.5,1.3,'#b9a26b',0,1.05,0,g);
    for(const s of [-1,1])bx(.15,1,1,'#2a2a2a',s*1.2,.5,0,g)}
  else if(type==='emboscada'){const a=bx(4.2,1.1,1.9,'#5a4a42',0,.7,0,g);a.rotation.y=.4;bx(2.2,.7,1.7,'#3a3434',-.1,1.45,0,a.parent||g);const b=bx(4.2,1.1,1.9,'#3a4a52',3.2,.7,-3,g);b.rotation.y=-1.1;bx(.9,.6,.7,'#6a5a30',-.4,1.5,1.2,g)}
  else{bx(6,2.4,2.4,'#7a7a6a',0,1.7,0,g);bx(1.8,1.8,2.3,'#3a5a7a',-3.7,1.2,0,g);bx(1,.7,.5,'#b84a2a',2,.45,2,g);for(const s of [-1,1])for(const t of [-2,2])bx(.3,.8,.8,'#222',t,.4,s*1.3,g)}
  scene.add(g);return g}
function evSpawn39(){const C=crew28(),pts=roadPts36(),fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);let best=[];
  for(const p of pts){const dx=p.x-P.x,dz=p.z-P.z,d=Math.hypot(dx,dz);if(d<50||d>95||Math.hypot(p.x,p.z)<110)continue;if(townW(p.x,p.z)>.02)continue;if(terrainY(p.x,p.z)<WATER_Y+.8)continue;
    const dot=(dx*fx+dz*fz)/d;best.push({p,s:dot+Math.random()*.8})}
  if(!best.length)return false;best.sort((a,b)=>b.s-a.s);const p=best[0].p;
  const tot=Object.values(EV39T).reduce((s,t)=>s+t.w,0);let r=Math.random()*tot,type='ayuda';for(const k in EV39T){if((r-=EV39T[k].w)<=0){type=k;break}}
  const ox=p.x+Math.cos(p.yaw)*5,oz=p.z-Math.sin(p.yaw)*5;
  ev39={type,x:ox,z:oz,g:evMesh39(type,ox,oz),age:0,done:false};
  if(!evToast39){evToast39=true;toast(L('Hay algo sobre el camino, más adelante. Acercate y apretá E.'),'#e3a33b',6)}return true}
function evClear39(){if(ev39&&ev39.g){scene.remove(ev39.g)}ev39=null}
function evTick39(dt){if(!S||gstate!=='play')return;
  if(ev39){ev39.age+=dt;const d=Math.hypot(ev39.x-P.x,ev39.z-P.z);if(d>260||ev39.age>520)evClear39();return}
  evT39-=dt;if(evT39>0)return;evT39=Math.random()<.2?30:200+Math.random()*220;
  if(S.day<2||Math.hypot(P.x,P.z)<110||P.inTruck&&Math.abs(truck.speed)>14)return;
  try{evSpawn39()}catch(e){console.error('v39 evento',e)}}
const _update39=update;update=function(dt){try{evTick39(dt)}catch(e){console.error('v39 ev',e)}return _update39.call(this,dt)};
const _genWorld39=genWorld;genWorld=function(){try{evClear39()}catch(e){}return _genWorld39.apply(this,arguments)};

// interacción y panel de decisión
const _findInteract39=findInteract;
findInteract=function(){if(ev39&&!ev39.done&&Math.hypot(ev39.x-P.x,ev39.z-P.z)<4.6){const T=EV39T[ev39.type];return{label:L('E · {n}',{n:T.n()}),sub:L('Decidí qué hacer'),act:()=>openEv39()}}
  return _findInteract39()};
let evRes39='',evCur39=null;
const evDef39=()=>evCur39.T||EV39T[evCur39.type];
function openEv39(o){evCur39=(o&&o.T)?o:ev39;evRes39='';gstate='ev39';unlock();sfx('pickup');renderEv39();show('ev39')}
function renderEv39(){const T=evDef39();$('ev39Name').textContent=T.n();
  const opts=T.opts.map((o,i)=>{const ok=(!o.need||Object.entries(o.need).every(([k,q])=>have39(k)>=q))&&(!o.cost||S.money>=o.cost())&&(!o.ok||o.ok());
    return `<button class="${ok?'primary':'small'}" data-a="ev39" data-i="${i}" ${ok?'':'disabled'}>${esc(o.t())}</button>`}).join('');
  const para=t=>String(t).split('\n\n').map(x=>`<p class="say6">${esc(x)}</p>`).join('');
  $('ev39Body').innerHTML=evRes39?`<div class="item">${para(evRes39)}</div><div class="btns6"><button class="primary" data-a="ev39x">${esc(L('Seguir camino'))}</button></div>`
    :`<div class="item">${para(T.txt())}</div><div class="btns6" style="flex-direction:column;align-items:stretch;gap:.5rem">${opts}</div><p class="note">${esc(L('Plata ${m} · Esc para irte sin decidir',{m:fmt(S.money)}))}</p>`}
OVS.push('ev39');
$('ev39').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!evCur39)return;
  if(b.dataset.a==='ev39x'){if(evCur39===ev39)evClear39();evCur39=null;resume();pressed={};return}
  if(b.dataset.a==='ev39'&&!evCur39.done){const o=evDef39().opts[+b.dataset.i];if(!o)return;evCur39.done=true;
    try{evRes39=o.f(evCur39)||''}catch(err){console.error('v39 opción',err);evRes39=L('Seguís tu camino.')}sfx('goal');gainXp(8);renderEv39()}});
addEventListener('keydown',e=>{if(gstate!=='ev39')return;const k=e.key.toLowerCase();if(k==='escape'||k==='e'){e.stopImmediatePropagation();e.preventDefault();if(e.repeat)return;if(evCur39&&evCur39.done&&evCur39===ev39)evClear39();evCur39=null;resume();pressed={}}},true);
