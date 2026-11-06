'use strict';
/* v0.37: el almacén crece de a poco hasta ser un pueblo.
   - Pestaña Pueblo: estructuras que se construyen con materiales y plata (casas, campo de cultivo, pozo, taller, enfermería,
     puestos de mercado, torres de vigilancia, anexo del almacén y muralla de piedra). Se ven en el patio.
   - Nivel del pueblo (Campamento, Aldea, Pueblo, Pueblo fortificado): con más gente y estructuras llega más gente, de a varios,
     y todos rinden un poco más.
   - Gente: oficio que se puede cambiar, experiencia (rinden más con los días), aceptar automáticamente a los que llegan.
   Los ganchos están en v28crew.js (capacidad, dónde duermen, guardias en torres, llegadas) y v24store/game.js (clientes, muros). */

// ---------- Estructuras ----------
const ST37={
  casa:{max:4,cost:l=>({tablas:6+2*l,clavos:10+4*l}),money:l=>150+100*l,at:[[-18.5,-18],[-13,-18],[-18.5,-12.5],[-13,-12.5]]},
  campo:{max:2,cost:l=>({tablas:4,clavos:6,cuerda:2}),money:l=>200+200*l,at:[[-15.5,17.2],[-15.5,20.2]]},
  pozo:{max:1,cost:l=>({chatarra:6,tablas:3,cuerda:2}),money:l=>250,at:[[-3.2,13]]},
  taller:{max:1,cost:l=>({tablas:8,clavos:14,chapa:3}),money:l=>400,at:[[18.5,-13.5]]},
  enferm:{max:1,cost:l=>({tablas:6,clavos:8,tela:6,venda:4}),money:l=>350,at:[[0,-19.4]]},
  mercado:{max:2,cost:l=>({tablas:5,clavos:6,tela:4}),money:l=>220+180*l,at:[[19.4,-2.5],[19.4,3.5]]},
  torre:{max:3,cost:l=>({tablas:8+2*l,clavos:12+3*l,cuerda:2}),money:l=>300+200*l,at:[[-7,19.5],[7,19.5],[-20,0]]},
  anexo:{max:1,cost:l=>({tablas:12,clavos:20,chapa:4}),money:l=>600,at:[[10,-12]]},
  muralla:{max:2,cost:l=>({chapa:5+2*l,clavos:10,chatarra:6}),money:l=>450+350*l,at:[]},
};
const ST37TXT=()=>({casa:[L('Casa'),L('Cuatro lugares más para dormir.')],campo:[L('Campo de cultivo'),L('Los granjeros cosechan mucha más verdura.')],pozo:[L('Pozo con bomba'),L('Los aguateros sacan la mitad más de agua.')],taller:[L('Taller grande'),L('Mecánicos y carpinteros rinden la mitad más.')],enferm:[L('Enfermería'),L('El enfermero rinde más y la gente se desanima menos.')],mercado:[L('Puestos de mercado'),L('Vienen más clientes y el almacenero vende más.')],torre:[L('Torre de vigilancia'),L('Un guardia arriba dispara más lejos y más fuerte. Cada torre necesita un guardia.')],anexo:[L('Anexo del almacén'),L('Una sala más para vender: dos estantes más.')],muralla:[L('Muralla de piedra'),L('La empalizada aguanta mucho más.')]});
const ST37K=Object.keys(ST37);
const LV37=[{p:0},{p:8},{p:20},{p:36}];
const lvName37=i=>[L('Campamento'),L('Aldea'),L('Pueblo'),L('Pueblo fortificado')][i];
function town37(){if(!S.town37)S.town37={b:{},auto:false,lvl:0,rd:0};return S.town37}
const has37=k=>(town37().b[k]||0);
function pts37(){const T=town37();let p=crew28().list.length;for(const k of ST37K)p+=2*(T.b[k]||0);return p}
function level37(){const p=pts37();let l=0;LV37.forEach((v,i)=>{if(p>=v.p)l=i});return l}
const candCap37=()=>2+level37();
const arriveBonus37=()=>.08*level37();
const capExtra37=()=>4*has37('casa');
const mktBonus37=()=>has37('mercado')*2;
const wallBonus37=()=>350*has37('muralla');
function towerGuards37(){const C=crew28();return C.list.filter(w=>w.job==='guardia')}
function tower37(w){const n=has37('torre');if(!n||w.job!=='guardia')return null;const k=towerGuards37().indexOf(w);if(k<0||k>=n)return null;const [x,z]=ST37.torre.at[k];return{x,z,tw:k+1}}
function sleep37(i){const C=crew28(),idx=i-CAP0_28-2*C.tents,n=has37('casa');if(idx<0||!n)return null;const k=idx>>2;if(k>=n)return null;const [x,z]=ST37.casa.at[k];return{x:x-1.2+(idx&3)*.8,z:z+3}}

// ---------- Experiencia y producción ----------
const xpName37=i=>[L('Novato'),L('Práctico'),L('Experimentado'),L('Experto'),L('Maestro')][i];
const xpLv37=w=>Math.min(4,Math.floor((w.xp37||0)/6));
function bonus37(w){let b=.1*xpLv37(w)+.04*level37();
  switch(w.job){case 'granjero':b+=.6*has37('campo');break;case 'aguatero':b+=.5*has37('pozo');break;case 'mecanico':case 'carpintero':b+=.5*has37('taller');break;case 'enfermero':b+=.4*has37('enferm');break}
  return b}
const _produce37=produce28;
produce28=function(w,out){const pre=Object.assign({},S.stash);_produce37.apply(this,arguments);
  try{w.xp37=(w.xp37||0)+1;const b=bonus37(w);if(b<=0)return;
    for(const k of Object.keys(S.stash)){const d=(S.stash[k]||0)-(pre[k]||0);if(d<=0)continue;const x=d*b,q=Math.floor(x)+(R()<x%1?1:0);if(q>0)give28(out,k,q)}}catch(e){console.error('town37 produce',e)}};

// ---------- Gente nueva ----------
function makeCand37(){const C=crew28(),T=town37(),guards=towerGuards37().length+C.cand.filter(c=>c.job==='guardia').length;
  const wt={};for(const k of Object.keys(JOBS28))wt[k]=1;
  if(has37('torre')>guards)wt.guardia+=4;if(has37('campo'))wt.granjero+=2;if(has37('pozo'))wt.aguatero+=2;if(has37('taller')){wt.mecanico+=1;wt.carpintero+=1}if(has37('enferm'))wt.enfermero+=2;if(has37('mercado'))wt.almacenero+=2;
  const have={};for(const w of [...C.list,...C.cand])have[w.job]=(have[w.job]||0)+1;for(const k in wt)wt[k]=Math.max(.3,wt[k]-(have[k]||0)*.4);
  let r=R()*Object.values(wt).reduce((a,b)=>a+b,0),job='granjero';for(const k in wt){if((r-=wt[k])<=0){job=k;break}}
  const used=new Set([...C.list,...C.cand].map(w=>w.name));const names=NAMES28.filter(n=>!used.has(n));
  const c={id:C.nid++,name:names[R()*names.length|0]||NAMES28[R()*NAMES28.length|0],job,until:S.day+2,mor:55+(R()*15|0),hp:100,skin:R()*4|0,xp37:R()<.3?6:0};
  C.cand.push(c);return c}
const _arrive37=arrive28;
arrive28=function(){const C=crew28(),n0=C.cand.length;_arrive37.apply(this,arguments);
  try{const T=town37(),h=hourOf(S.t),lv=level37();
    // con el pueblo más grande a veces llegan varios juntos
    if(lv>=1&&S.day>=3&&T.rd!==S.day&&h>=9&&h<=17){T.rd=S.day;if(C.cand.length<candCap37()&&R()<.2+.15*lv){const c=makeCand37();sfx('knock');toast(L('Llegó otra persona al portón: {n}, {j}.',{n:c.name,j:job28(c.job)[0]}),'#e3a33b',8)}}
    if(T.auto){for(const c of [...C.cand]){if(C.list.length>=cap28())break;const m=hire28(c.id);toast(L('Se sumó {n} ({j}).',{n:c.name,j:job28(c.job)[0]}),'#8fbb62',6)}}}catch(e){console.error('town37 arrive',e)}};
const _newDay37=newDay;
newDay=function(){const l0=level37();_newDay37.apply(this,arguments);
  try{const T=town37(),l=level37();if(l>l0||l>(T.lvl||0)){T.lvl=l;toast(L('¡Tu asentamiento ya es {n}! Llega más gente y todos rinden un poco más.',{n:lvName37(l)}),'#e3a33b',9);sfx('goal')}}catch(e){}};

// ---------- Construcción ----------
let vis37=null;
const P4_37=()=>new THREE.CylinderGeometry(.01,.75,1,4,1);
function mkCasa37(x,z,bs){const g=grp(x,groundY(x,z),z,world),y=0;
  bx(4,2.4,4,'#8a7a5a',0,1.2,0,g);const r=bx(5.6,1.6,5.6,'#5a3a2a',0,3.2,0,g,P4_37());r.rotation.y=Math.PI/4;
  bx(1,1.8,.12,'#3a2a1c',0,.9,2.02,g);bx(.8,.7,.12,'#2a3036',-1.3,1.5,2.02,g);bx(.8,.7,.12,'#2a3036',1.3,1.5,2.02,g);bx(.5,1,.5,'#6a5a4a',1.4,3.6,-1,g);
  bs.push(addAABB({x0:x-2,x1:x+2,z0:z-2,z1:z+2,y0:g.position.y-1,y1:g.position.y+3,kind:'solid'}));return g}
function mkCampo37(x,z){const g=grp(x,groundY(x,z),z,world);
  for(let i=0;i<3;i++){const px=-3+i*3;bx(2.6,.2,2.4,'#3e2c1e',px,.1,0,g);for(let r=-1;r<=1;r++){bx(2.2,.35,.18,'#4a7a2a',px,.35,r*.7,g)}}
  for(const [a,b,w,d] of [[0,-1.4,9.2,.14],[0,1.4,9.2,.14],[-4.6,0,.14,2.8],[4.6,0,.14,2.8]])bx(w,.3,d,'#6a5236',a,.15,b,g);
  bx(.1,1.5,.1,'#6a5236',4,.75,1,g);bx(.7,.08,.08,'#6a5236',4,1.3,1,g);return g}
function mkPozo37(x,z,bs){const g=grp(x,groundY(x,z),z,world);
  bx(1.5,.9,1.5,'#7a7a74',0,.45,0,g,new THREE.CylinderGeometry(.5,.5,1,12));bx(1.2,.05,1.2,'#1a2a30',0,.9,0,g,new THREE.CylinderGeometry(.5,.5,1,12));
  bx(.12,2.2,.12,'#6a5236',-.8,1.1,0,g);bx(.12,2.2,.12,'#6a5236',.8,1.1,0,g);bx(1.9,.1,.1,'#6a5236',0,2.2,0,g);const r=bx(2.2,.7,1.8,'#5a3a2a',0,2.6,0,g,P4_37());r.rotation.y=Math.PI/4;r.scale.set(2.4,.8,2.4);
  bx(.35,.3,.35,'#5a5a56',.4,1.2,0,g);bs.push(addAABB({x0:x-.9,x1:x+.9,z0:z-.9,z1:z+.9,y0:g.position.y-1,y1:g.position.y+1.2,kind:'solid'}));return g}
function mkTaller37(x,z,bs){const g=grp(x,groundY(x,z),z,world);
  bx(5,2.8,.2,'#7a6a50',0,1.4,-1.9,g);bx(.2,2.8,3.8,'#7a6a50',-2.4,1.4,0,g);bx(.2,2.8,3.8,'#7a6a50',2.4,1.4,0,g);bx(5.4,.25,4.4,'#4a4a48',0,2.95,0,g);
  bx(1.6,.9,.7,'#5a4a3a',-1.2,.45,-1.2,g);bx(.5,.35,.3,'#2a2d2e',1.2,.95,-1.1,g);bx(.7,.8,.5,'#3a3d3e',1.2,.4,-1.1,g);bx(.7,.7,.7,'#8a3a2a',-1.7,.35,1,g,new THREE.CylinderGeometry(.5,.5,1,10));
  bx(1.4,.08,.5,'#8a7a5a',.2,1.1,-1.65,g);bs.push(addAABB({x0:x-2.5,x1:x+2.5,z0:z-2,z1:z-1.6,y0:g.position.y-1,y1:g.position.y+3,kind:'solid'}),addAABB({x0:x-2.5,x1:x-2.3,z0:z-1.9,z1:z+1.9,y0:g.position.y-1,y1:g.position.y+3,kind:'solid'}),addAABB({x0:x+2.3,x1:x+2.5,z0:z-1.9,z1:z+1.9,y0:g.position.y-1,y1:g.position.y+3,kind:'solid'}));return g}
function mkEnferm37(x,z,bs){const g=grp(x,groundY(x,z),z,world);
  bx(6.4,2.8,3,'#d8d8d0',0,1.4,0,g);bx(6.8,.25,3.4,'#8a8a84',0,2.95,0,g);bx(1,1.9,.1,'#5a6a6a',-1.6,.95,1.52,g);bx(.9,.8,.1,'#2a3036',1.4,1.5,1.52,g);bx(.9,.8,.1,'#2a3036',2.4,1.5,1.52,g);
  bx(.2,1.1,.06,'#c82a22',0,2.2,1.55,g);bx(1.1,.2,.06,'#c82a22',0,2.2,1.55,g);bs.push(addAABB({x0:x-3.2,x1:x+3.2,z0:z-1.5,z1:z+1.5,y0:g.position.y-1,y1:g.position.y+3,kind:'solid'}));return g}
function mkMercado37(x,z,k,bs){const g=grp(x,groundY(x,z),z,world);g.rotation.y=-Math.PI/2;
  for(const sx of [-1.4,1.4])for(const sz of [-.9,.9])bx(.12,2.2,.12,'#6a5236',sx,1.1,sz,g);
  for(let i=0;i<6;i++){const a=bx(.5,.06,2.2,i%2?'#d8d0b8':(k?'#3a6a8a':'#a83a2a'),-1.25+i*.5,2.3-i*.012,0,g);a.rotation.z=-.1}
  bx(2.6,.9,1,'#6a5236',0,.45,-.3,g);bx(2.8,.08,1.2,'#8a7a5a',0,.94,-.3,g);bx(.5,.35,.5,'#7a5a34',-.8,1.14,-.3,g);bx(.4,.25,.4,'#6a8a3a',.6,1.1,-.3,g);bx(.4,.25,.4,'#a85a2a',1,1.1,-.3,g);
  bs.push(addAABB({x0:x-1.2,x1:x+1.2,z0:z-1.6,z1:z+1.6,y0:g.position.y-1,y1:g.position.y+1.2,kind:'solid'}));return g}
function mkTorre37(x,z,bs){const g=grp(x,groundY(x,z),z,world);
  for(const sx of [-1,1])for(const sz of [-1,1]){bx(.22,4.8,.22,'#6a5236',sx,2.4,sz,g)}
  bx(.1,2.8,.1,'#5a4630',-1,2.4,0,g).rotation.z=.15;bx(2.4,.2,2.4,'#7a6246',0,4.7,0,g);
  for(const [a,b,w,d] of [[0,-1.1,2.4,.1],[0,1.1,2.4,.1],[-1.1,0,.1,2.2],[1.1,0,.1,2.2]])bx(w,.7,d,'#5a4630',a,5.15,b,g);
  for(const sx of [-1,1])for(const sz of [-1,1])bx(.12,1.2,.12,'#5a4630',sx,5.4,sz,g);const r=bx(3,1.1,3,'#4a2f22',0,6.5,0,g,P4_37());r.rotation.y=Math.PI/4;
  for(let i=0;i<6;i++)bx(.9,.06,.08,'#7a6246',-1.05,.5+i*.7,0,g);bs.push(addAABB({x0:x-1.2,x1:x+1.2,z0:z-1.2,z1:z+1.2,y0:g.position.y-1,y1:g.position.y+4.6,kind:'solid'}));return g}
function mkAnexo37(x,z,bs){const g=grp(0,0,0,world),Y=groundY(x,z),cW='#7a5a3d';
  const b=(w,h,d,c,xx,yy,zz,box)=>{bx(w,h,d,c,xx,Y+yy,zz,g);if(box)bs.push(addAABB({x0:box[0],x1:box[1],z0:box[2],z1:box[3],y0:Y-1,y1:Y+3.6,kind:'solid'}))};
  b(8,3.6,.3,cW,10,1.8,-16,[6,14,-16.2,-15.8]);b(.3,3.6,8,cW,14,1.8,-12,[13.8,14.2,-16,-8]);b(2.8,3.6,.3,cW,7.4,1.8,-8,[6,8.8,-8.2,-7.8]);b(2.8,3.6,.3,cW,12.6,1.8,-8,[11.2,14,-8.2,-7.8]);b(2.4,1,.3,cW,10,3.1,-8);
  const f=bx(8,.08,8,'#5a5550',10,Y+.04,-12,g);f.castShadow=false;const roof=bx(9,.3,9.2,'#4f3526',10,Y+3.75,-12,g);
  bx(1.5,.9,.7,'#5b4430',10,Y+.45,-10.2,g);bx(1.6,.08,.8,'#7a5c3f',10,Y+.93,-10.2,g);
  bs.push(addAABB({x0:9.2,x1:10.8,z0:-10.6,z1:-9.8,y0:Y-1,y1:Y+1,kind:'solid'}));return g}
function mkMuralla37(n,bs){const g=grp(0,0,0,world);
  for(const w of walls){if(w.gate)continue;const horiz=Math.abs(Math.abs(w.z)-PAL)<.1;const gy=groundY(w.x,w.z);
    const a=bx(horiz?4:.8,.8*n,horiz?.8:4,n>1?'#8a8a84':'#7a7a74',w.x,gy+.4*n,w.z,g);a.castShadow=false}
  return g}
function clearVis37(){if(vis37){for(const m of vis37.ms)m.parent&&m.parent.remove(m);for(const b of vis37.bs)b.dead=true}vis37=null}
function buildVis37(){if(!world||!S||!walls)return;clearVis37();const T=town37();vis37={ms:[],bs:[],key:JSON.stringify(T.b),world};
  for(const k of ST37K){const n=T.b[k]||0;
    for(let i=0;i<n;i++){const [x,z]=ST37[k].at[i]||[0,0];let g=null;
      try{if(k==='casa')g=mkCasa37(x,z,vis37.bs);else if(k==='campo')g=mkCampo37(x,z);else if(k==='pozo')g=mkPozo37(x,z,vis37.bs);else if(k==='taller')g=mkTaller37(x,z,vis37.bs);
        else if(k==='enferm')g=mkEnferm37(x,z,vis37.bs);else if(k==='mercado')g=mkMercado37(x,z,i,vis37.bs);else if(k==='torre')g=mkTorre37(x,z,vis37.bs);else if(k==='anexo')g=mkAnexo37(x,z,vis37.bs)}catch(e){console.error('town37 vis',k,e)}
      if(g)vis37.ms.push(g)}
    if(k==='muralla'&&n)try{vis37.ms.push(mkMuralla37(n,vis37.bs))}catch(e){console.error('town37 muralla',e)}}
  try{updateUpgradeVisuals();refreshShelves()}catch(e){}}
// los dos estantes del anexo existen siempre (escondidos); se ven cuando hay más de 7 estantes
function annexShelves37(){if(!shelfUnits||shelfUnits.length>7)return;const Y=2;
  for(const x of [7.8,12.2]){const u=grp(x,0,-15.3,world);u.position.y=groundY(x,-15.3);bx(1.4,2.2,.7,'#3f2f20',0,1.1,0,u);for(let b=0;b<3;b++)bx(1.4,.06,.75,'#6b5136',0,.5+b*.65,0,u);
    const prods=[];for(let b=0;b<3;b++)for(let p=0;p<3;p++){const m=bx(.32,.38,.32,'#888',-.45+p*.45,.72+b*.65,.08,u);m.visible=false;prods.push(m)}
    u.visible=false;shelfUnits.push({group:u,prods,x,z:-15.3})}}

function canBuild37(k){const T=town37(),d=ST37[k],l=T.b[k]||0;if(l>=d.max)return L('Ya no podés levantar más.');
  if(S.money<d.money(l))return L('Te falta plata.');if(!canAfford(d.cost(l)))return L('Faltan materiales.');return''}
function build37(k){const T=town37(),d=ST37[k],l=T.b[k]||0,e=canBuild37(k);if(e)return e;
  S.money-=d.money(l);payCost(d.cost(l));T.b[k]=l+1;
  if(k==='anexo'){S.shelves.push({item:null,mult:1},{item:null,mult:1})}
  if(k==='muralla'){S.walls=S.walls.map(v=>v>0?v+350:v)}
  annexShelves37();buildVis37();sfx('goal');gainXp(40);
  const lv=level37();if(lv>(T.lvl||0)){T.lvl=lv;toast(L('¡Tu asentamiento ya es {n}! Llega más gente y todos rinden un poco más.',{n:lvName37(lv)}),'#e3a33b',9)}
  return L('Construiste: {n}.',{n:ST37TXT()[k][0]})}

// ---------- Gente: oficio ----------
function jobShift37(id,dir){const C=crew28(),w=C.list.find(x=>x.id===id);if(!w)return'';const ks=Object.keys(JOBS28),i=ks.indexOf(w.job);
  w.job=ks[(i+dir+ks.length)%ks.length];w.xp37=Math.floor((w.xp37||0)/2);w.last=null;return L('{n} ahora es {j}.',{n:w.name,j:job28(w.job)[0]})}

// ---------- Torres: los guardias de arriba y su tiro de largo alcance ----------
let twT37=0;
function towerTick37(dt){const C=crew28();
  for(const w of towerGuards37()){const tw=tower37(w);if(!tw)continue;const o=crewG28.get(w.id);if(!o||!o.g.visible)continue;
    if(Math.hypot(o.x-tw.x,o.z-tw.z)<.8)o.g.position.y=groundY(tw.x,tw.z)+4.75}
  twT37-=dt;if(twT37>0)return;twT37=1.3;
  for(const w of towerGuards37()){const tw=tower37(w);if(!tw)continue;const o=crewG28.get(w.id);if(!o||!o.g.visible||Math.hypot(o.x-tw.x,o.z-tw.z)>.8)continue;
    let best=null,bd=55;for(const e of enemies){if(!hostile28(e))continue;const d=Math.hypot(e.x-o.x,e.z-o.z);if(d<bd){bd=d;best=e}}
    if(best&&(isNight()||bd<35)){o.g.rotation.y=Math.atan2(best.x-o.x,best.z-o.z);sfx('pistola',o.x,o.z);burst(o.x+Math.sin(o.g.rotation.y)*.6,o.g.position.y+1.4,o.z+Math.cos(o.g.rotation.y)*.6,'#ffcf6a',4,1.5);
      hurtEnemy(best,(26+R()*18)*(.6+w.mor/250),false,'t',L('Guardia'))}}}

// ---------- Pestaña Pueblo ----------
function costTxt37(c){return Object.entries(c).map(([k,q])=>`${nm(k)} ${(S.inv[k]||0)+(S.stash[k]||0)}/${q}`).join(' · ')}
function tabPueblo37(){const C=crew28(),T=town37(),lv=level37(),p=pts37(),next=LV37[lv+1];
  let h=`<div class="banner">${esc(L('El almacén puede crecer hasta ser un pueblo. Cada estructura se levanta con materiales y plata y se ve en el patio. Con más gente y más estructuras sube el nivel del asentamiento: llega más gente y todos rinden más.'))}</div>`;
  h+=`<p class="note"><b>${esc(lvName37(lv))}</b> · ${esc(L('Puntos {n}',{n:p}))}${next?' · '+esc(L('Próximo nivel ({m}): {n} puntos',{m:lvName37(lv+1),n:next.p})):' · '+esc(L('Nivel máximo'))}</p>`;
  h+=`<p class="note">${esc(L('Gente {a} de {b} · Pueden esperar en el portón: {c}',{a:C.list.length,b:cap28(),c:candCap37()}))}</p>`;
  h+=`<div class="acts">${btn(T.auto?L('Aceptar solo yo'):L('Aceptar automáticamente a los que lleguen'),'t37auto')}</div>`;
  h+=`<h4>${esc(L('Estructuras'))}</h4><div class="rows">`+ST37K.map(k=>{const d=ST37[k],l=T.b[k]||0,full=l>=d.max,c=d.cost(l);
    const eff=k==='casa'?L('Lugares para dormir: {n}',{n:cap28()}):k==='torre'?L('Guardias en torres: {a} de {b}',{a:Math.min(l,towerGuards37().length),b:l}):'';
    return row(`<div><strong>${esc(ST37TXT()[k][0])}</strong> <span class="chance">· ${l}/${d.max}</span><br><span class="chance">${esc(ST37TXT()[k][1])}</span>${eff&&l?`<br><span class="chance">${esc(eff)}</span>`:''}${full?'':`<br><span class="chance">$${fmt(d.money(l))} · ${esc(costTxt37(c))}</span>`}</div><div class="acts">${full?'':btn(L('Construir'),'t37build',`data-k="${k}" ${canBuild37(k)?'disabled':''}`)}</div>`)}).join('')+'</div>';
  h+=`<h4>${esc(L('Oficios'))}</h4><div class="rows">`+(C.list.length?C.list.map(w=>{const J=job28(w.job),xl=xpLv37(w),b=Math.round(bonus37(w)*100);
    return row(`<div><strong>${esc(w.name)}</strong> <span class="chance">· ${esc(J[0])} · ${esc(xpName37(xl))}${b>0?' · +'+b+'%':''} · ${esc(mood28(w))}</span></div><div class="acts">${btn('◀','t37job',`data-id="${w.id}" data-d="-1"`)}${btn('▶','t37job',`data-id="${w.id}" data-d="1"`)}</div>`)}).join('')
    :row(`<div>${esc(L('Todavía no recibiste a nadie.'))}</div>`))+'</div>';
  h+=`<p class="note">${esc(L('Con los días cada uno gana experiencia y rinde más. Cambiar de oficio hace perder la mitad de la experiencia.'))}</p>`;
  return h}
const _renderPanel37=renderPanel;
renderPanel=function(){if(tab!=='pueblo')return _renderPanel37();tab='mejoras';_renderPanel37();tab='pueblo';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab==='pueblo'));
  $('pbody').innerHTML=(panelMsg?`<div class="banner">${esc(panelMsg)}</div>`:'')+tabPueblo37()};
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a^="t37"]');if(!b||b.disabled||!S)return;const a=b.dataset.a;panelMsg='';
  if(a==='t37build')panelMsg=build37(b.dataset.k);
  if(a==='t37auto')town37().auto=!town37().auto;
  if(a==='t37job')panelMsg=jobShift37(+b.dataset.id,+b.dataset.d);
  renderPanel()});

// ---------- Enganches ----------
const _update37=update;
update=function(dt){_update37(dt);try{if(gstate==='play'&&S){if(!vis37||vis37.world!==world||vis37.key!==JSON.stringify(town37().b)){annexShelves37();buildVis37()}towerTick37(dt)}}catch(e){console.error('town37',e)}};
const _genWorld37=genWorld;genWorld=function(seed){clearVis37();return _genWorld37.apply(this,arguments)};
