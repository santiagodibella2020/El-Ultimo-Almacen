'use strict';
/* v0.30: el resto de las pantallas con la misma estética que el inventario.
   - Saqueo: lo que estás revisando (heladera, placard, baúl del auto, góndola, tacho...) se ve en 3D de
     fondo en la columna "Adentro", con los mismos modelos que hay en el mundo.
   - Carga de los vehículos: misma pantalla, con el vehículo de fondo, filas clickeables y la mochila.
   - Vecinos: retrato en 3D de la persona con la que hablás.
   - Estantes del almacén: el producto se ve apilado sobre el estante. Taller y caravaneros con ícono.
   Usa un solo renderer fuera de pantalla y copia cada vista a su propio canvas. */

const V30={r:null,views:new Map(),run:false};
function r30(){if(V30.r)return V30.r;try{const r=new THREE.WebGLRenderer({alpha:true,antialias:true});r.setPixelRatio(1);r.outputEncoding=THREE.sRGBEncoding;V30.r=r}catch(e){console.error('v30',e)}return V30.r}
function scene30(){const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xd8dccb,0x2a2418,1.05));
  const d=new THREE.DirectionalLight(0xffe2b8,1.5);d.position.set(2.5,3.5,3);sc.add(d);const rim=new THREE.DirectionalLight(0x8fbb62,.55);rim.position.set(-3,1.5,-2.5);sc.add(rim);return sc}
// Encaja cualquier objeto en una caja de ~1,6 de alto/ancho, centrado.
function fit30(o,size){const bb=new THREE.Box3().setFromObject(o);if(bb.isEmpty())return o;const s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  const k=(size||1.6)/Math.max(s.x,s.y,s.z,1e-3);const g=new THREE.Group();o.position.sub(c);g.add(o);g.scale.setScalar(k);return g}
// host: elemento donde va la vista (ocupa todo su fondo). key: qué se muestra. make(): arma el objeto.
function view30(host,key,make,opt){const r=r30();if(!r||!host)return;let v=V30.views.get(host);
  if(!v){const c=document.createElement('canvas');c.className='view30c';v={c,ctx:c.getContext('2d'),sc:scene30(),cam:new THREE.PerspectiveCamera(30,1,.1,60),obj:null,key:null,yaw:-.6,drag:null,opt:opt||{}};
    c.addEventListener('pointerdown',e=>{if(!v.opt.drag)return;v.drag={x:e.clientX,y:v.yaw};c.setPointerCapture(e.pointerId)});
    c.addEventListener('pointermove',e=>{if(v.drag)v.yaw=v.drag.y+(e.clientX-v.drag.x)*.012});c.addEventListener('pointerup',()=>{v.drag=null});
    V30.views.set(host,v)}
  v.opt=opt||v.opt;if(v.c.parentElement!==host)host.prepend(v.c);
  if(v.key!==key){if(v.obj)v.sc.remove(v.obj);v.obj=null;v.key=key;try{const o=make();if(o){v.obj=fit30(o,v.opt.size);v.sc.add(v.obj)}}catch(e){console.error('view30',key,e)}v.yaw=v.opt.yaw!=null?v.opt.yaw:-.6}
  if(!V30.run){V30.run=true;requestAnimationFrame(loop30)}}
function loop30(){let any=false;const r=V30.r;
  for(const [host,v] of V30.views){if(!host.isConnected||host.offsetParent===null||!v.obj)continue;any=true;
    const w=Math.round(host.clientWidth),h=Math.round(host.clientHeight);if(w<10||h<10)continue;
    if(v.c.width!==w||v.c.height!==h){v.c.width=w;v.c.height=h;v.cam.aspect=w/h;v.cam.updateProjectionMatrix()}
    const z=v.opt.dist||4.2;v.cam.position.set(0,v.opt.camY!=null?v.opt.camY:.45,z);v.cam.lookAt(0,v.opt.lookY||0,0);
    if(!v.drag&&v.opt.spin!==false)v.yaw+=.003;v.obj.rotation.y=v.yaw;
    r.setSize(w,h,false);r.render(v.sc,v.cam);v.ctx.clearRect(0,0,w,h);v.ctx.drawImage(r.domElement,0,0,w,h)}
  if(any)requestAnimationFrame(loop30);else V30.run=false}

// ---------- Qué se ve de cada contenedor ----------
const M30={camilla:'Bed_Single',vitrina:'Shelf_Large',pupitre:'Drawer_1',comedor:'Kitchen_Oven'};
function contObj30(c){const t=c.type;
  if(c.car||t==='baul'){const tp=typeof GLB17T!=='undefined'&&GLB17T.ready&&(GLB17T.tpl.sedan||Object.values(GLB17T.tpl)[0]);if(!tp)return null;const o=tp.clone(true);
    o.traverse(m=>{if(m.isMesh){m.material=m.material.clone();const n=m.material.name;if(/Blue|White|body/i.test(n))m.material.color.setStyle('#6a4c3a').convertSRGBToLinear();if(/Window/i.test(n))m.material.color.setStyle('#1a2224').convertSRGBToLinear()}});return o}
  const mk=(typeof CONT18!=='undefined'&&CONT18[t]&&CONT18[t].m[0])||M30[t];
  const sx=c.mesh?c.mesh.scale.x:1,sy=c.mesh?c.mesh.scale.y:1,sz=c.mesh?c.mesh.scale.z:1;
  if(mk&&typeof H18!=='undefined'&&H18.geo[mk]){const m=new THREE.Mesh(H18.geo[mk],typeof mat18!=='undefined'?mat18:new THREE.MeshStandardMaterial({vertexColors:true}));
    const tile=CONT18[t]&&CONT18[t].tile?Math.max(1,Math.round(Math.max(sx,sz)/1.2)):1;
    if(tile>1&&sx>sz){const g=new THREE.Group();const w=sx/tile;for(let i=0;i<Math.min(tile,4);i++){const p=m.clone();p.scale.set(w,sy,sz);p.position.x=(i-(Math.min(tile,4)-1)/2)*w;g.add(p)}return g}
    m.scale.set(sx,sy,sz);return m}
  if(c.mesh){const o=c.mesh.clone(true);o.position.set(0,0,0);o.rotation.set(0,0,0);o.visible=true;o.traverse(x=>x.visible=true);return o}
  return null}
function vehObj30(v){const m=v&&(v.group||v.mesh||v.g);if(!m)return null;const o=m.clone(true);o.position.set(0,0,0);o.rotation.set(0,0,0);o.traverse(x=>{if(x.isLight)x.visible=false});return o}
function npcObj30(n){if(!n||!n.mesh)return null;const ud=[];n.mesh.traverse(x=>{ud.push([x,x.userData]);x.userData={}});let o;try{o=THREE.SkeletonUtils?THREE.SkeletonUtils.clone(n.mesh):n.mesh.clone(true)}finally{for(const [x,u] of ud)x.userData=u}o.traverse(x=>{if(x.isLight)x.visible=false});
  // pose de reposo en vez de la T: se reproduce 'idle' en la copia y se congela
  try{const src=n.mesh.userData&&n.mesh.userData.root,tpl=typeof GLB15T!=='undefined'&&GLB15T.tpl&&GLB15T.tpl.human;if(src&&tpl){let root=null;o.traverse(x=>{if(!root&&x.name===src.name&&x!==o)root=x});if(!root)root=o.children[0];const mx=new THREE.AnimationMixer(root);const c=tpl.animations.find(a=>a.name==='idle')||tpl.animations[0];if(c){mx.clipAction(c).play();mx.update(.4)}}}catch(e){}
  o.position.set(0,0,0);o.rotation.set(0,0,0);o.visible=true;return o}

// ---------- Saqueo y carga ----------
function lootCols30(){const mine=$('lootMine').parentElement,theirs=$('lootTheirs').parentElement;mine.classList.toggle('bagbg29',true);theirs.classList.toggle('bagbg29',true);theirs.classList.toggle('cont30',true);return{mine,theirs}}
const _renderLoot30=renderLoot;renderLoot=function(){_renderLoot30();try{const {theirs}=lootCols30();if(lootC)view30(theirs,'c'+lootC.type+(lootC.car?'car':''),()=>contObj30(lootC),{size:1.7,camY:.6})}catch(e){console.error('loot30',e)}};
if(typeof renderCargo6==='function'){const _rc30=renderCargo6;renderCargo6=function(){_rc30();try{
  // filas clickeables como en el saqueo y sin botones apagados
  for(const id of ['lootMine','lootTheirs'])for(const r of $(id).querySelectorAll('.row')){const b=r.querySelector('.acts button[data-a="cput1"],.acts button[data-a="ctake1"]');if(!b)continue;r.dataset.a=b.dataset.a;r.dataset.k=b.dataset.k;r.classList.toggle('click29',true);b.remove()}
  prune29($('loot'));const {mine,theirs}=lootCols30();bagShow29(mine);if(cargoV6)view30(theirs,'v'+(cargoV6.type||cargoV6.st.t||'veh'),()=>vehObj30(cargoV6),{size:2,camY:.7})}catch(e){console.error('cargo30',e)}}}

// ---------- Vecinos: retrato ----------
(function(){const card=document.querySelector('#npc .card');if(!card)return;card.classList.toggle('inv29',true);card.classList.toggle('npc30',true);
  const st=document.createElement('div');st.className='bag29 por30';st.innerHTML='<div class="bag29v" id="por30v"></div><div class="bag29i"><div class="eyebrow" id="por30r"></div><h3 id="por30n"></h3></div>';card.prepend(st)})();
if(typeof renderNpc6==='function'){const _rn30=renderNpc6;renderNpc6=function(){_rn30.apply(this,arguments);try{const n=npcCur6;if(!n)return;$('por30n').textContent=$('npcName').textContent;$('por30r').textContent=$('npcRole').textContent;
  view30($('por30v'),'n'+n.id,()=>npcObj30(n),{size:1.9,camY:.55,lookY:.35,dist:3.6,spin:false,yaw:0,drag:true})}catch(e){console.error('npc30',e)}}}

// ---------- Estantes con el producto a la vista; íconos en taller y caravaneros ----------
function shelfVis30(){$('pbody').querySelectorAll('.shelf').forEach((el,i)=>{const s=S.shelves[i];if(!s||el.querySelector('.svis30'))return;const d=document.createElement('div');d.className='svis30';
  const k=s.item,n=k?Math.min(8,S.stash[k]||0):0;d.innerHTML=k?(n?Array.from({length:n},(_,j)=>`<span style="--j:${j}">${ico(k)}</span>`).join(''):`<em>${esc(L('Sin stock en el depósito'))}</em>`):`<em>${esc(L('Vacío'))}</em>`;
  el.querySelector('.lbl').after(d)})}
function outIco30(r){return r.out?r.out[0]:r.weapon?'w:'+r.weapon:r.ammo?'ammo:'+(Array.isArray(r.ammo)?r.ammo[0]:r.ammo):null}
function cardIcons30(){const lists=$('pbody').querySelectorAll('.list');
  if(tab==='taller'&&lists.length){const cards=lists[lists.length-1].querySelectorAll('.item');RECIPES.forEach((r,i)=>{const k=outIco30(r),h=cards[i]&&cards[i].querySelector('h3');if(k&&h&&!h.querySelector('.ico'))h.insertAdjacentHTML('afterbegin',ico(k))})}
  if(tab==='armeria'&&lists.length){const cards=lists[0].querySelectorAll('.item');SHOP.forEach((s,i)=>{const k=s.weapon?'w:'+s.id:s.ammo?'ammo:'+s.ammo[0]:s.item||s.stash||null;const h=cards[i]&&cards[i].querySelector('h3');if(k&&h&&!h.querySelector('.ico'))h.insertAdjacentHTML('afterbegin',ico(k))})}}
const _renderPanel30=renderPanel;renderPanel=function(){_renderPanel30();try{if(tab==='estantes')shelfVis30();cardIcons30()}catch(e){console.error('panel30',e)}};

(function(){const css=`
.view30c{position:absolute;inset:0;width:100%;height:100%;display:block}
.loot2 .col.cont30>.view30c{z-index:-1;opacity:.5;pointer-events:none}
.npc30 .bag29v{cursor:grab}
.npc30 .pbody{align-content:start}.npc30 .btns6{flex:0 0 auto;align-items:flex-start}.npc30 .btns6 button{height:auto}
.npc30 .bag29i{display:none}
.svis30{height:58px;display:flex;align-items:flex-end;gap:0;padding:0 6px 6px;border-bottom:6px solid #5a432a;box-shadow:0 3px 0 #3a2a1a;background:linear-gradient(#141a16,#1d241f)}
.svis30 span{margin-right:-6px}.svis30 .ico{width:40px;height:40px;margin:0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.svis30 em{font-style:normal;font-size:12px;color:var(--muted);align-self:center;margin:auto}
.item h3 .ico{width:30px;height:30px;margin-right:8px;vertical-align:-5px}
`;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})();
