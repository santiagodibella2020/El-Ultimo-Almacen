/* v0.9 decoración: casas, calle, campamentos y el almacén como hogar */
function buildDecor9(seed){
  let s=((seed|0)^0x9e3779b9)>>>0;const rr=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  const em=c=>new T3.MeshBasicMaterial({color:c});
  const solid=(x,z,hw,hd,y,h)=>addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y-1,y1:y+h,kind:'solid'});
  // ---- interiores de casas y negocios ----
  const RUG=['#7a2f2a','#2f4a66','#4a5e3a','#6a5a3a','#5a3a5e'],FR=['#d8c8a0','#9ab0a0','#c0a070','#a0a8b8'];
  for(const b of buildings){
    const g=grp(0,0,0,world),f=b.floor+.02,H=3;
    if(!b.store){
      const rc=RUG[rr()*RUG.length|0];
      const rug=bx(Math.min(3.4,b.w-3),.03,Math.min(2.6,b.d-3),rc,b.cx,f+.015,b.cz+(rr()-.5)*1.2,g);rug.castShadow=false;
      const rim=bx(Math.min(3.4,b.w-3)-.35,.035,Math.min(2.6,b.d-3)-.35,'#c8b88a',rug.position.x,f+.02,rug.position.z,g);rim.castShadow=false;
      // lámpara de techo y cuadros en las paredes sin puertas
      bx(.05,.5,.05,'#2a2a26',b.cx,f+H-.25,b.cz,g);bx(.5,.2,.5,em(0xe8d6a0),b.cx,f+H-.55,b.cz,g);
      [[b.cz-b.d/2+.2,1],[b.cz+b.d/2-.2,-1]].forEach(([zz,dir],i)=>{const fc=FR[rr()*FR.length|0];bx(.9,.7,.04,'#3a2a1c',b.cx+(rr()-.5)*.4,f+1.7,zz,g);bx(.74,.54,.05,fc,b.cx,f+1.7,zz+.01*dir,g).position.x=g.children[g.children.length-2].position.x});
      // plantita y silla
      if(rr()<.6){const px=b.x0+.7,pz=b.z1-.7;bx(.3,.3,.3,'#8a4a2a',px,f+.15,pz,g,CYL);bx(.5,.5,.5,'#3f6a2e',px,f+.55,pz,g,CONE)}
      if(rr()<.5){const cxs=b.cx+(rr()-.5)*2,czs=b.cz-1;bx(.45,.08,.45,'#6a4a2c',cxs,f+.5,czs,g);bx(.45,.5,.06,'#6a4a2c',cxs,f+.78,czs-.2,g);for(const [dx,dz] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])bx(.05,.5,.05,'#5a3e22',cxs+dx,f+.25,czs+dz,g)}
      if(rr()<.35){bx(.5,.25,.36,'#a8a090',b.cx-1.2,f+.15,b.cz+1.2,g)} // bolsas/cajas
    }else{
      // negocios: luces de techo y franja de piso
      for(const dx of[-.3,.3])for(const dz of[-.3,.3])bx(1.2,.08,.35,em(0xf0efe0),b.cx+dx*b.w*.8,f+H-.1,b.cz+dz*b.d*.8,g);
      const st=bx(b.w-1,.02,.5,'#c8a040',b.cx,f+.01,b.cz,g);st.castShadow=false;
    }
  }
  // ---- calle del pueblo: autos, faroles, buzones, bancos, bolsas ----
  const car=(x,z,rot,col,kind)=>{const y=terrainY(x,z);if(y<WATER_Y+.5)return;const g=grp(x,y,z,world);g.rotation.y=rot;
    bx(1.8,.75,4.2,col,0,.7,0,g);bx(1.6,.6,2,kind==='burnt'?'#141414':'#2a2f30',0,1.4,-.2,g);
    [[-.85,1.3],[.85,1.3],[-.85,-1.3],[.85,-1.3]].forEach(([wx,wz])=>{const wh=bx(.35,.7,.7,'#1c1c1c',wx,.35,wz,g,CYL);wh.rotation.z=Math.PI/2});
    if(kind==='open'){bx(.06,.7,1.1,col,-1.05,.95,.3,g).rotation.y=.5}
    if(kind==='flat'){g.children[g.children.length-1].position.y=.15}
    if(kind==='police'){bx(1.82,.2,1.4,'#e8e8e8',0,.95,0,g);bx(1.4,.15,.3,em(0x3050d0),0,1.8,-.2,g)}
    if(kind==='bus'){bx(2.3,1.5,6,col,0,1.3,0,g);bx(2.1,.5,5.6,'#2a3a40',0,1.55,0,g);solid(x,z,Math.abs(Math.cos(rot))*1.2+Math.abs(Math.sin(rot))*3.1,Math.abs(Math.sin(rot))*1.2+Math.abs(Math.cos(rot))*3.1,y,2.2);return}
    solid(x,z,Math.abs(Math.cos(rot))*.95+Math.abs(Math.sin(rot))*2.2,Math.abs(Math.sin(rot))*.95+Math.abs(Math.cos(rot))*2.2,y,1.8)};
  const cols=['#6b3a2e','#4a5a62','#7a6a3a','#525a4a','#8a8a84','#3a4a6a','#8a4a2a'];
  const kinds=['open','flat','plain','plain','burnt','police','plain'];
  for(let k=0;k<14;k++){const z=100+rr()*150,sd=rr()<.5?-1:1;const x=roadX(z)+sd*(4.6+rr()*1.6);const kn=kinds[rr()*kinds.length|0];
    if(circleBlocked(x,z,3,'t'))continue;car(x,z,(rr()<.5?0:Math.PI)+(rr()-.5)*.4,kn==='burnt'?'#1a1a1a':kn==='police'?'#2a3040':cols[rr()*cols.length|0],kn)}
  if(!circleBlocked(roadX(170)+5,170,5,'t'))car(roadX(170)+5,170,.2,'#b8a040','bus');
  for(let z=106;z<=246;z+=14){for(const sd of[-1,1]){const x=roadX(z)+sd*6.8,y=terrainY(x,z);if(circleBlocked(x,z,1,'t'))continue;
    const g=grp(x,y,z,world);bx(.12,3.6,.12,'#2a2a28',0,1.8,0,g);bx(.9,.1,.1,'#2a2a28',-sd*.4,3.55,0,g);const l=bx(.3,.15,.3,em(0xd8c890),-sd*.8,3.45,0,g);solid(x,z,.15,.15,y,3.6)}}
  for(let k=0;k<6;k++){const z=108+rr()*136,sd=rr()<.5?-1:1,x=roadX(z)+sd*7.6,y=terrainY(x,z);if(circleBlocked(x,z,1.5,'t'))continue;
    if(k%2){const g=grp(x,y,z,world);bx(1.6,.1,.5,'#6a4a2a',0,.5,0,g);bx(1.6,.5,.08,'#6a4a2a',0,.85,-.25,g);bx(.08,.5,.08,'#2a2a28',-.7,.25,0,g);bx(.08,.5,.08,'#2a2a28',.7,.25,0,g);g.rotation.y=sd>0?Math.PI/2:-Math.PI/2}
    else{const g=grp(x,y,z,world);bx(.4,1,.4,'#2f5a3a',0,.5,0,g);bx(.44,.08,.44,'#1c3a24',0,1.02,0,g)}}
  // ---- campamentos de sobrevivientes ----
  let made=0;for(let a=0;a<400&&made<9;a++){const ang=rr()*6.283,rad=120+rr()*320,x=Math.cos(ang)*rad,z=Math.sin(ang)*rad;if(Math.abs(x)>420||Math.abs(z)>420)continue;
    const y=terrainY(x,z);if(y<WATER_Y+1.5||y>13||townW(x,z)>0||Math.hypot(x,z)<80)continue;if(circleBlocked(x,z,9,'t'))continue;if(typeof altar!=='undefined'&&altar&&Math.hypot(x-altar.x,z-altar.z)<80)continue;if(lairs.some(l=>Math.hypot(l.x-x,l.z-z)<90))continue;
    if(buildings.some(b=>x>b.x0-12&&x<b.x1+12&&z>b.z0-12&&z<b.z1+12))continue;if(typeof ruins!=='undefined'&&ruins.some(r=>x>r.x0-10&&x<r.x1+10&&z>r.z0-10&&z<r.z1+10))continue;
    made++;const g=grp(x,y,z,world),r0=rr()*6.28;
    // fogata
    for(let i=0;i<7;i++){const q=i/7*6.283;bx(.28,.22,.28,'#5a5550',Math.cos(q)*.7,.11,Math.sin(q)*.7,g)}for(let i=0;i<3;i++){const l=bx(.12,.9,.12,'#4a3626',0,.25,0,g,CYL);l.rotation.z=1.2;l.rotation.y=i*2.1}
    bx(.4,.05,.4,'#1a1410',0,.04,0,g);
    // carpas
    const ntent=1+(rr()*2|0);for(let t=0;t<ntent;t++){const q=r0+t*2.4,d=4.2+rr()*1.2,tx=Math.cos(q)*d,tz=Math.sin(q)*d,ty=terrainY(x+tx,z+tz)-y;const tent=new T3.Mesh(new T3.ConeGeometry(1.7,1.7,4),mat(['#6a7a4a','#8a6a3a','#4a5a6a','#7a3a2e'][rr()*4|0]));tent.rotation.y=q+Math.PI/4;tent.position.set(tx,ty+.85,tz);tent.castShadow=true;g.add(tent);bx(.5,.9,.04,'#1a1814',tx-Math.cos(q)*.88,ty+.5,tz-Math.sin(q)*.88,g).rotation.y=-q+Math.PI/2;solid(x+tx,z+tz,1.1,1.1,y+ty,1.4)}
    // troncos para sentarse, cajones, mochila, cuerda de ropa
    for(let i=0;i<3;i++){const q=r0+3.6+i*.9;const sx=Math.cos(q)*2.1,sz=Math.sin(q)*2.1;const lg=bx(.35,.4,.35,'#6a4a2e',sx,.2,sz,g,CYL)}
    const cx=Math.cos(r0+1.2)*3.2,cz=Math.sin(r0+1.2)*3.2;bx(.7,.55,.7,'#7a5a34',cx,.28,cz,g);bx(.5,.4,.5,'#6a4a2a',cx+.1,.75,cz,g);
    bx(.45,.55,.3,'#3a4a2e',cx+1,.28,cz+.3,g);
    solid(x+cx,z+cz,.4,.4,y,1);
  }
}
// ---------------- el almacén como hogar ----------------
const HOGAR9=[
  {id:'piso',n:'Piso de madera',d:'Tablones cálidos en todo el salón.',p:140},
  {id:'alfombra',n:'Alfombra',d:'Elegí el color que más te guste.',p:60,colors:[['Roja','#8a2f2a'],['Azul','#2f4a6a'],['Verde','#3f5a3a'],['Mostaza','#a8823a']]},
  {id:'mesa',n:'Mesa con sillas',d:'Para comer en familia.',p:120},
  {id:'sofa',n:'Sillón',d:'Un lugar para descansar.',p:200},
  {id:'biblioteca',n:'Biblioteca',d:'Libros viejos y alguna foto.',p:150},
  {id:'velador',n:'Velador',d:'Luz cálida sobre la mesa de noche.',p:80},
  {id:'plantas',n:'Plantas',d:'Un poco de verde en medio de todo.',p:40},
  {id:'cuadros',n:'Cuadros',d:'Recuerdos de antes del desastre.',p:50},
  {id:'guirnalda',n:'Guirnalda de luces',d:'Foquitos de colores bajo el techo.',p:70},
  {id:'trofeo',n:'Trofeo de caza',d:'Un cráneo de bicho sobre la puerta.',p:200}
];
let home9=null,homeLight9=null;
function buildHome9(){
  const Y=2,g=grp(0,Y,0,world),H={};home9={g,H};
  const em=c=>new T3.MeshBasicMaterial({color:c});const mk9=(id)=>H[id]=grp(0,0,0,g);
  { const o=mk9('piso');const tex=document.createElement('canvas');tex.width=256;tex.height=256;const c=tex.getContext('2d');c.fillStyle='#8a6a45';c.fillRect(0,0,256,256);for(let i=0;i<8;i++){c.fillStyle=i%2?'#7e5f3c':'#946f48';c.fillRect(0,i*32,256,31);c.fillStyle='#5a4128';c.fillRect(0,i*32+31,256,1);for(let k=0;k<3;k++)c.fillRect((i*70+k*90)%256,i*32,1,31)}
    const t=new T3.CanvasTexture(tex);t.wrapS=t.wrapT=T3.RepeatWrapping;t.repeat.set(3,2);const m=new T3.Mesh(new T3.PlaneGeometry(11.6,7.6),new T3.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(0,.07,-12);o.add(m)}
  { const o=mk9('alfombra');const m=bx(4,.03,2.6,'#8a2f2a',0,.1,-11.7,o);m.castShadow=false;const r=bx(3.6,.035,2.2,'#d8c08a',0,.105,-11.7,o);r.castShadow=false;const c=bx(3.2,.04,1.8,'#8a2f2a',0,.11,-11.7,o);c.castShadow=false;o.userData={m,c}}
  { const o=mk9('mesa');bx(1.7,.08,.95,'#6a4a2c',-2.6,.78,-12.6,o);for(const[x,z]of[[-.75,-.4],[.75,-.4],[-.75,.4],[.75,.4]])bx(.08,.75,.08,'#4a3220',-2.6+x,.38,-12.6+z,o);
    for(const[x,z]of[[-3.1,-13.4],[-2.1,-13.4],[-3.1,-11.8],[-2.1,-11.8]]){bx(.42,.06,.42,'#7a5a38',x,.5,z,o);bx(.42,.5,.06,'#7a5a38',x,.78,z+(z<-12.6?-.2:.2),o);bx(.05,.5,.05,'#4a3220',x,.25,z,o)}
    bx(.5,.05,.5,'#d8d4c4',-2.6,.84,-12.6,o,CYL)}
  { const o=mk9('sofa');bx(.95,.45,2.1,'#6a3a30',-5.25,.3,-11.7,o);bx(.3,.7,2.1,'#6a3a30',-5.65,.55,-11.7,o);bx(.95,.6,.3,'#5a2f26',-5.25,.4,-12.8,o);bx(.95,.6,.3,'#5a2f26',-5.25,.4,-10.6,o);bx(.5,.3,.5,'#c8a050',-5.2,.65,-12.2,o)}
  { const o=mk9('biblioteca');bx(.4,2,1.6,'#5a3e28',5.55,1,-9.4,o);for(let r=0;r<4;r++){bx(.45,.05,1.6,'#3a281a',5.55,.35+r*.45,-9.4,o);for(let k=0;k<6;k++)bx(.3,.34,.1,['#8a2f2a','#2f4a6a','#4a5e3a','#a8823a','#5a3a5e'][(k+r)%5],5.55,.55+r*.45,-10.05+k*.25,o)}}
  { const o=mk9('velador');bx(.5,.5,.5,'#5a3e28',-5.55,.25,-8.7,o);bx(.04,.35,.04,'#2a2a26',-5.55,.65,-8.7,o);bx(.3,.22,.3,em(0xf0d890),-5.55,.9,-8.7,o,CONE);
    homeLight9=new T3.PointLight(0xffc880,0,9,1.8);homeLight9.position.set(-5.4,1.4,-8.8);o.add(homeLight9);o.userData.light=homeLight9}
  { const o=mk9('plantas');for(const[x,z,s]of[[-1.9,-8.9,1],[1.9,-8.9,.9],[5.4,-14.2,1.2],[-5.4,-14.6,.8]]){bx(.4*s,.4*s,.4*s,'#8a4a2a',x,.2*s,z,o,CYL);bx(.7*s,.7*s,.7*s,'#3f6a2e',x,.7*s,z,o,CONE);bx(.45*s,.45*s,.45*s,'#528a3a',x+.1,.95*s,z,o,CONE)}}
  { const o=mk9('cuadros');const fcs=['#d8c8a0','#9ab0a0','#c0a070'];[[5.82,-12.7,-1],[5.82,-14.2,-1],[-5.82,-14,1]].forEach(([x,z,dir],i)=>{bx(.06,.8,1,'#3a2a1c',x,1.8,z,o);bx(.05,.65,.85,fcs[i],x+dir*.03,1.8,z,o)});bx(.06,.8,1.2,'#3a2a1c',0,2.4,-15.85,o);bx(.05,.65,1.05,'#8aa0b8',0,2.4,-15.82,o)}
  { const o=mk9('guirnalda');for(let i=0;i<19;i++){const x=-5.5+i*.6;const y=3.1+Math.sin(i*1.05)*.18;bx(.14,.14,.14,em([0xf06a4a,0xf0d84a,0x6ad06a,0x4a9af0][i%4]),x,y,-12.2,o)}for(let i=0;i<13;i++){const z=-8.8-i*.55;bx(.14,.14,.14,em([0xf0d84a,0x6ad06a,0x4a9af0,0xf06a4a][i%4]),0,3.1+Math.sin(i*1.4)*.14,z,o)}}
  { const o=mk9('trofeo');bx(.9,.2,.1,'#4a3a2a',0,2.7,-8.35,o);bx(.8,.28,.4,'#e4dcc4',0,2.95,-8.5,o);for(let i=0;i<7;i++)bx(.06,.2,.06,'#d8d0b4',-.3+i*.1,2.78,-8.34,o);bx(.12,.22,.12,'#1a1a18',-.2,3,-8.3,o);bx(.12,.22,.12,'#1a1a18',.2,3,-8.3,o)}
  Object.values(H).forEach(o=>o.visible=false);refreshHome9()}
function refreshHome9(){if(!home9||!S)return;const h=S.home9||{owned:[],rug:0};Object.keys(home9.H).forEach(k=>home9.H[k].visible=h.owned.includes(k));
  const u=home9.H.alfombra.userData,col=(HOGAR9[1].colors[h.rug||0]||HOGAR9[1].colors[0])[1];u.m.material=mat(col);u.c.material=mat(col)}
const _genWorld9d=genWorld;
genWorld=function(seed){const r=_genWorld9d.apply(this,arguments);try{buildHome9()}catch(e){console.error('home9',e)}return r};
const _startGame9d=startGame;
startGame=function(st){const r=_startGame9d.apply(this,arguments);try{if(S&&!S.home9)S.home9={owned:[],rug:0};refreshHome9()}catch(e){}return r};
const _render9d=render;
render=function(dt){try{if(home9&&S&&S.home9&&homeLight9)homeLight9.intensity=S.home9.owned.includes('velador')?(.5+darkness()*1.3):0}catch(e){}return _render9d(dt)};
// pestaña Hogar del panel del almacén
function tabHogar9(){const h=S.home9||(S.home9={owned:[],rug:0});
  const rows=HOGAR9.map(it=>{const own=h.owned.includes(it.id);
    let acts=own?`<span class="chance">${esc(L('Colocado'))}</span>`:btn(L('Comprar'),'h9buy',`data-id="${it.id}" ${S.money<it.p?'disabled':''}`);
    if(own&&it.colors)acts=it.colors.map((c,i)=>btn(L(c[0]),'h9rug',`data-i="${i}" ${(h.rug||0)===i?'disabled':''}`)).join('');
    if(own)acts+=btn(L('Guardar'),'h9sell',`data-id="${it.id}"`);
    return row(`<div><strong>${esc(L(it.n))}</strong> <span class="chance">· $${it.p}</span><br><span class="chance">${esc(L(it.d))}</span></div><div class="acts">${acts}</div>`)}).join('');
  return `<div class="banner">${esc(L('Hacé del almacén tu hogar: lo que compres aparece adentro. Guardar devuelve la mitad del precio.'))}</div><div class="rows">${rows}</div>`}
const _renderPanel9=renderPanel;
renderPanel=function(){if(tab!=='hogar')return _renderPanel9();tab='mejoras';_renderPanel9();tab='hogar';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab==='hogar'));
  $('pbody').innerHTML=(panelMsg?`<div class="banner">${esc(panelMsg)}</div>`:'')+tabHogar9()};
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a^="h9"]');if(!b||b.disabled||!S)return;const h=S.home9||(S.home9={owned:[],rug:0});const a=b.dataset.a,it=HOGAR9.find(x=>x.id===b.dataset.id);panelMsg='';
  if(a==='h9buy'&&it&&S.money>=it.p&&!h.owned.includes(it.id)){S.money-=it.p;h.owned.push(it.id);sfx('crate');panelMsg=L('Compraste: {n}.',{n:L(it.n)})}
  if(a==='h9sell'&&it){h.owned=h.owned.filter(x=>x!==it.id);S.money+=Math.floor(it.p/2)}
  if(a==='h9rug')h.rug=+b.dataset.i;
  refreshHome9();renderPanel()});
