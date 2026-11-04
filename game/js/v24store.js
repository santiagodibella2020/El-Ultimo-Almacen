'use strict';
/* v0.24: mejoras del almacén.
   - Los muebles del hogar (mesa, sillón, biblioteca, velador y plantas) ya no se atraviesan.
   - Clientes: vienen más cuando tenés buena reputación y hay tres tipos (común, apurado y regateador).
   - Precios que se mueven: lo que vendés mucho se satura durante el día, y el clima, la estación y
     lo que pasó a la noche cambian lo que la gente busca. El estante muestra por qué. */

// ---------- Choques con los muebles del hogar ----------
const HOME24={mesa:[[-2.6,-12.6,1.8,2.1]],sofa:[[-5.25,-11.7,1.1,2.5]],biblioteca:[[5.55,-9.4,.5,1.7]],velador:[[-5.55,-8.7,.55,.55]],
  plantas:[[-1.9,-8.9,.45,.45],[1.9,-8.9,.4,.4],[5.4,-14.2,.5,.5],[-5.4,-14.6,.4,.4]]};
let home24=[];
function buildHome24(){home24=[];for(const [id,list] of Object.entries(HOME24))for(const [x,z,w,d] of list)
  home24.push({id,b:addAABB({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:1,y1:3.2,kind:'solid',dead:true})});refreshHome24()}
function refreshHome24(){const own=(S&&S.home9&&S.home9.owned)||[];for(const h of home24)h.b.dead=!own.includes(h.id)}
const _genWorld24=genWorld;genWorld=function(seed){const r=_genWorld24.apply(this,arguments);try{buildHome24()}catch(e){console.error('home24',e)}return r};
if(typeof refreshHome9==='function'){const _rh24=refreshHome9;refreshHome9=function(){_rh24();try{refreshHome24()}catch(e){}}}

// ---------- Demanda: clima, estación y lo que pasó anoche ----------
const WHY24={
  frio:{t:'Hace frío: se busca combustible, té y tela.',k:{combustible:1.35,te:1.3,tela:1.2,encendedor:1.15}},
  calor:{t:'Hace calor: se busca agua y gaseosa.',k:{agua:1.4,gaseosa:1.35,fruta:1.15}},
  lluvia:{t:'Llueve: la gente sale poco y busca comida que dure.',k:{lata:1.25,galletitas:1.15,pan:.85,fruta:.85}},
  apagon:{t:'Anoche hubo apagón: se buscan pilas y encendedores.',k:{pilas:1.5,encendedor:1.35,combustible:1.15}},
  horda:{t:'Después de una noche dura se buscan vendas y remedios.',k:{venda:1.35,desinfectante:1.3,analgesicos:1.25,medicina:1.2}},
  invierno:{t:'Es invierno: la comida fresca escasea.',k:{fruta:1.25,leche:1.2,carne:1.15}},
};
const _rollDemand24=rollDemand;rollDemand=function(){_rollDemand24();try{const why=[];const d=S.demand;
  const t=typeof tempNow==='number'?tempNow:18,wk=S.weather&&S.weather.k,n=S.night23;
  if(t<8)why.push('frio');else if(t>28)why.push('calor');
  if(wk==='lluvia'||wk==='tormenta')why.push('lluvia');
  if(n&&n.k==='apagon'&&n.day>=S.day-1)why.push('apagon');else if(n&&n.k==='cerrada'&&n.day>=S.day-1||S.day>=6&&Math.random()<.35)why.push('horda');
  if(season()==='invierno')why.push('invierno');
  for(const w of why)for(const [k,m] of Object.entries(WHY24[w].k))if(d[k]!=null)d[k]=+(d[k]*m).toFixed(2);
  S.why24=why.slice(0,3);S.sat24={}}catch(e){console.error('demand24',e)}};
function names24(){return [L('Hace frío: se busca combustible, té y tela.'),L('Hace calor: se busca agua y gaseosa.'),L('Llueve: la gente sale poco y busca comida que dure.'),L('Anoche hubo apagón: se buscan pilas y encendedores.'),L('Después de una noche dura se buscan vendas y remedios.'),L('Es invierno: la comida fresca escasea.')]}
function why24Text(){return (S.why24||[]).map(w=>L(WHY24[w].t)).join(' ')}

// ---------- Clientes ----------
const CUST24={comun:{tol:1,q:0,col:null},apurado:{tol:1.25,q:0,col:'#b8a03a'},regateo:{tol:.82,q:1,col:'#5a7a8a'}};
// Clientes con el modelo humano 3D (si ya cargó); si no, quedan los de siempre.
function glbHuman24(cloth,skin,pants){if(!(typeof GLB15T!=='undefined'&&GLB15T.ready&&GLB15T.tpl.human))return null;const tpl=GLB15T.tpl.human,inner=THREE.SkeletonUtils.clone(tpl.scene);
  inner.traverse(o=>{if(o.isMesh){o.material=o.material.clone();const n=o.material.name;if(n==='cloth')o.material.color.set(cloth);else if(n==='skin')o.material.color.set(skin);else if(n==='pants')o.material.color.set(pants);o.material.emissive=new THREE.Color(0);o.castShadow=true}});
  const g=new THREE.Group();g.add(inner);const mixer=new THREE.AnimationMixer(inner),acts={};for(const c of tpl.animations)acts[c.name]=mixer.clipAction(c);if(acts.walk)acts.walk.play();
  const dummy=()=>new THREE.Object3D();g.userData={glb:'human',mixer,acts,cur:'walk',legs:[dummy(),dummy()],arms:[dummy(),dummy()],root:inner};return g}
const _spawnCustomer24=spawnCustomer;spawnCustomer=function(){_spawnCustomer24();try{const c=customers[customers.length-1];if(!c)return;
  const r=Math.random();c.k24=r<.18?'apurado':r<.36?'regateo':'comun';const def=CUST24[c.k24];
  const cloth=def.col||['#4d6a7a','#7a5a4d','#5b6b45','#6a4d6a','#8a7a4a'][Math.random()*5|0],skin=['#c9a888','#a8805e','#e0b898','#8a6040'][Math.random()*4|0],pants=['#2f3a48','#3a3028','#2a2a2a'][Math.random()*3|0];
  const g=glbHuman24(cloth,skin,pants);
  if(g){g.position.copy(c.mesh.position);scene.remove(c.mesh);scene.add(g);c.mesh=g}
  else if(def.col){const u=c.mesh.userData;bx(.36,.12,.36,def.col,0,1.9,0,u.root||c.mesh)}}catch(e){console.error('cust24 spawn',e)}};
const custCap24=()=>4+Math.min(3,Math.floor((S.rep||0)/4));
let cust24T=10;
const _updateCustomers24=updateCustomers;updateCustomers=function(dt,h,threat){_updateCustomers24(dt,h,threat);
  try{for(const c of customers){if(c.k24==='apurado'&&c.state==='buy'&&c.t>.8)c.t=.8;const u=c.mesh.userData;
      if(u&&u.mixer){play15(u,c.state==='buy'?'idle':(threat?'run':'walk'),.25,1);u.mixer.update(dt)}}
    if(customers.length>=4&&customers.length<custCap24()){cust24T-=dt;if(cust24T<=0){cust24T=22*(.6+Math.random()*.8)*(CYCLE()/720*.6+.4);if(h>=7&&h<19&&!threat)spawnCustomer()}}}catch(e){console.error('cust24',e)}};

// Compra: igual que antes, más el tipo de cliente y la saturación de lo que más se vende en el día.
customerBuy=function(c){
  const stocked=S.shelves.filter(s=>s.item&&(S.stash[s.item]||0)>0);
  if(!stocked.length){S.rep=Math.max(0,S.rep-.15);logSale(L('Un cliente se fue sin nada: los estantes están vacíos.'),true);return}
  const dem=k=>S.demand[k]*((S.sat24&&S.sat24[k])||1);
  let tot=stocked.reduce((s,x)=>s+dem(x.item),0),r=R()*tot,sh=stocked[0];for(const x of stocked){if((r-=dem(x.item))<=0){sh=x;break}}
  const kind=(c&&c.k24)||'comun',def=CUST24[kind];
  const it=ITEMS[sh.item],price=Math.max(1,Math.round(it.v*sh.mult)),worth=it.v*dem(sh.item),tol=(.75+R()*.7)*(1+S.rep*.02)*(1+.08*PK('labia'))*def.tol;
  if(sh.item==='podrida'){S.rep=Math.max(0,S.rep-.4);logSale(L('Un cliente vio comida podrida en el estante y se fue enojado.'),true);return}
  if(price<=worth*tol){let q=1+(R()<.4?1:0)+(R()<.15?1:0)+def.q;q=Math.min(q,S.stash[sh.item]);S.stash[sh.item]-=q;const total=price*q;
    S.money+=total;S.today+=total;S.stats.sold+=q;S.stats.earned+=total;S.rep=Math.min(20,S.rep+.03+.06*clamp(1.4-sh.mult,0,1));gainXp(Math.max(1,Math.round(total/10)));
    S.sat24=S.sat24||{};S.sat24[sh.item]=Math.max(.55,((S.sat24[sh.item])||1)*(1-.035*q));
    if(c)sfx('coin',CUST_SPOT.x,CUST_SPOT.z);
    logSale((kind==='apurado'?L('Cliente apurado')+': ':kind==='regateo'?L('Regateador')+': ':'')+L('Vendiste {i} ×{q} a ${p} c/u (total ${t}).',{i:nm(sh.item),q,p:price,t:total}));
    if(c&&Math.hypot(P.x,P.z)>60&&R()<.5)toast(L('Venta en el almacén: +${t}',{t:total}),'#e3a33b',2.5);refreshShelves()}
  else{S.rep=Math.max(0,S.rep-(kind==='regateo'?.02:.06));
    logSale(kind==='regateo'?L('Quiso regatear {i} a ${p} y se fue sin comprar.',{i:nm(sh.item),p:price}):L('Le pareció caro: {i} a ${p}. Se fue sin comprar.',{i:nm(sh.item),p:price}),true)}};

// La demanda que usa el panel tiene en cuenta la saturación del día.
const _chanceText24=chanceText;chanceText=function(s){const k=s.item,sat=(S.sat24&&S.sat24[k])||1;if(sat===1)return _chanceText24(s);
  const d0=S.demand[k];S.demand[k]=d0*sat;try{return _chanceText24(s)}finally{S.demand[k]=d0}};
const _tabEstantes24=tabEstantes;tabEstantes=function(){let h=_tabEstantes24();try{const w=why24Text();const sat=Object.entries(S.sat24||{}).filter(([k,v])=>v<.9).map(([k])=>nm(k));
  let extra='';if(w)extra+=`<p class="note">${esc(w)}</p>`;if(sat.length)extra+=`<p class="note">${esc(L('Hoy ya vendiste mucho de: {i}. Por hoy se buscan menos.',{i:sat.join(', ')}))}</p>`;
  if(extra){const i=h.indexOf('</div>');h=i>=0?h.slice(0,i+6)+extra+h.slice(i+6):extra+h}}catch(e){}return h};
