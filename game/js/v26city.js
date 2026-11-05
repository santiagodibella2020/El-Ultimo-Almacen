'use strict';
/* v0.26: el mapa pasa de 1 km a 1,6 km por lado. Lo que ya existía queda igual; más allá de las lomas
   hay una zona nueva con puestos abandonados y, al final de la ruta hacia el norte del pueblo, la
   Ciudad de San Ignacio: 30 manzanas con avenida, departamentos de varios pisos, negocios, una comisaría,
   un hipermercado, una clínica, depósitos y estacionamientos. Todo se puede saquear y está lleno de podridos.
   La ciudad se arma al final de la generación del mundo (antes de fundir la geometría estática), así los
   contenedores de siempre conservan su número y las partidas guardadas siguen andando. */
const CITY26={x0:CITY_RX-140,x1:CITY_RX+140,z0:470,z1:712,name:'Ciudad de San Ignacio'};
const C26B=32,C26S=10,C26P=C26B+C26S;// manzana, calle, paso
const C26ROWS=[507,549,591,633,675];// centros de manzana (z)
const C26COLS=[-1,-2,-3,1,2,3].map(k=>CITY_RX+Math.sign(k)*(6+C26B/2+(Math.abs(k)-1)*C26P));// centros de manzana (x)
let city26={blocks:[],streets:[],big:[],cars:[],built:false},cityYc26={n:null,y:4};

// ---------- Terreno: la ciudad es plana ----------
function cityW26(x,z){if(LEGACY26||z<470||z>718)return 0;const ax=Math.abs(x-CITY_RX);if(ax>152)return 0;
  return (1-smooth(140,152,ax))*smooth(470,482,z)*(1-smooth(704,716,z))}
function cityY26(){if(cityYc26.n===nH)return cityYc26.y;cityYc26.n=nH;const hs=[];
  for(let i=0;i<7;i++)for(let j=0;j<7;j++)hs.push(rawMain6(CITY_RX-120+i*40,490+j*33));hs.sort((a,b)=>a-b);
  cityYc26.y=clamp(hs[hs.length>>1],WATER_Y+3.5,14);return cityYc26.y}
const _rawHeight26=rawHeight;rawHeight=function(x,z){let h=_rawHeight26(x,z);const w=cityW26(x,z);if(w>0)h=lerp(h,cityY26(),w);return h};
const _townW26=townW;townW=function(x,z){const w=_townW26(x,z);if(w>=1)return w;return Math.max(w,cityW26(x,z))};
const inCity26=(x,z,m)=>x>CITY26.x0-(m||0)&&x<CITY26.x1+(m||0)&&z>CITY26.z0+10-(m||0)&&z<CITY26.z1-12+(m||0);

// ---------- Negocios ----------
const SHOP26={
  depto:{n:'',col:['#8a8276','#7a7a74','#9a8a78','#6e6a64','#8a6a5a','#a09a8a']},
  super:{n:'Supermercado',sign:'SUPERMERCADO',bg:'#1e3a5a',fg:'#f0e0a0'},
  farmacia:{n:'Farmacia',sign:'FARMACIA',bg:'#1e4a32',fg:'#e8f0e0'},
  ferre:{n:'Ferretería',sign:'FERRETERÍA',bg:'#5a3a1a',fg:'#f0c060'},
  bar:{n:'Bar',sign:'BAR',bg:'#3a1a1a',fg:'#f0b060'},
  oficina:{n:'Oficinas',sign:'',bg:'',fg:''},
  ropa:{n:'Tienda de ropa',sign:'ROPA',bg:'#4a2a4a',fg:'#f0d0e8'},
  kiosco:{n:'Kiosco',sign:'KIOSCO',bg:'#7a5a1a',fg:'#1a1a1a'},
  armeria:{n:'Armería',sign:'ARMERÍA',bg:'#2a2e30',fg:'#d84a2a'},
  hiper:{n:'Hipermercado',sign:'HIPERMERCADO',bg:'#7a1a1a',fg:'#f8f0e0'},
  comisaria:{n:'Comisaría',sign:'COMISARÍA 1.ª',bg:'#1a2a5a',fg:'#e8e8f0'},
  clinica:{n:'Clínica',sign:'CLÍNICA',bg:'#e8e8e0',fg:'#b02a22'},
  deposito:{n:'Depósito',sign:'DEPÓSITO',bg:'#3a3a36',fg:'#e0c040'},
};
function names26(){return [L('Ciudad de San Ignacio'),L('Supermercado'),L('Farmacia'),L('Ferretería'),L('Bar'),L('Oficinas'),L('Tienda de ropa'),L('Kiosco'),L('Armería'),
  L('Hipermercado'),L('Comisaría'),L('Clínica'),L('Depósito'),L('CIUDAD'),L('Puesto abandonado'),L('Retén militar')]}

// Muebles contra las paredes, uno al lado del otro, salteando la puerta y los tabiques.
// list: [tipo, largo sobre la pared, alto, profundidad, color]
function furnish26(b,w,d,doors,list,avoid){const walls=[];const doorsOn=s=>doors.filter(dd=>dd[0]===s).map(([,p,dw])=>[p*(s<2?w:d)-(s<2?w:d)/2,dw]);
  for(const s of [1,0,2,3]){const len=s<2?w:d;const bad=[...doorsOn(s).map(([c,dw])=>[c-dw/2-.9,c+dw/2+.9]),...((avoid&&avoid[s])||[])];walls.push({s,len,cur:-len/2+.7,bad})}
  let wi=0;for(const it of list){let placed=false;
    for(let tries=0;tries<4&&!placed;tries++){const W=walls[wi%walls.length];const [type,al,h,dp,c]=it;
      let a=W.cur;while(true){const a1=a+al;if(a1>W.len/2-.7)break;const hit=W.bad.find(([u,v])=>a<v&&a1>u);if(hit){a=hit[1]+.05;continue}break}
      if(a+al<=W.len/2-.7){const mid=a+al/2;let x,z,fw,fd;
        if(W.s<2){x=mid;z=(W.s===0?-d/2:d/2)+(W.s===0?1:-1)*(.2+dp/2);fw=al;fd=dp}else{z=mid;x=(W.s===2?-w/2:w/2)+(W.s===2?1:-1)*(.2+dp/2);fw=dp;fd=al}
        b.furn(type,x,z,fw,h,fd,c);W.cur=a+al+.25;placed=true}
      else wi++}
    wi++}}
const F26={heladera:['heladera',.8,1.9,.8,'#d8d6cc'],alacena:['alacena',1.4,1.1,.7,'#6b4a30'],armario:['armario',1.5,2,.7,'#5a3e2a'],botiquin:['botiquin',.6,.6,.35,'#e6e6dc'],
  escritorio:['escritorio',1.2,.8,.65,'#5e4630'],gondola:['gondola',3,1.7,.9,'#8a8a80'],farmacia:['farmacia',2.4,1.9,.7,'#e0e0d8'],ferreteria:['ferreteria',2.4,2,.7,'#6a6a62'],
  herramientas:['herramientas',2,1,.9,'#5e4a33'],kiosco:['kiosco',2,1,.9,'#5a4a3a'],armeria:['armeria',2.4,1.2,.8,'#3a3f44'],caja:['caja',.9,.8,.9,'#7b5a34'],
  camilla:['camilla',2.1,.55,1,'#d8d8d0'],vitrina:['vitrina',1.8,1.9,.6,'#c8d0d0'],comedor:['comedor',2.6,1,.8,'#9a9a92'],tacho:['tacho',.6,.9,.6,'#3c4a40']};
const f26=(...ks)=>ks.map(k=>F26[k]);

function shopSign26(b,kind,doorSide,w,d){const sh=SHOP26[kind];if(!sh||!sh.sign)return;const y=b.floor+3.75;
  const off=.4;let x=b.cx,z=b.cz,yaw=0;if(doorSide===0){z=b.z0-off;yaw=Math.PI}else if(doorSide===1){z=b.z1+off;yaw=0}else if(doorSide===2){x=b.x0-off;yaw=-Math.PI/2}else{x=b.x1+off;yaw=Math.PI/2}
  board22(sh.sign,x,y,z,yaw,Math.min(6,(doorSide<2?w:d)*.7),1.1,sh.bg,sh.fg)}

// Un edificio de la ciudad: planta baja revisable, pisos de arriba solo por fuera.
function cityBuilding26(rng,cx,cz,w,d,kind,doorSide,floors){
  const doors=[[doorSide,.5,kind==='hiper'||kind==='deposito'?3.2:kind==='depto'?1.5:2.4]];
  if(w*d>500)doors.push([doorSide<2?(doorSide===0?1:0):(doorSide===2?3:2),.5,2]);
  const cols=SHOP26.depto.col,col=kind==='clinica'?'#d8d4c8':kind==='comisaria'?'#b8b4a8':cols[rng()*cols.length|0];
  const o={name:kind,col,doors,roofCol:['#4a4844','#3a3834','#5a524a'][rng()*3|0],upper:floors>1?(floors-1)*3.2:0,H:3.4,floorCol:kind==='depto'?'#6a5a48':'#7a7870'};
  const avoid={};
  if(kind==='depto'){o.inner=[{z:0,gaps:[[w/2,1.4]]}];avoid[2]=[[-.6,.6]];avoid[3]=[[-.6,.6]]}
  if(kind==='clinica'){o.inner=[{x:0,gaps:[[d/2,2]]}];avoid[0]=[[-.6,.6]];avoid[1]=[[-.6,.6]]}
  const b=bld22(cx,cz,w,d,o);b.city26=kind;
  const R=()=>rng();let list=[];
  switch(kind){
    case 'depto':list=f26('heladera','alacena','armario','botiquin');if(R()<.6)list.push(F26.escritorio);if(R()<.5)list.push(F26.armario);if(R()<.4)list.push(F26.alacena);break;
    case 'super':list=f26('kiosco','heladera','heladera','alacena');for(let i=0;i<3;i++)b.furn('gondola',-w/2+3+i*((w-6)/2),0,1,1.7,d*.45,'#8a8a80');break;
    case 'farmacia':list=f26('farmacia','farmacia','vitrina','kiosco','botiquin');break;
    case 'ferre':list=f26('ferreteria','ferreteria','herramientas','kiosco','caja');break;
    case 'bar':list=f26('kiosco','heladera','alacena','comedor','alacena');for(let i=0;i<3;i++)b.furn(null,(i-1)*3,R()*2-1,1.2,.75,1.2,'#5a4030');break;
    case 'oficina':list=f26('escritorio','escritorio','armario','escritorio','escritorio','caja');break;
    case 'ropa':list=f26('armario','armario','armario','kiosco','armario');break;
    case 'kiosco':list=f26('kiosco','alacena','heladera');break;
    case 'armeria':list=f26('armeria','armeria','escritorio','caja');break;
    case 'hiper':list=f26('heladera','heladera','heladera','kiosco','kiosco','alacena','alacena','farmacia','ferreteria');
      for(let i=0;i<5;i++)for(let k=0;k<2;k++)b.furn('gondola',-w/2+4+i*((w-8)/4),(k?1:-1)*d*.2,1,1.7,d*.3,'#8a8a80');break;
    case 'comisaria':list=f26('armeria','armeria','escritorio','escritorio','armario','armario','escritorio','botiquin','caja');break;
    case 'clinica':list=f26('camilla','camilla','vitrina','camilla','botiquin','vitrina','camilla','escritorio','farmacia');break;
    case 'deposito':list=f26('caja','caja','herramientas','ferreteria','caja','caja','herramientas','caja','caja');for(let i=0;i<3;i++)b.furn('caja',(i-1)*4,(R()-.5)*3,1.2,1,1.2,'#7b5a34');break;}
  furnish26(b,w,d,doors,list,avoid);
  shopSign26(b,kind,doorSide,w,d);
  return b}

// ---------- La ciudad ----------
function buildCity26(){city26={blocks:[],streets:[],big:[],cars:[],built:true};const rng=mulberry32((worldSeed()^0x26c17)>>>0);const Y=cityY26();
  const asphalt='#45433f',side='#5a5852';
  // calles: avenida principal (la ruta) y la grilla
  const xs=[CITY26.x0+4,...C26COLS.map(x=>x).sort((a,b)=>a-b)];
  const xL=CITY_RX-135,xR=CITY_RX+135,zT=486,zB=696;
  const st=(x,z,w,d,c)=>{const m=bx(w,.12,d,c||asphalt,x,Y+.04+(w===12?.006:0),z,world);m.castShadow=false;city26.streets.push({x,z,w,d})};
  st(CITY_RX,(zT+zB)/2+10,12,zB-zT+40);// avenida (sigue hasta el final)
  for(const k of [1,2,3]){const o=6+k*C26P-C26S/2;st(CITY_RX+o,(zT+zB)/2,C26S,zB-zT+C26S);st(CITY_RX-o,(zT+zB)/2,C26S,zB-zT+C26S)}
  for(let i=0;i<=5;i++){const z=zT+i*C26P;st(CITY_RX,z,xR-xL+C26S,C26S)}
  // veredas: un borde alrededor de cada manzana
  let armerias=0;const shopPool=['super','farmacia','ferre','bar','bar','oficina','oficina','ropa','ropa','kiosco','kiosco','armeria'];
  const bigLeft=['hiper','comisaria','clinica','deposito','deposito','clinica','hiper','comisaria'];
  C26ROWS.forEach((bz,ri)=>C26COLS.forEach((bxc,ci)=>{
    const blk={x:bxc,z:bz,i:city26.blocks.length,kind:'res'};city26.blocks.push(blk);
    const sw=bx(C26B+1,.2,C26B+1,side,bxc,Y,bz,world);sw.castShadow=false;
    const outer=bxc>CITY_RX?3:2;// lado que mira hacia afuera
    // plaza central (la manzana más cercana al centro, a la izquierda de la avenida): retén militar
    if(ri===2&&Math.abs(bxc-CITY_RX)<30&&bxc<CITY_RX){blk.kind='plaza';plaza26(blk,Y,rng);return}
    const r=rng();
    if((ri===1||ri===3)&&Math.abs(bxc-CITY_RX)<30||r<.16&&bigLeft.length>4){// manzana grande
      const kind=bigLeft.shift()||'deposito';blk.kind=kind;const doorSide=bxc>CITY_RX?2:3;// la puerta mira a la avenida
      const b=cityBuilding26(rng,bxc,bz,26,24,kind,doorSide,kind==='hiper'||kind==='deposito'?1:kind==='clinica'?3:2);city26.big.push({b,kind});return}
    if(r<.27){blk.kind='parking';parking26(blk,Y,rng);return}
    if(r<.45){// dos edificios largos
      for(const s of [-1,1]){const kind=rng()<.5?'depto':shopPool[rng()*shopPool.length|0];const k2=kind==='armeria'&&armerias>=3?'kiosco':kind;if(k2==='armeria')armerias++;
        cityBuilding26(rng,bxc,bz+s*8,27,13,k2,s<0?0:1,k2==='depto'?2+(rng()*3|0):1+(rng()*3|0))}return}
    // cuatro edificios en las esquinas
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){if(rng()<.08)continue;
      const kind=rng()<.5?'depto':shopPool[rng()*shopPool.length|0];const k2=kind==='armeria'&&armerias>=3?'oficina':kind;if(k2==='armeria')armerias++;
      const doorSide=rng()<.5?(sx<0?2:3):(sz<0?0:1);const w=12+(rng()*2|0),d=12+(rng()*2|0);
      cityBuilding26(rng,bxc+sx*8,bz+sz*8,w,d,k2,doorSide,k2==='depto'?2+(rng()*4|0):1+(rng()*3|0))}}));
  // tachos en las veredas y autos abandonados en las calles (con baúl para revisar)
  for(let i=0;i<70;i++){const blk=city26.blocks[rng()*city26.blocks.length|0];const s=rng()*4|0,t=(rng()-.5)*(C26B-4);
    const x=blk.x+(s===2?-C26B/2-.1:s===3?C26B/2+.1:t),z=blk.z+(s===0?-C26B/2-.1:s===1?C26B/2+.1:t);
    if(circleBlocked(x,z,.8,'p'))continue;const m=bx(.6,.9,.6,'#3c4a40',x,Y+.45,z,world,CYL);addAABB({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,y0:Y-1,y1:Y+1.1,kind:'solid'});addCont('tacho',x,z,Y,m)}
  for(let i=0;i<34;i++){let x,z,yaw;if(rng()<.35){x=CITY_RX+(rng()<.5?-3.2:3.2);z=zT+rng()*(zB-zT);yaw=(rng()<.5?0:Math.PI)+(rng()-.5)*.5}
    else if(rng()<.5){const k=1+(rng()*3|0),sgn=rng()<.5?-1:1;x=CITY_RX+sgn*(6+k*C26P-C26S/2)+(rng()-.5)*4;z=zT+rng()*(zB-zT);yaw=(rng()-.5)*.6+(rng()<.5?0:Math.PI)}
    else{x=xL+rng()*(xR-xL);z=zT+(rng()*6|0)*C26P+(rng()-.5)*4;yaw=Math.PI/2+(rng()-.5)*.6}
    if(circleBlocked(x,z,2.4,'t'))continue;wreck26(x,z,Y,yaw,rng)}
  // cartel a la entrada
  sign6(L('Ciudad de San Ignacio'),CITY_RX+8,462,Math.PI/2)}

function wreck26(x,z,Y,yaw,rng){const kinds=['sedan','sedan','pickup','furgon','jeep','sedan'];const k=kinds[rng()*kinds.length|0];
  const col=['#6b3a2e','#4a5a62','#7a6a3a','#525a4a','#8a8a84','#2a2622','#3a4a6a'][rng()*7|0];
  const c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw));const hw=.9*c+2.1*s,hd=2.1*c+.9*s;
  addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:Y-1,y1:Y+1.9,kind:'solid'});
  const bxp=x-Math.sin(yaw)*2.6,bzp=z-Math.cos(yaw)*2.6;addCont('baul',bxp,bzp,Y,null,{car:true});
  city26.cars.push({k,col,x,y:Y,z,yaw})}

function parking26(blk,Y,rng){const pad=bx(C26B-1,.14,C26B-1,'#3a3936',blk.x,Y+.06,blk.z,world);pad.castShadow=false;
  for(let i=0;i<6;i++){if(rng()<.3)continue;const x=blk.x-11+(i%3)*11,z=blk.z+(i<3?-7:7);wreck26(x,z,Y,(rng()<.5?0:Math.PI)+(rng()-.5)*.2,rng)}
  const b=bld22(blk.x+(rng()<.5?-12:12),blk.z,5,4,{name:'kiosco',col:'#8a8276',doors:[[0,.5,1.5]],H:2.8});b.furn('kiosco',0,1,2.6,1,.8,'#5a4a3a');b.furn('caja',1.6,-1,.8,.8,.8,'#7b5a34')}

function plaza26(blk,Y,rng){const pad=bx(C26B-1,.16,C26B-1,'#6a665e',blk.x,Y+.05,blk.z,world);pad.castShadow=false;
  // retén militar: bolsas de arena, carpas y cajas con provisiones y munición
  for(let i=0;i<16;i++){const a=i/16*6.283;if(i%4===0)continue;const x=blk.x+Math.cos(a)*11,z=blk.z+Math.sin(a)*11;
    for(let h=0;h<2;h++){const m=bx(2.2,.36,.7,'#8a7a58',x,Y+.18+h*.36,z,world);m.rotation.y=-a+Math.PI/2}
    addAABB({x0:x-1,x1:x+1,z0:z-1,z1:z+1,y0:Y-1,y1:Y+1,kind:'solid'})}
  for(const [ox,oz] of [[-5,-4],[5,4]]){const t=bx(5,2.6,4,'#4a5236',blk.x+ox,Y+1.3,blk.z+oz,world,new T3.CylinderGeometry(.01,.75,1,4,1));t.rotation.y=Math.PI/4;
    addAABB({x0:blk.x+ox-1.8,x1:blk.x+ox+1.8,z0:blk.z+oz-1.5,z1:blk.z+oz+1.5,y0:Y-1,y1:Y+2.4,kind:'solid'})}
  const box=(type,x,z,c)=>{const m=bx(1,.8,1,c,x,Y+.4,z,world);addAABB({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5,y0:Y-1,y1:Y+1.05,kind:'solid'});addCont(type,x,z,Y,m)};
  box('armeria',blk.x-1,blk.z+5,'#4a5236');box('caja',blk.x+1,blk.z+5,'#4a5236');box('caja',blk.x-6,blk.z+3,'#4a5236');box('botiquin',blk.x+6,blk.z-2,'#4a5236');box('caja',blk.x+3,blk.z-6,'#4a5236');
  city26.big.push({b:{cx:blk.x,cz:blk.z},kind:'reten'})}

// ---------- Zona nueva: puestos abandonados más allá de las lomas ----------
function buildRing26(){const rng=mulberry32((worldSeed()^0x2652a)>>>0);const out=[];
  for(let a=0;a<4000&&out.length<18;a++){const x=(rng()-.5)*2*(EDGE-30),z=(rng()-.5)*2*(EDGE-30);const d=Math.max(Math.abs(x),Math.abs(z));if(d<505||d>EDGE-25)continue;
    if(inCity26(x,z,40)||Math.abs(x-roadX(z))<20)continue;if(out.some(o=>Math.hypot(o.x-x,o.z-z)<90))continue;
    const hs=[];for(let i=0;i<8;i++)hs.push(terrainY(x+Math.cos(i*.785)*8,z+Math.sin(i*.785)*8));const mn=Math.min(...hs),mx=Math.max(...hs);if(mn<WATER_Y+1.5||mx-mn>3.2)continue;
    const w=9+(rng()*3|0),dd=8+(rng()*2|0),ds=rng()*4|0;const b=bld22(x,z,w,dd,{name:'puesto',col:['#8a7d6a','#7a7f78','#8f8676','#6f6a62'][rng()*4|0],doors:[[ds,.5,1.5]],roofCol:['#5a3a2e','#4a4a48'][rng()*2|0],H:3});
    b.ring26=true;const pool=['heladera','alacena','armario','caja','herramientas','botiquin','escritorio','caja'];const list=[];for(let k=0;k<4+(rng()*3|0);k++)list.push(F26[pool[rng()*pool.length|0]]);
    furnish26(b,w,dd,[[ds,.5,1.5]],list,{});out.push({x,z,b})}
  city26.ring=out}

// Se arma después de la decoración de las casas (v0.9) y antes de fundir la geometría estática (v0.4).
if(typeof buildDecor9==='function'){const _bd26=buildDecor9;buildDecor9=function(seed){_bd26(seed);try{buildCity26();buildRing26()}catch(e){console.error('city26',e)}}}

// Los autos de la ciudad usan los modelos de los vehículos cuando están cargados.
let cars26=[];
function applyCars26(){for(const m of cars26)if(m.parent)m.parent.remove(m);cars26=[];if(typeof car20!=='function'||typeof GLB17T==='undefined'||!GLB17T.ready)return false;
  const R=mulberry32((worldSeed()^0x26ca)>>>0);
  for(const c of city26.cars){try{const col=new THREE.Color(c.col).multiplyScalar(.85);const m=car20(c.k,'#'+col.getHexString(),c.k==='furgon'?4.8:4.3,1.85);if(!m)continue;
    m.position.set(c.x,c.y+.1,c.z);m.rotation.set((R()-.5)*.04,c.yaw,(R()-.5)*.05);world.add(m);cars26.push(m)}catch(e){console.error('car26',e)}}return true}
let cars26want=false;
const _genWorld26=genWorld;genWorld=function(seed){cars26=[];_genWorld26(seed);cars26want=true};

// ---------- Podridos: cada manzana se llena una vez por día cuando te acercás ----------
const C26HORDE={res:[['caminante',3],['corredor',1]],parking:[['caminante',3],['bruto',.4]],plaza:[['soldado',3],['caminante',3],['bruto',1]],
  hiper:[['caminante',6],['corredor',2],['hinchado',1]],comisaria:[['soldado',4],['caminante',3]],clinica:[['caminante',5],['hinchado',1],['griton',1]],deposito:[['caminante',4],['bruto',1],['corredor',1]]};
let c26T=0,c26Seen=false;
function c26spawn(blk){const list=C26HORDE[blk.kind]||C26HORDE.res;const night=isNight()?1.5:1;let n=0;
  for(const [t0,q0] of list){const t=EDEF[t0]?t0:'caminante';const q=Math.floor(q0*night+Math.random()*1.3);
    for(let i=0;i<q;i++){const x=blk.x+(Math.random()-.5)*(C26B+6),z=blk.z+(Math.random()-.5)*(C26B+6);if(circleBlocked(x,z,.6,'e'))continue;
      try{const e=spawnEnemy(t,x,z);e.c26=1;n++}catch(err){}}}
  // a veces una manada de raptores podridos cruza la ciudad
  if(Math.random()<.08&&EDEF.raptorp){for(let i=0;i<3;i++){try{const e=spawnEnemy('raptorp',blk.x+(Math.random()-.5)*20,blk.z+(Math.random()-.5)*20);e.c26=1}catch(err){}}}
  return n}
function c26tick(dt){c26T-=dt;if(c26T>0)return;c26T=.7;if(!city26.built||!S)return;S.city26=S.city26||{d:{}};const C=S.city26;
  if(inCity26(P.x,P.z,0)&&!C.seen){C.seen=1;sfx('goal');toast(L('Llegaste a la Ciudad de San Ignacio. Está llena de podridos: revisá los negocios de a uno.'),'#e3a33b',7)}
  if(!inCity26(P.x,P.z,60))return;
  let alive=0;for(const e of enemies)if(e.c26&&!e.dying&&!e.dead)alive++;if(alive>34)return;
  for(const b of city26.blocks){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d>75||d<12)continue;if((C.d[b.i]??-1)>=S.day)continue;C.d[b.i]=S.day;alive+=c26spawn(b);if(alive>34)break}}
let c26carT=0;
const _update26=update;update=function(dt){_update26(dt);try{if(gstate==='play'){c26tick(dt);
  if(cars26want&&applyCars26())cars26want=false;
  c26carT-=dt;if(c26carT<=0){c26carT=1;const far=!inCity26(P.x,P.z,220);for(const m of cars26)m.visible=!far}}}catch(e){console.error('city26',e)}};

// ---------- Mapa y brújula ----------
const _mapExtras26=mapExtras;mapExtras=function(m,X,Z,label){
  try{if(city26.built){const seen=(x,z)=>explored[Math.floor((z+HALF)/10)*EXW+Math.floor((x+HALF)/10)];m.fillStyle='#3a3936';
    for(const s of city26.streets){if(!seen(s.x,s.z)&&!seen(s.x,s.z-s.d/2+5)&&!seen(s.x,s.z+s.d/2-5)&&!seen(s.x-s.w/2+5,s.z)&&!seen(s.x+s.w/2-5,s.z))continue;m.fillRect(X(s.x-s.w/2),Z(s.z-s.d/2),s.w*(X(1)-X(0)),s.d*(X(1)-X(0)))}
    for(const g of city26.big){if(!seen(g.b.cx,g.b.cz))continue;m.font='600 11px "IBM Plex Mono",monospace';label(g.kind==='reten'?L('Retén militar'):L(SHOP26[g.kind].n),X(g.b.cx),Z(g.b.cz))}
    if(seen(CITY_RX,585)){m.font='800 20px "Saira Condensed",sans-serif';label(L('CIUDAD'),X(CITY_RX),Z(470)-10);m.font='600 13px "IBM Plex Mono",monospace'}}}catch(e){}
  _mapExtras26(m,X,Z,label)};
