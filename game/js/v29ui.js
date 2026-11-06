'use strict';
/* v0.29: interfaz más prolija.
   - Inventario: a la izquierda se ve en 3D la mochila que llevás puesta (modelos CC0 de Quaternius),
     con su capacidad. En el saqueo, la misma mochila queda de fondo en la columna "Tu mochila".
   - Botones justos: lo que no se puede hacer no muestra un botón apagado. Si era una compra, queda el precio.
     El saqueo se hace tocando la fila entera.
   - Panel del almacén de alto fijo (no salta al cambiar de pestaña) y todas las pestañas entran. */
const GAME_V29='0.45.0';

// ---------- Mochila en 3D ----------
// m: modelo; tint: color por material del .glb; s: tamaño relativo.
const BAG29={
  rinonera:{m:'Pouch',s:.62,tint:{Brown:'#5a5a48',DarkRed:'#3c3c30'}},
  mochila_e:{m:'SurvivalBackpack',s:.85,tint:{Green:'#2c4a6e',LightGreen:'#3f5f86',Brown:'#2a2a2c',Gold:'#9a9a9a'}},
  mochila_c:{m:'SurvivalBackpack',s:1,tint:null},
  bolso_m:{m:'Bag',s:.95,tint:{Brown:'#4e5638',DarkBrown:'#363c28',Gold:'#6a6650'}},
  mochila_t:{m:'RpgBackpack',s:1.08,tint:{Brown:'#3c4232',DarkBrown:'#2a2e24',Gold:'#5a5a52'}},
};
const bag29={tpl:{},ready:false,r:null,scene:null,cam:null,root:null,cur:null,yaw:-.5,drag:null,canvas:null,run:false};
(function(){try{if(typeof GLB29==='undefined'||!THREE.GLTFLoader)return;const ld=new THREE.GLTFLoader(),ks=Object.keys(GLB29);let n=0;
  const b64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
  ks.forEach(k=>ld.parse(b64(GLB29[k]),'',g=>{bag29.tpl[k]=g.scene;if(++n===ks.length){bag29.ready=true;bag29.cur=null}},e=>{console.error('glb29',k,e);if(++n===ks.length)bag29.ready=true}))}catch(e){console.error('glb29',e)}})();
function bagSetup29(){if(bag29.r)return true;try{
  const c=document.createElement('canvas');c.className='bag29c';const r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:false});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.outputEncoding=THREE.sRGBEncoding;
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xd8dccb,0x2a2418,1.1));const d=new THREE.DirectionalLight(0xffe2b8,1.6);d.position.set(2.5,3,3);sc.add(d);
  const rim=new THREE.DirectionalLight(0x8fbb62,.6);rim.position.set(-3,1.5,-2);sc.add(rim);
  const cam=new THREE.PerspectiveCamera(30,1,.1,50);cam.position.set(0,.35,4.2);cam.lookAt(0,0,0);
  Object.assign(bag29,{r,scene:sc,cam,canvas:c});
  c.addEventListener('pointerdown',e=>{bag29.drag={x:e.clientX,y:bag29.yaw};c.setPointerCapture(e.pointerId)});
  c.addEventListener('pointermove',e=>{if(bag29.drag)bag29.yaw=bag29.drag.y+(e.clientX-bag29.drag.x)*.012});
  c.addEventListener('pointerup',()=>{bag29.drag=null});return true}catch(e){console.error('bag29',e);return false}}
function bagModel29(){const k=S&&S.bag;if(bag29.cur===k&&bag29.root)return;bag29.cur=k;if(bag29.root){bag29.scene.remove(bag29.root);bag29.root=null}
  const def=BAG29[k];if(!def||!bag29.tpl[def.m])return;const g=bag29.tpl[def.m].clone(true);
  g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();const t=def.tint&&def.tint[o.material.name];if(t)o.material.color.setStyle(t).convertSRGBToLinear();o.material.roughness=.85;o.material.metalness=0}});
  const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  const s=1.25*def.s/Math.max(sz.x,sz.y,sz.z);g.position.set(-c.x*s,-c.y*s,-c.z*s);g.scale.setScalar(s);
  const root=new THREE.Group();root.add(g);bag29.root=root;bag29.scene.add(root)}
function bagLoop29(){if(!bag29.run)return;requestAnimationFrame(bagLoop29);const c=bag29.canvas;if(!c||!c.isConnected||!S)return;
  const host=c.parentElement;if(!host||host.offsetParent===null)return;const w=host.clientWidth,h=host.clientHeight;if(w<10||h<10)return;
  if(c._w!==w||c._h!==h){bag29.r.setSize(w,h,false);c.style.width=w+'px';c.style.height=h+'px';bag29.cam.aspect=w/h;bag29.cam.updateProjectionMatrix();c._w=w;c._h=h}
  if(bag29.ready)bagModel29();if(bag29.root){if(!bag29.drag)bag29.yaw+=.004;bag29.root.rotation.y=bag29.yaw;bag29.root.position.y=Math.sin(performance.now()/1400)*.03}
  bag29.r.render(bag29.scene,bag29.cam)}
function bagShow29(host){if(!bagSetup29())return;if(bag29.canvas.parentElement!==host)host.prepend(bag29.canvas);bag29.canvas._w=0;if(!bag29.run){bag29.run=true;bagLoop29()}}
function bagStop29(){bag29.run=false}

// Panel de la mochila en el inventario
(function(){const card=document.querySelector('#inv .card');if(!card)return;card.classList.toggle('inv29',true);
  const st=document.createElement('div');st.className='bag29';st.innerHTML='<div class="bag29v"></div><div class="bag29i"><div class="eyebrow" id="bag29k"></div><h3 id="bag29n"></h3><div class="cap29"><i id="bag29bar"></i></div><div class="bag29t" id="bag29t"></div><div class="note" id="bag29h"></div></div>';card.prepend(st)})();
function bagInfo29(){const k=S.bag,used=invKg(),cap=capKg();$('bag29k').textContent=L('Mochila');$('bag29n').textContent=k?nm(k):L('Sin mochila');
  const p=clamp(used/cap*100,0,100);const bar=$('bag29bar');bar.style.width=p+'%';bar.style.background=overW()?'var(--red)':p>80?'var(--amber)':'var(--bruma)';
  $('bag29t').textContent=`${kg(used)} / ${cap} kg`;$('bag29h').textContent=overW()?L('Sobrecarga'):k?'':L('Conseguí una mochila para cargar más.')}

// ---------- Botones justos ----------
// Un botón apagado no sirve: si dice un precio queda el precio, si marca la opción elegida queda resaltada, y si no, se saca.
const SEL29=['g28rat','h9rug'];
function prune29(root){if(!root)return;root.querySelectorAll('button:disabled').forEach(b=>{if(b.closest('.tabs')||b.dataset.keep)return;
  if(SEL29.includes(b.dataset.a)){const s=document.createElement('span');s.className='sel29';s.textContent=b.textContent;b.replaceWith(s);return}
  const m=b.textContent.match(/\$\s?[\d.,]+/);if(m){const s=document.createElement('span');s.className='price29';s.textContent=m[0];b.replaceWith(s);return}
  b.remove()});
  // filas y grupos que quedaron sin nada
  root.querySelectorAll('.acts:empty,.btns:empty').forEach(a=>{if(a.classList.contains('acts'))a.innerHTML='';else a.remove()})}
// En el saqueo se toca la fila entera para pasar una unidad.
function lootRows29(){for(const id of ['lootMine','lootTheirs'])for(const r of $(id).querySelectorAll('.row')){const b=r.querySelector('.acts button[data-a="put"],.acts button[data-a="take"],.acts button[data-a="takeam"],.acts button[data-a="takewp"]');if(!b)continue;
  for(const k of ['a','k','i'])if(b.dataset[k]!=null)r.dataset[k]=b.dataset[k];r.classList.toggle('click29',true);r.title=id==='lootMine'?L('Guardar'):L('Tomar');b.remove()}}

// ---------- Enganches ----------
const _renderInv29=renderInv;renderInv=function(){_renderInv29();try{prune29($('invBody'));bagInfo29();bagShow29(document.querySelector('#inv .bag29v'))}catch(e){console.error('inv29',e)}};
const _renderLoot29=renderLoot;renderLoot=function(){_renderLoot29();try{lootRows29();prune29($('loot'));const col=$('lootMine').parentElement;col.classList.toggle('bagbg29',true);bagShow29(col)}catch(e){console.error('loot29',e)}};
let tabPrev29='';
const _renderPanel29=renderPanel;renderPanel=function(){_renderPanel29();try{$('pbody').dataset.tab29=tab;prune29($('pbody'));if(tab!==tabPrev29){$('pbody').scrollTop=0;tabPrev29=tab}}catch(e){console.error('panel29',e)}};
if(typeof renderNpc6==='function'){const _rn29=renderNpc6;renderNpc6=function(){_rn29.apply(this,arguments);try{prune29($('npcBody'))}catch(e){}}}
const _show29=show;show=function(id){_show29(id);if(id!=='inv'&&id!=='loot')bagStop29()};
const _resume29=resume;resume=function(){bagStop29();return _resume29.apply(this,arguments)};
(function(){const f=document.querySelector('#menu footer');if(f){const sp=f.querySelector('span');f.textContent='';if(sp)f.append(sp);f.append(' · v'+GAME_V29)}})();

// ---------- Estilos ----------
(function(){const css=`
.wide.inv29{width:min(1180px,100%);display:grid;grid-template-columns:minmax(260px,330px) minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);height:min(760px,calc(100vh - 32px))}
.inv29>.bag29{grid-row:1/4;grid-column:1;display:flex;flex-direction:column;border-right:1px solid var(--line);background:radial-gradient(ellipse at 50% 42%,#2a3326 0%,#151b17 58%,#0f1411 100%);position:relative;overflow:hidden}
.inv29>.phead,.inv29>.tabs,.inv29>.pbody{grid-column:2;min-width:0}
.bag29v{flex:1;min-height:220px;position:relative;cursor:grab}.bag29v:active{cursor:grabbing}
.bag29v::after{content:'';position:absolute;left:18%;right:18%;bottom:14%;height:18px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.55),rgba(0,0,0,0) 70%);pointer-events:none}
.bag29c{position:absolute;inset:0;display:block}
.bag29i{padding:16px 20px 20px;display:grid;gap:6px;border-top:1px solid var(--line);background:rgba(10,14,12,.6)}
.bag29i h3{font-size:26px;font-weight:800;text-transform:uppercase;line-height:1}
.cap29{height:8px;background:#232c25}.cap29 i{display:block;height:100%;width:0;transition:width .25s}
.bag29t{font:600 14px var(--f-mono);color:var(--fg)}
.loot2 .col.bagbg29{position:relative;isolation:isolate;min-height:min(420px,52vh)}
.loot2 .col.bagbg29>.bag29c{z-index:-1;opacity:.5;pointer-events:none}
.loot2 .col.bagbg29 .rows{background:none}.loot2 .col.bagbg29 .row{background:rgba(27,34,29,.55)}
.row.click29{cursor:pointer;position:relative;padding-right:30px}
.row.click29:hover{background:#243026;outline:1px solid var(--amber-d)}
#lootMine .row.click29::after,#lootTheirs .row.click29::after{position:absolute;right:10px;top:50%;transform:translateY(-50%);font:600 14px var(--f-mono);color:var(--muted)}
#lootMine .row.click29::after{content:'→'}#lootTheirs .row.click29::after{content:'←'}
.row.click29:hover::after{color:var(--amber)!important}
.pcard{width:min(1100px,100%);height:min(780px,calc(100vh - 32px));max-height:none}
.pcard .pbody{flex:1;min-height:0;align-content:start}
.pcard .tabs{flex:none;scrollbar-width:none}.pcard .tabs::-webkit-scrollbar{display:none}
.pcard .tabs button{font-size:16px;padding:11px 9px}
.price29{font:600 13px var(--f-mono);color:var(--muted);padding:5px 2px;white-space:nowrap}
.sel29{font:600 13px var(--f-body);padding:5px 9px;border:1px solid var(--amber);color:var(--amber);background:rgba(227,163,59,.08);white-space:nowrap}
.row .acts:empty{min-width:0}
#pbody[data-tab29=deposito] .row:not(.r2):not(.r3):not(.r4){grid-template-columns:minmax(0,1.7fr) repeat(3,minmax(0,.45fr)) 270px}
@media (max-width:820px){.wide.inv29{grid-template-columns:1fr;grid-template-rows:200px auto auto minmax(0,1fr)}.inv29>.bag29{grid-row:1;flex-direction:row}.inv29>.phead,.inv29>.tabs,.inv29>.pbody{grid-column:1}}
`;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})();
