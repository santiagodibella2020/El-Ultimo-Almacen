'use strict';
// ================= OVERLAYS =================
const OVS=['menu','newgame','options','panel','levelup','pause','dead','bigmap','inv','loot'];
function hideAll(){OVS.forEach(id=>$(id).hidden=true)}
function show(id){OVS.forEach(o=>$(o).hidden=o!==id);$('wait').hidden=true}
function resume(){hideAll();mouse.down=false;mouse.right=false;document.body.classList.toggle('iso',camMode==='iso');if(noLock()||locked){gstate='play';$('wait').hidden=true;return}gstate='wait';$('wait').hidden=false;requestLock()}
function unlock(){if(document.pointerLockElement)document.exitPointerLock()}
const row=(cols,cls='')=>`<div class="row ${cls}">${cols}</div>`;
const dot=c=>`<span class="dot" style="background:${c}"></span>`;
const btn=(label,a,extra='',cls='small')=>`<button class="${cls}" data-a="${a}" ${extra}>${esc(label)}</button>`;

// ---------- Pause ----------
function openPause(){gstate='pause';mouse.down=false;unlock();$('saveCode').value=btoa(unescape(encodeURIComponent(serialize())));$('pauseMsg').textContent='';$('btnQuitP').hidden=!IS_DESKTOP;show('pause')}
$('pause').addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='resume')resume();
  if(a==='save')$('pauseMsg').textContent=saveGame(true)?L('Partida guardada.'):L('No se pudo guardar. Copiá el código de abajo.');
  if(a==='opts')openOptions('pause');
  if(a==='tomenu'){saveGame(true);engineSound(false);ambient(0,0);toMenu()}
  if(a==='quit'){saveGame(true);window.close()}
  if(a==='copycode'){const t=$('saveCode');try{await navigator.clipboard.writeText(t.value);$('pauseMsg').textContent=L('Código copiado.')}catch(err){t.select();$('pauseMsg').textContent=L('Seleccioné el código: copialo con Ctrl+C.')}}
  if(a==='loadcode'){try{const st=migrate(JSON.parse(decodeURIComponent(escape(atob($('saveCode').value.trim())))));if(!st||!st.seed)throw 0;loadingThen(()=>{startGame(st);saveGame(true)})}catch(err){$('pauseMsg').textContent=L('Ese código no es válido. Revisá que esté completo.')}}});
$('dead').addEventListener('click',e=>{if(e.target.closest('[data-a="respawn"]'))respawn()});

// ---------- Map ----------
function openMap(){gstate='map';unlock();const c=$('mapc'),m=c.getContext('2d');const s=Math.min(innerWidth-40,innerHeight-40,800);c.style.width=s+'px';c.style.height=s+'px';
  m.imageSmoothingEnabled=true;m.fillStyle='#0a0d0b';m.fillRect(0,0,800,800);m.drawImage(mapImg,0,0,800,800);const f=800/SIZE;
  m.fillStyle='#0a0d0b';for(let z=0;z<100;z++)for(let x=0;x<100;x++)if(!explored[z*100+x])m.fillRect(x*8,z*8,8.5,8.5);
  const X=x=>(x+HALF)*f,Z=z=>(z+HALF)*f;const seen=(x,z)=>explored[Math.floor((z+HALF)/10)*100+Math.floor((x+HALF)/10)];
  m.font='600 13px "IBM Plex Mono",monospace';m.textAlign='center';
  const label=(t,x,y)=>{const tw=m.measureText(t).width+8;m.fillStyle='rgba(10,13,11,.8)';m.fillRect(x-tw/2,y-12,tw,16);m.fillStyle='#dedcc9';m.fillText(t,x,y)};
  for(const r of ruins){if(!seen(r.cx,r.cz))continue;m.fillStyle='#8c887e';m.fillRect(X(r.x0),Z(r.z0),r.w*f,r.d*f);label(L(r.type),X(r.cx),Z(r.z0)-6)}
  for(const b of buildings){if(!seen(b.cx,b.cz))continue;m.fillStyle=b.store?'#b0a890':'#8c887e';m.fillRect(X(b.x0),Z(b.z0),b.w*f,b.d*f)}
  for(const b of buildings){if(b.store&&seen(b.cx,b.cz))label(L(b.name),X(b.cx),Z(b.z0)-4)}
  if(seen(roadX(TOWN_Z),TOWN_Z)){m.font='800 20px "Saira Condensed",sans-serif';label(L('PUEBLO'),X(roadX(TOWN_Z)+70),Z(TOWN_Z));m.font='600 13px "IBM Plex Mono",monospace'}
  for(const fo of fossils){if(!seen(fo.x,fo.z)||fo.uses<=0)continue;m.fillStyle='#e4dcc4';m.beginPath();m.arc(X(fo.x),Z(fo.z),4,0,6.283);m.fill()}
  m.fillStyle='#e3a33b';m.fillRect(X(-PAL),Z(-PAL),PAL*2*f,PAL*2*f);m.font='800 18px "Saira Condensed",sans-serif';m.fillText(L('ALMACÉN'),X(0),Z(-PAL)-8);
  m.fillStyle='#c9614a';m.fillRect(X(truck.x)-4,Z(truck.z)-4,8,8);
  const fy=P.inTruck?truck.yaw+Math.PI:P.yaw;m.save();m.translate(X(P.x),Z(P.z));m.rotate(-fy);m.fillStyle='#fff';m.beginPath();m.moveTo(0,-9);m.lineTo(6,6);m.lineTo(-6,6);m.closePath();m.fill();m.strokeStyle='#000';m.lineWidth=2;m.stroke();m.restore();
  m.textAlign='left';m.font='600 12px "IBM Plex Mono",monospace';m.fillStyle='#dedcc9';m.fillText(L('Blanco: vos · Rojo: camioneta · Puntos claros: fósiles · M o Esc para cerrar'),12,788);show('bigmap')}

// ---------- Level up ----------
function openLevelUp(){gstate='levelup';unlock();sfx('level');const pool=[...PERKS].sort(()=>R()-.5).slice(0,3);$('lvEyebrow').textContent=L('Nivel {n}',{n:S.level-pendingLevels+1});
  $('perks').innerHTML=pool.map(p=>`<button class="perk" data-perk="${p.id}"><strong>${esc(L(p.n))}</strong><span>${esc(L(p.d))}</span><em>${PK(p.id)?esc(L('Ya tenés {n}',{n:PK(p.id)})):esc(L('Nueva'))}</em></button>`).join('');show('levelup')}
$('perks').addEventListener('click',e=>{const b=e.target.closest('[data-perk]');if(!b)return;const id=b.dataset.perk;S.perks[id]=(S.perks[id]||0)+1;if(id==='piel')S.hp+=25;pendingLevels--;if(pendingLevels>0)openLevelUp();else resume()});

// ---------- Inventory (Tab): items, health, skills ----------
let invTab='items';
function openInv(t){gstate='inv';unlock();invTab=t||invTab;renderInv();show('inv')}
function renderInv(){
  document.querySelectorAll('#invTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===invTab));
  $('invHead').textContent=`${S.bag?nm(S.bag):L('Sin mochila')} · ${kg(invKg())} / ${capKg()} kg`+(overW()?' · '+L('Sobrecarga'):'');
  let h='';
  if(invTab==='items'){
    const groups={};IK.filter(k=>S.inv[k]>0).forEach(k=>{(groups[ITEMS[k].cat]=groups[ITEMS[k].cat]||[]).push(k)});
    for(const cat of Object.keys(CATS)){const ks=groups[cat];if(!ks)continue;h+=`<h4>${esc(L(CATS[cat]))}</h4><div class="rows">`+ks.map(k=>{const it=ITEMS[k];let use='';
      if(it.cat==='bag')use=btn(L('Ponértela'),'use',`data-k="${k}"`,'small primary');else if(it.drink&&!it.food)use=btn(L('Tomar'),'use',`data-k="${k}"`,'small primary');else if(it.food)use=btn(L('Comer'),'use',`data-k="${k}"`,'small primary');else if(it.cat==='med'||k==='pilas')use=btn(L('Usar'),'use',`data-k="${k}"`,'small primary');
      return row(`<div>${dot(it.c)}${esc(nm(k))}${it.rot?` <span class="chance">· ${esc(L('perecedero'))}</span>`:''}</div><div class="num">×${S.inv[k]}</div><div class="num">${kg(it.w*S.inv[k])} kg</div><div class="acts">${use}${btn(L('Tirar'),'drop',`data-k="${k}"`)}</div>`,'r4')}).join('')+'</div>'}
    if(!h)h=`<p class="note">${esc(L('La mochila está vacía.'))}</p>`;
    h+=`<h4>${esc(L('Armas'))}</h4><div class="rows">`+hotbar().map((k,i)=>{const w=WEAP[k];const st=w.melee?`<span class="pips dur"><i style="width:${Math.round(S.dur[k]/w.dur*100)}%"></i></span>`:`${S.mags[k]||0}+${S.ammo[w.ammo]} ${esc(an(w.ammo))}`;
      return row(`<div>${i+1} · ${esc(wn(k))}${k===S.cur?' <span class="chance">· '+esc(L('en la mano'))+'</span>':''}</div><div class="num">${st}</div><div class="num">${kg(w.w)} kg</div><div class="acts">${k!==S.cur?btn(L('Equipar'),'equip',`data-k="${k}"`):''}${w.melee&&S.dur[k]<w.dur?btn(L('Reparar con cinta'),'repair',`data-k="${k}" ${S.inv.cinta>0?'':'disabled'}`):''}${btn(L('Tirar'),'wdrop',`data-k="${k}"`)}</div>`,'r4')}).join('')+'</div>';
    h+=`<h4>${esc(L('Munición'))}</h4><p class="note">${Object.keys(AMMO_N).map(a=>`${esc(an(a))}: ${S.ammo[a]}`).join(' · ')}</p>`;
  }else if(invTab==='health'){
    const pct=(v,c)=>`<span class="xpbar" style="max-width:220px"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></span>`;
    h+=`<div class="rows">`+[[L('Vida'),S.hp/maxHp()*100,'#cc4b30',`${Math.round(S.hp)}/${maxHp()}`],[L('Hambre'),S.food,'#c9a24a',Math.round(S.food)],[L('Sed'),S.water,'#6fa3c4',Math.round(S.water)],[L('Cansancio'),S.fat,'#9a8ac0',Math.round(S.fat)+'%'],[L('Dolor'),pain(),'#d07a5a',Math.round(pain())],[L('Pánico'),S.panic,'#e0a040',Math.round(S.panic)+'%'],[L('Mojado'),S.wet,'#6f9ac4',Math.round(S.wet)+'%']].map(([n,v,c,t])=>row(`<div>${esc(n)}</div><div>${pct(v,c)}</div><div class="num">${t}</div>`,'r3')).join('')+'</div>';
    h+=`<h4>${esc(L('Heridas'))}</h4><div class="rows">`+(S.wounds.length?S.wounds.map(w=>row(`<div>${dot(w.band?'#8fbb62':'#cc4b30')}${esc(L(WOUND[w.t].n))}</div><div>${esc(w.band?L('Vendada'):(w.t==='rasguno'&&w.age>WOUND.rasguno.stop)?L('Dejó de sangrar'):L('Sangrando'))}${w.dis?' · '+esc(L('Desinfectada')):''}</div><div class="num">${w.band?Math.round(w.heal/(WOUND[w.t].heal*CYCLE())*100)+'%':''}</div>`,'r3')).join(''):`<p class="note">${esc(L('Sin heridas.'))}</p>`)+'</div>';
    if(S.infect>0)h+=`<div class="banner bad">${esc(L('Infección de la bruma: {n}%. Solo los antibióticos la frenan. Al llegar al 100% te va a matar de a poco.',{n:Math.round(S.infect)}))}</div>`;
    if(S.sick>20)h+=`<div class="banner">${esc(L('Estás intoxicado por comer algo en mal estado. Se pasa solo con el tiempo.'))}</div>`;
    h+=`<div class="btns">${btn(L('Vendar o curar (H)'),'treat','', 'small primary')}${['desinfectante','analgesicos','antibioticos'].map(k=>btn(`${nm(k)} (${S.inv[k]||0})`,'use',`data-k="${k}" ${S.inv[k]>0?'':'disabled'}`)).join('')}</div>`;
  }else{
    h+=`<div class="rows">`+Object.keys(SKILLS).map(k=>{const lv=skLv(k),xp=S.sk[k]||0,a=30*lv*lv,b=30*(lv+1)*(lv+1);return row(`<div><b>${esc(L(SKILLS[k].n))}</b><div class="chance">${esc(L(SKILLS[k].d))}</div></div><div class="num">${esc(L('Nivel {n}',{n:lv}))}</div><div><span class="xpbar" style="max-width:200px"><i style="width:${lv>=10?100:clamp((xp-a)/(b-a)*100,0,100)}%"></i></span></div>`,'r3')}).join('')+'</div>';
    const pk=PERKS.filter(p=>PK(p.id));h+=`<h4>${esc(L('Mejoras elegidas'))}</h4>`+(pk.length?`<div class="rows">${pk.map(p=>row(`<div>${esc(L(p.n))} ×${PK(p.id)}</div><div class="chance">${esc(L(p.d))}</div>`,'r2')).join('')}</div>`:`<p class="note">${esc(L('Todavía ninguna. Subí de nivel para elegir.'))}</p>`);
  }
  $('invBody').innerHTML=h}
$('invTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;invTab=b.dataset.tab;renderInv()});
$('inv').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const k=b.dataset.k,a=b.dataset.a;
  if(a==='invclose'){resume();return}
  if(a==='use')useItem(k);
  if(a==='treat')treat();
  if(a==='drop'){S.inv[k]--;spawnPickup(P.x-Math.sin(P.yaw)*1.5,P.z-Math.cos(P.yaw)*1.5,k,1);pickups[pickups.length-1].blocked=true}
  if(a==='equip'){switchWeapon(k)}
  if(a==='repair')repairWeapon(k);
  if(a==='wdrop'){S.weapons=S.weapons.filter(x=>x!==k);spawnPickup(P.x-Math.sin(P.yaw)*1.5,P.z-Math.cos(P.yaw)*1.5,'w:'+k,1);pickups[pickups.length-1].blocked=true;if(S.cur===k){S.cur=hotbar()[0]||null;equip()}}
  renderInv()});

// ---------- Loot: your bag next to a container ----------
let lootC=null;
function openLoot(c){lootC=c;const st=contItems(c);if(!c.seen){S.stats.looted++;markLooted(c)}sfx(c.car?'door':'crate');gstate='loot';unlock();renderLoot();show('loot');
  for(const e of enemies){if(!EDEF[e.type].neutral&&Math.hypot(e.x-c.x,e.z-c.z)<10)e.aggro=true}}
function renderLoot(){
  const st=contItems(lootC);
  $('lootName').textContent=L(CONT[lootC.type].n);$('lootKg').textContent=`${kg(invKg())} / ${capKg()} kg`+(overW()?' · '+L('Sobrecarga'):'');
  const mine=IK.filter(k=>S.inv[k]>0).map(k=>row(`<div>${dot(ITEMS[k].c)}${esc(nm(k))}</div><div class="num">×${S.inv[k]}</div><div class="acts">${btn('→','put',`data-k="${k}" aria-label="${esc(L('Guardar'))}"`)}</div>`,'r3')).join('');
  const theirs=[...Object.entries(st.it).filter(([,q])=>q>0).map(([k,q])=>row(`<div>${dot(ITEMS[k].c)}${esc(nm(k))}</div><div class="num">×${q} · ${kg(ITEMS[k].w*q)} kg</div><div class="acts">${btn('←','take',`data-k="${k}"`)}${q>1?btn(L('Todo'),'takeall1',`data-k="${k}"`):''}</div>`,'r3')),
    ...Object.entries(st.am).filter(([,q])=>q>0).map(([k,q])=>row(`<div>${dot('#c9a24a')}${esc(an(k))}</div><div class="num">×${q}</div><div class="acts">${btn('←','takeam',`data-k="${k}"`)}</div>`,'r3')),
    ...st.wp.map((k,i)=>row(`<div>${dot('#9aa0a4')}${esc(wn(k))}</div><div class="num">${kg(WEAP[k].w)} kg</div><div class="acts">${btn('←','takewp',`data-i="${i}"`)}</div>`,'r3'))].join('');
  $('lootMine').innerHTML=mine||`<p class="note">${esc(L('La mochila está vacía.'))}</p>`;
  $('lootTheirs').innerHTML=theirs||`<p class="note">${esc(L('Vacío.'))}</p>`;
  $('lootMsg').textContent=lootMsg;lootMsg=''}
let lootMsg='';
function takeItem(st,k,q){const left=addInv(k,q);const got=q-left;st.it[k]-=got;if(left)lootMsg=L('No te entra más: llevás demasiado peso.');if(got)sfx('pickup');return got}
$('loot').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;const st=contItems(lootC);
  if(a==='lootclose'){resume();return}
  if(a==='take')takeItem(st,k,1);
  if(a==='takeall1')takeItem(st,k,st.it[k]);
  if(a==='takeam'){S.ammo[k]+=st.am[k];st.am[k]=0;sfx('pickup')}
  if(a==='takewp'){const w=st.wp.splice(+b.dataset.i,1)[0];giveWeapon(w);sfx('pickup')}
  if(a==='takeall'){for(const kk of Object.keys(st.it))if(st.it[kk]>0)takeItem(st,kk,st.it[kk]);for(const kk of Object.keys(st.am)){S.ammo[kk]+=st.am[kk];st.am[kk]=0}while(st.wp.length)giveWeapon(st.wp.pop())}
  if(a==='put'){S.inv[k]--;st.it[k]=(st.it[k]||0)+1}
  renderLoot()});

// ---------- Store panel ----------
let tab='deposito',panelMsg='';
const KEEP_CATS=['food','drink','med','tool','bag'];
function openPanel(t){
  gstate='panel';mouse.down=false;unlock();tab=t||tab;
  const moved=[];IK.forEach(k=>{if(KEEP_CATS.includes(ITEMS[k].cat)&&k!=='carne'&&k!=='podrida')return;const q=S.inv[k]||0;if(q>0){S.stash[k]=(S.stash[k]||0)+q;S.inv[k]=0;moved.push(`${nm(k)} ×${q}`)}});
  const near=Math.hypot(truck.x,truck.z)<40;const tm=[];if(near)IK.forEach(k=>{const q=S.truck.cargo[k]||0;if(q>0){S.stash[k]=(S.stash[k]||0)+q;S.truck.cargo[k]=0;tm.push(`${nm(k)} ×${q}`)}});
  panelMsg=(moved.length?L('Descargaste de la mochila: {l}.',{l:moved.join(', ')})+' ':'')+(tm.length?L('De la camioneta: {l}.',{l:tm.join(', ')}):'');
  saveGame(true);renderPanel();show('panel')}
function closePanel(){refreshShelves();resume()}
function renderPanel(){
  const h=hourOf(S.t);$('pEyebrow').textContent=L('Día {d}',{d:S.day})+` · ${pad(Math.floor(h))}:${pad(Math.floor(h%1*6)*10)}`+(isNight()?' · '+L('noche'):'');
  $('pStats').innerHTML=`<span>${esc(L('Plata'))} <b>$${fmt(S.money)}</b></span><span>${esc(L('Reputación'))} <b>${stars()}</b></span><span>${esc(L('Hoy'))} <b>$${fmt(S.today)}</b></span>`;
  const ac=S.contracts.filter(c=>!c.done&&!c.failed&&(S.stash[c.item]||0)>=c.qty).length;
  document.querySelectorAll('#tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);if(b.dataset.tab==='encargos')b.innerHTML=esc(L('Encargos'))+(ac?`<span class="badge">${ac}</span>`:'')});
  $('pbody').innerHTML=(panelMsg?`<div class="banner">${esc(panelMsg)}</div>`:'')+({deposito:tabDeposito,estantes:tabEstantes,encargos:tabEncargos,taller:tabTaller,mejoras:tabMejoras,armeria:tabArmeria,metas:tabMetas}[tab])()}
function tabDeposito(){
  const rows=IK.filter(k=>(S.stash[k]||0)+(S.inv[k]||0)+(S.truck.cargo[k]||0)>0).map(k=>row(`<div>${dot(ITEMS[k].c)}${esc(nm(k))} <span class="chance">· $${ITEMS[k].v} · ${kg(ITEMS[k].w)} kg</span></div><div class="num">${S.stash[k]||0}</div><div class="num">${S.inv[k]||0}</div><div class="num">${S.truck.cargo[k]||0}</div><div class="acts">${btn(L('Llevar 1'),'take',`data-k="${k}" ${(S.stash[k]||0)<1?'disabled':''}`)}${btn(L('Dejar 1'),'drop',`data-k="${k}" ${(S.inv[k]||0)<1?'disabled':''}`)}</div>`)).join('');
  const wrows=[...hotbar().map(k=>row(`<div>${esc(wn(k))}</div><div class="num">${esc(L('encima'))}</div><div></div><div></div><div class="acts">${btn(L('Guardar'),'wstore',`data-k="${k}"`)}</div>`)),...S.wstash.map(k=>row(`<div>${esc(wn(k))}</div><div class="num">${esc(L('guardada'))}</div><div></div><div></div><div class="acts">${btn(L('Llevar'),'wtake',`data-k="${k}"`)}</div>`))].join('');
  return `<div class="banner">${esc(L('Al entrar se descargan solos los materiales y objetos de valor de la mochila, y la caja de la camioneta si está estacionada cerca. Comida, bebida, medicina y herramientas quedan encima.'))} ${esc(L('Mochila: {a} de {b} kg.',{a:kg(invKg()),b:capKg()}))}</div>
  <div class="rows">${row(`<div>${esc(L('Producto'))}</div><div>${esc(L('Depósito'))}</div><div>${esc(L('Mochila'))}</div><div>${esc(L('Camioneta'))}</div><div></div>`,'head')}${rows||row(`<div>${esc(L('El depósito está vacío. Salí a buscar mercadería.'))}</div>`)}</div>
  <h4>${esc(L('Armas'))}</h4><div class="rows">${wrows}</div>
  <h4>${esc(L('Munición'))}</h4><p class="note">${Object.keys(AMMO_N).map(a=>`${esc(an(a))}: ${S.ammo[a]}`).join(' · ')}</p>`}
function chanceText(s){const it=ITEMS[s.item];const price=Math.max(1,Math.round(it.v*s.mult));const worth=it.v*S.demand[s.item];const base=(1+S.rep*.02)*(1+.08*PK('labia'));const need=price/(worth*base);const p=clamp((1.45-need)/.7,0,1);return L('Chance de que lo compren: {n}%',{n:Math.round(p*100)})}
function tabEstantes(){
  const opts=sel=>`<option value="">${esc(L('Vacío'))}</option>`+IK.filter(k=>ITEMS[k].cat!=='bag'||S.stash[k]).map(k=>`<option value="${k}" ${sel===k?'selected':''}>${esc(nm(k))} (${S.stash[k]||0})</option>`).join('');
  const cards=S.shelves.map((s,i)=>{const it=s.item?ITEMS[s.item]:null;const price=it?Math.max(1,Math.round(it.v*s.mult)):0;const worth=it?Math.round(it.v*S.demand[s.item]):0;
    return `<div class="shelf ${s.item===S.hot?'hot':''}"><div class="lbl">${esc(L('Estante {n}',{n:i+1}))}${s.item===S.hot?' · '+esc(L('el más buscado hoy')):''}</div><select data-shelf="${i}" aria-label="${esc(L('Estante {n}',{n:i+1}))}">${opts(s.item)}</select>
    ${it?`<input type="range" min="50" max="250" step="5" value="${Math.round(s.mult*100)}" data-mult="${i}" aria-label="${esc(L('Precio'))}"><div class="price"><span>${esc(L('Precio'))} <b id="pp${i}">$${price}</b></span><span>${esc(L('Lo pagan bien hasta ~${n}',{n:worth}))}</span></div><div class="chance" id="pc${i}">${esc(chanceText(s))}</div><div class="chance">${esc(L('{n} en depósito',{n:S.stash[s.item]||0}))}</div>`:`<div class="chance">${esc(L('Elegí un producto del depósito para venderlo.'))}</div>`}</div>`}).join('');
  return `<div class="banner">${esc(L('Hoy en demanda: {i}. Los clientes vienen de 7:00 a 19:00 aunque estés afuera y compran de lo que haya en los estantes. Precio alto: más plata por venta, pero más gente se va sin comprar y baja tu reputación.',{i:nm(S.hot)}))}</div><div class="shelves">${cards}</div>`}
function tabEncargos(){const list=S.contracts.filter(c=>!c.failed);return `<div class="banner">${esc(L('Los encargos pagan mucho más que el estante y suben tu reputación. Se entregan con lo que tengas en el depósito. Si se vencen, la reputación baja.'))}</div><div class="list">${list.length?list.map(c=>{const have=S.stash[c.item]||0;return `<div class="item ${c.done?'done':''}"><h3>${esc(c.who)}</h3><p>${esc(L('Quiere: {i} ×{q}.',{i:nm(c.item),q:c.qty}))} ${esc(c.done?L('Entregado.'):c.dl===S.day?L('Vence hoy a las 19:00.'):L('Vence mañana a las 19:00.'))}</p><div class="meta"><span>${esc(L('Paga ${r} · tenés {n}',{r:c.reward,n:have}))}</span>${c.done?`<span>${esc(L('Listo'))}</span>`:btn(L('Entregar'),'deliver',`data-i="${S.contracts.indexOf(c)}" ${have<c.qty?'disabled':''}`,have>=c.qty?'small primary':'small')}</div></div>`}).join(''):`<div class="item"><p>${esc(L('No hay encargos por ahora. Mañana llegan nuevos.'))}</p></div>`}</div>`}
const haveTool=t=>(S.inv[t]||0)+(S.stash[t]||0)>0;
function haveIn(rc,n=1){return Object.entries(rc.in).every(([k,q])=>(S.stash[k]||0)>=q*n)}
function recipeLock(r){if(r.need&&!S.upg[r.need])return L('Necesitás: {u} (en Mejoras).',{u:L(UPG[r.need].n)});if(r.tool&&!haveTool(r.tool))return L('Necesitás: {t}.',{t:nm(r.tool)});if(r.wtool&&!S.weapons.includes(r.wtool)&&!S.wstash.includes(r.wtool))return L('Necesitás: {t}.',{t:wn(r.wtool)});return null}
function tabTaller(){
  const missing=S.walls.reduce((s,v)=>s+(wallMax()-v),0),cost=Math.ceil(missing/100),pct=Math.round(100-missing/(wallMax()*walls.length)*100),broken=S.walls.filter(v=>v<=0).length;
  const near=Math.hypot(truck.x,truck.z)<40;const fix=(S.stash.chatarra||0)+(S.stash.tablas||0);
  const rec=RECIPES.map(r=>{const lk=recipeLock(r);const ins=Object.entries(r.in).map(([k,q])=>`${esc(nm(k))} ×${q} (${S.stash[k]||0})`).join(' + ');
    return `<div class="item"><h3>${esc(L(r.n))}</h3><p>${lk?esc(lk):esc(L('Usa:'))+' '+ins}</p><div class="meta"><span>${esc(r.ammo?L('Va a tu munición'):r.weapon?L('Va a tus armas'):L('Va al depósito'))}</span><span class="btns">${btn(L('Fabricar'),'craft',`data-r="${r.id}" data-n="1" ${lk||!haveIn(r)?'disabled':''}`)}${r.weapon?'':btn('×5','craft',`data-r="${r.id}" data-n="5" ${lk||!haveIn(r,5)?'disabled':''}`)}</span></div></div>`}).join('');
  return `<div class="list"><div class="item"><h3>${esc(L('Empalizada al {n}%',{n:pct}))}</h3><p>${broken?esc(L('Hay {n} tramos rotos por donde pueden entrar.',{n:broken}))+' ':''}${esc(L('Cada chatarra o tabla repara 100 puntos.'))}</p><div class="meta"><span>${esc(L('Costo: {n} · tenés {h}',{n:cost,h:fix}))}</span>${btn(L('Reparar'),'repair',`${!cost||!fix?'disabled':''}`,'small primary')}</div></div>
  <div class="item"><h3>${esc(L('Tanque de la camioneta'))}</h3><p>${esc(near?L('Tiene {n}% de nafta. Cada combustible carga 30%.',{n:Math.round(S.truck.fuel)}):L('La camioneta tiene que estar estacionada cerca del almacén.'))}</p><div class="meta"><span>${esc(L('Combustible en depósito: {n}',{n:S.stash.combustible||0}))}</span>${btn(L('Cargar'),'refuel',`${!near||!(S.stash.combustible>0)||S.truck.fuel>=99?'disabled':''}`,'small primary')}</div></div></div>
  <h4>${esc(L('Fabricar'))}</h4><div class="list">${rec}</div>`}
function tabMejoras(){return `<div class="list">${Object.entries(UPG).map(([k,u])=>{const lvl=S.upg[k],max=u.p.length,price=u.p[lvl];return `<div class="item"><h3>${esc(L(u.n))}</h3><p>${esc(L(u.d))}</p><div class="meta"><span class="pips">${u.p.map((_,i)=>`<i class="${i<lvl?'on':''}"></i>`).join('')}</span>${lvl>=max?`<span>${esc(L('Completo'))}</span>`:btn(L('Comprar ${p}',{p:fmt(price)}),'upg',`data-k="${k}" ${S.money<price?'disabled':''}`,S.money>=price?'small primary':'small')}</div></div>`}).join('')}</div>`}
const ownsW=k=>S.weapons.includes(k)||S.wstash.includes(k);
function tabArmeria(){return `<div class="banner">${esc(L('Lo comprás a los caravaneros que pasan por la ruta. Más caro que fabricarlo, pero al toque.'))}</div><div class="list">${SHOP.map(s=>{const owned=s.weapon&&ownsW(s.id);const locked=s.minDay&&S.day<s.minDay;return `<div class="item"><h3>${esc(L(s.n))}</h3><p>${esc(L(s.d))}</p><div class="meta"><span>${s.ammo?esc(L('Tenés {n}',{n:S.ammo[s.ammo[0]]})):s.item?esc(L('En mochila: {n}',{n:S.inv[s.item]||0})):s.stash?esc(L('En depósito: {n}',{n:S.stash[s.stash[0]]||0})):''}</span>${owned?`<span>${esc(L('Ya es tuya'))}</span>`:locked?`<span>${esc(L('Llega el día {d}',{d:s.minDay}))}</span>`:btn(L('Comprar ${p}',{p:fmt(s.p)}),'buy',`data-k="${s.id}" ${S.money<s.p?'disabled':''}`,S.money>=s.p?'small primary':'small')}</div></div>`}).join('')}</div>`}
function tabMetas(){const st=S.stats;return `<div class="list">${GOALS.map(g=>{const done=S.goals.includes(g.id);return `<div class="item ${done?'done':''}"><h3>${esc(L(g.n))}</h3><div class="meta"><span>${esc(L('Premio ${r}',{r:fmt(g.r)}))}</span><span>${esc(done?L('Cumplida'):L('Pendiente'))}</span></div></div>`}).join('')}</div>
  <h4>${esc(L('Tu historia'))}</h4><div class="rows">${[['Noches sobrevividas',st.nights],['Enemigos abatidos',st.kills],['Tiros a la cabeza',st.hs],['Muebles revisados',st.looted],['Productos vendidos',st.sold],['Plata ganada en ventas','$'+fmt(st.earned)],['Encargos cumplidos',st.contracts],['Atropellados',st.runover],['Rex Podridos cazados',st.rex]].map(([a,b])=>row(`<div>${esc(L(a))}</div><div class="num">${b}</div>`,'r2')).join('')}</div>
  <h4>${esc(L('Últimos movimientos del mostrador'))}</h4><div class="log">${S.log.length?S.log.slice(0,15).map(l=>`<div class="${l.bad?'bad':''}">${esc(l.d!=null?L('Día {d}',{d:l.d})+' '+l.h+' · '+l.t:l.t)}</div>`).join(''):`<div>${esc(L('Todavía no pasó ningún cliente.'))}</div>`}</div>`}
$('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;tab=b.dataset.tab;panelMsg='';renderPanel()});
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,k=b.dataset.k;panelMsg='';
  if(a==='close'){closePanel();return}
  if(a==='take'){if(addInv(k,1)>0)panelMsg=L('No entra en la mochila.');else S.stash[k]--}
  if(a==='drop'){S.inv[k]--;S.stash[k]=(S.stash[k]||0)+1}
  if(a==='wstore'){S.weapons=S.weapons.filter(x=>x!==k);S.wstash.push(k);if(S.cur===k){S.cur=hotbar()[0]||null;equip()}}
  if(a==='wtake'){S.wstash=S.wstash.filter(x=>x!==k);S.weapons.push(k);if(!S.cur){S.cur=k;equip()}}
  if(a==='craft'){const r=RECIPES.find(x=>x.id===b.dataset.r),n=+b.dataset.n;if(haveIn(r,n)&&!recipeLock(r)){Object.entries(r.in).forEach(([kk,q])=>S.stash[kk]-=q*n);if(r.ammo)S.ammo[r.ammo[0]]+=r.ammo[1]*n;else if(r.weapon)giveWeapon(r.weapon,true);else S.stash[r.out[0]]=(S.stash[r.out[0]]||0)+r.out[1]*n;panelMsg=L('Fabricaste: {r}',{r:L(r.n)})+(n>1?` ×${n}`:'')+'.';sfx('crate');addSk(r.id==='asado'?'supervivencia':'carpinteria',2*n)}}
  if(a==='repair'){let used=0;const m=wallMax();for(let i=0;i<S.walls.length;i++){let miss=m-S.walls[i];while(miss>0){const src=(S.stash.chatarra||0)>0?'chatarra':(S.stash.tablas||0)>0?'tablas':null;if(!src)break;const add=Math.min(100,miss);S.walls[i]+=add;miss-=add;S.stash[src]--;used++}if(S.walls[i]>0)setWallAlive(i,true)}panelMsg=L('Reparaste la empalizada con {n} materiales.',{n:used});addSk('carpinteria',used);sfx('build')}
  if(a==='refuel'){while(S.stash.combustible>0&&S.truck.fuel<99){S.stash.combustible--;S.truck.fuel=Math.min(100,S.truck.fuel+30)}panelMsg=L('Tanque al {n}%.',{n:Math.round(S.truck.fuel)})}
  if(a==='deliver'){const c=S.contracts[+b.dataset.i];if(c&&(S.stash[c.item]||0)>=c.qty){S.stash[c.item]-=c.qty;c.done=true;S.money+=c.reward;S.rep=Math.min(20,S.rep+.6);S.stats.contracts++;gainXp(Math.round(c.reward/6));panelMsg=L('{who} te pagó ${r}.',{who:c.who,r:c.reward});sfx('coin')}}
  if(a==='upg'){const u=UPG[k],price=u.p[S.upg[k]];if(S.money>=price){S.money-=price;const old=wallMax();S.upg[k]++;if(k==='estante')S.shelves.push({item:null,mult:1});if(k==='muros'){const d=wallMax()-old;S.walls=S.walls.map(v=>v>0?v+d:v)}updateUpgradeVisuals();panelMsg=L('Compraste: {u}.',{u:L(u.n)});sfx('coin')}}
  if(a==='buy'){const s=SHOP.find(x=>x.id===k);if(S.money>=s.p){S.money-=s.p;if(s.weapon){giveWeapon(s.id,true);if(!WEAP[s.id].melee){S.mags[s.id]=WEAP[s.id].mag;S.ammo[WEAP[s.id].ammo]+=WEAP[s.id].mag}switchWeapon(s.id);panelMsg=L('Compraste: {u}.',{u:L(s.n)})}else if(s.ammo){S.ammo[s.ammo[0]]+=s.ammo[1];panelMsg=L('Compraste: {u}.',{u:L(s.n)})}else if(s.stash){S.stash[s.stash[0]]=(S.stash[s.stash[0]]||0)+s.stash[1];panelMsg=L('Compraste: {u}.',{u:L(s.n)})}else{if(addInv(s.item,1)>0){S.stash[s.item]=(S.stash[s.item]||0)+1;panelMsg=L('No entraba en la mochila: quedó en el depósito.')}else panelMsg=L('Compraste: {u}.',{u:L(s.n)})}sfx('coin')}}
  renderPanel()});
$('panel').addEventListener('change',e=>{const s=e.target.closest('[data-shelf]');if(!s)return;S.shelves[+s.dataset.shelf].item=s.value||null;renderPanel()});
$('panel').addEventListener('input',e=>{const r=e.target.closest('[data-mult]');if(!r)return;const i=+r.dataset.mult,sh=S.shelves[i];sh.mult=+r.value/100;$('pp'+i).textContent='$'+Math.max(1,Math.round(ITEMS[sh.item].v*sh.mult));$('pc'+i).textContent=chanceText(sh)});

// ================= MAIN MENU, NEW GAME, OPTIONS =================
function readSave(){const raw=lsGet(SAVE_KEY);let st=null;try{st=raw?migrate(JSON.parse(raw)):null}catch(e){}return st}
function refreshMenu(){const st=readSave();
  const b=$('btnContinue');if(st){b.hidden=false;b.querySelector('small').textContent=L('Día {d} · ${m}',{d:st.day,m:fmt(st.money)})}else b.hidden=true;
  $('btnQuit').hidden=!IS_DESKTOP;return st}
function toMenu(){gstate='menu';$('hud').hidden=true;document.body.classList.remove('iso');refreshMenu();show('menu')}
function loadingThen(fn){hideAll();$('loading').hidden=false;$('loading').textContent=L('Generando el mundo…');setTimeout(()=>{try{fn()}catch(err){console.error(err);$('loading').textContent=L('Algo falló al cargar. Recargá la página.')}},40)}
$('btnContinue').addEventListener('click',()=>{initAudio();const st=readSave();if(!st)return;if(camMode==='fp')requestLock();loadingThen(()=>startGame(st))});
$('btnNew').addEventListener('click',()=>{initAudio();openNewGame()});
$('btnOpts').addEventListener('click',()=>openOptions('menu'));
$('btnQuit').addEventListener('click',()=>window.close());
// New game: presets + sandbox options
let ngSb=Object.assign({},PRESETS.normal.sb),ngPreset='normal';
function openNewGame(){gstate='newgame';renderNewGame();show('newgame')}
function renderNewGame(){
  $('ngPresets').innerHTML=Object.entries(PRESETS).map(([k,p])=>`<button class="perk ${ngPreset===k?'sel':''}" data-preset="${k}"><strong>${esc(L(p.n))}</strong><span>${esc(L(p.d))}</span></button>`).join('')+`<button class="perk ${ngPreset==='custom'?'sel':''}" data-preset="custom"><strong>${esc(L('Personalizada'))}</strong><span>${esc(L('Elegí cada opción a tu gusto.'))}</span></button>`;
  $('ngOpts').innerHTML=Object.entries(SANDBOX).map(([k,o])=>`<label class="setting"><span>${esc(L(o.n))}</span><select data-sb="${k}">${o.o.map((v,i)=>`<option value="${i}" ${ngSb[k]===i?'selected':''}>${esc(L(v))}</option>`).join('')}</select></label>`).join('');
  $('ngWarn').hidden=!readSave()}
$('newgame').addEventListener('click',e=>{const p=e.target.closest('[data-preset]');if(p){ngPreset=p.dataset.preset;if(PRESETS[ngPreset])ngSb=Object.assign({},PRESETS[ngPreset].sb);renderNewGame();return}
  const b=e.target.closest('[data-a]');if(!b)return;
  if(b.dataset.a==='ngback')toMenu();
  if(b.dataset.a==='ngstart'){const seedTxt=$('ngSeed').value.trim();let seed=(Math.random()*2**31)|0;if(seedTxt){seed=0;for(const ch of seedTxt)seed=(Math.imul(seed,31)+ch.charCodeAt(0))|0;seed=Math.abs(seed)}
    lsDel(SAVE_KEY);if(camMode==='fp')requestLock();const st=newState(seed,ngSb);loadingThen(()=>{st.t=SANDBOX.daylen.v[st.sb.daylen]*2/24;startGame(st);saveGame(true)})}});
$('newgame').addEventListener('change',e=>{const s=e.target.closest('[data-sb]');if(!s)return;ngSb[s.dataset.sb]=+s.value;ngPreset='custom';renderNewGame()});
// Options
let optTab='video',optBack='menu';
function openOptions(back){optBack=back;gstate='options';renderOptions();show('options')}
function closeOptions(){if(optBack==='pause')openPause();else toMenu()}
function renderOptions(){
  document.querySelectorAll('#optTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===optTab));
  const sel=(k,opts)=>`<select data-set="${k}">${opts.map(([v,n])=>`<option value="${v}" ${String(settings[k])===String(v)?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
  const rng=(k,min,max,step,fmtv)=>`<span class="rng"><input type="range" data-set="${k}" min="${min}" max="${max}" step="${step}" value="${settings[k]}"><output>${fmtv(settings[k])}</output></span>`;
  const onoff=k=>sel(k,[[true,L('Sí')],[false,L('No')]]);
  const line=(n,c)=>`<label class="setting"><span>${esc(n)}</span>${c}</label>`;
  const pctf=v=>Math.round(v*100)+'%';
  let h='';
  if(optTab==='video')h=line(L('Pantalla completa'),`<button class="small" data-a="fullscreen">${esc(document.fullscreenElement?L('Salir de pantalla completa'):L('Pantalla completa'))}</button>`)+line(L('Calidad'),sel('qual',[['alta',L('Alta (sombras)')],['media',L('Media')],['baja',L('Baja (más fluido)')]]))+line(L('Escala de resolución'),rng('res',.5,1,.05,pctf))+line(L('Campo de visión'),rng('fov',60,100,1,v=>Math.round(v)+'°'))+line(L('Brillo'),rng('bright',.7,1.4,.05,pctf))+line(L('Grano de película'),onoff('grain'))+line(L('Filtro de color crudo'),onoff('filter'))+line(L('Cámara al empezar'),sel('cam',[['fp',L('Primera persona')],['iso',L('Vista de arriba')]]));
  else if(optTab==='audio')h=line(L('Volumen general'),rng('vol',0,1,.05,pctf))+line(L('Efectos'),rng('sfx',0,1,.05,pctf))+line(L('Ambiente (lluvia, viento)'),rng('amb',0,1,.05,pctf));
  else if(optTab==='controls'){h=line(L('Sensibilidad del mouse'),rng('sens',.4,3,.1,v=>(+v).toFixed(1)))+line(L('Sensibilidad al apuntar'),rng('sensAds',.4,2,.1,v=>(+v).toFixed(1)))+line(L('Invertir eje vertical'),onoff('invertY'));
    const K=[['W A S D',L('Moverte')],['Shift',L('Correr')],['C',L('Agacharte (menos ruido)')],[L('Espacio'),L('Saltar · frenar la camioneta')],[L('Clic'),L('Disparar o pegar')],[L('Clic der.'),L('Apuntar')],['R',L('Recargar · girar construcción')],['1-9 · Q',L('Armas · arma anterior')],['E · G',L('Usar, abrir, revisar · cargar nafta')],['Tab',L('Inventario, salud y habilidades')],['M',L('Mapa')],['X',L('Comer o tomar')],['H',L('Vendar y curar')],['B',L('Construir')],['L',L('Linterna')],['T',L('Órdenes a tu raptor')],['V',L('Cambiar cámara')],['F11',L('Pantalla completa')],['Esc',L('Pausa')]];
    h+=`<h4>${esc(L('Teclas'))}</h4><div class="keys">${K.map(([k,d])=>`<div><kbd>${esc(k)}</kbd> ${esc(d)}</div>`).join('')}</div>`}
  else h=line(L('Idioma'),`<select data-set="lang">${LANGS.map(([c,n])=>`<option value="${c}" ${settings.lang===c?'selected':''}>${n}</option>`).join('')}</select>`)+line(L('Mostrar consejos'),onoff('hints'))+`<p class="note">${esc(L('Algunos carteles del mundo cambian de idioma al volver a cargar la partida.'))}</p>`;
  $('optBody').innerHTML=h}
$('optTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;optTab=b.dataset.tab;renderOptions()});
$('options').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='optback')closeOptions();if(b.dataset.a==='fullscreen'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});setTimeout(renderOptions,300)}});
function onSetting(e){const el=e.target.closest('[data-set]');if(!el)return;const k=el.dataset.set;let v=el.value;if(v==='true')v=true;else if(v==='false')v=false;else if(el.type==='range')v=+v;settings[k]=v;saveSettings();
  if(el.type==='range'&&el.nextElementSibling)el.nextElementSibling.textContent=k==='fov'?Math.round(v)+'°':['sens','sensAds'].includes(k)?(+v).toFixed(1):Math.round(v*100)+'%';
  if(['qual','res'].includes(k)&&e.type==='change')applyQuality();
  if(['bright','grain','filter'].includes(k))applyPost();
  if(['vol','sfx','amb'].includes(k))applyVolume();
  if(k==='cam'&&gstate==='options'&&optBack==='menu')camMode=v;
  if(k==='lang'){LANG=v;applyStatic();renderOptions();refreshMenu()}}
$('options').addEventListener('input',onSetting);$('options').addEventListener('change',onSetting);

// ================= LOOP & BOOT =================
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  try{if(gstate==='play'){update(dt)}else if(['menu','newgame','options'].includes(gstate)&&S){time+=dt;P.yaw+=dt*.04}
    tickGrain(dt);if(S&&!['loading','menu','newgame','options'].includes(gstate))updateHUD(dt);render(dt)}catch(err){console.error(err)}
  pressed={};mouse.clicked=false;requestAnimationFrame(frame)}
(function boot(){
  applyStatic();applyPost();applyQuality();buildBody();
  const st=refreshMenu();
  setTimeout(()=>{try{S=st||newState((Math.random()*2**31)|0);genWorld(S.seed);enemies=[];customers=[];pickups=[];builds=[];walls.forEach(w=>w.mesh.visible=true);updateUpgradeVisuals();truck.x=S.truck.x;truck.z=S.truck.z;truck.yaw=S.truck.yaw;updateTruck(0);P.x=-8;P.z=30;P.y=groundY(P.x,P.z);P.yaw=.25;P.pitch=-.08;S.t=CYCLE()*330/720;
    $('loading').hidden=true;gstate='menu';show('menu')}catch(err){console.error(err);$('loading').textContent=L('No se pudo generar el mundo: ')+err.message}},30);
  window.__almacen={state:()=>S,P,truck:()=>truck,enemies:()=>enemies,conts:()=>conts,buildings:()=>buildings,openPanel:t=>openPanel(t),openLoot:i=>openLoot(conts[i]),openInv:t=>openInv(t),forcePlay:()=>{debugNoLock=true;gstate='play';hideAll();$('wait').hidden=true},spawn:(t,x,z)=>spawnEnemy(t,x,z),update:dt=>update(dt),setCam:m=>{camMode=m;document.body.classList.toggle('iso',m==='iso')},hurt:(d,t)=>hurtPlayer(d,t?{type:t}:null)};
  requestAnimationFrame(frame);
})();
