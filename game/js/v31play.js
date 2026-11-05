'use strict';
/* v0.31: más jugabilidad.
   - Arrojables (tecla G): botella vacía para distraer (el ruido atrae a los bichos que no te vieron),
     molotov (fuego en el piso unos segundos) y granada de mano (rebota y explota a los 2,4 s).
     La molotov y la granada se hacen en el taller; las botellas salen al tomar agua y de los tachos.
   - Sigilo: un indicador abajo de la mira dice si estás oculto, si te están buscando o si te vieron.
     Pegar cuerpo a cuerpo a un bicho que no te vio hace mucho más daño (golpe por la espalda).
   - Expediciones: desde la pestaña Gente mandás a alguien a buscar cosas a las casas de la ruta,
     al pueblo o a San Ignacio. Vuelve en uno o dos días con lo que encontró, a veces herido, y puede no volver. */

// ---------- Datos ----------
const THR31=['molotov','granada_m','botella_v'];
Object.assign(ITEMS,{
  botella_v:{n:'Botella vacía',v:1,w:.3,c:'#7fae9a',cat:'thr'},
  molotov:{n:'Molotov',v:16,w:.7,c:'#c98b2b',cat:'thr'},
  granada_m:{n:'Granada de mano',v:34,w:.4,c:'#4a5a30',cat:'thr'}});
for(const k of THR31)if(!IK.includes(k))IK.push(k);
(function(){const keep={};for(const k of Object.keys(CATS))if(!['food','drink','med'].includes(k)){keep[k]=CATS[k];delete CATS[k]}CATS.thr='Arrojables';Object.assign(CATS,keep)})();
RECIPES.push(
  {id:'molotov',n:'Molotov',in:{botella_v:1,combustible:1,tela:1},out:['molotov',1]},
  {id:'granada_m',n:'Granada de mano',in:{polvora:2,chatarra:1,cinta:1},out:['granada_m',1],need:'banco'});
(function(){const put=(c,row)=>{if(CONT[c])CONT[c].loot.push(row)};
  put('tacho',['botella_v',.4,1,2]);put('alacena',['botella_v',.12,1,1]);put('heladera',['botella_v',.1,1,1]);put('caja',['botella_v',.1,1,2])})();
Object.assign(SPR7,{
  bottle_e:(g,c)=>{g.r(7,2,2,3,tn7(c,-.2)).r(6,5,4,2,c).r(5,7,6,7,c).r(6,8,1,5,tn7(c,.55)).r(5,13,6,1,tn7(c,-.3))},
  molotov:(g,c)=>{g.r(7,4,2,2,'#7a6a50').r(6,6,4,1,'#7fae9a').r(5,7,6,7,'#7fae9a').r(5,10,6,4,c).r(6,8,1,5,'#cfe4da').l(8,4,10,1,'#d8cfb8',2).p(11,1,'#ffb040').p(10,0,'#ff7020')}});
Object.assign(IMAP7,{botella_v:['bottle_e'],molotov:['molotov'],granada_m:['a_grenade']});
function names31(){return [L('Botella vacía'),L('Molotov'),L('Granada de mano'),L('Arrojables')]}

// ---------- Sonidos nuevos ----------
const _sfx31=sfx;sfx=function(k,x,z){if(k!=='glass'&&k!=='fire')return _sfx31.apply(this,arguments);
  try{if(!AC)return;let v=1;if(x!==undefined){const d=Math.hypot(x-P.x,z-P.z);v=Math.max(0,1-d/110);if(v<.03)return}
    if(k==='glass'){nz(.18,6000,.5*v);tn(2400,1800,.06,'triangle',.08*v);tn(3100,2600,.05,'triangle',.06*v)}
    else{nz(.6,900,.5*v);tn(120,60,.4,'sawtooth',.08*v)}}catch(e){}};

// ---------- Lanzar ----------
const TH31={list:[],fires:[],cd:0};
function thrCur31(){if(S.thr31&&S.inv[S.thr31]>0)return S.thr31;for(const k of THR31)if(S.inv[k]>0)return S.thr31=k;return null}
let thrGeo31=null;
function thrMesh31(k){if(!thrGeo31)thrGeo31={b:new THREE.CylinderGeometry(.05,.06,.26,7),g:new THREE.SphereGeometry(.085,8,6)};
  if(k==='granada_m')return new THREE.Mesh(thrGeo31.g,new THREE.MeshStandardMaterial({color:'#4a5a30',roughness:.7}));
  return new THREE.Mesh(thrGeo31.b,new THREE.MeshStandardMaterial({color:k==='molotov'?'#9a7a3a':'#5f8f7a',roughness:.25,metalness:.1,transparent:true,opacity:.85}))}
function throw31(){if(P.inTruck||TH31.cd>0)return;const k=thrCur31();
  if(!k){toast(L('No tenés nada para lanzar. Las molotov y las granadas se hacen en el taller; las botellas vacías salen al tomar agua o revolviendo tachos.'),'#dedcc9',5);return}
  S.inv[k]--;TH31.cd=.9;stamina=Math.max(0,stamina-6);sfx('swing');swingT=Math.max(swingT,.25);
  const cp=Math.cos(P.pitch),fx=-Math.sin(P.yaw)*cp,fz=-Math.cos(P.yaw)*cp,fy=Math.sin(P.pitch),sp=k==='botella_v'?21:18;
  const m=thrMesh31(k),x=P.x+fx*.7,y=P.y+1.45,z=P.z+fz*.7;m.position.set(x,y,z);scene.add(m);
  TH31.list.push({k,x,y,z,vx:fx*sp,vy:fy*sp+4.5,vz:fz*sp,m,t:0,fuse:k==='granada_m'?2.4:0});
  if(k==='granada_m')sfx('fuse');if(!(S.inv[k]>0))S.thr31=null}
// los bichos que no te vieron van a ver qué fue ese ruido
function noise31(x,z,r){for(const e of enemies){if(e.dead||e.dying||e.aggro)continue;const d=EDEF[e.type];if(!d||d.neutral||d.boss)continue;
  if(Math.hypot(e.x-x,e.z-z)<r)e.inv27={x:x+(R()-.5)*3,z:z+(R()-.5)*3,t:16}}}
function impact31(p,y,hitE){const x=p.x,z=p.z;
  if(p.k==='botella_v'){sfx('glass',x,z);burst(x,y+.1,z,'#cfe4da',8,3,.05,9);noise31(x,z,34);if(hitE)hurtEnemy(hitE,8,false,'p',L('Botella vacía'));return}
  if(p.k==='molotov'){sfx('glass',x,z);sfx('fire',x,z);burst(x,y+.3,z,'#ff9a30',14,4,.12,4);noise31(x,z,24);fire31(x,z)}}
let fireGeo31=null;
function fire31(x,z){if(!fireGeo31)fireGeo31={c:new THREE.ConeGeometry(.22,.9,5,1,true),o:new THREE.MeshBasicMaterial({color:'#ff6a12',transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}),y:new THREE.MeshBasicMaterial({color:'#ffc040',transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})};
  const g=new THREE.Group(),fl=[];for(let i=0;i<16;i++){const a=i*2.4,r=i?.4+R()*2.4:0;const m=new THREE.Mesh(fireGeo31.c,i%3?fireGeo31.o:fireGeo31.y);m.position.set(Math.cos(a)*r,.4,Math.sin(a)*r);m.userData.s=(.6+R()*.8)*(1.2-r/3.5);g.add(m);fl.push(m)}
  g.position.set(x,groundY(x,z),z);scene.add(g);TH31.fires.push({x,z,r:3.2,t:weather31wet()?5:9,g,fl,tick:0})}
function weather31wet(){try{return !!(S.weather&&/rain|lluv|storm|torment/i.test(S.weather.k||S.weather.type||S.weather))}catch(e){return false}}
function hitWall31(x,y,z){for(const b of qAABB(x,z)){if(b.dead||b.kind==='floor')continue;if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y>b.y0&&y<b.y1)return b}return null}
function upd31(dt){TH31.cd-=dt;
  for(let i=TH31.list.length-1;i>=0;i--){const p=TH31.list[i];p.t+=dt;p.vy-=16*dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt,nz=p.z+p.vz*dt;let done=false;
    const w=hitWall31(nx,ny,nz);
    if(w){if(p.k==='granada_m'){if(p.x<=w.x0||p.x>=w.x1)p.vx*=-.4;else p.vz*=-.4;p.vy*=.6}else{impact31(p,p.y);done=true}}
    else{p.x=nx;p.y=ny;p.z=nz}
    if(!done&&p.k!=='granada_m')for(const e of enemies){if(e.dead||e.dying)continue;const sc=e.scale||1;if(Math.hypot(e.x-p.x,e.z-p.z)<e.r+.25&&p.y>e.y&&p.y<e.y+1.9*sc){impact31(p,p.y,e);done=true;break}}
    const gy=groundY(p.x,p.z);
    if(!done&&p.y<=gy+.08){if(p.k==='granada_m'){p.y=gy+.08;if(Math.abs(p.vy)>2.5){p.vy=-p.vy*.35;sfx('thud',p.x,p.z)}else p.vy=0;p.vx*=.55;p.vz*=.55}else{impact31(p,gy);done=true}}
    if(!done&&p.k==='granada_m'){p.fuse-=dt;if(p.fuse<=0){explode(p.x,p.y+.2,p.z,7,150,'p');noise31(p.x,p.z,90);done=true}}
    if(!done&&p.t>8)done=true;
    if(done){scene.remove(p.m);TH31.list.splice(i,1);continue}
    p.m.position.set(p.x,p.y,p.z);p.m.rotation.x+=dt*10;p.m.rotation.z+=dt*6}
  for(let i=TH31.fires.length-1;i>=0;i--){const f=TH31.fires[i];f.t-=dt;const k=Math.min(1,f.t/1.5);
    for(const m of f.fl){const s=m.userData.s*(0.75+Math.random()*.5)*k;m.scale.set(s,s*(1+Math.random()*.5),s)}
    if(Math.random()<dt*6)burst(f.x+(R()-.5)*3,groundY(f.x,f.z)+.8,f.z+(R()-.5)*3,'#ffb040',2,1.5,.05,-3);
    f.tick-=dt;if(f.tick<=0){f.tick=.5;
      for(const e of enemies){if(e.dead||e.dying)continue;if(Math.hypot(e.x-f.x,e.z-f.z)<f.r+e.r){e.burn31=3;hurtEnemy(e,15,false,'p',L('Molotov'),true)}}
      if(!P.inTruck&&Math.hypot(P.x-f.x,P.z-f.z)<f.r&&invuln<=0)hurtPlayer(7)}
    if(f.t<=0){scene.remove(f.g);TH31.fires.splice(i,1)}}
  // los que salieron del fuego siguen quemándose un rato
  burnT31-=dt;if(burnT31<=0){burnT31=.5;for(const e of enemies){if(!(e.burn31>0)||e.dead||e.dying)continue;e.burn31-=.5;hurtEnemy(e,6,false,'p',L('Molotov'),true);burst(e.x,e.y+1.2*(e.scale||1),e.z,'#ff8a30',3,1.2,.06,-3)}}}
let burnT31=0;
function clear31(){for(const p of TH31.list)scene.remove(p.m);for(const f of TH31.fires)scene.remove(f.g);TH31.list.length=0;TH31.fires.length=0}

// ---------- Sigilo ----------
let bsT31=-99;
const _hurtEnemy31=hurtEnemy;hurtEnemy=function(e,dmg,head,src,by,ap){
  try{if(src==='p'&&e&&!e.dead&&!e.dying&&!e.aggro&&swingT>0&&S.cur&&WEAP[S.cur]&&WEAP[S.cur].melee){const d=EDEF[e.type];
    if(d&&!d.neutral){const m=d.boss?1.5:(d.mini||d.heavy)?2:3.5;dmg*=e.inv27?1+(m-1)*.5:m;S.stats.bs31=(S.stats.bs31||0)+1;
      if(time-bsT31>3){bsT31=time;toast(L('¡Golpe por la espalda!'),'#8fbb62',2)}}}}catch(err){}
  return _hurtEnemy31.call(this,e,dmg,head,src,by,ap)};
function eyeState31(){let st=-1;for(const e of enemies){if(e.dead||e.dying)continue;const d=EDEF[e.type];if(!d||d.neutral)continue;const dd=Math.hypot(e.x-P.x,e.z-P.z);if(dd>60)continue;
    if(e.aggro){return 2}st=Math.max(st,e.inv27&&dd<45?1:0)}return st}
let eyeEl31=null,thrEl31=null,hudT31=0;
function hud31(dt){hudT31-=dt;if(hudT31>0)return;hudT31=.15;
  if(!eyeEl31){eyeEl31=document.createElement('div');eyeEl31.id='eye31';$('hud').appendChild(eyeEl31);thrEl31=document.createElement('div');thrEl31.id='thr31';$('hBR').prepend(thrEl31)}
  const st=P.inTruck?-1:eyeState31();eyeEl31.hidden=st<0;
  if(st>=0){const t=[L('Oculto'),L('Te están buscando'),L('Te vieron')][st];eyeEl31.className='s'+st;eyeEl31.innerHTML=`<svg viewBox="0 0 24 14" width="22" height="13"><path d="M1 7 Q12 -4 23 7 Q12 18 1 7Z" fill="none" stroke="currentColor" stroke-width="1.8"/>${st?'<circle cx="12" cy="7" r="3.4" fill="currentColor"/>':'<path d="M3 12 L21 2" stroke="currentColor" stroke-width="1.8"/>'}</svg><span>${esc(t)}${st===0&&(P.crouch||keys['control'])?' · '+esc(L('agachado')):''}</span>`}
  const k=thrCur31();thrEl31.hidden=!k||P.inTruck;if(k)thrEl31.innerHTML=`<kbd>G</kbd>${ico(k)}<span>${esc(nm(k))} ×${S.inv[k]}</span>`}

// ---------- Enganches ----------
const _update31=update;update=function(dt){_update31.apply(this,arguments);if(gstate!=='play')return;
  try{if(pressed['g']&&!(interact&&interact.alt))throw31();upd31(dt);hud31(dt)}catch(e){console.error('v31',e)}};
const _consume31=consume;consume=function(item){const r=_consume31.apply(this,arguments);try{if(r!==false&&item==='agua'&&R()<.6){S.inv.botella_v=(S.inv.botella_v||0)+1}}catch(e){}return r};
const _useItem31=useItem;useItem=function(k){if(ITEMS[k]&&ITEMS[k].cat==='thr'){if(S.inv[k]>0){S.thr31=k;toast(L('Listo para lanzar con G: {i}.',{i:nm(k)}),'#8fbb62',2)}return}return _useItem31.apply(this,arguments)};
const _renderInv31=renderInv;renderInv=function(){_renderInv31.apply(this,arguments);try{if(invTab!=='items')return;
  for(const k of THR31){if(!(S.inv[k]>0))continue;const d=$('invBody')&&$('invBody').querySelector(`button[data-a="drop"][data-k="${k}"]`);if(!d)continue;
    if(thrCur31()===k)d.insertAdjacentHTML('beforebegin',`<span class="sel29">${esc(L('Para lanzar (G)'))}</span>`);else d.insertAdjacentHTML('beforebegin',btn(L('Preparar (G)'),'use',`data-k="${k}"`,'small primary'))}}catch(e){console.error('inv31',e)}};
{const _startGame31=startGame;startGame=function(){clear31();return _startGame31.apply(this,arguments)}}

// ---------- Expediciones ----------
const EXP31={
  ruta:{n:'Casas de la ruta',d:1,risk:.05,rolls:4,loot:[['lata',3,1,3],['agua',3,1,3],['tela',2,1,3],['madera',2,2,4],['botella_v',2,1,2],['cuerda',1,1,1],['venda',1,1,2]]},
  pueblo:{n:'El pueblo',d:1,risk:.09,rolls:5,loot:[['lata',3,1,3],['agua',2,1,3],['chatarra',3,1,3],['cinta',2,1,1],['pilas',2,1,2],['venda',2,1,2],['combustible',1,1,1],['clavos',2,2,4]]},
  ciudad:{n:'San Ignacio',d:2,risk:.18,rolls:8,loot:[['lata',3,2,4],['agua',2,2,3],['medicina',2,1,1],['antibioticos',1,1,1],['analgesicos',2,1,2],['polvora',2,1,2],['chatarra',2,2,4],['combustible',2,1,1],['herramientas',1,1,1],['cinta',2,1,2]]}};
function names31exp(){return [L('Casas de la ruta'),L('El pueblo'),L('San Ignacio')]}
let expPick31=null;
function expSend31(id,z){const C=crew28(),w=C.list.find(x=>x.id===id),Z=EXP31[z];if(!w||!Z||w.exp31)return'';const h=hourOf(S.t);
  if(h>=19.5||h<6.5)return L('De noche nadie sale. Mandalo a la mañana.');
  if(stockDays28('food')<1||stockDays28('drink')<1)return L('No hay comida y agua para que lleve en el viaje.');
  consume28('food',NEED28.food*Z.d*.5);consume28('drink',NEED28.drink*Z.d*.5);
  w.exp31={z,back:S.day+Z.d};expPick31=null;return L('{n} salió para {z}. Vuelve el día {d}.',{n:w.name,z:L(Z.n),d:w.exp31.back})}
function expBack31(){const C=crew28(),msgs=[];
  for(const w of [...C.list]){const x=w.exp31;if(!x||x.back>S.day)continue;delete w.exp31;const Z=EXP31[x.z];if(!Z)continue;
    let risk=Z.risk*(w.job==='guardia'||w.job==='cazador'?.5:1)*(w.mor<40?1.4:1);const out={};let rolls=Z.rolls+(w.job==='carronero'?3:0)+(w.mor>=70?1:0);
    let hurt=false;if(R()<risk){if(R()<.4){C.list=C.list.filter(o=>o!==w);C.dead=(C.dead||0)+1;msgs.push([L('{n} no volvió de {z}.',{n:w.name,z:L(Z.n)}),'#cc4b30']);continue}hurt=true;rolls=Math.ceil(rolls/2);w.hp=35;w.mor=Math.max(0,w.mor-15)}
    const tot=Z.loot.reduce((a,r)=>a+r[1],0);for(let i=0;i<rolls;i++){let q=R()*tot;for(const [k,wt,a,b] of Z.loot){q-=wt;if(q<=0){give28(out,k,a+Math.floor(R()*(b-a+1)));break}}}
    w.mor=Math.min(100,w.mor+(hurt?0:4));
    const got=Object.entries(out).map(([k,q])=>nm(k)+' ×'+q).join(', ');w.last=got||null;
    msgs.push([hurt?L('{n} volvió herido de {z} con: {i}.',{n:w.name,z:L(Z.n),i:got||'—'}):L('{n} volvió de {z} con: {i}.',{n:w.name,z:L(Z.n),i:got||'—'}),hurt?'#e0a040':'#8fbb62'])}
  if(msgs.length){C.log=[...(C.log||[]),...msgs.map(m=>m[0])];setTimeout(()=>{try{for(const [m,c] of msgs)toast(m,c,9)}catch(e){}},4000)}}
if(typeof crewDay28==='function'){
  const _crewDay31=crewDay28;crewDay28=function(){const C=crew28(),already=C.day===S.day;_crewDay31.apply(this,arguments);if(!already)try{expBack31()}catch(e){console.error('exp31',e)}};
  const _home31=home28;home28=function(w,i){if(w&&w.exp31)return null;return _home31.apply(this,arguments)};
  const _produce31=produce28;produce28=function(w,out){if(w&&w.exp31)return;return _produce31.apply(this,arguments)};
  const _tab31=tabGente28;tabGente28=function(){let h=_tab31.apply(this,arguments);const C=crew28();
    // agrega la línea de expedición a cada persona (en el mismo orden que la lista)
    const rows=h.split('<h4>');const i=rows.findIndex(r=>r.startsWith(esc(L('Tu gente'))));if(i<0||!C.list.length)return h;
    let k=0;rows[i]=rows[i].replace(/<div class="acts">/g,m=>{const w=C.list[k++];if(!w)return m;
      if(w.exp31)return `<div class="exp31"><span class="chance">${esc(L('De expedición en {z} · vuelve el día {d}',{z:L(EXP31[w.exp31.z].n),d:w.exp31.back}))}</span></div>`+m.replace('class="acts"','class="acts" hidden');
      if(expPick31===w.id)return m+Object.entries(EXP31).map(([z,Z])=>btn(`${L(Z.n)} · ${Z.d===1?L('1 día'):L('{n} días',{n:Z.d})}`,'g28exp',`data-id="${w.id}" data-z="${z}"`)).join('')+btn(L('Cancelar'),'g28exp',`data-id="${w.id}" data-z="-"`);
      return m+btn(L('Mandar de expedición'),'g28exp',`data-id="${w.id}"`)});
    h=rows.join('<h4>');
    h+=`<p class="note">${esc(L('Expediciones: mandás a alguien a buscar cosas afuera. Lleva comida y agua del depósito y vuelve con lo que encuentra. Más lejos hay más cosas, pero es más peligroso. Los guardias y los cazadores se cuidan mejor; el carronero encuentra más.'))}</p>`;
    return h};
  $('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a="g28exp"]');if(!b||b.disabled||!S)return;e.stopImmediatePropagation();const id=+b.dataset.id,z=b.dataset.z;
    panelMsg='';if(!z)expPick31=id;else if(z==='-')expPick31=null;else panelMsg=expSend31(id,z);renderPanel()},true)}

(function(){const css=`
#eye31{position:absolute;left:50%;top:calc(50% + 34px);transform:translateX(-50%);display:flex;align-items:center;gap:6px;font:600 11px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;background:rgba(12,16,13,.55);border-radius:2px;pointer-events:none}
#eye31.s0{color:#9fb59a}#eye31.s1{color:#e0a040}#eye31.s2{color:#e05a3a}
#thr31{display:flex;align-items:center;gap:6px;justify-content:flex-end;font:500 12px var(--f-mono);color:var(--muted);margin-bottom:6px}
#thr31 .ico{width:20px;height:20px;margin:0}
.exp31{margin-top:4px}
`;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})();
