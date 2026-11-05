'use strict';
/* v0.26: vida en el almacén.
   - Perro: desde el día 2 un perro flaco ronda la entrada del almacén. Si le das de comer se queda.
     Te sigue, muerde a lo que te ataca, ladra cuando se acerca algo y olfatea los muebles que tienen
     algo bueno. E cerca de él: que te siga o que cuide el almacén. Si lo lastiman mucho vuelve al almacén
     y al otro día está bien.
   - Huerta: seis canteros en el patio. Plantás semillas, regás con agua (la lluvia también riega) y en
     unos días cosechás zanahorias, tomates, choclos y zapallos para comer o vender.
   Modelos CC0 de Quaternius (tools/models/life). */

// ---------- Ítems nuevos ----------
Object.assign(ITEMS,{
  sem_zanahoria:{n:'Semillas de zanahoria',v:5,w:.05,c:'#d88a3a',cat:'mat'},
  sem_tomate:{n:'Semillas de tomate',v:6,w:.05,c:'#c8402a',cat:'mat'},
  sem_maiz:{n:'Semillas de maíz',v:6,w:.05,c:'#e0c040',cat:'mat'},
  sem_zapallo:{n:'Semillas de zapallo',v:8,w:.05,c:'#d8782a',cat:'mat'},
  zanahoria:{n:'Zanahoria',v:4,w:.2,c:'#e07a2a',cat:'food',food:10,drink:3,rot:6},
  tomate:{n:'Tomate',v:5,w:.25,c:'#d0402a',cat:'food',food:8,drink:8,rot:4},
  choclo:{n:'Choclo',v:6,w:.4,c:'#e8c848',cat:'food',food:16,rot:5},
  zapallo:{n:'Zapallo',v:14,w:2.5,c:'#d8782a',cat:'food',food:34,rot:12},
});
for(const k of ['sem_zanahoria','sem_tomate','sem_maiz','sem_zapallo','zanahoria','tomate','choclo','zapallo'])if(!IK.includes(k))IK.push(k);
function names26life(){return [L('Semillas de zanahoria'),L('Semillas de tomate'),L('Semillas de maíz'),L('Semillas de zapallo'),L('Zanahoria'),L('Tomate'),L('Choclo'),L('Zapallo')]}
// semillas en el botín
(function(){const put=(c,row)=>{if(CONT[c])CONT[c].loot.push(row)};
  put('ferreteria',['sem_zanahoria',.3,2,4]);put('ferreteria',['sem_maiz',.2,2,3]);put('ferreteria',['sem_zapallo',.12,1,2]);
  put('alacena',['sem_tomate',.08,1,3]);put('herramientas',['sem_zanahoria',.15,1,3]);put('caja',['sem_maiz',.08,1,3]);put('baul',['sem_zapallo',.05,1,2]);
  if(typeof NPC6!=='undefined'&&NPC6.benito)NPC6.benito.sell.push(['sem_zanahoria',6],['sem_tomate',7],['sem_maiz',7],['sem_zapallo',10]);})();
// íconos
Object.assign(SPR7,{
  carrot:(g,c)=>{g.l(4,12,11,5,c,3).l(5,12,11,6,c,2).r(11,2,1,4,'#4f9a3a').r(12,3,2,1,'#4f9a3a').r(10,3,1,2,'#3a7a2a').p(6,10,tn7(c,-.3)).p(8,8,tn7(c,-.3))},
  tomato:(g,c)=>{g.o(8,9,5,4.5,c).r(7,4,3,1,'#3a7a2a').p(8,3,'#3a7a2a').p(6,7,tn7(c,.45)).p(6,8,tn7(c,.45))},
  corn:(g,c)=>{g.o(8,8,2.8,5.5,c).l(4,13,7,4,'#6aa04a',2).l(12,13,9,4,'#5a9a3a',2);for(let y=4;y<13;y+=2)g.p(7,y,tn7(c,-.25)).p(9,y+1,tn7(c,-.25))},
  pumpkin:(g,c)=>{g.o(8,9,5.5,4.5,c).l(8,5,8,13,tn7(c,-.3)).l(5,6,5,12,tn7(c,-.2)).l(11,6,11,12,tn7(c,-.2)).r(8,3,1,2,'#4a6a2a')},
  seeds:(g,c)=>{g.r(4,3,8,10,'#d8c8a0').r(4,3,8,1,'#b8a880').o(8,8,2.4,2.4,c).p(5,11,'#6a5a3a').p(7,12,'#6a5a3a').p(10,11,'#6a5a3a')},
});
Object.assign(IMAP7,{sem_zanahoria:['seeds'],sem_tomate:['seeds'],sem_maiz:['seeds'],sem_zapallo:['seeds'],zanahoria:['carrot'],tomate:['tomato'],choclo:['corn'],zapallo:['pumpkin']});

// ---------- Modelos ----------
const L26={ready:false,dog:null,crops:{}};
(function(){try{const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB26);let n=0;const done=()=>{if(++n>=ks.length){L26.ready=true;try{if(world)crops26Refresh(true)}catch(e){}}};
  ks.forEach(k=>ld.parse(b64(GLB26[k]),'',gl=>{try{
    if(k==='Husky'){gl.scene.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(gl.scene),s=bb.getSize(new THREE.Vector3());
      L26.dog={scene:gl.scene,anims:gl.animations,scale:1.05/Math.max(s.x,s.z,1e-3),lift:-bb.min.y}}
    else{const m=/^(\w+)_(\d)$/.exec(k);if(m){gl.scene.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(gl.scene),s=bb.getSize(new THREE.Vector3());
      gl.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
      (L26.crops[m[1]]||(L26.crops[m[1]]={}))[m[2]]={scene:gl.scene,size:s,min:bb.min}}}}catch(e){console.error('glb26',k,e)}done()},err=>{console.error('glb26',k,err);done()}))}catch(e){console.error('glb26',e)}})();

// ================= HUERTA =================
const CROP26={zanahoria:{seed:'sem_zanahoria',days:2,m:'Carrot',yield:[3,5]},tomate:{seed:'sem_tomate',days:3,m:'Tomato',yield:[3,6]},
  choclo:{seed:'sem_maiz',days:3,m:'Corn',yield:[2,4]},zapallo:{seed:'sem_zapallo',days:4,m:'Pumpkin',yield:[1,3]}};
const PLOTS26=[[-17.6,7.4],[-14.6,7.4],[-11.6,7.4],[-17.6,10.6],[-14.6,10.6],[-11.6,10.6]];
const YARD26=2;
let plots26=[];
function farm26(){if(!S.farm26)S.farm26={p:PLOTS26.map(()=>({k:null,g:0,w:-1})),day:S.day};return S.farm26}
function buildPlots26(){plots26=[];for(const [x,z] of PLOTS26){const g=grp(x,YARD26,z,world);
    const soil=bx(2.3,.22,2.3,'#4a3626',0,.11,0,g);soil.receiveShadow=true;
    for(const [a,b,w,d] of [[0,-1.2,2.5,.14],[0,1.2,2.5,.14],[-1.2,0,.14,2.3],[1.2,0,.14,2.3]])bx(w,.3,d,'#6a5236',a,.15,b,g);
    const rows=[];for(let i=-1;i<=1;i++){const r=bx(2,.08,.32,'#3e2c1e',0,.24,i*.65,g);rows.push(r)}
    plots26.push({x,z,g,soil,rows,plant:null,key:''})}
  crops26Refresh(true)}
function plotStage26(p){const c=CROP26[p.k];if(!c)return 0;return p.g>=c.days?4:1+Math.min(2,Math.floor(p.g/c.days*3))}
function crops26Refresh(force){if(!plots26.length||!S)return;const F=farm26();
  plots26.forEach((v,i)=>{const p=F.p[i];const st=plotStage26(p),key=p.k?p.k+st:'';const wet=p.k&&p.w>=S.day;
    v.soil.material=mat(wet?'#33251a':'#4a3626');v.rows.forEach(r=>r.material=mat(wet?'#2a1e14':'#3e2c1e'));
    if(!force&&key===v.key)return;v.key=key;if(v.plant){v.g.remove(v.plant);v.plant=null}if(!p.k)return;
    const c=CROP26[p.k],tpl=L26.crops[c.m]&&L26.crops[c.m][st];const g=new THREE.Group();
    if(tpl){const target=p.k==='choclo'?[.5,.9,1.6,2.2][st-1]:p.k==='zapallo'?[.35,.6,.8,1][st-1]:p.k==='tomate'?[.35,.55,.8,1.05][st-1]:[.3,.45,.6,.75][st-1];const sc=target/Math.max(tpl.size.y,1e-3);
      for(let r=-1;r<=1;r++)for(let q=-1;q<=1;q+=(p.k==='zapallo'?2:1)){const m=tpl.scene.clone(true);m.scale.setScalar(sc);m.position.set(q*.62+(r%2?.08:0),.26-tpl.min.y*sc,r*.65);m.rotation.y=(r*3+q)*1.3;g.add(m)}}
    else{for(let r=-1;r<=1;r++)bx(.2,.1+st*.12,.2,st===4?(ITEMS[p.k].c):'#4f9a3a',0,.3+st*.06,r*.65,g)}
    v.g.add(g);v.plant=g})}
function farmDay26(){const F=farm26();if(F.day===S.day)return;
  const ss=season(),rate=ss==='invierno'?.5:ss==='verano'?1.15:1;
  for(let d=F.day;d<S.day;d++)for(const p of F.p){if(!p.k)continue;const c=CROP26[p.k];if(p.w>=d)p.g=Math.min(c.days,p.g+rate)}
  F.day=S.day;crops26Refresh()}
const seedOrder26=['sem_zapallo','sem_tomate','sem_maiz','sem_zanahoria'];
const cropOfSeed26=s=>Object.keys(CROP26).find(k=>CROP26[k].seed===s);
function farmInteract26(){if(P.inTruck||!plots26.length)return null;const F=farm26();let best=-1,bd=1.9;
  plots26.forEach((v,i)=>{const d=Math.hypot(v.x-P.x,v.z-P.z);if(d<bd){bd=d;best=i}});if(best<0)return null;
  const p=F.p[best],v=plots26[best],sub=L('Huerta');
  if(!p.k){const s=seedOrder26.find(k=>(S.inv[k]||0)>0);
    if(!s)return{label:L('Huerta: necesitás semillas'),sub:L('Se encuentran en ferreterías y las vende Don Benito.'),act:()=>{}};
    return{label:L('Mantené E · Plantar {s}',{s:nm(s)}),sub,hold:.9,key:'plant26'+best,type:'cook',act:()=>{S.inv[s]--;p.k=cropOfSeed26(s);p.g=0;p.w=-1;sfx('build');crops26Refresh();toast(L('Plantaste {s}. Acordate de regar todos los días.',{s:nm(p.k)}),'#8fbb62',4)}}}
  const c=CROP26[p.k];
  if(p.g>=c.days)return{label:L('Mantené E · Cosechar {s}',{s:nm(p.k)}),sub,hold:1.2,key:'harv26'+best,type:'cook',act:()=>{
    const q=c.yield[0]+Math.floor(Math.random()*(c.yield[1]-c.yield[0]+1));give6(p.k,q);let msg=L('Cosechaste {s} ×{q}',{s:nm(p.k),q});
    if(Math.random()<.75){const n=1+(Math.random()<.4?1:0);give6(c.seed,n);msg+=' · '+nm(c.seed)+' ×'+n}
    p.k=null;p.g=0;gainXp(6);sfx('pickup');crops26Refresh();toast(msg,'#8fbb62',4)}};
  const left=Math.max(1,Math.ceil(c.days-p.g)),wet=p.w>=S.day;
  if(!wet&&(S.inv.agua||0)>0)return{label:L('E · Regar {s} (1 agua)',{s:nm(p.k)}),sub:L('Cosecha en {n} días si la regás todos los días',{n:left}),act:()=>{S.inv.agua--;p.w=S.day;sfx('eat');crops26Refresh()}};
  return{label:nm(p.k)+' · '+(wet?L('regada hoy'):L('sin regar: necesitás agua')),sub:L('Cosecha en {n} días si la regás todos los días',{n:left}),act:()=>{}}}

// ================= PERRO =================
let dog26=null;// {g,mixer,acts,cur,x,z,yaw,target,atk,hurtT,sniff,...}
function dogS26(){if(!S.dog26)S.dog26={st:'none',mode:'follow',hp:90,name:'Pampa'};return S.dog26}
const DOG_SPOT26={x:4,z:29};
function dogMesh26(){const T=L26.dog;let g=new THREE.Group(),u={};
  if(T){const inner=THREE.SkeletonUtils.clone(T.scene);inner.scale.setScalar(T.scale);inner.position.y=T.lift*T.scale;
    inner.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(o.material){const n=o.material.name;o.material=o.material.clone();o.material.emissive&&o.material.emissive.set(0);if(n==='Material')o.material.color.set('#7a5434');else if(n==='Material.001')o.material.color.set('#d8c4a0')}}});
    g.add(inner);const mixer=new THREE.AnimationMixer(inner),acts={};for(const c of T.anims){const nm2=c.name.split('|').pop();acts[nm2]=mixer.clipAction(c)}
    u={mixer,acts,cur:null};if(acts.Death){acts.Death.setLoop(THREE.LoopOnce);acts.Death.clampWhenFinished=true}}
  else{bx(.35,.35,.9,'#8a8a84',0,.55,0,g);bx(.3,.3,.35,'#8a8a84',0,.8,.55,g);for(const [a,b] of [[-.12,-.3],[.12,-.3],[-.12,.3],[.12,.3]])bx(.1,.4,.1,'#6a6a64',a,.2,b,g)}
  g.userData=u;return g}
function dogPlay26(name,fade){const u=dog26&&dog26.g.userData;if(!u||!u.acts||!u.acts[name]||u.cur===name)return;const a=u.acts[name];a.reset().fadeIn(fade||.2).play();if(u.cur&&u.acts[u.cur])u.acts[u.cur].fadeOut(fade||.2);u.cur=name}
function dogSpawn26(x,z){dogDespawn26();const g=dogMesh26();g.position.set(x,groundY(x,z),z);scene.add(g);dog26={g,x,z,yaw:0,target:null,atk:0,hurtT:0,bark:8,sniffT:6,sniff:null,lastModel:!!L26.dog};dogPlay26('Idle')}
function dogDespawn26(){if(dog26&&dog26.g.parent)dog26.g.parent.remove(dog26.g);dog26=null}
function dogSay26(t,c){toast(t,c||'#c8b48a',5)}
function bark26(){if(!AC||!dog26)return;const d=Math.hypot(dog26.x-P.x,dog26.z-P.z),v=Math.max(.15,1-d/80);
  for(let i=0;i<2;i++){tn(520,240,.09,'sawtooth',.22*v,i*.18);nz(.08,1400,.25*v,i*.18,'bandpass')}}
function dogHostile26(e){return !(e.dying||e.dead||e.stun>0||(EDEF[e.type]&&EDEF[e.type].neutral&&!e.angry))}
function dogTick26(dt){const D=dogS26();if(!S)return;
  // perro callejero: aparece de día desde el día 2
  if(D.st==='none'&&S.day>=2){D.st='stray';dogSay26(L('Un perro flaco ronda la entrada del almacén. Con algo de comida capaz que se queda.'))}
  if(D.st==='down'&&S.day>(D.downDay||0)){D.st='own';D.hp=90;D.mode='guard';dogSay26(L('{n} volvió al almacén, ya repuesto.',{n:D.name}),'#8fbb62')}
  const want=(D.st==='stray'&&!isNight())||D.st==='own';
  if(!want){if(dog26)dogDespawn26();return}
  if(!dog26){if(D.st==='stray')dogSpawn26(DOG_SPOT26.x,DOG_SPOT26.z);else if(D.mode==='guard')dogSpawn26(-3,4);else dogSpawn26(P.x+1.5,P.z+1.5)}
  if(L26.dog&&!dog26.lastModel){const x=dog26.x,z=dog26.z;dogSpawn26(x,z)}
  const g=dog26.g,u=g.userData;let tx=null,tz=null,speed=0,anim='Idle';
  if(D.st==='stray'){const t=time*.25;tx=DOG_SPOT26.x+Math.cos(t)*3;tz=DOG_SPOT26.z+Math.sin(t*1.3)*2;const d=Math.hypot(tx-dog26.x,tz-dog26.z);speed=d>.6?1.4:0;
    const pd=Math.hypot(P.x-dog26.x,P.z-dog26.z);if(pd<6){speed=0;dog26.yaw+=clamp(angDiff(dog26.yaw,Math.atan2(P.x-dog26.x,P.z-dog26.z)),-3*dt,3*dt);anim='Idle_2'}}
  else{
    const ride=P.inTruck&&D.mode==='follow';
    if(ride){g.visible=false;dog26.x=truck.x;dog26.z=truck.z;dog26.target=null;if(u.mixer)u.mixer.update(dt);return}
    if(!g.visible){g.visible=true;dog26.x=P.x+1.5;dog26.z=P.z+1.5}
    const home=D.mode==='guard'?{x:-3,z:4}:{x:P.x,z:P.z};
    if(dog26.target&&!dogHostile26(dog26.target))dog26.target=null;
    if(!dog26.target){let best=null,bd=D.mode==='guard'?30:18;for(const e of enemies){if(!dogHostile26(e))continue;const d=Math.hypot(e.x-home.x,e.z-home.z);if(d<bd){bd=d;best=e}}dog26.target=best}
    dog26.atk-=dt;
    if(dog26.target){const e=dog26.target;tx=e.x;tz=e.z;const d=Math.hypot(tx-dog26.x,tz-dog26.z);speed=9;anim='Gallop';
      if(d<(e.r||.5)+1.1){speed=0;anim='Attack';if(dog26.atk<=0){dog26.atk=.6;hurtEnemy(e,10*(1+(S.level-1)*.05),false,'pet')}
        dog26.hurtT-=dt;if(dog26.hurtT<=0){dog26.hurtT=1.2;const dm=(EDEF[e.type]?EDEF[e.type].dmg:10)*.45;D.hp-=dm;burst(dog26.x,groundY(dog26.x,dog26.z)+.6,dog26.z,'#8a2f24',3,1.5)}}}
    else{
      // olfato: busca muebles con algo bueno cerca tuyo
      dog26.sniffT-=dt;if(D.mode==='follow'&&dog26.sniffT<=0&&!dog26.sniff){dog26.sniffT=4;dog26.sniff=sniffFind26()}
      const sn=dog26.sniff;
      if(sn&&(sn.c.seen||Math.hypot(sn.c.x-P.x,sn.c.z-P.z)>35)){dog26.sniff=null}
      if(dog26.sniff){const c=dog26.sniff.c;tx=c.x;tz=c.z;const d=Math.hypot(tx-dog26.x,tz-dog26.z);speed=d>1.3?5:0;anim=speed?'Walk':'Eating';
        if(!dog26.sniff.said&&d<1.6){dog26.sniff.said=1;bark26();dogSay26(L('{n} olfatea algo en: {c}',{n:D.name,c:L(CONT[c.type].n)}))}}
      else{const d=Math.hypot(home.x-dog26.x,home.z-dog26.z);if(d>(D.mode==='guard'?3:3.2)){tx=home.x;tz=home.z;speed=d>12?9:4.5;anim=d>12?'Gallop':'Walk'}
        if(d>70){dog26.x=home.x+1.5;dog26.z=home.z+1.5}}}
    if(!dog26.target&&lastHitT>3)D.hp=Math.min(90,D.hp+1.5*dt);
    // aviso: ladra si algo se acerca y no lo viste venir
    dog26.bark-=dt;if(dog26.bark<=0){dog26.bark=1;const c=D.mode==='guard'?{x:0,z:0,r:55}:{x:P.x,z:P.z,r:42};let n=0,ne=null;
      for(const e of enemies){if(!dogHostile26(e)||e.aggro)continue;const d=Math.hypot(e.x-c.x,e.z-c.z);if(d<c.r){n++;if(!ne||d<ne.d)ne={e,d}}}
      if(n&&(dog26.lastBark||0)<time-25){dog26.lastBark=time;bark26();const dir=q21dir?q21dir(c.x,c.z,ne.e.x,ne.e.z):'';
        dogSay26(D.mode==='guard'?L('{n} ladra en el almacén: algo se acerca por el {d}.',{n:D.name,d:dir}):L('{n} gruñe: se acerca algo por el {d}.',{n:D.name,d:dir}),'#e3a33b')}}
    if(D.hp<=0){D.st='down';D.downDay=S.day;burst(dog26.x,groundY(dog26.x,dog26.z)+.6,dog26.z,'#8a2f24',10,3);dogDespawn26();dogSay26(L('{n} quedó muy lastimado y volvió cojeando al almacén. Mañana va a estar mejor.',{n:D.name}),'#cc4b30');return}}
  if(speed>0&&tx!=null){const a=Math.atan2(tx-dog26.x,tz-dog26.z);dog26.yaw+=clamp(angDiff(dog26.yaw,a),-7*dt,7*dt);
    const o={x:dog26.x,z:dog26.z};moveCircle(o,Math.sin(dog26.yaw)*speed*dt,Math.cos(dog26.yaw)*speed*dt,.35,'pet');dog26.x=o.x;dog26.z=o.z;
    if(anim==='Idle')anim=speed>6?'Gallop':'Walk'}
  else if(tx!=null&&anim==='Attack'){dog26.yaw+=clamp(angDiff(dog26.yaw,Math.atan2(tx-dog26.x,tz-dog26.z)),-8*dt,8*dt)}
  g.position.set(dog26.x,groundY(dog26.x,dog26.z),dog26.z);g.rotation.y=dog26.yaw;dogPlay26(anim);if(u.mixer){if(u.acts.Gallop)u.acts.Gallop.timeScale=1.1;u.mixer.update(dt)}}
function sniffFind26(){let best=null,bd=22;const GOOD=k=>/^(ammo:|w:)/.test(k)||['medicina','antibioticos','joyas','ambar','mochila_c','mochila_t','kit_motor','herramientas','polvora','analgesicos'].includes(k);
  for(const c of conts){if(c.seen||c.sn26||c.car)continue;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d>bd)continue;if(Math.abs((c.y||0)-P.y)>3)continue;
    let it;try{it=S.cont[c.i]||rollTable(CONT[c.type].loot,mulberry32((S.seed^Math.imul(c.i+1,2654435761)^Math.imul(S.day,40503))>>>0),SB('loot')*(1+.25*PK('carronero')))}catch(e){continue}const ks=Object.keys(it||{}).filter(k=>it[k]>0);c.sn26=true;if(!ks.some(GOOD))continue;bd=d;best={c}}
  return best}
function dogInteract26(){const D=dogS26();if(!dog26||P.inTruck||!dog26.g.visible)return null;const d=Math.hypot(dog26.x-P.x,dog26.z-P.z);if(d>2.2)return null;
  if(D.st==='stray'){const food=['asada','carne','charqui','lata'].find(k=>(S.inv[k]||0)>0);
    if(!food)return{label:L('Un perro flaco'),sub:L('Tiene hambre. Traele carne o una lata.'),act:()=>{bark26()}};
    return{label:L('Mantené E · Darle {f} al perro',{f:nm(food)}),sub:L('Un perro flaco'),hold:1.2,key:'dog26',type:'cook',act:()=>{S.inv[food]--;D.st='own';D.mode='follow';D.hp=90;dogPlay26('Eating');bark26();
      sfx('tame');toast(L('El perro se quedó con vos. Le pusiste Pampa. E cerca de él: que te siga o que cuide el almacén.'),'#8fbb62',8)}}}
  return{label:D.mode==='follow'?L('E · {n}: quedate cuidando el almacén',{n:D.name}):L('E · {n}: seguime',{n:D.name}),sub:L('Salud {n}%',{n:Math.round(D.hp/90*100)}),
    act:()=>{D.mode=D.mode==='follow'?'guard':'follow';bark26();toast(D.mode==='guard'?L('{n} vuelve al almacén a cuidarlo.',{n:D.name}):L('{n} te sigue.',{n:D.name}),'#c8b48a',4)}}}

// ---------- Enganches ----------
const _findInteract26=findInteract;findInteract=function(){try{const a=dogInteract26();if(a)return a;const b=farmInteract26();if(b)return b}catch(e){console.error('life26',e)}return _findInteract26()};
const _update26l=update;update=function(dt){_update26l(dt);try{if(gstate==='play'&&S){farmDay26();
  const F=S.farm26;if(F&&S.weather&&(S.weather.k==='lluvia'||S.weather.k==='tormenta')){let ch=false;for(const p of F.p)if(p.k&&p.w<S.day){p.w=S.day;ch=true}if(ch)crops26Refresh()}
  dogTick26(dt)}}catch(e){console.error('life26',e)}};
const _genWorld26l=genWorld;genWorld=function(seed){dogDespawn26();_genWorld26l(seed);try{if(S){farm26();buildPlots26()}}catch(e){console.error('plots26',e)}};
const _startGame26=startGame;startGame=function(st){_startGame26(st);try{if(S&&S.demand)for(const k of IK)if(S.demand[k]==null)S.demand[k]=1;if(S.farm26&&S.farm26.day==null)S.farm26.day=S.day;crops26Refresh(true)}catch(e){console.error('life26 start',e)}};
const _compassExtras26=compassExtras;compassExtras=function(mark){_compassExtras26(mark);try{const D=S&&S.dog26;if(dog26&&D&&D.st==='own'&&dog26.g.visible){const d=Math.hypot(dog26.x-P.x,dog26.z-P.z);if(d>12)mark(dog26.x,dog26.z,'#c8b48a',D.name+' '+Math.round(d)+' m')}
  if(dog26&&dog26.sniff&&!dog26.sniff.c.seen)mark(dog26.sniff.c.x,dog26.sniff.c.z,'#c8b48a','◆')}catch(e){}};
