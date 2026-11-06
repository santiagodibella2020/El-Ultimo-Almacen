'use strict';
/* v0.28: gente en el almacén.
   Llega gente al portón buscando refugio. Cada uno tiene un oficio y aporta algo todos los días
   a cambio de techo (lugar para dormir), comida, agua y protección. Si les falta algo o de noche
   los podridos se meten en el patio, se desaniman; con el ánimo por el piso se van.
   Todo se maneja desde la pestaña Gente del panel del almacén. */

// ---------- Oficios ----------
// spot: dónde trabajan de día. away: salen del almacén de día (vuelven a la tarde).
const JOBS28={
  granjero:{col:'#5b7a3a',spot:[-14.6,4.6]},
  cazador:{col:'#6a4a2a',spot:[-9,17],away:1},
  aguatero:{col:'#3a6a8a',spot:[-6,17]},
  enfermero:{col:'#d8d8d0',spot:[-2.6,-6.2]},
  mecanico:{col:'#3a3a48',spot:[8,-3]},
  carpintero:{col:'#8a6a3a',spot:[-18,-4]},
  guardia:{col:'#4a5a3a',spot:[0,18.6]},
  cocinero:{col:'#e0dcc8',spot:[11.2,12.2]},
  carronero:{col:'#6a5a4a',spot:[16,18],away:1},
  almacenero:{col:'#8a3a3a',spot:[1.4,-12.4]},
};
function job28(k){return{
  granjero:[L('Granjero'),L('Riega la huerta todos los días y cosecha verdura extra.')],
  cazador:[L('Cazador'),L('Sale de día y vuelve con carne y a veces cuero.')],
  aguatero:[L('Aguatero'),L('Saca y filtra agua del pozo: varias botellas por día.')],
  enfermero:[L('Enfermero'),L('Hace vendas y remedios. Una vez por día te cura si le hablás.')],
  mecanico:[L('Mecánico'),L('Desarma chatarra útil y a veces consigue combustible.')],
  carpintero:[L('Carpintero'),L('Hace tablas y clavos, y repara las barricadas y muros cada mañana.')],
  guardia:[L('Guardia'),L('Vigila el portón y le dispara a lo que se acerca de noche.')],
  cocinero:[L('Cocinero'),L('Asa la carne cruda del depósito y hace que la gente coma menos.')],
  carronero:[L('Carroñero'),L('Sale a revolver casas abandonadas y trae materiales.')],
  almacenero:[L('Almacenero'),L('Atiende el mostrador y vende mientras vos estás afuera.')],
}[k]}
const NAMES28=['Anselmo','Berta','Clara','Dante','Estela','Fausto','Gladys','Horacio','Irma','Jorge','Rubén','Marta','Chela','Osvaldo','Nelly','Tito','Graciela','Beto','Rosa','Hugo','Mirta','Cacho','Silvia','Ramiro','Lucía','Pocho','Norma','Lalo','Inés','Ernesto','Delia','Quique','Teresa','Fermín','Alicia','Mingo','Elsa','Julián','Coca','Ricardo'];
const CAP0_28=2,TENT_MAX28=6,TENT_COST28={tela:4,madera:4,cuerda:2};
const TENTS28=[[9,8.5],[15,8.5],[9,15.5],[15,15.5],[19.2,12],[12,19.6]],FIRE28=[12,12];
const NEED28={food:30,drink:35};

function crew28(){if(!S.crew28)S.crew28={list:[],cand:[],tents:0,rat:1,rd:0,nid:1,log:[],breach:false};return S.crew28}
const cap28=()=>CAP0_28+2*crew28().tents+(typeof capExtra37==='function'?capExtra37():0);
const hostile28=e=>!e.dead&&!e.dying&&!(EDEF[e.type].neutral&&!e.angry)&&!e.tame;

// ---------- Comer y tomar del depósito ----------
function eatable28(kind){return Object.keys(ITEMS).filter(k=>k!=='podrida'&&!(k in TOXIC28)&&(ITEMS[k][kind]||0)>0&&(S.stash[k]||0)>0)
  .sort((a,b)=>ITEMS[a].v/ITEMS[a][kind]-ITEMS[b].v/ITEMS[b][kind])}
const TOXIC28={carne:1};// la carne cruda no se come: la asa el cocinero
function consume28(kind,need){let got=0;const used={};for(const k of eatable28(kind)){while(got<need&&(S.stash[k]||0)>0){S.stash[k]--;got+=ITEMS[k][kind];used[k]=(used[k]||0)+1}if(got>=need)break}
  return{f:Math.min(1,need>0?got/need:1),used}}
function stockDays28(kind){const C=crew28();if(!C.list.length)return Infinity;const per=C.list.length*NEED28[kind]*C.rat*(kind==='food'&&C.list.some(w=>w.job==='cocinero')?.75:1);
  let tot=0;for(const k of Object.keys(ITEMS))if(k!=='podrida'&&!(k in TOXIC28))tot+=(ITEMS[k][kind]||0)*(S.stash[k]||0);return tot/per}

// ---------- La mañana: comen, producen y deciden si se quedan ----------
function give28(out,k,q){q=Math.max(0,Math.floor(q));if(!q||!ITEMS[k])return;S.stash[k]=(S.stash[k]||0)+q;out[k]=(out[k]||0)+q}
function produce28(w,out){const m=.5+w.mor/100,r=()=>R();
  switch(w.job){
    case 'granjero':{const F=S.farm26;if(F)for(const p of F.p)if(p.k)p.w=S.day;try{crops26Refresh()}catch(e){}give28(out,['zanahoria','tomate','choclo'][r()*3|0],2*m+r());break}
    case 'cazador':give28(out,'carne',2*m+r());if(r()<.5*m)give28(out,'cuero',1);break;
    case 'aguatero':give28(out,'agua',4*m+r());break;
    case 'enfermero':give28(out,'venda',1*m+r());if(r()<.4*m)give28(out,'desinfectante',1);if(r()<.25*m)give28(out,'analgesicos',1);break;
    case 'mecanico':give28(out,'chatarra',2*m+r());if(r()<.4*m)give28(out,'combustible',1);break;
    case 'carpintero':{give28(out,'tablas',2*m+r());give28(out,'clavos',3*m+r());let n=0;
      for(const b of builds){const d=BUILDS[b.t];if(!d||!d.hp||Math.hypot(b.x,b.z)>60)continue;const mx=Math.round(d.hp*(1+.1*skLv('carpinteria')));if(b.hp<mx){b.hp=Math.min(mx,b.hp+160*m);n++}}
      if(n)w.fix=n;break}
    case 'cocinero':{const q=Math.min(S.stash.carne||0,Math.floor(3*m+r()));if(q>0){S.stash.carne-=q;give28(out,'asada',q)}break}
    case 'carronero':{const T=['chatarra','tela','cinta','pilas','cuerda','clavos','lata','madera','encendedor'];const n=Math.floor(2*m+r()*2);for(let i=0;i<n;i++)give28(out,T[r()*T.length|0],1);break}
  }}
function crewDay28(){const C=crew28();if(C.day===S.day)return;C.day=S.day;
  // los que esperaban en el portón se cansan
  const gone=C.cand.filter(c=>c.until<S.day);C.cand=C.cand.filter(c=>c.until>=S.day);
  if(!C.list.length){C.breach=false;C.dead=0;return}
  const cook=C.list.some(w=>w.job==='cocinero'),n=C.list.length;
  const food=consume28('food',n*NEED28.food*C.rat*(cook?.75:1)),drink=consume28('drink',n*NEED28.drink*C.rat);
  const out={},msgs=[];let left=[];
  for(const w of C.list){let d=0;
    d+=food.f>=.99?(C.rat>1?7:C.rat<1?-4:3):-14*(1-food.f)-3;
    d+=drink.f>=.99?(C.rat>1?5:C.rat<1?-4:3):-16*(1-drink.f)-3;
    d+=C.breach?-8:3;if(C.dead)d-=12*C.dead;
    w.mor=clamp(Math.round(w.mor+d),0,100);w.hp=food.f>.5&&drink.f>.5?100:Math.min(100,w.hp+30);
    if(w.mor<10){left.push(w);continue}if(w.mor<25)(C.warn28=C.warn28||[]).push(w.name);
    const before=JSON.stringify(out);w.fix=0;produce28(w,out);w.last=before===JSON.stringify(out)?null:diff28(JSON.parse(before),out)}
  if(C.warn28&&C.warn28.length){msgs.push(L('Están por irse: {n}.',{n:C.warn28.join(', ')}));C.warn28=[]}
  if(left.length){C.list=C.list.filter(w=>!left.includes(w));for(const w of left)msgs.push(L('{n} se fue: no aguantó más.',{n:w.name}))}
  if(food.f<.99)msgs.push(L('No alcanzó la comida para tu gente.'));
  if(drink.f<.99)msgs.push(L('No alcanzó el agua para tu gente.'));
  if(C.breach)msgs.push(L('Anoche entraron bichos al patio: tu gente tiene miedo.'));
  const got=Object.entries(out).map(([k,q])=>nm(k)+' ×'+q).join(', ');
  C.log=[got?L('Tu gente aportó: {i}.',{i:got}):L('Hoy tu gente no aportó nada.'),...msgs];
  C.breach=false;C.dead=0;
  setTimeout(()=>{try{toast(C.log[0],'#c8b48a',8);for(const m of msgs)toast(m,'#cc4b30',8)}catch(e){}},2500)}
function diff28(a,b){const o={};for(const k of Object.keys(b)){const q=b[k]-(a[k]||0);if(q>0)o[k]=q}return Object.entries(o).map(([k,q])=>nm(k)+' ×'+q).join(', ')}

// ---------- Llegan al portón ----------
function arrive28(){const C=crew28();if(S.day<2||C.rd===S.day)return;const h=hourOf(S.t);if(h<9||h>17)return;C.rd=S.day;
  const first=!C.seen;const ch=first?1:.5+Math.min(.3,(S.rep||0)*.03)+(typeof arriveBonus37==='function'?arriveBonus37():0);if(C.cand.length>=(typeof candCap37==='function'?candCap37():2)||R()>ch)return;
  const have=new Set([...C.list,...C.cand].map(w=>w.job));let ks=Object.keys(JOBS28).filter(k=>!have.has(k));if(!ks.length)ks=Object.keys(JOBS28);
  if(first)ks=['aguatero','granjero','carpintero','cazador'];
  const used=new Set([...C.list,...C.cand].map(w=>w.name));const names=NAMES28.filter(n=>!used.has(n));
  const c={id:C.nid++,name:names[R()*names.length|0]||NAMES28[0],job:ks[R()*ks.length|0],until:S.day+2,mor:55+(R()*15|0),hp:100,skin:R()*4|0};
  C.cand.push(c);C.seen=1;sfx('knock');
  toast(L('Llegó alguien al portón buscando refugio: {n}, {j}. Hablale o mirá la pestaña Gente del almacén.',{n:c.name,j:job28(c.job)[0]}),'#e3a33b',10)}
function hire28(id){const C=crew28();const c=C.cand.find(x=>x.id===id);if(!c)return L('Ya no está.');if(C.list.length>=cap28())return L('No hay lugar para dormir: armá una carpa.');
  C.cand=C.cand.filter(x=>x!==c);delete c.until;delete c.cand;c.day=S.day;C.list.push(c);sfx('goal');buildTents28();return L('{n} se queda en el almacén.',{n:c.name})}
function fire28(id){const C=crew28();const w=C.list.find(x=>x.id===id);if(!w)return'';C.list=C.list.filter(x=>x!==w);for(const o of C.list)o.mor=Math.max(0,o.mor-5);return L('{n} juntó sus cosas y se fue.',{n:w.name})}
function tent28(){const C=crew28();if(C.tents>=TENT_MAX28)return L('No entran más carpas en el patio.');
  for(const [k,q] of Object.entries(TENT_COST28))if((S.stash[k]||0)<q)return L('Faltan materiales en el depósito.');
  for(const [k,q] of Object.entries(TENT_COST28))S.stash[k]-=q;C.tents++;buildTents28();sfx('crate');return L('Armaste una carpa: dos lugares más para dormir.')}

// ---------- En el mundo: carpas y personas ----------
let tents28=null,crewG28=new Map();
function tentMesh28(x,z){const y=groundY(x,z);let g;
  if(typeof P20!=='undefined'&&P20.ready&&P20.geo.Tent){g=new THREE.Mesh(unitH20('Tent'),mats20&&mats20.std||new THREE.MeshLambertMaterial({vertexColors:true}));g.scale.setScalar(1.9);g.position.set(x,y,z);g.rotation.y=Math.atan2(FIRE28[0]-x,FIRE28[1]-z);g.castShadow=true;g.receiveShadow=true}
  else{g=new THREE.Group();g.position.set(x,y,z);const a=bx(2.4,.06,1.6,'#6a7a4a',0,.7,.5,g);a.rotation.x=.9;const b=bx(2.4,.06,1.6,'#5a6a3a',0,.7,-.5,g);b.rotation.x=-.9}
  return g}
function buildTents28(){if(!world||!S)return;if(tents28){for(const t of tents28.ms)t.parent&&t.parent.remove(t);for(const b of tents28.bs)b.dead=true}
  tents28={ms:[],bs:[],p20:typeof P20!=='undefined'&&P20.ready};const C=crew28();
  for(let i=0;i<C.tents&&i<TENTS28.length;i++){const [x,z]=TENTS28[i];const g=tentMesh28(x,z);world.add(g);tents28.ms.push(g);tents28.bs.push(addAABB({x0:x-1,x1:x+1,z0:z-1,z1:z+1,y0:groundY(x,z)-1,y1:groundY(x,z)+1.6,kind:'solid'}))}
  if(C.tents||C.list.length){const [x,z]=FIRE28;let f;if(typeof P20!=='undefined'&&P20.ready&&P20.geo.Bonfire){f=new THREE.Mesh(unitH20('Bonfire'),mats20&&mats20.std||new THREE.MeshLambertMaterial({vertexColors:true}));f.scale.setScalar(.6)}
    else{f=new THREE.Group();for(let i=0;i<5;i++){const l=bx(.1,.9,.1,'#5a3a22',0,.15,0,f,CYL);l.rotation.set(1.2,i*1.26,0)}}
    f.position.set(x,groundY(x,z),z);world.add(f);tents28.ms.push(f)}}
const SKINS28=['#c9a888','#a8805e','#e0b898','#8a6040'];
function personMesh28(w){const j=JOBS28[w.job];let g=typeof glbHuman24==='function'?glbHuman24(j.col,SKINS28[w.skin||0],'#2f3a48'):null;
  if(!g){g=new THREE.Group();bx(.5,.9,.3,j.col,0,1.2,0,g);bx(.3,.3,.3,SKINS28[w.skin||0],0,1.85,0,g);bx(.4,.75,.25,'#2f3a48',0,.38,0,g)}
  scene.add(g);return g}
function home28(w,i){const C=crew28(),h=hourOf(S.t),night=h>=19.5||h<6.5,J=JOBS28[w.job];
  if(w.cand)return{x:2+(i%8)*1.4,z:19.2+(i>>3)*1.4};
  const tw=typeof tower37==='function'?tower37(w):null;if(tw)return tw;
  if(J.away&&!night&&h>=8&&h<18)return null;
  if(night&&w.job!=='guardia'){if(i<CAP0_28)return{x:-2.5+i*1.6,z:-13.4};const sx=typeof sleep37==='function'?sleep37(i):null;if(sx)return sx;const t=TENTS28[(i-CAP0_28)>>1]||FIRE28;const s=(i-CAP0_28)&1?1:-1;return{x:t[0]+s*1.3,z:t[1]+(t[1]<FIRE28[1]?1.4:-1.4)}}
  const same=C.list.filter(o=>o.job===w.job),k=same.indexOf(w);return{x:J.spot[0]+k*1.3,z:J.spot[1]+k*.4}}
function threat28(x,z,r){for(const e of enemies)if(hostile28(e)&&Math.abs(e.x-x)<r&&Math.abs(e.z-z)<r&&Math.hypot(e.x-x,e.z-z)<r)return e;return null}
let crewT28=0,guardT28=0,hourT28=-1;
function crewTick28(dt){const C=crew28();
  const all=[...C.list.map((w,i)=>({w,i})),...C.cand.map((w,i)=>({w:Object.assign(w,{cand:1}),i}))];C.list.forEach(w=>delete w.cand);
  const keep=new Set();
  for(const {w,i} of all){let tgt=home28(w,i);let o=crewG28.get(w.id);
    if(!tgt){if(o){o.g.visible=false;o.away=true}continue}
    if(!o){const g=personMesh28(w);o={g,x:tgt.x,z:tgt.z};if(w.cand){o.x=1;o.z=24}crewG28.set(w.id,o)}
    keep.add(w.id);if(o.away){o.away=false;o.x=0;o.z=21}o.g.visible=true;
    // si hay bichos cerca y no es guardia, corre a meterse en el almacén
    const night=isNight();if(!w.cand&&w.job!=='guardia'&&threat28(o.x,o.z,13))o.fl=10;if(o.fl>0){o.fl-=dt;tgt={x:-1+(i%3),z:-13}}
    // entrar y salir del almacén por la puerta (x entre -1,2 y 1,2 en z=-8)
    const inO=o.z<-8&&Math.abs(o.x)<6.5,inT=tgt.z<-8&&Math.abs(tgt.x)<6.5;
    if(inT&&!inO&&o.z>-7.4)tgt={x:0,z:-7.6,run:tgt.z===-13};else if(inO&&!inT&&o.z<-8.8)tgt={x:0,z:-8.6};
    const dx=tgt.x-o.x,dz=tgt.z-o.z,d=Math.hypot(dx,dz),run=(tgt.z===-13||tgt.run)&&!w.cand,sp=run?4:1.4;
    if(d>.15){const s=Math.min(d,sp*dt);o.x+=dx/d*s;o.z+=dz/d*s;o.g.rotation.y=Math.atan2(dx,dz)}
    else{const f=w.job==='guardia'?{x:0,z:40}:{x:FIRE28[0],z:FIRE28[1]};if(!(night&&o.z<-8)&&w.job!=='almacenero')o.g.rotation.y+=(Math.atan2(f.x-o.x,f.z-o.z)-o.g.rotation.y)*Math.min(1,dt*2)}
    o.g.position.set(o.x,groundY(o.x,o.z),o.z);o.moving=d>.15;
    const u=o.g.userData;if(u&&u.mixer){play15(u,d>.15?(run?'run':'walk'):'idle',.25,1);u.mixer.update(dt)}}
  for(const [id,o] of crewG28)if(!keep.has(id)&&!o.away){scene.remove(o.g);crewG28.delete(id)}else if(!keep.has(id)&&o.away&&!C.list.some(w=>w.id===id)){scene.remove(o.g);crewG28.delete(id)}
  // de noche: ¿se metieron al patio? ¿lastiman a alguien?
  crewT28-=dt;if(crewT28<=0){crewT28=.5;
    if(C.list.length&&isNight()&&threat28(0,0,21))C.breach=true;
    for(const w of [...C.list]){const o=crewG28.get(w.id);if(!o||!o.g.visible)continue;let n=0;for(const e of enemies)if(hostile28(e)&&Math.abs(e.x-o.x)<1.9&&Math.abs(e.z-o.z)<1.9)n++;
      if(n){w.hp-=9*n;burst(o.x,groundY(o.x,o.z)+1.2,o.z,'#8a2f24',4,2);if(w.hp<=0){C.list=C.list.filter(x=>x!==w);C.dead=(C.dead||0)+1;scene.remove(o.g);crewG28.delete(w.id);sfx('hurt');toast(L('Los bichos mataron a {n}.',{n:w.name}),'#cc4b30',8)}}}}
  // guardias
  guardT28-=dt;if(guardT28<=0){guardT28=1.1;for(const w of C.list){if(w.job!=='guardia')continue;const o=crewG28.get(w.id);if(!o||!o.g.visible)continue;
    let best=null,bd=32;for(const e of enemies){if(!hostile28(e))continue;const d=Math.hypot(e.x-o.x,e.z-o.z);if(d<bd){bd=d;best=e}}
    if(best&&(isNight()||bd<20)){o.g.rotation.y=Math.atan2(best.x-o.x,best.z-o.z);sfx('pistola',o.x,o.z);burst(o.x+Math.sin(o.g.rotation.y)*.6,groundY(o.x,o.z)+1.4,o.z+Math.cos(o.g.rotation.y)*.6,'#ffcf6a',4,1.5);
      hurtEnemy(best,(18+R()*14)*(.6+w.mor/250),false,'t',L('Guardia'))}}}
  // el almacenero vende mientras no estás
  const hh=Math.floor(hourOf(S.t));if(hh!==hourT28){const prev=hourT28;hourT28=hh;if(prev>=0&&hh>=8&&hh<=19&&Math.hypot(P.x,P.z)>40)
    for(const w of C.list)if(w.job==='almacenero'&&R()<.45+w.mor/250)try{customerBuy(null)}catch(e){}}}
function clear28(){for(const o of crewG28.values())scene.remove(o.g);crewG28.clear();tents28=null}

// ---------- Hablar con ellos ----------
function mood28(w){return w.mor>=70?L('Contento'):w.mor>=45?L('Tranquilo'):w.mor>=25?L('Preocupado'):L('A punto de irse')}
function say28(w){const C=crew28();if(stockDays28('food')<1)return L('No queda casi comida en el depósito.');if(stockDays28('drink')<1)return L('El agua se está terminando.');
  if(w.mor<25)return L('Así no se puede vivir. Si sigue así me voy.');if(C.breach)return L('Anoche escuché a los bichos en el patio...');return w.mor>=70?L('Acá estamos bien. Gracias por el techo.'):L('Se aguanta. Hacemos lo que podemos.')}
function crewInteract28(){if(P.inTruck)return null;const C=crew28();let best=null,bd=2.2;
  for(const [id,o] of crewG28){if(!o.g.visible)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<bd){bd=d;best={id,o}}}
  if(!best)return null;const w=C.list.find(x=>x.id===best.id),c=C.cand.find(x=>x.id===best.id);
  if(c)return{label:L('E · Hablar con {n}',{n:c.name}),sub:L('{j} · busca refugio',{j:job28(c.job)[0]}),act:()=>openPanel('gente')};
  if(!w)return null;const J=job28(w.job);
  if(w.job==='enfermero'&&w.heal!==S.day&&S.hp<maxHp()-5)return{label:L('E · {n}: curarte',{n:w.name}),sub:J[0]+' · '+mood28(w),act:()=>{w.heal=S.day;S.hp=Math.min(maxHp(),S.hp+40);
    for(const x of S.wounds||[])x.band=true;sfx('pickup');toast(L('{n} te curó y te vendó las heridas.',{n:w.name}),'#8fbb62',5)}};
  return{label:L('E · Hablar con {n}',{n:w.name}),sub:J[0]+' · '+mood28(w)+' · '+L('Ánimo {n}%',{n:w.mor}),act:()=>toast(w.name+': '+say28(w),'#c8b48a',6)}}

// ---------- Pestaña Gente ----------
function tabGente28(){const C=crew28(),cap=cap28();
  const days=k=>{const d=stockDays28(k);return d===Infinity?'—':d<1?L('menos de un día'):L('{n} días',{n:Math.floor(d)})};
  const cost=Object.entries(TENT_COST28).map(([k,q])=>`${nm(k)} ${S.stash[k]||0}/${q}`).join(' · ');
  const canTent=C.tents<TENT_MAX28&&Object.entries(TENT_COST28).every(([k,q])=>(S.stash[k]||0)>=q);
  const rat=[[.5,L('Media ración')],[1,L('Ración normal')],[1.5,L('Ración generosa')]].map(([v,n])=>btn(n,'g28rat',`data-v="${v}" ${C.rat===v?'disabled':''}`)).join('');
  let h=`<div class="banner">${esc(L('Llega gente al portón buscando refugio. Cada uno aporta según su oficio a cambio de un lugar para dormir, comida, agua y protección. Cada mañana comen y toman del depósito.'))}</div>`;
  h+=`<p class="note">${esc(L('Lugares para dormir: {a} de {b}',{a:C.list.length,b:cap}))} · ${esc(L('Comida para {n}',{n:days('food')}))} · ${esc(L('Agua para {n}',{n:days('drink')}))}</p>`;
  h+=`<div class="acts">${btn(L('Armar carpa (+2 lugares)'),'g28tent',canTent?'':'disabled')}${rat}</div><p class="note">${esc(L('Carpa'))}: ${esc(cost)} · ${C.tents}/${TENT_MAX28}</p>`;
  if(C.log&&C.log.length)h+=`<p class="note">${C.log.map(esc).join('<br>')}</p>`;
  h+=`<h4>${esc(L('Esperando en el portón'))}</h4><div class="rows">`+(C.cand.length?C.cand.map(c=>{const J=job28(c.job);
    return row(`<div><strong>${esc(c.name)}</strong> <span class="chance">· ${esc(J[0])}</span><br><span class="chance">${esc(J[1])}</span><br><span class="chance">${esc(L('Se va si no le contestás antes del día {d}.',{d:c.until+1}))}</span></div><div class="acts">${btn(L('Recibir'),'g28hire',`data-id="${c.id}" ${C.list.length>=cap?'disabled':''}`)}${btn(L('Rechazar'),'g28no',`data-id="${c.id}"`)}</div>`)}).join('')
    :row(`<div>${esc(L('Nadie por ahora. Con mejor reputación llega más gente.'))}</div>`))+'</div>';
  h+=`<h4>${esc(L('Tu gente'))}</h4><div class="rows">`+(C.list.length?C.list.map(w=>{const J=job28(w.job);
    return row(`<div><strong>${esc(w.name)}</strong> <span class="chance">· ${esc(J[0])} · ${esc(mood28(w))} (${w.mor}%) · ${esc(L('Salud {n}%',{n:Math.max(0,Math.round(w.hp))}))}</span><br><span class="chance">${esc(J[1])}</span>${w.last?`<br><span class="chance">${esc(L('Ayer: {i}',{i:w.last}))}</span>`:''}${w.fix?`<br><span class="chance">${esc(L('Reparó {n} defensas.',{n:w.fix}))}</span>`:''}</div><div class="acts">${btn(L('Despedir'),'g28fire',`data-id="${w.id}"`)}</div>`)}).join('')
    :row(`<div>${esc(L('Todavía no recibiste a nadie.'))}</div>`))+'</div>';
  h+=`<p class="note">${esc(L('El ánimo sube con comida, agua y noches tranquilas. Baja si falta algo, si los bichos entran al patio o si muere alguien. Con el ánimo muy bajo se van. Con buen ánimo rinden más.'))}</p>`;
  return h}
const _renderPanel28=renderPanel;
renderPanel=function(){if(tab!=='gente')return _renderPanel28();tab='mejoras';_renderPanel28();tab='gente';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab==='gente'));
  $('pbody').innerHTML=(panelMsg?`<div class="banner">${esc(panelMsg)}</div>`:'')+tabGente28()};
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a^="g28"]');if(!b||b.disabled||!S)return;const a=b.dataset.a,id=+b.dataset.id,C=crew28();panelMsg='';
  if(a==='g28hire')panelMsg=hire28(id);
  if(a==='g28no'){C.cand=C.cand.filter(x=>x.id!==id)}
  if(a==='g28fire')panelMsg=fire28(id);
  if(a==='g28tent')panelMsg=tent28();
  if(a==='g28rat')C.rat=+b.dataset.v;
  renderPanel()});

// ---------- Enganches ----------
const _newDay28=newDay;newDay=function(){_newDay28.apply(this,arguments);try{crewDay28()}catch(e){console.error('crew28 day',e)}};
const _findInteract28=findInteract;findInteract=function(){try{const a=crewInteract28();if(a)return a}catch(e){console.error('crew28',e)}return _findInteract28()};
const _update28=update;update=function(dt){_update28(dt);try{if(gstate==='play'&&S){arrive28();if(!tents28||tents28.p20!==(typeof P20!=='undefined'&&P20.ready))buildTents28();crewTick28(dt)}}catch(e){console.error('crew28',e)}};
const _genWorld28=genWorld;genWorld=function(seed){clear28();return _genWorld28.apply(this,arguments)};
const _startGame28=startGame;startGame=function(st){clear28();const r=_startGame28.apply(this,arguments);try{if(S){const C=crew28();if(C.day==null)C.day=S.day}}catch(e){}return r};
const _compassExtras28=compassExtras;compassExtras=function(mark){_compassExtras28(mark);try{const C=S&&S.crew28;if(C&&C.cand.length&&Math.hypot(P.x,P.z)>25)mark(2,19,'#e3a33b',L('Portón')+' · '+C.cand.length)}catch(e){}};
